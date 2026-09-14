# On-page SEO — autnic.com

Audited live, 2026-09-10. Source: `crawl.json` (all 126 sitemap URLs, en/fr/de).

**Score: 85 / 100.** The fundamentals are clean on every URL. What remains is
template copy and cross-language title collisions.

## What works

- All 126 sitemap URLs return 200 and are self-canonical. None is noindexed, and each has exactly one H1.
- The `<title>` and H1 are split well. The title is short and query-led, and the H1 carries the hook:
  - title: `Onimusha: Way of the Sword review — Autnic` (42 chars)
  - H1: `Onimusha: Way of the Sword review: twenty years on, Capcom builds a sword game that refuses to be Sekiro`

  Every English article title is 39–51 chars, so none truncates in the SERP.
- There are no duplicate meta descriptions anywhere, and every article description falls between 70 and 165 chars.
- Hreflang runs in both `<head>` and the sitemap, with localized slugs.
- The homepage links directly to all 21 articles and all 7 game hubs, so crawl depth stays at 1–2.

## Findings

### Low: template filler heading on the homepage
- **Evidence:** `https://autnic.com/` has `<h2 class="pick-h" id="pick-h">Your ultimate gaming blog</h2>` above the section pills.
- **Why it matters:** it's the only generic line on a page whose H1 is "Independent reviews, guides and news for live-service games". "Blog" undersells the positioning and reads as leftover boilerplate.
- **Fix:** the pills heading is in `src/views/Home.astro`, with its copy in `src/i18n`. Replace it with something the section actually is, e.g. "Pick a section", or visually hide it and keep it for `aria-labelledby`.
- **Failure check:** grep the live HTML of all 3 homepages for "ultimate gaming blog". It should return 0.

### Low: identical titles across languages
- **Evidence:** these titles are the same on the en/fr/de URLs:
  - `Star Wars: Knights of the Old Republic – Remake — Autnic` (game hubs)
  - `The Witcher 3: Wild Hunt – Remastered — guides — Autnic`
  - `Lina Morel — Autnic`, `Nour Benali — Autnic`, `Sacha Vidal — Autnic` (author pages)
  - `Cookies — Autnic`
- **Why it matters:** hreflang disambiguates, so this isn't a penalty. But game-hub titles carry no query intent in any language.
- **Fix:** give hub titles a localized suffix that names what the page holds, e.g. `KOTOR Remake: news, guides & review — Autnic` / `… : actus, guides et test` / `… : News, Guides & Test`. Keep them under 60 chars.
- **Failure check:** after the next deploy, `crawl.json` should show no title shared between locales, except on legal pages.

### Low: section hubs are thin
- **Evidence:** word counts, including navigation:
  - `/reviews/`: 254
  - `/games/`: 238
  - `/de/spiele/`: 232
  - `/de/tests/`: 253
  - `/de/guides/`: 254

  Each hub lists 4 items.
- **Fix:** add 60–120 words of intro per hub explaining how reviews are scored and re-checked. That copy is also the most citable statement of the editorial method. Don't pad; this fixes itself as article volume grows.
- **Failure check:** when Search Console coverage is available, the hubs should appear under "Indexed", not "Crawled – currently not indexed".

### Info: short meta descriptions on legal pages
- **Evidence:** these 10 legal pages have 41–69 character descriptions, e.g. `/de/impressum/` (41) and `/legal-notice/` (42).
- **Fix:** none needed. These pages don't compete for queries.
