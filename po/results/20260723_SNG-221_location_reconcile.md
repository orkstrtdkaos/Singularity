# SNG-221 — promote a gen-location to its canonical file (buildings + wards, one place)

**CCode · 2026-07-23 · v1.8.216 (`90168910`) · 13 tests green · clean load.** Erik's ask — *the game must KNOW Raven's Home as ONE place: its buildings (the canonical file) AND that the wards are in place (the play-state)* — is met by a **general** gen→canonical promoter, not a Stillwater one-off (§5, your recommended scope).

---

## The finding that shaped the build (verify-the-premises)

Before wiring, I checked the one thing the whole reconcile hinges on: **how does the engine know `gen-stillwater-s-trouble` IS `the_old_warden_post`?** It can't infer it — the gen name ("Stillwater's Trouble") and the canonical name ("Raven's Home (the Old Warden Post)") aren't lexically matchable, and the canonical file declared **no** structured link (only prose mentions). That mapping is authored knowledge only a human has — and you stated it authoritatively in the spec (§1/§2). So the bridge has to be a **declaration**, and the natural, general home is the canonical file saying which gen-stubs it replaces.

## The build

**§3a — the id/name bridge.** `the_old_warden_post.json` now declares `supersedes: ["gen-stillwater-s-trouble"]` and `aliases: ["Stillwater's Trouble", "Raven's Home"]`. `resolveLocationId` (state.js) honors `aliases` — so traveling to *"Stillwater's Trouble"* or *"Raven's Home"* resolves to the real place instead of minting a fresh stub (**Q3: yes**). This is the location analogue of the NPC-alias gap SNG-208 flagged — the location alias index now exists.

**§3b — migrate the play-state.** reconcile `CHARACTER_STEPS` **v19 `gen-location-promote`** scans every canonical location's `supersedes`; for each gen id present in the save it moves the play-state onto the canonical id, **everywhere it appears** (§GUARD, no split-brain): `placeMemory` (the ward notes + visits), `knownPlaces`, `currentLocationId`, `activeScene.locationId`, `locationImages`; it marks the gen pool record `supersededBy`, and records a `locationAliases` id-bridge for any lingering gen-id reference. **Canonical wins on DESCRIPTION; the SAVE wins on STATE** — the wards, the claim, the visits are carried, never blanked by the file's empty state fields.

**§3c — structure the claim.** The claim/reactivation is lifted from prose to a flag the engine + GM context can *read*: `placeMemory[canonId].claim = { reactivated: true, promotedFrom, wards: [] }`. The detailed ward text stays in `notes` (it narrates well); the `wards[]` array is the home a future ward-mechanic fills (a ward that could be tested, broken, refreshed). So the game truly *knows* the place is reactivated, not just able to narrate it from a note.

## ROUND 2 — answered

**Q1 (alias field vs save-map vs delete-and-rekey):** a canonical-file `supersedes` declaration + a save-level `locationAliases` map, **not** delete-and-rekey. Delete-and-rekey is cleanest only if nothing holds a hard ref to the gen id — but the gen record carries provenance (`_mintedAs`, `parentId`) worth keeping, so I mark it `supersededBy` rather than delete it, and the alias map catches any stray ref. The `supersedes` declaration lives on the canonical file because that's the general, discoverable home (§5) — the file that replaces a stub is where "I replace it" belongs.

**Q2 (existing place-state schema?):** this is the first structured per-location mutable state. Kept minimal — `claim: {reactivated, promotedFrom, wards[]}` — and left room to grow, exactly as you suggested.

**Q3 (waygate/travel alias):** yes — folded the name aliases into `resolveLocationId`, so the earlier gate-misroute class can't send a traveler to a fresh mint of a place that already exists canonically.

**Q4 (Stillwater-specific vs general):** **general** (§5). The living world mints locations constantly; canonical files will keep catching up. The promoter scans all canonical `supersedes` — the next authored-over-a-stub place reconciles for free, no new code.

## The one content note (your lane, flagged)

§4 reserves the canonical file's **buildings/layout** for you, and this spec doesn't touch those. It does add a **structural link field** (`supersedes`/`aliases`) — I authored it from the mapping you stated in the spec, because the reconcile is inert without it and the values are yours. If you'd word the aliases differently (or want the link to live somewhere other than the location file), say so and I'll move it; the engine reads the declaration wherever it sits.

## Verified

13 smoke tests on a synthetic save: name→canonical resolution; the migration moving placeMemory/current/scene/knownPlaces/images onto the canonical id; the gen record marked superseded + the alias recorded; the structured claim flag; the player-facing "one place again" note; **idempotence** (a gen id already aliased is skipped even if the version gate is bypassed); **general-scan safety** (a save with no superseded gen-location is untouched); the content declaration present. Full chain green — location schema still validates (96 locations; `supersedes`/`aliases` are additive), ratchets held, wiring audit clean. Live (v1.8.216): boots clean, a character load runs the v19 scan with **0 console errors** (the scenario char has no superseded gen-location, so the general scan safely no-ops).

## The honest bound

The *actual* Stillwater migration is **Erik's save on next load** — his save holds `gen-stillwater-s-trouble` with the real ward notes; the synthetic test mirrors its exact shape (visits, the "Binding runes … Boundary-Stone" note, the claim flag), so what the test proves is what his save will do. On his next load: the wards, the claim, and the visits join `the_old_warden_post` under its true name, and the GM narrates the Post's forge/lab/rook/keeper's-ground/hollow **and** the runes holding Stillwater's Trouble in check — buildings and wards, one place.

*— CCode. The place was split across the name the fiction gave it and the name the map finally learned; now the file that knows its buildings and the save that remembers its wards resolve to one id. Travel to either name lands home. The next place the world mints ahead of its map will heal the same way, for free.*
