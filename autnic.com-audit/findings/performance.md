# Performance / Core Web Vitals — autnic.com

Date: 2026-09-10
Tooling: Lighthouse 13.4.1 (local, mobile, simulated throttling) — **lab data**. PSI v5 (no API key) returned `429 RESOURCE_EXHAUSTED` (daily quota), CrUX unavailable for the same reason (no field data in this audit). TTFB/cache/byte-size numbers below are **field-measured** via `curl` against the live edge.

Pages tested: homepage (`/`), one review (`/reviews/onimusha-way-of-the-sword-review/`). News page and desktop were sampled opportunistically but not exhaustively per scope.

## Performance score

- Homepage (mobile, lab): **96/100**
- Review article (mobile, lab): **60/100**

## Metrics table

| Page | Metric | Value | Source | Status |
|---|---|---|---|---|
| Home | LCP | 2.54 s | lab (Lighthouse, simulated) | Borderline Good/Needs Improvement (threshold ≤2.5s) |
| Home | FCP | 1.52 s | lab | — |
| Home | TBT (INP proxy) | 28 ms | lab | Low risk |
| Home | CLS | 0 | lab | Good |
| Home | TTFB (doc) | 55 ms (lab) / 55–100 ms (curl, cache HIT) | lab + field | Good |
| Review | LCP | 10.3 s | lab (single run) | Poor |
| Review | FCP | 2.9 s | lab | — |
| Review | TBT (INP proxy) | 0 ms | lab | Low risk |
| Review | CLS | 0 | lab | Good |
| Review | TTFB (doc) | 5.25 s (lab, breakdown) vs 71–90 ms (curl, cache HIT) | lab vs field — **discrepancy, see note** | See note |

Note on the review-page TTFB discrepancy: Lighthouse's LCP-breakdown insight attributed 5.25 s to "time to first byte" on a single simulated run, while direct `curl` against the live edge (3 repeated requests) measured 71–90 ms with `cf-cache-status: HIT`. This is very likely a single-run lab anomaly (cold Chrome/DNS in the sandboxed headless run) rather than a real server problem — flagged as **lab data, not corroborated**, not to be treated as a live TTFB regression. The oversized-image finding below is independent of this anomaly and is confirmed by direct byte-size measurement, not just the lab run.

No CrUX field percentiles were available (PSI quota exhausted), so the 75th-percentile pass/fail call for Google's own evaluation cannot be made here — recommendations below are prioritized from lab + static evidence and should be re-validated against CrUX/PSI once quota resets.

## What works

- Homepage LCP element (hero image, `h-grand-theft-auto-vi-3.840.webp`) is correctly discoverable in the initial HTML, `loading="eager"`, `fetchpriority="high"`, not lazy — textbook-correct LCP image markup (`src/components/Hero.astro:41`, rendered via `src/components/Fig.astro:50-59`).
- Review-article hero image is also eager + `fetchpriority="high"`, and its `sizes` is deliberately capped at `1312px` so a 1×, 1920-wide desktop viewport doesn't request the 553 KB variant when 307 KB suffices (`src/layouts/Article.astro:108-109`, explained in the surrounding code comment).
- Every image carries explicit `width`/`height` (`src/components/Fig.astro:54`) — CLS from images is effectively eliminated: measured CLS is 0 on both pages tested.
- All three self-hosted fonts are preloaded with `crossorigin` and the theme is applied pre-paint via an inline script (`home.html` `<head>`), avoiding a flash of unstyled/wrong-theme content.
- Ad slots are consent-gated (`#consent` banner, hidden by default) — no `ins.adsbygoogle` markup renders before consent, so third-party ads can't shift layout on first load.
- Main-thread cost is negligible on both pages tested: Total Blocking Time is 28 ms (home) and 0 ms (review) — low INP risk from script, consistent with the repo's recent work to stop measuring during scroll on the carousel.
- Edge caching is working as designed: both pages served `cf-cache-status: HIT` with 55–100 ms TTFB on repeat `curl` checks, `cache-control: public, max-age=14400, s-maxage=86400`.
- `media.autnic.com` assets are immutable and cached for a year (`cache-control: public, max-age=31536000, immutable`) with `cf-cache-status: HIT`.

## Findings

