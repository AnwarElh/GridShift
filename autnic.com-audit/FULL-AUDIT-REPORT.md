# autnic.com — Full SEO Audit

**Date:** 2026-09-10 · **Scope:** live site, all 126 sitemap URLs (en/fr/de), plus source at `gridshift/`
**Business type:** Publisher (games media: reviews, news, guides, setup), ad-supported with affiliate links
**Previous audit:** 27 Aug 2026 on a local build, scored 53/100 (`SEO-ACTION-PLAN.md`)

## SEO Health Score: 76 / 100 (+23 since 27 Aug)

| Category | Score | Weight | Weighted |
|---|---|---|---|
| Technical SEO | 83 | 22% | 18.3 |
| Content Quality | 72 | 23% | 16.6 |
| On-Page SEO | 80 | 20% | 16.0 |
| Schema / Structured Data | 72 | 10% | 7.2 |
| Performance (CWV) | 75 | 10% | 7.5 |
| AI Search Readiness | 61 | 10% | 6.1 |
| Images | 78 | 5% | 3.9 |
| **Total** | | | **75.6 → 76** |

Supporting scores (not weighted): Visual/mobile 84, Sitemap 82, SXO 60.

Data limits: no Google API credentials, so no CrUX field data, GSC or GA4. Performance is lab-only (Lighthouse 13.4.1, one run per page). Backlinks were not run: the domain has been "Autnic" since 2026-09-08, so there is nothing to measure yet. AI-crawler access was tested by user-agent only, not from real bot IPs.

---

## Executive summary

The previous audit's terminal problem is gone. The catalogue is now real games, and pre-release coverage (GTA VI, KOTOR Remake) is openly hedged rather than presented as hands-on. The engineering underneath was already good and is now better:
- all 126 sitemap URLs are clean: 200, self-canonical, reciprocal hreflang, real 404s
- `.md` alternates are noindexed and canonicalised
- CLS measures 0 and the homepage lab score is 96
- the `@id`-linked publisher entity is consistent
- no deprecated schema anywhere

**What holds the score down is one pattern, not many unrelated bugs: the site makes trust claims that its code doesn't back up.** Autnic's positioning is transparency ("we buy what we review", scores revised, dated correction logs). Every gap between what it says and what it does therefore hits the thing it is selling, and it is also exactly what Google's spam policies and AdSense's misrepresentation policy look for:

| The claim | What's actually there |
|---|---|
| Game hubs: `AggregateRating` 8.2 with `ratingCount: 3` | One Autnic score. The "3" is the number of Autnic's own articles about the game (`Game.astro:69`). |
| "Every article carries its own dated correction log" (About en/fr/de, llms.txt) | 0 of 63 article files populate `corrections`. The block only renders when it's non-empty, so no reader ever sees one. |
| "We buy what we review" (homepage meta, og:description, WebSite schema, llms.txt, de/fr equivalents) | 2 of 4 reviews were played on publisher-supplied codes. Each review discloses this properly; the tagline doesn't allow for it. |
| Game hub description: "…where to buy it…" (`ui.ts:169`, `:689`, fr) | No retailer or buy link renders on any hub. |

None of these needs new features. They need the claim and the code to agree, and each fix is a few lines.

### Top issues

1. **Critical: a fabricated `AggregateRating` on 9 game hubs.** It counts Autnic's own articles as ratings, which Google treats as spammy structured data. It was flagged in the 27 Aug audit and is still unresolved. `src/views/Game.astro:68-70`.
2. **High: the correction-log promise is unmet on every article** (About, llms.txt). This is a stated trust mechanism with no instances.
3. **High: the "We buy what we review" tagline contradicts half the reviews.** The disclosures inside the reviews are exemplary; the headline overclaims.
4. **High: the article hero never offers phones a small image.** `Fig.astro`'s exact-match filter drops the missing 900w variant, leaving only 1440w and 1920w (307 KB minimum where 77–170 KB would do). The review page's lab LCP was 10.3s, but that single run also had a 5.25s lab TTFB anomaly, so re-measure after the fix before quoting it.
5. **High: no `max-image-preview:large`.** Discover can't use large image cards, which is the format an image-led site depends on and the likeliest early traffic source for a new domain.

### Top quick wins (each a few lines)

1. Delete the `aggregateRating` spread in `Game.astro:68-70`.
2. Emit `<meta name="robots" content="max-image-preview:large">` in `Base.astro:102` whenever the page isn't noindexed.
3. Make `Fig.astro:37-39` snap each requested width to the nearest variant that exists, so every caller gets a real srcset.
4. Set `alt={bodyShotCaption ?? ''}` on the body screenshot at `Article.astro:176`.
5. Replace the homepage H2 "Your ultimate gaming blog", which is leftover template copy.

