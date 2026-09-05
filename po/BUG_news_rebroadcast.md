# BUG — the news panel re-broadcasts old deeds, and clips instead of scrolling

**Aevi (PO) · 2026-09-05 · from Erik's play.** ⬜ **CCode — two defects and one prose note.**
> Erik: *"My news is still popping up old stuff… and it **cuts off instead of becoming a scrollable**."*

**Screenshot:** Whistling Woman Post, Day 16, world count 1624. ⚠️ **ONE genuinely new line** — *"Calvar has
been asking after you. More than once."* — and **SEVEN** `Word has spread beyond its own valley…`: the
provisioning arrangement with Aldric, the boar with Corvin, the bull boar with Pell, naming Memory, the kiss
at the forge bench, the badger's ending, Edvar Crane's commission.

---

## §1 — ⛔ DEFECT 1: `rate: 1` — EVERY DEED HOPS EVERY PASS

### ✅ `spreadDeeds` IS CORRECT. THE CALLER IS NOT.

**`reputation.js:29` does the bookkeeping properly:**
```js
d.spread = Array.isArray(d.spread) ? d.spread : [];
const reach = Math.min(3, Math.max(1, Math.abs(Number(d.weight) || 1)));
const capBy = { 1: 2, 2: 5, 3: 12 }[reach];
if (d.spread.length >= capBy) continue;      // ✅ a saturated deed stops
if (rng() >= rate) continue;                 // ⚑ THE THROTTLE
```

**`worldtick.js:560–566`:**
```js
const ready = (character.deeds || []).filter(d => (currentDay - (d.day ?? 0)) >= NEWS_TRAVEL_DAYS);
const hops = spreadDeeds({ deeds: ready }, { …, rng, rate: 1 });   // ⛔ HERE
for (const h of hops) news.push({ text: `Word has spread beyond its own valley, as far as …` });
```

⛔ **`rate: 1` MAKES `rng() >= rate` UNREACHABLE.** ➡️ ⚠️ **EVERY eligible deed takes a GUARANTEED hop on
EVERY tick, and every hop prints a line.**

| | |
|---|---|
| ⚑ **the authored rate is 0.35** | `arc_response.json` → `deedSpreadRate: 0.35`, and **`worldtick.js:3098` reads it for FIGURES** |
| ⛔ **the player path hardcodes 1** | ⚠️ **so the player's deeds spread ~3× faster than any NPC's, guaranteed rather than chanced** |
| ⛔ **a weight-3 deed** | `capBy: 12` → ⚠️ **TWELVE news lines, one per pass, until saturated** |

### ⚠️ AND THE COMMENT TWO LINES ABOVE STATES THE INTENT IT BREAKS

> *"`spreadDeeds` now owns it for the player exactly as it does for figures: **ONE HOP PER PASS**."*

⛔ **`rate: 1` turns that into ONE HOP PER *DEED* PER PASS.** ⚠️ **Seven deeds eligible → seven lines, every
tick, forever, until each hits its cap.** ➡️ **It is not old news resurfacing. It is old deeds being
re-broadcast.**

### ⬜ FIX — two shapes, and the comment says which

| | |
|---|---|
| ⬜ **A · drop `rate: 1`** | take the authored `0.35`, ⚑ **the same figure NPCs use** |
| ⬜ **B · cap total hops per pass at ONE** | ⚑ **literally what the comment says** — *one hop per pass* |

⚠️ **Aevi reads B as the intent and A as the smaller change.** ⛔ **B is better: at 0.35 with seven eligible
deeds you still average two to three lines a pass.** ⬜ **CCode's call; both are one line.**

⛔ **AND DO NOT RETROACTIVELY TRIM `d.spread` ON EXISTING SAVES.** ⚠️ The file's own rule, four lines above
the bug: *"existing saves keep their over-spread deeds — **rewriting a player's history to match a new model
is a retcon, not a migration**."*

---

## §2 — ⛔ DEFECT 2: THE PANEL CLIPS

**The "WHILE YOU WERE AWAY…" block is a fixed height and the list is cut mid-item.** ⚠️ Seven spread lines
overflow the first screen and the rest is unreachable.

⬜ **Scrollable region with a max height.**

⛔ **BOTH HALVES MATTER.** ⚠️ **Fixing §1 alone still overflows on a busy return** — a genuine week away
should produce more news than fits. ⚠️ **Fixing §2 alone hides a real bug behind a scrollbar.**

---

## §3 — ⚠️ PROSE: SEVEN IDENTICAL OPENINGS

**Every line begins with the same eleven words:** *"Word has spread beyond its own valley, as far as X:"*

⛔ **That is why it READS as repetition even where the deeds genuinely differ** — a boar hunt, a kiss, a
naming and an ending all arrive in the same costume.

✅ **The section is already headed WORD FROM ELSEWHERE**, so the prefix is redundant.
⬜ **Proposed: `As far as kestrel's roost: …`** ⚠️ **One line in `worldtick.js:565`. Aevi's, if you would
rather not touch prose.**

---

## §4 — ⬜ AND ONE THING WORTH CHECKING WHILE YOU ARE IN THERE

⚠️ **`NEWS_TRAVEL_DAYS = 3` and `NEWS_CAP = 20`.** ⛔ **With seven deeds hopping every pass, the cap is
reached in three passes and genuinely new items are pushed out by re-broadcasts of old ones.**
➡️ ⚑ **That is probably why *"Calvar has been asking after you"* is the ONLY new line in the shot — the rest
of the budget went to spread.**
