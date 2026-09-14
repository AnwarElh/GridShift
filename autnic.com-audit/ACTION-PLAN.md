# autnic.com — Action plan (2026-09-10)

The plan is ordered by dependency, not effort. Each item gives:
- **Fix:** the change, with file:line
- **Unblocks:** what it enables
- **Failed if:** the observable sign the diagnosis was wrong
- **Watch:** a leading indicator you can monitor without re-running the audit

Health score today is 76. The target after Phases 1–2 is about 85.

---

## Phase 0 (before anything else): get measurement in place

**0. Connect Google Search Console and Bing Webmaster Tools for autnic.com.**
- **Fix:** verify with a DNS TXT record in Cloudflare, then submit `https://autnic.com/sitemap.xml` to both. Optionally, give the audit tooling a PSI API key (`~/.config/claude-seo/google-api.json`) so the next audit has field data.
- **Unblocks:** every "Failed if" and "Watch" below. Without it, none of this plan can be judged.
- **Watch:** GSC → Pages shows about 126 indexed URLs within 2–4 weeks.

---

## Phase 1 (week 1): make every claim true, and ship the one-line wins

**1. Critical: delete the fabricated AggregateRating.**
- **Fix:** remove the `...(d.score !== undefined ? { aggregateRating … } : {})` spread at `src/views/Game.astro:68-70`. Add it back only when `userScore`/`userVotes` hold real votes.
- **Failed if:** the Rich Results Test on `/games/onimusha-way-of-the-sword/` still shows an AggregateRating.
- **Watch:** GSC → Manual actions stays empty, and Enhancements → Review snippets shows 0 errors.

**2. High: make the correction log real.**
- **Fix:** in `src/layouts/Article.astro:189-201`, render the Corrections block always. When `corrections` is empty, it reads "No corrections since publication — {date}". From now on, every text change adds an entry.
- **Unblocks:** items 3 and 9.
- **Failed if:** a random article in any locale has no visible Corrections block.
- **Watch:** the share of articles whose `updated` is later than their `date` has a matching entry in `corrections`.

**3. High: tie `dateModified` to corrections.**
- **Fix:** add a zod `.refine()` in `src/content.config.ts:64`: when `corrections` is non-empty, `updated` must be set and no earlier than the latest correction.
- **Depends on:** item 2.
- **Failed if:** the build accepts an article with corrections but a stale `updated`.

**4. High: reword the tagline to match the policy.**
- **Fix:** replace "We buy what we review" in the home meta and og description (`src/i18n/ui.ts`, en/fr/de: the de line is at `:636`), the WebSite `description`, and the llms.txt header. Example: "We tell you how we got every game we review, and we revise scores when games change."
- **Failed if:** `curl -s https://autnic.com/ | grep -c "buy what we review"` still returns more than 0.

**5. Medium: keep, or remove, the hub's "where to buy it" promise.**
- **Fix:** either render the existing `review.whereToBuy` block on `src/views/Game.astro`, or drop the clause from `src/i18n/ui.ts:169` (en), `:689` (de) and the fr line.
- **Failed if:** a hub description still promises a buy link the page doesn't have.

**6. High: allow large Discover previews.**
- **Fix:** at `src/layouts/Base.astro:102`, change to `<meta name="robots" content={noindex ? 'noindex,follow' : 'max-image-preview:large'}>`.
- **Watch:** the GSC → Discover report appears, with impressions greater than 0 within about 30 days. If it stays at 0 while the tag is live, the constraint is content or entity, not images.

**7. High: fix `Fig`'s srcset at the root.**
- **Fix:** at `src/components/Fig.astro:37-39`, map each requested width to the nearest available variant instead of keeping exact matches only, so a missing rung can't silently strip the small sizes from any caller. The minimal alternative is `widths={[480,720,1080,1440,1920]}` at `Article.astro:109`.
- **Failed if:** the live hero srcset on any article still has no entry below 1000w.
- **Watch:** re-run Lighthouse mobile on the Onimusha review 3 times. LCP should be under 2.5s, and the lab TTFB should be normal on every run (5.25s was an anomaly).

**8. Medium and Low: small fixes that ride along.**
- Body-shot alt: `alt={bodyShotCaption ?? ''}` at `Article.astro:176`.
- Homepage H2 "Your ultimate gaming blog" in `src/views/Home.astro` (`pick-h`) and its i18n text.
- `og:image:width`/`height`/`alt` in `Base.astro:109`.

---

