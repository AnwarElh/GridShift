/* Accès au contenu, version D1.
 *
 * Ce module rend exactement les mêmes formes que lib/articles.ts — `Post`,
 * `Game`, `Author`, avec les mêmes noms de champs. C'est délibéré : la bascule
 * de la collection Astro vers D1 doit être un changement d'import, pas une
 * réécriture des gabarits. Tant que les deux coexistent, on peut comparer les
 * sorties l'une à l'autre.
 *
 * Une requête par page, pas une par carte. D1 facture et surtout *attend* à
 * chaque aller-retour ; une page d'accueil qui ferait une requête par vignette
 * passerait son temps à attendre. On charge donc la langue entière d'un coup et
 * on trie en mémoire — une vingtaine d'articles par langue, quelques dizaines de Ko.
 */
import type { Locale, SectionKey } from '../i18n/config.ts';
import { articleHref, locales } from '../i18n/config.ts';
import { readingTime } from './format.ts';

/* ── formes rendues ─────────────────────────────────────────────────────── */

export interface Credit {
  artist: string; licence: string; licenceUrl: string; source: string; file: string;
}

/** Un média R2. `width`/`height` sont obligatoires : sans eux la page réserve
 *  mal la place et le contenu saute au chargement. */
export interface Variant { width: number; height: number; format: string; src: string }

export interface Media {
  key: string; width: number; height: number; bytes: number;
  contentType: string; credit: Credit;
  /** L'URL publique de l'original, préfixée par MEDIA_BASE_URL. */
  src: string;
  /** L'échelle responsive, du plus petit au plus grand. Vide = pas de srcset,
   *  et le navigateur télécharge l'original — à éviter. */
  variants: Variant[];
}

/* Les variantes webp qu'un emplacement demande.
 *
 * `widths` décrit un intervalle, pas une liste de fichiers : l'échelle d'une
 * image dépend de son original, et une largeur demandée peut ne pas y figurer.
 * Le filtre exact d'avant jetait en silence toute largeur absente — le héros
 * d'article demandait 900, qui n'existe pas, ne gardait que 1440 et 1920, et un
 * téléphone chargeait 307 Ko là où 77 suffisaient.
 *
 * On garde donc tout ce qui couvre l'intervalle : de la plus grande variante
 * sous la plus petite largeur demandée à la plus petite au-dessus de la plus
 * grande. Le navigateur choisit dedans. Jamais vide tant que l'échelle ne l'est
 * pas : servir l'original de 1920px dans une vignette est la régression que
 * tout ce dispositif existe pour empêcher. */
export function pickVariants(variants: Variant[], widths?: number[]): Variant[] {
  const asc = variants.filter((v) => v.format === 'webp').sort((a, b) => a.width - b.width);
  if (!widths?.length || !asc.length) return asc;
  const lo = asc.findLast((v) => v.width <= Math.min(...widths))?.width ?? asc[0].width;
  const hi = asc.find((v) => v.width >= Math.max(...widths))?.width ?? asc[asc.length - 1].width;
  return asc.filter((v) => v.width >= lo && v.width <= hi);
}

export interface AuthorData {
  name: string; initials: string; since?: string;
  role: string; bio: string; creds: string[];
}
export interface Author { id: string; data: AuthorData; body: string }

export interface GameData {
  title: string; studio: string; released: string;
  releaseDate?: Date; score?: number; userScore?: number; userVotes?: number;
  followers?: number; completion?: number; version?: string;
  cover?: Media; hero?: Media;
  platforms: { name: string; best: boolean; unavailable: boolean }[];
  offers: { shop: string; price: string; url: string; tone: string }[];
  pricesCheckedOn?: Date;
  genre: string; facts: { label: string; value: string }[]; summary: string;
}
export interface Game { id: string; data: GameData; body: string }

export interface ArticleData {
  type: SectionKey; lang: Locale; title: string; seoTitle?: string; lede: string;
  date: Date; updated?: Date; kicker?: string; tags: string[];
  cover?: Media; coverCaption?: string; readingMinutes?: number;
  testedOn?: string; stale: boolean; live: boolean; featured: boolean; draft: boolean;
  score?: number; verdict?: string; pros: string[]; cons: string[];
  playtime?: string; reviewNotes: string[]; scoreRevision?: string;
  level?: string; steps: string[];
  method?: string; sources?: string; corrections: { date: string; text: string }[];
}
export interface Post {
  data: ArticleData; id: string; slug: string; lang: Locale;
  href: string; section: SectionKey;
  author: Author; game?: Game; minutes: number;
  /** Le corps en Markdown, tel qu'il a été écrit — la source de vérité. */
  body: string;
  /** Le même corps, rendu à la publication. C'est lui que la page affiche :
   *  le worker ne fait pas tourner remark à chaque visite. */
  body_html: string;
}

