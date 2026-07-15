# Results — Domain Growth Arc (SNG-100b · SNG-101 · SNG-102)

Date: 2026-07-14 · HEAD `65ed8e4` · v1.8.61 → v1.8.63 · npm test green · fresh-port verified. Status: **all three shipped, complete_pending_review.**

Built top-down in the re-sequenced order after CCode's ROUND-2 review was accepted in full (classification → 100b → 101 → 102). Each is its own commit + version; this file covers the arc.

---

## SNG-100b — The Standing Bar (v1.8.61, `abf59d0`)
The floor 101/102 stand on — and it finally **wires the `accessGates` capstone rule (SNG-049/050)** that had shipped as fiction with no gate behind it.
- **`reputation.js standingWithPeople(char, traditionId, rules) → {score, band}`** — source **(b)**: `character.peopleDisposition` (already durable per-tradition), banded via a new `resolution.json peopleStandingBands` (a smaller scale than settlement `reputationBands`). *(Chose (b) over (a): no cheap community→people map exists.)*
- **`progression.js meetsStandingBar(char, traditionId, tier, rules)`** — Tier IV–V of a pole-tradition needs standing ≥ threshold **and** a willing teacher; sub-capstone open. **Wired into `learnAbility`** (folk/learned/precursor exempt). `opts.{force,threshold,requiresTeacher}` let 101/102 reuse it.
- **`character.teachers{[trad]:{met,willing,npcId}}` + `regionsKnown{[region]:turns}`** — additive-seeded on load; `regionsKnown` accrues per turn; **`gm.js markTeacher` op** (+ rule 19C) sets teachers durably. `resolution.json capstoneStanding` thresholds.
- Also fixed my ability-arch Phase-1 CI: it required `combinationAxis` on **all** combinations, but the 6 Aevi tagged are cross-pole **braids** (axes≈0, no `combinationAxis`) — correctly `combination` so SNG-101 foreclosure exempts them. CI now validates the axis-touch **pair** only; braids need neither field. 247/247 green.

## SNG-101 — Domain Promotion (v1.8.62, `65ed8e4` chain)
Raise a domain's ceiling by earned standing; foreclose its antipode — **directionally** (keep the ground).
- **Additive §2 (my ROUND-2 recommendation, zero type change):** `character.domains` stays bare strings; three new absent-tolerant fields — **`foreclosed[]`**, **`domainCeilings{}`**, **`domainsAcquired[]`** (102). `domainAccess` generalized via `opts`: ceiling = `domainCeilings[trad] ?? station-default`; iterates `[primary, secondary, tertiary, ...domainsAcquired]`; **`foreclosed` closes NATIVES only — braids exempt.** The ~11 string readers are untouched.
- **`promotionEligible` / `promote`** — reads the 100b bar + `rules.promotion` thresholds; raises the ceiling, appends the antipode to `foreclosed`; **throws if it would ever lower a ceiling (Law 14).** Foreclosure gates all **three** ability paths — `learnAbility` (via `domainAccess`), and the rank-through-use paths `autoAdvancePracticedRanks` + `markDefiningMoment` now skip foreclosed natives (braids exempt on all three). *(This rank-path gate is new to v2 — ranking became through-use this session; the spec named exactly these functions.)*
- **`gm.js offerPromotion`** op (narrative only; engine honors only if eligible) + rule 19D. **`app.js`:** a **Domains block** (station · ceiling · promoted · foreclosed axes) + promotion cards + the **commit modal** naming the foreclosure cost (Law 9 — player commits, GM offers). **`skilltree.js` FORECLOSED** node state (owned ground stays OWNED). `state.js`/load seeds `foreclosed` with the build antipodes.

## SNG-102 — Domain Acquisition (v1.8.63, `65ed8e4`)
Join a **new** people mid-play, entering at Tier I; forecloses their antipode. Almost no new surface — it lands on the above.
- **`acquirable` / `acquireDomain`** — every gate (not held, not foreclosed, not the closed antipode of primary/secondary, + the 100b standing bar) → pushes to `domainsAcquired`, sets `domainCeilings[t]=1`, forecloses the joined antipode. **No new schema.**
- **`gm.js offerAcquisition`** op (+ rule 19E). **`app.js`:** "You may join" cards (candidates bounded by who you have a willing teacher for + a GM offer) + the commit modal. `resolution.json acquisition` block; content_ci validates + asserts the Tier-I entry.

---

## Verification
- **25 new smoke tests** across the three (standing bar 7 · promotion 9 · acquisition 9), plus the CI blocks.
- **Fresh-port, against real loaded content:** standing 12→"trusted"; capstone bar blocks/opens on teacher; **promote** raises a real tertiary's ceiling to III and forecloses its real antipode; **acquire** joins a real people at Tier I and forecloses their antipode; closed-opposite/foreclosed correctly refused; Tier-II of a fresh acquisition still gated (novice). Clean boot at each version, no console errors. `npm test` green throughout.
- **Law 14 by construction:** nothing ever removes an owned ability or lowers a ceiling; `promote` throws if it would. Foreclosure preserves owned ground (it gates only *new* learning/ranking).
- **Endgame falls out of the geometry** — every promotion/acquisition shuts a far side; no collect-all rule, no count cap, zero endgame-specific code (per spec §7/§6).

## Design decisions / notes (ROUND-2 latitude the specs delegated)
- **Standing source = (b) `peopleDisposition`** (per-people, durable) — not `reputation.js` (per-settlement, unstored).
- **Thresholds live in `resolution.json`** (the `rules` bag every gate already receives) rather than the spec's `traditions.json` — a deliberate simplification so `meetsStandingBar`/`promotionEligible`/`acquirable` don't need a second content object threaded through. Same pattern as the existing `reputationBands`.
- **Region-standing gate is loose** (total `regionsKnown` turns ≥ threshold) — a tight people→region map doesn't exist in content; flagged. Teacher + per-people reputation are the load-bearing gates.
- **Acquisition is teacher-bounded** — the candidate set on the Character screen is "peoples you have a willing teacher for," so the player never browses all 24; the GM's `offerAcquisition` adds a specific narrative nudge.

## Files
`engine/reputation.js` · `engine/progression.js` · `engine/traditions.js` · `engine/skilltree.js` · `engine/gm.js` · `app.js` · `content/packs/core/rules/resolution.json` · `tests/content_ci.mjs` · `tests/smoke.mjs` · `index.html`.
