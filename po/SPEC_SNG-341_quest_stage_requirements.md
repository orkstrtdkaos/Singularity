# SPEC — SNG-341: A QUEST STAGE HAS NO REQUIREMENT. Three beats is not a quest.
## Aevi (PO) · 2026-08-06 · Erik, from play: "it progressed basically 1 stage per beat… if you can learn,
## obtain, and deliver the required objectives in 3 beats it's not really a quest."

## THE CAUSE — a stage's condition is prose, and nothing reads it
An authored stage carries: `id · title · objective · condition · change · imagePrompt`.
**`condition` is a sentence** — *"Speak with Fendt OR obtain the filtration log for the marked period."*
**No module parses it. No module checks it.** Stages advance through what `app.js:2042` calls the
*"Mark this stage met"* path — **a stage is complete when someone says it is.**
**⚠️ SO A STAGE HAS NO REQUIREMENT AT ALL.** One narrative beat that gestures at the objective closes it,
because there is nothing on the other side to disagree. **That is why three beats finished a quest with three
stages: the structure was never load-bearing.**
*(I first misread this as a rendering bug from a stale save. Erik corrected me: the stages genuinely
progressed. **The stages advancing is not the defect — the stages being trivially satisfiable is.**)*

## THE GOAL
**A stage should require something the world can verify, and that verification should take more than saying
so.** Erik's three verbs are the shape: **LEARN · OBTAIN · DELIVER.** Each is checkable, and none is
satisfied by narration alone.

## THE FIX — `requires[]`, machine-checkable, replacing prose as the gate
The `condition` sentence stays as the player-facing description. **A parallel `requires[]` array becomes the
actual gate.** Kinds, all reading state that already exists:
| kind | satisfied when | already tracked by |
|---|---|---|
| `learn` | a named fact is in the codex | codex entries |
| `obtain` | a named item is in inventory | `character.inventory` |
| `reach` | a named location has been visited | `knownPlaces` |
| `speak` | a named NPC has been met | `npcRegistry` / relationships |
| `deliver` | an item is given to a named NPC | inventory + relationship |
| `resolve` | an encounter or contest of a named kind is won | encounter log |
| `beats` | ⚠️ **a minimum number of beats has passed in this stage** | the clock |
**⚠️ AND THE LAST ONE IS THE FLOOR THAT FIXES ERIK'S COMPLAINT DIRECTLY.** Even a stage whose other
requirements are met quickly should not close inside a single beat. **Proposed minimum: 3 beats per stage for
a personal quest, more for tier 4–5.** A stage is a *span of attention*, not a checkbox.

## WHAT A STAGE SHOULD COST — by tier
| tier | requirements per stage | min beats | shape |
|---|---|---|---|
| 1–2 | 1 | 2 | one thing, found nearby |
| 3 | 2 | 3 | one of them needs travel or a person |
| 4–5 | 2–3 | 4 | **at least one requires something obtained in a DIFFERENT stage** |
**⚠️ THAT LAST ROW IS THE STRUCTURAL POINT: a real quest has stages that DEPEND ON EACH OTHER.** Splarf's
three stages — find the filing, find the clerk, write back — **could each be answered independently**, so the
order never mattered and no understanding accumulated. **If stage 3 requires the document obtained in stage 1
AND the clerk's name learned in stage 2, the sequence becomes the content.**

## ⚠️ AND THE FAILURE MODE TO AVOID
**Do not make this a fetch-quest generator.** The requirement is not busywork — it is **the thing that has to
be true before the next scene can happen.** The test: *if a player could describe how they satisfied this
stage and it would sound like a story, it is right. If it sounds like an errand list, it is wrong.*
**A stage that requires a name, a document, and two days of travel is a story. A stage that requires three
tokens is a checklist.**

## WHAT IS MINE
- **`requires[]` on all 17 authored quests**, once CCode fixes the shape.
- **The generated-quest prompt**, which currently produces three independent stages. It should be told to
  **make stage N+1 depend on something stage N produces** — that is a prompt change, not a code change, and
  it is the cheapest half of this fix.
- **And a separate note on route reveal** (Erik: *"it gave away some things with the greyed out approaches"*):
  my quest schema authors `routes` as *how you might go through it*, and I wrote them as **explanations
  rather than options** — *"the clerk signed because the filing was technically correct"* is the discovery of
  stage 2, printed before stage 1 begins. **The route label should be visible; its reasoning should not,
  until the stage that earns it.** Rewriting those is content and mine.
