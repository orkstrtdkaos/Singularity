# SNG-243 §3 — The Made Gate's destinations are real, travelable connections

**CCode · 2026-07-27 · v1.8.288 (`98138d3f`) · npm test exit 0 (both seams green, SNG-235 create_waygate still passes, rawProseCaps 63).**

Erik: *"where does my made gate go?"* — the quest authored a network-shaped `waygate` effect, but the engine
never consumed it, so the gate reached only the Crossing and the GM improvised the rest.

## The gap
The `finished` outcome of The Second Thread carries TWO gate effects: the SNG-235 `create_waygate` (→ the_crossing)
**and** a richer `waygate` effect (`connects[]`: the_crossing by default + Stillwater's Trouble by intent,
`networkCapable: true`). `applyQuestEffects` had a `case "create_waygate"` but **no `case "waygate"`** — so the
richer effect fell to `default` and was **dropped** (logged UNHANDLED). The gate's intent destination + network
flag never reached the minted node.

## What I built
- **`engine/quests.js` — `case "waygate"`:** consumes the effect via the same `ctx.createWaygate` injection the
  create_waygate case uses (the module stays transport-free). Passes `{gateId, name, at, connects, networkCapable}`.
- **`app.js` — `mintWaygate` extended + made augmenting:** now accepts both the legacy `{id, connectsTo[]}` and the
  richer `{gateId, connects[]:{to,kind,default,requires}, at, networkCapable}`. Because `create_waygate` runs
  **first** (mints the node) and `waygate` runs **second**, mintWaygate now **augments** an existing node instead
  of early-returning — merging the resolved connections, setting `networkCapable`, and storing `waygateConnections`
  (the resolved default/intent set) + `waygateDefaultTo`. Each `connects[].to` is resolved via `resolveLocationId`;
  an unresolvable target is **dropped with a warning** (SNG-232) rather than minted as a broken edge. Bidirectional
  reach is linked to every resolved target.
- **`content/packs/valley/locations/the_old_warden_post.json` — alias `"stillwaters_trouble_site"`:** the quest's
  authored intent target didn't resolve to any location. The real Pale March site of Stillwater's Trouble **is**
  the Old Warden Post (canon-confirmed by its own descriptionSeed — "the Maker's hollow that gives Stillwater's
  Trouble its name" — and its `supersedes: ["gen-stillwater-s-trouble"]`). Adding the id as an alias makes the
  authored connection resolve natively through `resolveLocationId`.
- **`tests/seams.json`:** `quest-effect-types-handled` now requires `case "waygate"`; new SNG-232 seam
  `waygate-connection-resolves` (a made gate's connect target must resolve or the edge is dropped, not minted broken).

## The continuity gap closed
The GM's travel view reads a location's `connections`. The Made Gate now carries `[the_crossing,
the_old_warden_post]`, so **"where does it go?" has ONE committed answer** — the Crossing by default, Stillwater
by intent — instead of a fresh improvisation each ask. Erik's remembered mechanic ("Crossing by default, another
by intent") is now real data, not GM invention.

## Live verification (fresh port 8362, real effects resolved through the SNG-244 decision strip)
Injected the real `finished` outcome (both gate effects) as a decision-ready quest, tapped "Finish it" in the
decision strip → the full resolve pipeline ran → the Made Gate (`gen-the-made-gate`) minted with:
- `connections: ["the_crossing", "the_old_warden_post"]` — the intent target resolved via the new alias.
- `waygateDefaultTo: "the_crossing"`; `waygateConnections`: the_crossing (default, long_passage) +
  the_old_warden_post (intent, direct_fold).
- `networkCapable: true`, `waygate: true`, tier 2, and **discovered** (`knownPlaces` includes it).
- Quest → `resolved`, no error.
(Also incidentally re-proved the SNG-244 decision strip end-to-end: strip → `resolveQuestOutcome` → resolve → mint.)

## Notes / owed
- **AEVI (optional tidy):** the quest's `connects[].to` still literally reads `stillwaters_trouble_site`; it now
  resolves via the alias I added, but pointing it at `the_old_warden_post` directly would be cleaner. The alias is
  a durable compatibility bridge either way. `at: "the_left_branch_approach"` still has no location file — the gate
  stands as its own node (informational warning, not an error). If you want the gate physically anchored at the
  approach, author that location.
- **§4 (next):** the gate is `networkCapable` and carries `waygateConnections`/`waygateDefaultTo`; the general
  gate-to-gate network (default-vs-intent step-through, hub-and-spoke reachability, a hop cost) is the follow-on build.

*— CCode. The made gate is now a real node with a committed default and an intent fold — the GM stops guessing.
status: complete_pending_review.*
