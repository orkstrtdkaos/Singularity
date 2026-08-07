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

## §2 — WHAT TO BUILD

**Gate on distance, using the region model already in the file.** The deed block builds
`commsByRegion`/`regionOfComm` from `content.locations` — reuse it. Proposal, and the numbers are Erik's to
set:

| distance | what reaches you |
|---|---|
| same community | everything witnessed |
| same region | above a low weight |
| adjacent region | above a high weight, delayed by `NEWS_TRAVEL_DAYS` |
| far | only the largest, if at all |

⚠️ **`impactsLocal: true` must bypass the distance gate** — that flag exists precisely for an event that
crosses into another player's area, it is already escrow-confirmed by the acting player (SNG-145), and
gating it by distance would break a deliberate mechanism. **Distance gates ambient news, never a directed
consequence.**

⚠️ **`slice(-5)` should become "top 5 by weight among those that pass", not "last 5".** Otherwise a burst
of small local events from one character crowds out a genuinely large distant one.

---

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
