import { type Locale, pageHref, feedHref, withBase } from './i18n/config';
import { useT } from './i18n/ui';

/* Identité — le nom et le domaine n'ont pas de langue.

   `url` suit la valeur `site` d'astro.config, jamais une constante écrite ici :
   elle sert aux canonical, aux hreflang, au JSON-LD et au plan de site, et le
   même code sert deux origines — autnic.com en production, github.io pour
   l'aperçu. Figée, elle ferait annoncer à l'aperçu des canonical vers un
   domaine qui ne sert pas ce contenu. */
export const site = {
  name: 'Autnic',
  url: import.meta.env.SITE ?? 'https://autnic.com',
  email: 'redaction@autnic.com',
};

/* `site.url` est le domaine, pas le site : dans l'aperçu GitHub Pages, le site
   vit sous /GridShift. Comme base d'un `new URL(chemin, site.url)` c'est correct —
   le chemin porte déjà la base. Employée seule, dans un JSON-LD, elle annonçait
   une adresse qui ne sert pas ce site. D'où cette constante, à utiliser partout
   où l'on nomme le site lui-même. */
export const siteHome = new URL(withBase('/'), site.url).href;

/* L'ÉDITEUR, une fois pour toutes.
 *
 * Chaque article déclarait `publisher: { '@type': 'Organization', name }` — un
 * nom nu, sans adresse ni identifiant. La page « Qui sommes-nous » décrivait de
 * son côté une Organization complète, avec l'équipe. Rien ne reliait les deux :
 * un moteur y voyait deux choses sans rapport, et l'entité qui se fait citer
 * dans une réponse d'IA est justement celle-là.
 *
 * `@id` est ce lien. Il est stable, absolu, et le même partout : les nœuds
 * portant le même `@id` sont UN seul nœud, quelle que soit la page où on les
 * rencontre. Les articles en portent une version suffisante — nom, adresse,
 * logo — pour ne pas dépendre d'une autre page ; /à-propos/ en porte la version
 * complète. Le logo est l'icône carrée : c'est la seule image de marque que le
 * site possède, et une vraie vaut mieux qu'une propriété absente.
 */
export const orgId = `${siteHome}#organization`;

export const publisher = {
  '@type': 'Organization',
  '@id': orgId,
  name: site.name,
  url: siteHome,
  logo: {
    '@type': 'ImageObject',
    url: new URL(withBase('/apple-touch-icon.png'), site.url).href,
    width: 180,
    height: 180,
  },
};
/* Identité légale de l'éditeur. Séparée de `site` : `site.email` est l'adresse
   de la rédaction, celle-ci est la personne physique responsable. Une seule
   source pour l'Impressum, les mentions légales et le responsable de
   traitement — un écart entre ces pages est le défaut le plus souvent
   reproché. */
export const owner = {
  name: 'Anwar Elhamdi',
  street: 'Via Cavour 1',
  zip: '35028',
  city: 'Piove di Sacco',
  province: 'PD',
  email: 'anwarelhamdi2468@gmail.com',
  phone: '+39 351 3239223',
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
  de: {
    tagline: 'Unabhängiges Games-Magazin',
    description:
      'Tests, Guides und News zu Live-Service-Spielen. Wir kaufen, was wir testen, und wir korrigieren unsere Wertungen, wenn sich die Spiele ändern.',
  },
};


/* Pied de page : deux colonnes. Les rubriques ne sont pas répétées ici — le
   bandeau les porte déjà sur chaque page. Restent ce qu'on ne trouve nulle
   part ailleurs : la page « qui nous sommes », le flux, et le légal.
   Construites à partir des fabriques d'URL — aucun chemin n'est écrit en
   dur, donc aucun ne peut pointer vers la mauvaise langue. */
export function footerLinks(lang: Locale) {
  const t = useT(lang);
  return [
    {
      title: t('foot.site'),
      links: [
        { label: t('foot.about'), href: pageHref(lang, 'about') },
        { label: t('foot.contact'), href: `${pageHref(lang, 'about')}#contact` },
        { label: t('foot.rss'), href: feedHref(lang) },
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
  de: ['Action-RPG', 'Koop', 'Strategie', 'Roguelite', 'Simulation'],
};
