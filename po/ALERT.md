# PO Alert — Singularity

**Status:** SNG-BATCH-3 + SNG-BATCH-4 CLOSED GREEN (Aevi 2026-07-06). v1.6.2→v1.6.6, 414 checks, combat + random encounters + item evolution + variable power all shipped and Erik-validated on the live build. Party play (phase 1) live and in active multi-player use (scene saves at origin); fix(party) non-destructive shared-scene + actionable sync errors shipped out-of-band. EW/FCT ratified (walkthrough). 

**SNG-BATCH-5 complete_pending_review (2026-07-10, CCode):** soft class cost + branch forks shipped v1.6.9 (442 checks, verified live). Results: po/results/20260710_SNG-BATCH-5.md. Phase 3 feel-checks OPEN as Erik preview-legs (affinity receipt / surge dial / Waystaff waking + the two new: cross-class cost, fork choice). Only Aevi closes.

**CLOSED GREEN — SNG-BATCH-6 (Foundation) [Aevi close 2026-07-10 · v1.7.2 · 486 checks + parse_probe · live-verified (Teva 3-phrasings→1 node; 6/6 locations poleIntensity) · Erik leg-1 legged→drove the player-allocation merge addendum · codex.js + reconcile.js artifacts confirmed at HEAD · Erik-directed close]:** SNG-019 (Codex entity-resolution) → SNG-022 (Reconciliation engine), in that order. Both specs complete at po/SPEC_BACKLOG.md (`## SNG-019`, `## SNG-022`); engine-only, no content owed; the dependency-spine linchpins that unblock SNG-020/021/024/025. Preview-testing protocol stands (preview + one-line Erik test per phase). **2 test reds RESOLVED + root-caused (2026-07-10, CCode):** NOT the caching restructure (Aevi's suspicion falsified with evidence -- both failed at origin 4d85cc7 with caching absent); actual cause = the 2026-07-07 content wave. (1) catalog 28->117 added ~60 one-rank seed abilities without notFor -> test asserts preserved contract (28+ fully-treed core + all engine-safe; seeds owe full trees -- logged). (2) commit 6bfb98d raised discoveryBonus 10->20, slamming a fixture past the d100 ceiling -> test asserts clamped contract; **OPEN Erik balance-Q: is +20 intended or does discovery near-always ceiling-out?** Suite green. Debt + Q logged in po/SPEC_BACKLOG.md. Suite + parse_probe green per phase. Only Aevi closes.

**SNG-BATCH-6 SHIPPED (2026-07-10, CCode) — awaiting Erik preview-legs before complete_pending_review:** v1.7.1, 475 checks + parse_probe green, live-verified. Results: po/results/20260710_SNG-BATCH-6.md. The 2 reds NAMED + root-caused there (catalog expansion ~28→117 w/ 1-rank seeds; discoveryBonus 10→20 commit 6bfb98d crossing the d100 ceiling) — NOT the caching restructure (disproven at origin 4d85cc7). Erik legs 1+2 PASSED with feedback → allocation layer shipped v1.7.2 (mergeInto any-entry-into-any, suggested-merges w/ not-same verdicts, standing tidy w/ cascade — addendum in results file). Erik re-test: use the suggestions + '⇆ same as…' to gather the remaining Teva entries.

**OPEN LOOPS (not CCode build work):** (a) BATCH-5 awaits Erik's 3 preview-legs then Aevi close. (b) SNG-016 (12-axis skill breadth) is GATED on an Aevi design proposal to Erik — no build until the axis map is agreed.

**SNG-BATCH-8 SHIPPED (2026-07-11, CCode) — awaiting Erik preview-legs before complete_pending_review:** v1.7.6, 550 checks (+19) + parse_probe green, fresh-boot clean. Results: po/results/20260711_SNG-BATCH-8.md. P1 SNG-031 gambit surfacing (isGambitApt heuristic → dismissible Plan-a-gambit hint + .apt Plan button on planning-apt scenes; routine 1–2 choice scenes stay quiet) + SNG-030 completion-XP wire (finishGambit now PAYS completionBonusXp=10 on non-abandoned completion + runs applyLevelUps + shows "+N xp"; abandoned pays nothing; strategist adaptation point now test-covered). P2 SNG-032 narrative time (GM contract timeOps {hoursPassed, why} REPLACES the beat default in applyTurn, engine-clamped 0.25–72h; sleep ~8h, a word ~0.5h, a trek clamps 72h; backward-safe when absent). Reused applyLevelUps/adaptationPointsFor/advanceClock — nothing reinvented; Design law 1 (engine owns award+level+clamp, GM only declares). **RETRACTED FLAG (2026-07-11):** I earlier flagged the "v1.7.0 4-tier prompt cache" entry as a never-built ghost — that was MY error (trusted a stale mid-session note). It IS built + shipped: commit d32b45d, gm.js tierParts→buildTiers (4 stable→volatile tiers, player uncached), claude.js buildSystemArray (1h TTL + fold-forward). SYSTEM_SPEC annotation removed, results-file flag corrected. Only true nuance: prompt_cache_key is kept as call-site intent but not sent on the wire (Anthropic caches by prefix hash; the OpenAI-only param would 400) — correct as-is. No codebase correction owed. Erik one-liners: (1) a many-planning-option scene shows the Plan-a-gambit hint + running a gambit to the end gives +10 xp, while a plain 1–2 choice scene shows no hint; (2) sleeping jumps ~8h, a short conversation passes minutes-to-an-hour, the story's time-of-day matches the clock, travel/rest still advance. Only Aevi closes.

**ACTIVE BUILD — SNG-BATCH-7 (Trustworthy player state)** [running 2026-07-10; Aevi PO] [Aevi PO 2026-07-10; spec in po/SPEC_BACKLOG.md]: player identity + per-character style (seed-from-aggregate) + cross-device load-latest + inventory/quest resolver-hardening. Starts after BATCH-6 closes green -- the reconcile engine's first consumer. Erik-directed.

**ON DECK — SNG-BATCH-9 (Generative living world)** [Aevi PO 2026-07-10; spec in po/SPEC_BACKLOG.md]. SNG-020 living-spine anchor is SPECCED as **BATCH-9 Phase 1** (po/SPEC_BACKLOG.md, 8a83a009): generate(type,context) + NPCs/locations/arcs, engagement-governed personal canon, weight-realness, content-rating with an R+ ceiling; full Phase 2-3 canon/promotion/rating-lens model recorded so the store is built promotable from day one; floors (disallowed + minor-protection) hard-coded at the birth-validator. **ON DECK after BATCH-8** (build-ready 2026-07-10: substrate manifest + NPC/location/arc templates all present at origin; CCode build-step-1 = derive npc/location/arc schemas from corpus, then generate-and-validate; Aevi owes no content). Rating-tone (narrate-to-ceiling) is a pull-forward candidate for earlier R+ play.

**SNG-BATCH-7 SHIPPED (2026-07-10, CCode) — awaiting Erik preview-legs before complete_pending_review:** v1.7.3→v1.7.5, 531 checks + parse_probe green, live-verified. Results: po/results/20260710_SNG-BATCH-7.md. P1 per-character play-style (seed-from-aggregate, reconcile step v3) + identity picker; P2 cross-device load-latest w/ stale-overwrite guard (resolveSaveConflict, both directions, 13 pure checks); P3 quest+inventory resolver-hardening (SNG-019 primitive -> namematch.js shared, never silent-drop, dedupe on load, Quest Log UI). Reused BATCH-6 resolver + reconcile (extracted, not reinvented). Erik one-liners: (1) Cellaceron gains strategist, Usnea doesn't, old chars kept style; (2) phone->computer loads phone's latest (needs sync on both); (3) quest progress->complete + item pickups never vanish, Quest Log matches, dup items stack. Only Aevi closes.

**NEXT BUILD (2026-07-06):**
1. **Finish the ratified-but-unbuilt tradeoffs** (fell through BATCH-4's frozen spec): soft class-cost 2x secondary (content READY: skill_capacity.json crossClass) + branch forks (mechanic specced; needs fork content + skilltree wiring). Tier-slot capacity already shipped (BATCH-2). Small, mostly content-ready — quickest win.
2. **SNG-016 — 12-axis skill breadth:** Aevi OWES Erik a design proposal FIRST (which axes get their own system vs share; what a death/life craft, mind/body discipline, peace/violence path look like; how it recolors the skill graph + origins + location vectors). No authoring until the axis map is agreed. This is the big design direction and it gates a lot.
3. **SNG-004 + SNG-008 — the world-depth content wave:** origins-as-content (incl. unusual-embodiment/ENT), the Heimrún rune shrine (daily omen), the Council of Mavens as petitionable NPCs, framework weave. Highest felt-value new feature.
4. **SNG-001 party remainder:** world clock, codex trading, joint encounters — prioritize by how live multiplayer feels.
Open feel-checks (optional): affinity aligned-vs-opposed, surge dial + backlash, Waystaff waking. Only new GM flag awaiting Erik: INTENSITY narration cue (minor).


---

## SNG-BATCH-5 — Skill-tree tradeoffs (ratified-but-unbuilt) + feel refinements

**One build arc. All content pre-authored at origin. Preview-testing protocol stands (Erik tests feel per phase). Only Aevi closes.**

### Phase 1 — Soft class cost (RATIFIED, content ready)
Wire `skill_capacity.json` -> `crossClass`: learning OR ranking an ability whose powerSystem != the character's home class (origin's power system; precursor is learned-only) costs **2x skill points**. No hard rank ceiling. Stacks with cross-training +1 levelReq. Show the doubled cost in the picker ("2 pts — cross-class"). Smoke: home-class cost unchanged; secondary costs 2x; precursor point-spend after unlock pays 2x if not home; capacity + gates still enforced.

### Phase 2 — Branch forks (RATIFIED, content ready)
Wire `branch_forks.json` -> `engine/skilltree.js`: at a forking ability's `atRank`, present the two specialization paths; the player picks A xor B, the other **locks permanently** for that ability on that character. The chosen path REPLACES the linear rank (its grants/cannot). Forked abilities: prism_sight, sonic_resonance, greenlore, quiet_step, latticespeak (r3 each). Show the fork as a choice in the level-up flow + a lock badge in the skill graph on the unchosen path. Feeds from SNG-010 branch-templates where present. Smoke: fork offered only at atRank; picking one locks the other irreversibly; chosen grants apply; non-forking abilities rank linearly as before; skill graph shows the lock.

### Phase 3 — Feel refinements (Erik's open preview-legs, low-risk polish)
- **Affinity feel:** confirm the roll receipt clearly shows the location helping an aligned skill and hindering an opposed one in a tilted place (Archive Hollow ±20). Tune the phrasing if it reads muddy.
- **Surge dial + backlash:** confirm surge's higher cost + bigger effect + occasional sting read clearly in the receipt.
- **Waystaff waking:** confirm the ✦ stage-advance moment lands when casting with Aevi present.
- These are validation + copy tuning, not new mechanics. CCode surfaces each in the preview for Erik's one-line sign-off.

### Guardrails
Design law 1; content-not-code (forks/costs are content-driven); additive; reuse existing progression/skilltree; no resolution-math change beyond the point-cost multiplier; this repo never touches the ErikIAm pipeline; suites + parse_probe green per phase.

### Erik preview tests
1. "Take a cross-class ability — verify it costs double." 2. "Rank Prism Sight to 3 — verify you're offered Deep Read vs Wide Read and picking one locks the other." 3. Quick feel-checks on affinity receipt, surge dial, Waystaff advance.

### After this batch
SNG-016 (12-axis skill breadth) — Aevi delivers the DESIGN PROPOSAL next, no authoring until the axis map is agreed. Then SNG-004+008 content wave (origins, Heimrún shrine, Council of Mavens, framework weave). Then SNG-001 party remainder (world clock, joint encounters, codex trading) — ranked by how live multiplayer feels.

---


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

## SNG-017 — Character Creation overhaul (world-scale) + SNG-018 Romance (Erik 2026-07-07)

Content for both is largely authorable/authored; the ENGINE pieces are specced here for CCode. Creation is the concrete ask (screen is behind the expansion); romance is likely-engine.

### SNG-017 — Creation screen catches up to the world
The current creation block (app.js ~387–525) is behind: hardcoded origin=valley, 3 origins, only harmonic/radiant/valley_craft abilities, always "Begin in Millbrook", no talents, no Reach traditions, no will-channel. Update:
1. **Origin = area-of-the-world, not just Valley.** Offer origins across the world's detailed areas: Valley of Echoes (unaligned start, the gentle basin) PLUS at least the built Reaches as origins (Quickwood/Palelands, the Riven Marches, the Unspooling, the Somatic Reaches, Gearlands/Numinous, Umbral/Radiant). Origin sets: starting area/location (NOT always Millbrook — follow origin), starting craft access (a Marcher starts with the Edge/Stillcraft; a Rootkin with Vivimancy/Palework; a Valley-native with the folk systems), and starting ability count. Data-drive this from a new `content/packs/.../origins.json` (Aevi authors) so origins aren't hardcoded.
2. **Innate talent step (SNG content ready: innate_talents.json).** Add a creation step: roll or choose one innate talent (weighted heavily to minor). Store on character.talent. Show its effect + notFor. Magician-class talents rare/flagged.
3. **Ability pool reflects the origin's tradition** (not just the 3 Valley systems) — pull from whatever powerSystem(s) the chosen origin grants, using the existing levelReq<=1 filter; group by tradition with Tier badges (already have tierOf).
4. **Optional will-channel affinity (will_expression_modality.json):** a light pick of a native channel (spoken default / born-inscriber / born-direct) that flavors early play; can defer to a v2 if scope tight.
5. Keep the bio/story step and the ✦ weave. Update its hint copy: "the valley" → the chosen area.
**Content Aevi owes:** `origins.json` (origin defs: area, startLocation, granted powerSystems, starting ability count, flavor). Then the screen data-drives from it.
**Smoke:** each origin starts in the right area with the right craft pool + talent; Valley origin unchanged in feel; no hardcoded Millbrook for non-Valley origins.

### SNG-018 — Romance / intimacy track (engine)
Erik: "the game might need some romance too (might be engine)." It is — a relationship track beyond the companion bond.
- **Model:** extend the existing relationship/reputation system with a romance track on eligible NPCs/companions: an affinity that grows through chosen interactions (not just quest completion), gated by consent/character-fit, with stages (rapport → warmth → attachment → committed). Reuse bond machinery where possible; romance is a distinct track that can co-exist with a platonic bond.
- **Content-driven eligibility:** a `romanceable` flag + orientation/fit hints on NPC/companion records (Aevi authors which of the cast are romanceable and how they read). NOT everyone; authored deliberately.
- **GM contract:** romance is player-initiated and consent-respecting; the GM never forces it, reads disinterest, and keeps register appropriate to the surface (claude.ai stays tasteful/fade-to-black; explicit content is out of scope for this surface). Adult, chosen, and declinable always.
- **Tie-ins:** a committed romance can shift a companion's loyalty model (see recruitment: bond beyond pay/purpose); can hook world-arcs (the Redliner/Stillholder lovers at the Marchward; Vesper; Quill).
- **Engine needs:** romance-track state per NPC, interaction hooks that advance it, stage gates, and a consent/interest check the GM honors. Reuses relationship + bond + reputation engines.
- **Smoke:** romance advances only through chosen consenting interaction; disinterested/ineligible NPCs never advance; a committed romance persists and reads in later scenes; register stays surface-appropriate.
**Content Aevi owes:** romanceable flags + read-hints on the eligible cast; a few authored romance arcs (the Marchward lovers as a template).

### Sequencing
Both are medium specs. Suggest: money+Game+recruitment spec (still pending) + SNG-017 creation + SNG-018 romance can form a "systems" batch (SNG-BATCH-6) once Erik greenlights turning from content to systems — they share the relationship/economy machinery. Aevi authors origins.json + romanceable flags as the content half meanwhile.

---

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

**CACHE-GHOST FLAG RESOLVED (Aevi 2026-07-11, verified at HEAD):** the 4-tier 1h-TTL prompt cache IS built/wired/live (claude.js ~L38 + gm.js tierParts/buildTiers, gmTurn ~L228-234, cacheKey "singularity-runtime", commit d32b45d1). CCode's "never built" was a good-faith miss (version-string reasoning, not code). NOT re-pointed — it's done. Only open thread: confirm runtime amortization improved vs the old 0.24x (dashboard check).

**NEXT FAST-FIX (ahead of BATCH-9) — SNG-041 Absolute world dating (one world, one clock)** [Aevi PO 2026-07-11; spec in po/SPEC_BACKLOG.md]: corrected root cause — time is PER-CHARACTER (newClock startDay=1), so Day 8 vs Day 11 are two characters' own counts with no shared reference (the Day-11 event was the Ent character's, correct in its own frame). Fix = shared world epoch + absolute world-day stamped on every event, per-character journey-day kept as flavor. ✅ ANCHOR RESOLVED (Erik hybrid): real-time far world + play-paced local frame + consequence coupling (distant real-timed events that would affect your area/quest cross over). UNBLOCKED — CCode's NEXT BUILD ahead of BATCH-9.

**QUEUED — SNG-042 Legends & Villains** [Aevi PO 2026-07-11; spec in po/SPEC_BACKLOG.md]: power-tiered recurring heroes + villains (epic→riffraff) + dramatic-beat deployment (rescue / witness-power / passing-advice / villain-escalation), threaded via high-weight codex recurrence. RIDES BATCH-9 (after Ph1, best with Ph2). Aevi owes the authored legend/villain anchors before build.

**⚠️ SNG-041 SEQUENCING (Aevi 2026-07-11):** CCode entered BATCH-9 Phase 1 without building SNG-041 (absolute world dating), which was specced to precede BATCH-9. Phase 1 (personal-canon generate) is FINE to proceed. But **SNG-041 is now a HARD GATE before BATCH-9 Phase 2** (offscreen advancement / away-digest = cross-character dated events; without the shared clock they drift like the live Day-8/Day-11 bug, multiplied). Corrected build order: **BATCH-9 Phase 1 (in flight) → SNG-041 (ready, resolved) → BATCH-9 Phase 2 (promoted, build-ready) → Phase 3 / SNG-042.** SNG-041 is the immediate next build after Phase 1.