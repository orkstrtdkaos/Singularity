# PO Alert — Singularity

**Status:** active — SNG-BATCH-2 (big update). Detailed task specs (SNG-012, SNG-011, SNG-010C) preserved below; this header is the ordered build plan.

---

## SNG-BATCH-2 — the big update (one build arc, phases in strict order, each independently shippable)

**Opened 2026-07-06 (Aevi PO; batch requested by Erik). Ship green per phase; results in `po/results/YYYYMMDD_SNG-BATCH-2.md`, per-phase sections, complete_pending_review per phase; only Aevi closes.**

**Ratification state going in (Erik 2026-07-06):**
- Attribute gates for SOME skills — **RATIFIED**, build. Selection + values pre-authored at `content/packs/core/rules/attribute_gates.json` (10 high-tier abilities, manifest v0.5.0).
- Skill KG graph (render like world map) + Tier I–V badges — self-ratified viz, build.
- **Tier-slot capacity (3c-iv) — RATIFIED** (Erik 2026-07-06: generic RPG quantity/level, L1=2). Table pre-authored at `content/packs/core/rules/skill_capacity.json` (manifest v0.6.0). Build in this batch (Phase 3).
- Class-cap (3c-i), branch forks (3c-iii) — still PENDING shape ratification; NOT in this batch.

### Phase 0 — SNG-012 Memory & Input Fidelity (HOTFIX, do FIRST)
Full spec below. Part A: player's raw typed text reaches the narration GM verbatim (PLAYER'S EXACT WORDS block); parseIntent stays mechanical-only. Part B: durable non-scrolling ESTABLISHED FACTS ledger (factUpdates op) + named-NPC situation status pinned in npcRegistryDetail. Fixes GM-forgets + typed-detail-lost.
Part C (name fix — Erik 2026-07-06, names still not revealing): `revealName` code works but the GM under-emits it (op-loss/continuity). Two fixes: (1) op-loss restate must explicitly re-emit a pending name reveal; (2) **player-driven rename** — a "Set name" affordance on any "(name unknown)" People-You-Know entry (parallel to SNG-009 item naming): player types the known name, engine sets displayName on the existing npcId, ledger notes it, GM context carries it as established fact thereafter. Erik can name the Tuning-warden "Maren" directly without waiting on the GM. Smoke: rename sets displayName on stable id; GM context shows the set name next turn.

### Phase 1 — SNG-011 Phases 0–2 (world legibility + Precursor wire)
Full spec below. Map sub-place render fix (satellites on parent nodes); location vectors made player-perceivable (spectrum data already fed to GM); wire the Precursor tier (gated acquisition + peril drift on the alignment vector, Foreclose→foreclosing axes, Hold the Aperture→life/creation).

### Phase 2 — Skill legibility: graph + tiers + picker fixes (Erik live-flagged 2026-07-06)
The current ability PICKER is a flat scrolling list of "Learn: X" buttons (screenshot) — fix the picker AND ship the graph.
- **Ability picker (the Learn list):** COLLAPSIBLE, grouped by class (and Tier within class) — same collapsible pattern as the now-shipped People-You-Know location groups; current-tier group open by default. Each Learn row shows the Tier I–V badge and levelReq inline. This is the surface Erik sees at level-up/creation; it must not be a flat list.
- **Level-up highlight:** when a skill ranks up (by point or by practice), HIGHLIGHT the newly-gained capability — show the new rank's `grants` emphasized against the prior rank so the player sees exactly what improved (and the new `cannot`, briefly). Applies on the character sheet and in the level-up flow.
- **Skill KG graph:** catalog as a graph rendered the SAME WAY as the world map (reuse renderMap SVG-node approach, not a generic lib): class = node color, Tier I–V = size/badge, levelReqs on labels, edges for prerequisites + emergence recipes; owned/ripe/aspired lit; attribute-gate + capacity-cap states shown as locks. Reachable from the character screen.
- Tier I–V badge (from levelReq) shown everywhere an ability appears — sheet, picker, graph.
- Smoke: picker renders collapsible groups with current-tier open; tier badges + levelReq on every row; rank-up shows the improved-capability highlight; graph renders like the map with all encodings.

