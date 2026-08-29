# HANDOFF — new canon from Erik: ascension across the Veil, and NPCs stop being level 1

**CCode → Aevi · 2026-08-29 · v1.9.260 · ⛔ ERIK ASKED ME TO TELL YOU**

---

## §1 — ⛔ NEW CANON, ERIK 2026-08-29 — VERBATIM

> *"After or around lvl 100 a character and/or NPC will either **ASCEND or FALL ACROSS THE VEIL**. They will
> go to join **the primary conflict**. This is new Canon I just thought of… so **the World's Mythicals are
> those high near level 100 NPCs**."*

> *"The NPC cap is garbage cruft — **the world arcs move mainly from NPCs who have climbed the ladder**. We
> need to create character sheets for all of them who have been authored. They get **killed and injured and
> they need to grow too** (which they do in tier)."*

---

## §2 — ✅ AND IT LANDS ON GROUND YOU ALREADY AUTHORED

⚠️ **THE PRIMARY CONFLICT IS NOT NEW — IT IS `the_veil.json`, SNG-448, AUTHORED 2026-08-15 AND NEVER LOADED.**

Its own words: *"⛔ **THIS IS THE SETTING'S ACTUAL WAR AND ALMOST NOBODY IN IT KNOWS THEY ARE ENLISTED.** The
Enginewrights thicken the divide by building well. The Veilwrights thin it by working. The Numinous thin it
by sitting still in the wrong place."*

⛔ **AND IT ALREADY HAS THE DOOR.** *"The Veil nexus locations could be ESTABLISHED GATES TO THE OTHER SIDE…
a Veil nexus is not a thin patch — IT IS A DOOR SOMEBODY BUILT."*

✅ **SO ERIK'S ASCENSION IS THE EXIT FROM THIS SIDE INTO THE WAR THE SETTING HAS ALWAYS BEEN ABOUT** — and
it is one of the nine registered-never-loaded rules files in `HOW_IT_WORKS §10`. ⚠️ **This canon just made
that gap load-bearing.**

---

## §3 — ✅ WHAT I ALREADY FIXED (CCODE-309)

⛔ **THE CRUFT WAS WORSE THAN THE CAP, AND THE CAP WAS ONLY ITS VISIBLE HALF.** Every term of
`derivedLevel` measured **the player's relationship with the NPC** — how often you met them, how long you
have known them, your standing:

```
level = 1 + met/4 + daysKnown/96 + standing/25,  clamped to 20
```

⛔ **SO AN NPC'S POWER IN THE WORLD WAS A FUNCTION OF THE PLAYER'S ADDRESS BOOK. A world-moving Mythical
the player had never met was LEVEL 1.**

✅ **NOW:** an authored level is **what they are**; the relationship terms became **growth on top**; and the
ceiling is **100 — the ascension threshold**, so the clamp finally means *"as far as anyone goes on this
side"* rather than *"as far as we bothered to model."*

| case | before | now |
|---|---|---|
| a stranger | 1 | **1 — unchanged** |
| met 40 times, unauthored | 11 | **11 — unchanged** |
| ⛔ a Mythical authored at 92, never met | **1** | ⛔ **92** |
| that Mythical, met 40 times | 1 | **100 → and then they cross** |

✅ **7 assertions in `how_it_works.mjs §13`, both regressions proven to make it go red.** ⚠️ **An
unauthored NPC behaves bit-identically to before — reader before field, so nothing moves until you author.**

---

## §4 — ⬜ WHAT IS YOURS, AND IT IS THE BIG HALF

### 4a · ⛔ 42 AUTHORED NPCs AND **NOT ONE** CARRIES A LEVEL

**Measured across every pack: 42 NPC files, 42 NPCs, `level` authored on zero of them.** ⚠️ **Until you
author one, every one of them is still whatever the player's address book says** — the fix I shipped is a
reader with no writer until you write.

**What each needs, minimally:**
- ⛔ **`level`** — what they are in the world, on the 1–100 ladder.
- **health / soak** — Erik: *"they get killed and injured."* Today `presenceSheet` gives every NPC
  `health = level × 2` and `soak = 0`, so **a Mythical has no armour and a smith has the same body as a
  warlord.**
- ⚠️ **What they can DO** — `assistTags` feed `contributionsOf`, which is what makes them count as coverage
  in a group. A Mythical with no tags contributes nothing but `HARM`.

### 4b · ⚠️ WHERE THE LADDER'S RUNGS ARE, IN FICTION

**I can put a number on anyone. I cannot say what a 40 IS versus a 75.** ⛔ **The eras I proposed in
`DESIGN_ccode_engagement_through_all_scales.md` need names a player would recognise** — and the top rung
now has one: **Mythical.**

### 4c · ⛔ WHAT ASCENDING AND FALLING MEAN, AND HOW THEY DIFFER

**Erik said "ascend OR fall" — two outcomes, one threshold.** ⚠️ **That is a fork, and the engine has
nothing that decides it.** Does it turn on what they did? which side of the war their work served? whether
anyone was holding them here?

⛔ **AND THE MECHANICAL QUESTION UNDERNEATH: what happens to a companion who ascends?** They leave the
party — permanently? Can they be reached? **`the_veil` says the nexuses are doors, which implies they can.**

### 4d · ⚠️ WHICH OF THE AUTHORED NPCs ARE ALREADY MYTHICALS

**`docs/ARCS.md` says the arcs move through hinge NPCs.** ⛔ **Erik's ruling says those hinges are the ones
who climbed the ladder — so the arc-movers and the high-level NPCs should be the SAME LIST, and right now
nothing connects them.**

---

## §5 — ⬜ AND ONE THING I WILL NOT DO WITHOUT YOU

⛔ **I AM NOT GOING TO PICK THE NUMBERS.** Authoring a level for 42 people is deciding who matters in the
valley, and that is expression of Erik's will, not implementation of it.

✅ **What I will do the moment you have a shape:** a generator that proposes levels from what you have
already written — arc involvement, standing, how many places name them — for you to correct rather than
compose from nothing. ⚠️ **Say the word and it exists; I did not build it unasked, because a tool that
proposes numbers is a tool that decides them if nobody is checking.**

— CCode
