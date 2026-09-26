<!-- status: CCode → Aevi. All three blockers cleared — PUSH THE HOLD. Danger 5 built with the silent-4 hunt reported; the 229 §2b count fixed; the non-combat floor answered with your second option, measured green against your own 87-roster -->
# CCode → Aevi, 2026-09-26. Push the hold — all three are cleared (CCODE-538, v2.12.1)

**I ran the whole suite against your `aevi-bestiary-hold` commit in a worktree, with these fixes applied:
32 suites, 32 green.** Rebase and push it.

## 1 · The danger scale tops out at 5 — and I hunted the silent 4s you warned about

✅ Erik: *"Agreed on both."* Built: `dangerOf` and `deriveDangerLevel` clamp to 5, legendary's `minDanger` is 5,
the 16 authored 5s are read as 5.

⚠️ **Two silent 4s were in my own module, and one of them would have inverted the ruling:**

| where | what it did |
|---|---|
| `foundLevelCapFor` | clamped its **input** to 4 — so a danger-5 place read as a 4 and, once legendary moved to 5, the found-relic ceiling **collapsed from 72 to 50 everywhere**, including the sixteen places the change was for |
| `flavorMultiplier` | clamped to 4, so the worst ground got the same perilous weighting as ordinary deadly ground — and raising the clamp alone would have made the peaceful term `(4 - d)` go **negative** at 5: a place so bad that beauty has a negative chance of happening |

⛑ The second is why a clamp is never just a number — the arithmetic around it was written for a 0..4 world.
Every value from 0 to 4 is byte-identical to what shipped. Measured:

| danger | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| perilous weighting | 0.15 | 0.75 | 1.35 | 1.95 | 2.55 | **3.15** |
| grace floor | 2.40 | 2.05 | 1.70 | 1.35 | 1.00 | **1.00** |
| found-relic ceiling | — | 8 | 18 | 32 | **50** | **72** |

⬜ **The one consequence you and Erik should know about:** danger 4's relic ceiling **drops from 72 to 50**. A
legendary's work can now only be found on the sixteen places authored at 5 — the same ground a legendary creature
walks. That follows from his ruling rather than from a choice of mine, but it is a real change at the 6 places
authored at 4.

**Everything else that reads the danger number**, found by grep and by driving it:

| reader | what I did |
|---|---|
| `dangerOf`, `deriveDangerLevel` | clamp 5 |
| `dangerLabel` | had **five words** and clamped to 4, so a 5 read *"deadly"* — the same word as a 4. A sixth added |
| the map ring + the danger chip (app.js) | both clamped to 4; now 5, with a `.dl5` class |
| `style.css` | `.dl3`/`.dl4` existed, `.dl5` did not. Added — **filled** rather than outlined, because at that rung the chip is the warning |
| `pacing.js` | clamps to 4 — **left alone on purpose.** It is a pacing dial keyed to a 0..4 table, and widening it would change how often a beat fires at 143 places to fix 16. ⬜ Say the word if you want it |
| `dangerLiftAt` | no change needed: a lift on a 5 now stays 5 instead of being pulled down to 4 |

⚠️ **`"unsurvivable"` is a placeholder and the word is yours.** It is the only rung label I have ever added, the
prose in this game is yours, and I would rather you named it. `safe · quiet · uneasy · dangerous · deadly ·
unsurvivable`.

## 2 · `229 §2b` — fixed, and it asks a better question now

You asked me to count `roster` minus the `random: false` tiers. I did more than that, because a raw count is
satisfiable by a broken engine: `87 === 87` is also true of a version that lets a mythic roll. It asserts **both
halves** — every creature that *should* make an entry does, and **no** creature that must not has one — plus that
the total weight is unchanged.

⛔ **And you were right about `unique`.** SNG-661 §2 says one in the world is *"never on a random table"*, and I
gated the **tier** and forgot the **record** — so the phoenix and the kraken, unique *legendaries*, would have
rolled. Fixed and gated. Your roster: 87 creatures → **5 never roll** (`the_eye_of_the_storm`, `the_first_root`,
`ash_phoenix`, `the_deep_kraken`, and the third mythic).

## 3 · The non-combat floor — I took your second option, and it measures better than the floor

Your two options were a `beastShareMax` dial, or *"have a creature with a `storyRule` offer a STANDOFF /
CHALLENGE frame as well as the duel, since the rule **is** a non-combat way through."*

**I took the second.** A dial thins the world back down after you spent a day populating it; this uses the
feature to answer the problem. A **CHALLENGE** and not a standoff: a story rule is a *procedure* — carry a light,
show it a mirror, throw the rust-eater an iron nail — and a standoff is a contest of wills a grue does not have.

⛔ **And the weight is SPLIT, never added.** Two entries at full weight would have made beasts twice as common
and made the crowding worse. Measured on your roster: **87 creatures → 134 entries (82 duels + 52 ways through),
total beast weight 144.5 — byte-identical to one entry each.** You meet the creature exactly as often; a share of
those meetings is the way through instead of the fight.

⚠️ **Why your measurement caught what weights would have hidden:** `playthrough_sim` picks **uniformly** from the
eligible entries (`offerable[floor(rng()*length)]`), so its numbers move on the **count** of entries while the
live pool moves on the **weight**. Two different questions, and both had to come out right.

**Measured in a worktree against your held commit, same seeds:**

| cohort | origin | with the bestiary (your number) | with this | floor |
|---|---|---|---|---|
| social (Silas) | 11 | 3 | **11** | 8 |
| craft | 9 | 3 | **10** | 8 |

⛔ **And the frame does not give the rule away.** The seed says only that there is a way through this that is not
a fight; the rule itself still comes from the encounter receipt and only once `storyRuleKnown` is set. Handing it
over in the frame would give away for nothing what §3.2 makes them earn.

## What moved on my side, for the record

Four of my own gates reddened because the ruling landed — including **§365's last check, which WAS the open
question** (*"the engine clamps to 4 and the content authors 5"*), so it went red the moment Erik answered it.
Seventh gate of mine to redden because its own subject got fixed. It is the ruling now, and it asks for every
part of it, including that there is no silent 4 left.

Gates: §373, five checks. 32 suites green · 3,916 checks.

## Still open, and not mine

- ⬜ the word for danger 5 (above)
- ⬜ `pacing.js`'s 0..4 table (above)
- ⬜ your spec's §7.4 — the supply-line generator rule. CCODE-537 built it and **switched it off**, because your
  work order calls it RULED while your spec lists it under "RULINGS I NEED" and the staged `_status` says
  "proposal". One flag when Erik answers.

— CCode
