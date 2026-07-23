# SNG-222 — a minted DISCOVERY earns the moment (Marrow's Wings, with its image)

**CCode · 2026-07-23 · v1.8.223 (`d6349313`) · 7 tests green · verified end-to-end.** Erik discovered Marrow's Wings and wanted the celebration — *"that's when I'd love to see the celebration popup happen."* Discoveries now get the exact ceremony braids get, plus the image, plus a retroactive fire for the one that already exists.

---

## What shipped

**The ceremony, generalized.** `showBraidMoment` now serves discoveries on a `kind`. A discovery reads **"✦ A TECHNIQUE DISCOVERED ✦"**, *"found in the doing — a thing neither could do apart"*, its **parent crafts** (mapped from the discovery's `abilities`), its name, its description, and the **rename** affordance (`renameDiscovery`, parallel to `renameBraid`). One template, one queue, one modal — braids and discoveries share it (no parallel celebration, per your GUARD).

**Queued the same way.** `queueDiscoveryMoment` pushes a minted discovery onto the existing `pendingBraidMoments`; the mint site (in-turn) queues it and flushes, chaining behind any braid moment — one at a time, never stacks (the existing `_braidMomentOpen` rule covers a turn that mints both).

**§5 — the image.** The discovery generates and caches an image through the **same `ensureImage` pipeline** — the GM's authored prose *is* the prompt (`"Marrow's Wings — death-shadow wings capable of open-air flight…"`), shown in the modal with a lightbox and dropped in the gallery. Generate-once (cached on `discovery.image`), rating-lens + minor-safe for free.

**Backfill.** A discovery minted before the moment existed — **Erik's Marrow's Wings** — or any discovery without `_momentShown`, gets its moment on load (one per load, deferred after the play screen settles, idempotent). So Erik sees it **retroactively**.

## ROUND 2 — answered

**Q1 (shared `pendingMoments` now vs add to `pendingBraidMoments`):** added discoveries to `pendingBraidMoments` — the smaller move, and it sets up §4's general queue without a refactor. The queue already chains and never-stacks; a discovery just joins it.

**Q2 (one template vs two renders):** one template with a `kind` label. Cleaner, and it's the §4 endpoint (the modal is now `showMoment`-shaped in all but name).

**Q3 (backfill scope):** general — *any* discovery without `_momentShown`, not just Marrow's Wings. Safer if other saves hold silent discoveries.

## One premise correction (verify-before-build)

§5 said *"the moment modal ALREADY renders art — `ensureImage(moment, "moment")` (app.js:3263)."* Checked it: that call is the **scene moment art** (when the GM flags a beat with `imagePrompt`) — a *different* path. The braid-ceremony modal (`showBraidMoment`) did **not** render an image. So §5's image was a small **addition** to the modal, not a wiring of something already there — done, using the same `ensureImage` pipeline you named, just called from the moment modal now.

## Verified — end to end, not just source

7 smoke checks (the modal's discovery copy, the mint-site queue, the ensureImage image path, the `_momentShown` idempotence guard, the general backfill, the rename, the styled art). Suite green, ratchets held (the image prompt uses `smartClamp`, not a raw slice — caught by the `rawProseCaps` gate and fixed before commit). **Live** (fresh port, v1.8.223): injected a discovery into a save, reloaded → the moment **fired via the backfill path** with the kicker "A TECHNIQUE DISCOVERED", the name "Marrow's Wings", the parents "Sonic Resonance and Prism Sight", the rename affordance, and — the payoff — **a generated image of the death-shadow wings** rendered in the modal. 0 console errors. What the test does is exactly what Erik's save will do on his next load.

## §4 — flagged for you (Aevi's lane)

The engine half — discoveries lead the "fires" list, sharing the braid moment — is done. Updating `po/discussions/generalize_the_moment.md` to reflect that (discoveries at the top of the FIRES list, the general `pendingMoments`/`showMoment` endpoint) is your planning-doc call; I didn't touch the discussion space. The relationship/teacher/quest/arc cases fold into the same queue as those systems get their threshold hooks (the §4 endpoint the `kind` field already sets up).

*— CCode. The most braid-shaped event in the game was minting silently; now it gets the beat it was the archetype for — the two crafts named, the wings rendered, the name yours to keep. And the one Erik already earned fires the moment it never got, the next time he loads.*
