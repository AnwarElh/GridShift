/* IndexNow : prévenir les moteurs plutôt que d'attendre leur passage.
 *
 * Un article publié aujourd'hui est lu aujourd'hui ou ne l'est pas. Le plan de
 * site dit qu'il existe, mais seulement à qui repasse ; ce protocole — Bing,
 * Yandex, Seznam, et par ricochet les moteurs qui s'y branchent — permet de
 * nommer les adresses qui viennent de changer, une fois, au moment où elles
 * changent.
 *
 * La clé n'est pas un secret : le protocole exige qu'elle soit lisible à
 * `https://<host>/<clé>.txt`, et c'est justement cette lisibilité qui prouve
 * qu'on a la main sur le domaine. Elle vit donc dans `public/`.
 */

export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

/** Le protocole refuse au-delà de dix mille adresses par envoi. */
export const MAX_URLS = 10_000;

export interface IndexNowOptions {
  /** Le domaine, sans protocole : « autnic.com ». */
  host: string;
  key: string;
  endpoint?: string;
  /** Injectable pour les tests ; le worker et node fournissent le vrai. */
  fetchImpl?: typeof fetch;
}

export interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

/* Toutes les adresses d'un envoi doivent appartenir au domaine déclaré : une
   seule intruse et le lot entier est rejeté, sans dire laquelle. On les écarte
   donc ici plutôt que de découvrir le refus côté moteur. */
export function indexNowPayload(urls: string[], { host, key }: IndexNowOptions): IndexNowPayload {
  const mine = urls.filter((u) => {
    try { return new URL(u).host === host; } catch { return false; }
  });
  return {
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList: [...new Set(mine)].slice(0, MAX_URLS),
  };
}

export interface IndexNowResult { submitted: number; status: number }

/** Envoie le lot. Rend `null` quand il n'y a rien à annoncer — un envoi vide
 *  n'est pas une erreur, c'est un déploiement qui n'a rien changé. */
export async function submitToIndexNow(
  urls: string[],
  options: IndexNowOptions,
): Promise<IndexNowResult | null> {
  const payload = indexNowPayload(urls, options);
  if (!payload.urlList.length) return null;

  const send = options.fetchImpl ?? fetch;
  const response = await send(options.endpoint ?? INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });

  return { submitted: payload.urlList.length, status: response.status };
}
