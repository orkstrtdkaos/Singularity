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

## SNG-020 — Generative content with persistence (new NPCs/locations/domains on the fly)
Erik 2026-07-07: once the basics exist, the engine should GENERATE new NPCs, locations, etc. generatively AND persist them. Build on the authored content as templates/seeds:
- **Generation.** When the GM needs a person/place not in CONTENT, generate one from the local disposition (poleIntensity of the current area), the schema (npc/location fields), and any seedFiction (manifest domain). Output validates against the schema; flavor pulls from the area's Reach + jewels + manifest-domain logic. A generated NPC gets personality/wants/fears/knowledge; a generated location gets poleIntensity + tags + questSeeds — same shape as authored content so nothing downstream knows the difference.
- **Persistence.** A generated entity is WRITTEN as a durable node (into the character's codex as a person/place topic with entityId, and/or into a per-save generated-content store) so it recurs with the same identity, facts accumulate on it (via SNG-019), and it can be revisited. Generated NPCs persist their situation via the statusNote/facts machinery already built. No more one-scene ghosts.
- **Consistency.** Generation is disposition-consistent: a person generated in the Stillhold reads peace+falsehood; a place generated in the Blocklands obeys block-logic. The coordinate model is the generator's grammar.
- **Native-domain rules-as-law** (from manifest_locals): inside a manifest domain, generated content + GM narration obey the domain's nativeLogic.
- **Engine needs:** a generate-entity path (LLM-authored to schema, validated), a persistent generated-content store keyed to the save, entityId minting that SNG-019's resolver honors, and disposition/seedFiction as generation inputs. Reuses codex + facts + npc/location schemas.
- **Smoke:** a generated NPC persists across scenes with stable identity + accumulating facts; a generated location can be re-entered; generated content matches local disposition; a manifest-domain generation obeys its logic; nothing downstream distinguishes generated from authored.

*Both ratified-direction (Erik). SNG-019 is small (resolution + merge + UI). SNG-020 is medium and depends on SNG-019's entityId resolver. Fold into the systems batch.*

*Updated 2026-07-07.*
