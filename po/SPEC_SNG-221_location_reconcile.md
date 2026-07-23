# SPEC — SNG-221: Reconcile the gen-location with its canonical file (the game must know Raven's Home)
## Aevi (PO) · 2026-07-22 · verified at origin · unblocks the just-authored the_old_warden_post

> **Erik:** the game must KNOW the location — its buildings and layout (the canonical description Aevi
> authored) AND that the protective rune wards are in place — as ONE place.

## §1 — Verified state: the buildings and the wards are on DIFFERENT ids
The place exists under THREE identities that don't resolve to each other:
- **`the_old_warden_post`** (canonical, `CONTENT.locations`, just authored 7c60e225) — carries the BUILDINGS
  & LAYOUT: the three-room interior, Pell's forge / Veth's laboratory / Cassiel's keeper's ground / Huginn's
  Rook / the Maker's hollow, quest seeds, map. The rich description Erik wanted.
- **`gen-stillwater-s-trouble`** (the SAVE's generated pool) — carries the PLAY-STATE, verified in the save:
  - `placeMemory["gen-stillwater-s-trouble"].notes`: *"Binding runes (Wither and The Raised Thing) seated in
    the post's lower face, plus a Boundary-Stone chalk mark at the crown. The post now holds Stillwater's
    Trouble in check — caught but not ended. The surrounding area is a protected refuge by Boundary-Stone
    ward."* — **the wards ARE recorded**, as structured placeMemory, keyed to the GEN id.
  - It's in `knownPlaces`, has a `parentId` (gen-ashwarden-march-road), `_promotedFromSubPlace`, `_mintedAs`.
- **"Raven's Home"** — the NAME the GM established in play for the same station.

**So the game has the WARDS on one id (`gen-…`) and the BUILDINGS on another (`the_old_warden_post`), and no
mechanism links them.** Verified: 0 gen→canonical alias/supersede/merge mechanism exists in the code;
`CONTENT.locations` and the save's `generated.location` pool are separate namespaces that never reconcile.

## §2 — The desired end-state
When Silas is at this place, the game reads ONE location that has BOTH:
- the canonical BUILDINGS/LAYOUT (from `the_old_warden_post.json`), and
- the recorded PLAY-STATE (wards active, the claim, Cassiel found at the rim, visits) currently under
  `gen-stillwater-s-trouble`.
The GM narrates from the full picture: "you are at the Old Warden Post (Raven's Home); its forge/lab/rook/
keeper's-ground/hollow are as you named them; the binding runes and the Boundary-Stone ward hold Stillwater's
Trouble in check." Buildings + wards, one place.

## §3 — The reconciliation (CCode — engine)
A **location supersede/merge**: point the gen-location at the canonical one and carry its play-state across.

### §3a — Link gen → canonical (the id bridge)
Introduce a location alias/supersede so `gen-stillwater-s-trouble` resolves to `the_old_warden_post`:
- Add a `supersededBy` / `canonicalId` field (or a save-level alias map `{genId: canonicalId}`).
- `resolveLocationId` (state.js) + the CONTENT.locations lookup honor it: a reference to the gen id (or its
  name "Stillwater's Trouble" / "Raven's Home") resolves to `the_old_warden_post`.
- This is the LOCATION analogue of the NPC alias gap flagged earlier (SNG-208 dedup): resolveByName reads
  aliases but id-resolution builds no alias index. Build the location alias index here.

### §3b — Migrate the play-state onto the canonical id
The wards/claim/visits live in `placeMemory["gen-stillwater-s-trouble"]`. Move (or overlay) them onto
`placeMemory["the_old_warden_post"]` so the canonical location carries the recorded state:
- `placeMemory` notes (the ward text, Cassiel-at-the-rim, the claim) → re-key to `the_old_warden_post`.
- `knownPlaces`: replace/dedupe the gen id with the canonical id (keep it known, under the real id).
- `currentLocationId` / `activeScene.locationId`: if they point at the gen id, repoint to canonical (ties to
  SNG-210 — and note the save is CURRENTLY stuck at `the_crossing` anyway; this migration should run wherever
  the gen id appears, not assume current position).
- Any `locationImages` / connections keyed to the gen id → re-key.

### §3c — The wards as STRUCTURED state (not just prose notes)
Right now "wards active" is a placeMemory NOTE (prose). For the GM to reliably narrate FROM it (and for any
future mechanic — a ward that could be tested, broken, refreshed), lift it to a small structured field on the
location's save-overlay:
- e.g. `placeMemory[canonicalId].wards = [{kind:"binding", runes:["wither","the_raised_thing"], face:"lower",
  status:"active", placedDay:19}, {kind:"boundary_stone", face:"crown", status:"active", effect:"protected
  refuge", placedDay:19}]` and `claimedBy:["silas", "veth", "pell", "cassiel", "huginn"]`, `reactivated:true`.
- The prose note stays (it reads well); the structured field makes the ward-state legible to the engine and
  the GM context, not just narratable from memory. This is what makes the game truly "know the wards are in
  place" rather than re-deriving it from a note each time.

## §4 — LAYER DISCIPLINE (why this is CCode's, and what's already correctly placed)
- **Buildings/layout = canonical content (origin).** DONE — `the_old_warden_post.json` at origin (Aevi's
  lane, static content). This spec does NOT re-write that; it's the durable base.
- **Wards/claim/visits = play-state (save, volatile).** Already recorded in the save's placeMemory (correct
  layer). This spec MIGRATES it to the canonical id and STRUCTURES it — engine work on save-state, CCode's
  lane. ⛔ Aevi does NOT hand-write the save (LLW — the running app owns it); the migration runs as a
  load-time reconcile / a one-time backfill in the app, exactly like prior reconcileVersion passes.
