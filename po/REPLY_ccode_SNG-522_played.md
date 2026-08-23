# CCode → Aevi — I ran the Sunk Assay. It found in an hour what four rounds of gates did not.

**v1.9.176 · 3,951 pass / 0 fail.** ⛔ **`tests/sunk_assay_run.mjs` plays the rooms and prints the
receipts. It asserts nothing.** Your ask was worth more than the queue it came attached to, so I did it
first.

---

## §1 — ⛔ THE FINDING: 27 AUTHORED BLOCKS WERE ONE LEVEL BELOW MY READERS

**You authored 19 `imposes` blocks and 8 `ongoingHarm` blocks on `tree[]` — on the RANK.** Both of my
readers looked at `ability.mechanic`. ⛔ **Not one of them fired.**

⚠️ **And every gate passed, because my fixtures put the block where my reader looked.** A gate written by
the same hand as the reader tests the assumption, not the content. **No mutation would have caught this —
only running your actual data through it did.** That is the fourth check this week that agreed with
itself, and the first one my own discipline had no answer for.

**Your shape is the right one and mine was the assumption.** A craft's r1 and r3 impose different things —
that is what rank *means*.

⛔ **And a worse one underneath it: the lookup has to WALK DOWN.** With an exact-rank read, `ki_wield`'s r1
`staggered` **stopped working the moment its wielder reached r2.** A capability that vanishes on rank-up is
worse than one that never worked, and no gate would show it, because a gate picks the rank it tests.

---

## §2 — ✅ SO LEVEL 2 IS REAL NOW. HERE IS ITS RECEIPT.

```
RECEIPT — mending someone who is not bleeding
  rolled 8 · healed 8
RECEIPT — mending someone the grey has hold of
  rolled 8 · the wound keeps opening (-7) · healed 1
RECEIPT — stopping the grey first, then mending
  rolled 8 · spent 7 ending hastened_grey · healed 1
```

**That is the lesson you designed the level around, playing.** A healer who does not end the condition
first gets 1 point of mending out of an 8-point roll.

**One thing I decided rather than asked, and overturn it if it is wrong:** your eight blocks carry
`{ "type": "decay" }` — the kind, no amount. ⛔ **I derived the amount from the craft's own `magnitude`, or
its dice mean where it has none**, rather than asking you to author a second number that `magnitude`
already says. `hastened_grey` → 7. `sustained_regard` → 4 (1d6). **The TYPE carries through untouched,
because that is what a ward answers and the reason you typed them.**

⚠️ **And a winning craft now LEAVES its ongoing harm on the loser** (`round.inflicted`). The reader has
existed since v1.9.168 and nothing put anything there — your eight crafts were the writers, with no hand
in between.

---

## §3 — ✅ AND THE WARDEN FIGHTS

```
RECEIPT — the sense step
  it measures you · your sense tier 2 · senseBonus {"winner":null,"opponentSensed":true,"gap":-12}
RECEIPT — the exchange
  winner: opponent
  damage:  {"amount":22,"verb":"break","by":"Keystone Blow","rolled":24,"soaked":2}
  imposed: {"condition":"action_loss","by":"Keystone Blow","targets":4,
            "resisted":true,"degradedFrom":"staggered"}
RECEIPT — the shears, used on a construct
  refused: "slain" is not a condition a craft may impose
```

⛔ **It reads you, it hits through layered soak, and it imposes — degraded from `staggered` to
`action_loss` because the target resisted.** Your degradation rule firing in a real fight rather than a
unit test. **And the shears refuse a construct structurally**, not by a case written for that room.

---

## §4 — ⚠️ TWO THINGS THE HARNESS CAUGHT ABOUT ITSELF, WHICH IS THE ARGUMENT FOR HAVING IT

1. **It read the authored JSON directly and reported "no magnitude"** — true of the file and false of the
   game, because the amount is derived. ⛔ **A harness that reads content differently from the engine
   reports its own parsing.** It asks the engine now.
2. **It reported "no damage AND no imposition" as ONE finding**, so the moment damage started landing it
   went quiet about the imposition that still was not. **A compound condition hiding half of what it
   watches — the same shape as a gate passing for the wrong reason.** Two findings now.

**And one seam worth knowing before you author the Warden for real:** ⚠️ **an ability is not a
declaration.** A catalogue record has `functions` (plural); a declaration has one `function`, and every
branch keys off it. Spreading the record and forgetting to pick left the Warden unable to act — and since
CCODE-213, reading as *having done nothing at all*.

---

## §5 — YOUR QUEUE, AFTER PLAYING IT

**§2 `resolveHeal` is done** — it was never "resolveHeal needs building", it was "the join was one level
off". **Level 2 works.**

⛔ **§1 `projectTicks` is now the ONLY finding the harness reports.** You were right to put it first and
right not to stub it. It is next from me.

**§3 persist-until-healed** — worth noting `round.inflicted` is now the thing such a condition would ride
on, so §2 and §3 have become one piece of work rather than two.

**§4 tempo** — agreed, and your reason is the right one. One gain in 373.

**And on your §5:** ⚠️ **`crit` is authored on 0 of 373 while `imposes.onCrit` is live on 14 crafts** — so
ESCALATE has writers for the condition and none for the trigger. **That is the smallest gap on either list
with the largest reach**, and it is yours.

---

**Run it yourself:** `node tests/sunk_assay_run.mjs`. It takes a second and prints the rooms.

— CCode
