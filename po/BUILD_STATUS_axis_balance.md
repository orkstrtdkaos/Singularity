# BUILD STATUS — the R8–R11 order

**CCode → Erik, cc Aevi · 2026-09-01 · v1.9.292 · supersedes `INDEX_ccode_open_for_aevi.md` §4**

Built against `RULING_axis_balance_20260901.md`. **27 suites · 24 green / 3 red — the baseline** at every
commit below.

| # | step | state | gate |
|---|---|---|---|
| 1 | `levelReq`-as-tier readers | ✅ **done** `5d6e6054` | §35 |
| 2 | R1 prices + additive bands | ✅ **done** `e8a6daa6` | §36 |
| 3 | tier ceilings (R10) | ⛔ **needs §A** | — |
| 4 | train-to-rank-2 (R8) | ⛔ **needs §B** | — |
| 5 | drop `castable:false` + 7 foreclosure sites | ⚠️ **held — see §D** | — |
| 6 | `lean` + antipode surcharge (R9) | ⛔ depends on §A | — |
| 7 | `applyBacklash` (R5 corrected) | ✅ **done** `3bd76dd2` | §37 |
| 8 | tomes | ⬜ needs authored content | — |

---

## §A — ⛔ THE ANTIPODE CEILING: R9 AND R10 CANCEL

**R10:** ceilings by standing — primary 5 · secondary 4 · tertiary 3 · **far 2**.
**R9:** the antipode is priced by lean, so *"balance earns parity."*

⛔ **If the antipode counts as `far`, it caps at tier II, and R9's parity buys nothing above novice depth.**
A character who has genuinely balanced both ends of the axis still cannot learn a tier-III craft in their
other pole. ⚠️ **The bands are distinct in code** (`band: "antipode"` vs `"far"`), so R10's four rows do not
settle it.

| | shape | result |
|---|---|---|
| a | antipode is `far` → ceiling 2 | ⛔ R9 is cosmetic above tier II |
| b | its own fixed ceiling (3 or 4) | simple; balance buys price relief only |
| ⬜ **c** | **the ceiling RISES WITH LEAN** — 2 fully leaned, 5 balanced | ✅ **recommended** — same `lean` R9 already computes, and the only shape where R9 and R10 agree |

⚠️ **R10 also leaves `adjacent` and `acquired` unstated.** Assuming adjacent 3 / acquired 2 unless told.

**⛔ This one call unblocks steps 3, 5 and 6 together.**

---

## §B — ⛔ R8 FAILED ITS OWN TEST

R8 accepted the dumper overflow *"because the dumper is power-starved."* ✅ **The mechanism is real** —
`reason` grants max energy through the sub-attribute ladder. ⛔ **The magnitude is not.**

| | Reason | L100 pool | casts on a full pool |
|---|---|---|---|
| **dumper** | 2 | **595** | **94** |
| reason-leaned | 20 | 691 | 109 |

⛔ **94 casts, resting back ~196 a night.** R8: *"if the answer is 'plenty', this reasoning fails."*

⚠️ **And the limiter DECAYS** — Reason is **33% of the pool at L20** and **14% at L100**, because the pool
grows +5/level (+495 by L100) while the ladder caps at +96. **The constraint is weakest exactly where the
overflow it excuses appears.**

⬜ **Recommend fix (i): train-to-rank-2 at `(tierPrice + band) × 2`.** Sink rises 186 → 372, nobody
overflows, and the dumper build is not punished — it just gets somewhere to put the points.

---

## §C — ⬜ BACKLASH MAGNITUDES ARE LIVE AND UNRULED

R5 said *"land that rung on the wielder"* but **no machinery existed to turn a rung into an amount** —
`harmRung` only ever fed finisher odds and GM prose. Built `novel.backlashByRung` after the game's own
`surgeBacklashByTier` idiom:

| rung | health | energy | at level 1 (30 hp) |
|---|---|---|---|
| damaging | 4 | 10 | 13% — ✅ **today's flat cost; 15 of 20 crafts do not move** |
| incapacitating | 7 | 14 | 23% |
| lethal | 11 | 20 | 37% — defined, unused |

⬜ **These are shipping. Say the word and they move** — they are authored data, not code.

### ⚠️ And a content question for Aevi

`backlashRungNone` was **DARK on 3 crafts** — Aevi's authored reason a failure is *not* a wound
(*"A future consequence, not a present wound"* · *"No body is touched"*). ⛔ **With no reader they were
taking physical damage their own authoring forbids.** Fixed: no wound, and the line reaches the narrator.

⚠️ **But the consequence is now NARRATIVE ONLY.** Nothing enforces a broken name or a Bargainers' debt
mechanically. ⬜ **If those should bite, that is a design call, not a wiring one.**

---

## §D — ⚠️ WHY STEP 5 IS HELD

`.nojekyll`, no deploy workflow — **pushing to main publishes the game.**

⛔ **Dropping `castable:false` while §A is open would put a LIVE build in the antipode's most permissive
possible state:** fully castable, ordinary far price, no lean surcharge (step 6), and no tier ceiling
(step 3). ⬜ **It is one commit whenever §A is ruled** — I would rather it land beside the things that
bound it than sit open in a published build.

---

## §E — ✅ WHAT THE BUILD TURNED UP THAT NOBODY ASKED FOR

| | finding |
|---|---|
| ⛔ | **My step 1 was incomplete** — 6 more `levelReq`-as-tier readers, two of them gates (`intensity.js` chose **surge backlash harm** by the wrong field). My own §35 scanner went green on a partial sweep: it listed five files by hand. Range is now derived — 100 files — with a non-vacuity floor. |
| ⛔ | **My band lookup silently overcharged.** `band` has **two owners** — domain bands and people-standing bands (`kin`/`trusted`/`renowned`). An unmapped name defaulted to `far`. Now derives from the verdict's own `penalty`, which maps ×1/×2/×3 onto R1's +0/+1/+2 exactly. |
| ⛔ | **A gate defending a retired ruling.** `breadth_currency_sweep` asserted a *strictly* increasing price ladder — the rule R1 replaced. It would have blocked R1. Rewritten to assert R1's shape: non-decreasing, exactly two rises. |
| ✅ | **Two dark fields now read.** `backlashRung` CI-ONLY → READ, `backlashRungNone` DARK → READ, both confirmed by `field_atlas`, not by my say-so. |
