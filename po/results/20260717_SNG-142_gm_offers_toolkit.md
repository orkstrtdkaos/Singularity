# Results — A GM that offers the player their own toolkit (SNG-142)

Date: 2026-07-17 · HEAD `94821e2` · **v1.8.100** · full suite green · browser-verified (served bytes + real content). Status: **shipped, complete_pending_review.**

**Diagnosis held:** the machinery was all **reactive** (the novel/combo resolver, the attribute parser) with no **proactive** surfacing — and the GM was **blind to aspirations** (0 mentions in gm.js). All the data existed; none reached narration as "here's what you could do." This is a context-assembly + prompt-contract ship, not new mechanics. Includes the Part 1B amendment (items/companions/party + cross-actor combos) in one coherent block.

## New engine — `engine/toolkit.js` (pure, ~90 lines)
`toolkitForGM(character, { catalog, fnIndex, coverageMissing, companions, party, rules })` builds a compact **"WHAT YOU COULD REACH FOR"** block (mirroring the RIPE FOR MASTERY / POSSIBLE ERROR blocks). Lines, each optional:
- **Crafts not yet leaned on** — owned abilities with a 0 use-count. *(There is no per-ability recency stamp on the character — `practice.uses` is a cumulative counter only — so use-count is the honest "forgotten" proxy; flagged for Aevi as OQ2.)*
- **A combination candidate** — two of the character's OWN crafts that might braid, chosen by a cheap heuristic (shared function family via `familiesOfAbility`, **ranked by prior co-use** from `practice.coActivations` so it favours a braid they've actually leaned toward). No owned-pair generator existed (the authored-combination machinery targets *unowned* catalog entries and is empty), so this is the light heuristic OQ1 recommended — the engine surfaces the candidate; the GM judges the fit.
- **The declared ASPIRATION + progress** — reads `character.practice.aspirations` (`{abilityId, since, progress}`, ripe@10) → "working toward Echo Sense (6/10)". **This is the big gap closed** — the GM could not see aspirations at all before.
- **A carried item's capability** — a named/legendary/evolving item, a consumable, or one with authored `uses`/`bonusTags` → "Memory — channel deathsense" (the offerable capability, not just the name).
- **A companion's capability** — `role` + `knowledge` ("Huginn (carrion bird that attends endings) — knows where the dying are"), so the GM can offer them, not only narrate their presence.
- **A party member** (another player's character, shared scene only) → "a cooperative move together is possible (INVITE their player; never commit their character)."
- **The SNG-124 function-gap** — `functionCoverage(...).missing` → "no RESTORE craft yet."
- **The attribute floor** — always: "a plain attribute action … serves when no craft is a clean fit."

Returns `""` when only the bare attribute floor would show — no spam for a fresh character.

## The GM contract — `engine/gm.js`
- **Rule 16B — OFFER THE TOOLKIT, LIGHTLY.** The GM MAY surface ONE toolkit option per beat — a craft, a novel combination of two of their own crafts, an aspiration-advancing move, a carried item, a companion's capability, a cooperative move with a party member, or a plain attribute action — woven into the fiction as a door. **⛔ Never more than one per beat, never every beat, never when the player already stated a clear intent** (an offer fills a vacuum, never overrides a choice). A combination/cooperative move is an **invitation** — the GM may never commit another player's party character. Aspiration-aware pacing: when the fiction can naturally present a chance to practice a declared aspiration, favour it (present, never force).
- **The TOOLKIT scene block** (`if (toolkitDetail) scene.push(...)`) rendered in TIER 3 alongside RIPE FOR MASTERY / POSSIBLE ERROR; `toolkitDetail` added to the `tierParts` ctx destructure.

## App wiring — `app.js`
`runGM` computes `toolkitDetail = toolkitForGM(character, {...})` (feeding `functionCoverage(...).missing`, `activeCompanions(...)`, and the `sharedScene` party) and passes it into the `gmTurn` ctx — same three-seam pattern as `masteryDetail`/`anomalyDetail`.

## ROUND-2 answers (OQs)
1. **Combo candidates:** engine-side cheap heuristic (shared function family, ranked by co-use) surfaces the candidate pair; the GM decides if the beat fits. No authored pair-generator exists to reuse.
2. **"Unused-lately":** there is no recency timestamp on the character (only a cumulative `practice.uses` counter), so "not yet leaned on" = use-count 0. A true N-beats-since window would need a new per-ability beat stamp — flagged, not built (out of scope; the proxy reads well).
3. **Aspiration surfacing:** the lighter form — "working toward X (progress/ripe)" — enough to bias pacing, not micromanage.

## Guards honored
- **Offer, never nag** — ≤1/beat, never on clear intent, never a menu, woven into fiction; enforced in rule 16B and verified by the block being *context the GM draws one from*, not an instruction to list.
- **The player's OWN toolkit** — every suggestion is the character's actual craft/attribute/aspiration/item/companion; a combo uses two crafts they HAVE (composes with the unchanged novel/combo resolver + DISCOVERY rules).
- **Aspiration = present, not force**; **cooperative = invite, never commit** another player's character (the agency guard, in the rule + the block's own wording).
- **Reuses built systems** — `practice.uses`/`aspirations`/`coActivations`, SNG-124 coverage, inventory/companions/party detail. Surfaces them; doesn't rebuild.
- Rating + minor-safe as all GM output (unchanged).

## Verification
- **13 smoke tests:** the block surfaces an unused craft, a co-use-ranked combo of two owned crafts, the declared aspiration + progress, a carried item's capability, a companion's capability, the gap nudge, and the attribute floor; a shared scene offers an agency-preserving cooperative move; a fresh character gets an empty block (no floor-only spam); a one-craft novice still gets a nudge; gm.js raw-source (rule 16B with the ≤1/never-on-clear-intent discipline + the never-commit-another-player guard; the toolkit scene block guarded + destructured). Full `npm test` green.
- **Browser-runtime, served modules + real content (cache-busted, fresh port 8100):** the toolkit block on a real character reads *"Sonic Resonance + Shatterpoint (both HARM)"*, *"working toward Echo Sense (6/10)"*, *"Memory — channel deathsense"*, the attribute floor; a fresh character → `""`. Served gm.js carries rule 16B + the toolkit push + destructure; served app.js computes + passes `toolkitDetail`; v1.8.100; boot-clean.
- **Not headless-reachable:** the GM actually *offering* one option in live narration (and holding to ≤1/beat, never on clear intent) is a prompt-reliability behavior — the block-assembly + the rule are fully verified; the restraint is contract-shaped, like rule 16/19B.

## Files
`engine/toolkit.js` (new) · `engine/gm.js` (rule 16B + TOOLKIT scene block + ctx destructure) · `app.js` (compute + pass toolkitDetail; import) · `tests/smoke.mjs` · `index.html` (v1.8.100).

## Note for Aevi
- **Recency (OQ2):** there's no per-ability last-used beat stamp on the character — only a cumulative `practice.uses` count — so "not yet leaned on" uses 0-count as the proxy. A true "unused in the last N beats" nudge would need a new per-ability beat stamp on `recordUse`; flagged as a possible future refinement, not built here.
- **Combos:** the authored-combination system (`ripeAxisTouchCombinations`/`combinationsAvailableFor`) is still empty (docstrings: "empty until combinations are authored + tagged"). The toolkit's combo *candidate* is a lightweight own-ability heuristic and is independent of that; if/when authored combinations land, the toolkit could also surface those.
