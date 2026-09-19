# HANDOFF SNG-627 — Hold features are properties now, and troops are not furniture

**Aevi (PO) → CCode · 2026-09-18 · on Erik's reality check**

---

## §1 — ⛔ WHAT THE CHECK FOUND

**38 feature kinds resolve to 28 distinct shapes. Ten were a second name for something already there.**

Five were identical but for name and price. ⚠️ **Five more were held apart only by `facility` and `attends` —
two fields present on eleven features and read by the engine in ZERO places.**

```
wall · barrier · gate · muster_yard      all {defence: 1, martial}
forge · school_room · stable             all {craft}
laboratory · scriptorium · smithy        all {craft, producesWhileMoving}
mine · mill                              both {material, raw_material}
memorial · grave_ground                  both {meaning, aura .15, pilgrims 1}
infirmary · keepers_hut                  both {people, hands 1, residents}
```

⛔ **A MUSTER YARD AND A WALL WERE THE SAME OBJECT** — while you are building the band layer.

## §2 — ⛑ ERIK'S RULING: BOTH, AND THE PROPERTY IS THE MECHANISM

> *"Collapses to features that provide basic properties — a wall or a moat are defence, a watchtower and scouts
> are sense — while also having the muster yard enable training and a place to raise troops to, perhaps at less
> cost. Barracks house troops. Troops get fed and paid, but they can also be put to work and do jobs and
> missions. Stables can shorten journeys but can also house the mounts for cavalry. And you can have variants,
> such as giant lizard dens — flavour by region or people, but providing the same basics."*

**Eleven properties, authored at `economy.holdFeatures._properties_20260918`. All 43 kinds now carry one.**

`defence` · `sense` · `housing` · `training` · `mounts` · `production` · `craft` · `meaning` · `healing` ·
`trade` · `transit`

⛑ **`sense` is the one the engine already half-had** — `watchOf`'s own comment says **STONE DOES NOT SEE**, which
is Erik's *"a watchtower and scouts are sense"* written a month early.

## §3 — ⬜ THE FIVE HOOKS I CANNOT WIRE

Three properties read nothing today. **Each is a line, and each is the difference between a name and a feature.**

- **`training`** — a muster yard should cut `callCostPerHead` (I set it to 4 in `rules.martial`). ⛔ **A hold with
  a yard raises a band cheaper than a hold without one**, which is the whole of Erik's *"a place to raise troops
  to, perhaps at less cost"*.
- **`mounts`** — shortens a journey **and** is what a mounted band rides. Two effects, one property.
- **`healing`** — an infirmary should matter to a death-ladder retrieval. ⚠️ SNG-566's depths are built and an
  infirmary touches none of them.
- **`housing`** — ⛔ **a band with no barracks should have to be quartered somewhere, and that should cost.**
- **And the big one: `troops are not furniture.`** Today a garrison is *only* a bill — `upkeepFor` charges
  `garrisonUpkeepPerHand` and that is the whole of their existence. ⛑ **Erik: they can be put to work, do jobs and
  missions.** That is the difference between a standing force and a standing bill.

## §4 — ⚠️ THE VARIANT RULE, AND WHY IT IS THE PART THAT LASTS

**A variant is a name, not a feature.** `giant_lizard_den` is `mounts` with `variantOf: stable`; the Rootkin's
`thorn_line` is `defence` with `variantOf: wall` and it grows back. ⛑ **Five authored to demonstrate it rather
than only describe it** — `moat`, `thorn_line`, `giant_lizard_den`, `drill_ground`, `barracks`.

⛔ **EACH COSTS A LABEL AND NO NEW PROPERTY. That is the thing that stops the list growing back to 38 shapes** —
there is never again a reason to mint a near-duplicate.

## §5 — ⚠️ AND ONE I DECLINED TO COLLAPSE

`memorial` and `grave_ground` were identical in the data and **are not the same thing.** One is **names kept**
and one is **ground tended**: a memorial is read, a grave-ground is worked, and an Ashwarden would tell you the
second costs somebody something every week. ⛑ **They want different numbers, not one entry.**

— Aevi, PO
