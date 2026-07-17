# Results — NPC party members with roles, unified Company (SNG-126)

Date: 2026-07-16 · HEAD `9a9c38f` · **v1.8.87** · `npm test` green · browser-runtime verified. Status: **shipped, complete_pending_review.**

Erik ruled **UNIFY**: companion / trainer / liaison / partner / ally are **roles** a person in your company holds, and roles **stack** on one NPC. Each role wires to the system that already implements it — so this surfaces + binds what exists rather than forking a second party system.

## ROUND-2 answers
- **Q1 (companionBonus generalizes to a humanoid without breaking Huginn?)** — yes. Catalog companions (Huginn) keep `character.companions` + their existing path (role=companion, beast). The NPC-people half is a separate, additive `character.company` roster; the two are merged only for display. Huginn is untouched.
- **Q2 (trainer sets the teacher gate transiently, distinct from durable `markTeacher`?)** — yes. `meetsStandingBar`'s capstone teacher check now passes if `teachers[trad]` is durable-met **OR** a company **trainer** for that tradition is present. Part ways and the gate closes for tiers not yet taken; already-learned crafts stay (Law 14). `markTeacher` still records the durable met-once. One gate, two ways to satisfy it — no fork.
- **Q3 (roles stack, read independently?)** — yes. The company entry holds `roles[]`; `trainerFor`/`liaisonFactions`/the partner derivation each read their own role, so one NPC firing multiple benefits is clean.

## The build
- **`engine/company.js`** (new, pure leaf — imports only `npcs.js`): `character.company` = `[{ npcId, roles[], teaches, liaisonFor, joinedDay }]`. `recruit` (roles stack; **partner is refused here** — it is bond-derived only), `partCompany`, `companyRoster` (recruited members + partner-adjacent NPCs folded in with derived `partner`/`ally` roles + a `recruited` flag), `trainerFor` (Set of taught traditions), `liaisonFactions`/`liaisonMultiplierFor`, `isRecruitable` (bond band ≥ ally), `offeredRoles` (from an authored record: always ally, +trainer if `teaches`, +liaison if `liaisonFor`), `roleBadges`.
- **`engine/progression.js`** — the teacher gate accepts a present company trainer (imports `trainerFor`; safe DAG: progression → company → npcs, and nothing imports progression).
- **`engine/quests.js`** — a company liaison multiplies `peopleDisposition` **gains** (not penalties) via `ctx.liaisonMult`, supplied by the app from `liaisonFactions` (both the structured `disposition` effect and the legacy prose path).
- **`app.js`** — the SNG-120 Company section gains a third **"Allies"** group: each member with role badges + a "teaches {tradition}" chip (trainer) + a liaison chip + a "Part ways" control (recruited only), and a **"＋ Recruit"** button for present NPCs bonded strongly enough. `ensureCompany` at load; `liaisonMult` threaded into `resolveStructuredQuest`. Companion part-ways now cleans orphan `companionBonds`/`companionNames` state (a latent bug the map surfaced).
- **content** — `master_taro` reference declares `recruitable`/`teaches: "somatic"`/`liaisonFor: "somatic"` so the feature is live end-to-end; authoring the wider roster (which NPCs teach/represent what) is an **Aevi content dependency**, flagged below.

## Guards honored
- **Reuse the teacher gate, don't fork** — a trainer-in-company *sets* the existing `{met,willing}` semantics through the same `meetsStandingBar` check.
- **Benefits tied to presence** — part ways ends the trainer/liaison benefit; already-learned stays (Law 14).
- **Consensual + earned** — recruit gates on `isRecruitable` (bond band ≥ ally) + a confirm; you don't conscript.
- **Minor-safety absolute** — `partner` is never set by `recruit` (it is derived from the SNG-108 bond, which refuses a romantic bond on a minor in `advanceBond` before any stage logic). A minor NPC can be an ally, never a partner.
- **Composes, doesn't duplicate** — extends the SNG-120 Company section and the SNG-100b teacher gate; Huginn's catalog path is untouched.

## Verification
- **13 new smoke tests:** the trainer→teacher-gate integration (a company trainer clears the capstone `meetsStandingBar`; a different tradition does not); `recruit` stacks roles + refuses partner + carries teaches/liaisonFor; `trainerFor`/`liaisonFactions`/`liaisonMultiplierFor`; `companyRoster` folds in partner-adjacent Pell with derived roles + the recruited flag; `isRecruitable` band threshold; `offeredRoles` from a record; `partCompany` removes the member + its benefits; the `master_taro` reference declares the fields. `npm test` fully green (smoke + parse + content_ci + balance + skill-battle).
- **Browser-runtime, served modules:** the company engine (roles stack/partner refused/trainerFor/liaison), `companyRoster` partner derivation, the reference content, and — load-bearing — a company trainer clearing the served `meetsStandingBar` gate (confirming the cross-module progression→company wire loads with no import cycle). 4/4. Boot-clean on 8219, `?v=1.8.87`, no console errors.
- The Allies-group render + recruit/part controls are a template over these verified helpers; the in-play *feel* (recruiting Master Taro, then reaching a Somatic capstone the trainer unlocks) is the part to eyeball in a keyed session.

## Aevi dependency (flagged, non-blocking)
The engine + reader + one reference NPC (master_taro) ship here. Authoring `recruitable`/`teaches`/`liaisonFor` across the wider NPC roster (who trains which people, who liaises for whom) is a content pass — Aevi's, per the agent split. Until then, only master_taro is recruitable-as-a-trainer; partner-adjacent NPCs (Pell) already surface with no authoring needed.

## Files
`engine/company.js` (new) · `engine/progression.js` (teacher gate) · `engine/quests.js` (liaison multiplier) · `app.js` (Allies group, recruit/part handlers, ensureCompany, liaisonMult thread, clean companion part-ways) · `content/packs/valley/npcs/master_taro.json` (reference) · `tests/smoke.mjs` · `index.html`.
