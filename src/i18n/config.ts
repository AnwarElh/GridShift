/* ── Langues ────────────────────────────────────────────────────────────────
   L'anglais est la langue principale : il vit à la racine, sans préfixe.
   Le français vit sous /fr/. Les segments d'URL sont traduits — un lecteur
   francophone doit lire /fr/tests/ et non /fr/reviews/, et c'est aussi ce que
   les moteurs indexent. */

export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

/* Étiquette de la langue, dans sa propre langue — jamais traduite. */
export const localeNames: Record<Locale, string> = { en: 'English', fr: 'Français' };
export const htmlLang: Record<Locale, string> = { en: 'en', fr: 'fr' };
export const ogLocale: Record<Locale, string> = { en: 'en_US', fr: 'fr_FR' };

/* ── Base de déploiement ────────────────────────────────────────────────────
   Sur GitHub Pages en mode projet, le site est servi depuis /GridShift/.
   Astro ne réécrit QUE les URL d'assets qu'il génère : un href écrit à la main
   reste tel quel. Toutes les fabriques ci-dessous préfixent donc elles-mêmes,
   et `langFromPath` retire la base avant de lire la langue — sans ça,
   /GridShift/fr/... ne serait jamais reconnu comme du français. */
const BASE = (import.meta.env.BASE_URL ?? '/').replace(/\/+$/, '');

/* Préfixe un chemin absolu du site par la base de déploiement. */
export const withBase = (path: string) => `${BASE}${path}`;

/* Retire la base d'un chemin reçu du navigateur ou du rendu. */
export const stripBase = (pathname: string) =>
  BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) || '/' : pathname;

/* Préfixe de langue. La langue par défaut n'en a pas. */
export const prefix = (lang: Locale) => (lang === defaultLocale ? '' : `/${lang}`);

/* ── Rubriques ──────────────────────────────────────────────────────────────
   La clé est le `type` d'un article ; chaque langue a son segment d'URL. */
export type SectionKey = 'news' | 'review' | 'guide' | 'setup';
export const sectionKeys: SectionKey[] = ['news', 'review', 'guide', 'setup'];

export const sectionSlugs: Record<SectionKey, Record<Locale, string>> = {
  news:   { en: 'news',    fr: 'actus' },
  review: { en: 'reviews', fr: 'tests' },
  guide:  { en: 'guides',  fr: 'guides' },
  setup:  { en: 'setup',   fr: 'configs' },
};

/* ── Pages fixes ────────────────────────────────────────────────────────── */
export type PageKey = 'games' | 'about' | 'credits' | 'legal' | 'privacy' | 'cookies' | 'author' | 'tag';

export const pageSlugs: Record<PageKey, Record<Locale, string>> = {
  games:   { en: 'games',        fr: 'jeux' },
  about:   { en: 'about',        fr: 'a-propos' },
  credits: { en: 'credits',      fr: 'credits' },
  legal:   { en: 'legal-notice', fr: 'mentions-legales' },
  privacy: { en: 'privacy',      fr: 'confidentialite' },
  cookies: { en: 'cookies',      fr: 'cookies' },
  author:  { en: 'author',       fr: 'auteur' },
  tag:     { en: 'tag',          fr: 'tag' },
};

/* ── Fabriques d'URL — un seul endroit qui sait composer un chemin ───────── */
export const homeHref = (lang: Locale) => withBase(`${prefix(lang)}/`);
export const sectionHref = (lang: Locale, key: SectionKey) =>
  withBase(`${prefix(lang)}/${sectionSlugs[key][lang]}/`);
export const articleHref = (lang: Locale, key: SectionKey, slug: string) =>
  withBase(`${prefix(lang)}/${sectionSlugs[key][lang]}/${slug}/`);
export const pageHref = (lang: Locale, key: PageKey) =>
  withBase(`${prefix(lang)}/${pageSlugs[key][lang]}/`);
export const gameHref = (lang: Locale, id: string) =>
  withBase(`${prefix(lang)}/${pageSlugs.games[lang]}/${id}/`);
export const authorHref = (lang: Locale, id: string) =>
  withBase(`${prefix(lang)}/${pageSlugs.author[lang]}/${id}/`);
export const tagHref = (lang: Locale, tag: string) =>
  withBase(`${prefix(lang)}/${pageSlugs.tag[lang]}/${tag}/`);
export const feedHref = (lang: Locale) => withBase(`${prefix(lang)}/rss.xml`);
export const searchIndexHref = (lang: Locale) => withBase(`${prefix(lang)}/search.json`);

/* La rubrique qui correspond à un segment d'URL, dans une langue donnée. */
export const sectionFromSlug = (lang: Locale, slug: string): SectionKey | undefined =>
  sectionKeys.find((k) => sectionSlugs[k][lang] === slug);

/* La langue se lit dans le chemin. Chaque composant la déduit lui-même de
   `Astro.url` : pas de prop `lang` à faire descendre à travers vingt-cinq
   composants, donc pas d'endroit où l'oublier. */
export const langFromPath = (pathname: string): Locale => {
  const p = stripBase(pathname);
  return p === '/fr' || p.startsWith('/fr/') ? 'fr' : defaultLocale;
};

/* Le même chemin dans l'autre langue — pour le sélecteur et les <link alternate>.
   Les pages d'article et de jeu passent leur équivalent explicitement : seule
   la page sait quel est son homologue. */
export const otherLocale = (lang: Locale): Locale => (lang === 'en' ? 'fr' : 'en');
