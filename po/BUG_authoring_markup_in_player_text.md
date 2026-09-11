# BUG — my authoring markup is in the player's skill card

**Aevi (PO) · 2026-09-11.** ⬜ **Erik, reading a craft in game.** ⛔ **This is mine and it is 429 crafts wide.**

---

## §1 — ⛔ WHAT ERIK SAW

> *"⛔ STOP CARRYING IT DISCREETLY. Palework is necromancy in daylight…"*
> *"Cannot: ⛔ IT SHOWS THEM AN ENDING; IT DOES NOT CAUSE ONE. ⚠️ AND THE PEACEFUL ARE NOT IMMUNE…"*
> *"○ Rank 2 — Open Ground: ⛔ EVERYONE WHO CAN SEE YOU SEES IT…"*

⚠️ **THE GLYPHS AND SHOUTING CAPS ARE AEVI'S PO-DOCUMENT EMPHASIS CONVENTION.** ⛑ **They belong in specs,
replies and `_why` fields, where the reader is Erik or CCode. ⛔ THEY ARE NOT PROSE AND THEY ARE BEING SHOWN
TO PLAYERS.**

---

## §2 — ⛑ MEASURED, AND IT IS NOT EVENLY SPREAD

**429 crafts. Which field carries markup:**

| field | affected | player-facing? |
|---|---|---|
| ⛔ **`tree[].grants`** | ⛔ **386 of 429** | ⚠️ **YES — the entire "How it grows" ladder** |
| ⛔ **`tree[].cannot`** | ⛔ **233** | ⚠️ **YES — the "still can't" line** |
| ⛔ **`notFor`** | **152 (35%)** | ⚠️ **YES — the "Cannot:" line** |
| **`description`** | 95 (22%) | ⚠️ YES — the body |
| `plainly` | 58 (13%) | ⚠️ yes, on other surfaces |
| `narrationHints` | 54 (12%) | ⛑ GM-side |

⚑ **AND `dread_mantle` SHOWS THE SHAPE EXACTLY: its `description` and rank-1 `grants` ARE CLEAN PROSE.**
⛔ **The markup is in `notFor` and `cannot` — and in the rank 2 and 3 `grants`, which is where 386 of them
live.**

⬜ **So this is NOT *"the authoring is bad"*. It is: ⛔ THE DISCIPLINE HELD ON THE FIRST FIELD OF EVERY CRAFT
AND LAPSED ON THE REST.**

---

## §3 — ⚠️ AND THE RENDERER MAKES IT WORSE IN TWO WAYS

**`entityDetail.js:20-31`:**

| ⛔ | |
|---|---|
| **`String(ab.description).slice(0, 200)`** | ⚠️ **a HARD character cut** — ⛑ the ladder uses `smartClamp`; the body does not, which is why Erik's paste ends mid-sentence on *"The Ashwarden puts on what she actually is,"* |
| ⛔ **`notFor` at `slice(0, 120)`** | **the same, tighter** — *"someone who has"* |
| ⚑ **and the ladder clamps at 160** | ⚠️ **so every rank line ends in `…` and then a SECOND truncated clause in parentheses** |

⛔ **THE CARD IS SHOWING FOUR TRUNCATED SENTENCES AND A PARENTHETICAL PER RANK.** ⚑ **Even with clean prose
it would read badly** — ⚠️ **the markup makes it unreadable, but the layout is not helping.**

---

## §4 — ⬜ THE FIX, AND IT IS IN TWO PARTS

### ⚑ PART ONE — CONTENT, AND IT IS AEVI'S

**Strip glyphs and SHOUTING from the four player-facing fields: `description`, `notFor`, `plainly`, and
every `tree[].grants` / `tree[].cannot`.**

⚠️ **NOT a regex sweep.** ⛔ **The caps often carry the emphasis that makes a line land — *"IT DETERS. It
does not stop anyone who has decided"* is good writing wearing a bad convention.** ⛑ **Lowercasing it
mechanically would flatten 386 rank lines into mush.**

⬜ **Aevi rewrites them, in this order:** ⚑ **`notFor` and `tree[].cannot` first** — ⚠️ **those are the
"Cannot" lines a player reads while deciding** — then `description`, then the rank ladder.

⛑ **AND THE `_why` FIELDS STAY EXACTLY AS THEY ARE.** ⚠️ **`_wardTypes`, `_powerSystemFix`, `_controlReview`
are author-facing and the glyphs are doing real work there.**

### ⬜ PART TWO — DISPLAY, AND IT IS CCODE'S

1. ⛔ **`smartClamp` on `description` and `notFor`**, not `slice` — ⚑ the ladder already does it.
2. ⚠️ **Reconsider showing `cannot` per rank on the card at all.** ⛑ **Four truncated negatives is a wall.**
   ⬜ **Aevi's read: the rank line shows what it GRANTS; the limits belong in one "Cannot" block at the top.**
3. ⚑ **A gate would stop this recurring:** ⛔ ***"no player-facing craft field contains an authoring
   glyph."*** ⚠️ **One line, and it never goes stale** — and it is the same shape as the agreement gate that
   caught the `gme` bug.

---

## §5 — ⛑ AND THE HONEST NOTE

⚠️ **Aevi has written 429 crafts' worth of this and never once opened the card a player sees.** ⛔ **The
convention is load-bearing in PO documents and she carried it into content without asking whether content
has the same reader.**

⚑ **It is the fourth-door failure in its own costume: the authoring was fine for the audience she had in
mind, and she never checked who was actually reading.**
