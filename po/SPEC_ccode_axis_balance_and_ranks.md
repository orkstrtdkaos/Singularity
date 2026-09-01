# SPEC — Axis balance, the rank ladder, and where points go

**CCode → Erik, cc Aevi · 2026-09-01 · built on the FUTURE state (R1/R6), not on HEAD**

> Erik: *"Tomes would teach you a skill… bump the slot ceilings to tier 3 for tertiary and 4 for secondary…
> remove the prohibition that domain slots bring to the antipole — I'm thinking of a balance system
> instead… And ranks only go to 3. I'm considering allowing point use to get to rank 2, with rank 3 still
> only earned by GM call after use… this gives rarely used skills the ability to be powered up by
> 'training' instead of use… and potentially a place to spend points if we need that. Lean can measure a
> combination — breadth (count of skills) and depth (tier and ranks)."*

⚠️ **Supersedes `po/THINKING_ccode_axis_balance.md`**, which modelled HEAD's linear prices and
multiplicative bands. Everything below assumes the ruled state instead.

## §0 — THE BASELINE THIS IS BUILT ON

| | ruled | source |
|---|---|---|
| tier price | **1 · 2 · 2 · 3 · 3** | R1 |
| distance | **additive** — `tierPrice + band`, band 0 home / 1 near / 2 far·antipode | R1 |
| `crossClass.costMultiplier: 2` | ⛔ **superseded** | R1 |
| points per level | **2**, → 3 at Insight 7, → 4 at Insight 14 | R6 (provisional) |
| breadth cap | level + 1 | `skillsKnownByLevel` |
| **rank ceiling** | **3** | Erik 2026-09-01 |

**Measured against the 414-craft corpus:** mean craft cost **1.84 home · 2.84 near · 3.84 far**
(was 2.511 under the old ladder — this is the re-measure R1 and R6 both asked for).

---

## §1 — ✅ R6 ANSWERED: THE CAP BINDS, AND IT PRODUCES THE BALANCE YOU ASKED FOR

> R6: *"does a high-Insight late-game character ever hit the breadth cap? CCode's ROUND 2 found points
> bind in every band at every level and called the cap decorative."*

Insight accrues ~+1 per 7.5 levels (fitted to Silas: L30, Insight 8 from base 4). So Insight 7 lands
around L22 and Insight 14 around L75.

| lvl | Insight | pts/lvl | total pts | cap | affordable @home | affordable @far | binds |
|---|---|---|---|---|---|---|---|
| 1 | 4 | 2 | 2 | 2 | 1.1 | 0.5 | points |
| 10 | 5 | 2 | 20 | 11 | 10.9 | 5.2 | points |
| **22** | 6 | 2 | 44 | 23 | **23.9** | 11.4 | ⛔ **CAP** |
| 50 | 10 | 3 | 128 | 51 | 69.5 | 33.3 | ⛔ **CAP** |
| 75 | 14 | 4 | 204 | 76 | 110.7 | 53.1 | ⛔ **CAP** |
| 100 | 17 | 4 | 304 | 101 | 164.9 | 79.1 | ⛔ **CAP** |

⛔ **Yes — the cap binds from about level 22 onward, and my ROUND 2 "the cap is decorative" is reversed by
R1.** It was true under the old prices and is false under the new ones.

✅ **AND THIS IS EXACTLY THE BALANCE YOU SPECIFIED**, in your words from the unlock-levels thread:
*"If I have extra skill points that means I can afford to splurge on an expensive cross class skill. If I
do this all the time I should be point starved — if I only buy in my home band I'll be cap limited."*

**Buy only at home → cap-limited (164.9 affordable vs 101 slots). Buy far → point-starved (79.1 vs 101).**
✅ **R1 hits the target you named. No tuning needed.**

### ⛔ But it opens a hole: the surplus

| lvl | total pts | a full home shelf costs | **surplus** | % of career banked |
|---|---|---|---|---|
| 22 | 44 | 42 | 2 | 4% |
| 50 | 128 | 94 | 34 | 27% |
| 75 | 204 | 140 | 64 | 31% |
| 100 | 304 | 186 | **118** | **39%** |

⛔ **A high-Insight late character banks nearly two fifths of everything it earns**, because points can only
buy breadth and breadth is capped. ✅ **That is the hole your rank-2-by-training fills — the model says it
is not a nice-to-have, it is load-bearing.**

---

## §2 — ✅ THE RANK LADDER

