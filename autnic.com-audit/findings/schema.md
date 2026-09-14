# Autnic — structured data audit

Live site, 2026-09-10. Verified with `curl` against the deployed Worker (Astro
SSR, so raw HTML already contains the rendered JSON-LD — no client-side
injection to account for). Source repo: `/Users/anwarelhamdi/Desktop/amin/gridshift`
(read-only). Cross-checked against `autnic.com-audit/crawl.json` (126 URLs)
and against the schema section of `SEO-ACTION-PLAN.md` (27 Aug 2026, pre
rebrand) to note what's fixed since.

Pages fetched live: `/`, `/reviews/onimusha-way-of-the-sword-review/`,
`/reviews/the-blood-of-dawnwalker-review/`, `en_reviews_clair-obscur-expedition-33-review`
(fetched by a sibling audit, reused), `/news/grand-theft-auto-vi-china-censorship/`,
`/news/onimusha-way-of-the-sword-critical-split/`,
`/guides/grand-theft-auto-vi-stealing-cars-guide/`,
`/setup/final-fantasy-vii-remake-trilogy-revelation-editions/`,
`/games/onimusha-way-of-the-sword/`, `/games/clair-obscur-expedition-33/`,
`/tag/pc/`, `/about/`, `/author/lina-morel/`,
`/fr/tests/onimusha-way-of-the-sword-review/`,
`/de/tests/onimusha-way-of-the-sword-review/`.

## What's already fixed since the 27 Aug audit

- **`BreadcrumbList`** now ships site-wide (`src/components/Crumbs.astro:26-37`),
  including on the tag page. Item 9 (breadcrumb half) is done.
- **Publisher entity got an `@id`** (`src/site.ts:40-53`, `orgId =
  "https://autnic.com/#organization"`), with `logo` as a real `ImageObject`,
  reused via `...publisher` on `/about/` (`src/views/About.astro:129-134`) and
  via `{'@id': orgId}` on section/collection pages
  (`src/views/Section.astro:58`). This is most of item 9 (organization half) —
  see Finding 2 for what's still missing.
- **Section/tag archive pages** now emit `CollectionPage` + `ItemList`
  (`src/views/Section.astro:50-70`) — not in the original audit at all.
- **Author pages carry `Person`** with `worksFor` linked to the same `@id`,
  plus `knowsAbout` derived from actual authored articles
  (`src/views/AuthorPage.astro:21-39`) — new, and a good E-E-A-T signal.
- **`NewsArticle` vs `Article` vs `Review`** is chosen correctly and
  documented in a comment (`src/layouts/Article.astro:53-58`): news → `NewsArticle`,
  guides/setup → `Article` (reference pages, not perishable dispatches),
  scored pieces → `Review`. No `HowTo`, no `FAQPage`, no `SpecialAnnouncement`
  anywhere in `src/`.

## What's still open (Critical → Info)

### 1. Critical — `AggregateRating` is still a fabricated count (item 5, unresolved)

`src/views/Game.astro:68-70`:

```ts
...(d.score !== undefined
  ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: d.score, bestRating: 10, ratingCount: Math.max(1, posts.length) } }
  : {}),
```

Confirmed live on `/games/onimusha-way-of-the-sword/`:

```json
"aggregateRating": {"@type":"AggregateRating","ratingValue":8.2,"bestRating":10,"ratingCount":3}
```

`ratingCount: 3` is `posts.length` — the number of Autnic *articles* about
Onimusha, not three independent ratings. The crawl confirms this is systemic:
9 `AggregateRating` blocks across 126 URLs = the 3 games with a score, × 3
locales, every one built the same way. `d.userScore`/`d.userVotes` exist in
the content schema (`src/content.config.ts:78-79`) precisely to carry a real
aggregate later, but none of the three affected games (`onimusha-way-of-the-sword.md`,
`the-blood-of-dawnwalker.md`, `clair-obscur-expedition-33.md`) set them —
confirmed by grep, zero matches.

This isn't the "self-serving review" case the rules flag (Autnic is reviewing
third-party games, not itself), but it is still a fabricated rating count,
which is the pattern Google's structured-data spam policy is built to catch,
and it's the exact item the pre-rebrand audit called out and rated Critical.
Nothing has changed here since 27 Aug.

**Fix** — delete the block until real votes exist:

