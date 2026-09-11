import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import cloudflare from '@astrojs/cloudflare';

/* Le site est rendu par un worker, au plus près du lecteur, à partir de D1.
   Plus de build qui fige 203 pages : la page est fabriquée à la demande, puis
   gardée en cache (voir src/middleware.ts). Publier ne demande plus de
   redéployer — écrire dans D1 suffit. */

/* `base` existait pour GitHub Pages, où le site vivait dans un sous-dossier.
   Sur autnic.com il n'y a plus de sous-dossier : le défaut est donc '', et
   c'est l'aperçu Pages qui pose '/GridShift' explicitement (pages.yml). Le
   défaut inverse faisait porter le préfixe du dépôt à la production dès que la
   variable manquait — 203 URL fausses pour une variable oubliée.
   Tout lien interne passe par les fabriques de src/i18n/config.ts, qui
   préfixent avec import.meta.env.BASE_URL — Astro ne réécrit pas les href
   écrits à la main. */
/* `||`, pas `??` : un atelier GitHub qui passe `SITE_BASE: ${{ vars.SITE_BASE }}`
   sans avoir défini la variable ne transmet pas « rien », il transmet la chaîne
   vide — que `??` laisse passer. Ici elle vaut le défaut, mais la même écriture
   plus bas donnait `site: ''` et coupait le build sur « site: Invalid url ». */
const BASE = process.env.SITE_BASE || '';

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

/* L'identifiant de ce build. Il entre dans la clé de cache : un déploiement
   neuf ne peut donc pas servir les pages du précédent. Sans lui, publier du
   code ne changeait rien pour un lecteur tant que le TTL n'avait pas expiré —
   la page restait celle d'avant, et on croyait le déploiement raté. */
const BUILD_ID = process.env.GITHUB_SHA?.slice(0, 12) ?? Date.now().toString(36);

export default defineConfig({
  vite: { define: { 'import.meta.env.BUILD_ID': JSON.stringify(BUILD_ID) } },
  site: process.env.SITE_URL || 'https://autnic.com',
  base: BASE,
  trailingSlash: 'ignore',
  output: 'server',
  adapter: cloudflare({
    /* Les images sont fabriquées à la publication (scripts/media-build.mjs) et
       servies depuis R2 : le worker n'a aucun travail d'image à faire, donc
       aucun service d'image à embarquer. */
    imageService: 'passthrough',
    platformProxy: { enabled: true, configPath: 'wrangler.jsonc' },
  }),
  /* Aucune session : aucune page ne varie selon le lecteur, et c'est même ce
     qui les rend toutes partageables en cache (isCacheable, src/lib/cache.ts).
     Sans cette ligne l'adapter Cloudflare en suppose une et réclame une liaison
     KV « SESSION » — un espace resté vide depuis sa création, et un avertissement
     à chaque build invitant à le rebrancher. `memory` ne stocke rien au-delà de
     l'isolat : c'est la façon de dire « pas de session » que l'adapter lit. */
  session: { driver: 'memory' },
  integrations: [mdx()],
  /* Conservé pour scripts/content-to-d1.mjs, qui rend le Markdown avec la même
     chaîne : le HTML stocké dans D1 doit être celui que le site produisait. */
  markdown: { shikiConfig: { theme: 'github-dark' } },
  redirects,
  /* Le plan de site ne peut plus être énuméré au build — il n'y a plus de
     routes figées. Il est rendu depuis D1 : src/pages/sitemap.xml.ts */
});