**Ranks 1–3.** Proposed shape, following your sketch:

| rank | bought with points | earned by use | GM call |
|---|---|---|---|
| **1** | ✅ yes (this is learning) | — | — |
| **2** | ✅ **yes — "training"** | ✅ yes (as today) | — |
| **3** | ⛔ no | ⛔ no | ✅ **only** |

✅ **Two roads to rank 2, one road to rank 3.** Training gives the rarely-used craft a way up and gives the
banked points somewhere to go; rank 3 stays a thing the world grants, so mastery is still narrative.

**Proposed price for training to rank 2: what the craft cost to learn — `tierPrice + band`.** Consistent
with R1's idiom, and it keeps cross-domain depth genuinely dearer than home depth.

| lvl | surplus | cost to train the whole shelf to r2 | share of shelf the surplus covers |
|---|---|---|---|
| 50 | 34 | 94 | 36% |
| 75 | 64 | 140 | 46% |
| 100 | 118 | 186 | **63%** |

✅ **At L100 the surplus trains about 63% of your shelf.** ⛔ **It deliberately does NOT absorb everything** —
if training were cheap enough to soak the whole surplus, the breadth cap would stop meaning anything and
we would be back to points-bind-always. **A real choice every level is the right amount of pressure.**

---

## §3 — ✅ LEAN AS BREADTH **AND** DEPTH

Your instruction: *"Lean can measure a combination — breadth (count of skills) and depth (tier and ranks)."*

```
weight(pole) = Σ over crafts in that pole of  ( tier × rank )
lean         = clamp0( (weightHome − weightAnti) / (weightHome + weightAnti) )
```

✅ **All three inputs are present and none is bolted on:** breadth enters as the **number of terms**, craft
depth as **tier**, practice depth as **rank**. One expression, no weights to tune.

### ⛔ WHY MULTIPLICATIVE, PROVEN BY THE FARM TEST

The failure mode to beat: buy the cheapest possible craft, grind it up, and cheaply shed your lean. Which
craft buys the most weight per point spent (antipode band, rank 2)?

| craft | cost | weight (tier×rank) | **per point** | weight (tier+rank) | per point |
|---|---|---|---|---|---|
| T1 @ r2 | 3 | 2 | **0.67** | 3 | 1.00 |
| T3 @ r2 | 4 | 6 | 1.50 | 5 | 1.25 |
| **T5 @ r2** | 5 | 10 | **2.00** | 7 | 1.40 |

✅ **Under `tier × rank` the T5 is 3× more lean-efficient than the T1 — so the cheap decoy is the WORST
opening move, not the best.** The exploit I found under HEAD's linear prices **does not exist under R1**;
the compressed ladder kills it, because a T5 costs only 5 while being worth 5× the weight.

⛔ **Additive weight gives the T5 only a 1.4× edge — too flat to deter the decoy. Recommend `tier × rank`.**

⚠️ **Rank 3 being GM-only matters here too:** the top of the weight range cannot be self-served, so no
amount of grinding fully controls your own lean.

---

## §4 — ✅ THE ANTIPODE SURCHARGE, IN R1'S ADDITIVE IDIOM

```
learnPointCost = tierPrice + band + round( S × lean )        ← the surcharge applies only in your antipole
```

With **S = 2**:

| tier | any far people | antipode @ lean 1.0 | @ lean 0.5 | @ lean 0.0 (balanced) |
|---|---|---|---|---|
| T1 | 3 | **5** | 4 | **3** |
| T3 | 4 | **6** | 5 | **4** |
| T5 | 5 | **7** | 6 | **5** |

✅ **The fully-leaned specialist pays +2 over what a stranger's craft costs. The balanced cross-pole
character pays exactly the ordinary far price.** Balance earns **parity**, not a discount — which is what
*"a true cross-pole character"* should mean without making the antipode a bargain.

✅ **And the tax decays as you commit**, which is the property that makes this good: the dilettante pays the
surcharge on every purchase; the convert pays it on the first few and then stops. **The barrier is to
dabbling, not to crossing.**

### ⬜ OPEN DIAL — does deep balance move the BAND as well?

| | shape | balanced antipode T5 |
|---|---|---|
| **A** | surcharge only — the axis stays far | 5 |
| **B** | **band migration** — sustained balance moves the antipode far → near → home | 4, then 3 |

