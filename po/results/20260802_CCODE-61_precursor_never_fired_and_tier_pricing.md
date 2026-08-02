# CCODE-61 — the precursor answer, and SNG-260 §D tier pricing

Two assigned items. Full `npm test` green.

## SNG-261 §B — "has `unlockPrecursor` EVER fired?" **No. Never.**

The mechanism is **fully wired** — declared in the GM contract (`gm.js:65`), in `SALVAGEABLE_OPS`, handled
in `app.js:4559`, with `seedInnateSubstrate` live at both creation and load. Nothing is broken. It has
simply never been reached.

Across **all 13 character saves**: zero precursor crafts held, zero characters with precursor access, and
**zero `unlockPrecursor` ops carrying an `abilityId`** (the two that appear in turn records are `null` and
`{}` — emitted empty, unlocking nothing).

**The data bug is real, and sharper than suspected.** Only two origins carry `innatePrecursor`:

| origin | innate precursor craft |
|---|---|
| `abyssal` | `latticespeak` |
| `seraphic` | `address_sense` |

**Loki's origin is `enginewright`** — which carries none. A literal precursor-created being has no innate
precursor access, exactly as SNG-261 §B guessed. Two things follow that the spec didn't have:

1. It is not only Loki. **No save has `abyssal` or `seraphic` either**, so the innate path has never had an
   occasion to fire for *anyone* — the seeding code has never once run with a non-empty list.
2. So there are **two independent reasons** the system has never surfaced: the fiction-gated unlock has
   never been emitted with an id, AND the innate door is seeded on two origins nobody has played. Fixing
   Loki's origin alone would light exactly one character.

Aevi's audit + legibility work stands; this says the origin table is the other half.

## SNG-260 §D / SNG-261 §A — tier is now PRICED

`tierPrice()` + `learnPointCost()` in `engine/skilltree.js`, data-driven from
`skill_capacity.tierPrice` (**T-I 1 … T-V 5, linear**; whether T-IV/V accelerate is Erik's dial). The
ladder reaches T-V per SNG-261 §A — the catalog has **28 abilities at levelReq 4 and 26 at levelReq 5**,
so a 1/2/3 ladder was two tiers short.

**The wiring detail that would have shipped this dead.** The cost answer was computed in **six** places,
and the two shapes disagreed: with `character.domains.primary` set — *the normal case* — every caller used
`domainVerdict(ab).penalty || 1` and **never called `skillPointCost` at all**. A tier price added there
alone would have been correct in isolation and inert for every real character. All six now route through
`learnPointCost`, which composes tier × distance once.

## The spread Erik asked to see

Same purse, same cap, different appetites:

| level | purse | cap | cheapest-first | strongest-first |
|---|---|---|---|---|
| 5 | 5 | 6 | **5** crafts (mean T1) | **3** (mean T1.67) |
| 10 | 10 | 11 | **10** (mean T1) | **4** (mean T2.5) |
| 20 | 20 | 21 | **20** (mean T1) | **4** (mean T5) |
| 30 | 30 | 31 | **30** (mean T1) | **6** (mean T5) |

**20 crafts vs 4 at level 20.** That is the mechanic doing exactly what Erik described, and the deep buyer
is still holding tier-5 crafts, so depth is buying something.

## ⚠ The finding: pricing tier made the breadth CAP dead weight

`§D item 4` asked whether both dials bind somewhere. **They don't.** The currency binds at every level; the
cap binds at none.

The arithmetic is simple and total: **1 point/level, a cap of level+1, and a cheapest craft of 1 point
means the purse is always smaller than the cap** — so the cap can never be reached, at any level, by any
buyer. §C's ceiling is currently unreachable by construction.

This is precisely why Aevi sequenced §D to land *with* §C. The numbers to move are Erik's (points/level,
the cap curve, or the price ladder) — I have not touched them. The sweep reports this loudly and **does not
fail the build on it**: it is a tuning outcome, not a structural truth, and a red build on a dial nobody has
turned yet would be this file overstepping.

## Also

`npm run breadth` (wired into `npm test`, `--json` for charts). Structural gates only: tier is priced,
the ladder reaches T-V, tier composes with distance, the floor holds (nobody can spend into an unplayable
character), appetites genuinely diverge, and nothing is free.

The `importedNeverCalled` ratchet caught me importing `tierPrice` into `app.js` without calling it — the
guard working on its author, which is the point of it.

## Not done

The §4/§4b popup. I took the two newer explicit assignments first; the popup is still next unless you'd
rather I go elsewhere.
