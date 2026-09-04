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
 * on trie en mémoire — 33 articles par langue, c'est quelques dizaines de Ko.
 */
import type { Locale, SectionKey } from '../i18n/config.ts';
import { articleHref } from '../i18n/config.ts';
import { readingTime } from './format.ts';

/* ── formes rendues ─────────────────────────────────────────────────────── */

export interface Credit {
  artist: string; licence: string; licenceUrl: string; source: string; file: string;
}

/** Un média R2. `width`/`height` sont obligatoires : sans eux la page réserve
 *  mal la place et le contenu saute au chargement. */
export interface Variant { width: number; height: number; format: string; bytes: number; src: string }

export interface Media {
  key: string; width: number; height: number; bytes: number;
  contentType: string; credit: Credit;
  /** L'URL publique de l'original, préfixée par MEDIA_BASE_URL. */
  src: string;
  /** L'échelle responsive, du plus petit au plus grand. Vide = pas de srcset,
   *  et le navigateur télécharge l'original — à éviter. */
  variants: Variant[];
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

/* ── lecture ────────────────────────────────────────────────────────────── */

export interface Loaded {
  posts: Post[];
  games: Game[];
  authors: Author[];
  media: Map<string, Media>;
  sections: { key: SectionKey; slugEn: string; slugFr: string; labelEn: string; labelFr: string }[];
}

/** Charge tout le contenu d'une langue en cinq requêtes. Le résultat est
 *  ordonné comme le site l'attend : du plus récent au plus ancien. */
export async function load(db: D1Like, lang: Locale, mediaBase = '/media'): Promise<Loaded> {
  const [mediaRows, authorRows, gameRows, articleRows, tagRows, sectionRows, variantRows] =
    await Promise.all([
    db.prepare('SELECT * FROM media').all(),
    db.prepare('SELECT * FROM authors').all(),
    db.prepare('SELECT * FROM games').all(),
    db.prepare(
      `SELECT * FROM articles WHERE lang = ? AND draft = 0 ORDER BY published_at DESC`,
    ).bind(lang).all(),
    db.prepare('SELECT slug, tag FROM article_tags WHERE lang = ?').bind(lang).all(),
    db.prepare('SELECT * FROM sections ORDER BY position').all(),
    db.prepare('SELECT * FROM media_variants ORDER BY media_key, width').all(),
  ]);

  const base = mediaBase.replace(/\/$/, '');
  const variantsByKey = new Map<string, Variant[]>();
  for (const r of variantRows.results as Record<string, unknown>[]) {
    const k = String(r.media_key);
    const v: Variant = {
      width: Number(r.width), height: Number(r.height),
      format: String(r.format), bytes: Number(r.bytes),
      src: `${base}/${String(r.object_key)}`,
    };
    const list = variantsByKey.get(k);
    if (list) list.push(v); else variantsByKey.set(k, [v]);
  }

  const media = new Map<string, Media>();
  for (const r of mediaRows.results as Record<string, unknown>[]) {
    const key = String(r.key);
    media.set(key, {
      key,
      width: Number(r.width), height: Number(r.height), bytes: Number(r.bytes),
      contentType: String(r.content_type),
      src: `${base}/${key}`,
      variants: variantsByKey.get(key) ?? [],
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

  const sections = (sectionRows.results as Record<string, unknown>[]).map((r) => ({
    key: String(r.key) as SectionKey,
    slugEn: String(r.slug_en), slugFr: String(r.slug_fr),
    labelEn: String(r.label_en), labelFr: String(r.label_fr),
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
