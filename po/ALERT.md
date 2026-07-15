# PIPELINE ALERT — Singularity## ✅ DOMAIN GROWTH ARC — SHIPPED & CLOSE-VERIFIED (Aevi HEAD audit, v1.8.63)

CCode built all three top-down; **Aevi confirmed at authenticated origin** (not report): `standingWithPeople` · `meetsStandingBar` · `promotionEligible` · `promote` · `acquirable` · `acquireDomain` all present at HEAD. SNG-100b (standing bar, wires the long-fiction accessGates capstone) → SNG-101 (promotion, additive model, foreclosure gates learn + both rank paths, braids exempt, Law-14 throw) → SNG-102 (acquisition, Tier-I entry, closed-opposite never loosened). CCode also fixed a Phase-1 CI bug the classification pass exposed (CI wrongly required `combinationAxis` on the 6 cross-pole braids, which correctly have none — the braid-exemption foundation). Decisions CCode was delegated: standing source = `peopleDisposition`; thresholds in `resolution.json`; region gate loose (no people→region map — flagged); acquisition teacher-bounded. Writeup: `po/results/20260714_domain_growth_arc.md`. **Green.**

---

## 🐛 SNG-103 — GM effective energy cost (specced, awaiting CCode)
`po/SPEC_SNG-103_gm_effective_energy_cost.md`. `abilitiesForGM` prints base `ab.energyCost`, not effective — GM false-flags correct discounted costs (found live: Silas/Palework 6-vs-3). Fix: thread `CONTENT.rules`, interpolate `effectiveEnergyCost`. Guard: never "repair" base down — that's the real corruption. Awaiting ROUND 2.

## 🖥 SNG-104 — Vitals x/y readout + tap/hover detail (specced + STAGED DIFF, awaiting CCode)
`po/SPEC_SNG-104_vitals_readout.md` + `..._STAGED_DIFF.md` (byte-precise drop-in). The Health/Energy bars show **no number** — that's why Erik couldn't tell if energy was depleting faster or he had less. Adds always-visible `current / max` (zero-tap phone answer) + a tap/hover popover reusing the info-dot delegation (phone parity built in). Verified anchors at HEAD.

## ⚔️ SNG-098 — Skill Battles — ✅ PROMOTED (Erik 2026-07-14) → CCode ROUND 2

`po/SPEC_SNG-098_skill_battles.md`. **Erik promoted to build.** Routed to **CCode ROUND 2 substrate review first** — not blind build. Reason (PO judgment, stated plainly): this is the single most architectural spec of the session — a combat-MODEL change, a new `skill_battle.js` module, and touches `encounters.js`/`sense.js`/`app.js`/tests. This session's repeated lesson was that Aevi specs lean on substrate assumptions that don't hold until CCode verifies at HEAD (§7b duplicated an existing file; the SNG-101 standing bar wasn't wired; §2 was a breaking type change — all caught in ROUND 2). Skipping review on the *biggest* spec would be exactly the wrong call. The spec also carries three real open questions Aevi could not resolve alone:
  1. Can a duel `def.opponent` (threat/tacticTags) synthesize a fair skill sheet, or must the encounter generator author one at spawn?
  2. Does `senseTier` compose cleanly when the sensed "action" is the OPPONENT's declaration rather than the player's own?
  3. Momentum meter — net-new encounter state, or does an existing field generalize?

**CCode: ROUND 2 review → answer the three → then GO for build.** If Erik wants to skip review and build straight off, say so; ROUND 2 is the safer next step for a change this size and is the default.

**The core to preserve through review:** two rolling+deciding agents; opponent decision is deterministic engine `opponentPolicy` (not GM invention); **fog-of-war via `senseTier` is presentation over TRUE state, never false** (tier 0 blind → tier 3 sees their full breakdown); reveal skills buy a tier; PvP falls out symmetric. Depends on SNG-106 (retained roll components).

---

## 🎲 SNG-106
