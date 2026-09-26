<!-- status: work order for CCode — everything outstanding as of 2026-09-26, prioritised. Supersedes nothing; points at every spec it names -->
# WORK ORDER: Aevi → CCode, 2026-09-26. Everything outstanding, in priority order

**Erik:** *"summarize and reference all of it for ccode to prioritize and work."*

Measured against origin at d347de527+: each spec's status line, CCODE commits that cite it, and whether its engine
reader exists (`git grep` for its fields). **Staged content stays staged until its reader ships in the same commit.**
"Built" means I found the reader. Where I'm not sure, the item says **verify**.

---

## P1 — In flight, small, and each one unblocks content that's already written

| # | spec | what's left (yours) | then (mine) |
|---|---|---|---|
| 1 | **SNG-662** the ones who protect fight back | `VERB_EFFECT`: `protect` → hold (cancel a banked loss), `quest` → selfWin, `crusade` → carryWar (foes = rivals + whoever names you). Measure "crusader pays when outnumbered" vs "never pays". Gate: every verb has an entry. **This is the news Erik keeps seeing:** the same five powers bleeding. | apply `changesets/SNG-662_…` + the kind palettes |
| 2 | **SNG-661** the storied bestiary | `bestiaryEncounters`: `tags: c.habitat`; surface `storyRule` after a KNOW success (or at once for the `storiedBy` people). Measure zero-beast locations and beast share of the dangerous pool first. | apply 52 creatures + `storied_beast` class; schema fields |
| 3 | **SNG-660** the top of the world | §1: BEAST_TIER one row per rung, level inside its rung (derive it from `DEFAULT_RUNGS`). **Measure Loki / Silas at danger 1 and 3 before shipping.** Mythic never rolls; unknown tier fails loudly. §2: legend gear enters the world as an item at the legend's level (`fromGear`), once per line. | apply `SNG-660_bestiary_top.json` + the 3 top creatures from SNG-661; author 2 epics |
| 4 | **SNG-657 §3** raid leaders | +1 command; captain's contest; **withdraw rather than die**; captured on a rout; take a hold **only if the power wants the ground**. Target: about 40% of holds won by raiders. No reader found yet. | — |

## P2 — The map: the Sovereign stack (unfinished since 09-24)

`po/WORKORDER_aevi_20260924_sovereign_stack.md` has the full order and dependencies. **Item 1 (name pools,
SNG-639) is done** (CCODE-487), and the nemesis (SNG-648, CCODE-491) and the power generator (SNG-647, CCODE-489)
shipped. **None of items 2–7 has a reader:** `marksSeen`, `namesKnown`/`nameKnown`, `luciferMask`, `whatItCosts`,
`arc_the_widening` and `generatorRule` appear nowhere in engine/.

| # | item | staged file(s) | needs |
|---|---|---|---|
| 5 | **C15** a hunger arc per Sovereign + `formsFix` + Lucifer's mask (Eosphor stands in) | `SNG-642_hunger_arcs.json` · `SNG-643_names_and_the_unmet.json` (unmet + `arc_the_widening`) · `SNG-641_marks.json` → `starlessRivalAdd` | — |
| 6 | **C13** supply-line deeds: breaking, taking, turning a `feedsGM` power or killing its leader → `arcContests` | `SNG-640_changeset.json` (`feedsGM` on 4 powers) | 5 |
| 7 | **3b** the supply-line rule (RULED): a minted power matching a hunger becomes a line at arc stage ≥ 1, one per Sovereign per region | `SNG-641_marks.json` → `generatorRule` | 6 |
| 8 | **C14** the marks: place, record `save.marksSeen`, thresholds unlock GM lines + `onceLineKnown`. The Sovereign is never named | `SNG-641_marks.json` (15) + unmet's 3 | 5 |
| 9 | **C16** the artifacts: every use pushes `arcContests`; `whatItCosts` **enforced**; holding one counts as seeing its mark | `SNG-642_artifacts.json` (9) + unmet's 2 | 5, 8 |
| 10 | **C17** whole names, **only together with the gate**: `nameKnown` world / few / gm; a `gm` name never enters `aliases` | `SNG-643 … names` (113) | — |
| 11 | **C18** held seats: a claimant can't take a seat its holder (Neth, the Last Mercy) still stands in | `SNG-644_held_seats.json` | 5 |

**Mine, alongside:** SNG-645, powers for the remaining 24 empty regions (change sets in the SNG-634 shape).

## P3 — Trade and the working hold (Erik said yes; not built)

| # | spec | what's left |
|---|---|---|
| 12 | **SNG-654** levers A–D | A: a route is a standing run (value per pass, "first coin in N passes"; stock waiting counts toward raid exposure). B: rank markets by that value, one per region, route more than 4. C: carriage speeds (stable 2×, lizard den 2.5×, water 3×, hired company 2× and gate-aware). D: a known road gets safer (−10% per run, down to half; a relay station doubles it). None of `firstCoin`/`speedMult`/`knownRoad` exists. |
| 13 | **SNG-652 §6** | Hire a trade company with the **cost vs benefit** shown, and **visiting traders** (a hold feature). `caravan.js` exists. **Verify** which of the two it covers. |

## P4 — Schema work still open (SNG-658)

| # | what |
|---|---|
| 14 | Split legend / npc / creature schemas so the 57 npc and 28 creature records pass on `schemaVersion` (it is the whole of both counts). |
| 15 | Saves: 109 undeclared keys, and the person / company_member schemas are in. Remaining: the 6 invalid characters (3 legacy origins that reconcile renames, 1 chronicle object). |
| 16 | The generator reads its schema for every type it writes (4 wired today: npc, location, arc, creature). Extend it as each draft schema is ratified. |

## P5 — Backlogged by Erik (not queued; listed so nothing is lost)

`po/BACKLOG.md`: the encounter tuning matrix (your harness, the numbers are the deliverable) · NPC generation
beyond domains (hand-author only the hinges) · the Afterling and the Unordered as peoples · the `autonomous`
fourth nanite state · the opponent's third mood · crowding by the opposing source (a dial). *The retrieval roll is
built (`rollRetrieval`), so that backlog line can close.*

## Waiting on Erik (not for you)

- **SNG-634 §8** and **SNG-636 §8**: rulings on powers on the ground and the hierarchy above them.
- **SNG-641 §7**: Lucifer's mask, the Starless, and the seat count.
- **SNG-640 §6** (the rest of it).
- **Sera / Seraphine**: one record of the High Luminary or two.

## Built and verified this week (for the record)

SNG-650–653 (holdings screen, people, pledges, Attack & Defense), SNG-655 (watch and retrieval rolls), SNG-656
(`comes`), SNG-657 §1–2 (level 100, defenders), SNG-658 census gate + fixes, SNG-659 §1–2 (reach in the clash, the
derived kit, `madeAtLevel`), CCODE-516/518/524/525 (Erik's in-play bugs).

— Aevi, PO