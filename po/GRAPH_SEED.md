# Graph Seed — Singularity (pending MCP write)

*Written 2026-07-04. The memory MCP server was unresponsive at session close (two 4-minute timeouts on search + create). This file preserves the exact entities/observations/relations to replay into the knowledge graph once the server is back. Aevi: on next session, if these aren't in the graph, create them from here.*

## Entities

### Singularity  (Project)
- AI-game-mastered narrative RPG "The Valley of Echoes". Public repo github.com/orkstrtdkaos/Singularity, live on GitHub Pages. Built by CCode; Erik plays it, incl. on phone.
- Tether-like architecture: pure ES modules, GitHub Pages, no backend. Founding law: model never rolls/decides/edits state; code owns dice+state, model owns words. Player supplies own Anthropic API key (localStorage).
- Authoritative ref SYSTEM_SPEC.md. PO protocol like Tether/AEVI_CCODE: po/ALERT.md tasks, po/BACKLOG.md queue, po/results/, only Aevi (PO) closes. Ratification split: Aevi=content/tuning/bugspec/roadmap; Erik=design laws, GM-contract load-bearing rules, resolution math, shared-world concurrency.
- Aevi = Product Owner (named Aevi in-game). Erik = PM. Established 2026-07-04.
- Write access: fine-grained PAT (ErikIAm-scoped) 403s here; classic read PAT carries writes because repo is public. Accepted channel until CCode widens the fine-grained PAT.
- 12-axis spectrum (spectrums.json) = a cosmic-address mechanic; the framework wearing game mechanics.
- Shipped 2026-07-04: SNG-002 encounters (duel/challenge/puzzle, lethal-avoidable), SNG-002b lethal clamp, SNG-001 party-play phase1 (shared scenes), SNG-BATCH-1 (SNG-003 abilities 8->36, SNG-007 character sheet+inventory, SNG-005 companion bonds+evolution). 248 checks. Through v1.3.0.
- Queue: SNG-009 hotfix -> SNG-010 Practice & Emergence -> SNG-011 World Legibility & Precursor Depth -> SNG-001 remainder -> SNG-004 origins + SNG-008 Heimrun/Mavens/framework.
- SNG-010 (Erik-designed, ratified): aspiration slots, use-based ranking (0-cost, levelReq-gated), emergent combos from co-activation; governor = rarity gradient (tree-growth > combos > rare novel), reuses discovery/newAbility.
- SNG-011 (queued): fix map sub-place render, location vectors made perceivable, wire Precursor tier, skill-catalog KG visual by class with level-reqs.
- Framework weave: Heimrun rune shrine (daily omen), Council of Mavens NPCs, Precursor mystery = contraction/foreclosure behind the water crisis, glimpsed never explained.

### Singularity Ability Catalogs (Aevi-authored)  (GameContent)
- valley_craft.json: 12 unaligned abilities (Wayfinding, Greenlore, Mediator's Tongue, Tinker's Hand, Beastfriend, Stonewise, Rivercraft, Quiet Step, Storykeeper, Hearthbinding, Keen Appraisal, Old Roads). Every rank names its hard CANNOT.
- emergence_recipes.json: authored combo templates. Seed resonant_sight (prism_sight+sonic_resonance, ripen 6) matches Erik's play; + wardens_chord, true_ward, a branch template.
- precursor.json: 6 gated/perilous abilities (Address-Sense, Latticespeak, Wake the Line, Foreclose, Unmake Seal, Hold the Aperture). Foreclose drifts wielder toward foreclosing axes; Hold the Aperture reverses it. Not at creation; learned only. Manifest v0.4.0.
- +16 harmonic/radiant authored by CCode to Aevi's bar, PO-ratified. Catalog = 36 unique ids.

### Erik Singularity characters  (GameCharacter)
- ENT character with an Aevi companion (mote-swarm; can't lie about what it saw; ability Motes' Vigil; stage-2 Kindled Chorus).
- Character with Cellaceron, a GM-generated crafter-mage companion.
- Combines Prism Sight + Sonic Resonance (seeded resonant_sight). Wants the named "Waystaff" to evolve via Aevi-integration (SNG-010 Phase C).
- Field reports drive the backlog (quiet->encounters; no backstory view->character sheet; flat list->location-collapse; op-loss->SNG-009).

## Relations
- Aevi  is Product Owner of  Singularity
- Erik  is PM of  Singularity
- Singularity  is sibling project to  Tether  (shared PO/CCode architecture)
- Singularity Ability Catalogs (Aevi-authored)  belongs to  Singularity
- Erik Singularity characters  played in  Singularity
- Singularity  integrates  Heimrun  (rune shrine)
- Singularity  expresses  the framework  (spectrum as cosmic address; contraction as antagonist)
