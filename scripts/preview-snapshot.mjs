#!/usr/bin/env node
/**
 * L'aperçu statique, pour GitHub Pages.
 *
 * Le site est un worker : il fabrique ses pages à la demande depuis D1 et sert
 * ses images depuis R2. GitHub Pages ne sait rien faire de tout cela — il sert
 * des fichiers. Convertir l'application en site figé demanderait un
 * getStaticPaths par route dynamique et un second chemin de données ; ce serait
 * une deuxième application à maintenir, et c'est elle qu'on montrerait.
 *
 * On prend donc l'empreinte de la vraie. Le worker tourne en local, avec sa
 * base et son bucket locaux, et ce script le parcourt et écrit ce qu'il répond.
 * Ce que le mentor ouvre est le site lui-même, page par page, à la virgule
 * près — pas une imitation.
 *
 * Rien ici n'est importé par l'application : supprimer ce fichier et le
 * workflow qui l'appelle ne change pas une ligne de ce qui part sur Cloudflare.
 *
 *   node scripts/preview-snapshot.mjs [--origin http://localhost:8787] [--out preview]
 */
import { mkdir, writeFile, cp, rm } from 'node:fs/promises';
import path from 'node:path';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
};

const ORIGIN = arg('origin', 'http://localhost:8787').replace(/\/$/, '');
const BASE = (process.env.SITE_BASE ?? '/GridShift').replace(/\/$/, '');
const OUT = path.resolve(arg('out', 'preview'));
const ROOT = path.resolve(import.meta.dirname, '..');

/* Les médias ne passent pas par le crawl. Ils sont déjà sur le disque, en
   sortie de scripts/media-build.mjs : les redemander au worker ferait 705
   allers-retours pour recopier des fichiers qu'on a sous la main — et une
   variante qui n'apparaît que dans un srcset échapperait à l'extraction. */
const MEDIA = `${BASE}/media/`;

const seen = new Set();
const queue = [];
const failures = [];
/* Un lien qui pointe vers rien est un défaut du site, pas de l'empreinte : le
   méga-menu propose une liste d'étiquettes fixe, dont certaines n'existent que
   dans une langue. On le signale et on continue — l'aperçu doit montrer le site
   tel qu'il est, y compris ses trous. Une erreur serveur, elle, arrête tout. */
const missing = [];
let written = 0;

const enqueue = (p) => {
  if (!p || seen.has(p)) return;
  seen.add(p);
  queue.push(p);
};

/** L'URL d'une page → le fichier qui la sert. `/GridShift/news/` devient
 *  `news/index.html` : GitHub Pages sert un dossier par son index. */
function fileFor(pathname, isHtml) {
  let rel = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  rel = rel.replace(/^\/+/, '');
  if (isHtml) return path.join(OUT, rel === '' ? 'index.html' : `${rel.replace(/\/$/, '')}/index.html`);
  return path.join(OUT, rel);
}

async function save(file, body) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, body);
  written++;
}

/* Une redirection du worker devient une page qui redirige : GitHub Pages ne
   sait pas répondre 301. Le lien <link rel=canonical> garde le sens pour un
   robot, la balise refresh fait le travail pour un lecteur. */
const redirectPage = (to) =>
  `<!doctype html><html><head><meta charset="utf-8">` +
  `<meta http-equiv="refresh" content="0;url=${to}"><link rel="canonical" href="${to}">` +
  `<title>Redirection</title></head><body><a href="${to}">${to}</a></body></html>\n`;

/** Les liens internes d'une page : href, src, et chaque largeur d'un srcset. */
function linksIn(html) {
  const out = [];
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) out.push(m[1]);
  for (const m of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const part of m[1].split(',')) out.push(part.trim().split(/\s+/)[0]);
  }
  return out;
}

function internalPath(href) {
  if (!href || /^(?:[a-z]+:|\/\/|#|mailto:|tel:)/i.test(href)) return null;
  if (!href.startsWith('/')) return null;
  const p = href.split('#')[0].split('?')[0];
  if (!p.startsWith(BASE) || p.startsWith(MEDIA)) return null;
  return p;
}

async function visit(pathname) {
  const res = await fetch(`${ORIGIN}${pathname}`, { redirect: 'manual' });

  if (res.status >= 300 && res.status < 400) {
    const to = res.headers.get('location') ?? '/';
    await save(fileFor(pathname, true), redirectPage(to));
    enqueue(internalPath(to));
    return;
  }
  if (!res.ok) {
    (res.status === 404 ? missing : failures).push(`${res.status} ${pathname}`);
    return;
  }

  const type = res.headers.get('content-type') ?? '';
  if (!type.includes('text/html')) {
    await save(fileFor(pathname, false), Buffer.from(await res.arrayBuffer()));
    return;
  }

  const html = await res.text();
  await save(fileFor(pathname, true), html);
  for (const href of linksIn(html)) enqueue(internalPath(href));
}

async function main() {
  await rm(OUT, { recursive: true, force: true });

  /* Les fichiers que le worker n'a jamais fabriqués : polices, favicon, JS
     client, et les images. Astro les range déjà sous le préfixe du site. */
  await cp(path.join(ROOT, 'dist', BASE.replace(/^\//, '')), OUT, { recursive: true });
  await cp(path.join(ROOT, 'build/media'), path.join(OUT, 'media'), { recursive: true });

  /* Le plan de site énumère ce qui compte ; le crawl trouve le reste — pages
     de rubrique paginées, étiquettes, auteurs — en suivant les liens. */
  enqueue(`${BASE}/`);
  /* Ce que le crawl ne peut pas trouver : ces adresses ne sont pas des liens.
     L'index de recherche vit dans un attribut `data-`, lu par le script du
     champ de recherche ; robots.txt et le plan de site ne sont écrits nulle
     part dans une page. Sans eux la recherche du site reste muette. */
  for (const p of ['sitemap.xml', 'robots.txt', 'search.json', 'fr/search.json']) {
    enqueue(`${BASE}/${p}`);
  }

  const sitemap = await fetch(`${ORIGIN}${BASE}/sitemap.xml`).then((r) => r.text());
  for (const m of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    enqueue(internalPath(new URL(m[1]).pathname));
  }

  /* Huit de front : le worker répond en quelques millisecondes, mais chaque
     page en découvre d'autres — la file se vide plus vite qu'elle ne se remplit
     seulement si on ne l'attend pas une par une. */
  const workers = Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const p = queue.shift();
      try { await visit(p); } catch (e) { failures.push(`${p} — ${e.message}`); }
    }
  });
  await Promise.all(workers);

  /* La page d'erreur de GitHub Pages. Il la cherche à la racine du site. */
  const notFound = await fetch(`${ORIGIN}${BASE}/cette-adresse-n-existe-pas`);
  await save(path.join(OUT, '404.html'), await notFound.text());

  /* GitHub Pages fait tourner Jekyll par défaut, qui ignore tout dossier
     commençant par un tiret bas — donc _astro/, donc le JS et les styles. */
  await save(path.join(OUT, '.nojekyll'), '');

  console.log(`${seen.size} page(s) parcourue(s), ${written} fichier(s) écrit(s) dans ${path.relative(ROOT, OUT)}/`);
  if (missing.length) {
    console.warn(`\n${missing.length} lien(s) interne(s) vers une page absente :`);
    for (const m of missing) console.warn(`  ${m}`);
  }
  if (failures.length) {
    console.error(`\n${failures.length} échec(s) :`);
    for (const f of failures.slice(0, 40)) console.error(`  ${f}`);
    process.exit(1);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
