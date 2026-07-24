# CCODE-15 — transit-stub map cleanup (render-fix + Center fold + reparent lever + coin-prevention)

**CCode · 2026-07-23 · v1.8.229→231 · suite + wiring-audit green · clean fresh-port boot.**
`status: complete_pending_review`

CCode-initiated from Erik's live report ("the map still needs fixing for the crossing/ent grove and the
pale march/ashwarden locations"). Not from a pre-existing spec — I coined the ticket id. **Label note:**
first commits said "SNG-224", but that id is already Aevi's `SPEC_SNG-224_roll_transparency.md`; corrected to
**CCODE-15** in `75d483d3` (code/tests). Commit `c321f787`'s message still reads SNG-224 (pushed history) —
this doc is the authoritative id.

---

## Diagnosis (traced, agent-verified against Silas's save)

Silas's valley map showed junk. Root: **transit-mint** — when the GM narrates travel to a place the map
doesn't have, `mintTransitLocation` coins a flat `region:valley` stub (*"a place the road led to… before the
map knew its name"*). His save had six: `the-low-lamp-inn`, `gen-waygate`, `gen-center`, `gen-the-ent-grove`,
`gen-ashwarden-march-road`, `gen-stillwater-s-trouble`. Three problems, three fixes:

1. **A render bug** — a *promoted* stub kept drawing as a duplicate node. SNG-221 stamps `supersededBy` + a
   `locationAliases` bridge on promotion, but the render path (`regionTierNodes`) filtered only by `regionId`
   and never read them. So "Stillwater's Trouble" drew right beside "Raven's Home." (Agent confirmed: both in
   `CONTENT.locations`, both survive the region filter, no exclusion anywhere.)
2. **A real duplicate** — "Center" is the canonical **The Crossing** (original id `the_center`, the waygate
   hub Silas visited 62×), coined under a new name.
3. **A mis-structured stub** — "The Ent Grove" should be a **sub-location of the crossroads**, not a top-level
   node (Erik).

"The Crossing" itself is **not** broken — SNG-180 authored it at `(0,0)`, the world pole, on purpose.

## What shipped

**v1.8.229 — render-fix (the actual bug):** `regionTierNodes` now drops any location carrying
`supersededBy`, or whose id is a key in `character.locationAliases`. Record stays in `CONTENT.locations`
(lingering id refs still resolve) — this hides the duplicate node, doesn't delete data. **Every SNG-221
promotion now collapses to one map node.** → "Stillwater's Trouble" gone on reload.

**v1.8.230 — Center → The Crossing:** Erik-confirmed identity. `the_crossing.json` declares
`supersedes:["gen-center"]` + `aliases:["Center"]`. Proven end-to-end against real content: reconcile
migrates gen-center's visits/notes onto The Crossing, re-keys knownPlaces, and the render-fix drops the stub.

**v1.8.231 — CCODE-15 (reparent lever + coin-prevention):**
- **Map nesting** (`regionTierNodes`): a sub-location (parentId → another node shown in this region) nests at
  the interior tier instead of drawing as a top-level peer. 0 canonical valley locs have an in-region parent,
  so this only nests gen sub-places. *This is what makes the lever do something.*
- **`reparentLocation` god-mode op** (`authormode.js`) + a dev-gated "Geography — reparent" row in the Author
  panel: Erik nests a stray gen-stub under its true parent (or un-nests). Canonical places refused (fixed
  geography); no self-parent. → Erik can nest his **Ent Grove under the crossroads** in his live game.
- **Coin-prevention** (the root cause): the `moveTo` directive + travel directive now tell the GM **USE THE
  EXISTING NAME** — when the destination already exists (reachable, or recorded), emit `moveTo` with its
  established name/id; never coin a synonym ("Center" for "The Crossing"), which mints a duplicate. Invent a
  name only for a genuinely new place. `mintTransitLocation` logs every coin (`[transit-mint]`) so the
  coin-rate is measurable.

## Erik's confirmed identities (the world-authorship calls, his lane)
- **Center = The Crossing** → folded.
- **The Ent Grove = a sub-location of the crossroads** → keep, reparent under Waygate (his lever).
- **Ashwarden March Road** = a real road to the Waygate, waypost forking to Raven's Home / left / on to
  Cairnhold → keep.
- **Waygate, The Low Lamp Inn** = real emergent places → keep.

## Honest bounds
- Render-fix, Center fold, the reparent op + guards, and map nesting are **Tier-1** (Node + end-to-end sim +
  clean boot).
- Coin-prevention is **prompt-side → Tier-3 live confirm** (the GM using canonical names next play).
- The Geography reparent row's *live render* needs a gen-location save (Silas's) — I can't reach his
  localStorage from here; logic + panel HTML are unit-proven. On his next reload: Stillwater's Trouble and
  Center are gone; he reparents the Ent Grove from the Author panel.

*— CCode. The map bug was real and it was mine (SNG-221 promoted the place but the renderer never read the
"promoted" flag). Center was a confirmed duplicate; the rest are Erik's real world. And the reason it keeps
happening — the GM coining synonyms for places that already exist — now has a directive against it and a log
to measure whether the directive holds.*