---

## Technical SEO: 83

**Works:**
- All 126 URLs return 200, are self-canonical and have reciprocal hreflang.
- Nonexistent paths return real 404s in all 3 locales.
- `.md` alternates send `X-Robots-Tag: noindex` plus a canonical `Link` header pointing at the HTML page.
- robots.txt is the site's own file, with no Cloudflare-managed override, and AI user-agents get 200.
- Full security header set.
- Valid RSS with localized feeds.
- Tag pages are deliberately `noindex,follow`.
- Pagination is self-canonical.
- Old French-root redirects still work.

| Sev | Finding | Evidence | Fix |
|---|---|---|---|
| Medium | **No purge when content is published to D1.** A correction reaches every edge only after the 24h KV TTL, and downstream caches may honour the 4-day `stale-while-revalidate`. | `wrangler.jsonc:97` `CACHE_TTL 86400`; `src/lib/cache.ts:126,135`. The targeted purge was removed as "never had a caller" (`cache.ts:23-27`). | Give the purge a caller: the D1 publish path. |
| Medium | **IndexNow only fires on git deploys**, so Bing/Copilot don't hear about day-to-day D1 publishes. | `.github/workflows/deploy.yml:121-126`; `src/lib/indexnow.ts:54` has no D1-side caller. The key file is live and correct. | Call `submitToIndexNow` from the same D1 publish hook as the purge. |
| Low | `/reviews` and `/reviews/` both return 200. | `astro.config.mjs:57` `trailingSlash: 'ignore'`. The canonical is correct on both. | 301 to the slash form in `src/middleware.ts`. |
| Low | `http://www.autnic.com/` takes 2 redirect hops. | Cloudflare level. | A single redirect rule to `https://autnic.com/`. |
| Info | Bot access was verified by user-agent only. | Real-IP WAF, Bot Fight Mode and AI Crawl Control rules can't be tested from here. | Check Cloudflare → Security → Bots after any zone change. |

## Content quality: 72

**Works:**
- Reviews run 1,700–1,938 words, with structured disclosure of tested version, platform, playtime, how the copy was obtained, and patch state (`method`, `testedOn`, `playtime`).
- Reviews contain first-hand detail that's unlikely to be synthesized.
- The About charter is real QRG trust content: paid copies, ad/editorial separation, `sponsored nofollow`, a scoring rubric.
- fr/de are full, independently phrased translations (fr Clair Obscur review: 1,787 words vs en 1,666).
- Pre-release guides are honestly hedged.

| Sev | Finding | Evidence | Fix |
|---|---|---|---|
| High | **Correction-log promise unmet.** | `About.astro:62` and `:86`, llms.txt; `corrections` is populated in 0 of 63 files; the render is gated at `Article.astro:189-201` on `length > 0`. | Make the promise true: when the list is empty, render "No corrections since publication (date)", and log real ones from now on. |
| High | **The tagline overclaims.** | "We buy what we review" appears in the home meta and og description, the WebSite schema, llms.txt and `ui.ts:636` (de). Onimusha (`…/onimusha-way-of-the-sword-review.md:32`) and Dawnwalker used publisher codes. | Reword to match the About policy, e.g. "We tell you how we got every game we review, and we revise scores when games change." |
| Medium | **No first-hand imagery.** Every review image is a publisher press asset, credited as such. | Image credits on the sampled reviews. | Add 1–2 reviewer-captured screenshots per review, credited to Autnic. This is the strongest proof of the play the text describes. |
| Medium | **News pieces are built around another outlet's take**, e.g. `onimusha-way-of-the-sword-critical-split` (782 words, "Kotaku says X, we scored Y"). | Structure of the piece. | Lead with Autnic's own claim, then cite the competitor. |
| Low | **Author credentials can't be checked.** "Twelve years in the specialist press" names no outlet; avatars are initials. | Author pages. | One external credential or profile link per author. |

## On-page SEO: 80

**Works:**
- `<title>` and H1 are split: the title is short and query-led (39–51 chars, no truncation) and the H1 carries the hook.
- No duplicate meta descriptions.
- One H1 per page.
- The homepage links to every article and hub.

