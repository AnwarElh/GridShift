/* Configuration du site — un seul endroit à modifier. */
export const site = {
  name: 'Gridshift',
  tagline: 'Média indépendant sur le jeu vidéo',
  description:
    'Tests, guides et actus jeu vidéo. Nous testons ce que nous achetons et nous révisons nos notes quand les jeux changent.',
  url: 'https://gridshift.fr',
  locale: 'fr_FR',
  twitter: '@gridshift',
};

/* Les quatre rubriques. La clé est le `type` d'un article, `slug` le segment
   d'URL, `noun` le mot employé dans les compteurs et les états vides.
   Ajouter une rubrique ici suffit : les routes /<slug>/, /<slug>/page/<n>/ et
   /<slug>/<article>/ sont générées à partir de cet objet.

   Typé par une interface plutôt qu'en `as const` : avec quatre entrées, le
   `as const` produisait une union de quatre types littéraux que le narrowing
   de la page d'accueil faisait exploser — `astro check` tombait en OOM. */
export type SectionKey = 'actu' | 'test' | 'guide' | 'config';

export interface Section {
  slug: string;
  label: string;
  title: string;
  noun: string;
  lede: string;
}

export const sections: Record<SectionKey, Section> = {
  actu: { slug: 'actus', label: 'Actus', title: 'Actus', noun: 'actu',
    lede: 'Le fil de la rédaction, mis à jour en continu.' },
  test: { slug: 'tests', label: 'Tests', title: 'Tests', noun: 'test',
    lede: 'Une note, une version testée, un historique de révisions.' },
  guide: { slug: 'guides', label: 'Guides', title: 'Guides', noun: 'guide',
    lede: 'Vérifiés à chaque patch majeur. La version testée est indiquée sur chaque guide.' },
  config: { slug: 'configs', label: 'Configs', title: 'Configs', noun: 'config',
    lede: 'Réglages, matériel et paramètres, mesurés sur nos machines. Le matériel de test est indiqué sur chaque fiche.' },
};

export const sectionOf = (type: SectionKey) => sections[type];
export const hrefOf = (type: SectionKey, id: string) => `/${sections[type].slug}/${id}/`;

/* Réseaux du pied de page. Le `d` est le tracé SVG, viewBox 24×24. */
export const socials = [
  { name: 'YouTube', href: 'https://youtube.com/@gridshift', d: 'M23 12s0-3.9-.5-5.7a3 3 0 0 0-2.1-2.1C18.6 3.7 12 3.7 12 3.7s-6.6 0-8.4.5A3 3 0 0 0 1.5 6.3C1 8.1 1 12 1 12s0 3.9.5 5.7a3 3 0 0 0 2.1 2.1c1.8.5 8.4.5 8.4.5s6.6 0 8.4-.5a3 3 0 0 0 2.1-2.1C23 15.9 23 12 23 12ZM9.8 15.4V8.6l5.9 3.4-5.9 3.4Z' },
  { name: 'Twitch', href: 'https://twitch.tv/gridshift', d: 'M4.3 2 2.5 6.5v14h5v3h3l3-3h4l5.5-5.5V2H4.3Zm15.7 12L17 17h-5l-3 3v-3H5V4h15v10Zm-4.5-7.5h2v6h-2v-6Zm-5 0h2v6h-2v-6Z' },
  { name: 'Discord', href: 'https://discord.gg/gridshift', d: 'M20.3 5.3A17 17 0 0 0 16 4l-.5 1a15 15 0 0 0-7 0L8 4a17 17 0 0 0-4.3 1.3C1 9.6.3 13.8.7 17.9A17 17 0 0 0 5.9 20l1-1.6a11 11 0 0 1-1.8-.9l.5-.3a12 12 0 0 0 10.8 0l.5.3a11 11 0 0 1-1.8.9l1 1.6a17 17 0 0 0 5.2-2c.5-4.8-.6-8.9-3-12.7ZM8.5 15.5c-1 0-1.9-1-1.9-2.1 0-1.2.8-2.1 1.9-2.1s1.9 1 1.9 2.1c0 1.2-.9 2.1-1.9 2.1Zm7 0c-1 0-1.9-1-1.9-2.1 0-1.2.9-2.1 1.9-2.1s1.9 1 1.9 2.1c0 1.2-.8 2.1-1.9 2.1Z' },
  { name: 'X', href: 'https://x.com/gridshift', d: 'M18.2 2h3.3l-7.2 8.3L23 22h-6.6l-5.2-6.8L5.2 22H1.9l7.7-8.8L1.4 2H8l4.7 6.2L18.2 2Zm-1.2 18h1.8L7.1 3.9H5.1L17 20Z' },
  { name: 'RSS', href: '/rss.xml', d: 'M5 3v3a15 15 0 0 1 15 15h3A18 18 0 0 0 5 3Zm0 6v3a9 9 0 0 1 9 9h3A12 12 0 0 0 5 9Zm2.5 8a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z' },
];

export const footerLinks = [
  {
    title: 'Contenu',
    links: [
      { label: 'Guides', href: '/guides/' },
      { label: 'Actus', href: '/actus/' },
      { label: 'Tests', href: '/tests/' },
      { label: 'Configs', href: '/configs/' },
      { label: 'Base de jeux', href: '/jeux/' },
      { label: 'Flux RSS', href: '/rss.xml' },
    ],
  },
  {
    title: 'Le site',
    links: [
      { label: 'Qui nous sommes', href: '/a-propos/' },
      { label: 'La rédaction', href: '/a-propos/#equipe' },
      { label: 'Charte éditoriale', href: '/a-propos/#charte' },
      { label: 'Comment nous notons', href: '/a-propos/#notation' },
      { label: 'Nous écrire', href: '/a-propos/#contact' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { label: 'Mentions légales', href: '/mentions-legales/' },
      { label: 'Confidentialité', href: '/confidentialite/' },
      { label: 'Cookies', href: '/cookies/' },
      { label: 'Liens affiliés', href: '/a-propos/#affiliation' },
      { label: 'Crédits photo', href: '/credits/' },
    ],
  },
];

/* Bandeau des plateformes et genres du méga-menu. */
export const platforms = ['PC', 'PS5', 'Xbox Series', 'Switch 2', 'Steam Deck'];
export const genres = ['Action-RPG', 'Coop', 'Stratégie', 'Roguelite', 'Simulation'];
