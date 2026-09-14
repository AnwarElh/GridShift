# Sitemap audit — https://autnic.com/sitemap.xml

Score: **82/100**

Generator: `src/pages/sitemap.xml.ts` (SSR route, D1-backed, `prerender = false`).
robots.txt reference: `src/pages/robots.txt.ts:22` → `Sitemap: ${site.url}${base}/sitemap.xml`.

## What works

- XML is well-formed (`xml.etree.ElementTree` parses cleanly, 126 `<url>` blocks).
- All 126 `<loc>` entries return HTTP 200, are self-canonical, and carry no `robots: noindex` — verified against `autnic.com-audit/crawl.json` (126/126 status 200, 0 non-self-canonical, 0 redirects, 0 noindex).
- hreflang clusters are structurally sound: every entry lists exactly `en`, `fr`, `de`, `x-default`, each cluster is reflexive (the page's own URL is among its alternates), and en/fr/de counts are perfectly balanced at 42/42/42 — no orphaned translation. This matches the deliberate design in `src/pages/sitemap.xml.ts:29-39,57-60`.
- Tag-page exclusion is correct and intentional, not an oversight. `src/pages/sitemap.xml.ts:15-17` documents it; live-checked `https://autnic.com/tag/action-rpg/` → `<meta name="robots" content="noindex,follow">` and self-canonical `<link rel="canonical" href=".../tag/action-rpg/">`. Listing a noindexed URL in the sitemap would be the actual bug — not listing it is the fix already in place.
- `lastmod` on article/section/game/author pages reflects real content dates, not a build timestamp. Checked `https://autnic.com/news/onimusha-way-of-the-sword-critical-split/`: sitemap `lastmod` = `2026-09-06T09:00:00.000Z`, page's own `datePublished`/`dateModified` JSON-LD and visible `<time datetime>` = same value. The generator explicitly takes `p.data.updated ?? p.data.date` per page (`src/pages/sitemap.xml.ts:97-106`) and the max of a section's own posts for hub pages (`:47-51`), not `new Date()` at build/request time.
- No `priority`/`changefreq` tags present — already avoids the deprecated, Google-ignored fields.
- 126 URLs is nowhere near the 50,000-per-file cap; no index-file need yet.
- Legal pages (`/about/`, `/credits/`, `/legal-notice/`, `/privacy/`, `/cookies/`, and fr/de equivalents) intentionally omit `lastmod` rather than fake one — `src/pages/sitemap.xml.ts:74-81`: `lastmod: p === 'games' ? latest(posts) : undefined`. The code comment (`:42-46`) states the reasoning correctly: a wrong `lastmod` anywhere makes Google distrust the whole file, so silence beats a guess. This is the right call, not a bug — flagged only as Info below because it's worth confirming these pages truly never change silently (e.g. a legal-copy edit without a re-deploy note).

## Findings

### 1. [Medium] No image sitemap extension despite an image-led, review/news site
**Evidence**: `sitemap.xml` root element only declares `xmlns:xhtml`; no `xmlns:image`. Crawl shows every article has a hero/cover image (`imgs` 13-34 per page in `crawl.json`), and `src/lib/db.ts:48,59` already loads `cover`/`hero` as a typed `Media` object with resized `Variant[]` (`width/height/format/src`) per post — the data the image sitemap needs already sits in the same `posts` array the generator loops over at `src/pages/sitemap.xml.ts:97-106`.
**Fix**: in that same loop, emit `<image:image><image:loc>{post.data.cover.src}</image:loc></image:image>` (add `xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"` to the `<urlset>` tag at `src/pages/sitemap.xml.ts:110`). This is a low-effort addition — the fields exist, no new query needed — and it's the correct lever for Google Images/Discover given the memory note that Autnic is image-led, not text-led.
**How we'd know it failed**: Search Console → Images report shows no crawl activity from Discover/Image Search for article heroes despite them being template-consistent and reused prominently, or a `site:autnic.com` Images search returns near-zero results per article.

### 2. [Medium] No Google News sitemap for the news section
**Evidence**: several `news:` items/day per the shared context; `sectionKeys` includes `'news'` (`src/i18n/config.ts:46`) and the main sitemap already carries all news URLs, but nothing filters to "published in the last 48h" with the `news:` namespace Google News actually reads.
**Fix**: add a second SSR route (e.g. `src/pages/news-sitemap.xml.ts`) filtering `posts.filter(p => p.section === 'news' && (Date.now() - +p.data.date) < 48*3600*1000)`, namespaced `xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"`, and reference it from `src/pages/robots.txt.ts:22` alongside the main sitemap. Do this only if/when Autnic wants News/Discover surfacing for its news cadence — building it speculatively before that's a stated goal is the wrong rung of effort for a 126-URL site today.
**How we'd know it failed**: news articles never appear in Google News/Top Stories carousels despite same-day publication, or Search Console's "Sitemaps" report shows no news-sitemap fetch activity once added.

### 3. [Low] `lastmod` timestamps are always on the hour
**Evidence**: `sitemap.xml` — 10 distinct timestamp values all end in `:00:00.000Z` (e.g. `2026-09-06T09:00:00.000Z` × 18, `2026-09-04T16:00:00.000Z` × 9). This traces to the underlying `posts[].data.date`/`updated` values (seed/editorial data), not a generator bug — `src/pages/sitemap.xml.ts:47-51,97-106` correctly passes through whatever precision the database stores.
**Fix**: not a sitemap-code fix; if publish times are meant to reflect real editorial moments (useful for `lastmod` credibility and dedup of near-simultaneous posts), store true minute-level timestamps in D1 rather than round hours. Low priority since Google doesn't weight `lastmod` precision, only plausibility, and these already vary sensibly across articles (07:00, 09:00, 12:00, 13:00, 15:00, 16:00 on the same day).
**How we'd know it failed**: two articles published minutes apart both show the same round-hour `lastmod`, undermining "recently updated" signals during a fast news cycle.

### 4. [Info] Sitemap index readiness
**Evidence**: 126 URLs today; cap is 50,000. At "several news items per day" cadence plus 3-language mirroring, the file grows by roughly 3× the daily article count.
**Fix**: none needed now — splitting into a `sitemap-index.xml` before there's a real multi-thousand-URL file is speculative work for a problem that doesn't exist yet (YAGNI). Revisit when the single file approaches low tens of thousands of URLs, or sooner if per-locale/per-section index files become useful for crawl-budget triage in Search Console.
**How we'd know it failed**: `sitemap.xml` response size or `<url>` count approaches 45–50k, or Search Console starts reporting partial-processing/truncation on the sitemap.

## Coverage check (crawl-derived)

- Homepage + `/news/`, `/reviews/`, `/guides/`, `/setup/`, `/games/` hubs and one article were crawled live for internal links. Only gap found vs. sitemap: `/tag/*` and `/author/*` pages are linked in-page. Author pages ARE in the sitemap (confirmed via `authorHref` loop, `src/pages/sitemap.xml.ts:90-96`, 3 per locale × 3 locales = 9 total). Tag pages are correctly absent (see "What works" above).
- No fr/de-only pages found outside the sitemap: en/fr/de counts are exactly 42/42/42, consistent with `src/pages/sitemap.xml.ts:101-104`'s comment that article export refuses to publish a post missing in another language.
- robots.txt correctly points at `/sitemap.xml` (`src/pages/robots.txt.ts:22`) — note per persistent memory that Cloudflare's zone-level robots.txt injection is a separate, dashboard-side concern unrelated to this file.

## Out of scope, noted for context only

1247 of 1331 crawled `<img>` tags (`crawl.json`, summed across all 126 pages) have no `alt` text. Not a sitemap defect, but relevant to Finding #1: an image sitemap surfaces images to Google Images faster, but missing `alt` still caps their ranking/captioning potential there. Worth a separate on-page audit.
