# SPEC — SNG-110: Portrait as earned record — player description + game context, and image management
## Aevi (PO) · 2026-07-14 · authored to spec · **awaiting CCode ROUND 2**

> **One line.** The portrait should combine the PLAYER's own physical description with earned game context: the runebound spear the player forged shown as *theirs* (not a generic item name), a committed partner (Pell) optionally in-frame, the arc reflected. The player can always supply a fresh description for a specific scene/portrait. And the player can DELETE images.

> **Verified at HEAD `v1.8.67`.** `characterPromptSeed` (art.js) already assembles: form + name + origin + background + `carrying [first 3 inventory items]` + arc/motivation. **So gear ALREADY influences the portrait** — but (a) the physical description is derived (form/origin), not player-authored; (b) gear appears as a bare item *name*, not "the runebound spear you forged"; (c) a companion/partner is not gear, so Pell can never be in-frame; (d) there is no image-delete. Gallery add exists (`addGalleryImage`); no delete.

## THE CHANGE

### 1. Player-authored physical description (primary), game-context (secondary)
- `character.appearance` becomes the PLAYER's field — what they write is the physical core of the prompt (already partly true; make it authoritative and editable).
- Game context is *appended*, not replacing: earned gear named with provenance ("a runebound spear, self-forged"), current arc, notable marks from deeds. `characterPromptSeed` gains a context layer that pulls provenance from item records (a forged/named item carries how it came to be) rather than the flat name.
- **Player override per generation:** an optional one-off description field for a specific scene/portrait — "generate this portrait with: [text]" — used for that image only, not persisted over the base appearance. (Erik: "a player can always put a new description in if they want a particular scene or portrait.")

### 2. Companions / partner in frame (opt-in)
- A committed partner (SNG-108 partner-stage) or a chosen companion can be included in a portrait on request: "portrait of Silas and Pell". Their `appearance` seeds their half of the prompt. Opt-in per generation, never automatic (an auto-inserted second figure would wreck solo portraits).

### 3. Earned items carry provenance into the prompt
- A forged/named/grown item (the Unfinished Spear, gate-grown) records its provenance; the portrait names it as earned ("the spear he forged and named"), not "spear". This is the attention-makes-real thesis at the portrait layer — the thing you grew shows up as *yours*.

### 4. Image management — DELETE (Erik's ask)
- `deleteGalleryImage(character, imageId)` + UI control to remove a portrait/gallery image. Regenerate replaces; delete removes. (Currently only add exists.)
- Deleting the primary portrait falls back to regenerating from the current seed (never leaves the character imageless).

## ENGINE SURFACES
| Module | Change |
|---|---|
| `engine/art.js` | `characterPromptSeed` gains player-`appearance`-primary + provenance-aware gear + optional companion + one-off override param. `deleteGalleryImage`. Provenance pulled from item records. |
| `app.js` | Editable appearance field; per-generation override input; "include [partner/companion]" toggle; delete control on portraits/gallery. |
| item records | Forged/named/grown items carry a short provenance string (the spear already has an evolution history — surface it). |
| `tests/*` | Player appearance leads the prompt; forged spear named with provenance; companion included only on opt-in; delete removes + primary-delete regenerates; FLOORS still applied (minor ≤PG, AUP) after all additions. |

## GUARDS
- **THE FLOORS run AFTER all additions** — player-authored description, companion, provenance all pass through `sanitizeImagePrompt` (minor ≤PG, AUP, prohibited-strip). A player description does not bypass the floors. Non-negotiable.
- Companion inclusion is opt-in per generation — never auto.
- Delete never leaves a character imageless (primary-delete regenerates).

## OPEN QUESTIONS — CCODE ROUND 2
1. Does the item record (esp. the evolution-engine spear) already carry a provenance/history string to surface, or does it need composing from the gate history?
2. Gallery image identity — is there a stable per-image id to target for delete, or are gallery images positional?
