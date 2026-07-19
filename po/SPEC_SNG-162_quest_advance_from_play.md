# SNG-162 — Quests advance from play, not from clicking

**Author:** Aevi (PO) · 2026-07-18 · **Raised by:** Erik, from live play with Brayden
**Severity:** the primary path is decorative; a repair op is doing its job

---

## §0 — The symptom, reproduced at HEAD

Erik: *"The quests are still not closing when indicated they should — Brayden and I both had to use
the fix button. The structured quests are GREAT, but 100% manual. I don't think I'm supposed to
click through them manually to tell what progress I've made and how I want to resolve it until it's
time."*

Two players, independently, using **`stateOps: unstickQuest`** — a REPAIR op — as their normal way
to finish a quest.

> **When a repair becomes routine, it is no longer a repair. It is the actual interface, and the
> primary path is decorative.**

### Root cause — verified in code, not inferred

**`engine/gm.js:225`**, in the structured-quest prompt block:

> *"NEVER resolve or advance a stage yourself — the engine applies stage completion + branched
> consequences when the player acts"*

The instruction's *intent* is correct and must be preserved: the model must never hand out branches,
effects, or XP. But **"when the player acts" was implemented as "when the player clicks."** The only
callers of `completeQuestStage` and `resolveStructuredQuest` in the entire codebase are two button
handlers — `app.js:4873` (`dataset.stagedone`) and `app.js:4880` (`dataset.outcome`).

So a structured quest **cannot** advance from fiction. The player can spend three scenes doing
exactly what a stage's `condition` describes, and the quest will not move until they leave the
narrative, open the quest panel, and click. Nothing is broken; the path was never built.

**The engine half is already correct and is NOT to be touched.** `completeQuestStage` (quests.js:198)
does stage bookkeeping and the `change` note; `resolveStructuredQuest` (quests.js:304) applies
`effects[]` deterministically through `applyQuestEffects` and writes the chronicle. This spec adds a
**trigger**, not a second adjudicator.

---

## §1 — Architecture: the model OBSERVES, the engine ADJUDICATES

Identical in shape to SNG-153's gating, and for the same reason.

The GM does not advance a quest. It **reports that something happened**, and the engine decides
whether that satisfies the current stage. The model never selects an outcome, never picks a branch,
never sets XP.

New GM verb — added to the key allowlist at `gm.js:336`:

```json
"stageOps": [{ "questId": "kebab-id", "stageId": "stage-id", "evidence": "one sentence: what the player actually did" }]
```

### Engine gate — `advanceStructuredQuest(character, op, ctx)`, new in `engine/quests.js`

Every check is free and structural. Rejections are **recorded, never silent**.

1. Quest exists, is `structured`, `status === "active"`. Else reject `no-such-quest`.
2. `stageId` is the quest's **current** stage (`q.stages[q.stageIndex]`). A model naming a later
   stage may not skip ahead — reject `not-current-stage`. This is the load-bearing check: it makes
   stage order un-jumpable regardless of what the model claims.
3. Stage not already in `completedStages` — reject `already-done` (idempotent, safe on retry).
4. `evidence` non-empty. Reject `no-evidence`.
5. On pass → call the **existing** `completeQuestStage(character, questId, stageId)` unchanged.
   Append `evidence` to `q.progress` so the reason the stage advanced is visible to the player.

**The final stage never auto-resolves.** Completing the last stage sets `q.awaitingResolution = true`
and stops. See §2.

---

## §2 — Resolution stays the player's, and surfaces only when it is time

Erik's line is the requirement: *"…and how I want to resolve it **until it's time**."*

- **Progress** — automatic, from play. The player should never click to record what they did.
- **Resolution** — always the player's explicit choice. Never the model's, never automatic.

**Change to the panel:** outcome buttons render **only** when `q.awaitingResolution` is true. Until
then the quest shows its stage, its stakes, and its progress — and no outcome menu at all. Today the
outcomes are visible throughout, which is what invites clicking through a quest to see the endings.

When `awaitingResolution` flips, the GM is told once (via `structuredQuestsForGM`) that this quest is
**at its decision point** and should bring the choice into the fiction — put the moment in front of
the player rather than leaving it to a panel they may not open.

---

## §3 — Freeform quests: stop dropping terminal ops

Separate from structured quests, and also a real cause of "didn't close."

`applyQuestUpdates` (quests.js:47) does `updates.slice(0, 4)`. A busy turn that emits several
`progress` ops **plus** a `complete` can lose the complete to the cap — arbitrarily, by array order.

**Fix:** partition before capping. Terminal ops (`complete`, `fail`) are applied first and are never
dropped; `start`/`progress` fill the remaining budget. Same total work per turn, no lost closes.

**Also:** the unmatched-quest note (`"couldn't match a quest for X — not applied"`) is correct
behaviour and already never silent, but it lands in GM notes where a player will not see it. Surface
it in the quest panel as a visible **"the GM tried to close a quest I could not find"** row, with the
title it tried. That is a content bug worth seeing, not a log line.

---

## §4 — Make the repair path report on itself

`stateOps: unstickQuest` exists to fix a stuck quest. Two players using it routinely is the signal
that told us about this bug, and only because Erik happened to mention it.

Increment `character.telemetry.unstickQuestUses`. Surface the count in the GM's anomaly block once it
exceeds 3 for one character. A repair tool used repeatedly is a defect report the game is filing
against itself, and it should not need a human to notice.

---

## §5 — Acceptance

Closes on **reproduced symptom**, per §21 — not on a passing test.

1. A structured quest whose current stage's `condition` is met in ordinary play advances **without
   anyone opening the quest panel**, and the stage's `change` note appears in progress with the
   evidence sentence beside it.
2. A GM that names a **later** stage does not skip ahead; the rejection is recorded and visible.
3. Outcome buttons are **absent** until the final stage completes, then appear — and the GM raises
   the decision in the fiction in the same turn.
4. A turn emitting three `progress` ops and one `complete` closes the quest.
5. Erik and Brayden finish a quest each, in play, **without touching the fix button.** That is the
   only acceptance criterion that actually matters.

---

## §6 — ROUND 2 questions for CCode

1. `advanceStructuredQuest` — new export in `quests.js` beside `completeQuestStage`, or a wrapper in
   `gm.js` where the other op-appliers live? My instinct is `quests.js` (adjudication belongs with
   the thing it adjudicates) but you own that boundary.
2. Is there an existing telemetry sink on `character`, or is `character.telemetry` a new field? I did
   not find one; if it does not exist, is it worth adding for one counter, or should §4 ride an
   existing anomaly channel?
3. A stage `condition` is authored prose. Should the gate do any matching of `evidence` against it,
   or is "the model named the current stage and gave evidence" sufficient? **My ruling: sufficient.**
   Prose-matching prose is exactly the kind of judgement the model is already making, and re-checking
   it in the engine buys precision we cannot verify. The structural gate (§1.2) is what protects order.
4. Does `awaitingResolution` need to survive the reconcile/dedupe path (`dedupeQuests`, quests.js:103)?
   I believe yes — flag it in the merge as a field that must not be lost.
