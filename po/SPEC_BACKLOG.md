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
- **BATCH-6 (Foundation):** SNG-019 + SNG-022. Small, unblocks all. Start here.
- **BATCH-6.5 (Fast fixes, parallel-able with anything):** SNG-030(rest) + SNG-031 (gambit surfacing+xp wire) + SNG-032 (narrative time). Small, high felt-impact; 032 is a GM-op + rule.
- **BATCH-7 (Living spine):** SNG-020 + SNG-021 + SNG-024 + SNG-025 + SNG-034 (bestiary rides the encounter/living-world work). The world that grows/lives/ends/marks/breathes.
- **BATCH-8 (Player systems):** SNG-017 (origins + ent-gating fix + SNG-036 martial paths ride together) + SNG-018 + SNG-023 + SNG-027 + money/Game/recruitment + SNG-026. Shares relationship/economy machinery.
- **BATCH-9 (Multiplayer + polish):** SNG-033 (party v2) + SNG-037 (cross-char awareness) + SNG-038 (simultaneous turns) + SNG-035 (imagery). The multiplayer identity of the game — do together, after foundation.
- **BATCH-0 (Hygiene, do ANYTIME, cheap):** SNG-040 (content CI) now; SNG-039 (onboarding) once creation/SNG-017 lands. 040 protects every future commit — arguably do it first.

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

## SNG-041 — Character build + leveling UX redesign (clean, intuitive, mobile-first)
Erik 2026-07-07: the creation and leveling/skill-choosing experience needs to be clean and intuitive. AUDITED at origin (renderCreate ~410; skill graph ~1155; sheet section ~1611). Findings + redesign.

**Findings (real friction):**
- Creation is ONE dense wall (name+origin+background+12pt attributes+ability picker) then bio — no stepped progression, overwhelming turn one.
- Origin list is the OLD triangle (harmonic/radiant/valley) hardcoded in the UI — same root as the Ent-gating bug; new origins/backgrounds (SNG-017/036) aren't offered.
- Ability details live in HOVER TOOLTIPS — nonexistent on touch; mobile players pick abilities blind.
- TWO leveling UIs for one task: a visual skill-GRAPH (1155) and a list-based sheet section (1611), with duplicated rank-up logic — inconsistent, confusing, double-maintenance.
- Skill graph encodes owned/aspired/ripe/gated as ring-color + lock-icon only; "what does it do / can I afford it / what's it cost" is buried behind a legend.

