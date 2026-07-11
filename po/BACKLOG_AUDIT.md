# Backlog Audit — full status (Aevi PO, 2026-07-11, verified at HEAD v1.8.10)

*"Is SNG-042 the last?" — No. The CORE game + generative living world + the fast-follow queue are DONE; what remains is a handful of loose ends from today, some Aevi content, and the genuine future-roadmap (multiplayer, depth, endings, onboarding, CI). Verified against results files + code at HEAD, not memory.*

## ✅ SHIPPED — complete_pending_review (awaiting Erik legs; see po/PREVIEW_LEGS.md)
Foundation + core loop (historical): BATCH-1–7, SNG-001/002/009/010/011, SNG-019+022.
This session (v1.7.6 → v1.8.10):
- **BATCH-8** — gambit surfacing (SNG-031) + narrative time (SNG-032) + completion-XP (SNG-030 remainder).
- **BATCH-9 Phase 1** (SNG-020 generate) · **Phase 2** (living advancement) · **Phase 3** (shared family canon) — the full generative living world.
- **SNG-041** one clock · **SNG-035** imagery/portraits · **SNG-043** gambit refinement · **SNG-044 Part A** item best-tool cap · **SNG-045** identity dedup · **SNG-046 Layer 1** map SVG foundation · **SNG-047** skill sidebar · **SNG-048** voice register + **rating-register map (R+ intimacy fix — VERIFIED in gm.js)** · **SNG-051** dev preview-legs panel.

## 🔨 IN FLIGHT
- **SNG-042** — Legends & Villains (building now; anchors authored in legends.json).

## 🔧 LOOSE ENDS — specced this session, NOT yet built (finish these next; CCode)
1. **SNG-052** — adult-gate checkbox persistence (verified: 0 `adultVerified` refs — unbuilt).
2. **SNG-051 addendum** — the "▶ Run this scenario" leg-runner (just specced; force-intents in data/preview_legs.json).
3. **Generated-entity + location imagery** — SNG-035 shipped character portraits, but generated NPCs/locations aren't auto-imaged yet (0 image refs in generate.js); SNG-046 Layer 3 "born-with-image" is the follow-on. Confirm/finish so a generated place/person arrives WITH its picture.

## 🌍 AEVI CONTENT OWED (my lane, not CCode)
- **SNG-046 Layer 2** — authored base-map art per region (unbuilt).
- **SNG-044 Part B** — item-relevance content audit (narrow the Traveler's Pack tags etc.).
- **SNG-050** — the 6 unbuilt Reaches + the center-city/coliseum (worldbuilding, Erik-steered).

## 📋 UNBUILT PLANNED SPECS — the genuine remaining roadmap (always the "later" batches, not oversights)
- **Living spine remainder:** SNG-021 (full living world — cyclical events + self-driven NPCs), SNG-024 (endings/mortality/expiry), SNG-025 (player world-effects + counter-quests).
- **Depth:** SNG-023 (readable saga log — the imagery gallery ties here), SNG-026 (skill functions + cross-domain combos), SNG-027 (social contest — multi-beat conversations).
- **Player systems (roadmap BATCH-10):** SNG-036 (martial paths), SNG-017 addendum (Ent/resonant gating fix).
- **Multiplayer (roadmap BATCH-11):** SNG-033 (party v2), SNG-037 (cross-char awareness), SNG-038 (simultaneous turns), SNG-034 (bestiary + ambient wildlife).
- **Onboarding / hygiene:** SNG-039 (first-session onboarding), SNG-040 (content-validation CI — worth doing soon; protects every commit).

## ⏸️ DEFERRED (intentional, by Erik)
- SNG-028 (consequence-state: wounds/drift/debt/faction), SNG-029 (downtime / offscreen player clock).

## 🎨 DESIGN STAGE (not a build)
- SNG-050 pole-as-civilization refactor — spine already canon; remaining = reconcile + flesh the 6 unbuilt Reaches + author the center-city. Erik-steered worldbuilding.

## Recommended next order (post-SNG-042)
1. Finish the LOOSE ENDS (SNG-052, the leg-runner addendum, born-with-image) — small, and the leg-runner accelerates closing everything.
2. Erik clears the preview-legs backlog (the one real bottleneck).
3. Then a STRATEGIC pick from the remaining roadmap — the biggest-value next block is likely the **Living spine remainder (SNG-021/024/025: the world that cycles, ends, and reacts)** or **SNG-040 CI** (cheap insurance) — Erik's direction.
