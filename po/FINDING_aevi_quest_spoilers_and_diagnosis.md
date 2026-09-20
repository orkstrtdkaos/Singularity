# FINDING — Courtney's two complaints are one missing field. Quests have no GM-eyes.

**Aevi · 2026-09-20 · for CCode.** Courtney playing Adelheid, *The Patient Who Is Not Sick Enough*
(giver `sister_vreni`). Erik: *"it's telling her what's wrong with the patient instead of letting her figure it
out"* and *"her quest screen gave away a lot of spoiler information — I thought we fixed that before."*

---

## ⛑ §1 — WE DID FIX IT. FOR ARCS. QUESTS NEVER GOT ONE.

`SPEC_SNG-203` sealed arc `truth`/GM-EYES. ⛔ **The structured-quest schema has NO equivalent field, at any level:**

```
quest fields:  aliases arcId axis boundTo* completedStages giver id legend legendNpc locationId
               outcomes premise progress region routes stageIndex stages stakes started* status
               structured tier title traditions
stage fields:  change  condition  id  imagePrompt  objective  title
```

⚠️ **`truth`, `gmOnly`, `gmEyes`, `secret`, `hidden` — none present on the quest or on a stage.**

⛔ **EVERY FIELD A QUEST HAS IS TOLD.** `premise` and `stakes` render on screen (`app.js:15346–15347`,
`15391` — *"SNG-076: authored stakes render IN FULL — the prose IS the game"*). `objective`, `condition` and
`change` are the GM's brief, and `app.js:7598` instructs the model to **pay `change` out PLAINLY**.

⛑ **So an author holding a secret has nowhere to put it except somewhere it gets said.** ⚑ **This is not an author
being careless. It is a schema with no drawer.** Both of Courtney's complaints fall out of that one gap.

---

## §2 — ⛑ AND IT IS ONE QUEST, NOT A SYSTEMIC LEAK

I checked `stakes` across **18 structured quests in live saves. Exactly one carries future reveals — this one.**
The other 17 keep stakes to cost-of-failure, which is what a stake is. ⚑ **So the rendering rule (SNG-076) is
fine and does not need changing.** The fix is authoring plus one new field.

---

## ⛔ §3 — WHAT IS LEAKING, EXACTLY

**(a) `stakes` — ON SCREEN, IN FULL. Gives away stages 2 AND 3 before stage 0 is done:**

> *"What treats him grows on the high terraces… **beside something that looks very like it and will finish him
> faster than the thing in his blood.** And **he is not called what he says he is**, which is the second reason two
> parties have come to the gate…"*

⛔ **That is the entire stage-2 puzzle and the entire stage-3 reveal, printed under "What's at stake".**

**(b) `objective` — the GM's brief, so the GM says it. THIS IS COURTNEY'S FIRST COMPLAINT:**

- stage 0: *"…**The wound is clean and closed and is not the problem.**"* ⛔ **the answer to stage 0's own question**
- stage 1: *"**It is not the cut that is killing him; it is what the cut let in and what the closing shut away from
  the air.**"* ⛔ **the diagnosis**
- stage 2: *"…so does hush-leaf, in the same stony beds, at the same height, with the same grey underside"* ⛔
  **the lookalike, handed over before she climbs**

**(c) `condition` — stage 1:** *"**Reach the right answer: a deep infection walled in beneath a healed surface,
spreading in the blood.**"* ⛔ **The thing she is meant to deduce, written into the test for deducing it.**

---

## ⚑ §4 — THE DESIGN RULE FOR A DIAGNOSTIC QUEST

⛔ **DELIVER OBSERVATIONS. WITHHOLD INTERPRETATION.** The current stage-0 reveal does the reading for her:

> *"his pulse is fast and getting faster… his blood pressure has not moved, and **that is the frightening part: a
> body this good at compensating is a body** [about to crash]"*

⚠️ **That is not an observation. It is the diagnosis wearing an observation's clothes** — and it names the
mechanism, which is the single thing the player is there to supply. ⛑ **Courtney is training as a paramedic. Give
her a climbing pulse, a narrowing gap, a nailbed that has gone from two seconds to four, and a blood pressure that
has not moved, and she will tell YOU it is compensated shock.** ⚑ **The quest is answering a question she is
qualified to answer and enjoys answering. That is the whole of her complaint.**

**Suggested shape — numbers, then stop:**

> *Codex: dawn pulse 96, evening 112. Skin warm and dry at noon, cool and damp by dusk. Colour back into a pressed
> nailbed in about two seconds this morning; nearer four now. Blood pressure the same as the day he came in.*

⛑ **Same facts. No conclusion. The `change` field can stay an EARNED REVEAL and still reveal a MEASUREMENT rather
than a MEANING** — and stage 1 then has something real to be about.

---

## §5 — ⬜ WHAT I PROPOSE, SPLIT BY OWNER

**Schema (CCode):** ⛔ **add `truth` to a stage and to a quest**, matching arcs. GM-eyes, never rendered, never in
the reveal prompt. **Then move stage 1's answer out of `condition` and into `truth`, and `condition` becomes a
test: *"Adelheid states a diagnosis and can say which observations support it."***

**Gate (CCode):** ⚠️ **`stakes` must not contain a later stage's reveal.** Cheap version: **no sentence in `stakes`
may share a distinctive noun phrase with a `change` or `objective` of a stage beyond the first.** It would have
caught *"looks very like it"* and *"not called what he says he is"* the day they were written, and nothing else in
18 quests trips it.

**Content (mine, once the field exists):** rewrite this quest's `stakes` to cost-of-failure only
(*"He has perhaps four days of looking fine left"* — the first sentence is already right and the rest is the
leak), strip the answers from three `objective`s, and re-cut stage 0's `change` to observations.

⚠️ **I will not edit a quest inside Courtney's live save mid-play.** ⬜ **CCode: does the definition in
`content/packs/valley/quests.json` re-read on load, or is her copy frozen at start? That decides whether this
reaches her this run or the next character.**

---

## ⛑ §6 — THE CABIN. IT ALREADY EXISTS AND IT IS PERFECT.

Erik: *"we should have sister venri tell her about the cabin she can go to at some point."*

**`the_painters_shelf` — The Painter's Shelf.** ⚑ **`tier: site`, `parentId: the_kindly_rest`** — already
correctly parented, unlike the Crossing's children.

> *"A single cabin on a rock shelf above the Kindly Rest, where the whole valley opens out below — the Echo running
> silver through the middle of it, Millbrook's smoke, and on a clear day the pass at the far lip. It is a morning's
> walk down to the house and a harder one back. Nobody comes up here who was[n't looking for it]."*
>
> *"A one-room cabin of silvered timber… a plank porch facing out over the drop. Shutters and no glass. A rail
> along the shelf edge, a wood-store under the eaves, and a bench worn pale where somebody sits."*

⛑ **And the placement does the work for us: the Shelf is ABOVE the Kindly Rest, and stage 2 sends her UP to the
high terraces.** ⚑ **Vreni can name it as she sends her — "there's a cabin on the shelf above the third terrace;
nobody uses it; the key is behind the wood-store" — so it arrives as a waypoint on a climb she is already making,
and becomes somewhere that is HERS rather than a reward handed over.**

⬜ **Where to hang it:** a line in stage 2's `objective` (Vreni's send-off), **not a new stage.** ⚠️ **And it
should stay available after the quest ends — the bench worn pale is the point.**

— Aevi
