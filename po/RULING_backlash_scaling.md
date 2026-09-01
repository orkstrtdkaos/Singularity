# RULING — Backlash scaling, rank-gated training, and the tier-1 depth pass

**Ruled by:** Erik · **Date:** 2026-09-01 · **Recorded by:** Aevi
**Responds to:** CCode §C (backlash magnitudes) · builds on R5 (corrected), R17

---

## R18 — Backlash magnitude scales by pool, rank, and intensity ✅ RULED

### ✅ Direction (b): percentage of max pool, not flat numbers

⛔ **The flat magnitudes have the inversion Erik has caught repeatedly** — they land hardest on
low-level characters and vanish for high-level ones.

Measured at Silas L30 (maxHealth 191, maxEnergy 282):

| rung | flat HP/EN | % of Silas | % of a 20/20 L1 |
|---|---|---|---|
| damaging | 4 / 10 | 2.1% / 3.5% | 20% / **50%** |
| incapacitating | 7 / 14 | 3.7% / 5.0% | 35% / **70%** |
| lethal | 11 / 20 | 5.8% / 7.1% | 55% / **100%** |

⚠️ 2% is not "fading as you master it" — it is irrelevant. Half an energy pool at L1 is not a
threat — it is the end of the day.

➡️ **Backlash is a percentage of the wielder's max pool.** ⬜ Percentages TBD — Aevi to propose a
table; target pitch is `lethal` ≈ a fifth of health and a third of energy.

### ✅ It scales with RANK

`harmRung` already scales per rank — **top-level is the CEILING, `tree[]` carries the per-rank
value** (`engine/intent.js:34`, SNG-147c). ✅ Verified: all 88 crafts with a real `harmRung` author
a per-rank tree; all 18 tier-1 `lethal` crafts reach lethal only at **rank 3**.

⛔ **`backlashRung` does NOT scale** — it is a single flat top-level value. `sustained_regard`
backlashes at `damaging` whether the wielder is rank 1 or rank 3, even though at rank 3 the craft
is doing lethal work.

➡️ **Backlash must scale with rank the way harm does.** A craft doing lethal work in your hands
turns on you harder than the same craft at novice rank.
➡️ ⬜ **Authoring item (OI-20):** ~88 crafts need a per-rank `backlashRung` in `tree[]`. Aevi's work.

### ✅ It scales with INTENSITY (surge / conserve)

Erik: *"and surge or conserve — which already have some crit range impacts I believe."* ✅ Correct.

**Already built in `intensity_scaling.json`:**

| step | energyMult | effectMod | backlashChance |
|---|---|---|---|
| conserve | 0.6 | −8 | 0.0 |
| standard | 1.0 | 0 | 0.0 |
| surge | 1.6 | +10 | **0.25** |

➡️ **Intensity modifies backlash MAGNITUDE, not only chance.** Surge amplifies what lands;
conserve reduces it. Mirroring `energyMult` (0.6 / 1.0 / 1.6) is the obvious first shape.

### ⛔ TWO BACKLASH SYSTEMS NOW EXIST AND MUST BE RECONCILED — CCode

| system | trigger | scale | source |
|---|---|---|---|
| `surgeBacklashByTier` | failed/marginal roll **while surged** (25%) | **TIER** — T1 3/4 → T5 12/14 | `intensity_scaling.json` |
| `backlashByRung` | **critical failure** | **RUNG** | wired for R5, v1.9.287 §37 |

⚠️ Different triggers, different scales, same fiction — "the craft turns on you." They should be
one family, not two unrelated tables.

⬜ **CCode to propose the reconciliation.** Options as Aevi sees them: (i) one magnitude function
taking rung + rank + intensity, with the two triggers differing only in when they fire;
(ii) keep both events but derive both magnitudes from the same base. Erik has ruled the INPUTS
(pool %, rank, intensity) — the merge shape is CCode's call to propose.

---

## R19 — Rank-up purchasing gated by tier access ⛔ RETRACTED 2026-09-01

⛔ **SUPERSEDED BY R20** (`po/RULING_training_gate_saves_and_pipeline.md`). The tier gate composed
with R12's band placement to put T1 training at **L21** — and measured against Silas at L30 it
reached **3%** of his 31 stuck rank-1 crafts. A played sheet is not tier-sorted. **Training now
unlocks globally at level 10, no tier gate.** The original text is kept below for the record.

### (retracted) original ruling

Erik: *"we make purchasing a rank up only eligible at a certain point… opening Tier 3 access lets
you rank up your r1 tier1 skills."*

**Tier N crafts become rank-up eligible when tier N+2 opens:**

| when this opens | these become trainable |
|---|---|
| T3 | T1 crafts |
| T4 | T2 crafts |
| T5 | T3 crafts |

**Why this is better than a price lever:**

✅ **It stages the sink.** Under R17 training is cheap (`tierPrice`). Available from L1, a player
could train instead of broaden — inverting R14's band structure. Gating means acquisition first,
deepening second, matching **1–10 personal / 10–30 party building.**

✅ **It is thematically true.** You understand your basics better once you have seen advanced work.
Depth requires perspective, not only repetition.

✅ **It gives tier unlocks a second payload.** Opening T3 currently means only "T3 crafts are
buyable." Now it also means "your entire T1 shelf just became improvable." That is a real moment.

### ⬜ T4 and T5 — open item

There is no T6 or T7 to gate them. Erik: *"T5s are mostly one rank, but we should take a pass at
T4s and T5s eventually to determine if we would want any to be able to rank by training."*

➡️ **OI-21 — content pass on T4/T5 crafts:** which, if any, should be trainable at all? Deferred,
not urgent. Default until ruled: T4/T5 are practice-and-GM only, which fits "the deepest things
cannot be bought."

---

## Corrections logged against Aevi this exchange

⛔ **Aevi asserted "a level-1 character with a lethal craft loses 55% HP / 100% energy."** No such
character exists — `harmRung` scales per rank and every lethal T1 craft reaches lethal at r3. The
real L1 exposure is `damaging` (4/10, i.e. 20%/50% of a 20/20 pool). **Erik's instinct was the
architecture, already built as SNG-147c.**

⚠️ **Erik's correction stands as a standing note:** *"you should be looking this stuff up — don't
guess."* Aevi reasoned from a table instead of reading `engine/intent.js`. Both the rank-scaling
answer and the existing `surgeBacklashByTier` table were already in the repo.

---

## New open items

| OI | item | owner |
|---|---|---|
| OI-20 | Per-rank `backlashRung` in `tree[]` — ~88 crafts | Aevi author |
| OI-21 | T4/T5 pass — should any be trainable? | Erik ruling, deferred |
| OI-22 | Backlash percentage table — propose against R18's pitch | Aevi propose |
| OI-23 | Reconcile `surgeBacklashByTier` with `backlashByRung` | CCode propose |
