# SNG-216 — a boolean `_gen` can never crash a turn again (reader-harden + the writer + save self-heal)

**CCode · 2026-07-23 · v1.8.209 (`a6b94dc4`) · full suite green (13 new tests) · clean boot.** Your diagnosis was exact — the presence guard checked truthiness, not shape, so `_gen: true` sailed past `if (!g) return` and the first *write* threw `Cannot create property 'engagementScore' on boolean 'true'` mid-`applyTurn`, aborting the location commit. Both halves are closed, plus the two sibling write-sites Q3 asked me to sweep for.

---

## §3a — the urgent half: no reader can throw on a malformed `_gen` (ships the un-break)

Every `_gen` reader in `generate.js` now guards TYPE, not just presence — a boolean (or any non-object) `_gen` is treated as **unmanaged**, never a write target:

- **`recordAttention`** (the exact throw): `if (!g || typeof g !== "object") return entity;` — the malformed record is a no-op, the turn's bookkeeping completes, the location commits, no salvage message.
- **`recomputeTier`**: `if (!g || typeof g !== "object") return "fresh";` — the second write-site (`g.tier = …`) can never be reached on a boolean.
- **`effectiveWeight`**: `const g = (entity?._gen && typeof entity._gen === "object") ? entity._gen : {};` — an unmanaged record weighs its birth-default, doesn't throw.
- **`isDormant`**: unmanaged is never dormant (returns false).
- **`isSurfaceable`**: unmanaged always surfaces (returns true) — a generated place with a malformed `_gen` still shows up in the world.

**This alone un-breaks travel** — the spec's "ship 3a first if splitting" is honored (it went first in the same commit).

## §3b — the writer + the data: it stops recurring

**The writer — found and fixed.** `mintTransitLocation` (`app.js:4584`) is the single source. It's the fallback for **every** narrated-travel destination — `app.js:4576` is literally `resolveLocationId(p.ref, …) || mintTransitLocation(p.ref)`, so any named place the GM walks you to that isn't already a real location is born here. It hand-wrote **`_gen: true`** as a "yes-this-is-generated" flag instead of calling `stampGenerated`. That's why *all five* of Silas's gen-locations carried the boolean — waygate, center, ent-grove, march-road, Stillwater's Trouble were all minted through this one path (`_mintedAs: "transit"` is just its provenance tag; it is not transit-only). It now emits the full tracking object (`stampGenerated`'s shape: `type/tier/engagementScore/birthWeight/rating/attentionHistory/createdDay/provenance`).

**The data — a reconcile backfill for existing saves.** `CHARACTER_STEPS` **v17 `gen-tracking-object`** walks every generated record (`npc`/`location`/`arc`) and, where `_gen` is not a proper object, replaces it with a fresh default tracking object — so those inert places re-enter the attention/tier system instead of silently never promoting. **Idempotent**: a real tracking object is left exactly as-is (an earned `established` tier + score survive untouched); only the malformed ones are healed. Silent (no player-facing note — pure hygiene; it logs a count for observability). The idempotence gate advances to 17.

## ROUND 2 — answered

**Q1 — where does `_gen` become `true`?** Not a serialize/merge flatten. A single **live writer bug**: `mintTransitLocation` (`app.js:4584`) authored `_gen: true` as a boolean flag. Confirmed exhaustively — `git grep -E "_gen\s*[:=]"` across `app.js` + `engine/*.js` returns exactly three writers now (the fixed minter, `stampGenerated`, the backfill), all emitting objects; and **zero** boolean coercions (`!!_gen` / `Boolean(_gen)`) anywhere. So nothing collapses a good object to `true` on save/load — the object shape is durable once written correctly.

**Q2 — is it a migration artifact (an old boolean-`_gen` save shape)?** No. `stampGenerated` has always produced an object; travel destinations simply never went through it — they went through the minter, which always wrote a boolean regardless of version. So the backfill is a **data-heal**, not a version-shape migration: it upgrades minter-produced booleans to the contract shape `stampGenerated` established. Built exactly as the spec's §3b sketch.

**Q3 — any other reader that assumes object shape and could throw?** Reads off a boolean **don't** throw (JS auto-boxes the primitive — `true.tier` is `undefined`, not an error); only **writes** throw. I enumerated every `_gen.<field>` access in the engine. The two crash-reachable write-sites were `recordAttention` and `recomputeTier` (both fixed above). Two more **write** sites share the same presence-not-type pattern — `worldtick.js:430` (`target._gen.promotedWorldDay = …`) and `worldtick.js:686` (`genRec._gen.offscreen = …`). Neither is crash-reachable *today* (both are gated behind a `tier === established/nominated` check a boolean `_gen` can't satisfy), but per your "one malformed field shouldn't throw from multiple sites" I hardened both to `typeof _gen === "object"` anyway. After this ship, no boolean `_gen` exists anywhere — the minter stops making them and the backfill heals the old ones — so these are belt-and-suspenders on a pattern that's now closed at the source.

## Why this also closes the SNG-210 re-explanation

The throw happened *during* `applyTurn`, so every op after `recordAttention` — **including the moveTo/location commit** — never ran; `currentLocationId` stayed `the_crossing`. With the reader hardened, the arrival commits cleanly. Erik's stuck save: a second travel now commits (or `reanchorLocation` to the true place, per SNG-207). ⚠️ Not hand-edited — the fix is on the live path, as the spec required.

## Verified

13 smoke tests: the **exact crash repro** (`recordAttention({_gen:true})`) proven no-throw; `recomputeTier`/`isDormant`/`isSurfaceable`/`effectiveWeight` all safe on a boolean; the writer emits an object (source-asserted, and the old `_gen: true` form asserted *absent*); the backfill upgrades a boolean → object and the healed entity **re-participates** (engagementScore moves again); idempotence (a real `established`/score-5 object survives beside a healed one); the v17 gate; both worldtick write-guards. Full `npm test` green — ratchets held (`rawProseCaps` 63, `testOnlyExports` 7, `importedNeverCalled` 5, `modulesMissingFromSpecMap` 15, all unchanged), wiring audit clean, ENGINE_MAP ok (64 modules — no new module, this is a harden + a reconcile step on existing modules). Clean boot at v1.8.209 on a fresh port (8106): 0 console errors, header reads "The Valley of Echoes — v1.8.209", 0 mojibake.

## The acceptance criterion, honestly

§2's outcome is *"travel to a generated place completes its bookkeeping and commits"*. The **engine half is exhaustively green** — the throw is unit-reproduced and proven gone, the writer no longer manufactures the bad shape, and old saves self-heal on load with the fix proven to restore attention-tracking. The **live confirm** (Erik walks to a gen-location and sees no salvage line + the header commits) is a Tier-3 API turn I can't drive in a preview — but the crash is now impossible by construction: no reader can write onto a boolean, no writer makes one, and none survive in existing saves after one load.

*— CCode. The guard checked truth where it needed shape; now it checks shape. The one writer that lied about `_gen` tells the truth, the saves that believed it are healed on load, and the two sibling writes that could have inherited the same lie are closed too. Travel commits. Only-Aevi-closes.*
