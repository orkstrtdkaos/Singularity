# Singularity — Running Spec Backlog

Engine-needing work accumulated during the 2026-07 content-expansion sessions. All CONTENT for these is authored/authorable at origin; these are the CODE pieces. Aevi maintains this list; Erik greenlights turning from content to systems. Nothing here blocks continued content authoring.

---

## Pending ratified builds (small, content ready)
- **SNG-BATCH-5** — soft class-cost (2x secondary) + branch forks + feel refinements. Content ready (skill_capacity.json crossClass, branch_forks.json). Ratified, assembled, awaiting CCode. *(Note: prior local CCode run reportedly got "almost all the way through" — verify state before re-running.)*

## Systems batch candidates (medium specs; share machinery)
- **Money + The Game + Recruitment** (the_game_and_coin.json content ready). Wallet + wealthLevel; location-flavored prices; Game-standing track + stake-transfer; recruit-as-party-member with joinReason {pay|purpose|bond} + loyalty. Reuses check/challenge/bond engines.
- **SNG-017 — Creation overhaul.** Origins = areas of the world (not just Valley); start location follows origin; innate-talent step (innate_talents.json ready); ability pool from origin's tradition; optional will-channel pick. Data-drive from origins.json (Aevi owes content).
- **SNG-018 — Romance/intimacy track.** Relationship track beyond bond; romanceable flag + fit-hints (Aevi owes content); staged, consent-respecting, GM-honored, surface-appropriate register. Reuses relationship/bond/reputation.
- **SNG-016 — 12-axis skill breadth.** RESOLVED as design (Reaches = crafts; six near-axis traditions authored). Remaining: engine derives adjacency/purity from poleIntensity vectors; learning a Reach tradition gated by presence-in-region; geographic leveling. Design proposal delivered via the coordinate/Reach lore.

## Engine flags from world-model corrections (light)
- **Pole-intensity model** — engine reads location.poleIntensity (independent 0..1 poles), computes co-firing + purity from it; net-signed derivable for back-compat. (Locations already reseeded.)
- **Axes-as-disposition** — framing only; no mechanical change (GM narration guidance in world_framing.json).
- **World (not Valley)** — later clean rename of valley/ pack to world/ (do NOT mid-flight; breaks manifest). Origins startable outside the Valley (ties to SNG-017).
- **Manifest locals** — locations gain optional seedFiction + nativeLogic (GM enforces a native domain's internal rules as LAW inside it); creatures gain native-domain tag + diffusion weight so encounter tables place them out-of-context. Content-heavy, one light enforcement flag.
- **Will-expression / Inscription** — abilities gain optional `inscribable` flag + rune-cost; inscription = slow/persistent cast channel; substrate-density gates where runes/inscription work. Cross-tradition modality.
- **Innate talents** — creation stores character.talent; permanent, non-spendable; grows in expression. (Ties SNG-017.)
- **Methods** — rune-casting/coordinate-reading/attunement resolve as tool-or-skill-gated checks that REVEAL poleIntensity (rune dice) or adjacency (compass); light method-resolution path.

## Notes
- All content (locations, NPCs, companions, items, Reach traditions, lore, jewels, domains) is authored directly to origin and needs no engine work to EXIST as data — only these systems to fully ACTIVATE their mechanics.
- Suggested grouping when Erik greenlights: **SNG-BATCH-6 = SNG-017 creation + SNG-018 romance + money/Game/recruitment** (they share relationship + economy machinery). Pole-intensity + manifest-locals enforcement flags fold in as small additions.

*Maintained by Aevi (PO). Last updated 2026-07-07.*

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
