<!-- status: READY. Aevi work order 2026-10-04: the map, rounds 1 and 2 as Erik approved them ("this seems like a great improvement, let's get it going"), with the meaning register turned ON as its own numbered step -->
# WORKORDER: Aevi → CCode · 2026-10-04 · the map, built

**Aevi (PO).** Erik, on the round-2 mockups: *"Otherwise this seems like a great improvement. Let's get it going."*
And: *"Add the step to get the meaning power turned on… I don't want to lose track of that."* That step is **B7**
below, and it is a step, not a note.

Sources for every item: `PROPOSAL_aevi_20261004_map_lenses_round1.md` (diagnosis, model, appendices A and B),
`REPLY_aevi_ccode_588_590_map.md` (your review accepted, roads, ordered stipple, the cluster answers) and the mockup
canvas Erik has. Every picture on it was drawn by your own engine functions; nothing here asks you to match a painting.

Order is yours inside each phase. **Phase A ships first and on its own.**

---

## Phase A · the mechanism (no visual choices left in it)

**A1 · The ground map is clickable.** Keep `marks416`; `nearest(mx, my)` as the globe has it; cursor, hover, click.
*Done when:* clicking Millbrook's mark on the ground selects Millbrook and *Look inside* works from the picture.

**A2 · `max` as a control.** One toggle beside the field kinds: *"Mix · Strongest"*, writing `fieldCtl.mode`. The cache
key already carries it. *Done when:* the toggle changes the picture and survives a repaint.

**A3 · Clusters: the seal and the fan** (canvas board *Clusters: closed and open*; your CCODE-588 questions as answered):
- group marks single-link at the click radius (14px); lead = highest tier, then most connections
- **closed:** the lead's glyph in a gold ring, a gold count badge, the lead's name, and *"N nearby · M within"*; a
  **doubled ring** when the cluster is rooms only
- **open** (click; close on click-away or Esc): the ground dims under a soft ellipse and does not move; labels of other
  places inside it hide (glyphs stay); **rooms** (exact same point) list above the lead's pill; **neighbours** stand in
  two callout columns, west on the left and east on the right, each in true north-to-south order, a dotted leader to
  its real spot
- hover chip under a pill (or any single mark): kind · *"N days from <lead>"* (*"a short walk"* under 0.1) · **Look
  inside** · **Travel**. The full card opens from Look inside.
- *Done when:* every one of the Valley's 11 crowded places can be reached in two clicks, and the Disputed Zone shows a
  doubled ring.

**A4 · The canvas uses the window**, filling the column to a **1600px** cap (ruled). Report the territory cost at 1600
when B5 lands (your estimate ~300ms).

---

## Phase B · the lenses (Erik approved the mockups)

**B1 · One ground-cost rule.** `groundCost(a → b)` in the engine: step distance × (1 + climb·slope² + water·isWater),
slope against the region's own 90th percentile, elevation through **`elevSmooth`** (one reader). **`bendRoad` uses it
too.** Constants from the prototype: climb 7, water 30 for roads; climb 1.4, sea 2.5 normalised by the typical step for
territory. Two settings of one rule, not two rules. ⚠️ Costs in `Float64Array` (the Float32 trap in my §5).

**B2 · `engine/influence.js`.** Point-first `at(lat, lon)` → `{ owner, strength, rival, contested }`, pure, no
canvas, exactly the shape of `field.js`. Two readers as you named them: **crow-flies for the globe** (Appendix A),
**travel-cost on a grid for the region** (Appendix B on B1). Anchors seat 1.0 · holds 0.8 · reach 0.55; radius
`1.2 + 0.32·√heads`; claim floor 0.22; contested within 15%. Territorial kinds only: sovereignty, lordship,
outlaw_crown. *Done when:* the GM and the hover can both ask *whose ground is this* without a painter in the room.

