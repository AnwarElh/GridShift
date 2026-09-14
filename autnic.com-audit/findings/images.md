# Images — autnic.com

Audited live, 2026-09-10. Source: `crawl.json` (1,331 `<img>` across 126 URLs),
plus a manual check of two articles.

**Score: 78 / 100.** Delivery is excellent. The remaining gaps are all about
telling Google what the images are and how large it may show them.

## What works

- All 1,331 `<img>` tags carry `width`/`height`. `src/components/Fig.astro:54` always writes them, so images cause no CLS.
- Images are responsive WebP with per-slot `widths`, and the fallback `src` is the largest *chosen* variant rather than the 1920 px original (`Fig.astro:44-46`).
- The hero image is `loading="eager" fetchpriority="high"`, and every other image is lazy (`Fig.astro:57-58`, `Article.astro:108-109`). Its `sizes` was corrected to 1312 px, which avoids the 553 KB variant.
- The hero image has a descriptive alt taken from `coverCaption`. Example: "Musashi squares up to a Malice-warped demon beneath a red moon."
- 1,247 images use an empty `alt`. These are thumbnails on cards and in the nav rail, each next to a title link, so an empty alt is correct: it stops screen readers announcing every headline twice. **Keep them empty.**
- Each article has its own `og:image`, a 1920×1080 JPEG, e.g. `h-onimusha-way-of-the-sword-1.jpg` (407 KB). The default `og-default.png` is 1200×630.

## Findings

### High: no `max-image-preview:large`, so Discover can't show large image cards
- **Evidence:** no page sends a robots meta except noindexed ones (`src/layouts/Base.astro:102` only emits `noindex,follow`). There is also no `X-Robots-Tag` header on the homepage.
- **Why it matters:** Google Discover shows the large card format only when a page allows it with `max-image-preview:large` (or is AMP). Without it, Google may fall back to a small thumbnail. For an image-led games site, Discover is the likeliest early traffic source for a young domain, and large cards are the format that gets taps.
- **Fix:** in `Base.astro:102`, emit `max-image-preview:large` on every page and keep `noindex,follow` for noindexed ones:
  ```astro
  <meta name="robots" content={noindex ? 'noindex,follow' : 'max-image-preview:large'}>
  ```
- **Failure check:** view-source on any article should show the meta. Leading indicator: once Search Console is connected, the Discover report shows impressions. If Discover stays at 0 impressions after about 30 days with the tag present, the constraint is elsewhere (content or entity signals), not images.

### Medium: the body screenshot has an empty alt despite having a caption
- **Evidence:** `src/layouts/Article.astro:176` renders `<Fig src={bodyShot} alt="" …>` inside a `<figure>` with `<figcaption>{bodyShotCaption}`. On the live review, `h-onimusha-way-of-the-sword-4.1920.webp` has an empty alt.
- **Why it matters:** this is a content image, not decoration. An empty alt tells both screen readers and Google Images to ignore it, which throws away an image that ranks well for "<game> gameplay"-type queries.
- **Fix:** one line. Change it to `alt={bodyShotCaption ?? ''}`. The figcaption stays as is, and the redundancy is acceptable for a figure.
- **Failure check:** the body shot on any article should carry non-empty alt text. In Search Console → Performance → Search type: Image, impressions on `h-*-N.*.webp` URLs should appear.

### Low: og:image has no dimensions or alt
- **Evidence:** `Base.astro:109` emits only `og:image`. There is no `og:image:width`, `og:image:height` or `og:image:alt`.
- **Fix:** add all three. Article images are 1920×1080 and the default is 1200×630. The dimensions let Facebook, Slack and Discord render the card on the first share without fetching the image first.
- **Failure check:** the Facebook Sharing Debugger should show no "og:image dimensions" warning.

### Info: inconsistent alt on card variants
- **Evidence:** `src/components/Card.astro:57` uses `alt={data.title}`, while `Card.astro:72` and every other card use `alt=""`. When the card's headline is also a link, alt=title makes screen readers announce the headline twice.
- **Fix:** use `alt=""` on line 57 too, unless that variant has no visible title.
