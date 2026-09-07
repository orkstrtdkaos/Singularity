# SPEC — local geology, and the ten reds that are not mine

**Author:** Aevi (PO) · **2026-09-06** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**subject:** world-geography
> Erik: *"even though we authored the land from a generator, I think we could probably **alter some local
> geology to help fit where things are**, right?"*

---

## §1 — ⛑ YES, AND IT IS A BETTER ANSWER THAN THE ONE I USED

**Today there are two ways to resolve a place that disagrees with its ground, and I used the wrong one.**

| ⬜ | what it does | when |
|---|---|---|
| **move the place** | ✅ what I did to Greywater Stilts — 0.67° to flat ground | ⚠️ **when the place's POSITION is arbitrary** |
| **re-read the ground** | ✅ what I did to all 18 layouts | ⚠️ **when the reading has gone stale** |
| ⛔ **ALTER THE LOCAL GEOLOGY** | ⛑ **does not exist** | ⚑ **when the place's position is CANON and the generator merely had no opinion at 1 km** |

⛔ **GREYWATER SHOULD PROBABLY HAVE BEEN THE THIRD.** ⚠️ It is a stilt-town over a named marsh in an
authored region; **moving it was the cheapest fix, not the truest one.** ➡️ **A marsh is a local geological
fact and the generator's 33 km cell has no way to hold one.**

### ⚑ AND THE LAYER ALREADY ARGUES FOR IT, IN ITS OWN NOTE

> ⛔ *"The terrain generator has nothing at this scale — its finest feature is ~0.3° ≈ 33 km and a village
> spans ~0.01° ≈ 1 km. **So a local map is NOT a further zoom of the world raster; it is a NEW layer.**
> ⚠️ BUT IT IS NOT INVENTED EITHER: the world layer supplies the DIRECTIONS."*

➡️ ⚑ **THE PRINCIPLE IS ALREADY RIGHT AND ONLY HALF-BUILT.** ⚠️ **The world supplies the directions; the
local layer supplies what happens between the cells** — ⛔ **and right now it may only READ, never SAY.**

---

## §2 — ⬜ WHAT TO BUILD: `_localGeology`

**`measureGradients(loc, {locations, hydrology, terrainFn})` reads the generator and nothing else.**
⬜ **Proposed: an optional block on the layout that overrides a named gradient, with a reason.**

```json
"greywater_stilts": {
  "_localGeology": {
    "relief": 0.004,
    "why": "⛔ A MARSH. The generator's 33 km cell reads the surrounding rise; the town sits in
            the flat of it, which is why it is on stilts and why it is called Greywater.",
    "extent": 1200
  }
}
```

| ⛔ the rules that keep it honest | |
|---|---|
| ⚑ **it OVERRIDES a named gradient, never invents a new one** | relief · uphill bearing · river distance. ⛔ **Not position, not region, not connections** |
| ⛔ **every override CARRIES A REASON, and the reason is geological** | ⚠️ *"a marsh"*, *"a terrace above the floodplain"*, *"a limestone sink"* — ⛔ **never *"so the gate passes"*** |
| ⚑ **it is BOUNDED** | ⬜ an `extent` in metres. **A local fact is local; past its extent the world raster wins** |
| ⚠️ **and it must be VISIBLE TO THE GATE** | ⛔ **SNG-404 compares Aevi's readings to the engine's. If an override is silent, the gate compares against a number nobody can trace** — ⬜ **`measureGradients` should return `overriddenBy` alongside the value** |

### ⚠️ AND THE ONE THING IT MUST NOT BECOME

⛔ **A WAY TO MAKE A FAILING GATE GREEN.** ⚑ **The test: would you author this geology if no gate existed?**
⚠️ **A marsh under a stilt-town passes. A relief of 0.017 at a town that needs to be under 0.018 does not.**

⬜ **Aevi's read: Greywater should be re-fitted this way once it exists — the move stands until then, and
`_worldPosWas` records where it was.**

---

## §3 — ⬜ THE TEN REDS, POINTED AT THEIR OWNER

**All measured this evening. ⛔ NONE IS AEVI'S CONTENT.**

### ⚑ The name-and-terrain family — SIX, one cause
`SNG-387` · `SNG-391` ×2 · `SNG-393` ×3 · `SNG-394`

| | |
|---|---|
| ⛔ **`SNG-391` determinism** | *"the regenerated world is byte-identical to the shipped asset"* — ⚠️ **it is not, which means every other check in this family is measuring a moving target** |
| **`SNG-393`** | **seven names bind to nothing within 3°** — The Axewater · The Middle Run · The Burnwater · The Milljaw · The Echofen · The Quiet Fen · The Upper Mire |
| ⚠️ **and the gate's own note says what to do** | ⛔ *"its feature genuinely restructured; **DO NOT WIDEN THE THRESHOLD TO HIDE IT**"* |
| ⛔ **`SNG-387`** | `kestrels_roost` sits **4.3× its region's typical spread** |

⬜ **Aevi's read: fix determinism FIRST.** ⚠️ **If the regenerated world is not the shipped one, the seven
unresolved names may be an artefact of comparing two different worlds** — ⛑ **and re-anchoring them against
a world that is still moving would be work done twice.**

### **`SNG-414`** — the computed region centre drifts up to 46% of radius on eight regions
⬜ **Aevi's, if the answer is authored centres.** ⚠️ **The check's own words: *"a fair stand-in for the
regions SHE HAS NOT MAPPED"*** — ⛔ **so the fix is either better computation (CCode) or eight authored
centres (Aevi).** ⬜ **Which one is Erik's call, and I would rather author eight centres than have the
engine guess.**

### **The two unloaded-rules checks** — ⛑ **and one of them matters this week**
**Eight registered and read by nobody; eleven registered and never loaded:** `ability_distribution_target`
· `companion_template` · `damage_types` · `death_domain` · `energy_costs` · `healing_intent` ·
`mechanic_effects` · `nexuses` · `power_cosmology` · `tempo` · **`the_veil`**

⛔ **`the_veil` AND `power_cosmology` ARE UNREAD, AND WE BUILT THE VOID ON THEM THIS WEEK.** ⚠️ R40/R41's
Sovereigns, R38b's two grounds, the Assay's four conditions — ➡️ **all authored against cosmology the engine
has never loaded.**

⚑ **The check names its own precedent:** *"`earned_power_guidance` was exactly this — the numbers would
clamp while its whole voice layer never reached the GM."* ⬜ **Wire it or classify it in
`rules_classification.json`, and I would want to know which before authoring more Void content.**
