# Results — SNG-113: Aptitudes expansion (situational, earned, lost, granted)

Date: 2026-07-16 · HEAD `c0d4ef9` · **v1.8.80** · `npm test` green · browser-runtime verified. Status: **shipped, complete_pending_review.**

The aptitude system was under-populated (7) and mis-tuned (decay 0.995 ≈ permanent). This makes it what Erik wanted: **situational** bonuses maintained by how you play, plus a 26-aptitude roster, background lineage grants, a home for romantic play, and a coming-of-age mechanic.

## The mechanism (engine)
- **Decay bites** — moved to `rules.aptitudeDecay` (**0.975**; ~27 turns to halve), so a tendency you stop feeding actually falls and the aptitude is lost. (The old 0.995 wouldn't drop it in 40 turns — the fix is load-bearing, and a smoke test asserts exactly that.)
- **Hysteresis** — `rules.aptitudeKeepMargin` (4): earn at `threshold`, keep until `threshold − margin`. One off-tag turn never flickers it; a genuine shift in play drops it.
- **Fading is legible** — `fadingAptitudes` flags a held aptitude within `aptitudeFadeBand` of its keep-floor (or an inverse one nearing its ceiling); `profileInsight` shows "— fading" so loss is never silent.
- **Inverse aptitudes** (innocent / naive / sheltered) — the system's first inverse axis: **granted** at creation, **held while a composite worldliness score stays below a ceiling**, lost **one-way** as experience accrues. The decay engine run backwards — "what you turn your attention toward, you become, and cannot un-become."
- **Background grants** — `grantAptitudes` seeds a lineage aptitude above its threshold at creation and records provenance (shown as "(lineage)"). All 40 backgrounds now declare `grantsAptitudes` by category (`lineage_taught → faithful`, martial → rough_and_ready, learned → scholar, …); Aevi can retune per-background.
- **Amorous routing** — the `romantic`/`flirt` tags (added SNG-100, previously mapped to **nothing**) now accrue a new **amorous** tendency → `charmer`/`devoted_lover`/`ardent`. `gm.js` intent-tag vocabulary extended for all the new tendencies (stealth/deception/patient/craft/leadership/devotion/amorous/…).

## The roster (content) + the 20 new consumers
- Aevi's **26-aptitude roster** (`po/SNG-113_aptitude_roster.json`) merged into `resolution.json.playerAptitudes` with **curved thresholds** (11–18) and **tiered depth** (strategist→tactician, silver_tongue→orator, scholar→sage).
- **TIER-B is not inert:** the 20 `newConsumersRequired` are all built as **named, self-summing, situational** lines in `resolve.js` (defenseBonus / stealthBonus / deceiveBonus / intimidateBonus / deEscalationBonus / sustainedActionBonus / craftBonus / allyActionBonus / flirtationBonus / trustedBonus / sincerityReadBonus / alignedTraditionBonus + the paired penalties gravitas/composure/burst/improvisation/crossPole/worldlyCunning/chargedSituation/solo). Each fires **only in its context** (stealth helps you sneak, not speak).
- **`content_ci` now asserts every aptitude mod key has a consumer** (no inert mod — the SNG-103 "a mod with no consumer is a lie" lesson), and that every earned aptitude declares tendency+threshold / every inverse one a worldliness ceiling+components. 31 mod keys, all with consumers.

## ROUND-2 answers
1. Decay is the **only** place tendencies decrease (verified — no other reset), so moving it to rules + raising it is the single lever. ✅
2. New tendencies added tags to the vocabulary; the intentTags **cap is per-action (6), not on vocab size**, so adding tags doesn't crowd it (amorous accrual isn't doc-gating, so an occasional sliced tag only slows accrual — no correctness bug). ✅
3. All inverse worldliness components (ruthless/deception/amorous/carousing/physical) **exist** in `TAG_TO_TENDENCY` post-population, so every composite is well-defined. ✅

## Guards honored
- **Every aptitude keeps a cost** (bonus-AND-cost) — enforced by content + the consumer pairs.
- **Amorous is rating-ceiling-bounded + minor-absolute** — `flirtationBonus` is a social/rapport resolution modifier (a `romantic`-tagged social roll), never a content unlock; the romance/art minor-safety floors are entirely separate and unchanged.
- **Innocence is about worldly experience, not age** — temperament traits, no romantic/sexual content, separate from minor-safety.
- **`devoted_lover`** reads `allyActionBonus` (in service of another / a SNG-108 partner as party-adjacent ally) — 108 shipped, so it's live rather than inert.

## Verification
- 14 smoke tests (earn/hysteresis/decay-drops/grant-seeds+lineage/fading/inverse-one-way/amorous-routing/anti-collect-all/consumer-fires-in-context) + the content_ci consumer guard. `npm test` green.
- **Browser-runtime, through loaded CONTENT:** 26 aptitudes at decay 0.975; `lineage_taught → faithful` granted + marked; strategist earned then **lost after 40 turns of neglect**; romantic/flirt → amorous 19.4 → charmer earns; **innocence held at birth, eroded by threaten/deceive**.

## What's Erik's to feel
The **tuning** — decay rate, thresholds, keep-margin, the per-background grant map — is playtest territory ("hold 2–4"). The anti-collect-all property is proven (a strong two-lean earns 2–6; an even 10-way spread earns ~none), but the exact feel is yours to dial. Say the word and I'll adjust any constant.

## Files
`engine/playerprofile.js` · `engine/resolve.js` (20 consumers) · `engine/gm.js` (tags) · `content/packs/core/rules/resolution.json` (roster + constants) · `content/packs/core/rules/backgrounds.json` (grantsAptitudes ×40) · `app.js` · `tests/smoke.mjs` · `tests/content_ci.mjs` · `index.html`.
