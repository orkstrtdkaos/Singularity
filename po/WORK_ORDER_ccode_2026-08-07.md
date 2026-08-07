# WORK ORDER — CCode — 2026-08-07

**From:** Aevi (PO) · **Ordered by dependency. Build top to bottom.**
Erik gave PO the sequencing call. Everything below 1 is a tuning decision, and the standing rule is
**sim before tweak** — so the harness is first, not because it is urgent but because it gates the rest.

---

## 1 · SNG-357 — BALANCE SIM HARNESS ⛔ BUILD FIRST
`po/SPEC_SNG-357_balance_sim_harness.md`

Extends `tests/success_curve.mjs` / `tests/balance_sim.mjs`. Headless, pure, reads the content pack and
the **real saves under `characters/`**. Takes proposed overrides as args so a dial can be tried without
editing content.

Must report: bond curve **plotted against ACTIONS with real saves overlaid**, and the figure
**"% of campaign spent at max bond"** (83% for Silas today — that number IS the defect); the SNG-356
`roll` column vs the retired soft cap at ranks 4/6/9/12/16/20 by difficulty band, run against Silas's
real spread `(4,5,7,7,9,7,9,6)`; retroactive derived-grant preview per save.

⚠️ **Recompute average craft cost FROM THE CATALOG. Never hardcode 2.511** — I added 6 abilities today and
~80 more are coming; that number moves and the test rots if it is pinned.

---

## 2 · SNG-355 — PARTY ENTRY AND EXIT
`po/SPEC_SNG-355_party_entry_exit.md`

⛔ **No GM op exists for join or depart.** `recruit()`/`partCompany()` are called from exactly two places,
both `btn.onclick` behind a `confirm()` (`app.js:11113`, `:11120`). The story narrates departures the state
cannot hear.

Add both ops. ⚠️ **Entry needs consent, exit does not** — keep the confirm on join even when the GM
proposes it; a departure requiring the player's permission is not a departure. Add `leftDay`/`departedWhy`
and **keep the record — departure must stop being deletion.** ⚠️ **Regression risk: `companyRoster()` must
then filter on active membership** or every past ally returns as current.

Also: `recruit()` reads `teaches` from the AUTHORED catalog only, so **every generated NPC loses the
teacher role at recruit.** Fall back to `character.npcRegistry`. **Erik's save needs a backfill — Veth-Ondra
is his teacher and his save says `teaches: null`.**

---

## 3 · SNG-353 — COMPANION DETAIL PANEL
`po/DEFECT_SNG-353_companions_unsurfaced.md`

Twelve authored fields per companion; the player reaches two and a half. `persona`, `knowledge`,
`boundaries`, `stages` render nowhere; `role`/`appearance` are hover-only `title=` attributes, **dead on
touch.** No new content needed — this is purely rendering.

Tap target on **both** the company row and the codex block. `boundaries` renders **verbatim, never
summarised.** Bond badge becomes progress not score: `bond 4/10 · stage 2 of 3 · next at 7` — every number
is already computed by `companionStageThresholds()`/`bondOf()`.

⛔ **Erik's ruling on the bond grant: NAME IT, SEAL THE REST.** Show `bondGrants.name` + threshold as a
visible goal ("At bond 6, Marrow will teach you The Ashward") and nothing about what it does. **On unlock,
use the braid/mint celebration format** — the reveal is an event, not a status line.

⚠️ **Sequencing note: this panel renders a completed bar for most characters until the bond curve is
fixed** (SNG-354 — grant at 4 encounters, cap at 7). Ship after 1, or accept that.

---

## 4 · SNG-356 — WIRE THE LADDER
`content/packs/core/rules/sub_attribute_ladder.json` @ `38364d1e` · manifest @ `08a67d99`

Authored and at origin: 8 subs × 20 ranks, per-rank + cumulative, milestones, phase map. **Retroactive per
Erik.** It **retires `attributeSoftCap`** — the resolver should read the ladder, not the formula.

⚠️ **SNG-342's lesson: registration is not arrival.** It is in the manifest; `state.js` must actually LOAD
it and `CONTENT` must expose it. ⛔ **The derived grants are additive and safe. THE `roll` COLUMN IS NOT —
it is +0 at rank 4 but +10 from rank 6 on, and it is gated on the SNG-357 harness by the file's own note.
Do not ship the roll column on my say-so; ship it on the harness's.**

---

## 5 · SNG-350 — TWO LIVE STRINGS + THE COPY INVENTORY
`po/SPEC_SNG-350_rule_copy_is_content.md`

Small and still true: `app.js:7271` and `:7384` say *"Tap a node to learn or deepen it here"* and the
function beneath them documents the deepen affordance as gone. **Fix those two.** Then **step 2 is an
INVENTORY ONLY** — count every `app.js` string that fails the coupling test (*could this go false if a
rules file changed, untouched?*). **Count it, author nothing.** The copy half is mine.

---

## 6 · SNG-358 — HOLDINGS / HOUSEHOLD / ENTERPRISE — REVIEW BEFORE BUILD
`po/SPEC_SNG-358_holdings_household_enterprise.md`

Largest ticket in the queue. **Decompose: post → enterprise → household.** ⚠️ **Do not build in one pass,
and file a ROUND 2 review before starting** — I want your read on the `worldtick.js` hook and on whether
posts and enterprises should share a base record or stay separate.

⛔ **Household is modelled as STAKE and OBLIGATION, never as a stat line.** The moment a pregnant wife
grants a combat bonus the game has said something false. If it touches mechanics it does so through what
is now at risk.

**This blocks the SNG-356 ladder's late tier** (`presence`/`rapport` 14–20 are marked placeholders).

---

## STANDING
- Only Aevi closes, and only on symptom reproduced at authenticated origin — never on a ship report.
- If a spec surprises you, stop and file the review rather than building through it.
- ⚠️ **Two of my claims this session were wrong and Erik caught both** (the SNG-350 crossover; treating
  Silas as the ceiling). **If a number in a spec does not reproduce, say so — do not build to it.**
