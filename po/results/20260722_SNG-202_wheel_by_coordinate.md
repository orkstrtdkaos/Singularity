# SNG-202 — the wheel is a map: a braid is placed between its two axes

**CCode · 2026-07-22 · v1.8.191 (`fb7a36b2`) + v1.8.192 (`bc942529`) · suite green.** The braid arc's capstone. Non-deferred scope complete (headline placement + the §3 list category); the general all-ability placement + interactions are 202B, deferred with their consumers.

---

## ROUND 2, answered

- **Q1 (render site) — `renderSkillWheel` / `buildWheelModel` (app.js).** It already draws polar: `wheelAngle(pos, n)` → `wheelPt(ang, r)`. Ability nodes were placed at (tradition-angle, tier-radius); a braid, whose def carries `tradition: sources[0]`, sat on *one* parent's spoke. The projection existed; the braid was mis-anchored.
- **§0 correction — `ring` is an OBJECT, not a number.** The ALERT said "`angle = ring/24 × 360°`"; the real data is `ring: {position, degrees, neighbors, antipode}`. So the angular authority is the ring **position** (which the wheel already uses via `posOf`/`wheelAngle`). One great circle, verified — but the spec's arithmetic would have thrown on an object. (The kind of premise this batch keeps catching by reading the corpus.)
- **Q2 (weight source) — braids now, weighted-general later, exactly as you offered.** Braid parentage (`minted.from`) is the clean two-point signal and covers most of Erik's ask. All 285 abilities do carry `axes`/`functions`/`tradition`, so the weighted-general form has data when 202B needs it — I removed `compositionAngle` rather than ship it as a dead export (the wiring audit is right that an unconsumed export is a false green); it returns in 202B **with** its consumer.
- **Q3 (antipodal tiebreak) — clockwise from the lower ring, and yes the hover gets the note.** Two parents 12 apart have two equal midpoints; the rule is deterministic and the node reads "spans the circle (an antipodal braid, the far poles joined)" — remarkable, not arbitrarily parked (it matches the foreclosure canon: only a braid crosses the axis).
- **Q4 (phone legibility) — r-banding + a stable deterministic fan.** Radius from separation already spreads braids across the r-axis; deep-centre clusters get a small `(bi % 3 − 1)` nudge — determinism preserved (stable inputs → stable nudge).

## What shipped

**`engine/wheelgeom.js` (new, pure, tested):** `braidPlacement(posA, posB, n)` → the shorter-arc midpoint angle + inward radius factor (adjacent parents hug the rim, cross-circle braids sink to the centre) + the antipodal flag. Deterministic, no force layout (§4) — the Tether FCG lesson applied.

**`buildWheelModel`** pulls minted braids out of the parent-spoke grouping and places each by `braidPlacement`; a folk/ungoverned parent falls back to the resolvable spoke, else the centre — never a fake angle. The node carries a `.braid` style (accent ring + glow; a wider halo for antipodal) and a hover naming both parents. The degenerate case (a character who never braids) is unchanged — nothing regresses.

**§3 (`bc942529`):** owned braids get a "✦ Braids" ability-list category, each entry naming its parents (⧉ braid of A × B) and its provenance (your name / first found by <name> / you found it first) — the list echo of the wheel, and the SNG-201 attribution surfaced.

## Verified

11 geometry tests (shorter-arc both directions, order-independence, antipodal determinism + stability, separation, rim-vs-centre radius, degenerate = its own spoke) + 3 wiring/source assertions (buildWheelModel uses braidPlacement; the §3 category + attribution). Suite green (module registered: SYSTEM_SPEC 62 + spec-map row + ENGINE_MAP + authored metadata; `testOnlyExports` back to 7). Boots clean on a fresh port at v1.8.192. 0 mojibake.

## 202B — deferred with their consumers

- **General weighted-mean placement of ALL abilities + school rotation** (§1) — `compositionAngle` (the Tether meaning-gravity math) lands when placement widens past braids, wired at the same time.
- **§2 interactions** — click a tradition → highlight its crafts, schools, braids-with-a-parent-in-it, dim `adjacent`, the `opposite` as the far pole with the foreclosure line as visible geometry; click a braid → light both parent spokes + the arc. This is the visual browse-surface layer, best iterated with your eyes on a phone.

*— CCode. The braid arc is complete: it mints as a moment (197), becomes the world's recipe when found (201), and now sits on the wheel where its making put it (202). Erik's leg: braid two crafts, open the wheel, and see the new craft between their two axes — a cross-pole braid near the centre, spanning. Only-Aevi-closes.*
