# SPEC — SNG-201: Found once, known forever — shared braid recipes
## Aevi (PO) · 2026-07-21 · authored to spec · **awaiting CCode ROUND 2 · builds AFTER SNG-197 part 2**

> **Erik's decision, recorded in the 2026-07-21 handoff:** *"once found, they become recipes for other
> players — keeps things from duplicating."* Decision already captured with CCode: **global; first-finder
> authors the name/def; rides the existing shared-canon sync; later finders of the same pairing ADOPT it;
> collisions resolve by the canon rank-by-realness already built.**

This spec is the paragraph the handoff asked for — the decisions are made; what follows is the outcome
contract and the seams worth naming before the build touches the sync layer.

---

## §1 — What a recipe IS

When a player's co-activation ripens a pairing that has **already been found by anyone**, they do not mint
a fresh def — they **adopt the found one**: its name, its description, its tree prose, its emergent
function. The *discovery* is still theirs (their bond, their mint moment, their rank-1); the *craft* is the
world's. First finder authors it for everyone — the strongest content-generator loop in the game, and it
runs on machinery that already exists.

- **Identity = the pairing**, order-independent — `braidKey` is already this. One pairing, one recipe,
  globally.
- **The recipe shape is the enriched def**, not the stub. ⛔ **A stub never promotes.** If the first finder
  minted before enrichment (offline, model outage), the recipe waits for the enriched version. Shipping a
  stub as the world's permanent recipe would make the failure fallback canonical — the exact inversion of
  SNG-197's point.
- **Player-conferred names travel.** If the first finder renamed *Perfect Inevitability* to something of
  their own, that is the name the world learns, attributed. `minted.namedBy` already records which.

## §2 — What adoption means for the second finder

The second finder's experience must not be diminished — they still earned it through their own play.

- Their mint **moment still fires** — but it is a *recognition* beat, not a *creation* beat: this craft has
  a name already, and someone found it first. Both framings are cool; they are different kinds of cool, and
  the copy should know which it is delivering.
- ⚠️ **Rename scope must be decided and is a design call for Erik, not an engineering default:** can the
  second finder rename *their own instance*, or is the world-name fixed for everyone? Recommend: **the
  world-name is fixed; a player may set a personal nickname that renders for them only.** First-finder
  authorship means nothing if the fifth finder can overwrite it globally — but a player's relationship with
  their own craft shouldn't be hostage to a stranger's taste. Erik ratifies.
- Tier/levelReq/energy stay **per-character** (they derive from the *adopter's* ranks via `braidTier`).
  The recipe shares the identity and the prose, never the numbers. Two players can hold the same braid at
  different tiers, exactly as two players hold the same authored ability at different ranks.

## §3 — The seams (this touches the sync layer; name them now)

1. **Ride `syncSharedCanon`, do not sibling it.** The contested-merge machinery (`pushMergedFile` →
   contest inside the merge callback → SHA-retry re-contests) is exactly the concurrency shape two
   simultaneous first-finders need. A second sync path for recipes would be a second thing that can
   clobber. Whether a recipe is a new canon *kind* or a new store is CCode's call; the concurrency
   discipline is not.
2. **Race: two players ripen the same pairing in the same window.** The existing rank-by-realness contest
   resolves it; the loser's def becomes their **personal nickname/variant**, not a competing world-recipe.
   One pairing, one recipe, always — a variant *recipe* would reintroduce the duplication Erik is closing.
3. **Offline-first holds.** Sync off → mint locally as today; on next sync the local braid **contends as
   first-finder or adopts** whichever recipe won meanwhile. A player without sync never has a worse game,
   just a more private one.
4. **Rating lens applies.** Recipes flow through the same viewer-lens as all shared canon
   (`canonForViewer`) — the family plays this. First-finder prose lands in front of Clara at Clara's
   ceiling or adapts down, per the machinery that already does this.
5. **`emergence_recipes` format is the natural shape** (handoff's read, agreed) — but ⚠️ **verify its
   current consumers before reusing the file**: SNG-196 made minting generative *because* the recipe
   requirement was the blocker. Recipes must remain **descriptive** (what a pairing became) and never again
   **prescriptive** (what a pairing is allowed to become). If reusing the file risks any code path reading
   it as a gate again, use a new store. The regression here is the original bug.

## §4 — Erik's family is the test

The real acceptance test is not synthetic: **Silas's Double Register should become the recipe**, and if
Brooklyn's or Brayden's characters ever braid deathsense × order_sense, they should meet *Silas's* craft —
by whatever name Erik confirms for it — with first-finder attribution intact.

## GUARDS

- **A stub never promotes** (§1). The recipe is the enriched def or nothing yet.
- **One pairing, one recipe** — contest losers become personal variants, never parallel recipes.
- **Numbers never shared** — tier/levelReq/energy always derive from the adopter.
- **World-name is stable** once landed; personal nicknames render locally (pending Erik's §2 ratification).
- **Never a halted mint** — sync failure degrades to local mint, contends later.

## OPEN QUESTIONS — CCODE ROUND 2

1. Recipe as a new canon **kind** inside the existing store, or its own file beside it? (Concurrency via
   `pushMergedFile` either way.)
2. Adoption timing: at ripen (check remote before minting) or at mint-then-reconcile (mint locally, adopt
   on next sync)? The second is offline-friendly and matches reconcile discipline; the first avoids ever
   showing a name that then changes.
3. Does `canonForViewer`'s rating-lens machinery need anything new for ability-prose, or does it pass
   through as-is?
4. §3.5 — your read on the `emergence_recipes` reuse risk: any consumer that could turn descriptive back
   into prescriptive?
