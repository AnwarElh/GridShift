# Gridshift — SEO action plan

Audit date: 27 August 2026
Scope: local Astro build (`dist/`, 48 HTML pages). Live response headers,
redirects and real Core Web Vitals field data are **not** covered — they need
a deployed `https://gridshift.fr` to verify.
Business model assumed: display ad arbitrage (paid traffic in, ad revenue out)
on top of a French gaming media property.

**SEO Health Score: 53 / 100**

| Category | Score | Weight |
|---|---|---|
| Technical SEO | 72 | 22% |
| Content Quality | 25 | 23% |
| On-Page SEO | 65 | 20% |
| Schema | 55 | 10% |
| Performance | 85 | 10% |
| AI Search / GEO | 40 | 10% |
| Images | 5 | 5% |

The engineering is good — canonicals, sitemap, RSS, per-type JSON-LD, reserved
ad slots, subset self-hosted fonts, 6.5 KB of JS. The score is held down by
content and images, not by the build.

---

## How to read this document

The actions are ordered by **dependency**, not by effort. Action 1 gates
everything; actions 2–5 gate revenue; 6–12 gate traffic. Each entry answers
three questions:

- **Why** — the mechanism by which this costs or earns money. Not "best practice".
- **What** — the concrete change, with file and line.
- **Done when** — the observable signal that proves it worked. If the signal
  never appears, the diagnosis was wrong and the action should be revisited
  rather than repeated.

---

## 1. Decide whether the fictional content is placeholder or shipping

**Priority: Critical · Effort: a decision, not a task · Blocks: everything below**

### Why

Echo Divide, Iron District, Blue Meridian, Nord Sombre and Vertige are not real
games, and Northlight Studio is not a real studio. Two consequences follow, and
both are terminal for the business model:

1. **Search demand is exactly zero.** SEO moves a page up a results list for a
   query someone typed. Nobody has ever typed "echo divide soluce district un".
   No technical fix changes a zero into a non-zero — ranking first for a query
   with no volume produces no traffic and no ad impressions.

2. **Policy exposure.** The site does not merely host invented content; it
   dresses it in trust signals. `Review` schema carries a `ratingValue` of 9.1,
   there is a named author with a twelve-year career, a "Comment nous avons
   testé" method block, and an "Exemplaire acheté" disclosure. A fabricated
   product described with the full apparatus of authentic editorial review sits
   inside Google's *scaled content abuse* policy and AdSense's
   *misrepresentation* policy. AdSense review will not approve it, and a manual
   action on the domain is not something you recover from quickly.

If this content is placeholder data for the GRIDSHIFT V2 design system, this
item is void — but then every item below is on hold until real articles land,
because there is nothing yet to optimize. If it is meant to ship, this is not
one finding among twelve; it is the entire audit.

### What

Replace the fictional catalogue with real titles, or mark the repo explicitly
as a design demo (a line in `README.md`) so the distinction survives contact
with a future collaborator.

### Done when

The `src/content/games/` slugs correspond to titles with non-zero monthly search
volume in Google Keyword Planner or DataForSEO.

---

## 2. Create the default Open Graph image

**Priority: Critical · Effort: 30 min · Unblocks: paid social economics**

### Why

`src/layouts/Base.astro:19` resolves every page's `og:image` to
`/og-default.png`. That file does not exist — `public/` holds only
`favicon.svg`, `apple-touch-icon.png` and `fonts/`. Every link shared to
Facebook, X, WhatsApp or Discord therefore renders as a bare text row with no
image.

For an arbitrage property this is the most expensive single line in the audit,
and the reason it leads the list. Arbitrage buys traffic on cost-per-click.
Link previews with an image are clicked at roughly twice the rate of previews
without one, on the same creative and the same audience. A halved click-through
rate on paid social does not halve your traffic — it **doubles your cost per
visitor**, which comes straight out of the margin between what you pay for a
click and what the ad stack pays you for it. Arbitrage lives inside that spread.
Nothing else here moves it as fast, or as cheaply.

Note that this is a *paid traffic* problem, not a ranking problem. It would not
appear in a conventional SEO audit at all, which is precisely why it has gone
unnoticed.

