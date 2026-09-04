/* Trier, répartir, paginer.
 *
 * Ces fonctions ne savent pas d'où vient le contenu — collection Astro hier,
 * D1 aujourd'hui. Elles n'exigent que la forme minimale dont elles se servent,
 * d'où les génériques : le même `spreadByGame` sert les deux représentations
 * sans qu'aucune ne doive se déguiser en l'autre.
 *
 * Elles vivaient dans lib/articles.ts, qui importait `astro:content`. Les
 * laisser là aurait tiré tout le moteur de collections dans le bundle du
 * worker, pour cinq tris qui ne touchent jamais au stockage.
 */
import type { SectionKey } from '../i18n/config.ts';

/* La forme minimale : ce que ces fonctions lisent réellement d'un article. */
export interface Sortable {
  id: string;
  game?: { id: string };
  data: { type: SectionKey; tags: string[]; date: Date };
}

export const byType = <T extends Sortable>(posts: T[], type: SectionKey): T[] =>
  posts.filter((p) => p.data.type === type);

export const byGame = <T extends Sortable>(posts: T[], gameId: string): T[] =>
  posts.filter((p) => p.game?.id === gameId);

/* Une sélection qui ne parle pas que d'un jeu.

   La Une, le Fil et les Tendances prenaient tous les N premiers d'une liste
   déjà triée — par date pour les deux premiers, par nombre d'abonnés pour le
   troisième. Sur un site qui couvre sept jeux et publie par salves, ça donne
   cinq articles du même jeu en haut de l'accueil : un lecteur qui arrive croit
   qu'on ne parle que de ça.

   Le tour de table règle ça sans rien casser : on prend le premier article de
   chaque jeu, puis le deuxième de chaque, et ainsi de suite. L'ordre d'entrée
   décide des priorités — la fonction ne trie rien elle-même — et un jeu ne
   repasse jamais avant que tous les autres aient eu leur tour. Les articles
   sans jeu forment leur propre file plutôt que d'être écartés. */
export function spreadByGame<T extends Sortable>(posts: T[], limit: number): T[] {
  const queues = new Map<string, T[]>();
  for (const p of posts) {
    const key = p.game?.id ?? `—${p.id}`;
    const q = queues.get(key);
    if (q) q.push(p); else queues.set(key, [p]);
  }
  const lists = [...queues.values()];
  const out: T[] = [];
  for (let round = 0; out.length < limit; round++) {
    const before = out.length;
    for (const list of lists) {
      if (!list[round]) continue;
      out.push(list[round]);
      if (out.length === limit) return out;
    }
    /* plus rien à distribuer : toutes les files sont épuisées */
    if (out.length === before) break;
  }
  return out;
}

/* Suite de lecture : le même jeu d'abord, les mêmes tags ensuite. */
export function related<T extends Sortable>(posts: T[], post: T, limit = 3): T[] {
  const score = (p: T) =>
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

export const allTags = <T extends Sortable>(posts: T[]): [string, number][] => {
  const counts = new Map<string, number>();
  for (const p of posts) for (const t of p.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]);
};

export const slugifyTag = (tag: string) =>
  tag.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
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