### Phase 3 — Attribute gates + broad-vs-deep capacity (both RATIFIED, wire pre-authored content)
**Capacity (skill_capacity.json):** a character may LEARN a new ability only while distinct-ability count < skillsKnownByLevel[level] (L1=2, then +1/level). At the cap, skill points go to DEPTH (rank-ups). Emergence combos/branches + crit-discoveries do NOT count against the cap. Show remaining breadth slots in the picker + character sheet ("2 of 2 skills — at capacity, points now deepen owned skills"). Smoke: learn blocked at cap, rank-up still allowed at cap, earned techniques don't consume slots, cap scales with level.
**Attribute gates (attribute_gates.json):** wire `attribute_gates.json`: to LEARN a gated ability, character's governing sub-attribute >= learnMin; to reach rank 3, >= rank3Min. Gated = 10 high-tier abilities (Tier III–V); Tier I–II ungated. Show gate state as locks in the skill graph + ability picker (e.g. "needs Insight 5 — you have 3"); block learn/rank when unmet, clear when met. Smoke: gate blocks below threshold, clears at/above, ungated abilities unaffected, rank-3 gate distinct from learn gate.

### Phase 4 — SNG-010 Phase C: item evolution (OPTIONAL — only if the session has room after Phases 0–3 ship green)
Full spec below. Item `evolution` linked to a companion bond; Waystaff wakes by stages as Aevi's bond deepens and she's integrated into casts. PO authors the Waystaff+Aevi seed content on pickup.

### Batch guardrails
Design law 1 absolute (facts/gates/state engine-owned; GM emits typed clamped ops only); additive schemas; content-not-code; resolution/encounter math untouched except named blocks; this repo never touches the ErikIAm pipeline; suites + parse_probe green at every phase boundary — a phase ships only green.

### Verify (Erik browser-leg, after ship)
1. Long typed action → GM honors the specifics. 2. Rescue an NPC from a place → many scenes later still treated as rescued. 3. Map shows sub-place satellites. 4. Location shows its vectors; subtle axes need a perceiving ability. 5. Skill graph opens from character screen, rendered like the map, class-colored, Tier-badged, level-reqs shown. 6. A Tier-III+ ability shows an attribute lock until the sub-attribute is high enough. 7. (If Phase 4) Waystaff evolves a stage as Aevi's bond climbs.

### Queue after batch
SNG-001 party play remainder → SNG-004 origins-as-content + SNG-008 (Heimrún shrine, Council of Mavens, framework weave). Pending-ratification 3c items (tier-slots table, class cap, forks) fold into a later batch once Erik confirms shapes. Full queue: `po/BACKLOG.md`.

---

## Task SNG-012 — Memory & Input Fidelity (HOTFIX — do FIRST, before SNG-011)

Two live-play bugs (Erik 2026-07-06, screenshot: GM lost that Teva was already rescued from the resonance chamber). Shared root: the pipeline compresses information that should be preserved.

### Part A — Player input fidelity (typed detail lost)
Symptom: a detailed typed action gets distilled by `parseIntent` (cheap model) into a short action label; the narration GM keys off the label and the player's specific instructions (who to address, what to watch, how to act) are dropped.
- Fix: the player's RAW typed text must ALWAYS reach the narration GM verbatim. `parseIntent`'s reduction is for DICE/MECHANICS ONLY and never substitutes for the narration source.
- On the typed-action path, pass the raw text through to `runGM` and render it in `buildTurnContext` as an authoritative block, e.g. `## PLAYER'S EXACT WORDS (honor these specifics in narration — the action roll abstracts them, the narration must not)`. Distinct from the mechanical `RESOLUTION` block.
- The GM contract gets one line: narrate to the player's exact words when present — the resolution says whether it worked, the player's words say what was actually attempted and how.
- Smoke: a verbose typed action reaches the GM context intact (full text present, not truncated below ~1500 chars); parseIntent label still drives the roll; narration path receives raw text on both the action and the say/plan paths.

