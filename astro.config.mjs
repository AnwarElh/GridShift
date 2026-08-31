import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

/* Les anciennes URL françaises vivaient à la racine (/actus/, /tests/…).
   L'anglais y est passé : chaque ancienne adresse d'index renvoie vers son
   équivalent sous /fr/.

   `/guides/` n'y est PAS : les deux langues emploient le même segment, donc
   rediriger casserait la page anglaise. Les anciens liens /guides/... servent
   désormais la version anglaise du même article — même contenu, autre langue.

   En sortie statique Astro écrit des pages de redirection (meta refresh) :
   posez de vraies 301 au niveau de l'hébergeur pour transmettre le signal SEO. */
const redirects = {
  '/actus/': '/fr/actus/',
  '/tests/': '/fr/tests/',
  '/configs/': '/fr/configs/',
  '/jeux/': '/fr/jeux/',
  '/a-propos/': '/fr/a-propos/',
  '/mentions-legales/': '/fr/mentions-legales/',
  '/confidentialite/': '/fr/confidentialite/',
};

export default defineConfig({
  site: 'https://gridshift.fr',
  integrations: [mdx(), sitemap({ i18n: { defaultLocale: 'en', locales: { en: 'en', fr: 'fr' } } })],
  markdown: { shikiConfig: { theme: 'github-dark' } },
  redirects,
});
