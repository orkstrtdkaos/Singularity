# PO Alert — Singularity

**Status:** closed_green (v1.2.0 + v1.3.0) — awaiting Erik browser-leg; next task queued below.

---

## PO closure — SNG-BATCH-1 + SNG-002b + SNG-001 (2026-07-04, Aevi)

All phases **closed_green** after origin audit:
- Suites green at every boundary (198 → 248 checks) + parse_probe (semantics corrected — good catch).
- **Content review PASSED (PO ratification):** all 16 new harmonic/radiant abilities read verbatim — style bar met (hard cannots, honest notFors, rank-3 legend-adjacent and priced, no niche trivialized; standouts: Shatterpoint r3's two-way Precursor door, Echo Memory's "some echoes look back," Prism Ward's community-consent fence). 36 unique ids confirmed. Aevi companion content (Motes' Vigil / Kindled Chorus) ratified — "cannot lie about what it saw" is exactly her.
- Bonds engine-owned confirmed at origin (no GM bond op in gm.js).
- SNG-001 merge-retry, turn gate, encounter-witness verified via smoke per results.
- Creator addendum (map sub-places, rule 15B extension) accepted — Erik-direct is Erik-ratified by definition.

**Outstanding — Erik browser-leg (blocks nothing, informs tuning):**
1. Lethal offer shows stakes + decline. 2. Creation: 13+ valley abilities, grouping, cross-training note. 3. Character screen: backstory, /20 bars with knee, spend banked points. 4. Inventory examine/use/drop. 5. Bond meter moves on a shared deed. 6. **Two-browser party test** (SNG-001 criteria 2/3) — second device, same location, join + see partner's beat within a poll cycle.

**PO spec debt (mine, next session):** fold §4/§6 detailed subsections (encounters numbers, party play, bonds, cross-training) into SYSTEM_SPEC from results files.

---

## Task SNG-004 — Origins & backgrounds as content (+ SNG-008 weave) (QUEUED — next build)

**Goal (one session):** origins/backgrounds move from app.js to content packs with mechanical hooks; new origins land including unusual-embodiment; first SNG-008 content (rune shrine, Council of Mavens NPCs) rides the wave.
**In:** `content/packs/*/origins/*.json` + `backgrounds/*.json` (spectrum tilt, power-system access incl. crossTradition exceptions, background skill grants, creation copy); loader + creation UI from content; migrate 3 existing origins byte-equivalent in effect; new origins: mountain-pass folk, Disputed Zone survivor, Archive-born, **unusual embodiment** (ENT precedent — its own hooks, GM guidance line in rule set); backgrounds +6; **SNG-008 seed:** one rune-caster NPC + shrine location (casting = daily omen: small spectrum-axis nudge; rune table data-driven, seeded from Heimrún canon — Aevi supplies `runes.json` before build), Council of Mavens as 3 petitionable NPCs (domain + bias each). Smoke: content-loaded origins match legacy behavior, new origins gate correctly, omen nudge clamped.
**Out:** external Heimrún app linkage (later); framework lore layer beyond what the shrine/mavens carry implicitly; any resolution/contract change (Erik ratifies).
**Verify:** legacy character loads unchanged; new origin creates and plays; omen applies once per day and clamps; mavens give conflicting counsel on one seeded question.
**Ship spec updates:** §3 (loader), §4 (origin hooks), §6 (omen), §9.

---

*Task ledger between Aevi (PO) and Claude Code build sessions. Template/flow: `SYSTEM_SPEC.md` §10. Results → `po/results/`. Only Aevi closes. Queue: `po/BACKLOG.md`.*