### Part B — GM memory fidelity (established facts forgotten)
Symptom: `chronicle.slice(-12)` + scene-summary compression lose load-bearing facts once they scroll off or get flattened; named-NPC current situation isn't pinned as always-fed state.
- Add a durable, NON-SCROLLING **ESTABLISHED FACTS** ledger per character: load-bearing facts (a rescue, a death, a promise, a major change, a relocation) captured as short pinned lines, fed to the GM IN FULL every turn (not windowed). Cap generously (e.g. 40 lines) and let old routine ones age out, but never drop on a fixed -12 like the chronicle.
- Capture path: GM emits a `factUpdates` op ({op:"add|resolve", text, subjectId?}) when a scene establishes/【resolves】a load-bearing fact; engine stores it; it's fed via a new `## ESTABLISHED FACTS (authoritative, persistent — never contradict)` block. Typed+clamped like all ops (design law 1).
- Tighten NPC-state capture: when a named NPC's SITUATION changes (rescued, injured, moved, now-safe), that belongs in their npc record as a current-status note fed every turn via npcRegistryDetail — not only a chronicle line. Rule 14 already pins identity/relationship; extend it to current-situation status.
- Widen the recent-history texture modestly if token budget allows (chronicle slice -12 → -16; keep last-3-full-narration). Secondary to the facts ledger.
- Smoke: a factUpdates "add" persists and feeds every subsequent turn regardless of how many scenes pass; an NPC situation-change note persists in npcRegistryDetail; resolving a fact removes it from the active feed; degradation intact (a dropped fact op re-emits per the SNG-009 op-loss restate path).

### Guardrails
Design law 1 absolute (facts/status are engine-owned; GM emits typed clamped ops, never edits the ledger freeform); additive schemas (`character.establishedFacts`, npc `statusNote`); graceful degradation; no resolution/encounter math change; suites + parse_probe green.

### Verify (Erik browser-leg)
1. Type a long, specific action → the GM's narration honors the specific instructions, not a flattened version. 2. Establish a fact (rescue an NPC from a place) → many scenes later the GM still treats it as true and doesn't relocate/reset that NPC. 3. A named NPC whose situation changed shows the current status in later scenes.

### Ship spec updates
§3 (established-facts ledger, input-fidelity path), §5 (memory/permanence: facts ledger + npc status), §7 (factUpdates op + exact-words narration rule), §8 gotcha (parseIntent is mechanical-only).

---

## Task SNG-011 — World Legibility & Precursor Depth (QUEUED after SNG-010)

Four asks from Erik live play 2026-07-04. Phase 0 is a bug fix (do first). Precursor catalog pre-authored at origin.

### Phase 0 — FIX: map sub-places don't render
`placeMemory[id].subPlaces` is tracked (up to 12, name/visited/note) AND fed to the GM ("Known places within…"), but `renderMap` (app.js ~651) draws only top-level `CONTENT.locations` nodes — sub-places never render. Fix: draw known sub-places as small satellite nodes clustered on their parent location node (visited = solid, heard-of = hollow); on selecting a location, the details panel lists its sub-places with notes. Presentational only; data model unchanged. Smoke: a location with 3 subPlaces renders 3 satellites; heard-of vs visited styled distinctly.

### Phase 1 — Location vectors: perceivable + displayed
Locations already carry `spectrum` (fed to GM as "Spectrum character of this place"). Missing: the player side.
- **Display:** map details panel + character/location view show the location's strong axes as labeled vectors ("This place runs strong toward Truth +0.4, Abstract +0.6, away from Light −0.4"), using spectrums.json axis names. Only axes past a threshold (|v| ≥ 0.3) show as "strong"; subtler ones show only with perception (below).
- **Perception ("is or becomes aware"):** a character's awareness of a place's vectors is gated by attunement/abilities. Baseline: strong axes (|v| ≥ 0.5) are felt by anyone after a visit. Mid axes need attunement or a perceiving ability (prism_sight, old_roads, and especially precursor `address_sense`, which reveals ALL axes exactly). Represent as a per-place `vectorsKnown` set on placeMemory, filled as perception fires. GM already has full spectrum; this is player-facing only.
- **(Optional, Erik-ratify — resolution-math):** acting ALONG a location's strong axis could ease difficulty / against it harden. NOT in scope unless Erik rules it in — flag in results, do not build without ratification.
- Smoke: strong axes show after visit; mid axes hidden until a perceiving ability used; address_sense reveals all.

