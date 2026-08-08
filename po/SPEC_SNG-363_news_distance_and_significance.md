# SNG-363 — Cross-character news has no distance and no significance gate

**Author:** Aevi (PO) · **Date:** 2026-08-07 · **Origin:** Erik in play — *"Why is Silas hearing about
something Splarf did? It's not huge news and they're far apart."*
**Status:** spec_ready · **Evidence: measured from `world/ledger/2026-08.json` at origin (8 live entries).**

---

## §1 — THE ROOT CAUSE, one line

`engine/worldtick.js:430`:

```js
const fromOthers = ledger.filter(e => e.who !== character.id && e.at > since && e.visibility !== "hidden").slice(-5);
```

⛔ **The only filters are: not you · newer than last read · not hidden.** There is no distance test and no
significance test. `e.where` is read **only to print** `"(near X)"` — it never decides whether you hear it.
`slice(-5)` caps volume by RECENCY, not by relevance.

**So Silas hears everything every other character does, forever, wherever it happened.** Erik is describing
the system working exactly as written.

⚠️ **AND THE RIGHT MODEL ALREADY EXISTS TWENTY LINES ABOVE.** The deed-spread block (SNG-281) does this
properly — `spreadDeeds`, **one hop per pass, reach capped by the deed's weight**, with the standing
directive *"⛔ Magnitude, never merit — an atrocity travels exactly as far as a rescue of the same size."*
It even carries the comment about Silas's deeds having been known in 91 of 90 communities before the fix.
**The cross-character ledger is the same bug, in the same file, that was already fixed once for deeds and
never applied here.**

## §1a — There is no magnitude field, but there IS a magnitude signal

Measured field set across all 8 live entries: `at · worldDay · who · playerKey · where · what · tags ·
spectrumDeltas · visibility · impactsLocal · schemaVersion`. **No weight, no magnitude.**

⚠️ **Do not add one yet.** `spectrumDeltas` is already a magnitude proxy — a bigger event moves the world's
axes further — and deriving beats authoring a field every future GM call must remember to set. **Try
`Σ|spectrumDeltas|` as the weight before introducing a new field.** If it proves too coarse, that finding
justifies the field; assuming it will is how we get another value nothing sets correctly.

---

## §2 — WHAT TO BUILD — ⛔ AMENDED BY ERIK: THE BANDS ALREADY EXIST. DO NOT INVENT THRESHOLDS.

My first draft proposed a fresh same-community / same-region / adjacent / far table. **Erik: *"don't we
already have a deed gradient or band? … also power level, hero — epic — legend etc should correlate with
distance and deed type."*** He is right on both counts, and I specced new numbers over a model that was
already sitting in the file.

### §2a — Deed weight → reach is ALREADY the distance model (`engine/reputation.js:35`)

```js
const reach = Math.min(3, Math.max(1, Math.abs(Number(d.weight) || 1)));
const capBy = { 1: 2, 2: 5, 3: 12 }[reach];
```

| weight | reaches | in words |
|---|---|---|
| 1 | 2 communities | stays where it was seen |
| 2 | 5 communities | regional |
| 3 | 12 communities | crosses regions — and only after it is heard everywhere near |

**That is the gradient. Use it verbatim for cross-character news.** `spreadDeeds` is already pure, already
takes the community graph, and is already called twenty lines above the broken filter. ⚠️ **The news gate
should call the same function, not a parallel implementation of the same idea** — a second copy of a
distance model is how the two drift apart.

### §2b — ⛔ THE FIGURE TIER SCALE IS ALREADY A DISTANCE LADDER, AND NOTHING READS IT AS ONE

`engine/whois.js:20` — `TIER_MEANING`, the text Erik saw in the popup:

