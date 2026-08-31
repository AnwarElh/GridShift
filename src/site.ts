import { type Locale, pageHref, sectionHref, feedHref } from './i18n/config';
import { useT } from './i18n/ui';

/* Identité — le nom et le domaine n'ont pas de langue.

   `url` suit la valeur `site` d'astro.config : elle sert aux canonical, aux
   hreflang, au JSON-LD et au plan de site. Codée en dur, elle annonçait
   gridshift.fr alors que le build est publié sur github.io — des canonical
   pointant vers un domaine qui ne sert pas ce contenu. */
export const site = {
  name: 'Gridshift',
  url: import.meta.env.SITE ?? 'https://anwarelh.github.io',
  twitter: '@gridshift',
  email: 'redaction@gridshift.fr',
};

/* Ce que le site dit de lui-même, dans chaque langue. Sert au <title>, à la
   meta description et au bloc de marque du pied de page. */
export const siteCopy: Record<Locale, { tagline: string; description: string }> = {
  en: {
    tagline: 'Independent games media',
    description:
      'Reviews, guides and news for live-service games. We buy what we review, and we revise our scores when the games change.',
  },
  fr: {
    tagline: 'Média indépendant sur le jeu vidéo',
    description:
      'Tests, guides et actus jeu vidéo. Nous testons ce que nous achetons et nous révisons nos notes quand les jeux changent.',
  },
};

/* Réseaux du pied de page. Le `d` est le tracé SVG, viewBox 24×24. */
export const socials = [
  { name: 'YouTube', href: 'https://youtube.com/@gridshift', d: 'M23 12s0-3.9-.5-5.7a3 3 0 0 0-2.1-2.1C18.6 3.7 12 3.7 12 3.7s-6.6 0-8.4.5A3 3 0 0 0 1.5 6.3C1 8.1 1 12 1 12s0 3.9.5 5.7a3 3 0 0 0 2.1 2.1c1.8.5 8.4.5 8.4.5s6.6 0 8.4-.5a3 3 0 0 0 2.1-2.1C23 15.9 23 12 23 12ZM9.8 15.4V8.6l5.9 3.4-5.9 3.4Z' },
  { name: 'Twitch', href: 'https://twitch.tv/gridshift', d: 'M4.3 2 2.5 6.5v14h5v3h3l3-3h4l5.5-5.5V2H4.3Zm15.7 12L17 17h-5l-3 3v-3H5V4h15v10Zm-4.5-7.5h2v6h-2v-6Zm-5 0h2v6h-2v-6Z' },
  { name: 'Discord', href: 'https://discord.gg/gridshift', d: 'M20.3 5.3A17 17 0 0 0 16 4l-.5 1a15 15 0 0 0-7 0L8 4a17 17 0 0 0-4.3 1.3C1 9.6.3 13.8.7 17.9A17 17 0 0 0 5.9 20l1-1.6a11 11 0 0 1-1.8-.9l.5-.3a12 12 0 0 0 10.8 0l.5.3a11 11 0 0 1-1.8.9l1 1.6a17 17 0 0 0 5.2-2c.5-4.8-.6-8.9-3-12.7ZM8.5 15.5c-1 0-1.9-1-1.9-2.1 0-1.2.8-2.1 1.9-2.1s1.9 1 1.9 2.1c0 1.2-.9 2.1-1.9 2.1Zm7 0c-1 0-1.9-1-1.9-2.1 0-1.2.9-2.1 1.9-2.1s1.9 1 1.9 2.1c0 1.2-.8 2.1-1.9 2.1Z' },
  { name: 'X', href: 'https://x.com/gridshift', d: 'M18.2 2h3.3l-7.2 8.3L23 22h-6.6l-5.2-6.8L5.2 22H1.9l7.7-8.8L1.4 2H8l4.7 6.2L18.2 2Zm-1.2 18h1.8L7.1 3.9H5.1L17 20Z' },
  { name: 'RSS', href: '/rss.xml', d: 'M5 3v3a15 15 0 0 1 15 15h3A18 18 0 0 0 5 3Zm0 6v3a9 9 0 0 1 9 9h3A12 12 0 0 0 5 9Zm2.5 8a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z' },
];

/* Pied de page : trois colonnes, construites à partir des fabriques d'URL —
   aucun chemin n'est écrit en dur, donc aucun ne peut pointer vers la
   mauvaise langue. */
export function footerLinks(lang: Locale) {
  const t = useT(lang);
  return [
    {
      title: t('foot.content'),
      links: [
        { label: t('nav.guides'), href: sectionHref(lang, 'guide') },
        { label: t('nav.news'), href: sectionHref(lang, 'news') },
        { label: t('nav.reviews'), href: sectionHref(lang, 'review') },
        { label: t('nav.setup'), href: sectionHref(lang, 'setup') },
        { label: t('nav.games'), href: pageHref(lang, 'games') },
        { label: t('foot.rss'), href: feedHref(lang) },
      ],
    },
    {
      title: t('foot.site'),
      links: [
        { label: t('foot.about'), href: pageHref(lang, 'about') },
        { label: t('foot.team'), href: `${pageHref(lang, 'about')}#team` },
        { label: t('foot.charter'), href: `${pageHref(lang, 'about')}#charter` },
        { label: t('foot.howWeScore'), href: `${pageHref(lang, 'about')}#scoring` },
        { label: t('foot.contact'), href: `${pageHref(lang, 'about')}#contact` },
      ],
    },
    {
      title: t('foot.legal'),
      links: [
        { label: t('foot.legalNotice'), href: pageHref(lang, 'legal') },
        { label: t('foot.privacy'), href: pageHref(lang, 'privacy') },
        { label: t('foot.cookies'), href: pageHref(lang, 'cookies') },
        { label: t('foot.affiliate'), href: `${pageHref(lang, 'about')}#affiliate` },
        { label: t('foot.credits'), href: pageHref(lang, 'credits') },
      ],
    },
  ];
}

/* Une plateforme est un nom propre : elle ne se traduit pas. Un genre, si. */
export const platforms = ['PC', 'PS5', 'Xbox Series', 'Switch 2', 'Steam Deck'];

export const genres: Record<Locale, string[]> = {
  en: ['Action RPG', 'Co-op', 'Strategy', 'Roguelite', 'Simulation'],
  fr: ['Action-RPG', 'Coop', 'Stratégie', 'Roguelite', 'Simulation'],
};
