# Technical SEO — autnic.com (live site audit, 2026-09-10)

Scope: crawlability + indexability across all 126 sitemap URLs plus internally linked
non-sitemap pages (tag, author, pagination, `.md` alternates). Evidence = live HTTP
responses (curl, `Mozilla/5.0` and bot UAs) and `/Users/anwarelhamdi/Desktop/amin/gridshift`
source, cross-checked against `autnic.com-audit/crawl.json` (126/126 URLs, all `status:200`,
all self-canonical, no `robots` meta, no missing H1 — confirmed, not re-verified here).

## Score: 83/100
Crawl surface is clean (126/126 sitemap URLs 200, self-canonical, hreflang-reciprocal,
tag pages deliberately `noindex,follow`, soft-404s return real 404s, `.md` alternates
correctly `X-Robots-Tag: noindex` + `Link: canonical`). Points off for: a stale-content
window with no purge-on-publish path, IndexNow not wired to the D1-only publish path,
a redirect-less trailing-slash duplicate, and an extra hop on the `http://www` variant.

## What works
- All 126 sitemap URLs return 200, self-referencing canonical, correct hreflang (en/fr/de + x-default), no stray `robots` meta — verified in `crawl.json` and spot-checked live.
- Soft-404 check passed in all three languages: `/this-page-does-not-exist-xyz123/`, `/fr/...`, `/de/...` all return real `404` (not a 200 "not found" page).
- `.md` alternates are safe from duplicate-content risk: `https://autnic.com/reviews/onimusha-way-of-the-sword-review.md` serves `x-robots-tag: noindex` and `Link: <.../review/>; rel="canonical"` (HTTP header, not just HTML).
- robots.txt is the site's own (not a Cloudflare-managed override): `Allow: /` for `*`, and explicit `Allow: /` for GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended, Applebot-Extended, CCBot. Same file served regardless of request UA.
- Security headers present sitewide: HSTS (`max-age=15552000; includeSubDomains`), CSP (scoped to self + AdSense/Doublelick), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.

## Findings

### Medium — No purge-on-publish; edge/KV cache relies on TTL only, up to 24h (edge) / 4d (SWR) staleness for corrections
Evidence: `wrangler.jsonc:97` sets `CACHE_TTL: "86400"`. Live headers: `cache-control: public, max-age=14400, s-maxage=86400, stale-while-revalidate=345600`. `src/lib/cache.ts:126` builds that header from `ttl`/`ttl*4`. `src/lib/cache.ts:135` writes KV with `expirationTtl: ttl` (86400s, no shorter path). The comment at `src/lib/cache.ts:23-27` states explicitly that a targeted KV `delete`/purge was written once but "never had a caller" and was removed, because the colo Cache API can't be purged network-wide anyway — the only thing that invalidates everywhere today is a new `BUILD_ID` (`astro.config.mjs:51`, `src/lib/cache.ts:59-70`), i.e. a redeploy.
Because the architecture (per `astro.config.mjs:5-8`) lets editors publish straight to D1 **without** a redeploy, a factual correction or score change made that way does not bump `BUILD_ID` and has no purge path — it is only guaranteed to reach every edge after the 86400s KV TTL expires, and any downstream cache that honors `stale-while-revalidate` literally (proxies, some crawler fetchers) could still serve the old version up to 4 days (86400×4=345600s) after that. This doesn't block crawling, but it does delay corrections and freshness signals reaching Googlebot/other crawlers.
Fix: on the D1 publish path, call a targeted `env.CACHE.delete(cacheKey(...))` for the affected URL (and its `.md`/AMP-less variants) — this was already scaffolded and removed per the comment, so reinstating just the KV `delete` (not the colo Cache API, which is correctly documented as unpurgeable per-PoP) closes most of the gap. Alternatively, drop `CACHE_TTL` for high-correction-risk routes (reviews with scores).
How we'd know it failed: edit a published article's score directly in D1 (no deploy), then `curl -s -D - <url> -A Mozilla/5.0` from two different regions immediately after — if `cf-cache-status: HIT` with `age` > 0 still shows the old score/text more than a few minutes after the D1 write, the gap is live.

