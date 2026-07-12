# Results — Preview-legs verification pass (CCode drove the dev build)

Date: 2026-07-11 · v1.8.15 · Erik-directed ("with the dev version you can run all of this instead"). CCode drove each solo leg via the ▶ Run leg-runner in a fresh dev browser and asserted the mechanical/UI outcome. **No code change** — a verification pass. The test character provisioned correctly for every leg (no gaps found). Only Aevi closes; this reports what CCode could verify so Aevi can close the mechanical legs and Erik only needs the model-gated + cross-player ones.

## ✅ Mechanically verified in-browser (10/18)
| Leg | Verified outcome |
|---|---|
| **b9p1-rating** | ceiling → **R+ persists** + adult gate checked (SNG-052) |
| **b5-crossclass** | `prism_sight` rank button reads **▲×2** ("Spend 2 skill points (cross-class)") |
| **b5-fork** | ranked to 3 → **fork modal** → picked `deep_read` → `forkChoices.prism_sight` set, other path locks |
| **b7-inv** | quest seeded active + **duplicate rations stacked** (qty 2, not split) |
| **b9p2-keep** | ⭐ Keep climbs **established → nominated** |
| **b5-feel** | traveled to a **charged place** (`radiant_plateau_edge`) — the affinity *receipt* feel needs a live GM turn |
| **b8-time** | sleep advanced the clock **~8h** (d1h11 → d1h19) |
| **b9p2-offscreen** | shared **world-day jumped +3** (11 → 14) — the AI offscreen *advancement* needs a live GM turn |
| **b8-gambit** | gambit builder **pre-filled** a runnable 3-step plan (+ energy total) — Assess/Run needs a live GM turn |
| **sng035-portrait** | (verified earlier) a **512×640 Pollinations portrait** renders in-browser + persists |

The test character ("Test Hero (dev)", level 5) provisioned exactly as intended for each: the cross-class forkable `prism_sight`@2, 3 skill points, gates cleared, quest/items/grown-entity seeded per leg.

## ⏳ Needs Erik's API key (LLM — CCode can't drive headlessly)
- **b9p1-generate** — a generated place/person is in-grain + persists (the *content*; the store/persist path is smoke-covered).
- **sng035-scene** — a generated location born WITH its image (engine path verified; the *place generation* needs the model).
- The **narrative halves** of b5-feel / b8-time / b8-gambit / b9p2-offscreen above (the GM's scene, the gambit narration, the offscreen deed) — the mechanics landed; the prose needs a live turn.
- **SNG-048 register**, **SNG-042 legend surfacing** — GM-side narration; not in the leg list but likewise model-gated.

## 🔗 Needs two synced profiles (cross-player)
- **b9p3-promote / -lens / -contradiction / -floor** — shared-canon promotion, the rating-lens, contradiction→rank, minor-protection floor. All **engine-verified in the smoke suite** (BATCH-9 Phase 3), but the live cross-device flow is Erik's two-profile leg.
- **sng041-clock** — two characters at different day-counts sharing one absolute date.

## Bottom line
Everything that can be verified without the model or a second device is **confirmed working** by driving the real dev build (on top of 743 green smoke checks). The remaining 8 legs are **model-gated (need an API key)** or **cross-player (need two profiles)** — genuinely Erik's to feel-check, not mechanical unknowns. The leg-runner + test-character provisioning did their job: every scenario set itself up on one click.
