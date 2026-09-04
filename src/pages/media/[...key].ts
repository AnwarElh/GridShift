import type { APIRoute } from 'astro';

/* Les médias, servis depuis R2.
 *
 * En production on préfère un domaine relié au bucket : le fichier part alors
 * de R2 sans réveiller le worker. Cette route existe pour le développement, et
 * comme repli tant que le domaine n'est pas branché — d'où MEDIA_BASE_URL, qui
 * décide lequel des deux les pages écrivent dans leurs URL.
 *
 * Le nom d'un média porte son contenu : une variante nouvelle prend un nouveau
 * nom. Le cache navigateur peut donc être immuable et long, et c'est ce qui
 * rend l'egress nul en pratique — le fichier n'est demandé qu'une fois.
 */

const TYPES: Record<string, string> = {
  webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  png: 'image/png', avif: 'image/avif', svg: 'image/svg+xml',
  woff2: 'font/woff2',
};

export const prerender = false;

export const GET: APIRoute = async ({ params, locals, request }) => {
  const key = params.key;
  /* Une clé qui remonte l'arborescence n'a rien à faire ici. R2 est plat : un
     « .. » ne peut venir que d'une URL fabriquée à la main. */
  if (!key || key.includes('..')) return new Response('Not found', { status: 404 });

  const bucket = (locals as { runtime?: { env?: { MEDIA?: R2Bucket } } }).runtime?.env?.MEDIA;
  if (!bucket) return new Response('R2 non lié', { status: 500 });

  const object = await bucket.get(key);
  if (!object) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('content-type',
    object.httpMetadata?.contentType ?? TYPES[key.split('.').pop() ?? ''] ?? 'application/octet-stream');
  headers.set('cache-control', 'public, max-age=31536000, immutable');

  /* Le lecteur a déjà le fichier : on ne renvoie pas les octets. */
  if (request.headers.get('if-none-match') === object.httpEtag) {
    return new Response(null, { status: 304, headers });
  }
  return new Response(object.body, { headers });
};

/* Le binding R2, décrit ici plutôt qu'importé : deux méthodes suffisent. */
interface R2Bucket {
  get(key: string): Promise<{
    body: ReadableStream; httpEtag: string;
    httpMetadata?: { contentType?: string };
    writeHttpMetadata(headers: Headers): void;
  } | null>;
}
