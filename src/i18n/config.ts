/* ── Langues ────────────────────────────────────────────────────────────────
   L'anglais est la langue principale : il vit à la racine, sans préfixe.
   Le français vit sous /fr/, l'allemand sous /de/. Les segments d'URL sont
   traduits — un lecteur francophone doit lire /fr/tests/ et non /fr/reviews/,
   un lecteur germanophone /de/tests/ et /de/spiele/, et c'est aussi ce que
   les moteurs indexent. */

export const locales = ['en', 'fr', 'de'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

/* Étiquette de la langue, dans sa propre langue — jamais traduite. */
export const localeNames: Record<Locale, string> = { en: 'English', fr: 'Français', de: 'Deutsch' };
export const htmlLang: Record<Locale, string> = { en: 'en', fr: 'fr', de: 'de' };
/* de_DE plutôt que de_AT ou de_CH : l'Allemagne est le premier marché
   germanophone, et og:locale n'accepte qu'une valeur. Les lecteurs autrichiens
   et suisses lisent la même page — c'est la langue qui compte, pas le pays. */
export const ogLocale: Record<Locale, string> = { en: 'en_US', fr: 'fr_FR', de: 'de_DE' };

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
   La clé est le `type` d'un article ; chaque langue a son segment d'URL.

   L'allemand suit la presse jeu vidéo allemande, pas une traduction littérale :
   un test s'appelle un « Test » (GameStar, PC Games, 4Players), et la rubrique
   matériel et réglages s'appelle « Technik ». « Einstellungen » aurait été le
   mot du dictionnaire ; ce n'est pas celui que le lecteur cherche. */
export type SectionKey = 'news' | 'review' | 'guide' | 'setup';
export const sectionKeys: SectionKey[] = ['news', 'review', 'guide', 'setup'];

export const sectionSlugs: Record<SectionKey, Record<Locale, string>> = {
  news:   { en: 'news',    fr: 'actus',   de: 'news' },
  review: { en: 'reviews', fr: 'tests',   de: 'tests' },
  guide:  { en: 'guides',  fr: 'guides',  de: 'guides' },
  setup:  { en: 'setup',   fr: 'configs', de: 'technik' },
};

/* ── Pages fixes ──────────────────────────────────────────────────────────
   Les segments allemands sont en ASCII : « ueber-uns » et non « über-uns ».
   Un ü dans une URL est servi percent-encodé (%C3%BC), ce qui se copie mal et
   se lit encore plus mal dans un résultat de recherche.

   « impressum » et « datenschutz » ne sont pas des traductions de confort :
   ce sont les adresses que le lecteur allemand cherche par réflexe, et les
   noms attendus des deux pages que la loi allemande impose. */
export type PageKey = 'games' | 'about' | 'credits' | 'legal' | 'privacy' | 'cookies' | 'author' | 'tag';

export const pageSlugs: Record<PageKey, Record<Locale, string>> = {
  games:   { en: 'games',        fr: 'jeux',             de: 'spiele' },
  about:   { en: 'about',        fr: 'a-propos',         de: 'ueber-uns' },
  credits: { en: 'credits',      fr: 'credits',          de: 'bildnachweise' },
  legal:   { en: 'legal-notice', fr: 'mentions-legales', de: 'impressum' },
  privacy: { en: 'privacy',      fr: 'confidentialite',  de: 'datenschutz' },
  cookies: { en: 'cookies',      fr: 'cookies',          de: 'cookies' },
  author:  { en: 'author',       fr: 'auteur',           de: 'autor' },
  tag:     { en: 'tag',          fr: 'tag',              de: 'thema' },
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
   composants, donc pas d'endroit où l'oublier.

   La liste est dérivée de `locales` : ajouter une langue ne demande plus de
   revenir modifier cette fonction — c'est exactement l'oubli qui, avec deux
   langues codées en dur, aurait servi tout /de/ en anglais. */
const prefixed = locales.filter((l) => l !== defaultLocale);
export const langFromPath = (pathname: string): Locale => {
  const p = stripBase(pathname);
  return prefixed.find((l) => p === `/${l}` || p.startsWith(`/${l}/`)) ?? defaultLocale;
};

/* Les AUTRES langues — pour le sélecteur et les <link alternate>. Avec deux
   langues, « l'autre » était une valeur ; avec trois, c'est une liste, et un
   sélecteur qui n'en montrait qu'une cachait la troisième.
   Les pages d'article et de jeu passent leur équivalent explicitement : seule
   la page sait quel est son homologue. */
export const otherLocales = (lang: Locale): Locale[] => locales.filter((l) => l !== lang);