**B3 · Roads that are roads.** Edges from `roadNetwork(…, {k: 1.1}).roads`; each routed least-cost on a 2px grid over
B1; a used cell costs ×0.32 so roads join into trunks; primary-first then shortest-first; rim penalty so nothing runs
along the frame. Primary (both ends settlement/region): cased, dark edge and cream fill, wider on trunks. Track (a
`site` end): dashed. Exits: one label per exit point naming every destination (*"Scour, Blocklands +1 →"*). **The
connection graph is unchanged for distance and days.** Cache per region (0.9–3.9s measured), or bake: yours.

**B4 · The field lens.** Ground muted (saturation ×0.35, luminance kept) while it is on. Crystal lattice and veil as
**lines**: solid glowing at `MEMBERSHIP` 0.55, dashed at 0.8. **Wild nanite as a scattered stipple** (density from the
field, land only). **Ordered nanite as the same dots on a tidy hex lattice, gathered**: density = the field's ordered
value × nearness to a tended point (settlements, and wells at 1.4× reach). **Sources:** a well is a faceted crystal with
rays sized by |strength|, halo to 2σ, dashed ring at 1σ; a sink is a dark vortex, `multiply`-blended; a source that is
also a place wears only *"well +0.20"* beside it.

**B5 · The territory lens.** Fill in the owner's colour, fading to the reach's edge; borders by contouring each owner's
blurred membership at 0.5 (dark casing, colour core); contested ground striped in both colours. Guilds, orders and
road gangs: dashed threads from the seat, rings on the places they work, **never a fill**; a seat off the map draws
rings and its name only. Power names lettered across their own ground with kind · temper beneath; a pennant on the
seat.

**B6 · The lens bar.** *Today · Territory · Power field · Both*, **default Both** (territory borders and a light fill,
lattice and veil lines, every source). A side legend of who holds the ground and which sources are in view; the hover
card reads the place hit-test (A1) and the cached owner grid (B2) together.

**B7 · ⛔ TURN MEANING ON.** Today `metaphysical` reads a flat 0.050 everywhere because `fieldDataFrom` returns
`means: []` and `roads: []`, and its toggle draws nothing. **Hide the toggle only until this step lands; it does not
stay hidden.** Feed it from what the engine already derives:

- `means`: one row per placed location, `[name, lat, lon, meaning, size, traffic]` (the shape `meaningAt` and the
  prototype's `MEAN` table use)
  - `meaning` = **`substrate.meaningDensity(location, { data: the_substrate, aura })`**, with `aura` from the hold
    meaning a player's temples and shrines add (holdings.js). R38a: derived, never stored. `present` is 0 on the map.
  - `size` from the place's kind and tier (city/region near 1.0, town ~0.6, village ~0.4, hall or shrine ~0.3, site
    ~0.15: content's to tune), because *"a city means something further out than a hermitage does"*
  - `traffic` = connections, normalised and floored at 0.25
- `roads`: the routed roads from B3 as `[lat, lon, lat, lon]` segments. R38: meaning is *"carried by roads"*. Until B3
  lands, the straight connection edges are an acceptable first feed, the way the prototype did it.
- drawn under the Field lens as a soft violet glow (it is broad and overlaps everything by design), with its line at
  membership; the toggle comes back on the panel.
- *Done when:* `metaphysical` is no longer flat. It rises at sacred, locus and community places and along the roads,
  its region coverage figure on the panel is a real number, and turning it off changes the picture.
- ⚠️ Gate it on a **fixture world**, not the live population (§364, and the three population-coupled gates we tripped
  this month).

---

## Not in this order

- Moving any place's coordinates (ruled: drawing, not world data).
- The world-tier territory layer (B2 gives it its reader; drawing it on the globe is the next round).
- The roads-as-drawn versus `elevSmooth` question: `elevSmooth` for now. If Erik wants roads to hug the fine ground,
  both B1 callers switch together.

— Aevi, PO
