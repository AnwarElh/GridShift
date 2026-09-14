> **Coordinator note (2026-09-10):** three items below are overridden in FULL-AUDIT-REPORT.md.
> - The HowTo schema suggestion is dropped: Google deprecated HowTo rich results and this audit never recommends them.
> - "Alt text missing" is dropped. Those images carry an empty `alt`, and on cards that sit next to title links an empty alt is correct. The real alt gap is the article body screenshot; see findings/images.md.
> - The GTA VI hub item is re-rated from Critical to Medium: a meta description that over-promises does not block indexing.

# SXO Analysis — autnic.com (5 target pages)

Method note: `scripts/render_page.py` could not run in this environment (`requests` module not
installed — confirmed by import traceback). Fell back to `curl` for raw HTML (Autnic is D1 SSR,
not a JS SPA, so raw HTML == rendered content — no Playwright pass needed) plus the existing
`autnic.com-audit/crawl.json` snapshot for meta-level facts. SERP data comes from WebSearch
(Google-backed), capped at the results the tool returned (5–8 organic links per query, not a
full top-10 SERP scrape — no PAA/ads/related-searches panel data available this way). Every
finding below is cited to either on-page HTML/schema or a specific WebSearch result.

---

## 1. Onimusha: Way of the Sword review
**Target:** `/reviews/onimusha-way-of-the-sword-review/` · Query: "onimusha way of the sword review"