```ts
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: d.title,
  publisher: d.studio,
  genre: d.genre,
  inLanguage: lang,
  gamePlatform: d.platforms.map((p) => p.name),
  url: new URL(gameHref(lang, game.id), site.url).href,
  /* Re-add once d.userVotes is real — not posts.length, which counts our own
     articles, not independent ratings:
  ...(d.userScore !== undefined && d.userVotes
    ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: d.userScore, bestRating: 10, ratingCount: d.userVotes } }
    : {}), */
};
```

**How we'd know it failed:** Rich Results Test on `/games/onimusha-way-of-the-sword/`
still reports `AggregateRating`, or `ratingCount` moves in lockstep with the
article count rather than with an actual vote tally.

### 2. High — Homepage has no `Organization` node, and nothing on the site has `sameAs`

`src/views/Home.astro:123-130`:

```ts
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: site.name,
  url: siteHome,
  inLanguage: lang,
  description: siteCopy[lang].description,
};
```

Confirmed live — `/`, `/fr/`, `/de/` each emit exactly one `WebSite` node,
nothing else (crawl.json: `ld: ["WebSite"]` on all three). The `Organization`
node with the real `@id` only exists as a full description on `/about/`; nine
other page types *reference* `{'@id': orgId}` or spread `publisher` but the
homepage — the URL most likely to be the entity's canonical page in a
knowledge panel — declares none of it.

Separately, `grep -rn "sameAs" src` returns nothing. `publisher` in `site.ts`
has no social/profile links at all, so nothing on the site tells a crawler
this is the same Autnic as `@autnic` on X (the handle is already declared as
`site.twitter` in `src/site.ts:14`, just never surfaced as `sameAs`).

