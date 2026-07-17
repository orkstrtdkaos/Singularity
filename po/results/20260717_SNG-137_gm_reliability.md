# Results — GM reliability: mastery mark + error-fixing + item evolution (SNG-137)

Date: 2026-07-17 · HEAD `f701a46` · **v1.8.96** · full suite green · browser-verified (served bytes). Status: **shipped, complete_pending_review.**

**Diagnosis held:** the machinery was correct + wired — the gap was the GM narrating the right thing while intermittently forgetting to emit the structured op, plus missing *coverage* (no item-update op existed at all). So this ship is mostly **prompt-contract tightening + widened repair vocab + a new item-evolution op**, not new machinery. Mechanics unchanged: mastery is still a defining beat; every repair is still **repair-not-wish**.

## P1 — the mastery mark fires (answers "2 skills won't promote")
Those skills are *waiting for a defining beat*, by design — not stuck. Two prompt changes make the GM actually emit the op when the beat lands:
- **Rule 19B is now imperative** — "⛔ When a craft LISTED in RIPE FOR MASTERY is used in a clearly decisive, scene-carrying way this beat, you **MUST** emit `markDefiningMoment`… a described mastery with no op leaves the rank unearned and the player waiting." Anti-inflation still holds (the beat must be genuinely decisive; routine use is not a defining moment).
- **The RIPE FOR MASTERY block names the ripe crafts inline** (`${masteryDetail}`) with the same MUST — so the GM sees *which* owned rank-2 crafts are ready right now and is told to mark one if this beat expresses it.

## P2 — error-fixing is reliable + covers the real errors
- **(a) reliability — "acknowledge means emit, same turn":** appended to the stateOps rule — "If your prose admits the game got something wrong, you MUST emit the matching stateOp in THIS SAME reply. An apology with no op … is the WORST outcome." This closes the big gap (GM apologizes, forgets the fix).
- **(b) coverage — widened repair vocab** in `corrections.js` (all repair-not-wish):
  - `correctAbilityRank` — only **LOWERS** a wrongly-high rank; a raise is refused.
  - `correctBond` — sets a wrong relationship right (bondType/bondStage/relationship); **a romantic bond on a minor is absolutely refused**.
  - `correctVital` — re-syncs a vital past its max; **current health/energy may only be LOWERED** (raising them is recovery, earned through play); a `max` may be corrected either way and the pair re-clamps.
  - `correctAttribute` — only **LOWERS** a mis-set sub; parents rederive via `syncParentAttributes`.
  - `mergeEntity` — folds two split registry records for one person into one survivor (unions history/knownFacts/skillsObserved, keeps the higher relationship, adds the old name as an alias).
  - All five are logged (from→to, why, world-day), reversible, and exposed in the **Repair panel** (new ops in the apply handler + repair-log lines).
- **(c) visibility — `detectAnomalies`** (pure, advisory) surfaces likely errors into the GM context so it *can* fix them: duplicate people (name-slug collision → merge), an ability rank above its practice threshold (→ suggested supportable rank), a vital past its max. `anomaliesForGM` renders them as a **POSSIBLE ERROR** scene block naming the suggested op; the Repair panel shows them at the top with **one-click ticked fixes**.

## P3 — items EVOLVE (the frozen-spear gap)
`generateRequest` could already add an NPC/location, but there was **no item-update op at all** — a legendary item stayed frozen at its shop-fresh creation description. New `applyItemUpdates` (inventory.js) evolves an **owned** item's description(≤300)/customName(≤60)/provenance(≤120)/bonusTags(≤4)/a new use(≤5)/effects — **never creates an unowned item**, and **effects stay clamped** (evolution, not inflation). New `itemUpdates` reply-key + rule in gm.js ("ITEMS GROW WITH THE STORY… does NOT grant new power"); wired in `applyTurn` (appends an evolution aside to the narration); added to `salvageOps` keys so a malformed reply doesn't drop it.

## Inherited fix — Aevi's SNG-138 challenger pool (flagged)
`content/packs/valley/npcs/saehara_challengers.json` (Aevi's SNG-138 content, commit `d701bf8`, manifest-registered `fae0829`) is a **`challenger_pool` COLLECTION** (`challengers[]`), not a single NPC — but the loader was hydrating it into the runtime `npcs` registry as a **nameless phantom NPC**, polluting SNG-019 name-resolution and the GM's known-NPC reuse, and it red-gated the whole test suite (missing name/role/spectrum/fears vs the single-NPC schema). Same class as the excluded `legends.json`.
- **Loader (state.js):** collection files now route to a new `content.challengerPools` map instead of `npcs` — still loads (honoring Aevi's manifest "so they LOAD" intent), stays out of the single-NPC registry.
- **Both test dirs** (smoke.mjs + content_ci.mjs) skip collection-shaped files (`kind==="challenger_pool"` or has `challengers[]`), like they skip `legends.json`; the manifest "every file listed" check still passes (the file stays registered).
- Added a **structural check** so the pool isn't dark: each challenger has id + name + concept.
- **SNG-138 note:** the pool now has a clean home (`content.challengerPools`) for SNG-138's recurrence wiring to consume; no NPC-registry consumer of it exists yet, which is correct pre-SNG-138.

## Guards honored
- **Repair, not wish** — rank/attribute may only LOWER; vitals only re-sync down (or fix a max); romantic-on-minor absolutely refused; nothing grants xp/level/power. `FORBIDDEN_FIELDS` unchanged.
- **Mastery unchanged** — still a genuinely-decisive defining beat, anti-inflation intact; the engine confirms the earn.
- **Item evolution ≠ power** — owned-only, no creation, effects clamped.
- **Advisory anomalies** — `detectAnomalies` never mutates; the GM/panel choose to fix.

## Verification
- **~25 new smoke tests:** the 5 correction ops incl. every repair-not-wish refusal (raise/heal-wish/minor-romantic); `detectAnomalies` flags seeded dup/rank/vital + is silent on a clean character (no false positives) + suggests a supportable rank; `anomaliesForGM` formats the block; `applyItemUpdates` evolves an owned item, refuses an unowned one, keeps effects clamped; gm.js raw-source assertions (rule 19B imperative, RIPE names crafts inline, widened vocab, "acknowledge means emit", itemUpdates reply-key+rule, itemUpdates in salvage keys, POSSIBLE ERROR block); the challenger-pool structural check. **Full `npm test` green** (smoke + parse_probe + content_ci + balance_sim + skill_battle_sim).
- **Browser-runtime, served modules (cache-busted, fresh port 8396):** all 6 ops/detection/item checks pass against the deployed bytes; served `state.js` carries the `challengerPools` routing; served `app.js` is v1.8.96; boot-clean (no console errors).
- **Not reachable headless:** a full keyed play session showing the GM actually emitting `markDefiningMoment` / a stateOp on a live beat, and an item visibly evolving in narration — those need an API key (the dev harness bounces without one). The op-emission is a prompt-reliability change; the engine that *applies* every op is fully verified.

## Files
`engine/corrections.js` (5 new ops + `detectAnomalies` + `anomaliesForGM`) · `engine/inventory.js` (`applyItemUpdates`) · `engine/gm.js` (rule 19B, RIPE block, widened stateOps vocab + acknowledge-means-emit, itemUpdates reply-key+rule, salvage key, POSSIBLE ERROR block) · `engine/state.js` (challengerPools routing) · `app.js` (Repair-panel anomalies + one-click fixes, applyTurn itemUpdates, anomalyDetail→GM, repair-log lines) · `tests/smoke.mjs` · `tests/content_ci.mjs` · `index.html` (v1.8.96).
