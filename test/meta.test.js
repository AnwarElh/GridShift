/* La coupe de la méta-description.
 *
 * Ce qui casse ici casse en silence : la page reste valide, l'extrait du moteur
 * est seulement moins bon. D'où un test sur les formes que les chapôs du site
 * emploient réellement — décimales, prix, dates — et sur l'invariant qui compte,
 * à savoir que le texte rendu est toujours un début du texte donné. */
import { test } from 'node:test';
import assert from 'node:assert/strict';

const { metaDescription } = await import('../src/lib/meta.ts');

test('un chapô déjà court passe intact', () => {
  const s = 'Une note, une version testée, un historique de révisions.';
  assert.equal(metaDescription(s), s);
});

test('la coupe tombe sur une fin de phrase quand elle remplit la place', () => {
  const s = "Rockstar North's Rob Nelson told YouTuber TGG that players cannot keep any fish "
    + 'they catch, and hunting is gated behind a friend. Nobody has explained why.';
  const d = metaDescription(s);
  assert.ok(d.endsWith('.'), d);
  assert.ok(!d.endsWith('…'), d);
  assert.ok(d.length <= 160 && d.length >= 110, `longueur ${d.length}`);
});

test('un point qui ne termine rien ne coupe pas la phrase', () => {
  /* « 8.2 », « 99.99 » et « 8, 2027 » ont tous porté une coupe fautive. */
  for (const s of [
    'We scored it 8.2 and the argument is narrow, specific, and about one design decision '
      + 'that the open world makes for you. Everything else follows from it.',
    'The Trilogy Edition is $99.99 digital and $199.99 physical, which is not what anyone '
      + 'would have guessed from the announcement. Square Enix confirmed both.',
  ]) {
    const d = metaDescription(s);
    assert.ok(s.startsWith(d.replace(/…$/, '')), `pas un début du texte : ${d}`);
    assert.ok(d.length <= 160, `longueur ${d.length}`);
  }
});

test('une première phrase trop longue est coupée au mot, jamais au milieu d’un', () => {
  const s = 'CD Projekt joint-CEO Michał Nowakowski told the studio latest earnings briefing '
    + 'that The Witcher 4 is being made predominantly using people and not machines, which '
    + 'is a sentence a studio now has to say out loud. He declined to speak for others.';
  const d = metaDescription(s);
  assert.ok(d.endsWith('…'), d);
  assert.ok(d.length <= 160, `longueur ${d.length}`);
  assert.ok(s.startsWith(d.slice(0, -1)), 'la coupe doit rester un début du texte');
  assert.ok(!/\s$/.test(d.slice(0, -1)), 'pas d’espace avant les points de suspension');
});

test('une phrase entière mais maigre cède la place à la coupe au mot', () => {
  /* 53 signes de phrase complète contre 160 disponibles : l’extrait perdait
     les deux tiers de sa surface. */
  const s = 'The remake has no date, no footage and no store page. Five years of silence is a '
    + 'long time, and the original is right there on every storefront for about ten euros.';
  const d = metaDescription(s);
  assert.ok(d.length > 110, `longueur ${d.length}`);
  assert.ok(d.length <= 160, `longueur ${d.length}`);
});

test('le texte rendu est toujours un début du texte donné', () => {
  const s = 'A'.repeat(500);
  const d = metaDescription(s);
  assert.ok(d.length <= 160);
  assert.ok(s.startsWith(d.replace(/…$/, '')));
});
