import type { APIRoute } from 'astro';
import { getContent } from '../lib/content.ts';
import { site, siteCopy } from '../site.ts';
import { homeHref, sectionKeys, defaultLocale, otherLocales } from '../i18n/config.ts';
import { useT } from '../i18n/ui.ts';

/* Le plan du site pour les moteurs génératifs.
 *
 * Un moteur qui cite une page l'a d'abord trouvée : le plan de site le lui dit
 * en XML, ce fichier le lui dit en Markdown, avec le titre et le chapô de
 * chaque article. La différence tient à ce qu'un modèle sait faire d'une liste
 * de titres qu'il ne sait pas faire d'une liste d'URL.
 *
 * Une seule langue, l'anglaise : les traductions disent la même chose, et les
 * répéter trois fois n'apprendrait rien de plus à qui lit ce fichier. Les deux
 * autres racines sont annoncées à la fin, à charge au moteur de les suivre.
 */

export const prerender = false;

export const GET: APIRoute = async ({ locals, site: astroSite }) => {
  const origin = (astroSite ?? new URL(site.url)).origin;
  const abs = (p: string) => `${origin}${p}`;
  const lang = defaultLocale;
  const t = useT(lang);

  const { posts } = await getContent(locals, lang);

  const lines = [
    `# ${site.name}`,
    '',
    `> ${siteCopy[lang].description}`,
    '',
  ];

  /* L'ordre des rubriques est celui du menu, pas celui de la base : ce qui
     ouvre le site ouvre ce fichier. */
  for (const key of sectionKeys) {
    const inSection = posts.filter((p) => p.section === key);
    if (!inSection.length) continue;
    lines.push(`## ${t(`section.${key}.title`)}`, '');
    for (const p of inSection) {
      lines.push(`- [${p.data.title}](${abs(p.href)}): ${p.data.lede}`);
    }
    lines.push('');
  }

  lines.push(
    '## Other languages',
    '',
    ...otherLocales(lang).map((o) => `- [${siteCopy[o].tagline}](${abs(homeHref(o))})`),
    '',
    `Sitemap: ${abs('/sitemap.xml')}`,
    '',
  );

  return new Response(lines.join('\n'), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
      /* Utilitaire, pas une page : on veut qu'il soit lu, pas indexé. */
      'x-robots-tag': 'noindex',
    },
  });
};
