# CCode → Aevi — **§3–§6 built. `SNG-263 §1` is down to `persuade` alone, and that one is another `foothills`.**

**v1.9.195 · 4,094 smoke pass / 0 fail · 16 of 18 suites green.** ⛔ **`engine/purse.js` · 34 gates · 6
mutations.**

---

## §1 — ✅ THE PURSE, AND YOUR "FIVE INTEGERS IS WRONG" WAS THE WHOLE BRIEF

**Every one of your five load-bearing rules is a gate, and every gate is mutation-tested.**

| rule | how it is held |
|---|---|
| `crystal` the reference | everything converts through it; `worthOf` reports in it |
| ⛔ `coin` fixed supply | **`credit` demands an honest provenance.** `origin: "minted"` is refused; `found` and `traded` pass. **No path creates one.** |
| ⚠️ `paper` issuer risk | ⛔ **the purse stores NOTES, never worth.** 20 notes worth 8 crystal become 3 when the issuer falls, *without the purse changing*. A cached worth would have frozen paper at the rate it was earned and defeated the one currency whose character is that it can betray you. |
| ⛔ `scrip` per-Reach | keyed by `regionId`. **`held(purse,"scrip")` with no Reach returns `null`, not 0** — "how much scrip" has no answer, and 0 would be a lie. |
| ⛔ `marks` indivisible | refused on credit, on debit, **and through conversion** — a fraction of a mark converts to nothing rather than 0.5 |

✅ **And the conversion reproduces your own worked example: `20 old coin → 10 shards`**, with every term
returned so the 2-shard bite is visible rather than described. **Erik's `visibility` rule is honoured both
ways** — the purse is a permanent row on the sheet with the number; the trader still says *"ten for those,
and I'm being generous."*

---

## §2 — ✅ THE EXCHANGE, AND ERIK'S RULING DID REMOVE THE HARD HALF

⛔ **It is an op group on the turn stream — `exchangeOps` — not a screen.** `economy.json` says there is no
shop and should not be, and **there is now nowhere in the engine to put an open trade**: a gate asserts the
absence structurally, over the code with comments stripped.

⚠️ **That gate failed on its first run because it matched its own explanatory comment** — the file says
*"nothing is escrowed"* and the scanner found the word. **Third time this month I have written a check that
reads its own prose.** Stripped now.

✅ **A trade that cannot be paid changes NOTHING** — checked before anything moves, which is the only way
"no open state" is a guarantee rather than a claim. **And a refusal reaches the player on the sheet**, not
a console warning: a silently-dropped refusal lets the narration describe a purchase that never happened.

---

## §3 — ✅ `bargain`, AND YOUR SCOPE-NOT-MAGNITUDE RULE IS THE GATE

| deal | r1 | r5 |
|---|---|---|
| a sack of grain (8) | **6.4** | **6.4** |
| a caravan contract (200) | ⛔ **cannot move it at all** | **160** |

⛔ **Out of reach is a REFUSAL, not a smaller effect.** A rank-1 haggler at a caravan contract is out of
their depth, not marginally less persuasive — scaling it down would have quietly rebuilt the discount
ladder your rule exists to prevent. **Reach: r1 10 · r2 30 · r3 90 · r4 270 · r5 810, all dialled from
content.**

⚠️ **AND I WANT TO FLAG HOW EASY THE WRONG BUILD WAS.** `SNG-263 §1` only checks that a verb appears in a
family or an override — **so three lines in `craft_mechanics.json` would have turned it green having built
nothing.** ⛔ **Every gate tests the consumer; the registration is checked last and only as a consequence.**

**`concessionOwed` carries §31.5** — both sides give something — and per Erik it is given at the deal and
never tracked after it.

---

## §4 — ✅ `provoke` AND `soothe` NEEDED NO NEW FIELD, EXACTLY AS YOU SAID

**`provoke` clears `state.tactic`** — Erik's *"cost the opponent a chosen action, making them revert to
basic default"* is that, precisely. ⚠️ **And it does NOTHING to a foe committed to nothing**: there is no
line to break, which is a refusal rather than a hollow win.

**`soothe` pulls MOMENTUM toward zero and never past it** — cooling a fight the other side is winning must
not hand you the advantage, or soothe becomes an attack. ⛔ **It never touches a damage track**, gated
directly, because a soothe that healed is a second RESTORE verb wearing a social name.

---

## §5 — ⛔ `persuade` IS NOT A VERB-SIZED JOB, AND THE REASON IS ONE OF YOUR 13

**It is the last one on `SNG-263 §1` and I did not force it.**

**Your spec says model-adjudicated in the `NAME_A_FACT` form. That form is authored — in
`mechanic_effects.json`, with a principle I would not improve on:**

> ⛔ *"A MODEL EFFECT IS A CONTRACT WITH THE MODEL, NOT AN ABSENCE OF ONE… could two different GMs produce
> answers that differ in KIND rather than in detail? If yes, the contract is underspecified."*

⛔ **AND NOTHING IN THE ENGINE REFERENCES ANY OF IT.** `NAME_A_FACT`, `NAME_A_WEAKNESS` and the rest appear
in exactly one place in the repo: the JSON file that defines them. **The whole `modelAdjudicated` layer is
unread.**

⚠️ **That is `foothills` again — the third of your 13 that turns out to be a missing consumer rather than a
classification.** **Mechanising `persuade` means building that layer, and it would carry every other
model-adjudicated effect with it.** ⛔ **I am not doing it inside a verb ticket.**

---

## §6 — TWO OF MINE, BOTH ON THE RECORD

**1 · I reached for `winRoll`/`loseRoll` outside their block.** ReferenceError. ⛔ **The suite reported ONE
failure while deleting 240 passes** — the exact tell I have written down twice and now hit twice.

**2 · The CCODE-228 derived seam gate caught `unsettled` and `cooled` being dropped by the wrapper, minutes
after I added them.** ✅ **First new keys since it was built, and it went red the same run.** ⚠️ **That is
the argument for deriving the list rather than keeping it by hand, made by the thing itself rather than by
me.**

---

## WHAT IS LEFT OF YOUR ORDER

| | |
|---|---|
| §3 purse · §4 exchange · §5 bargain · §6 provoke, soothe | ✅ **done** |
| §6 `persuade` | ⛔ **blocked on the `modelAdjudicated` layer — §5 above** |
| §0 healing dice | ⚠️ **next from me, and before you audit Spirit as you asked** |

**Nothing of yours is with me. Good luck with Death.**

— CCode
