import type { MiddlewareHandler } from 'astro';
import { read, write, isCacheable, cacheControl } from './lib/cache.ts';

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
/* Les en-têtes de sécurité, posés par le worker.
 *
 * Cloudflare peut les poser en Transform Rule côté tableau de bord ; ils sont
 * ici parce qu'une règle du tableau de bord ne se relit pas dans le dépôt et
 * ne suit pas le site en aperçu local. Une réponse mise en cache les emporte
 * avec elle — d'où leur pose avant le cache, et non après.
 *
 * ponytail: CSP à 'unsafe-inline' pour les scripts. Trois scripts en ligne
 * l'imposent aujourd'hui (le thème avant peinture, le JSON-LD, le push
 * AdSense) ; les passer au nonce demande de le faire descendre de Base.astro
 * jusqu'à chaque `is:inline`. À faire le jour où la publicité sera réellement
 * active, c'est-à-dire quand une injection vaudra quelque chose.
 */
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  /* Les régies servent leurs scripts, leurs images et leurs iframes depuis
     leurs propres domaines : une CSP qui les oublie coupe la publicité au lieu
     de la protéger. */
  "script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
  /* Les styles en ligne sont partout dans les gabarits (attributs `style`) :
     les interdire casserait la mise en page, pas une attaque. */
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self' https://pagead2.googlesyndication.com",
  "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
  'upgrade-insecure-requests',
].join('; ');

const SECURITY: Record<string, string> = {
  'content-security-policy': CSP,
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  /* `frame-ancestors` fait déjà le travail pour les navigateurs récents ;
     celui-ci reste pour les autres. */
  'x-frame-options': 'DENY',
  /* Six mois, sous-domaines compris. Pas de `preload` : l'inscription à la
     liste est difficile à défaire, et media.autnic.com n'est pas encore né. */
  'strict-transport-security': 'max-age=15552000; includeSubDomains',
  'permissions-policy': 'geolocation=(), microphone=(), camera=(), browsing-topics=()',
};

/* Une réponse d'ASSETS arrive avec des en-têtes immuables : on ne peut pas
   écrire dedans, seulement en reconstruire une. Le corps est repris tel quel —
   `body` vaut null sur un 204 ou un 304, ce que le constructeur exige. */
const harden = (response: Response): Response => {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(SECURITY)) if (!headers.has(k)) headers.set(k, v);
  return new Response(response.body, {
    status: response.status, statusText: response.statusText, headers,
  });
};

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { request, locals } = context;
  const env = (locals as { runtime?: { env?: Record<string, unknown> } }).runtime?.env ?? {};
  const url = new URL(request.url);

  /* Les médias portent un nom qui dépend de leur contenu : R2 les sert avec un
     cache d'un an, et les repasser par KV ne ferait que payer deux fois. */
  if (url.pathname.includes('/media/') || !isCacheable(request)) return harden(await next());

  const hit = await read(request, env as never);
  if (hit) {
    const headers = new Headers(hit.response.headers);
    headers.set('x-autnic-cache', hit.from);
    /* Le colo rend la copie avec le max-age=14400 que Cloudflare y a ajouté :
       on repose le nôtre, pour que le navigateur redemande la page. */
    headers.set('cache-control', cacheControl(env as never));
    /* Le statut reste celui du cache : le Cache API du colo honore
       If-Modified-Since et rend un 304 sans corps au rechargement. Le forcer
       en 200 servait une page vide, qui remplaçait la bonne dans le navigateur. */
    return harden(new Response(hit.response.body, { status: hit.response.status, headers }));
  }

  /* Durci avant le cache, pas après : c'est cette réponse-là qui est stockée,
     donc la copie servie demain porte les mêmes en-têtes que celle d'aujourd'hui. */
  const response = harden(await next());
  /* `waitUntil` renvoie l'écriture après l'envoi : le lecteur qui essuie le
     défaut de cache ne paie pas en plus le remplissage. */
  const ctx = (locals as { runtime?: { ctx?: { waitUntil(p: Promise<unknown>): void } } }).runtime?.ctx;
  return write(request, response, env as never, (p) => ctx?.waitUntil(p) ?? void p);
};
