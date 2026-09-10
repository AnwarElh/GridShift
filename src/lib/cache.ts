/* Le cache : servir une page de base de données aussi vite que du statique.
 *
 * Deux étages, dans cet ordre :
 *
 *   1. le Cache API du colo — gratuit, local au point de présence, très rapide.
 *      C'est lui qui répond à la deuxième visite depuis la même ville.
 *   2. KV — répliqué mondialement. Il rattrape le colo qui n'a pas encore vu la
 *      page, et survit à l'éviction du cache local.
 *
 * Une page ratée dans les deux étages est rendue depuis D1, puis écrite dans
 * les deux. `waitUntil` fait l'écriture après l'envoi de la réponse : le
 * lecteur n'attend jamais que le cache se remplisse.
 *
 * Ce qui n'est jamais mis en cache : tout ce qui n'est pas un GET, et toute
 * réponse qui n'est pas un 200. Mettre une erreur en cache pour une heure
 * transforme un incident d'une seconde en incident d'une heure.
 */

/* Les formes minimales des globales du worker. On ne tire pas
   @cloudflare/workers-types pour deux méthodes : le module reste lisible hors
   du worker, et testable avec un faux KV de dix lignes.

   `delete` et `list` vivaient ici pour une purge ciblée qui n'a jamais eu
   d'appelant — et qui n'aurait pas tenu sa promesse : le Cache API du colo ne
   s'efface que dans le point de présence qui exécute le worker, jamais dans
   les trois cents autres. Ce qui invalide vraiment partout, c'est BUILD_ID
   dans la clé : un déploiement suffit. */
export interface KVLike {
  getWithMetadata<M>(key: string, opts: { type: 'arrayBuffer' }):
    Promise<{ value: ArrayBuffer | null; metadata: M | null } | null>;
  put(key: string, value: ArrayBuffer,
      opts?: { expirationTtl?: number; metadata?: unknown }): Promise<void>;
}

/** Le Cache API du colo. `caches.default` est propre aux Workers : il n'est pas
 *  dans la lib DOM, d'où cet accès typé plutôt qu'un `as any` disséminé.
 *  Absent hors worker (`astro dev`, tests node) : on rend `undefined` et
 *  l'étage colo est simplement sauté, au lieu d'un 500 sur chaque page. */
const coloCache = (): Pick<Cache, 'match' | 'put'> | undefined =>
  (globalThis as unknown as { caches?: { default: Pick<Cache, 'match' | 'put'> } })
    .caches?.default;

export interface CacheEnv {
  CACHE?: KVLike;
  CACHE_TTL?: string;
}

/** KV n'accepte pas moins de 60 s ; en dessous, l'écriture est refusée. */
const MIN_TTL = 60;

export const ttlFrom = (env: CacheEnv, fallback = 3600) => {
  const n = Number(env.CACHE_TTL);
  return Number.isFinite(n) && n >= MIN_TTL ? n : fallback;
};

/* L'identifiant du build courant, injecté par Vite (voir astro.config.mjs).
   Hors bundle — les tests sous node — il n'existe pas : la valeur de repli
   suffit, aucun cache n'est partagé dans ce contexte. */
const BUILD: string =
  (import.meta as { env?: { BUILD_ID?: string } }).env?.BUILD_ID ?? 'dev';

/* La clé : build + méthode + origine + chemin + requête triée. Sans le tri,
   ?a=1&b=2 et ?b=2&a=1 occupent deux entrées pour la même page. Le fragment est
   ignoré — il n'atteint jamais le serveur. Le build en tête est ce qui fait
   qu'un déploiement invalide tout, sans purge à lancer et sans attendre le TTL. */
export function cacheKey(request: Request): string {
  const url = new URL(request.url);
  url.searchParams.sort();
  url.hash = '';
  return `${BUILD}:${request.method}:${url.origin}${url.pathname}${url.search}`;
}

/** Vrai si la requête peut, en principe, être servie depuis le cache. */
export const isCacheable = (request: Request): boolean =>
  request.method === 'GET' &&
  /* Une réponse variant selon le lecteur ne doit pas être partagée. Le site
     n'a pas de session aujourd'hui ; le jour où il en aura une, cette ligne
     évite de servir la page d'un lecteur à un autre. */
  !request.headers.has('authorization') &&
  !request.headers.has('cookie');

/* Le Cache API du colo est indexé par la Requête, pas par une chaîne : le
   `BUILD` de cacheKey ne l'atteint donc pas. On lui présente une requête dont
   l'URL porte la version — même page, adresse de cache différente à chaque
   déploiement. Sans cela, seul KV se renouvelait et le colo continuait de
   servir la page d'avant jusqu'à expiration. */
const coloRequest = (request: Request): Request => {
  const url = new URL(request.url);
  url.searchParams.set('__v', BUILD);
  return new Request(url, request);
};

export interface Hit { response: Response; from: 'colo' | 'kv' }

export async function read(request: Request, env: CacheEnv): Promise<Hit | undefined> {
  if (!isCacheable(request)) return undefined;

  const colo = await coloCache()?.match(coloRequest(request));
  if (colo) return { response: colo, from: 'colo' };

  if (!env.CACHE) return undefined;
  const stored = await env.CACHE.getWithMetadata<{ headers: [string, string][] }>(
    cacheKey(request), { type: 'arrayBuffer' },
  );
  if (!stored?.value) return undefined;

  const headers = new Headers(stored.metadata?.headers ?? []);
  headers.set('x-autnic-cache', 'kv');
  return { response: new Response(stored.value, { status: 200, headers }), from: 'kv' };
}

/** Écrit dans les deux étages. Rend la réponse à servir au lecteur. */
export async function write(
  request: Request,
  response: Response,
  env: CacheEnv,
  waitUntil: (p: Promise<unknown>) => void,
): Promise<Response> {
  if (!isCacheable(request) || response.status !== 200) return response;

  const ttl = ttlFrom(env);
  const headers = new Headers(response.headers);
  /* `s-maxage` pilote les caches partagés ; `stale-while-revalidate` autorise
     à servir la version périmée pendant qu'on en refait une — c'est ce qui
     évite qu'une purge fasse retomber tout le monde sur D1 en même temps. */
  headers.set('cache-control', `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 4}`);
  headers.set('x-autnic-cache', 'miss');

  const body = await response.clone().arrayBuffer();
  const toStore = new Response(body, { status: 200, headers });

  const colo = coloCache();
  if (colo) waitUntil(colo.put(coloRequest(request), toStore.clone()));
  if (env.CACHE) {
    waitUntil(env.CACHE.put(cacheKey(request), body, {
      expirationTtl: ttl,
      metadata: { headers: [...headers.entries()] },
    }));
  }
  return new Response(body, { status: 200, headers });
}