/* ── plomberie ──────────────────────────────────────────────────────────── */

/** La forme minimale d'un binding D1 : on n'importe pas @cloudflare/workers-types
 *  pour trois méthodes, et ça garde le module testable hors du worker. */
export interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
    };
    all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  };
}

const parse = <T>(raw: unknown, fallback: T): T => {
  if (typeof raw !== 'string' || raw === '') return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
};
const date = (v: unknown): Date | undefined =>
  typeof v === 'string' && v ? new Date(v) : undefined;
const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v !== '' ? v : undefined;
const num = (v: unknown): number | undefined =>
  v === null || v === undefined ? undefined : Number(v);

/* L'échelle responsive d'un média, telle que scripts/media-build.mjs l'a
   écrite sur sa ligne (db/migrations/0004). Une base migrée dont les médias
   n'ont pas encore été republiés porte '[]' : on rend une liste vide plutôt
   que de jeter, et Fig.astro retombe alors sur l'original. */
const parseVariants = (raw: unknown, base: string): Variant[] => {
  if (typeof raw !== 'string' || raw === '') return [];
  let rows: unknown;
  try { rows = JSON.parse(raw); } catch { return []; }
  if (!Array.isArray(rows)) return [];
  return (rows as Record<string, unknown>[]).map((v) => ({
    width: Number(v.width), height: Number(v.height),
    format: String(v.format), src: `${base}/${String(v.key)}`,
  }));
};

/* ── lecture ────────────────────────────────────────────────────────────── */

export interface Loaded {
  posts: Post[];
  games: Game[];
  authors: Author[];
  media: Map<string, Media>;
  sections: { key: SectionKey; slug: Record<Locale, string>; label: Record<Locale, string> }[];
}

/** Charge tout le contenu d'une langue en cinq requêtes. Le résultat est
 *  ordonné comme le site l'attend : du plus récent au plus ancien. */
