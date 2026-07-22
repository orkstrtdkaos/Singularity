# SNG-202B — the wheel is a MAP: composition places every craft, and click-to-browse

**CCode · 2026-07-22 · v1.8.195 (`c7fe678e`) · full suite green · live-verified on a fresh port.** The deferred half of the wheel arc — §1 general weighted-mean placement (past braids, to all crafts) and §2 interactions. 202A shipped the two-point (braid) case; this generalizes it and makes the wheel a browse surface.

---

## The corpus read that shaped the build (the §1 ⚠️, honored)

The spec's §1 warned: *verify what composition data abilities actually carry before choosing the weight source.* I did, across all 285 abilities and 24 traditions, and it changed the design:

- **Abilities carry `axes`** (all 285) — weights in a 12-bipolar-axis abstract space (`dark_light`, `chaos_order`, `death_life`…), values in [−1, 1]. **No ability carries a `school` field** (0/285); only 19 carry `schoolAffinity` (a native-expression tag, explicitly "NOT a gate").
- **Traditions carry `ring` + `axis` + `pole`** (24/24), **not `axes`**. But the ring IS a projection of those 12 axes: a tradition at ring position `p` and the one at `p+12` are the two poles of one axis (umbral/dark@0 ↔ blazeborn/light@12; ashwarden/death@5 ↔ rootkin/life@17). **That is the bridge** — a craft's `axes` weights project onto the great circle through the tradition poles.
- **The 49 "off-ring tradition" abilities** (valley_craft, harmonic, radiant_folk, precursor, cross_pole_braid) are exactly the folk/precursor/braid crafts the wheel already routes to the centre/outer ring — the rotation applies cleanly to the ~233 ring-tradition crafts and touches none of them.

## ROUND 2 — the four questions, answered

**Q1 (render site) — `renderSkillWheel` / `buildWheelModel` in `app.js`.** It draws polar already (`wheelAngle(pos, n)` → `wheelPt`), which 202A confirmed. §1 adds a per-craft angular rotation to the spoke placement; §2 adds a highlight pass keyed on a clicked tradition or selected braid.

**Q2 (composition weight source) — `axes`, projected onto the ring via the axis-pole map; and the tradition ANCHORS while composition ROTATES, bounded.** This is the load-bearing call. A *pure* axes-resultant (angle = wherever the composition points) would violate the spec's own explicit degenerate guarantee — "a pure single-tradition craft → its tradition's ring-angle" — because I measured that only **81%** of crafts' resultant lands within 1 position of their own spoke; the other 19% drift up to antipodal. So: the tradition anchors the spoke (a pure-death craft renders on the death spoke, *guaranteed*), and the craft's composition rotates it a **bounded** amount off that spoke (clamped to ±2 ring positions = ±30°). "A mostly-death craft that adopts order sits *near the death axis*, rotated toward order" — the spec's exact language is an anchor-plus-lean, not a free resultant. Live proof: ashwarden's 11 crafts spread from −31° to +30° off the spoke, one pure-death craft sits at exactly 0°, and the clamp holds (the ~1.3° over 30° is the tie-separating micro-fan, not the lean).

**Q2b (schools) — schools carry no separate placement vector, so composition IS the school rotation.** No ability has a school field that could rotate placement independently; `schoolAffinity` is a native-expression tag on 19 crafts, and those crafts are already crafts of their tradition. A school-leaning craft's lean is already encoded in its `axes`. So "the school places the craft" collapses into "the composition places the craft" — one authority, exactly as the GUARD demanded ("schools place; traditions anchor" — and the school's lean lives in the axes).

**Q3 (antipodal tiebreak) — unchanged from 202A** (clockwise from the lower ring, hover says "spans the circle"); the general form inherits it because `braidPlacement` is still the two-point case.

**Q4 (phone legibility) — the bounded clamp + a much smaller residual fan.** The old spoke fan was ±0.05 rad per craft; now the composition lean does the separating and the residual fan is ±0.015 rad, only to split composition-identical crafts of the same tier. Determinism preserved (stable inputs → stable position). No force layout (§4).

## What shipped

**`engine/traditions.js`** — `buildTraditionIndex` now builds `axisPoles` (`axisKey → {neg, pos}` ring positions), the single-source bridge from a craft's abstract-axis composition to the great circle. Built once at content load, read by the wheel.

**`engine/wheelgeom.js`** (pure, tested) — `compositionAngle(axes, axisPoles, n)` sums a unit vector toward the leaning pole of each ring-mappable axis (sign picks the pole, |weight| the pull), returning the resultant's render-space angle + magnitude (how coherently the craft leans), or `null` when no axis is ring-mappable. `leanOffset(spokeAng, comp, n, maxSwing)` is the bounded signed rotation off the spoke. These are the general form of `braidPlacement` — now shipped *with* their consumer, not as dead exports.

**`buildWheelModel` (app.js)** — each spoke craft is rotated by `leanOffset(spokeAng, compositionAngle(ab.axes, axisPoles, n))`. Pure crafts stay on-spoke (degenerate = today's wheel); composition leans the rest. Braid nodes now also carry `parentTrads` for §2.

**§2 interactions (app.js + style.css)** — the ring's tradition nodes are clickable (`data-wheeltrad`). Clicking one lights its crafts and any braid with a parent in it (`trad-related`), dim-highlights its ring-neighbours (`trad-adjacent`), fades the rest (`trad-dim`), marks the antipode (`trad-sel-opp`), and **draws the foreclosure line to it as geometry** (`wheel-foreclose` — "only a braid crosses this axis" is now visible, not lock-text). Selecting a braid node lights both its parent spokes and the joining arc. Tradition-select and the function-family filter are mutually exclusive (the two browse modes don't stack). Learn/own/foreclosed semantics are untouched (§4) — position changes, meaning does not.

## Verified

19 new smoke tests (axis-pole map correctness; `compositionAngle` sign/magnitude/null-on-unmappable/null-on-empty; `leanOffset` zero-when-on-spoke, clamp, signed clamp; §1 wiring; §2 clickable-tradition + highlight + foreclosure + braid-parent). Full `npm test` green — `compositionAngle`/`leanOffset` are consumed (not in the no-consumer note), `testOnlyExports` ratchet unchanged at 7. **Live-verified** on fresh port 8108 with a real character: the wheel renders 282 ability nodes + 24 clickable tradition nodes, zero console errors; clicking ashwarden lit 11 crafts, dim-lit 19 neighbours, faded 252, drew the Death↔Life foreclosure line, and marked rootkin as the far pole (screenshot captured). 0 mojibake.

## The braid arc is complete

197 (mints as a moment) → 201 (becomes the world's recipe) → 202A (sits on the wheel by its making) → **202B (every craft sits by its composition, and the wheel browses)**. Erik's leg: open the wheel and *see your build's shape* — a cluster hugging your axis, a craft leaning toward the quality it borrows, a braid near the centre spanning; tap your people and watch the whole circle answer, the foreclosure line drawn straight across to your antipode.

*— CCode. Nothing deferred remains in the wheel arc. Only-Aevi-closes.*
