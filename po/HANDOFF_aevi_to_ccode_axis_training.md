# Handoff — Aevi → CCode · axis balance, training gate, saves

**2026-09-01 · responds to `po/BUILD_STATUS_axis_balance.md` v1.9.299**

---

## Read in this order

1. `po/RULING_training_gate_saves_and_pipeline.md` — **R20–R23, newest, supersedes R19**
2. `po/RULING_axis_balance_20260901.md` — R8–R11, R16–R17
3. `po/RULING_unlock_levels_and_bands.md` — R12–R15
4. `po/RULING_backlash_scaling.md` — R18 (R19 now marked retracted in place)

---

## ✅ Every open call is answered

| your ask | ruling |
|---|---|
| §A antipode ceiling | **R16** — rises with `lean`. Built. |
| §B rank-2 price | **R17** — `tierPrice`, no band. Built. |
| §C backlash magnitudes | **R18** — % of pool, scales by rank and intensity. Proposal filed. |
| adjacent / acquired ceilings | **R21** — your assumption confirmed: adjacent 3, acquired 2. |
| tomes | **R22** — one mechanism. Unblocks step 8. |
| **R19 × R12 collision** | **R20** — see below. |

---

## ⛔ R20 — the collision fix is bigger than moving the gate down a tier

Your proposed fix (gate at N+1, T1 from L8) measured at **16%** of Silas's 31 stuck crafts. The
current gate measured **3%**. Neither works, because a played sheet is not tier-sorted — his stuck
crafts span T1–T5 plus 13 custom records carrying no tier at all.

➡️ **Remove the tier gate entirely. Training unlocks globally at level 10.** After L10 any owned
craft trains to rank 2 at `tierPrice`.

Corroborated across all 16 saves: **12 of 16 characters have zero rank-2 crafts**, and the most
skill points anyone banks is **3**. Rank-up barely happens; the gate throttled something already rare.

⚠️ **And this retires the Insight-dumper overflow concern as theoretical** — no live character banks
points.

---

## ⬜ Two new items for you

### OI-24 — save migration, and it is your lane

⛔ **Aevi reported these crafts as orphaned. That was wrong** — Erik caught it and told her to trace
them. `content/packs/core/rules/ability_rename_map.json` (SNG-501, 377 entries) resolves every one.

**All 142 ability rows across 16 saves:**

| | count |
|---|---|
| live in corpus | 79 |
| ⚠️ **stale id, resolvable via the map** | **22** |
| `customAbilities` | 13 |
| baseline kit (in `martial_paths.json`) | 4 |
| ⛔ genuinely orphaned | **0** |

`the_raised_thing` → `raised_thing` · `the_warding_mark` → `named_exclusion` (a merge) ·
`total_focus` → `unmoving_mind`.

⚠️ **The map was applied to content; saves were never swept.** Silas's rank-3 and rank-2 crafts are
in this set. Not urgent for play — they resolve at runtime — but it must precede any audit that
reads sheets as ground truth.

### OI-25 — generative-to-corpus pipeline

13 `customAbilities` across saves, from two sources with no path home:

| source | example |
|---|---|
| braiding | `braid_order_sense_palework` — *"Ashen Meridian"*, full record incl. `harmRung: lethal` |
| bond teaching | `marrow-s-wings`, `the-attended-end` — `taughtBy: "Marrow (bond)"` |

Erik on Marrow's Wings: *"one of my all time favorite skills… that generative nature needs a clear
pipeline to the skill base list."*

⬜ Aevi specs this, reading `SPEC_SNG-369_seed_braid_store_from_catalogue.md` and
`SPEC_SNG-370_nary_braids.md` first. Flagging it here so you know it is coming and can say if
either prior spec already solves part of it.

---

## Still yours

- ⛔ `rankUpAbility` has no UI caller — **training is unreachable in play** regardless of R20
- ⬜ OI-23 — reconcile `surgeBacklashByTier` with `backlashByRung`

## Still Erik's

- R18 tier floor · OI-21 (T4/T5 trainable?) · the splurge problem (C7.5)

## Still Aevi's

- OI-19 thin domains · OI-20 per-rank `backlashRung` · OI-22 percentage table · C6 (blocks R23)

---

## ⚠️ What to be skeptical of in Aevi's work this session

She concluded absence from a partial scan **three times** — the v2 domain structure, the `harmRung`
rank question, and these craft ids. Each was caught by Erik, not by her own checking. **If she
reports something missing, verify a mapping or migration does not already cover it.**

Your `CCODE-224` note is the counterexample worth keeping: it predicted the antipode-castable
interaction before R16 existed. That gate was written by someone thinking ahead and it paid off.