| Sev | Finding | Evidence | Fix |
|---|---|---|---|
| Medium | **Game-hub description promises "where to buy it"**, but no buy link renders. The template is site-wide. | `src/i18n/ui.ts:169` (en), `:689` (de), and the fr equivalent. Live `/games/grand-theft-auto-vi/` has 0 outbound links. | Render the existing `review.whereToBuy` block on hubs, or drop the clause. |
| Medium | **Review titles lose the hook in the SERP.** There are 10–20 spare characters. | e.g. `Onimusha: Way of the Sword review — Autnic` (42 chars). | Query first, then a short hook: `Onimusha: Way of the Sword review — no Sekiro clone`. Keep "review" and the game name at the front. |
| Medium | **The FF7 Revelation editions page has no comparison table** for a comparison query. | `/setup/final-fantasy-vii-remake-trilogy-revelation-editions/`: 0 `<table>`, 1 outbound link (Steam). The SERP is store pages plus comparison pieces. | An editions × contents × price table, plus a buy link per edition (`rel="sponsored"`). |
| Low | Leftover template H2 "Your ultimate gaming blog". | `src/views/Home.astro`, `pick-h`. | Use real section copy, or visually hide the heading. |
| Low | Identical titles across locales. | Game hubs, author pages, cookies. | Give hubs a localized suffix, e.g. `…: news, guides & review`. |
| Low | Section hubs are thin: 230–255 words each, 4 items. | `/reviews/`, `/games/`, `/de/spiele/`. | 60–120 words on the scoring and re-check method. |

## Schema: 72

**Works:**
- `BreadcrumbList` everywhere, from one component (`Crumbs.astro:26-37`).
- A stable publisher `@id` (`site.ts:40-53`).
- `NewsArticle`/`Article`/`Review` are typed correctly (`Article.astro:53-58`).
- `reviewRating` matches the visible score and has best/worst values; the author is a `Person` with a URL.
- Author `Person` includes `knowsAbout`.
- No HowTo or FAQPage.

| Sev | Finding | Evidence | Fix |
|---|---|---|---|
| **Critical** | **Fabricated `AggregateRating`.** | `Game.astro:69` `ratingCount: Math.max(1, posts.length)`. Live on `/games/onimusha-way-of-the-sword/`: `ratingValue 8.2, ratingCount 3`. 9 URLs. | Delete it. Re-add only when `userScore`/`userVotes` hold real votes. |
| High | **Homepage `WebSite` is orphaned: no Organization, no `sameAs` anywhere.** | `Home.astro:123-130`; `grep sameAs src` returns nothing. | Emit `[Organization, WebSite]` with `publisher: {'@id': orgId}`, and add `sameAs` in `site.ts:42-53`. `Base.astro:23` already accepts arrays. Ready-to-paste JSON is in `findings/schema.md`. Only list profiles that actually exist. |
| Medium | **`dateModified` isn't tied to corrections.** | `Article.astro:62`; `content.config.ts:37,64`. | A zod `.refine()`: if corrections exist, `updated` must be set and no earlier than the latest one. |
| Low | `itemReviewed` has no `url`; `image` is a single ratio. | `Article.astro:81`. | Link `itemReviewed` to the game hub. Multi-ratio images are optional. |
| Low | `VideoGame.publisher` is set to the studio, as plain text. | `Game.astro:63`. | Use `author`/`creator` for the studio, or make publisher an `Organization`. |

## Performance: 75 (lab only)

| Page (mobile, lab) | LCP | FCP | TBT | CLS |
|---|---|---|---|---|
| Home | 2.54s | 1.52s | 28ms | 0 |
| Review | 10.3s ⚠ one run, included a 5.25s lab TTFB anomaly | 2.9s | 0ms | 0 |

Real-world TTFB from curl on a cache HIT was 55–100ms. PSI returned 429 (no key), so there is no field data.

**Works:**
- The LCP image is eager with `fetchpriority=high`.
- `width`/`height` are set on every image, so CLS is 0.
- Ads are consent-gated, so they cause no pre-consent CLS.
- TBT is negligible.
- Media assets have immutable one-year caching.

| Sev | Finding | Evidence | Fix |
|---|---|---|---|
| High | **The hero srcset has no small variants.** `Article.astro:109` asks for `[900,1440,1920]`, and 900w doesn't exist (404). `Fig.astro:37-39` keeps only exact matches, so the live srcset is `1440w, 1920w` even though 480w (35 KB), 720w (77 KB) and 1080w (170 KB) exist. | Live srcset on the Onimusha review; `curl` of each variant. | Root cause: in `Fig.astro`, map each requested width to the nearest available variant, so every caller is protected. Minimal alternative: `widths={[480,720,1080,1440,1920]}` at `Article.astro:109`. Then re-run Lighthouse. |
| Medium | **Three font preloads compete with the LCP image.** 41% of the homepage LCP is element render delay. | Lighthouse `lcp-breakdown`. | Keep the Chakra preload only if Chakra renders above the fold; drop the JetBrains Mono preload. |

