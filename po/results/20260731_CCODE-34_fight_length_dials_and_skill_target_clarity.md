# CCODE-34 (Erik playtest) — the one-round-fight bug, measured and fixed + skill target clarity

**CCode · 2026-07-31 · v1.8.298 (`99c377b5`) · npm test exit 0 (all gates green, rawProseCaps 63).**

Erik pasted his combat log back from the new machine tab (CCODE-33) — **the instrument paid for itself on its first
use.** Two fights, both over in one round:

```
you : The False Target (conceal T1) — roll 12/85 (margin 73)
them: a hard strike            — roll 68/95 (margin 27)
momentum 0→16 · ENDED → opponent_yielded

you : Hunter's Strike (strike T1) — roll 49/85 (margin 36)
them: a hard strike              — roll 12/95 (margin 83)
momentum 0→-16 · ENDED → player_overcome
```

Erik: *"if it's because MOMENTUM is tripping then that is WAY too easy to end a fight."* Correct — and worse than it
looked from two samples.

## The bug: a *typical* round was ending the fight

`delta = |p.margin − o.margin| × marginScale`. Two d100 rolls differ by **~33 on average**, so with
`marginScale 0.5` the **typical** round produced **delta ≈ 16.5** — past **both** `meterMax` (16) **and**
`surgeCrushEndsIt` (16) in the same round. My SNG-246 widening (meterMax 10→16, crush 8→16) didn't help because
**`marginScale` was left at 0.5** — I widened the goalposts and left the step size that overshoots them.

**Measured it instead of guessing.** Simulated 4000 fights per dial against the real `battleRound`
(throwaway harness, threat-20…100 foes, real `opponentPolicy`):

| dials (meterMax / marginScale / crush) | median rounds | 1-round fights | **ended by crush** |
|---|---|---|---|
| **16 / 0.5 / 16 (shipped)** | **2** | **47.1%** | **90.6%** |
| 14 / 0.20 / 16 | 4 | 10.2% | 23.9% |
| **16 / 0.20 / 20 (chosen)** | **4** | **5.6%** | **4.0%** |
| 16 / 0.15 / 18 | 7 | 0.1% | 0.0% |
| 20 / 0.20 / 20 | 6 | 0.5% | 4.0% |

**90.6% of all fights were ending on the crush path.** Erik's two fights weren't bad luck — that was the system.

**Chosen: `meterMax 16 · marginScale 0.20 · surgeCrushEndsIt 20`.** Median 4-5 rounds; a one-round end is rare
(~5%) and concentrated against weak foes (threat-20 → 17%, which is *correct* — a nobody should fall fast); a crush
is ~4%, so an overwhelming blow stays a real but rare beat rather than the default. Rejected `16/0.15/18` because
it never crushes at all — that removes a genuine dramatic outcome.

The deliberate **Finish it** (the §6b collapse) is a **separate path** and still ends a fight in one beat *by choice* —
untouched.

## Skill target clarity

Erik: *"The skills suggested need a bit more info… if i use the better story, am i trying to heal myself or the
enemy??"* Every combat move now carries a one-line **what-it-does naming the TARGET** — the thing a craft's name
never tells you:

- `The Better Story` → **"mends YOU — not them"**
- `Hunter's Strike` → **"harms THEM"**
- `The False Target` → **"misdirects THEM — you slip the exchange entirely"**
- `Prism Sight` → **"reads THEM — sharpens the fog and sets up your next move"**

Derived from the function, so it covers **every** craft including the steel-and-wit fallbacks. Beside each move —
**never inside the button**, where a tap would also fire the move — sits an **ⓘ** opening the *already-built* shared
popover: the full craft detail (`data-entity="skill:<id>"`) for an owned craft, the verb's mechanics
(`data-verb`) for a fallback. No new popover surface; reuses the one Erik already knows from everywhere else.

## Live verification (fresh port 8362, pure-engine rounds, no API)
- **Target lines + ⓘ render** across all 8 moves; ⓘ routes correctly (`skill:prism_sight` for owned, `strike` for the fallback).
- **The ⓘ does NOT declare the move** — round stayed 1 across both popover opens (the interaction risk, closed).
- Both popovers open real content: the Drumline Stride craft card, and the STRIKE verb card ("Harm a LIVING thing, directly. Not: break…").
- **A real 13-round fight**: momentum `-8.8 → -10.6 → -3.8 → -15.4 (nearly overcome) → +3.4 → -11.4 → … → +13.8 → won`. Comebacks and tension, where before it was one round and done.
- No console errors.

## Files
- `content/packs/core/rules/skill_battle_system.json` — the momentum dials (one-line diff; the note records the measurement).
- `app.js` — `SB_DOES` (target-clarity lines) + the skill-row render with the sibling ⓘ; v1.8.298.
- `style.css` — `.sb-skill-row`, `.sb-skill-does`, `.sb-skill-info`.

## Flagged
- **AEVI/ERIK — the dials are yours.** 16/0.20/20 is a measured starting point, not a verdict. If fights feel long,
  raise `marginScale` toward 0.25; if they end too fast, lower it. The p90 is ~11-12 rounds, so a *tail* fight is long —
  Break away / Yield / Finish it are always available, and energy attrition caps it.
- **Erik's "suggestion like the level-up GM suggestions"** — I built the derived line + existing popover instead of a
  GM call, because a per-skill GM suggestion would need an API round-trip per move and the fight panel is deliberately
  API-free. If you want an *AI-authored* per-craft combat hint, that's a content pass (author a `combatHint` per
  ability) rather than a live call — say the word.
- **Persistent effects** (raise a shield → a real defence bonus next round) still not built — the target line now
  *says* "guards YOU", so the promise is on screen; the mechanic behind it is the next honest step.

*— CCode. The fight was ending on a coin-flip margin gap 90% of the time; now it's a fight. And every move tells you
who it's aimed at. status: complete_pending_review.*
