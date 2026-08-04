# SPEC — SNG-273: ARC STAGES NEED MECHANICS · and a read on tightening domain access
## Aevi (PO) · 2026-08-03

# PART 1 — "STAGE 2 OF THE BLEED IS IN EFFECT… SO WHAT?"
## THE FINDING: A STAGE HAS NO MECHANICAL FIELD AT ALL
A stage carries exactly four keys: `stage` · `name` · `publicFace` · `pressureOnAdvance`.
**Both of those last two are NARRATION.** `publicFace` is what people say; `pressureOnAdvance` is what the GM
should push toward. **There is no field an engine could read, on any stage, of any arc.**
So the whole chain — 66 figures, attention budgets, contests, casualties, vacancies — **resolves into a number
that changes a sentence.** Erik's question is the right one: *why does anyone care?*

## THE DESIGN RULE I'D PROPOSE
**A stage must change something a player can FEEL WITHOUT BEING TOLD.** If the only way to know the Bleed
advanced is to read that it advanced, the arc is set dressing with a counter.
And the corollary, which keeps this from becoming a misery engine: **an arc stage should change the WORLD'S
BEHAVIOUR, not tax the player's sheet.** A −1 to all rolls is a tax and reads as punishment. *Grammar-work
costing double in the Bleed* is a **world**, and the player can route around it.

## PROPOSED SCHEMA — `effects[]` per stage
```json
{ "stage": 2, "name": "The Bleed",
  "effects": [
    { "kind": "craftCost",    "match": { "tradition": "lattice" }, "mult": 1.5,
      "why": "bound things slip; holding one costs more" },
    { "kind": "encounterBias", "add": ["unspooling","manifested"], "weight": 1.4 },
    { "kind": "priceShift",   "goods": "documents", "demandDelta": -1,
      "why": "a ledger nobody trusts is worth less" },
    { "kind": "npcMood",      "traditions": ["lattice","verist"], "shift": "strained" }
  ] }
```
**Five `kind`s cover every arc I've read, and all five have an existing consumer:**
| kind | what it touches | consumer that already exists |
|---|---|---|
| `craftCost` | energy/skill cost by tradition or function | `resolution.js` cost path |
| `encounterBias` | which encounters the pool offers | `random_encounters.js` pool weighting |
| `priceShift` | a goods category's demand in affected regions | the demand tables I authored |
| `travelCost` | route time / passage difficulty | horizon crafts, region movement |
| `npcMood` | how a tradition's NPCs receive you | `gm.js` NPC context block |
**Nothing new is needed to CARRY these.** They are dials on systems that already run.

## WORKED — the five arcs, one stage each, to show the shape
- **THE BLEED · stage 2** — `craftCost` ×1.5 on lattice/figurist (bound things slip) · `priceShift` documents
  −1 (**a ledger nobody trusts is worth less** — and it makes the licence trade's forgeries *more* valuable,
  which is a nice second-order effect) · `npcMood` strained for verist/lattice.
- **WHAT WAKES BENEATH · stage 2** — `encounterBias` toward precursor/manifested · **`travelCost` up on
  `the_grey_road` and `shortfold`** (the substrate is restless under them) · `priceShift` precursor_salvage
  **+1** (everyone wants it, suddenly).
- **THE POLES PULL · stage 2 "Strain"** — ⚠️ **the best one, because it can use the access system:** crossing
  INTO a Reach that isn't yours costs more standing; **`craftCost` up on cross-domain crafts specifically.**
  *The world pulling apart makes borrowing from another people harder.* That is thematically exact and needs
  no new mechanic — **it is a multiplier on `isCrossClass`.**
- **MANIFESTATION STORM · stage 2** — `encounterBias` heavily toward manifested creatures · `craftCost` down
  for figurist/numinous (**the veil is thin — meaning-work is EASIER**) · this is the arc that should have a
  visible *upside* for someone, or every arc reads as decay.
- **THE GREEN SCHISM · stage 2** — `priceShift` living_stock −1 in the Valley (the Accord is failing, less
  comes out of the wood) · `npcMood` cool for rootkin · **`travelCost` up on `the_root_road`.**

