# SNG-208 wiring — the 62 tradition-epics, integrated and pursuable

**CCode · 2026-07-22 · v1.8.204 (`0da27f16`) · full suite green · live-verified (`legendsInNpcs=68`).** Erik's directive: *"a lot of new epic legends are ready — make sure their wants and actions get plugged into the world everywhere: quests, teachers, etc."* The 62 staged epics are now loaded content and wired into every legend surface, and legends are things the player can *pursue*, not just ambient weather.

---

## Integrate: staged → loaded

Your `po/staged_content/tradition_epics.json` — **62 epics, 2–3 per tradition, all 24 covered**, each with `tradition` / `wants` / `arcAffinity` / `rivals` / `deathRoad` / `offscreenVerbs` / `archetype` — is now `content/packs/valley/tradition_epics.json` (valley root, direct-fetched like `prologue.json`, so no strict-lore/manifest/lore-prose entanglement). `state.js` merges it with the SNG-042 anchors into **one legends roster**, deduped by id (the comprehensive epics win the 3 exact overlaps — cinder_vael, the_hollow_king, the_last_walker). Live: **`legendsInNpcs=68`** (9 + 62 − 3), all folded into `CONTENT.npcs`, resolvable by id.

**I validated the content before wiring** (the habit that keeps catching things): every one of the 62 `arcAffinity.arcId` values resolves to a real greater arc, and every `tradition` to a real ring tradition. So the moment they load, they **plug into the entire SNG-208 living-world stack for free** — offscreen actions, arc-lean, rival clashes, the death gate — because that machinery reads the roster. The world just got 62 great figures leaning on its arcs and warring with each other offstage, with zero new offscreen code.

## Make them pursuable: teachers + wants-as-quests

SNG-208 made legends *act*; this makes them *reachable*. `legends.legendsForGM` surfaces the great figures the character has a **reason** to reach:

- **Legendary teachers** — a legend whose `tradition` the character **practices** is the deep-teacher of that craft. Practice ashwarden and Neth (the very figure the SNG-203 tradition arc's Finding beat is about) surfaces as an arc to seek: *"seeking them is the deep-teacher arc; the pursuit is the quest, never a menu."* And because you authored a hero *and* a villain per craft (Neth the saint, Morvane the reaper), the player's own tradition isn't a monolith — they choose which master.
- **Great figures near you** — a legend whose `homeLocation` is the character's current place is a present force whose `want` is *"a quest waiting — aid or oppose it."*

Dead legends (§3b) are excluded; each group is capped so it's an offer, not a dump; it returns null when there's no reason to surface anyone. Registered in `gm_registry`, consumed by `gm.js`, so the GM now weaves legend-teacher arcs and legend-want quests into play, offered when the fiction reaches for them.

## Verified

8 smoke tests (teacher-on-practiced-tradition, not-on-unpracticed, force-at-home, dead-excluded, null-no-dump, the 62 loaded, the state.js merge, the GM consume). Full `npm test` green; ratchets held (`smartClamp` on the authored signature/want prose — the `rawProseCaps` ratchet caught my first-pass `.slice`, fixed before commit). Live-verified: 68 legends loaded, 0 console errors, 0 mojibake.

## One thing for you (content curation, your lane)

A few figures now exist under two ids across the two source files: **Kesh** (`kesh_ardent` + `the_edge_that_holds`), **Iselde** (`iselde_wend` + `iselde_the_wanderer`), and **Neth** (`neth_the_stayed` in the epics vs the SNG-203 ashwarden arc's `ashwarden_teacher_neth`). I loaded both of each (safe, additive — no dropped references), because merging personas is a content judgment, not an engine one. When you get a moment: dedup the doubles, and decide whether the epics' Neth *is* the tradition-arc's teacher (they clearly should be one figure — her epic signature literally says "the deep teacher of the ashwarden craft"). Unifying that id would make the SNG-203 Finding beat and the SNG-208 pursuable-teacher surface point at the same person.

*— CCode. The valley is crowded with the great now — 62 of them, one or two for every craft, leaning on the arcs and at war with their rivals from offstage. And a player who practices a craft can go looking for its master, and find that there are two, and choose. Their wants are quests; their traditions are teachers; their fights are the world moving. Only-Aevi-closes.*
