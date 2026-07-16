# SPEC — SNG-101b: Native-grants-at-creation — complete the deferred wiring + author the content
## Aevi (PO) · 2026-07-14 · authored to spec + content shipped · **awaiting CCode ROUND 2**

> **One line.** A character should be *granted* their primary tradition's Tier I–II basic natives at creation, by right of being what they are — the "starter kit." SNG-101 deferred this wiring until natives were tagged; **tagging happened this session (247/247)**, so the deferral is now unblocked. This completes it: authored grant content + the creation/retro wiring.

> **Verified at HEAD `v1.8.63`.** **The deferred piece is genuinely absent** — `nativeGrantsFor` / `combinationsAvailableFor` / any native-grant applier are **not in `progression.js`** (CCode's earlier report said the readers were "built"; origin says otherwise — LLW: origin wins). Creation assigns starting abilities via the generate/GM path, **not** a native-grant table. **`attribute_gates.json` has no native-grant entries.** Live proof: Silas Weir, a level-7 **primary** ashwarden, held only 2 of his 7 by-right Tier I–II natives (hand-corrected this session; the systemic gap remains for the next character).

## THE GRANT MODEL — data-driven, not hand-picked (content authored: `po/SNG-101b_native_grants.json`)
At creation, a character is granted, from their **primary** tradition:
- **Anchors** (all Tier-I `levelReq==1` natives) — always, by right.
- **+ Tier-II basics matching the character's build lean** — the highest of their `mental / physical / practical / social` investment — falling back to **mental** (the caster spine) when the lean pool is thin.
- **Capped** at `grantCap` (recommend **5**, tunable in `resolution.json`) so the grant is a *foundation*, not the whole tree. Points still buy the rest.

**Why data-driven:** each tradition's basics already cluster by `ability.attribute` (ashwarden = mostly mental + one practical Wither + one social Dread; marcher = mostly physical). So "caster vs martial vs artificer" **falls out of the attribute tags** — no per-tradition hand-authoring. Worked examples (computed from live content):
```
ashwarden (mental lean)   -> deathsense, palework, the_grey_hand, the_grey_road, the_kept_breath
ashwarden (practical lean)-> deathsense, palework, wither, the_grey_hand, the_grey_road
marcher   (physical lean) -> read_the_fight, disarm, the_edge, the_stand, the_advance
cogitant  (mental lean)   -> mind_read_folk, total_focus, noesis, the_clear_path, the_long_form
```
The content table (`traditionNativeGrants`, 27 traditions) declares each tradition's `anchors` + `byLean` pools; the engine computes the character-specific subset.

## THE WIRING
| Module | Change |
|---|---|
| `content/.../resolution.json` (or a new `native_grants.json` registered in manifest) | Add `traditionNativeGrants` + `grantCap`. (Content authored in `po/SNG-101b_native_grants.json` — merge into the rules bag.) |
| `engine/progression.js` | `nativeGrantsFor(character, rules) → [abilityId]` — computes anchors + lean-matched basics, capped. **`applyNativeGrants(character, rules)`** grants any missing ones at **rank 1**, idempotent. |
| `engine/*` (creation) | Call `applyNativeGrants` at character creation, after primary tradition + attributes are set. |
| `engine/progression.js` (retro) | **`retroNativeGrants(character, rules)`** — one-time, modeled exactly on the existing `retroLevelGrants` (versioned + flagged): grants missing primary-tradition basics to existing characters, bumping `grantsVersion` to 2. **NEVER lowers an owned rank or removes an ability (Law 14)** — only adds missing ones at rank 1; an already-owned basic (e.g. Silas's palework r2) is left at its earned rank. |
| `tests/*` | A fresh caster ashwarden starts with the mental death-core; a martial one gets Wither; grant is capped; retro adds only missing basics and never touches earned ranks; idempotent (second call grants nothing). |

## GUARDS
- **Law 14 absolute:** grants only ADD (rank 1); never lower a rank, never remove. An owned basic keeps its earned rank.
- **Idempotent + versioned:** `grantsVersion` gates the retro so it runs once; re-running grants nothing.
- **Foundation, not tree:** `grantCap` keeps the grant a starter kit; skill points still buy the rest of the tradition.
- **Primary only:** grants come from the *primary* tradition. Secondary/tertiary basics are learned/earned, not granted (consistent with the domain-access ceilings).

## RELATION TO SNG-101
This IS SNG-101's deferred native-grant piece, now unblocked by the classification pass. It does not re-open promotion/acquisition/foreclosure — those shipped. It adds only the at-creation + retro grant that SNG-101 explicitly held back. Sequenced anytime after the classification pass (done); independent of SNG-098.

## OPEN QUESTIONS — CCODE ROUND 2
1. Best home for `traditionNativeGrants` — merge into `resolution.json`, or a new manifest-registered `native_grants.json`? (Recommend the latter: it's large and self-contained.)
2. Exact creation hook — where is primary tradition + attributes finalized so `applyNativeGrants` runs after both are set?
3. Confirm `retroLevelGrants`' versioning pattern is the one to mirror (it uses `grantsVersion>=1`); native retro should use a distinct flag or the next version bump so the two retros don't collide.
