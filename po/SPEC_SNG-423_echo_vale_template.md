# SNG-423 — The Echo Vale as the template

**Author:** Aevi (PO) · **Date:** 2026-08-10
**Erik:** *"pick one — echo vale perhaps — and get it really well made so we can use it as a template
(style and approach) for the others."*

---

## §1 — ⛔ I READ WHAT YOU BAKE FIRST, AND IT CHANGED WHAT "WELL MADE" MEANS

`worldglobe.js` now exports `makeRegionBase`, `regionExtent`, `roadNetwork`, `bendRoad`, `areaFieldAt`,
`areaMembers`, `networkPaths`, `hydrologyPaths`, `visiblePins`, `markerKind`, `groundFactorAt`,
`densityAt`, `naniteAt`.

⛔ **So ground, roads, hydrology, precursor lines, areas and pins are all DERIVED. I must not author any
of them.** Anything I write that duplicates a derived layer is a second source that will disagree with
the first — **which is the failure I have hit five times this session.**

**What only authoring can supply, and therefore the whole of my job:**

| field | what it is |
|---|---|
| `purpose` | what the ground MEANS |
| `crossing` | ⛔ **NEW — the line a narrator needs when a player is BETWEEN places rather than arriving** |
| `ways` | why a road bends |
| `namedGround` | what is between the places, and now what you MEET there |
| `edges` | where the region stops being itself, and how sharply |

⚠️ **You read only `centre` and `radiusDeg` today.** These four are the ones worth wiring, and I would
take `namedGround` first — **it is the only layer that says anything about the space between pins.**

---

## §2 — WHAT MAKES IT A TEMPLATE, IN ORDER OF WHAT I THINK MATTERS

**1 · ⛔ COMPLETE AT BOTH TIERS.** All 7 members now have local frames — I authored the last two (SNG-422,
the Old Switchback and Thornwake Glade). **A player can zoom from the Vale into any town in it without
falling through.** That is the template test: *can someone stand anywhere in this region, at any zoom, and
find authored ground under them?* ⚠️ **For the Vale, yes. For the other 29, no — and that is the measure
of what is left.**

**2 · `crossing`, which is new and which I would put in every region.** *"Instruments read wrong here and
everyone knows it, so nobody trusts a measurement they took alone. Two parties crossing will compare
readings before they compare intentions."* ⛔ **The interference is not dangerous — it is UNRELIABLE, and
that is worse for anyone whose craft depends on knowing.**

**3 · `encounter` and `craft` on named ground.** The Shimmer now says what happens in it: *"sound arrives
before the thing that made it, or after — a party hears its own conversation from thirty paces off,
delayed."* ⚠️ **And what it does to a craft: Harmonic and Radiant workings both read HIGH here and both
LIE.**

**4 · Every bend still carries its reason**, and the reasons survived the SNG-421 regeneration because
only the geometry had been invented.

---

## §3 — TWO THINGS THE TWO NEW FRAMES TAUGHT

⛔ **THE OLD SWITCHBACK IS A ROAD, NOT A TOWN — 700 m frame, the largest in the corpus, and LINEAR.** Its
sites run −1 / 0 / +1 / +2 by level, because a switchback's local map is a climb. ⚠️ **Expect frames whose
shape is a line.**

⛔ **AND IT MEASURES RELIEF 0.01 WHILE BEING A MOUNTAIN ROAD.** Second case after the Harmonic terrace
where the world layer measures the ground a feature MEETS rather than the feature itself. **Switchbacks
are cut into a face whose scale is below the information floor.** ⚠️ **That is now twice; it is a class,
not a coincidence, and it is the strongest argument for prose-first.**

---

## §4 — THE STYLE, STATED PLAINLY SO THE OTHER 29 CAN FOLLOW IT

1. **Never author what is derived.** If the engine can compute it, I do not write it.
2. **Every entry cites its source** — a measured gradient, or a phrase from the location's own seed.
3. **Name what is between places, not just the places.**
4. **Say what a crossing FEELS like to someone whose craft is at stake**, not just what it looks like.
5. ⛔ **Prefer the fact the fiction already contains over the fact I would like it to contain.** The
   Shimmer's delay is derived from *"sound bends light here"* — I did not invent an effect, I read one.

⚠️ **If this shape is right, say so and I will drive the remaining regions to it in play order. If a field
is not worth rendering, say which and I will stop authoring it — I would rather write four fields you use
than six you do not.**
