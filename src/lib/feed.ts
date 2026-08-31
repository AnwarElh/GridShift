import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from './articles';
import { site, siteCopy } from '../site';
import { type Locale, htmlLang } from '../i18n/config';
import { useT } from '../i18n/ui';

/* Un flux par langue : un lecteur RSS francophone n'a rien à faire d'un
   article anglais, et `<language>` doit dire la vérité. */
export async function feed(context: APIContext, lang: Locale) {
  const posts = await getPosts(lang);
  const t = useT(lang);
  const label = { news: t('nav.news'), review: t('nav.reviews'), guide: t('nav.guides'), setup: t('nav.setup') };
  return rss({
    title: `${site.name} — ${siteCopy[lang].tagline}`,
    description: siteCopy[lang].description,
    site: context.site ?? site.url,
    customData: `<language>${htmlLang[lang]}</language>`,
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
