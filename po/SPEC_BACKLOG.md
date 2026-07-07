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
