#!/usr/bin/env node
/**
 * Le contenu Markdown vers D1.
 *
 * Lit src/content/ et src/lib/credits.ts, écrit db/seed.sql. Aucun fichier
 * source n'est modifié : tant que la bascule n'est pas faite, les deux
 * représentations coexistent et on peut comparer l'une à l'autre.
 *
 * Le script est idempotent — il régénère le fichier en entier — et refuse
 * d'écrire un seed incomplet : une référence d'auteur ou de jeu qui ne résout
 * pas est une erreur, pas un avertissement. Mieux vaut un export qui échoue
 * qu'une base à laquelle il manque un auteur.
 *
 *   node scripts/content-to-d1.mjs            écrit db/seed.sql
 *   node scripts/content-to-d1.mjs --check    vérifie sans écrire
 */
import { readFile, readdir, writeFile, stat } from 'node:fs/promises';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { createHash } from 'node:crypto';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const CONTENT = path.join(ROOT, 'src/content');
const ASSETS = path.join(ROOT, 'src/assets');

/* ── petits outils ─────────────────────────────────────────────────────── */

const q = (v) => (v === null || v === undefined ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);
const n = (v) => (v === null || v === undefined || v === '' ? 'NULL' : Number(v));
const b = (v) => (v ? 1 : 0);
const json = (v) => q(JSON.stringify(v ?? []));

/* La même normalisation que lib/articles.ts : les pages d'étiquette existantes
   doivent garder leur URL après la bascule. */
const slugifyTag = (tag) =>
  tag.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* Un parseur de front-matter volontairement minimal : il ne gère que ce que ce
   dépôt écrit réellement — scalaires, listes, listes d'objets en accolades,
   blocs `>-` et objets imbriqués sur deux niveaux. Ajouter js-yaml pour lire
   nos propres fichiers serait une dépendance pour un problème qu'on n'a pas. */
function parseFrontmatter(raw, file) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`front-matter absent : ${file}`);
  const [, head, body] = m;
  const lines = head.split(/\r?\n/);
  const root = {};
  const stack = [{ indent: -1, value: root }];
  let i = 0;

  const scalar = (s) => {
    s = s.trim();
    if (s === '') return '';
    if (s === 'true') return true;
    if (s === 'false') return false;
    if (s === 'null' || s === '~') return null;
    if (/^-?\d+(\.\d+)?$/.test(s) && !/^0\d/.test(s)) return Number(s);
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      return s.slice(1, -1).replace(/\\"/g, '"').replace(/''/g, "'");
    }
    return s;
  };

  /* `{ name: PC, best: true }` — la forme compacte utilisée par les fiches jeu */
  const inlineObject = (s) => {
    const out = {};
    for (const part of s.slice(1, -1).split(/,(?![^[]*\])/)) {
      const idx = part.indexOf(':');
      if (idx === -1) continue;
      out[part.slice(0, idx).trim()] = scalar(part.slice(idx + 1));
    }
    return out;
  };

  /* `[a, "b c", d]` */
  const inlineArray = (s) =>
    s.slice(1, -1).trim() === '' ? []
      : s.slice(1, -1).split(/,(?![^"']*["'](?:[^"']*["'][^"']*["'])*[^"']*$)/)
          .map((x) => scalar(x)).filter((x) => x !== '');

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || /^\s*#/.test(line)) { i++; continue; }
    const indent = line.match(/^ */)[0].length;
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    const parent = stack[stack.length - 1].value;

    /* élément de liste */
    if (/^\s*-\s/.test(line)) {
      const rest = line.replace(/^\s*-\s/, '').trim();
      if (!Array.isArray(parent)) { i++; continue; }
      parent.push(rest.startsWith('{') ? inlineObject(rest) : scalar(rest));
      i++; continue;
    }

    const kv = line.match(/^\s*([\w.-]+):\s*(.*)$/);
    if (!kv) { i++; continue; }
    const [, key, rawVal] = kv;
    const val = rawVal.trim();

    if (val === '' ) {
      /* la valeur est sur les lignes suivantes : liste ou objet */
      const next = lines.slice(i + 1).find((l) => l.trim());
      const nextIndent = next ? next.match(/^ */)[0].length : 0;
      const container = next && /^\s*-\s/.test(next) && nextIndent > indent ? [] : {};
      parent[key] = container;
      stack.push({ indent, value: container });
      i++; continue;
    }
    if (val === '>-' || val === '>' || val === '|' || val === '|-') {
      /* bloc replié : on recolle les lignes plus indentées */
      const buf = [];
      let j = i + 1;
      while (j < lines.length) {
        const l = lines[j];
        if (l.trim() && l.match(/^ */)[0].length <= indent) break;
        buf.push(l.trim());
        j++;
      }
      parent[key] = val.startsWith('>') ? buf.join(' ').trim() : buf.join('\n').trim();
      i = j; continue;
    }
    parent[key] = val.startsWith('[') ? inlineArray(val)
      : val.startsWith('{') ? inlineObject(val)
      : scalar(val);
    i++;
  }
  return { data: root, body: body.trim() };
}

