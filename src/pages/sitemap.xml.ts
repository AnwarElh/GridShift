import type { APIRoute } from 'astro';
import { getContent } from '../lib/content.ts';
import { site } from '../site.ts';
import {
  articleHref, gameHref, sectionHref, pageHref, homeHref, authorHref,
  sectionKeys, locales, defaultLocale, type Locale,
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

  /* `alts` est une liste depuis qu'il y a trois langues : un seul `alt` ne
     déclarait qu'une traduction sur deux, et l'allemand — le dernier venu —
     aurait été celui qu'on tait. La liste vient de `locales`, donc une
     quatrième langue n'aura rien à changer ici.

     Elle inclut la page ELLE-MÊME, et `x-default`. Un ensemble hreflang doit
     être réflexif : chaque version déclare toutes les versions, la sienne
     comprise, sinon Google écarte l'ensemble au lieu d'en garder la moitié. Les
     balises du `<head>` le faisaient déjà correctement ; ce fichier, non — ce
     qui n'avait aucune conséquence tant que son espace de noms le rendait
     illisible, et en a une depuis qu'il ne l'est plus. */
  const entries: { loc: string; lastmod?: Date; alts?: { lang: Locale | 'x-default'; loc: string }[]; images?: string[] }[] = [];

  /* L'image qui ouvre la page, déclarée à Google Images. Le site est fait
     d'images : les laisser découvrir au hasard du rendu, c'était laisser la
     moitié du contenu hors de l'index. L'original, pas une variante : c'est
     l'image que la page désigne, et la seule adresse qui ne dépend pas d'une
     échelle. */
  const img = (m?: { src: string }) => (m ? [new URL(m.src, origin).href] : []);

  /* La date la plus récente d'une liste d'articles : c'est ce qui date une page
     de rubrique, de jeu ou d'auteur, dont le contenu EST cette liste. Inventer
     une date pour les pages qui n'en ont pas — mentions légales, cookies —
     serait pire que de n'en donner aucune : Google cesse de lire `lastmod` dès
     qu'il le prend en défaut, et il le prend en défaut sur tout le fichier. */
  const latest = (list: { data: { updated?: Date; date: Date } }[]): Date | undefined =>
    list.reduce<Date | undefined>((max, p) => {
      const d = p.data.updated ?? p.data.date;
      return !max || d > max ? d : max;
    }, undefined);

  for (const lang of locales) {
    const { posts, games, authors } = await getContent(locals, lang);
    /* Toutes les langues, celle-ci comprise, plus x-default sur la langue par
       défaut : c'est la même liste pour chaque page d'un même ensemble. */
    const altsFor = (href: (l: Locale) => string) => [
      ...locales.map((l) => ({ lang: l as Locale | 'x-default', loc: abs(href(l)) })),
      { lang: 'x-default' as const, loc: abs(href(defaultLocale)) },
    ];

    entries.push({
      loc: abs(homeHref(lang)),
      lastmod: latest(posts),
      alts: altsFor(homeHref),
    });
    for (const k of sectionKeys) {
      entries.push({
        loc: abs(sectionHref(lang, k)),
        lastmod: latest(posts.filter((p) => p.section === k)),
        alts: altsFor((l) => sectionHref(l, k)),
      });
    }
    for (const p of ['games', 'about', 'credits', 'legal', 'privacy', 'cookies'] as const) {
      entries.push({
        loc: abs(pageHref(lang, p)),
        /* « Tous les jeux » liste les jeux et bouge avec eux ; les pages
           légales ne bougent qu'à la main, et se taisent donc. */
        lastmod: p === 'games' ? latest(posts) : undefined,
        alts: altsFor((l) => pageHref(l, p)),
      });
    }
    for (const g of games) {
      entries.push({
        loc: abs(gameHref(lang, g.id)),
        lastmod: latest(posts.filter((p) => p.game?.id === g.id)),
        alts: altsFor((l) => gameHref(l, g.id)),
        images: img(g.data.cover),
      });
    }
    for (const a of authors) {
      entries.push({
        loc: abs(authorHref(lang, a.id)),
        lastmod: latest(posts.filter((p) => p.author.id === a.id)),
        alts: altsFor((l) => authorHref(l, a.id)),
      });
    }
    for (const p of posts) {
      entries.push({
        loc: abs(p.href),
        lastmod: p.data.updated ?? p.data.date,
        /* Le même nom de fichier dans les autres langues est la traduction :
           c'est ce lien que hreflang doit annoncer. L'export refuse un article
           qui manque dans une langue, donc l'adresse existe toujours. */
        alts: altsFor((l) => articleHref(l, p.section, p.slug)),
        /* la même que l'ouverture de l'article (`artImg` dans Article.astro) */
        images: img(p.data.cover ?? p.game?.data.hero),
      });
    }
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.map((e) => `  <url>
    <loc>${esc(e.loc)}</loc>${e.lastmod ? `
    <lastmod>${e.lastmod.toISOString()}</lastmod>` : ''}${e.alts?.length ? `
${e.alts.map((a) => `    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${esc(a.loc)}"/>`).join('\n')}` : ''}${e.images?.length ? `
${e.images.map((src) => `    <image:image><image:loc>${esc(src)}</image:loc></image:image>`).join('\n')}` : ''}
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