## Phase 2 (weeks 2–3): the publish pipeline and entity signals

**9. Medium: one D1 publish hook that purges and pings.**
- **Fix:** on every D1 publish or correction:
  1. purge the article's URL(s) in all 3 locales from the KV/edge cache (restore the purge described at `src/lib/cache.ts:23-27`, this time with a caller)
  2. call `submitToIndexNow` (`src/lib/indexnow.ts:54`)
- **Depends on:** item 2. Item 2 is the reason the purge matters: a correction that sits in cache for 24h to 4 days makes "never silently edited" untestable.
- **Failed if:** after a D1-only edit, `curl -sI <url>` from two regions still shows the old content with `cf-cache-status: HIT` minutes later, or Bing Webmaster → IndexNow shows no entry.
- **Watch:** Bing index count for autnic.com, and Copilot/Perplexity citations for new articles.

**10. High: anchor the Organization entity.**
- **Fix:** emit `[Organization, WebSite]` from `src/views/Home.astro:123-130` (ready-to-paste JSON is in `findings/schema.md`), and add `sameAs` to `src/site.ts:42-53`.
- **Depends on:** real profiles existing. List only accounts that resolve, starting with `@autnic` on X if that account is live.
- **Failed if:** the Rich Results Test on `/` shows `WebSite` without a publisher.
- **Watch:** a brand search for "Autnic" returns a knowledge panel or sitelinks (slow; months).

**11. Medium: add image sitemap entries.**
- **Fix:** add `<image:image>` for each post's cover and hero in `src/pages/sitemap.xml.ts:97-106`, plus the `xmlns:image` namespace. Pairs with item 6.
- **Watch:** GSC Performance → Search type: Image shows impressions.

**12. Medium: SERP-facing page fixes.**
- **Review titles:** query first, then a 15–20-character hook, e.g. `Onimusha: Way of the Sword review — no Sekiro clone`. Watch: GSC CTR per review URL, 28 days before vs after.
- **FF7 editions page:** an editions × contents × price table, plus one buy link per edition (`rel="sponsored"`).
- **Mobile consent banner:** compact it to one line. Failed if the banner plus the tab bar still exceed 150px at 390×844.
- **Fonts:** drop the JetBrains Mono preload, and keep Chakra's only if it renders above the fold. Failed if Lighthouse `elementRenderDelay` is still over 600ms.

---

## Phase 3 (month 2): content and authority

**13. Reviewer-captured screenshots.** Add 1–2 per review, credited to Autnic and used as the body shot. This is the visible proof of the play the text describes, and it feeds Google Images through item 8.

**14. News: your own angle first.** On pieces built around another outlet's take, lead with Autnic's claim, then cite. Test: remove the competitor quotes; a full argument should still stand.

**15. Author credentials.** Give each author one external, checkable credential: prior outlets, or a profile link. Add it to `Person.sameAs` too.

**16. Hub intros.** Write 60–120 words per section hub on scoring and re-checks. Don't pad.

**17. Google News sitemap.** Only if Top Stories/News is a goal: `src/pages/news-sitemap.xml.ts` with a 48h window, referenced in robots.

---

## Phase 4 (ongoing): monitoring

- After Phase 1 deploys, capture a baseline with `/seo drift baseline https://autnic.com`, then run `drift compare` after each release.
- Re-run the audit with GSC connected to replace lab CWV with CrUX field data.
- After any Cloudflare zone change, check `curl -A GPTBot https://autnic.com/robots.txt`, and look at Security → Bots → AI Crawl Control. The managed robots block was on before; it is off today.

## Backlog (Low)

- 301 `/reviews` → `/reviews/` (`src/middleware.ts`; `astro.config.mjs:57` is `ignore`).
- A single-hop `www` redirect rule in Cloudflare.
- Localized game-hub title suffixes.
- 44px hit areas on breadcrumbs and tag pills.
- 16px body text on mobile.
- `itemReviewed.url` (`Article.astro:81`).
- `VideoGame` author/publisher typing (`Game.astro:63`).
- Answer-first paragraphs under question-shaped H2s.

## Deliberately not recommended

- Going static: the D1 SSR architecture is decided.
- Removing imagery from listings: the site is image-led.
- HowTo schema: deprecated.
- New FAQPage for SERP benefit: FAQ rich results were retired in May 2026.
- Chasing the head term "gta 6": the SERP is Rockstar plus mainstream press. Target modifiers such as "gta 6 guide/review/…" instead.
