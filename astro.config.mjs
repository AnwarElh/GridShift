import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

/* Déployé sur GitHub Pages en tant que projet : le site vit dans un
   sous-dossier, d'où `base`. Tout lien interne passe par les fabriques de
   src/i18n/config.ts, qui préfixent avec import.meta.env.BASE_URL — Astro ne
   réécrit pas les href écrits à la main. */

/* Les anciennes URL françaises vivaient à la racine (/actus/, /tests/…).
   L'anglais y est passé : chaque ancienne adresse d'index renvoie vers son
   équivalent sous /fr/.

   `/guides/` n'y est PAS : les deux langues emploient le même segment, donc
   rediriger casserait la page anglaise. Les anciens liens /guides/... servent
   désormais la version anglaise du même article — même contenu, autre langue. */
/* Astro applique `base` à la CLÉ d'une redirection, jamais à sa VALEUR :
   '/actus/' était bien servi depuis /GridShift/actus/, mais renvoyait vers
   /fr/actus/ — sans la base, donc vers un 404. Chaque ancienne adresse
   française menait au vide. La base est donc écrite dans la destination. */
const BASE = '/GridShift';

const redirects = Object.fromEntries(
  Object.entries({
    '/actus/': '/fr/actus/',
    '/tests/': '/fr/tests/',
    '/configs/': '/fr/configs/',
    '/jeux/': '/fr/jeux/',
    '/a-propos/': '/fr/a-propos/',
    '/mentions-legales/': '/fr/mentions-legales/',
    '/confidentialite/': '/fr/confidentialite/',
  }).map(([from, to]) => [from, `${BASE}${to}`]),
);

export default defineConfig({
  site: 'https://anwarelh.github.io',
  base: BASE,
  trailingSlash: 'ignore',
  integrations: [
    mdx(),
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', fr: 'fr' } },
      /* Les pages d'étiquette portent `noindex` : les annoncer au plan de site
         reviendrait à demander l'indexation de ce qu'on refuse d'indexer. */
      filter: (page) => !/\/tag\//.test(page),
    }),
  ],
  markdown: { shikiConfig: { theme: 'github-dark' } },
  redirects,
});
