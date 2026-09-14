# Autnic.com — GEO / AI Search Readiness Audit

Date: 2026-09-10. Live-site audit via curl (UA-spoofed) plus repo cross-check (`/Users/anwarelhamdi/Desktop/amin/gridshift`, read-only). Brand renamed Gridshift → Autnic on 2026-09-08.

## Score: 61 / 100

| Dimension | Weight | Score | Notes |
|---|---|---|---|
| Citability | 25% | 60/100 | Good structure, but passages run ~60-85 words, under the 134-167w citation sweet spot |
| Structural Readability | 20% | 80/100 | Clean H2s, breadcrumbs, semantic `<main>`, short paragraphs |
| Multi-Modal Content | 15% | 45/100 | Hero images present; no video, no data tables/charts seen |
| Authority & Brand Signals | 20% | 40/100 | Organization/Person schema exists but disconnected from homepage, zero `sameAs`, brand 2 days old |
| Technical Accessibility | 20% | 85/100 | Robots.txt clean for declared bots, SSR delivers full content pre-JS, `.md` alternates work |

## AI Crawler Access (as served to curl, UA-spoofed)

| Bot | robots.txt | Homepage fetch | Notes |
|---|---|---|---|
| GPTBot | Allow: / (200) | 200 | UA-spoofed only — no IP-verified test possible from this environment |
| ClaudeBot | Allow: / (200) | 200 | same caveat |
| PerplexityBot | Allow: / (200) | 200 | same caveat |
| Bingbot | Allow: / (200, via `User-agent: *`) | not fetched with real Bing UA on article pages | same caveat |
| OAI-SearchBot, ChatGPT-User, Claude-Web, Google-Extended, Applebot-Extended, CCBot | all `Allow: /` | not individually re-fetched (identical robots.txt body for all UAs tested) | robots.txt content is UA-independent (same static file), so this covers them |

The Cloudflare-injected managed robots.txt the team has hit before is **not present today** — `curl -A GPTBot https://autnic.com/robots.txt` and the default UA return byte-identical `Allow: /` blocks. **Caveat, repeated per brief: UA spoofing cannot reproduce Cloudflare's IP-verified bot rules or Bot Fight Mode/AI Crawl Control edge blocks.** A blocked real crawler would still see `Allow: /` in robots.txt while getting challenged at the edge — this requires checking the Cloudflare dashboard (AI Crawl Control, Bot Fight Mode, WAF custom rules) directly, which is outside curl's visibility.

## llms.txt

Present, 200, well-formed. Lists 7 games, 8 news, 4 reviews, 4 guides, 4 setup pages, links to `/about/`, `/fr/`, `/de/`. All 9 sampled URLs resolved 200. It is **not a full mirror of the sitemap** by design (sitemap has 126 URLs across en/fr/de incl. author pages and legal pages; llms.txt lists the curated EN news/reviews/guides set) — that's a reasonable curation choice, not a defect, but it means llms.txt undercounts as content grows (it's a snapshot, not generated from the content collection — unverified whether it's build-time generated or hand-maintained; grep in repo for an `llms.txt` generator would confirm, not done here).

## Markdown alternates (`<url>.md`)

Confirmed on `/reviews/onimusha-way-of-the-sword-review/`: `<link rel="alternate" type="text/markdown" href="https://autnic.com/reviews/onimusha-way-of-the-sword-review.md">`. Fetching that exact URL (no trailing slash before `.md`) returns 200 with clean frontmatter-style metadata (Source, Published, Author, Game, Score, Tested-on-version) followed by the full body, consistent with the HTML version. Per the coordinator's confirmed fact, `src/layouts/Article.astro:89` passes the `markdown=` prop that drives this link — matches what's live.

## Findings

**[High] Homepage JSON-LD is an orphaned WebSite node — no Organization, no link to the Organization that already exists**
Evidence: `https://autnic.com/` JSON-LD is only `{"@type":"WebSite","name":"Autnic","url":...}` (no `publisher`, no `@id`). Meanwhile every article's `publisher` field points at `"@id":"https://autnic.com/#organization"`, and `/about/` fully defines that node (Organization, logo, 3 employees) — confirmed in `src/views/About.astro:129-134`, which explicitly comments "le même `@id` que celui porté par le `publisher` de chaque article." The Organization entity is real and correctly ID'd site-wide except on the one page (home) most likely to be an AI system's entry point.
Fix: `src/views/Home.astro:123-130` — add `publisher: { '@id': orgId }` (import `orgId` from `src/site.ts:40`) to the WebSite jsonLd object, same pattern already used elsewhere.
How we'd know it failed: re-fetch `https://autnic.com/` JSON-LD and confirm it still has no `publisher`/`Organization` reference.

**[High] Organization has zero `sameAs` — no entity disambiguation for a two-day-old brand name**
Evidence: `publisher` object in `src/site.ts:42-53` has no `sameAs` key; confirmed absent in both the live article JSON-LD and the live `/about/` Organization JSON-LD. Homepage HTML has a `<meta name="twitter:site" content="@autnic">` tag but this is never reflected in structured data. No YouTube, Reddit, Wikipedia, or LinkedIn links found anywhere in homepage or article HTML (grepped for all five domains, zero matches).
Fix: `src/site.ts:42-53` — add `sameAs: [...]` array to `publisher` with the real X/Twitter, YouTube, etc. profile URLs once they exist. Per the brand-mention correlation table, YouTube (~0.737) and Wikipedia presence are the strongest citation signals — those need to exist as real, followed profiles before `sameAs` claiming them helps; adding `sameAs` to a profile with zero followers doesn't create authority, it just declares an entity.
How we'd know it failed: `sameAs` still absent from `/about/` Organization JSON-LD, and a web search for "Autnic" surfaces no independent (non-autnic.com) results — unverified in this pass; a live web search for brand recognition was not run before the stop instruction, flagging as **unverified, not guessed**.

