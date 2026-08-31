/* Recherche : filtrage local sur un index statique.
   Pas de dépendance — quelques centaines d'entrées se filtrent en un tour de boucle. */

export const norm = (s) =>
  (s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/* Un jeu pèse plus qu'un article : sur un média gaming, on cherche d'abord une entité. */
const KIND_BOOST = { game: 3, review: 1, guide: 1, setup: 1, news: 0 };

export function scoreEntry(entry, q) {
  const title = norm(entry.title);
  const hay = norm(`${entry.title} ${entry.sub ?? ''} ${(entry.tags ?? []).join(' ')}`);
  let s = 0;
  if (title === q) s = 100;
  else if (title.startsWith(q)) s = 60;
  else if (title.includes(q)) s = 40;
  else if (hay.includes(q)) s = 15;
  else return 0;
  return s + (KIND_BOOST[entry.kind] ?? 0);
}

export function filterIndex(index, query, limit = 8) {
  const q = norm(query).trim();
  if (q.length < 2) return [];
  return index
    .map((entry) => ({ entry, s: scoreEntry(entry, q) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s || a.entry.title.length - b.entry.title.length)
    .slice(0, limit)
    .map(({ entry }) => entry);
}

/* Regroupé par nature, dans l'ordre du menu : jeux, tests, guides, configs, actus.
   Les libellés arrivent de l'appelant : ce module ne connaît aucune langue. */
export const ORDER = ['game', 'review', 'guide', 'setup', 'news'];

export function groupResults(results, labels = {}) {
  return ORDER
    .map((kind) => ({ kind, label: labels[kind] ?? kind, items: results.filter((r) => r.kind === kind) }))
    .filter((g) => g.items.length > 0);
}
