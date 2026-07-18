# SNG-154 — stages 2–4 SHIPPED, plus ROUND 2 answers

| | |
|---|---|
| **Task** | `po/SPEC_SNG-154_spatial_hierarchy.md` — stages 2 (parentId), 3 (containment validation), 4 (reconcile) |
| **Author** | CCode · 2026-07-18 · v1.8.116 |
| **Status** | `complete_pending_review` — Aevi closes, on the reproduced symptom |
| **Not built** | Stages 5–7 (relative positioning, the three viewports, routes). Deliberate — see §3. |

---

## §1 · ROUND 2 answers (§5 of the spec)

**Q1 — Is `{parentId, bearing, distance}` viable, or does render need cached absolutes?**
**Cached absolutes, and you already have the cache.** `autoMapPositions` (`worldmap.js:20`) resolves every location to an `{x,y}` once per render into a plain map, and `coordForGenerated` stamps a stable coord at mint. Resolving a parent chain per place per frame is not the problem — the render is not the hot path — but *storing* only offsets would mean a mis-set parent silently moves a whole subtree, and there is no way to hand-correct a place. **Recommended shape: `parentId` is the TRUTH, `map:{x,y}` is a DERIVED CACHE.** That is what stage 2 ships: parent anchors the fallback chain, absolute coords stay stored. Stage 5 can then compute offsets from the same parent link without a data migration.

**Q2 — What promotes an interior to a location today?** Two paths, and the spec assumed the wrong one:
- `mintTransitLocation` (`app.js`) — a `moveTo` naming an unresolvable place; mints `gen-<slug>`.
- **`generateRequest` type=location → `generate.js`** — mints a clean id. **This is the one that took the Low Lamp Inn** (its record carries no `_mintedAs` and its id is `the-low-lamp-inn`, not `gen-…`).
Neither carried a parent. Both do now.

**Q3 — What unit is `distance`, and does `worldtime` imply a scale?** No world scale exists to anchor to. `worldtime`'s ratio converts *real* time to *world* time; it says nothing about ground covered, and `ADVANCE.travel` is a flat per-hop cost regardless of geography. `map:{x,y}` is an 800×440 render canvas. **So the unit has to be authored, not derived** — pick a canvas-units-per-hour rate and calibrate it against the existing 92 locations' spacing. Cheapest honest option for stage 5: define distance in **hours of travel** directly (the quantity the game already spends) and let the map scale to it, rather than inventing leagues and converting.

**Q4 — Are the 92 authored `map:{x,y}` meaningful geography or layout hints?** **Layout hints, but load-bearing ones.** They are hand-placed for a readable 800×440 graph, not to scale — `content_ci` checks connectivity, never distance. But region territories are drawn from them (`regionShape`/`convexHull`), so discarding them redraws the world map. **Keep them; treat them as the derived cache in Q1.** Deriving offsets FROM them at stage 5 preserves the current look for free.

**Q5 — The 12-sub-place cap.** It was doing real work (unbounded interiors would bloat the save exactly as unbounded scene history did in SNG-157) — but it was **too low and silently lossy**: past 12, new distinct places were *dropped with no signal*, and Millbrook was already at 12. Worse, the truncation bug was *hiding* collisions behind shared slugs, so the cap bit sooner than it appeared to. **Raised to 24 and named (`CAPS.subPlaces`)**, not removed. A real interior tier nests, so this will want revisiting at stage 6.

**Q6 — Sequencing.** **Agreed, with one amendment.** 152 → 154 stage 2 was right, and doing 152 first mattered: the repair merges twins by comparing *names*, which only works because SNG-152 stopped severing them. **Amendment: stage 4 (reconcile) should run with stage 2, not after stage 3.** Erik's save was already scrambled, so shipping the write-path fix without the repair leaves the reported bug on screen. All three shipped together here.

---

## §2 · What shipped

**Stage 2 — `parentId`.** Every sub-place stores the place it is inside. `findSubPlaceParent` recovers what a name was a sub-place of, and **both** promotion paths use it, so a place promoted out of an interior remembers its container. `autoMapPositions` now anchors on `parentId` **before** `connections` — containment is a stronger claim about where a place *is*. **That is the direct fix for the reported map bug:** the Inn had no parent, no positioned neighbour, and fell through to the deterministic hash grid — which is why it rendered across the map. It was never a layout bug; it was never given a place to be.

**Stage 3 — containment on write.** `placeUpdates.subPlace` gains a `parent` field, contracted in gm.js with the explicit instruction that a room in a building the scene walked into belongs to *that building*. A named parent that resolves elsewhere **wins over the current location** (a missed `moveTo` is the likelier error) and is surfaced in `_containmentNotes` rather than silently trusted. A named-but-unknown parent is kept as `parentUnresolved` instead of dropped.

**Stage 4 — repair.** New reconcile step `place-containment` (v6), idempotent, additive, **nothing deleted**: stamps `parentId` on every sub-place; relinks promoted locations to the parent they were a sub-place of; collapses truncation twins under one parent (prefix-of match, keeping the fuller name and unioning notes).

**Measured on Erik's live save:** 27 → 23 sub-places (4 twins merged: Upper Meadow, Pell's Forge, Cooperage — East Lane, plus one more), and **`the-low-lamp-inn` regained `parentId: radiant_plateau_edge`.** Re-run yields `{}`.

---

## §3 · Not built, and why

Stages 5–7 (relative positioning, three viewports, routes) are **not** in this ship. Stage 2 alone retires both reported bugs, and Q1's answer changes stage 5's shape (offsets derived from the existing coords rather than replacing them) — that is worth a spec amendment before building. Routes also depend on the distance unit being decided (Q3), which is a design call, not a build one.

**Flag for the PO:** `back-corner-booth` is still filed under `old_switchback` on Erik's save. The write path can't fix that retroactively — nothing in the stored data says it belongs to the Inn; only Erik knows. The SNG-160 ⇊ merge control handles the *people* version of this; the places version wants the same treatment, and I'd suggest folding it into stage 6 rather than inventing a second one-off.

**Also flagged:** the Inn's `regionId` is `valley` while its parent sits in a different region — promotion took the region from the character's location, not the container. Stage 5 should derive region from `parentId`.

---

*— CCode. Stages 2–4 measured against Erik's real save; stages 5–7 deferred with reasons. Only Aevi closes.*
