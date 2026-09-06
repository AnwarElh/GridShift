---
name: gridshift-desk
description: >
  Weekly editorial run for the Gridshift blog: research the latest news on the games
  we cover from five gaming outlets, reverse-engineer their copywriting, and publish
  three new bilingual articles (EN + FR) to src/content/articles/.
  Triggers: "gridshift desk", "weekly articles", "research and write articles",
  "nouvelle fournée d'articles". Run manually, or from a weekly schedule.
---

# gridshift-desk — research → copywriting → publish

One run = **3 topics**, each written **twice** (`en/` + `fr/`), built, committed and pushed to
`main`. Pushing to `main` deploys to Cloudflare, so a run that ends in a push is a run that
went live. Do not push a build that fails.

Work through the five steps in order. Do not start writing before step 2 is done — the style
comes from the sources, not from memory.

## The five sources

These are the only research and style sources. All five are RSS/Atom; `feedparser` reads both.

| Outlet | Feed |
|---|---|
| Push Square | `https://www.pushsquare.com/feeds/latest` |
| GAMINGbible | `https://www.gamingbible.com/index.rss` (Atom, `<entry>` not `<item>`) |
| Kotaku | `https://kotaku.com/rss` |
| GameSpot | `https://www.gamespot.com/feeds/news/` |
| VG247 | `https://www.vg247.com/feed` |

## Step 1 · Research

Use the **agent-reach** skill (`web` category) — announce that you are using it, per its rules.

Pull the feeds — stdlib only, no install needed:

```bash
python3 .claude/skills/gridshift-desk/feeds.py 25   # TSV: outlet, date, title, link
```

It exits non-zero if fewer than three feeds answered. Three healthy feeds is the floor for
a run; below that, stop and report rather than writing from one outlet.

Read the full text of the articles you shortlist with Jina Reader:
`curl -s "https://r.jina.ai/<url>"`.

**Corroborate before you write.** A fact carried by one outlet is a claim, not a fact. Either
find it in a second source or write it as what it is ("VG247 reports…"). Rumours stay labelled
as rumours.

## Step 2 · Extract the copywriting

The five outlets are the style authority for this blog. Before writing anything, take the
headlines and opening paragraphs you just pulled (~10 per outlet) and write down, for this run:

- **Headline mechanics** — length, whether the claim is in the headline or withheld, use of the
  second person, the subordinate clause that carries the twist, question forms, numbers.
- **Lede mechanics** — how many facts before the angle appears, where the source is credited.
- **Structure** — subhead cadence, where the "what this means for you" turn lands, how they close.
- **Register** — how much the writer is present, how contractions and asides are used.

Keep the notes in the scratchpad and write against them. You are matching *method*, not prose:
**never lift sentences, headlines or phrasings from a source.** Every sentence you ship is
written from scratch. Facts are borrowed and attributed; wording is not.

## Step 3 · Pick three topics

Topics must be about a game we cover. Check what exists:

```bash
ls src/content/games            # the games with a fiche
ls src/assets                   # g-<game>.jpg = cover, h-<game>-N.jpg = hero
ls src/content/articles/en      # what we already published — do not repeat an angle
```

Rules:

1. The topic maps to a game that has a file in `src/content/games/` **and** at least one
   image in `src/assets/`. No image, no article — this blog is image-led and a listing card
   without a picture is not shippable.
2. No angle we already published. Check the existing slugs and ledes first.
3. Three different games where the week allows it. Three pieces on one game is a bad issue.
4. Prefer `type: news` for anything time-bound. Use `setup` for platform/edition/hardware
   comparisons and `guide` for how-to. Only use `type: review` if we have actually played it —
   a review needs `score`, `verdict`, `pros`, `cons`, and inventing those is fabrication.

If fewer than three topics survive these rules, ship fewer and say so in the report. Padding the
run with a thin fourth piece is worse than publishing two.

## Step 4 · Write

Two files per topic, **same filename** in `src/content/articles/en/` and `.../fr/` — the mirrored
filename is what links a page to its translation. Slug is kebab-case, game name first:
`the-witcher-3-remastered-free-upgrade-setup.md`.

Frontmatter (schema is `src/content.config.ts` — it is enforced at build time):

```yaml
---
type: news              # news | review | guide | setup
lang: en                # en in en/, fr in fr/
title: "…"              # the editorial headline, can run long
seoTitle: "…"           # ≤60 chars incl. brand — Google cuts the rest
lede: "…"               # 1–2 sentences, the facts and the angle
date: 2026-09-09T09:00:00+02:00
author: nour-benali     # nour-benali (news) · lina-morel (guides/setup) · sacha-vidal (reviews)
game: the-witcher-3-remastered
tags: ["The Witcher 3 Remastered", RPG, CD Projekt]
cover: ../../../assets/h-the-witcher-3-remastered-2.jpg
coverCaption: "…"       # what is in the frame, not a repeat of the headline
---
```

- **Image**: pick an `h-<game>-N.jpg` for that game. Prefer one not already used as a cover:
  `grep -h '^cover:' src/content/articles/en/*.md | sort | uniq -c`. Fall back to
  `g-<game>.jpg`. Never invent a filename — the build resolves the path and will fail.
- **French is a translation, not a second article.** Same facts, same structure, same images,
  same slug. Follow the conventions already in `src/content/articles/fr/`: `i/s` for fps,
  `« »` for quotes, French date formats. Adapt the headline so it lands in French rather than
  translating the English word order.
- Body is Markdown with `##` subheads, wrapped near 100 columns like the existing files.
  Attribute the outlet in the prose where a fact came from one.

## Step 5 · Verify, then publish

```bash
npm ci --silent 2>/dev/null || npm install   # fresh checkout (the Wednesday run) has no node_modules
npm run build                                # validates frontmatter against the schema — must pass
```

A build failure is the schema rejecting the article. Fix the file, never the schema. When it
passes:

```bash
git add src/content/articles
git commit    # message in French, like the rest of the log
git push
```

Commit message: one line naming the issue, e.g.
`Trois articles : <jeu>, <jeu>, <jeu>` — then the trailers this session already uses.

## Report

Close with: the three topics and why, the sources behind each, anything dropped and why, and
the commit SHA. If the push happened, say the articles are live.
