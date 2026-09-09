# SPEC — the holding that moves: ships, groves, and things that carry you because they want to

**Author:** Aevi (PO) · **2026-09-08** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**subject:** holdings, travel
> Erik: *"Give CCode what he needs to make holds/enterprises mobile — **this could be airships or floating
> cities, or entire groves on the move, a giant sea turtle, etc. A dragon perhaps.**"*

---

## §1 — ⛑ MEASURED: NO VEHICLE MACHINERY EXISTS AT ALL

⚠️ **No mount, no vehicle, no carrier anywhere in the engine.** ⛔ **A character's position is
`character.currentLocationId` and a holding's is `locationId`, and NOTHING relates them.**

⚑ **That is good news — it is greenfield, so the shape can be right the first time** — ⚠️ **and it means the
whole question is *what does it mean for a place to have a position that changes.***

---

## §2 — ⛔ THE FIRST DECISION: `mobile: true` IS NOT ENOUGH

**A longship, a floating city and a dragon are three different problems wearing one word.**

| | ⚑ what actually differs |
|---|---|
| **a longship** | ⛔ **moved BY ITS CREW.** No crew, no motion. Its speed is a function of the garrison |
| **an airship** | ⚑ moved by apparatus — **it can move with nobody aboard and that is a hazard** |
| **a floating city** | ⚠️ **moves whether you want it to or not, slowly, and you do not steer it** |
| **a walking grove** | ⛑ moves on its own schedule — seasonal, and it does not consult you |
| ⛔ **a sea turtle · a dragon** | ⛔ **IT IS A PERSON. IT MOVES BECAUSE IT AGREES TO.** |

⬜ **PROPOSED — `carriage`, an object, not a boolean:**
```json
"carriage": {
  "moves": "crewed" | "powered" | "drifting" | "living" | "willed",
  "speed": 1.0,
  "needsCrew": 6,
  "bearerId": null,
  "hullable": true
}
```

---

## §3 — ⚑ AND `willed` IS THE ONE THAT MATTERS

⛔ **A DRAGON THAT CARRIES YOUR HOLDING IS NOT A VEHICLE. IT IS A GARRISON MEMBER WHO IS ALSO THE GROUND.**

⚠️ **`bearerId` points at an npc id, and everything about that person applies:** ⛑ **standing, bond stage,
`wants`, `fears`, and the delegate rules.** ⛔ **If the bearer's standing falls far enough, THE HOLDING WALKS
AWAY** — and that is not a punishment, it is the only honest reading of a place that has opinions.

⚑ **AND THE CORPUS ALREADY HAS THE PEOPLE FOR IT:**
- **Ysenkar and Tolvess** — true dragons, `walking_figure` r3, **and Tolvess's authored want is *"to be
  useful to Urd's building"*** ⚠️ a young dragon looking for a job is a carriage looking for a holding
- **The Slow Green** — an ent whose want is *"one season that runs its whole length"* ⛑ **a grove that moves
  is what they ARE**
- **`grown_guardian`** — T3 rootkin, *"put life at flood into a beast and it becomes something else"*

⬜ **AND THE CONSENT RULE IS ALREADY WRITTEN, ONE DOMAIN OVER:** ⛔ **`open_threshold` says a retrieval ASKS
— *"they may come back IF THEY WILL"*, and `death.js` carries `willing` as *"a fact about the dead, not a
parameter of the craft."*** ⚠️ **A living carriage is the same rule: WILLINGNESS LIVES ON THE BEARER, never
on the holder.**

---

## §4 — ⬜ WHAT MOVING BREAKS, AND THE ANSWERS

| ⚠️ | ⛑ |
|---|---|
| **`locationId` is treated as permanent** | ⛔ **it becomes CURRENT.** A mobile holding writes it on arrival; everything reading it keeps working |
| ⚑ **raids** | ⛔ **MOORED IS RAIDABLE, MOVING IS NOT.** R46a's watch/garrison math applies in port only — a real tactical fact rather than an exemption, and it gives *"where do I leave her"* teeth |
| ⚑ **upkeep** | ⚠️ **charged whether or not it moves** — that is the pressure that makes an enterprise an enterprise |
| ⛔ **features** | ⚑ **`hullable`: `fishery`, `smithy`, `quarters`, `watch`, `market`, `keepers_hut` yes; `mine`, `quarry`, `ward_line`, `waygate`, `grave_ground` no.** ⚠️ Aevi authors the flag per kind |
| ⚑ **the garrison IS the crew** | already a list of npc ids — ⛔ **and for `moves: "crewed"` it is also the ENGINE: below `needsCrew`, she does not sail** |
| ⚠️ **can the player be aboard while it moves?** | ⬜ **`character.currentLocationId === holding.locationId` and the holding moves — the player moves with it.** ⛔ **Aevi's read: yes, and that is the whole appeal** |
| ⛔ **two mobile holdings in one place** | ⚠️ fine. Two ships in a harbour |
| ⛔ **a mobile holding inside a region with no water** | ⬜ **`terrain` gate per carriage kind** — a longship needs `rivercraft` country, an airship does not care, a grove needs ground |

---

## §5 — ⚑ AND IT UNLOCKS THINGS THAT ARE ALREADY AUTHORED

| ⬜ | |
|---|---|
| **Brayden's longship** | the live case — `kind: "enterprise"`, `carriage.moves: "crewed"` |
| ⚑ **the Unbought Court** | ⚠️ **it is IN THE CHURN, where nothing stays.** A court that moves is the obvious next thing and Aelith's whole character is holding a shape in a place that dissolves them |
| ⛑ **`waygate` as a feature** | ⛔ **27 exist and one on a MOVING holding is a door that arrives** |
| ⚠️ **the Deepwood** | *"the true forest the Ents came from"* — ⚑ a grove that walks is already implied by `speaking_grove` and the Standing Moot |

---

## §6 — ROUND 2 QUESTIONS

1. ⛔ **Does a moving holding tick its economy?** ⚑ **Aevi's read: yes, but a `fishery` at sea produces and a
   `market` does not** — ⚠️ **a market needs someone to sell TO.** ⬜ Per-feature `producesWhileMoving`.
2. ⚠️ **What happens to a garrison when the holding sails without them?** ⛔ **Aevi's read: they are left,
   and it should be VISIBLE before departure** — ⚑ the same courtesy the straggler call gives a party.
3. ⬜ **Is a `willed` carriage a holding you OWN?** ⛔ **Aevi's read: NO — you hold it WITH them, and the
   record should say `steward: <bearerId>` rather than pretend otherwise.** ⚠️ **A dragon is not property and
   the schema should not let it read as one.**
4. ⬜ **Travel cost and time** — ⚑ a mobile holding presumably uses the existing travel model at
   `carriage.speed`. ⚠️ **CCode's, and it may be free reuse.**
