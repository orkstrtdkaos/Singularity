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
