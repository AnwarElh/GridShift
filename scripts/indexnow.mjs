#!/usr/bin/env node
/**
 * Annonce aux moteurs les adresses qui viennent de changer.
 *
 * La liste ne vient pas d'ici : elle vient du plan de site, que le worker rend
 * depuis D1 après le déploiement. C'est le site lui-même qui sait quelles
 * pages existent et quand elles ont bougé — refaire ce calcul ici, à partir
 * des fichiers Markdown et des fabriques d'URL, ce serait entretenir deux
 * vérités pour une seule question.
 *
 *   node scripts/indexnow.mjs              les articles modifiés depuis 7 jours
 *   node scripts/indexnow.mjs --days 30    une autre fenêtre
 *   node scripts/indexnow.mjs --all        tout le plan de site
 *   node scripts/indexnow.mjs --dry-run    ne rien envoyer, dire quoi
 *
 * ponytail: la fenêtre remplace un vrai journal des publications. Le jour où
 * la publication passera par une interface, c'est elle qui nommera les
 * adresses touchées, et submitToIndexNow() sera appelé de là.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { submitToIndexNow } from '../src/lib/indexnow.ts';

const ROOT = path.resolve(import.meta.dirname, '..');
const HOST = process.env.INDEXNOW_HOST ?? 'autnic.com';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
};
const all = process.argv.includes('--all');
const dry = process.argv.includes('--dry-run');
const days = Number(arg('days', 7));

/* La clé est le nom du fichier : une seule vérité, et le fichier que le
   protocole exige de trouver en ligne est celui qui la porte ici. */
async function findKey() {
  const files = await readdir(path.join(ROOT, 'public'));
  const keyFile = files.find((f) => /^[0-9a-f]{8,128}\.txt$/.test(f));
  if (!keyFile) throw new Error('public/<clé>.txt introuvable — aucune clé IndexNow publiée');
  const key = keyFile.replace(/\.txt$/, '');
  const contents = (await readFile(path.join(ROOT, 'public', keyFile), 'utf8')).trim();
  /* Le moteur lit le fichier et compare : s'il ne contient pas la clé, l'envoi
     est rejeté après coup, sans que rien ici ne l'ait signalé. */
  if (contents !== key) throw new Error(`${keyFile} ne contient pas sa propre clé`);
  return key;
}

/* Le plan de site est du XML simple, écrit par nous : deux expressions
   régulières suffisent, et évitent une dépendance pour trois balises. */
function entries(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
    loc: m[1].match(/<loc>(.*?)<\/loc>/)?.[1] ?? '',
    lastmod: m[1].match(/<lastmod>(.*?)<\/lastmod>/)?.[1],
  })).filter((e) => e.loc);
}

async function main() {
  const key = await findKey();
  const sitemap = `https://${HOST}/sitemap.xml`;
  const response = await fetch(sitemap);
  if (!response.ok) throw new Error(`${sitemap} a répondu ${response.status}`);

  const found = entries(await response.text());
  const since = Date.now() - days * 86_400_000;
  /* Sans `lastmod`, l'adresse est une page d'index : elle change dès qu'un
     article change, et c'est précisément ce qui vient d'arriver. */
  const urls = all
    ? found.map((e) => e.loc)
    : found.filter((e) => !e.lastmod || Date.parse(e.lastmod) >= since).map((e) => e.loc);

  console.log(`${found.length} adresse(s) au plan de site, ${urls.length} à annoncer`);
  if (dry) return console.log(urls.slice(0, 20).join('\n'));

  const result = await submitToIndexNow(urls, { host: HOST, key });
  if (!result) return console.log('rien à annoncer');
  /* 200 et 202 valent tous deux acceptation ; 403 dit que la clé n'a pas été
     retrouvée en ligne, 422 que les adresses ne sont pas du bon domaine. */
  console.log(`${result.submitted} adresse(s) envoyée(s) — réponse ${result.status}`);
  if (result.status >= 400) process.exitCode = 1;
}

await main();
