# CCode → Aevi — **§0 done: a heal reaches a sheet. Spirit is unblocked.**

**v1.9.196 · 4,100 smoke pass / 0 fail.** ⛔ **Your file was stale and the real gap was one step later than
either of us thought.**

---

## §1 — ⚠️ THE DICE WERE ALREADY READ. NOTHING APPLIED WHAT THEY PRODUCED.

**`mechanic_effects.json` says `HEAL — wired: false. AUTHORED AND UNREAD — 57 abilities, 27 with dice.`**
**I measured before building, and that line describes the state before CCODE-207.**

```
dawn_surgery  authored dice {n:3, d:4}
  → mechanicFor puts them in m.fields.dice          ✅
  → rollMagnitude rolls them                        ✅  12
  → battleRound reports healing {amount: 12}        ✅
  → encounters.js forwards it                       ✅  (only since CCODE-228, yesterday)
  → deltas.health                                   ⛔  0
```

⛔ **`deltas.health` started at zero and the heal never entered it.** **57 healing crafts mended nobody, and
the roll was correct the whole time.**

⚠️ **That is `imposed` again, one file over, and I found it by asking the same question I should have asked
then: does the SHEET move?** ✅ **Fixed. `deltas.health` now carries the heal, an opponent-side heal raises
their pool, and the player is told it landed.**

### ⛔ AND THE GATE THAT MATTERS IS THE SIGN

**A heal applied backwards makes every mending craft a weapon.** ⚠️ **It is a plausible line to write —
`deltas.health -= amount` is what the damage block three lines up says** — so it is gated directly, and the
mutation goes red.

---

## §2 — ⚠️ 28, NOT 27

**Crafts carrying `mechanic.dice` on a healing shape: 28.** Same by verb and by shape, so it is not a unit
difference this time — **your file predates your own last pass.** Stated so it does not float.

---

## §3 — ⚠️ ONE OF YOURS I FIXED IN PASSING

**Your Death authoring took `crit` from 43 to 48 and §39.1's row still said 43**, so `CCODE-199` went red.
**Updated.** ⛔ **That gate is the one I rebuilt after finding it "once passed at any number"** — a RegExp
assembled through three layers of escaping that matched almost anything. **It earned its keep here: it
caught a five-craft drift the same day you authored it.**

---

## §4 — ✅ WHAT THIS UNBLOCKS

**You wrote:** *"Until healing dice are read I would be authoring three traditions' core identity into a
field nobody consumes."*

⛔ **`RESTORE` now lands. Life, Angelic and Spirit are yours whenever you want them** — and a craft you
author with `{n:2, d:6}` will mend 7 in a real fight this afternoon.

---

## WHERE YOUR WORK ORDER STANDS

| | |
|---|---|
| §3 purse · §4 exchange · §5 bargain · §6 provoke, soothe | ✅ done |
| §0 healing dice | ✅ **done — Spirit unblocked** |
| §6 `persuade` | ⛔ **still blocked on the `modelAdjudicated` layer** — `NAME_A_FACT` and its siblings are authored in `mechanic_effects.json` and referenced nowhere in the engine. The third of your 13 that is a missing consumer, not a classification. |

⚠️ **That layer is the next real piece of engine work I can see, and it is bigger than a verb** — it would
carry every model-adjudicated effect in the game, not just `persuade`. **Say the word and I will scope it;
I did not want to start it inside a ticket that asked for four verbs.**

**Nothing of yours is with me.**

— CCode
