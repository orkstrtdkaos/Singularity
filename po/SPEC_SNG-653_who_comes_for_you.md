<!-- status: SNG-653 — Aevi (PO); a defect plus a screen. ⬜ CCode's opinion on §6 before building -->
# SPEC SNG-653: who comes for you

**Aevi (PO) · 2026-09-25** · *Erik: "I had a conversation with Vess on Loki and nothing changed... we need to show who
CAN and who WILL come for you (with their success chance). If you don't have someone who you know is coming, that's
what would prompt you to have the conversation — and that conversation needs to then flow to the screen that shows
they'll be coming."*

## §1 — THE DEFECT, MEASURED (Loki, origin 124e403e1)

Vess (`traveler-woman`) is at **relationship 10**. Her history carries the scene, word for word:

> *[d4] In the vast chamber beneath the Null Stone, she accepted Loki's confession and made a mutual vow: if death claims
> one, the other will reach for them. She held Loki's wrist when she said yes. The pact is made.*

**Nothing structured was written:**
- No field on Loki or on Vess records a pledge.
- `deathState.heldOpenBy` is the only related field, and it belongs to the dead.
- There is no op or tag the GM could have emitted, because none exists.

**The screen reads only the bond:** app.js "If it goes badly", about line 15093. The check is:

`wouldReachFor(...).would` → bond ≥ `botherAt` (5)

Its closing line is *"Vess — close enough that it would be them. That is a conversation to have with them, not a
setting."* So **after** the conversation, the screen still asks for it. Erik's report is exact: nothing changed,
because nothing could.

**The screen also never asks CAN:** `canReach(entity, {rank, intensity, bond})` exists in death.js and has one caller,
the craft being cast (app.js:9367). No reader asks whether a living person *could* reach you. Vess's record carries
no level and no crafts, so today the honest answer about her is "unknown", not "no".

## §2 — THREE QUESTIONS, THREE SOURCES, KEPT SEPARATE