### What

Add `public/og-default.png` at 1200×630. Then give articles their own preview:
`src/layouts/Base.astro` already accepts an `image` prop and `Article.astro`
already passes `data.cover?.src`, so per-article OG images arrive automatically
once covers exist (action 7).

### Done when

The Facebook Sharing Debugger and X Card Validator both render a card with an
image for `https://gridshift.fr/` and for one article URL.

---

## 3. Install a consent management platform

**Priority: Critical · Effort: ~2 h · Unblocks: all ad revenue**

### Why

Searching the whole tree for `consent|cmp|didomi|axeptio|sirdata|tarteaucitron|funding-choices`
returns exactly one hit: the word "cookie" in prose on `/a-propos/`. There is no
CMP.

Google requires a certified CMP for any publisher serving ads to users in the
EEA. Without one, ad serving to French traffic — which is all of your traffic —
is throttled or refused outright. Separately, dropping advertising cookies
without collected consent is a CNIL matter, and the CNIL has fined French
publishers for exactly this.

This blocks revenue rather than rankings, which is why it belongs among the
critical items in an arbitrage context even though it is invisible to a search
crawler. You can rank perfectly and earn nothing.

### What

Install a Google-certified CMP (Axeptio, Didomi and Sirdata are the common
French choices; Google's own Funding Choices is free). Load it before the
AdSense script at `src/layouts/Base.astro:62`.

### Done when

AdSense reports no "EEA consent" policy warning, and the AdSense script fires
only after a consent decision.

---

## 4. Add `max-image-preview:large` to the default head

**Priority: High · Effort: 5 min · Unblocks: Google Discover**

### Why

`src/layouts/Base.astro:35` emits a robots meta tag only in the `noindex` case.
No page carries `max-image-preview:large`, which means every page defaults to
`max-image-preview:standard` — a small thumbnail.

Google Discover requires a large image preview to surface a page as a card.
Discover is the largest traffic channel for French gaming media, and for an
arbitrage operator it is the most valuable one that exists: it is unpaid, it is
high-volume, and it arrives on mobile where ad viewability is best. Without this
directive the site is opted out of it by default, no matter how good the content
becomes.

Five minutes of work to become eligible for the channel that would otherwise
determine whether the business model works.

### What

In the `<head>` of `src/layouts/Base.astro`, alongside the existing `noindex`
branch:

```astro
<meta name="robots" content={noindex
  ? 'noindex,follow'
  : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'}>
```

This is a prerequisite for action 7, not a substitute for it — the directive
grants permission to show a large image, and the image still has to exist.

### Done when

Search Console's Discover report appears at all (it only materialises once a
property has Discover impressions), 2–4 weeks after the first article with a
1200px+ image is indexed. **If it stays absent for a month with images live,
the blocker is content quality, not this directive** — do not keep adjusting
meta tags in that case.

---

## 5. Remove or ground the fabricated `aggregateRating`

**Priority: Critical · Effort: 15 min · Unblocks: manual-action risk**

### Why

`src/pages/jeux/[slug].astro:49` sets:

```ts
aggregateRating: { '@type': 'AggregateRating', ratingValue: d.score, ratingCount: Math.max(1, posts.length) }
```

`posts.length` is the number of articles *you* have written about the game. The
markup declares it to Google as a count of independent user ratings. A game with
five Gridshift articles is presented as a game rated by five people.

This is not a technicality. `AggregateRating` is one of the schema types Google
polices most actively, because inflated star counts are the classic structured
data spam pattern. It carries manual-action risk for the whole domain, and a
star-rating manual action removes rich results sitewide — including for the
pages that were honest.

The site's editorial posture makes this worse rather than better. Everything
else about Gridshift is unusually transparent: version tested, corrections log,
"exemplaire acheté", a published scoring method. One fabricated field
contradicts all of it, and it is the one field a spam classifier reads.

### What

Simplest correct fix: delete the `aggregateRating` block. The page keeps its
`VideoGame` node, and the `Review` on the test page carries the score
legitimately — one editorial review, correctly marked as one editorial review.

