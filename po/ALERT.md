# PO Alert — Singularity

**Status:** complete_pending_review — SNG-BATCH-3 (v1.6.2→v1.6.4, results po/results/20260706_SNG-BATCH-3.md) AND SNG-BATCH-4 (v1.6.5→v1.6.6, results po/results/20260706_SNG-BATCH-4.md) built + shipped green (414 checks, browser-load-verified). Erik ran 'proceed to batch 3 and 4' — both done in one session. Also shipped out-of-band: fix(pages) .nojekyll (Jekyll build was FAILING, freezing the live site — now green), fix(party) actionable GitHub sync errors (his shared-scene 403 was a read-only PAT). Erik preview-leg: **combat + random encounters VALIDATED by Erik 2026-07-06 ("worked ok, tried several encounters, all pretty good for a first cut")** — Phase 1 confirmed on the live build; accepted as first cut, refinement possible later. STILL OPEN (optional feel-checks): affinity feel (aligned vs opposed in a tilted place), surge dial + backlash, Waystaff waking. GM contract flags awaiting Erik: EW/FCT (BATCH-2) + INTENSITY narration cue (BATCH-4). Only Aevi closes. Detailed prior specs preserved below.

---

## PO closure — SNG-BATCH-2 (2026-07-06, Aevi)
All phases closed_green after origin audit: facts.js / vectors.js / skilltree.js exist at HEAD; attribute gates + broad-vs-deep capacity genuinely ENFORCED in progression.js (meetsLearnGate/meetsRank3Gate/atCapacity); ESTABLISHED FACTS + PLAYER'S EXACT WORDS blocks wired into GM context (rules FCT, EW). Picker collapsible + tier/level indicators + rank-up highlight shipped; skill-KG graph rendered like the world map; player NPC-rename shipped. Phase 4 (item evolution) correctly deferred — needs PO Waystaff+Aevi seed content.
**GM rules EW + FCT — RATIFIED as canon (Erik 2026-07-06, confirmed after reviewing exact wording).** EW (narrate to player's exact words), FCT (established facts permanent + factUpdates + statusNote). No further sign-off pending.

---

## SNG-BATCH-3 — World Liveliness (Erik: run as one batch, 2026-07-06)

**One build arc, phases in order, each shippable green. Content pre-authored at origin: `content/packs/valley/events/random_encounters.json`, `content/packs/core/rules/location_affinities.json`. Results: `po/results/YYYYMMDD_SNG-BATCH-3.md`. Only Aevi closes.**

### PREVIEW-TESTING PROTOCOL (Erik opted in — test in CCode's live preview during dev)
At EACH phase boundary, CCode surfaces a working preview and gives Erik a ONE-SENTENCE test task (non-programmer default — no commands), then waits for Erik's test feedback before marking the phase complete_pending_review. Erik tests UI/flow/feel; suites cover mechanics. Priority: **Erik has not tested combat at all yet** — Phase 1 must let him trigger a fight on demand and verify it.

### Phase 1 — SNG-014 Random encounters (flavored) + on-demand test triggers
- `engine/random_encounters.js`: on travel/rest/enter-location/world-tick, maybe roll one encounter (triggerRules chances in the content file), weighted by flavor × location dangerLevel + tags. Low-danger skews beneficial/benign/beautiful; high-danger skews dangerous/theft/chase/fight; every place keeps a chance of grace (hopeful-strange, not grim).
- Routing reuses existing engines (NO new resolution math): narrative = beat+choice; opposed = one skill check; challenge = staged (encounters engine); duel = combat (encounters engine). theft=opposed (Keen Appraisal/Quiet Step); chase=challenge; fight=duel.
- **HARD guardrail:** any fight/dangerous encounter that can incapacitate MUST present decline/flee before engagement (SNG-002b). Peaceful outs honored (Mediator's Tongue on bandits, Beastfriend ends a creature chase).
- **DEV TEST TRIGGERS (so Erik can finally test combat):** a dev/test affordance in the preview to FIRE a chosen encounter flavor on demand — one button per flavor (beneficial/benign/beautiful/dangerous/theft/chase/fight). Behind a dev flag; not shipped to normal play UI (or tucked in a debug panel). This is how Erik tests a duel without waiting for a random roll.
- Precursor-glimpse flavors stay glimpsed-never-explained (lore canon).
- **Erik preview test (Phase 1):** "Trigger a Fight from the test panel — verify you get a clear decline/flee option BEFORE it starts, that a duel runs in rounds with both health bars moving, and that yielding ends it cleanly." Plus trigger one Beautiful and one Theft to feel the tonal range.
- Smoke: trigger chances + danger weighting respected; flavor spread present; every lethal-capable encounter carries an avoid path; routing dispatches correctly; peaceful-out abilities resolve the encounter; dev triggers fire each flavor.

### Phase 2 — SNG-013 Location skill affinities
- **Type affinity (content ready):** location TAG grants small capped situational skill/attribute bumps (forge→Tinker's Hand+Craft; wild→Wayfinding/Beastfriend, −social; water→Rivercraft; ruin→Stonewise/Old Roads; precursor→Latticespeak/Address-Sense, −spirit; shrine→−Foreclose; market→Keen Appraisal/Mediator's Tongue; settled→Storykeeper/Hearthbinding; high→Prism Sight, −Quiet Step). Surface in the roll receipt ("the forge favored your mending +8").
- **Vector alignment (RATIFIED Erik 2026-07-06: bias general + charged areas amplified):** align eases, oppose hardens; baseline cap ±10, MULTIPLIED by a per-location amplitude (charged places wider — Archive Hollow ×2 → ±20, precursor/ruin/shrine tags amplified). Amplitude derivable from spectrum charge or explicit override (in location_affinities.json). Effective cap clamped 8..24. Perceived only after vectorsKnown (SNG-011); else applied and revealed as "the place favored this." Erik's browser-leg IS the ratification of the feel — if the curve/cap is wrong, Aevi retunes the numbers (self-ratify) or Erik amends the shape.
- **Erik preview test (Phase 2):** "In a strongly-tilted place (e.g. the Archive Hollow), attempt an aligned skill and an opposed one — verify the roll receipt shows the location helping one and hindering the other, and that it never swings more than ±10."
- Smoke: type bonus applies only in tagged locations, capped; vector modifier computed from spectrum vs axes, capped ±10; both shown in the receipt.

### Batch guardrails
Design law 1 (encounters/affinities are engine-computed; GM narrates, never invents mechanics); reuse encounters/resolution engines — no new math except the capped location modifier; additive; content-not-code; lethal-avoidability absolute; this repo never touches the ErikIAm pipeline; suites + parse_probe green per phase.

### Queue after batch
SNG-BATCH-4 = SNG-010C item evolution (content READY) + SNG-015 variable power (content READY) → SNG-001 party remainder → SNG-004+008. Parked pending Erik shape: 3c class-cap, branch-forks; SNG-013 vector-bias curve confirm.

---

## BUILD ORDER (Aevi's call, Erik delegated 2026-07-06)
1. **SNG-BATCH-3** — random encounters + location affinities (incl. ratified vector-bias + amplitude). Biggest felt-variety win; Erik finally tests combat via the on-demand fight trigger. Independent, runs first.
2. **SNG-BATCH-4** — all the ability/progression changes together so they land coherently: SNG-010C item evolution (Waystaff) + SNG-015 variable power + action customization + the three ratified tradeoffs (soft class-cost 2x, branch forks, tier-slot capacity). Phased, each independently shippable.
3. **SNG-016** — 12-axis skill-breadth: Aevi delivers a DESIGN PROPOSAL for Erik's direction first; no authoring until the axis map is agreed. Comes after the batches.
Rationale: world-liveliness first (independent, testable, combat gap closed), then one coherent progression/ability arc, then the breadth rethink done deliberately.

## SNG-BATCH-4 (forming, builds AFTER SNG-BATCH-3) — Item evolution + Variable power

### SNG-010C — Item evolution (CONTENT READY, build)
Waystaff+Aevi seed authored at `content/packs/valley/items/waystaff.json` (registered valley manifest): item `evolution` with `bondSource: aevi`, `coUseTag: cast-with-aevi`, 3 stages (The Instrument / The Staff That Anticipates / The Staff That Answers). Build the item-evolution substrate: items may carry `evolution{bondSource, coUseTag, stages[]}`; a stage unlocks when the linked companion's bond >= stage.unlockBond AND item×companion co-activation (practice ledger, namespaced pairKey e.g. `waystaff+aevi`) >= stage.unlockCoUse. Stage shift changes name/description/bonusTags/narration; GM told the current stage; grants applied additively. Migration: non-evolving items untouched; existing items inert. Smoke: stage gates on BOTH bond and co-use; stage grant applies; non-bonded items unaffected.

### SNG-015 — Variable-power ability use + action customization (RATIFIED, content ready)
Erik ratified 2026-07-06: (1) three steps, (2) Surge carries backlash, (3) auto-default = minimum-needed via sense filter. Content: `content/packs/core/rules/intensity_scaling.json`.
**Part A — variable power (mechanic):** an ability use resolves at Conserve/Standard/Surge. Energy scales (0.6/1.0/1.6x, floored/capped per file), effect scales (effectMod on the roll/effect), Surge carries backlashChance (reuse novel-use/backlash system; on backlash pay health+energy by the ability's Tier from `surgeBacklashByTier`). AUTO picks the minimum intensity that clears the task via the sense filter and NEVER auto-surges. Intensity never bypasses attribute gates or levelReq. Roll receipt shows intensity + energy spent + backlash if it fired.
**Part B — action customization (UI, the interface for Part A):** the GM's canned options AND free actions become tap-to-commit (auto intensity + auto best relevant ability) OR expand-to-tune. Expanding reveals: which ability to apply (from the player's relevant owned abilities) + an intensity dial (Conserve/Standard/Surge) showing energy cost and a Surge backlash warning. Fast path stays one tap; depth is one expand. This is the surface that makes variable power reachable at the choice point.
**GM contract (minor, flag for Erik):** narrate to the chosen intensity (a conserved cast reads different from a surge); intensity/backlash are engine-computed and clamped — GM narrates, never sets them. Design law 1 intact.
**Smoke:** ability resolves at each step with correct energy/effect; auto picks conserve on an easy task and never surges; surge can backlash and pays by tier; canned-option expand exposes ability + intensity selectors; gates/levelReq still enforced under all intensities.
**Erik preview test:** "Surge an ability from the intensity dial — verify the higher energy cost is shown, the bigger effect lands, and that a backlash actually stings when it fires. Then tap a canned option normally and confirm it still just works."

---

## SNG-016 — Skill-system breadth across the 12 axes (DESIGN THREAD, Erik 2026-07-06)

Erik: "the lore talks about more axes... each will need skills." The 12-axis spectrum (emotional_logical, falsehood_truth, demonic_angelic, violence_peace, concrete_abstract, mechanical_spiritual, chaos_order, dark_light, death_life, space_time, body_mind, destruction_creation) is the framework's spine, but the 4 power systems cover only part of it. Rough current coverage: Harmonic ~ mechanical/order; Radiant ~ dark_light/truth; Valley Craft ~ concrete/body/individual; Precursor ~ destruction_creation/space_time/chaos. GAPS with no skills living on them: death_life, violence_peace, body_mind, emotional_logical, demonic_angelic, and chaos_order proper.
**This is a breadth rethink, NOT a batch item yet.** Aevi to develop a design pass with Erik: does each axis get a power system, or do systems each span a few axes; what new thematic domains fill the gaps (a life/death craft? a mind/body discipline? a peace/violence path?); how the axis map shapes origins, the skill graph coloring, and location-vector alignment. Deliver as a design proposal for Erik's direction before any authoring. Do NOT auto-author new catalogs — this one gets thought through first.

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
- **(i) Breadth-vs-depth class cap — RATIFIED (Erik 2026-07-06, SOFT version):** secondary (non-home) class abilities cost 2x skill points; NO hard rank ceiling. Content in skill_capacity.json (crossClass). Stacks with cross-training +1 levelReq. Build with SNG-015/capacity.
- **(ii) Attribute requirements:** each ability gated behind a minimum in its governing sub-attribute, scaling with tier (draft: Tier T needs sub-attr ≥ 2T-ish; rank 3 a step higher). Uses existing sub-attribute pools (20/area, soft-cap knee 4) so gates can't all be cleared — investment becomes the tradeoff. Framework tie: attribute tilt = cosmic-address vector; what you can wield reflects who you've become. — Erik ratifies whether-gated + the curve (resolution-math).
- **(iv) Tier-slot capacity (broad-vs-deep, Erik 2026-07-06 — lead tradeoff mechanic):** a D&D-slot-style capacity table — character level → how many ability SLOTS you hold per Tier, increasing with level (need not match D&D exactly). Each skill point either FILLS a tier slot with a new ability (broad) or RANKS UP an owned ability toward depth (deep); slots cap breadth per tier, finite points force the broad/deep/mixed choice. This can stand as the primary tradeoff even if (i)/(ii)/(iii) are deferred — it alone makes "go wide or go deep" a real decision. Capacity table lives in resolution.json `progression` block (Aevi tunes numbers once Erik ratifies the table SHAPE + growth curve). — Erik ratifies shape.
- **(iii) Branch forks — RATIFIED (Erik 2026-07-06, build):** at rank 2/3, flagged abilities fork — pick specialization A xor B, the other locks. Feeds from SNG-010 branch-templates. Build with SNG-011/skilltree.
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
