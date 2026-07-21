# SPEC — SNG-202: The wheel is a MAP — every craft placed by its composition
## Aevi (PO) · 2026-07-21 · authored to spec · **awaiting CCode ROUND 2 · the geometry feature; builds LAST in the braid arc**

> **Erik's vision, recorded in the 2026-07-21 handoff:** braids positioned *between* the two axes they
> braid — and the bigger idea underneath: **any skill placed on the wheel by its composition.** A
> mostly-death craft that adopts order sits near the death axis, rotated toward order; a pure-tradition
> craft stays on its axis. Schools shift the placement. Click a tradition → highlight everything related.
> CCode's read, which I share: *"a real geometry feature that ties braids + schools + skill-trees
> together — not a tail-of-session add."*

The wheel stops being a **list grouped by tradition** and becomes a **map of the great circle** where
every craft's position *is* its composition. The reveal Erik is after: you look at your wheel and *see*
your build's shape — a cluster hugging death, one braid reaching toward order, a somatic outlier. The
geometry is the information.

---

## §0 — THE ANCHOR (verified, and it changes the spec)

**`traditions.json` carries `ring` on all 24 traditions** — plus `adjacent`, `opposite`, and `distances`.
Verified at origin. **The great circle is already data.** Nobody has to invent an angular system:

> **`angle(tradition) = ring / 24 × 360°`** — done. Antipodal topology (Erik's ratified canon, *"like the
> facets of Tether"*) falls out for free: `opposite` is `ring + 12 mod 24` and the data already says so.

The spec is therefore not "design a coordinate system" — it is **"place abilities onto the coordinate
system the world already has."** Anything that invents a second angular scheme is building a parallel
great circle, and there is exactly one.

## §1 — Placement: angle from composition, radius from purity

Every ability resolves to a **polar position** `(θ, r)`:

- **Pure single-tradition craft** → `θ` = its tradition's ring-angle, `r` = outer (on the rim, on its
  spoke — exactly where it renders today, so the degenerate case *is* the current wheel).
- **A braid** → `θ` = the **angular midpoint of its two parents along the shorter arc**, `r` pulled
  inward proportional to how far apart the parents sit. Adjacent-tradition braids sit near the rim
  between neighbors; a cross-circle braid (the interesting kind) sits deep toward the center. ⚠️ **The
  antipodal case is genuinely ambiguous** — two traditions 12 apart have two equal midpoints. Do not
  hide this with an arbitrary tiebreak that looks meaningful; pick a deterministic rule (e.g. clockwise
  from the lower ring) and note in the hover that this braid *spans* the circle. An antipodal braid is
  remarkable — Erik's foreclosure mechanic says only a braid crosses a chosen axis (`skilltree.js:101`
  already knows this) — and its position should read as remarkable, not as arbitrarily parked.
- **A school-shaped craft** → the school **rotates the placement** toward the school's lean. The SNG-193b
  seam (`bandForSchool`, one seam, closed green) already makes the school the band-authority; this is the
  same doctrine on the display axis: **the school, not the bare tradition, is what places the craft.**
- **Weighted composition generally** — Erik's *"mostly-death craft that adopts order"* — is a
  **circular weighted mean** of the contributing ring-angles (weights from the craft's composition;
  same math family as the Tether FCG meaning-gravity layout, which I have shipped before and which
  works). Braids are the two-point case of this; schools are a rotation of it; the general form covers
  whatever composition data exists per-ability.

⚠️ **Verify what composition data abilities actually carry before choosing the weight source.** Candidates
that exist: `tradition`/`powerSystem`, `axes` (on bond-grants at least), `functions`, and for braids
`minted.from`. **Do not infer the shape from three samples** — this batch caught three wrong-premise
builds, and `gains` looked like coverage data from one sample too. Read the corpus, then pick.

- **Unaligned valley craft** → center region, honestly unaligned — not force-assigned to a fake angle.
  ⚠️ The center is also where deep cross-circle braids land; distinguish them (r-band, style) so
  "belongs nowhere" and "spans everything" never read as the same thing. They are opposites.

## §2 — Interaction: the wheel as skill-tree view

Erik: *click a tradition → highlight everything related.* The wheel doubles as the browse surface:

- **Click a tradition (rim segment/spoke):** highlight its pure crafts, its schools' crafts, every braid
  with a parent in it, and (dimmer) its `adjacent` neighbors' — the data field already exists. The
  `opposite` tradition renders as the far pole; the foreclosure line (*"only a braid crosses"*) becomes
  **visible geometry** instead of lock-text.
- **Click a braid:** light both parent spokes and the arc between — the composition, drawn.
- **Hover/tap** stays the SNG-134 `entityHover` registry — one detail source, no wheel-local fork.
- Learnable/owned/foreclosed states render exactly as today — **position changes; semantics do not.**

## §3 — Braids as an ability-list category (the quick half)

From Erik's decisions: braids also want their own **category in the ability list** — they are currently
interleaved. Small, ships with or before the wheel: a "Braids" group, each entry carrying its parents and
(post-SNG-201) first-finder attribution. This is the list view of the same fact the wheel shows spatially.

## §4 — What this is NOT

- ⛔ **Not a physics/force layout.** Deterministic positions from data. Same composition, same position,
  every load, every player. (The Tether FCG lesson: shared force-layouts made every constellation
  identical *and* unstable — meaning-gravity fixed fields fixed it. Same trap, same avoidance.)
- ⛔ **Not a new data model.** `ring`/`adjacent`/`opposite`/`distances` + per-ability composition already
  in the corpus. If a needed weight is missing on some abilities, that is a **content gap for me** (I
  author it), not a schema invention for the engine.
- ⛔ **Not a rework of wheel semantics.** Tiers, gates, learn-flow, foreclosure — untouched. This is
  *where things stand*, not *what things do*.

## GUARDS

- **One great circle.** `ring` is the only angular authority; no parallel scheme.
- **Deterministic.** No randomness, no simulation, no per-session drift.
- **The degenerate case is today's wheel** — a character with only pure crafts sees spokes, unchanged.
  Nothing regresses for a player who never braids.
- **Legible on a phone.** Erik plays on one. Cross-circle braids near the center must not stack into an
  unreadable knot at 380px — collision-nudging is fine *within* determinism (stable inputs → stable nudge).
- **Schools place; traditions anchor.** Where SNG-193b made the school the band-authority, the display
  follows the same seam — one authority, not two.

## OPEN QUESTIONS — CCODE ROUND 2

1. **Where does the wheel actually render?** My search found the wheel through result docs
   (SNG-097/124), not a named module — before ROUND 2, name the render site and whether it draws polar
   already or needs the projection added.
2. **Composition weight source** (§1 ⚠️): after reading the corpus, which field(s) carry enough signal —
   `axes`, `functions`, tradition+school, or braid parentage alone? If the honest answer is "braids and
   schools now, weighted-general later," say so and we ship the two-point case first — it is most of
   Erik's ask.
3. **Antipodal tiebreak**: your deterministic rule of choice, and does the hover get the "spans the
   circle" note?
4. **Phone legibility**: is collision-nudging needed at 380px for a deep-braid cluster, or does r-banding
   alone keep it readable?

---
*Sequencing per the handoff, unchanged: SNG-197 part 2 (rich generation — prerequisite: you place and
share the rich def, not the stub) → SNG-201 (shared recipes) → §3 list category (quick, anytime after
part 2) → this spec. The wheel lands last and lands right.*