**Fix** — one line in `site.ts` fixes `sameAs` everywhere `publisher` is used
(articles, about, authors' `worksFor`, section pages); `Home.astro` gets an
`Organization` + `WebSite` pair. `Base.astro`'s `jsonLd` prop already accepts
an array (`src/layouts/Base.astro:23`), so no new plumbing is needed.

`src/site.ts:42-53`:

```ts
export const publisher = {
  '@type': 'Organization',
  '@id': orgId,
  name: site.name,
  url: siteHome,
  logo: {
    '@type': 'ImageObject',
    url: new URL(withBase('/apple-touch-icon.png'), site.url).href,
    width: 180,
    height: 180,
  },
  sameAs: [`https://x.com/${site.twitter.replace('@', '')}`],
  // Add other profiles here only once they're real — Google penalises
  // sameAs entries that don't resolve to an actual owned profile.
};
```

`src/views/Home.astro` — add `publisher, orgId` to the existing `import {
site, siteCopy, siteHome } from '../site'` and replace the `jsonLd` object
(lines 123-130):

```ts
const jsonLd = [
  { '@context': 'https://schema.org', ...publisher },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: siteHome,
    inLanguage: lang,
    description: siteCopy[lang].description,
    publisher: { '@id': orgId },
  },
];
```

I did **not** add `potentialAction: SearchAction` here, which the pre-rebrand
audit floated as "free" because `/search.json` exists
(`src/i18n/config.ts:91`). It isn't free: `/search.json` is a static index
consumed client-side by the ⌘K command palette (`src/components/CmdPalette.astro`),
and there is no `/search/?q=…` route that server-renders results for an
arbitrary query — `find src/pages -iname "*search*"` shows only three
`search.json.ts` endpoints. A `SearchAction` target has to resolve to a real
results page; pointing it at a URL that doesn't exist would be worse than not
having one. Build the results page first if this is wanted.

**How we'd know it failed:** Rich Results Test on `/` still shows a bare
`WebSite` with no linked `Organization`, or the Knowledge Graph panel test
for "Autnic" shows no `sameAs`-derived profile links.

### 3. Medium — `dateModified` isn't guaranteed to track the corrections log

`src/layouts/Article.astro:62`: `dateModified: (data.updated ?? data.date).toISOString()`.
`data.updated` and `data.corrections` (`src/content.config.ts:37,64`) are two
independent, optional frontmatter fields — nothing ties them together. An
editor can append a `corrections` entry without touching `updated`, and
`dateModified` will silently stay on the original publish date even though
the article changed. Right now this is latent rather than observed: none of
the sampled articles have a non-empty `corrections` array yet (`grep -rl
"corrections:" src/content/*/*.md` returns nothing), so the drift hasn't
happened — but the editorial charter on `/about/` explicitly promises dated,
visible corrections, and that's exactly the claim this field is supposed to
back up in the SERP/AI-citation freshness signal.

**Fix** — since `corrections[].date` is a free-text string
(`z.object({ date: z.string(), text: z.string() })`), don't parse it in
`Article.astro`; that's fragile. Cheaper and more robust: make the schema
itself refuse to build if a correction was logged without bumping `updated`,
using the `zod` already in use:

`src/content.config.ts` (on the shared post schema, near line 64):

```ts
.refine(
  (d) => d.corrections.length === 0 || d.updated !== undefined,
  { message: 'corrections logged but `updated` is unset — dateModified would not move', path: ['updated'] },
)
```

This is a content-authoring gate, not a structured-data field — it makes the
*existing* `dateModified` line trustworthy instead of adding a new one.

**How we'd know it failed:** an article with a non-empty `corrections` array
in front-matter builds successfully with `updated` absent or older than the
correction date, and `dateModified` on that page's JSON-LD doesn't move.

### 4. Info — `Review` is eligible and internally consistent; no action needed

Sampled `/reviews/onimusha-way-of-the-sword-review/`:

```json
"reviewRating": {"@type":"Rating","ratingValue":8.2,"bestRating":10,"worstRating":0},
"author": {"@type":"Person","name":"Sacha Vidal","url":"https://autnic.com/author/sacha-vidal/"},
"itemReviewed": {"@type":"VideoGame","name":"Onimusha: Way of the Sword","publisher":"Capcom","genre":"Action-adventure"}
```

Same shape on `the-blood-of-dawnwalker-review` (8.6) and
`clair-obscur-expedition-33-review` (9). `ratingValue` matches the verdict
plate score shown on-page (`data.score`, same source field), `bestRating`
and `worstRating` are both present, `itemReviewed` is a valid `VideoGame`,
and `author` is a `Person` with a resolvable `url` — everything the rules
ask to check is present and correct. This is *not* the "self-serving
review" case the rules warn about — Autnic reviews third-party games it
buys, not its own product — so Google's star-snippet exclusion for
self-reviews doesn't apply here.

One gap: `itemReviewed` has no `url` pointing at the game hub
(`/games/<slug>/`), even though that page exists and is exactly what
`itemReviewed.url` is for. Low-severity, cheap to add:

`src/layouts/Article.astro:81`, add one field:

```ts
itemReviewed: {
  '@type': 'VideoGame', name: game.data.title, publisher: game.data.studio,
  genre: game.data.genre, url: new URL(gameHref(lang, game.id), site.url).href,
},
```

### 5. Low — Article `image` is a single URL, not a multi-ratio set

`src/layouts/Article.astro:78`: `...(cover ? { image: new URL(cover, site.url).href } : {})`.
Confirmed the underlying asset is real and large — `h-onimusha-way-of-the-sword-1.jpg`
is 1920×1080 (fetched and measured the JPEG header), comfortably over
Google's 1200px-wide minimum, so this already satisfies the hard requirement
for large-image / Top Stories eligibility. It's still a single 16:9 frame;
Google's own docs recommend supplying the same image pre-cropped at 16:9,
4:3 and 1:1 as an array when you have the pipeline for it — and this repo
does (`Fig` already generates multiple `widths` and the code elsewhere uses
`ratio="1-1"` for rail cards, `ratio="3-4"` for game covers). Not required,
worth doing only if there's spare effort — skip unless someone's chasing the
last few points of Discover eligibility.

### 6. Info — Tag pages have no page-level schema beyond `BreadcrumbList` (correct, by design)

`/tag/pc/` live: `ld: ["BreadcrumbList"]` only — no `CollectionPage`, no
`ItemList`. `src/views/TagPage.astro` passes no `jsonLd` prop to `Base` at
all; the `BreadcrumbList` comes for free because `Archive.astro` always
renders `Crumbs`. This matches the deliberate design already recorded in the
component's own comment: tag pages are `noindex,follow` and deliberately
excluded from the sitemap to avoid competing with `/games/<slug>/` on a
thinner page. No structured-data fix is needed — the absence is the point.

### 7. Info — No `FAQPage` anywhere

`grep -rn "FAQPage" src` is empty. Per the rules, FAQ rich results are gone
for all sites as of 7 May 2026 regardless — nothing to add and nothing to
remove.

## Score

**Schema score: 72/100** — the entity graph, breadcrumbs, article typing and
review markup are correctly built and mostly wired through one `@id`; the
score is held down by one still-fabricated `AggregateRating` (Critical,
carried over unfixed from the last audit) and a homepage/`sameAs` gap that
blocks the graph from resolving to a single recognised publisher.