⚠️ **B is what "the far pole becomes home" actually sounds like**, and it gives long-term balance a reward
beyond parity. ⛔ **A is safer and I would ship A first** — B can be layered on later without redoing
anything, since both read the same `lean`.

---

## §5 — ✅ THE CEILING BUMP (tertiary → 3, secondary → 4)

Measured over 29 traditions: tertiary reach **64% → 80%** of a tradition's book, secondary **80% → 92%**.
Home shelf 34.8 → 38.8 crafts.

⛔ **The real argument for it is an inversion I found while probing, not the width:** a **far people you
never chose is uncapped at all five tiers** (it costs more, but nothing stops you), while **your chosen
secondary stops at tier III.** **Choosing a people currently makes their deep crafts harder to reach than
ignoring them.** ✅ **Your bump corrects that — it does not loosen a working restriction.**

⬜ **Raises a fair question while we are here: should `far` carry a ceiling too?** Today the slots cap you
and the wilderness does not, which no fiction supports.

---

## §6 — ⬜ TOMES AND ARTIFACTS

> *"Tomes and other artifacts of kind would Teach you a skill — maybe requiring skill points to use."*

✅ **"Requiring skill points" is the right call and §3 shows why:** a tome that *granted* a craft outright
would inject antipode weight for free and let a player buy their lean down with an item. **A tome that
grants ACCESS — you still pay the points — cannot be farmed.**

⚠️ **`character.tomes` has a reader (`progression.js:472`) and no writer anywhere** — engine, app, or
content. The tome road is currently unreachable. It needs an item hook plus authored objects.

⬜ **Open: is an artifact distinct from a tome, or a tome with better prose?** If the latter, one mechanism
covers both.

---

## §7 — ⛔ THE BLOCKER, AND THE BUILD ORDER

### ⛔ The capstone standing bar reads `levelReq`, not `tier`

Three probe crafts through the real `canLearnAbility`:

| probe | result | |
|---|---|---|
| tier 5 / levelReq 5 — as all 414 crafts are today | blocked by standing | ✅ |
| **tier 5 / levelReq 2** | ⛔ **`ok=true` — walks past the bar** | ⛔ |
| **tier 1 / levelReq 5** | blocked as a capstone it is not | ⛔ |

⛔ **Wrong in both directions** — a gate reading the wrong field. `progression.js:572` plus six more
`levelReq`-as-tier readers (`wheelgeom.js:166`, and five tier badges in `skilltree.js` / `app.js`).
**Latent only because tier still equals levelReq everywhere.** §5's ceiling bump is unsafe until this is
fixed: tier IV–V ride on this bar.

### The order

| # | step | needs a ruling? |
|---|---|---|
| 1 | ⛔ fix the seven `levelReq`-as-tier readers | no — build now |
| 2 | R1 prices + additive bands; retire `crossClass.costMultiplier` | no — ruled |
| 3 | ceiling bump tertiary → 3, secondary → 4 | no — ruled above |
| 4 | rank ceiling 3 + train-to-rank-2 | ⬜ **confirm the r2 price** |
| 5 | drop `castable:false` + the seven foreclosure sites | no — ruled |
| 6 | `lean` + the antipode surcharge | ⬜ **confirm S = 2 and dial A** |
| 7 | tomes | ⬜ needs authored content |

**The seven foreclosure sites** (a removal, not a rewrite): `traditions.js` `castable:false`;
`traditions.js` `opts.foreclosed` branch; `promote()` and `joinPeople()` both *write* `character.foreclosed`;
`isForeclosedNative` at `progression.js:282` and `:300`; `acquirable`'s antipode refusal at `:465`.
⚠️ **`joinPeople()` is never called from `app.js`** — that road is authored and unwired.
⚠️ **Old saves carry `foreclosed`** — stop reading it, or they keep a restriction new characters never get.

---

## §8 — ⬜ WHAT I NEED FROM YOU

1. **Rank-2 training price** — `tierPrice + band` (same as learning)? That is what §2's table assumes.
2. **S = 2** for the antipode surcharge, and **dial A** (surcharge only) before B (band migration)?
3. **Should `far` carry a tier ceiling** — new question from §5.
4. **Does R6's 2/3/4 points-per-level stand** now that the cap binds? It is the reason the surplus exists.
   ⬜ Lowering it would shrink the surplus; I would rather keep it and let training absorb it, because
   that gives the player a decision instead of a smaller number.

⛔ **Nothing is built. Steps 1–3 need no ruling and I can start on your word.**
