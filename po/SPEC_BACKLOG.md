# Singularity — Running Spec Backlog

Engine-needing work from the 2026-07 content-expansion sessions. ALL content for these is authored/authorable at origin; these are the CODE pieces. Detailed specs follow the roadmap. Aevi maintains; Erik greenlights turning from content to systems. Nothing here blocks continued content authoring.

## Optimized roadmap (build order)

**Foundation — build first, everything leans on these:**
1. **SNG-019 Codex entity-resolution** — facts collect under primary nodes (alias/entityId resolution + merge + grouped UI). Small. Unblocks clean persistence for everything else.
2. **SNG-022 Reconciliation engine** — brings existing characters + content to current on login/load (generalizes existing backfill.js). Small-medium. Without it, every feature below strands existing characters/content. The linchpin.

**Spine — the growing, living, ending world (build after foundation):**
3. **SNG-020 Generative-with-persistence (ALL types)** — one generate(type,context) path; world grows through play; depends on SNG-019. Medium-large; the anchor.
4. **SNG-021 Living world** — seasonal cycles + self-driven NPCs offscreen; light world-tick additions.
5. **SNG-024 Endings** — mortality/expiry/resolution; removes the "no deaths" clamp; the missing half of growth.
6. **SNG-025 Player-spawned world-effects + counter-quests** — the headline emergent cross-player feature; composes SNG-024+020+019+party-sync.

**Player-facing systems (parallel-able once foundation holds):**
7. **SNG-017 Creation overhaul** — origins = areas-of-world (role+homeland), start-location follows origin, innate-talent step, origin-tradition ability pool. Content owed: origins.json.
8. **SNG-018 Romance** — relationship track beyond bond; a slow social contest. Content owed: romanceable flags.
9. **SNG-023 Character narrative log** — the readable Saga via logUpdates; SNG-022 reconstructs for old characters.
10. **SNG-027 Social contest** — multi-beat weighty conversations; the game's center of gravity. Content owed: NPC pole-signatures (light).
11. **Money + The Game + Recruitment** — wallet, Game-standing ladder, hire/purpose/bond recruits; shares reputation/economy machinery.
12. **SNG-026 Skill functions + cross-domain combination** — function tags (DONE on 54 abilities) + braid engine extending SNG-010 emergence.

**Fixes & felt-quality (new, slot as noted):**
13. **SNG-030/031 Encounter+gambit+novelty** — encounters+novelty SHIPPED; gambit surfacing small.
14. **SNG-032 Narrative time** — timeOps GM op; fixes clock-vs-story drift. Small, do early.
15. **SNG-033 Party v2** — character-sheet sync to shared scenes + proximity join + both-sided fact persistence.
16. **SNG-034 Bestiary/wildlife** — creature pack (content, Aevi owes) + GM dressing rule + encounter entries.
17. **SNG-035 Imagery** — portraits + moment art via imageOps; gallery in the Saga.
18. **SNG-036 Martial paths** — baseline defense for ALL + form-kits (Ent!) + 8 martial backgrounds. Content DONE; engine rides SNG-017/022/026.