If you want an aggregate later, `src/content.config.ts` already declares
`userScore` and `userVotes` on the games collection. Wire those to real votes
and the markup becomes true.

### Done when

The Rich Results Test reports no `AggregateRating` on `/jeux/*`, or reports one
whose `ratingCount` matches a real vote tally.

---

## 6. `noindex,follow` on thin tag pages

**Priority: High · Effort: 20 min**

### Why

There are 20 tag pages against 13 articles. Each renders between 100 and 140
words, most of which is nav and footer chrome shared with every other page.
`/tag/ps5/`, `/tag/report/` and `/tag/soluce/` list one to three posts apiece.

Two costs. Crawl budget on a 48-page site is not scarce in absolute terms, but
the ratio is: Google is spending more than half its crawl on pages that contain
no original sentence. And a large set of near-identical thin pages is itself a
quality signal — it is the shape of a doorway-page site, and site-level quality
classifiers read shapes.

`noindex,follow` rather than `noindex,nofollow` deliberately: the pages stay
useful for navigation and keep passing link equity to the articles they list.
You are removing them from the index, not from the site.

### What

In `src/pages/tag/[tag].astro`, pass the `noindex` prop that `Base.astro`
already supports:

```astro
<Base title={…} noindex={posts.length < 5}>
```

Tags cross the threshold and re-enter the index by themselves as the archive
grows. This is why it is a threshold and not a hardcoded list.

### Done when

Search Console's indexed-page count stabilises near the article count rather
than near the URL count. **This is also the leading indicator to watch: if
indexed pages climb past ~30 while the article count stays at 13, the tag
pages are being indexed anyway and this action did not take.**

---

## 7. Real cover images, wired into `Article` schema

**Priority: High · Effort: ongoing · Depends on: 1, 4**

### Why

All 48 pages contain zero `<img>` elements. The design renders its empty plate
instead, which is a handsome fallback and an expensive default. Four separate
costs compound:

1. **Discover** needs a 1200px+ image. Action 4 grants permission; this supplies
   the image. Neither works alone.
2. **Article rich results** need `image` in the JSON-LD.
   `src/layouts/Article.astro` builds it conditionally from `data.cover`, so
   with no cover the field is simply omitted and the page is ineligible.
3. **Google Images** is a meaningful traffic source for gaming queries —
   builds, maps, settings screens — and it is currently a channel with nothing
   in it.
4. **Paid social creative.** See action 2; per-article covers flow into `og:image`
   automatically once they exist.

For guides in particular the images are not decoration but the product: a build
guide without a screenshot of the build is a worse guide, and dwell time follows.

### What

Add `cover:` to article frontmatter pointing at `src/assets/`. Astro's image
pipeline handles the rest — sizing, format negotiation, `width`/`height`
attributes for CLS. Write real alt text; the guides genuinely need it.

### Done when

Rich Results Test shows `image` populated on `Article` and `Review` nodes, and
Search Console's performance report shows non-zero Google Images impressions.

---

## 8. Rewrite titles for hubs, games and tags

**Priority: High · Effort: ~1 h**

### Why

Article titles are strong — editorial, specific, well-sized (49–80 chars). The
non-article pages are the opposite:

| Page | Current title | Length |
|---|---|---|
| `/` | `Gridshift` | 9 |
| `/jeux/echo-divide/` | `Echo Divide — Gridshift` | 23 |
| `/tag/pc/` | `PC — Gridshift` | 14 |

The homepage case is deliberate: `src/layouts/Base.astro:20` skips the suffix
when `title === site.name`, so the homepage title is the bare brand word. That
is right for a brand people already search for and wrong for a site nobody has
heard of yet — the homepage title is the one place to state what the site *is*
to a reader deciding whether to click.

The game hubs are the bigger miss. `/jeux/echo-divide/` aggregates every article
about a game — exactly the page that should compete for `[game] test`,
`[game] soluce`, `[game] guide`. Titled with the bare game name, it matches none
of them. These hubs are the site's best structural asset and its weakest
on-page implementation.

### What

- Homepage: `Gridshift — tests, guides et actus jeu vidéo`
- Game hub: `{title} : test, guides et soluces — Gridshift`
- Tag: `{tag} : tous nos articles — Gridshift`

