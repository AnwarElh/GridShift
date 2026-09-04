import type { APIRoute } from 'astro';
import { site } from '../site';

/* Le plan de site vit sous la base de déploiement, pas à la racine du domaine. */
const base = (import.meta.env.BASE_URL ?? '/').replace(/\/+$/, '');

export const GET: APIRoute = () =>
  new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${site.url}${base}/sitemap.xml\n`,
    { headers: { 'content-type': 'text/plain; charset=utf-8' } },
  );
