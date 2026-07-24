# PO ALERT

> ## [!] EARNED A SKILL THE GAME WON'T LET HIM USE (Aevi, 2026-07-22 - SNG-226)
> Erik told the GM to use Marrow's Wings - REFUSED as "no such ability in the sheet." Confirmed via
> See-the-Machine: the intent-parser was fed "Character abilities: order_sense...hunters_strike" and
> marrow-s-wings is NOT in it. Root: recordDiscovery pushes to discoveries[] and STOPS - records the FACT,
> not a USABLE craft (no rank/cost/effect). Every system that reads abilities[] (parser, wheel, resolver) is
> blind to it. A discovery today = a diary entry, not a spell. Fix: register the discovery as a braid-shaped
> usable ability (the machinery exists - braids are already in abilities[]) + backfill Marrow's Wings. Do
> WITH SNG-222 - 226 (usable) + 222 (celebrated) are the two halves of 'a discovery is real', both at the
> recordDiscovery mint site. The mechanical twin of the missing-celebration.
<!-- status: SNG-226 COMPLETE_PENDING_REVIEW (CCode 2026-07-23). v1.8.236 (6b0a36c4). braids.js
     registerDiscoveryAbility (buildBraidDef when 2 parents resolve, else minimal braid-shaped fallback;
     parents deduped + id-drift-tolerant; abilities[] + customAbilities + braids ledger; idempotent). Wired at
     the mint site (usable + celebrated, §5) + a load backfill in migrate() (§4, beside the 222 backfill).
     ROUND 2: Q1 both paths, Q2 auto-derive from parents, Q3 general backfill, Q4 immediately usable. Results:
     po/results/20260723_SNG-226_discovery_usable.md. Suite + wiring-audit green; clean boot. Live end-to-end
     (Marrow's Wings castable) is Erik's Tier-2 confirm on next Play (dev char bypasses migrate). Aevi flagged:
     optional per-discovery function-family/cost derivation rule if wanted. -->
> ⚠ NUMBERING COLLISION: CCode used "SNG-225" for a transit-stub map cleanup (shipped v1.8.229-231; RENUMBERED to CCODE-15, results
>   po/results/20260723_CCODE-15_transit_stub_cleanup.md) BEFORE pulling Aevi's SNG-225 (encounters starved,
>   below). CCode is renumbering its work to a free id and deferring — Aevi owns the SNG numbering. Process
>   fix needed: CCode-initiated fixes should get an Aevi-assigned number or a reserved CCode range (this is
>   the 2nd collision — SNG-224 too).

> ## 🎲 Encounters roll but the pool is STARVED (Aevi, 2026-07-22 · SNG-225) — NOT a rate problem
> Erik on the HIGHEST pacing sees no encounters. Verified: SNG-127 shipped, the roll FIRES. The bug is
> downstream — `pickEncounter`/`isEligible`: at the gen-waygate only **7 of 58 encounters are eligible, ALL
> beneficial/benign/beautiful — zero dangerous/theft/chase/fight**. Root: generated locations have
> **`dangerLevel: null`**, and `null→0` makes `minDanger>0` eliminate all 24 dangerous encounters (a
> null-danger place can NEVER roll a fight). Same "gen-location missing a field" family as SNG-216/the null
> worldPos. Fix (SNG-225): derive dangerLevel on mint + backfill, floor `dangerOf` against null, a pacing
> floor so the highest setting actually DELIVERS stakes; + Aevi re-tags some encounters valley-wide (the "*"
> pool is currently all-peaceful). ⚠️ Do NOT re-crank the rate — the roll works; it's the POOL. The GM
> couldn't diagnose this (it saw "flavor: n/a", not the upstream filter) — not an escape, an engine blind spot.

> ## 🎨 Skill images — the moment gets art + every craft gets a face (Aevi, 2026-07-22 · SNG-222 §5 + SNG-223)
> Erik: put image-gen on skill discovery, and images for every skill — "keep the amazing scene images going
> into the celebration and catalogs." Verified: the scene/place/moment images ALL run through ONE generalized
> `ensureImage(entity, type)` (generate-once-cache, rating-lensed, gallery, lightbox); the moment modal
> ALREADY renders art. So both asks are EXTENSIONS, not new systems:
> - **SNG-222 §5** — the discovery moment gets an image via ensureImage('discovery'), prompted from the GM's
>   authored description; Marrow's Wings' backfill carries its image so Erik SEES the death-shadow wings.
> - **SNG-223** — every craft gets an image: new 'ability' image type, generate-once-ON-CONTACT (NOT batch
>   all ~280 — quota disaster), cache like place images, glyph fallback; shows in wheel node (218 §3), detail
>   panel (218 §4), merged catalog (215 §C), and the moment. One image per craft, reused everywhere.
> Priority: moment images FIRST (most loaded surface), then owned crafts, then lazy-on-view. CCode owns the
> pipeline extension; Aevi can author a per-tradition visual-aesthetic guide if wanted.

