#!/usr/bin/env node
/**
 * src/assets/ vers R2.
 *
 * R2 est plat : le nom du fichier devient la clé, sans dossier. C'est ce que
 * la table `media` référence, et ce que db.ts transforme en URL publique.
 *
 * Le script ne téléverse que ce qui a changé. wrangler ne sait pas lister un
 * bucket : on tient donc un journal de ce que ce script a poussé, par cible.
 * Comparer au md5 enregistré dans D1 serait une erreur — D1 décrit le contenu
 * voulu, pas ce que le bucket contient réellement, et sur un bucket neuf les
 * deux ne coïncident pas.
 *
 *   node scripts/assets-to-r2.mjs            local (miniflare)
 *   node scripts/assets-to-r2.mjs --remote   le vrai bucket
 *   node scripts/assets-to-r2.mjs --force    tout re-pousser
 *   node scripts/assets-to-r2.mjs --dry-run  ne rien envoyer, dire quoi
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

const run = promisify(execFile);
const ROOT = path.resolve(import.meta.dirname, '..');
const ASSETS = path.join(ROOT, 'src/assets');
const BUCKET = 'gridshift-media';
const DB = 'gridshift-content';

const remote = process.argv.includes('--remote');
const force = process.argv.includes('--force');
const dry = process.argv.includes('--dry-run');
const scope = remote ? '--remote' : '--local';

const TYPES = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

/* Le journal des envois, par cible. « local » et « remote » sont deux buckets
   distincts : ce qui est dans l'un n'est pas dans l'autre. */
const LEDGER = path.join(ROOT, 'db/r2-uploads.json');

async function readLedger() {
  try {
    const all = JSON.parse(await readFile(LEDGER, 'utf8'));
    return new Map(Object.entries(all[remote ? 'remote' : 'local'] ?? {}));
  } catch { return new Map(); }
}

async function writeLedger(map) {
  let all = {};
  try { all = JSON.parse(await readFile(LEDGER, 'utf8')); } catch { /* premier envoi */ }
  all[remote ? 'remote' : 'local'] = Object.fromEntries(map);
  await writeFile(LEDGER, JSON.stringify(all, null, 2) + '\n', 'utf8');
}

async function main() {
  const files = (await readdir(ASSETS)).filter((f) => TYPES[path.extname(f).toLowerCase()]);
  const known = force ? new Map() : await readLedger();

  const todo = [];
  let skipped = 0;
  for (const f of files) {
    const buf = await readFile(path.join(ASSETS, f));
    const md5 = createHash('md5').update(buf).digest('hex');
    if (known.get(f) === md5) { skipped++; continue; }
    todo.push({ file: f, md5, bytes: buf.length });
  }

  console.log(`${files.length} fichier(s) — ${todo.length} à pousser, ${skipped} inchangé(s)`);
  if (dry) {
    for (const t of todo) console.log('  →', t.file, `${Math.round(t.bytes / 1024)}K`);
    return;
  }

  let done = 0;
  for (const t of todo) {
    const ct = TYPES[path.extname(t.file).toLowerCase()];
    await run('npx', [
      'wrangler', 'r2', 'object', 'put', `${BUCKET}/${t.file}`,
      '--file', path.join(ASSETS, t.file),
      '--content-type', ct,
      /* Les médias sont immuables : le nom porte le contenu, une variante
         nouvelle prend un nouveau nom. Un an de cache navigateur est donc sûr,
         et c'est ce qui rend l'egress nul en pratique. */
      '--cache-control', 'public, max-age=31536000, immutable',
      scope,
    ], { cwd: ROOT, maxBuffer: 32 * 1024 * 1024 });
    done++;
    known.set(t.file, t.md5);
    process.stdout.write(`\r  poussé ${done}/${todo.length}  ${t.file.padEnd(48)}`);
  }
  if (done) process.stdout.write('\n');
  await writeLedger(known);
  console.log(`fini — ${done} objet(s) dans ${BUCKET}${remote ? ' (production)' : ' (local)'}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
