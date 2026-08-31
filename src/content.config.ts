import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

/* Un seul type d'article, discriminé par `type`.
   Actus, tests et guides partagent 90 % de leurs champs. */
const articles = defineCollection({
  loader: glob({ base: './src/content/articles', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) => z.object({
    type: z.enum(['actu', 'test', 'guide']),
    title: z.string(),
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
    /* guide uniquement */
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
    title: z.string(),
    studio: z.string(),
    genre: z.string(),
    released: z.string(),
    releaseDate: z.coerce.date().optional(),
    score: z.number().min(0).max(10).optional(),
    userScore: z.number().min(0).max(10).optional(),
    userVotes: z.number().optional(),
    followers: z.number().optional(),
    completion: z.number().min(0).max(100).optional(),
    version: z.string().optional(),
    platforms: z.array(z.object({
      name: z.string(),
      best: z.boolean().default(false),
      unavailable: z.boolean().default(false),
    })).default([]),
    facts: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    cover: image().optional(),
    hero: image().optional(),
    /* affiliation — étiquetée, jamais déguisée */
    offers: z.array(z.object({
      shop: z.string(),
      price: z.string(),
      url: z.string(),
      tone: z.enum(['brass', 'muted', 'ok']).default('muted'),
    })).default([]),
    pricesCheckedOn: z.string().optional(),
  }),
});

const authors = defineCollection({
  loader: glob({ base: './src/content/authors', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    name: z.string(),
    initials: z.string(),
    role: z.string(),
    since: z.string().optional(),
    bio: z.string(),
    creds: z.array(z.string()).default([]),
  }),
});

export const collections = { articles, games, authors };