async function readDir(dir) {
  const out = [];
  for (const f of (await readdir(dir)).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))) {
    const raw = await readFile(path.join(dir, f), 'utf8');
    out.push({ id: f.replace(/\.mdx?$/, ''), ...parseFrontmatter(raw, path.join(dir, f)) });
  }
  return out;
}

/* Le chemin d'image d'un article (« ../../../assets/h-x.jpg ») devient la clé
   R2 (« h-x.jpg ») : R2 est plat, le dossier n'a plus de sens. */
const mediaKey = (p) => (p ? path.basename(String(p)) : null);

/* ── crédits ───────────────────────────────────────────────────────────── */
/* lib/credits.ts est du TypeScript, pas des données. On le lit au lieu de
   l'importer : le script tourne sous node nu, sans passe de compilation. */
async function readCredits() {
  const src = await readFile(path.join(ROOT, 'src/lib/credits.ts'), 'utf8');
  const body = src.slice(src.indexOf('export const credits'), src.indexOf('\n};', src.indexOf('export const credits')));
  const out = {};
  const re = /'([^']+)':\s*\{\s*artist:\s*'([^']*)',\s*licence:\s*'([^']*)',\s*licenceUrl:\s*'([^']*)',\s*source:\s*'([^']*)',\s*file:\s*'([^']*)'\s*\}/g;
  let m;
  while ((m = re.exec(body))) {
    out[m[1]] = { artist: m[2], licence: m[3], licenceUrl: m[4], source: m[5], note: m[6] };
  }
  return out;
}

/* Les dimensions d'un JPEG, lues dans les marqueurs SOFn. Pas de dépendance :
   on a besoin de deux entiers, pas d'une bibliothèque d'images. */
function jpegSize(buf) {
  let o = 2;
  while (o < buf.length) {
    if (buf[o] !== 0xff) { o++; continue; }
    const marker = buf[o + 1];
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(o + 5), width: buf.readUInt16BE(o + 7) };
    }
    o += 2 + buf.readUInt16BE(o + 2);
  }
  throw new Error('dimensions JPEG introuvables');
}

/* ── export ────────────────────────────────────────────────────────────── */

const SECTIONS = [
  { key: 'news',   slug_en: 'news',    slug_fr: 'actus',   label_en: 'News',    label_fr: 'Actus',  position: 1 },
  { key: 'review', slug_en: 'reviews', slug_fr: 'tests',   label_en: 'Reviews', label_fr: 'Tests',  position: 2 },
  { key: 'guide',  slug_en: 'guides',  slug_fr: 'guides',  label_en: 'Guides',  label_fr: 'Guides', position: 3 },
  { key: 'setup',  slug_en: 'setup',   slug_fr: 'configs', label_en: 'Setup',   label_fr: 'Configs',position: 4 },
];

const iso = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) throw new Error(`date illisible : ${v}`);
  return d.toISOString();
};

