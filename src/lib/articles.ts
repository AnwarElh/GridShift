import { getCollection, type CollectionEntry } from 'astro:content';
import {
  articleHref, type Locale, type SectionKey, defaultLocale,
} from '../i18n/config';
import { readingTime } from './format';

export type Article = CollectionEntry<'articles'>;
export type Game = CollectionEntry<'games'>;
export type Author = CollectionEntry<'authors'>;

export interface Post {
  entry: Article;
  data: Article['data'];
  /* `id` vaut « fr/echo-divide-test » ; `slug` est la partie qui va dans l'URL,
     et sert aussi de clé de traduction : deux fichiers de même nom dans en/ et
     fr/ sont la même histoire dans deux langues. */
  id: string;
  slug: string;
  lang: Locale;
  href: string;
  section: SectionKey;
  author: Author;
  game?: Game;
  minutes: number;
}

/* Un cache par langue : `getPosts('fr')` ne doit jamais voir un article anglais. */
const cache = new Map<Locale, Post[]>();

export async function getPosts(lang: Locale = defaultLocale): Promise<Post[]> {
  const hit = cache.get(lang);
  if (hit) return hit;

  const [articles, games, authors] = await Promise.all([
    getCollection('articles', ({ data }) => import.meta.env.DEV || !data.draft),
    getCollection('games'),
    getCollection('authors'),
  ]);
  const gameById = new Map(games.map((g) => [g.id, g]));
  const authorById = new Map(authors.map((a) => [a.id, a]));

  const posts = articles
    .filter((entry) => entry.data.lang === lang)
    .map((entry) => {
      const slug = entry.id.split('/').pop()!;
      return {
        entry,
        data: entry.data,
        id: entry.id,
        slug,
        lang,
        href: articleHref(lang, entry.data.type, slug),
        section: entry.data.type,
        author: authorById.get(entry.data.author.id)!,
        game: entry.data.game ? gameById.get(entry.data.game.id) : undefined,
        minutes: entry.data.readingMinutes ?? readingTime(entry.body, lang),
      };
    })
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  cache.set(lang, posts);
  return posts;
}

export const byType = (posts: Post[], type: SectionKey) =>
  posts.filter((p) => p.data.type === type);

export const byGame = (posts: Post[], gameId: string) =>
  posts.filter((p) => p.game?.id === gameId);

/* Suite de lecture : le même jeu d'abord, les mêmes tags ensuite. */
export function related(posts: Post[], post: Post, limit = 3): Post[] {
  const score = (p: Post) =>
    (p.game && p.game.id === post.game?.id ? 10 : 0) +
    p.data.tags.filter((t) => post.data.tags.includes(t)).length;
  return posts
    .filter((p) => p.id !== post.id)
    .map((p) => ({ p, s: score(p) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s || b.p.data.date.getTime() - a.p.data.date.getTime())
    .slice(0, limit)
    .map(({ p }) => p);
}

export const allTags = (posts: Post[]) => {
  const counts = new Map<string, number>();
  for (const p of posts) for (const t of p.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]);
};

export const slugifyTag = (tag: string) =>
  tag.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* Pagination maison : les articles vivent sur /rubrique/<slug>/, les pages sur
   /rubrique/page/<n>/, donc les deux routes ne se marchent pas dessus. */
export interface Paged<T> {
  items: T[];
  current: number;
  last: number;
  total: number;
  base: string;
  prev?: string;
  next?: string;
}

export function pageOf<T>(items: T[], current: number, size: number, base: string): Paged<T> {
  const last = Math.max(1, Math.ceil(items.length / size));
  return {
    items: items.slice((current - 1) * size, current * size),
    current, last, total: items.length, base,
    prev: current > 1 ? (current === 2 ? base : `${base}page/${current - 1}/`) : undefined,
    next: current < last ? `${base}page/${current + 1}/` : undefined,
  };
}

export const pageHref = (p: Paged<unknown>, n: number) => (n === 1 ? p.base : `${p.base}page/${n}/`);
