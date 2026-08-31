import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getPosts, byGame } from '../lib/articles';
import { num, scoreBucket } from '../lib/format';

/* Index de recherche statique : quelques dizaines de Ko, chargés au premier ⌘K. */
export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const games = await getCollection('games');

  const entries = [
    ...games.map((g) => ({
      kind: 'jeu',
      title: g.data.title,
      sub: `${g.data.studio} · ${g.data.released} · ${byGame(posts, g.id).length} articles`,
      href: `/jeux/${g.id}/`,
      tags: [g.data.genre, ...g.data.platforms.map((p) => p.name)],
      ...(g.data.score !== undefined ? { score: num(g.data.score), bucket: scoreBucket(g.data.score) } : {}),
    })),
    ...posts.map((p) => ({
      kind: p.data.type,
      title: p.data.title,
      sub: [p.game?.data.title, p.author.data.name, p.data.testedOn].filter(Boolean).join(' · '),
      href: p.href,
      tags: p.data.tags,
      ...(p.data.score !== undefined ? { score: num(p.data.score), bucket: scoreBucket(p.data.score) } : {}),
    })),
  ];

  return new Response(JSON.stringify(entries), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=3600' },
  });
};
