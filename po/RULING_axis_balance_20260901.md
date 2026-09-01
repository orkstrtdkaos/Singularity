# RULING — Axis balance, ranks, and ceilings

**Ruled by:** Erik · **Date:** 2026-09-01 · **Recorded by:** Aevi
**Responds to:** `po/SPEC_ccode_axis_balance_and_ranks.md` §8, `po/INDEX_ccode_open_for_aevi.md` §4

---

## R8 — Rank-2 training price ✅ RULED

**Price: `tierPrice + band` — the same as learning the craft.** One price idiom for both
acquisition and depth. Not doubled.

**On the Insight-dumper overflow (CCode §2):** the dumper banks 201 points and training the full
101-craft shelf costs 186, so the sink overflows. ⚠️ **Accepted, because the dumper is
self-limiting through a different constraint:** Insight buys sense tier and skill points; **Reason**
buys max energy. A player who dumps every sub-point into Insight leaves Reason at 2 and finishes
knowing 101 crafts with a base energy pool — a walking library with almost no power to cast from.
That is a legitimate and interesting build, not an exploit.

⬜ **CCode to verify:** what does a Reason-2 character's L100 energy pool look like, and how many
casts per day does it buy? If the answer is "plenty," this reasoning fails and the doubled price
(CCode's fix i) comes back on the table.

---

## R9 — Antipode surcharge ✅ RULED

**S = 2. Dial A (surcharge only) ships first.**

```
learnPointCost = tierPrice + band + round( S × lean )     ← antipole only
```

| tier | any far people | antipode @ lean 1.0 | @ lean 0.0 |
|---|---|---|---|
| T1 | 3 | 5 | 3 |
| T3 | 4 | 6 | 4 |
| T5 | 5 | 7 | 5 |

Balance earns **parity**, not a discount. The tax decays as the character commits — the dilettante
pays it on every purchase, the convert pays it on the first few and then stops. **The barrier is to
dabbling, not to crossing.**

⬜ **Dial B (band migration — sustained balance moves antipode far → near → home) is deferred, not
rejected.** Both dials read the same `lean`, so B layers on later without redoing A.

**Lean formula confirmed as CCode specified:**
```
weight(pole) = Σ over crafts in that pole of ( tier × rank )
lean = clamp0( (weightHome − weightAnti) / (weightHome + weightAnti) )
```
✅ **Multiplicative, not additive.** CCode's farm test proved it: under `tier × rank` a T5 is 3×
more lean-efficient per point than a T1, so the cheap-decoy grind is the worst opening move rather
than the best. Additive weight gives the T5 only a 1.4× edge — too flat to deter it.

---

## R10 — Tier ceilings by standing ✅ RULED — descending ladder

CCode found an inversion (§5): a **far people you never chose is uncapped at all five tiers**, while
your **chosen secondary stops at tier III.** Choosing a people made their deep crafts harder to reach
than ignoring them. The bump to tertiary → 3 / secondary → 4 shrinks the inversion but does not
remove it — unchosen far would still reach V.

**The ruling — a full descending ladder:**

| standing | tier ceiling |
|---|---|
| primary | 5 |
| secondary | **4** |
| tertiary | **3** |
| far | **2** |

**Intent:** the further from home, the shallower you go without commitment. Cost is the barrier to
crossing; the ceiling is the barrier to depth-without-standing. This removes the inversion entirely
rather than reducing it.

⛔ **Blocked by the `levelReq`-as-tier bug** — tier IV–V ride on the capstone standing bar, and that
bar reads the wrong field in both directions. Fix the seven readers first.

---

## R11 — R6 points-per-level stands ✅ CONFIRMED

**2 / 3 / 4 per level at Insight 7 and 14 stands. Milestone levels stay at 7 and 14 for now.**

⚠️ **Erik has seen and accepted that these are an opening build decision, not a late-game reward.**
CCode's §1 correction: `subPointPerLevel: 1`, player-allocated across 8 subs, so the milestone lands
wherever the player puts points — L4/L11 for a dumper, L32/L88 for an even spread. The word
"milestone" in R6 implied a progression gate it does not have.

Accepted as-is. Revisit if play shows the dumper build dominating.

---

## R16 — Antipode tier ceiling: rises with `lean` ✅ RULED (2026-09-01)

⛔ **The conflict CCode found:** R10 caps `far` at tier II. R9 says sustained balance earns price
parity. **If the antipode is far, both are true and they cancel** — a balanced cross-pole character
pays parity for crafts they can never take past novice depth. R9 buys nothing.

### ✅ THE RULING — CCode's option (c)

**The antipode's tier ceiling RISES with the same `lean` R9 already computes.** Not a fixed cap,
not `far`'s 2 — a ceiling that lifts as the character commits.

```
antipode ceiling = f( lean )        ← same lean as the R9 surcharge
```

⚠️ **This makes R9 and R10 one mechanism instead of two rules fighting.** The lean a character earns
buys **both** price parity **and** depth. Dabble and you are capped shallow and pay the surcharge;
commit and both barriers recede together. The barrier is to dabbling, not to crossing — which was
R9's stated intent all along, now actually true of depth as well as price.

**The descending ladder from R10 stands for the non-antipode standings:**

| standing | ceiling |
|---|---|
| primary | 5 |
| secondary | 4 |
| tertiary | 3 |
| far (non-antipode) | 2 |
| **antipode** | ⚠️ **derived from `lean`** — not a fixed number |

⬜ **CCode picks the curve** — how fast the ceiling climbs against lean is an implementation dial.
Report the shape chosen and the tier reached at lean 0.0 / 0.5 / 1.0 so Erik can see it.

✅ **Unblocks build steps 3, 5 and 6 together.**

---

## Build order (CCode — nothing blocked on Erik after this)

| # | step | status |
|---|---|---|
| 1 | ⛔ fix the seven `levelReq`-as-tier readers | build now — blocks step 3 |
| 2 | R1 prices + additive bands; retire `crossClass.costMultiplier` | build now |
| 3 | tier ceilings — R10 ladder (5/4/3/2) + **R16 lean-derived antipode ceiling** | ✅ unblocked; after step 1 |
| 4 | rank ceiling 3 + train-to-rank-2 at `tierPrice + band` (R8) | build now |
| 5 | drop `castable:false` + the seven foreclosure sites | build now |
| 6 | `lean` + antipode surcharge, S = 2, dial A (R9) | build now |
| 7 | `applyBacklash` takes the ability; read `backlashRung` as authored (R5 corrected) | build now |
| 8 | tomes — `character.tomes` has a reader and no writer | needs authored content |

⚠️ **Old saves carry `foreclosed`** — stop reading it, or they keep a restriction new characters
never get.

---

## Still open on Erik

| # | item |
|---|---|
| OI-11b | Whether the dumper build needs correction — revisit after CCode's Reason-2 energy check (R8) |
| — | `PROPOSAL_ccode_unlock_levels.md` option 2 — needs top-level and L1-visibility numbers |
| — | Tome vs artifact — one mechanism or two? |