export async function load(db: D1Like, lang: Locale, mediaBase = '/media'): Promise<Loaded> {
  const [mediaRows, authorRows, gameRows, articleRows, tagRows, sectionRows] =
    await Promise.all([
    db.prepare('SELECT * FROM media').all(),
    db.prepare('SELECT * FROM authors').all(),
    db.prepare('SELECT * FROM games').all(),
    db.prepare(
      `SELECT * FROM articles WHERE lang = ? AND draft = 0 ORDER BY published_at DESC`,
    ).bind(lang).all(),
    db.prepare('SELECT slug, tag FROM article_tags WHERE lang = ?').bind(lang).all(),
    db.prepare('SELECT * FROM sections ORDER BY position').all(),
  ]);

  const base = mediaBase.replace(/\/$/, '');

  const media = new Map<string, Media>();
  for (const r of mediaRows.results as Record<string, unknown>[]) {
    const key = String(r.key);
    media.set(key, {
      key,
      width: Number(r.width), height: Number(r.height), bytes: Number(r.bytes),
      contentType: String(r.content_type),
      src: `${base}/${key}`,
      variants: parseVariants(r.variants, base),
      credit: {
        artist: String(r.artist), licence: String(r.licence),
        licenceUrl: String(r.licence_url ?? ''), source: String(r.source),
        file: String(r.note ?? ''),
      },
    });
  }

  const authors: Author[] = (authorRows.results as Record<string, unknown>[]).map((r) => ({
    id: String(r.id),
    body: String(r[`body_${lang}`] ?? ''),
    data: {
      name: String(r.name), initials: String(r.initials), since: str(r.since),
      role: String(r[`role_${lang}`]), bio: String(r[`bio_${lang}`]),
      creds: parse<string[]>(r[`creds_${lang}`], []),
    },
  }));
  const authorById = new Map(authors.map((a) => [a.id, a]));

  const games: Game[] = (gameRows.results as Record<string, unknown>[]).map((r) => ({
    id: String(r.id),
    body: String(r[`body_${lang}`] ?? ''),
    data: {
      title: String(r.title), studio: String(r.studio), released: String(r.released),
      releaseDate: date(r.release_date),
      score: num(r.score), userScore: num(r.user_score), userVotes: num(r.user_votes),
      followers: num(r.followers), completion: num(r.completion), version: str(r.version),
      cover: media.get(String(r.cover_media ?? '')),
      hero: media.get(String(r.hero_media ?? '')),
      platforms: parse(r.platforms, [] as GameData['platforms']),
      offers: parse(r.offers, [] as GameData['offers']),
      pricesCheckedOn: date(r.prices_checked_on),
      genre: String(r[`genre_${lang}`]),
      facts: parse(r[`facts_${lang}`], [] as GameData['facts']),
      summary: String(r[`summary_${lang}`]),
    },
  }));
  const gameById = new Map(games.map((g) => [g.id, g]));

  const tagsBySlug = new Map<string, string[]>();
  for (const r of tagRows.results as Record<string, unknown>[]) {
    const k = String(r.slug);
    const list = tagsBySlug.get(k);
    if (list) list.push(String(r.tag)); else tagsBySlug.set(k, [String(r.tag)]);
  }

  const posts: Post[] = (articleRows.results as Record<string, unknown>[]).map((r) => {
    const slug = String(r.slug);
    const section = String(r.section) as SectionKey;
    const body = String(r.body ?? '');
    const data: ArticleData = {
      type: section, lang, title: String(r.title), seoTitle: str(r.seo_title),
      lede: String(r.lede), date: new Date(String(r.published_at)),
      updated: date(r.updated_at), kicker: str(r.kicker),
      tags: tagsBySlug.get(slug) ?? [],
      cover: media.get(String(r.cover_media ?? '')),
      coverCaption: str(r.cover_caption),
      readingMinutes: num(r.reading_minutes), testedOn: str(r.tested_on),
      stale: !!r.stale, live: !!r.live, featured: !!r.featured, draft: !!r.draft,
      score: num(r.score), verdict: str(r.verdict),
      pros: parse<string[]>(r.pros, []), cons: parse<string[]>(r.cons, []),
      playtime: str(r.playtime), reviewNotes: parse<string[]>(r.review_notes, []),
      scoreRevision: str(r.score_revision),
      level: str(r.level), steps: parse<string[]>(r.steps, []),
      method: str(r.method), sources: str(r.sources),
      corrections: parse<ArticleData['corrections']>(r.corrections, []),
    };
    return {
      data, id: `${lang}/${slug}`, slug, lang, section, body,
      body_html: String(r.body_html ?? ''),
      href: articleHref(lang, section, slug),
      author: authorById.get(String(r.author_id))!,
      game: r.game_id ? gameById.get(String(r.game_id)) : undefined,
      minutes: data.readingMinutes ?? readingTime(body, lang),
    };
  });

  /* Une paire de champs par langue devenait six ; un enregistrement indexé par
     la langue en demande zéro à la suivante. */
  const sections = (sectionRows.results as Record<string, unknown>[]).map((r) => ({
    key: String(r.key) as SectionKey,
    slug: Object.fromEntries(locales.map((l) => [l, String(r[`slug_${l}`] ?? '')])) as Record<Locale, string>,
    label: Object.fromEntries(locales.map((l) => [l, String(r[`label_${l}`] ?? '')])) as Record<Locale, string>,
  }));

  return { posts, games, authors, media, sections };
}

/* ── requêtes ciblées ───────────────────────────────────────────────────── */
/* Pour les routes qui n'ont pas besoin de toute la langue : une fiche de jeu,
   une page d'auteur. Elles gardent le même coût qu'aujourd'hui. */

export async function tagCounts(db: D1Like, lang: Locale) {
  const { results } = await db
    .prepare(`SELECT tag, tag_slug, COUNT(*) n FROM article_tags
              WHERE lang = ? GROUP BY tag, tag_slug ORDER BY n DESC, tag`)
    .bind(lang).all<{ tag: string; tag_slug: string; n: number }>();
  return results;
}

/** Les jeux dont la sortie est à venir — le calendrier du bandeau. */
export async function upcoming(db: D1Like, now = new Date()) {
  const { results } = await db
    .prepare(`SELECT id, title, release_date, platforms FROM games
              WHERE release_date IS NOT NULL AND release_date > ?
              ORDER BY release_date`)
    .bind(now.toISOString()).all<Record<string, unknown>>();
  return results.map((r) => ({
    id: String(r.id), title: String(r.title),
    releaseDate: new Date(String(r.release_date)),
    platforms: parse(r.platforms, [] as GameData['platforms']),
  }));
}
