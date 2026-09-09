import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from './content.ts';
import { site, siteCopy } from '../site';
import { type Locale, htmlLang, feedHref } from '../i18n/config';
import { useT } from '../i18n/ui';

/* Un flux par langue : un lecteur RSS francophone n'a rien à faire d'un
   article anglais, et `<language>` doit dire la vérité. */
export async function feed(context: APIContext, lang: Locale) {
  const posts = await getPosts(context.locals, lang);
  const t = useT(lang);
  const label = { news: t('nav.news'), review: t('nav.reviews'), guide: t('nav.guides'), setup: t('nav.setup') };
  const origin = (context.site ?? new URL(site.url)).origin;
  const self = `${origin}${feedHref(lang)}`;
  return rss({
    title: `${site.name} — ${siteCopy[lang].tagline}`,
    description: siteCopy[lang].description,
    site: context.site ?? site.url,
    /* `atom:link rel="self"` : l'adresse du flux, DANS le flux. Sans elle, un
       agrégateur qui reçoit le fichier par un autre chemin — un proxy, un
       cache, un partage — ne sait pas d'où le rafraîchir. C'est la seule
       recommandation que le validateur RSS émet sur un flux par ailleurs
       valide. `lastBuildDate` évite de retélécharger cinquante entrées pour
       découvrir qu'aucune n'a bougé. */
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: [
      `<language>${htmlLang[lang]}</language>`,
      `<atom:link href="${self}" rel="self" type="application/rss+xml"/>`,
      ...(posts.length ? [`<lastBuildDate>${posts[0].data.date.toUTCString()}</lastBuildDate>`] : []),
    ].join(''),
    items: posts.slice(0, 50).map((p) => ({
      title: p.data.title,
      description: p.data.lede,
      pubDate: p.data.date,
      link: p.href,
      categories: [label[p.section], ...p.data.tags],
      author: p.author.data.name,
    })),
  });
}
