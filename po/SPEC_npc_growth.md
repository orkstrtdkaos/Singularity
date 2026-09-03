# SPEC — NPC growth (REWRITTEN 2026-09-02 against the real premise)

**Author:** Aevi (PO) · **Status:** `spec_ready` — supersedes the 2026-09-02 first draft entirely
**Unblocks:** CCode's step 5, the last of the sheet-architecture build

⛔ **THE FIRST DRAFT'S PREMISE WAS FALSE AND IS WITHDRAWN.** It claimed `sheetFor` was live via `worldtick`
— that was a local `const` wrapping `synthesizeOpponentSheet`, **a different function with the same name.**
⚠️ CCode caught it. **Everything below is written against measured state.**

---

## §1 — WHAT CHANGED SINCE THE FIRST DRAFT

| | first draft said | ⚠️ measured |
|---|---|---|
| `sheetFor` live? | "live via worldtick" | ⛔ **had NO caller.** ✅ **Now it does** — narrator (step 1) and `personOpponent` (step 3) |
| authored levels frozen? | "authoring FREEZES a person" | ⛔ **FALSE.** §3a was already built — Pell measures **27** with no signals and **41** at met-40 |
| a stranger derives to | "15" | ⛔ **1.** 15 is met-40-across-400-days. `npcsheet.js`: *"A STRANGER IS LEVEL 1 AND THAT IS CORRECT"* |
| deed growth | "absent, needs a wire" | ⛔ **worse — needs a SUBJECT.** Every deed in the engine is the PLAYER'S |
| charge growth | "the middle source" | ✅ **the CHEAPEST.** Cassiel Ord has been under charge **505 world-counts** and the record already says so |

---

## §2 — THE ACTUAL GAP

✅ **Level growth works.** `derivedLevel` reads met, days-known and standing, an authored level is a floor,
and the sheet now has readers.

⛔ **NOTHING EVER GIVES AN NPC A CRAFT.** `growthFor` computes exactly that — `capacity`, `crafts`, `thin`,
`wantsAuthoring` — and **has no caller.**

⚠️ **`thin` is the ironsense detector, already written:** *"a person the story keeps showing doing one thing
has one thing."* ⛔ **It has never run.** ➡️ **It describes the Pell problem that started this entire
thread**, and it was in the file the whole time.

---

## §3 — WHAT TO BUILD

### 3a · Wire `growthFor`
Where `sheetFor` is already called. ✅ **The sheet is a view, so this costs nothing at rest.**

### 3b · A gained level offers a CRAFT
When `capacity` exceeds crafts held, draw one via `kitFor` from their `domains` — ⚠️ **the same function a
PC's creation pool uses.** ⛔ **Not a parallel system: the same system with a different character in it**
(CCODE-249's own words).

### 3c · Charge is the first new source, because it is already measured
⚠️ **An assignment advancing is its holder PRACTISING.** `progress` and `lastMovedWorldCount` are already
written; `holdings` carry `condition` and `history[]`.

➡️ **Cassiel Ord has been reconstructing the Raven's Home since world-count 566. He should be better at it
than when he started, and nothing says so.** ✅ **No new writer needed — only a reader.**

### 3d · ⛔ DEEDS ARE OUT OF SCOPE, and the reason matters
**Every deed in the engine is the player's.** ⚠️ An NPC deed needs a SUBJECT before it needs a wire —
something that records *this person did this* when the player was not the actor. ⬜ **That is its own spec.**

### 3e · `wantsAuthoring` surfaces to Aevi
⚠️ It returns *"what the story has shown that the catalogue cannot yet express."* ➡️ **That is the
nomination queue in `SPEC_generative_pipeline.md` §3.** ⛔ **One field, two specs, and it has never run.**

---

## §4 — ⚠️ THE REAL TUNING RISK, INVERTED FROM THE FIRST DRAFT

⛔ **Not "a hundred bandits too strong at 15."** ➡️ **A hundred minted strangers all at 1.**

⚠️ **And that is arguably correct** — `npcsheet.js` argues it explicitly: *"the level is a claim about what
the story has shown, not a courtesy."*

⬜ **The question is whether a mass of level-1 strangers behaves sensibly once units compose from people
(step 4).** ✅ **CCode already found and gated the boundary: a hundred bodies out-threaten a band-of-one, and
that is not a number to tune — `bandThreat` is a mass function, which is precisely why the person-keyed path
exists.** ➡️ **A named figure resolves by sheet; the collapse is for a mass nobody will inspect.**

---

## §5 — WHAT MUST NOT HAPPEN

- ⛔ **No retroactive rewriting of authored sheets.** Growth is additive and recorded, never a silent edit.
- ⛔ **Authored craft lists are floors too.** ⚠️ Pell's capacity at L27 computes to ~14 and she holds **17** —
  **the authored list is already above formula and that must not trigger removal.**
- ⚠️ **A gained craft is NEWS, not a celebration** (`DESIGN_celebrations.md` §3) — *"Cassiel Ord has learned
  something at the Raven's Home."*
- ⛔ **`met` must not remain the dominant term.** It is the player's address book. **CCODE-309 already ruled
  that a world-moving figure the player has never met should not be level 1.** ⚠️ Charge growth is the first
  term that does not depend on the player being present.

---

## §6 — ROUND 2 QUESTIONS FOR CCODE

1. **Where should `growthFor` be called** — beside `sheetFor`, or on the world tick where charge advances?
2. ⛔ **What rank does a gained craft start at?** r1 presumably — ⚠️ but an NPC who has held a charge for a
   season might reasonably start at r2. **Ties to R17: training to r2 is cheap for a PC.**
3. **Does `kitFor` produce sensible crafts for an NPC with a real sect** — and what does it do for the
   7-of-11 runtime crafts with **no sect at all** (`SPEC_generative_pipeline.md` §1)?
4. ⚠️ **Charge growth needs a rate.** 505 world-counts under charge is how much level? ⬜ Aevi has no basis;
   it wants the same treatment as the braid arity number.
5. ⬜ **Anything already true at HEAD.** ⚠️ **The first draft of this spec was wrong in its opening
   sentence. Assume this one is wrong somewhere too.**
