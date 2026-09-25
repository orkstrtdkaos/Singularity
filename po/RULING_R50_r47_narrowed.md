# RULING R50 — R47 narrowed: a character who can't harm keeps a plain strike

**bodyAnchor:** "A CHARACTER WHO CANNOT HARM STILL HAS FISTS"
**subject:** combat-menus

⚠️ **This amends R47; it is not a second ruling on the same subject.** R47's clause *"kept only for a sheet that has
none"* becomes the per-function check below. The rest of R47 stands. When CCode enacts this, **R47's HOW_IT_WORKS
sentence is rewritten, not joined by a second one.**

**Erik, 2026-09-25**, on Aevi's proposal in `REPLY_aevi_fight_panel_batch3.md`: *"I'm ok with that. But make sure
those crafts don't show up as something a PC can learn."*

## The rule

`battleSkillsForCharacter` currently mints **"A plain strike"** (`_strike`) and **"Raise a guard"** (`_guard`) only when
`offersFreeFloor(...)` is false for the whole kit. That becomes **two separate checks, one per function:**

- **`_strike`** is offered unless at least one owned craft's free floor **harms** (strike family).
- **`_guard`** is offered unless at least one owned craft's free floor **protects** (shield family).

A Reader whose floors are all reads still gets fists. A warden whose floor is a mend but who can't block still gets a
guard. Erik's R47 intent stands otherwise: where your own crafts cover a function, you use them.

## Erik's condition: they are never learnable

They are **fight fallbacks, not crafts.** What I found on origin today:

- ✅ They exist only as literals in `battle_turn.js`, with `_` ids. They are **not in the ability catalog**, so
  `learnAbility` → `canLearnAbility` can't find them.
- ⚠️ **Nothing filters `_`-prefixed ids anywhere downstream.** No `startsWith("_")` appears in progression, jobs,
  battle_turn or app. And `jobs.js:385` feeds `battleSkillsForCharacter` output into job skills. So they may still
  reach places that treat everything as a craft.

**What "never learnable" has to cover.** A fallback must never:
1. appear in any **learn / teacher / training** list, or in the GM's `markTeacher` offers;
2. be written to `character.abilities`;
3. **accrue practice**, or become an **aspiration** (`settleAspiration`, `autoAdvancePracticedRanks`);
4. show on the character sheet or the craft wheel as a craft you **have**;
5. count toward `functionCoverage`, `familiesOfKit` or `contributionsOf` (a Reader with fists is not HARM);
6. be offered as a job skill (`jobs.js:385`).

The fight menu is the only place they show. There they're labelled as what they are: *"no craft of yours strikes —
you can still hit with what you have."*

**Please gate this:** a test that builds a no-harm character, runs a fight turn and a job, and asserts that none of
the six above ever sees `_strike` or `_guard`. That asks the question in the terms of the rule, per your own lesson
from this batch.

## Also dead: `martial_paths.baselineDefense.kit`

Brace, Strike, Break Away and the rest have no reader in code. They're the pre-R47 answer to the same problem.
Leave them for now. **Don't** resurrect them as learnable crafts to solve this; the fallbacks are the answer.

— Aevi, PO (ruling Erik's)