### Medium — IndexNow only fires on git-deployed changes, not on D1-only publishes
Evidence: `.github/workflows/deploy.yml:121-126` — `Ping IndexNow` step runs `node scripts/indexnow.mjs` gated on `steps.changed.outputs.content == 'true'`, itself inside the deploy workflow. `scripts/indexnow.mjs:11-18` documents manual invocation windows (`--days 7` default, `--all`, `--dry-run`). No `schedule:` cron exists in `.github/workflows/*.yml` (only `deploy.yml` and `pages.yml`) and no D1-write hook calls `submitToIndexNow` (`src/lib/indexnow.ts:54`). Key file confirmed live: `https://autnic.com/f12275359301a9d8f9ac192a091e6d3d.txt` → `200`, body matches filename (IndexNow key verification passes).
Since the whole point of D1-only publishing (per `astro.config.mjs:5-8`, and the site's own "migrate after deploy" practice) is to publish without a deploy, most day-to-day articles/corrections will never trigger this step, and Bing/Yandex/Naver will fall back to normal crawl scheduling instead of the instant-notify path IndexNow exists for.
Fix: call `submitToIndexNow` from wherever the D1 publish action lives (or add a scheduled workflow, e.g. hourly, running `node scripts/indexnow.mjs` unconditionally with `--days` sized to the schedule interval) so it isn't dependent on a code deploy happening.
How we'd know it failed: publish/update an article via the D1-only path, wait past the schedule window, and check IndexNow submission logs / Bing Webmaster Tools "IndexNow" history for that URL — no entry means the gap is live.

### Low — `trailingSlash: 'ignore'` serves two crawlable URLs for one canonical instead of redirecting
Evidence: `astro.config.mjs:57` sets `trailingSlash: 'ignore'`. Live: `curl -I https://autnic.com/reviews` → `200` (not a redirect), body's `<link rel="canonical" href="https://autnic.com/reviews/">` matches the slash version's own canonical, so Google-class crawlers should consolidate correctly — but the non-slash URL is still independently fetchable (`x-autnic-cache: miss`, i.e. it gets its own cache/KV entry), wasting a crawl budget slot and giving less-canonical-respecting bots (some AI crawlers) two copies to ingest.
Fix: keep `trailingSlash: 'ignore'` for routing (avoids the base-URL redirect bug the config comment already warns about) but add a 301 in `src/middleware.ts` from the non-slash path to the slash path for canonical GET requests, rather than serving 200 on both.
How we'd know it failed: `curl -I https://autnic.com/reviews` (no trailing slash) returns anything other than a `301`/`308` to `/reviews/`.

### Low — `http://www.autnic.com/` takes two redirect hops instead of one
Evidence: `curl -I http://www.autnic.com/` → `301 Location: https://www.autnic.com/` → (second hop) `301 Location: https://autnic.com/`. Compare `http://autnic.com/` → single `301` straight to `https://autnic.com/`. This is a Cloudflare-level rule (apex/www + protocol), not app code — no matching file in the repo.
Fix: in the Cloudflare dashboard, add/adjust the redirect rule so `http://www...` goes directly to `https://autnic.com/...` in one hop (skip the intermediate `https://www...`).
How we'd know it failed: `curl -Iv http://www.autnic.com/` shows 2 `Location` hops instead of 1.

### Info — AI-bot access confirmed at HTTP layer only; WAF/Bot-Fight-level blocking not testable via curl
Evidence: `robots.txt` served identically and with `Allow: /` for GPTBot/ClaudeBot/PerplexityBot UAs, and content pages return `200` (no challenge/403) for `GPTBot/1.0`, `ClaudeBot/1.0`, `PerplexityBot/1.0`, and `Googlebot/2.1` UAs sent via curl from this session's egress IP. This does **not** rule out Cloudflare Bot Fight Mode / AI Crawl Control / WAF custom rules challenging real bot IP ranges or TLS/JA3 fingerprints that curl can't replicate — that layer sits in the Cloudflare dashboard, per prior finding that this zone has historically injected its own robots.txt. The robots.txt override itself is not reproduced today (the site's own file is being served), but bot-level WAF blocking is unverified from here.
Fix (if not already done): in the Cloudflare dashboard, check Security → Bots → AI Crawl Control and any WAF custom rules for the UAs listed in `robots.txt`, and confirm none of them are set to Block/Challenge — the app-level allow in `robots.txt` (`public/robots.txt` equivalent — see `src/pages/robots.txt.ts` if present) is necessary but not sufficient.
How we'd know it failed: Cloudflare Security Events log shows `block`/`challenge` actions against GPTBot/ClaudeBot/PerplexityBot/Google-Extended UAs or their verified IP ranges.

### Info — Untranslated `<title>` on the FR/DE cookies page (localization polish, not indexation risk)
Evidence: `crawl.json` — `/cookies/`, `/fr/cookies/`, `/de/cookies/` all title `"Cookies — Autnic"` verbatim. Each is self-canonical and correctly hreflang-tagged (not a duplicate-content problem), so this is cosmetic only.
Fix: localize the title string for `/fr/cookies/` and `/de/cookies/`.
How we'd know it failed: N/A (cosmetic) — check title tag matches page language on next content pass.

## Explicitly checked, no issue found
- Redirects: `http→https` and `https://www→https://apex` are each single 301 hops. Old French root paths (`/actus/`, `/tests/`, `/configs/`, `/jeux/`, `/a-propos/`, `/mentions-legales/`, `/confidentialite/`) redirect to `/fr/...` per `astro.config.mjs:35-45`; `/guides/` intentionally excluded (shared EN/FR segment) — correct per its own comment.
- `/index.html` and uppercased paths (`/REVIEWS/`) return real `404`, not silently served or 200 — no case-insensitivity duplicate risk.
- Soft-404: nonexistent paths in en/fr/de all return HTTP `404` with a real "page is gone" body, not a 200.
- Canonical/hreflang reciprocity spot-checked on `/reviews/onimusha-way-of-the-sword-review/` ↔ `/fr/tests/...` ↔ `/de/tests/...`: all three emit the same 4-way hreflang set (en/fr/de/x-default) pointing at the correct localized slugs — fully reciprocal.
- `.md` alternates: `X-Robots-Tag: noindex` header + `Link: rel="canonical"` header pointing at the HTML version — no duplicate-content exposure. Confirmed on `/reviews/onimusha-way-of-the-sword-review.md`.
- Mobile viewport: `<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">` present sitewide (from `article.html` sample; also in the shared `Base.astro` layout used by every page).
- JS dependence: SSR confirmed — full article body, H1, nav, and card grid present in the raw (no-JS) HTML fetch; ~2,266 words of visible text in the raw response for the sample article. No client-render dependency for primary content.
- RSS (`/rss.xml`): valid XML, 21 `<item>` entries, `<channel><link>` present. Localized feeds also linked per-language (`/fr/rss.xml`, `/de/rss.xml`) from each article's `<head>`.
- IndexNow key file is live and self-verifying: `https://autnic.com/f12275359301a9d8f9ac192a091e6d3d.txt` → `200`, body = filename stem (see Medium finding above for the trigger-path gap).
- Pagination (`/news/page/2/`): real, distinct, self-canonical page (not a soft-404, not a duplicate of `/news/`). Query-string pagination (`/news/?page=2`) is correctly ignored server-side and canonicalizes back to `/news/` — no parameter-duplicate risk.
- Tag pages (e.g. `/tag/pc/`): `noindex,follow` via `TagPage.astro:20` / `Base.astro:102`, applied unconditionally to all tag pages (stricter than the prior local-build plan's `<5 posts` threshold, and confirmed live) — link equity still flows, no indexation bloat.
- Author pages: indexable (no `noindex`), reciprocal per-language URLs, real content — legitimate editorial choice, not flagged.

## Prior local-build plan (`SEO-ACTION-PLAN.md`, 2026-08-27) — status against the live site
- `noindex,follow` on tag pages (old item 6): **done**, and shipped broader than the plan asked (all tag pages, not just `<5` posts).
- `.md`/canonical/sitemap/RSS/per-type JSON-LD "already good" baseline (plan's own framing): **confirmed still true** on the live site.
- `max-image-preview:large` on robots meta (old item 4): **not verified this pass** — deferred, not in this audit's scope (structured-data/snippet directives covered elsewhere per the coordinator's instruction to skip structured data).
- Item 11, `lastmod` in sitemap: **done** — live sitemap has `<lastmod>` on every entry checked.
- IndexNow / AI-crawler robots policy (old "secondary items"): **built**, but see Medium finding above — the trigger path doesn't cover the site's primary publish method.

## Re-check via /seo technical (2026-09-10, later the same day)

Everything above still holds. New live checks:

- **Medium: static assets are never cached by the browser.**
  - `/_astro/*.css` and `/_astro/*.js` return `cache-control: public, max-age=0, must-revalidate`, even though their filenames are content-hashed. `/fonts/*.woff2` and `/favicon.svg` return the same.
  - This is the Workers Static Assets default. There is no `public/_headers` file.
  - Media on `media.autnic.com` is fine (`max-age=31536000, immutable`).
  - **Fix:** add a `public/_headers` file:
    ```
    /_astro/*
      Cache-Control: public, max-age=31536000, immutable
    /fonts/*
      Cache-Control: public, max-age=2592000
    ```
    The font filenames aren't hashed, so they get 30 days rather than `immutable`.
  - **Failed if:** `curl -sI https://autnic.com/_astro/<file>.css` still shows `max-age=0`.
- **Low (unverified): possible `*.workers.dev` duplicate.**
  - `wrangler.jsonc` sets `routes` with `custom_domain`, but sets neither `workers_dev` nor `preview_urls`, so the Worker may also answer on `autnic.<account>.workers.dev`.
  - The canonicals point at autnic.com, so the risk is low. The account subdomain isn't anywhere in the repo, so this couldn't be curl-tested.
  - **Fix:** set `"workers_dev": false, "preview_urls": false` explicitly.
- **Passes:**
  - TLS: Google Trust Services WE1, valid until 2026-12-07, renewed automatically by Cloudflare.
  - HTML, CSS and JS are Brotli-compressed.
  - No `http://` references on the homepage or the sample review.
  - The longest sitemap URL is 83 characters.
  - `?utm_*` URLs canonicalise to the clean URL.
  - Custom 404s keep the security headers.
- **Info:** HSTS is 180 days with `includeSubDomains` and no `preload`, so the domain is not on the preload list. That's fine for a media site. Preloading needs a max-age of at least 1 year and is slow to undo.
- **Still unavailable:** CWV field data. PSI returned 429 again with no key.
- **Fixed locally, not yet deployed:**
  - the fabricated AggregateRating
  - `max-image-preview:large`
  - image-sitemap entries
  - the `Fig` srcset range
  - the homepage publisher link
