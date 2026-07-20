# SNG-195 — Full prompt review against the engines and their purposes

**Author:** Aevi (PO) · 2026-07-19 · Erik-directed. **CCode's audit; this is the frame and the evidence.**

> Erik: *"Might want to have CCode do a full prompt review against the engines and their purposes to
> make sure the right content is available and used by the GM."*

---

# §1 — WHY, WITH THIS SESSION'S EVIDENCE

The prompt carries **55 context blocks** and asks for **9+ op families**. Every stage of that pipeline
has failed at least once in the last two days, and each failure was invisible until something odd
happened at the table:

| stage | proven failure |
|---|---|
| content exists | 24 of 27 lore files keyed with `.md` still attached — **80 locations never saw `the_twelve_reaches`** |
| content reaches the prompt | the GM **denied that the Blocklands exists** because place-knowledge was gated to visited-only |
| the GM is told what to do with it | `wants` sit in the prompt behind *"when a bond deepens, you MAY surface one"* — **permission, not initiative** |
| the GM actually does it | `markTeacher`, `discovery`, `markDefiningMoment` — **0 fires in 16 levels** |
| the engine reads the result | `logOpOutcome` instruments **one op**; the panel rendered 31 unmeasured ops as *"never fired"* |

**Five stages, five proven failures, five different causes.** No single existing check spans them.

## §1a — a fresh finding while framing this: 15 authored NPC fields are never read

Audited live at HEAD. Excluding my own documentation fields (`domainsNote`, `curriculumNote`), the
functional ones:

- **`reactsToReputation` — authored on 40 of 42 NPCs, read by NOTHING.** Reputation is a whole system;
  40 people carry authored reactions to it and no code consumes them. **This is the largest orphan in
  the corpus.**
- `universalRole` (6), `recruitable` (1), `notes_for_gm` (1), `trueName` (1), `arcOwner` (1),
  `poleSignature` (1), `innatePrecursorSource` (1), `abilitiesFlavor` (1), `whatHeIs` (1),
  `sensitivity` (1), `companyNote` (1)

**`recruitable` and `notes_for_gm` are the ones to look at first** — both are instructions to the
engine that the engine never receives.

**Correction to my own claim while writing this:** I first reported `fears` as orphaned. **It is read**
— in `generate.js` and at `app.js:1807`. Whether it reaches the *turn* prompt is a genuine open
question and one of the first things this review should settle.

---

# §2 — THE AUDIT: five columns, per engine

For **every** engine/system, answer all five. **A gap in any column is a defect, and they have
different fixes.**

1. **PURPOSE** — one sentence. What is this system for? *(A system nobody can describe in one line is
   a design smell — SNG-183 §3a.)*
2. **CONTENT IT NEEDS** — which authored fields does it depend on?
3. **IN THE PROMPT?** — does that content actually reach the model, in a form it can use? *(Raw JSON
   at ~2,900 tokens is technically present and practically absent — CCode's own lore finding.)*
4. **INSTRUCTED?** — is the GM told what to DO with it, as an instruction rather than a permission?
   **This is the column that catches the most and no existing gate covers it.**
5. **OBSERVED?** — does it fire? Firing counts per op, per SNG-190 §3.

## §2a — the review must go BOTH directions

- **Forward:** every engine → is its content in the prompt and used?
- **Backward:** every one of the 55 blocks → **which engine needs this, and what happens if it is
  wrong?** A block nobody can name a consumer for is prompt weight spent on nothing, and prompt
  weight is exactly what SNG-179 showed is scarce.

# §3 — WHAT COMES OUT

1. A table with the five columns filled for every engine, **committed to the repo** (`po/results/`),
   not reported in chat.
2. **A ranked list of gaps**, because they will not all be worth fixing.
3. **Every "permission" that should be an instruction**, flagged as a class — `wants` is the known
   one and it will not be the only one.
4. **Blocks that could be cut.** 55 is a lot, and SNG-179 proved that a thin op beside a rich one
   loses. **The same is true of blocks: a block nobody reads is crowding the ones that matter.**

---

# §4 — SNG-194 AMENDMENT: fire when it MAKES SENSE, not on a counter

> Erik: *"Just make sure it fires when it makes sense."*

**A rate limit is the wrong instrument.** "One scene in five" will land the offer in the middle of a
duel as readily as in a quiet moment. **The trigger should be scene-state, not a counter.**

**Room exists when:**
- something just resolved — a scene closed, an obstacle cleared, a deal struck
- the player has arrived somewhere rather than gone somewhere
- the scene is a lull: conversation, travel, rest, making
- the player's own thread is between beats rather than mid-swing

**There is no room when:**
- an action is unresolved this turn
- a negotiation, duel, encounter or gambit is live
- the player is mid-plan or mid-question
- something arrived unprompted in the last scene or two

**The rule in one line: an offer arrives in a GAP, never in a GRIP.** Rarity then takes care of itself
— gaps are naturally uncommon — and the offer lands where it reads as the world breathing rather than
the game interrupting.
