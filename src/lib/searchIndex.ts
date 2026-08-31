import { getCollection } from 'astro:content';
import { getPosts, byGame } from './articles';
import { num, scoreBucket } from './format';
import { type Locale, gameHref } from '../i18n/config';
import { useT } from '../i18n/ui';

/* Index de recherche statique, un par langue : quelques dizaines de Ko,
   chargés au premier ⌘K. Le `kind` sert au regroupement et à la pondération. */
export async function searchIndex(lang: Locale) {
  const posts = await getPosts(lang);
  const games = await getCollection('games');
  const t = useT(lang);

  return [
    ...games.map((g) => ({
      kind: 'game',
      title: g.data.title,
      sub: `${g.data.studio} · ${g.data.released} · ${t('card.articles')(byGame(posts, g.id).length)}`,
      href: gameHref(lang, g.id),
      tags: [g.data.genre[lang], ...g.data.platforms.map((p) => p.name)],
      ...(g.data.score !== undefined ? { score: num(g.data.score, lang), bucket: scoreBucket(g.data.score) } : {}),
    })),
    ...posts.map((p) => ({
      kind: p.data.type,
      title: p.data.title,
      sub: [p.game?.data.title, p.author.data.name, p.data.testedOn].filter(Boolean).join(' · '),
      href: p.href,
      tags: p.data.tags,
      ...(p.data.score !== undefined ? { score: num(p.data.score, lang), bucket: scoreBucket(p.data.score) } : {}),
    })),
  ];
}
