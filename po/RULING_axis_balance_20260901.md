# RULING — Axis balance, ranks, and ceilings

**Ruled by:** Erik · **Date:** 2026-09-01 · **Recorded by:** Aevi
**Responds to:** `po/SPEC_ccode_axis_balance_and_ranks.md` §8, `po/INDEX_ccode_open_for_aevi.md` §4

---

## R8 — Rank-2 training price ⛔ RETRACTED — superseded by R17 below

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

## R17 — Rank-2 training price ✅ RULED: `tierPrice`, no band (supersedes R8)

⛔ **R8 is retracted.** It priced training at `tierPrice + band` on Aevi's argument that the
Insight-dumper would be self-limiting through energy. **CCode's measurement killed that premise:**
Reason is 33% of the energy pool at L20 but only **14% at L100** — the limiter fades exactly where
the overflow appears. Aevi's reasoning held for early game and failed for the band that mattered.

### ✅ THE RULING

**Train a craft to rank 2 for `tierPrice` — no band component.**

| tier | train-to-r2 cost |
|---|---|
| T1 | 1 |
| T2 · T3 | 2 |
| T4 · T5 | 3 |

⚠️ **Cheaper than learning the craft** (which adds band). This reads correctly: **deepening
something you already hold should cost less than acquiring something new.**

⛔ **CCode's doubling fix is rejected** — it taxes the mechanism at its own purpose. See below.

### Why — the Silas evidence (L30, measured 2026-09-01)

**40 abilities: 5 at rank 3, 4 at rank 2, and 31 stuck at rank 1.**

| rank 3 | uses | | rank 1 | uses |
|---|---|---|---|---|
| `order_sense` | 98 | | `dawn_surgery` | 0 |
| `deathsense` | 49 | | `death_ward` | 0 |
| `the-attended-end` | 46 | | `prism_ward` | 0 |
| `palework` | 31 | | `radiant_lance` | 0 |
| `the_raised_thing` | 21 | | `echo_memory` | 0 |

⚠️ **The rank-1 crafts are not bad crafts.** Silas is a Death/Order character whose campaign runs on
travel, study, plan, prepare. His `radiant_lance` has never come up — **not once.**

➡️ **Practice ranks what the scenarios call for. Training is the ONLY path for the other 31.**
Raising the price punishes the exact case the mechanism exists to serve: a player whose craft is
viable but whose campaign never asks for it.

**And the surplus is a projection, not a live condition** — Silas banks **2 skill points at L30.**

### ✅ Erik's ruling on the design question underneath

> *"I think it's pretty universal — a high level character you'd expect to not have many r1 skills left."*

**Rank 2 is the natural resting state of a craft you have carried a long time, not a selective
investment.** A high-level character should have few rank-1 crafts remaining.

➡️ **No cap on how many crafts may be held at rank 2.** `tierPrice` is correct as written.
➡️ The Insight-dumper's surplus is **not a leak** — it funds a broad shelf trained to rank 2.
   That is a legitimate build sitting opposite the specialist: **breadth-at-rank-2 vs
   depth-at-rank-3.** Rank 3 stays GM-only and remains the thing breadth cannot buy.

### ✅ Incidental validation

`brace`, `strike_basic`, `break_away`, `raise_alarm` all sit on Silas's L30 sheet at rank 1 with
0–1 uses. **The baseline-kit retirement is well-aimed.**

---

## Build order (CCode — nothing blocked on Erik after this)

| # | step | status |
|---|---|---|
| 1 | ⛔ fix the seven `levelReq`-as-tier readers | build now — blocks step 3 |
| 2 | R1 prices + additive bands; retire `crossClass.costMultiplier` | build now |
| 3 | tier ceilings — R10 ladder (5/4/3/2) + **R16 lean-derived antipode ceiling** | ✅ unblocked; after step 1 |
| 4 | rank ceiling 3 + train-to-rank-2 at **`tierPrice`, no band (R17 — supersedes R8)** | ✅ build now |
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
| OI-11b | ✅ **CLOSED R17** — energy check failed; dumper surplus ruled legitimate (breadth-at-r2) |
| — | `PROPOSAL_ccode_unlock_levels.md` option 2 — needs top-level and L1-visibility numbers |
| — | Tome vs artifact — one mechanism or two? |