The engine already insists on keeping these apart (death.js: *"canReach answers CAN; wouldReachFor answers WOULD, and
the two must never be the same function"*). The screen should keep them apart as well.

| question | source | today |
|---|---|---|
| **Can they?** | `canReach`, using their best retrieval-craft rank + the bond rungs, per depth: threshold / near dark / deep dark | exists; no screen reader |
| **Would they?** | `wouldReachFor` (bond ≥ `botherAt`, and your will honoured first) | exists; read |
| **Have they said so?** | **a pledge**: new, written when the conversation happens | **missing** |

## §3 — THE PLEDGE (the new field, and its writer in the same change)

`character.pledges = [{ npcId, day, mutual, words }]`
- `words` is the GM's one-line account of what was said.
- `mutual` is true if the player promised back.

**Writer:** a GM op, `{ kind: "pledge", npcId, mutual, words }`, emitted when a scene ends with someone promising to
come for the player.

**Taking it back:** `{ kind: "pledge", npcId, release: true }` is spoken out loud. It is never a silent removal; this is
the CCODE-469 lesson.

**The GM brief learns the ask.** When the player raises it, the scene is about whether they'll come. The GM decides
from the person, their bond and their own nature. `wouldReachFor` is advice to the GM, not a gate. A pledge made
anyway at low bond is allowed, and it's a story.

**Backfill, evidence not a guess:** a migration step reads each registry person's history for a pact line.
- **Match:** the history contains *"will reach for"*, *"come for you"* or *"vow"*, together with death or dying.
- **Then:** it writes the pledge, citing that line as `words`.
- **Loki's Vess is the test case.** She was mutual, so Loki also owes her.

## §4 — THE SCREEN: "WHO COMES FOR YOU"

It replaces the "If it goes badly" block. It keeps the ladder, the rung you're on, and the refusal line.
**Three groups, sorted by bond:**

**1 · Coming for you.** Pledged, and able to reach at least the Threshold.
*Vess · pledged day 4, mutual · Threshold 90% · Near dark 55% · Deep dark —*
Hovering a number shows why: her rank, your bond's rungs, and the clock.

**2 · Would come, can't reach deep.** Pledged, but their reach falls short of a rung. Each short rung says which half is
short, as `canReach` already does: *"past her reach by one rung: her craft rank, or a surge."* It also shows what
would change it: *"if she learns open_threshold r2"*, or *"someone who can hold the way open."*

**3 · Could come, hasn't said.** Able to reach, and close enough to bother (`would`), but no pledge. Each person has
one button: **Ask them.** It starts a scene with them, seeded with the ask (§5).
People who are able but not close show as a count only: *"4 more could reach you, but have no reason to."*
This is honest without becoming a shopping list.

**If groups 1 and 2 are empty,** the block leads with it: *"Nobody has said they'll come for you."* The **Ask** buttons
sit right under that sentence. That's the prompt Erik described.

**Your side:** *"You have promised to go for: Vess."* This is a mutual pledge, read from the same field. It matters when
she's the one who falls.

**Per depth: Can / Can't** (settled, see §7). There's no percentage until the retrieval roll exists, so the screen
never shows a number the engine doesn't roll.

## §5 — THE CONVERSATION FLOWS TO THE SCREEN

1. **Ask them** on the screen, or the player raising it in play, gives the scene a seed:
   *"Loki is asking Vess whether she would come for him if he died."*
2. The GM plays it. If the answer is yes, it emits the `pledge` op.
3. The op writes `character.pledges`, adds a history line on the person, and posts a toast: *"Vess will come for you."*
4. The screen moves her from group 3 to group 1 (or 2) next render. **The conversation is the setting**, so the
   SNG-569 line, *"a conversation, not a setting"*, stays true.

## §6 — ⬜ FOR CCODE

1. **The pledge op.** Does an op of this shape fit the ops pipeline (`holdingOps` and its siblings), or does it belong
   with the bond ops (bondStage / bondType)? Should a pledge also move `bondStage`?
2. **Odds.** Is `resolveRetrieval` rolled? If yes, where do the odds come from, and can there be a pure
   `retrievalOdds(reacher, you, depth)` shared by the screen and the resolver? If no, we show Can / Can't.
3. **CAN for people with no sheet.** Vess has no level or crafts on her record. Should `personSheetFor` supply the
   rank, or should the screen say "unknown until you've seen her work"? I lean toward "unknown", with the GM able to
   reveal it.
4. **Backfill.** Is the history-pattern migration safe enough, or would you rather hand-fix Loki's save and skip the
   general pass?
5. **Guardians overlap.** `guardiansFor` (SNG-311) picks who stands over the living. Should a pledged person count as a
   guardian candidate too? It's the same promise, pointed at the living.

## §7 — ✅ SETTLED 2026-09-25 (CCode's measurements, Erik's rulings). This section overrides §3–§6 where they differ.

1. **CAN is derived, and labelled.** `npcsheet` derives a level and kit for all 114 registry people, and `canReach`
   gives varied answers on them (Brin reaches depth 1; Pell and Calvar reach 2).
   - Derived answers say *"as far as you have seen her work"*.
   - Answers backed by `skillsObserved` say *"you have seen this"*.
   - The word **"unknown" is not used**.
2. **Can / Can't per depth, no odds yet.** `resolveRetrieval` takes an outcome from its caller and is not rolled.
   ⛔ **Erik:** *"backlog the retrieval roll — but yes, there are skills meant to be used for resurrection, so they have
   a pass/fail chance."* **The roll is a ruled intent, backlogged** (`po/BACKLOG.md`, 2026-09-25). When it lands,
   the screen gains a % per depth from the same function the resolver uses, and not before.
3. **The pledge is a bond op, not a holding op.** It does **not** move `bondStage`.
4. **No general backfill.** Hand-fix Loki's pledge with Vess, mutual, citing the d4 line. Play fills the rest.
5. **Guardians stay separate.** A pledge may be an **additional** signal inside `guardiansFor`, never a substitute.
6. **Build order:** 4th in the holdings pass, after the defects and the word fixes.

— Aevi, PO
