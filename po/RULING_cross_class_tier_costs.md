# RULING — Cross-Class and Tier Cost Structure

**Ruled by:** Erik · **Date:** 2026-08-31
**Recorded by:** Aevi
**Spec:** `po/SPEC_starting_grants_and_creation_revamp.md`
**Amends:** `crossClass.costMultiplier` (legacy) and the band-×-tier live mechanism in `skilltree.js`

---

## The ruling

**Tier prices** (replaces current 1/2/3/4/5):

| tier | price |
|---|---|
| T1 | 1 |
| T2 | 2 |
| T3 | 2 |
| T4 | 3 |
| T5 | 3 |

**Cross-class distance cost:** additive, not multiplicative.
`learnPointCost = tierPrice + band`, where band = 0 (home) · 1 (near) · 2 (far/antipode).

| tier | home | near | far |
|---|---|---|---|
| T1 | 1 | 2 | 3 |
| T2 | 2 | 3 | 4 |
| T3 | 2 | 3 | 4 |
| T4 | 3 | 4 | 5 |
| T5 | 3 | 4 | 5 |

**Prior value (current live):** `tierPrice × band` (bands 1/2/3 multiplicatively).
Far T5 was 15. Far T5 is now 5.

---

## Intent

Distance should make cross-class learning meaningfully more expensive, not prohibitively
so. A dedicated generalist should be able to reach far-ring T5 mastery in late game.
The tier price signals investment depth (two natural steps: T1→T2, T3→T4) rather than
scarcity. The `+1 levelReq` cross-training gate remains the primary difficulty signal.

---

## What this unblocks

- CCode to update `learnPointCost` in `skilltree.js` with the new tier price table and
  additive band formula
- CCode to re-run the affordability table (crafts affordable at L10/50/100) against
  the new price structure — average craft cost will drop from 2.511; points-bind curve
  needs re-measurement before OI-11 (insight bonus) curves are finalized
- `crossClass.costMultiplier` in `skill_capacity.json` is now superseded — CCode to
  note or remove to prevent future confusion

---

## What this does not change

- Band assignments (home/near/far/antipode) — unchanged
- `+1 levelReq` cross-training rule — unchanged
- Breadth cap — unchanged
- The finding that points bind in every band at every level — still true; the new
  prices make it bind less tightly, which is the intent