### Done when

Average SERP position for `[game name] test` queries appears in Search Console
at all — currently these pages match no query, so any position is an improvement
over absence.

---

## 9. Add `BreadcrumbList` and complete the `Organization` node

**Priority: High (breadcrumbs) / Medium (organization) · Effort: ~1 h**

### Why

**Breadcrumbs:** the `Crumbs` component renders a visible trail on every article
and game page, but no `BreadcrumbList` JSON-LD accompanies it. Google therefore
displays the raw URL path in the SERP instead of `Gridshift › Echo Divide ›
Test`. The information architecture work is already done and paid for; the
markup that converts it into SERP real estate — and the CTR that follows — is
missing. This is the highest ratio of return to effort in the document.

**Organization:** the homepage emits a `WebSite` node with no `logo`, no
`sameAs`, and the `Article` nodes carry a `publisher` with a name but no logo.
Publisher logo has historically been required for article rich results, and the
entity graph is what lets Google connect the site, its three named authors and
its reviews into one recognised publisher rather than three unrelated `Person`
nodes. For a new domain with no brand signal, that connection is most of what
E-E-A-T can be built from mechanically.

There is also a `SearchAction` available for free: the site already ships a
search index at `/search.json`.

### What

Emit `BreadcrumbList` from the same array `Crumbs` already receives — one source
of truth, no drift. Extend the homepage JSON-LD to a graph containing
`Organization` (with `logo`, `sameAs`) and `WebSite` (with `potentialAction`).

### Done when

Rich Results Test detects `BreadcrumbList` on article URLs, and breadcrumb
trails replace URL paths in live SERP listings.

---

## 10. Split the legal pages onto their own URLs

**Priority: Medium · Effort: ~1 h · Unblocks: AdSense approval**

### Why

`src/pages/a-propos.astro` carries `#confidentialite`, `#mentions`,
`#publicite`, `#affiliation` and five other sections as anchors on a single
page. Editorially that is a defensible choice — one page that explains how the
publication works reads better than eight stubs.

For AdSense review and French law it is not. AdSense's review process looks for
a privacy policy at its own URL, and French law requires mentions légales to be
identifiable and directly accessible. A reviewer landing on `/a-propos/` sees an
about page; the fact that a privacy policy is somewhere further down it is not
something an automated check reliably resolves. This is a small ambiguity with a
disproportionate downside — a rejected AdSense application on an arbitrage site
is a total revenue stop.

### What

Move privacy and mentions légales to `/confidentialite/` and
`/mentions-legales/`. Keep the summaries on `/a-propos/` with links onward, so
the editorial page keeps working.

### Done when

Both URLs return 200 and are linked from the footer (`src/site.ts`
`footerLinks`).

---

## 11. Emit `lastmod` in the sitemap

**Priority: Medium · Effort: 15 min**

### Why

`dist/sitemap-0.xml` contains bare `<loc>` entries with no `<lastmod>`. Google
treats a trustworthy `lastmod` as a recrawl hint.

This matters more here than on a typical site, because freshness is the
editorial premise. The content model is built around revision: `updated`,
`testedOn`, `stale`, `scoreRevision`, a `corrections` log, and a real example in
the archive — Vertige's score moved from 7.4 to 8.0 after a year of patches. A
revised review only earns its traffic if Google notices the revision. Right now
nothing in the sitemap says anything changed, so the site's most distinctive
editorial behaviour is invisible to the crawler.

### What

Use the `serialize` option of `@astrojs/sitemap` in `astro.config.mjs` to emit
`lastmod` from `data.updated ?? data.date`. Only emit it where it is true —
a `lastmod` that updates on every build is ignored, and rightly.

Once `/actus/` publishes at a real cadence, a Google News sitemap becomes worth
adding. Not yet, at 13 articles.

### Done when

Search Console's crawl stats show recrawls of revised URLs within days rather
than weeks of a change to `updated`.

---

## 12. Expand article length

**Priority: High · Effort: ongoing · Depends on: 1**

### Why

Current source word counts: six articles under 100 words, ten under 150, the
longest 698. Rendered `<main>` averages roughly 180 words on actus.

