# CCODE-420 — jobs are in the game

**CCode · 2026-09-18 · for Aevi, and Erik's to turn.**

The prototype's jobs, built: `engine/jobs.js` (the dice, the work, the road, the effects), `engine/jobstate.js` (the board, who is
out, what came back), and a **⚒ Jobs** tab on the character screen. `docs/HOW_IT_WORKS.md` has the row; §300 holds it.

## What a job is

`{ label, where, level, effort (hand-days), needs: [{ family, weight 1–3, what }], stakes: { crystal, xp, items, deed, harm,
standing, recruits }, from }`. A **negative crystal stake is a cost**, paid when the team leaves.

## Where jobs come from — ⚑ yours to shape

1. **The GM offers them** — a new op, `jobOps: [{ op: "offer", … }]`, rule **14D**: "when someone asks the character to get a
   discrete thing DONE that takes time and hands". The engine clamps an offer to what its level can honestly pay: level ≤ 60,
   weights 1–3, crystal between −3× and +4× the level, xp ≤ 3× level, harm ≤ level, three items, twelve recruits.
2. **The player posts one** from the tab: what, where (a known place, or a place they hold), and an errand kind — your seven
   `MISSION_KINDS` give the needs (the kind's `wants` ×2, its `also` ×1). The level starts at the place's danger × 6 (at least 10);
   the effort by kind: trade 4, escort 2, word 1, watch 6, seek 5, work 10, treat 3 hand-days. ⚠️ **Those two defaults are mine and
   live in `app.js`** — say the word and they move into content.

## The dials — `JOB_DEFAULTS`, overridable by `rules.jobs`

| dial | value | what it does |
|---|---|---|
| `score` | strong 2 · success 1 · partial ½ · failure 0 · critical −1 | how a job's needs combine |
| `grade` | 1.5 / 0.85 / 0.4 / 0 | where the weighted score lands |
| `effect` | per degree: gain ×1.5 / 1 / ½ / 0 / −½; harm ×0 / ¼ / ½ / 1 / 2 | what the stakes pay and cost |
| `tierRate`, `rankRate` | ×3 a tier; rank ×1 / 1.5 / 2 | how much a craft speeds the work |
| `uncovered` | 95% failure, 5% critical | a need nobody on the team can do |
| `unmeasuredDays` | 20 | someone whose road cannot be measured |
| `suggest` | odds 1 · level 0.3 · loyalty 1.5 · distance 1 | how a suggested team is weighed |

None of these are in content yet — `rules.jobs` does not exist, so the defaults behave as the value. ⬜ **Author `rules.jobs` when you
want them visible and tunable in the pack.**

## What it pays, and where it goes

Crystal into the purse; the items into the pack (a full pack is said, not swallowed); **one deed** at the job's place — the deed is
the standing, because a community's standing is the deeds it knows; **xp only to the character, and only when they go** — the people
who go gain a completion instead (their growth); recruits join the first band as hands. A person's own health off-screen is not
tracked, so their hurt is written on their record.

## Next, in order

1. Errands (`assignments`) decided by the job roll instead of the model call that sees only a name.
2. Standing work at holds (training, foraging, patrolling…) and hold features with levels 1–3, built as jobs.
3. A band's turn by stance; the Party screen (narrated or folded, stance, preferred crafts); the Legion screen.
