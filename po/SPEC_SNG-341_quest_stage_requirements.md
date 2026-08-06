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
| `beats` | ⚠️ **SITUATIONAL ONLY — see below** | the clock |

### ⚠️ `beats` IS NOT THE DEFAULT ANSWER — Erik: "don't make beats a standard go-to, only on quests that make sense"
**My first draft made a minimum-beats floor universal. That was wrong and it is the same failure as a cost
that negates purpose: a floor applied everywhere is A TIMER, and a timer does not make a quest denser — it
makes a fast quest slow.** An urgent errand that SHOULD resolve in two beats becomes worse, not better.
**Use `beats` only where waiting is the content:**
- a stage that is **a vigil, a stakeout, a convalescence, a season of growth** — the thing you are doing IS
  elapsed time
- a stage waiting on **someone else to act** — a reply, a shipment, a court date
- **a charge or an upkeep working** that genuinely takes hours (`light_well`, `the_perfect_erasure`)
**Never use it to pad a stage that is otherwise thin.** ⚠️ **A thin stage is fixed by giving it a real
requirement, not by making the player wait for it.**

## WHAT A STAGE SHOULD COST — by tier
| tier | requirements per stage | shape |
|---|---|---|
| 1–2 | 1 | one thing, found nearby |
| 3 | 2 | one of them needs travel or a person |
| 4–5 | 2–3 | **at least one requires something obtained in a DIFFERENT stage** |
**No beats column — density comes from what a stage REQUIRES, never from how long it is held open.**

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

---

## ✅ ENGINE DONE — CCode, 2026-08-06, v1.9.50. `requires[]` is the gate. Your 17 quests are unblocked.

Your diagnosis was exact, and there is one thing worse in it than you wrote:

### ⚠️ THE SCHEMA HAD ALREADY PROMISED THIS

`condition`'s own description in `world_arc_quest.schema.json` read:

> *“ENGINE-TESTABLE: place reached / person spoken to / thing obtained / truth learned / roll passed.
> Never vague ‘investigate further’.”*

**A contract written and never implemented** — the same shape as `oneWay` one ticket ago, and the third
time this week that authored text described behaviour nothing had built. I have corrected that description
in place rather than leave it to mislead whoever authors next: `condition` is now documented as the
player-facing sentence, and `requires[]` is documented as the gate.

### THE SHAPE

```jsonc
"requires": [
  { "kind": "obtain", "what": "Filtration Log", "hint": "you still do not have the log" },
  { "kind": "speak",  "what": "Fendt" },
  { "kind": "deliver", "item": "the sealed brief", "to": "Ossian" }
]
```

All seven kinds read state the game already tracks — nothing new is recorded to make this work.

| | |
|---|---|
| `learn` | codex topics |
| `obtain` / `reach` / `speak` | inventory · knownPlaces · npcRegistry |
| `deliver` | ⚠️ the item is **gone** AND the recipient is known — see below |
| `resolve` | the encounter log |
| `beats` | ⛔ situational only |

⚠️ **`deliver` is two facts and the engine can only see one honestly.** “You had it” needs a history nothing
keeps, so it checks the half that is durable: the item is no longer in inventory and the recipient is met.
Worth knowing when you author — a delivery of something the player never held will pass.

### THREE THINGS I BUILT AROUND YOUR CONSTRAINTS

**`hint` is part of the shape.** Your point that a refusal must be playable is the reason: the missing
requirement is surfaced **in the GM prompt** as *STILL NEEDED*, not just returned to a caller. Without that
the GM keeps trying to close a stage the engine keeps refusing, and to the player that is indistinguishable
from a stuck quest. Write hints as the thing the player would notice — *“the clerk still has not seen the
filing”*, not *“obtain filtration_log”*.

**No `requires[]` means met.** All 17 of your quests have none today, and refusing them would break every
live quest in every save to enforce a rule their content never agreed to. Author at your own pace.

**`beats` counts from when the STAGE became current**, not from the quest start — otherwise stage 3 of a
long quest opens already satisfied, which is the opposite of the requirement's purpose. And I have kept
your framing in the schema description verbatim, because the next person to reach for it will be reaching
for a timer.

### On the two things you called yours

The generated-quest prompt is the cheapest half and it is still the half that matters most — **`requires[]`
makes dependency possible; only the prompt makes it HAPPEN.** A generated quest with three independent
stages will still read as three errands even with requirements on each.

The route-reveal note is yours and I have not touched it. Your read is right: a label is an option, a
reason is a discovery, and printing the reason before the stage that earns it spends the discovery early.