**[Medium] Passages run well under the 134-167 word citation sweet spot**
Evidence: sampled `<p>` blocks inside `<main>` on 3 articles (review, news, guide) — word counts were 63, 82, 65, 73, 77, 69 (review); 65, 61, 33, 18, 65, 61 (news); 70, 17, 51, 32, 39, 24 (guide). Every paragraph is shorter than the target range; several (17-33w) are well below it. Headings are decent but not uniformly question-shaped: "Where the review turns" and "Why we still landed at 8.2" (question-adjacent) vs. "The tracker is the real change" (statement). Two consecutive paragraphs under one H2 often sum to ~140-160w, which is close to optimal if an extractor treats a section as the unit — but a single-paragraph extractor (which is common) will pull an under-length passage.
Fix: no specific file:line — this is prose density, an editorial pattern, not a template bug. If addressed, it belongs in the writing style guide, not the codebase.
How we'd know it failed: re-sample paragraph word counts on new articles and still see a majority under 130w.

**[Medium] "Dated correction log" claim in llms.txt is not observable on the sampled article**
Evidence: `llms.txt` line 9 says "Every article carries a dated correction log. Published text is never edited silently." On the sampled review (`onimusha-way-of-the-sword-review`), `datePublished` equals `dateModified` (`2026-09-04T06:00:00.000Z` both) and no correction-log UI element or text was found near the byline or elsewhere in the rendered HTML. Per the coordinator's confirmed fact, this is populated on zero articles site-wide — consistent with what was independently observed here. This is a trust-signal claim made to AI crawlers (via llms.txt) that isn't yet backed by visible evidence on-page, which matters for citability, since "we buy what we review and revise scores" is exactly the kind of differentiator worth quoting.
Fix: no file:line identified in this pass (correction-log rendering component not located before the stop instruction) — needs a follow-up grep for wherever revision/correction data is meant to surface in `src/layouts/Article.astro` or similar.
How we'd know it failed: any article with a real correction still shows `datePublished == dateModified` and no correction text.

**[Low] llms.txt is a curated subset, not a sitemap mirror — fine today, will silently under-represent content as it grows**
Evidence: sitemap.xml has 126 URLs (en/fr/de incl. author and legal pages); llms.txt lists 27 EN content URLs + about + fr/de home. Whether llms.txt generation is automated from the content collection or hand-maintained was not verified (would require checking for a build script — not located in the time available).
Fix: unverified — flag for follow-up, not a confirmed defect.
How we'd know it failed: a newly published article doesn't appear in `/llms.txt` after the next deploy.

**[Info] No leftover "Gridshift" strings found**
Evidence: grepped homepage, sampled article HTML, llms.txt, sitemap.xml, robots.txt, and the author page for "gridshift" (case-insensitive) — zero matches across all. The rename appears clean on these surfaces. Not exhaustive (only a handful of pages checked, not the full site).

**[Info] Author entities are well-formed**
Evidence: `/author/sacha-vidal/` has `Person` JSON-LD with `jobTitle`, `description` (bio), `worksFor` linked via the same `#organization` `@id`, and `knowsAbout`. No `sameAs` on Person either (same gap as Organization). 3 author pages exist in sitemap (Lina Morel, Nour Benali, Sacha Vidal) and About page lists all 3 as `employee`.

**[Info / Unverified] Platform-specific checks not completed before stop instruction**
Not verified in this pass, flagging rather than guessing:
- Bing indexing status and IndexNow usage — repo has `scripts/indexnow.mjs`, not inspected for correctness or whether it fires on publish.
- Live web search for "Autnic" brand recognition (Wikipedia/Reddit/YouTube presence, any existing citations in ChatGPT/Perplexity) — not run.
- DataForSEO live visibility checks — not attempted (tool availability not confirmed).
- Real IP-verified crawler behavior (vs. UA-spoofed) — inherently outside curl's capability, noted above.

## What works

- robots.txt is clean today for all AI bots the brief lists (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended, Applebot-Extended, CCBot) — all `Allow: /`, matching the site's own declared file, no Cloudflare override observed via curl.
- `/llms.txt` exists, is well-formed, dated, and every sampled URL resolves.
- Every article ships a working `.md` alternate with clean frontmatter-style metadata (source, date, author, game, score) ideal for LLM ingestion.
- SSR delivers full article text with zero JS required — confirmed by diffing curl output against expected content, no CSR shell.
- Structured data (Review, Person, BreadcrumbList, Organization on `/about/`) is well-built and internally consistent via a shared `@id` — the repo's own `src/site.ts:25-40` shows this was a deliberate, documented fix for exactly the "two disconnected entities" problem that still exists on the homepage.
- Zero leftover "Gridshift" strings found in sampled pages.

Full findings file: `/Users/anwarelhamdi/Desktop/amin/gridshift/autnic.com-audit/findings/geo.md`
