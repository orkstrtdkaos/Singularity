# PIPELINE ALERT — Singularity## 📖 SNG-128 — World-Authorship Chronicle (Brooklyn's ask — specced, awaiting CCode)
`po/SPEC_SNG-128_world_authorship_chronicle.md`. Brooklyn (playing Aelyn) wants a shareable session chronicle + meta-data on how much of her experience is prewritten canon vs novel content she made, and how much PERSISTS. **She intuited the thesis by playing — and the engine already computes all three of her questions** (this is SURFACING, not inventing): authored-vs-generated is tracked everywhere (`known:{authored,generated}`, `_gen` flags); persistence IS the `canon.js` promotion engine (nominated→promoted to shared canon, or lost-contradiction→variant/rumor that still persists); attention-invested via `recordAttention`. Spec: (1) shareable session log (reuse SNG-109 paragraph machinery, rating-lensed sharing); (2) authorship readout — canon-vs-novel ratio, persistence tally, **world-effect score** (her intuition made literal — she was right, show her the number); (3) cross-family view (Erik/PM sees how much of the valley each member authored). Reuses SNG-109 + the canon rating-lens. Guards: read-only, opt-in privacy, honest counts from real provenance flags.

---

## 🔥 SNG-127 — Encounter dead-zone — ✅ SHIPPED, complete_pending_review (CCode 2026-07-16, v1.8.85)

> **CCode 2026-07-16:** fixed + measured. Added the MISSING `onNarrativeTime` rule (0.14/hr, cap 0.6, cooldown 1) — the code was falling back to a hardcoded 0.04/hr (the dead-zone). **Q2 was a second dead-zone:** a normal beat emits no timeOps → the path saw 0h → classify "none" → never fired (though the clock ticks +1h/beat). `beatHours()` floors an UNDECLARED beat to `minHoursPerBeat` (=1); a declared short beat stays quiet. The once-per-scene hard cap is now SOFT (spacing after the first fire, not one-per-scene-ever — the big narrative-play blocker); cooldown 3→1; click rates bumped (travel 0.45/enter 0.20/rest 0.20). Player pacing setting (`profile.pacing` Calm/Balanced/Eventful/Relentless → mult+cooldown on every roll, in Settings). All rates config-tunable. Guards kept: decline/flee-before-lethal, intimate/combat suppressors, danger-weighting. **Measured (400×30-turn Monte-Carlo + live browser sim on real content): Balanced ~3.0, Relentless ~6.2, Calm ~1.6 encounters/30-turn session — was ~0.** 12 smoke tests; boot-clean on 8211. Writeup: `po/results/20260716_SNG-127_encounter_deadzone.md`. (Original spec below.)

`po/SPEC_SNG-127_encounter_deadzone.md`. Erik: "never encountered a fight or event — crank up chances everywhere." **Diagnosed — NOT a base-rate problem:** (1) THE BIG ONE — the narrative-play path `onNarrativeTime` is **MISSING from random_encounters.json**, so the code falls back to a hardcoded **4%/hr** → near-silence in normal chat play (where you don't click travel/rest buttons); (2) a suppressor stack (cooldown 3, once-per-scene, intense/combat) gates most turns before the roll; (3) 58 encounters + real danger levels (bedrock 2, cloudform 3) sit UNUSED because nothing fires to reach them. Fix is SURGICAL not blanket: add `onNarrativeTime ~0.14/hr` (most of the win), cooldown 3→1, modest travel/enter/rest bumps, and make it all tunable in config so future "more/less" is a JSON edit not a code hunt. Guards: decline/flee before lethal preserved (SNG-002b); intimate/combat suppressors stay; danger-weighting keeps it "hopeful-strange not grim." Fights now route to the SNG-098 skill-battle panel.

---

## 🤝 SNG-126 — NPC party members, unified company w/ roles — ✅ RULING LOCKED → CCode ROUND 2
`po/SPEC_SNG-126_npc_party_members_roles.md`. Erik ruled **UNIFY (A):** one "your company" concept; companion/trainer/liaison/partner/ally are **roles that stack freely** on one NPC, sharing the bond/bonus/GM machinery. Huginn = role:companion(beast). The trainer role SETS the existing `teachers[trad]` gate (no fork); liaison multiplies `standingWithPeople`; partner = SNG-108. **Feasible now** — `companionLine` already has role+knowledge, catalog is id-keyed/generic. Composes with SNG-120 (Company section gains "Allies" group), SNG-100b (teacher gate), SNG-124 (trainer shows as WHY a skill is learnable). Design settled — CCode ROUND 2 build-confirmations only (humanoid generalization keeps Huginn valid; transient-present vs durable-taught teacher; roles[] independence).

## ⚖️ SNG-125 — Axis re-architecture — ✅ SHIPPED, complete_pending_review (CCode 2026-07-16, v1.8.84)

> **CCode 2026-07-16:** built. `isKinAdjacent` reuses the existing ring-neighbour/step-1 kin band (no second distance — ruling 1); `kinSecondaryOptions` + `domainsLegal` (grandfather-tolerant — `enforce` gates a new build, loaded saves never re-validated — ruling 2). Three sites updated: the great-circle picker gates SECONDARY to primary's kin and frees TERTIARY (was bound to the secondary's neighbours — ruling 4); `sanitizeSuggestedDomains` snaps a non-kin third-door secondary to a legal kin; `crystallizeDomains` snaps the prologue secondary to a kin and frees the tertiary. Origin re-select already resets domains → primary re-seeds → the kin gate recomputes from the new primary (ruling 3, no new plumbing). **Access math UNTOUCHED** — Silas's cogitant secondary still reads `band:"secondary"` (grandfather verified by construction; SNG-101/102 intact). 9 smoke tests (real traditions.json) + browser-runtime verified incl. the grandfather rule; boot-clean on 8207. Writeup: `po/results/20260716_SNG-125_axis_rearchitecture.md`. (Original spec below.)