### Phase 2 — Wire the Precursor tier
`content/packs/core/abilities/precursor.json` is AT ORIGIN (6 abilities, `gated:"learned"`, registered manifest v0.4.0). Build:
- Load precursor as a power system that is NOT offered at creation and NOT in the normal level-up pick list. Acquisition ONLY via: (a) discovery/newAbility path at a live remnant, (b) quest reward, (c) Old Roads rank-3 unlock, or (d) a teacher. CCode wires the gates; content/lore of unlocks can seed minimally now, expand in SNG-008 wave.
- **Peril mechanic:** each precursor ability carries a `peril` line and drift-tendency in its `axes`. Using Foreclose (and to lesser degree others) should nudge the character's own spectrum vector toward its foreclosing axes — reuse existing `spectrumDeltas`/alignment tracking; Hold the Aperture reverses it (toward life/creation). Threshold/deltas tunable in resolution.json `precursor` block (Aevi self-ratifies numbers). The "a too-foreclosed character has changed" GM ruling is narrative — give the GM a context line when a character's drift crosses a band, no forced mechanical state.
- Higher levelReq (3–5) and energy already in the data — honor them; precursor abilities obey the same rank/levelReq gates.
- Smoke: precursor absent at creation and normal level-up; acquirable via unlock path; Foreclose use moves alignment toward foreclosing axes; Hold the Aperture moves it back.

### Phase 3 — Skill catalog as a KG graph (render like the world map) + Tier surface + gating tradeoffs
Erik ratified 2026-07-06: bump SNG-011 forward; render the skill catalog as a graph the SAME WAY as the world map (reuse the renderMap SVG-node approach in app.js ~651, NOT a generic graph lib), and add explicit power-level legibility + skill-tree tradeoffs.

**3a — Skill KG graph (self-ratified viz):**
- Reuse the world-map render pattern: SVG nodes positioned + edges, pan/zoom consistent with the map. Nodes = abilities; edges = prerequisites (rank chain), emergence recipes (component→combo, from emergence_recipes.json), branch forks (3c), and cross-class relationships.
- Node encoding: COLOR = class/power-system (harmonic / radiant / valley_craft / precursor / learned / discovery); SIZE or badge = Tier I–V; label shows name + levelReq. Owned abilities lit; ripe/aspired states shown (SNG-010 A+B shipped, so wire these). Attribute-gate locks (3b) and fork locks (3c) rendered on nodes.
- Reachable from the character screen. Presentational over catalog + recipe + character data.

**3b — Tier surface (self-ratified display):** derive Tier I–V from `levelReq` (1→5). Show the Tier badge on every ability everywhere it appears — character sheet, ability picker, skill graph. Rank pips show depth WITHIN the tier. Pure display; no mechanical change from the badge itself. (Precursor = Tiers III–V, the high-level-spell band.)