Two independent failures, and the second is the one that decides the business:

**Rankings.** A 75-word news item answers no query completely. It is outranked
by any competitor covering the same story with context, and it contributes a
thin-content signal to the domain average.

**Ad arbitrage economics.** A 180-word article physically fits one ad impression
above the fold and gives the reader no reason to continue. Arbitrage requires
3–6 pageviews per session to clear the gap between traffic cost and ad revenue —
you are paying for the first pageview either way, so profit lives entirely in
the second, third and fourth. At 180 words the model yields roughly one, and the
arithmetic cannot close no matter how good the ad stack is.

This is why length is not a vanity metric here. It is the mechanism that turns a
purchased visit into more than one impression.

The recirculation architecture to support it is already built — related articles,
game hubs grouping all coverage of a title, the "Le fil" ticker. It is
well-designed and currently has nothing to circulate.

Targets: actus 400+ words, guides and tests 1200+.

### Done when

Average pageviews per session exceeds 2.0 in analytics — the threshold at which
recirculation is contributing revenue rather than just existing.

---

## Sequencing summary

| # | Action | Effort | Gates |
|---|---|---|---|
| 1 | Decide: placeholder or shipping content | — | everything |
| 2 | `public/og-default.png` (1200×630) | 30 min | paid social ROI |
| 3 | Certified CMP | 2 h | all ad revenue |
| 4 | `max-image-preview:large` | 5 min | Discover |
| 5 | Remove fabricated `aggregateRating` | 15 min | manual-action risk |
| 6 | `noindex,follow` on thin tags | 20 min | crawl budget |
| 7 | Real cover images | ongoing | Discover, rich results |
| 8 | Rewrite hub / game / tag titles | 1 h | organic CTR |
| 9 | `BreadcrumbList` + `Organization` | 1 h | SERP CTR |
| 10 | Split legal pages | 1 h | AdSense approval |
| 11 | `lastmod` in sitemap | 15 min | crawl freshness |
| 12 | Expand article length | ongoing | rankings + RPM |

---

## Secondary items

Worth doing, not worth sequencing:

- **`404.html` has no `<h1>` and no recirculation.** Add a heading and a "derniers
  articles" block — 404s are traffic you already paid for.
- **No `preconnect` for the ad stack.** `src/layouts/Base.astro:62` loads
  `pagead2.googlesyndication.com` cold. Preconnect to it and to
  `googleads.g.doubleclick.net`: worth 100–300 ms of LCP once ads are live.
- **No `llms.txt`, no AI-crawler policy** in `src/pages/robots.txt.ts`. Decide
  deliberately whether GPTBot, ClaudeBot and PerplexityBot are allowed. Either
  answer is defensible; silence is a default you did not choose.
- **Fonts total 716 KB across six files.** The `unicode-range` splits and
  `font-display:swap` are correct — this is already better than most sites — but
  a 131 KB latin subset for one UI face is heavy on the mobile connections paid
  traffic arrives on. Subsetting to the French charset would cut it materially.
- **`Review` JSON-LD omits `publisher.logo` and `itemReviewed.url`.**

---

## Arbitrage notes outside the SEO scope

Three things matter more to this business model than anything ranked above.
They are not SEO findings, and they are recorded here because the audit is only
useful if it accounts for how the site actually makes money.

**Ad density is far below arbitrage viability.** One to two units per page
(sidebar, plus one in-content on longer pieces). Arbitrage properties run four
to eight: sticky bottom anchor, in-content every two to three paragraphs, sticky
sidebar. The `Ad` component already reserves height by format and labels each
slot "Publicité", so additional units cost nothing in CLS and nothing in reader
trust. The hard part is done; the units are missing.

**Pageviews per session is the revenue multiplier.** See action 12 — this is the
same problem viewed from the revenue side rather than the ranking side, which is
why it appears twice.

**AdSense will floor the RPM.** At real volume, Ezoic (no traffic minimum) or a
French-focused partner typically doubles revenue on identical inventory.
`src/components/Ad.astro` currently hardcodes AdSense. Worth keeping the ad
network behind that component's interface so switching is a one-file change
rather than a migration.
