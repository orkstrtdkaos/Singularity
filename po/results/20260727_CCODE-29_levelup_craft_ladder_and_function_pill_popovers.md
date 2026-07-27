# CCODE-29 — Level Up: craft rank-evolution popover + function-pill mechanics popover

**CCode · 2026-07-27 · v1.8.286 (`921e07ff`) · npm test exit 0 (rawProseCaps back to baseline 63).**

Erik (direct, on the Level Up screen): *"the skills need to have their detailed info pop up on
click/hover... i need to see how they evolve over time. Also for each pill that shows a function
i need a pop/click that gives me the mechanics."*

CCode-initiated UX task (Erik's direct ask, not an Aevi spec) → CCODE-29 namespace.

## What Erik couldn't see before
On Level Up, the craft rows showed a name + rank dots + the *next* rank's grant — but no way to
see the **whole road** (rank 1→3, what each grants, what it still can't do), and the function pills
(⚔ strike, ⬡ ward, ◉ reveal…) were **inert** — a glyph with no way to learn what the verb means.

## What I built (two popovers, on the ONE shared surface)

### 1. Craft rank-evolution ladder (the "how it evolves over time" ask)
- `skillDetail` (`engine/entityDetail.js`) gained a **ladder block**: for each rank, its name + what
  it *grants* + what it *still can't do*, with a **✓** on ranks the character already holds and a **○**
  on ranks ahead. Header: *"How it grows (depth is earned through use)"* — reinforcing the project law
  that rank is earned through use, not bought.
- `entityHover` (`app.js`) passes `ladder` from the ability's authored `tree[]` (`{rank, name, grants,
  cannot}`).
- Craft **names** on all **three** Level Up surfaces are now `data-entity="skill:<id>"` → the ladder
  popover: the reasoned "Suggested for you" picks, the coverage-gap fallback picks, and the owned
  **"Your crafts"** rows.
- Grant/cannot prose is word-boundary clamped via **`smartClamp`** (imported from `namematch.js`) —
  NOT a raw `.slice`, so the `rawProseCaps` ratchet stays at baseline 63.

### 2. Function-pill mechanics (the "each pill gives me the mechanics" ask)
- `functionChips` pills are now clickable (`class="fn-chip-click" data-verb="<verb>"`), cursor +
  hover-brighten in `style.css`.
- New **`verbDetail(verb)`** (`app.js`) reads `CONTENT.functionVocabulary.families` and returns the
  verb's **definition**, **what it is NOT** (the neighbour verbs it's confused with), and an **example** —
  stripping the authored copy's backticks / markdown. Family name lowercased for reading ("the influence family").
- New delegated `[data-verb]` click handler beside the existing `[data-entity]` one — reuses the same
  `showPopoverText` surface (the SNG-134 consistency principle: one detail surface, everywhere).
- Owned "Your crafts" rows now also render the function pills (they previously had none).

## Live verification (fresh port 8361, v1.8.286, dev character "Test Hero")
Drove the real DOM (screenshot tool times out when the pane isn't displayed — DOM reads are the proof):
- **Owned craft** `Prism Sight` (rank 2/3) → ladder shows **✓ Rank 1**, **✓ Rank 2**, **○ Rank 3**, each
  with grant + "still can't", rank-3 grant cleanly clamped at a word boundary ("…").
- **Unowned suggested craft** `Boundary-Stone` → header **"Not yet learned"**, all ranks **○**.
- **Function pills** `bind` / `reveal` / `ward` → e.g. *"BIND — the influence family / STOP or HOLD.
  Prevent action. / Not: command (which compels action). hinder (which weakens it). / e.g. Stillcraft.
  The Fixed Point. Truename."*
- 6 clickable craft names + 15 clickable function pills present on the screen.

## Gates
- `node --check app.js && node --check engine/entityDetail.js` — clean.
- `npm test` — exit 0; **rawProseCaps = 63 (baseline 63)** (the two new ladder clamps use smartClamp,
  so the ratchet did not trip); wiring audit all-pass.
- mojibake scan (`git grep` for â€/Ã) on all four touched files — clean.

## Files
- `engine/entityDetail.js` — `skillDetail` ladder + `smartClamp` import.
- `app.js` — `entityHover` ladder pass; `verbDetail` + `[data-verb]` handler; `functionChips` clickable
  pills; craft names clickable on all 3 Level Up surfaces + pills on owned rows; v1.8.286.
- `style.css` — `.fn-chip-click` cursor/hover.
- `index.html` — `?v=1.8.286`.

## Notes / owed
- Nothing owed to Aevi or Erik on this one — self-contained UX, no content dependency (it reads the
  ability `tree[]` and `functionVocabulary` that already ship).
- No new engine module → no ENGINE_MAP / engine_map.authored.json entry needed.

*— CCode. Erik can now tap any craft to see its whole road, and any function pill to learn what the
verb actually does. status: complete_pending_review.*
