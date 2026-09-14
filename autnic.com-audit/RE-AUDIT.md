# autnic.com: post-deploy re-audit (2026-09-10, after 0e6910c)

**Method:** a delta audit. I re-crawled all 126 sitemap URLs (`crawl-postdeploy.json`), re-checked every category the deploy touched against the live site, and ran mobile Lighthouse after the deploy. Content, SXO and visual findings carry over unchanged: the crawl shows 0 title changes, 0 description changes and no new or removed URLs.

## SEO Health Score: 80 / 100 (was 76)

| Category | Weight | Before | After | Evidence |
|---|---|---|---|---|
| Technical | 22% | 83 | **86** | `/_astro/*` cached for a year and `/fonts/*` for 30 days (were `max-age=0`); 126/126 URLs return 200 and are self-canonical |
| Content | 23% | 72 | 72 | No content deployed; the trust claims are still live |
| On-page | 20% | 80 | 80 | Titles and descriptions unchanged; the hub's "where to buy it" promise and the template H2 are still live |
| Schema | 10% | 72 | **85** | `aggregateRating` on 0 URLs (was 9); all 3 homepages link to `#organization`; `VideoGame` author is an Organization; `itemReviewed.url` present; 0 JSON-LD parse errors |
| Performance | 10% | 75 | **88** | Lab, mobile: review page score 96, LCP 2.5s (was 60, 10.3s); homepage 96, LCP 2.4s; CLS 0. Still no field data |
| AI search | 10% | 61 | **66** | The homepage entity is anchored; no `sameAs` yet |
| Images | 5% | 78 | **92** | `max-image-preview:large` on 126/126; 84 image-sitemap entries; body screenshots have alt (empty alts down from 1,247 to 1,190) |

Weighted: 18.9 + 16.6 + 16.0 + 8.5 + 8.8 + 6.6 + 4.6 = **80.0**

## Resolved and verified live

- The fabricated `AggregateRating` (the Critical finding): gone from all 9 game hubs.
- The article hero srcset: now 840w–1920w (was 1440w and 1920w only), so a typical phone downloads 104 KB instead of 307 KB.
- `max-image-preview:large` on every indexable page.
- The homepage `WebSite` → `publisher` link to `#organization`.
- `VideoGame` names the studio as `author`, and `about`/`itemReviewed` carry the hub URL.
- Body screenshot alt text.
- Image sitemap entries.
- Browser caching for build assets and fonts.
- Speculation-rules prefetch on all 126 pages.

## Still open

**Needs your decision (content and copy):**
1. The correction log promised on the About page and in llms.txt, with 0 articles showing one. **High**
2. The "We buy what we review" tagline, which 2 of 4 reviews contradict. **High**
3. The game-hub description's "where to buy it" promise, with no buy links on the page. **Medium**
4. Adding `sameAs` to the organization. It needs real profiles. **High for AI search**
5. Review title hooks, the FF7 editions table, and the "Your ultimate gaming blog" H2. **Medium / Low**

**Needs Cloudflare access or engineering:**
- Purging the cache when publishing straight to D1. The rules file requires it, and it needs a cache-purge token. **Medium**
- IndexNow pings on D1 publishes. **Medium**
- `http://www` takes 2 redirect hops. **Low**
- `/reviews` returns 200 instead of redirecting to `/reviews/`. **Low**
- `workers_dev` / `preview_urls` not set explicitly. **Low**

**New and minor:**
- `/_routes.json` is publicly served. It's a leftover from Cloudflare Pages and harmless, but it can be added to `.assetsignore`. **Info**
- `/favicon.svg` is still `max-age=0`. Browsers cache favicons on their own anyway. **Info**

## What moves the score next

Content carries 23% of the score, and it's where the remaining points are:
- Fixing items 1–3 would take Content to about 82 and On-page to about 85, roughly +3 overall.
- Adding `sameAs` would lift Schema and AI search, roughly +1.
- That makes **about 84–85 reachable without new articles**. Beyond that, the ceiling is content volume (21 articles per language) and authority, which no code change moves.

## Watch

- Search Console, once connected: Enhancements → Review snippets shows 0 errors, and Manual actions stays empty.
- Discover impressions appear within about 30 days of the `max-image-preview:large` deploy.
- A PSI API key would replace these lab numbers with CrUX field data.

---

# Update: 2026-09-11, after 5326f88 · aa5fd0e · cf89a69 · 04174cf

Re-crawl of all 126 sitemap URLs: `crawl-2026-09-11.json`.

## SEO Health Score: 84 / 100 (was 80)

| Category | Weight | Before | After | Evidence |
|---|---|---|---|---|
| Technical | 22% | 86 | **89** | robots.txt valid (0 unknown directives); Lighthouse SEO 100 on the homepage and the review; 126/126 URLs return 200 and are self-canonical |
| Content | 23% | 72 | **79** | Correction log on 63/63 articles, so the About and llms.txt promise is now true; hub descriptions promise only what the page has |
| On-page | 20% | 80 | **84** | 12 hub descriptions corrected (the 4 unscored games × 3 languages); 0 generic link texts site-wide (was 128) |
| Schema | 10% | 85 | **87** | The export refuses a correction that has no `updated`, so `dateModified` follows the log; `sameAs` dropped as a finding because there are no social profiles to point to |
| Performance | 10% | 88 | 88 | Image regression from 5326f88 fixed (1,349/1,349 images with srcset). Lab, mobile, from my connection: homepage median LCP 2.74 s, review 3.18 s, CLS 0 |
| AI search | 10% | 66 | **71** | llms.txt claims now true; robots.txt valid |
| Images | 5% | 92 | 92 | Unchanged |

Weighted: 19.6 + 18.2 + 16.8 + 8.7 + 8.8 + 7.1 + 4.6 = **83.8**

## Resolved since the first update

- Correction log on every article.
- Store links (official stores, prices dated) on 6 games, with the homepage deals strip filled in.
- Honest hub descriptions.
- The fictitious `@autnic` account removed.
- Descriptive link text in the cookie banner.
- A valid robots.txt.
- The seed no longer wipes image variants (verified 46/46 through a CI reseed).

**Tested and rejected, each lowering LCP by nothing or making it worse:**
- CSS inlining
- Removing the JetBrains preload
- Removing the fade on the article opening
- Combinations of these

## Still open

1. The "We buy what we review" tagline appears 4 times on the homepage and contradicts 2 of 4 reviews. **High.** Needs your wording.
2. Review title hooks, the FF7 editions table, and the "Your ultimate gaming blog" H2. **Medium / Low.** Editorial.
3. Fonts are 89 KB of the ~150 KB on the critical path. Dropping JetBrains Mono or subsetting Inter's weights is the last LCP lever. Design decision.
4. Purge and IndexNow on D1 publishes (needs a cache-purge token), the 2-hop `www` redirect, and `/reviews` returning 200 instead of redirecting. **Medium / Low.**