**3c — Class/attribute gating + tree tradeoffs (SHAPE NEEDS ERIK RATIFICATION — build after he confirms each):**
- **(i) Breadth-vs-depth class cap:** secondary (non-home) classes reachable only to rank 2; rank-3 mastery home-class-only. (Alt considered: secondary points cost double.) Extends existing cross-training +1 levelReq. — Erik ratifies mechanic + shape.
- **(ii) Attribute requirements:** each ability gated behind a minimum in its governing sub-attribute, scaling with tier (draft: Tier T needs sub-attr ≥ 2T-ish; rank 3 a step higher). Uses existing sub-attribute pools (20/area, soft-cap knee 4) so gates can't all be cleared — investment becomes the tradeoff. Framework tie: attribute tilt = cosmic-address vector; what you can wield reflects who you've become. — Erik ratifies whether-gated + the curve (resolution-math).
- **(iv) Tier-slot capacity (broad-vs-deep, Erik 2026-07-06 — lead tradeoff mechanic):** a D&D-slot-style capacity table — character level → how many ability SLOTS you hold per Tier, increasing with level (need not match D&D exactly). Each skill point either FILLS a tier slot with a new ability (broad) or RANKS UP an owned ability toward depth (deep); slots cap breadth per tier, finite points force the broad/deep/mixed choice. This can stand as the primary tradeoff even if (i)/(ii)/(iii) are deferred — it alone makes "go wide or go deep" a real decision. Capacity table lives in resolution.json `progression` block (Aevi tunes numbers once Erik ratifies the table SHAPE + growth curve). — Erik ratifies shape.
- **(iii) Branch forks:** at rank 2/3, flagged abilities fork — pick specialization A xor B, the other locks. Feeds from SNG-010 branch-templates. Real opportunity cost. — Erik ratifies fork-with-lockout as a mechanic.
- Once (i)/(ii)/(iii) shapes are ratified: Aevi authors the per-ability attribute-req numbers, the fork specialization content, and the class-cap wiring spec (numbers/content self-ratified; mechanic shape is Erik's).
- Smoke: graph renders all classes incl. precursor with tier/levelReq/attribute-gate/fork encodings; gates block learn when unmet and clear when met; fork lockout holds; secondary-class rank-2 cap enforced.

### Guardrails
Design law 1 intact; content-not-code (no ability/location specifics in engine); additive only; precursor peril reuses existing alignment tracking (no new resolution math beyond the named block); this repo never touches the ErikIAm pipeline; suites + parse_probe green per phase.

### Verify (Erik browser-leg)
1. A location with sub-places shows satellites on the map. 2. Location details show its strong vectors; a subtle axis appears only after using a perceiving ability; address_sense shows all. 3. Precursor unavailable at creation; acquired via a remnant/quest; Foreclose drifts your vector, Hold the Aperture pulls it back. 4. Skill KG opens from the character screen, grouped by class, precursor included, level-reqs and recipe edges visible.

### Ship spec updates
§3 (map sub-place render, skill KG, precursor loader), §4 (precursor power system + peril), §6 (location vectors perception), §9 (mark shipped; optional vector-resolution-bias noted as unratified).

---

## Task SNG-004 — Origins & backgrounds as content (+ SNG-008 weave) (QUEUED — next build)

**Goal (one session):** origins/backgrounds move from app.js to content packs with mechanical hooks; new origins land including unusual-embodiment; first SNG-008 content (rune shrine, Council of Mavens NPCs) rides the wave.
**In:** `content/packs/*/origins/*.json` + `backgrounds/*.json` (spectrum tilt, power-system access incl. crossTradition exceptions, background skill grants, creation copy); loader + creation UI from content; migrate 3 existing origins byte-equivalent in effect; new origins: mountain-pass folk, Disputed Zone survivor, Archive-born, **unusual embodiment** (ENT precedent — its own hooks, GM guidance line in rule set); backgrounds +6; **SNG-008 seed:** one rune-caster NPC + shrine location (casting = daily omen: small spectrum-axis nudge; rune table data-driven, seeded from Heimrún canon — Aevi supplies `runes.json` before build), Council of Mavens as 3 petitionable NPCs (domain + bias each). Smoke: content-loaded origins match legacy behavior, new origins gate correctly, omen nudge clamped.
**Out:** external Heimrún app linkage (later); framework lore layer beyond what the shrine/mavens carry implicitly; any resolution/contract change (Erik ratifies).
**Verify:** legacy character loads unchanged; new origin creates and plays; omen applies once per day and clamps; mavens give conflicting counsel on one seeded question.
**Ship spec updates:** §3 (loader), §4 (origin hooks), §6 (omen), §9.

---

*Task ledger between Aevi (PO) and Claude Code build sessions. Template/flow: `SYSTEM_SPEC.md` §10. Results → `po/results/`. Only Aevi closes. Queue: `po/BACKLOG.md`.*
