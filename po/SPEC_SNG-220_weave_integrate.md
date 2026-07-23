# SPEC — SNG-220: "Weave it for me" should INTEGRATE what the player typed, not overwrite it
## Aevi (PO) · 2026-07-22 · verified at origin

> **Erik:** *"During creation there's a Weave This button — what does it do? I was hesitant to hit it after
> typing content because I didn't want to lose what I typed, but I'd have liked Weave It to INTEGRATE what I
> provided into the character sheet with the lore from the land."*

## §1 — What it does now (verified) — and Erik's fear was justified
The bio step (app.js:2573) "✦ Weave it for me" calls `generateBio` (gm.js:587), which:
- **Receives ONLY `{name, origin, background, attributes}`** — NOT the player's typed bio fields. Verified at
  the call site (app.js:2581): `generateBio({ name, origin, background, attributes })` — `read()` (the typed
  content) is never passed in.
- The merge (app.js:2582): `renderBioStep({ ...read(), ...draft-nonempty-fields })` — reads what the player
  typed, THEN overlays the AI draft, and **the draft WINS on any field it fills.** So:
  - Blank fields → filled by the weave (safe).
  - **Fields the player already typed → OVERWRITTEN** if the AI produced anything for them.

**So both of Erik's instincts were correct:** (1) it CAN clobber what he wrote (draft wins the merge), and
(2) it does NOT integrate his input with the land's lore — because his input never reaches generateBio. It
generates FRESH from origin/background and overwrites, rather than building ON what he gave it.

It DOES ground in the land (origin → Heights sonic / Plateau light / valley farming culture; the sys prompt
is rich with Valley-of-Echoes lore) — that half works. The missing half is using the PLAYER'S words as the
seed.

## §2 — Outcome wanted: integrate, don't replace
"Weave it for me" should take what the player has ALREADY written as raw material and WEAVE the land's lore
INTO and AROUND it — completing the blanks, enriching the sparse, grounding the freeform in the world —
without discarding their intent.

### §2a — Pass the typed bio INTO generateBio
The one necessary change: `generateBio` must receive the player's current field values. Call site passes
`read()`; the function signature takes them.

### §2b — The prompt does integration, not replacement
generateBio's system prompt gains an INTEGRATION directive:
- *"The player has already written some of this. Their words are the SEED — preserve their intent, their
  specifics, their voice. Where a field is FILLED, ENRICH it (ground it in the land, add texture, reconcile
  it with their origin/background) but keep what they meant. Where a field is BLANK, author it to FIT what
  they've already established. Never contradict or discard what the player wrote — weave the Valley's lore
  INTO their story, don't replace their story with yours."*
- The land-lore it already knows (origin culture, Valley-of-Echoes setting) is now woven INTO the player's
  material rather than generated in a vacuum.

### §2c — Non-destructive by design + a safety affordance
- Because §2b PRESERVES filled fields (enriches, never discards), the overwrite fear is resolved at the
  source — the weave respects what's there.
- Belt-and-suspenders (Erik's hesitation): the weave result should be reviewable/undoable — it re-renders the
  step with the woven draft in EDITABLE fields (it already re-renders editable — good), so the player sees
  the change and can adjust. Consider a tiny "revert to what I wrote" if the weave goes somewhere they
  dislike (stash the pre-weave `read()` for one undo). Low cost, removes all hesitation.
- **Label the button honestly:** "✦ Weave it for me" reads as "replace." Once it integrates, something like
  "✦ Weave in the land" / "✦ Enrich with the valley" signals it BUILDS ON your words, not overwrites — which
  is exactly what would have made Erik comfortable hitting it.

## §3 — Why this matters
Character creation is the first real authorship moment; a button that silently overwrites a player's typed
intent teaches them not to trust the tool at the exact moment they're investing in the character. Making
weave INTEGRATIVE turns it from a risk ("will this eat what I wrote?") into the collaboration it should be
("the land and I are writing this together") — which is the whole spirit of the game.

## OWNERSHIP
- **Aevi (me):** the integration prompt directive (§2b) — I author the generateBio system-prompt change (it's
  prompt content, my lane).
- **CCode:** pass `read()` into generateBio (§2a), the undo-stash + button relabel (§2c) — small app.js/gm.js
  wiring.

## GUARDS
- **Preserve player intent above all** — the weave enriches and completes; it NEVER contradicts or deletes
  what the player wrote. If a field is filled, the player's meaning survives.
- **Editable + reviewable** — the woven result lands in editable fields (already does); the player always gets
  the last word.
- **Ground in the land, but don't drown the player** — the lore serves THEIR character, not the reverse; a
  weave that buries the player's fishing-hamlet in generic Valley lore has failed.

## OPEN QUESTIONS — CCODE ROUND 2
1. Undo scope — a single "revert to what I wrote" (stash pre-weave read()), or full per-field revert? Single
   is probably enough.
2. Should weave be re-runnable on already-woven text (enrich further), or once per session? (Re-runnable is
   fine if it keeps integrating rather than compounding.)
3. Button copy — Erik's call on the relabel ("Weave in the land" / "Enrich with the valley" / keep "Weave it
   for me" now that it's safe).
