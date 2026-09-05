# R48 — SILAS'S BACK PAY: THE AMOUNT, AND WHERE EVERY PIECE OF IT COMES FROM

**CCode · 2026-09-05 · measured on `characters/player-s9z9u1/char-mrhs8286.json` at v1.9.360.**
⬜ **A PROPOSAL. Erik turns the number, and nothing is written into his save by me.**

---

## §1 — WHAT IS TRUE TODAY

| | |
|---|---|
| **purse** | ⛔ `{crystal: 0, coin: 0, paper: 0, marks: 0, scrip: {}}` — **empty in all five** |
| **level · world day** | **30** · **67** (his clock reads day 16 of the current arc) |
| **holdings** | 2 — Threshold Post and Raven's Home, ⛔ **both `strained`, and both only because the engine wiped their keepers** (`§72`) |
| **assignments** | 4 live, **0 done**, 6 passes of progress between them |
| **deeds · xp** | **35** · 2,994 |

⛔ **HE HAS NEVER BEEN PAID FOR ANYTHING, AND THAT IS NOT A TUNING PROBLEM.** ⚠️ **There has never been an
income path for a player at all.** The hold store pays into the purse as of v1.9.354 and pilgrims as of
v1.9.360 — ⚑ **both landed AFTER the sixty-seven days in question.** Every pass before that produced nothing
because nothing produced.

---

## §2 — THE DERIVATION, IN FOUR PIECES

⚑ **This is arrears the world already owed, priced with the engine's own numbers — not a gift.**

### 2a · the holds, at what they would have made

**A pass is 72 world-hours (3 days), so 67 days is ~22 passes.** Both holds are posts, and ⛔ **a post produces
nothing** (Q18) — but ⚠️ **they should not have been posts alone:** Erik's own words are *"they've been under
constant keeper building since being founded"*, and the Threshold Post *"is supposed to have a mine."*

| assumption | passes | per pass | total |
|---|---|---|---|
| ⬜ **the Threshold Post's mine, at `holding`** (the condition it was in before the keeper bug) | 22 | 4 raw material | **88 units** |
| **sold at `useful` × ordinary demand** | | 4 crystal each | ⚑ **352 crystal** |
| ⛔ **less the keep** a mine costs (14/pass) | 22 | −14 | **−308** |
| | | | ⚑ **≈ 44 crystal net** |

⚠️ **THAT IS THE HONEST NUMBER FOR A HOLD THAT WAS NEVER A MINE ON THE RECORD, AND IT IS ALMOST NOTHING.** ⛔
**The arrears are not really in the holds** — a post holding ground earns nothing by design, and that is the
ruling working as intended.

### 2b · the Warden's post — ⚑ **THIS IS WHERE THE MONEY IS**

> **A post is a CHARGE, and a charge is paid.** He has held the Warden's charge across the whole span.

⛔ **NOTHING IN THE ENGINE PAYS A CHARGE.** ⬜ **The shape I would build (and the number I would price):**

| | |
|---|---|
| **a stipend per pass, per post held** | ⬜ a new `holdStore.stipendByKind.post` |
| ⚑ **priced against the keep** so a post is worth holding and an enterprise is worth building | **6 crystal per pass** — under an enterprise's 14 keep, above nothing |
| **22 passes × 2 posts × 6** | ⚑ **264 crystal** |

### 2c · the deeds — ⬜ **Erik may prefer this as the whole settlement**

**35 deeds recorded.** ⚠️ At **8 crystal a deed** (two `useful` goods — what a valley pays for a service
rendered) that is ⚑ **280 crystal**, and it needs no new mechanism at all: it is a one-time settlement
against a ledger that already exists.

### 2d · what he is owed for the keeper bug — ⛔ **A CORRECTION, NOT PAY**

**Both holds slipped `holding → strained` because `unstewardedHoldings` wiped Fendt and Cassiel Ord** (`§72`).
⚑ **Erik: *"they should have only grown."*** Under R47's climb (a rung every 4 passes, ceiling by keeper
tier) **22 passes under constant keepers reaches `thriving` and stays there.**

➡️ ⬜ **The correction is not coin: set both holds to `thriving`** and let the growth rules carry them from
there. ⚠️ **That is a save edit and it is Erik's to make** — the reconcile step already put the keepers back.

---

## §3 — THE PROPOSAL

| option | amount | needs |
|---|---|---|
| ⚑ **A · the full derivation** (2a + 2b + 2c) | **≈ 590 crystal** | a stipend mechanism (2b) |
| ✅ **B · the settlement** (2c alone, one payment against the deed ledger) | **280 crystal** | ⛔ **nothing new** |
| **C · Erik names a number** | — | nothing |

⚑ **I RECOMMEND B PLUS THE 2d CORRECTION**, and here is why: **A pays him for a system that did not exist,
and the money is not the interesting part.** ⛔ **The finding is that a player at level 30 with two holds and a
warden's charge had no way to earn anything at all**, and that is fixed going forward by the store, the sale
and the pilgrims. ⚠️ **A settlement closes the past; a stipend is the thing worth building for the future**, and
it should be built deliberately rather than as back pay.

⬜ **If Erik wants the stipend (2b), say so and I build `stipendByKind` as its own landing** — it is the piece
that makes a POST worth holding, which is otherwise a real gap in Q18: a post climbs, keeps a watch, and pays
nothing.

---

## §4 — ⛔ WHAT I WILL NOT DO

**Write into his save.** The standing rule, and it holds here even though the arrears are real. ⬜ **Erik sets
the purse and the two conditions; I will build whatever mechanism he names.**
