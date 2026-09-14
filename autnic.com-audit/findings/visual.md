# Autnic.com — Visual & Mobile Rendering Audit

Date: 2026-09-10
Tool: Playwright (Chromium, installed via Homebrew global node_modules), desktop 1440×900 and mobile 390×844 (iPhone UA, touch enabled).

Pages tested:
- Homepage (en) — https://autnic.com/
- Review — https://autnic.com/reviews/onimusha-way-of-the-sword-review/
- News — https://autnic.com/news/grand-theft-auto-vi-china-censorship/
- Homepage (fr) — https://autnic.com/fr/

Screenshots saved to `/Users/anwarelhamdi/Desktop/amin/gridshift/autnic.com-audit/screenshots/`:
- `home-desktop.png`, `home-mobile.png`, `home-desktop-full.png`, `home-mobile-full.png`
- `review-desktop.png`, `review-mobile.png`, `review-desktop-full.png`, `review-mobile-full.png`
- `news-desktop.png`, `news-mobile.png`, `news-desktop-full.png`, `news-mobile-full.png`
- `fr-home-desktop.png`, `fr-home-mobile.png`, `fr-home-desktop-full.png`, `fr-home-mobile-full.png`
- `news-desktop-zoom-banner.png` (diagnostic screenshot, scrolled state)

## Score: 84/100

## What works

- **Above-the-fold on mobile is strong on all three article/home layouts.** H1, hero image, and (on articles) the dek and byline are all visible before any scroll on a 390×844 viewport. No interstitial blocks the first view.
- **Hero imagery dominates without crowding.** The homepage's fanned-card hero carousel and the article hero images are large, high-quality, and image-led — consistent with the "image-led, not a newspaper" positioning. Titles keep their hook (e.g. "Rockstar blurred the GTA 6 trailer for Bilibili, but not on its own site").
- **No page-level horizontal overflow** on any of the 8 page/viewport combinations tested (`document.documentElement.scrollWidth` === `window.innerWidth` everywhere).
- **Served HTML matches rendered text.** `<title>` in the raw response body matched `document.title` and the visible H1/dek on every page — no client-side text swap or hydration mismatch detected.
- **fr/ is a real, complete translation**, not a stub — nav, ticker, hero, cookie banner, and tab bar are all localized, with layout holding up at both viewports.
- **No AdSense iframes were present or overlapping content** in any capture (0 ad iframes detected in the DOM at load+1.5s) — likely because ads don't render pre-consent, so this run couldn't assess ad-slot layout impact one way or the other.

## Findings

### 1. [Medium] Cookie-consent banner + tab bar jointly eat ~24% of the mobile viewport
- **Evidence:** `home-mobile.png` — banner ("We use advertising cookies…") sits directly above a 5-icon tab bar; together they run from y≈629 to y≈844 on an 844px-tall viewport.
- **Detail:** On mobile the consent banner alone is 149px tall (vs 77px on desktop, where content height affords more headroom), and it's fixed above a 54px sticky tab bar. Homepage category tabs ("EVERYTHING / GUIDES / …") are visible cut off, sandwiched between. H1 and hero image are unaffected since they render higher up, but a returning/scroll-down user loses meaningful real estate until they accept or refuse.
- **Fix:** Shrink the mobile consent banner to a single-line + "Manage" pattern, or make it dismiss into a small persistent footer chip after first paint, freeing the space for the tab bar.
- **How we'd know it failed:** Re-measure `consent` div height at 390×844 — if it's still >100px combined with the tab bar's 54px, the fix hasn't landed.

### 2. [Medium] High proportion of sub-44px tap targets on article pages (mobile)
- **Evidence:** Automated DOM scan at 390×844 — review page: 33/53 clickable elements (62%) under 44×44px; news page: 28/47 (60%); homepage: 30/85 (35%).
- **Detail:** Many are inline prose links (tag chips, byline "For version" links, breadcrumb separators) where a 44px target isn't realistic, so this number needs a manual pass to separate true nav/CTA offenders from acceptable inline text links. Visually, the breadcrumb row (`Home › Onimusha: Way of the Sword › Reviews`) and the small `#` tag pills at the bottom of articles are the most likely genuine thumb-tap misses.
- **Fix:** Audit breadcrumb links and tag-pill links specifically; pad their hit area (not necessarily visual size) to 44px via padding/pseudo-element rather than resizing the visible chip.
- **How we'd know it failed:** Re-run the tap-target scan filtered to `.breadcrumb a, .tags a` — if hit height is still <44px, unresolved.

### 3. [Low] Carousel/ticker items report bounding boxes far beyond the viewport, but do not cause real page scroll
- **Evidence:** DOM offender scan on `home-desktop`/`home-mobile`/`fr-home` flagged `<A>`/`<TIME>` elements with `right` values up to 2845px on a 390px-wide mobile viewport.
- **Detail:** This is "THE WIRE" ticker and the homepage card-carousel: items are laid out in a horizontally-scrolling internal track, clipped by `overflow` on a parent, so `document.documentElement.scrollWidth` correctly stays at 390/1440 and there's no visible page-level horizontal scroll (confirmed `horizontalOverflow: false` on every capture). Flagging for the record only — not a real bug, just a heads-up that this component intentionally overshoots its container.
- **Fix:** None needed. If reused elsewhere, keep confirming the containing element has `overflow-x` clipping/scroll so it can't leak into page scroll.
- **How we'd know it failed:** `document.documentElement.scrollWidth > window.innerWidth` would flip true — it currently does not.

### 4. [Info] Body copy renders at 15px
- **Evidence:** `getComputedStyle(document.body).fontSize` = `15px` on every page/viewport (desktop and mobile identical — no responsive font bump).
- **Detail:** 15px is below the commonly-cited 16px "no pinch-zoom needed" baseline, though headlines/deks are considerably larger and legible in the screenshots. Contrast itself looked fine in every screenshot (light grey dek text on near-black background, orange accents on dark cards).
- **Fix:** Consider bumping base body/paragraph font to 16px on mobile at least, since the site is read-heavy (reviews, news bodies).
- **How we'd know it failed:** Re-check computed `font-size` on `p`/body copy at 390px width — still <16px means unresolved.

### 5. [Info] Full-page screenshot stitching produced a visually confusing seam — verified as a false alarm
- **Evidence:** `news-desktop-full.png` showed what looked like a stray purple/lavender bar wedged between the sticky consent banner and the GTA VI hero image. Zoomed re-capture (`news-desktop-zoom-banner.png`) at the same scroll position confirmed it is simply the top edge of the in-article hero photo (a pink/purple dusk sky) peeking out — not a broken element, not a leftover skeleton/loading state.
- **Fix:** None needed. Noting only so this doesn't get re-flagged blind from the full-page screenshot alone.

## Not assessed / limitations
- No AdSense creatives rendered in this session (consent wasn't accepted), so ad-slot-pushing-content-off-screen could not be directly verified — sticky `aside` rail (game-info box, up to 235px tall on review) reserves visible space but never overlapped body text in these captures.
- "papier" light theme was not screenshotted (out of scope of the requested pages/viewports); known from prior notes to be the higher-risk surface for off-token colors.