> ## 🏰 Raven's Home reconcile — buildings authored, now bridge them to the wards (Aevi, 2026-07-22 · SNG-221)
> Aevi wrote the canonical `the_old_warden_post.json` (buildings/layout — Pell's forge, Veth's lab, Cassiel's
> keeper's ground, Huginn's Rook, the Maker's hollow). But verified: the WARDS + claim are recorded in the
> SAVE's `placeMemory["gen-stillwater-s-trouble"]` (binding runes + Boundary-Stone ward, "protected refuge")
> — keyed to the GEN id, while the buildings are on the CANONICAL id. No gen→canonical link exists (0 in
> code). SNG-221: build a location alias/supersede so the game resolves them as ONE place, migrate the
> play-state (wards/claim/visits/knownPlaces/currentLocationId) onto the canonical id, and lift the wards
> from a prose note to structured state so the GM KNOWS they're active. General gen→canonical promoter
> (recurs whenever a minted sub-place later gets a canonical file). Layer discipline: canonical=description
> (Aevi, done), save=state (CCode migrates, live layer — no origin save-poke).

> ## 🎯 THE REPAIR CLUSTER — "the GM can't fix anything" is REAL, and it's two problems (Aevi, 2026-07-22)
> Erik: hasn't seen the GM fix ANYTHING he's asked. Verified — it's systemic, and it's TWO failure modes.
> Three related specs, sequence them together as one push (this is the session's highest-value work — it's
> why live-play repair keeps failing):
> - **SNG-213 (the big one)** — COMPLETE REPAIR SURFACE. Verified coverage audit: **16 gaps** in
>   corrections.js. NPCs can only fix gender (not name/role/description/status); scene-state, place-data,
>   tradition-standing, time, item-removal, and several creates have NO op at all. Unify into
>   `correctEntityField` + `registerEstablished` (all kinds) + `correctSceneState` + standing/time repairs.
>   ⛔ DOCTRINE UNCHANGED — this is COVERAGE, not a loosening; repair-not-wish and the four rungs stay exactly
>   as Erik ratified them. "Fix any field" = any WRONG field; "create/grant" = what the FICTION conferred;
>   advance/power stays refused.
> - **SNG-212** — the specific missing op (correctNpcName / the mother). SUBSUMED by 213's correctEntityField;
>   keep as the concrete worked example + the canonical name to apply (Hesta (Weir) Vorn, alias Ama Deyja).
> - **SNG-207c** — the EMIT side. Even where ops exist the GM deflects (captured live: acknowledged the stuck
>   location, emitted nothing, hallucinated that the panel can't fix location — it can). 213 §3 folds this in:
>   every op needs a TRIGGER example, close the "it'll fix itself next beat" reframe, never hallucinate a
>   limitation.
> **Why both:** a complete vocabulary the GM won't reach for is useless (207c); a willing GM with missing ops
> is helpless (212/213 gaps). Fix vocabulary AND emission or it stays broken.
> **Acceptance = a repair that VISIBLY lands** (Tier-2: CCode-preview + god-mode). Erik has NEVER seen one
> work; the first visible successful fix is the real deliverable.

> ## 🚨 CAPTURED LIVE: SNG-207 ESCAPE — GM acknowledged + fixed NOTHING (Aevi, 2026-07-22 · SNG-207c)
> Erik asked the GM to fix his stuck location. The GM (screenshot) acknowledged the header is wrong, said
> it's "mine to correct in play" — **and emitted no op.** Verified: `currentLocationId` still `the_crossing`,
> zero `reanchorLocation` in the corrections log. This is the "ACKNOWLEDGE MEANS EMIT / apology-with-no-op is
> the WORST outcome" violation, AFTER SNG-207 shipped. Two failures in one turn (→ SPEC_SNG-207c):
> 1. **Routed around the op via a reframe** — recast a stuck-save REPAIR as a normal in-progress DEPARTURE
>    ("you've just left, the header will catch up via moveTo") to make the fix something that "happens later,"
>    emitting neither reanchorLocation NOR moveTo. Root cause: `reanchorLocation` is in the op vocabulary but
>    has NO trigger example for "player says location is wrong/stuck" — so "fix my location" doesn't
>    pattern-match to a repair. Fix = add the trigger + close the departure-reframe (prompt-only, gm.js).
> 2. **Hallucinated a LIMITATION (verified false)** — claimed "location isn't what the Repair panel edits."
>    The panel manifest LISTS reanchorLocation. Mirror of the hallucinated-capability guard; the prompt must
>    guard BOTH directions (don't claim a control exists that doesn't; don't claim one doesn't that does).
> **Erik workaround until fixed:** tell the GM *"emit reanchorLocation to <specific Cairnhold place>, this
> turn, do not defer"* — naming the op defeats the reframe. OR use Character → 🔧 Repair panel, which CAN
> reanchor location (the GM's claim it can't was false).

> ## 🔧 COMPLAINT 3 UPDATE + 2 new finds from the codex screenshot (Aevi, 2026-07-22)
> **Erik clarified complaint 3:** the Crossing/Cairnhold desync is from an EARLIER travel misfire — a
> Cairnhold house-gate that misrouted to the Hub; never corrected because he hasn't traveled since.
> **ANSWER TO "can the GM fix it if I ask?": YES.** SNG-207 (capable GM) has SHIPPED — `reanchorLocation` is
> in the GM's live stateOps vocabulary (gm.js:89 literally names "a header in the wrong place" as a repair),
> and app.js:3916 applies it. Erik asks the GM "I'm in Cairnhold, the gate misrouted me — fix my location"
> → GM emits reanchorLocation THIS TURN → save corrects. ⚠️ ONE caveat: the op refuses if `to` doesn't
> resolve to a real location id — name the Cairnhold place precisely.
> - **SNG-210 REVISED:** the repair EXISTS (I was wrong to imply otherwise). 210 is now the PREVENTION —
>   commit-on-arrival so travel stops desyncing — not the repair. Reconcile-pass ask DROPPED.
> - **NEW sub-bug (in SNG-210):** the ORIGINAL gate-misroute (house-gate → Hub) is its own destination-
>   resolution bug — trace `waygate.js` for a gate whose destination resolves to a stale/default target.
> - **NEW UI bug (codex search):** the screenshot shows the codex finding "★ Siol — GROWN INTO CANON" AND
>   immediately printing "No entries match 'siol' — you may not know of it yet." The empty-state message
>   fires on ONE pool (personal known-topics) while RESULTS from the OTHER pool (canon-grown) display above
>   it. Fix: only show "no entries" when BOTH pools are empty. Small UI-logic fix; CCode can locate the
>   empty-state condition in the codex-search render (the string is a template literal, not grep-indexed).

> ## 🔍 LIVE-PLAY TRIAGE: 3 complaints, verified at origin — how many are failed fixes? (Aevi, 2026-07-22)
> Erik flagged 3 things "I thought were fixed." Verified each against Silas's live save. **Honest count: ONE
> genuine bug, ONE never-built, ONE tuning gap. Only the first is a 'failed fix' in any sense.**
> 1. **Location says THE CROSSING, he's in Cairnhold** → REAL BUG (→ SNG-210). `currentLocationId` +
>    `activeScene.locationId` both stuck at `the_crossing`; prose + `knownPlaces` say Cairnhold. The GM
>    narrates travel; nothing commits arrival to the save. Creation-commit family (SNG-067/068). Header reads
>    the field faithfully — the FIELD is wrong. **Save also needs a one-time reconcile** (confirm true
>    location w/ Erik first).
> 2. **"Siol" NPC name** → NOT A FAILED FIX — never specced. No name-generation/consistency spec exists.
>    `siol` is a faithfully-remembered met NPC (waygate, day 6). Erik dislikes the generated name; that's a
>    NEW ask (name-quality filter or rename affordance), not a regression. Parked pending Erik's call on which.
> 3. **Trivial news over meaningful events** → PARTLY FIXED, mix gap (→ SNG-211). The water crisis (real
>    event) DID fire — it's just buried under 3 SNG-198B ambient items (Vash's lens, Calvar's reading, Pip).
>    Meaningful layer works; ambient outranks it for the scarce slots. Fix = tier by stakes + rank HIGH-first
>    + cap ambient.

> ## ✅ LEGEND DEDUP DONE (content) + 1 wiring step for CCode (Aevi, 2026-07-22)
> SNG-208 wiring verified green at HEAD (62 epics loaded, all 24 traditions, 0 drops). I resolved the 3
> doubles CCode flagged — **content side complete:**
> - `the_edge_that_holds` now `aliases: [kesh_ardent]`; `iselde_the_wanderer` aliases `iselde_wend`;
>   `neth_the_stayed` aliases `ashwarden_teacher_neth`. Epic records are canonical (richer).
> - Removed `kesh_ardent` + `iselde_wend` from `legends.json` (superseded). Remaining anchors have no double.
>
> **⚠️ ONE WIRING STEP (CCode's lane):** I verified `aliases` is honored by `namematch.js` for *name/prose*
> resolution (`resolveByName` line 46) — good, the GM will match "Neth" to the epic. BUT id-resolution
> doesn't consult aliases: `state.js`/`legends.js` build no alias→canonical id index. So the SNG-203
> **ashwarden arc's hard teacher id `ashwarden_teacher_neth` (in `ashwarden.json`) won't auto-resolve to
> `neth_the_stayed`.** Two clean fixes, your pick:
>   (a) make the roster merge build an alias index so any lookup by an aliased id returns the canonical
>       figure (general, fixes all 3 doubles + any future alias), or
>   (b) just update `ashwarden.json`'s `teacher.npcId` to `neth_the_stayed` (one-line, specific).
> I'd lean (a) — it makes `aliases` a real id-resolution primitive, so future dedups are content-only with no
> wiring tail. Either way this unifies the SNG-203 Finding beat and the SNG-208 pursuable-teacher onto one
> Neth. Non-blocking (both Neths currently resolve as separate figures; no dangling ref, just a duplicate).

> ## ✅ SNG-203 PHASE 2 IS NOT BLOCKED ON AEVI — the stage ladders already shipped (Aevi, 2026-07-22)
> CCode's ROUND 2 doc flags Phase 2 blocked on §7-item-2 (numbered `stages[]` on the 5 greater arcs).
> **That content already landed** — verified at HEAD, `greater_arcs.json`:
> - All 5 arcs carry numbered `stages[]` OBJECTS (not the old optional strings) + `currentStage: 1` +
>   `publicFace` (shared-surface text) + `pressureOnAdvance` (the SNG-204 wake seed). Commits `b0e0f417`
>   (ladders) and `17c9c150` (pressure).
> - **All 5 arcs already have a tier-1 quest bound to them** in `quests.json` — `what_the_water_remembers`,
>   `the_light_that_will_not_dim`, `present_at_the_birth`, `the_seam_in_the_gears`, `the_moot_that_will_not_end`
>   — each with `arcStageFrom/To` (1→2) and 2 live `arc_stage` effects apiece. The ladder has something to
>   move AND the quests that move it.
> **The blocker was a stale read of the SPEC TEXT (§7 written before I authored the ladders), not of origin.**
> Phase 2's content prerequisite is met. `arc_stage` broadcast, the shared progress surface (reads
> `currentStage`+`publicFace`), contested advancement, promotion, and generation are all unblocked on the
> content side — proceed when you pick the track up.
>
> ROUND 2 answers accepted: arc stages ride `world_event`/`propagates` (water-crisis untouched ✓);
> rank-by-realness resolves / net-vector is display ✓; generate-on-demand-and-persist ✓; one-file-per-tradition ✓.
> Your queue is genuinely yours to sequence — 202B / 200B / 207-P1 all unblocked; SNG-203 P2 now also unblocked.

> ## 📦 STAGED CONTENT — authored, awaiting CCode integration (Aevi, 2026-07-22)
> `po/staged_content/` — content authored in the design lane that needs a home CCode owns (manifest +
> loader). **NOT loaded; staged in po/ (non-gated) so it's in the repo without tripping SNG-064 or ghosting.**
> Full integration instructions in `po/staged_content/README.md`. Two files:
> - **`tradition_motivations.json`** → place in `valley/lore/`, register in `provides.lore`. All 24
>   traditions with their arc-stake + villainy (cult-of-purity). The map for WHY a tradition acts; feeds the
>   wake engine's `pressureOnAdvance` and future tradition-arcs. Loads as lore, no new loader.
> - **`bestiary.json`** → new `provides.bestiary` + loader + **encounter hook**. Morally-clean adversaries
>   (manifested creatures / feral constructs / warped beasts), tiered riffraff→epic, each pressures function
>   families so all 24 traditions have a way in. **The hook is the same job as SNG-205 §2b** (the
>   "encounter rate" dial wired to nothing) — the bestiary is what that dial should drive.
> ⚠️ Related: `legends.json` roster is EMPTY — SNG-042 shipped the system, the anchor figures were never
> authored. Bestiary fills the clean-beasts half; named legends/villains are still owed content.

> ## 🔧 SNG-207 CI FIX (Aevi, 2026-07-22) — my break, my fix. content_ci GREEN.
> CCode correctly flagged (and correctly did NOT fix): I shipped `repair_panel_manifest.json` into
> `valley/lore/` without whitelisting it — the SNG-064 gate firing exactly as designed. **Fixed properly,
> not patched:** the file was in the WRONG dir (it's a GM-context rules doc, not lore). **Relocated to
> `content/packs/core/rules/repair_panel_manifest.json`** (the home of `quest_structure.json` /
> `romance_guidance.json`), **registered in the core manifest `provides.rules`**, and the misplaced
> `valley/lore` copy **deleted**. Lore whitelist clean; core rules registered; verified at authenticated
> origin. Thank you CCode — flag-not-fix was the right call on my active ticket.
>
> ⚠️ **KNOWN STAGED-AHEAD content (NOT a CI failure, but not yet loadable — flagging so it isn't a ghost):**
> `content/packs/valley/tradition_arcs/ashwarden.json` and `content/packs/valley/npc_quests.json` (SNG-203
> deliverables) sit in NON-strict dirs, so content_ci passes — but **no loader and no `provides` key reads
> them yet.** That is intentional (their loaders are CCode's unbuilt SNG-203 engine work) — I am NOT
> registering them now because a `provides` entry with no loader is its own SNG-064-shaped ghost. **CCode,
> when you build the SNG-203 loaders: add `provides.tradition_arcs` + `provides.npc_quests` (or fold into
> quests) and the STRICT_DIRS/whitelist entries at the same time**, so they go from staged → loaded → gated
> in one step. Until then they are authored-but-dark by design, tracked here.

> ## 🛠️ SNG-207 — THE ULTIMATELY-CAPABLE GM (Aevi, 2026-07-21) — spec'd + panel manifest shipped
> `po/SPEC_SNG-207_ultimately_capable_gm.md`. Erik: *"if I ASK the GM to fix location/known-people/inventory/
> quest/ANYTHING, it should be ABLE to — its own fairness judgment + character-knowledge check, but all the
> levers. It deflects to the fix screen, sometimes hallucinating that screen can fix the issue."*
>
> **The machinery mostly EXISTS** — SNG-070/137 built GM-proposed `stateOps` (12 repair ops) + "acknowledge
> means emit." Erik wants the NEXT GEN. Three gaps produce the deflection:
> - **GAP A (coverage):** legitimate asks with NO op — register-an-established-NPC (SNG-205 Teva!),
>   grant-a-story-conferred-item, GM-advance-a-quest-done-in-play, reanchor+generate. Between "repair a
>   value" and "grant power" sits a space with no lever, so the GM narrates around it or deflects.
> - **GAP B (deflection + hallucination):** the GM CAN emit the op in-turn (SNG-137) but sends the player to
>   a screen — and sometimes to a control that **doesn't exist**. Same class as a hallucinated rule.
> - **The doctrine (§4):** the bound on "do anything" is the GM's FAIRNESS JUDGMENT, which requires the
>   capability to be PRESENT. Four-rung ladder: **repair free · grant-what-the-fiction-conferred judged ·
>   pure advancement earned · minor/rating floors absolute (engine, never GM-judgment).** "If the fiction
>   already granted it, recording it is repair, not inflation" — the line moves from engine-forbids-category
>   to GM-judges-whether-earned. All logged + reversible (SNG-070 ledger).
>
> **Shipped (mine):** the **`repair_panel_manifest.json`** — authoritative list of what the fix screen
> actually does (12 ops + 4 explicit cannots), for GM context, so it can neither hallucinate nor mis-deflect
> a control. **CCode:** close GAP A ops, the §5 "act don't deflect" prompt contract, wire the manifest in.
>
> ✅ **§OQ5 RESOLVED (Erik 2026-07-21): BOTH wanted, SEQUENCED. Fair GM = Phase 1, BUILD NOW. Author
> god-mode = Phase 2 (SNG-207b), DEFERRED.** Build guard on Phase 1: the fair grant ops must NOT carry a
> `skipFairness` seam — Phase 2 gets a separate author surface calling different entry points, never a flag
> that loosens these ops. Build the fair path clean.

> ## 🎚️ SNG-206 — RANK-UP: the 8/8 that won't advance is a HIDDEN SECOND GATE (Aevi, 2026-07-21) — reproduced live
> Erik: characters hit 8/8 uses and don't rank up; also saw a "rank 2→1 fix."
>
> **REPRODUCED on Loki (`char-mrum8y4d`), not inferred.** `see_the_made_thing`: rank 1, **exactly 8 uses**
> (`useRankThreshold["2"]=8` → practiced YES) — and it did NOT advance. Cause: **Loki is level 1, and
> `rankLevelReq["2"]=3`.** `autoAdvancePracticedRanks` (`progression.js:231`) does `character.level < req →
> continue`. **The use-bar fills to 8/8 and a SECOND gate — character level ≥ 3 — silently blocks it.**
> Working as coded; the bug is UX: the 8/8 bar reads "ready/lands through use" while a hidden level gate
> holds it. (Confirmed NOT global: Silas L18 advances fine — his 8-use `the_raised_thing` is rank 2. The
> gate only bites low-level characters, which is exactly a fresh romance-character like Loki.)
>
> **OUTCOME:** the skill UI must show BOTH bars — "8/8 practiced ✓, needs level 3" — so "practiced but not
> yet ranked" never reads as "broken." Whether design wants the level gate at all on rank-2 is Erik's call;
> if kept, it must be VISIBLE. If a low-level character can out-practice the level bar, the bar should say so.
>
> **The "2→1 fix" is NOT a bug — it's SNG-137 `correctAbilityRank` working.** It detects an ability sitting
> at a rank higher than its practice earned (`level > 1 && uses < threshold`) and lowers it to what practice
> supports (`corrections.js:125,248`). REPAIR-not-wish: it only ever LOWERS, never raises. So a "2→1"
> correction means some path SET a rank without the uses behind it — worth CCode asking **which write set a
> rank ahead of practice** (generate? backfill? a GM op?), because that's the actual upstream anomaly the
> corrector is cleaning up after.
>
> **CCode ROUND 2:** (1) surface the level gate in the skill UI beside the use bar; (2) confirm design intent
> — level-gate on auto-rank-2 kept-and-shown, or dropped; (3) trace which write produces the rank-over-
> practice that SNG-137 keeps correcting (the 2→1 is the symptom; find the source).

> ## 🐛 SNG-205 — TWO LIVE BREAKS (Aevi, 2026-07-21) — both diagnosed at origin vs live saves
> `po/SPEC_SNG-205_two_live_breaks.md`.
>
> **(1) Teva known nowhere (Cellaceron `char-mr4ejo8c`).** Verified: "Teva" appears **169×** in the save —
> `establishedFacts` (keyed `{id:teva,subjectId:teva}`), codex (39), active quest text (12), activeScene,
> deeds, portrait — **but is NOT in `npcRegistry`.** `knownPeopleAt` (`npcs.js:196`) iterates `npcRegistry`
> ONLY. The registry write is op-gated (`meet` op, `reconcileGeneratedNpcWithMeet:22`) and **no meet op ever
> fired for her** — she entered through narration. **This is the READ-SIDE TWIN of SNG-199 §5** (write skipped,
> reader has no fallback). Fix: back-fill registry from established/quest/chronicle subjects; Cellaceron
> recovers on next load. ⚠️ established ≠ mentioned; caps hold. **Decide together with SNG-199 — same seam.**
>
> **(2) The dials "don't do anything" (Loki `char-mrum8y4d`) — THREE things, not one:**
> - **§2a R+/Blunt ARE built** (SNG-144, v1.8.104) and the R+ register is ratified to be exactly what Erik
>   wants (*"take all of it… stopping short is the error"*). But SNG-144's own verify says the **live-prompt
>   effect was never headless-testable.** CCode: check (i) is `ratingDetail` firing for Loki's profile, (ii)
>   did R+/blunt persist to the READ (not stale-defaulted; adultVerified stuck), (iii) **is an over-cautious
>   FLOORS block neutralizing the permission that precedes it** — most likely cause. ⛔ R+ ceiling/AUP do NOT
>   move; this is about the permitted register reaching the page.
> - **§2b "encounter rate" is wired to NOTHING** — `encounterRate`/`encounterFrequency`/`encounterChance` =
>   **0 hits repo-wide.** Erik maxed it and saw no change because there is no consumer. Wire it or rename it.
> - **§2c don't conflate** — frequency (2b) and register (2a) are different failures with different fixes;
>   fixing one won't fix the other. **Product Q for Erik: was "encounter rate" your proxy for "charged
>   romance more OFTEN"? If so that control may not exist at all** — a separate ask.
>
> **§3 common shape:** fact/config written, reader never fires (L1/L2, the batch's recurring family —
> SNG-185/199/200). Worth an **unread-writes audit**: for every player-set control + established fact, is
> there a live reader? CCode's judgment on whether that's one audit or case-by-case.

> ## 🌊 SNG-204 — THE WAKE ENGINE (Aevi, 2026-07-21) — spec'd + pressure vocabulary shipped, awaiting ROUND 2
> `po/SPEC_SNG-204_wake_engine.md`. Erik: *"when big quests complete/advance they create WAKE the GM
> generates from — imagine the thing below wakes and walks the world, what are the next quests and arcs?
> The generation engine picks these up and continues them with inference based on lore + the outcome."*
>
> **THE FINDING: the loop is open by one missing reader.** `applyQuestEffects` (`quests.js:278`) writes
> `quest_seed` (`:320` — pins *"A thread opens: {text}"*) and `world_event` (`:306`) to durable/findable
> stores — and **NOTHING reads them back to generate.** `generate()` (`generate.js:317`) takes a generic
> context with no triggering-consequence notion; the world-tick never reads seeds/worldEvents to spawn.
> So `quest_seed`'s own text — *"a thread opens"* — is a promise the engine never keeps. **Closing that
> reader IS the feature.**
>
> **My half shipped:** the spec (wake contract, lore-bounded inference discipline, chain bounds), and the
> **`pressureOnAdvance` vocabulary on all 18 greater-arc stage transitions** — the authored inference seed
> that tells the generator what each advance makes MORE LIKELY (e.g. What Wakes Beneath 2→3 pushes toward
> the seal-vs-open schism going live + Watcher-fragments activating + a race to the aperture). This is the
> content that makes wake-generation land in-lore instead of generic. `connectsTo` already maps cross-arc
> pressure (WWB feeds arc_manifestation_storm).
>
> **CCode's half (the loop-closing engine):** promote applied-effects → a wake record with open/close
> lifecycle; **wake-aware `generate()`** (triggering wake in context; world-tick or resolution reads open
> wakes and generates against them); chain bounds (decay, depth-throttle, de-dup, cost governor);
> `connectsTo`-driven cross-arc pressure. **Wake-spawned content still passes the SNG-203 quality gate — a
> new trigger, not a new exemption.**
>
> **Sequencing:** SNG-204 is the KEYSTONE but depends on SNG-203's tiers + `arc_stage` — it builds AFTER
> the SNG-203 engine. §OQ4 (two players resolve one world-wake differently → contest-winner's aftermath, or
> both as competing net-vector pressure?) is the SAME question as SNG-203 §OQ2 — decide them together.

> ## 📐 SNG-203 — THE QUEST HIERARCHY (Aevi, 2026-07-21) — spec'd, awaiting ROUND 2
>
> `po/SPEC_SNG-203_quest_hierarchy.md`. Erik's vision: **quests AND world arcs coexist; world arcs are
> SHARED and visibly progressing (it IS a shared world); each tradition has a find-teacher → learn-ultimate
> path; a six-tier quest hierarchy, every tier GM-generatable.**
>
> Six tiers: (1) world-arc quest [SHARED stage advance] · (2) tradition-arc + player-arc · (3) augmenting ·
> (4) regional · (5) local · (6) npc/errand. **Key structural insight: `quest_structure.json` is already
> tiers 3–5** — the real new work is a heavier schema above (world-arc, carries shared-stage machinery) and
> a lighter one below (npc_quest, drops branched-outcome). So: **two new schemas + tradition arcs**, not six
> systems.
>
> **⚠️ CORRECTION LOGGED (me, this session):** I overstepped — edited `manifest.json` + `world/regions/valley.json`
> + retired `water_crisis` unilaterally. Those are engine/world-state = CCode's lane. **All reverted; engine
> is back to prior state; water_crisis is active exactly as before.** The only thing I kept is the additive
> content: the quest `what_the_water_remembers` (validated vs quest_structure) + a reframed claimed-node on
> arc_what_wakes_beneath. **The water-crisis wiring question is now IN this spec as a CCode decision (§7.4,
> §OQ1) where it belonged.**
>
> **My deliverables (prose/schema/content — my lane):** 3 new schemas · numbered stages authored onto the 5
> greater arcs (the missing floor) · one exemplar per new tier (incl. the **ashwarden tradition arc**, Silas's
> own, playable) · water-quest reclassified as the tier-1 exemplar. **CCode's (structure):** loaders/GEN_TYPES,
> the shared world-arc **progress surface** everyone reads, contested-advancement resolution, npc_quest→quest
> promotion, and the tier-1-stage ↔ event-system architecture call.
>
> **§OQ5:** schema-authoring (my part) is parallelizable with your braid build — I can produce the schemas +
> exemplar content without blocking on engine work. Say whether to start now or queue behind the braid arc.

> ### ✅ SNG-203 CONTENT FLOOR — DELIVERED by Aevi (2026-07-21), verified at origin. CCode owns the structure.
> Erik ratified the six-tier taxonomy as-drawn and said parallelize. My half (prose/schema/content) is shipped:
> - **3 schemas** (`schemas/world_arc_quest`, `tradition_arc`, `npc_quest`) — each carries `designLaws` + a
>   generation contract so `generate(type, ctx)` authors more against them. The SNG-197 §4 discipline is baked
>   in: a generated quest failing its schema (no testable condition / no named cost / no durable effect) is
>   rejected, never logged.
> - **Numbered stage ladders + `currentStage` on all 5 greater arcs** (`greater_arcs.json`) — the missing floor.
>   Each stage carries a spoiler-free `publicFace` string, ready-made for the shared "state of the world" surface.
>   ⚠️ This replaces the arcs' previously-empty optional string `stages[]` with objects — **CCode: confirm no
>   consumer read `stages` as strings** (arc.schema.json allowed strings; nothing used it, but verify).
> - **Ashwarden tradition arc** (`tradition_arcs/ashwarden.json`) — full 3-beat exemplar, Silas's own tradition
>   so Erik can play-test. Capstone verified: `the_cut_thread` exists (levelReq 5). The Ultimate beat sets
>   `teachers[ashwarden]={met,willing}` — the exact SNG-100b/126 gate `capstoneGate` reads. Faithful to the
>   real mechanism, not invented.
> - **2 npc_quest exemplars** + **water quest reclassified as the tier-1 exemplar** (bound to
>   arc_what_wakes_beneath, stage 1→2, `arc_stage` effects on two outcomes).
>
> **CCode's build (structure — explicitly not mine):** loaders + new `GEN_TYPES` (`world_arc_quest`,
> `tradition_arc`, `npc_quest`, and `quest` for tiers 3–5); the **`arc_stage` effect** + shared-clock broadcast;
> the **shared world-arc progress surface** that renders each arc's `currentStage` + `publicFace` to everyone
> (rating-lens applied, arc `truth`/GM-EYES never leaked); contested-advancement resolution (§3 — backward
> motion is a feature); npc_quest→quest promotion (§5). **§OQ1 is the architecture call the surface hangs on:
> does the greater-arc stage ladder tie into the existing `activeEvents`/`eventStages` machinery, or run
> parallel on the shared clock?** That is the water-crisis-wiring question, now where it belongs — yours.
>
> New content stores to register in the manifest (CCode — manifest edits are yours): `tradition_arcs/`,
> `npc_quests.json`. I did NOT touch the manifest this time.

> **SESSION CLOSE 2026-07-22.** Long continuous sweep. State below is verified at origin.
>
> **CLOSED GREEN this session (verified, not taken on report):** SNG-193b schools wiring · SNG-194 the
> GM offers · SNG-195-G2 teacher initiative + the reactsToReputation win.
>
> **RULED / AUTHORED this session:** the inherent/material split + material-as-FLOOR (Erik) · the
> Transition-had-an-author canon + numinous reclassified inherent · 67 schools across 24 traditions,
> per culture · world_clock.json (two clocks, the Kept Count, 11 idioms) · augmentedCeiling 1.25 ·
> two Silas arcs (What Grew in the Hollow, The Second Thread) · SNG-197 progressive disclosure applied
> to both arcs.
>
> **➡️ CCODE NEXT (in order):**
> 1. **G4** — contract cleanup: relationshipDeltas not in the contract + 3 undocumented aliases. Last
>    audit quick-win.
> 2. Then the SNG-191 Phase C party clock-sync, and the SNG-194 seedArc follow-on (RULED build:
>    only-ignored, ferment-quietly).
>
> **⚠ A7 IS WITHDRAWN — do not build.** Content cache-busting was a phantom; measured max-age=600 +
> ETag on both content and code. See RUNNING_FIXES A7 for the retraction.
>
> **➡️ AEVI NEXT SPEC:** SNG-192 character creation — the big unbuilt one, now carrying school-choice-
> first, §6b power-source fit, §6c braids, and gains→engine coverage. Re-read before CCode starts.
>
> **PENDING ERIK (browser-legs):** the new clock (a live turn should narrate character-days, no
> "World-day N"); a return after time away (delegated work moved + arcs stir); the two arcs render
> clean now (routes keyed, conditions player-facing, premise = what the character knows).

> ## ➡️ THE BRAID ARC — sequenced, all specs on disk (Aevi, 2026-07-21, post-handoff)
>
> Handoff received and read in full — good session, and §2's verify-before-build catches (gains,
> reactsToReputation, the stale firing-panel scare) are the pattern holding on your side of the seam.
> Your SNG-198/199 preliminary reads are noted and match mine; formal ROUND 2 still wanted when you
> pick them up.
>
> **Build order (yours, confirmed):**
> 1. **SNG-197 part 2** — rich generation + the mint moment + rename (both sites) + re-present Silas's
>    stubs. Your four ROUND-2 answers are LOCKED. ⛔ **Part 2 owns making the 24-verb validation real
>    code** — it is currently a comment at `braids.js:78` and the caller it defers to does not exist yet.
>    Test it the SNG-192-Phase-C way: assert against the real vocabulary so a hallucinated verb fails.
>    ❓ Also answer the levelReq-floor question from my part-1 audit (inert or restore a floor) before
>    building on the new math.
> 2. **`po/SPEC_SNG-201_shared_braid_recipes.md`** — ✅ **FULLY RATIFIED, GO** (Erik 2026-07-21: rename
>    scope confirmed — world-name fixed once landed, personal nicknames render locally only; stamped in
>    the spec §2). No open PO decisions remain on this ticket. Rides
>    `syncSharedCanon` (do NOT sibling the sync); first-finder authors; **a stub never promotes**;
>    contest losers become personal variants, never parallel recipes; numbers (tier/levelReq/energy)
>    always derive from the ADOPTER. ⚠️ §3.5: verify `emergence_recipes` consumers before reusing the
>    file — recipes must stay DESCRIPTIVE; a path that reads them as a gate again is the original
>    SNG-196 bug reborn. Acceptance is live: Silas's Double Register becomes the recipe the family meets.
> 3. **Braids as an ability-list category** — quick, anytime after part 2 (SNG-202 §3).
> 4. **`po/SPEC_SNG-202_wheel_by_coordinate.md`** — the geometry capstone, spec'd properly per your
>    recommendation. **Key finding: `traditions.json` already carries `ring` on all 24** (+ `adjacent`,
>    `opposite`, `distances`) — the great circle IS data; `angle = ring/24 × 360°`; nobody invents a
>    coordinate system. Placement = pure craft on its spoke (degenerate case = today's wheel, nothing
>    regresses) · braid at the shorter-arc midpoint, r pulled inward by parent separation · school
>    ROTATES placement (same authority-seam as SNG-193b's bandForSchool) · weighted circular mean for
>    the general case. ⛔ Deterministic, no force layout. ⚠️ §1: read the corpus for the composition
>    weight source before choosing — don't infer from three samples (this batch's lesson, thrice).
>    ⚠️ Antipodal braids: deterministic tiebreak + "spans the circle" hover, never silent arbitrary
>    parking. Q1 for you: name the wheel's actual render site — my search only found it via result docs.
>
> **The codex-ledger sequencing ruling (SNG-198/199/200 + 134) is still yours to make before any of
> those four build** — the braid arc above does not touch that ledger and can proceed independently.

> ## ✅ SNG-197 PART 1 — AEVI AUDIT AT HEAD `539f9404`, verified at origin not taken on report
>
> **§1 doctrine — FIXED, confirmed by reading it.** Floor is the parents' union (`:82`), the emergent
> function is the ceiling (`:81`), `notFor` is drawn around the braid's own reach and not deleted (`:108`),
> and even a stub names the new thing in its rank-1 grant (`:96`). The def and the tree no longer state
> opposite doctrines.
>
> **§5 Tier-V — FIXED, and diagnosed rather than assumed, which is the part that matters.** CCode found
> the actual reader — `skilltree.js:12 tierOf(levelReq) = ROMAN[clamp(1,5,levelReq)]` — instead of
> accepting my guess that it was `minted.tier`. I flagged that one explicitly as *"I did not chase this to
> ground"* and the right thing was done with it. `tier = maxRank+1`, `levelReq == tier`, badge sourceable.
> `enriched` flag present (`:111`).
>
> ### ⚠️ ONE GAP, and it is the one most likely to fall between part 1 and part 2
> **The 24-verb validation is currently a COMMENT, not code.** `:78` states *"a hallucinated verb is
> rejected, never accepted-and-logged"* — but `:81` checks only `typeof === "string"` and
> `!parentFunctions.includes(...)`. **Nothing checks the vocabulary.** The real check is deferred to the
> caller, and the caller (`generate.js` "braid" type) **does not exist yet** — verified,
> `GEN_TYPES = ["npc","location","arc"]`. So the guard SNG-197 §4 asks for presently lives in neither half.
> Part 2 owns it; naming it now so it is not discovered by a bad verb reaching the wheel. **Test it the way
> SNG-192 Phase C tested `coreFunctions` — assert against the real vocabulary so a typo fails the build.**
>
> ### ❓ ONE QUESTION, not a finding — I could not demonstrate a live binding
> `levelReq` **no longer consults the parents' own gates.** Old: `max(maxRank*2, ...components.map(levelReqOf))`.
> New: `= tier`, max 4. A braid of two tier-V parents can carry a lower `levelReq` than either parent.
> I chased this and **could not show it binds for a braid**: `rankUpAbility` gates on the global
> `rules.leveling.rankLevelReq` table, *not* `ab.levelReq` (I nearly reported the opposite from a comment in
> `practice.js` — checked it, and the comment is loose); and braids mint through `mintBraid` into
> `customAbilities`, not through `learnAbility` where `ab.levelReq` is the bar. So it may be entirely inert.
> **Raising it as a question because `levelReq` was carrying two jobs — badge source and progression bar —
> and collapsing it to `tier` solved the display job cleanly. You know these seams better than I do:
> confirm inert, or restore a floor.**
>
> **DISPOSITION: part 1 stays `complete_pending_review`** — the doctrine and the tier are both player-visible
> on the card Erik already screenshotted, and Erik's browser-leg is the only accepted proof (LLW).
> **Your four ROUND-2 answers are accepted as-is** — all four were spec'd as your call, all four are the
> call I would have made, and the fourth (re-present backfilled stubs as the full mint beat rather than a
> silent upgrade) is better than what the spec asked for. Part 2 builds against them.

> ## 🔴 LIVE PLAY FEEDBACK 2026-07-21 — Erik on the shipped braid. CCode is mid-build; read before continuing.
>
> **`po/SPEC_SNG-197_braid_as_a_moment.md`** — SNG-196's foundation is sound and is NOT being asked back.
> This is the outcome definition for your own REMAINING item (1), the `generate.js` "braid" type, plus one
> thing that is not polish:
>
> ⛔ **`braids.js:98` sets `notFor: "Anything beyond the braid of its two parents"` while `:74` derives
> capability as a set-union of those parents.** Together the default defines a braid as exactly its parents
> and forbids more. Erik's ask is the opposite — the braid must do what neither parent could. Note `:89`'s
> tree text (`cannot: "What neither parent could do apart"`) states the RIGHT doctrine, so the def and the
> tree currently disagree about the same ability. Union-of-functions is a fine FLOOR; the ceiling must be
> the braid's own. **Do not fix by deleting `notFor`** — draw the boundary around the braid.
>
> Also: the **rename control does not exist** (L1 built-never-reached — `opts.name`/`minted.namedBy` are
> built, nothing reaches them) while the tooltip *promises* the player a rename. And the default is
> backwards: Erik does not want to name it, he wants a **GM-authored name** he can overrule. His worked
> example for deathsense × order_sense: *"Perfect Inevitability"*. `A × B` is the failure fallback, never
> the shipped result. **Backfilled braids (Silas has two) must reach the good version too.**
>
> ⚠️ **Verify before building, do not take from me:** the tooltip's **"Tier V"** cannot come from
> `braidTier` (returns `tier = maxRank`, capped at 3; no top-level `tier` on the def) — find what the badge
> actually reads. Same for **"5 energy (base 10)"** vs `4 + tier*2`. I flagged these; I did not diagnose them.
>
> **`po/SPEC_SNG-198_the_world_turns.md`** — Erik's world-tick read, and his memory was right that a
> delegated path exists. The sharper finding: **there are TWO offscreen-advance paths and they are two
> halves of one engine.** `:111–131` (delegated) has mechanics and almost no population; `:340–386`
> (generated lives) has the population and **an output schema of `{entityId, note}` with no field for state
> at all** — so it cannot move anything by construction. Four ticks of a thread ripening produce four
> independent descriptions of ripening. **SNG-021's `wantProgress` counter was specced 2026-07-07 and
> never built — 0 hits repo-wide (verified).**
>
> Population ask: **met · heard-of · and EPIC/LEGENDARY.** ⚠️ `_gen.tier` (engagement) and `legend.tier`
> (power) are **different axes** — `worldtick.js` reads the first and has never read the second, so every
> epic figure is categorically excluded today. Erik's *"when big or interesting things happen"* is the
> governor and is load-bearing: rarity is the point, and it is the cost control too.
>
> **`po/SPEC_SNG-199_one_person_one_codex.md`** — Erik's codex + identity read. Six defects, four with a
> line number, and they compound.
>
> ⛔ **`npcs.js` never calls `applyCodexUpdates`. Not once.** (Verified — the only codex auto-mirror in the
> engine is `worldtick.js:364`.) Meeting a person creates no codex node; reaching a place creates none. The
> codex is populated *entirely* by the GM volunteering `codexUpdates` — L2 on the player's primary memory
> surface. The inversion: **the codex reliably records what people did while Erik was away and unreliably
> records that he met them.** That is why his mother and Cairnhold are absent — not a resolution failure,
> a write that never happened.
>
> ⛔ **`prettifyNpcName:63` early-returns any string with a capital and no dot/underscore as "already
> human-shaped."** It is a slug prettifier standing in a validator's position, so a descriptive clause in
> the `name` field *becomes* the name — then `:83` cuts it with a raw `.slice(0,60)` while **the very next
> line** uses `smartClamp` (SNG-152's word-boundary clamp) for `description`. Result: an NPC named
> *"Siol — Elven traveler at the Hub plaza, tall, pale coat, bir"*.
>
> ⛔ **`findExistingNpc:49–58` never reads `aliases`** — which the same module maintains across five write
> sites. Identity ledger written, never opened (L1). Under that matcher *Hesta Vorn* / *Maret Weir* /
> *Silas's Mother* are **guaranteed** three records, and `suggestMerges` is not offering the pair.
> ⛔ **Do not fix by loosening string matching** — the signal is relational ("my mother"), not lexical.
>
> Also: **"Ama Dreya"** — the player conferred a name, the GM *used it in narration* (gallery caption) and
> recorded it nowhere. `nameNpc`/`nameExtend` model world-reveals-a-name; there is no op for
> player-confers-a-name. And codex **search** leaves the NOTABLE + merge sections unfiltered while printing
> *"Nothing cataloged yet"* over six visible entries.
>
> **`po/SPEC_SNG-200_companion_is_a_character.md`** — Erik on Huginn (Marrow), bond 10 / stage 2:
> *"progress seems to have stopped and he's basically the same as he started."*
>
> ⛔ **`companions.js:27` — `stage: b >= stage2At ? 2 : 1`. A ternary. There are two stages, ever.**
> `growBond:40-41` can emit exactly two events in a bond's lifetime. Meanwhile
> `content/packs/valley/companions/marrow.json` **authors three stages**, and `companionsForGM:71` already
> does `c.stages.find(st => st.stage === b.stage)` — **it would surface stage 3 the moment `bondOf` could
> return it.** Content authored, reader built, one boolean between them (L4 + L1 in one seam).
> So Huginn is at the **terminal state of the whole companion system** and hit it at bond 8; the last two
> points bought nothing. ⚠️ Bond caps at 10, final stage fires at 8 — **the top 20% of the scale is inert.**
> **Existing saves must reach the new stages on reconcile — Erik does not regrind a maxed bond.**
>
> Beyond the unblock, Erik wants a real **companion arc** peer to SNG-133's personal arc — evolved form
> mechanically distinct and *"really cool and useful"*, gaining memory of deeds witnessed. ⛔ **Not every
> arc is an ascension** — Marrow's stage 3 is a debt between two people, not a power-up; a system that can
> only express *becomes stronger* would lose the best content already authored.
> Also: **`GEN_TYPES = ["npc","location","arc"]` — companion is not generatable** (verified `generate.js:24`),
> and companions reach the codex through **neither** path.
>
> ⚠️ **THIRD instance of one shape this batch:** two paths do a job, one complete, one silent — SNG-185
> (domain stamping), SNG-199 (codex mirror), now SNG-200 (companions fall through both). `generate.js:295`
> auto-mirrors to codex; `npcs.js` never does. **Three local fixes or one missing shared primitive? Your
> call — you have the clearest view of all three seams.**
>
> **➡️ Sequencing is yours** — SNG-197 rides the braid work you are already in; SNG-198, SNG-199 and SNG-200
> are separate passes. ROUND 2 on all four. ⚠️ **SNG-198, SNG-199, SNG-200 and SNG-134 all touch the codex/accumulated
> state ledger — four tickets on one surface** — if they should be sequenced or merged, say so BEFORE any of them build. SNG-198 §OQ5 asks directly whether it collides with SNG-134; I would rather find that
> overlap now than merge two half-built ledgers later.


> **✅ SNG-193b CLOSED GREEN by Aevi at HEAD `45328420`** — verified at origin, not taken on report:
> the §3.3 seam is single (`substrate.js:161`, `bandForSchool`), `SOURCE_BAND` + `materialFloor` 0.7
> present, the §3.5 CI gate genuinely fails a bad affinity (`smoke.mjs:6158`), and **`adoptSchool`
> dispatches through `setCharacterSchool` at `app.js:3397` with `logOpOutcome` attached** — countable
> from day one, which is SNG-190 §3's lesson applied unprompted. Two follow-ons correctly flagged
> rather than improvised: the creation-time school picker (SNG-192's) and the augmented-ceiling curve
> (Erik's balance call).
>
> **➡️ NEXT:** engine connections review (Erik-directed), then `po/SPEC_SNG-195_prompt_review.md` —
> five columns per engine, and **§4b is the shape to copy: the ENGINE computes room, the model never
> judges.** Add **RUNNING_FIXES A6, the writerly audit**, to that sweep — column 4 of SNG-195 is the
> same audit from the other side.

> **➡️ NEXT TWO, in order:**
>
> **1. `po/SPEC_SNG-185_hub_attribution.md`** — the single upstream dependency behind both outcomes
> Erik reported. Two paths mint people and only one stamps domains: `generate.js:566–583` does it
> with provenance, `npcs.js :: applyNpcUpdates` — how the GM meets anyone in play — does nothing.
> Veth and the Crossing Ent both came through the second. Derivation order is **role string first**
> (Veth's literally says *Ashwarden*), skills second, region home last. ⛔ **A role naming a PEOPLE is
> not a domain** — "Ent" is a kind, and a naive matcher mis-assigns every Ent in the registry.
>
> **2. `po/SPEC_SNG-186_dev_mode.md`** — the workbench. Erik-requested and Erik-approved. Every
> defect this batch cost a live play session to find; he is currently the only instrument in the
> system and a slow one. **Build §2f first** (assembled prompt · raw response · parsed result · which
> ops fired) — it is how SNG-179 was diagnosed by hand, made a button. Load-bearing invariant §3.3:
> **dev writes go through the same functions play does.** A lever that bypasses a real path tests a
> path that does not exist, and will cheerfully prove things that are false.
>
> Content shipped alongside: **22 teachers** (was 1), covering 14 of 24 pole traditions —
> deviations only, per your levelReq answer.

> **➡️ BATCH-13 capstone: `po/SPEC_SNG-183_full_accounting.md`.** The engine map completed across
> code, content and ops, plus the six defect lenses this batch produced. Read with
> `po/BATCH-13_handoff.md` for the build order.
>
> **Substrate geography is CLOSED.** `threeGrounds` is canon: thin has three causes — *pooled*
> (never transitioned), *released* (completed; the lattice withdrew), and *unreached* (never
> arrived). The first two are authored sources; the third is ordinary country and needs none.
> 43 of 95 locations carry local variation and **Erik has ruled that correct** — the gaps are
> wild-nanite habitat and room to expand.

> **➡️ START AT `po/BATCH-13_handoff.md`.** It carries the build order, the ratified canon
> amendment, what changed in content since your ROUND 2, and the open rulings. Everything below is
> still true and is the detail behind it.

**2026-07-18 · Aevi (PO).** Read this first, then `SYSTEM_SPEC.md §9b`.

## ✅ ROUND 2 received — build order accepted, lore loader FIRST

CCode's ROUND 2 landed on all six. **Recommended order accepted without change: the lore loader is
first.** It is upstream of the most reports and it is the smallest change in the batch.

**SNG-167 §1 is superseded** — I diagnosed an authoring gap; the cause is `state.js:130`. My proposed
pass would have improved nothing. Both caveats are adopted as part of the fix, not follow-ups:
the five refs that stay dangling, and the JSON renderer (raw JSON at ~2,900 tokens mean is a silent
bloat traded for a silent miss).

**Substrate math accepted as CCode's.** Shortest path over connections with coordinate-weighted edges
reconciles the proposal's own two halves, and `scripts/substrate_field_probe.mjs` being persistent is
the property my `/tmp` script lacked. Drift 0.0000 and cliffs 0.287 → 0.286 both beat anything I ran.

**Both content bugs were mine and both are now fixed at origin:**
- `the_service_ways` was `kind: pool` at 0.96 inside a 0.98 region — acting as a sink. **Now 0.99.**
  This was the surviving residue of the second error I banked, exactly as CCode read it.
- ~~`the_gearlands` headroom~~ **✅ DISSOLVED, no ruling needed.** Pools/sinks are now ±deltas
  against the region background (Erik: *"they're basically big auras"*), so `the_great_engine` is
  `+0.22` above ambient wherever the regional mean sits. The metric that produced the violation
  no longer exists. A region whose authored *mean* sits
  0.02 below the world ceiling cannot contain a pool. The honest correction is that the Gearlands
  mean is too high for a region holding the densest site in the world, but that is a balance change
  to the calibration table and the `tuningNote` blocker is Erik's to lift.

**The already-exists audit is the finding of the session and it generalises past my retraction.**
Six proposed builds already exist in whole or part — including the `tradition → region` map SNG-166
asks me to author, **already authored on all 24 traditions including the spec's own worked example**,
and SNG-168's place card, built with both the travel button and the honest not-reachable line.
Standing correction to my own practice: **audit for existence before speccing a build.** My diagnosis
discipline has been reliable; my does-this-already-exist discipline has not.

**Content shipped this turn** — `carriedSubstrate` has been running against zero content since it
shipped: `substrateCharge` on 0 of 30 items, `substrateAura` on 0 of 9 companions, including the two
its own docstring names. Now authored: **8 items** (Waystaff 0.18, the Unfinished Spear 0.12, two
**suppressors** — the Stillhold veil −0.10 and truce token −0.05) and **6 companions** (Aevi 0.20,
Coil 0.14, Sprig −0.08). ⚠️ **The negatives do nothing until `carriedSubstrate` accepts them** — it
currently takes `c > 0` only. Authored ahead of the engine deliberately, and flagged rather than
assumed.

**SNG-169 §2c confirmed as the 12th built-never-reached** — `entityHover`'s item branch and
`itemDetail` fully written, one HTML attribute from live.

---

## ⚠️ Retraction (stands)

**Every per-location substrate number I published in `po/PROPOSAL_substrate_border_blend.md`
REV2/REV3 is WITHDRAWN.** You were right to stop. The verification ran from an uncommitted `/tmp`
script, and the formula had a detail no reader could infer (each source's delta measured against
*its own* region's ambient). Don't try to reproduce those numbers — they are not a target.

**The authored content stands. The arithmetic does not.**

## The correction that matters: the engine already does most of this

`carriedSubstrate(character, itemCatalog, companions)` has read `item.substrateCharge` and
`companion.substrateAura` since before this session. I specced a mobile-source resolver that exists.
Erik's direction — **use the engines** — applies to all of it. Assume the capability is there and
look before building.

## What is actually wanted (outcomes — the math is yours)

`SYSTEM_SPEC.md §9b` now documents how substrate works and states six invariants. Those are the
contract. **How** you satisfy them is an engineering decision: kernel shape, falloff form, and
whether the field precomputes into `location.substrateDensity` (the hook `locationDensity` already
reads first) or resolves live. **A simpler function that satisfies the invariants is the better one.**

Two known gaps: `carriedSubstrate` accepts **positives only**, so suppressors/sinks aren't
expressible; and **nothing reads `substrateSource`** — 26 sites are authored and inert.

## Specs awaiting ROUND 2 — all restated as outcomes, not implementations

| spec | in one line |
|---|---|
| **BATCH-12** | substrate geography · standing on the base character schema · teachers that teach · the ENGINE_MAP *(you built it — split accepted)* |
| **SNG-166** | address derivation (`generate.js:70` inherits the player's region, defaults `"valley"`) · region-name deglut · NPC naming. **§3's Mara evidence corrected** — the ratchet must count across the device |
| **SNG-167** | 18 of 27 lore files reachable by no location · NPC-borne quest arcs (41 of 43 have a `want`, none have seeds) · Coliseum standing (**conduct adjudicated from outcome/yield/harm-rung, never model-judged** — your call, adopted) · Haiku-default routing |
| **SNG-168** | map viewport on all three tiers + pinch (touch reads only `e.touches[0]`) · place cards with travel · world feed **distinct from shared canon** · messaging over the waygate network |
| **SNG-169** | `npcImage` imported and never called · `itemImage` gated behind `open` · `.item-name width:100%` wrapping the pin · reuse the ONE `entityHover` popup, don't build a second |
| **SNG-171** | personal arc stages have no entity anchor and outcomes ship `effects: []` — vague arcs and consequence-free choices are both structural · a reconcile **history-credit** step (v8 seeds who you ARE; nothing credits what you DID). ⚠️ needs Erik's ruling: does an Ent bond credit Rootkin or manifest-domain? |
| **SNG-170** | per-profile stakes dial on SNG-144's machinery · **§2 corrected**: 1 of 42 authored NPCs had `appearance`, not most. Content half shipped — 40 authored |

## Shipped content this session (inert until wired)

- **26 `substrateSource` sites** (18 pools, 8 sinks) with authored reasons — nothing reads them yet
- **40 NPC `appearance` fields** — **live now**, `npcPromptSeed` already leads with the field

## Standing

Numbering: `SNG-nnn` PO-minted (check `po/` at HEAD first), `CCODE-nn` yours. Only-Aevi-closes.
Browser-leg is the only accepted proof. Local `npm test` green before every ship — including mine.

---

<!-- status: ROUND 2 DELIVERED on BATCH-12 / SNG-166 / 167 / 168 / 169 / 170 (CCode 2026-07-19,
results po/results/20260719_ROUND2_six_specs.md). NOTHING BUILT.

HEADLINE — engine/state.js:130 strips only ".md", so the 24 .json lore files are keyed WITH the
extension while every loreRefs entry asks for the bare stem, and loreForLocation's .filter(Boolean)
makes the miss silent. 3 of 14 refs resolve; 84 of 95 LOCATIONS DELIVER ZERO LORE TO THE GM.
the_twelve_reaches (80 locations) and traditions (69) have never once reached the model. This
reframes SNG-167 §1: the Crossroads failure is a LOADER BUG, not an authoring gap, and §1's
authoring work would have improved nothing without it. Two caveats in the results file: 5 refs stay
dangling after the extension fix (traditions is the big one — it loads into CONTENT.traditions, a
different object never passed to loreForLocation), and fetchText on .json hands the model RAW JSON
(~2,900 tokens mean, ~5,900 worst), so the fix wants a renderer or it trades a silent miss for a
silent bloat. Recommended as the next ship ahead of everything else.

SUBSTRATE — the math is done and measured against all six §9b invariants; scripts/substrate_field_probe.mjs
is persistent so you can re-run the table. Distance basis reconciles the proposal's own two halves:
shortest path over CONNECTIONS with edges weighted by coordinate distance, so §4's topology governs
while the 26 authored radii keep their units. The (40,300) collision you flagged in §3 is still
there and still unconnected across regions — the graph basis is what fixes it. Per-region
renormalisation applied ONLY to source-touched locations satisfies invariants 2 and 3 together:
calibration drift 0.0000 EXACT (your withdrawn run: 0.059), 10 locations at pure ambient, 95/95
resolve, cliffs neutral at 0.287->0.286 where REV3 got 0.287->0.312. My 0.287 baseline reproduces
yours exactly — your cliff metric was sound even though the per-location numbers were not.
TWO CONTENT BUGS FOR YOU: the_service_ways is kind:pool with strength 0.96 in a region whose ambient
is 0.98, so it acts as a SINK (the surviving residue of the second error you banked); and
the_gearlands at 0.98 has 0.02 of headroom, which is why the_great_engine is the one invariant-1
violation. Both are cheap CI checks.

ALREADY-EXISTS AUDIT — your correction generalises. SNG-166 §1.2 asks for a tradition->region map
that IS ALREADY AUTHORED on all 24 traditions including the spec's own ashwarden->the_palelands
example. SNG-168 §1c's place card is BUILT at app.js:3954-3991 including the travel button and the
honest not-reachable line. SNG-169's lightbox is BUILT and its item-detail branch (app.js:94 +
entityDetail.js:41) is WRITTEN AND UNREACHED — a 12th built-never-reached, one HTML attribute from
live. BATCH-12 §1e's receipt/GM-line/map-chip are built; only the whole-map overlay and naming a
carried cause are missing. §1d's CI check already exists. AND: carriedSubstrate runs against ZERO
content — substrateCharge on 0 of 30 items, substrateAura on 0 of 9 companions, including the
Waystaff and Aevi which its own docstring names as the exemplars.

DECISION-CHANGING CORRECTIONS: generate.js:70's "valley" default sits inside stubEntity, the
unrepairable-output path, not general generation. SNG-167 §1c.1's proposed reach_<regionId> rule
matches ZERO of three as authored. SNG-168's viewport wiring cannot just be called on the other two
tiers — it dereferences getElementById("gz-in").onclick unguarded and would throw. SNG-167 §4 is a
BUILD not a policy change: MIN_CACHE_TOKENS differs per model so moving gm-narrate to Haiku
restructures the cache tiers, and describe-build + gambit-extract have no MODEL_MAP entry at all.
Coliseum conduct needs two things first: there is NO harm-rung in encounters.js, and champion
traditions are prose in opponent.name with no structured traditionId. -->

---

<!-- status: BATCH-13 items 1/3/5/6 COMPLETE_PENDING_REVIEW (CCode 2026-07-19, results
po/results/20260719_BATCH-13_first_four.md). v1.8.133 lore loader / v1.8.134 item popup+lightbox /
v1.8.135 SNG-173 toolkit / v1.8.136 substrate field. Suite green at every ship.

ITEM 4 WAS ALREADY DONE — the handoff lists BATCH-12 §3 standing as "company accrual + standingOps
remain", but both shipped in v1.8.132 (395f60ec) before the handoff was written. accrueStandingForDays
and applyStandingOps are live in app.js, standingOps is in the gm.js contract and salvage list, and
the GM row is registered. Nothing to do; skipped.

ITEM 1 LORE LOADER: 3 of 14 refs resolved -> 9 of 14; 84 of 95 lore-blind locations -> 0. the_crossing
verified live at 16,904 chars where it had 0. CORRECTION TO MY OWN ROUND 2: I called the raw-JSON risk
a "silent bloat" at ~2,900 tokens. Wrong emphasis — rendering to prose saves only 4%, because that
cost is the CONTENT not the syntax, and it lands in gm.js tier 2 which is CACHED, so it is paid per
region-stay not per turn. The renderer earns its place on readability. THE 5 DANGLING REFS ARE YOURS
AND THE BIGGEST HAS NO CHEAP FIX: `traditions` (69 locations) exists at core/rules/traditions.json,
but loading it takes those locations from ~2,700 to ~13,000 prompt tokens; tradition_profiles.json is
no cheaper (~11,700). That ref wants a per-tradition SLICE or it wants dropping — not a file. The
other four look like rename drift (domain_detail_and_connections vs domain_detail.json;
precursor_glimpse vs precursors.md; reach_body_mind and reach_violence_peace read as pole-axis names,
not regions). CI now names all five every run, ratcheted so a sixth fails the build.

ITEM 3: your "one HTML attribute" placement does not work and checking was the job. The inventory
.item-name button already carries data-item-toggle and owns a RICHER inline expand, so the attribute
there would fire both handlers or downgrade the interaction. itemCard is the only item surface and
both its call sites have that expand. Put the popup where an item is named and CANNOT be inspected:
the roll receipt's "aided by X". Also had to split resolution.itemHelpers out of equipHelpers, which
mixes items and companions — a blanket attribute would have made companion names look tappable and
silently do nothing.

ITEM 5 SNG-173: measured on Erik's actual save — Silas at level 16 has 17 abilities and 2 left in the
pool, 5 excluded after exactly ONE use. Fixed with a lastUsed stamp + quiet-days window; 16B untouched.
THE MIGRATION IS THE PART THAT NEEDED CARE AND I GOT IT WRONG FIRST: treating unstamped abilities as
long-quiet made the block name Silas's THREE MOST-USED crafts (Order-Sense 58 uses, Palework 27,
Deathsense 25) as "gone quiet" — caught only by running against the real save instead of a fixture.
YOUR OUTCOME 2, ANSWERED: the other three categories are NOT draining, they are STATIC. Ten
consecutive turns for an identical character produce a byte-identical braid pair, item line and
companion line. Different failure from the one specced; flagged, not built.

ITEM 6 SUBSTRATE: your ±delta re-authoring works as predicted — the_great_engine rises 0.98->1.000
and THE GEARLANDS RULING IS DISSOLVED, no longer needs Erik. Distance is shortest path over
CONNECTIONS weighted by coordinate distance, which reconciles your §3 and §4 instead of picking one;
verified live that ent_deepwood rises to 1.000 while the_lampless_market at the SAME coordinates but
unconnected stays at its own ambient. Renormalisation chosen on measurement, not taste: raw field
drifts a regional mean by 0.1332 and 19 of 25 regions have one-signed sources, and §9b forbids
overwriting the authored table. ONE VIOLATION REMAINS AND IT IS CONTENT: the_service_ways 0.98->0.954,
because the_gearlands has 2 pools, 0 sinks and 4 locations, so the correction pushes the weaker pool
under. Add a sink or accept it. carriedSubstrate now takes negatives so your three authored
suppressors work, and the roll receipt names the carried cause (invariant 5).

STILL OPEN FOR ERIK, unchanged: §D.1 Ent->people affiliation (blocks item 2, SNG-171 §2 history
credit), §D.2 region renames, §D.3 stakes dial default, §D.4 falloff scales. Remaining build: items
2, 7, 8, 9. -->

---

<!-- status: BATCH-13 items 1b + 2 COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.137 SNG-176 /
v1.8.138 SNG-171 §2. Suite green. Map/axes work is PAUSED at Erik's direction — he is thinking about
how the map interacts with the axes; see po/results/20260719_WORLDSPACE_finding.md.

SNG-176 — YOUR Q2 AND Q4 WERE BOTH RIGHT, and you were right to make me check. TWO of the four
blocks in your table were ALREADY GLOBAL: the CODEX scores rather than filters (location is a +3
boost with a newest-few fallback, and searchCodex already exists), and npcRegistryForGM already takes
location-relevant NPCs first then fills from the rest by relationship strength. Only LORE and
placeMemoryForGM are genuinely here-only. findSubPlaceParent already scans all of placeMemory, as you
suspected — it just returns {parentId, slug} rather than the record. So the spec overstates the
defect by half, in your favour. Built places.recallPlaces/recallForGM (places the player's words name,
found anywhere, sub-places included) plus playerInput fed into the codex scorer at +4 so a topic the
player NAMED outranks the one they are standing on. ANSWERING Q1: the registry pass, NOT parseIntent —
env already carries playerInput/exactWords, so deterministic namematch costs no round-trip and recalls
better than a Haiku call would. The block is EMPTY on turns that name nowhere (a test asserts it), and
recall is memory not omniscience — an unheard-of place stays unfindable. §2.4 bio anchors NOT built:
register-at-creation vs resolve-lazily is your ruling.

SNG-171 §2 — ⚠️ THE ENGINE IS RIGHT, THE RULING IS RIGHT, AND THE DATA STILL CANNOT REACH IT. Measured
on Erik's save: only 1 of his 14 positive bonds is creditable. Pell, Calvar, Veth, Mara, Siol, Aldric
and the rest are GM-GENERATED and carry NO people and NO domains — 0 of 14. SNG-174 authored those
fields onto the 41 AUTHORED NPCs; the population that actually accumulates in play is generated. His
Ent is not in the registry under an authored id either, so the very bond that prompted the spec is
unattributable today and rootkin stays at -1. I did NOT paper over it: generated NPCs carry
firstMet.locationId and the region->tradition map IS unambiguous (24 regions, one tradition each,
already authored), but "where you met someone" is not "what they practise" and at a hub like the
Crossing it would be actively wrong — §2c.4 says credit nothing, so it credits nothing. THE REAL FIX
IS TO STAMP people/domains AT MINT TIME IN generate.js. That is engine work I can do; it changes what
generation produces, so I want it ruled rather than assumed. RECOMMEND IT AS THE NEXT ITEM — without
it, item 2's outcome cannot land however correct the step is.

Step behaviour: authored bonds by band (devoted 3 / ally 2 / friendly 1; primary full, secondary
half, tertiary quarter; an Epic NPC's several primaries split the share) + practised craft from the
use ledger. Idempotent BY RECORD, not just by the version gate. Capped at +6 — thirty devoted bonds
cannot buy `kin`.

Remaining in the batch: 7 (SNG-171 §1 arc anchors), 8 (166/167 rest, 168, 170), 9 (SNG-172 power
sources), 10 (SNG-175 companions + curricula). -->

---

<!-- status: BATCH-13 items 10 + SNG-177 + SNG-178 COMPLETE_PENDING_REVIEW (CCode 2026-07-19).
v1.8.139 mint-time affiliation / v1.8.140 tiered depth / v1.8.141 teacher curricula. Suite green.
Map/axes still PAUSED at Erik's direction.

⚠️⚠️ THE FINDING THAT MATTERS MOST THIS SESSION — THREE DURABLE OPS HAVE NEVER FIRED. Measured on
Silas at level 16 (scripts/op_emission_audit.mjs, persistent, re-runnable):

    codexUpdates 60 · factUpdates 40 · itemUpdates 23 · npcUpdates 21 · deeds 18 · placeUpdates 9 ·
    questUpdates 4        BUT:  discovery 0 · markTeacher 0 · markDefiningMoment 0

Every op shaped as a LIST OF UPDATES fires heavily. All three shaped as a one-shot MARK-THIS-MOMENT
have never fired once. Same class as the scalar ops (sceneEnded/gambitApt/imagePrompt) I built a
recovery pass for earlier today.

THIS IS THE ROOT CAUSE BEHIND THREE OF ERIK'S REPORTS: the Ent bond that credited nothing (never
registered via npcUpdates), the teachers who taught nothing (character.teachers is EMPTY — so
SNG-175's premise of "two bonded teachers" is true in the fiction and false in the data), and
standing that never moved. markTeacher is FULLY wired — rule 19C instructs it, the schema declares
it, app.js dispatches it, it is in the salvage allowlist. It has simply never fired. In every case
the machinery is built and correct and the GM narrates the relationship without recording it.

I have NOT guessed the cure — prompt weight and parse loss are different diseases — and I am NOT
inferring teachers from prose, which would bake a guess into the save. It wants measuring against a
live turn. RECOMMEND IT AS THE NEXT TICKET; several specs' outcomes are downstream of it.

SNG-175 §3 — ANSWERING YOUR Q4 BEFORE AUTHORING: the curriculum ordering is ALREADY IMPLIED and
needs NO content pass. 285/285 abilities carry levelReq, every tradition declares its abilities,
tierOf exists, combinationsAvailableFor already answers §3.6. So the spine is DERIVED and a teacher
authors only DEVIATIONS — which is exactly the characterisation half. curriculumFor + teachersForGM
built; teacherDetail is now a registry row (teachers appeared in NONE of the previous 48 — the GATE
existed, the INITIATIVE did not, and permission is not initiative). Refusal named as a legitimate
answer per §3.4. Parity 49/49. Your Q1 (promote vs view) and Q2/Q3 are NOT built — §1 companion
unification and §2 accrual are still open.

SNG-177 (Erik's ruling: stamp at mint, allow enrichment, but they need a starting point) — generate.js
now stamps people + domains at mint from three sources and RECORDS WHICH: `generated` (model authored
in-grain; the prompt now states that kind and craft are INDEPENDENT per SNG-174), `derived` (the
tradition whose home the region is — a derivation, not a guess: region->tradition is 1:1 across 24
regions), or absent (`people` is NEVER invented; no tradition names one and defaulting to human is
wrong in the Deepwood). Provenance is load-bearing: v9 credits a `derived` domain at HALF weight
rather than treating a floor as a fact. v9 also now resolves bonds against the GENERATED store by
NAME as well as id, because the stores drift (`dara-holt` vs `dara-holt-the-ditch-mother`). v10
backfills existing generated records. On Erik's save this lit up Siol, Tane Solr, Dara Holt, Calvar.

SNG-178 (Erik's NPC-progression direction) — the promotion LADDER already existed (fresh ->
established -> nominated via recordAttention/TIER_AT) and spent nothing: a person returned to nine
times carried the same seven stub fields as a face passed once. TIER_SCHEMA now declares what each
rung is OWED — fresh deliberately EMPTY so a cast of thirty stays cheap, established gets what lets
them be met again, nominated gets their own life and reach (the doorway to Epic). Lazy, not eager;
enrichment is earned. app.js enrichNpcDepth fires on the crossing, additive-only, one attempt per rung.

STILL OPEN FOR ERIK: the hub-attribution question (16 of 20 registry NPCs have no backing record at
all; I declined to derive them from firstMet because at a hub it is actively wrong), and the map/axes
ruling. Remaining build: 7 (SNG-171 §1 arc anchors), 8 (166/167 rest, 168, 170), 9 (SNG-172). -->

---

<!-- status: BATCH-13 items 1b/2/7/8-partial/8c COMPLETE_PENDING_REVIEW (CCode 2026-07-19).
v1.8.142 SNG-179 · v1.8.143 SNG-171 §1 · v1.8.144 SNG-181 · v1.8.145 SNG-167 §1c.1 · v1.8.146
SNG-167 §2. Suite green at every ship, verified by EXIT CODE. ROUND 2 answers filed in
po/results/20260719_ROUND2_worldspace_and_179.md as directed. WORLDSPACE UNTOUCHED — SNG-180 not
started, pending Erik's map/axes thinking.

SNG-179 — YOUR THIRD POSSIBILITY WAS THE RIGHT ONE, and it needed no live turn. Four ops demand a
`traditionId` (markTeacher, standingOps, offerAcquisition, the acquisition reply) and THE PROMPT HAS
NEVER LISTED THE VALID IDS — a grep for a tradition vocabulary block in gm.js returns nothing. The
ids are blazeborn/rootkin/ashwarden…27 of them; `radiant` is not one, and Erik's teacher is "a
Radiant teacher". app.js then discarded the miss in total silence. An enum the writer has never seen
is not an enum. Shipped: traditionVocab as a world-tier block (caches once), the guard now RECORDS
the miss, and logOpOutcome tallies applied/rejected onto the feedback report so never-emitted reads
differently from emitted-and-rejected (§4.4). ⚠️ IT ALSO CORRECTS MY OWN "three ops, one shape" —
`discovery` is double-gated on discoveryEligible (crit-success on a NOVEL action; possibly not a bug
at all) and `markDefiningMoment` takes an abilityId, which IS in the prompt. THREE CAUSES, NOT ONE
SHAPE. Erik's instrumented turn is still worth having for markDefiningMoment; it will now arrive
pre-diagnosed.

SNG-171 §1 — both defects confirmed verbatim then fixed. Stages carry resolvable `anchors` (dropped
if they name nothing real; `unanchored` flagged so "not ready to show" is checkable). Outcomes carry
real effects clamped to the SAME quests.js vocabulary, so an arc ending runs through the existing
applier rather than a second half-built path. §1c.2: the prompt now HANDS the author the character's
known places, met people, carried items and peoples — validating invented prose afterwards would
have produced the same abstraction and then deleted it.

SNG-181 — a SLICE, not CSS, and the evidence is exact: Erik's truncated line is 80 characters TO THE
CHARACTER, and gm.js:603 read `.slice(0, 80)`. Both intent paths now smartClamp, and `playerWords`
carries the full typed text to the log — the one string that must never be truncated is the one the
player wrote. A test asserts the 80, so a regression is caught by arithmetic rather than a screenshot.

SNG-167 §1c.1 — region lore is automatic now; 11 locations gain their Reach. ⚠️ CORRECTING MY ROUND 2:
I said the `reach_<regionId>` rule "matches ZERO of three" and listed `the_unspooling`. The id is
`unspooling` — TWO of three match exactly, only reach_somatic/somatic_reaches needs a fallback. I
asserted a detail without checking it. That change is in your favour: two-of-three is why this is a
lookup with one normalisation rather than a mapping table nobody would maintain.

SNG-167 §2 — npcSeedDetail registered and consumed as rule 10b. DERIVED rather than blocked on
authoring per your ROUND 2 ruling: 0 of 47 NPCs carry seeds, 45 carry wants, so the want is the
fallback premise and the block marks it so the GM shapes it into a named opportunity. CI ratchet
prints the backlog (41) every run and may only go down — the number-not-aspiration shape you asked for.

⚠️ PROCESS ERROR, RECORDED: one ship (v1.8.143) went out RED. My command was
`npm test | grep ... && git commit`, which chains on GREP's exit status, not the suite's. The
rawProseCaps ratchet caught two raw slices I had added and I piped the gate into a mask. Fixed within
minutes, and every ship since verifies with `npm test > log; echo EXIT=$?`.

STILL OPEN FOR ERIK: the hub-attribution question (16 of 20 registry NPCs have no backing record;
I declined to derive from firstMet because at a hub it is actively wrong), and the map/axes ruling.
REMAINING BUILD: 8 (SNG-166 address derivation + naming, SNG-168 viewport/pinch, SNG-170 stakes
dial), 8b (SNG-180 worldspace), 9 (SNG-172 power sources). -->

---

<!-- status: BATCH-13 item 8 SUBSTANTIALLY COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.147
SNG-168 viewport · v1.8.148 SNG-166 §1 address derivation · v1.8.149 SNG-166 §3 naming. Suite green
at each, verified by EXIT CODE.

SNG-168 — FOUR defects and the first explains the rest. The world and location tiers rendered a BARE
<svg>, but the reason they were never simply wired is that wireSkillGraphViewport DEREFERENCED THREE
CONTROLS only the region tier renders (getElementById("gz-in").onclick, unguarded) — so calling it
anywhere else threw before reaching the listeners. The null-guard is what makes one wiring serve five
surfaces; the markup fix alone would have crashed. PINCH: touches[1] appeared ZERO times repo-wide,
so zoom was wheel-only and a phone has no wheel. THE LEAK IS REAL as your audit suspected — one
module-level graphView served map AND wheel AND graph, so zooming the map and opening the wheel
inherited the transform; state is now keyed per surface (world/location/map/wheel/graph). Verified
against the app the browser actually serves, zero console errors.

SNG-166 §1 — MEASURED ON THE LIVE SAVE: all 6 generated locations carried regionId=valley, including
`gen-center`, which IS the Crossing, and `gen-ashwarden-march-road`, which is the Palelands. My ROUND
2 noted the stubEntity default only fires on unrepairable output and MISSED the second cause: the
general path never asked the model for a region at all, and the prompt handed it "WHERE: <the
player's current place>" and nothing else. Same lesson as SNG-179 — the valid regionId list now ships
in the prompt and says the right answer is NOT necessarily the place above. resolveRegionFor orders
evidence authored -> named -> anchor -> unresolved, and THE ORDER IS THE FIX: the anchor is wherever
the player stands, so inheriting it IS the bug. Re-resolved: gen-center -> the_center,
gen-ashwarden-march-road -> the_palelands, the four genuinely-local ones correctly stay valley.
Unresolvable now yields NULL + regionSource:"unresolved" per ROUND 2. CI guard added from my own
ROUND 2 §6.1 — content_ci fails on a hardcoded region default, because "derive, else default" had
already come back once.

SNG-166 §3 — YOUR CORRECTION PROVING ITSELF, with the number. Across 10 characters on this device: 52
distinct given names, 5 recurring, and MARA MET BY FOUR CHARACTERS. Within any one save there is
exactly one Mara, so the per-character ratchet the spec first proposed would have read GREEN forever
while the thing Erik noticed kept happening. namematch now carries givenName / usedGivenNames /
namesToAvoid / nameRepetitionCount, counted across the device, avoid-list sorted worst-first so
truncation keeps the real offenders. THE ONOMASTICS HALF CAME FROM CONTENT THAT ALREADY EXISTED —
traditions.json carries an `aesthetic` line for all 24 peoples, so names can sound like the country
that made them with no phoneme table and no authoring pass.

REMAINING AND WAITING ON A RULING, NOT ON ME: SNG-166 §2 region renames (display-name migration —
cost measured at 52 occurrences across 18 files, ids provably unaffected), SNG-170 stakes dial
(default + whether the boar/greatcat flip to lethal), SNG-180 worldspace (Erik's map/axes thinking),
SNG-172 power sources (wants the substrate ruler settled). Also still open: the hub-attribution
question — 16 of 20 registry NPCs have no backing record, and I declined to derive them from
firstMet because at a hub it is actively wrong. -->

---

<!-- status: SNG-182 + SNG-180 COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.150 SNG-182 ·
v1.8.151 SNG-180. Suite green, verified by exit code.

SNG-182 — ANSWERING YOUR Q1 BEFORE BUILDING: there is no resolver, there are FIFTY-SEVEN. 57 ad-hoc
"look the record up by id, take .name, fall back to the id" sites across app.js and engine/, 52 of
them for traditions alone, and the region lookup written out verbatim twice. Erik's generalisation is
exactly right. Q2: {{…}} is unreserved. Q4: ZERO tokens today, so this is the cheapest possible
moment for the gate — your guess, confirmed. Q3 — RESOLUTION BELONGS AT ASSEMBLY, NOT LOAD, and
SNG-111 decides it: progressive naming is PER-CHARACTER, so the same NPC id is "the dock-master" to
one character and "Sorel" to another; baking a name at load destroys that permanently. Wired at
assembleGMContext, the one choke point every view already passes through, so no builder has to
remember and the model can never see token syntax. §2.3 acceptance test PASSES — change the record,
every reference follows, one edit. §2.4 is the loreRefs lesson applied IN ADVANCE: unresolvable
tokens fail CI and degrade readably at runtime, never a blank and never raw {{…}} to a player.
Verified by planting a broken token — it failed, named the file and field, and resolved the good
token in the same file. Migration stays incremental per §2.7; nothing retrofitted.

SNG-180 — the sphere ships. Geodesic on your authored worldPos, and the geometry confirms itself:
the_great_engine <-> the_numen = 3.1277 radii (~π, 299 walking days), and routing that trip VIA THE
CROSSING costs 3.1314 — a difference of 0.0036. The hub sits exactly πR/2 from every Reach and the
antipode/neighbour ratio is 12, the same 12 as the axes. walkingDays is wired to the map place card
so the year-to-walk scale is immediately player-visible.

⚠️⚠️ THE SUBSTRATE RULER DOES NOT SHIP AND THIS IS THE PART TO READ. Erik is right that mechanics
should not measure with a drawing, so I switched the substrate field to geodesic — and the §9b
invariants BROKE: pools/sinks 25/26 -> 11/26, locations with local variation 73 -> 0. Not a constant
problem; I derived the conversion twice, first from median pairwise ratio (222) then properly from
median CONNECTED-EDGE length (309) since the radii were tuned against reach along the graph. Both
flat. CAUSE: intra-region geodesic distance has a median of 0.234 radii against a converted radius of
0.388, so a source sits at ~55% strength across its ENTIRE region — every location gets a near-uniform
delta and per-region renormalisation cancels it to nothing. YOUR worldPos IS NOT THE PROBLEM: it is
distinct for all 95 and 0% identical within any region. The issue is GRANULARITY — the sphere resolves
regions; the substrate field needs sub-region resolution. Either the 26 radii re-author much smaller
in world units, or substrate keeps the travel graph as its ruler. A design call with numbers attached,
not something to dial until it passes. I reverted rather than ship a flat field to satisfy an
architectural preference.

MY OWN GATES CAUGHT ME TWICE IN THIS SHIP: the revert left geodesic with no consumer (testOnlyExports
8 -> 10, "CANNOT FIRE IN PLAY"), which is what prompted the place-card wiring; then isAntipodal and
nameRepetitionCount were still test-only — speculative API I wrote because it seemed worth having.
Deleted rather than special-cased. Ratchet improved 8 -> 7.

REMAINING: SNG-172 power sources (ruling 2 unblocked the 285-ability classification; largest left),
SNG-166 §2 renames (now land THROUGH SNG-182), SNG-170 stakes dial (default still yours). -->

---

<!-- status: SNG-183 CAPSTONE COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.152. Suite green,
verified by exit code. Results: po/results/20260719_SNG-183_full_accounting.md.

FOUR OF THE SIX LENSES NOW RUN IN npm test. L1 (testOnlyExports/importedNeverCalled) and L4 (loreRef
gate) already existed. The two that were only ideas are now gates:

  L2 permission-isn't-initiative — ENGINE_MAP gains a third authored column, `what makes it fire`.
  A module with a real player surface and NONE for a trigger is a capability nothing makes happen —
  the teacher gate that never fired. Gate requires all THREE columns present or all absent; warns on
  the L2 shape. 24/55 described (incremental per the accepted split). Verified by flipping gm.js to
  NONE and watching the warn fire.

  L5 static half — the missing link was DISPATCH. GUARD 2 already checked schema<->salvage parity;
  wiring_audit now also checks every documented op has a turn.<op> consumer in applyTurn. An op with
  full wiring that nothing reads is dead on arrival, caught at build. Proven with a phantom op. The
  runtime _opLedger (SNG-179) is the other half.

  L6 universal-gate-for-a-local-fact — content_ci finds a random encounter whose minDanger exceeds
  the dangerLevel of every location its tags match. re_toll_bandits is fixed (reaches all 6 tag-homes
  now). ⚠️ THE CHECK IMMEDIATELY SURFACED A LIVE SECOND INSTANCE THE BATCH HAD NOT FOUND:
  re_creature_chase, minDanger 3, whose only "wild"-tagged home is dl2 — a predator that can never
  appear on the one wild road. Ratcheted at 1 and NAMED, because the fix is a number Erik owns (lower
  the floor or raise a location's danger). A second new instance fails the build.

  L3 guard-in-a-pipe — the ONE lens that cannot be a gate, because it IS the verification layer.
  Lives as a rule (verify by exit code, no test result across a pipe) in the lens table, and it is
  the discipline every ship since has followed. Reported as unmechanizable rather than faked.

NOT DONE, DELIBERATELY: the full op->engine->surface connection GRAPH as a single rendered artifact
(§3d). The pieces exist (registry, dispatch check, authored surface column); I did not want to ship a
half-derived graph and call it the accounting. Natural next increment.

STILL OPEN AND YOURS: the substrate ruler (my handoff question — does your implementation renormalise
per region? mine forces drift to ~0 by construction and I believe that is what breaks invariant 1 at
your radiusWorld scale), SNG-172 power-source classification, the renames themselves (land through
SNG-182), the stakes-dial default, SNG-179's live instrumented turn for markDefiningMoment, and
re_creature_chase's danger number. -->

---

<!-- status: SUBSTRATE RULER SHIPPED (CCode 2026-07-19). v1.8.153. Suite green, browser-verified.
Results: po/results/20260719_CCODE_three_landings_verified.md.

Your no-renormalisation answer was the whole difference and I found it myself. Removed the
renormalisation block — pools-rise/sinks-fall is now STRUCTURAL. Your corrected §9b invariant-2
wording shipped into SYSTEM_SPEC (means stay NEAR as a consequence, drift-to-zero is a symptom). AND
my second error: the distance was DIRECT geodesic, not path-over-connections — path-over-connections
is right for walkingDays (roads) and wrong for the field (the lattice radiates through space).
Confirmed empirically: direct geodesic reproduces your drift 0.0515 TO THE DIGIT; the connection
graph does not. Verified through the LIVE browser modules: 26/26 invariant, drift 0.0515, the_blaze
1.00 / the_heartroot 0.02 / sunken_choir 0.66 — every number matches yours.

RENAMES verified through my resolver: 7 tokens across content, 0 unresolvable, the five renames
resolve live. content-CI token gate now reports 7-and-all-resolve on the real corpus.

⚠️ FOUND, NOT BUILT — power_sources.json IS AN L4 ORPHAN, caught by the lens I shipped hours ago.
state.js never loads it (no loadRule("power_sources")); nothing in engine/app/tests/scripts reads
it. And the ruling it encodes is NOT yet mechanically true: umbral — your worked example — has NO
substrateBand, so it is substrate-NEUTRAL today (full power everywhere), not benefiting from thin. I
did NOT wire it, for two reasons: (1) "natural benefits from thin" means an INVERTED band, which is
new curve shape under tuningNote — your content lane and Erik's balance call; (2) my L4 gate covers
lore and location addresses but NOT rules-file reachability, so a registered-but-unloaded rules file
sails through — a real gap in my own gate. ONE SMALL TICKET: either wire power_sources into
substrateVerdict (with balance_sim as the gate) or mark it a reference document, so the lens stops
seeing an ambiguous half-landed state. I can extend the L4 gate to rules files either way.

STILL OPEN AND YOURS: stakes-dial default, SNG-179's live turn, re_creature_chase's danger number,
and the power_sources wire-or-flag decision. -->

---

<!-- status: SNG-172 audit + L4 rules gate (v1.8.154) and SNG-179 fix (v1.8.155) COMPLETE_PENDING_REVIEW
(CCode 2026-07-19). Suite green, verified by exit code + regression-proven gates. Results:
20260719_SNG-179_FIX.md, and the audit/gate in the same commits.

SNG-172 — AUDIT, not wired, per Erik. content_ci now checks classification agrees with band centre
(natural low, lattice high). Verified the relationship before encoding: naturals 0.18-0.36, lattice
0.58-0.95, cleanly separable. threnodist + verist (natural, banded 0.50) are your two
flagged-not-changed disagreements — known-listed, reported, not failed. The umbral hole is closed
(0.58/0.28) and the check proves it fires by stripping a band. AND this reads power_sources.json, so
it is no longer the L4 orphan.

SNG-183 L4 FOR RULES FILES — closed the gap you named ("registered-but-unloaded should not pass").
A kind:"rules" file must have a consumer (loader or CI); design/reference kinds are exempt.
power_sources passes via the audit; quest_structure (kind:rules, authoring guidance) is ratcheted at
1, named not reclassified. A NEW unloaded operational rules file fails — proven with a probe.

SNG-179 — I CHECKED ALL THREE MAPPINGS AND ONLY ONE WAS SAFE TO BUILD, which is what "check each
pairing" is for. markTeacher: BUILT — derived from bondType:"mentor" + the mentor's own domain,
never invented, additive to explicit markTeacher. discovery: NOT derived — it is precondition-gated
(discoveryEligible, a crit-success on novel; Silas has 0), so deriving from codexUpdates would fire a
false reward. markDefiningMoment: NOT derived — Silas HAS ripe candidates so it IS substitution, but
a deed carries no abilityId and there is nothing clean to derive from. Both 19C and 19B rebalanced —
brake to the middle, qualifier last, NO emphasis added. 19B's engine confirm-and-refuse reframed from
a warning into the safety net that PERMITS firing.

⚠️ THE VERIFICATION IS ERIK'S and I did not pretend a unit test suffices — you said it wouldn't.
Re-run "Ask Veth to teach you," confirm character.teachers non-empty, confirm the capstone unlock
opens. TWO UPSTREAM DEPENDENCIES you will hit, both the SAME open gap: the captured Veth turn set
NEITHER bondType NOR a domain (she is sworn, registry-only, no backing record). The 19C rebalance
makes the model likelier to set the bond; the domain needs the SNG-177 backfill for REGISTRY-ONLY
NPCs — the same hub-attribution gap behind the Ent crediting nothing. Mechanism verified; Veth's
end-to-end waits on that gap. logOpOutcome now records "derived-from-bond" so the op-ledger shows it.

THE HUB-ATTRIBUTION GAP (registry-only NPCs with no domain) is now the single upstream dependency
behind BOTH the Ent-standing and the Veth-teacher outcomes. Recommend it as its own ticket — it is
the last thing between three shipped mechanisms and the outcomes Erik reported.

STILL OPEN AND YOURS: stakes-dial default, re_creature_chase's danger number, the reproduced-symptom
verification of SNG-179, and the registry-only-NPC affiliation gap. -->

---

<!-- status: SNG-185 hub-attribution COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.156. Suite
green, verified by exit code. Results: po/results/20260719_SNG-185_hub_attribution.md. This CLOSES
the single upstream dependency the last three blocks kept naming.

YOUR ONE-LINE GAP WAS EXACT — two paths mint people, only generate.js stamped domains. §5.1 answered
by DOING it: generate.js:affiliationFor is no longer a second implementation, it delegates to a new
engine/affiliation.js that the GM meet-path (npcs.js applyNpcUpdates) and the reconcile v11 backfill
also call. One rule now. The shared version is a strict superset, so generation gains role +
skillsObserved reading with nothing regressed.

§5.2 — SAFE, and I did NOT add a third required-on-meet field. You warned the list (gender,
appearance) is getting long and the model drops fields under load; deriving from the ROLE the model
already writes sidesteps it entirely. Order per §3: role string FIRST, skillsObserved second, region
home LAST (marked derived, half-weight). §5.3 backfill uses that same order.

⛔ THE TRAP AVOIDED, STRUCTURALLY not carefully — readPeople and readDomains match SEPARATE
vocabularies and share no code path. The Crossing Ent resolves people:ent AND no domain invented from
being an Ent. Whole-word too, so `mason` never matches inside `stonemasonry`. Erik's SNG-174 ruling
made mechanical.

⚠️ AN HONEST NUMBER: the backfill affiliated 1 of 21 registry NPCs and that is CORRECT. 20 were met
in the VALLEY, home to no single tradition, and their roles name no craft — so region-fallback rightly
abstains (§4.4, never assign what the record cannot support) rather than manufacturing 20 domains.
I'd rather report 1/21 with the reason than tune the fallback to fire for the mixed basin.

VETH: the DOMAIN half — the blocker — is CLOSED. She carries ashwarden (source role) after backfill;
markTeacher would resolve it and open the capstone gate. The remaining half is the model setting
bondType:"mentor" on the live turn (the SNG-179 rebalance) — that stays your reproduced-symptom check.
THE ENT was never in Silas's registry at all (SNG-179 finding), so nothing to backfill; going forward
the meet-path stamps it people:ent at meet. 14 new tests, all acceptance points. affiliation.js earned
its SYSTEM_SPEC row + three ENGINE_MAP columns (my own ratchets caught the omission).

STILL OPEN AND YOURS: stakes-dial default, re_creature_chase's danger number, and the reproduced-
symptom verification of SNG-179 (now unblocked on the domain half). -->

---

<!-- status: SNG-186 §2f (see the machine) COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.157.
Suite green by exit code; 🔬 Machine screen verified live in the browser. Results:
po/results/20260719_SNG-186_2f_see_the_machine.md. §2f ONLY — §2c/§2a/§2b are the next increments.

Stakes + re_creature_chase (minDanger 3→2) received at HEAD; the creature-chase number passes my L6
check clean (reachable on dl2 now), no re-baseline. Built §2f first per your §4 order.

YOUR §5, ANSWERED BY BUILDING IT. §5.1 (clean seam?) — ONE, and the cleanest possible: every model
call routes through callClaude, so a single optional observer there (setCallObserver) captures the GM
turn AND every sub-call (intent-parse/narrate/generate) for free. The transport stays dev-agnostic;
app.js registers the capture ONLY under isDevMode() at boot. No lever reached past a path. §5.2 (prompt
recoverable?) — was NOT retained (locals in gmTurn); is now, at that one seam, 24-entry ring, dev-only.
§5.4 — one screen with sections; §2f is the first.

§3.4 HELD AND TESTED — armed starts false; in a player view the observer is null and NOTHING is
captured. Disarmed recordCall returns null (asserted).

THE ZERO IS THE SIGNATURE. The firing-counts panel shows a count for EVERY documented op including the
never-fired — the SNG-183 §3c view (three ops read zero for sixteen levels) without a play session.
Verified live: NEVER FIRED (32) lists discovery/markTeacher/markDefiningMoment at 0. To avoid a THIRD
copy of the op list I made salvageOps' array the exported SALVAGEABLE_OPS — the ONE source the
salvager, the wiring audit GUARD 2, and this panel share; two source-regex consumers updated so the
rename can't drift them. Ops-fired from the parsed turn, applied/rejected from the real _opLedger
(reused) — fired / rejected-only / never read as three states.

§3.2 — feedback reports now carry ctx.devMode + a _devActions ledger (the mutating levers §2c/d/e will
append to). §2f is read-only so it appends nothing, but a dev session can no longer hide itself.

⚠️ THE ONE PATH NOT EXERCISED: an actual API capture (prompt→raw→parsed for a real turn) needs a key +
a played turn — it is Erik's browser-leg AND it DOUBLES as the SNG-179 verification. Play a turn with
dev on, open 🔬 Machine, and the Veth teach-me exchange is right there: raw npcUpdates, whether
bondType:"mentor" fired, whether markTeacher derived. The instrument and the thing it diagnoses arrive
together. 9 new smoke tests; devcapture.js earned its SYSTEM_SPEC row + ENGINE_MAP columns + count bump.

REMAINING IN SNG-186: §2c stage-an-encounter (seam confirmed clean — startEncounter takes a full def,
sanitizeNewEncounter clamps it), §2a go-anywhere, §2b know-nothing reset. Then SNG-187 cold-load
(received, briefed — Promise.all per manifest group; caution 3 the order-independence trap is noted).
STILL OPEN AND YOURS: SNG-179's reproduced-symptom verification (now also the §2f live check). -->

---

<!-- status: SNG-187 cold-load COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.158. Suite green by
exit code; correctness proven byte-identical against the sequential load. Results:
po/results/20260719_SNG-187_cold_load.md. Erik chose this over §2c and SNG-188.

YOUR DIAGNOSIS WAS EXACT. loadContent awaited ~250 JSON files STRICTLY SEQUENTIALLY (Promise.all
appeared zero times) = ~15s of pure round-trip latency, not payload. Counted the fetches: 250.

THE FIX — three sequential stretches parallelised: the ~12 core rule-loads (one Promise.all), the 10
content groups (the 252 files, promises created before the first await so groups OVERLAP), the
~14-fetch tail. ~250 serial round-trips → a handful of waves.

BOTH CAUTIONS HELD. Failure tolerance — valley items + quests keep allSettled (skip a bad file);
every fatal-on-miss group stays Promise.all. Order-independence — Promise.all/allSettled preserve
INPUT order in their results, so every fold runs in manifest order; an id collision's winner is
unchanged (last-write-wins), quests concat in the same order. CAUTION 3 PROVEN NOT ASSUMED: a Node
harness (fetch shim over the real files) ran loadContent both ways and compared a fingerprint —
counts + a value-size hash per id-keyed map (catches a reordered collision winner, not just a drop) +
accord-tagged abilities + legends-in-npcs — IDENTICAL TO THE DIGIT. That run also proves loadContent
executes end-to-end without throwing.

THE WIN, QUANTIFIED (localhost can't show latency — your point): synthetic per-fetch delay, 250
fetches, PEAK CONCURRENCY 221 (was 1), parallel 258ms vs sequential-equivalent 6250ms at 25ms/fetch =
24x. Scaled to ~60ms CDN the sequential path is ~15s — reproducing your 15.30s and confirming the
diagnosis; parallel is a few waves, inside the <2s target.

⚠️ VERIFICATION IS YOURS, and localhost cannot substitute — I could not even see the change in the
in-app browser (its ES-module cache pinned the old state.js across a server restart + force reload;
the stale-tab trap), and localhost is a disk read with no latency regardless. LCP before/after on the
LIVE CDN is the real proof (§6). A [loadContent] count canary logs at boot so a silent group-drop on
the real server shows in the console. Prompt caching untouched (§4). §3.5 early-paint + §5 bundling
NOT done — likely moot now; measure the new LCP first.

QUEUE NOW: SNG-186 §2c/§2a/§2b (workbench remainder), SNG-188 moved-without-consent (new spec at HEAD).
STILL OPEN AND YOURS: SNG-179 reproduced-symptom check, SNG-187 CDN LCP. -->

---

<!-- status: SNG-190 ALL FIVE SECTIONS COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.159–163, one
verified commit each. Suite green by exit code at every ship. Results:
po/results/20260719_SNG-190_teleport_and_three.md. Three of four were the engine contradicting itself,
as you called it; §3 was a defect in my own §2f panel.

§1 THE TELEPORT (v1.8.159) — dead. §1.3 sub-place → PARENT LOCATION (findSubPlaceParent first; the
kitchen is a sub-place of Cairnhold so it lands in Cairnhold, no move) — the fix that alone prevents
it. §1.1 the waygate router is skipped for a sub-place and only claims a move to a REAL GATE. §1.2
unresolvable-from-gate FAILS CLOSED (returns null), never the hub — same principle as SNG-188 §4.2.
§1.4 prompt reconciled: a sub-place (room/garden/kitchen) is NOT a destination; minting stays for
separate places (SNG-117 intact). Reproduced-symptom test on the literal captured ref.

§2 ONE PERSON TWO RECORDS (v1.8.162) — reconcileGeneratedNpcWithMeet (npcs.js, the identity module)
re-homes the generated record onto the MET id, matched by the hint naming the met person. silas-mother
keeps its bond, gains Hesta Vorn's name + craft; hesta-vorn gone. Unrelated requests don't falsely
merge. Tested on the literal scenario.

§3 FIRING PANEL FALSE ZEROS (v1.8.160) — MY §2f bug, trust-critical. It read _opLedger, which only
markTeacher instruments, and rendered 31 un-instrumented ops as NEVER FIRED above an exchange that
emitted six. Now: emission counted for EVERY op every turn (_opEmitted + _opTurns denominator);
applied/rejected shown ✓/✗ only where instrumented; captures folded so a card's emitted op can't read
as not-emitted above it; caption with no turns says "it is not a finding." Verified live, 4 guards.

§4 RAW MARKDOWN (v1.8.161) — renderProseHtml (narration_voice.js, the visual twin of cleanForSpeech)
renders the *✦ … **bold** …* asides as styled .beat-aside; zero asterisks reach the reader.
Unit-tested on the literal captured string.

§5 SNG-189 CARRY-OVERS (v1.8.163) — §5a [object Object]: coerceSceneSummary guards the chronicle push
(the ONLY raw-object write — Q2 answered: facts/places already String-coerce); reconcile v12 sweeps
corrupted saves. §5b the silent 72h clamp: raised to 168h (a montage journey is expressible) and a
truncation is now RECORDED (_timeClampNote), never silent.

⚠️ STILL NEEDS YOUR RULING (SNG-189 §5 Q1): the invented "World-day 23" in durable notes is the GM
adding journey days to a real-time-derived shared calendar. I did NOT strip the day-numbers — if
journeys DO advance the calendar, 23 is correct and the calendar is what's wrong. That's yours.

QUEUE NOW: SNG-186 §2c/§2a/§2b, SNG-188 moved-without-consent. STILL OPEN AND YOURS: SNG-179 repro
check, SNG-187 CDN LCP, and the SNG-189 §5 Q1 calendar ruling. -->

---

<!-- status: RUNNING_FIXES A5 COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.164. Suite green by
exit code. (Also: A1 the 72h clamp already landed as SNG-190 §5b — both struck through in
RUNNING_FIXES.md.)

A5 — the GM stopped denying REAL places. Erik asked to travel to The Blocklands; it said the place
"isn't a named location in the world." the_blocklands.json exists, is manifested, has 2 inbound
connections. Cause: recallForGM was gated by isPlaceKnown, so a place the player NAMED but never
visited was filtered out, recalledDetail came back empty, and the GM answered from lore (Valley only).
Absence from context rendered as absence from the world — the SAME shape as SNG-190 §3's false zeros.

FIX: existence and knowledge were collapsed; now separated. recallPlaces surfaces a NAMED place from
the full atlas in two tiers — KNOWN (with detail, ranked first) and REAL-BUT-ROUTE-UNKNOWN (existence
only, no detail — still not omniscience). recallForGM renders the far tier under an explicit "these
EXIST, the way is unknown, never deny them" instruction, and the gm.js RECALLED header now says "you
are UNAWARE of it" for a name in neither tier (honest uncertainty) instead of "has not been placed
yet" (a denial). Refines SNG-176 without undoing it — a non-atlas name stays truly unfindable.
Reproduced-symptom test on the literal Blocklands capture; the SNG-176 test reconciled to
existence-only. Erik's browser-leg is the live check.

RUNNING_FIXES still OPEN and mine: A2 (scene closed on a live thread — mechanically detectable),
A4 (the CLASS of unguarded prose-counts in content files — one instance fixed, the gate is not),
A3 (low). QUEUE unchanged otherwise: SNG-186 §2c/§2a/§2b, SNG-188. -->

---

<!-- status: SNG-188 moved-without-consent COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.165. Suite
green by exit code. Results: po/results/20260719_SNG-188_moved_without_consent.md. All FIVE outcomes.

Your root — the guard needs more to fire than the action needs to act — closed from both ends.

§4 DISCUSSING ≠ DOING: isSpeechAct (engine/intent.js, pure + exported) is the code belt behind the
parser prompt; a label led by a speech verb (announce/confide/tell/discuss/plan…) returns null from
travelIntentOf before buildTravelDirective can force anything. Erik's exact label stays in the alcove.
§3 THE DIRECTIVE IS NO LONGER ABSOLUTE: buildTravelDirective was "you MUST emit moveTo"; now "move
them IF the fiction departs this beat; if still planning, don't." SNG-122's judgement given back.
§2 FAILS CLOSED: departureGateFor now ASKS on an unresolvable origin/dest (names what it couldn't
resolve) instead of returning null — the old fail-open is exactly why Silas moved (his origin, the
unrecorded warden post, didn't resolve; that's the SNG-176 defect causing a second one). §5 SAME-REGION
TRAVEL IS STILL TRAVEL: gates a crossing OR a non-adjacent journey; an adjacent step still proceeds
(not a nag). §1 offer is go/stay/stay-default, declining commits nothing (SNG-145 held).

Reproduced-symptom test on Erik's literal label + the full gate matrix. Two SNG-145 tests that
asserted the old fail-open behavior updated to the new contract. Both the teleport (SNG-190 §1) and
this are now fail-closed — the same failure seen in both directions in one day, both shut.

QUEUE NOW: SNG-186 §2c/§2a/§2b (workbench remainder) is the last big open build. RUNNING_FIXES still
mine: A2 (scene closed on a live thread), A4 (the CLASS of unguarded prose-counts), A3 (low). Erik's
browser-legs: SNG-179, SNG-187 LCP, SNG-190 §1/§2 and SNG-188 live checks, and the SNG-189 §5 Q1
calendar ruling (C1). -->

---

<!-- status: SNG-186 §2a + §2b COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.166. Suite green.
Built BEFORE §2c per Erik's reorder — the dev character couldn't reach a real location to test, so
go-anywhere and know-everything were the live blockers on his whole verification workflow.

§2a GO ANYWHERE — jump to any of the ~95 locations by id/name, ignoring connections/waygates/travel
time (incl. unreachable ones), through the REAL move fields (currentLocationId/addKnownPlace/
notePlaceVisit/notePerception — §3.3), clears the scene and drops into Play at the new place. §2b KNOW
EVERYTHING / NOTHING — reveal all locations, or reset to just where you stand (the inverse matters
more: SNG-176 retrieval bugs only reproduce from ignorance). §3.2: markDevAction stamps every pull
onto _devActions, which rides into feedback. 5 source guards green; no-character render verified live;
the with-character lever is Erik's real-save test (the purpose). §2c (encounter harness) remains.

SNG-191 READ AND SCOPED, not yet started — it is genuinely the big one, and the unit-name ruling it
flags is ALREADY resolved in canon (world_clock.json: canonical "count", formal "the Kept Count"), so
nothing is blocked. Five phases: (A) the two-clock SPLIT — world time becomes a COUNT not days, which
is what removes the day-number the GM keeps inventing (closes C1/SNG-189 §2/SNG-190 §5; scoped, low
blast radius: add worldCount + rewrite the CURRENT TIME block + uncap timeOps + load world_clock.json);
(B) the peoples' idioms on top of the count; (C) party formation syncs CHARACTER clocks; (D §4) the
WORLD-TICK INVERSION — stop imagining vignettes, advance delegated assignments (the substantive half,
a real rewrite of worldtick.js); (E §7) the GENERATION TURN — latent arcs foment on the world count
and surface at thresholds (a whole new proactive subsystem). Recommend building Phase A first — it is
the highest-value, most-contained, and closes the recurring day-number bug. D and E are large enough
to each warrant their own focused build. -->

---

<!-- status: SNG-191 PHASE A COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.167. Node suite green;
code proven in the browser via a cache-busted fresh loadContent. Results:
po/results/ pending (will file). The two-clock split — the piece that kills the invented day-numbers.

worldCount() is the world's monotonic COUNT (~1/real-hour, never rewound, the shared ordering key).
world_clock.json loads onto CONTENT.worldClock (unit "count"/"the Kept Count" + custody + 11 idioms —
the unit-name ruling was ALREADY resolved in canon). The CURRENT TIME block now shows the character's
own days/season + the Kept Count as an ORDERING mark that is explicitly NOT a date — no world
day-number remains to invent (closes C1 / SNG-189 §2 / SNG-190 §5). timeOps UNCAPPED (RUNNING_FIXES A1
dies — a four-day journey costs four character-days). worldDateLabel → worldCountLabel.

⚠️ HONEST VERIFICATION NOTE: the preview browser's static-import boot shows the known STALE-MODULE
artifact — this session edited many bare-imported engine modules and the mcp browser holds them hard
(no service worker; pure HTTP module cache) against a fresh app.js. A cache-busted fresh loadContent
returns 95 locations, world_clock loaded, 285 abilities — so the CODE is correct; a clean full-boot in
THIS preview wasn't demonstrable without a fresh origin. Erik's fresh deploy loads clean (Pages ETag
revalidation); a hard reload clears it if a returning tab hits it. The CURRENT TIME prompt is his
browser-leg (narrate from character time; no day-number).

REMAINING SNG-191: B (peoples' idioms on the count) + C (party-formation syncs CHARACTER clocks) are
small; D §4 (world-tick inversion — advance delegated assignments, not vignettes) + E §7 (the
generation turn — latent arcs foment and surface) are large, each its own focused build. -->

---

<!-- status: SNG-191 PHASE B COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.168. Suite green.
The count is spoken in the LOCAL people's idiom — one number underneath, many words on top (§2).
worldCountLabel(count, worldClock, peopleId) resolves the idiom from world_clock.json canon; the
gm_registry builder finds the people from the character's region (region → home tradition); the
CURRENT TIME block frames it "the shared count, spoken as the people here count it." Cairnhold →
tolls, Gearlands → revolutions, rootkin → risings; churnfolk (no steady word) and any absent people
fall back to the formal "the Kept Count." Tested against the canon idiom table.

⚠️ PHASE C RECLASSIFIED — NOT a quick phase. The shared scene (party.js) carries NO clock, so syncing
members' CHARACTER clocks means propagating a time delta across players' saves on different devices —
distributed infrastructure (each save is client-side; I cannot write another player's save
synchronously), untestable without two players, and stamping the join ALONE would be inert data with
no reader (the built-but-unconnected anti-pattern this batch's lenses exist to catch). So C sits in
the D/E focused-build tier, not the quick one. My "B+C are quick" call was optimistic about C.

WHERE SNG-191 STANDS: A+B shipped — the clock is now correct (world time is a count, no day-number to
invent — C1/SNG-189 §2/SNG-190 §5 closed) and localized (each people's idiom). The three LARGE pieces
remain, each its own focused build: C (distributed party clock-sync), D §4 (world-tick inversion — the
substantive half), E §7 (the generation turn — the proactive world). Recommend D next for gameplay
value. Erik to steer. -->

---

<!-- status: SNG-191 PHASES D + E COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.169 (D) · v1.8.170
(E). Suite green by exit code. Erik: "Take D then E." Results:
po/results/20260719_SNG-191_two_clocks_and_a_turning_world.md.

D §4 THE WORLD TURNS — the tick stops imagining what a person FELT and advances what PROGRESSED on
what they were DELEGATED. engine/assignments.js holds delegation as state; a delegateOps op captures
it (contract + SALVAGEABLE_OPS + dispatch + rule 14). The tick advances each charge (progress/stall/
problem/done — an OUTCOME); news is DERIVED from what moved and empty news is legitimate; personal
colour → statusNote. §4.2 a charge against a crisis HOLDS it from worsening, two EASE it a stage back
— an untended crisis worsens as before; delegation is how a crisis gets solved offscreen.
UNGUARDRAILED (§4b). The GM sees the commitments (DELEGATED WORK block). 16 tests.

E §7 THE GENERATION TURN — the proactive half generateRequest never built. engine/latentarcs.js:
arcs FOMENT on the world count whether or not seen, and SURFACE at thresholds (discovery is a LATE
event). Three fates — grows (unguardrailed), RESOLVES ITSELF (the world solves its own problem, §7.3),
handled (model ready; trigger a follow-on). ATTRIBUTABLE — every arc carries a cause that existed
before it surfaced (§7 inv2); new arcs seed from the disposition of the regions the player knows
(regional). runGenerationTurn runs on return; surfaced arcs ride a STIRRING IN THE WORLD block. 10 tests.

assignments.js + latentarcs.js earned their SYSTEM_SPEC rows + ENGINE_MAP columns + count 57→59.

SNG-191 A/B/D/E SHIPPED. REMAINING follow-ons, each honestly scoped: C (party clock-sync — distributed,
per-device saves, its own build), the handled-fate trigger (intervention capture), §7.4 seasonal
pressure (a clean cyclical layer). The invented day-numbers are gone; the clock speaks the local tongue;
the delegated work goes on; the world ferments its own trouble while you are away. Erik's browser-legs:
the CURRENT TIME narration (no day-number), a return after time away (work moved, arcs stir). -->

<!-- status: SNG-191 §7 FOLLOW-ONS COMPLETE_PENDING_REVIEW (CCode 2026-07-20). v1.8.171. Suite green.
Two of the three named SNG-191 follow-ons closed; only Phase C (party clock-sync) remains open.
THE HANDLED FATE — setArcFate(arc, fate) + an arcOps op {arcId, fate:"handled|resolved"} (SALVAGEABLE_OPS
+ contract + dispatch + STIRRING block instruction); the GM closes a surfaced arc the character dealt
with, so the world stops carrying it as unfinished. §7.4 SEASONAL PRESSURE — SEASON_PRESSURE table +
seasonalPressure/seasonalDetailForGM; runGenerationTurn tilts a matching arc kind with the season (a
scarcity winter presses shortage/feud arcs harder); THE SEASON gm block. 10 tests. -->

<!-- status: SNG-193b SCHOOLS WIRING COMPLETE_PENDING_REVIEW (CCode 2026-07-20). v1.8.172. Suite green by
exit code. Results: po/results/20260720_SNG-193b_schools_wiring.md.

§3.3 THE FEATURE — band resolution reads the SCHOOL, not the tradition: two practitioners of one tradition
get OPPOSITE best-grounds (reaching mind wants thin, instrumented wants dense). ONE seam (§5 Q1 answered:
substrateVerdict/bandForSchool; no prerequisite refactor). substrate.js SOURCE_BAND (material=flat floor,
inherent/natural low, lattice high, wild wide). §4 THE FLOOR IS THE ROOT'S — a material root/extension is
never starved (materialFloor 0.7); an augmented craft degrades TOWARD its pure form, never to zero; "the
material school travels." §5 Q3 — un-schooled saves fall back to the pure/root school SILENTLY (byte-
identical), reconcile v13 backfills. §3.5 CI GATE — all 19 schoolAffinity refs resolve to a school of their
own tradition (fails the build otherwise). A non-pure school is EARNED in play via the adoptSchool GM op
(story-gated, "changing is hard, a story"), validated by setCharacterSchool; the GM is told the school
(schoolsDetail §3.6). 35 tests. SYSTEM_SPEC schools architecture section; ENGINE_MAP regenerated
(substrate.js gains the CONTENT.schools edge + adoptSchool verb); count unchanged 59/32; RUNNING_FIXES
nothing (a build). §5 Q2 answered: creation step order IS flexible — a creation-time school picker is a
clean SNG-192 add reading the same setCharacterSchool seam; not built here. Erik's browser-leg: two same-
tradition characters in different schools feel opposite ground; a story-earned school change lands via play. -->

<!-- status: SNG-194 THE GM OFFERS COMPLETE_PENDING_REVIEW (CCode 2026-07-20). v1.8.173. Suite green by exit
code. Results: po/results/20260720_SNG-194_the_gm_offers.md. Built per Erik's steer ("the engine work next")
using SNG-195 §4b as the trigger design.

THE OUTCOME — the world OFFERS, not only responds: the GM introduces ONE thing the player isn't reaching
for, rarely, drawn from something already true. §4b THE ENGINE DECIDES, THE MODEL NEVER JUDGES —
pacing.roomForAnOffer is a pure gate (a grip = encounter/gambit/intent/world-already-pushing is never room;
else a positive opening lull||arrived, off OFFER_COOLDOWN). The short unconditional invitation reaches the
prompt ONLY when the engine set it — the same fix as the ops that fired 0× in 16 levels (don't ask a model
to judge in one clause; compute it). §3 THE OFFER OP {thing, from} — from REQUIRED (attribution is the whole
difference from a random-encounter table), COUNTED via logOpOutcome (SNG-190 §3), resets turnsSinceOffer. §5
answered: Q1 fears was NOT in the turn prompt (only wants) — npcFearsForGM adds it, surfaced only inside a
room-gated offer (the richest NON-hostile-surprise source); Q2 no rate-limit counter (per §4a it lands
mid-duel) — scene-state gate instead; Q3 distinct op, yes. Invariants (non-blocking, declinable, not-always-
trouble, foreseeable) in the block. 24 tests. SYSTEM_SPEC §13 'the world OFFERS' + latentarcs API drift
fixed (markHandled→setArcFate); ENGINE_MAP regenerated; count unchanged 59/32. Follow-on flagged: feed an
ignored offer's `from` into seedArc so an offered thread persists as a latent arc (turns a beat into a
commitment — not built). Erik's browser-leg: arrive somewhere quiet and someone turned down scenes ago is
at the door; never mid-duel. -->

<!-- status: SNG-195 PROMPT REVIEW COMPLETE_PENDING_REVIEW (CCode 2026-07-20). AUDIT — no engine change, no
version bump. Results: po/results/20260720_SNG-195_prompt_review.md. A6 (writerly audit) folded into column 4.

METHOD: backbone from ENGINE_MAP + 56 gm_registry rows; three parallel evidence passes (block-by-block
directive-mood classification of all 60 prompt blocks; op dispatch+firing observability; content-corpus
orphan sweep). BOTH directions (§2a).

HEADLINE: the pipeline fires — every op dispatches, and every op's FIRING is observed (the '31 uncounted'
scare is STALE: opsFiredIn→_opEmitted drives the fired/never split, not logOpOutcome). The losses are all one
shape (authored intent, no consumer). RANKED GAPS:
- G1 ⭐ orphaned CONTENT — reactsToReputation (40 NPCs, only touch is a write-of-empty at generate.js:83),
  personality (40, +warmth/trust/candor/patience), gains (779 rank-node strings). Real authored intent nothing
  reads. WIRE (they're the offer's own material) or STOP AUTHORING. Aevi decides wire-vs-cut; CCode wires.
- G2 permission→instruction: 2 of 7 permission blocks are genuine L2 gaps. WANTS (rule 10b) — SNG-194 already
  built the engine half (the offer); simplify the block to material. TEACHERS (rule 16B) — the exact SNG-179
  teacher-gate shape; clean next SNG-194-pattern target (roomForATeacherOffer). Other 5 correctly optional.
- G3 (1-line bug): OUTCOME_INSTRUMENTED=Set(['markTeacher']) at app.js:954 renders the applied/rejected badge
  for only 1 of the 5 ops that now write outcome (delegateOps/arcOps/adoptSchool/offer write data nobody sees).
- G4 relationshipDeltas is salvageable+dispatched but NOT in the contract (model never told); 3 undocumented
  aliases (unlockLivingCurrent/unlockWildCurrent/timeAdvanceHours).
- G5 31 of 59 engines have no one-line purpose (§1c column-1 gap; author in engine_map.authored.json).
- G6 A6 residue small; rule going forward: if a block must FIRE something, the engine computes it — SNG-194 is
  the reference. schoolAffinity (3 abilities) is CI-validated (SNG-193b) but runtime-unconsumed — deliberate
  per SNG-193 (not a gate); CCode owns that note.
RECOMMENDED FOLLOW-ONS ranked in the doc. G1 (wire vs cut) is Aevi's call; G2/G3/G4/G5 are CCode-buildable.
Nothing improvised past scope — this is the audit; the fixes are separate tickets. -->

<!-- status: SNG-195 G3 + G5 SWEPT COMPLETE_PENDING_REVIEW (CCode 2026-07-20). v1.8.174. Suite green by
exit code. Erik-directed ("sweep g3 and g5 as aevi digests"). No standalone results doc — two small
fixes off the audit; detail here.
G3 — OUTCOME_INSTRUMENTED widened from {markTeacher} to the 5 ops that actually write outcome
(markTeacher/delegateOps/arcOps/adoptSchool/offer) at app.js:954; a smoke test now pins the display set
to the logOpOutcome callers so it cannot drift again. Dev-panel display only, no behaviour change.
G5 — authored purpose + player-surface + trigger for all 31 '— unstated —' engines in
engine_map.authored.json (grounded in each module header); ENGINE_MAP regenerated 28/59 → 59/59 described,
standing advisory cleared. Closes SNG-195 §1c.
NOTE: Aevi's ruling (po/results/20260720_SNG-195_aevi_ruling.md) confirms the audit and reorders: A7
content cache-busting goes FIRST (one line in fetchJSON/fetchText — until it lands Erik cannot verify any
content browser-leg; he saw literal \n from a file fixed at origin hours earlier). Then G2
roomForATeacherOffer carrying WANTS + reactsToReputation (WIRE to the offer path), then G4. G1 split:
reactsToReputation WIRE-to-prompt (offer material), personality CUT (redundant with voiceHints, engine-
eligible/prompt-ineligible), gains WIRE-to-engine (779 functional tags for SNG-192 coverage), never prompt.
Awaiting Erik's go on A7-first. -->

<!-- status: SNG-195 G2 COMPLETE_PENDING_REVIEW (CCode 2026-07-20). v1.8.175. Suite green by exit code.
Results: po/results/20260720_SNG-195-G2_teacher_initiative.md. Erik: skip A7 (phantom — old screenshot),
do G2 now.
TEACHER INITIATIVE — the oldest complaint, teachers that teach nothing. The block's 'OFFER when the moment
fits' (permission the model rarely acted on, the SNG-179 shape) is GONE. roomForATeacherOffer (pacing.js):
a present teacher with a REACHABLE next step + opening + no grip + not-the-general-offer-this-beat + off the
shared offer cooldown → the block FLIPS to 'A TEACHER TAKES THE INITIATIVE' (unconditional). teacherOfferReady
(company.js): company trainer always present; bonded willing teacher only when in-scene; unreachable step =
not room ('not yet' is real). Shares turnsSinceOffer (the offer op counts + rate-limits it).
reactsToReputation WIN (G1 ⭐) — npcReactionsForGM wires the 40-NPC orphan into the offer material; the offer
draws from 'HOW THEY READ WHO THE PLAYER IS', attribution built in. FINDING/deviation from the ruling: the
keys are NOT a fixed taxonomy (adept_sona: balanced/extreme/seeking; brann: kind/threatening/honest) and no
classifier exists — that's WHY it was never wired. So the whole map is surfaced and the GM selects; the
engine never computes a key it cannot compute. WANTS already ride the SNG-194 offer (same seam). 26 tests,
SYSTEM_SPEC §13, ENGINE_MAP regen (59/59 held). personality NOT touched (Aevi: CUT/stop-authoring, no churn).
gains (WIRE-to-engine, SNG-192 coverage) is out of scope for G2's prompt seam — belongs with SNG-192.
REMAINING from the audit: G4 contract cleanup (relationshipDeltas not in contract + 3 aliases); gains-to-
engine (with SNG-192); personality schema-cut. Erik's browser-leg: stand in a lull beside a trainer with a
reachable step — they open it; never mid-encounter, never twice running. -->

<!-- status: SNG-195 G4 COMPLETE_PENDING_REVIEW (CCode 2026-07-20). v1.8.176. Suite green by exit code.
Contract cleanup. relationshipDeltas REMOVED from SALVAGEABLE_OPS — it is not in the contract (the model is
told to move a bond via npcUpdates.relationshipDelta), so it is never emitted and cannot be salvaged; the
one true salvage↔contract asymmetry the audit found, closed. Its inbound dispatch stays as pure legacy
tolerance. The three undocumented aliases (unlockLivingCurrent/unlockWildCurrent — contract routes living/
wild via unlockSubstrate by powerSystem; timeAdvanceHours — subsumed by timeOps) now explicitly commented
legacy at the dispatch. No behaviour change; 4 tests. AUDIT G-fixes now all done (G2/G3/G4/G5); remaining is
G1's split — reactsToReputation WIRED (G2), personality CUT (no-build), gains WIRE-to-engine which rides
SNG-192. Moving to SNG-192 next (Erik-directed). -->

<!-- status: SNG-192 PHASE A COMPLETE_PENDING_REVIEW (CCode 2026-07-20). v1.8.177. Suite green by exit code.
Results: po/results/20260720_SNG-192-PhaseA_grants_and_suggestions.md. SNG-192 decomposed (it lacked one);
Erik chose Phase A (grants-first + suggestions). §8 answered from code: Q1 attributes precede the ability
step + it recomputes on entry (nativeGrantIdsFor safe); Q2 class_archetypes.json is a genuine loader orphan
(Phase C); Q3 prologue.tags is on state.
§1 THE FIX — renderAbilityStep computes nativeGrantIdsFor at render, shows 'Yours by right of being an
<people>' as a NON-SPENDABLE group AND excludes those crafts from the choosable pool: a pick can no longer
be wasted (Erik's screenshot). §3 SUGGESTIONS — functions.suggestForCreation wraps recommendSkills with the
PROLOGUE (revealed preference: paths actually chosen) + a light bio nudge; every suggestion carries a reason
from the player's own input ('you took the Seer path twice'); reasonless crafts dropped. §2 the 45-button
wall folds behind details/summary, one click to see all. 8 tests.
⚠ BROWSER NOTE: boot hit the KNOWN stale-module cache (bare engine imports don't ?v=-bust; the long-lived
preview tab served a cached old functions.js vs the version-busted app.js → CCODE-08 watchdog, its designed
cache-mismatch self-heal via Reload-fresh). Served files VERIFIED correct (functions.js exports
suggestForCreation; app.js has the import+grants) — isolates it to browser cache, not code. Creation VISUAL
is Erik's real-save test (fresh load). REMAINING SNG-192: Phase B (coverage/source-fit §6b/braids §6c;
gains-to-engine lands here — still owe verifying gains values are in the 24-verb vocab), Phase C (archetype
picker + class_archetypes.json load). -->

<!-- status: SNG-192 PHASE B COMPLETE_PENDING_REVIEW (CCode 2026-07-20). v1.8.178. Suite green by exit code.
Results: po/results/20260720_SNG-192-PhaseB_robustness.md. The 'robust' half of creation (§5+§6b+§6c).
⚠ GAINS VERIFICATION (owed): gains has only TWO distinct values across 779 nodes — broaden(550)/deepen(229),
a rank-PROGRESSION axis, NOT the 24-verb vocabulary. Aevi's G1 premise (gains = coverage tags) was inferred
from the one-word sample and is WRONG; gains is NOT wired to coverage (§5 uses ability.functions via the
existing functionCoverage). Third wrong-premise verify-before-build has caught this batch. If PO still wants
a broaden/deepen surface it's a separate skill-wheel ticket.
§6b commonGroundFor (substrate.js, novel + pure): intersect a build's traditions' substrate bands → the
density window where the WHOLE kit works. Matches the spec table on live content — ashwarden+rootkin+somatic
= [0.00,0.56]; ashwarden+enginewright = NONE (lo 0.77 > hi 0.73, Erik's provable half-powered-everywhere
warning, said at the pick not at level 8). groundAsPlace names it a PLACE (thin/middle/dense country).
§5 coverage rendered from functionCoverage ('you can harm·know·move; no way to restore — a real choice').
§6c coherence↔divergence framed, never a penalty ('coherence makes you strong here; divergence makes you
new'; off-source picks are seeds). 9 tests, SYSTEM_SPEC substrate row, ENGINE_MAP 59/59. Same creation
browser-leg as Phase A (engine matches the spec table; UI source-verified; visual = Erik's real-save test).
NOT done: pool source-reordering (§6b refinement) + gains-to-a-real-consumer (premise wrong). REMAINING:
Phase C (archetype picker + class_archetypes.json load) is the last SNG-192 phase. -->

<!-- status: SNG-192 PHASE C COMPLETE_PENDING_REVIEW → SNG-192 COMPLETE (all A/B/C) (CCode 2026-07-20).
v1.8.179. Suite green by exit code. Results: po/results/20260720_SNG-192-PhaseC_archetype_picker.md.
§4 ORPHAN LOADED — class_archetypes.json was authored + in provides.rules + called by nothing (clean L4);
state.js loadRule('class_archetypes') → CONTENT.classArchetypes, content_ci clean. VERIFY-BEFORE-BUILD held
this time: all 9 distinct coreFunctions (bind/break/reveal/mend/conceal/move/heal/shield/ward) ARE real
24-verb vocabulary verbs (test asserts it, so an authoring typo fails the build). THE LENS — archetypeFamilies
maps a shape's coreFunctions → the 8 families; suggestForCreation gains an archetypeFams param that BOOSTS a
matching craft with a 'fits the Shadow path' reason but NEVER gates (off-shape crafts still surface on their
own reason — tested). UI: an archetype picker row ('a lens not a class') above the suggestions; the toggle
never touches the picks (§7.5 selects not locks); click the shape again to clear. 7 tests, ENGINE_MAP regen
(class_archetypes → functions.js edge). NOT done (deliberate): no auto-fill of picks (surfaces the build, one
click each — auto-fill risks clobbering; 'lens never locks' = surface not impose) + no per-tradition byReach
(keyed by reach/axis, needs a tradition→reach map) — both small safe follow-ons if Erik wants.
SNG-192 DONE: A grants+suggestions · B robustness (coverage/common-ground/braids) · C archetype door. Same
creation browser-leg across A/B/C — engine tested, UI source-verified, VISUAL is Erik's real-save test (the
gated flow + the known stale-module preview cache). Recommend Erik real-save-test the creation flow end to
end before further creation work. -->

<!-- status: SNG-196 BRAID ENGINE (foundation) COMPLETE_PENDING_REVIEW (CCode 2026-07-20). v1.8.180. Suite
green by exit code. Results: po/results/20260720_SNG-196_braid_engine.md. Erik-directed from the diagnostic
(Silas: 40 co-activations, 0 braids — braids REQUIRED an authored recipe, only 3 existed, none for played
crafts). Made GENERATIVE. engine/braids.js (pure): mintableBraidsFor (co-activated ≥ BRAID_RIPEN_AT=5, both
crafts held, not yet braided — NO recipe needed), braidTier (power→tier, deeper parent's rank sets ceiling),
buildBraidDef (FULL-schema ability — tree/function-union/harsher-harmRung/provenance; optional model-authored
name+tree override, else a valid playable stub so a mint never halts), mintBraid (→ customAbilities so
fullCatalog resolves it everywhere + held ability + braids ledger; idempotent). NAME: auto/model-suggested,
player can override (minted.namedBy). reconcile v14 backfills earned braids on load — VERIFIED on Silas: mints
order_sense+palework (6x) + deathsense+order_sense (5x = the Double Register). 16 tests, SYSTEM_SPEC module row
+ count 60, ENGINE_MAP 60/60. FINDING: only 3 emergence recipes + 6 prose-only combos exist; the Double
Register is NOT in the abilities corpus (a spec claimed it was). REMAINING (Erik's full ask): (1) generate.js
'braid' type so the model authors the rich tree/description; (2) live-play mint flow (offer→accept→name→
generate→mint, SNG-194 pattern); (3) Pell's ironsense — the NPC-skill path (she's now more than normal;
ironsense is prose-only, 22 mentions). Recommend Erik load Silas to see the 2 backfilled braids before the
rich-generation lands on top. -->

<!-- ═══ SESSION CLOSE 2026-07-21 (CCode → Aevi). Full writeup: po/results/20260721_SESSION_HANDOFF_to_Aevi.md
Erik is taking it to Aevi to spec the next session. Shipped this session (all green, pending review; 193b
CLOSED by Aevi): 191 §7 follow-ons, 193b, 194, 195 audit + G2/G3/G4/G5, 192 A/B/C, 196, 197 part 1.
BRAID = the live thread. Done: engine (196) + doctrine/tier fixes (197 part 1, Aevi-verified). NOT built =
SNG-197 part 2, now grown by Erik's live decisions into 4 pieces (build order):
  1. RICH GENERATION — generate.js "braid" type: model authors name (his ex: "Perfect Inevitability"),
     description, tree prose, emergent-capability flavour. Prerequisite. (Also: make the §4 vocab validation
     of the emergent function REAL code, not the comment 197 part 1 left.)
  2. THE MINT MOMENT — a distinct holy-shit beat, reachable later; backfilled stubs (Silas's 2) get the
     moment they never got on next load.
  3. ⭐ SHARED RECIPES (Erik decided): global, FIRST-FINDER authors the name/def, rides the shared-canon
     sync, later finders of the same pairing ADOPT it (no dup), collisions → canon rank-by-realness. Reuse
     the emergence_recipes format.
  4. ⭐⭐ WHEEL BY COORDINATE (Erik's vision — NEEDS AN AEVI SPEC): braids placed BETWEEN the two axes they
     braid; more broadly every skill placed by its axis-composition (mostly-death-adopts-order → near death,
     rotated toward order; pure-tradition on the axis) — this is where SCHOOLS surface, and it doubles as the
     skill-tree view (click a tradition → highlight its tree). Plus braids as an ability-list category. This
     is real geometry tying braids+schools+skill-trees — spec it properly, don't rush the coordinate math.
My part-2 Round-2 answers (locked): emergent=an added function (validated); enrich at mint (stubs lazily on
load); rename on both the moment + the ability card; re-present backfilled stubs as the moment.
STILL AWAITING ROUND 2 (I did not build — Erik prioritized the braid): SNG-198 (world-tick: join the two
offscreen halves + the never-built wantProgress counter + widen to met/heard-of/EPIC) and SNG-199 (one
person one codex: prose-in-name, aliases-never-read, no codex auto-mirror on meet, player-conferred names,
search). SNG-199 Q5 first: 197/198/199 + SNG-134 all touch the codex/ability ledger — sequence before build.
My preliminary reads on both are in the handoff §4. ═══ -->