- The GM reads canonical description + save-overlay state at context-assembly — no new authoring needed once
  the ids bridge.

## §5 — Generalizes (this WILL recur)
Any time a sub-place gets auto-minted (`_promotedFromSubPlace` / `_mintedAs`) and later gets a canonical file
authored, the same gen↔canonical split appears. The alias/supersede mechanism (§3a) + the play-state
migration (§3b) should be GENERAL: a reusable "promote a gen-location to its canonical file" reconcile, not a
one-off for Stillwater. The living world mints locations constantly; canonical files will keep catching up to
them. Build the bridge once.

## GUARDS
- **Don't lose the play-state** — the wards, the claim, Cassiel-at-the-rim, the visits are REAL play history;
  the merge must carry them, not drop them for the fresh canonical file. Canonical = base description;
  save-overlay = what happened. Both survive.
- **Canonical wins on DESCRIPTION; save wins on STATE** — the layout/buildings come from the file; the
  wards/claim/who's-here come from the save. Don't let the canonical file's empty state fields blank out the
  save's recorded wards, and don't let the gen-stub's empty description win over the canonical prose (LLW for
  live STATE, canonical for DESCRIPTION — the one place they invert).
- **Run wherever the gen id appears** — currentLocationId, placeMemory, knownPlaces, connections, images,
  scene — a partial migration that repoints some but not all leaves a split-brain place.
- **One-time + idempotent** — a load-time reconcile that's safe to run repeatedly (detects "already
  reconciled" and no-ops), like prior backfills.

## OPEN QUESTIONS — CCODE ROUND 2
1. Alias field on the gen-location (`supersededBy`) vs a save-level alias map vs deleting the gen record and
   re-keying everything to canonical? (Delete-and-rekey is cleanest if nothing else holds a hard ref to the
   gen id; an alias is safer if refs are scattered. Audit the refs first.)
2. §3c structured wards — is there an existing place-state schema to extend, or is this the first structured
   per-location mutable state? If first, keep it minimal (wards[], claimedBy[], reactivated) and let it grow.
3. Does the waygate/travel destination resolution (the earlier gate-misroute) need the alias too, so
   traveling to "Stillwater's Trouble" or "Raven's Home" lands on `the_old_warden_post`? (Likely yes —
   fold the name aliases into the same index.)
4. Should this reconcile be Stillwater-specific now, or ship the general gen→canonical promoter (§5)? Erik's
   call on scope; the general one is only slightly more work and stops the next recurrence.
