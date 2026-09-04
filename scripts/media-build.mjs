#!/usr/bin/env node
/**
 * Fabrique l'échelle responsive des médias, une fois, à la publication.
 *
 * Astro générait ces variantes au build et les posait dans dist/_astro. En
 * passant à R2, personne ne le fait plus — servir l'original de 1920px à une
 * vignette de 82px multiplierait par cent le poids d'une page d'accueil. Ce
 * script reprend donc ce travail, avec la même bibliothèque (sharp, déjà une
 * dépendance d'Astro) et le même format de sortie (WebP).
 *
 * Les largeurs sont celles que les gabarits demandent réellement, relevées
 * dans les composants : 164 pour les Tendances, 1440 pour l'ouverture d'un
 * article, et les paliers intermédiaires entre les deux. On ne génère jamais
 * plus large que l'original — agrandir une image ne fait qu'ajouter du poids.
 *
 *   node scripts/media-build.mjs             fabrique dans build/media/
 *   node scripts/media-build.mjs --push      fabrique puis pousse dans R2 (local)
 *   node scripts/media-build.mjs --push --remote
 */
import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import sharp from 'sharp';

const run = promisify(execFile);
const ROOT = path.resolve(import.meta.dirname, '..');
const ASSETS = path.join(ROOT, 'src/assets');
const OUT = path.join(ROOT, 'build/media');
const BUCKET = 'gridshift-media';
const DB = 'gridshift-content';

const push = process.argv.includes('--push');
const remote = process.argv.includes('--remote');
const scope = remote ? '--remote' : '--local';

/* Relevé dans les composants :
   Trending 164 · Hero band 480/720 · Hero side 560/840 · bodyShot 600/920/1200
   Card wide 640/960/1280 · Hero lead 720/1080/1440.
   On garde l'union, dédupliquée — chaque palier sert au moins un emplacement.

   Les paliers bas (240/300/360) ne viennent d'aucun `widths` : ils servent les
   jaquettes, qui ne font que 300px de large. Sans eux, une jaquette n'aurait
   que la variante 164 et la grille des jeux afficherait moins net qu'avant —
   une régression, pas une optimisation. */
const LADDER = [164, 240, 300, 360, 480, 560, 600, 640, 720, 840, 920, 960, 1080, 1200, 1280, 1440];

/* Les largeurs à produire pour une source donnée : les paliers qui tiennent
   dedans, plus la largeur native. Cette dernière est ce qu'Astro servait quand
   un emplacement ne demandait aucune largeur ; l'omettre dégraderait ces
   emplacements-là. */
const widthsFor = (w) => [...new Set([...LADDER.filter((x) => x < w), w])].sort((a, b) => a - b);

/* La qualité WebP par défaut d'Astro. On ne cherche pas à faire mieux que ce
   que le site servait hier : on cherche à ne pas faire pire. */
const QUALITY = 80;

async function main() {
  await mkdir(OUT, { recursive: true });
  const files = (await readdir(ASSETS)).filter((f) => /\.(jpe?g|png)$/i.test(f));
  const manifest = [];
  let made = 0, bytes = 0;

  for (const f of files) {
    const src = path.join(ASSETS, f);
    const key = f;                                  // la clé du média dans D1
    const stem = f.replace(/\.[^.]+$/, '');
    const img = sharp(src);
    const meta = await img.metadata();

    /* L'original reste dans R2 : c'est lui que sert un partage social ou un
       lecteur dont le navigateur ignore WebP. */
    manifest.push({
      mediaKey: key, width: meta.width, height: meta.height,
      format: 'jpeg', bytes: (await stat(src)).size, objectKey: key, original: true,
    });

    for (const w of widthsFor(meta.width)) {
      const objectKey = `${stem}.${w}.webp`;
      const out = path.join(OUT, objectKey);
      const info = await sharp(src)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(out);
      manifest.push({
        mediaKey: key, width: info.width, height: info.height,
        format: 'webp', bytes: info.size, objectKey,
      });
      made++; bytes += info.size;
    }
    process.stdout.write(`\r  ${made} variante(s)…`);
  }
  process.stdout.write('\n');

  await writeFile(path.join(ROOT, 'build/media-manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  /* Les lignes de variantes, rejouables : on remplace l'échelle en entier
     plutôt que d'essayer de la réconcilier ligne à ligne. */
  const sql = [
    'DELETE FROM media_variants;',
    ...manifest.filter((m) => !m.original).map((m) =>
      `INSERT INTO media_variants (media_key,width,height,format,bytes,object_key) VALUES ('${m.mediaKey}',${m.width},${m.height},'${m.format}',${m.bytes},'${m.objectKey}');`),
  ].join('\n');
  await writeFile(path.join(ROOT, 'db/variants.sql'), sql + '\n', 'utf8');

  console.log(`${files.length} source(s) → ${made} variante(s) WebP, ${(bytes / 1048576).toFixed(1)} Mo`);
  console.log('build/media/ · db/variants.sql écrits');

  if (!push) {
    console.log('\n(--push pour envoyer dans R2)');
    return;
  }

  let n = 0;
  const variants = manifest.filter((m) => !m.original);
  for (const v of variants) {
    await run('npx', ['wrangler', 'r2', 'object', 'put', `${BUCKET}/${v.objectKey}`,
      '--file', path.join(OUT, v.objectKey), '--content-type', 'image/webp',
      '--cache-control', 'public, max-age=31536000, immutable', scope,
    ], { cwd: ROOT, maxBuffer: 32 * 1024 * 1024 });
    n++;
    if (n % 25 === 0) process.stdout.write(`\r  poussé ${n}/${variants.length}…`);
  }
  process.stdout.write(`\r  poussé ${n}/${variants.length}   \n`);

  await run('npx', ['wrangler', 'd1', 'execute', DB, scope, '--file', 'db/variants.sql'],
    { cwd: ROOT, maxBuffer: 32 * 1024 * 1024 });
  console.log(`${n} variante(s) dans R2, échelle enregistrée dans D1`);
}

main().catch((e) => { console.error(e); process.exit(1); });