**SERP:** [Metacritic](https://www.metacritic.com/game/onimusha-way-of-the-sword/), [GameSpot](https://www.gamespot.com/reviews/onimusha-way-of-the-sword-review/), [GamingTrend](https://gamingtrend.com/reviews/onimusha-way-of-the-sword-review/), [RPG Site](https://www.rpgsite.net/review/21251-onimusha-way-of-the-sword-review-capcom), [PC Gamer](https://www.pcgamer.com/games/action/onimusha-way-of-the-sword-review/), [GamesRadar+](https://www.gamesradar.com/games/action/onimusha-way-of-the-sword-review/).
Dominant type: **Review (Blog Post subtype)** — 5/6 are single-outlet scored reviews, 1 is an aggregator. Confidence ~85%.

**Page type match:** Autnic page is a scored review with `Review`+`Rating`+`Person`+`Organization` JSON-LD, byline (Sacha Vidal), H2 verdict/pros-cons structure. **ALIGNED.**

**What ranking pages give that Autnic doesn't:**
- GamesRadar's title carries a quoted hook straight into the SERP: *"It's no Sekiro, but goofiness, accessibility, and tight combat help this rough diamond shine"* — Autnic's `<title>` ("Onimusha: Way of the Sword review — Autnic", 42 chars) is query-accurate but has zero emotional hook, even though it has 15+ spare characters of budget.
- No video-review embed (GameSpot/PC Gamer outlets typically pair text + video).
- No visible "how we reviewed" / hardware-tested-on block near the byline (crawl.json confirms `dateModified` == `datePublished` — no revision trail is rendered anywhere despite the site's stated "we revise scores" positioning).
- 9 of 10 images missing `alt` text (crawl.json: `img_noalt: 9`).

**What Autnic gives that most competitors don't:** an explicit "we buy what we review" ownership disclosure — genuine E-E-A-T differentiation vs. outlets running on publisher review copies — but it lives in the site-wide tagline, not restated near the byline/score on this specific page, so it doesn't travel with the content when shared or excerpted.

**User story:** As a **player deciding whether to buy day-one** (signal: GamesRadar/PC Gamer titles framing the verdict as "no Sekiro, but..." — a comparison-to-known-quantity hook), I want a fast, confident verdict I can trust wasn't bought by Capcom, because $60-70 titles are a real spend, but I'm blocked by not being able to see that trust signal (the "we buy what we review" claim) anywhere near the score itself.

**Persona scores:**
| Persona | Relevance | Clarity | Trust | Action | Total |
|---|---|---|---|---|---|
| Day-one buyer (from GamesRadar/PCGamer hook framing) | 22/25 | 18/25 | 14/25 | 10/25 | 64/100 (Good) |
| Genre comparer, "is it like Sekiro/DMC" (from PAA-style framing across outlets) | 20/25 | 19/25 | 15/25 | 12/25 | 66/100 (Good) |

**SXO Gap Score (7-dim): 72/100.**

---

## 2. The Blood of Dawnwalker review
**Target:** `/reviews/the-blood-of-dawnwalker-review/` · Query: "blood of dawnwalker review"

**SERP:** [OpenCritic](https://opencritic.com/game/20499/the-blood-of-dawnwalker) (85 avg, "Mighty", top 7%, 93% recommend), [RPG Site](https://www.rpgsite.net/review/21252-the-blood-dawnwalker-review), [PC Gamer](https://www.pcgamer.com/games/rpg/the-blood-of-dawnwalker-review/), [Game Informer](https://gameinformer.com/review/the-blood-of-dawnwalker/time-doesnt-heal-all-wounds), [Metacritic](https://www.metacritic.com/game/the-blood-of-dawnwalker/).
Dominant type: **Review**, same pattern as Onimusha. Confidence ~85%.

**Page type match: ALIGNED.** Same schema pattern (`Review`+`Rating`), 1700 words, H1 already states the mechanical hook (30 days / 8 segments).

**Gaps vs. SERP:** identical structural pattern to Onimusha — no aggregate-score comparison (competitors' framing leans on "top 7%, 93% recommend" as a trust anchor; Autnic has no equivalent "how this compares to the field" line), 9/10 images missing alt text, no dateModified trail, no video.
**Strength vs. SERP:** Game Informer's own title framing ("Time Doesn't Heal All Wounds") shows the field rewards a clock/time-mechanic hook — Autnic's H1 already nails this ("thirty days, eight segments a day") but it never reaches the `<title>` tag (39 chars, all hook stripped, "The Blood of Dawnwalker review — Autnic").

**User story:** As a **Witcher 3 fan sizing up a new studio's debut** (signal: multiple outlets frame the review around comparison to The Witcher 3 and combat quality), I want to know quickly if the combat holds up or is "just" the writing that's good, because I don't want another all-story-no-combat RPG, but I'm blocked by having to read past the H1 hook to find the combat verdict — it's not surfaced in the title or above the fold.

**Persona scores:**
| Persona | Relevance | Clarity | Trust | Action | Total |
|---|---|---|---|---|---|
| Witcher-3-comparison shopper | 20/25 | 15/25 | 15/25 | 11/25 | 61/100 (Good) |
| Score-first skimmer (from OpenCritic "Mighty"/93%-recommend framing) | 19/25 | 17/25 | 13/25 | 10/25 | 59/100 (Needs Work) |

**SXO Gap Score: 71/100.**

---

## 3. GTA 6 stealing cars guide
**Target:** `/guides/grand-theft-auto-vi-stealing-cars-guide/` · Query: "gta 6 how to steal cars"

**SERP:** [GTABase guide](https://www.gtabase.com/articles/gta-6/gta-6-car-stealing-guide-how-to-steal-sell-keep-vehicles), [GameSpot](https://www.gamespot.com/articles/gta-6-how-to-steal-cars/) (x2 variants), [GamesRadar+](https://www.gamesradar.com/games/grand-theft-auto/gta-6-how-to-steal-cars/), [Deltia's Gaming](https://deltiasgaming.com/gta-6-carjacking-how-to-steal-different-types-of-vehicles/), [allthings.how](https://allthings.how/gta-6-how-to-steal-cars-with-a-slim-jim-and-get-away-clean/), [Kotaku](https://kotaku.com/for-the-first-time-in-25-years-gta-6-will-make-stealing-cars-hard-2000729419).
Dominant type: **fragmented** — roughly half guide/how-to sites, half news-analysis pieces (GTA 6 isn't out; nobody can write a true step-by-step yet). No page type clears 60%. Confidence: mixed, ~55% lean Guide.

**Page type match:** Autnic's page (`Article` schema, narrative H2s: "Two situations, and neither is one button" / "The tracker is the real change" / "Know before you steal: the WAINK app") is **content-aligned** — it already covers the same specifics the SERP covers (slim jim minigame, vehicle security tiers, WAINK-style scanner, key-cloning/relay attack) confirmed against GameSpot/GamesRadar's reporting. This is the strongest content match of the five pages.

**Gap:** schema is generic `Article`, not `HowTo`/`FAQPage` — when the game ships and query intent shifts from "what will this be like" to "how do I do X," Autnic has no structured markup ready to capture a HowTo rich result the way GTABase or Deltia's Gaming (both HowTo-shaped guide sites) likely will. 8/9 images missing alt text.
**What Autnic gives that competitors don't:** a named companion-app framing ("Waink app") tied together with the tracker mechanic in one narrative read, vs. competitors' more fragmented "here are 3 separate features" listicle style.

**User story:** As a **GTA veteran expecting the old "hold Triangle" shortcut** (signal: Kotaku's framing "for the first time in 25+ years... will make stealing cars hard," GameSpot's "completely changing how you steal cars"), I want to know exactly what's different before launch so I'm not caught off guard, because muscle memory from GTA V won't work, but I'm blocked by not having a scannable step list to skim quickly (page is prose-first, no numbered `<ol>` breakdown of "situation A vs situation B").

**Persona scores:**
| Persona | Relevance | Clarity | Trust | Action | Total |
|---|---|---|---|---|---|
| GTA-V veteran relearning mechanics | 22/25 | 16/25 | 17/25 | 12/25 | 67/100 (Good) |
| First-time pre-release researcher wanting a quick list | 18/25 | 13/25 | 15/25 | 10/25 | 56/100 (Needs Work) |

**SXO Gap Score: 62/100.**

---

## 4. FF7 Revelation editions
**Target:** `/setup/final-fantasy-vii-remake-trilogy-revelation-editions/` · Query: "ff7 revelation editions"

**SERP:** [GameStop product page](https://www.gamestop.com/video-games/products/final-fantasy-vii-revelation/20035614.html) (buy button, price, SKU), [Square Enix official store](https://na.store.square-enix-games.com/final-fantasy-vii-revelation) + [press release](https://press.na.square-enix.com/FINAL-FANTASY-VII-REVELATION-RELEASES-APRIL-8-2027-ON-PHYSICAL-AND-DIG), [FandomWire](https://fandomwire.com/final-fantasy-7-revelation-editions-prices-pre-order-bonuses-explained/) and [TheGamer](https://www.thegamer.com/final-fantasy-7-revelation-collectors-edition-sold-out-already/) editorial comparisons, [Vice](https://www.vice.com/en/article/final-fantasy-7-revelation-collectors-edition-deluxe-pre-order/) news.
Dominant type: **mixed Product Page (official retailer/publisher, ~40%) + Comparison Page (editorial "here's what's in each edition," ~60%)**. This is the one query in the set where the SERP literally contains transactional Product pages with live buy buttons and prices.

**Page type match: HIGH mismatch.** Confirmed by direct HTML inspection: Autnic's page carries only `Article` schema (no `Product`, `Offer`, or `Table`/`ItemList`), and **`grep -oc '<table'` returns 0** — there is no comparison matrix on a page whose entire premise (per its own H1: "Every Final Fantasy VII Revelation edition, what each one actually adds...") is a 6-edition, $69.99–$349.99 price/contents comparison. The only purchase-adjacent link found on the page is an internal `/tag/pre-order/` tag link — no outbound link to GameStop, Square Enix Store, or any retailer, despite competitors' pages being built entirely around that link.

**What ranking pages give that Autnic doesn't:** a scannable price/contents table, live buy/pre-order CTAs, stock-status info (TheGamer's whole story is that the Collector's Edition **already sold out** — a freshness-critical fact Autnic's page cannot currently reflect structurally since it has no per-edition status field).
**What Autnic gives that competitors don't:** editorial judgment ("The one thing to actually decide," "What we would do") — genuinely useful decision-simplification that GameStop/Square Enix's own product pages can't offer (they're not going to tell you not to buy the $349.99 one).

**User story:** As a **budget-conscious pre-order shopper comparing 6 SKUs** (signal: FandomWire/TheGamer running dedicated "prices & bonuses explained" pieces, GameStop and Square Enix Store both ranking with live buy buttons), I want a single table of price vs. contents so I don't have to open 6 tabs, because $349.99 is a lot to spend on a statue I might not want, but I'm blocked by Autnic's page being prose-only with no table and no direct link to actually buy the edition it recommends.

**Persona scores:**
| Persona | Relevance | Clarity | Trust | Action | Total |
|---|---|---|---|---|---|
| Comparison shopper picking one SKU | 20/25 | 10/25 | 16/25 | 6/25 | 52/100 (Needs Work) |
| Ready-to-buy fan (signal: GameStop/SE Store both ranking = high commercial intent) | 12/25 | 12/25 | 14/25 | 4/25 | 42/100 (Needs Work, borderline Critical) |

**SXO Gap Score: 46/100 — weakest of the five.**

---

## 5. GTA VI hub page
**Target:** `/games/grand-theft-auto-vi/` · Query: "gta 6"

**SERP:** [Rockstar's own YouTube trailer](https://www.youtube.com/watch?v=wSm9GTUttBs), [Variety news](https://variety.com/2026/gaming/news/gta-6-release-details-1236846230/), an itch.io listing, a Substack post, a TechRadar tag-archive page. No independent games-media "hub"/game-database page appears in what WebSearch surfaced for the bare 2-word branded term.
Dominant type: **Official/Video/News**, fragmented outside that — no third-party "hub" page pattern at all. Confidence in "hub pages don't compete here": high, by absence.

**Page type match: CRITICAL, but reframe it correctly** — this isn't "wrong page type," it's "wrong keyword tier." A hub/aggregator page (VideoGame schema, links out to Reviews/Guides/News/Setup — confirmed via H2s "All our coverage," "Reviews," "Guides," "News," "Setup") is the *right* page type for Autnic's own game-topic architecture. It cannot realistically out-rank Rockstar's own trailer and Variety on the bare branded head term at this stage of the hype cycle, no matter how well built. Trying to win "gta 6" itself is not a fixable SXO problem — it's a keyword-tier mismatch. The page's real job is to be the internal-linking spine that helps `/reviews/`, `/guides/`, `/news/` rank for their own long-tail terms, and to rank itself for modifiers like "gta 6 guides" / "gta 6 reviews autnic" once those have search volume.

**Concrete, fixable bug found independent of ranking strategy:** the page's own `<meta description>` promises "our score, the version we tested it on, **where to buy it**, and every review, guide and news story..." — but direct HTML inspection found **no buy/pre-order/retailer link anywhere in the rendered body** (only the meta-description string itself contains the phrase). The page is describing a CTA it doesn't deliver. Also: `ld` shows only `VideoGame` + `BreadcrumbList` — no `ItemList` tying together the reviews/guides/news it links to, so Google has no structured signal of "this page aggregates N pieces of coverage."

**What Autnic gives that the SERP doesn't:** a genuinely useful single destination pulling together every piece of Autnic's own GTA6 coverage (news/guides/reviews/setup) — which Rockstar's trailer and Variety's single article obviously don't offer. That's real value; it's just not going to win the head term.

**User story:** As a **fan who just watched the trailer and wants "everything in one place"** (signal: SERP is trailer + single news article, no aggregator — an unmet need), I want one page that links every Autnic piece about this game, because I don't want to search "gta 6" five separate times as news drops, but I'm blocked by the page's own promised CTA ("where to buy it") not existing, which breaks trust the moment I look for it.

**Persona scores:**
| Persona | Relevance | Clarity | Trust | Action | Total |
|---|---|---|---|---|---|
| Coverage aggregator ("show me everything Autnic has") | 22/25 | 20/25 | 15/25 | 14/25 | 71/100 (Good) |
| Pre-order/buy-intent visitor (signal: meta description's own "where to buy it" promise) | 8/25 | 10/25 | 8/25 | 4/25 | 30/100 (Critical Mismatch) |

**SXO Gap Score: 48/100.**

---

## Cross-page pattern: title vs. H1 hook split

Measured directly:

| Page | `<title>` length | Hook in title? | H1 length |
|---|---|---|---|
| Onimusha review | 42 | No | 104 |
| Dawnwalker review | 39 | No | 113 |
| GTA6 car guide | 41 | No | 125 |
| FF7 editions | 41 | No | 126 |
| GTA6 hub | 54 | No | 19 |

None of the five `<title>` tags are anywhere near Google's ~60-char truncation point — they're 39–54 characters, all query-accurate, all with 10–20 characters of unused budget. **The long, clever construction the brief asks about lives entirely in the H1, which Google does not use for the SERP snippet unless it overrides the title** (it does this when the title is judged low-quality or mismatched — not the risk here, since these titles are accurate). The actual problem is the inverse of the one hypothesized: the hooks are safely tucked into H1s that never reach the SERP, while the titles that do reach the SERP are correct but flat. Competitor titles (GamesRadar's Onimusha title, Game Informer's Dawnwalker title) put a compressed version of the hook *inside* the title tag. Fix: borrow 15–20 characters of hook into the title, not the H1 — e.g. `Onimusha: Way of the Sword review — not another Sekiro (Autnic)` variants that keep "review" + query term intact while adding the comparison hook. Do not shorten or de-hook the H1s themselves — H1 hooks matter for on-page engagement and match Autnic's image-led, magazine-style identity; this is a title-tag-only fix.

---

## Limitations

- WebSearch does not expose Google's PAA boxes, ad copy, related-searches panel, or AI Overview content directly — user stories above are derived from ranking-page titles/snippets and article content only, not full SERP-feature scraping. DataForSEO MCP tools were not invoked (not confirmed available in this environment) — noted per skill fallback rules.
- `scripts/render_page.py --mode auto` (the skill's prescribed fetcher) could not execute: the `requests` package is not installed in this environment, which its SSRF guard (`url_safety.py`) hard-requires. Fell back to direct `curl` per the shared context's explicit guidance ("Python requests is NOT installed; use curl or stdlib"). Autnic is confirmed server-rendered (D1 SSR, per prior project memory), so raw HTML and rendered HTML should be equivalent — no SPA-shell risk — but no Playwright screenshot/visual check was performed.
- Word counts and image/alt counts are taken from the existing `crawl.json` snapshot (dated at audit-run time) cross-checked against fresh `curl` pulls of the same 5 URLs; no historical ranking-position or Search Console data was available, so this is a structural/content-gap analysis, not a verified traffic-impact analysis.
- Competitor word counts/depth are estimated from search-result snippets and article structure, not full competitor page fetches (out of scope — target site is read-only for this audit, and fetching 25+ third-party competitor pages was not performed).
- Did not assess Core Web Vitals, mobile rendering, or actual visual above-the-fold layout (no screenshot capture run).

## Cross-skill handoff
- FF7 editions page: missing `Product`/`Offer`/comparison schema → recommend `/seo schema` to generate it, and `/seo page` for the table/CTA restructure.
- All 5 pages: 8–15 images missing `alt` text each → recommend `/seo images`.
- GTA6 hub: broken meta-description promise ("where to buy it") + missing `ItemList` schema → recommend `/seo page` for a scoped fix (do not re-architect the hub, just close the promise/delivery gap).
- Review pages: no visible correction-log/revision-history module despite site-wide "we revise scores" positioning → recommend `/seo content` for an E-E-A-T pass surfacing this trust signal on-page, not just in the tagline.
