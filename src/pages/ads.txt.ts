import type { APIRoute } from 'astro';

/* Le registre des vendeurs autorisés à vendre l'inventaire du site.
 *
 * Google refuse de servir des annonces sur un domaine dont l'ads.txt ne le
 * nomme pas : ce fichier est la condition de la première ligne de revenu, pas
 * une formalité. Il suit donc la même variable que les emplacements eux-mêmes
 * (PUBLIC_ADSENSE_CLIENT) — un seul endroit à renseigner le jour de
 * l'activation, et aucun risque d'annoncer un éditeur qui ne diffuse pas.
 *
 * Sans la variable, le fichier existe mais ne déclare personne : c'est la
 * bonne réponse quand le site ne vend rien. Un identifiant inventé ferait
 * échouer la validation AdSense au lieu de rester silencieux.
 */

export const prerender = false;

const client = import.meta.env.PUBLIC_ADSENSE_CLIENT as string | undefined;

/* `pub-…` est l'identifiant tel qu'AdSense l'affiche ; ads.txt attend le
   numéro seul, sans le préfixe. */
const publisherId = client?.replace(/^ca-/, '');

export const GET: APIRoute = () =>
  new Response(
    publisherId
      ? `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`
      : '# Aucune régie active sur ce domaine.\n',
    {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'public, max-age=3600',
        'x-robots-tag': 'noindex',
      },
    },
  );