`po/SPEC_SNG-125_axis_rearchitecture.md`. Erik design correction, **all 4 rulings locked (2026-07-16):** (1) adjacency = the existing KIN band (reuse, don't reinvent); (2) grandfather absolute — Silas + all existing builds stay legal, constraint gates NEW selection only; (3) primary stays origin-seeded AND origin is re-selectable at creation → re-picks primary (infra ALREADY exists — L1760 resets domains on origin change; SNG-125 just adds the kin-gate to the subsequent secondary pick); (4) tertiary stays OPEN — free wildcard, its antipode closes only LATER if promoted via the existing SNG-101 path. **Net change is small:** a primary→secondary kin-adjacency SELECTION constraint; access math (caps 5/3/2, foreclosure, promotion, acquisition) untouched, so SNG-101/102 stay intact. Design settled — CCode ROUND 2 is build-confirmations only (kin helper wrapper, origin-cascade flow, grandfather-legal at load).

## 🎡 SNG-124 — Skill system reads at a glance, functions forward (specced, awaiting CCode)
`po/SPEC_SNG-124_skill_system_legible.md`. Five coupled asks, one story — make the skill system legible instead of click-to-discover, with the 8 function families (SNG-092: HARM/RESTORE/CONTROL/MAKE/KNOW/HIDE/WARD/EMPOWER, 24 verbs) as the organizing spine. (1) **Bug:** character-screen `cs-levelup` (L3919) is unconditional — gate on `skillPoints>0||aspirationRipe` via a shared `canLevelUp`. (2) Level-up modal RECOMMENDS 2–4 skills scored by style (tendencies/aptitudes) / class (primary natives) / **function-GAP** (which of 8 families your kit lacks — highest-value axis) / ripe aspirations. (3) fn-chips → first-class colored badges (8 family colors), shown in list+modal+wheel. (4) **Wheel:** function as a visible OVERLAY — node function glyphs + 8-family filter toggles that highlight/dim nodes across traditions; tradition stays the ring, function becomes the color/filter layer (both axes at once, preserves SNG-073 geometry). (5) Owned/reachable wheel nodes show name + **effective** cost (SNG-103) at a glance, zoom-aware, not hover-only. From Erik play. Big multi-part — engine (recommender + functionCoverage) before wheel UI recommended.

---

## ✅ SNG-120 + SNG-121 — CLOSED GREEN (Aevi HEAD audit, v1.8.82)

CCode shipped both; **Aevi verified at authenticated origin.** app.js + inventory.js syntax-clean.
- **SNG-120** (collapsible sidebar + combine): 10 `<details class="sidebar-sec">` sections, state persisted to `profile.uiSidebar` via one `ontoggle`. **The risky combine VERIFIED:** the old "People you know" section is genuinely DELETED (L5242-43 carries a comment documenting it) and NPCs now render through `knownPeopleAt` at **exactly one** sidebar site (L5268, the SNG-119 who's-here section) — each person shown once, no dup, no loss. Party+Companions merged into one `data-sec="company"` section that returns "" when solo (L5255). Play-serving defaults + summary counts confirmed. **Closed.**
- **SNG-121** (pin items): `pinned` field + `ensurePins`/`_pinsInitialized` guard (auto-pins weapon+consumables+has-uses on a fresh char, never overrides an explicit choice); sidebar Items renders `pins` only + count + "＋N more". Pin toggle via `itemCard` `showPin` context flag (composes with SNG-114, no second renderer). **Closed.**

Both browser-runtime verified by CCode (auto-pin exactly 4; live toggle; boot-clean on 8199 with ?v=1.8.82).

---

## 🧭 SNG-122 + SNG-123 — narrative travel + GM-reply resilience — ✅ SHIPPED, complete_pending_review (CCode 2026-07-16, v1.8.83)

> **CCode 2026-07-16:** both built. **SNG-122** — fixed the CAUSE: a `travel` intent tag (free-text parser + GM choice vocab) + a `travelTo` destination field on `parseIntent`; on a travel-intent turn the GM gets a forceful "you MUST emit moveTo to {dest}" directive in the **uncached player tier** that enumerates reachable known places (Q2) so its target resolves. `travel` hoisted past the 6-tag cap (it gates the move — the SNG-100 romantic/flirt lesson). NEVER STRAND: `applyTurn` stashes `_pendingArrival` and `renderPlay` shows a one-tap "→ Arrive at {place}" running the map's own `travelTo` (resolve-or-mint). Trust discipline — the parser's explicit `travelTo` may mint an unmapped place, but a GUESSED phrase must resolve to a real place, so "go for his throat" (an attack) never becomes a phantom trip (browser-verified). Q1: no travel signal existed at HEAD — built one. **SNG-123** (folded in) — `salvageOps` gains targeted regex recovery for `moveTo` + `characterDeltas` from a TRUNCATED reply (movement/vitals no longer lost when brackets are unbalanced); well-formed replies unchanged. 9 smoke tests + browser-runtime verified (incl. the false-positive guard); boot-clean on 8203. Writeup: `po/results/20260716_SNG-122_123_narrative_travel.md`. (Original spec below.)

Erik's screenshot: "state updates were lost" note, after map-travel to the edge district because "in-game travel was just not getting there." **Diagnosed as TWO separate things, one causal, one coincidental:**
- **SNG-122 — Narrative travel must actually move you (PROMOTE).** `po/SPEC_SNG-122_narrative_travel_moves.md`. This is the pure-narration-exit boundary SNG-117 deferred — and live play just proved it BLOCKS normal movement (the GM narrates the journey but emits no resolvable `moveTo`, so you don't arrive; map-travel is the only thing that works). Fix: require `moveTo` on travel intent (fix the cause), infer-or-mint a destination from a clear travel beat (reuse SNG-117 mint), and a one-tap "arrive" UI fallback that shares the map `travelTo` path. **Not a nice-to-have anymore — it's a workaround-forcing gap.**
- **SNG-123 — GM-reply hardening (LOW, NOT a bug).** `po/SPEC_SNG-123_gm_reply_hardening.md`. The "state lost" note is a **graceful** degrade from a malformed/truncated GM JSON reply (retry failed → salvage narration + 20 op types → keep prior scene → self-clear). **Verified it self-cleared: Silas's `_opNote` is now null, he's correctly at `radiant_plateau_edge`.** NOT caused by travel (travel doesn't call the GM). Optional hardening only: leaner retry, targeted salvage for characterDeltas/moveTo (the ops that hurt to lose), and instrument the rate (if high in long sessions → context compaction, not a parser fix).

The two symptoms were adjacent in time, not causally linked. SNG-122 is the real fix; SNG-123 is optional polish on an already-sound recovery.

---

## 📌 SNG-121 — Pin items to the sidebar — ✅ SHIPPED, complete_pending_review (CCode 2026-07-16, v1.8.82)

> **CCode 2026-07-16:** built with SNG-120 (same sidebar render, one bump). `pinned` flag on the item record (Q2); sidebar Items renders `pinnedItems` only + `(X pinned · Y total)` count + `＋N more in Inventory` → `renderInventoryScreen`; empty-pinned hint. `ensurePins` auto-pins weapon + consumables + has-uses on a never-pinned character (Q3: quest/misc stay in the full list), **never overrides an explicit choice** (`_pinsInitialized`). Toggle via `itemCard` `showPin` flag (`data-item-pin` → shared `bindItemCardHandlers`) — context flag, no second renderer (composes with SNG-114). Q1: no equipped concept at HEAD, so default pins by `kind:"weapon"`. 8 smoke tests + browser-runtime verified on the served module. Writeup: `po/results/20260716_SNG-120_121_sidebar_pins.md`. (Original spec below.)

`po/SPEC_SNG-121_pin_items_to_sidebar.md`. The sidebar Items section dumps the ENTIRE inventory (15+ items, long scroll). Fix: a `pinned` flag per item — sidebar renders **pinned only** (+ "＋N more in Inventory" count); the player toggles a pin from the Inventory view (📌 on each itemCard). kind-based default pins (weapon + consumables + has-uses) fill a never-pinned character's empty set but **never override an explicit choice**. Composes with SNG-114 (pin is an itemCard context flag, no second renderer) and SNG-120 (Items stays collapsible; collapsed header "Items (4 pinned · 14 total)"). Nothing hidden — unpinned always in Inventory, one tap away. From Erik's screenshots.

---

## 🧹 SNG-120 — Collapsible sidebar + combine redundant sections — ✅ SHIPPED, complete_pending_review (CCode 2026-07-16, v1.8.82)

> **CCode 2026-07-16:** every section is a collapsible `<details class="sidebar-sec" data-sec="…">` (9 keyed) with open/closed state persisted to `profile.uiSidebar` via `sectionOpen`/`loadSidebarState`/`saveSidebarState` + a single `ontoggle` handler — same open-set discipline as `npcGroups`. **The real combine: "People you know" DELETED** (its people were a duplicate of SNG-119's place-scoped "who's here"; folded there, partner banner moved with them — the string survives only in a comment documenting the removal). Party + Companions → one "Company" section (disappears when solo). Defaults serve play: abilities/quests/company/items/who's-here open; attributes/play-style/map/codex collapsed with summary counts. Interactive controls kept out of `<summary>`. Writeup: `po/results/20260716_SNG-120_121_sidebar_pins.md`. (Original spec below.)

`po/SPEC_SNG-120_sidebar_collapsible_combine.md`. The sidebar grew to ~12 stacked sections (4 phone-screens tall). Every `<section>` becomes collapsible with **persisted** open/closed state (reuse the existing `npcGroups` open-set pattern + `<details>` idiom — invents neither). **Key combine, a real redundancy:** "People you know" (L5224) shows the same people as SNG-119's "{place} — standing & who's here" (L5272) — the old bare list was never removed when 119 added the richer scoped one; fold + delete (a test asserts each NPC appears in exactly ONE section). Party+Companions → one "Company" section. Defaults serve play: abilities/who's-here/items open, attributes/play-style/map/codex collapsed; collapsed headers show a summary count. Vitals stay pinned. From Erik's 4 sidebar screenshots.

---

## ✅ LOCATION + UI BATCH — CLOSED GREEN (Aevi HEAD audit, v1.8.81)

CCode shipped all three; **Aevi verified at authenticated origin.** app.js syntax-clean.
- **SNG-117** (known world navigable): **the Millbrook fix is airtight** — L2680 now `resolveLocationId(moveRef) || mintTransitLocation(moveRef)`, so an unresolvable `moveTo:"the pass"` MINTS a real travelable place instead of no-op'ing; header follows the fiction, never stays stuck (L2677-2688). **Idempotency VERIFIED (Q1):** mint id = `"gen-"+slugify(moveRef)`, and the first line is `if (CONTENT.locations[id]) return id` — "the pass" slugs to the same id every time → minted exactly once, second mention reuses. `isPlaceKnown` gates the map NAME on known (visited/adjacent/en-route/GM-named), `?` reserved for the genuinely unheard-of. **Closed.** *Boundary CCode honestly flagged: a pure-narration exit with NO `moveTo` at all (infer destination from prose) is deferred — the concrete `moveTo` case is fully fixed. Tracked, not a blocker.*
- **SNG-118** (play-style chips): `[Strategist]` pills, axis-tinted (earned/amorous/inverse), dimmed+⌁ when fading, lineage border, tap→popover. Scales with the 26-roster. **Closed.**
- **SNG-119** (standing in headers): `knownPeopleAt` scopes bonds to a place; current-title standing chip ("Millbrook · trusted"); detached sidebar folded into place-scoped "who's here" + map-detail headers (Pell under her community). **Closed.**

**Aevi still owes (tracked, non-blocking):** SNG-117 pure-narration-exit inference; SNG-112 arcId authoring; SNG-109 keyed click-through; SNG-113 TIER-B consumer wiring.

---

## ✅ THE FULL RUN — CLOSED GREEN (Aevi HEAD audit, v1.8.74→80)

CCode shipped the whole queue; **Aevi verified every load-bearing invariant at authenticated origin, not on report.** All four touched engine files syntax-clean.

- **SNG-098 — Skill Battles (A+B+C), v1.8.75–79.** `engine/skill_battle.js` (8.5k) — both sides declare + roll a TRUE round (L88-91); `senseOpponent` (sense.js) gates DISPLAY only. **THE FOG INVARIANT VERIFIED:** every revealed field is READ from the true `oppRound` (`.margin/.function/.name/.breakdown`) — never fabricated; tier only chooses which true fields show; tier-3 breakdown is the real SNG-106 math on the opponent's roll. **Fog is presentation over true state, never false** — the non-negotiable, built exactly. Duel routing into skill_battle confirmed in encounters.js. PvP falls out (symmetric). **Closed.**
- **SNG-101b — Native grants, v1.8.74.** `applyNativeGrants` pushes only `if (!owned)` — **never touches an owned rank** (Law-14 by construction); `retroNativeGrants` version-gated via a DISTINCT `nativeGrantsVersion` (no collision with `grantsVersion` — Q3 resolved). **Verified on Silas himself:** retro already ran (nativeGrantsVersion=1), granted his caster basics (grey_hand/grey_road), earned ranks intact (order_sense 3, deathsense 3, palework 2). **Hand-fix + systemic fix converged clean — no double-grant, no stripped ranks.** `the_kept_breath` correctly un-granted (cap filled) — behavior, not bug. **Closed.**
- **SNG-113 — Aptitudes, v1.8.80.** 26 aptitudes at HEAD; `aptitudeDecay` now **0.975** (was 0.995 — decay bites); `recoveryFractions` present; hysteresis tracks held state. **Closed** (Aevi roster owed the TIER-B new-consumer wiring per the roster manifest — track separately).
- **SNG-114 — Inventory unify + intentful use, v1.8.78.** Unified `itemCard`; `uses[]` + "how?" intent path present. **Closed.**
- **SNG-105/111/112/108/109/110** (chronicle arc) + **SNG-115/116** (live bugs) — previously closed green; all still at HEAD.

**Aevi still owes (not blockers):** SNG-112 arcId authoring on shared-arc quests; SNG-109 keyed browser click-through; SNG-113 TIER-B consumer wiring; and the location/UI batch (SNG-117/118/119) is specced awaiting CCode.

Run `update.bat` to sync. **Nothing broken found — the two architectural pieces (skill-battle fog, native-grant Law-14) hold by construction.**

---

## 🗺️ LOCATION + UI BATCH — ✅ SHIPPED, complete_pending_review (CCode 2026-07-16, v1.8.81)

> **CCode 2026-07-16:** all three built + verified. **SNG-117** — `isPlaceKnown` (visited | adjacent | en-route/GM-named), map + headers name any KNOWN place, unresolvable `moveTo` MINTS an idempotent travelable place so the header never lies (soft-exit-without-moveTo inference is the one flagged boundary). **SNG-118** — `aptitudeChips` (axis-tinted, fading/lineage states, tap→popover). **SNG-119** — `knownPeopleAt` scopes bonds to a place; current-title standing chip + folded "standing & who's here" into headers. 9 smoke tests + browser-verified on real content. Writeup: `po/results/20260716_SNG-117_118_119_location_ui.md`. (Original spec below.)


- **SNG-117 — The world you know is navigable** (bug cluster, priority). `po/SPEC_SNG-117_known_world_navigable.md`. **Two symptoms, ONE root cause:** the engine only travels to / names places with a resolvable location record. (a) Left Millbrook "via the pass" → header stuck on Millbrook (exit resolved to no id; SNG-056 header-follows-fiction only fires on a resolvable `moveTo`). (b) Map shows `?` for every un-*visited* place even when you know its name / are traveling to it (L3214 gates name on `visited`, not `known`). Fix: a **known-places layer** (heard/en-route/rumoured/adjacent, not just visited) + **mint named-but-unrecorded destinations** ("the pass" becomes a real place via the existing gen path) + **header never asserts a place the fiction has left** (mint/infer/transit). Map names + makes clickable any KNOWN place.
- **SNG-118 — Play-style as clickable chips.** `po/SPEC_SNG-118_playstyle_chips.md`. The prose wall becomes tight colored `[Strategist]` chips, tap-to-expand (reuse info-dot popover), with fading/lineage/inverse states. Scales with the SNG-113 roster.
- **SNG-119 — Standing folded into location headers + current title.** `po/SPEC_SNG-119_standing_in_location_headers.md`. The detached "standing here" sidebar folds into each place's header + a standing chip next to the current-location title; known people scoped to their community. Data already assembled in `chronicleViews`.

All three from Erik live play. SNG-117 is the load-bearing one (a wrong current-location poisons everything downstream). Awaiting CCode ROUND 2.

---

## ✅ SNG-115 + SNG-116 — CLOSED GREEN (Aevi HEAD audit, v1.8.76)

> **CCode status 2026-07-16:** both fixed. **SNG-115** — ghGet/ghPut get an AbortController 12s deadline (all sync callers) + the actual hang (feedback entry had no top-level `at` → threw before the try) fixed + fb-send always lands on a terminal status. **SNG-116** — new `substratePenaltyFor` single-source; both preview sites pass it so preview == resolve. 6 smoke tests. Writeup: `po/results/20260716_SNG-115_116_live_bugs.md`. (Original spec text retained below.)

**Aevi close (HEAD-verified):** SNG-115 — `AbortController` + deadline present in sync.js across all sync callers; **CCode found the real hang deeper than the spec** (the feedback entry had no top-level `at`, so it threw *before* the try block — a better root-cause than the spec's timeout-only theory); fb-send lands terminal. SNG-116 — `substratePenaltyFor` single-source exists and **both** `successChance` sites (L2800, L5291) pass `substratePenalty`, so preview == resolve by construction (anti-drift guarantee holds). **Both closed green.**


- **SNG-115 — Feedback submit hangs on "Sending…".** `po/SPEC_SNG-115_feedback_submit_timeout.md`. The Send button `await`s a GitHub write with **no timeout anywhere** in the `ghGet`/`ghPut`/`pushMergedFile` chain (no AbortController, no deadline). A stalled request never throws, so the `await` never returns and the UI sits on "Sending…" forever; the entry may not even queue because the catch never runs. Fix: AbortController deadline → throw → the existing "never lose it" queue path; UI button always lands on a terminal status. **Recommend fixing at the `ghGet`/`ghPut` layer** — character save + event ledger likely share the same latent hang.
- **SNG-116 — "How hard is this" preview omits the substrate penalty.** `po/SPEC_SNG-116_difficulty_preview_substrate.md`. **Erik: readout said easy, but lack of substrate made it hard — and he was right.** The preview `successChance` at app.js L5117 is called **without `substratePenalty`** (defaults to 0), so the readout assumes a full lattice; the real resolution applies the SNG-090 penalty, so the true chance is much worse than previewed. **Not a text bug — the readout is honest about a wrong number** (a missing term). Fix: preview computes the same substrate penalty as the resolve path, via ONE shared derivation fn so they can't drift; test asserts preview chance == resolve chance. Tie-in: this is NOT fog (tier perception is fine) — the true chance itself was incomplete; fog over a wrong number is still wrong.

---

## ✅ CHARACTER CHRONICLE ARC + 3 BUGS — CLOSED GREEN (Aevi HEAD audit, v1.8.68→73)

CCode shipped all six; **Aevi verified each at authenticated origin, not on report.** Two came in *cleaner than the specs named them* — noted as improvements.
- **SNG-105** (recovery scales, v1.8.68): landed as `recoveryEnergy(kind,character,rules) = Math.max(base, round(frac×maxEnergy))` — scales with the pool, floors at the flat base **by construction** (never worse than today), `recoveryFractions` as a clean separate config key, and the GM RECOVERY GUIDE calls it so it shows the per-character number (SNG-103 principle). Cleaner than the inline-`fraction` sketch. **Closed.**
- **SNG-111** (progressive naming, v1.8.69): `nameExtend` + contains-current-name heuristic ("Pell"→"Pell Marsh"), old name kept as alias. **Closed.**
- **SNG-112** (quest gating, v1.8.70): offers gated on proximity/thread not bare region + parallel-arc suppression. **Engine-ready but `arcId` parallel-quest mechanism is INERT until Aevi authors arcIds on shared-arc quests — Aevi content, owed.** Gate itself closed.
- **SNG-108** (relationship arcs, v1.8.71): `bondType`/`bondStage` + romantic growth path. **Minor-safety VERIFIED absolute** — `advanceBond` first check is `bondType==="romantic" && isMinorSubject(n)` → refuse+log+return before any change; stage logic score-floor-gated and cannot leap stages (`Math.min(wantIdx, curIdx+1)`). **Closed.**
- **SNG-109** (Chronicle page, v1.8.72): split into `majorDeeds`/`majorStateHash`/`chronicleIsStale`/`buildChroniclePrompt` — cache invalidates on a major-state hash (cleaner than the vaguer spec). **One eyes-on owed:** full DOM click-through was blocked by the dev harness lacking an API key; CCode verified the engine chain via in-browser module import. Worth a play-with-key pass. Engine **closed**; UI click-through pending a keyed play session.
- **SNG-110** (earned portrait, v1.8.73): provenance gear (`itemProvenancePhrase`), opt-in companion (`opts.withCompanion`), one-off override (`opts.appearanceOverride`), image delete. **Floors ordering VERIFIED** — L217 `assemble → sanitizeImagePrompt → URL`, "THE FLOORS run AFTER every addition"; player appearance/companion cannot smuggle past minor-protection or the rating ceiling. **Closed.**

Writeup: `po/results/20260715_chronicle_arc_and_bugs.md`. **Aevi owes:** SNG-112 arcId authoring on shared-arc quests; SNG-109 keyed browser click-through next play.

---

## 🌱 SNG-101b — Native-grants-at-creation — ✅ SHIPPED, complete_pending_review (CCode 2026-07-15, v1.8.74)

> **CCode status 2026-07-15:** built after ROUND-2 (all 3 Qs answered). `nativeGrantIdsFor`/`applyNativeGrants`/`retroNativeGrants` in progression.js; content in manifest-registered `native_grants.json` merged into the rules bag; retro runs in the load path so it **survives the sync-clobber** that ate Silas's hand-correction. Keyed off `domains.primary` (SNG-094). 10 smoke tests + content_ci validates all 191 ability refs. **Verified end-to-end against Silas's real save** → grants his 3 missing ashwarden basics (wither/the_grey_hand/the_grey_road), keeps deathsense r3 + palework r2. Erik: Silas is native **ashwarden** (wright is his lived backstory, correctly not the grant source). Writeup: `po/results/20260715_SNG-101b_native_grants.md`. Awaiting Aevi close.


`po/SPEC_SNG-101b_native_grants_at_creation.md` + content `po/SNG-101b_native_grants.json`. **Completes SNG-101's deferred native-grant piece** — held until natives were tagged (done this session, 247/247), now unblocked. **LLW finding:** the reader functions CCode earlier reported "built" are ABSENT at HEAD (`nativeGrantsFor` not in progression.js) — origin wins; this spec builds them for real. **Data-driven grant model:** primary tradition's L1 anchors always + Tier-II basics matching build lean (mental/physical/practical/social, fallback mental), capped at grantCap=5 — the caster/martial/artificer split falls out of `ability.attribute` tags, no per-tradition hand-authoring. Content table authored for all 27 traditions. Wiring: `nativeGrantsFor`/`applyNativeGrants` (creation) + `retroNativeGrants` (one-time, versioned, modeled on `retroLevelGrants`, **Law-14-safe — only adds rank 1, never lowers earned ranks**). **Live proof of the gap: Silas** (L7 primary ashwarden, had 2 of 7 basics — hand-corrected this session, save commit ede3b056). Independent of SNG-098.

---

## ⚡ SNG-113 — Aptitudes expansion — ✅ SHIPPED, complete_pending_review (CCode 2026-07-16, v1.8.80)

> **CCode 2026-07-16:** mechanism + roster live. Decay→rules (0.975, bites) + hysteresis (keepMargin 4) + fading; inverse aptitudes (innocence, worldliness-ceiling, one-way); background grantsAptitudes (all 40 backgrounds, seeded at creation, lineage-marked); romantic/flirt→amorous tendency; Aevi 26-roster merged (curved thresholds + tiered depth); the 20 TIER-B consumers all built in resolve.js as situational named lines; content_ci asserts every mod key has a consumer. 14 smoke tests + browser-runtime verified. Tuning (decay/thresholds/grant-map) is Erik-playtestable. Writeup: `po/results/20260716_SNG-113_aptitudes.md`. (Original split note below.)


`po/SPEC_SNG-113_aptitudes_expansion.md` (v3, ROUND-2-ready). **Erik promoted.** Split two ways:
- **CCode ROUND 2 — the MECHANISM:** background `grantsAptitudes`; move `DECAY` to rules + raise (~0.975) + hysteresis (earn at threshold / keep until threshold−margin — **requires `deriveAptitudes` to track held state; it's stateless today, stated as a requirement not a question**); inverse-threshold engine for innocence (held while composite worldliness < ceiling); route orphaned `romantic`/`flirt` tags → new `amorous` tendency; "fading" surfacing. Three genuine confirm-at-HEAD questions remain.
- **Aevi authoring — the ROSTER (in parallel):** the ~18–24 aptitude definitions themselves (earned + amorous + inverse), each a balanced bonus-AND-cost, + the new-tendency intent-tag additions. Aevi content, like the axis-touch combos. **Starting now.**
- **Dependency declared:** `devoted_lover` reads the SNG-108 partner bond → ship after 108 or ship inert. Rest builds independently.

## 🎒 SNG-114 — Inventory unify + intentful "Use in scene" — ✅ SHIPPED, complete_pending_review (CCode 2026-07-16, v1.8.78)

> **CCode 2026-07-16:** one shared `itemCard` + `bindItemCardHandlers` (both surfaces; drift impossible); "Use in scene" opens an intent step (`itemUses`: authored `uses[]` or kind-defaults + a free "how?" field; canned prompt only as fallback). 4 smoke tests. Writeup: `po/results/20260716_SNG-114_inventory_unify.md`. (Original spec below.)

`po/SPEC_SNG-114_inventory_unify_use_intent.md`. **Two findings, one ticket.** (1) "Use in scene" on a non-consumable literally submits `onFreeform("I use my X here")` — a canned, intent-less text action the GM must guess at; storied items (Pell's whetstone) deserve better. Fix: item `uses:[{label,prompt}]` + a "how?" field, generic prompt as fallback. (2) **Redundancy confirmed in code:** two separate item-card renderers — popup (`data-invuse`, shows effects) and play sidebar (`data-use`, shows image) — same 3 actions, different attrs/handlers/features, and **already drifted** (invuse vs use behave differently). Consolidate to one `itemCard` superset component; parity test so "Use in scene" does ONE thing regardless of surface.

---

## 📚 THE CHARACTER CHRONICLE ARC + 3 bugs (Aevi authored 2026-07-14) — ✅ ALL SIX SHIPPED, complete_pending_review (CCode 2026-07-15, v1.8.73)

> **CCode status 2026-07-15:** all six built top-down after ROUND-2 (105 v1.8.68 · 111 v1.8.69 · 112 v1.8.70 · 108 v1.8.71 · 109 v1.8.72 · 110 v1.8.73). ~52 new smoke tests, `npm test` green, fresh-port + browser-runtime verified. Writeup: `po/results/20260715_chronicle_arc_and_bugs.md`. Awaiting Aevi close.

Erik play-session findings — the through-line is the session thesis: **the game computes the accreted self (deeds, bonds, standing, grown items) but shows the player almost none of it.** These surface and weave it.

**Bugs (found live):**
- **SNG-111 — Progressive NPC naming.** `po/SPEC_SNG-111_progressive_npc_naming.md`. Learning a surname must EXTEND the name ("Pell" → "Pell Marsh"), not alias-shunt it. At HEAD `revealName` only replaces-or-aliases; no append path. Pell's "Marsh" never composed.
- **SNG-112 — Quest offers gated by proximity/thread, not region.** `po/SPEC_SNG-112_quest_offer_gating.md`. `availableStructuredQuests` offers on bare `region===region` — too coarse; Cellaceron's Fendt quest surfaced to Silas off-thread and far from its location. Gate on location-proximity OR giver-present OR thread-touched. **+ parallel player-specific quests on a shared arc** (Silas's own Fendt quest, not Cellaceron's canonical one).
- **SNG-105 — Recovery scales with pool.** `po/SPEC_SNG-105_recovery_scales.md`. Erik ruled recovery should scale: maxEnergy grows +5/level, recovery was flat → grind. Fraction-of-max with flat floor (low levels unchanged).

**The Chronicle set (surfaces + weaves existing data):**
- **SNG-108 — Relationship arcs.** `po/SPEC_SNG-108_relationship_arcs.md`. Bonds already tracked (score+band, fed to GM) but never SHOWN, and flat. Surface them + add `bondType`/`bondStage`: **Pell is a `romantic`/committed partner, not a "devoted" tag** — a distinct KIND with a growth path (courting→together→committed→partner), score-floor-gated, minor-safe, partner→party-adjacent. *"She's Silas' woman"* — the model should say so.
- **SNG-109 — The Chronicle page.** `po/SPEC_SNG-109_chronicle_page.md`. The background page: cached story-so-far paragraph, major deeds, relationships (SNG-108 bonds), standing, arc. Assembles existing data; reads the attended self back to the player.
- **SNG-110 — Portrait as earned record.** `po/SPEC_SNG-110_portrait_earned_record.md`. Player-authored appearance (primary) + game-context provenance (the **forged spear shown as *yours***, not a bare name), companion/partner in-frame opt-in, per-generation override, and **image DELETE** (Erik's ask; only add exists today). FLOORS run after all additions (minor ≤PG, AUP).

**Design forks still Erik's to call (flagged in specs, not pre-decided):** SNG-107 reputation-with-teeth (what should revered actually COST — a rival faction souring, challengers drawn — reputation that only helps isn't a system) is NOT yet specced, pending Erik's design conversation. SNG-108's romantic stages and SNG-110's companion-in-frame are built but Erik tunes the specifics.

Sequencing note: 108 (bonds) feeds 109 (chronicle) and 110 (portrait companion). 111/112/105 are independent bugs, buildable anytime. All await CCode ROUND 2.

---

## ✅ THREE TRANSPARENCY BUILDS — CLOSED GREEN (Aevi HEAD audit, v1.8.67)

CCode shipped all three; **Aevi verified at authenticated origin, not on report.** All syntax-clean.
- **SNG-103** (GM effective energy cost, v1.8.65): `abilitiesForGM` now shows effective cost with base when discounted (`3 energy — base 6, discounted by level+rank`); raw `${ab.energyCost}` primary is gone; `CONTENT.rules` threaded at all 3 call sites. No sibling raw-cost builder. **Closed.**
- **SNG-104** (vitals x/y, v1.8.66): `vital-num` + `data-vital` render `current / max` always-visible; `showPopoverText` added (the staged diff assumed showHelp took raw text — it takes a help-id; CCode's fix is correct). **Closed.**
- **SNG-106** (roll breakdown, v1.8.67): **the load-bearing honesty claim VERIFIED at HEAD** — `add()` is the SOLE accumulation site; the only assignments to `chance` are `= 0` init and the increment inside `add()`; no mid-body mutation; clamp applied to a separate returned value. So `sum(components) === chance` (pre-clamp) is true **by construction** — the popup cannot drift from the real math. Opposed term named ("the raider (threat 35) −N"). Behavior-preserving (existing math tests pass); gambit steps inherited it. **Closed.**

## ✅ ROMANCE — CLOSED GREEN (Erik browser leg, 2026-07-14)
Erik verified in play: GM stayed in the scene, carried heat, no fade/hedge/safety-meta. SNG-100 tag-cap fix confirmed live (tag fired → doc loaded → engagement held). The R-vs-R+ observation was NOT a defect — the active profile was correctly on preset R (mature, no explicit anatomy); R held the line precisely, which is itself proof the register rewrite reads the ceiling correctly. Flipping the profile to R+ (adultVerified already true) unlocks the explicit register; Erik confirmed R+ works. **Romance leg + SNG-100 closed.**

---

## ✅ DOMAIN GROWTH ARC — SHIPPED & CLOSE-VERIFIED (Aevi HEAD audit, v1.8.63)

CCode built all three top-down; **Aevi confirmed at authenticated origin** (not report): `standingWithPeople` · `meetsStandingBar` · `promotionEligible` · `promote` · `acquirable` · `acquireDomain` all present at HEAD. SNG-100b (standing bar, wires the long-fiction accessGates capstone) → SNG-101 (promotion, additive model, foreclosure gates learn + both rank paths, braids exempt, Law-14 throw) → SNG-102 (acquisition, Tier-I entry, closed-opposite never loosened). CCode also fixed a Phase-1 CI bug the classification pass exposed (CI wrongly required `combinationAxis` on the 6 cross-pole braids, which correctly have none — the braid-exemption foundation). Decisions CCode was delegated: standing source = `peopleDisposition`; thresholds in `resolution.json`; region gate loose (no people→region map — flagged); acquisition teacher-bounded. Writeup: `po/results/20260714_domain_growth_arc.md`. **Green.**

---

## 🐛 SNG-103 — GM effective energy cost (specced, awaiting CCode)
`po/SPEC_SNG-103_gm_effective_energy_cost.md`. `abilitiesForGM` prints base `ab.energyCost`, not effective — GM false-flags correct discounted costs (found live: Silas/Palework 6-vs-3). Fix: thread `CONTENT.rules`, interpolate `effectiveEnergyCost`. Guard: never "repair" base down — that's the real corruption. Awaiting ROUND 2.

## 🖥 SNG-104 — Vitals x/y readout + tap/hover detail (specced + STAGED DIFF, awaiting CCode)
`po/SPEC_SNG-104_vitals_readout.md` + `..._STAGED_DIFF.md` (byte-precise drop-in). The Health/Energy bars show **no number** — that's why Erik couldn't tell if energy was depleting faster or he had less. Adds always-visible `current / max` (zero-tap phone answer) + a tap/hover popover reusing the info-dot delegation (phone parity built in). Verified anchors at HEAD.

## ⚔️ SNG-098 — Skill Battles — ✅ COMPLETE (A+B+C), complete_pending_review (CCode 2026-07-16, v1.8.79)

> **CCode status 2026-07-16 — all three phases shipped.** ROUND-2 (GO, `po/SPEC_SNG-098_CCODE_REVIEW.md`) → **A** engine core (`engine/skill_battle.js` matchup + opponent synthesis/policy + two-sided `battleRound`; `sense.js senseOpponent` fog gate; structured `skill_battle_system.json engine{}`; `resolve.js contestMods`) → **B** encounters routing (`startEncounter({oppSheet})` spawn, `skillBattleRound` → classic lifecycle, authored `opponent.skills[]`) → **C** the duel UI (`renderSkillBattle`: declaration picker + intensity dial + momentum meter + **fog-gated opponent panel** with the SNG-106 popover for tier-3, "read them" buys a tier, resume-on-reload; a duel is a skill battle by default, `def.skillBattle:false` = classic). 32-check `skill_battle_sim.mjs` (incl. the fog-is-presentation-over-true-state invariant); panel data path browser-verified end-to-end. **Live-play part for Erik:** the GM-narrated opening/aftermath (needs a key) + combat feel/tuning. **PvP is the flagged follow-on** (engine already symmetric). Writeups: `po/results/20260715_SNG-098_phaseA_engine.md`, `20260716_SNG-098_phaseC_duel_ui.md`.

`po/SPEC_SNG-098_skill_battles.md`. **Erik promoted to build.** Routed to **CCode ROUND 2 substrate review first** — not blind build. Reason (PO judgment, stated plainly): this is the single most architectural spec of the session — a combat-MODEL change, a new `skill_battle.js` module, and touches `encounters.js`/`sense.js`/`app.js`/tests. This session's repeated lesson was that Aevi specs lean on substrate assumptions that don't hold until CCode verifies at HEAD (§7b duplicated an existing file; the SNG-101 standing bar wasn't wired; §2 was a breaking type change — all caught in ROUND 2). Skipping review on the *biggest* spec would be exactly the wrong call. The spec also carries three real open questions Aevi could not resolve alone:
  1. Can a duel `def.opponent` (threat/tacticTags) synthesize a fair skill sheet, or must the encounter generator author one at spawn?
  2. Does `senseTier` compose cleanly when the sensed "action" is the OPPONENT's declaration rather than the player's own?
  3. Momentum meter — net-new encounter state, or does an existing field generalize?

**CCode: ROUND 2 review → answer the three → then GO for build.** If Erik wants to skip review and build straight off, say so; ROUND 2 is the safer next step for a change this size and is the default.

**The core to preserve through review:** two rolling+deciding agents; opponent decision is deterministic engine `opponentPolicy` (not GM invention); **fog-of-war via `senseTier` is presentation over TRUE state, never false** (tier 0 blind → tier 3 sees their full breakdown); reveal skills buy a tier; PvP falls out symmetric. Depends on SNG-106 (retained roll components).

---

## 🎲 SNG-106
