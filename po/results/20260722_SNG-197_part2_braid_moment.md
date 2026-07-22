# SNG-197 part 2 — the braid is a MOMENT (rich generation + the 24-verb gate)

**CCode · 2026-07-22 · v1.8.182 · shipped `d917680e`, suite green.** Built against the four ROUND-2 answers I locked last session; all four held. Erik legs the live mint + the feel (LLW).

---

## §4 — THE GATE IS NOW CODE, not a comment

Part 1's `braids.js:78` said *"a hallucinated verb is rejected"* and nothing checked the vocabulary. That gap is closed.

- **`isLegalEmergent(verb, parentFunctions, vocab)`** (braids.js) — three conditions, all required: non-empty string; NEITHER parent already had it; and it is a real verb from the **24-verb `function_vocabulary.json`**. With no vocab to check against, **nothing is legal** — an unverifiable verb is rejected, not accepted-and-logged. `buildBraidDef` calls it via `opts.functionVocab`.
- Tested the **SNG-192-Phase-C way** — the vocab is read from the authored file, not hand-copied, so a drift fails the build: `bind` (real, neither parent had) is accepted; `teleport` (hallucination) is rejected and `minted.emergent` stays null; a parent's own verb is not "emergent". 8 new assertions.

## §1/§5 — floor vs ceiling, and the levelReq floor question ANSWERED

- The emergent verb becomes REAL in `functions` (union is FLOOR, the validated verb is the CEILING) — the line a player can point at that is NEW. Unchanged from part 1's doctrine; now gated.
- **Your part-1 levelReq question: CONFIRMED INERT for braids.** `rankUpAbility`, `autoAdvancePracticedRanks`, and `markDefiningMoment` all gate on `rules.leveling.rankLevelReq` — a global table, not `ab.levelReq`. The ONLY reader of `ab.levelReq` is `learnAbility`, and braids mint through `mintBraid` into `customAbilities` + a held-ability row — they **never route through `learnAbility`**. So collapsing `levelReq` to `tier` (part 1) was purely a display fix with zero progression impact. **No floor to restore.** `levelReq == tier` stays.

## The AUTHORING path — `generate.js` "braid" (§1 build order #1)

A braid mints onto the character (braids.js), not into the generated store — so it gets its own pure pair rather than routing through `generate()`/GEN_TYPES:

- **`buildBraidPrompt(components, sources, opts)`** — names ONLY the verbs the parents lack as the emergent options; reaches explicitly for an ULTIMATE-CREATION name in the tradition idiom (your *"Perfect Inevitability"* bar is in the prompt), with `A × B` as the failure fallback, never the shipped result.
- **`validateBraidAuthored(raw, opts)`** — clamps name/description/notFor/tree; gates the emergent verb through the SAME `isLegalEmergent` (one impl, no second to drift — the SNG-185 lesson); a dropped hallucination is **recorded in `_rejected`** so the caller logs the miss (SNG-179's record-the-miss shape).

## IN PLAY — the MOMENT, the rename, the re-present (§2 + §3)

- **In-play mint** (`maybeMintBraids`, after the turn's `recordUse`): a co-activation that ripens now authors + mints a braid and fires **its own modal** — parents named → "braided together into" → the new name (26px, accent) → the one thing it can now do. Not a list refresh; its own `.braid-moment` celebration surface with a rise animation. A modest woven line also lands in the narration; the modal is the beat.
- **GM-authored name by default, player-overridable** (§2): `namedBy: "gm"` on a good mint; the rename control lives **on the moment AND on the braid's skill-wheel node** (`showBraidRename`) — reachable from wherever the braid is shown. A player name is never overwritten by a later enrichment pass.
- **Re-present backfilled stubs** (ROUND-2 answer 4): on load, Silas's two stubs (`minted.enriched === false`) are enriched in place and **get the moment they never got** — one per load, best-effort, non-blocking (mirrors `enrichPersonalArc`). Not a silent upgrade.
- **Never a halted mint**: every path is `try`-wrapped — on ANY authoring failure the stub still mints and the moment still fires (SNG-196's stub-is-playable discipline). A rejected verb, a dead API, a bad reply — the braid still lands playable.

## Verified

- **Suite green** (smoke incl. 8 new SNG-197 assertions against the real vocab; wiring audit `testOnlyExports` back to baseline 7 — the authoring functions now fire in play, not just in tests, which is exactly what the ratchet was guarding; ENGINE_MAP 60/60; parse/content_ci/balance/skill_battle all green).
- **App boots clean on a fresh port** (8105, no console errors) — every new import resolves; a missing export would have hit the CCODE-08 watchdog.
- **The moment modal renders** — injected the exact markup live: 451px accent-bordered card, 26px accent name, the emergent-capability box accent-tinted, centered, `color-mix` resolving in both themes. Screenshots are environment-broken this session (renderer timeout), so the visual proof is computed-style reads.
- **What's Erik's (LLW):** a live co-activation crossing the threshold → the real authored name/description/emergent verb → does it read *HOLY SHIT that's COOL*; the rename from both homes; Silas's two backfilled braids getting their moment on next load. The mint needs an API key so I can't trigger it headless — that's the browser-leg.

## spec_boundaries / flags

- **Greened a red tree I inherited.** Your SNG-204 content ship (`17c9c150`) changed arc `stages` from strings to objects carrying `pressureOnAdvance`, but `arc.schema.json` still declared string items — so all 5 greater-arcs failed validation and `origin/main` was **already red** when I rebased onto it. I updated the schema to accept the object shape `{ stage, name, publicFace, pressureOnAdvance }` (read from your authored data; string still accepted for generated threads) — commit `ce047c4e`. That is the engine/contract half of SNG-204's stage shape; **the wake reader that consumes `pressureOnAdvance` is still yours-to-spec / mine-to-build under SNG-204** — I did not touch it.
- **Process note to self:** I pushed the braid commit before running the post-rebase suite and only then caught the inherited red. Fixed within the session; the lesson is run-after-rebase-before-push.
- Build order: rich generation (#1) is done. Still ahead per your sequencing: **SNG-201 shared recipes** (fully ratified, GO), **braids as an ability-list category** (quick), **SNG-202 wheel-by-coordinate**.
- No new engine module (extended braids.js + generate.js), so SYSTEM_SPEC counts stay 60/32.

*— CCode. The gate is real, the moment has its beat, and a hallucinated verb never reaches the wheel. Only-Aevi-closes; Erik's browser-leg is the proof.*
