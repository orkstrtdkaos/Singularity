# SNG-238 §3b/§5b/§5c — quest imagery pipeline + the content-shape audit sweep + the never-again proof

**CCode · 2026-07-25 · v1.8.278 (`9661572e`) · npm test exit 0 (2497 PASS) · no mojibake.** Aevi did §1 (hunt stage-shape fix), §2 (concrete first steps), §3a/§3c (the image prompts, all 15 quests). This lands the three CCode pieces.

## §3b — the quest imagery render pipeline

`quest.image` / `stage.imagePrompt` / `outcome.imagePrompt` are authored prompt STRINGS (not URLs), so I added **`ensureQuestArt(promptStr, cacheKey)`** — the exact `ensureAbilityImage` pattern: generate-once from the prompt via the `moment` path (`assembleImagePrompt` reads `subject.prompt`), cache per-character in `character.questImages` keyed by a stable id, gallery + save, rating-clamped by `ensureImage`. Wired into `renderStructuredQuestDetail`:
- **Header** — `quest.image` as the card's iconic image (generate-on-view). *This alone fixes "they look empty."*
- **Stage art** — the CURRENT stage's `stage.imagePrompt` inline (generate-on-reach; past/future stages don't render an image — never batch the future, per SNG-223).
- **Decision art** — each ending's `outcome.imagePrompt` on the outcome buttons when the decision surfaces.

Verified: all 15 quests carry the fields; `assembleImagePrompt("moment", {prompt})` → a real Pollinations URL (not the prompt echoed back); the cache key is separate from the authored `image` prompt so there's no collision.

## §5b — the content-shape audit sweep (the CLASS, not the instance)

Extended `content_ci` with a sweep for the **"authored-but-under-shaped" class** — content whose consumer reads a sub-field that's absent/wrong-typed after normalization, so it renders empty. The key design decision: **the sweep runs each raw quest through the REAL normalizer (`structuredQuestRecord`) and checks the OUTPUT**, not the raw file. That matters — my first (naive) probe checked raw field-names against render field-names and produced **31 false positives**, because the normalizer bridges `name→title`, `outcome.name←titleizeId(id)`, etc. Checking the normalized output (the exact record the render reads) gives zero false positives — only a field that reaches the render *empty* is flagged.

Swept 19 structured quests → found **6 real instances**: the 2 marquee quests (`the_name_that_travels`, `the_reaching_light`) author outcomes with `text` but no `summary`, so the normalizer produced an empty `summary` and the **decision-button hints rendered blank**. Same class, subtler than the string-stages bug.

**Fixed** via a normalizer summary fallback (`engine/quests.js`): `summary ← summary | text | narration[0]`, clamped — the exact never-blank pattern as the CCODE-21 `name` fallback. Sweep now green (6 → 0). Reports EVERY offender (§5b completeness — the variant a one-quest patch misses). Consumer-read set (`stage.id/objective/condition`, `outcome.name/summary`, `quest.title`) verified from the actual render + engine reads; grown by incident, seam-ledger style.

## §5c — the never-again proof + a spec_boundary

Anti-theater self-test (the SNG-232 discipline): the sweep **BITES** — a constructed string-stage / summary-less quest IS flagged; a well-shaped one passes clean. So a green run means the gate actually detects the class, not that it's toothless.

**spec_boundary — there is NO quest generator.** The spec's §5c ("born-whole for generated quests; add `image` to the quest gen template's required set") has no target: the generator (`engine/generate.js` / `state.js` genSchemas) produces only **npc / location / arc** — never quests. Quests are hand-authored (+ the marquee/hunts). So the §5b sweep IS the protection for where quests actually come from. When a quest generator is ever built, its `required` set must be the sweep's consumer-read fields (the same contract) + the `missingRequired` repair (SNG-234) — flagged for Aevi so it's not lost.

## Ownership / handoff

- **CCode (done):** §3b render pipeline, §5b sweep + the normalizer summary fallback, §5c self-test.
- **Aevi owes:** §3c the flat-quest image prompts (structured quests all have them; flat quests use `quest.image` only); the authoritative consumer-required-subfield LIST per content type (§5d — the sweep is seeded with quests; NPCs/locations can be added the same way when an incident names them). And: a quest generator is NOT on the roadmap per the code — if you want one, it's a new spec.
- **Number collision (flag):** SNG-237's ALERT called the prompt-load trim "Fix D (SNG-238)". This spec is SNG-238 = quest imagery. So the **prompt-load trim now has no number** — Aevi owns SNG-NNN numbering; please renumber the prompt-load-trim ticket (the Machine-screen prompt-weight audit I shipped this session, `936ae4ba`, is the CCode instrument for it).

## Verification

- npm test exit 0 (2497 PASS) — content_ci carries the §5b sweep (19 quests) + the §5c self-test; rawProseCaps 63; ENGINE_MAP ok.
- The prompt→URL path confirmed in node; all 15 quests carry the rendered fields; no mojibake.
- Not live-driven in-browser — quest imagery needs art enabled + a *started* structured quest, and the dev char has no runner for that (same headless limit as encounters/forks). The render is gate-verified + reuses the proven `ensureImage` component; **Erik: turn Scene art → Generate on and open any structured quest to see the header/stage/ending images.**

## Addendum — §5b data-driven from Aevi's consumer map (`6acfb075`)

Aevi authored `po/staged_content/consumer_required_subfields.json` (the §5d seed — quest/npc/location/creature, 33 fields, tiered CRASH/EMPTY/DEGRADED with consumer file:line) *after* my first sweep. Refactored the sweep to READ it and cover all four types:
- **quest** — kept on the REAL normalizer (the map's raw quest fields `stage.title`/`outcome.text` don't survive `structuredQuestRecord`, which bridges `name→title` and my `text→summary` fallback; so the normalized-output check is the correct one, not the raw map fields).
- **npc / location / creature** — raw-field checks driven by the map. **CRASH fails; EMPTY/DEGRADED warn.** The warn tier matters: the map still has runtime drift for these — it lists `location.description` but the field is `descriptionSeed`; `dangerLevel` is runtime-floored (SNG-225). Probe-verified **every CRASH field is present today** (npc 41 / location 96 / creature 26 → 0 CRASH-fails), so this adds protection without red-gating. Non-person npc records (challenger pools) excluded.

Warns surface real gaps: npc `disposition` (42), creature `threat` (26), + the map-reconcile location fields (99). **Aevi to reconcile the map** (`description`→`descriptionSeed`; `dangerLevel` is floored) so EMPTY can be promoted from warn to FAIL for locations — then the sweep gates those too.

*— CCode. The empty cards now carry their own scene; the class that made them empty is swept across all content + proven caught. status: complete_pending_review.*
