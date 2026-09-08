/* IndexNow : ce qui casse en silence, c'est le lot refusé en bloc.
 *
 * Une seule adresse d'un autre domaine, et le moteur rejette l'envoi entier
 * sans dire laquelle — d'où le tri avant l'envoi, et ces vérifications. */
import { test } from 'node:test';
import assert from 'node:assert/strict';

const { indexNowPayload, submitToIndexNow, MAX_URLS } = await import('../src/lib/indexnow.ts');

const opts = { host: 'autnic.com', key: 'abc123' };

test('une adresse d’un autre domaine ne part pas avec le lot', () => {
  const { urlList } = indexNowPayload(
    ['https://autnic.com/news/a', 'https://exemple.org/news/b', 'pas-une-url'],
    opts,
  );
  assert.deepEqual(urlList, ['https://autnic.com/news/a']);
});

test('la même adresse deux fois ne compte qu’une', () => {
  const { urlList } = indexNowPayload(
    ['https://autnic.com/a', 'https://autnic.com/a'],
    opts,
  );
  assert.equal(urlList.length, 1);
});

test('la clé est annoncée là où le moteur ira la lire', () => {
  const { keyLocation } = indexNowPayload(['https://autnic.com/a'], opts);
  assert.equal(keyLocation, 'https://autnic.com/abc123.txt');
});

test('le lot est plafonné à ce que le protocole accepte', () => {
  const many = Array.from({ length: MAX_URLS + 50 }, (_, i) => `https://autnic.com/p/${i}`);
  assert.equal(indexNowPayload(many, opts).urlList.length, MAX_URLS);
});

test('un envoi vide ne réveille personne', async () => {
  let called = false;
  const result = await submitToIndexNow([], { ...opts, fetchImpl: async () => (called = true) });
  assert.equal(result, null);
  assert.equal(called, false);
});

test('l’envoi porte le lot en JSON et rend le nombre annoncé', async () => {
  let seen;
  const result = await submitToIndexNow(['https://autnic.com/a'], {
    ...opts,
    fetchImpl: async (url, init) => {
      seen = { url, body: JSON.parse(init.body) };
      return { status: 202 };
    },
  });
  assert.equal(seen.url, 'https://api.indexnow.org/indexnow');
  assert.equal(seen.body.host, 'autnic.com');
  assert.deepEqual(seen.body.urlList, ['https://autnic.com/a']);
  assert.deepEqual(result, { submitted: 1, status: 202 });
});