### 1. High — Article hero image's responsive `widths` list requests a variant that doesn't exist, so mobile never gets a small image
- **Evidence**: `src/layouts/Article.astro:109` passes `widths={[900, 1440, 1920]}` to `<Fig>`. Fetching `https://media.autnic.com/h-onimusha-way-of-the-sword-1.900.webp` directly returns `404`. `Fig.astro`'s variant filter (`src/components/Fig.astro:37-39`) silently drops any requested width that has no matching generated variant, so the rendered `srcset` ends up as only `1440w` (307,782 bytes) and `1920w` (553,586 bytes) — confirmed in both the live HTML and Lighthouse's LCP node snippet. A 480w variant (34,790 bytes) and a 720w variant (76,648 bytes) **do exist** at the same origin (verified with `curl`, HTTP 200) but are never referenced because the template doesn't ask for them. Every phone visiting this review, and by extension every article using this same `widths` pattern, downloads a minimum of 307 KB for the hero image instead of ~35–77 KB — a 4–9× oversized transfer that is very likely the dominant cause of the review page's 10.3 s lab LCP (`resourceLoadDuration` alone was 21 s in the simulated-throttling breakdown).
- **Fix**: Change `src/layouts/Article.astro:109` from `widths={[900, 1440, 1920]}` to a set that matches what the media pipeline actually produces for hero covers, e.g. `widths={[480, 720, 1080, 1440, 1920]}` (mirroring the widths already used successfully for the homepage deck in `src/components/Hero.astro:41`, `[560, 840, 1120]`). This is a one-line template change; no new image generation needed since the smaller variants already exist on `media.autnic.com`.
- **How we'd know it failed**: `curl -s https://autnic.com/reviews/<any-review>/ | grep -o 'srcset="[^"]*"'` on the `.ahero-cover img` still shows a smallest entry ≥1000w, or Lighthouse mobile LCP for an article page stays >4 s after the fix.

### 2. Medium — Three font preloads + the LCP image + render-blocking CSS all compete for bandwidth at `High`/`VeryHigh` priority on the homepage
- **Evidence**: Lighthouse's `network-requests` audit for the homepage mobile run shows five requests all starting at t=0 with `High`/`VeryHigh` priority: `_slug_.a5kJiz_w.css` (VeryHigh), `inter-normal-latin.woff2`, `chakra-700-latin.woff2`, `jetbrains-normal-latin.woff2` (all High, from the three `<link rel="preload" as="font">` tags in `home.html` `<head>`), and the LCP hero image itself (High). The `lcp-breakdown-insight` audit attributes 1,034.8 ms of the 2,539.5 ms LCP (41%) to `elementRenderDelay` — time after the image bytes are already on the client but before it paints — consistent with the image competing with three font downloads and a render-blocking stylesheet rather than being the sole priority request. Homepage LCP (2.54 s) is right at the "Good" boundary; shaving this render delay would move it solidly into "Good" with margin.
- **Fix**: This is the direct answer to "does preloading 3 fonts compete with the LCP image" — yes, on this lab run. Options, cheapest first: (a) drop `chakra-700-latin.woff2` from preload if Chakra Petch is only used for below-the-fold headings rather than the LCP card text (verify against actual LCP node — the LCP element measured here is the *image*, not text, so Chakra's preload is not serving the LCP element it claims to in the `home.html` comment ("Chakra Petch les titres — donc l'élément LCP")); (b) confirm `font-display: swap` is set for all three `@font-face` rules in `src/styles/autnic.css` so text isn't blocked even if a font preload loses the bandwidth race; (c) if JetBrains Mono is only used for kicker labels below the fold on first paint, defer its preload too. Re-run Lighthouse after removing the least-critical preload and compare `elementRenderDelay`.
- **How we'd know it failed**: `elementRenderDelay` in the `lcp-breakdown-insight` audit stays >600 ms after trimming preloads, or homepage lab LCP does not improve.

### 3. Info — No field data (CrUX) available this run
- **Evidence**: PSI v5 API returned `429 RESOURCE_EXHAUSTED` for the shared no-key quota; no Google API credentials configured for direct CrUX access. All Core Web Vitals numbers above are single-run lab measurements (Lighthouse simulated throttling), which are noisier and less representative than the 28-day CrUX field average, especially the anomalous 5.25 s TTFB on the review page.
- **Fix**: Not a code fix — re-run `python3 scripts/pagespeed_check.py <url> --json` after the daily quota resets, or configure a Google API key/CrUX History API credentials per `skills/seo/references/cwv-thresholds.md`, and re-validate findings 1–2 against real user percentiles before treating this as final.
- **How we'd know it failed**: PSI/CrUX still returns no `loadingExperience` block for autnic.com after a quota reset — would indicate insufficient Chrome UX Report traffic (page-level CrUX requires meaningful mobile traffic), in which case lab data remains the only signal and should be gathered from multiple repeated runs (median of 5) rather than one.

### 4. Low — Homepage LCP is a carousel slide; verify the other 5 slides never compete for the "high" fetch priority
- **Evidence**: The homepage's `dtile-lead` (first slide) correctly gets `priority` (eager + fetchpriority=high) in `src/components/Hero.astro:41`, while the five fan-card images correctly render without `priority` (`src/components/Hero.astro:67`, confirmed `loading="lazy"`, `Low` priority in the network log). This is the right pattern — only the visible slide is prioritized. Flagged Low/Info only because it's worth re-checking after any carousel change that the lead slide computed by the slider script always matches the one the server marked `fetchpriority="high"` (a client-side reorder before paint would defeat the preload benefit); no evidence of that happening today.
- **Fix**: None needed today — this is a "keep it this way" note, not a regression.
- **How we'd know it failed**: `lcp-discovery-insight`'s `priorityHinted` check turns `false`, or the LCP node reported by Lighthouse is not the first `dtile-lead` image.
