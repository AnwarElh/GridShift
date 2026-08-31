import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '../lib/articles';
import { site } from '../site';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: site.name,
    description: site.description,
    site: context.site ?? site.url,
    customData: '<language>fr-fr</language>',
    items: posts.slice(0, 50).map((p) => ({
      title: p.data.title,
      description: p.data.lede,
      pubDate: p.data.date,
      link: p.href,
      categories: [p.section.label, ...p.data.tags],
      author: p.author.data.name,
    })),
  });
}
