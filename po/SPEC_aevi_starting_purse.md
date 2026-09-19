# SPEC — Starting purse by background and place

**Aevi · 2026-09-19 · answers CCode's CCODE_20260919 decision and Erik's ask.**
Derived against `worthBands`, `purseBands`, the acceptance table, and `money.js` as CCode built it. Nothing invented.

---

## ⛔ §1 — THE RULE THE NUMBER HAD TO PASS

`DIRECTIVE_SNG-280` forbids value-as-coefficient: a weight reflects **cost, difficulty, risk or scale, never
approval**, and the justification must explain why the NUMBER is correct, not why the life was good.

A starting purse is the softest place in this world for that failure to hide. The moralised version writes itself —
the merchant is provided for, the thief starts with nothing — and it would read as flavour rather than as a value
claim installed as physics.

**The neutral quantity is LIQUIDITY: how much of your prior life converted to portable value when you left it.**
Not what the life was worth. What of it you could carry.

⛑ **The falsification test, run and passed.** A moralising model can never make the smuggler rich or the devotee
poor. Liquidity does both, by one rule applied evenly: **contraband is portable by definition; a temple's wealth
belongs to the temple.** The rule strips the pious and the learned and enriches the criminal, so it is not tracking
virtue. That asymmetry IS the proof, and it is why the table below looks wrong to a moral eye and is right.

⛑ Per `backgrounds.rules.orthogonal` — backgrounds are not gated by origin — **background and place set DIFFERENT
things and are never summed:**

| axis | sets |
|---|---|
| **background** | **how much worth** you left with |
| **place** | **which money** it is in, and therefore **how far it travels** |

---

## ⛑ §2 — THE RUNGS ARE `worthBands`, NOT NEW NUMBERS

`purseBands` was itself derived from `worthBands`. Starting purses land on the same rungs, so every tier states a
concrete fact about what the character can buy once:

| tier | worth | `worthBands` rung | the plain fact |
|---|---|---|---|
| **L0** | **0** | — | nothing on you. You are asking, or going without. |
| **L1** | **4** | useful | one useful thing, or a few days fed. |
| **L2** | **15** | valuable | one valuable thing, once. |
| **L3** | **50** | precious | one precious thing — or three valuable ones. |

⚠️ **The ceiling is deliberate and it is a `playerChooses` constraint, not a balance instinct.** The player CHOOSING
their background is mandatory. A spread wide enough to make one background the economic pick means the purse has
started choosing the background. L3 is 50 — three valuable things — against Silas's played-in 1,696. Starting money
is a difference in opening position, never a reason to pick.

⛑ Every start sits below the `well-found` rung (60). **No new character begins where money has stopped being a
constraint.** That is the earned state and it stays earned.

---

## §3 — THE ASSIGNMENT, ALL 40

**L3 · 50 — the trade WAS portable value.** The stock is the wealth and the stock moves.
`trader` · `broker` · `smuggler`

**L2 · 15 — the work produced portable surplus.** Paid in purses, fees, retainers or salvage.
`duelist` · `arena_fighter` · `bodyguard` · `war_leader` · `mechanist` · `smith` · `craftsman` · `physician` ·
`envoy` · `performer` · `spy` · `ruin_picker` · `former_professional`

**L1 · 4 — the wealth was tools, land, or standing, and you carry it as THINGS.** You are not poor. You are
illiquid. The bow, the kit and the knowledge came with you; the herd and the workshop did not.
`line_soldier` · `skirmisher` · `warden` · `hunter` · `builder` · `farmer` · `river_runner` · `survivalist` ·
`cartographer` · `lawspeaker` · `organizer` · `self_taught` · `battlefield_taught` · `found_it_by_accident` ·
`lineage_taught` · `apprenticed_to_a_legend` · `precursor_marked`

**L0 · 0 — you left without converting anything.** Two different causes, one result: the institution held the
wealth and it was never yours to take (`temple_trained`, `devotee`, `scholar`, `archivist`), or you did not leave on
terms that allowed settling up (`orphan`, `exile`, `drifter`).
`orphan` · `exile` · `drifter` · `devotee` · `scholar` · `archivist` · `temple_trained`

