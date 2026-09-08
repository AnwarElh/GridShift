import type { APIRoute } from 'astro';
import { site } from '../site';

/* Le plan de site vit sous la base de déploiement, pas à la racine du domaine. */
const base = (import.meta.env.BASE_URL ?? '/').replace(/\/+$/, '');

/* Les moteurs génératifs sont nommés un par un, et autorisés.
   Le défaut d'un robot d'IA n'est pas celui d'un moteur de recherche : plusieurs
   ne suivent la règle `*` que faute de trouver leur nom. Les nommer, c'est
   choisir explicitement d'être cité plutôt que d'espérer l'être. Le jour où
   l'un d'eux doit sortir, il sort d'ici — pas d'une règle attrape-tout. */
const aiAgents = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web',
  'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'CCBot'];

export const GET: APIRoute = () =>
  new Response(
    [
      'User-agent: *',
      'Allow: /',
      '',
      ...aiAgents.flatMap((a) => [`User-agent: ${a}`, 'Allow: /', '']),
      `Sitemap: ${site.url}${base}/sitemap.xml`,
      /* Le plan Markdown, à côté du plan XML : un robot qui lit l'un trouve
         l'autre sans avoir à deviner son adresse. */
      `LLM-Content: ${site.url}${base}/llms.txt`,
      '',
    ].join('\n'),
    { headers: { 'content-type': 'text/plain; charset=utf-8' } },
  );
