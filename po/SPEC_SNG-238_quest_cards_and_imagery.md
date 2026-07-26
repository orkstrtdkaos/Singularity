# SPEC — SNG-238: Quest cards need concrete first steps + rendered imagery (all quests, per stage + decision)
## Aevi (PO) · 2026-07-25 · from Erik's screenshots (the bestiary hunts rendering empty)

> **Erik (screenshots of 3 hunt quests):** "These need concrete first steps for the player to understand. Plus
> they look empty and broken. Make them tidy and better — plus get a good image rendered for them, in fact for
> ALL quests. Make the image text specific and detailed, something the quest would talk about — perhaps for
> each stage and decision."

## §1 — Two problems, verified
1. **The hunts rendered EMPTY (a shape seam — FIXED by Aevi).** The 7 bestiary hunts wrote `stages` as PLAIN
   STRINGS, but the quest-detail UI's `stageRow` (app.js:6075) renders `s.id` / `s.title` / `s.objective` — so
   string stages produced empty rows, dead radio circles, and a "Mark this stage met" button wired to
   `undefined`. **That is the broken look in the screenshots.** → Aevi rebuilt all 7 as real stage OBJECTS
   matching the working schema (the_second_thread's shape), each with a CONCRETE first step (stage 1 is always a
   clear "go HERE, do THIS" action, not an abstract goal). content_ci green. **The visible break is fixed.**
   (This is a SNG-232 seam — added to the ledger below.)
2. **No quest renders an IMAGE (net-new capability — CCode).** Verified: `imagePrompt` is today ONLY a per-turn
   GM field (app.js:3260, the beat's headline art). NO quest, stage, or outcome carries a rendered image. So
   "get an image for all quests" is new wiring, not a content gap alone.

## §2 — Concrete first steps (Aevi, DONE for the hunts; a standing content rule)
Every quest's FIRST stage should be a concrete, actionable "here's what to do first" — a place to go, a person
to find, a thing to read — never an abstract statement of the goal. The screenshots showed a play-triangle and
blank rows; a player needs to know their NEXT physical step. Aevi rebuilt the hunts this way (e.g. "Go to the
tree-line and read what the stag has become" not "understand the stag"). Standing rule for all authored quests:
stage 1 answers "what do I do RIGHT NOW," in the fiction's own terms.

## §3 — Quest imagery: the render pipeline (CCode) + the prompts (Aevi)
Erik wants imagery for ALL quests, per stage and per decision, with SPECIFIC prompts ("something the quest
would talk about"). Split:

### §3a — the fields (Aevi authors; the contract)
- **`quest.image`** — a quest-level header image prompt (the quest's iconic scene). Aevi authored these for the
  7 hunts (e.g. the stag's luminous antlers at the misty tree-line).
- **`stage.imagePrompt`** — per-stage art (the beat that stage depicts). Authored for the hunts.
- **`outcome.imagePrompt`** — per-decision/ending art (what that ending looks like). Authored for the hunts.
All SPECIFIC and detailed — drawn from the quest's own fiction (the creature, the place, the character), never
generic. This is the "specific and detailed, something the quest would talk about" Erik asked for.

### §3b — the render pipeline (CCode)
Extend the EXISTING image pipeline (the per-turn `imagePrompt` → `ensureImage`/moment-render path, app.js:3260)
to quests:
- **Quest-detail card:** render `quest.image` as a header (generate-on-first-view, cache like place/ability
  images per SNG-223, glyph/blank fallback while generating). This alone fixes "they look empty."
- **Stage art:** render `stage.imagePrompt` on the CURRENT/active stage (and revealed past stages) — the card
  shows the beat you're on. Generate-on-reach (when the stage becomes current), not all upfront.
- **Decision art:** render `outcome.imagePrompt` when the endings surface (the decision point) — each ending
  shows what it looks like, so the choice is felt.
- **Generate-on-contact, cached** (SNG-223 discipline) — never batch-render every quest's every stage; render
  the header on view, a stage on reach, an ending when the decision appears. Respect the content-rating ceiling
  (the pipeline already clamps).

### §3c — ALL quests, not just the hunts (Aevi owes)
The 4 marquee structured quests + the flat quests need `image`/`stage.imagePrompt`/`outcome.imagePrompt`
authored too. Aevi owes a pass. For GENERATED quests, the generator should author an `image` prompt at mint
(ties SNG-234 born-whole — a quest born without an image prompt is a hollow birth; add `image` to the quest
gen template's produced fields). So authored quests get hand-written prompts; generated quests get a
generator-authored one; NO quest renders imageless.

## §4 — tidy the empty look (CCode, small)
Even before images land, the card should not read as broken: the "This isn't finished yet. Play it —" line is
good, but the empty stage radios with no text (the string-stage bug) were the real ugliness — FIXED by §1. Any
remaining polish (stage spacing, the header band) is a light CCode UX pass; the structural emptiness is gone.

## OWNERSHIP
- Aevi: §1 hunt stage-shape fix (DONE ✓), §2 concrete first steps (DONE for hunts, standing rule), §3a the image
  PROMPTS (done for hunts; owed for marquee + flat quests), §3c the all-quests prompt pass.
- CCode: §3b the render pipeline (quest/stage/outcome image → the existing ensureImage path, generate-on-
  contact, cached), §3c the generator authoring `image` at quest-mint (ties SNG-234), §4 any residual UX polish.
- Seam ledger: add `quest-stages-must-be-objects` (string stages → empty render) to seams.json (SNG-232).

## GUARDS
- **Stage objects, never strings** — a quest stage MUST be an object with id/title/objective; a string stage
  renders empty. The seam-auditor (SNG-232) now guards it. (This is exactly the SNG-232 class — a producer
  wrote a shape the consumer couldn't render.)
- **Prompts specific, never generic** — "something the quest would talk about" (Erik): the creature, the place,
  the person, by name/detail. A generic "a fantasy quest scene" fails the ask. Ground every prompt in the
  quest's own fiction.
- **Generate-on-contact, cached** (SNG-223) — never batch-render; header on view, stage on reach, ending on
  decision. Image budget respected.
- **Rating-clamped** — quest art rides the same content ceiling as all imagery; the pipeline already clamps.
- **First stage is concrete** — every quest's stage 1 is an actionable next step, not an abstract goal restatement.

## OPEN QUESTIONS — CCODE ROUND 2
1. Quest header render: reuse the place-image component (SNG-223 pattern) or a new quest-card image slot? Lean:
   reuse the cached-image component, keyed by quest id.
2. Stage art placement: inline per stage-row, or one image that swaps to the current stage? Lean: current-stage
   image in the card header area, swapping as stages advance (cheaper than N images; shows where you ARE).
3. §3c generator: add `image` to the quest gen template's REQUIRED set (SNG-234 born-whole), so a generated
   quest can't mint imageless? Lean: yes — required, repaired if missing, same as the NPC interiority fields.
