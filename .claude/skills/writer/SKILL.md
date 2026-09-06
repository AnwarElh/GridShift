---
name: writer
description: >
  Write and publish Gridshift articles in the house style. Holds a copywriting blueprint
  distilled from five gaming outlets, so articles get written from the blueprint rather than
  by re-reading those sites every time. Also runs the weekly research pass that finds what to
  write about. Triggers: "writer", "weekly articles", "write an article",
  "nouvelle fournée d'articles".
---

# writer — blueprint-driven writing, with a research pass in front of it

Two separable jobs. Keep them separate.

**Style comes from [`blueprint.md`](blueprint.md).** It is distilled from ~20 articles across the
five outlets and it is the authority on how a Gridshift piece is built — headlines, ledes,
structure, register, sourcing, French conventions. Read it before writing. Do not go back to the
source sites to work out *how* to write; that question is already answered and written down.

**Facts come from research.** News is time-bound, so finding out *what happened* still means
fetching. That is steps 1 and 2.

If the task is "write an article about X" and you already know X, skip to step 3. The research
pass is not a prerequisite for writing — the blueprint is.

---

## The five sources

Research sources, and the corpus the blueprint was distilled from.

| Outlet | Feed |
|---|---|
| Push Square | `https://www.pushsquare.com/feeds/latest` |
| GAMINGbible | `https://www.gamingbible.com/index.rss` (Atom, `<entry>` not `<item>`) |
| Kotaku | `https://kotaku.com/rss` |
| GameSpot | `https://www.gamespot.com/feeds/news/` |
| VG247 | `https://www.vg247.com/feed` |

## Step 1 · Find the stories

```bash
python3 .claude/skills/writer/feeds.py 40    # TSV: outlet, date, title, link
```

Exits non-zero if fewer than three feeds answered — below that, stop and report rather than
writing off one outlet.

Read the ones you shortlist:

```bash
python3 .claude/skills/writer/read.py <url>
```

It tries Jina Reader, then falls back to fetching the page directly. Push Square needs the
fallback (Jina returns its forum sidebar). GAMINGbible arms an anti-bot block for hours at a
time and defeats both when it does — that is a real limit, not something to keep retrying.

**Corroborate.** A fact carried by one outlet is a claim, not a fact: find it twice, or write it
as attributed (*"VG247 reports…"*). Never write a piece from a headline you could not open —
that is inventing the middle. Rumours stay labelled as rumours.

## Step 2 · Pick the topics

```bash
ls src/content/games            # games with a fiche
ls src/assets                   # g-<game>.jpg = cover, h-<game>-N.jpg = hero
ls src/content/articles/en      # what exists — do not repeat an angle
```

1. The topic maps to a game with a file in `src/content/games/` **and** an image in
   `src/assets/`. No image, no article — this blog is image-led.
2. No angle already published. Check existing slugs and ledes.
3. Spread across games where the week allows. Three pieces on one game is a bad issue.
4. `news` for anything time-bound, `setup` for platform/edition/hardware comparisons, `guide`
   for how-to. Only `review` if we actually played it — a review needs `score`, `verdict`,
   `pros`, `cons`, and inventing those is fabrication.

Ship fewer rather than pad. If the week is thin, say so in the report; a thin piece costs more
than a missing one.

## Step 3 · Write

**Read [`blueprint.md`](blueprint.md) now if you have not.** Everything about how the prose
works lives there. What follows is only the mechanical contract with the site.

Two files per topic, **same filename** in `src/content/articles/en/` and `.../fr/` — the mirrored
filename is what links a page to its translation. Slug is kebab-case, game name first.

Frontmatter (schema is `src/content.config.ts`, enforced at build time):

```yaml
---
type: news              # news | review | guide | setup
lang: en                # en in en/, fr in fr/
title: "…"              # editorial headline, can run long
seoTitle: "…"           # ≤60 chars incl. brand
lede: "…"               # 1–2 sentences carrying both fact and angle
date: 2026-09-09T09:00:00+02:00
author: nour-benali     # nour-benali (news) · lina-morel (guides/setup) · sacha-vidal (reviews)
game: the-witcher-3-remastered
tags: ["The Witcher 3 Remastered", RPG, CD Projekt]
cover: ../../../assets/h-the-witcher-3-remastered-2.jpg
coverCaption: "…"       # what is in the frame, not a repeat of the headline
---
```

- **Image**: an `h-<game>-N.jpg` for that game, preferring one not already a cover
  (`grep -h '^cover:' src/content/articles/en/*.md | sort | uniq -c`). Fall back to
  `g-<game>.jpg`. Never invent a filename — the build resolves the path and will fail.
- **Internal links** use section slugs, which differ per language: `news`→`/news/` and
  `/fr/actus/`, `review`→`/reviews/` and `/fr/tests/`, `guide` and `setup` keep their names.
  See `src/i18n/config.ts`.
- Body is Markdown with `##` subheads, wrapped near 100 columns like the existing files.

## Step 4 · Verify, then publish

```bash
npm ci --silent 2>/dev/null || npm install   # fresh checkout has no node_modules
npm run build                                # validates frontmatter — must pass
npm run content:check                        # confirms the D1 export still parses
```

A build failure is the schema rejecting the article. Fix the file, never the schema.

```bash
git add src/content/articles
git commit    # message in French, like the rest of the log
git push
```

## Report

The topics and why, the sources behind each, anything dropped and why, and the commit SHA. If
the push happened, say the articles are live.
