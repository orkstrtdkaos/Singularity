# SNG-239 quest clarity (earned-reveal nudge) + CCODE-27 braid/discovery name recognition

**CCode · 2026-07-25 · SNG-239 v1.8.279 (`937ef541`) · CCODE-27 v1.8.280 (`cafe83ff`) · npm test exit 0 (2497 PASS).**

## SNG-239 — the earned quest reveal must be STATED, not withheld

Erik: quests read opaque — the GM abstracts an EARNED stage reveal into metaphor + perpetual mystery. Aevi's diagnosis: Rule 4 ("reveal in fragments") mis-applied to earned `change`s; under the 114-MUST load "be mysterious" beats "report progress." **This is the exact class the SNG-236/237 finding named** — a soft good rule dropped under prompt saturation. Three complementary parts:

1. **Context** (`quests.js structuredQuestsForGM`): the current stage's `change` is now handed to the GM as *"WHEN SATISFIED, STATE PLAINLY (the earned reveal)"* — so the GM has the concrete truth to name, not just the objective/condition.
2. **Rule** (`gm.js`, the **conditional** structured-quest directive — deliberately NOT the always-on constitution, so it doesn't deepen the 114-MUST load): Aevi's QUEST CLARITY rule — a stage reveal is a PAYOUT not a secret; name it first-read-clear; image may accompany but never replace the plain truth; open questions DROP as a quest advances; Rule 4's "earned fragments" is for GM-eyes secrets only.
3. **The nudge** (the Fix-A/SNG-237 pattern — the reliability net): when a stageOp completes a stage, the engine hands its `change` to the NEXT beat as a HARD *"STATE IT PLAINLY, opacity drops"* directive (`pendingStageReveal` → `stageRevealDetail` → registry row → `gm.js` scene.push). A hard directive the load can't drop, catching what the soft rule (part 2) drops. Carries the decision-point flag so clarity is enforced hardest where it matters most.

The `change` already fired as a `*✦ …*` aside on completion; the gap was the GM's *prose*. Parts 1–2 make the same-turn prose state it; part 3 guarantees the next beat pays it out. **Owed:** Aevi the change-statability audit (§4); Erik the tone confirm (state-plainly reverses a stay-mysterious default).

## CCODE-27 — braids/discoveries invoked by NAME were unrecognized

Erik: *"The GM fails to recognize braid/discovery skills"* — screenshot of the GM rejecting **"Ashen Meridian"** (a braid the character holds) as "not among your known abilities."

**Diagnosed from the synced save `char-mrhs8286`** (not a repro): the engine is NOT at fault — `abilitiesForGM` **does** surface "Ashen Meridian" and all 7 braids + 4 discoveries to the GM by name (verified). The bug was in **`parseIntent` (gm.js)**: it fed the intent-parser the abilities **by id only** (`character.abilities.map(a => a.abilityId)`). A braid's id is `braid_order_sense_palework`; the player invokes it by its **name** "Ashen Meridian". The parser never saw the name → returned `abilityId: null` → the GM narrated it as unknown. (The main GM turn and the skill panel list by name, so only the intent-parse was name-blind — a subtle, single-call gap.)

**Fix:**
- `parseIntent` now takes the catalog (`app.js` passes `fullCatalog()`) and lists each owned ability as **"Name [id]"** (base names from the catalog, braid/discovery names from `customAbilities`); the system prompt tells the parser to match the player's words to the NAME and return the [id].
- `sanitizeIntent.resolveAb()` robustly resolves a raw abilityId that's a bare id, a "Name [id]" echo, or a bare NAME (via `customAbilities`) — so a name-invocation resolves even if the model skips the bracket.

**Verified vs the real save:** "Ashen Meridian", "Ashen Meridian [id]", the bare id, and "You Shall Not Pass" (a discovery) all resolve to the correct owned id; a non-ability → null.

## Note for Aevi
CCODE-27 is a CCode-initiated fix (CCODE-NN namespace, per the id convention) — no SNG number coined. SNG-239's nudge reuses the Fix-A directive pattern; if the Fix-D prompt-load trim lands, both the QUEST CLARITY rule and the ability block get more room, which is the deeper cure for both this and the braid-recognition-under-load risk.

*— CCode. Earned truth gets stated; a craft called by its name is a craft you can use. status: complete_pending_review.*
