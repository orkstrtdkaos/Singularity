# FINDING — 87% of fights do not end, and threat alone decides the rest

**Aevi (PO) · 2026-09-07**, after re-running `scripts/encounter_matrix.mjs` with the family archetypes and
the fifteen effect rows live. ⬜ **CCode's harness; the reading is mine.**

---

## §1 — ✅ THE TWO GAPS I AUTHORED ARE CLOSED, PROVEN ON THE PRODUCTION PATH

| | before | after |
|---|---|---|
| ⛔ **dead braids** — the weave resolving exactly as the lead craft alone | **105 of 756** | ⚑ **0 of 756** |
| ⚠️ **generic verb groups** | 4 | ⚑ **3** |

⛑ **`strike + break` — CCode's *"most obvious combination in the game"* — is a real weave now.** ⚠️ **And
`open` cleared exactly as designed: it was the one generic that was NOT social.** ⛔ **The three that remain
are `persuade`, `bargain`, `provoke` — §C, unbuilt** — their RESIDUE differs now, but their ACT does not
exist yet.

---

## §2 — ⛔ AND THE BALANCE FINDING IS NOT WHAT EITHER OF US THOUGHT

**I said the defensive champions might look easy because their opponents could only strike and shield.
⛑ THAT WAS WRONG — the archetypes were live for this run and the numbers did not move.**

### ⚑ THE REAL SHAPE: `win% == ends%`, IN TWELVE OF SEVENTEEN ENCOUNTERS

| | |
|---|---|
| coliseum_harm | ⛔ **12% win · 12% ended** |
| coliseum_sustain | ⚑ **73% win · 73% ended** |
| duel_marchward | ⛔ **13% · 13%** |
| wild_boar | ⛔ **13% · 13%** |

➡️ ⛔ **THE FIGHT IS ALMOST NEVER LOST. IT DOES NOT FINISH.** ⚠️ **87% of Silas's fights hit the 14-round cap
with both sides standing** — ⚑ **so the defensive champions are not the easiest fights, THEY ARE THE ONLY
ONES THAT END.**

⚠️ **Five encounters DO produce real losses** — `move` 18%, `greatcat` 18%, `zone_raider` 21%, `know` and
`redline` 10% each. ⛑ **Those five are the only ones where the arithmetic is a fight.**

---

## §3 — ⛔ AND ONE NUMBER EXPLAINS THE WHOLE SPREAD

| threat | win |
|---|---|
| 26 sustain | ⚑ **73%** |
| 28 protect | 72% |
| 30 restore | 57% |
| 36 shape | 18% |
| 40 harm · boar · mirrors · marchward | 12–13% |
| 44 move · greatcat | 8% |
| ⛔ **45 zone_raider** | ⛔ **7%** |

⛑ **CORRELATION: −0.95.** ⛔ **THREAT ALONE EXPLAINS IT.** ⚠️ **Not the archetype, not the family, not the
tactic tags, not the fiction — one authored integer, and every other design decision in an encounter is
noise beside it.**

➡️ ⚠️ **THE EIGHT COLISEUM CELLS WERE BUILT TO PROVE EIGHT FAMILIES CAN EACH WIN A FIGHT. THEY CURRENTLY
PROVE THAT THREAT 26 IS EASIER THAN THREAT 44.**

---

## §4 — ⬜ WHY, AND IT IS R34b MEETING A CAP THAT DID NOT MOVE WITH IT

**`breakAtPressure = ceil(level / 2)` of the side being broken** — ✅ Erik's R34b, and it was right: a flat 2
ended 1,595 of 2,000 duels by break, and a level-33 figure should be hard to drive off a field.

⛔ **BUT THE ROUND CAP IS 14.** ⚠️ **A synthesised opponent's level derives from threat, so a threat-44 foe
needs pressure ticks the fight does not have rounds to produce** — ⚑ **and health, the other exit, was
measured in September as *"nobody dies of dice."***

➡️ ⛔ **BOTH EXITS ARE OUT OF REACH AT ONCE, AND THE FIGHT SIMPLY STOPS.**

⬜ **Three shapes, and this is Erik's:**

| | ⬜ | ⚠️ |
|---|---|---|
| **A** | ⚑ **raise the cap** | ⛔ a 25-round fight is not better, it is longer |
| **B** | ⚑ **cap `breakAtPressure` at what a fight can actually produce** — ⚠️ **a bound of ~6–8 with the level fraction below it** | ⛑ **keeps R34b's shape and makes it reachable** |
| **C** | **make pressure accrue faster at high threat** | ⚠️ the strong foe breaks as fast as the weak one, which undoes R34b |

⚑ **AEVI READS B**, and it is R34b's own logic finished: *"how hard is THIS person to drive off the field"*
is a good rule, ⛔ **but a person who cannot be driven off within any fight the engine will run is not hard,
they are unreachable.**

---

## §5 — ⚠️ AND ONE SMALL THING WORTH FIXING WHILE WE ARE HERE

⛔ **36 of 1,038 declarations against `precursor_mechanism` never touched it and never ended it.** ⚑ **That is
CORRECT and it is the encounter working** — *"nothing here can be hit"* — ⬜ **but the panel should say so
before the turn is spent, not after.**

⚠️ **Part Two §10 zone 4 is where that belongs: a craft that cannot affect this opponent should be dimmed in
the menu**, ⛑ **which is the same discipline as the free floor being prepended rather than appended.**
