import type { APIRoute } from 'astro';
import { getContent } from '../lib/content.ts';
import { site, siteCopy } from '../site.ts';
import { homeHref, sectionKeys, defaultLocale, otherLocales, pageHref, gameHref } from '../i18n/config.ts';
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

  const { posts, games } = await getContent(locals, lang);

  const lines = [
    `# ${site.name}`,
    '',
    `> ${siteCopy[lang].description}`,
    '',
  ];

  /* Ce que la maison affirme d'elle-même, en tête et en clair.
     Un moteur qui hésite entre trois sources sur un jeu retient celle dont il
     peut dire POURQUOI elle vaut d'être citée. « Nous achetons ce que nous
     testons » est cette raison ; elle vivait dans une page qu'il fallait aller
     chercher. */
  lines.push(
    '## About',
    '',
    `- ${site.name} buys the games it reviews. When a publisher supplies a copy, the review says so.`,
    '- Every review names the version it was tested on, and scores are revised when the game changes.',
    '- Every article carries a dated correction log. Published text is never edited silently.',
    `- Editorial charter, scoring method and transparency rules: ${abs(pageHref(lang, 'about'))}`,
    '',
  );

  /* Chaque article est aussi servi en Markdown à son adresse suivie de « .md ».
     Le dire une fois ici évite de le répéter sur chaque ligne. */
  lines.push(
    '## Reading these pages',
    '',
    'Every article below is also available as Markdown at its URL followed by `.md` —',
    `for example ${abs('/reviews/')}<slug>.md. That file carries the source text plus the`,
    'canonical URL, publication date, author, game and score.',
    '',
  );

  /* Les jeux avant les articles : ce sont les entités du site, et un moteur qui
     cherche « ce que dit Autnic de tel jeu » veut cette page-là, pas la
     vingtième actu qui la mentionne. */
  if (games.length) {
    lines.push('## Games covered', '');
    for (const g of games) {
      const facts = [
        g.data.studio,
        g.data.released,
        g.data.score !== undefined ? `our score ${g.data.score}/10` : undefined,
        g.data.version ? `tracked version ${g.data.version}` : undefined,
      ].filter(Boolean).join(' · ');
      lines.push(`- [${g.data.title}](${abs(gameHref(lang, g.id))}): ${facts}`);
    }
    lines.push('');
  }

  /* L'ordre des rubriques est celui du menu, pas celui de la base : ce qui
     ouvre le site ouvre ce fichier. */
  for (const key of sectionKeys) {
    const inSection = posts.filter((p) => p.section === key);
    if (!inSection.length) continue;
    lines.push(`## ${t(`section.${key}.title`)}`, '');
    for (const p of inSection) {
      /* La date et la note ne sont pas de la décoration : ce sont les deux
         faits qu'un moteur cite le plus souvent, et les lui faire déduire du
         chapô, c'est le laisser se tromper. */
      const stamp = [
        p.data.date.toISOString().slice(0, 10),
        p.data.score !== undefined ? `${p.data.score}/10` : undefined,
      ].filter(Boolean).join(', ');
      lines.push(`- [${p.data.title}](${abs(p.href)}) (${stamp}): ${p.data.lede}`);
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