async function main() {
  const check = process.argv.includes('--check');
  const errors = [];

  /* La même chaîne que celle d'astro.config.mjs : le HTML stocké doit être
     celui que le site produisait, pas une approximation. Si la configuration
     Markdown change là-bas, elle doit changer ici — d'où le rappel. */
  const md = await createMarkdownProcessor({ shikiConfig: { theme: 'github-dark' } });
  const renderCache = new Map();
  const toHtml = async (src) => {
    if (renderCache.has(src)) return renderCache.get(src);
    const { code } = await md.render(src);
    renderCache.set(src, code);
    return code;
  };

  const authors = await readDir(path.join(CONTENT, 'authors'));
  const games = await readDir(path.join(CONTENT, 'games'));
  const enArticles = await readDir(path.join(CONTENT, 'articles/en'));
  const frArticles = await readDir(path.join(CONTENT, 'articles/fr'));
  const credits = await readCredits();

  /* Les médias : ce qui est réellement dans src/assets, pas ce que la table
     des crédits prétend. Un fichier sans crédit est une erreur — la table est
     la garantie qu'on nomme un ayant droit pour chaque visuel publié. */
  const mediaRows = [];
  for (const f of (await readdir(ASSETS)).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))) {
    const p = path.join(ASSETS, f);
    const buf = await readFile(p);
    const key = f.replace(/\.[^.]+$/, '');
    const c = credits[key];
    if (!c) { errors.push(`média sans crédit : ${f}`); continue; }
    let dim;
    try { dim = jpegSize(buf); } catch { errors.push(`dimensions illisibles : ${f}`); continue; }
    mediaRows.push({
      key: f, ...dim, bytes: (await stat(p)).size,
      content_type: f.endsWith('.png') ? 'image/png' : f.endsWith('.webp') ? 'image/webp' : 'image/jpeg',
      ...c, checksum: createHash('md5').update(buf).digest('hex'),
    });
  }
  const mediaKeys = new Set(mediaRows.map((m) => m.key));

  const authorIds = new Set(authors.map((a) => a.id));
  const gameIds = new Set(games.map((g) => g.id));

  /* Un article n'existe qu'en une langue ⇒ le sélecteur de langue enverrait
     vers une page absente. C'est exactement ce que le modèle interdit. */
  const enIds = new Set(enArticles.map((a) => a.id));
  const frIds = new Set(frArticles.map((a) => a.id));
  for (const id of enIds) if (!frIds.has(id)) errors.push(`traduction FR manquante : ${id}`);
  for (const id of frIds) if (!enIds.has(id)) errors.push(`traduction EN manquante : ${id}`);

  const lines = [];
  const push = (s) => lines.push(s);

  push('-- Généré par scripts/content-to-d1.mjs — ne pas modifier à la main.');
  push(`-- ${new Date().toISOString()}`);
  push('PRAGMA foreign_keys = OFF;');
  push('DELETE FROM article_tags; DELETE FROM articles; DELETE FROM games;');
  push('DELETE FROM authors; DELETE FROM media; DELETE FROM sections;');
  push('');

  push('-- rubriques');
  for (const s of SECTIONS) {
    push(`INSERT INTO sections (key,slug_en,slug_fr,label_en,label_fr,position) VALUES (${q(s.key)},${q(s.slug_en)},${q(s.slug_fr)},${q(s.label_en)},${q(s.label_fr)},${s.position});`);
  }
  push('');

  push('-- médias');
  for (const m of mediaRows) {
    push(`INSERT INTO media (key,width,height,bytes,content_type,artist,licence,licence_url,source,note,checksum) VALUES (${q(m.key)},${m.width},${m.height},${m.bytes},${q(m.content_type)},${q(m.artist)},${q(m.licence)},${q(m.licenceUrl)},${q(m.source)},${q(m.note)},${q(m.checksum)});`);
  }
  push('');

  push('-- auteurs');
  for (const a of authors) {
    const d = a.data;
    push(`INSERT INTO authors (id,name,initials,since,role_en,role_fr,bio_en,bio_fr,creds_en,creds_fr,body_en,body_fr) VALUES (${q(a.id)},${q(d.name)},${q(d.initials)},${q(d.since)},${q(d.role?.en)},${q(d.role?.fr)},${q(d.bio?.en)},${q(d.bio?.fr)},${json(d.creds?.en)},${json(d.creds?.fr)},${q(await toHtml(a.body))},${q(await toHtml(a.body))});`);
  }
  push('');

  push('-- jeux');
  for (const g of games) {
    const d = g.data;
    for (const [field, val] of [['cover', d.cover], ['hero', d.hero]]) {
      const k = mediaKey(val);
      if (k && !mediaKeys.has(k)) errors.push(`jeu ${g.id} : ${field} introuvable dans src/assets (${k})`);
    }
    push(`INSERT INTO games (id,title,studio,released,release_date,score,user_score,user_votes,followers,completion,version,cover_media,hero_media,platforms,offers,prices_checked_on,genre_en,genre_fr,facts_en,facts_fr,summary_en,summary_fr,body_en,body_fr) VALUES (${q(g.id)},${q(d.title)},${q(d.studio)},${q(d.released)},${q(iso(d.releaseDate))},${n(d.score)},${n(d.userScore)},${n(d.userVotes)},${n(d.followers)},${n(d.completion)},${q(d.version)},${q(mediaKey(d.cover))},${q(mediaKey(d.hero))},${json(d.platforms)},${json(d.offers)},${q(iso(d.pricesCheckedOn))},${q(d.genre?.en)},${q(d.genre?.fr)},${json(d.facts?.en)},${json(d.facts?.fr)},${q(d.summary?.en)},${q(d.summary?.fr)},${q(await toHtml(g.body))},${q(await toHtml(g.body))});`);
  }
  push('');

  push('-- articles');
  let tagCount = 0;
  for (const [lang, list] of [['en', enArticles], ['fr', frArticles]]) {
    for (const a of list) {
      const d = a.data;
      if (d.lang !== lang) errors.push(`${lang}/${a.id} : champ lang = ${d.lang}`);
      if (!authorIds.has(String(d.author))) errors.push(`${lang}/${a.id} : auteur inconnu « ${d.author} »`);
      if (d.game && !gameIds.has(String(d.game))) errors.push(`${lang}/${a.id} : jeu inconnu « ${d.game} »`);
      const cover = mediaKey(d.cover);
      if (cover && !mediaKeys.has(cover)) errors.push(`${lang}/${a.id} : cover introuvable (${cover})`);
      if (!SECTIONS.some((s) => s.key === d.type)) errors.push(`${lang}/${a.id} : rubrique inconnue « ${d.type} »`);

      const html = await toHtml(a.body);
      push(`INSERT INTO articles (slug,lang,section,title,seo_title,lede,published_at,updated_at,author_id,game_id,kicker,cover_media,cover_caption,reading_minutes,tested_on,stale,live,featured,draft,score,verdict,pros,cons,playtime,review_notes,score_revision,level,steps,method,sources,corrections,body,body_html) VALUES (${q(a.id)},${q(lang)},${q(d.type)},${q(d.title)},${q(d.seoTitle)},${q(d.lede)},${q(iso(d.date))},${q(iso(d.updated))},${q(d.author)},${q(d.game)},${q(d.kicker)},${q(cover)},${q(d.coverCaption)},${n(d.readingMinutes)},${q(d.testedOn)},${b(d.stale)},${b(d.live)},${b(d.featured)},${b(d.draft)},${n(d.score)},${q(d.verdict)},${json(d.pros)},${json(d.cons)},${q(d.playtime)},${json(d.reviewNotes)},${q(d.scoreRevision)},${q(d.level)},${json(d.steps)},${q(d.method)},${q(d.sources)},${json(d.corrections)},${q(a.body)},${q(html)});`);

      for (const tag of d.tags ?? []) {
        push(`INSERT INTO article_tags (slug,lang,tag,tag_slug) VALUES (${q(a.id)},${q(lang)},${q(tag)},${q(slugifyTag(String(tag)))});`);
        tagCount++;
      }
    }
  }
  push('');
  push('PRAGMA foreign_keys = ON;');

  const summary = {
    sections: SECTIONS.length, media: mediaRows.length, authors: authors.length,
    games: games.length, articles: enArticles.length + frArticles.length, tags: tagCount,
  };

  if (errors.length) {
    console.error('Export refusé — le contenu ne satisfait pas le schéma :\n');
    for (const e of errors) console.error('  •', e);
    console.error(`\n${errors.length} problème(s). Rien n'a été écrit.`);
    process.exit(1);
  }

  if (check) {
    console.log('Contenu conforme au schéma.', JSON.stringify(summary));
    return;
  }
  const out = path.join(ROOT, 'db/seed.sql');
  await writeFile(out, lines.join('\n') + '\n', 'utf8');
  console.log(`db/seed.sql écrit — ${lines.length} instructions`);
  console.table(summary);
}

main().catch((e) => { console.error(e); process.exit(1); });
