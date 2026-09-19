# Errands by the job's roll — the dials are yours

**CCode · 2026-09-18 · for Aevi.** CCODE-428, the first item of the order of battle Erik approved after the jobs build.

## What changed

Delegated work — every charge in `worldState.assignments` — was decided by a model call in the world tick (`aiAssignmentAdvancement`):
the model chose each charge's outcome and wrote its line. **The dice decide it now**, the same dice a job uses:

- A charge is a **one-need job for the one person carrying it** (`errandOdds` in `engine/jobs.js` → `planJob`).
  - A **mission** (one of your seven `MISSION_KINDS`) rolls on its kind's family, or on its second family.
  - A **standing charge** (no kind — most of them) rolls on the family **its own words name**, read by `familiesFromEvidence`'s
    stems. With the "their best family" rule alone, every one of Silas's four charges rolled HARM, the Raven's Home rebuild included.
    Now the rebuild rolls SHAPE with Thingcraft, and Edvar's committee seat rolls INFLUENCE with False Stance.
  - Someone with no craft for it works by **plain effort**. The stems are a heuristic, and a miss must not doom a charge the GM gave them.
- **One roll per three days** since the charge last moved, at most ten in one tick. Each degree becomes an outcome: a strong success,
  a success and a partial are headway; a failure is a stall; a critical failure is trouble, which pays your `problemCost` as before.
  A mission is done on the step that reaches its kind's steps. A standing charge is **never** finished by the dice — the fiction ends
  those. Trouble stops the rolls.
- Each person gets **one status line** per tick, the most telling one. Edvar carries two of Silas's charges, and the second line had
  been overwriting the first.
- The ⚒ **Jobs tab** now shows **Charges in your name**: a face (it opens, like every picture of a person), the charge, its steps,
  and one roll's odds as headway · stall · trouble.

## ⬜ The dials — `rules.jobs.errand`, not authored yet (the defaults in code behave as the value)

| dial | default | what it does |
|---|---|---|
| `level` | 10 | what ordinary delegated work opposes at, on the job scale (a village chore 5, a dangerous hunt 20) |
| `perStage` | 5 | added for each stage of a crisis the charge is set against (a stage-3 crisis → 25) |
| `steps` | word 1 · escort 2 · trade 2 · treat 2 · watch 3 · seek 3 · work 3 | steps of headway that finish a mission |
| `maxRolls` | 10 | the most rolls one tick makes for a long absence |
| `outcome` | crit_success/success/partial → progress · failure → stall · crit_failure → problem | what each degree does |

## ⚠️ One for your stems

`DEFAULT_FAMILY_SIGNALS` matches a stem at the **start** of a word, so **"war" matches "warden"** (and "ward", "warm", "warn",
"warrant"). Fendt's charge, *"warden of the Threshold Post…"*, reads as PROTECT **and HARM**, and he rolls on HARM because his best craft
is there. The same stems decide which families a person brings to a **fight** (`contingentsFromPeople`, on Erik's 09-14 ruling), so a
warden anywhere in the world is counted as a fighter partly through this. The stems are yours — perhaps `warfare`/`at war` in place of
the bare `war`?
