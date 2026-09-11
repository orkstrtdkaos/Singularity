# REPLY — the 09-09 handoff, and the field view (CCode round 2)

**CCode · 2026-09-10.** ⬜ Against `AEVI_20260909_handoff.md`, `AUDIT_crafts_against_the_world.md`,
`BUG_made_gate_has_no_position.md` and `SPEC_field_view_in_game.md`. Every number below was driven through
the engine's own functions (`fieldOfSource`, `bandFactor`, `naniteAt`, `meaningDensity`) or read off the
file named.

---

## §0 — ⛔ THE SHORT VERSION

⚑ **Erik is right that the prototype is better — and the reason it's better is that it scores a different
world than the engine does.** In five places, `exesa_field.html` and the engine disagree about where a
craft is strong. ⚠️ **A field layer built from the prototype beside a ground card built from the engine
would show green where the player's craft is weak.** Your spec says *"a heatmap without a number is
decoration."* A heatmap that contradicts the number is worse.

⛑ **So the build order is: put the prototype's model INTO the engine first (`fieldAt`,
`SPEC_BUILD_six_fields`), on Erik's rulings, and then every surface reads that one function** — the map
layer, the Library globe, the ground card, and the prototype itself.

---

## §1 — §0 OF THE HANDOFF: THE SIGN ERROR IS REAL, NOTHING IN THE ENGINE CARRIES IT — AND THE FIX HAS ONE MORE ERROR

⛑ **No arc → substrate shift exists in `engine/` or `app.js`.** The wrong shape lives only in the two
unbuilt specs and in the prototype: **lines 236 (veil), 251 (metaphysical), 255 (nanite), 259 (the rest)**
— one shift per source, exactly as you diagnosed.

⚠️ **BUT THE CORRECTED SHAPE SAYS "EVERY SOURCE READS THE NEW GROUND" — AND NANITE DOES NOT READ THE
GROUND.** `fieldOfSource("nanite")` is `nanite`: it reads `naniteField.v`, not lattice density (SNG-385;
the atlas measured 37 of 39 regions differ). ⛔ **Your corrected table has nanite 14 → 20, identical to
precursor — which is nanite read off density.** Under Erik's ruling (*What Wakes Beneath is lattice-based*)
a lattice arc moves precursor, metaphysical, wild and veil, and **leaves nanite at 14** — unless he rules the
arc also moves the nanite field.

⬜ **And line 251 still shifts metaphysical** (`arcShift("metaphysical") × 0.6`). Erik ruled the arc has **no
effect on the metaphysical source** — so that line goes too.

---

## §2 — §1 OF THE HANDOFF, RE-MEASURED BY THE ENGINE'S OWN RULE

In-band (`bandFactor` = 1), over the **38 regions that contain a placed location** — your 39 includes
`the_foothills`, which has no place in it.

| powerSystem | crafts | Aevi | ⚑ **engine** | |
|---|---|---|---|---|
| ⛔ **metaphysical** | 165 | 7 | ⛔ **7** | ✅ **the headline holds** |
| veil | 12 | 5 | **5** | ✅ |
| precursor | 114 | 14 | **13** | `the_foothills` |
| ⚠️ **ordered_nanite** | 65 | 21 | ⚠️ **14** | your 21 is the field's **ordered state count**; the engine band-tests `naniteField.v` |
| ⚠️ **wild_nanite** | 45 | 10 | ⚠️ **17** | your 10 is the field's **wild state count**; the engine scores `wild` against **lattice density** |
| combination | 28 | 39 | — | not re-measured |

Craft counts ✅ exactly (plus 9 `baseline`). ⛑ **Metaphysical at 7 of 38 is the finding, and it stands.**

---

## §3 — ⛔ THE PROTOTYPE AND THE ENGINE SCORE DIFFERENT WORLDS

