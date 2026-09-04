/* La couche Cloudflare : le cache et la lecture D1.
 *
 * On teste ce qui casse silencieusement — une clé de cache qui varie selon
 * l'ordre des paramètres sert deux fois la même page, et une ligne D1 mal
 * relue rend un article sans auteur. Le reste (SQL, R2) est vérifié en
 * exécutant réellement wrangler, pas ici. */
import { test, mock } from 'node:test';
import assert from 'node:assert/strict';

/* i18n/config.ts lit `import.meta.env`, que Vite fournit et que node nu n'a
   pas : importé tel quel, le module explose au chargement. On le remplace donc
   par la seule fonction que db.ts lui emprunte. Ce test porte sur la relecture
   des lignes D1, pas sur la fabrique d'URL — celle-ci a déjà ses garanties
   ailleurs, et la mêler ici obligerait à démarrer Vite pour vérifier un
   `JSON.parse`. */
mock.module(import.meta.resolve('../src/i18n/config.ts'), {
  namedExports: { articleHref: (_lang, section, slug) => `/${section}/${slug}/` },
});

const { cacheKey, isCacheable, ttlFrom } = await import('../src/lib/cache.ts');
const { load } = await import('../src/lib/db.ts');

const req = (url, headers = {}) => new Request(url, { headers });

test('la clé de cache ignore l’ordre des paramètres', () => {
  assert.equal(
    cacheKey(req('https://g.fr/a?b=2&a=1')),
    cacheKey(req('https://g.fr/a?a=1&b=2')),
  );
});

test('la clé de cache distingue deux chemins', () => {
  assert.notEqual(cacheKey(req('https://g.fr/a')), cacheKey(req('https://g.fr/b')));
});

test('une requête portant une identité n’est pas partagée', () => {
  assert.equal(isCacheable(req('https://g.fr/')), true);
  assert.equal(isCacheable(req('https://g.fr/', { cookie: 'x=1' })), false);
  assert.equal(isCacheable(req('https://g.fr/', { authorization: 'Bearer x' })), false);
  assert.equal(isCacheable(new Request('https://g.fr/', { method: 'POST' })), false);
});

test('la durée de vie refuse ce que KV refuse', () => {
  assert.equal(ttlFrom({ CACHE_TTL: '600' }), 600);
  assert.equal(ttlFrom({ CACHE_TTL: '5' }), 3600, 'sous 60 s, KV rejette : on retombe sur le défaut');
  assert.equal(ttlFrom({}), 3600);
});

/* Un faux D1 : `prepare().bind().all()` rend les lignes qu'on lui donne, dans
   l'ordre où load() les demande. */
function fakeD1(tables) {
  const pick = (sql) =>
    /FROM media/.test(sql) ? tables.media
      : /FROM authors/.test(sql) ? tables.authors
      : /FROM games/.test(sql) ? tables.games
      : /FROM articles/.test(sql) ? tables.articles
      : /FROM article_tags/.test(sql) ? tables.tags
      : tables.sections;
  return {
    prepare(sql) {
      const res = { all: async () => ({ results: pick(sql) }) };
      return { ...res, bind: () => res };
    },
  };
}

const FIXTURE = {
  media: [{
    key: 'h-x.jpg', width: 1920, height: 1080, bytes: 1000, content_type: 'image/jpeg',
    artist: 'Studio', licence: 'Éditeur', licence_url: '', source: 'https://s', note: 'recadré',
  }],
  authors: [{
    id: 'lina-morel', name: 'Lina Morel', initials: 'LM', since: '2024',
    role_en: 'Guides writer', role_fr: 'Rédactrice guides',
    bio_en: 'bio', bio_fr: 'bio fr', creds_en: '["a"]', creds_fr: '["b"]',
    body_en: '', body_fr: '',
  }],
  games: [{
    id: 'onimusha', title: 'Onimusha', studio: 'Capcom', released: '2026',
    release_date: '2026-09-04T00:00:00.000Z', score: 8.2,
    cover_media: null, hero_media: 'h-x.jpg',
    platforms: '[{"name":"PS5","best":true}]', offers: '[]',
    genre_en: 'Action', genre_fr: 'Action', facts_en: '[]', facts_fr: '[]',
    summary_en: 'sum', summary_fr: 'résumé', body_en: '', body_fr: '',
  }],
  articles: [{
    slug: 'onimusha-review', lang: 'en', section: 'review', title: 'T', seo_title: null,
    lede: 'L', published_at: '2026-09-04T08:00:00.000Z', updated_at: null,
    author_id: 'lina-morel', game_id: 'onimusha', kicker: null,
    cover_media: 'h-x.jpg', cover_caption: 'Une capture précise',
    reading_minutes: null, tested_on: null, stale: 0, live: 0, featured: 1, draft: 0,
    score: 8.2, verdict: 'V', pros: '["p"]', cons: '["c"]', playtime: null,
    review_notes: '[]', score_revision: null, level: null, steps: '[]',
    method: null, sources: null, corrections: '[]', body: 'Un corps.',
  }],
  tags: [{ slug: 'onimusha-review', tag: 'Onimusha' }, { slug: 'onimusha-review', tag: 'Capcom' }],
  sections: [{ key: 'review', slug_en: 'reviews', slug_fr: 'tests', label_en: 'Reviews', label_fr: 'Tests' }],
};

test('load() rend la forme qu’attendent les gabarits', async () => {
  const { posts, games, media } = await load(fakeD1(FIXTURE), 'en', '/media');
  assert.equal(posts.length, 1);
  const p = posts[0];

  assert.equal(p.slug, 'onimusha-review');
  assert.equal(p.section, 'review');
  assert.equal(p.author.data.name, 'Lina Morel', 'l’auteur est résolu, pas laissé en identifiant');
  assert.equal(p.game?.data.title, 'Onimusha', 'le jeu est résolu');
  assert.ok(p.data.date instanceof Date, 'la date est une Date, pas une chaîne');
  assert.deepEqual(p.data.tags.sort(), ['Capcom', 'Onimusha'], 'les étiquettes sont recollées');
  assert.deepEqual(p.data.pros, ['p'], 'le JSON est relu');
  assert.equal(p.data.featured, true, '0/1 devient un booléen');
  assert.equal(p.data.cover?.src, '/media/h-x.jpg', 'le média devient une URL publique');
  assert.equal(p.data.cover?.width, 1920, 'les dimensions suivent — sans elles, la page saute');
  assert.equal(p.data.cover?.credit.artist, 'Studio', 'le crédit voyage avec le média');
  assert.ok(p.minutes > 0, 'le temps de lecture est calculé à défaut de valeur');

  assert.equal(games[0].data.platforms[0].name, 'PS5');
  assert.equal(media.size, 1);
});

test('load() choisit la langue demandée', async () => {
  const fr = { ...FIXTURE, articles: [{ ...FIXTURE.articles[0], lang: 'fr' }] };
  const { games, authors } = await load(fakeD1(fr), 'fr', '/media');
  assert.equal(games[0].data.summary, 'résumé', 'les colonnes _fr sont lues en français');
  assert.equal(authors[0].data.role, 'Rédactrice guides');
});