## Images: 78

**Works:**
- Every image has `width`/`height`.
- Responsive WebP.
- Per-article 1920×1080 `og:image`.
- Hero alt comes from `coverCaption`.
- The 1,247 empty alts are on card thumbnails that sit next to their title links, which is correct. **Keep them.**

| Sev | Finding | Fix |
|---|---|---|
| High | No `max-image-preview:large` (`Base.astro:102` only emits `noindex`). | Emit it on every indexable page. |
| Medium | The body screenshot has an empty alt despite a figcaption (`Article.astro:176`). | `alt={bodyShotCaption ?? ''}`. |
| Medium | No image sitemap entries (see `findings/sitemap.md`). | Add `<image:image>` for cover and hero in `src/pages/sitemap.xml.ts:97-106`. |
| Low | `og:image` has no width, height or alt (`Base.astro:109`). | Add all three. |

## AI search readiness: 61

**Works:**
- AI bots are allowed and get 200.
- `llms.txt` is well formed, and all its URLs resolve.
- Every article has a `.md` alternate, advertised with `rel="alternate" type="text/markdown"`.
- SSR delivers the full text.
- No leftover "Gridshift" strings.

| Sev | Finding | Fix |
|---|---|---|
| High | The Organization entity isn't anchored: the homepage is orphaned and there's no `sameAs`. This is the same fix as the Schema row. | See Schema. |
| Medium | llms.txt repeats the unmet correction-log claim. | Resolved by fixing the correction log. |
| Low | Passages run 17–85 words, which is short for extraction. | An editorial habit, not a template bug. Where an H2 asks a question, answer it in the first 2–3 sentences. Don't pad. |
| Low | llms.txt lists 27 of 126 URLs. | Fine as a curated list. Confirm it's generated, not hand-maintained. |

## Visual and mobile: 84

Screenshots are in `screenshots/`.

**Works:**
- On mobile, the H1, hero and byline all fit above the fold.
- No horizontal overflow.
- The imagery-led layout holds up at 390px.

**Findings:**
- **Medium:** the consent banner (149px) plus the tab bar (54px) take up about 24% of a 390×844 viewport (`home-mobile.png`). Compact the banner to one line.
- **Low:** most small tap targets are breadcrumbs and tag pills. Pad their hit area to 44px without changing how they look.
- **Info:** body text is 15px on mobile; consider 16px.
- **Not assessed:** the "papier" light theme, and ads after consent.

## Sitemap: 82

**Works:**
- Valid XML.
- All entries are 200 and indexable.
- Hreflang clusters balance at 42/42/42.
- `lastmod` is real per-page data.
- Tag pages and legal `lastmod` are excluded on purpose.

**Findings:**
- **Medium:** no image entries.
- **Medium, conditional:** no Google News sitemap. Build it only if News/Top Stories is a goal.
- **Low:** `lastmod` values are always on the hour (seed data).

---

## Synthesis

**Observed.** The build and crawl surface are no longer the constraint: technical 83, sitemap 82, CLS 0. The remaining findings fall into three groups:
1. Trust claims the code doesn't honour.
2. Discovery plumbing for a new domain: Discover, the entity graph, Bing via IndexNow, the image sitemap.
3. One shared-component bug (`Fig`) that costs mobile bytes on every article.

**Connected.** The trust group is also a single mechanism: *corrections*. A correction must:
- appear in the log (content)
- bump `dateModified` (schema)
- purge the edge cache (technical)
- ping IndexNow (technical)

Today none of the four links exists. Building it as one D1 publish hook fixes four findings in three categories and makes the site's most distinctive promise verifiable.

**Validated.** The findings from specialists were checked before inclusion:
- AggregateRating: live JSON plus source.
- Correction log: source grep plus the live About page and llms.txt.
- Tagline: review frontmatter.
- Hub promise: live HTML.
- `Fig` srcset: live srcset plus variant status codes.

Three specialist items were rejected:
- HowTo schema (deprecated).
- "Missing alt" on card thumbnails (they're correctly empty).
- A "Critical" rating on a meta description.

**Not claimed.** There's no field-data CWV verdict, no ranking or traffic data, and no statement on real-IP bot access. Each needs Search Console, a PSI key or the Cloudflare dashboard.

See `ACTION-PLAN.md` for the sequenced fixes, each with a failure check and a leading indicator.
