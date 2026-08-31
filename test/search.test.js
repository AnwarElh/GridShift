import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterIndex, groupResults, scoreEntry } from '../src/lib/search.js';

const index = [
  { kind: 'jeu', title: 'Echo Divide', sub: 'Northlight', href: '/jeux/echo-divide/' },
  { kind: 'guide', title: 'Bien démarrer sans se bloquer', sub: 'Echo Divide', tags: ['débutant'], href: '/g/1/' },
  { kind: 'test', title: 'Iron District tient sa promesse', sub: 'Ninefold', href: '/t/1/' },
  { kind: 'actu', title: 'Le patch 4.2a corrige l’économie', sub: 'Echo Divide', href: '/a/1/' },
];

test('deux caractères minimum', () => {
  assert.deepEqual(filterIndex(index, 'e'), []);
  assert.deepEqual(filterIndex(index, ''), []);
});

test('les accents et la casse ne comptent pas', () => {
  const r = filterIndex(index, 'DEMARRER');
  assert.equal(r.length, 1);
  assert.equal(r[0].kind, 'guide');
});

test('le jeu passe devant ses articles', () => {
  const r = filterIndex(index, 'echo divide');
  assert.equal(r[0].kind, 'jeu');
  assert.ok(r.length >= 2, 'les articles liés remontent aussi');
});

test('un préfixe de titre bat une mention dans le sous-titre', () => {
  assert.ok(scoreEntry(index[0], 'echo') > scoreEntry(index[3], 'echo'));
});

test('les groupes suivent l’ordre du menu et ignorent les vides', () => {
  const g = groupResults(filterIndex(index, 'echo'));
  assert.deepEqual(g.map((x) => x.kind), ['jeu', 'guide', 'actu']);
});
