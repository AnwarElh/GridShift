import type { Post } from './content.ts';
import { getPosts, type LocalsLike } from './content.ts';
import { site } from '../site.ts';
import { sectionFromSlug, articleHref, type Locale } from '../i18n/config.ts';

/* L'ARTICLE EN MARKDOWN, à l'adresse de l'article suivie de « .md ».
 *
 * Un moteur génératif ne lit pas une page, il la démonte : il jette la barre,
 * le pied, la réclame, les cartes de côté, et garde le texte. Ce démontage est
 * approximatif — il perd des titres, colle des légendes au corps, prend une
 * carte « À lire aussi » pour un paragraphe — et il coûte des jetons que le
 * modèle ne dépense pas à comprendre l'article.
 *
 * Or la source Markdown est déjà en base : `post.body`, telle qu'elle a été
 * écrite. La servir ne demande aucune fabrication et donne au moteur exactement
 * ce que son démontage cherchait à retrouver. L'en-tête porte en plus ce que le
 * corps ne dit pas — adresse canonique, date, signature, note — pour qu'un
 * passage cité reste attribuable une fois détaché de sa page.
 *
 * L'adresse est celle de l'article plus « .md » : elle se devine depuis un lien
 * ordinaire, ce qu'aucune convention séparée ne permet. Elle porte `noindex` et
 * un canonical d'en-tête — c'est le même texte, et deux adresses pour un texte
 * sont exactement ce que le canonical existe pour empêcher.
 *
 * Une fonction et trois routes minces plutôt qu'une route attrape-tout : Astro
 * classe `fr/[section]/[slug]` avant `[...chemin].md`, si bien qu'une seule
 * route ne servait que l'anglais et laissait les deux autres langues tomber sur
 * leur 404. Trois routes symétriques ne dépendent d'aucune règle de préséance.
 */

const line = (d: Date) => d.toISOString().slice(0, 10);

export const articleMarkdown = (post: Post, lang: Locale, origin: string): string => {
  const { data } = post;
  const canonical = `${origin}${articleHref(lang, post.section, post.slug)}`;
  return [
    `# ${data.title}`,
    '',
    `> ${data.lede}`,
    '',
    `- **Source:** ${canonical}`,
    `- **Published:** ${line(data.date)}`,
    ...(data.updated ? [`- **Updated:** ${line(data.updated)}`] : []),
    /* Les étiquettes restent en anglais dans les trois langues : ce sont des
       noms de champs pour une machine, pas de la prose. La signature, elle,
       passe en parenthèses — « Rédacteur en chef at Autnic » était une phrase
       à moitié traduite, ce qui n'est bon pour aucun des deux lecteurs. */
    `- **Author:** ${post.author.data.name} (${post.author.data.role}, ${site.name})`,
    ...(post.game ? [`- **Game:** ${post.game.data.title} (${post.game.data.studio})`] : []),
    ...(data.score !== undefined ? [`- **Score:** ${data.score}/10`] : []),
    ...(data.testedOn ? [`- **Tested on version:** ${data.testedOn}`] : []),
    ...(data.verdict ? ['', `**Verdict.** ${data.verdict}`] : []),
    '',
    '---',
    '',
    post.body.trim(),
    '',
  ].join('\n');
};

/** La réponse complète, ou un 404 en texte brut — pas la page 404 du site :
 *  qui demande du Markdown ne saurait pas quoi faire de cent cinquante kilos
 *  de HTML. */
export async function markdownResponse(
  locals: LocalsLike, lang: Locale, sectionSlug: string, slug: string, origin: string,
): Promise<Response> {
  const section = sectionFromSlug(lang, sectionSlug);
  const post = section
    ? (await getPosts(locals, lang)).find((p) => p.slug === slug && p.section === section)
    : undefined;

  if (!post) {
    return new Response('Not found\n', {
      status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  return new Response(articleMarkdown(post, lang, origin), {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'cache-control': 'public, max-age=3600',
      'x-robots-tag': 'noindex',
      link: `<${origin}${articleHref(lang, post.section, post.slug)}>; rel="canonical"`,
    },
  });
}
