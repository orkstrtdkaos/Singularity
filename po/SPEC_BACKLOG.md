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

**Content + systems. RIDES ON BATCH-9** (needs the generate path + weight/engagement + codex recurrence). Earliest after BATCH-9 Phase 1; best paired with Phase 2 offscreen advancement (legends move through the world between appearances). Erik-directed 2026-07-11; Aevi PO. **Aevi owes the authored legend/villain anchors before build.** Only Aevi closes.

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

*Rides BATCH-9; earliest after Phase 1, best with Phase 2. Aevi authors the legend/villain anchors before build.*
