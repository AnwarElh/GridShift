/* La façade de contenu : ce que les pages appellent.
 *
 * Elle rend les mêmes formes que lib/articles.ts rendait depuis les collections
 * Astro — c'est ce qui permet aux gabarits de ne presque pas changer. Ce qui
 * change est la provenance : D1, lu par le worker, au lieu de fichiers lus au
 * build.
 *
 * Une lecture par requête, pas par appel. Une page d'accueil demande les
 * articles, les jeux et les auteurs à trois endroits différents ; sans mémoire,
 * ce serait trois fois les mêmes requêtes D1. La mémoire est portée par
 * `locals`, donc elle vit le temps d'une requête et pas une seconde de plus :
 * un cache au niveau du module survivrait à l'isolat et servirait, après une
 * publication, un contenu périmé à qui tombe sur cette machine.
 */
import { load, type Loaded, type Post, type Game, type Author, type Media, type Variant, type Credit, type D1Like } from './db.ts';
import { type Locale, type SectionKey, defaultLocale } from '../i18n/config.ts';

export type { Post, Game, Author, Loaded, Media, Variant, Credit };

/* Ce que l'adaptateur Cloudflare pose sur `locals`. On le décrit ici plutôt que
   d'importer les types du worker : trois champs suffisent. */
interface Runtime {
  env?: { DB?: D1Like; MEDIA_BASE_URL?: string };
}
export interface LocalsLike {
  runtime?: Runtime;
  /* la mémoire de requête, posée par ce module */
  __content?: Map<Locale, Promise<Loaded>>;
}

export class MissingDatabase extends Error {
  constructor() {
    /* Un message qui dit quoi faire. Sans liaison D1, tout le site est vide, et
       « cannot read property prepare of undefined » n'aide personne. */
    super(
      'Liaison D1 « DB » absente. En développement : `npx wrangler dev` (ou `astro dev` ' +
      'avec la plateforme Cloudflare activée). La base se prépare avec `npm run cf:setup`.',
    );
    this.name = 'MissingDatabase';
  }
}

/** Le contenu d'une langue, lu une fois par requête. */
export function getContent(locals: LocalsLike, lang: Locale = defaultLocale): Promise<Loaded> {
  const db = locals.runtime?.env?.DB;
  if (!db) throw new MissingDatabase();

  const memo = (locals.__content ??= new Map());
  const hit = memo.get(lang);
  if (hit) return hit;

  const p = load(db, lang, locals.runtime?.env?.MEDIA_BASE_URL ?? '/media');
  memo.set(lang, p);
  return p;
}

export const getPosts = async (locals: LocalsLike, lang: Locale = defaultLocale): Promise<Post[]> =>
  (await getContent(locals, lang)).posts;

export const getGames = async (locals: LocalsLike, lang: Locale = defaultLocale): Promise<Game[]> =>
  (await getContent(locals, lang)).games;

export const getAuthors = async (locals: LocalsLike, lang: Locale = defaultLocale): Promise<Author[]> =>
  (await getContent(locals, lang)).authors;

export const getPost = async (locals: LocalsLike, lang: Locale, section: SectionKey, slug: string) =>
  (await getPosts(locals, lang)).find((p) => p.slug === slug && p.section === section);

export const getGame = async (locals: LocalsLike, lang: Locale, id: string) =>
  (await getGames(locals, lang)).find((g) => g.id === id);

export const getAuthor = async (locals: LocalsLike, lang: Locale, id: string) =>
  (await getAuthors(locals, lang)).find((a) => a.id === id);

/* ── les mêmes utilitaires qu'avant ─────────────────────────────────────────
   Ils ne touchent pas au stockage : ils trient une liste déjà en mémoire. On
   les reprend tels quels plutôt que de les réécrire, et lib/articles.ts les
   exporte encore pour le code qui n'a pas encore basculé. */
export {
  byType, byGame, spreadByGame, related, allTags, slugifyTag, pageOf, pageHref,
  type Paged,
} from './select.ts';
