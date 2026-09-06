/* Le parseur de front-matter de scripts/content-to-d1.mjs.
 *
 * C'est du YAML écrit à la main pour ce dépôt seulement, et c'est le seul
 * endroit du pipeline où une donnée peut se dégrader sans que rien n'échoue :
 * un champ mal découpé produit un export valide qui affiche un texte tronqué.
 * D'où un test sur les formes que les fiches de jeu emploient réellement. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFrontmatter } from '../scripts/content-to-d1.mjs';

const doc = (head) => `---\n${head}\n---\nUn corps.`;

test('une virgule dans une valeur citée ne coupe pas le champ', () => {
  const { data } = parseFrontmatter(doc(
    'facts:\n' +
    '  en:\n' +
    '    - { label: Protagonists, value: "Jason and Lucia, in the state of Leonida" }\n' +
    '  de:\n' +
    '    - { label: Hauptfiguren, value: "Jason und Lucia, im Bundesstaat Leonida" }',
  ), 'test');
  assert.equal(data.facts.en[0].label, 'Protagonists');
  assert.equal(data.facts.en[0].value, 'Jason and Lucia, in the state of Leonida');
  assert.equal(data.facts.de[0].value, 'Jason und Lucia, im Bundesstaat Leonida');
});

test('la virgule qui sépare deux champs découpe toujours', () => {
  const { data } = parseFrontmatter(doc('platforms:\n  - { name: PS5, best: true }'), 'test');
  assert.deepEqual(data.platforms[0], { name: 'PS5', best: true });
});

test('les trois langues d’un champ traduit sont lues', () => {
  const { data } = parseFrontmatter(doc('genre:\n  en: Open world\n  fr: Monde ouvert\n  de: Open World'), 'test');
  assert.deepEqual(data.genre, { en: 'Open world', fr: 'Monde ouvert', de: 'Open World' });
});
