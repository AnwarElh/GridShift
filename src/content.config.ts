import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

/* ── Modèle bilingue ────────────────────────────────────────────────────────
   Deux stratégies, selon la nature de la donnée.

   Un ARTICLE est un document : il existe une fois par langue, dans
   `articles/<lang>/`. Deux fichiers de même nom sont la traduction l'un de
   l'autre — c'est ce qui relie /reviews/echo-divide-test/ à son équivalent
   /fr/tests/echo-divide-test/.

   Un JEU ou un AUTEUR est une entité : une seule fiche, dont quelques champs
   sont traduits. Dupliquer la fiche dupliquerait le prix, la note et le nombre
   d'abonnés — trois chiffres qui n'ont pas de langue et qui divergeraient au
   premier oubli. */

const LANGS = ['en', 'fr'] as const;

/* Champ traduit : une valeur par langue, les deux obligatoires. */
const loc = <T extends z.ZodTypeAny>(inner: T) => z.object({ en: inner, fr: inner });

const articles = defineCollection({
  loader: glob({ base: './src/content/articles', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) => z.object({
    type: z.enum(['news', 'review', 'guide', 'setup']),
    lang: z.enum(LANGS),
    title: z.string(),
    /* Le titre de la page et le titre du référencement ne portent pas la même
       charge. Le premier est éditorial : il peut tenir la phrase entière, il
       est lu une fois la page ouverte. Le second est lu dans une liste de dix
       résultats et Google le coupe vers 60 signes, marque comprise — au-delà,
       la fin de la phrase n'existe pas. Sans ce champ, raccourcir l'un
       raccourcissait l'autre. Facultatif : à défaut, `title` sert aux deux. */
    seoTitle: z.string().optional(),
    lede: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    author: reference('authors'),
    game: reference('games').optional(),
    kicker: z.string().optional(),
    tags: z.array(z.string()).default([]),
    cover: image().optional(),
    coverCaption: z.string().optional(),
    readingMinutes: z.number().optional(),
    /* versionnage : le contenu gaming se périme */
    testedOn: z.string().optional(),
    stale: z.boolean().default(false),
    live: z.boolean().default(false),
    featured: z.boolean().default(false),
    /* test uniquement */
    score: z.number().min(0).max(10).optional(),
    verdict: z.string().optional(),
    pros: z.array(z.string()).default([]),
    cons: z.array(z.string()).default([]),
    playtime: z.string().optional(),
    reviewNotes: z.array(z.string()).default([]),
    scoreRevision: z.string().optional(),
    /* guide et config */
    level: z.string().optional(),
    steps: z.array(z.string()).default([]),
    /* transparence */
    method: z.string().optional(),
    sources: z.string().optional(),
    corrections: z.array(z.object({ date: z.string(), text: z.string() })).default([]),
    draft: z.boolean().default(false),
  }),
});

const games = defineCollection({
  loader: glob({ base: './src/content/games', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) => z.object({
    /* — sans langue : des faits, des chiffres, des noms propres — */
    title: z.string(),
    studio: z.string(),
    released: z.string(),
    releaseDate: z.coerce.date().optional(),
    score: z.number().min(0).max(10).optional(),
    userScore: z.number().min(0).max(10).optional(),
    userVotes: z.number().optional(),
    followers: z.number().optional(),
    completion: z.number().min(0).max(100).optional(),
    version: z.string().optional(),
    cover: image().optional(),
    hero: image().optional(),
    /* le nom d'une plateforme est un nom propre ; « recommandé » est une
       étiquette d'interface, dérivée de `best` et traduite au rendu */
    platforms: z.array(z.object({
      name: z.string(),
      best: z.boolean().default(false),
      unavailable: z.boolean().default(false),
    })).default([]),
    /* affiliation — le prix et l'URL n'ont pas de langue, la boutique est un
       nom propre. Une seule source, donc aucun risque de prix divergents. */
    offers: z.array(z.object({
      shop: z.string(),
      price: z.string(),
      url: z.string(),
      tone: z.enum(['brass', 'muted', 'ok']).default('muted'),
    })).default([]),
    /* une vraie date : elle se formate ensuite selon la langue du lecteur */
    pricesCheckedOn: z.coerce.date().optional(),

    /* — traduits — */
    genre: loc(z.string()),
    facts: loc(z.array(z.object({ label: z.string(), value: z.string() }))).default({ en: [], fr: [] }),
    summary: loc(z.string()),
  }),
});

const authors = defineCollection({
  loader: glob({ base: './src/content/authors', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    name: z.string(),
    initials: z.string(),
    since: z.string().optional(),
    role: loc(z.string()),
    bio: loc(z.string()),
    creds: loc(z.array(z.string())).default({ en: [], fr: [] }),
  }),
});

export const collections = { articles, games, authors };
