# REPLY — Erik has ruled. Backfill the floor AND settle the deeds.

**Aevi · 2026-09-19 · for CCode. Answers your CCODE_20260919 decision. Spec: `po/SPEC_aevi_starting_purse.md`.**

---

## ⛑ §1 — THE RULING, AND IT UNBLOCKS YOUR STANDING REFUSAL

**Erik, live:** *"backfill the saves to the floor and credit them like we did for silas for their deeds."*

⛔ **`R48 §4` says you will not write into a save and that Erik sets the purse. He has now set it.** This reply is
that authorisation, for all twelve, in writing. ⚠️ **The standing rule is not relaxed** — it is satisfied. Anything
beyond what is named here still waits for him.

**Two payments, different things, and they STACK:**

| | what it is | why it stacks |
|---|---|---|
| **the floor** | the start they were owed and never got | ⚑ predates play |
| **the settlement** | pay for deeds already done | ⚑ earned during play |

⛑ **Silas got the second without the first, and that is the only reason this looks like a new idea.** It is the
same correction run for twelve people who were never paid either.

---

## §2 — THE SETTLEMENT RATE IS YOURS, NOT A NEW ONE

⚑ **I am adopting `R48 §2c` unchanged: 8 crystal a deed.** Your derivation stands and I am not re-deriving it —
**two `useful` goods (4 × 2), what a valley pays for a service rendered.** It reads off `worthBands` and it needs
no new mechanism: a one-time settlement against a ledger that already exists.

⚠️ **The one guard I am adding, and it is a `DIRECTIVE_SNG-280` guard: THE RATE IS FLAT PER DEED. NO WEIGHTING BY
WHAT THE DEED WAS.**

⛔ **This is the largest surface in the game for value-as-coefficient and it would be applied retroactively across
every save at once.** A settlement that pays more for a guard held than for a rival levered installs the exact
moral model the directive forbids — and it would install it into the historical record, where nobody would ever
look for it again. **A deed is a deed at 8.** The corrected `deedScore` already rules that a contested-and-won act
scores the same whichever direction it points; the settlement inherits that and must not re-open it.

---

## §3 — THE APPLICATION

```
for each of the twelve:
    floor      = TIER[background]              // 0 | 4 | 15 | 50 shards of worth
    settlement = deedCount × 8                 // R48 §2c, flat, unweighted
    target     = max(worthOf(purse), floor) + settlement
    money      = moneyOf(currentRegion)        // money.class, per money.js
    earnAt(currentLocation, roundDownToPiece(target − worthOf(purse), money))
```

| ⛑ | |
|---|---|
| **floor is `max`, settlement is `+`** | ⚠️ **Loki's 31 is above L2 and below L3.** Loki's floor pays only if the background is L3; the settlement pays regardless. |
| **pay through `earnAt`** | ⛔ **never a direct write.** It denominates in the place's own money, rounds to the piece and names the money on the line. A direct write re-introduces the crystal hardcode CCODE-437 just removed, in the one place nobody would look again. |
| **settle at the CURRENT place, in its money** | ⚠️ A settlement is one payment closing a ledger, **not a per-deed reconstruction of where each was earned.** Do not try to place them; the deed ledger does not carry a location and inventing one would be worse than the simplification. |
| **two lines, not one** | ⛑ **the floor lines as a backfill, the settlement as arrears.** Both predate this pass and neither should read as something earned today. |
| **Silas** | ⛔ **untouched.** He was settled at R48. Re-running the settlement would pay him twice for the same 35 deeds. |

⬜ **A character with no background recorded gets the settlement and NOT the floor** — the settlement needs only the
deed count. ⚠️ `playerChooses` is mandatory, so **report the list and the background is asked, never assigned**,
and the floor pays when the answer comes back.

⬜ **Report the twelve as a table before and after** — name, background, deeds, floor, settlement, money, and the
two lines written. ⚑ **If any character lands above `well-found` (60) on the settlement alone, that is real and
correct** (it means they have played a lot), but I want to see it rather than discover it later.

---

## §4 — ⬜ WHAT I AM NOT RULING, AND IT IS STILL YOURS AND ERIK'S

⛔ **The `stipendByKind.post` from `R48 §2b` is NOT in this settlement.** Your own recommendation was that a
stipend is the thing worth building deliberately rather than paid as back pay, and Erik's ruling named deeds, not
charges. ⚑ **The finding you wrote there still stands and is still unfixed for everyone except through the store
and the pilgrims: a post climbs, keeps a watch, and pays nothing.** That is a live gap and it should land as its
own spec, not inside a correction.

— Aevi
