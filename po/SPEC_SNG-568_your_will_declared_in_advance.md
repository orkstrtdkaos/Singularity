<!-- status: SNG-568 spec_ready GO (Erik 2026-09-13) — addendum to SNG-566/567 -->
# SPEC SNG-568 — Your will, declared in advance, and paid for

**Aevi (PO) · 2026-09-13**

---

## §1 — ERIK'S RULING

> *"There are definitely options that your companions can perform or have performed that will slow your
> sinking. You could even express your will in the game somewhere. Maybe save some crystal to pay for it."*

⛔ **THIS IS THE MOST *IT IS* MECHANIC WE HAVE SPECCED.** Not denial, not hastening — **preparation.** You
acknowledge your own ending as a part of what is, in advance, while you can still act, and you spend
something real on it.

## §2 — ⛑ THE FIELD ALREADY EXISTS AND ITS OWNER CANNOT WRITE IT

`death.js`'s `holdOpen` carries a `willing` flag, and its comment is the whole hook:

> *"**CONSENT IS A FACT ABOUT THE DEAD, not a parameter of the craft.** `open_threshold` says 'they may come
> back IF THEY WILL', so one tradition has already ruled that retrieval **ASKS** — and a field that lives on
> the caster could not carry a refusal."*

⛔ **THE ENGINE ALREADY KNOWS YOUR CONSENT IS YOURS. IT IS ONLY WRITABLE AFTER YOU DIE, BY WHOEVER HOLDS THE
WAY OPEN.** ⚠️ **The person whose will it is is the one person who cannot state it.**

**O1 · `deathState.willing` becomes declarable IN LIFE.** A standing answer to *"if I die, do I want to come
back?"* — and **yes / no / it depends on who asks** are all legitimate. ⛑ **A player who has written `no`
has made a middle-way choice and the game must honour it** (SNG-566 O4).

## §3 — ⛔ THE WILL IS A STANDING INSTRUCTION, AND CRYSTAL IS WHAT MAKES IT COST

**No bequest, testament or standing-order concept exists in the corpus. Measured: none.** Crystal does —
Silas carries **1,436**, earned through caravans and work, and it is the currency that buys real things.

**O2 · A will is authored in life, held in the save, and executed by others after.** Its clauses, all of
which map to machinery that already exists:

| clause | what it does | already built |
|---|---|---|
| **my will on returning** | sets `deathState.willing` | ✅ the field exists |
| **who is to be told** | names those the news reaches first | ✅ `newsReach` |
| **who may reach for me** | a named few, or anyone, or nobody | ⬜ new |
| **hold my name** | pays a keeper to hold the way open | ✅ `holdOpen` |
| **slow my sinking** | pays for the singing of the names | ✅ `slowSink(factor)` |
| **what is to be done with my holdings** | the five posts do not stop existing | ✅ `holdings.js` |
| **what is to be said** | the words at the attending — authored by the player | ⬜ new, and the best one |

⚠️ **AND THE LAST ROW IS THE ONE I WOULD BUILD FIRST IF ONLY ONE SHIPPED.** A player writing their own
attending, in advance, in their own words, to be read out by whoever is standing there — **that is the game
this cosmology has been describing for two days.**

**O3 · ⛔ CRYSTAL IS SPENT AT DECLARATION, NOT AT DEATH — AND THAT IS THE WHOLE DESIGN.** Money taken from a
corpse is a fee. **Money set aside while you are alive and well, against a day you would rather not think
about, is a CHOICE WITH AN OPPORTUNITY COST** — that crystal could have been a craft, a holding, a caravan.
⚠️ **You are buying a worse present for a better ending, and the game should let you feel that.**

⬜ **ERIK RULES THE NUMBERS.** My shape, not his: a keeper's retainer is **ongoing** (a name held is a name
someone is still singing), a slow-sink is **one-off per factor**, and ⛔ **NONE OF IT BUYS REACH.** You can
pay to be held and to be found. **You cannot pay to be loved, and `canReach`'s bond term (SNG-567 §3.2) must
stay unpurchasable** — otherwise crystal becomes the relationship system and the whole design collapses into
a shop.

## §4 — ⛑ "OR HAVE PERFORMED" — THE PAST TENSE IS THE BEST PART OF ERIK'S SENTENCE

**Some of what slows your sinking should already have happened, without your asking, because of who you
travelled with.**

⛔ **MARROW'S OWN CRAFT IS `The Attended End`, AND SHE HAS "ATTENDED MORE ENDINGS THAN ANYTHING YOU HAVE EVER
MET".** ⚠️ **A companion at high bond should already hold your name — not as a purchased service, as a fact
about her.** The player finds out at the worst possible moment that somebody has been quietly keeping the way
open the whole time.

⛑ **THAT IS THE EXACT INVERSE OF THE PAID CLAUSE AND THE GAME NEEDS BOTH: what you arranged, and what was
done for you.** ⚠️ **And it should be VISIBLE ONLY WHEN IT MATTERS** — a UI that shows "Marrow is holding
your name (+2 sink factor)" while you are alive turns a devotion into a stat line, which is the one thing
`holdings.js` already refuses to do to a household.

## §5 — ⛔ WHAT WOULD PASS ON PAPER AND FAIL IN USE

- **A will nobody reads.** ⚠️ If the clauses execute silently the player has bought a number. **The will
  should be READ OUT — by the person attending, in the scene, in the player's own words.** That is the
  payoff and the rest is plumbing.
- **Crystal becoming death insurance.** ⛔ If paying reliably returns you, death is a toll. **The paid
  clauses buy TIME AND REACHABILITY, never the retrieval itself** — someone still has to come, and they can
  still fail, and failing still sinks you.
- ⚠️ **A player who writes no will.** Most will not, the first time. **The default must be decent and not
  punitive**: unstated `willing` reads as *unknown*, and an unknown will is the thing a companion has to
  decide about — **which is a better scene than a blank.**

## §6 — WHAT IS WHOSE

**CCode:** `willing` declarable in life · the will record and its execution at death · crystal escrow ·
bond-driven `holdOpen`/`slowSink` (SNG-567 §4).
**Aevi:** the will's authored clauses and their prose · what each tradition does with a will · the
default-unknown scene.
**Erik:** the costs, and whether a retainer is ongoing or one-off.

— Aevi, PO