⚠️ **`devotee` and `orphan` land on the same rung. So do `trader` and `smuggler`.** If either pair ever drifts
apart, the moral model has come back in.

---

## §4 — PLACE SETS THE MONEY

Per `money.js`: a place pays in its own money. Multiplier is `baseValue_crystal / baseValue_local`, exactly the
`acceptance.conversion` formula, and **an income rounds DOWN to the piece.**

| start class | money | ×W | L0 | L1 | L2 | L3 | piece |
|---|---|---|---|---|---|---|---|
| `the_crossing` | crystal | 1.000 | 0 | **4** | **15** | **50** | quarter-cut |
| `foothills` — valley, Echo Vale, `foothill_*` | coin | 1.667 | 0 | **6.5** | **25** | **83** | half |
| `reaches` — every other region | own scrip | 3.333 | 0 | **13.33** | **50** | **166.67** | free |

⛑ **Verified against CCode's live figure**, not asserted: Stillwater's Trouble pays a 56-shard keep as **186.67
Palelands scrip**. 56 × 3.3333 = 186.67. The multiplier is the one already running.

⚠️ **A Reach start is a bigger number and a smaller world, and that is the point.** Scrip is fungible in its own
Reach only and `acceptance` says the Crossing is the only place it converts at all. A Reach-born character is richer
at home and carries less out. **That is a real constraint, not a penalty** — and it is the first thing in the game
that teaches the acceptance table without a tutorial.

⬜ **Open, and it is CCode's `money.class` field, not mine to guess:** the stand-in has every non-foothill region as
a Reach. `the_crossing`'s own region is crystal. I am authoring the class per region in `economy.regions[].money.class`
as a separate pass — this spec assumes the stand-in and does not depend on it.

---

## §5 — ⛑ FOR CCODE: THE 12 EMPTY PURSES

**These characters are not poor. They were never paid a start.** The correction is a backfill of an omission, not a
grant — so it is written to the floor, not added to the balance.

```
for each character with a background and a start (or current) location:
    floor   = TIER[background]                     // 0 | 4 | 15 | 50, in shards of worth
    money   = moneyOf(locationRegion)              // via money.class, per money.js
    target  = roundDownToPiece(floor × rate(money), money)
    if worthOf(purse) < floor:  earnAt(location, target − worthOf(purse))
```

⚠️ **Top up to the floor; never stack.** `max(current, floor)`, not `current + floor`. **Loki's 31 is above L2 and
below L3** — Loki gets the difference if the background is L3 and nothing at all otherwise. Silas is untouched at
every tier.

⚠️ **Pay through `earnAt`, not a direct write.** It is the path that denominates in the place's own money, rounds to
the piece and names the money on the line. A direct write would re-introduce the crystal hardcode CCODE-437 just
removed, and in the one place nobody would look for it again.

⛑ **Line it as a backfill, not as income.** It should be legible later as a correction — it predates play and should
not read as something the character earned.

⬜ **Characters with no background recorded** are the real unknown and I will not guess them: report the list and I
will place each one. `playerChooses` is mandatory, so **a missing background is asked, never assigned.**

---

## §6 — ⬜ ONE CALL THAT IS ERIK'S, NAMED AS ONE

Per DIRECTIVE §5, a value call gets handed over rather than smuggled in as a coefficient.

**Does the backfill run at all?** The derivation above is neutral, but *whether a played world gets money minted
into it retroactively* is a world call, not a maths call. Three honest answers:

1. **Backfill to the floor** — they were owed a start and never got it. *(My recommendation: the omission is ours,
   and twelve of sixteen at zero is an engine gap showing through as a story about poverty that nobody wrote.)*
2. **Nothing** — the world has moved; they earn or find it, and the empty purse is now canon.
3. **Floor of L1 (4) for everyone** — no one is stranded, nobody is paid for a background they have already played
   past.

— Aevi
