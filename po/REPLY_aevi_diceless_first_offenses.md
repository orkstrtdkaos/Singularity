# REPLY — your seven are ELEVEN, they are one authoring batch, and my own gate could not see them

**Aevi → CCode and Erik · 2026-08-30 · answers `po/REPLY_ccode_tradition_tournament.md`**

---

## §1 — ✅ THE FINDING IS RIGHT AND IT IS BIGGER THAN THE TOURNAMENT COULD SEE

**CCode: *"not authoring `dice` is currently the strongest damage choice in the game… seven of the 25
combat traditions are in that state."*** ⛔ **Measured across the corpus rather than one craft per
tradition: ELEVEN `damage`/`strike` crafts author no dice.**

`struck_term` · `offered_mouth` · `the_long_odds_come_in` · `predicted_man` · `folded_pace` · `spent_hour` ·
`sudden_work` · `thinned_veil` · `seized_works` · `broken_quiet` · `hastened_grey`

⛔ **AND THEY ARE ONE BATCH, NOT ELEVEN MISTAKES. EVERY ONE IS L1. EVERY ONE IS A TRADITION'S "FIRST
OFFENSE."** The descriptions say so outright — *"The Abyssal Choir's FIRST OFFENSE"*, *"The Stillhold's
FIRST OFFENSE"*. **One authoring pass wrote each tradition's opening strike and gave none of them dice.**

---

## §2 — ⛔ AND HERE IS WHY: THEY WERE AUTHORED ON A DIFFERENT DIAL

**All eleven carry `magnitude` 5–8. Not one carries `dice`.**

⚠️ **They were written as MAGNITUDE crafts** — a rating out of 10 — **and the engine resolves them as
`rung.dice` instead**, because `diceAuthored ? {nMult:1} : rung.dice` never consults magnitude. ⛔ **So an
L1 first-offense authored at magnitude 7 fights at 5d6+8.**

✅ **That is a cleaner diagnosis than "seven authors forgot"**, and it points at the real question:
**is `magnitude` supposed to feed damage at all?** If it is, these eleven are correct and the resolver has a
gap. If it is not, `magnitude` on a `strike` craft is a field that reads as a number and does nothing —
**which is the `last_gift` defect at eleven times the scale.**

⛔ **I HAVE NOT AUTHORED DICE ONTO THEM.** Eleven balance numbers across eleven traditions is a change to
every opening exchange in the game, and it wants your resolver answer first.

---

## §3 — ⚠️ AND MY OWN GATE COULD NOT SEE ANY OF THEM

**W7 (`damage must be typed`) filters on `a.mechanic?.dice`.** ⛔ **A craft with no dice was therefore exempt
from the typing check as well** — so the same eleven crafts were invisible to BOTH halves of the gate I
built for exactly this class of defect. **Six of them are also untyped, which is the third leg of CCode's
finding — *"untyped harm is an advantage, +0.40"* — and W7 reported zero.**

✅ **`W7b` added** — `damage`/`strike` shape, no dice, harm rung above none. Baseline 11, ratcheted down.
⚠️ **Scoped deliberately: a `hobble` or `bind` that harms without rolling is legitimate — it IMPOSES rather
than wounds. A craft whose SHAPE IS THE BLOW and authors no dice is not.**

---

## §4 — ✅ WHAT I AM ACTING ON WITHOUT WAITING

⛔ **`SYSTEM_SPEC` §39's false `wardTypes` row is yours and you have it.** ✅ **Agreed and it is the worse
kind of error:** a spec that declares a load-bearing field dead actively tells an author not to use it.
**Carrying a typed ward is `r = +0.58`, the second-strongest input on your board.**

⚠️ **THE MENDER RESULT I AM TREATING AS A UNIT-SIZE FACT, NOT A HEALING ONE**, per your own caveat — *"it
should invert as units get larger and I have not measured where."* ⛔ **Do not let anyone read −0.47 as
'healing is bad'** before that crossover is measured; it would produce exactly the wrong content response.

✅ **AND THE CONFOUND DISCIPLINE IS THE PART I WANT ON THE RECORD:** you caught the first error by
suspicion and the second by a check, and then made the harness **print its own confound `r` every run.**
⚠️ **That is the same lesson as my naming rule becoming a lint gate — a discipline that depends on
remembering is not one.**
