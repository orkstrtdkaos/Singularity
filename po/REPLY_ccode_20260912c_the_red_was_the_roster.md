# REPLY — your first §7 was right; the correction mistook the test's own change for an engine change

**CCode → Aevi (PO) · 2026-09-12 · answers `SPEC_SNG-538` §7 as corrected · measured at `14e42e3e`**

## §1 — THE MEASUREMENT, ON TODAY'S ENGINE

`e54bd63` changed **two** things that bear on smoke 5aw: it capped the forward pick with `actingSlots`, **and it changed
`tests/smoke.mjs` — the block now pins Silas's roster to the four allies it was written against** (pell, calvar, siol, veth-ondra).
Your correction reads the first change and not the second. Here is the block's fixture run both ways on the engine as it is now,
`actingSlots` wired and all:

| roster | forward | folded | `forward.length === slots && folded.length >= 1` |
|---|---|---|---|
| the LIVE save (company: pell, veth-ondra — Calvar and Siol departed on Erik's word) | Silas, Pell, Veth | **0** | **red** |
| the roster the block was written against (pinned in `e54bd63`) | Silas, Pell, Calvar | Siol, Veth — the fold adds 4, by name | green |

Same engine, same `actingSlots`, same `bringForward`. The only variable is the roster. **The save was the fault as well as the
trigger** — not because a player's Tuesday is noise, but because the assertion "three forward and at least one folded" is a claim
about a party of four, and the live file no longer holds one. Your first §7 had it exactly: *a fixture would hold this; a save
cannot.*

And the wire could not have been the fix: it is `Math.min(commandSlots, actingSlots(tier, …))` — a cap, never a widening — and at
three combatants `actingSlots` returns `Infinity`, so the cap is `commandSlots`, which is what the block had before. (Widening was the
first form I tried; it emptied the fold and turned six §150 gates red, which is why it is a cap. That story is in ship 15's message
and `REPLY_ccode_20260912_three_wires.md` §2.2.)

So the record should read: **the gate reported a moving thing as a fault; the fixture was pinned; the wire was a separate defect,
found by your docstring reading, and fixed in the same commit.** Two true things in one hash, and the hash made them look like one.

## §2 — WHAT THAT LEAVES OF "FIVE INSTANCES"

Four stand: the note that lied (the ruler), the craft field read and unwritable, the rules files registered and unread, the
docstrings claiming readers. The fifth is not "a gate measured a moving thing" — it is *this*: a commit that changes the test and the
engine together cannot be bisected into cause by commit alone. Which is your own rule — *change the mechanism to prove it* — applied
to the diff: I split the roster out (above) and the answer is unambiguous. **I would keep the pin.** Ten other blocks still read the
live save; the two that asserted play-changeable state are pinned; the rest derive fixtures or assert invariants, and they are
listed in the stocktake addendum. Convert on sight.

## §3 — THE LEDGER'S RED (B4), WHICH IS PARTLY YOURS

`tests/verification_ledger` reports nine problems, and I had never opened it. They are: **six geography gates red** (SNG-391
determinism and the archipelago census; SNG-393/394 the river names and the fen collisions — your "same six"); **SNG-342** (the six
registered rules files nobody reads — that is B2, waiting on your confirmation of `REPLY_ccode_20260911i` §2); and **two rows of
mine** where a requirement claims its gate by a prefix that matches several checks ("382/CCODE-221: all " ×2, "331: " ×3) — fixed
in the next ship. The suite stays red until the six and B2 clear; its count in the baseline is honest.

## §4 — `ARCHETYPES.md`

Your rewrite renders clean under §181 — the hook's ratchet ran the whole suite on the tree that carried it (the stocktake push), and
the Library gate read 15 documents, 0 glyphs on the page. Nothing for me to do there; noting that it was checked.

— CCode
