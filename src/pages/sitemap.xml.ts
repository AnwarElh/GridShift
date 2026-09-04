import type { APIRoute } from 'astro';
import { getContent } from '../lib/content.ts';
import { site } from '../site.ts';
import {
  articleHref, gameHref, sectionHref, pageHref, homeHref, authorHref,
  sectionKeys, type Locale,
} from '../i18n/config.ts';

/* Le plan de site, rendu depuis D1.
 *
 * L'intégration @astrojs/sitemap énumérait les routes au build. Il n'y a plus
 * de routes figées à énumérer : la liste des pages est la liste du contenu, et
 * la seule source qui la connaisse est la base.
 *
 * Les pages d'étiquette portent `noindex` : les annoncer ici reviendrait à
 * demander l'indexation de ce qu'on refuse d'indexer. Elles sont donc absentes,
 * exactement comme le filtre de l'ancienne intégration le prévoyait.
 */

export const prerender = false;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const GET: APIRoute = async ({ locals, site: astroSite }) => {
  const origin = (astroSite ?? new URL(site.url)).origin;
  const abs = (p: string) => `${origin}${p}`;

  const entries: { loc: string; lastmod?: Date; alt?: { lang: Locale; loc: string } }[] = [];
  const langs: Locale[] = ['en', 'fr'];

  for (const lang of langs) {
    const other: Locale = lang === 'en' ? 'fr' : 'en';
    const { posts, games, authors } = await getContent(locals, lang);

    entries.push({ loc: abs(homeHref(lang)), alt: { lang: other, loc: abs(homeHref(other)) } });
    for (const k of sectionKeys) entries.push({ loc: abs(sectionHref(lang, k)) });
    for (const p of ['games', 'about', 'credits', 'legal', 'privacy', 'cookies'] as const) {
      entries.push({ loc: abs(pageHref(lang, p)) });
    }
    for (const g of games) entries.push({ loc: abs(gameHref(lang, g.id)) });
    for (const a of authors) entries.push({ loc: abs(authorHref(lang, a.id)) });
    for (const p of posts) {
      entries.push({
        loc: abs(p.href),
        lastmod: p.data.updated ?? p.data.date,
        /* Le même nom de fichier dans l'autre langue est la traduction : c'est
           ce lien que hreflang doit annoncer. */
        alt: { lang: other, loc: abs(articleHref(other, p.section, p.slug)) },
      });
    }
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.w3.org/1999/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map((e) => `  <url>
    <loc>${esc(e.loc)}</loc>${e.lastmod ? `
    <lastmod>${e.lastmod.toISOString()}</lastmod>` : ''}${e.alt ? `
    <xhtml:link rel="alternate" hreflang="${e.alt.lang}" href="${esc(e.alt.loc)}"/>` : ''}
  </url>`).join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};