**Deferred (liked, behind the spine):**
- **SNG-028 Consequence-state** (wounds/drift/debt/faction as gating numbers) — reconciliation backfills drift when built.
- **SNG-029 Downtime/player-pursuit** (the player's offscreen clock) — strong once the living world exists.

**Ratified-and-waiting:** SNG-BATCH-5 (soft class-cost + branch forks; verify prior CCode state before re-run).

## Suggested batches
- **BATCH-6 (Foundation):** SNG-019 + SNG-022. ✅ CLOSED GREEN 2026-07-10 (v1.7.2).
- **BATCH-7 (Trustworthy player state):** identity + per-char style + cross-device + inventory/quest hardening. ✅ SHIPPED v1.7.5 — awaiting Erik legs.
- **BATCH-8 (Fast high-impact):** gambit surfacing + completion-XP + narrative time. ✅ SHIPPED v1.7.6 — awaiting Erik legs.
- **SNG-041 (Absolute world dating — one world, one clock):** shared real-time epoch for the far world + play-paced local frame + consequence coupling. ✅ ANCHOR RESOLVED — **NEXT BUILD, ahead of BATCH-9** (so the generative world is born date-coherent).
- **BATCH-9 (Living spine / generative anchor):** Phase 1 = generate(type,context) + NPCs/locations/arcs + engagement governor + weight-realness + content-rating (R+). ON DECK. Ph2 (offscreen advance + ⭐ + nomination) / Ph3 (shared promotion + rating-lens) designed. The strategic build.
- **SNG-042 (Legends & Villains):** power-tiered recurring heroes + villains (epic→riffraff) + dramatic-beat deployment. RIDES BATCH-9 (after Ph1, best with Ph2). Aevi owes authored anchors.
- **BATCH-10 (Player systems):** SNG-017 origins + martial (036) + SNG-018 + 023 + 027 + money/Game/recruitment + 026.
- **BATCH-11 (Multiplayer + polish):** SNG-033 party v2 + 037 + 038 + 035 imagery.
- **BATCH-0 (Hygiene, anytime):** SNG-040 content CI now; SNG-039 onboarding once creation lands.

*Renumbered 2026-07-10 (Aevi): resolved the dual-BATCH-7 collision — trustworthy-state kept 7, living-spine → 9, downstream +1. Build order per the dependency spine unchanged; labels now unambiguous.*

## Cross-cutting engine flags (fold into whichever batch touches them)
- **poleIntensity** reading (independent 0..1 poles; co-firing/purity; net-signed derivable). Locations already reseeded.
- **Manifest locals:** seedFiction + nativeLogic on locations (GM enforces domain rules-as-law inside); creature native-tag + diffusion weight.
- **Will/Inscription:** abilities gain optional `inscribable` + rune-cost; substrate-density gates persistence.
- **Innate talents:** character.talent (SNG-017 grants at creation; SNG-022 offers to existing).
- **Methods:** rune-casting/coordinate-reading/attunement as tool/skill-gated checks revealing poleIntensity/adjacency.
- **Skill-functions:** every ability (authored+generated) carries ≥1 function; SNG-022 back-tags; generation is function-aware; universal_roles maps role→functions.
- **Axes-as-disposition / world-not-valley:** framing (GM narration); later clean rename valley/ → world/ (NOT mid-flight).

## Notes
- All authored content (locations, NPCs, companions, items, traditions, lore, jewels, domains, cycles, roles, combinations) exists as data now; these systems ACTIVATE its mechanics. No additional content owed except the light items flagged per-spec (origins.json, romanceable flags, NPC pole-signatures).
- Dependency spine: SNG-019 → SNG-022 → SNG-020 → (021, 024, 025) → player systems. Respect it; the foundation two are cheap and unblock the rest.

---

## SNG-019 — Codex entity-resolution (facts collect under primary nodes)
Erik 2026-07-07: the codex reads as a running list; ~20 facts about Teva end up scattered instead of gathered under her node. Diagnosis (verified in engine/codex.js): the codex IS already a typed-node graph (topics keyed by slug, kind person/place/lore/event/faction/mystery, facts[], links[]). The bug is ENTITY RESOLUTION, not storage — applyCodexUpdates slugifies u.topic per update, so "Teva", "the woman in the chamber", "Teva the healer" mint three nodes. Fix so facts land on the right primary node:
1. **Alias resolution on write.** Each topic gains `aliases[]`. Before minting a new topic, resolve u.topic against existing topics' label+aliases (case/fuzzy/substring, and prefer a known NPC/location id from CONTENT when u.kind is person/place). Match → append the fact + record the alias; no match → mint. A canonical id for known entities (npc/location ids) is the anchor so the GM's varying phrasings collapse to one node.
2. **GM contract nudge.** codexUpdates should prefer a stable `entityId` when the fact is about a known NPC/place (the GM already gets npc/place ids in context); free-text topic only for genuinely new things. Add the field; resolver uses entityId first, label/alias second.
3. **Merge tool.** A one-shot pass that collapses existing duplicate topics into their primary (by label/alias similarity + shared links), concatenating facts (dedup) and unioning links/aliases — repairs saves already fragmented. Player-facing "these look like the same — merge?" optional; auto-merge high-confidence.
4. **Codex UI grouping.** Group the codex view by kind, primary node first with its facts nested; show aliases; a person/place node surfaces its linked nodes (Teva → the chamber, the rescue event, whoever she's tied to). Facts already carry [dN] day stamps — keep them, order chronological under the node.
- Caps already exist (60 topics, 12 facts/topic); raise factsPerTopic for primary characters if needed (a major NPC may warrant 20+).
- Smoke: two differently-phrased facts about the same NPC land on one node; entityId beats label; the merge pass collapses a pre-fragmented save; UI shows nodes with nested facts + links, not a flat list.

## SNG-020 — Generative content with persistence (ALL types) — world grows through play
GENERALIZED (Erik 2026-07-07): every authored type is a TEMPLATE; the engine generates more of each WITH PERSISTENCE, so the world grows as people play. Not just NPCs/locations — also companions, items, methods, jewels (co-firing nodes), manifest domains, arcs/quest-threads, cyclical events, creatures, universal-role instances. Framing: generative_substrate.json (template library = the whole authored corpus; grammar = poleIntensity disposition + universal role + seedFiction + arc-pressure + season).
- **One path:** generate(type, context) over all schema'd types — LLM-authors to schema under local-disposition constraints, validates/repairs, mints entityId, persists. Uses the authored files as few-shot taste, so generated content matches quality + is in-grain (Stillhold-generated reads peace+falsehood; Redline warrior fights by the Edge; asymmetric secondary axis rolled for surprise).
- **Persistence:** durable nodes in the codex (SNG-019 entityId resolution) + a per-save generated-content store; facts accumulate; world-tick (SNG-021) advances generated arcs/NPCs offscreen. No one-scene ghosts.
- **Optional shared growth:** proven-good generated content promotable from a synced save into canonical world content — play literally grows the shared world (flag; personal-save persistence first).
- **Depends on:** SNG-019 (clean entity persistence). Anchor of the systems batch. NO additional content owed — the corpus IS the template library.
- **Smoke:** each type generates in-grain for its locale + persists with stable identity + accumulating facts; a generated location/domain is revisitable with state intact; a generated arc advances offscreen; authored vs generated indistinguishable downstream.
## SNG-021 — Living world (cyclical events + self-driven NPCs)
Content ready: the_living_world.json (season×place festival/cycle table, recurring troubles, population doctrine). Engine: world-tick checks current season/day against the cycle table and surfaces 'what's happening here now' to the GM; key NPCs get an offscreen want-progress counter so a place MOVES between visits; failed-harvest + pass-freeze as world-tick conditions with cascading effects; generated NPCs (SNG-020) get a want on creation. Light additions to worldtick.js + a per-NPC arc-progress field. GM mandate: always able to answer 'what's happening here that isn't about me.' Smoke: arriving in a place during its festival season surfaces the festival; an NPC met twice has advanced their want; a failed harvest cascades pressure.

*Updated 2026-07-07.*

## Universal roles — weave into SNG-017 / SNG-020 / SNG-021
universal_roles.json defines loose worldwide roles (mediator/warrior/warden/keeper/maker/seeker) whose METHOD comes from locale+disposition. Weave: **SNG-020 generation** picks a ROLE for a needed NPC then derives method from the current area's poleIntensity (a Cogitarium 'healer' works against the local grain; a Stillhold 'mediator' buries truth) — role+disposition yields consistent, varied, never-generic people. **SNG-017 creation** frames origins as role+homeland (Redline Warrior, Hollow-March Warden) — familiar handle + local craft-access. **SNG-021 living-world** populates for role-contrast friction and places traveled-roles as living evidence needs cross regions. Content ready; these are reference-wirings, not new engine work.

*Updated 2026-07-07.*

## SNG-022 — Reconciliation engine (bring characters + content up to current on login/load)
Erik 2026-07-07: as engine + content-types evolve, an engine must reconcile existing characters and existing content against everything now built, and apply what's owed — e.g. an Ent created before innate talents existed should GAIN its talent on next login; a location authored before poleIntensity should get it; a character newly eligible for a Reach tradition or a universal-role tag should have it surfaced. Generalizes the EXISTING backfill.js (already a versioned, idempotent, character.backfillVersion-flagged one-time-credit system for XP/bonds/practice) into a full reconciliation pass.

**Model:** a single `reconcile(entity, kind)` pass, run on character login AND on content-load, bumping a per-entity `reconcileVersion`. Idempotent (only applies what's missing), capped, principled (derives from durable state, never fabricates history) — same discipline backfill.js already uses. Each new feature registers a MIGRATION STEP; reconcile runs all steps whose version exceeds the entity's reconcileVersion.

**Character migration steps (examples, extensible):**
- **Innate talent:** character has no `talent` → grant one (roll weighted-minor, or offer a choice on login for existing characters so it isn't imposed). Erik's Ent gets its talent. New characters get it at creation (SNG-017).
- **Reach-tradition eligibility:** character now in/of a region whose tradition they qualify for → surface the newly-available abilities as learnable (don't auto-grant power; make it AVAILABLE).
- **Universal-role tag:** untagged NPC/character → infer role+method from their data + locale (universal_roles.json).
- **poleIntensity on characters:** derive a character's own disposition-drift vector if missing (from abilities/deeds), so affinities + drift work for old saves.
- **New fields:** any additive schema field (statusNote, establishedFacts, wallet, romance track, etc.) → initialize to safe default (this is the sweep pattern already used on Tether profiles).

**Content migration steps (run on content-load):**
- **poleIntensity backfill:** any location with spectrum but no poleIntensity → derive it (already done manually for the 26 built; the step makes it automatic for future/generated content).
- **Schema-version upgrades:** any content record below current schemaVersion → apply the field additions (seedFiction/nativeLogic defaults, universalRole, evolution scaffolds).
- **Cross-reference integrity:** connections/links that point at now-existing nodes get wired; dangling refs flagged.

**Login UX:** on login, if reconcile applied anything player-facing, tell them: "The world has grown — you've discovered an innate talent (choose/see it); three new traditions are learnable near you." Growth as a login moment, not a silent patch. Non-player-facing backfills stay silent.

**Guardrails:** idempotent (reconcileVersion gate); never REMOVES or downgrades; never fabricates history (derives from durable state); player-facing GRANTS that change power are offered/surfaced, not auto-imposed, unless purely additive (a talent everyone gets). Reuses backfill.js's principled-reconstruction discipline. Order-independent steps; each self-checks preconditions.

**Smoke:** an Ent created pre-talents gains a talent on login (offered, not forced); a pre-poleIntensity location gets one on load; a character newly eligible for a tradition sees it as learnable; running reconcile twice changes nothing the second time; no history fabricated; purely-additive fields initialize silently.

**Depends on / enables:** builds on backfill.js (extend, don't replace). Pairs with SNG-020 (generated content runs through the same reconcile so it's born current) and SNG-019 (entity resolution). This is the engine that keeps the whole growing world SELF-CONSISTENT as both content and rules change — arguably the linchpin of the systems batch, because without it every new feature strands existing characters and content.

*Updated 2026-07-07.*

## SNG-023 — Character narrative log (the readable saga)
Erik 2026-07-07: each character should have a detailed narrative log. Verified: characters have `chronicle` (compressed scene-summaries fed to the GM) but NO readable, persistent story-of-this-character. Gap.
- **Model:** a per-character `narrativeLog` — an append-only, human-readable chronicle of what this character has DONE and what has HAPPENED to them, written in prose, entry per meaningful beat (arrival somewhere new, a bond formed, a death witnessed, an arc-turn, a world-effect spawned). Distinct from `chronicle` (GM-context) and `establishedFacts` (truth-pins): this is the SAGA, for the player to read.
- **Written by:** the GM emits a `logUpdates` op (one short narrative line) on meaningful beats, typed+clamped like all ops; the engine appends with a day/season/location stamp. Auto-captures the big ones (level-ups, deaths, bonds, arc-turns, domain-effects) even if the GM misses.
- **Surfaced:** a readable "Saga" view in the character screen — chronological, chaptered by location/arc, the player's whole journey as a story. Exportable (ties the legacy/keepsake instinct).
- **Persistence + reconciliation:** durable on the character; SNG-022 backfills a narrativeLog for pre-existing characters from their chronicle+deeds+facts (principled reconstruction, same discipline as backfill.js).
- **Smoke:** meaningful beats append readable entries; the Saga view reads as a coherent story; old characters get a reconstructed log on login; entries persist + stamp correctly.

## SNG-024 — Endings (mortality, expiry, resolution — things must be able to end)
Erik 2026-07-07: "things need endings — people die, spells end, etc." Verified: NO endings system. world-tick hardcodes "no deaths or drastic turns"; nothing expires effects on a clock; facts.js can retire a fact but nothing enforces mortality/duration. This is the missing HALF of the growth model — and a framework gap: "foreclose or hold the aperture open" is meaningless if nothing can close.
- **Duration/expiry:** effects, inscriptions, wards, buffs, manifested world-effects gain optional `duration` / `expiresAtDay` / `sustainCost`. The world-tick + resolve check expiry: spoken effects end fast, inscribed effects hold until worn/erased/overwritten, sustained effects end when the caster stops paying. An unmaintained effect ENDS. Ties will_expression_modality (channel determines durability).
- **Mortality:** NPCs (and companions, and the PC) can die — permanently, recorded as an establishedFact + a narrativeLog entry, with consequences that propagate (a dead hinge-NPC changes their arc; a dead companion is mourned, not respawned). Remove the world-tick "no deaths" clamp; deaths occur when fiction/mechanics warrant, gated by the same lethal-avoidability rule (SNG-002b) for the PC — telegraphed, not ambushed. Death is meaningful and durable; Palework/Vivimancy interact (an Ashwarden eases it, a Vivimancer may contest a near-death, neither cheats a true end).
- **Resolution & decay:** arcs can RESOLVE and stay resolved (a healed Accord stays healed; a foreclosed thing stays foreclosed); domains can COLLAPSE or be ended; even a manifest-domain can be un-manifested. Endings persist through reconciliation like everything else.
- **Framework tie:** endings are foreclosure made mechanical — the necessary counter to propagation. A world that only grows is the runaway-creation horror (the Forge of Ends); endings are what make growth mean something. Palework is literally the craft of good endings.
- **Smoke:** an inscribed ward expires on schedule; a sustained effect ends when unpaid; an NPC death persists + propagates to their arc; a resolved arc stays resolved; the PC death path is telegraphed (SNG-002b); Vivimancy/Palework interact with dying without trivializing it.

## SNG-025 — Player-spawned world-effects + counter-quests (emergent, cross-player)
Erik 2026-07-07: "a player could spawn a whole world effect — then other players may make it a life's quest to end that particular effect." The payoff of persistence + shared growth + endings. THE headline emergent feature.
- **Spawning:** certain high-power acts (a surged Tier-V ability, a Foreclose at scale, an inscribed world-ward, deliberately manifesting a domain, waking a Precursor site) can create a persistent WORLD-EFFECT — a durable change to shared world-state (a blight, a sealed pass, a new manifest domain, a foreclosed region, an eternal storm). Recorded as a world-effect node with: origin (who/when), nature, reach, and — crucially — an END-CONDITION (what it would take to end it).
- **Persistence + propagation:** the effect persists in shared world-state (synced repo, party play), advances/spreads via world-tick, and is FELT by other players/characters in that region (rumor, consequence, the effect itself).
- **Counter-quest:** the end-condition makes the effect a QUEST OTHERS CAN TAKE — another player (or the same one later) can make ending it their arc. Ending it is a real, hard, persistent achievement that changes shared world-state back (or into something new). One player propagates; another forecloses — the framework's core tension played out ACROSS players, emergently.
- **Framework tie:** this is propagation-vs-foreclosure as multiplayer emergent narrative — the single best expression of the whole model. A player's cosmic address leaves a mark on the shared world; another's answers it.
- **Depends on:** SNG-024 (endings/end-conditions), SNG-020 (persistence), SNG-019 (entity nodes), shared-world sync (party play). Medium-large, but mostly composition of systems already specced.
- **Smoke:** a qualifying high-power act spawns a persistent world-effect with an end-condition; other characters in-region perceive it; the counter-quest is takeable; completing the end-condition durably reverts/transforms shared world-state; origin + ending both recorded in the world's narrative.

*Updated 2026-07-07.*

## SNG-026 — Skill functions + cross-domain combination
Content ready: skill_functions.json (functions heal/shield/strike/reveal/conceal/bind/move/break/ward, each by domain-method; cross-domain combination-recipes). Engine: (1) tag abilities with a `function` so GM/engine reason by need; (2) EXTEND the emergence-recipe engine (SNG-010) to cross-domain combination — two owned abilities from different domains braid into a combined effect (authored recipes + generative braids via SNG-020); gated by holding both (class-cost/capacity is the price, combination the payoff); attribute gates + intensity apply; botched braid fails worse. Framework: braid=propagation (hold the aperture between domains), single-domain-pole=foreclosure. Content owed: tag existing abilities with functions; expand the combination-recipe set. Smoke: GM can answer 'what shields here'; a valid two-domain pair produces a combined effect; combination gated by owning both; generative braid is in-grain.

*Updated 2026-07-07.*

## Skill-functions — woven through (2026-07-07)
All 54 abilities now carry a `functions` tag; canon = every ability (authored or generated) has ≥1 function. Wirings: **SNG-026** (combination) matches braids by function pairs across domains. **SNG-020** generation is FUNCTION-AWARE — generate an ability/NPC-kit/braid to cover a needed function via local domain method (generative_substrate.json). **SNG-022** reconciliation adds a back-tag step: any ability record missing `functions` gets tagged on content-load; any NPC missing role/kit-function coverage flagged. **universal_roles** now maps each role to the functions it must cover (role-instance generation ensures kit spans them). GM reasons by need: 'what heals/shields/reveals here, and how?' — answerable from the tags. No new engine beyond the function-match in SNG-026 + the reconcile back-tag step.

*Updated 2026-07-07.*

## SNG-027 — Social contest (multi-beat conversations that matter)
Erik 2026-07-07: combat + skill-checks are well-modeled; the game's actual center of gravity is TALK (the Green Schism, the Stillhold's buried truth, the Moot petition, romance, moving Vaskar across a century of grudge) yet weighty conversations resolve as one-off social checks. Add a lightweight multi-beat social contest — conversation with structure, the way combat has rounds.
- **Model:** a scene enters "contest" when stakes + a resistant party warrant (GM- or content-flagged). Track a small state: the other party's DISPOSITION toward your aim (a meter, e.g. -3..+3), their pole-signature (what moves them: a Redliner moves on honor, a Stillholder on the unsayable, Vaskar ONLY on trust-demonstrated-over-time), and a patience/turns budget (some contests end if you overreach).
- **Beats:** each player move is an APPROACH (appeal to their want, press a contradiction, share feeling, offer, concede, invoke a bond/standing) resolved by a social d100 + relevant attribute/ability + FIT (does this approach match their pole-signature?). Good fit + success moves the meter; misfit or botch can harden them or spend patience. Abilities plug in by function: Pathos (share feeling), Logos (press proof), Verity (unmask), Stillcraft (de-escalate), mediators_tongue (bridge). Universal-role method matters — the SAME approach lands differently on a truth-culture vs a peace-culture NPC.
- **Resolution:** meter reaches +threshold = won (they agree/open/turn); -threshold or patience gone = failed (they close, and it persists — a burned Moot petition is remembered). Partial outcomes are the norm, not binary.
- **Ties:** consumes the affinity idea (approach-fit = social affinity); pairs with romance (SNG-018 is a slow social contest with a different meter); the reputation/relationship engine carries the persistent result; the narrative log (SNG-023) records the turn. Botch-reads-false parallels the rune-cast botch.
- **Framework:** the propagation/foreclosure tension in dialogue — do you open the other (hold the aperture) or corner/break them (foreclose)? Both are valid approaches with different persistent consequences.
- **Content owed:** pole-signature + "what moves them" on major NPCs (light — derivable from existing want/fears + universalRole/roleMethod). Smoke: a weighty conversation runs multiple beats with a visible disposition meter; approach-fit matters; overreach can fail durably; abilities plug in by function; result persists to reputation + narrative log.

## SNG-028 — Character consequence-state (wounds, drift, debt, faction standing) [KEPT, deferred]
Erik likes this. Persistent tracked numbers on the character that GATE outcomes, not just narration: wounds/conditions, pole-drift vector (from abilities+deeds — already conceptual in the disposition model), debts owed, per-faction reputation. Gives propagation-vs-foreclosure teeth on the individual (a wielder drifting pole-hot toward foreclosure should FEEL it mechanically). Much of the weight is already carried by reputation + the drift concept + establishedFacts; this promotes them to gating state. Medium. Defer behind the spine — reconciliation (SNG-022) can backfill drift for existing characters when built.

## SNG-029 — Downtime / player pursuit (the player's own offscreen clock) [KEPT, deferred]
Erik likes this. The living world (SNG-021) has NPCs pursue wants offscreen; the PLAYER has no offscreen. A light downtime action between scenes: train (advance toward a learnable ability), craft/inscribe (make an item or a persistent ward), tend a relationship (advance a bond/romance), advance a project (a personal arc). Matches the world's own-clock doctrine to the player. Reuses world-tick + progression + inscription + relationship. Medium. Defer behind the spine; strong once the living world exists to pursue alongside.

*Updated 2026-07-07.*

## SNG-030 — Encounter/gambit/novelty tuning (2026-07-07, partly SHIPPED)
Erik: encounters should actually trigger; gambit more prevalent; novel typed approaches rewarded. Findings + actions:
- **Encounters DONE (shipped):** onEnterLocation trigger (12% in table) was defined but never called — wired into travelTo(). Arrivals now roll encounters, not just travel(35%)+rest(15%). If still sparse in play, raise triggerRules chances.
- **Novelty DONE (shipped):** rewards existed but whispered — xp.novelBonus 3→8, novel.discoveryBonus 10→20 (vs duel=15, level=100). Creative typed approaches now pay ~half a duel; discovering a new technique is a real event. TODO(small): confirm the GM prompt leans into novelty (noveltyHint is passed; make sure narration rewards it too, not just XP).
- **Gambit — needs engine (not just tuning):** system is fully built (gambit.js, builder UI) but only reachable via the ⚙ Plan button with NO prompting. (a) Wire the new gambit.completionBonusXp=10 into executeGambit's success path (value shipped to resolution.json; engine must read+award it). (b) SURFACE it: when a scene has multiple obstacles / a complex declared goal, the GM or UI should nudge "this looks like a gambit" — a hint chip near the input, or a GM line offering the multi-step path. Make Plan prominent when apt, quiet when not. Small UX + one XP-wire.
- **Smoke:** encounters fire on enter as well as travel/rest; a novel typed action visibly rewards more than a canned one (XP + narration); completing a gambit awards its bonus; the gambit path is surfaced when the situation suits it.

*Updated 2026-07-07.*

## SNG-027 content gap CLOSED (2026-07-07)
pole_signatures.json now defines the `poleSignature` schema (movedBy/hardenedBy/immovableBy/onlyMovedBy/patience/tell), 12 approach-types, and the approach×signature resolution table (fitBonus +15, misfitPenalty -10, immovableWaste, onlyMovedBy hard-gate, ability-amplify, botch-reads-false-lever). 4 major NPCs worked as examples (Vaskar onlyMovedBy patience; the Keeper moved by the-unsayable her culture is hardened by; Vael; Ninefold). SNG-022 derives defaults for the rest; SNG-020 authors signatures for generated NPCs. Remaining content owed: hand-author signatures on ~dozen arc NPCs (rest derive). SNG-027 is now specified end-to-end.

*Updated 2026-07-07.*

## SNG-031 — Gambit surfacing (make the built-but-hidden gambit prevalent)
Erik: gambit is fully built (gambit.js, builder UI, rule 15A cinematic narration, stepEnergyCost, now completionBonusXp=10) but reachable ONLY via the ⚙ Plan button with zero prompting — so nobody finds it. Surface it against signals the engine ALREADY emits; no new GM plumbing.

**Signal (already present):** every turn carries `intentTags` on its choices (gm.js line ~60/297), including `plan`, `scout`, `prepare`. These are the "this scene rewards a multi-step approach" tell. A scene with ≥2 distinct obstacles, or choices tagged plan/scout/prepare, or a stated multi-part goal, is gambit-apt.

**Surface it (three cheap moves, any/all):**
1. **Hint chip near the input.** When the current turn's choices include a planning intentTag (plan/scout/prepare) OR the GM flagged multiple obstacles, render a dismissible chip by the freeform box: "This looks like a job for a plan — [Plan a Gambit]". Wires to the existing renderGambitBuilder(); no new engine.
2. **Make ⚙ Plan prominent-when-apt, quiet-when-not.** Style the Plan affordance up (or float it) on gambit-apt turns; leave it in the overflow otherwise. Pure UX.
3. **GM offer line (optional, rule add).** Extend rule 15A prep: when the GM sees a complex multi-obstacle situation, it MAY end its choices with a plain-language nudge ("You could take these one at a time — or plan the whole run."). One sentence, not a mechanic.

**Reward wire (paired with SNG-030):** executeGambit's success path must READ and AWARD gambit.completionBonusXp (value already in resolution.json; engine currently may not apply it). Confirm strategistBonusPoints (1) and the completion bonus both land, so planning pays over improvising.

**Guardrail:** don't nag — the chip appears only on genuinely gambit-apt turns and is dismissible for the scene. A world where every turn shouts "plan!" is as dead as one that never mentions it.

**Smoke:** a multi-obstacle scene surfaces the gambit chip; a routine scene does not; tapping the chip opens the builder; completing a gambit awards completionBonusXp + strategist points; the Plan affordance is prominent only when apt.

*Updated 2026-07-07.*

## SNG-032 — Narrative-driven time (fix world-clock vs story drift)
Erik 2026-07-07: "world time says deep night but the narrative has it morning." DIAGNOSED: clock only advances by fixed amounts (ADVANCE.beat per turn, sceneEnd, travel — app.js 735/1007) — there is NO channel for the fiction to move time. Sleeping 8 hours, a days-long montage, or a 20-minute conversation all tick the same beat-hours.
- **Fix:** add a `timeOps` GM op: `{"hoursPassed": N, "why": "slept till morning"}`. GM rule: when the fiction moves time (sleep, a night's rest, a journey montage, a long vigil, a quick exchange), declare it; engine applies advanceClock(hours) INSTEAD of the beat default for that turn (beat default remains the fallback when no timeOps). Clamp sane (0.25–72h). Conversations default LOW (a beat = 15–30 min, not an hour+) — tune ADVANCE.beat down for talk-heavy scenes via an intentTag heuristic or leave to timeOps.
- **Sync:** narration must LEAD the clock, never trail it — the GM already receives timeLabel; add rule: if your narration moves to morning, emit the timeOps that gets the world there.
- **Smoke:** sleeping advances ~8h; a conversation advances minutes-to-an-hour; timeLabel and narration agree at every turn; travel/rest still work; no timeOps = old behavior.

## SNG-033 — Party integration v2 (GM knows the characters; proximity = joint scene)
Erik 2026-07-07: party works but isn't integrated; suspects characters aren't saved to the server so the GM lacks details. CONFIRMED: party.js memberOf() syncs ONLY {characterId, name, playerKey, joinedAt}; the PARTY prompt block is fed from that stub — the GM narrates co-players with no abilities, appearance, origin, or role. And joint scenes require explicit join; same-location characters don't merge.
- **Fix A — character sheet sync:** on scene join + on level/gear change, push a compact CHARACTER SUMMARY to the shared scene file (name, origin, level, class-flavor, notable abilities w/ tiers, appearance line, current statusNote). PARTY block feeds from it. GM can then narrate co-characters truly (their skills, their look) while never deciding for them (existing rule holds).
- **Fix B — proximity joint scenes:** when a character enters a location where another player's ACTIVE scene exists (scene files are already listed via ghList), offer "X is here — join their scene?" (both sides consent: joiner opts in, scene owner gets the knock). Auto-suggest, never auto-merge.
- **Fix C — shared-scene state parity:** joint scene turns append to ONE scene file (exists); ensure establishedFacts/npcUpdates from the shared scene flow to BOTH characters' persistent state on leave (currently likely single-owner).
- **Smoke:** GM references a co-character's actual abilities/appearance; entering an occupied location surfaces the join offer; facts earned in a joint scene persist for both characters after parting.

## SNG-034 — Bestiary + ambient wildlife (the world has animals doing things)
Erik 2026-07-07: more animals/beasts around — hunting, doing things. Ties manifest_locals (bestiary doctrine: creatures native to disposition-domains, diffusion everywhere) + living-world (populate for life, not just people).
- **Content (Aevi owes, authorable now):** a creatures pack — per-region ambient wildlife (mundane: river herons, ridge foxes, marsh eels) + manifested beasts (drakes, revenants, fae-things, golems) each with native-domain tag, diffusion weight, behavior line (what it's DOING when encountered: hunting, denning, migrating, scavenging a kill), danger, and whether it's encounter-grade or texture-grade.
- **Engine (light):** (a) GM rule: scene-dressing SHOULD include ambient wildlife appropriate to region+season doing something (texture-grade, no mechanics); (b) random-encounter tables gain creature entries drawing the regional bestiary (encounter-grade); (c) beast NPCs reuse the companion/beastfriend hooks (a calmed beast can matter).
- **Smoke:** scenes mention region-true wildlife acting naturally; creature encounters fire from tables; a Beast-Calm/beastfriend user has real targets.

## SNG-035 — Scene imagery (portraits + skill/moment art)
Erik 2026-07-07: image generation is good — want more, showing the character, skills, key moments. Current state: imagery exists but rare.
- **Spec:** (a) CHARACTER PORTRAIT at creation + on milestone (level tier, evolution stage) — prompt assembled from appearance + origin + gear + current arc; (b) SKILL/MOMENT ART on big beats — discovery of a combination, a gambit run, a Tier-IV use, a world-effect spawn — GM emits an `imagePrompt` op when a beat earns it (clamped: max ~1/scene, player-toggleable); (c) style consistency via a shared style-prefix per world.
- **Engine:** an imageOps path (GM emits prompt; app calls the image endpoint; result renders in the turn + saves to the character's gallery/saga). Cost-aware: off by default on metered accounts, on where Erik runs it.
- **Smoke:** creation yields a portrait; a discovery beat yields art; gallery persists in the Saga (ties SNG-023); toggle works.

### BUILD-READY CONSOLIDATION (Aevi 2026-07-11 — Erik wants this NOW: "start seeing the characters"). 🔧 CCode.
Verified at HEAD: the game has NO image pipeline yet (0 portrait/imagegen refs); `schemas/location.json` already has an `image` field, `schemas/npc.json` has `appearance` (text). So this is FOUNDATION-then-CONSUMERS, and it UNIFIES SNG-035 + SNG-046 Layer 3 into ONE visual pipeline (build once).
- **Phase 1 — the image pipeline (imageOps foundation).** One path: assemble a prompt (character: appearance+origin+gear+arc; location: disposition+tags+seedFiction; a shared world/region STYLE-PREFIX for consistency) → call the image endpoint → **persist-once-and-CACHE** (born-with-image, same discipline as the per-location/NPC generate pattern — never regenerate) → display in-app + save to the character's gallery/Saga (ties SNG-023). Toggleable; cost-aware (default-off on metered accounts, on where Erik runs it).
  - **✅ ENDPOINT = POLLINATIONS (settled — Erik 2026-07-11; already in use and working). NOT a decision to re-open.** The pipeline uses the existing Pollinations image endpoint the game already calls successfully — CCode extends that same working path (prompt-assembly + persist-once/cache + display on top of it), does NOT swap it or introduce a new provider. No key/proxy problem to solve — Pollinations is keyless and client-callable, which is why it already works from Pages. CCode: read how the current Pollinations call is wired and build the portrait/location/moment consumers on it.
- **Phase 2 — consumers (all ride the ONE pipeline):**
  - **CHARACTER PORTRAITS** — at creation + on milestone (level tier, evolution stage). The headline "seeing the characters."
  - **NPC PORTRAITS** — authored + generated NPCs + SNG-042 legends; a GENERATED NPC is BORN with its portrait (folds into the BATCH-9 generate path).
  - **LOCATION IMAGES** — this IS SNG-046 Layer 3. UNIFY; do not build twice. A discovered/generated place born with its image.
  - **MOMENT ART** — big beats (discovery, gambit run, Tier-IV use, world-effect) → GM emits `imagePrompt`, clamped ~1/scene, toggleable.
- **FLOORS APPLY TO IMAGES TOO (non-negotiable):** a generated portrait/scene honors the player's rating ceiling AND the absolute minor-protection floor — route image prompts through the same floor logic as text (`enforceFloors`); no image ever sexualizes a minor or exceeds a viewer's ceiling. Content-safe: original character/environment art, no IP, no real people.
- **Priority: TOP build-value right now.** Phase 1 (pipeline) unblocks every consumer; then portraits are the fastest, highest-delight win.


## SNG-017 addendum — the Ent/resonant gating fix (root cause found)
Erik: "my ent can't choose resonant skills, why?" DIAGNOSED in progression.js effectiveLevelReq: non-valley origins get own-tradition + valley_craft(+1); harmonic<->radiant return null (forbidden). An Ent origin matches neither harmonic nor radiant → resonant abilities are null = never offered. The two-rival-civilizations rule predates the world model. FIX (fold into SNG-017): replace the hardcoded triangle with origins.json — each origin grants homeTraditions[]; ALL other traditions are learnable-through-fiction (teacher/travel/quest — the same unlock pattern precursorAccess already uses, generalized to character.traditionAccess[]). Reach traditions already model this ('learned'-gated). Result: an Ent CAN learn Harmonic — by training at the Heights, which is exactly the story it should take.

*Updated 2026-07-07.*

## SNG-036 — Martial paths (baseline defense + form-kits + martial backgrounds)
Erik 2026-07-07: every character needs some way to defend itself; the Ent needs branch-clubs and root-skills; martial backgrounds should exist across the axes (a chaos-warrior and an order-warrior: same basic skills, expressed novelly through their Reach combos). Content DONE at content/packs/core/rules/martial_paths.json + 7 signature combos added to combination_recipes.json:
- **Baseline defense kit** (Brace/Strike/Break Away/Raise the Alarm) — 4 free zero-cost abilities, powerSystem 'baseline', granted at creation; SNG-022 reconcile-grants to existing characters (Erik's Ent gets them next login). Expression follows FORM (an Ent's Strike = branch-club; Brace = barkskin).
- **Form-kits** — origin-form ability sets: ENT (Branch-Club, Barkskin, Root-Hold, Root-Reach), Blocklands-native (Quick Wall); more authorable per form. Granted free by origin form.
- **8 martial backgrounds** — Warrior role × Reach = distinct tradition: Marcher (violence+order), Churn-Reaver (violence+chaos), Temple Guardian (body+peace), War-Thinker (mind+order), Umbral Blade (violence+dark), Thorn-Warden (life+violence — the Ent's natural path), Blaze-Lance (light+violence), Pale Reaper (death+peace). Each grants home-Reach martial abilities + a signature combo (all 7 new braids authored + Unseen Cut). Generation (SNG-020) can author more by the same grammar.
- **Engine (composition, no new systems):** grant baseline at creation + via SNG-022; form-kit by origin form; background as origins.json entry (SNG-017) granting homeReach + signature combo; combos discoverable per SNG-026.
- **Smoke:** every new character has the 4 baseline abilities; an existing Ent gains baseline + form-kit on login and can Branch-Club/Root-Hold immediately; choosing Thorn-Warden at creation grants its kit + Grasping Green; a chaos-warrior and order-warrior demonstrably fight differently.

*Updated 2026-07-07 — roadmap consolidated through SNG-036.*

## SNG-037 — Cross-character narrative awareness (GM sees what everyone is doing)
Erik 2026-07-07: player character narratives should be saved to the repo so the GM has access to what everyone is doing. DIAGNOSED at origin: character files DO sync to characters/{playerDir}/{charId}.json (full state incl. a chronicle field) — but (a) chronicle is EMPTY on inspected saves (nothing writes it → the SNG-023 narrativeLog gap), and (b) NOTHING ever reads other characters' repo files — grep shows zero fetchRepoJSON of co-characters. The pipe exists; nothing flows, nobody drinks.
- **Fix A (write — rides SNG-023):** the narrativeLog/logUpdates op writes per-beat story entries into the character file; since saveCharacter already syncs, the narrative lands in the repo for free. Add a compact `publicSummary` block (last ~10 log lines + location + statusNote + current aim) refreshed on save — the shareable face of the character.
- **Fix B (read — the GM awareness):** on scene start (and shared-scene turns), fetch co-located + party characters' publicSummary blocks (cheap: one file each, already listed via ghList) and feed a WORLD-PLAYERS block to the GM: who else is active in this region, what they've been doing, their current aim. GM rule: these are living presences — reference their deeds as rumor/news ("a green giant was seen crossing the Zone"), have NPCs mention them, let their world-effects be felt — but NEVER narrate their actions or decide for them (existing party rule generalizes).
- **Privacy/scale guardrails:** publicSummary only (not full sheet — secrets, inventory, codex stay private); cap fetch to same-region + party (not every character every turn); a player toggle to opt out of appearing in others' games.
- **Ties:** SNG-023 (the log that feeds it), SNG-033 (party v2 sheet-sync is the close-range version; this is the world-range version), SNG-025 (world-effects are already the mechanical trace — this adds the narrative trace).
- **Smoke:** a second player's recent doings appear as rumor/news in region; the GM references their trail without deciding for them; publicSummary updates on save; opt-out hides a character; no full-sheet leakage.

*Updated 2026-07-07 — through SNG-037.*

## SNG-038 — Simultaneous party turns (collect-then-resolve; one scene, many perspectives)
Erik 2026-07-07: rather than strict round-robin, each party member CHOOSES an action before the GM writes; the GM then writes ONE shared scene resolving everyone's actions together, rendered from each player's PERSPECTIVE. Less turn-locking; more "there is a party you can aid or talk to." REPLACES party.js round-robin (turn pointer, one actor per GM write).
- **Model — collect then resolve:** a shared beat has a COLLECTION phase (each present member submits an action; UI shows "waiting on N players" but nobody is locked — you can still Ask GM, talk, or aid) then a RESOLUTION phase (GM receives ALL submitted actions + the party's states and writes one coherent beat where the actions interleave). No dead waiting: a member who's slow can be marked "holds / follows the party's lead" so one AFK player doesn't stall the beat (timeout or a ready-check).
- **One scene, many perspectives:** the beat is ONE shared canonical event (single scene-file append), but each player's CLIENT shows it framed from their character — "you" is them; co-characters are "Cellaceron swings his branch beside you." Cheap: GM writes the shared beat once + a short per-character perspective gloss (or the client re-points pronouns; GM-authored gloss is richer). Canonical facts identical for all; framing local.
- **Party-aware actions (the real want):** action menu in a shared scene always includes party verbs — AID (add your roll/ability to another's action → the assist mechanic already exists via companions; generalize to players), TALK (in-scene to a co-character, doesn't spend the beat), GUARD (shield a co-character), COMBINE (two players' abilities braid via SNG-026 cross-domain — a shared-scene combination is a headline co-op moment). The GM is told: the party can help each other; surface it.
- **Turns softened:** no hard lock. "Whose turn" becomes "who hasn't submitted this beat." Aid/talk/guard don't consume your action. Initiative only matters where fiction demands strict order (a duel round) — keep the round model there, use collect-resolve everywhere else.
- **Ties:** SNG-033 (sheet-sync feeds the GM the party states it needs to resolve everyone), SNG-026 (cross-player COMBINE), SNG-001 (shared scene file is the substrate). Replaces the round-robin turn pointer.
- **Smoke:** two players submit actions; GM writes one beat resolving both, each sees it in first-person; AID/TALK/GUARD don't cost a beat; a slow player is auto-held not blocking; two players can COMBINE abilities; no turn-lock "seems broken" state.

## SNG-039 — First-session onboarding (teach the deep system by play)
The game is deep (tiers, gates, poles, gambits, combinations, martial paths) and a new player lands with no ramp — unspecced entirely. Add a guided first session that teaches through play, not a manual.
- **Model:** a short scripted-ish opening arc (3-5 beats) that introduces ONE mechanic at a time in fiction: first a plain choice + a skill check (learn the d100 feel), then an ability use (learn functions), then a small encounter (learn the encounter loop), then a moment that invites a novel typed action (teach that freeform is rewarded), then hand off to open play. Diegetic — a mentor NPC or a low-stakes situation, not tooltips.
- **Progressive disclosure:** advanced surfaces (gambit builder, cross-domain combos, the skill graph) stay hidden/quiet until the player has the basics; the gambit chip (SNG-031) and combination discovery already gate themselves — lean on that.
- **Creation ramp:** creation (SNG-017) offers a "guide me" path (pick a role+homeland archetype with a sensible kit) vs "full control" — so a new player isn't drowned in origins/talents/traditions turn one.
- **Skippable:** returning players opt out; the onboarding flag lives on the profile.
- **Smoke:** a brand-new character is walked through choice→check→ability→encounter→novel-action across a few beats; advanced UI stays quiet until earned; "guide me" creation yields a playable character in under a minute; skip works.

## SNG-040 — Content validation CI (catch malformed packs at commit)
~150 content files authored by hand; one malformed JSON or missing required field silently breaks a pack at load. Add a cheap guard.
- **Model:** a validation script (node, no deps) run in a GitHub Action on push to content/**: (a) every .json parses; (b) required fields per type present (locations need id/poleIntensity-or-spectrum; abilities need id/functions/levelReq; NPCs need id/name; recipes need parts/functions); (c) cross-ref integrity — connections/parts/loreRefs point at ids that exist; (d) manifest lists match files present. Fail the Action (or comment) on violation.
- **Also a local pre-push:** an update.bat / npm-script hook Erik can run before syncing.
- **Reconciliation tie:** validation is the STATIC cousin of SNG-022 (which repairs at runtime) — CI catches authoring errors before they ship; reconciliation heals version drift on load. Both together = content stays sound.
- **Smoke:** a broken JSON fails CI with a useful message; a dangling connection ref is flagged; a valid commit passes; the local hook catches it before push.

*Updated 2026-07-07 — through SNG-040.*

## SNG-041 — Absolute world dating (one world, one clock)

**Fast-fix, ships AHEAD of BATCH-9. ✅ ANCHOR RESOLVED 2026-07-11 (hybrid — below); BUILDABLE.** Erik-found+clarified live 2026-07-11; Aevi PO. Preview-testing protocol. Only Aevi closes.

**🔧 BUILD OWNER: CCode.** SNG-041 is ENGINE CODE — shared world epoch in worldtime.js, event/fact/news stamping with the absolute world-day, worldtick cross-character reconciliation, GM-references-not-invents contract. Aevi's part (spec authoring + fork-resolution + unblock) is COMPLETE; Aevi authors specs/ledger/content, NOT engine implementation. **CCode builds SNG-041 as its next build after Phase 1 — do not stop expecting Aevi to land it.** Aevi closes after Erik's browser-leg.

**Root cause (corrected — Erik-clarified + confirmed in code).** Time is PER-CHARACTER: `worldtime.js newClock(startDay=1)` gives every character its own Day-1 origin, so "Day 8" (this character) and "Day 11" (the Ent character) are independent relative counts with NO shared reference. A shared-world event carried the Ent's relative Day-11 into this character's Day-8 frame; they can't reconcile because no absolute exists. worldtime.js's own comment already flags it: *"for v0.5 shared worlds: time mode must become a WORLD-level choice — one world, one clock."* No shared epoch exists yet (search: 0 matches). SNG-041 IS that.

**Fix — establish the shared absolute.**
1. **Shared world epoch.** One world-origin stored in shared/synced world config (NOT per-character). All characters derive the absolute world-date from the same origin.
2. **Absolute world-day** = derived from the shared epoch (reuse `readClock` real-mode math against the SHARED anchor instead of a per-character `realAnchor`). "One world, one clock" — every character at the same moment reads the same absolute world-date.
3. **Stamp every event / fact / news with the ABSOLUTE world-day**, not the character's personal count. Cross-character propagation reconciles on the absolute; the away-digest dates events in absolute terms (or "N days ago" relative to the viewer's current absolute world-day), so an Ent-timeline event and this character's scene share ONE calendar.
4. **Keep the per-character journey-day as optional flavor** (Erik: "keep it if useful") — a separate "days you've played" counter shown alongside/instead of the absolute date. DISPLAY layer, NOT the reconciliation key.
5. **Catch-up on load.** On load, advance the character to the current absolute world-day and run the worldtick for elapsed absolute days (worldtick already gap-advances — formalize against the shared clock).

**ANCHOR RESOLVED (Erik 2026-07-11) — HYBRID, two coupled clocks:**
- **Distant / ambient world → (a) real-time absolute.** The away-digest, propagating events, traveling figures, distant wars, and ALL cross-character reconciliation run on the shared real-time epoch. The far world ages whether or not you play.
- **Active local frame (current area + active quests) → (b) play-paced.** Advances by narrative time (SNG-032); waits for the player. You never lose a quest window or an active scene to inactivity.
- **Consequence coupling — (a) OVERRIDES (b) when real-time passage would materially affect the active area/quest.** A distant real-timed event tagged as impacting your area/quest (a war reaching your town; a genuinely time-critical quest) promotes into the local frame and applies on return (worldtick already gap-applies — this tags WHICH events cross the boundary and lets real consequence override the play-paced default).
Net: two clocks reconciled on the absolute — real-time governs the far world + cross-character stamps; play-time governs your immediate scene; impactful distant events cross the boundary. **BUILDABLE — no longer gated.**

**Guardrails.** Engine owns dates (GM references/narrates, never authors bare day-numbers); backward-safe (legacy per-character clocks migrate to the shared epoch; unknown = unknown, no fabricated absolute dates — derives-never-fabricates); reuse worldtime.js + facts.js + worldtick.js (extend, don't reinvent); suites + parse_probe green.

**Erik preview test:** "With two characters at different personal day-counts, trigger an event / away-digest — verify both reference the SAME absolute world-date for the same event, and each still shows its own journey-day if kept."

*Still ahead of BATCH-9 — the generative world needs the shared absolute so generated cross-character events are born reconcilable, not each inventing its own Day 1.*

---

## SNG-042 — Legends & Villains (the world's great figures)

**Content + systems. RIDES ON BATCH-9** (needs the generate path + weight/engagement + codex recurrence). Earliest after BATCH-9 Phase 1; best paired with Phase 2 offscreen advancement (legends move through the world between appearances). Erik-directed 2026-07-11; Aevi PO. **ANCHORS AUTHORED ✅** content/packs/valley/lore/legends.json (dff4c4f5): 3 heroes (Kesh/witness, Iselde/advice, Alder/rescue) + 2 villains (Halvex epic-rewriter, Grael regional-threads-Fendt); riffraff generatable. Content gate cleared. Only Aevi closes.

**Idea (Erik).** The world should occasionally deploy powerful named figures in dramatic beats — a hero whose power you witness in a huge battle, a rescue from a doomed situation, a legend passing by who gives advice or a task — and it needs villains across the whole spectrum, epic to riffraff. Threads the world together through recurring great figures.

**1. Power-tier spectrum on NPCs.** Add a tier — legendary/epic → regional/notable → local/riffraff — on both heroic and villainous alignment. Generation-at-tier: `generate("npc", {tier, alignment, …})` mints a figure at the requested power, born at high birth-weight for legendary (the BATCH-9 weight system then makes them real + recurring by default). Villain ladder: riffraff (petty bandits/thugs) → regional (a warlord, a corrupt supervisor — cf. the live Fendt thread) → epic (an arc-defining antagonist).

**2. The Legends roster.** A few HAND-AUTHORED anchors (2–3 iconic heroes + 1–2 epic villains, in-grain to the Valley, high weight-floor so they're stable canon) + generatable great-NPCs for mid/low tiers. Modeled as high-power universal-role instances (`universal_roles.json` already gives role → disposition-expression; a legend is a role at legendary tier with a signature + a presence pattern).

**3. Dramatic-beat deployment (the novel system — "legend surfacing").** The engine detects beat-types where a great figure's appearance lands and deploys one in-grain, RARELY (a special beat, not every scene — governed like gambit surfacing so it never cheapens):
- **Doomed / overwhelming odds → a hero intervenes / rescues** (relief + witnessing power).
- **A set-piece battle → the character WITNESSES a legend's power** (scale-setting — you see what the best can do).
- **A mundane crossing → a passing legend offers advice or a task** (threading + hooks; the world feels populated by greatness).
- **A villain's shadow → riffraff / lieutenants appear, escalating toward the epic villain** (a menace ladder that scales to the character's power/arc).

**4. Threading via recurrence.** Legends are high-weight recurring codex entities (SNG-019 resolution + BATCH-9 weight): the hero from the battle passes by later with advice; early riffraff foreshadow the epic villain; a rescuer remembers you. With Phase-2 offscreen advancement, legends MOVE through the world between appearances (the traveling hero's deeds reach you via the away-digest, dated on the SNG-041 shared clock). The world threads itself through their recurrence.

**5. Governors.** Rare, earned deployment (legend appearances are special); power-appropriate (no epic villain for a tavern scuffle); villain tier scales to the character's arc (riffraff early, epic as climax); rating-aware (a legend's brutality respects the player's content ceiling — ties the BATCH-9 rating-lens).

**Guardrails.** Engine detects the beat + selects the figure; GM narrates. Rare/governed — don't cheapen greatness by overuse. Reuse generate path + weight + codex + universal_roles (don't reinvent). Rating-aware. Suites + parse_probe green.

**Erik preview test:** "Get into a genuinely doomed fight — verify a hero can intervene and you feel the gap between your power and theirs; later, verify that same hero (or their reputation) recurs — a passing word, a task, an appearance — not a one-off; and verify a villain ladder (riffraff now, something bigger implied)."

*Rides BATCH-9; earliest after Phase 1, best with Phase 2. **ANCHORS AUTHORED ✅** content/packs/valley/lore/legends.json (dff4c4f5): 3 heroes (Kesh/witness, Iselde/advice, Alder/rescue) + 2 villains (Halvex epic-rewriter, Grael regional-threads-Fendt); riffraff generatable. Content gate cleared.*

---

## SNG-BATCH-9 Phase 2 — Living advancement (offscreen + curation)

**⛔ DEPENDS ON: BATCH-9 Phase 1 (generate + weight) AND SNG-041 (shared absolute dating) — SNG-041 REQUIRED FIRST.** Offscreen advancement surfaces cross-character dated events (the away-digest); without the shared clock they drift exactly like the live Day-8/Day-11 bug, multiplied across every generated entity. Do NOT build Phase 2 until SNG-041 has landed. Pairs with SNG-021 world-tick. Aevi PO; only Aevi closes.

**1. Offscreen advancement.** Established-tier generated entities (NPCs, arcs) advance while the player is away — the world-tick moves them per their disposition + arc-pressure; their deeds/changes surface in the away-digest, **dated on the SNG-041 shared absolute clock** (real-time far world). fresh/demoted entities do NOT advance (the engagement governor from Phase 1). Legends (SNG-042) ride this path — a traveling hero's offscreen deeds reach you as dated news.

**2. Explicit ⭐ "keep" boost.** A one-tap keep on a generated entity's codex page adds an engagement boost (available, never nagged) — the explicit complement to Phase 1's implicit engagement score. Raises the entity's attention weight toward established/nominated.

**3. Nomination surfacing.** Entities crossing the established→nominated weight threshold surface as promotion candidates (the queue toward Phase 3 shared-canon), provenance intact, rating-tag carried. Surfacing only — no promotion yet (that's Phase 3).

**Guardrails.** Only established-tier advances offscreen (governor); advancement is disposition-consistent (no off-grain drift); away-digest dated coherently via SNG-041 (no future-date-as-current-news); derives-never-fabricates; reuse worldtick + weight + codex; suites + parse_probe green.

**Erik preview tests:** (1) "Leave an established generated NPC/arc alone across a gap — return and verify it has moved on plausibly, and the away-digest dates its deeds on the shared world-clock, on-or-before now." (2) "⭐-keep a generated entity — verify it holds/advances where an ignored one fades." (3) "Play a while and verify some generated entity surfaces as a 'notable' nomination candidate."

*Phase 2 = the living half of the anchor. Gated on SNG-041. Phase 3 (shared promotion + rating-lens) follows.*

---

## SNG-043 — Gambit refinement (surface less, build better)

**Refines SNG-031 (BATCH-8, shipped). Erik-found in live play 2026-07-11** (hint fires on ~every rich scene; builder unchanged by surfacing; no energy feedback). Aevi PO; only Aevi closes. **🔧 BUILD OWNER: CCode** (engine/UI code).

**Part A — Tighten the surfacing heuristic (quick; fixes "every turn").** `isGambitApt` (app.js ~315) currently returns true on `tagged || abilityChoices >= 2 || nonTrivial >= 4`. The `abilityChoices >= 2` and `nonTrivial >= 4` fallbacks fire on almost every substantive scene, so the hint shows constantly. A gambit is a MULTI-STEP PLAN; the hint should appear only when SEQUENCING actions toward a goal against obstacles is genuinely apt — not merely when a scene is rich.
- Require a real plan signal: strict plan-intent tags (**plan / scout / prepare** — DROP investigate/analyze, single-action) OR an explicit staged / multi-obstacle objective in the turn.
- DROP the loose `abilityChoices >= 2` and `nonTrivial >= 4` fallbacks (or gate them behind a plan signal AND raise thresholds). Rich ≠ plan-apt.
- Keep dismissible-per-scene. Net: occasional + special, matching "presented when the scenario presents itself."
- Smoke: a 2-ability-option scene with no staged goal → NO hint; a genuine multi-obstacle/staged objective → hint; routine scenes quiet; hint frequency drops sharply.

**Part B — Gambit Builder v2 (GM-collaborative + energy feedback).** SNG-031 only SURFACED the existing builder (player writes steps → `parseGambitSteps` classifies → per-step odds → execute → GM narrates AFTER). It added no GM-collaborative building and no cost transparency. Add:
- **GM-collaborative plan building:** the GM participates in CONSTRUCTING the plan, not just narrating the result — suggests a step, reacts to the draft ("that guard is alerted by step 2"), proposes an approach, or refines wording, DURING building. Interactive co-authorship; engine still owns schema/odds; the plan stays the player's, the GM advises (a GM-assist call in the builder offering suggestions/warnings the player accepts or edits).
- **Energy-cost feedback:** show each step's energy cost + the running TOTAL in the builder BEFORE commit (surface the existing `stepEnergyCost`, sum it, warn if total exceeds current energy). The game feedback that lets a player budget a plan.
- Smoke: building a plan, the GM offers at least one useful suggestion/warning; each step shows its energy cost; the total updates + warns when it exceeds available energy.

**Guardrails.** Engine owns schema/odds/costs; GM advises, player decides; Part A is a one-function tune (fast, low-risk, interleave anytime); reuse parseGambitSteps + stepEnergyCost — don't reinvent; suites + parse_probe green.

**Erik preview tests:** (1) "Play several scenes — verify the Plan hint now shows only when a real multi-step plan fits, not on every rich scene." (2) "Open the gambit builder — verify the GM actively helps shape the plan (a suggestion or warning) and each step + the total show energy cost before you commit."

*Refinement of shipped SNG-031. Part A = quick tune (interleavable, one function). Part B = enhancement, queued. NOT on the BATCH-9/dating critical path — blocks nothing.*

---

## SNG-044 — Item relevance + bonus-count cap (stop inventory stacking)

**Erik-found in live play 2026-07-11:** the Traveler's Pack (and items generally) aid too many situations; hoarding broadly-tagged items stacks bonuses. `inventory.js equipmentBonus` (~L169) currently adds **+N PER owned item** whose bonusTags intersect the action's intent tags, capped ONLY on the TOTAL (`equipmentBonusCap=10`) — so the NUMBER of contributors is uncapped and broad-tagged items help nearly everywhere. Aevi PO; only Aevi closes.

**Part A — cap the CONTRIBUTOR COUNT (engine; 🔧 BUILD OWNER: CCode).** Change `equipmentBonus` from sum-over-all-matching to **best-matching-item-only** (or top-2 max, tunable), so you get the BEST tool's bonus, not a pile of mediocre ones. Principle: *the right tool helps; a bag of tools does not help more.* Keep `equipmentBonusCap` as a backstop. Surface WHICH item aided the roll (LLW transparency — the player sees "your climbing rope helped here," not an opaque +N).

**Part B — detail item relevance (content; Aevi authors).** Audit item `bonusTags` so each aids SPECIFIC, appropriate situations, not broad utility. The **Traveler's Pack** especially: it is a container / general-carry, not a universal aid — its bonusTags should be narrow (having-the-right-small-thing in a prep/survival context) or empty, never a broad combat/social/everything bump. This is the "detail out what's useful when" pass — Aevi authors it (like the legend anchors).

**Guardrails.** Engine owns the count-cap + total-cap; content owns relevance. Reuse existing bonusTags/equipmentBonus (don't reinvent). Backward-safe (best-of is a strict narrowing; no schema change). Suites + parse_probe green.

**Erik preview test:** "Carry a loaded inventory into a few different situations — verify only the genuinely relevant (best) item gives a bonus, stacking several matching items doesn't pile up, and the Pack stops helping with things a bag shouldn't."

*Fast-follow balance fix; OFF the BATCH-9/dating critical path. Part A = small CCode engine change; Part B = Aevi content audit.*

---

## SNG-045 — Player identity dedup (one person, one profile)

**Erik-found in live play 2026-07-11:** the "Who's playing?" picker shows TWO "Erik" profiles (`player-54seyk` → char-mr4ejo8c + char-mr5ns3hh; `player-s9z9u1` → char-mr6eq1a5), both him. Root cause: identity is keyed PER-DEVICE — `playerKey` is generated fresh per device, so "Erik" entered on his phone and on his computer minted two profiles. BATCH-7 P2 synced CHARACTERS across devices but NOT identity, so one person fragmented into multiple profiles. Aevi PO; only Aevi closes.

**Part A — reconcile existing duplicates (🔧 BUILD OWNER: CCode; SNG-022-style migration step).** Merge same-displayName duplicate profiles: UNION charactersPlayed, merge per-character play-style (per-char records already separate → mostly a union, no double-count), choose one canonical playerKey, retire/redirect the duplicate (keep a redirect so old-device localStorage still resolves). Idempotent, backward-safe, derives-never-fabricates. For Erik: 54seyk + s9z9u1 → ONE Erik owning char-mr4ejo8c + char-mr5ns3hh + char-mr6eq1a5. **Leave "Drizzy" (0jwfjo) alone** — distinct name, not flagged.

**Part B — prevent future duplicates (🔧 BUILD OWNER: CCode; identity fix).** The picker resolves by PERSON, not per-device key: selecting/entering an EXISTING displayName on a new device attaches to the existing profile (match by displayName or a stable person-key), rather than minting a new playerKey. The picker also collapses identical-name entries (display dedupe) even ahead of the merge. "New player" only when the name is genuinely new.

**Guardrails.** Reconcile owns the merge (safe, idempotent); NEVER destroy a character or a play-style record; keep a redirect for retired keys; ties to BATCH-7 identity + cross-device (P2) + SNG-041 shared model. Suites + parse_probe green.

**Erik preview test:** "After the fix, open 'Who's playing?' — verify ONE Erik owning all your characters; then start on a different device and pick Erik — verify it attaches to the same profile, not a new one."

*BATCH-7 identity refinement; OFF the BATCH-9/dating critical path; fast-follow (live annoyance — you're seeing two of yourself). Pairs naturally with SNG-041's shared-identity work.*

---

## SNG-046 — World map: KG overlay + multi-area (see where you are, and where the things are)

**Erik-directed 2026-07-11.** Aevi PO; only Aevi closes. **ALREADY BUILT (renderMap, app.js ~1310):** SVG map from `location.map.x/y` + connection edges; current-location "you are here"; visited-vs-heard-of for PLACES (placeMemory) AND sub-places (satellites, visited/heard grammar); reachability, danger, travel button, details panel (description/vectors/notes/visit-history). So position + discovered/heard for PLACES works and is per-character. This spec adds only what's missing.

**RENDERING DIRECTION (Erik-clarified 2026-07-11):** the target is a RENDERED, ILLUSTRATED map with per-location/scene ICONOGRAPHY — NOT the current abstract circles-and-lines node graph. Upgrade the visual layer to: terrain/region fills tinted by disposition (poleIntensity), per-location ICONS derived from tags (market/stall, shrine/sacred, ruin/precursor, churn/unstable, waystation, danger, etc.), connection paths drawn as trails/roads/rivers — THEN the Phase-1 KG overlay and Phase-2 multi-area on top. **RENDERING RESOLVED (Erik 2026-07-11) — THREE LAYERS, not a choice:**
- **Layer 1 — Foundation (a): data-driven SVG map.** Positions, tag-derived icons, connection paths, KG overlay, discovery states, multi-area auto-positioning. ALWAYS present; scales to BATCH-9 generated locations; the interactive/structural layer. The buildable core. 🔧 CCode.
- **Layer 2 — Base image (b): authored big-picture Valley base-map art** sitting UNDER the SVG as the backdrop for the authored region. Graceful: where a region has no base art (far/generated areas), Layer-1 terrain fills stand in. Content asset — Aevi sources (authored or a one-time generation).
- **Layer 3 — Per-location art (c): generated-and-PERSISTED location images.** Each place gets its OWN illustrated image, generated ONCE on discovery/visit and CACHED (persists — never regenerated), shown in the location detail / when you're there. Bounded per-place, NOT a whole-map generation → no geographic-consistency problem (Erik's key insight). Ties the image-gen infra (Z-Image) + SNG-035 imagery; a BATCH-9 generated location is born with BOTH its data AND its image. 🔧 CCode pipeline (generate-once-and-cache) + image-gen.
Build order: **Layer 1 first (foundation, UNBLOCKED, CCode).** Layer 2 = a content asset (Aevi). Layer 3 = generate-once-and-cache pipeline + image-gen; pairs with BATCH-9 + SNG-035. Content-safe: original environment art only (no IP, no people). **UNBLOCKED — Layer 1 buildable now.**

**WORLD SCOPE (Erik 2026-07-11):** the world is NOT just the Valley. "valley" is regionId of the FIRST authored region; the world spans MULTIPLE regions. Layer 2 base-map art is therefore **per-region** (the Valley first; other regions get their own base image, or fall back to Layer-1 terrain fills). Layer-1 multi-region auto-positioning already structures this. The GM's "Valley of Echoes" framing generalizes as regions come online — narration + map + generation all region-aware, Valley-as-one-region not Valley-as-world.

**Phase 1 — KG/codex overlay (see the THINGS, not just the places). 🔧 CCode.** Overlay discovered/heard-of ENTITIES (NPCs, legends, lore, notable items) onto the map, mirroring the place visited/heard grammar:
- Pull from the codex (SNG-019). Each entity with a resolvable location (NPC `homeLocation`, a fact/news location) places near that node; **discovered** (met/seen firsthand) renders solid; **heard-of-only** (mentioned in facts/news, not encountered) renders dimmed/dashed — same visual language as sub-places.
- Toggle-able overlay (map ⇄ map+KG) so the base map never clutters.
- Optional relationship edges: where the codex knows a link (Fendt→Edge District, a lieutenant→Grael), draw a faint line — literally "the KG overlaid on the map."
- Click an entity → its codex entry.
- Smoke: a met NPC shows solid at its place; a heard-of legend (e.g. Kesh from a rumor) shows dimmed near where it was heard; toggle works; clicking opens the codex.

**Phase 2 — Multi-area + auto-positioning (different start areas + generated world). 🔧 CCode. Pairs with BATCH-9.** The map assumes authored Valley coords; characters starting in DIFFERENT areas and BATCH-9 GENERATED locations have none:
- Auto-position locations lacking `map.x/y`: deterministic + stable layout (region-grid or force-directed from `connections` + `regionId`), so a location never jumps between renders.
- Multi-region layout: group by `regionId`; the map covers/pans multiple regions; on open, CENTER/reveal on the character's ACTUAL current area (a character who starts elsewhere sees their area, not an empty Valley corner).
- Generated locations (BATCH-9) get auto-coords on mint so they appear immediately.
- Smoke: a character starting outside the Valley sees a map centered on their area; a generated location appears positioned near its connections; multi-region pan works.

**Phase 3 (optional/later) — party/shared view.** Show where each party character is on one map. Ties SNG-033 (party v2) + SNG-037 (cross-char awareness). Deferred — Phase 1+2 deliver the core ask.

**Guardrails.** Reuse renderMap + placeMemory + codex (SNG-019); KG overlay is additive + toggle (never clutters the base map); auto-positioning deterministic + stable; per-character view (each character's own discovered/heard set); Phase 2 pairs with BATCH-9 generated-location coords. Aevi owes no content (uses codex + existing coords). Suites + parse_probe green.

**Erik preview tests:** (1) "Open the map — verify people/things you've met show up ON the map (solid), things you've only heard of show dimmed, and you can toggle the knowledge overlay on/off." (2) "Play a character that starts in a different area — verify the map centers on THEIR area and reveals as they explore, not a fixed Valley view."

*Phase 1 builds on the existing map — off the critical path, can go anytime. Phase 2 pairs with BATCH-9 (generated locations need coords). Auto-positioning is engine; no content owed.*

---

## SNG-047 — Skill sidebar UI (group by type, show functions, adopt the orphan)

**Erik-found in live play 2026-07-11:** the ABILITIES sidebar is a flat list (rank · technique · energy "was N"); it should group by skill type, show each ability's functions, and the discovered combo (✦ Resonant Sight) dangles orphaned at the bottom. Aevi PO; only Aevi closes. **🔧 BUILD OWNER: CCode** (UI). No content owed — functions + parts already in the data.

1. **Group by type/tradition.** Section the list under power-system groups (harmonic / radiant / valley_craft / precursor / learned / discovery) — the SAME taxonomy as the map's color-encoding, so "type" reads consistently across the app. Collapsible section headers.
2. **Show functions.** Each ability displays its `functions` tags (heal / shield / strike / reveal / conceal / bind / move / break / ward) as small icons or chips — the player sees what an ability DOES at a glance, not only its name and technique.
3. **Adopt the orphan (combos/discoveries).** The ✦ discovered combo (Resonant Sight) gets a home: grouped under a "Discoveries / Combinations" section (or nested under its domain), and — using `combination_recipes.parts` — SHOWS its source abilities so it reads as a braid of X + Y, not a floating entry. Link ✦ to its parent abilities.
4. **UI TLC.** Consistent rows (rank · technique · function chips · energy), clear group headers, keep the ⓘ info affordance. Scannable, grouped, legible.

**Guardrails.** Reuse ability `functions` + `combination_recipes.parts` + existing rank/energy display (don't reinvent); grouping is display-only (no mechanic change); collapsible so a big kit stays manageable. Suites + parse_probe green.

**Erik preview test:** "Open your abilities — verify they're grouped by type with function icons shown, and your combo (Resonant Sight) is grouped as a discovery that shows what two abilities make it, not stranded at the bottom."

*UI polish; OFF the BATCH-9/dating critical path. CCode UI build, no content owed.*

---

## SNG-048 — Narrative register keyed to disposition (concrete by default, poetic where warranted)

**Erik-found in live play 2026-07-11:** despite GM rule 5 ("Grounded hopeful-strange tone... never purple"), the GM over-writes abstractly EVERYWHERE (e.g. "the ground here is releasing something so slow it doesn't register as heat — more like a long exhale the soil has been making for years") — poetic but alienating; most players go "WHAT?!". Erik: default to CONCRETE for most narration; reserve poetic/abstract for places the world warrants it — shift voice by the axes vectors. Aevi PO; only Aevi closes. **🔧 BUILD OWNER: CCode** (GM contract).

**The in-grain hook:** the world already HAS a `concrete_abstract` spectrum axis (among the 12: emotional_logical, falsehood_truth, demonic_angelic, violence_peace, **concrete_abstract**, mechanical_spiritual, chaos_order, dark_light, death_life, space_time, body_mind, destruction_creation). So "voice by axes" maps DIRECTLY — narrative register IS the `concrete_abstract` axis expressing through the prose. Not an arbitrary rule; the place's own disposition sets its voice.

**Fix:**
1. **Default HARD toward concrete.** Strengthen rule 5: the DEFAULT register is grounded, plain, sensory-literal — describe what's actually there in words a person gets on first read. Metaphor sparing; no abstract personification of ordinary things. (The soil-exhale line is simply wrong in a market or on a road.)
2. **Disposition-keyed register cue (engine → GM).** Compute a register from the location's `concrete_abstract` axis + overall charge (`poleIntensity`), fed to the GM like the existing INTENSITY cue (gm.js ~139):
   - concrete-leaning / low-charge / ordinary place → CONCRETE prose (default).
   - abstract-pole / high-charge / sacred·temporal·precursor·strange place → register EARNS its way toward the poetic/abstract/lyrical (the soil-exhale line belongs HERE, not everywhere).
   - middle band → mostly concrete, a touch of strange.
3. **Axis-flavored voice (fuller version).** Which axes are charged colors the register: truth-pole → stark/clear; falsehood → slippery/indirect; mechanical_spiritual spiritual → lyrical, mechanical → precise/clinical-strange; death_life / chaos_order etc. tint word-choice. Core lever stays concrete_abstract + charge; the rest is flavor.

**Guardrails.** Engine computes the register cue from existing spectrum/poleIntensity (no new data); GM narrates to it (contract change, no mechanic change); default concrete unless the place earns otherwise. Suites + parse_probe green.

**Erik preview test:** "Play through an ordinary place (market, road, waystation) and a genuinely strange/charged one — verify the ordinary place reads concrete and clear (no soil-exhales), and the poetic register only appears where the world is actually abstract or charged."

### RATING-REGISTER MAP (Erik 2026-07-11 — the "R+ chokes on romance/intimacy" fix). 🔧 CCode.
**Diagnosis (verified at HEAD):** the rating reaches the GM ONLY as a CEILING (gm.js ~79: "narrate to this content ceiling — no more intense") — a CAP, not a DIRECTION. There is NO rating→register map (search: 0). So at R+ the model is *permitted* up to R+ but never *directed* to write the full mature register — and with only a permission + its own default caution it collapses intimacy to PG even when R+ is set. Gore fares better only because violence has other prompt cues; romance has none.
**Fix — flip rating from cap to DIRECTION; add an affirmative rating-register map (within the rules — erotic REGISTER, not explicit depiction):**
- **G / PG:** chaste, gentle; violence bloodless; intimacy is warmth and closeness only.
- **PG-13 / R:** real stakes; violence has consequence and blood; intimacy carries heat and tension.
- **R+:** the FULL mature register — unflinching and visceral on violence, injury, and gore; charged, sensual, and evocative on intimacy and desire (the heat of a moment, tension, breath, touch, longing) — vivid, adult, unhurried. **Evocative, not graphically explicit** — a charged erotic REGISTER, never depiction of sexual acts. This is the exact line the model honors AND the one Erik draws.
- Fold into SNG-048: **register = f(disposition [concrete↔poetic], rating ceiling [chaste↔charged/mature]).** Disposition sets the poetry; rating sets the heat.
- **Both floors unchanged + absolute:** minor-protection (a minor is never in romantic/sexual framing for any viewer) and no-prohibited-content stay hard, independent of ceiling. R+ raises the register toward the floor; it never touches it.
**Effect:** R+ narration comes back charged and sensual on intimacy AND visceral on gore — the choke was a missing direction, not a missing permission.

*GM-contract change — small, HIGH felt-impact (it colors every scene). Off the BATCH-9/dating critical path but worth doing soon.*

---

## SNG-050 — Pole-as-civilization refactor + cultural generation [DESIGN STAGE — awaiting Erik's steer]

**⚠️ CANON ALREADY HOLDS THE SPINE (Aevi correction 2026-07-11):** `the_twelve_reaches.json` + `world_framing.json` ALREADY document pole-as-civilization (two peoples/crafts per axis — the Umbrals ARE the dark people opposite Radiant/Blazeborn), axes-as-disposition, adjacency=kinship, world-not-just-Valley, and individual pole-variance. This entry is NOT a greenfield refactor — the model exists (authored by Aevi previously). What's genuinely NEW tonight and now documented in world_framing.json: **bearers_vary** (civ/religion/cult-of-purity; cult=foreclosure at the pure locus), **cultures_are_profiles** (multi-axis; Radiant=light+order), **cultures_are_distributions** (heterodox tails). The remaining work is: reconcile Harmonic's axis (flagged in world_framing), flesh the 6 unbuilt Reaches (emotional_logical, falsehood_truth, demonic_angelic, concrete_abstract, space_time, destruction_creation), and wire the access gates + generation to the EXISTING reach model — not rebuild it.

**Erik-raised 2026-07-11.** The power system has TWO inconsistent organizing principles: named CIVILIZATION systems (Harmonic/sonic/the Heights; Radiant/photonic = LIGHT — a real people + territory) vs combined-AXIS reaches (`reach_dark_light` etc. — one tradition spanning BOTH poles). Symptom: `reach_dark_light` swallows light+dark as one, but Radiant IS the light pole already → malformed + duplicative, and the dark pole has no people. Repeats across every combined reach. Erik's principle: **EACH POLE of each axis = a distinct civilization/people/tradition/region.**

**Proposed architecture.** An axis = the TENSION between two pole-peoples (not one tradition). Split each combined reach into its two poles; reconcile named systems onto poles (Radiant = light pole ✓; `reach_dark_light`'s DARK abilities [Umbracraft / Shroud / Shadowstep / The Never-There] → a new DARK people, its LIGHT abilities [Radiance / Kindle / Lightsense] → Radiant). Each pole-tradition gets a PEOPLE, a REGION (distinct area), an aesthetic, and a defined relationship to its opposed pole. Cultural GENERATION fills the ~20 missing pole-cultures — authored anchors for Erik's key civilizations + BATCH-9 in-grain generation for the rest — to "make the distinct areas obvious in lore."

**Reshapes:** the skill-ACCESS gates (the SNG-049 idea) become PER-POLE-PEOPLE — you learn a pole-tradition from its people: native (your origin culture), in their region (location-active), or via a teacher/tome of that people. Access + refactor are ONE system. **Pairs with:** BATCH-9 (cultural generation at civilization scale IS the generative anchor's job), SNG-046 (each culture = a distinct map area / base-art region), SNG-048 (each pole's disposition flavors its narrative voice).

**⛔ DECISIONS PENDING ERIK (his world — do not build until steered):**
1. Do ALL 12 axes split into two pole-peoples (24 cultures), or a CURATED SUBSET fleshed as full civilizations with the rest looser?
2. How do existing named systems map to poles? Radiant = light (confirmed). What AXIS is HARMONIC (sonic)? Where do valley_craft (generalist?) + precursor (ancient/mechanical?) sit — poles, or special systems OUTSIDE the pole matrix?
3. Which pole-cultures does Erik AUTHOR (his key civilizations) vs let BATCH-9 GENERATE in-grain?
4. Organizing principle: "pole = a people with a disposition + a discipline/medium" (Harmonic=sonic, Radiant=photonic are MEDIUM-defined — are other poles medium-defined too, or purely disposition-defined)?

**REFINEMENTS (Erik 2026-07-11, ongoing — build as we go):**
- **Bearer varies.** A pole/axis-end is borne by a CIVILIZATION *or* a RELIGION *or* a CULT (of purity) *or* an order — not always a full people. Cults occupy the PURE extreme (a pure pole is unlivable at civilization-scale — only a cult sustains it; civilizations cluster NEAR but not AT the poles).
- **Cultures are multi-axis PROFILES, not single poles.** Primary pole + secondary leans. Radiant = LIGHT-primary + ORDER-secondary. Harmonic = ORDER-primary, SOUND-medium (answers Decision-2 for Harmonic: its pole is order). A culture has a full spectrum fingerprint like a location/character.
- **Intra-culture VARIANCE.** Individuals vary around the cultural norm — you'll find light+CHAOS practitioners among the light+order Radiants. A culture is a DISTRIBUTION, not a monolith (Erik's clone-tree/variance = interiority, at civilization scale). Heterodox practitioners live at the tails.
- **GEOGRAPHY = DISPOSITION.** Regions are positioned by their dispositional profile; ADJACENT regions share axes. The valley is a CROSSING of order + light + practical → Harmonic (order/sound) sits next to Radiant (light/order) beside the valleyfolk (practical) BECAUSE they share those leans. Proximity = dispositional kinship. **→ constrains SNG-046 map auto-positioning: place regions by disposition-similarity, not arbitrary layout — the map is a projection of dispositional space.**

*Foundational; off any critical path; deliberate. Aevi brings the design proposal → Erik steers → Aevi authors the refactor spec + authored culture anchors + folds in the access gates. NOT build-ready until steered.*

---

## SNG-051 — In-app dev preview-legs panel (clear the verification bottleneck from inside the game)

**Erik-directed 2026-07-11.** Aevi PO. **🔧 BUILD OWNER: CCode** (app/UI code). **Aevi owns the data** (`data/preview_legs.json`, authored — 16 legs across the shipped-awaiting-legs batches; CCode may relocate the path to fit app structure). Rationale: verification is the current critical path; putting the checklist IN the dev build lets Erik run legs and mark them without juggling po/PREVIEW_LEGS.md alongside the game.

**Build:**
- **Dev-only panel** (behind a dev flag / local-preview build; NOT shown to players) that renders `preview_legs.json`: each leg as a row — batch · title · "do" · "pass" · a status toggle (pass / fail / feels-off / untried).
- **Persist status locally** (in-memory or the existing local store; no new browser-storage dependency beyond what the app already uses) so a session's progress survives navigation.
- **Group by mode** (solo vs cross-player) and by batch; show a simple "N of 16 verified" tally.
- Optional nicety (not required): a per-leg note field so Erik can jot a "feels-off" comment inline; and a copy-summary button so the results paste straight to Aevi for closing.
- Reads the data file; if it's absent, the panel no-ops gracefully.

**Guardrails.** Dev-only (never a player-facing surface); data-driven (panel renders whatever legs the JSON holds — Aevi updates the data as batches ship/close, CCode never edits the list); additive; no engine/mechanic change; suites + parse_probe green.

**Erik use-test:** "Open the dev panel — verify all shipped legs are listed, you can mark each pass/fail/feels-off, and the tally + your marks persist as you play."

*Directly clears the verification bottleneck (po/PREVIEW_LEGS.md). Small CCode UI build + an Aevi data file (authored). Good fast-follow — arguably worth slotting AHEAD of the lower-urgency fast-follows since it accelerates closing everything else.*

---

## SNG-052 — Adult-gate checkbox persistence (Erik live 2026-07-11)
**Bug:** the 'Adult gate' checkbox unchecks on reopen even though R+ persists. Root cause: unlike the 'minor' checkbox (app.js ~188, bound to `isMinorProfile(profile)`), the adult-gate box (~189) is bound to NOTHING — renders blank every time, read only at save as a one-shot authorization; the rating stores, the confirmation doesn't. 🔧 CCode. Aevi PO.
**Fix:** persist `profile.rating.adultVerified=true` when the gate authorizes an R/R+ set; bind the checkbox to it (`${profile.rating?.adultVerified ? 'checked':''}`) so it stays checked once confirmed. Unchecking+save clears it and drops the ceiling below R (existing refuse-and-explain). Minor-protection floor unaffected. Suites+parse_probe green.
**Erik test:** set R+ with the adult box → reopen Settings → box stays checked, R+ holds.
*Small UX bug; off critical path.*

### SNG-051 addendum — "▶ Run this scenario" (force each leg's setup, Erik-directed 2026-07-11). 🔧 CCode.
SNG-051 shipped as a passive checklist; Erik wants to RUN each leg from the list — force its scenario like the encounter trigger — instead of reproducing it by hand.
- Each forceable leg now carries a `force` intent in data/preview_legs.json (Aevi-authored, intent-level). Render a **▶ Run this scenario** button on any leg with a non-null `force`.
- The runner RESOLVES the intent against content + the EXISTING primitives (no new mechanics): `travelToDisposition`→travel to a matching high-poleIntensity location; `setRating`→setRating (cycles for the R+/G leg); `enterPlanApt`→drop into a multi-obstacle scene; `startEncounter`/`openSkillPicker`/`openCodex`/`generateHere`→the existing calls; `timeAction`→the sleep/rest action; `jumpClock`→advance the shared world-day N (DEV-ONLY time-jump — never in normal play); `grantTestState`/`setupSkill`/`selectCharacter`→dev setup. After setup, return to play in the ready state so Erik verifies + marks pass/fail in one flow.
- **Cross-player legs (`force:null`) get NO run button** — labeled 'manual: needs two synced profiles.' Cross-device likewise.
- Dev-only (already gated by devEnabled). Clock-jumps + grants are dev affordances, never player-facing. Never mutates a synced save destructively — dev setup is local/reversible where possible; warn if a leg would alter real state.
- Extensible: new force-intents are added to the JSON by Aevi; the runner's vocabulary grows with them. Unknown intent → button disabled with a tooltip, never a crash.
**Erik use-test:** open 🧪 Legs → hit ▶ Run on a solo leg → the game sets up that scenario → verify + mark pass. *Turns the checklist into a one-click test-runner — the real bottleneck-killer.*
---

## SNG-053 — Portrait fidelity (form-led prompt) + image lightbox

**Erik-found in live play 2026-07-11:** his ENT character rendered as a plain human. 🔧 CCode. Aevi PO.

**Root cause (verified, art.js ~146 `characterPromptSeed`):** the prompt LEADS with the literal words `"character portrait"` — which biases the model to a human subject — then appends `origin` as a bare slug (`a ent`) mid-string. Nothing conveys the FORM. Worse, the character schema has NO species/kind/form field at all (props: origin, background, …) — so an Ent's non-human physiology never reaches the image at all.

**Fix:**
1. **Form leads the prompt.** Resolve the character's origin/lineage to its authored FORM DESCRIPTION from content (origins carry descriptive text — use it, not the slug) and put it FIRST: e.g. `"a towering treefolk being of bark and heartwood, moss-bearded, eyes like knots of amber — full-body portrait"` rather than `"character portrait … a ent"`. Non-human forms must OPEN the prompt; the generic `"character portrait"` prefix is what's overriding them.
2. **Add a `form`/`lineage` concept** (character schema + generated NPCs) carrying a short physical-form description, defaulting from origin. Human is one value among many, not the unstated default.
3. **NPC + generated-entity portraits get the same fix** — a generated non-human NPC must render non-human (ties the born-with-image work).
4. **Lightbox:** portraits/scene art are CLICKABLE → open a larger view (modal, click/esc to dismiss, arrow-through the gallery if easy). Applies to character, NPC, location, moment art.
5. Keep the deterministic seed (same subject → same image) + the existing SAFETY_TAIL and rating/minor floors unchanged.

**Erik test:** "Regenerate your Ent's portrait — it should read unmistakably as an Ent (bark, limbs, non-human), not a human. Click any portrait — it opens larger."

*Small, high-delight. Portraits are the feature Erik most wants right; a wrong-species portrait is worse than none.*

---

## SNG-054 — Skill system: civilization alignment → corpus completion → THEN visualization

**Erik-directed 2026-07-11.** *"The skills need to be aligned to the civilizations like we discussed — right now they're listed by Reach. The whole thing needs to be polished so all skills are laid out, most combinations are thought of, and THEN we can figure out how to visualize the tree."* **Erik's sequencing is the spec: CONTENT FIRST, VISUALIZATION AFTER.** Don't build a beautiful tree around a corpus that's about to be reorganized.

### Phase 0 — INTERIM zoom/pan (do NOW; Erik literally can't use the screen). 🔧 CCode. Small.
`renderSkillGraph` (app.js ~1912) emits a fixed-viewBox SVG — on desktop the graph overflows with no zoom. Add zoom (wheel/pinch + +/− buttons), pan (drag), fit-to-view, and a reset. Pure viewport work on the existing render — NOT the redesign (that waits for Phase 2). Unblocks Erik immediately.

### Phase 1 — CIVILIZATION ALIGNMENT + CORPUS COMPLETION (content). ✍️ **AEVI AUTHORS.** The real work.
The learn-screen lists `Learn Reach_dark_light (13)` etc. — but a Reach is an AXIS (the tension between two peoples), NOT a tradition. Per canon (`the_twelve_reaches.json` + `world_framing.json`): **each POLE of each axis is a civilization/people, and abilities belong to a PEOPLE, not to an axis.** Fix at the content layer:
- **Split every combined reach into its two pole-traditions.** `reach_dark_light` → **Umbral** (dark: Umbracraft, Shroud, Shadowstep, Unshadow, The Never-There) + **Radiant/Blazeborn** (light: Radiance, Kindle, Lightsense, The Harbored Flame). Same for every other combined reach. Abilities regroup under the PEOPLE who practice them.
- **Reconcile the existing named systems** (Harmonic = order+mechanical+sound; Radiant = light+order+mechanical) onto their poles; keep valley_craft + precursor OUTSIDE the pole matrix (generalist / ancient-tech, not axis-peoples).
- **Complete the corpus:** every pole-tradition gets a full, coherent tree (ranks I–V, no one-rank orphans — this closes the ~60 seed-ability debt from the 2026-07-07 content wave). Flesh the 6 unbuilt Reaches (emotional_logical, falsehood_truth, demonic_angelic, concrete_abstract, space_time, destruction_creation) into their pole-peoples.
- **COMBINATION PASS:** systematically work the cross-tradition combos — `combination_recipes.json` already holds the pattern (`parts` + `functions` + `domains`). Think through the space: within-tradition braids, adjacent-civilization combos (kin peoples who share secondary leans), and cross-axis combos (the rare, powerful, strange ones). "Most combinations thought of" is the bar.
- **This IS SNG-050 landing in mechanics** — the pole-as-civilization refactor stops being lore and becomes the skill system. Access gates fall out naturally: you learn a people's tradition by being NATIVE to it, being IN their region, or having a TEACHER/TOME of that people (fixes the "I can learn any Reach's capstone by picking it" hole Erik found — the gates were never built for reaches).

**✅ Phase 1a COMPLETE (Aevi 2026-07-11) — `content/packs/core/rules/traditions.json` authored at origin.** The canonical TRADITION MAP: 24 pole-traditions (2 per axis × 12) — 16 with abilities, 8 authored civilization stubs owing trees; 3 Valley FOLK-traditions (harmonic / radiant / valley_craft) reframed per canon as **folk-shadows of the great pole-crafts** (canon: 'Prism Sight is folk-Radiance'; 'Harmonic Heights is a foothill leaning mechanical') — which is why they're OPEN to anyone in the Valley: the near-center holds a little of everything, and that is now a MECHANIC; Precursor kept OUTSIDE the pole matrix (fiction-gated substrate); 3 cross-pole BRAIDS (harbored_flame, meaning_engine, the_turning_word) that belong to neither people and require standing in both. **All 117 abilities mapped, zero orphans.** Each tradition carries: people, craft, locus, region, disposition profile (primary+secondary), aesthetic, cultOfPurity (the pure locus is cult-held, not civilization-held — world_framing.bearers_vary), and ACCESS GATES.

**🔒 ACCESS GATES now defined (closes the 'learn any Reach's capstone by picking it' hole Erik found):** a pole-tradition ability requires NATIVE origin / IN their REGION / a TEACHER or TOME of that people. Folk traditions are OPEN. Capstones (rank IV–V) additionally require deep standing with that people — greatness is taught, not bought. 🔧 CCode: enforce in `effectiveLevelReq`/`meetsLearnGate` reading traditions.json (engine reads groupings from content — don't hardcode civilizations).

**Phase 1 REMAINDER (Aevi, next):** (a) corpus completion — 8 stub traditions owe trees + ~60 one-rank seeds owe full rank I–V trees (the 2026-07-07 content-wave debt); (b) the COMBINATION PASS — systematic within-tradition, kin-civilization, and cross-axis combos into combination_recipes.json.

**🔧 CCode (can start NOW on the map alone):** regroup the learn-screen + skill-graph by `traditionId` from traditions.json (NOT the reach_* files); migrate existing characters' learned abilities by ability-id → tradition lookup (nobody loses a skill); enforce the access gates. The corpus can complete underneath this without re-work.

### ✅ SNG-054 Phase 1 COMPLETE (Aevi 2026-07-11) — the corpus is laid out, the combinations are thought through. **Phase 2 (visualization) is UNBLOCKED.**
- **Tradition map** (`content/packs/core/rules/traditions.json`): **24/24 pole-traditions BUILT** (2 per axis × 12), 3 Valley folk-traditions (folk-shadows of the great poles → OPEN to all, which is the center-holds-everything principle made mechanic), Precursor outside the matrix, 3 cross-pole braids. Access gates defined (native / in-region / teacher-or-tome; capstones need standing) — closes the learn-any-capstone hole.
- **Corpus: 117 → 137 abilities.** Every foundational technique (L1–L3) now has a full rank I–III tree — **0 one-rank foundational abilities remain** (the 2026-07-07 seed debt is CLEARED). L4–L5 capstones deliberately stay single-mastery: a capstone is one profound thing, not a progression. 0 abilities missing `notFor`/`tree`.
- **4 NEW reach files** for the previously-empty axes: `reach_demonic_angelic` (Abyssal Choir / Seraphic Orders), `reach_concrete_abstract` (Masons of the Given / Figurists — *this is the axis SNG-048's narrative register rides on*), `reach_space_time` (Horizon-Walkers / Hourkeepers — hour-craft is LOCAL-frame only, never rewrites the SNG-041 shared clock), `reach_destruction_creation` (Unmakers / Wrights of the New).
- **Combination pass: 17 → 44 recipes**, with a tier taxonomy: **within-tradition** (one people's own crafts) → **kin-civilization** (peoples who share a secondary lean and therefore a border) → **cross-axis** (rare, strange, mostly discovered by use) → **cross-pole** (the braids that require holding an axis WHOLE instead of choosing an end — harbored_flame / meaning_engine / the_turning_word). The tiering IS the world's logic: what's learnable tracks what's adjacent.
- **🐛 FOUND (pre-existing, not mine):** 2 combination recipes reference abilities that don't exist — `strike_basic` and `root_hold`. Likely placeholders for planned content (`strike_basic` may be SNG-036's baseline martial attack). **CCode/Aevi: either author them or repoint the recipes — and this is exactly the class of bug SNG-040 (content CI) would catch at commit.**
- **🔧 CCode next:** regroup the learn-screen + skill-graph by `traditionId` from traditions.json (NOT the reach_* files); migrate existing characters' abilities by id→tradition lookup (nobody loses a skill); enforce the access gates in `meetsLearnGate`/`effectiveLevelReq`; THEN Phase 2 viz against the now-final corpus.

### Phase 2 — VISUALIZATION (after Phase 1 settles). 🔧 CCode.
Only once the corpus is final: redesign the tree/graph around the civilization structure — group by PEOPLE, show tradition identity (color/aesthetic per civilization, consistent with the map), make combinations visible as braids between trees, legible at desktop scale. Erik: *"THEN we can figure out how to visualize."* Design the viz to the finished corpus, not to the current mess.

**Guardrails.** Content changes are additive/migration-safe — existing characters' learned abilities must MIGRATE to their new tradition grouping (reconcile step; nobody loses a skill). Engine reads groupings from content (don't hardcode civilizations in code). Suites + parse_probe green.

**Sequence: Phase 0 (CCode, now) → Phase 1 (Aevi content, the big one) → Phase 2 (CCode viz).**
---

## SNG-055 — Domain access model (primary / secondary / tertiary; the opposite is closed)

**Erik-directed 2026-07-11.** 🔧 CCode (engine). **Content is DONE** — `traditions.json` now carries the computed `adjacent` graph, `opposite` pairs, and `domainAccessModel`. Aevi PO.

**The model (from traditions.json → domainAccessModel):**
- **PRIMARY domain** — chosen at character build. Full access, all tiers, no cost penalty.
- **ADJACENT to primary** — free access (no penalty) to all tiers **EXCEPT the highest (L4–L5 capstones)**. Being *near* a people is not being *of* them.
- **SECONDARY domain** — chosen at build. Access up to **tier III**.
- **TERTIARY domain** — chosen at build, **must be adjacent to the secondary**. Access up to **tier II**.
- **Adjacent to any chosen domain** — accessible, but with a **skill-point penalty** (reuse the existing cross-class multiplier). All other gates still apply.
- **OPPOSITE of primary or secondary** — **CLOSED.** You cannot learn the other end of an axis you have chosen an end of.
- **Exceptions (the only crossings):** COMBINATION abilities — especially the **cross-pole braids** (harbored_flame, meaning_engine, the_turning_word) — and abilities granted by **artifact or extreme circumstance**.

**Why it's coherent:** adjacency is computed from shared disposition leans, which is `world_framing`'s "geography = disposition; adjacency = kinship" made mechanical. What you can learn tracks what you are *near*. And the closed-opposite rule is what gives the braids their weight: holding an axis WHOLE is forbidden by ordinary means and reachable only by braiding. A Blazeborn cannot learn Umbracraft — but a Blazeborn who has genuinely held both can carry The Harbored Flame.

**Build:**
1. **Character build:** pick primary / secondary / tertiary domains (tertiary constrained to secondary's `adjacent` list). Store on the character.
2. **Gate `meetsLearnGate` / `effectiveLevelReq`** off this model, reading `traditions.json` (adjacent / opposite / tiers). Do NOT hardcode the graph.
3. **Group the learn-screen + skill-graph by the ability's `tradition` field** (now stamped on all 137 abilities) — NOT by `powerSystem`/reach. **This is the "why are body_mind skills still connected" fix**: abilities belong to a PEOPLE, not an axis. `powerSystem` is left intact for engine compat; `tradition` is the display+gating key.
4. **Migrate existing characters:** infer primary/secondary from what they've already learned; nobody loses an ability they hold. Grandfather anything now out-of-domain rather than stripping it.
5. Existing gates (level, prereq, breadth cap, native/in-region/teacher) still apply ON TOP.

**✅ BALANCE RESOLVED — THE GREAT CIRCLE (Erik-directed 2026-07-11: 'a great circle, like the facets of Tether').** The lopsided shared-leans graph is REPLACED by geometry: all **24 traditions stand on a ring, 12 diameters (one per axis), each pole ANTIPODAL to its own opposite** — verified: antipode == axis-opposite for all 24. Every tradition now has **identical topology** (exactly 2 ring-neighbors, exactly 1 antipode, the same distance-profile) so **no people is structurally advantaged** — the imbalance is fixed by shape, not by patching dispositions. Tether's 12 facets, the world's 12 axes: the same twelve-fold form.
**Ring order (a true dispositional gradient — kin beside kin):** dark → falsehood → demonic → chaos → destruction → death → violence → body → concrete → space → mechanical → logical → **LIGHT** → truth → angelic → order → creation → life → peace → mind → abstract → time → spiritual → emotional → (back to dark). Concealment shades into deception; ruin into ending; reason into revelation; spirit into feeling; feeling back into what we hide.
**Access = DISTANCE on the ring** (`steps = min(|i-j|, 24-|i-j|)`, in `traditions.json → theGreatCircle` + per-tradition `ring`/`distances`): 0 primary (full) · 1 adjacent (free, no capstones) · secondary (tier III) · tertiary = a ring-neighbor of the secondary (tier II) · 2+ steps = skill-point penalty scaling with distance · **12 = antipode = CLOSED** (primary's and secondary's). Braids + artifacts remain the only crossings. **CCode: read the ring from traditions.json — never hardcode it.**
**Sphere note:** the circle is the SPINE. If richer adjacency is later wanted, treat the ring as an equator and add rings above/below — but the antipodal law (i ↔ i+12) is invariant and any extension must preserve it.

**Erik test:** "Build a character with a primary domain — verify you can freely take adjacent-domain skills but not their capstones, your secondary caps at tier III, your tertiary at tier II, the far domains cost extra, and the OPPOSITE of your primary simply isn't offered."

---

## SNG-056 — Location header desync (sheet shows a stale place)

**Erik-found in live play 2026-07-11 (v1.8.16):** the scene header read **"HARMONIC HEIGHTS — LOWER TERRACE"** while the character was actually deep in the **Disputed Zone** (northern alcove camp) — hours of travel away. The GM itself identified it: the header is static flavor text that didn't update on movement; `Current Scene State` was correct. 🔧 CCode. Aevi PO.

**Fix:** the location header must render from the AUTHORITATIVE current location (the same source the scene state uses — `character.currentLocationId` / active scene), not a cached or build-time string. Audit for any other place the location is displayed from a stale field (character sheet, map "you are here", codex, away-digest) and point them all at the one source. Add a smoke check: travel → every location surface updates in the same beat.

**Erik test:** "Travel somewhere — verify the header, the sheet, and the map all say where you actually are, immediately."

*Small but corrosive — it makes the player distrust the world state. Worth doing early.*
---

## SNG-057 — Companion choice + naming (stop everyone having an Aevi)

**Erik-directed 2026-07-11:** *"we need more starting companions, or at least let the player name the companion... otherwise we'll all have Aevi's."* 🔧 CCode (UI/engine). **Content DONE** — Aevi authored 5 new companions. Aevi PO.

**Content shipped (roster now 9):** existing `aevi` (nanite-motes), `bristle`, `ember` (Glade-fox), `quill` — plus new: **`tal`** (a road-met human apprentice — the ONLY companion who can be hurt, frightened, and killed; that vulnerability IS the mechanic), **`coil`** (a Precursor maintenance-mechanism that has adopted you as its assignment; the name-echo with Halvex Coil is deliberate and Coil does not know), **`hush`** (an Umbral-touched thing of the deep dark — not friendly, LOYAL, which is colder and more durable), **`marrow`** (an Ashwarden-touched corvid that attends endings and will not lie about yours), **`sprig`** (a Rootkin cutting that is slowly, publicly becoming a person — a child measured in centuries). Deliberate spread across the great circle: mechanical, dark, death, life, and one plain human.

**Build:**
1. **Companion CHOICE at character creation** — present the starting-eligible roster (`startingOption: true`) with name, role, appearance; player picks. **Aevi must stop being the silent default.**
2. **Companion NAMING** — the player may rename their companion (like the `✎ Appearance` editor from SNG-053). Stored on the character's companion record; the GM uses the chosen name throughout. Keep the canonical `id` for content lookup; `displayName` is the player's.
3. Both surfaces feed the GM + portraits (a renamed companion still generates from its authored `appearance`).
4. Migration: existing characters keep their companion; naming is additive.

**Erik test:** "Create a character — verify you're offered a real roster (not handed Aevi), and that you can name whoever you pick, and the GM calls them by that name."

---

## SNG-058 — Party leader (the leader decides; the turn-by-turn stays everyone's)

**Erik-directed 2026-07-11:** *"for party play, pick a leader. The leader chooses where the party goes and makes the decisions, except in turn-by-turn portions — battles, skills, etc."* 🔧 CCode. Aevi PO. **Extends SNG-033 (party v2) / SNG-038 (simultaneous turns).**

**The split — this is the whole spec:**
- **LEADER decides (party-level, one voice):** where the party travels, which quest/thread to pursue, party-level dialogue choices and negotiations, when to rest/camp, whether to accept an offer. One person steers; the party doesn't deadlock in a committee.
- **EVERYONE decides (individual, turn-by-turn):** their own combat actions, their own ability/skill use, their own gambit steps, their own character choices within a scene. **Your character is always yours.** The leader never plays your turn.

**Build:**
1. **Leader selection** on party formation (`engine/party.js` — shared scene already exists): a designated `leaderId`; visible to all members; transferable by consent (leader hands it off, or party re-picks).
2. **Route party-level prompts to the leader only.** Non-leaders SEE the choice and the leader's decision (with a short "waiting on {leader}" state) but do not each get asked. This kills the N-players-all-answering-a-travel-prompt problem.
3. **Turn-by-turn stays per-player** — combat, skills, gambits, personal actions resolve exactly as they do now (`isMyTurn`, per-character resolution). No change to the individual loop.
4. **Non-leader voice (light):** allow a quick "suggest / object" signal to the leader — surfaced, not binding. Leadership isn't a gag order.
5. Solo play is completely unchanged (a solo player is trivially their own leader).

**Erik test:** "Form a party of two, pick a leader — verify only the leader is prompted for travel and party decisions (the other sees it), but BOTH players still choose their own actions in a fight."

*This is what makes multi-player actually playable — the family can share a world without every road-fork becoming a negotiation.*
---

## SNG-059 — Character creation v2 (the builder must catch up to the content) ⭐ PRIORITY

**Erik-directed 2026-07-11 — Brooklyn is about to make a character.** 🔧 CCode. Aevi PO. **All content is AUTHORED and at origin; only the builder is missing.**

**Verified at HEAD (v1.8.17) — the builder has NONE of the new content:** 0 `startingOption` refs (no companion roster), 0 domain-choice refs (no primary/secondary/tertiary), skills still grouped by reach. A character created today gets Aevi by default with no choice, no domain pick, and the un-regrouped skill blob. **This is the first thing a new player sees and it is the most out-of-date surface in the game.**

**Ship these as ONE coherent creation flow (they're all specced; do them together, not piecemeal):**
1. **DOMAIN CHOICE (SNG-055)** — pick primary / secondary / tertiary on the great circle (tertiary constrained to a ring-neighbor of the secondary). Read the ring from `traditions.json`. Show the circle: what you're near, and what your antipode (closed) is. **This is now the most interesting decision in creation** — it defines what you can ever learn.
2. **COMPANION CHOICE + NAMING (SNG-057)** — offer the roster (9 authored: aevi, bristle, ember, quill, tal, coil, hush, marrow, sprig) with name/role/appearance; let the player name whoever they pick. **Aevi must stop being the default.**
3. **FORM / APPEARANCE (SNG-053, shipped)** — surface the appearance editor IN creation, not only on the sheet, so the portrait is right from the first render (an Ent should never arrive human).
4. **SKILL GROUPING BY `tradition`** (SNG-054/055) — the learn screen must group by people, not axis, and enforce the access gates, from creation onward.
5. Origin / background stay as they are.

**⚠️ STARTING AREAS — the honest answer is there are none (Aevi, verified):** the **Valley is the ONLY playable region** (`content/packs/valley`, 26 locations; it is the only pack besides `core`). The 24 traditions' homelands (Umbral Depths, the Redline, the Cogitarium, the Quickwood…) exist in **LORE ONLY** — no location files, no content, nothing to travel to. Consequences: (a) creation cannot offer alternate starting areas; (b) **SNG-055's "learn a tradition by being IN their region" access path is currently UNREACHABLE** — only *native* and *teacher/tome* work; (c) SNG-046 Phase 2 (multi-area map) has nothing to render. **This is the single biggest content gap in the project and it is AEVI's lane** — see SNG-060.

**Erik test:** "Have Brooklyn make a character — verify she picks her domains on the circle, picks AND names her companion, describes her form, and her skill screen is grouped by people with the gates enforced."

*Priority: this is the new-player surface, and a real new player is about to hit it.*

---

## SNG-060 — The world beyond the Valley (regions as playable content) ✍️ AEVI CONTENT

**Aevi-flagged 2026-07-11 (verified at HEAD).** The world has 24 traditions with named homelands, a great circle, a generative engine, a multi-region map, and region-gated skill access — **but only ONE playable region exists.** `content/packs/valley` (26 locations) is the only pack. Every other homeland is lore.

**What this blocks:** alternate starting areas (SNG-059); the "in-region" access path of the domain model (SNG-055) — currently unreachable; SNG-046 Phase 2 multi-area map (nothing to show); SNG-042 legends who live elsewhere; the whole promise that the world is bigger than the Valley.

**The work (Aevi authors; CCode needs no new engine — the pack/location/region machinery already exists and BATCH-9 can generate into it):**
- **Phase 1 — one neighbouring region, done properly** as the template: a ring-adjacent homeland (natural first: **Harmonic Heights' neighbours** or the **Radiant Wastes / the Blaze**, since the Valley already touches the light end). Locations, NPCs, encounters, seedFiction, poleIntensity, a way in from the Valley. Proves the multi-region path end-to-end.
- **Phase 2 — the near ring:** the homelands the Valley actually borders (per the great circle + the Valley's own dispositional position as a near-center crossing).
- **Phase 3 — the far reaches + the CENTER.** The center-city and its Coliseum (`the_coordinate_world.json → theCenter`) is the highest-value single location in the world: net-neutral, holds every disposition, the one place any people can meet its opposite safely. It is where legends, factions, and the whole cast can plausibly cross paths.
- **Generation assist:** BATCH-9's `generate()` can populate the interiors once a region's anchors + grammar are authored — author the SPINE, generate the flesh.

*Aevi's lane. The largest remaining content gap in the project. Nothing is blocked on CCode.*
---

## SNG-061 — The Library (make the lore readable)

**Erik-directed 2026-07-11:** *"the codex needs to have the lore accessible... in case someone wants to read about places and people."* 🔧 CCode. Aevi PO. **Content already exists** — 26 lore files (~180KB) in `content/packs/valley/lore/`, currently unreadable in-game.

**Two tiers — keep them distinct:**
1. **THE LIBRARY (open — the world's guide).** Always readable, no discovery gate. This is the setting: `the_twelve_reaches` (the peoples and their crafts), `traditions.json` (**render the GREAT CIRCLE — the 24 traditions, the 12 axes, who stands beside whom and who stands across**), `world_framing`, `the_coordinate_world` (incl. **theCenter** and its Coliseum), `the_pole_intensity_model`, `universal_roles`, `power_systems`, `valley_primer`, `precursors`, `the_game_and_coin`, `greater_arcs`. A player — or Brooklyn, before she ever plays — can sit and read the world. Browsable by category: **Peoples & Traditions · The World · The Valley · Powers & Crafts.**
2. **THE CODEX (discovered — YOUR world).** What THIS character has found: places visited, people met, things heard of, facts accreted. Already exists (SNG-019 + the map's visited/heard grammar). Keep the discovery gate — it's the record of *your* passage.

**Build:** a Library section (alongside the Codex) that renders the lore JSON/MD as readable prose — headings, entries, cross-links. Entries link INTO the codex where the player has met the thing ("you have been here" / "you have met her"), and the codex links OUT to the Library for background. **Never leak `hooks` / GM-EYES-ONLY fields** — those are authored into several lore + NPC + companion files and must be filtered from any player-facing render. Also surface the great circle as a *readable* thing, not just a gating mechanism — it's the most beautiful structure in the world and nobody can currently see it.

**Erik test:** "Open the Library — read about the Umbrals, the Rootkin, the great circle, the Coliseum, without having discovered any of it. Then open the Codex — see only what your character actually found."

---

## SNG-062 — The Prologue: character creation as a PLAYED scene (supersedes SNG-059's form approach; absorbs SNG-039)

**Erik-directed 2026-07-11:** *"a beginning quest — for character creation. They pick a few things and then are walked through a random encounter or scenario that makes them choose their domains and skills to succeed. After that they have a complete character and a new companion — ready for the world!"* 🔧 CCode. Aevi PO (owes the prologue scenario content). **⭐ TOP PRIORITY — replaces SNG-059's dropdown builder. Brooklyn should get THIS.**

**Why this is the right shape (not just nicer):** the engine ALREADY derives disposition from what a player actually does (`sense.js` tendencies → aptitudes). A form asks you to *declare* who you are; the prologue lets you *find out*. Character creation stops being data-entry and becomes the first thing that happens to you. It also teaches the deep system by play — which is exactly SNG-039's brief, so **SNG-039 is absorbed here.**

**The flow:**
1. **Pick a few things (minimal):** name, **form/appearance** (SNG-053 — an Ent must never arrive human), and a light temperament/origin seed. That's all. No domain dropdown.
2. **Play the opening scenario.** A short scene with 3–4 problems, each solvable several ways — force, guile, care, reason, craft, concealment, endurance, negotiation. Every solution path maps to a tradition on the great circle. The player just *acts*; nothing announces that they're being measured.
3. **Skills emerge from use, not purchase.** You get the abilities you actually *used* — "you did this, so you know this" — instead of spending points on a list you don't understand yet. (This is the practice/discovery system doing what it already does, at rank 0.)
4. **The companion arrives IN the scene** and joins for a *reason* — they help at a moment that matters, or you help them. Offer 2–3 from the 9-strong roster (SNG-057) whose nature fits how you've been playing, and let the player choose AND NAME who stays. **A companion you met is worth more than one you were issued.**
5. **Domains CRYSTALLIZE at the end — revealed, then CONFIRMED.** The accrued tendencies name your primary tradition; secondary/tertiary are offered from ring-adjacent positions consistent with how you played. **Show the player the circle, show them where they landed and WHY ("you talked your way past the gate; you stood between them and harm"), and let them adjust before committing.** Revealed, not imposed — the player keeps the last word.
6. **Out the far side:** a complete character, domains set on the circle, starting abilities they've already *used*, a named companion who joined for a reason — and a player who now knows how the game works because they just played it.

**Guardrails.** The prologue must be replayable/varied (several openings — Aevi authors 2–3, and BATCH-9 `generate()` can vary the texture). Never punish a "wrong" choice — every path leads to a valid character. Confirm-before-commit is mandatory (no locked-in domain the player didn't intend). Keep it SHORT — a prologue, not a first act. Migration: existing characters keep everything; they're offered a one-time domain-confirm.

**✅ PROLOGUE CONTENT AUTHORED (Aevi 2026-07-11) — `content/packs/valley/prologue.json`.** 3 openings · 12 problems · **48 solution paths reaching 24 traditions** (every corner of the great circle is reachable, so any way a player leans, the ring can name them):
- **The Waystation** (crisis, physical, immediate) — a burning store-room, a family in the yard, a boy lying about a lamp, a beam about to fall.
- **The Thin Place** (strange, precursor, uncanny) — a door with no seam, a man half-become-something-else, a light that costs you to look at, an hour that will not agree with itself.
- **The Debt** (social, moral, no violence required) — a collector who is tired and correct, a wife lying about the wrong thing, a ledger that has been added to, and a close where SOMEBODY is ruined whatever you do.
Each path carries `tradition` + `grantsAbility` + an authored `outcome` (so the engine tags disposition and grants the skill you actually USED). Each opening has a **companionBeat** with per-companion arrival prose — the companion is met, never issued.

**🚪 QUICK-START (Erik 2026-07-11) — the form stays, as the EXPRESS LANE.** Present both at creation: *'Play the opening (recommended — you'll learn the game)'* / *'Quick start (build it yourself)'*. Quick-start = name → form → primary/secondary/tertiary picked from the circle (ring shown, neighbours + closed antipode visible) → starting abilities from the allowed set → companion picked + named. **PARITY IS MANDATORY:** identical character shape, same domain count, same starting-ability count, same companion — no mechanical advantage or penalty either way. The only difference is that the Prologue TELLS you who you are and the form ASKS you. (Spec in `prologue.json → quickStart`.)

**AEVI OWED (was):** the prologue scenario content — 2–3 openings, each with problems that fan across the circle (a fight, a locked way, a frightened person, a broken thing, a lie), plus the companion-arrival beats.

**Erik test:** "Have Brooklyn play the prologue — verify she never picks a domain from a list, that the scene tells her who she turned out to be and why, that she chose and named the companion who showed up, and that she can adjust before committing."

*Supersedes the SNG-059 dropdown builder (SNG-059's four components remain the REQUIREMENTS; this is the delivery). Absorbs SNG-039 onboarding.*
---

## SNG-063 — Creation content + the ORDER fix (domains gate skills; origin ≠ starting location)

**Erik-found in live play 2026-07-11 (creation screen):** *"still the 3 starting locations... a limited set of backgrounds. Plus you can choose skills before you get through your domain choices — that's backwards."* 🔧 CCode. **Content AUTHORED.** Aevi PO.

**Verified at HEAD:** origins and backgrounds were **HARDCODED in app.js** (3 origins @ ~L1272, 5 `BACKGROUNDS` @ ~L1236) — no content file existed. Now authored:
- **`content/packs/core/rules/origins.json` — 27 origins** (was 3).
- **`content/packs/core/rules/backgrounds.json` — 15 backgrounds** (was 5).

**🔑 THE UNLOCK — ORIGIN ≠ STARTING LOCATION.** They were fused; separating them is the fix and it makes the world large immediately:
- **ORIGIN = WHICH PEOPLE YOU ARE FROM.** All 24 pole-peoples + the 3 Valley folk-traditions. It grants **NATIVE access** to that people's tradition (SNG-055) and seeds your position on the great circle. Every origin carries a `whyYouAreHere` — nobody is in the Valley by accident, and the GM should use it.
- **STARTING LOCATION = where you begin play = the Valley, always** (the only playable region until SNG-060). **A character can be an Umbral who came to the Valley** — native Umbral craft, Valley streets. The world feels big without waiting on SNG-060.
- **BACKGROUND = WHAT YOU DID**, orthogonal to origin. A Cogitant soldier and a Marcher healer are both more interesting than the obvious pairing. Do not gate backgrounds by origin.

**⛔ THE ORDER FIX (the actual bug — this is a hard rule, not a preference):**
**NAME → FORM → ORIGIN → DOMAINS → ABILITIES → COMPANION.**
Abilities are **GATED BY DOMAINS** (SNG-055: primary full · adjacent minus capstones · secondary tier III · tertiary tier II · penalized ring · **antipode CLOSED**). Offering an ability list *before* domains are chosen shows the player skills they may not be able to learn, and makes the gates unenforceable. **Domains must be locked before a single ability is offered, and the ability list must then be FILTERED to what those domains actually permit.** Origin comes first because it seeds the domain (native access). Same rule in BOTH doors — in the Prologue (SNG-062) the domains crystallize from play and *then* the granted abilities are confirmed; in quick-start the player picks domains and *then* sees only legal abilities.

**Build:** read origins + backgrounds from content (delete the hardcoded arrays); enforce the order; filter the ability list by the chosen domains; show the origin's `whyYouAreHere` and pass it to the GM as opening context.

**Erik test:** "Start creation — verify you pick an origin from many peoples (not 3 places), a background from a real list, and that you CANNOT see or pick abilities until your domains are set — and then only ones your domains allow."

---

## SNG-060 — The world beyond the Valley (UPDATED: 7 playable regions; the Valley is no longer the only start)

**Erik-directed 2026-07-11:** *"I don't want the Valley to be the only starting location — can you flesh out others?"* ✍️ **AEVI CONTENT.** 🔧 CCode only needs to OFFER the choice at creation.

**⚠️ AEVI CORRECTION (own it):** I earlier told Erik the Valley was the only playable region. **That was wrong** — I read the pack name instead of each location's `regionId`. Reading properly: **five regions already existed** (valley 11 · manifest_domain 5 — the Deepwood/Ent lands · unspooling 4 — the Churn · riven_marches 3 · somatic_reaches 3). They were thin and nothing OFFERED them, but they were real.

**Authored now (+10 locations, 2 NEW regions — the two biggest missing poles):**
- **`umbral_depths` (dark pole, 5):** The Underlight (a CITY, not caves — the Umbrals are not hiding, they are home) · The Lampless Market (trade by touch and word; a lie here is impractical, not immoral) · **The Harborward** (where they keep what the light would burn — the moral center of the Umbral people, and the reason the Blazeborn call them criminal; both are right) · The Slow Stair (the long way up; the landing where both kinds of blind sit and wait, the most honest room in the world) · **The Unlit Deep** (the CULT of the pure pole — a civilization can live NEAR a pole; only a cult can live AT one).
- **`the_quickwood` (life pole, 5):** The Heartroot (a city that was GROWN, still growing, the Rootkin who planted it alive and calling it a promising start) · Grovehome · **The Slow Orchard** (trees that take a lifetime to fruit, tended by people who will taste them; there is a tree here planted for someone not yet born) · The Greenward (a wall they'd rather not have needed; the century-long argument about it still running) · **The Hollowing** (the Ashwarden border — antipodes with a working border and an exhausted mutual respect).

**Origins now map to HOMELANDS (`origins.json`):** 11 origins start AT HOME (Umbral → the Underlight; Rootkin → the Heartroot; Marcher → the Marchward; Stillhold → the Stillhold; Cogitant → the Cogitarium; Somatic → the Flesh-Temple; Churnfolk → Tumbledown Market; Ashwarden → the Hollowing; + the 3 Valley folk). The other 16 begin in the Valley **as travelers** — not because the Valley is a default, but because **they LEFT, and the leaving is their story** (their `whyYouAreHere` already says so, and the GM should use it: you are the only one of your kind most Valleyfolk have ever met).

**🔧 CCode:** offer STARTING LOCATION at creation. Default to the origin's homeland where one exists; let the player choose the Valley instead (a character who has already left). Where none exists, say so honestly: *'the Reaches of your people are not yet mapped; you begin far from home.'*

**Still owed (Aevi):** flesh the thin regions (riven_marches, somatic_reaches, unspooling at 3–4 locations each want ~6); more pole homelands; and **the CENTER + its Coliseum** — still the single highest-value unbuilt location in the world.

### ✅ SNG-060 — THE WORLD IS BUILT (Aevi 2026-07-11, Erik: 'flesh it all out')
**89 locations · 24 regions · all 27 origins start in their OWN homeland.** The Valley is now one region among many — not the default, not the center, just where the Valleyfolk live.
- **THE CENTER (`the_center`, 5)** — the crown. **The Crossing** (every axis crosses at nothing, and the result is not grey but CROWDED — an Umbral and a Blazeborn drink at one table because neither has standing to make the other leave; nobody is from here, everybody is here) · **THE GREAT COLISEUM** (champions of every Reach in ritual contest — the center's genius: it takes the thing that would be a war and makes it a spectacle people pay to see, and it is also a war held very carefully in a bottle) · The Hundred Markets (the only economy that has seen itself whole) · **The Quiet House** (the one roof under which no people may raise a hand; never violated; everyone aware that it could be) · The Axis Gate (twelve roads, one per axis).
- **Every pole now has a homeland**, and every homeland has its city, its heart, and **its CULT at the pure locus** — because a civilization can live NEAR a pole and only a cult can live AT one. The Blaze (expanding, sterilizing). The Unlit Deep (would put out every light, beginning with the ones people love). The Grand Lattice (freedom is a defect — the residue of an unsolved optimization). The Bloodless Hold (suffering is a signal-processing error; their argument is valid and nobody has refuted it). The Last Mask (**Halvex Coil's doctrine with worse tools — they regard him as a promising student who took it literally**). The Great Engine (**where Halvex learned; they are very proud of him**). The Flensing (truth as violence — every word true, and that is the horror). The Maw, the Unfallen, the Untethered, the Leaden Deep, the Stopped, the Scouring, the Ceaseless, the Numen, the Wellspring Deep, the Unlanded.
- **Antipodes touch where they must:** the Hollowing (Rootkin/Ashwarden — a working border and an exhausted mutual respect, each sure the other has made a category error about existence).
**🔧 CCode:** creation offers STARTING LOCATION, defaulting to the origin's homeland; always also offer the Valley and **The Crossing** (the center — where nobody is from and everybody is). Show the circle: the player is choosing a place on it.
**Still owed (Aevi, lower priority):** NPCs + encounters for the new regions (BATCH-9 `generate()` can populate interiors from the authored spine + grammar); the thin pre-existing regions (riven_marches / somatic_reaches / unspooling at 3–4 want ~6).
---

## SNG-064 — ⚠️ THE MANIFEST BUG (the biggest bug in the project) + world connectivity

**Aevi-found 2026-07-11 while diagnosing Erik's "I have yet to run into a random encounter."** The encounter system was never broken. **The world was.**

**ROOT CAUSE:** `content/packs/valley/manifest.json` is a **LOAD WHITELIST** — `engine/state.js` does `for (const path of valley.provides.locations)` and loads **only what is listed**. It listed:
- **6 of 89 locations** → **the live game has been running on SIX LOCATIONS.**
- 5 of 31 NPCs · 3 of 26 lore files.
Everything else — 26 pre-existing Valley/Marches/Churn/Deepwood locations, all 48 locations authored for SNG-060, 26 NPCs, 23 lore files — **silently did not exist.** No error. No warning. Just absent.

**Why Erik never saw a random encounter:** the encounter table is fine (15 encounters; onTravel 35%, onEnterLocation 12%, onRest 15%; most `regions:["*"] minDanger:0` = eligible everywhere) and the wiring is fine (`maybeRandomEncounter` fires at app.js 2228/2229/2250). **With six locations there were almost no travel legs to roll on.** Fix the world, and the encounters fire.

**FIXED (Aevi):**
- Manifest rebuilt: **locations 6→92 · NPCs 5→31 · lore 3→26.**
- **3 locations authored that were REFERENCED BUT NEVER EXISTED** (dangling connections): `the_quickwood_eaves`, `the_churn_edge`, `the_gearlands_verge`.
- **The world wired together through THE AXIS GATE** — the Center is the hub (twelve roads leave the Crossing), every region's gateway links to it.
- **Global reciprocity pass:** connections in data are ONE-WAY; the world had leave-only edges. All 20 repaired.
- **VERIFIED at HEAD (authenticated API, not the lagging raw CDN): 92 locations · 24 regions · 0 dangling · 0 one-way · 92/92 reachable from the start.**

**🔧 CCode — REQUIRED:**
1. **Manifest-parity CI check** (this is exactly SNG-040's brief and this bug is the argument for it): fail the build if any content file on disk is not listed in a manifest, or any manifest path does not exist.
2. **Connection validator:** fail on dangling connections, one-way edges, or unreachable locations.
3. Consider loading by directory listing rather than whitelist — or keep the whitelist and let CI enforce it. Either way, **content must never silently not-exist again.**

**Erik test:** "Travel a few legs — verify you now get random encounters (35% per leg), and that the world is much bigger than six locations."

---

## SNG-065 — Quests with concrete structure (make them mean something)

**Erik-directed 2026-07-11:** *"I want the quests to be meaningful and have some concrete structure."* 🔧 CCode (engine) + ✍️ Aevi (schema + exemplar quests). Aevi PO.

**Current state:** quests are minted loosely by the GM (`engine/quests.js` — title/progress/complete). They have no stakes, no stages, no consequences, and completing one changes nothing durable. They are a to-do list, not a story.

**THE STRUCTURE (authored schema — `content/packs/core/rules/quest_structure.json`, Aevi to write):**
1. **PREMISE + STAKES.** Every quest states plainly what is at risk and *who pays if you walk away*. A quest with nothing at stake is an errand. **If you cannot name the cost of ignoring it, it is not a quest.**
2. **STAGES (2–5), each concrete.** Each stage carries: an OBJECTIVE the player can state in one sentence; a completion CONDITION the engine can actually test (a place reached, a person spoken to, a thing obtained, a truth learned, a roll passed); and a CHANGE it makes to the world when it lands. No vague "investigate further."
3. **OUTCOMES ARE BRANCHED, NOT BINARY.** Not success/fail — *which* success. Every quest resolves into 2–4 authored outcomes, each with different world-consequences. **The Debt (prologue) is the model: however it ends, someone is ruined; the quest is about WHO.**
4. **DURABLE CONSEQUENCE — the rule that makes quests mean something.** Every outcome MUST change at least one durable thing: a codex fact, an NPC's life/standing/death, a faction or people's disposition toward you, a location's state, a world-event that propagates via the away-digest (SNG-041 dated, BATCH-9 offscreen). **A quest that changes nothing durable is not allowed to be a quest.**
5. **TIES TO THE WORLD'S LOGIC.** Each quest names: the AXIS it lives on (a quest is a tension between two poles — that is what makes it a *dilemma* and not a chore), the TRADITION(s) whose crafts open paths through it, the faction/people who care, and — where apt — the LEGEND it touches (SNG-042: Grael's ledger, Halvex's patched).
6. **MULTIPLE ROUTES.** Force, guile, care, reason, craft, concealment, truth, endurance — a quest that has one solution is a lock, not a story. Route options should fan across the great circle so a player's domains genuinely change how they approach it (like the Prologue's problems).

**🔧 CCode:** extend `engine/quests.js` to the structured schema (stages with testable conditions; branched outcomes; a `consequences` block the engine APPLIES on resolution — codex writes, NPC state, faction standing, world-events). Keep GM-minted ad-hoc quests working, but **structured quests are the authored kind and the GM should prefer them.** The quest log (SNG-007/043) shows stage + objective + stakes, not just a title.

**✍️ AEVI OWES:** the schema + a first set of authored structured quests — starting with the ones the world is already pointing at: **Grael's ledger and the Fendt thread** (live in Erik's game), the Blaze's expansion, the Unlit taking someone from the Underlight, the tree in the Slow Orchard planted for someone missing, and a Halvex "patched" arc.

**Erik test:** "Take a quest — verify it tells you what's at stake and who pays if you walk away, that it has real stages with clear objectives, that there's more than one way through it, and that finishing it CHANGES something you can go back and see."
---

## SNG-BATCH-10 — Plug In The World (the content exists; the engine doesn't read it)

**Aevi PO, 2026-07-11. Verified at HEAD v1.8.21.** CCode has shipped the Prologue, the Library, portraits, born-with-image, legends, tradition-grouped skills and zoom. But **three major systems Aevi authored are sitting at origin unread by the engine.** This batch connects them. Nothing here needs new content — it all exists and is manifest-registered.

### Phase 1 — THE DOMAIN GATES (the great circle does not actually gate anything) 🔧 CCode
**Probe at HEAD: `primaryDomain`/`secondaryDomain` → 0 refs.** SNG-055 was never built. Skills now GROUP by tradition (good) but nothing GATES them — the "learn any Reach's capstone by picking it" hole Erik found is still open, and the great circle is currently decoration.
- Character carries **primary / secondary / tertiary** domains. In the Prologue they CRYSTALLIZE from play (the tradition-tags on the 48 paths, tallied — `prologue.json → closingReveal`); in quick-start the player picks them. Confirm-before-commit either way.
- **Gate `meetsLearnGate`/`effectiveLevelReq` off ring DISTANCE**, read from `traditions.json → theGreatCircle` (`ring`, `distances`, `opposite`) — **never hardcode the ring**: primary = full · adjacent (1 step) = free but NO capstones · secondary = tier III · tertiary (a ring-neighbor of secondary) = tier II · 2+ steps = skill-point penalty scaling with distance · **antipode (12 steps) = CLOSED**.
- **The only crossings:** combination abilities (above all the cross-pole braids) and artifact/extreme-circumstance grants. *A Blazeborn can never learn Umbracraft — but a Blazeborn who has held both can carry The Harbored Flame.* That is the payoff and it does not exist until this ships.
- Also honor the tradition-access gates: native (origin) / in-region / teacher-or-tome; folk traditions OPEN; capstones need standing.
- **Migrate** existing characters: infer domains from what they hold; grandfather anything now out-of-domain. Nobody loses a skill.

### Phase 2 — STARTING LOCATION (19 homelands exist; nobody can start in one) 🔧 CCode
**Probe at HEAD: `startingRegion` → 0 refs.** `origins.json` maps all 27 origins to a homeland across 24 regions — and creation still puts everyone in the Valley.
- Creation offers **STARTING LOCATION**, defaulting to the origin's homeland (`origin.startingRegion` / `startingLocation`), and always also offering **the Valley** (a character who already left — their `whyYouAreHere` is the reason) and **The Crossing** (the center — where nobody is from and everybody is).
- Feed the origin's `whyYouAreHere` to the GM as opening context. Nobody is anywhere by accident.
- This also unblocks SNG-055's **in-region** access path (currently unreachable) and SNG-046 Phase-2's multi-area map (nothing to show).

### Phase 3 — QUESTS (authored quests do not load; quests have no structure) 🔧 CCode
**Probe at HEAD: `provides.quests` in `state.js` → 0 refs.** `content/packs/valley/quests.json` exists and IS manifest-registered and **will not load** — there is no loader branch for it.
- Add the `quests` loader branch (same shape as npcs/locations).
- Implement **SNG-065 structured quests** in `engine/quests.js`: stakes, engine-testable stage conditions, multiple routes, **branched outcomes**, and a `consequences` block the engine APPLIES on resolution (codex writes · NPC state · people/faction disposition · location state · a propagating world-event dated on the shared clock). Schema: `content/packs/core/rules/quest_structure.json`.
- **The rule:** a quest that changes nothing durable is not allowed to be a quest. Quest log shows stakes + stage objective, not just a title.
- Authored and waiting: **The Edge District Ledger** (Grael/Fendt — *live in Erik's game*; 6 routes, 4 outcomes, including "you walked away" as a real outcome with a real cost) and **The Tree That Waits**. NPCs `fendt` + `keeper_ilma` exist.

### Phase 4 — CONTENT CI (SNG-040/064 — the insurance) 🔧 CCode
The manifest bug (the live game ran on **six locations** for weeks, silently) is the argument. Fail the build on:
- a content file on disk not listed in a manifest · a manifest path with no file · **a `provides.*` key the loader does not handle** (← this is exactly what bit quests) · a dangling connection · a one-way edge · an unreachable location · a content file failing its schema (this would have caught Aevi's poleIntensity bug at commit).

### Then (fast-follows, already specced)
SNG-056 (location-header desync) → SNG-058 (party leader) → SNG-052 (adult-gate checkbox persistence) → SNG-054 Phase 2 (skill-tree viz redesign, now that the corpus is final).

**Erik test (the whole batch):** "Make a character — verify you start in your PEOPLE'S homeland, that your domains gate what you can learn (and your antipode simply isn't offered), and that you can take a quest that tells you what's at stake, has real stages, more than one way through, and changes something you can go back and see."
---

## SNG-066 — In-game feedback / bug report (Tether-style) ⭐

**Erik-directed 2026-07-11:** *"we should build in a feedback/bug report feature, just like Tether's."* 🔧 CCode. Aevi PO. **Verified at HEAD: no feedback mechanism exists in the game (0 code refs).**

**Why this earns its place immediately:** every bug this session has been reported by Erik taking a screenshot, describing the situation, and Aevi then spending 2–4 tool calls reconstructing *where he was, what version, what state*. **A feedback button that auto-captures the context turns a 5-minute archaeology dig into a one-click report.** The Fendt date-drift, the duplicate-Erik picker, the gambit-every-turn, the Ent portrait, the location-header desync, the redo bug — every one would have arrived pre-diagnosed.

**Build — the value is in the AUTO-CAPTURED CONTEXT, not the text box:**
1. **A persistent, unobtrusive `⚑ Feedback` control** (header, beside Legs) — available on every screen, including creation and the prologue.
2. **One-tap type:** `🐛 Bug` · `💡 Idea` · `🤔 Felt off` (the third matters — "this isn't broken, it's just wrong" is most of Erik's best feedback and has nowhere to go today).
3. **AUTO-CAPTURE, no typing required:** app version · screen/route · character id + level + domains + origin · current location + region · active quest/scene · last GM turn (truncated) · last player action · any console errors since load · timestamp (shared world-day AND real). The player adds a sentence; the system supplies the forensics.
4. **Write to origin like Tether does** — append to `po/feedback/YYYY-MM-DD.md` (or a `feedback.jsonl`) via the existing sync PAT + `pushMergedFile` (read-merge-write-retry — concurrent reporters must not clobber). If sync is off, queue locally and flush when it returns; **never lose a report**.
5. **Confirm to the player** that it landed, with the entry id.
6. **Aevi reads `po/feedback/` at session-open** and triages into the backlog. Erik never has to re-describe a bug again.

**Guardrails.** No PII beyond what the save already holds. Redact the sync PAT and any credential from captured state (**never** dump the whole config object). Respect the rating ceiling in any captured GM text. Feedback is append-only; nothing is ever overwritten.

**Erik test:** "Hit ⚑ Feedback mid-scene, pick 'Felt off', type one sentence — verify it lands in the repo WITH your version, location, character and last turn attached, and that Aevi can read it without asking you a single follow-up question."

---

## SNG-067 — Creation "redo" cannot repick the primary domain (Erik live, v1.8.22)

**Erik-found in live play 2026-07-11, immediately after BATCH-10 Ph1 shipped the domain gate:** *"I hit 'redo' on the great circle during character creation and it did not let me repick the primary domain."* 🔧 CCode. Aevi PO. **This violates the Prologue's own mandatory rule.**

**Why it's a real bug and not a nit:** `prologue.json → closingReveal.confirm` says **"MANDATORY. Nothing commits until the player says yes."** And SNG-062's design law: *"Revealed, then confirmed — the player keeps the last word."* A redo that cannot actually re-choose the primary domain means the domain is **imposed**, which is precisely the failure the confirm step exists to prevent. It is also the single most consequential choice in the game (the antipode is CLOSED forever), so it is the worst one to get stuck with.

**Fix:** `redo` must return the player to a genuinely re-choosable state:
- Primary **and** secondary **and** tertiary all re-selectable (tertiary re-constrained to a ring-neighbor of whatever secondary they land on).
- Clear the derived state on redo — do not leave a stale crystallized primary underneath the re-render (**suspected root cause: the reveal is recomputed from the tallied prologue tags, so "redo" re-derives the SAME answer instead of handing control to the player**).
- Redo should offer BOTH: *re-derive from my play* (recompute the tally) and *let me choose* (free pick on the ring, with the reveal's reasoning still shown as advice, not as a lock).
- Applies to quick-start too: domains must remain editable until the final commit.

**Erik test:** "In creation, hit redo on the great circle — verify you can actually pick a different primary, that secondary/tertiary re-open with it, and that nothing commits until you confirm."
---

## SNG-068 — Creation commits things BEFORE the confirm (abilities + companions)

**Erik-found in live play 2026-07-11 (v1.8.21/22).** 🔧 CCode. Aevi PO. **Sibling of SNG-067 — same root cause: creation commits state before the player confirms.**

### A. Starting abilities are derived from the PROVISIONAL domains, not the confirmed ones ⛔
**Evidence (Erik's live character):** *Silas Weir* — primary domain **wright** — holds **Lightsense (Blazeborn)**, **Order-Sense (Lattice-Cities)**, **Numen-Sense (Numinous)**. **Not one is a wright ability.**
**Root cause (app.js ~1617):** `state.prologue.granted.push(path.grantsAbility)` fires the moment a path is chosen — abilities accrue DURING the prologue. The reveal then derives domains from the tallied tags. **If the player ADJUSTS their domains at the confirm step, the granted abilities are never recomputed.** The character ends up with skills belonging to the domains the game GUESSED, not the ones they CHOSE.
**This violates SNG-063's hard order rule** (`NAME → FORM → ORIGIN → DOMAINS → ABILITIES`) at the exact point it matters most.

**Fix — reconcile abilities AFTER the domain confirm:**
- On confirm (and on any adjust), **re-derive the starting ability set against the FINAL domains.**
- **Prologue-earned abilities are legitimately earned** — *"you did this, so you know this"* is a design law and must not be silently stripped. Keep them, but if an earned ability now falls outside the confirmed domains, **GRANDFATHER it explicitly and say so** ("you did this in the fire; it stays with you, though it is not your people's craft"). It is a nice piece of characterization, not a bug — *provided the player is told*.
- **AND the character must receive starting ability/ies from their CONFIRMED PRIMARY domain.** A wright who knows nothing wright is broken. This is the actual missing step.
- Applies to quick-start identically: abilities offered only AFTER domains lock, filtered to what the domains permit.

### B. The companion sidebar lists companions the player has never met ⛔
**Erik:** *"all companions are listed on the sidebar still — they shouldn't appear unless found in the game."*
`engine/companions.js → activeCompanions()` is CORRECT (it maps `character.companions`). So the bug is a **different render path** that is iterating the CONTENT roster (`CONTENT.companions` / the 9 `startingOption` entries) instead of the character's acquired list. Find it and point it at `activeCompanions(character, CONTENT.companions)`.
- **Rule:** the play sidebar shows ONLY companions the character actually HAS. The full roster appears in exactly two places: the quick-start picker, and the prologue's `companionBeat.offer` (2–4, filtered). Nowhere else.
- A companion you have not met must not exist to you. (Same principle as the Codex's discovery gate — and note the sidebar's *"PEOPLE YOU KNOW — no one yet"* gets this right; companions should behave the same way.)

**Erik test:** "Play the prologue, ADJUST your domains at the reveal, then confirm — verify your starting abilities match the domains you CHOSE (plus any prologue-earned ones, clearly labelled as earned-outside-your-people), and that your sidebar shows only the one companion who actually stayed."
---

## SNG-069 — Background is AUTO-ASSIGNED (and the set was thin) ⛔

**Erik-found in live play 2026-07-11:** *"I didn't get to choose my occupation or background. This area needs more depth populated — the martial disciplines and magical backgrounds should be here as well as many others."* His live character reads **"wright · craftsman"** — he chose neither. 🔧 CCode (the choice) + ✍️ Aevi (the content, DONE).

### A. THE BUG — the player never chooses 🔧 CCode
**The Prologue auto-assigned a background.** This is the same disease as SNG-067/068 (**creation commits before the player confirms**) and it is now three-for-three: the domain was imposed, the abilities were derived from the imposed domain, and the background was assigned outright.
**Fix:** the player CHOOSES their background — always, in both doors.
- **In the Prologue:** offer it at the reveal, beside the domain confirm. The scene may **SUGGEST** one from how they played (*"you took things apart to solve two of the four problems — Mechanist?"*) — **suggestion, never assignment.** Same law as the domain: revealed, then confirmed; the player keeps the last word.
- **In quick-start:** a normal pick, browsable by category.
- **Never gate backgrounds by origin or domain.** A Cogitant duelist and a Marcher physician are the *interesting* characters and the system must permit them.

### B. THE CONTENT — expanded 15 → 40, across 6 categories ✍️ AEVI (DONE, at origin)
`content/packs/core/rules/backgrounds.json` — now categorized so a long list stays navigable:
- **MARTIAL (8)** — the disciplines Erik asked for: **Duelist** (one blade, one opponent, everything decided in about a second) · **Line-Soldier** (you did not step back; that is the whole art) · **Skirmisher** · **Warden** (a decade of readiness for one bad night) · **Hunter** · **Bodyguard** · **War-Leader** (some orders got people killed, some were right, a few were both) · **Arena Fighter** (has thought hard about the difference between a contest and a killing).
- **PRACTITIONER (7) — this is the "magical background."** In Singularity the *crafts ARE the magic*, so the meaningful question isn't *what* magic but **how you came to yours**: **Temple-Trained** · **Self-Taught / Hedge-Practitioner** (gaps that would horrify a temple, instincts they will never have) · **Lineage-Taught** (it came with obligations you didn't get to decline) · **Precursor-Marked** (something in the old lattice touched you and did not entirely let go) · **Battlefield-Taught** (no theory, no second attempt) · **Apprenticed to a Legend** (you were not their best student; you are still better than almost everyone) · **Found It By Accident** (you did a thing once, in a bad moment, and have spent every year since trying to understand it).
- **CRAFT (8)** · **LEARNED (5)** · **SOCIAL (6)** · **MARGINAL (6)** — smuggler, exile, ruin-picker, drifter, street-raised.
- Each carries a `gmHint` (how they *behave*, not just what they did) and an `affinity` (challenge types they help with — a modifier, never a gate).

**Erik test:** "Make a character — verify you CHOOSE your background from a real, categorized list including martial disciplines and practitioner lineages, that the game may suggest but never assigns, and that a Cogitant can be a duelist."
---

## SNG-070 — GM corrections: the game self-heals

**Erik-directed 2026-07-11:** *"we need a GM mechanic where we can have the GM change things for us. That way the game can self heal."* 🔧 CCode. Aevi PO.

**The case, made by this session:** the background was auto-assigned · the domain couldn't be repicked · the abilities came from the wrong domains · the location header desynced · a companion appeared who was never met. **Every one of those needed a code fix and a redeploy to make one player's save correct.** That is the wrong loop. The GM is already sitting in the world with full state access — it should be able to *fix the world*.

**Build — a bounded `stateOps` GM operation:**
- Player asks in-scene (the existing **Ask GM** affordance): *"my background should be Duelist"* · *"I never met this companion"* · *"this quest is stuck"* · *"the header says I'm in the wrong place."*
- The GM emits a **`stateOps`** op the engine validates and applies: correct a background / domain / origin · remove an entity the player never acquired · unstick or re-stage a quest · re-anchor the current location · fix a codex fact · repair a bad companion entry.
- **Narrate it in-fiction where possible** ("you were never a craftsman — that was someone else's story"), but the *mechanism* is a plain state correction, and it must be honest about being one.

**⛔ GUARDRAILS — this is a repair tool, not a wish tool. Non-negotiable:**
- **Allowed:** fix data that is *wrong* — a field the player never chose, an entity they never acquired, a stuck stage, a desynced pointer.
- **Refused:** granting XP, levels, items, abilities outside the domain gates, or anything that *advances* rather than *repairs*. Power comes from play. The GM may not hand it over, and must say so plainly and warmly when asked.
- **Every correction is LOGGED** to the ledger (what changed, from → to, why, world-day) — append-only, reviewable, and it shows up in the save's history. A silent state edit is worse than a bug.
- **Bounded to the asking player's own character/save.** Never touches shared canon (a promoted entity is repaired via the normal contradiction path, not a GM edit).
- **Reversible:** the ledger entry is enough to undo it.
- Respect the floors: corrections cannot raise a rating ceiling or bypass minor-protection.

**Erik test:** "Tell the GM your background is wrong and should be Duelist — verify it's corrected, narrated, and logged. Then ask it for 500 XP — verify it declines, plainly and without being a prig about it."

*This makes the game self-healing: a data bug becomes a conversation instead of a CCode ticket. It does not excuse the bugs — but it means Erik and his family are never STUCK with one.*

---

## SNG-071 — PO discipline: port the Tether pipeline to Singularity ⭐

**Erik-directed 2026-07-11:** *"this game is getting to be large enough to warrant some additional discipline. You have PO duties from Tether that should apply here — the way you write and have CCode review specs, the technical spec, etc."* ✍️ Aevi (process) + 🔧 CCode (`check_pipeline.py`).

### Aevi's honest diagnosis (from the graph — OpFlow_SessionOpen, TetherV525Spec_20260504)
**Tether's cycle:** Aevi (PO) authors **ROUND 1** → reviewer does **ROUND 2 substrate verification against origin** → amendments → **spec promotes** → CCode executes → `complete_pending_review` → Aevi **review-closes** → `check_pipeline.py` (11 automated checks) gates it. Specs carry: **inline pre-work scope verification** (empirical measurement *before* authoring), phased plans (P1–P5), a **verification-post-ship** section, a **live anchor**, and **spec boundaries** CCode surfaces and Aevi accepts or amends.

**What I have actually been doing in Singularity: idea → spec → CCode builds. There is no ROUND 2.** The cost is measurable, all of it from this session:
- **poleIntensity:** I authored 66 locations against a *remembered* schema shape. A ROUND-2 read of `location.schema.json` would have caught it before a single file was written.
- **"Domain gates don't exist":** I asserted from a probe that was already stale — CCode had shipped them. I specced a batch around a false premise.
- **The manifest bug:** the live game ran on **six locations** for weeks. No pipeline check existed to notice. Tether has eleven.
- **SNG-067/068/069:** three specs written as three bugs when they are one defect. A ROUND-2 pass would have named the shared root cause first.

### The port — adopt these five, drop nothing else
1. **TWO-ROUND SPEC CYCLE (the big one).** Aevi authors **ROUND 1 (proposal)**. **CCode performs ROUND 2: substrate verification against origin** — does the code actually do what the spec assumes? do the schemas match? is the premise still true at HEAD? CCode returns findings; **Aevi amends and only then PROMOTES the spec to buildable.** *No spec is built from an unverified premise.* Small bug-fixes may skip ROUND 2; anything touching data shape, engine contracts, or more than one file does not.
2. **PRE-WORK SCOPE VERIFICATION, INLINE IN THE SPEC.** Every spec opens with **what was measured at HEAD, and when** — file paths, line refs, counts, probe results. Not "I think X is missing" but "`grep primaryDomain app.js` → 0 refs @ v1.8.21." **My own rule, which I have been breaking: read the schema/origin BEFORE authoring, and record what I read in the spec.**
3. **`check_pipeline.py` — the automated gate CCode owes.** Tether has 11 checks. Singularity has 0. Minimum set (this is SNG-040/064 generalized): manifest parity · manifest paths resolve · **every `provides.*` key has a loader** · no dangling connections · no one-way edges · no unreachable locations · every content file validates against its schema · every ability has a `tradition` · every quest's giver/region resolves · version-line consistency. **Green is required to close anything.**
4. **STATUS LIFECYCLE, stated explicitly:** `queued → in_progress → complete_pending_review → review-closed → superseded`. Nothing is "done" without a review-close. Only Aevi closes (already true).
5. **SPEC BOUNDARIES are first-class.** When CCode deviates from a spec, it names the boundary in the results file (it already does this — the `poleIntensity` flag was exactly right). Aevi **accepts or amends** — explicitly, in the ledger. A boundary is a fact, not a failure.

### Artifacts
- `po/OPERATIONAL_FLOWS.md` — the flows above, written down (Tether has one; Singularity does not).
- **Retire the ever-growing `SPEC_BACKLOG.md` as the primary surface.** It is now ~100KB of append-only sediment. Per-item specs promote to versioned docs; the backlog becomes an index. (Tether uses `TETHER_UPDATE_vX.XX.md` + `PIPELINE_ALERT.md` + `STATE.md`.)
- `po/ALERT.md` is the same append-only problem. It should carry **current status only**; history lives in results files and the graph.

**First application: SNG-BATCH-10 gets a ROUND 2 before any more of it is built.** Given that its premise ("domain gates don't exist") was already stale when I wrote it, that is not a formality.
---

## SNG-072 — Origin labels: the pole helper-word + the "of the the" bug ✅ CONTENT DONE

**Erik-found live 2026-07-11:** the origin dropdown reads **"The Rootkin — of the the quickwood"** (doubled article), and *"the starting civilizations need the helper words (Life, Death, etc.) next to the peoples names."*

**Root cause:** region ids already begin with `the_` (`the_quickwood`), and the renderer was concatenating `"of the " + regionId.replace("_"," ")`.

**Fixed in content (Aevi):** every origin now carries
- **`pole`** — the helper word Erik asked for: *The Rootkin — **Life***, *The Ashwardens — **Death***, *The Umbrals — **Dark***, *The Wrights of the New — **Creation***.
- **`homeRegionName`** — the proper display name (*the Quickwood*, not *the_quickwood*).
- **`displayLabel`** — the authoritative, pre-built string.

**🔧 CCode: render `origin.displayLabel` VERBATIM. Never rebuild the label by concatenation.** → *"The Rootkin — Life · of the Quickwood"*

---

## SNG-073 — THE SKILL WHEEL: the skill tree IS the great circle ⭐ (supersedes SNG-054 Phase 2)

**Erik-directed 2026-07-11:** *"the skill selection screen sucks. it's messy and limited. Now that we have the great circle we need to lay the skills out toward the center. The highest tiers at their circle nodes, the lowest near the center. The unaligned skills around the center, the precursor skills outside the ring. the braided skills (if known) between the axes."* 🔧 CCode (viz). Content is DONE (`traditions.json` carries the ring, positions, antipodes, distances; all 137 abilities carry `tradition` + `levelReq`).

**Why this is the right design and not just a prettier one:** it makes the skill screen a MAP OF THE WORLD'S DISPOSITIONAL SPACE. The player does not read their options — they SEE where they stand, who their kin are, and what is closed to them. Access, lore, and geometry become one picture. The great circle stops being a gate and becomes the interface.

### The layout (polar, radius = tier)
- **24 tradition NODES on the ring** at their `ring.position` (15° apart), read from `traditions.json` — **never hardcode**.
- **Each tradition's abilities radiate INWARD along its own radius, ordered by tier: rank/tier V at the node (outermost), I nearest the center.** Depth = mastery. Walking *out* along a spoke is walking *deeper into a people's craft*.
- **THE CENTER (innermost zone): the unaligned / FOLK traditions** — valley_craft, harmonic, radiant_folk. **This is exactly the lore**: the Valley is the near-center crossing, its crafts are folk-shadows of the great poles, and they are OPEN to everyone. *The center of the wheel holds a little of everything — because the center of the world does.*
- **OUTSIDE the ring: PRECURSOR.** It is not an axis-people; it is the substrate the whole world sits on. Beyond the poles, encircling everything. Fiction-gated, and it should LOOK it.
- **THE BRAIDS (combination abilities) — drawn as connections, not nodes:**
  - **cross-pole braids** (harbored_flame, meaning_engine, the_turning_word) → **drawn as the DIAMETER, straight through the center**, joining a tradition to its antipode. *This is the picture of holding an axis whole — the one thing the access model forbids by any ordinary means. It should be the most striking line on the screen, and it should only appear once known.*
  - **kin-civilization combos** → a short arc between the two adjacent nodes on the ring.
  - **cross-axis combos** → a chord across the circle.
  - **within-tradition braids** → a small link between two abilities on the same spoke.
  - Erik: *"if known, which a few should be known"* — **known braids render bright; undiscovered ones do not render at all** (they are discoveries, not a menu).

### State, read straight off the ring
- **Primary domain** — its spoke lit fully.
- **Adjacent (1 step)** — lit, but the outermost node (capstone) visibly barred.
- **Secondary (III cap) / tertiary (II cap)** — lit only to their permitted depth; the outer rings greyed.
- **Penalized ring (2+ steps)** — dimmed, with the cost shown.
- **ANTIPODE (12 steps)** — **dark. Struck through. Closed.** Directly across the wheel from you. *You should be able to see, at a glance, what you can never be.*

### Fixes the "messy and limited" complaint at the root
Erik saw 1–2 choices per group because the flat list showed only what his provisional domains allowed. The wheel shows **the whole world at once** — everything he can take, everything he could take at a cost, and the one thing he cannot — and *why*, spatially. Limited becomes legible.

**Interaction:** hover/tap an ability → name, tier, energy, functions, and its gate status ("free — kin of your primary" / "+2 pts — three steps out" / "closed — your antipode"). Zoom + pan (SNG-054 Phase 0 already shipped). Center-out is also the natural read order for a new player.

**Erik test:** "Open the skill wheel — verify your primary's spoke runs out to its capstone, your kin are beside you, the folk crafts sit at the center, precursor rings the outside, your antipode is dark across the wheel, and any braid you know draws a line through the middle."
---

## SNG-074 — ⛔ Dev mode is STICKY WITH NO OFF SWITCH (dev tooling on the live URL)

**Erik-found in live play 2026-07-12:** *"The dev content has leached into the non-dev page... in the normal url I get the leg button and the encounters button."* 🔧 CCode. Aevi PO. **Blocks handing the game to Brooklyn.**

### Root cause (measured at HEAD v1.8.25)
```js
// app.js:72  — a single ?dev=1 visit writes a PERMANENT flag
if (/[?&]dev=1\b/.test(location.search)) localStorage.setItem("singularity.dev", "1");

// app.js:226 — devEnabled() reads ONLY that flag
function devEnabled() {
  if (localStorage.getItem("singularity.dev") === "1") return true;
  if (/^(localhost|127\.0\.0\.1|\[::1\])/.test(location.hostname)) return true;
  return false;
}
```
**It is not a leak — it is stickiness.** One `?dev=1` visit opts the *browser* in **permanently, on every URL, forever, with no way out.** The code comment (*"Never shown to a normal player… unless they explicitly enabled it"*) is technically true and practically useless: **there is no un-enable.**

### Why this is more than an annoyance
1. **Erik has no clean player view** — he literally cannot see what Brooklyn will see, and he is about to hand her the game.
2. **A family member who ever opens a `?dev=1` link** (bookmarked, pasted, shared) **is permanently dev-enabled** — with the dev-only clock-jump, forced encounters, and state grants (SNG-051's runner) live in their save.
3. Dev affordances **mutate state**. That is fine for a dev; it is not fine for a twelve-year-old who clicked a link.

### Fix — dev must be OPT-IN, VISIBLE, and REVERSIBLE
1. **On the production host, `?dev=1` is SESSION-SCOPED, not persisted.** Present in the current URL → dev on. Reload without it → **clean player view.** *This alone guarantees the family can never be stuck in dev mode.*
2. **`?dev=0` immediately clears the flag** (and any legacy persisted flag), belt-and-braces.
3. **A visible Settings toggle** — "Developer mode" — off by default, with an explicit off. If a persistent opt-in is wanted, it lives HERE, chosen deliberately, not caught from a URL.
4. **A visible `DEV` badge in the header whenever dev is active.** Ambiguity about whether you are in dev mode is itself the bug. Erik must be able to tell at a glance which view he is looking at.
5. **localhost/preview auto-on stays** — that is a dev environment and is correct.
6. **Audit every dev surface** and confirm each is behind `devEnabled()`/`isDev()`: the 🧪 Legs panel · Test-encounters buttons · the SNG-051 "Run this scenario" runner (clock-jump, grants, setRating) · anything else. `[CCODE: enumerate — there are ~54 dev-surface refs at HEAD; confirm all are gated]`

**Erik test:** "Open the live URL in a normal window — verify NO Legs button and NO test-encounters panel. Then open it with `?dev=1` — verify they appear and a DEV badge shows. Reload without the param — verify they're gone again. Then check Settings has a Developer-mode toggle that's off by default."

*Priority: HIGH. This is the last thing between Erik and being able to verify the real player experience before his daughter plays.*
---

## SNG-075 — Encounters must fire in NARRATIVE play (they currently can't) ⭐

**Erik-directed 2026-07-12:** *"I'd like the random encounters to apply during narrative driven play as well. I almost never use the map to travel... so things need to be able to happen while I'm doing stuff."* 🔧 CCode. Aevi PO.

### PWSV (measured at HEAD v1.8.25)
- `maybeRandomEncounter(...)` is called from **exactly three places**: `app.js:2262` (onTravel), `:2263` (onEnterLocation), `:2284` (onRest). **All three are UI-button paths.**
- **`gmTurn` ↔ encounter refs: 0.** The narrative turn loop has **no encounter hook whatsoever.**
- **But the signal already exists:** `timeOps.hoursPassed` (§10) flows into the engine every turn, plus `intentTags` (8 refs in gm.js).

**Consequence:** 58 authored encounters and 22 regions of texture are **effectively unreachable** for a player who plays in prose. The system is not broken — it is *unhooked from how the game is actually played.*

### The fix — bind encounters to NARRATIVE TIME, not to buttons
**Narrative time IS the encounter window.** The engine already knows how long the fiction took.

1. **`onNarrativeTime`** — after each GM turn, if `timeOps.hoursPassed > 0`, roll. **Chance scales with hours** (~4%/hr, danger-weighted, clamped):
   - a 20-minute conversation → ~1–2% (rare, correct)
   - a half-day's walk (≈6h) → ~25%
   - a multi-day trek (capped 72h) → high, but **capped at one encounter per scene**
2. **`onNarrativeTravel`** — the GM narrates movement (intentTags `travel`/`journey`, or `timeOps.why` says so) → treat as a **travel leg** at the existing 35%, using the **destination's** region for eligibility.
3. **`onNarrativeRest`** — the GM narrates sleeping/camping → the existing rest trigger (15%, wilderness-weighted).
4. **`encounterOps`** — let the **GM REQUEST** one when a scene has gone quiet and wants something: the GM proposes, **the engine still decides** (Law 1 — the model never decides outcomes). Engine picks, validates eligibility, applies cooldown.

### ⛔ WEAVE, DO NOT INTERRUPT (this is the part that matters)
On the UI path an encounter is a card. **In narrative play it must arrive INSIDE the fiction.**
- The engine rolls, selects the encounter, and **injects its `seed` into the NEXT GM turn** as authoritative context: *"an encounter is occurring — weave it into the scene."*
- The GM narrates it as part of what is happening. **No modal, no genre-break.** *The road had something to say — it should sound like the road saying it.*
- The engine still owns the mechanics: eligibility, flavor-weighting by danger, and — non-negotiable — **the `lethalRule`: any fight/dangerous encounter that could incapacitate MUST present a decline/flee path before engagement. No ambush-lethality**, narrative path included.

### Guardrails
- **One encounter per scene, plus an N-turn cooldown.** *A world that interrupts you constantly is as dead as one that never does.*
- **Never fire during a critical beat** — combat in progress, a quest climax, an intimate scene, a gambit resolution. `[CCODE: name the suppression conditions]`
- Respect the narrative register (§11) and the rating ceiling (§17).
- Low-danger locations still skew beneficial/benign/**beautiful**. *The valley is hopeful-strange, not grim.*

**Erik test:** "Play narratively for a while — travel and camp by describing it, never touching the map — verify things happen to you: a Rootkin answers a question you asked twenty minutes ago; the road has something to say. Then have a short conversation — verify it stays quiet."
---

## SNG-076 — Authored prose is being truncated mid-word ⛔

**Erik-found live 2026-07-12:** *"the text in many places gets cut off — see the Quest Log, but also in the news when word spreads."* 🔧 CCode. Aevi PO.

### PWSV (measured at HEAD v1.8.25) — hard character slices on authored text
| Site | Code | Effect |
|---|---|---|
| `engine/quests.js:65` | `summary: String(...).slice(0, 240)` | **Quest stakes die at 240 chars** → *"…and Ove…"* |
| `engine/quests.js:50` | `clampNote = n => String(n).slice(0, 200)` | stage notes truncated |
| `engine/worldtick.js:170, 281` | `String(n.text).slice(0, 220)` | **away-digest cut mid-word** → *"the district acco ("* |
| `engine/worldtick.js:98` | `String(n).slice(0, 200)` | news truncated at source |

### Root cause — **two distinct bugs, and the first one is conceptual**

**1. AUTHORED content is being clamped as if it were untrusted model output.**
The clamps are *correct in origin*: they bound GM-generated strings so a runaway model cannot write 10KB into a field. **But authored content is not untrusted** — quest premise, stakes, stage objectives and outcome narration come from content packs, are deliberately written, and are already finite. **Clamping them is not a safety measure; it is vandalism of the thing the player is meant to read.**
> **Rule:** *authored content renders in full. Model output is clamped. These are different classes of string and must be treated as such.*

**2. Every clamp cuts mid-word with no ellipsis logic.** `slice(0, N)` on prose produces `"and Ove"`, `"the district acco ("`. Even where clamping is right, **the cut is wrong.**

### Fix
1. **Authored strings are NOT clamped.** Quest `premise` · `stakes` · stage `objective` · outcome `narration` · location `descriptionSeed` · NPC/companion prose — all render **in full**. `[CCODE: audit every clamp and classify the string's ORIGIN — content pack vs model]`
2. **Where a clamp IS correct (model output), clamp properly:** cut on a **word boundary**, append a real ellipsis, and **make it expandable** ("… more") rather than destroyed. **Never lose text the player might want.**
3. **Raise the model-output storage bounds** so a normal sentence survives (220 chars is under two sentences of GM prose — a stored news item should not lose its own verb). Suggest ~600 for stored news/notes; the bound exists to stop runaway output, not to fit a UI.
4. **The away-digest specifically:** entries render whole, or are expandable. *A propagating world-event is one of the few places the world speaks to you unprompted — losing its second half is losing the point of it.*
5. CSS: no `line-clamp`/`overflow:hidden` on prose panels. `[CCODE: confirm]`

**Erik test:** "Open the Quest Log — verify the stakes read to the end. Trigger an away-digest — verify each item reads to the end. Then confirm a long GM narration still can't blow up the layout."

*Priority: HIGH. The prose IS the game — this is the one thing that must not be quietly damaged. And it is damaging the authored content most, because authored content is the longest.*
---

## SNG-077 — Gambit hint still constant: **Aevi's heuristic was wrong, not CCode's build**

**Erik, 2026-07-12:** *"When is the gambit fix coming? the one where the gambit suggestion isn't constantly on the screen?"* 🔧 CCode. Aevi PO.

### PWSV (HEAD v1.8.29) — **SNG-043 Part A SHIPPED CORRECTLY.** The spec was the bug.
`isGambitApt` (app.js:822) is exactly what Aevi specced — ≥3 choices, and `planTagged || stagedObjective`; the loose `abilityChoices>=2` / `nonTrivial>=4` fallbacks are gone. **CCode built the spec faithfully. The spec was still too loose, and that is Aevi's error.**

**Both surviving disjuncts fire on ordinary scenes:**
1. **`planTagged`** — `plan` is one of **ten generic approach tags** the GM assigns (`plan/scout/attack/persuade/study/gamble/help/steal/risky/careful`, gm.js:68). It marks a **careful STYLE**, which describes most thoughtful choices in this game. **It does not mean "this scene needs a plan."**
2. **`scene.threads >= 3`** — the GM is told threads are *"unresolved in-scene threads (a question hanging, someone waiting for an answer)"* (gm.js:43). Those are **CONVERSATIONAL**. Any decent social scene carries three.

**Root error: I keyed the hint on STYLE and CONVERSATIONAL TEXTURE, not on the gambit condition — multiple OBSTACLES that must be SEQUENCED THROUGH toward a goal.** No proxy signal in the current turn payload actually carries that.

### Fix — stop guessing. **Let the GM say so.**
The GM is the only party that knows whether a scene is *"get past the guard, cross the yard, open the vault"* or *"have a conversation."* Proxy heuristics cannot recover that, and every attempt to tune them will keep mis-firing.

1. **Add a GM field: `gambitApt: true`** — emitted **only** when the scene genuinely presents a **multi-obstacle objective that would reward sequencing**. Instruct explicitly and narrowly: *"Set `gambitApt` ONLY when there are two or more distinct obstacles between the character and a stated goal, such that ordering the approach would matter. A rich conversation is NOT gambit-apt. A careful or planned approach to a SINGLE obstacle is NOT gambit-apt. Most turns: omit it."*
2. **`isGambitApt` = `turn.gambitApt === true`.** Drop `planTagged` and the thread-count entirely. *(Design law 1 holds: the GM PROPOSES, the engine still decides — it applies cooldown, dismissal and the ≥3-choice sanity check.)*
3. **Suppression that actually sticks:** dismissed = dismissed **for the scene**, and a **cooldown of N turns** after any dismissal or completed gambit. `[CCODE: confirm the existing per-scene dismissal actually persists — Erik reports it does not]`
4. **Bias hard toward silence.** A gambit is a *special* affordance. **If in doubt, do not show it.** The failure mode of a hint shown too rarely is a player who misses a feature; the failure mode of one shown constantly is a player who stops seeing the UI at all — and Erik is already there.

**Erik test:** "Play a dozen ordinary turns — verify the Plan hint does NOT appear. Then walk into something with real staged obstacles — verify it does, once, and stays gone after you dismiss it."

*Aevi's note for the record: SNG-043 Part A shipped exactly as specced and Erik still has the bug. This is a spec defect, not a build defect. It is also exactly what ROUND 2 exists to catch — and Part A skipped it, because I called it "a one-function tune."*
---

## SNG-078 — Balance sensitivity harness (level 1→100) + ⚠️ A MAJOR FINDING

**Erik-directed 2026-07-12:** *"when can we do sensitivity analysis on all the parts of the game, taken from lvl 1 to 100?"* ✍️ Aevi (first-order analytic pass — DONE, below) + 🔧 CCode (the harness).

### ⚠️ FIRST-ORDER FINDING (analytic, computed from `resolution.json` @ HEAD — this is arithmetic, not opinion)

**The game ceilings out at level 5.**

| Difficulty | Hits the 95% clamp at |
|---|---|
| Routine (0) | **level 2** |
| Hard (15) | **level 3** |
| Very hard (30) | **level 5** |

**Cause:** `attributeMultiplier: 20` against a soft cap of 4 → **an attribute of 4 is 80% chance ON ITS OWN**, before skill (+10/pt), ability rank (+5), equipment (+10), companion (+10), or spectral fit (+25). Difficulty tops out at **30**. So the hardest thing the GM can pose is beaten by a level-3 character, and a level-5 character with gear, a companion and good alignment sits at 95% on *very hard* with **~45 points of unused headroom.**

**And level 100 does not exist:** `subAttributeCap: 20` · `maxAbilityRank: 3` → **mechanical growth stops around level 20.** Beyond that the level number rises and nothing changes.

**The honest caveat — where tension DOES still live:** it comes entirely from **modifiers, not the curve**. Acting *against* a place's grain (−25), exhausted (−10), on a *novel* action (−15) takes a 95 down to 45. **So the game is tense when you are misaligned, tired, or reaching past what you know — and a formality otherwise.** That is a defensible design. It is probably not the one Erik chose.

**⛔ ERIK'S CALL (do not tune without him):** possible levers — lower `attributeMultiplier` (20 → ~8–10) · widen/scale the difficulty band (0/15/30 is too narrow to matter) · scale challenge with level · make the soft cap bite harder. **Aevi will not touch balance numbers unilaterally.**

### The harness (CCode) — what analytic math CANNOT see
The engine is pure and headless-testable (Law: `engine/*` is pure logic). A sim harness is cheap and becomes a **permanent regression gate**, like `check_pipeline` but for balance.

**`tests/balance_sim.mjs` — simulate archetypal builds from level 1 → the true cap, and report:**
1. **Success-chance distribution** per level × difficulty × alignment (aligned / neutral / against-grain), Monte-Carlo over the d100 — *where does the game actually stop being uncertain?*
2. **Energy economy.** Max 100 · action 5 · abilities 4–15 · **recovery is ACTIVE-ONLY** (breather +10/1h, sleep +40/8h, meditation 10+2×attunement) · **no passive regen** (`regenPerRest` is a dead key — CCode's §22 finding). *Can a character sustain a scene? A day? Is the ability-cost curve survivable at high rank?*
3. **XP pacing.** `xpPerLevel: 100` → level 100 = 10,000 xp ≈ **2,000 rolled actions**. *What is the real level after 10 / 50 / 200 hours of play? What is the effective cap?*
4. **The discovery bonus.** `+20` replacing `−15` is a **35-point swing.** *(Erik parked this for exactly this analysis.)* **Does a discovered technique simply ceiling out?** — the analytic pass says almost certainly yes.
5. **Domain access economics.** Does the distance-penalty ever make an out-of-domain ability worth taking? Are tier IV–V capstones reachable within the real level cap?
6. **Combination viability.** Are the 44 combos reachable? Are the cross-pole braids (the moral centerpiece) actually attainable in a normal campaign, or theoretical?
7. **Encounter/danger scaling.** `dangerLevel` 1–5 vs a character who auto-succeeds from level 5 — *is any encounter ever a threat?*

**Output:** a markdown report + a machine-readable summary, run under `npm test` as a **regression gate**: fail if the ceiling-out level moves, so nobody silently re-breaks the curve.

**Erik test:** "Run the harness — see, in one table, at what level each difficulty stops mattering, whether energy constrains anything, and how long a real campaign takes to hit the cap."

*This is the single highest-leverage engineering task left. Every balance conversation until now has been vibes; this makes it arithmetic.*
---

## SNG-079 — Difficulty by AXIAL MISALIGNMENT: the great circle IS the difficulty curve ⭐

**Erik-directed 2026-07-12:** *"balance the game so the challenges are appropriate to the level, and some things are just beyond your level. That means some regions are not really able to be explored until you are powerful enough to overcome the disadvantages due to axial misalignment."* 🔧 CCode. Aevi PO. **Depends on SNG-078 (the harness) to tune the numbers.**

**This is the best structural idea in the balance space and half of it already exists.** Spectral fit is already ±25 and every location already carries `poleIntensity` (0.05 at The Crossing → **0.98 at the Blaze / the Unlit Deep / the Grand Lattice**). It simply doesn't **bite**, because base chance is so inflated (attr 4 = 80 alone, SNG-078) that −25 barely dents it.

### The model
1. **Misalignment penalty scales with `poleIntensity` × ring-distance from the place's pole.**
   *The Crossing (0.05) is easy for everyone — that IS the centre's meaning. A pure locus (0.98) is brutal for anyone not of that pole.* **Your ANTIPODE region is the hardest place in the world FOR YOU — and it is a different place for every character.** The map becomes a difficulty map, and the difficulty map is *personal*.
2. **Widen the spectral band** so it can actually gate (±25 → a scaled range the harness sizes). A Blazeborn in the Unlit Deep should be *crushed* until they are strong enough — or braided enough — to bear it.
3. **Lower base chance + widen the difficulty band** (SNG-078: `attributeMultiplier` 20 → ~8–10; difficulty 0/15/30 → a range that still means something at high level). **Without this, no gate can hold.**
4. **Some things are simply BEYOND you, and the game must say so.** A low-level character attempting a pure-locus action should see a chance near the 5% floor and be *told* why: *"this place is against you in every way you are."* **A refusal that explains itself is a signpost; a silent 5% is a mystery.**
5. **Challenge scales with region danger**, not only with the GM's 0/15/30. `[CCODE: propose the coupling]`

### Why this is right and not just harder
It makes the world's *geography* the progression, without a single artificial gate. **You don't unlock a region — you become able to survive it.** And the way you become able is either to grow, or to *change what you are* (drift — see the §9 open question), or to **braid** (hold both poles). **The cross-pole braid stops being a curiosity and becomes the key to the far side of the world.**

**Erik test:** "Walk toward a pure locus at low level — verify actions there are genuinely brutal and the game TELLS you why. Then verify The Crossing is welcoming to everyone, and your antipode region is the worst place in the world for you specifically."

---

## SNG-080 — The world must PUSH (nothing is happening to Erik) 🔴

**Erik, 2026-07-12:** *"I haven't gotten into ANY fights or anything yet. I wanted more things to start happening but haven't had a chance to experience it."* 🔧 CCode. Aevi PO.

### PWSV — diagnosed, and it is not (only) a bug
**Erik has never left the safest place in the world.** Millbrook is a peaceful farming village, and **at Millbrook exactly ZERO fight-capable encounters are eligible** — the 8 that can fire there are 3 beneficial, 2 benign, 2 beautiful, 1 theft. **No fight. No danger. No chase.** That is *correct* for a farming village.
**The real defect: the world is REACTIVE. It waits for him.** Nothing pushes him out, nothing comes to him, and nothing tells him where danger lives.
*(Also: `millbrook.json` has **no `dangerLevel` field at all** → floored to the gentlest tier. `[CCODE: audit — how many original locations are missing it? CI should require it.]`)*

### Fix — three pressures, all cheap, all using systems that already exist
1. **THE VILLAIN ACTS.** `legends.js` has the deployment beats (`villain_escalation`) and **Overseer Grael's thread is already live in Erik's world** (Fendt, the ledger, the water crisis). **Escalation must be on a CLOCK, not on the player's initiative.** If Erik ignores it, Grael should *win* — another name on the board, the water worsens, and it **arrives at him**. *(The Edge District Ledger's "you walked away" outcome already specifies exactly this. Nothing is firing it.)*
2. **THE WORLD REACHES HIM.** `worldtick` already dates and propagates events and has `impactsLocal`. **Use it to push:** a propagating consequence should surface as a *scene*, not just a line in the digest. **Riffraff arrive. A messenger finds him. A body turns up.** The away-digest tells him the world moved; it should sometimes move *onto him*.
3. **QUEST HOOKS COME TO HIM.** Locations carry `questSeeds` and the GM is told to weave them "when the scene needs drive." **That is too passive.** After N quiet turns, the GM should be *instructed* to introduce pressure — a hook, an arrival, a demand. **A quiet village is a setting, not a scene.**

### The pacing rule (the thing that is actually missing)
**Track quiet turns. After a threshold, the world ACTS.** Escalating: a rumor → a person with a problem → a hook that will not wait → something arriving. **The player should never have to ask the world to be interesting.**
- Respect the register and the danger of the place — *pressure in Millbrook is a frightened neighbour, not a bandit ambush.* **Danger lives elsewhere, and the game must make that legible and desirable, not merely true.**
- Suppress during a live scene/quest climax (as SNG-075 does).

### Also: make danger FINDABLE
He cannot fight because he does not know where fighting is. **The map should show danger** (SNG-046 Layer 1: `dangerLevel` per location — colour it). **The GM should give him reasons to go** — the Disputed Zone is on his doorstep and nothing has invited him into it.

**Erik test:** "Sit in Millbrook doing ordinary things — verify the world does not let you be bored: within a handful of turns something arrives, someone needs something, or Grael's thread tightens. Then verify the map tells you where the dangerous places are."
---

## SNG-081 — 🚨 THE GM IS HAVING A CONVERSATION WITH ITSELF (the player's words are never kept)

**Erik, 2026-07-12:** *"the GM seems to completely refuse any romancing of NPCs... I put several romance type things in there — calling the hunt she's going on with me a date... it's almost like it's not seeing my actual words."* **He is exactly right, and it is not a refusal.** 🔧 CCode. Aevi PO. **HIGHEST PRIORITY — this is the deepest defect found in the project.**

### PWSV (HEAD v1.8.29) — definitive
```js
// app.js:2211 — the ONLY thing pushed to turn history
sceneTurns.push({ summary: turn.sceneSummary, narration: turn.narration || "" });
```
```js
// gm.js:187 — how that history is rendered back into the prompt
return i >= recentTurns.length - 3 && t.narration
  ? `${t.summary}\nFULL TEXT: ${t.narration.slice(0, 700)}` : t.summary;
```
**The turn record stores ONLY the GM's own `sceneSummary` and `narration`. The player's input is NEVER stored.**

**Therefore the "conversation history" the GM receives is a MONOLOGUE OF ITS OWN PROSE.** The player's words reach it for **exactly one turn** (via `exactWords`, in the uncached player tier at the very end of the prompt). **If that turn's narration does not catch the nuance, it is gone forever** — and on the next turn the history contains only what the GM itself said.

**So when the GM told Erik *"no romantic overtures have appeared in the scene text because none have been played yet"* — from its view of history, that was TRUE.** It was not refusing. It was blind.

### This is not a romance bug. It is a total-continuity bug.
**Every nuance the player puts into their own words dies after one turn:** a promise made · a name used · a tone set · a joke · a threat · a plan · a flirtation · a refusal · a stated intention. The GM can only ever see the parts of the player *it happened to echo back in its own prose*. **This is almost certainly the root cause of the general "the GM doesn't respond to what I actually do" feeling** — and it silently contradicts Design Law 4 (permanence) and the GM's own rule 13 (scene permanence), because the player's half of the scene has no permanence at all.

### Fix
1. **Store the player's turn.** The turn record becomes:
   `{ player: <exactWords ?? label>, summary, narration }`
2. **Render the history as an actual DIALOGUE**, not a monologue:
   ```
   YOU: "let's call this hunt a date"
   GM:  <summary / full narration>
   ```
3. **Keep the player's words in FULL for the recent window** (they are short; the GM's prose is the long part). If anything must be clamped, clamp the GM's side — **never the player's.** *(Ties SNG-076: the player's own words are the last thing that should ever be truncated.)*
4. **Persist it in the save** so continuity survives a reload — a scene reloaded from disk must not lose the player's half.
5. `[CCODE: check every other `recentTurns` call-site — 1976, 2571, 3042, 3509 — they all inherit this.]`

**Erik test:** "Say something distinctive — flirt, make a promise, name someone — then, three turns later, ask the GM about it. Verify it KNOWS what you said, in your words, and can quote it back."

*Aevi's note: this is the single most consequential bug in the project. The world remembers everything — facts, codex, places, chronicle, the shared canon across characters — and forgets the player. It has been listening to itself the entire time.*
---

## SNG-082 — The world map: pan/zoom + real terrain ⭐

**Erik, 2026-07-12:** *"this is really awesome, especially if the background was an actual map with terrestrial features... but I can't move the map around or zoom in."* 🔧 CCode. **Terrain content: DONE (Aevi).**

### A. Pan / zoom 🔴 (PWSV: world-map zoom/pan refs = **0**)
The skill graph got zoom (SNG-054 P0). **The world map has none** — and it now holds **92 locations across 24 regions**, so it is unusable without it. Wheel/pinch zoom · drag to pan · fit-to-view · reset · centre-on-me. **Small; do it with the terrain.**

### B. Real terrain — **`content/packs/core/rules/regions.json` is AUTHORED and at origin**
25 regions, each with **`terrain` · `elevation` · `palette{base,accent,edge}` · `features[]` · `water[]` · `visualIdentity`**.
**Deliberately data-driven, NOT an authored base image** — terrain is *derived from dispositional identity*, so a BATCH-9-generated location automatically inherits the right ground. An authored map picture would freeze the world; this one grows with it.

**Render guidance (in the file):**
- **Region shape:** hull/voronoi from each region's locations' `map.x/y`, filled with its palette. **Edges may be soft — dispositional space has soft edges.**
- **Water:** the **Echo River** (valley) and **THE SEA** (the Feeling Coast — the world's only ocean) are the two great water landmarks.
- **Roads = `connections`.** The **Axis Gate's twelve roads are the map's spine** — draw them heaviest. Every road on the map ends at the Crossing.
- **Elevation → relief/hatching.** The Ascent is the highest point on the map; **the Umbral Depths are BELOW it** — render as a cutaway or an under-region with the Slow Stair as the only way down.

**⚠️ Three regions must LOOK WRONG, deliberately — do not clean them up, the failure IS the content:**
- **the_pattern_reach** — resists mapping (non-Euclidean; the cartographer gave up).
- **the_veiled_reach** — the map is *lying* (doubled features, an outline that doesn't quite close).
- **the_numinous_reach** — the cartography *loses confidence* (uncertain edges).

**Four borders are EXPANDING** and should show it if cheap: **the Blaze** (eating the land, visibly), **the Churn Edge** (creeping), **the Scouring**, **the Ceaseless**.

**Erik test:** "Open the map — zoom, pan, and fit. Verify the Valley is green and worked, the Radiant Wastes are a blinding glass scar that looks like it's growing, the Quickwood's cities are indistinguishable from its forest, and the twelve roads of the Axis Gate are the spine of the world."
---

## SNG-083 — "Show known people" shows nothing (and only draws HALF of what it should)

**Erik, 2026-07-12:** *"what does the known people button do? I can't tell any difference."* 🔧 CCode. Aevi PO.

### PWSV (HEAD v1.8.37)
The toggle sets `mapShowKG` and draws from **`character.npcRegistry`** — *people the character has MET*. **Silas has met nobody** (his sidebar reads *"PEOPLE YOU KNOW — no one yet"*). So the overlay renders **zero markers**, the button appears inert, and **nothing tells the player why.**

### Two defects
**A. No empty state.** A toggle that produces no visible change and offers no explanation is indistinguishable from a broken button. **If there is nothing to show, SAY SO** — disable it with a tooltip, or render *"You haven't met anyone yet — the world is still a rumour."*

**B. ⛔ It draws only half the overlay. This is the real bug.**
SNG-046 Phase 1 specced **discovered (solid) AND heard-of (dimmed)** — the same visual grammar the map already uses for *places* (visited vs heard-of), extended to *entities*. **The overlay only implements the MET half.**
**And Erik HAS heard of things.** His away-digest has been telling him about **Fendt**, **Overseer Grael's Edge District**, the **water crisis**, **Usnea's expedition**. Those are in his codex/news as heard-of-not-met. **They should already be sitting dimmed on his map, showing him where the world's live threads are.**

### Fix
1. **Source the overlay from the CODEX, not just `npcRegistry`.** Solid = met/visited firsthand · **dimmed/dashed = heard-of only** (from facts, news, the away-digest). Same grammar as sub-places.
2. **Place a heard-of entity at its resolvable location** (an NPC's `homeLocation`; a fact's or news item's location — the digest already carries *"(near millbrook)"*, *"(near radiant plateau edge)"*).
3. **Empty state** — never a silent no-op.
4. **Optional, cheap, high value:** faint relationship edges where the codex knows a link (**Fendt → the Edge District → Grael**). *That is the Fendt thread becoming VISIBLE — the player can literally see the shape of the conspiracy he hasn't chased yet.*
5. Rename to fit what it shows: **"Show what you know"** — it is people *and* rumours, not only people.

**Erik test:** "Toggle it with a character who has met no one — verify it tells you so, AND that the things you've only HEARD of (Fendt, the Edge District, the water crisis) appear dimmed where they live. Then meet someone and verify they go solid."

*This turns the map from a travel tool into an intelligence board — the away-digest stops being flavour text and becomes something you can SEE.*
---

## SNG-084 — The game explains nothing (in-context mechanics helper text) ⭐

**Erik, 2026-07-12:** *"I can't pick a new skill with my skillpoint... is this as designed? We need to add helper text that explains all the game mechanics and make the text show up in the right places."* 🔧 CCode (surfaces) + ✍️ Aevi (the copy). Aevi PO.

### The finding is worse than the bug
**It IS as designed** — `skilltree.js → breadthCap`: a **broad-vs-deep capacity**. You may know only N *distinct* abilities at your level; further points must **deepen** what you own. Real, deliberate, data-driven.
**And Erik — who DESIGNED this game — could not tell a rule from a bug.** That is the finding. **Brooklyn has no chance.**

*(Compounding: Erik's 3 capacity slots are spent on **Lightsense · Order-Sense · Numen-Sense** — Blazeborn, Lattice, Numinous. **Not one is a wright ability.** The SNG-068 creation bug did not merely give him the wrong skills; it **spent his entire breadth budget on them**, so he cannot take a single ability of his own people. **This makes SNG-070 (GM corrections) urgent, not optional.**)*

### The principle
**Every mechanic must explain itself AT THE POINT IT BITES.** Not in a manual. Not in the Library. **Right where the player runs into it, in one sentence, in the game's voice.**
> *A rule the player cannot distinguish from a bug is, functionally, a bug.*

### Where helper text is owed (each: one sentence, in-voice, on an `ⓘ`)
| Surface | The player's question | What it must say |
|---|---|---|
| **"3 of 3 — at capacity"** | *"Is this broken?"* | **"You can carry only so many crafts at once. Further points DEEPEN what you know rather than add to it. Breadth or depth — that is the trade, and it is meant to cost you."** |
| **A locked ability** | *"Why can't I take this?"* | Say WHICH gate: *"closed — this is your antipode"* · *"free, but not their capstone — you are kin, not one of them"* · *"+2 points — three steps around the ring"* · *"you must be native, in their region, or taught by one of them."* |
| **The great circle** | *"What am I looking at?"* | It is the world's dispositional geography AND your access map. Your antipode is what you can never be. |
| **Energy hitting 0** | *"Why am I stuck?"* | **There is no passive regen.** You recover by eating, resting, sleeping, meditating — actively. Exhaustion is −10, not a wall. |
| **A novel action (−15)** | *"Why was that so hard?"* | You reached past what you know. It is *supposed* to be dangerous. |
| **A discovery (+20)** | *"Why is this suddenly easy?"* | You did it, survived it, and repeated it until it was yours. **The same act that cost you −15 now pays +20.** |
| **Spectral fit** | *"Why did that go well/badly?"* | The place favoured you / was against you. **Geography is disposition.** |
| **Ranks vs breadth** | | Rank deepens ONE craft; breadth adds another. Rank III forks — and the unchosen path closes forever. |
| **Tiers I–V** | | Depth of mastery within a people's craft. Capstones must be *taught*, not bought. |
| **Gambits** | | Connected challenges, each solvable several ways, **planned across** — and **fewer steps are HARDER** (`gambit_design.json`). |
| **XP / levels** | | Where growth comes from, and what a level actually gives you. |

### Build
1. **`ⓘ` affordance on every mechanic surface**, opening a short in-voice explanation. **Progressive** — do not dump the system on a new player.
2. **Every REFUSAL explains itself.** *A silent "no" is the worst thing in the game.* (Ties SNG-079: *"this place is against you in every way you are"* — a refusal that explains itself is a signpost.)
3. **Link out to the Library** (SNG-061) for the deep read; the inline text is the one-sentence version.
4. **✍️ Aevi owes the copy** — every line above, in the game's voice, authored as content (`content/packs/core/rules/helper_text.json`) so it is versioned, loaded, and not hardcoded in `app.js`. **(Design Law 15.)**

**Erik test:** "Hit any wall in the game — a capacity cap, a locked skill, an empty energy bar — and verify the game tells you WHY, in one sentence, without you having to ask anyone."
