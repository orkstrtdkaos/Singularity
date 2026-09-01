# WORK ORDER — CCode · 2026-09-01

**Aevi (PO) → CCode.** Four items ready with **no dependency on Aevi or Erik**. A fifth needs one
call from Erik and is otherwise specced. Priority order below is Aevi's; reorder if the build
argues otherwise.

**Rulings backing this:** `RULING_training_gate_saves_and_pipeline.md` (R20–R23) ·
`RULING_axis_balance_20260901.md` (R16–R17) · `RULING_backlash_scaling.md` (R18) ·
`RULING_unlock_levels_and_bands.md` (R12–R15)

---

## 1 · ⛔ `rankUpAbility` has no UI caller — **highest value, do first**

`app.js` imports it and never calls it. **The engine is built and gated; training is unreachable in
play.**

⚠️ **Why this is first:** R20 just made training the answer to Silas's 31 stuck rank-1 crafts, and
R17 priced it to be affordable. Both rulings are inert until the button exists. Everything else on
this list improves a system nobody can currently reach.

**Scope:** the call site, and whatever surfacing the skill screen needs to show *"train to rank 2 —
N points"* against an owned craft. ⬜ Aevi has no UI opinion here; if a design question surfaces,
raise it rather than guessing.

---

## 2 · R20 — remove the tier gate on training; unlock at level 10

⛔ **R19 is retracted** (marked in place in `RULING_backlash_scaling.md`).

- **Remove** the tier N+2 eligibility gate entirely
- **Add** a single global threshold: **training available from level 10**
- After L10, any owned craft trains to rank 2 at `tierPrice` (R17, already built)

**The measurement:** against Silas at L30, the N+2 gate reached **3%** of his stuck crafts and your
proposed N+1 fix reached **16%**. A played sheet is not tier-sorted — his stuck crafts span T1–T5
plus 13 custom records with no tier at all.

✅ Corroborated across all 16 saves: **12 of 16 characters have zero rank-2 crafts**; the most
skill points anyone banks is **3**.

---

## 3 · OI-24 — save migration via the rename map

`content/packs/core/rules/ability_rename_map.json` (SNG-501, 377 entries) was applied to content.
⛔ **Saves were never swept.**

**All 142 ability rows across 16 saves:**

| | count |
|---|---|
| live in corpus | 79 |
| ⚠️ **stale id, resolvable via the map** | **22** |
| `customAbilities` | 13 |
| baseline kit (`martial_paths.json`) | 4 |
| ⛔ genuinely orphaned | **0** |

Examples: `the_raised_thing` → `raised_thing` · `the_shadow_work` → `shadow_work` ·
`the_warding_mark` → **`named_exclusion`** (a merge, not de-articling) ·
`total_focus` → `unmoving_mind`.

⚠️ **Silas's rank-3 and rank-2 crafts are in this set.** They resolve at runtime, so this is not
urgent for play — but it **must precede any audit that reads sheets as ground truth**, and Aevi
will be reading sheets for OI-19 and OI-20.

⬜ Handle `CUT` entries and `+` split expressions per the map's own `_howToRead`. Report anything
the map does not cover rather than dropping it.

---

## 4 · R22 — tomes and artifacts are one mechanism · unblocks build step 8

**One mechanism: an object grants ACCESS to a craft; the character still pays skill points as
normal.** The object removes the access barrier, never the cost.

Flavour wrappers over the same thing: tome · precursor artifact · quest item · miracle grant.

`character.tomes` has a reader and no writer. ⬜ **The writer should be generic** — keyed on "object
carrying a craft grant," not on the word *tome*, so the other three flavours use it unchanged.
Authored content follows from Aevi once the shape lands.

---

## 5 · R18 backlash merge — ✅ **FULLY RULED, BUILD IT**

✅ **Aevi ratifies your §3 percentages as authored** — they hit R18's pitch and both ends move the
right way at once:

| rung | health | energy |
|---|---|---|
| damaging | 7% | 11% |
| incapacitating | 13% | 22% |
| lethal | 20% | 33% |

✅ **Aevi agrees with your §2 recommendation: tier drops out.** Rung already encodes rank; tier
would double-count. `sustained_regard` (tier I, `harmRung: lethal`) is the case that proves it —
under tier-scaling it would backlash like a beginner's craft while doing lethal work.

✅ **ERIK RULED 2026-09-01: NO TIER FLOOR.** Backlash scales by rung only. Do not add
`max(rungPct, tierPct)`. Tier drops out of backlash entirely — surge backlash included.

⚠️ **OI-20 (~88 crafts needing per-rank `backlashRung` in `tree[]`) is Aevi's and not started.**
Per your own note, the merge is buildable ahead of it — build against the flat top-level value and
the rank term activates when the trees land.

---

## 6 · R24 — sex is set at generation · ✅ RULED, added 2026-09-01

**Ruling:** `po/RULING_sex_set_at_generation.md`

> Erik: *"You can't romance until you know the sex, so rather than leave sex runtime determined it
> needs to be SET upon PC/NPC generation. If there is no sex it's not romanceable."*

⛔ **Verified independently by Aevi:** `sex`/`gender` and `romanceEligible` are authored on
**0 of 43 NPCs and 0 of 9 companions.** Neither half of the attraction gate can fire.

⚠️ **Today `gender` exists only as a runtime, player-corrected value** — `corrections.js:277`,
built for the Pell-rendered-male fix. **That stops being the source of truth.**

| # | your part |
|---|---|
| 1 | ⚠️ **PC creation gets a sex-selection step.** This is a NEW element in the creation flow — it lands alongside the sub-attribute allocation step (R2) and the starting-location choice (R4). |
| 2 | **NPC minting assigns sex at mint**, not on first render. |
| 3 | **Retire `gender` as source of truth.** `corrections.js:277` may keep correcting the *rendering*; the generation-set value is canonical. ⬜ Report how you want the two to relate — Aevi has no wiring opinion. |
| 4 | **The attraction gate reads generation-set `sex`; absence is a hard exclusion.** |

✅ **The safety property falls out for free** — a companion like Aevi (a constellation of motes)
has no sex and is therefore non-romanceable with nothing authored to exclude it.

⬜ **Aevi's half:** backfill `sex` on the 43 NPCs and 9 companions where the character has one
(leaving it unset where they genuinely have none is the CORRECT value, not an omission), author
`romanceEligible` opt-in, and extend `boundaries` from companions to NPCs.

⚠️ **Sequencing:** R24 must land before R23 (Threnody emotional crafts). Those crafts reach into
the attraction system and cannot be authored against a gate that does not hold.

---

## Not in this order — Aevi's lane, listed so you know what is coming

| item | note |
|---|---|
| ~~C6~~ — ✅ **CLOSED by R24**, now item 6 above | Aevi's backfill half remains |
| **OI-19** — thin domains (Life 3, Spirit 4, Angelic 5, Demonic 5 tier-1 crafts) | blocks creation for 4 domains |
| **OI-20** — per-rank `backlashRung`, ~88 crafts | activates R18's rank term |
| **OI-25** — generative-to-corpus pipeline | Aevi reads `SPEC_SNG-369` and `SPEC_SNG-370` first. ⬜ **If either already solves part of it, say so before she specs over you.** |

---

## Standing

⚠️ Aevi concluded absence from a partial scan three times this session — the v2 domain structure,
the `harmRung` rank question, and these craft ids. **If she reports something missing, verify no
mapping or migration already covers it.**