| tier | rank | the authored definition | the distance it is already stating |
|---|---|---|---|
| riffraff | 0 | *not yet anybody* | nowhere |
| notable | 1 | *someone is beginning to say their name* | one settlement |
| heroic / regional | 2 | ***a name in their own country*** | **their region** |
| epic | 3 | ***known well beyond where they started*** | **beyond their region** |
| legendary | 4 | *they have lasted, and been counted* | everywhere, and it persists |
| mythic | 5 | *the world has a story about them* | everywhere, forever |

⚠️ **These are not flavour strings. "A name in their own country" and "known well beyond where they
started" are reach statements, authored, in the file, being used only as popup text.** `tierRank()`
already returns 0–5. **The actor's tier should widen the reach their deeds get** — a legend doing a small
thing IS news, and an unknown doing the same thing is not.

**Proposal (Erik's numbers to set):** effective reach = deed weight band, widened by `tierRank(actor)` —
e.g. `+1 band at epic, +2 at legendary/mythic`, floored at the deed's own band. Riffraff and notable
widen nothing.

### §2c — ⚠️ THIS DOES NOT VIOLATE DIRECTIVE SNG-280

SNG-280 reads *"Magnitude, never merit — a massacre and a rescue of the same magnitude are heard about
equally far."* **Merit is the MORAL quality of the deed. Actor renown is a different axis entirely**, and
it cuts both ways: a notorious figure's small cruelty travels exactly as far as a legend's small kindness.
**Whose hand it was is not the same claim as whether it was admirable.** Worth stating plainly so this is
not read as an erosion of the directive.

### §2d — What still needs building

- **`impactsLocal: true` bypasses the gate entirely** — that flag is a directed consequence, already
  escrow-confirmed under SNG-145. Distance gates ambient news, never a directed one.
- **`slice(-5)` → top 5 by reach among those that pass**, not the last 5, or a burst of small local events
  crowds out one large distant one.
- ⚠️ **Ledger entries carry no `weight`** (measured field set in §1a) — deeds do, ledger events do not.
  **Try `Σ|spectrumDeltas|` mapped onto the same 1/2/3 band** before adding a field, so the two systems
  share one scale rather than acquiring a second one.

## §3 — THE "SEVERAL OF THE SAME VEIL EVENT" — a different defect, and it is real

Erik: *"there are several of the same event with the veil."* Measured — they are not display duplicates,
they are **three separate ledger writes, all from char-msgpisca at `the_thinning`:**

| at | what |
|---|---|
| 08-05 23:59 | the veil sealed itself after a failed bridge-attempt |
| 08-06 18:06 | the sealed veil opened and a messenger crossed |
| **08-06 18:10** | **the sealed veil opened by choice and allowed safe passage** |

⛔ **The last two are four minutes apart and are the same beat logged twice** — one veil-opening, written
as two consequences. The first is a legitimately distinct earlier event.

**This is ledger-emission granularity, not news display.** The GM emits `turn.ledgerEvents` and nothing
dedupes near-identical `what` at the same `where` within a short window. **Suggested: collapse entries
sharing `who`+`where` inside one in-world day when the texts are near-identical** — and ⚠️ **collapse
rather than drop**, since a genuine escalation at one place in one day is real and must survive.

---

## §4 — ⛔ SEPARATE BUG FOUND WHILE MEASURING: `where: "gen-object-object"`

**Three of eight live ledger entries have `where: "gen-object-object"`** — an object was stringified into
a location id (`"" + {}` → `[object Object]`, slugged). All three are char-mr4ejo8c, 2026-08-01, all
`impactsLocal: true`.

⚠️ **This is not cosmetic and it compounds §2:** the distance gate cannot work on a location that does not
exist, and these are exactly the entries flagged as crossing into someone else's area. Whatever builds
`where` at `app.js:5358` (`where: location.id`) received an object where an id was expected. **Worth
tracing before the gate is built, or the gate inherits three unplaceable events.**

---

## §5 — OUT OF SCOPE

- The distance thresholds themselves — **Erik's numbers**, and the harness could sim them.
- A magnitude field (§1a) — try the derived signal first.