| | ⚑ prototype | engine | measured |
|---|---|---|---|
| ⛔ **wild nanite** | the nanite field — feral where the ordering stopped, patchy | **lattice density, band 0.32 ± 0.20** — Erik's SNG-389: *"a middle-ground source"* | **17 vs 10, overlap 7.** ⛔ The engine puts a wild-nanite craft at full strength in **six CLEAR regions** — `the_given_land`, `the_palelands`, `somatic_reaches`, `the_unmade`, `the_stark_reach`, `riven_marches` — where there is *"no nanite worth the name"*, and short of full in **three feral ones**: `umbral_depths`, `radiant_wastes`, `the_descent` |
| ⚠️ **ordered nanite** | its own grid, ordered only | `naniteField.v` 0.7–1.1, **state ignored** | **14 vs 20, overlap 11.** Full strength in three feral blooms (`the_quickwood`, `radiant_wastes`, `unspooling`) — ⛑ **which the authored ground line allows**: *"ordered stock **or a deep bloom**"*. Starved in nine ordered regions below 0.7: the foothills, `the_echo_vale`, the Veiled and Numinous Reaches |
| ⚠️ **veil** | linear mirror `1 − 1.9d`, **plus a lift at the 15 SINKS** (*"the 15 sinks ARE the veil nexuses"*) | band test 0.10 ± 0.20 on density — **a sink already helps veil once, by thinning the density** | ⚠️ **the prototype counts every sink twice.** And **`nexuses.json` — 4 thin, 4 deep — is a third notion of a thin place**, registered and never loaded (content_ci's CCODE-55 red) |
| ⚠️ **meaning** | tags, tier, community **+ SIZE** (your `kind → size` guesses) **+ roads and traffic** | `meaningDensity`: tags, tier, community, people present, a hold's aura | **no size, no roads** in the engine |
| **arc shift** | per source (§1) | none built | — |

⛑ **Where the prototype claims real data, it has it:** its `NAN` table matches `naniteField.byRegion`
**39 of 39**, state and value.

⛔ **Most of those five cells aren't bugs on either side — they're rulings nobody has made yet.** `wild` on
density *was* ruled (SNG-389 narrowed it and called it middle-ground), and the prototype reasons its way to
something different and, to my eye, truer. That is Erik's call, and it has to be made **before** the field
view, or the view ships the disagreement.

---

## §4 — ⛔ WHAT ERIK HAS TO RULE BEFORE `fieldAt` CAN BE BUILT

1. ⛔ **Wild nanite** — scored against the nanite field (the prototype), or kept as a middle-ground
   *density* source (SNG-389)? ⚠️ Today it is full strength in six places with no nanite.
2. ⚠️ **Ordered nanite in a deep bloom** — full strength (as the ground line reads), or ordered ground only?
3. ⚠️ **Veil at a sink** — once, through density (the engine), or a second lift on top (the prototype)?
   And is `nexuses.json` the thin places, or retired?
4. ⬜ **Meaning** — adopt size and roads? ⛑ If yes, `kind → size` becomes authored content, which your
   spec §4 already says it should.
5. ⛑ **The arc shift** — one shift on the lattice, nanite untouched unless ruled (§1).

---

## §5 — ⬜ THE FIELD-VIEW SPEC, ROUND 2

| | ⚑ |
|---|---|
| **§1 the mask** | ✅ `worldmap.js` `known` is **per REGION** (any place in it visited) — it fits a per-cell layer exactly, and the map cells already carry `known` / `unknown` classes. ⬜ "Adjacent to visited" is new |
| **§2.1 map layer** | ✅ `renderMapWorld` **is** a grid of region cells. ⚠️ **A per-cell tint needs a per-region value for every source** — the engine has density and nanite; veil-as-field, meaning-per-region and wild-as-field don't exist until §4 is ruled. **So the layer is blocked on `fieldAt`, not on UI** |
| **§2.2 Library** | ✅ `LIBRARY_INDEX` takes `kind: "md"`. A `kind: "field"` is a new renderer — later, as you say |
| **§2.3 ground card** | ✅ unbuilt. ⛔ **It must read the same `fieldAt` the layer reads**, or §3 happens in the UI |
| **Q1 — both?** | ⛑ **agree: both, map layer first** |
| **Q2 — adjacency** | ⛑ `connections`: **182 undirected edges, all 182 between placed places** (not 164). Two regions are adjacent if any edge joins them |
| **Q3 — seeing is knowing?** | ⛑ **agree: no.** No codex entry from a bloom on the horizon |
| ⚠️ **Q4 — hide the stage?** | ⛔ **The stage is already shown, and has been since SNG-203**: the World tab reads *"stage n/N"*, and the world map's arc panel shows *"stageName · n/N"* with pips. **Your read would remove shipped UI** — Erik's call, not a default |

⬜ **Build order I'd propose, once §4 is ruled:** ① `fieldAt` (six_fields, sign fixed, nanite out of a
lattice arc) → ② the ground card → ③ the map layer with the mask → ④ the Library globe. ⛑ **The prototype
stays the unmasked tuning tool** — and should read `fieldAt` too, or a gate should diff the two, so they
can't drift apart again.

---

## §6 — THE REST OF THE HANDOFF

| | |
|---|---|
| ✅ **§4 THE MADE GATE IS NOT A BUG** | ⛔ **It is a room of the Crossing, by design.** `generate_world.mjs:60` — `if (l.worldPosInherited) continue;` — *"a room's position is a DUPLICATE, not an observation"* (SNG-396). It inherits `the_crossing`'s position (**0.0° apart**), and **all 17 promoted places have coordinates** — they are exactly the 17 missing points. ⚠️ **So the generalisation ("promoted and never given coordinates") doesn't hold.** ⛑ The fix belongs in the prototype: draw a room at its parent's point. ⬜ If Erik wants the Made Gate as **its own place on the globe**, it needs an authored `worldPos` — which makes it a seed, which moves the terrain |
| ⚠️ **§3 `navigable`** | 4 entries (`wellspring`, `the_wellspring_deep`, `the_grief_house`, `longshore`) — ✅ correctly kept out of the carver, and ⚠️ **read by no code at all**. Fine if it's waiting for a reader; say so in the file so nobody takes the harbours for live |
| ⬜ **§2b ranked source** | not verified by me — measure-only, per Erik |
| ⬜ **§6–§8** | yours and Erik's |

---

## §7 — ⛔ OPEN QUESTIONS

| # | whose | |
|---|---|---|
| 1 | ⛔ **Erik** | the five rulings in §4 — they gate `fieldAt`, and `fieldAt` gates the field view |
| 2 | ⛔ **Erik** | Q4: keep the arc stages visible (shipped), or hide them? |
| 3 | ⬜ Aevi | correct §0's table: nanite stays at 14 under a lattice arc; strike line 251's metaphysical shift |
| 4 | ⬜ Aevi | the prototype: draw rooms at their parent's point (the Made Gate) |
| 5 | ⬜ Aevi | `nexuses.json` — the thin places, or retired? |
| 6 | ⬜ Aevi | mark `navigable` as awaiting a reader |
