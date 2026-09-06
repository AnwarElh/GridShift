# Gridshift copywriting blueprint

Derived from ~20 full articles across Push Square, GAMINGbible, Kotaku, GameSpot and VG247,
sampled 2026-09-06. **This file is the style authority.** Write from it. Do not re-read the
source sites to work out how to write — only to find out what happened.

Refresh it when the writing starts feeling stale or an outlet visibly changes, not on a
schedule. The procedure is at the bottom.

---

## 1. The five voices, and what each is for

They are not interchangeable. Each solves a different problem, and knowing which one a piece
needs is most of the decision.

**GameSpot — the wire report.** Writer invisible. Hard fact in sentence one, attribution in
sentence two, five to eight paragraphs, closes on a forward-looking fact (a date, what ships
next). Chains its sourcing outward without embarrassment: *"as reported by PC Gamer."* Use for
anything where the news is the news.

**Kotaku — the argued piece.** Writer present and willing to judge. Opens with a paragraph of
context, then turns on a *but*. Rarely uses subheads; moves by argument instead. Closes on a flat
personal aside rather than a summary — *"Personally, I don't get the appeal."* Will build a whole
article on a formal conceit and make it carry a real criticism. Use when the fact is small and
the meaning is the story.

**VG247 — the wry situation report.** States an odd situation plainly and lets the oddness show
through word choice (*"has inexplicably begun issuing wide-spread bans for its most active
players"*). Attributes inline and parenthetically: *(via SteamDB)*. Loves a comparative number
set — 128,157 against 81,096 against 75,689 — because scale is the argument. Will admit the
story is moving under it: *"The figure has already climbed several times during the writing of
this story."*

**GAMINGbible — the no-prior-knowledge explainer.** One-sentence paragraphs, almost without
exception. Re-explains the game from zero every time, however famous it is. Opens with a
standfirst line above the article that states the angle bluntly. Cites its own reviews by score
and block-quotes them. Flags spoilers inline. Parenthetical asides do the winking —
*"(of in-game time, not real-life time)"*. Use for service pieces where the reader may be
arriving cold.

**Push Square — the first-person report.** Present tense, "I" throughout, names the developer who
briefed them (*"Producer Rain tells me…"*). Will insert a frank negative mid-piece —
*"To be honest, this auto-fail stealth sequence did feel a bit dated"* — and will admit what it
could not find out. Short one-idea paragraphs in news; italics for emphasis on a single word.
Use for hands-on and previews.

**Where Gridshift sits:** GameSpot's spine, Kotaku's willingness to reach a conclusion. We
attribute like GameSpot, we judge like Kotaku, and we do not do GAMINGbible's one-sentence
paragraphs or Push Square's first person unless the piece is genuinely hands-on.

---

## 2. Headlines

**The claim goes in the headline.** Nothing withheld, nothing teased. If the piece argues the
mod misses the point, the headline says the mod misses the point.

**Length:** 8–16 words for the editorial title. `seoTitle` is a separate, shorter field —
≤60 characters including the brand, because Google truncates past that.

**The dominant device is the turn:** a comma, then *and* or *but*, then the thing that makes it
worth reading.

- *…, And They Look Fantastic*
- *…, But Not Everyone Is Happy*
- *…, but Kits are coming back to PC*
- *…, and the uncensored cut is still sitting on its own website in China*

It carries roughly a third of the headlines across all five outlets. Use it. Do not use it twice
in one issue — it becomes a tic fast.

**Second person is normal.** *How You Steal Cars.* *Doesn't Work Like You Think It Does.*

**Quoted fragments are the source's exact words, in single quotes.** *'way ahead of its time'*,
*'predominantly using people'*. Never paraphrase inside quote marks.

**Numbers stay unrounded.** 210,984 sq ft. 36,000 downloads. More than 600 people in three years.
"Thousands" when you have the figure is a wasted headline.

**Positioning by reference:** *a GTA 6 rival*, *Pokémon rival RPG*. Cheap, effective, use
sparingly.

**Prefix labels** (`Review:`, `Guide:`, `Preview:`) are a Push Square habit. We have a `type`
field that does this in the layout, so do not put the label in the title.

---

## 3. Ledes

Two patterns work. Both put the fact early; the difference is what comes first.

**Fact-first (GameSpot).** The hard news, then who said it.
> *Revelation* has a release date: April 8, 2027. Square Enix confirmed it during the
> PlayStation State of Play on September 3.

**Context-then-turn (Kotaku).** One sentence establishing the thing, then *but*.
> *Dawnwalker* is built around a thirty-day clock the studio spent years designing against.
> But the most downloaded mod on Nexus removes it.

**What does not work:** arriving at the fact in sentence three. Every lede in the corpus lands
its news inside two sentences. The `lede` frontmatter field is one to two sentences and must
contain both the fact and the angle — it is what runs on listing cards, so a lede that only
sets up is a card that says nothing.

---

## 4. Structure

- **Length:** 5–8 paragraphs of body for news; longer for guides and setups.
- **Subheads:** the sources mostly do without them; we use `##` because our pages are longer.
  A subhead must mark a real turn in the argument — *"The detail that makes this odd"*,
  *"Where the review turns"*. If it could be swapped with another subhead in the same piece
  without anyone noticing, it is decoration and should be cut.
- **The "so what" turn lands late**, and carries a caveat with it: console vs PC, price, region,
  what remains unconfirmed. Every good piece in the corpus has one.
- **Closes** on either a forward-looking fact (GameSpot) or a flat aside (Kotaku). Never on a
  summary of what was just said. A paragraph beginning *"In conclusion"* or restating the
  headline is the single most common failure and it is always cuttable.

---

## 5. Sentences and register

- Contractions throughout. Em-dash asides. Parentheses for the quiet joke.
- Game titles in italics (`*Onimusha*`), studio and people names in bold on first mention.
- **Sourcing is chained and in the prose**, never laundered into a bare assertion: *"as reported
  by"*, *"as spotted by"*, *"according to"*, *"(via SteamDB)"*. If one outlet has it and nobody
  else does, the sentence says which outlet.
- **Separate the documented, the claimed and the opinion** when a story mixes them. The corpus
  does this well and it is the thing that makes a piece trustworthy. Say what is confirmed, say
  what one person alleges, say what is inference.
- Specifics over categories. *Slim jim, lockpicking minigame, Waink app* beats *a new
  carjacking system*.
- We step forward and judge where we have grounds — *"That is a climbdown, and it is worth being
  clear about which kind"* — and we say plainly when we cannot know: *"nobody outside the studio
  can tell you."*

---

## 6. French

FR is a translation of the EN piece — same facts, same structure, same images, same slug — not a
second article. Conventions already established in the archive:

- **i/s** for fps, never "fps".
- **« »** for quotation marks, with the non-breaking spaces inside.
- French date and number formats; prices keep their source currency and symbol.
- Adapt the headline so it lands in French. Translating the English word order produces a
  headline that is technically correct and reads like a machine. The turn device survives
  translation; the pun usually does not, so replace it rather than strand it.
- Keep English game titles, studio names and mechanic names (*Shadowstep*, *Issen*) untranslated
  — they are proper nouns. Translate the common nouns around them.

---

## 7. The line we do not cross

Method only. **Not one sentence, headline or phrasing is carried over from a source.** Facts are
borrowed and attributed; wording is written from scratch, every time. A piece that reads like a
better-organised version of the source article has failed even if every fact in it is true.

---

## Refreshing this blueprint

Only when the writing feels stale or an outlet changes. Not weekly.

1. `python3 feeds.py 40` for the current headline corpus.
2. `python3 read.py <url>` for 3–4 full articles per outlet, spread across news, review and
   guide so each outlet's registers are represented.
3. Re-derive sections 1–5 against what you actually read, and update the dated line at the top.
   Keep the examples concrete and drawn from real articles — an abstract style rule is one
   nobody can write against.