## HOW IT SHOWS UP IN PLAY — three surfaces, all existing
1. **THE WORLD TAB** (character-sheet overhaul): stage by name, **and the effects in plain words** — *"lattice
   work costs more · documents sell poorly · the Lattice Cities are cold to you."*
2. **AT THE POINT OF USE.** ⚠️ **This is the one that matters.** When a cost is raised by an arc, **the roll
   receipt should say so**: *"Latticework — 12 energy (**+4, the Bleed**)."* **A player should never have to
   visit a tab to learn why something got harder.**
3. **THE GM CONTEXT BLOCK** already assembles rumors; stage effects give NPCs something true to complain about.

---
# PART 2 — TIGHTENING DOMAIN ACCESS: my honest read
## ⚠️ FIRST: WHAT ERIK IS PROPOSING IS ALREADY AUTHORED. IT IS THE ENFORCEMENT THAT IS THIN.
`traditions.json` **already carries both halves of his idea**:
- `accessGates`: *"You may learn/rank a pole-tradition ability only if ONE of: **native** · **inRegion** ·
  **teacherOrTome**"* — with folk traditions explicitly OPEN.
- `domainAccessModel` (SNG-055, Erik's own, 2026-07-11): *"Access is a function of DISPOSITIONAL GEOGRAPHY."*
  Primary = full · **adjacent = free to all tiers EXCEPT capstones** ("being NEAR a people is not being OF
  them") · secondary = to Tier III · tertiary = further limited.
**And `canLearnAbility` is a real single-source gate** — it enforces domain verdict, level, attribute gates,
capacity, and **a capstone standing bar** (`requiresRegionStanding`, ≥12 region turns).
**So the frame Erik wants exists. What's missing is the middle:** the `native/inRegion/teacherOrTome` gate
appears in the *rules text* but I find **no code reading a teacher or a tome** — only region standing at
capstone tier.

## MY THOUGHTS, SINCE ERIK ASKED
**I think tightening is right, with one specific worry.**
**WHY IT'S RIGHT:**
- **It makes the 27 traditions mean something.** Right now breadth costs skill points; it doesn't cost
  *belonging*. A character can accumulate a pan-Valley toolkit without ever being *of* anywhere — which
  quietly contradicts the whole catalog, where every tradition is *"a PEOPLE's craft."*
- **It gives teachers a mechanical role**, and the world just grew a lot of people to be taught by. **Ash
  carries both soft precursor routes.** Oren Vale is a teacher. **The god-named are teachers.** Tightening
  access is what makes those characters *matter* rather than being flavour.
- **And it feeds the arc war**: standing in an axis becomes a resource, which means **the strike/guard/crusade
  quests pay in something the player wants** — not XP, but *access*.
**THE WORRY, AND IT'S REAL:**
- **A player whose primary is a lonely pole could get locked into a very narrow game.** My own analysis found
  five *mechanically lite* traditions — **a numinous with no damage craft and no cross-domain access is a
  character who cannot solve most encounters.** Tighten access and you must check the lite traditions can still
  function alone.
- **Availability of teachers is a CONTENT problem before it's a rules one.** If access requires a teacher and
  teachers are scarce or randomly placed, the gate becomes *"wait for the world to offer you one."* **That's
  not a choice, it's a lottery.**
**WHAT I'D ACTUALLY DO:**
1. **Enforce what's already authored before adding anything new** — wire `teacherOrTome`, since the rule exists
   and nothing reads it. **That alone delivers most of what Erik wants.**
2. **Keep `adjacent` free below capstone.** Erik's own line — *"being NEAR a people is not being OF them"* — is
   the right calibration, and dropping non-adjacent domains entirely (his proposal) is close to it already.
3. **Make standing an EARNABLE, VISIBLE currency** — the character sheet's TIES tab should show *"you are 4
   region-turns from the Palelands opening its capstones."* **A gate you can see is a goal; a gate you can't is
   a wall.**
4. **And check the lite traditions first.** If a solo numinous can't function under tighter access, the fix is
   more folk-craft access, not looser pole access.