**Redesign — creation as a stepped wizard (one decision per screen):**
1. Name + "guide me / full control" fork (SNG-039 onboarding tie).
2. Origin = area-of-world (SNG-017 origins.json) with a one-line flavor + what it grants — card per origin, tap to pick, not a cramped button row.
3. Background = role+homeland / martial path (SNG-036) as cards showing style + signature.
4. Attributes: the point allocator, but with live "what this does" (physical→health/melee, etc.) inline, not implied.
5. Abilities: TAP a tradition → see its abilities as CARDS (name, tier badge, function icons, plain CAN/CANNOT text VISIBLE not hover), tap to select; running "you've chosen N of M" + a plain-language summary. Baseline + form-kit shown as "already yours" (SNG-036).
6. Bio (keep — it's good; the ✦ weave is a nice touch), then start at origin's location (not hardcoded Millbrook).

**Redesign — ONE leveling surface:**
- Collapse the two UIs into a single "Character" screen with a clear MODE: a readable list grouped by tradition (default, mobile-friendly) with an optional graph VIEW toggle for those who like the map — but both drive the SAME selection logic (one code path, not two).
- Every ability row shows, WITHOUT hover: name, tier, function icons, owned-rank (or "new"), the exact cost (skill point / gated-by X / ripe-to-claim), and one-line CAN/CANNOT. A "learn"/"rank up" button is enabled/disabled with the REASON shown ("needs Finesse 3", "level 4", "1 skill pt") — never a mystery-disabled button.
- Pending points (attribute/skill) surface as a clear top banner with a call to action, so a player never has unspent growth they didn't notice.
- Legend replaced by plain labels on each row; ring-color can stay as reinforcement, not the sole signal.

**Progressive disclosure:** advanced surfaces (cross-domain combos, the full graph, gambit) stay quiet until basics are owned (SNG-039). New player sees a clean short list; veteran can open the map.

**Ties:** SNG-017 (origins/backgrounds feed the new pickers — do together), SNG-036 (baseline/form-kit/martial shown), SNG-039 (guide-me path + progressive disclosure), skill-functions (function icons on every ability). Mostly a UI rebuild over existing data; the data is ready.
- **Smoke:** creation is a stepped wizard, one decision per screen, no hover-dependent info, all current origins/backgrounds offered; a mobile player can read every ability's effect + cost without hovering; one leveling surface (list default, graph optional) with reasons on every disabled action; unspent points are impossible to miss.

*Updated 2026-07-07 — through SNG-041.*

## SNG-042 — Skill audit: usefulness, consolidation, and progression-unlock logic
Erik 2026-07-07: are the current skills useful or trash? Should they combine into functional areas? Need logic on progression unlocks. AUDITED the full ability corpus (100 abilities, function-tagged) at origin.

**Verdict: NOT trash — the corpus is good and characterful (each ability has crisp CAN/CANNOT, no pure filler). But it has real IMBALANCES:**
- **Function glut/gaps:** reveal=41 (!), bind=25, heal=15, move=15, shield=14, strike=13, break=13, mend=11, ward=8, conceal=8. Reveal is 3× over-served; conceal/ward/strike are thin. A Shadow (conceal) or defender (ward) archetype has few real options while every tradition can "sense" things ten ways.
- **Tradition imbalance:** the 3 original + 6 built Reaches sit at 9-12 abilities; the 2 newest Reaches (emotional_logical, falsehood_truth) are stuck at 2. Precursor at 6 (intentionally gated). Uneven archetype support.
- **Overlap within functions:** many near-duplicate "senses" across traditions (echo_sense, tremor_sense, deathsense, lifesense, mech_sense, numen_sense, body_read, chaos_sense, order_sense...). Not wrong — each is flavored to its Reach — but the PLAYER sees ten sense-abilities and can't tell which matters. This is a PRESENTATION problem (group by function — SNG-041) more than a content one; don't delete flavor, GROUP it.

**Actions:**
1. **Don't combine/delete — GROUP.** The abilities aren't redundant, they're the same FUNCTION through different Reaches (the whole design). Fix is UI (SNG-041): present the skill list grouped by FUNCTION as an option ("everything that REVEALS"), so a player shopping for a shield sees the 14 shields across traditions, not a maze. Keep every ability; change how they're shown.
2. **Rebalance by expansion, not cutting:** bring emotional_logical + falsehood_truth to ~9 (breadth pass, like the other Reaches got); add conceal/ward/strike abilities where archetypes are starved (Shadow needs more conceal; Artificer more ward). Target rough function parity so every archetype has real choices.
3. **Trim reveal-glut gently:** don't delete, but ensure new abilities skew AWAY from reveal; consider merging the most redundant same-Reach senses (e.g. if one Reach has 2 near-identical senses) into one with a richer tree. Audit per-Reach for internal dupes only.

**PROGRESSION-UNLOCK LOGIC (the real ask — currently ad-hoc, needs a stated model):**
- **Tier gates (exist, keep):** Tier I-V by levelReq; attribute-gates on Tier III+ (attribute_gates.json). Rule: an ability's TIER = how deep in a tradition it sits; you can't take Tier III before the level + attribute floor.
- **Tradition access (the SNG-017 fix, state it as law):** origin grants HOME tradition(s) free-to-tier; OTHER traditions require traditionAccess earned in fiction (teacher/travel/quest). No more hardcoded triangle. Reaches are 'learned'-gated already — generalize.
- **Breadth cost (exists, keep):** cross-tradition abilities cost more (skill_capacity crossClass / crossTraditionLevelPenalty) — going wide is priced; going deep is cheaper. This is what makes archetype identity mean something.
- **The unlock SPINE (new, stated):** a clean rule for what opens when — (a) LEVEL raises your tier ceiling; (b) ATTRIBUTES gate Tier III+ within a tradition; (c) FICTION opens new traditions (traditionAccess) and the Precursor tier (precursorAccess); (d) PRACTICE/USE ripens aspired abilities toward a free claim (the practice/aspiration system already exists — surface it); (e) COMBINATION unlocks by owning both parts + discovery (SNG-026). Five clear channels, each visible to the player with its requirement stated (SNG-041's "reasons on disabled actions").
- **Doc it:** a progression.md content doc stating this spine so it's canon, not scattered across engine files.

**Ties:** SNG-041 (function-grouping UI + reasons-shown), SNG-017 (traditionAccess), SNG-036/class_archetypes (archetype parity is the balance target), SNG-026 (combination unlock). Mostly content-balance + one stated model + UI grouping; the engine mechanics largely exist, they need STATING and BALANCING.
- **Smoke:** function coverage roughly even across the 9-10 functions; every archetype has ≥5 real ability choices; the skill screen can group by function; each ability's unlock requirement is visible and follows the stated 5-channel spine; the two thin Reaches reach ~9.

*Updated 2026-07-07 — through SNG-042.*

## SNG-043 — Modifier skills (horizon axes as ride-on modifiers) + SNG-042 rebalance (partly DONE)
Erik 2026-07-07: the horizon axes were always meant to show up ANYWHERE as modifiers, not home traditions. Content DONE: cross_axis_modifiers.json (12 modifiers, 6 horizon axes × 2 poles — Accelerated/Distanced, Unmaking/Generative, Impassioned/Calculated, Veiled/Avowed, Made-Concrete/Abstracted, Infernal/Grace-Touched). Also DONE: SNG-042 function rebalance — conceal 8→11, ward 8→11, strike 13→14 (Shroud/False Trail/Blend In/Boundary-Stone/Sun-Seal/Hunter's Strike).
- **Engine (new content TYPE):** character.modifiers[]; an action can carry ONE optional modifier tag → base ability + modifier effect + modifier energy cost; GM narrates the fusion; drift applies toward the axis-pole. Lighter than abilities (1-2 ranks, cheap acquire, no tradition-home gate). Acquire via contact-with-axis (place/teacher/experience) — the 6th unlock channel in SNG-042's spine.
- **Advanced:** a modifier can ride a cross-domain COMBINATION (costed); intensity-surge can stack on a modified action. Both gated/priced.
- **Distinction now canon:** 6 BUILT Reaches = home traditions (dense enough to live in); 6 HORIZON axes = modifier layers (color, don't found). emotional_logical + falsehood_truth work BOTH ways (deep tradition for natives, modifier for all).
- **Remaining SNG-042 work:** reveal-glut (41) addressed by UI grouping not cutting (SNG-041); progression 5+1-channel spine to doc as progression.md; per-Reach internal dupe audit.
- **Smoke:** an action can take a modifier (accelerated strike costs more, hits faster, drifts time-hot); modifiers acquirable without a tradition home; one modifier per action; drift applies; the 6 modifier-only axes never appear as home traditions.

*Updated 2026-07-07 — through SNG-043.*

## SNG-044 — Challenge-utility tagging + coverage view + situational-skill reframes
Erik: 'when am I going to use Palework?' Skills exist to aid through CHALLENGES (fight/duel/puzzle/chase/social/explore/survive/stealth/investigate) but some are authored thematically and read as situational. Findings in skill_utility_audit.json.
- **challengeTypes[] on every ability** (back-tag pass, rides SNG-022; derivable from functions+effect). The game + player learn what each skill is FOR.
- **SNG-041 skill UI gains a CHALLENGE-COVERAGE view:** 'in a FIGHT you have X,Y,Z; in a PUZZLE...' — so a player sees their teeth and gaps, not just a tradition list. Prevents accidental all-lore builds.
- **Reframe ~6 flagged situational skills** (palework, the_last_gift, death-senses, held_breath/broker_truce/hold_the_aperture) — rewrite descriptions toward ACTIVE/novel uses (palework rots doors/bridges, reads battlefields, ends the won't-die, intimidates — a FIGHT/INVESTIGATE tool themed on endings, not an ending-detector). Content edit, Aevi.
- **GM mandate:** honor + reward PLAUSIBLE novel skill uses (novelBonus already exists, SNG-030) — 'when do I use X' should have a dozen player-found answers. Principle=permission, challenge=occasion, creativity=bridge.
- NO new skills; the fix is legibility + creativity-reward. Smoke: every ability shows its challenge-types; the skill screen shows fight/puzzle/chase coverage; a reframed Palework reads as usable in a live fight; the GM allows+rewards a novel use.

*Updated 2026-07-07 — through SNG-044.*

## SNG-045 — Skill-battle system (contested, energy-weighted, multi-turn) + SNG-044 done
SNG-044 DONE: all 112 abilities tagged with challengeProfile (challenge-type→proficiency 0-3, tier-scaled — T4+ epic at their best, T1 good at 1-2); gap analysis run; 6 capstones authored filling EXPLORE/DUEL/CHASE/SOCIAL/STEALTH/INVESTIGATE epic holes (Pathless Way, Last Form, Long Odds, Turning Word, Never-There, Whole Truth). Every challenge now has a high-tier capstone.
SNG-045 (skill_battle_system.json): contested skill-vs-skill resolution. Triggered when two wills contest the SAME outcome with skills (conceal-vs-reveal, strike-vs-shield, Falsecraft-vs-Verity). Per round both declare skill+intensity(energy); roll d100+attr+tierBonus+MATCHUP; winner shifts a momentum meter by margin; ENERGY ATTRITION can decide it (run out = lose regardless of rolls); tier gives power AND stamina; Surge-botch backlashes; resolves at meter-end/exhaustion/yield. Matchup table (function-vs-function edges + domain/pole modifiers + location disposition) — being the right TOOL beats raw rolls. **Unifies SNG-027:** social-contest is the SOCIAL flavor of this one engine; combat/duel/infiltration are other flavors. Engine: skill-battle mode beside single-check; reads challengeProfile+functions+intensity+tier. Smoke: multi-round conceal-vs-reveal; attrition decides independent of rolls; matchup edge beats rolls; social-contest runs through same engine.

*Updated 2026-07-07 — through SNG-045.*

## SNG-046 — Travel abilities DONE + SNG-047 difficulty transparency ("show the math")
Erik 2026-07-07: (1) need travel skills — teleport, flight. (2) show the difficulty RATING of an action, the modifiers you KNOW you have, the math, and list the UNKNOWNS.

**SNG-046 travel abilities — DONE (committed):** Shortfold (T3, LoS blink), Waygate (T5 capstone, long teleport to known places, party), Shadowstep (T3, shadow-to-shadow stealth-teleport), Skydancer (T4, flight-by-mastery bounds/glides), Light-Borne (T5, true radiant flight, blazingly visible). Fills the EXPLORE/CHASE thinness. Teleport gated by substrate density (space/time + mech-spiritual); flight split mastery(momentum-bound) vs radiant(visible true-flight). All challengeProfile-tagged.

**SNG-047 difficulty transparency ("show the math"):** The engine ALREADY computes odds — successChance() (resolve.js, called app.js:797) returns a real number from character+action+location+rules+aptitudeMods+equipment. It's currently HIDDEN behind fuzzed flavor ("something in you settles — this feels doable"). Surface it.
- **Show the difficulty rating:** each choice displays its difficulty tier (Trivial/Easy/Moderate/Hard/Severe/Legendary mapped from the difficulty number) — a clear label, not just vibes.
- **Show KNOWN modifiers as a breakdown:** an expandable "the math" line per action — base d100 target, then each modifier the player KNOWS applies with its value: +attribute (Physical +X), +ability (Prism Sight T2 +Y), +equipment (+Z), +affinity (location favors/hinders ±W), +intensity if surging. Sum → your effective chance %. Show it like a receipt.
- **List the UNKNOWNS explicitly:** things the player can't see the value of — "hidden factors: the warden's true skill (?), what the ribbon left behind (?), the stone's condition (?)". Named but unquantified, so the player knows there's fog AND knows where it is. (Ties memory/fidelity: known facts quantified, unrevealed ones flagged as ?.)
- **Fuzz only what should be fuzzed:** keep flavor for the OVERALL feel if desired, but the breakdown of KNOWN modifiers is exact. Player skill = reading the receipt + judging the unknowns. Uncertainty comes from real hidden factors, not from the UI withholding math the character would know.
- **Gambit tie:** the gambit assess step already reads odds "as far as your experience allows" (app.js:1434) — same principle; unify the presentation (show-the-math + list-unknowns in both the per-action view and the gambit assess).
- **Ties:** successChance() (exists), aptitude/equipment/affinity mods (exist), challengeProfile (an ability's proficiency at THIS challenge feeds its bonus + explains it), intensity (surge shown in the math). Mostly a DISPLAY change over existing computation + an unknowns-enumeration pass.
- **Smoke:** each action shows a difficulty tier + an expandable exact modifier breakdown summing to a %; known bonuses are itemized with sources; unknown factors are listed as ? not hidden; surging updates the math live; the gambit assess uses the same format.

*Updated 2026-07-07 — through SNG-047.*

## SNG-048 — GM-assisted gambit planning (co-author the plan, don't just grade it)
Erik 2026-07-07 (from live playtest): the GM should HELP the player build a gambit — take raw ideas, flag strong parts, suggest missing connective tissue, adapt input into a coherent plan. This is what makes gambits FUN vs a guessing-game. Observed in play: a player's two separate ideas (bait a committed strike + root the ground for a thicket) were actually ONE plan — the GM's job was to find the keystone step (rooting solves the dry-stone problem that blocked the other ideas) and sequence them so step 1 changes step 4's odds.
- **GM planning contract:** when a player enters gambit-planning, the GM (a) reflects each idea back with what's STRONG and what's MISSING; (b) finds dependencies/keystones (which step enables others); (c) flags plan-killers (e.g. deception backfires at the Redline) and offers an in-world REFRAME (a grove isn't a trick, it's terrain); (d) proposes a sequenced plan the player approves/edits; (e) names the fragile step so the player chooses how to handle it.
- **Adapt, don't replace:** the plan stays the PLAYER'S — GM suggests connective tissue and sequencing, never overrides the player's intent. Output is the player's ideas made coherent, not the GM's plan.
- **Ties:** gambit builder (SNG-031 surfacing), assess-odds step (show-the-math SNG-047 — assess each proposed step's odds as the character would know them), challengeProfile (which of the player's skills fit each step), pole_signatures (an NPC's what-moves-them shapes social steps). The GM already has the pieces; this is a PROMPT/rule + the builder reading them.
- **Smoke:** a player enters loose ideas; GM returns a sequenced plan naming keystone + fragile step + a reframe of any plan-killer; the plan is recognizably the player's ideas; each step shows its odds; the player can edit before running.

*Updated 2026-07-07 — through SNG-048.*

## Playtest findings 2026-07-07 — "The Unwinnable Duel at the Redline" (Ent gambit)
A full gambit run (Ent community-organizer vs a Marcher champion in a duel he couldn't win head-on). Outcome: total victory, duel WON BY NEVER BEING FOUGHT — the puppeteer behind the challenge was exposed and destroyed by his own weaponized honor-forms; the champion refused the unjust fight and became an ally. Validates + surfaces:

**Validated SNG-048 (GM-assisted planning):** the fun came from the GM finding the keystone the player couldn't see (rooting the stone solved the dry-ground problem blocking every other idea) and REFRAMING plan-killers in-world (grow a grove = not deception but "an Ent fighting at full size"; the honor-forms reward it). The GM co-authored, never overrode. Confirmed: this is THE gambit feature.

**New finding — SOCIAL/POLITICAL gambits are top-tier, combat-as-held-fallback:** the most satisfying gambit had ZERO combat tools fire — club never swung, switches never ticked, root-lock never closed. They were held in RESERVE, which is precisely what let the player gamble on the social play. Design principle: **a great gambit stacks graceful degradation so the bold line is safe — multiple fallbacks must all fail to lose, one must work to win.** The player had 3 live fallbacks and needed none.

**New finding — "honest misdirection" is the anti-gimmick core:** every layer was TRUE (the grove was the Ent; the truth was true; the crowd believed because it was real; the villain fell to his own forms). Nothing was a trick. Contrast a gimmick = a die roll in a costume. GM rule: reward plans whose power comes from what an opponent MISUNDERSTANDS, not from what the player fakes.

**New finding — character-native victory:** the Ent won as what it IS (organizer, patient grove-being, fights-by-becoming-a-forest), not as a generic warrior. Gambits should be a showcase for the specific character. Ties challengeProfile + archetypes: the system should surface a character's NATIVE gambit angles.

**New finding — turning an opponent's own mechanic back on them is a peak beat:** offering the puppeteer the duel he engineered for someone else (forms he weaponized now his cage) was the climax. GM guidance: look for the move where the antagonist's own tool/scheme becomes the trap. High-leverage narrative pattern; worth surfacing to the GM as a beat-type.

**Fold into:** SNG-048 (planning), gambit surfacing SNG-031, and a GM-guidance doc note on gambit beat-types (social-first, honest-misdirection, own-mechanic-reversal, character-native). No new engine — GM-craft + planning-assist.

*Updated 2026-07-07 — playtest findings logged.*

## Playtest findings 2026-07-07 (2) — "The Silent Door" (party puzzle-dungeon gambit)
A 3-person puzzle-gambit (player-as-Cellaceron; GM ran the Ent + Teva + the site) at a waking Precursor vault — What Sleeps Under. Resolved by UNDERSTANDING not force: the "toll" was a deposit-to-reclaim, the "clock" was the sleeper rising to be claimed (not a threat), the sleeper a living thing a dying Precursor entrusted to the future. Won by a promise ("bring what you left into the warmth, through our own warmth"), not a withdrawal. Findings:

**Confirmed SNG-038 (simultaneous party turns) is ESSENTIAL, not nice-to-have:** the player twice caught the GM running a called-for SIMULTANEOUS 3-channel read as sequential round-robin. The whole solve depended on each member reading what the OTHERS triggered in the SAME beat — partial views snapping into one picture. Round-robin literally cannot express this puzzle. Priority-bump SNG-038; the collect-then-resolve model + one-shared-beat rendering is required for co-op puzzles, not just combat.

**New finding — puzzle-gambits RESIST the gambit frame:** puzzles FEEL stepwise, so the GM kept collapsing "declare plan → resolve with maneuvers inside" into turn-by-turn "now what?" prompting. The player flagged it directly ("this has turned into turn-by-turn instead of a gambit"). GM RULE: even puzzle-gambits want the whole approach committed then swept; hold the plan-level view harder against the puzzle's stepwise pull. Add to SNG-048 planning-assist: for puzzles, explicitly re-offer "commit the full plan" once the party has enough info, don't drip beats.

**New finding — "question the clock" is a peak player move:** the player asked "why does the countdown matter if it's locked in the vault?" — which inverted the whole scene (the clock was benign). GM guidance: when a player interrogates a pressure assumption, REWARD it — let the assumption be genuinely wrong sometimes. Not every clock is a threat; a site that punishes force but rewards understanding is a richer antagonist than a timer. Ties the non-adversarial-site design (the sleeper).

**New finding — the cost must be REAL even in a non-combat win:** the door refused tolls that cost nothing; the winning claim offered "time, money, plans, as needed." A caretaker's true price = your future bent around another's need. Design: withdrawal/claim gambits should demand an ongoing responsibility, not a one-time payment — the honest version of a toll.

**Fold into:** SNG-038 (priority up), SNG-048 (puzzle planning-assist rule), and a GM beat-types note (question-the-clock, non-adversarial-site, cost-as-responsibility) alongside the Redline patterns.

*Updated 2026-07-07 — second playtest logged.*

## SNG-018 note — romance-system finding (from a test run)
Playtested a romance beat (Cellaceron × Teva). Findings for the romance spec:
- **Romance lands when rooted in shared history**, not stat-attraction — the scene worked because the Silent Door gave them a real thing gone-through-together; the system should gate/strengthen romance on accumulated shared events (ties SNG-037 cross-char awareness + the chronicle).
- **The charged beat is the CHOOSING**, not mechanics — the peak is the mutual yes / closing distance; write to that and FADE there. Keep the camera on wanting-and-almost.
- **Register: warm, emotionally-real, fade-at-the-yes.** No explicit content generated; the tension carries it.
- **Age/consent gate is REQUIRED content-safety, not flavor:** NPC records must carry a canonical adult age for any romance eligibility; an 'aged-up in this scene' wrapper is NOT acceptable — fix the character record instead (did this for Teva: authored at 21). The romance system must hard-gate on canonical adult age and never romance a minor-canon character regardless of framing.

*Updated 2026-07-07.*

## Playtest findings 2026-07-07 (3) — "The Commission House Lockdown" (logistics gambit vs a system)
Random character (Nix, chaos/order adept: Latticework, Wildcraft, The Long Odds, Riding Order, Waygate-dip). GM-simulated as the app's API GM would run it. A theft-retrieval gone sideways when the building locked down for a DIFFERENT thief; the antagonist was a SYSTEM (ward, sweep, questioning, clock), no villain to out-talk. Won clean, never made as the thief. Third distinct gambit shape (vs Redline social-duel, Silent Door party-puzzle).

**THE DEFINITION (Erik, load-bearing) — what makes a gambit a gambit, engine rule:**
- **A gambit is a set of connected challenges forming a whole**, each solvable MULTIPLE ways, planned across before running. Not turn-by-turn; the plan is committed then swept with maneuvers live inside.
- **The NECESSARY ELEMENTS are what define it, not the step count.** The GM must frame a gambit as: (a) 3–5 connected challenges, (b) each with multiple viable approaches, (c) a spine where earlier steps change later ones, (d) stacked fallbacks.
- **Fewer steps are HARDER; fallback requires MORE steps.** Key scaling rule: a tight 3-step plan is high-difficulty (less slack); invoking a fallback ADDS steps to the gambit (a failed primary branches into a longer path). The gambit can GROW mid-run as fallbacks fire. Difficulty ≈ inverse of step-count-slack; a fallback trades a failed short path for a viable longer one.

**Validated — fallbacks are the whole point:** Step 3 (clearance) primary line (Riding Order + truth) ROLLED 51 and FAILED; the gambit survived because a character-fit fallback (Wildcraft confusing-account) was stacked and caught it (79). Single-path plans die there; a gambit absorbs the bad roll. Both poles fired (order softened, chaos escaped) — character-native again.

**New shape confirmed — logistics-gambit-vs-system:** no villain, antagonist = ward+sweep+questioning+clock. Wins on maneuver and reframe (the keystone: stop folding OUT through the ward, fold small/sideways into an already-cleared room — repositioning, not escape). Reframe-the-tool is the recurring keystone move across all three playtests.

**GM/engine implications (fold into SNG-048 + gambit surfacing SNG-031):**
- GM frames gambits by the NECESSARY ELEMENTS (connected challenges, multi-approach, spine, fallbacks) — not a fixed template.
- Fallbacks EXTEND the gambit dynamically; the plan is not fixed-length.
- Tighter plans = harder; surface this to the player (fewer steps chosen = higher stakes, a real tradeoff to offer at planning time).

*Updated 2026-07-07 — third playtest logged; gambit DEFINITION captured.*
