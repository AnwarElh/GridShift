import type { MiddlewareHandler } from 'astro';
import { read, write, isCacheable } from './lib/cache.ts';

/* Le cache, posé devant chaque page.
 *
 * Une page vient de D1 : six requêtes, un rendu, quelques millisecondes. Ce
 * n'est pas lent, mais c'est du travail refait pour chaque lecteur alors que
 * la réponse est la même pour tous. Le cache le fait une fois par heure et par
 * point de présence — c'est ce qui met une page de base de données au niveau
 * d'un fichier statique.
 *
 * Ce qui n'est jamais mis en cache :
 *   — autre chose qu'un GET, ou une requête portant une identité (cache.ts) ;
 *   — une réponse qui n'est pas 200 : garder un 500 une heure transformerait
 *     une panne d'une seconde en panne d'une heure ;
 *   — /media/, déjà immuable et servi par R2 avec son propre en-tête.
 */
export const onRequest: MiddlewareHandler = async (context, next) => {
  const { request, locals } = context;
  const env = (locals as { runtime?: { env?: Record<string, unknown> } }).runtime?.env ?? {};
  const url = new URL(request.url);

  /* Les médias portent un nom qui dépend de leur contenu : R2 les sert avec un
     cache d'un an, et les repasser par KV ne ferait que payer deux fois. */
  if (url.pathname.includes('/media/') || !isCacheable(request)) return next();

  const hit = await read(request, env as never);
  if (hit) {
    const headers = new Headers(hit.response.headers);
    headers.set('x-gridshift-cache', hit.from);
    return new Response(hit.response.body, { status: 200, headers });
  }

  const response = await next();
  /* `waitUntil` renvoie l'écriture après l'envoi : le lecteur qui essuie le
     défaut de cache ne paie pas en plus le remplissage. */
  const ctx = (locals as { runtime?: { ctx?: { waitUntil(p: Promise<unknown>): void } } }).runtime?.ctx;
  return write(request, response, env as never, (p) => ctx?.waitUntil(p) ?? void p);
};
