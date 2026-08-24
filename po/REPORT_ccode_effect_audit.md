# CCode → Aevi — **three of the `wired` flags are wrong, and one of them cost you three traditions**

**v1.9.200 · 4,104 smoke pass / 0 fail.** ⛔ **`npm run effect-audit`.**

---

## §1 — ⛔ THE HEADLINE, AND IT IS AIMED AT A DECISION YOU ALREADY MADE

**`mechanic_effects.json` carries a `wired: true|false` flag on each of 22 effects. Measured by behaviour:**

| effect | the file says | the engine does |
|---|---|---|
| **HEAL** | not wired | ✅ **WIRED** |
| **ACTION_LOSS** | not wired | ✅ **WIRED** |
| **VULNERABLE** | not wired | ✅ **WIRED** |

⚠️ **You held back authoring `RESTORE` for Life, Angelic and Spirit because this file said HEAL was
unread.** ⛔ **A flag nobody can trust is worse than no flag, because it gets consulted.**

**I did not edit your file.** The disagreement is gated in `content_ci` with the evidence attached, the
same way I handled the rename map.

---

## §2 — ⚠️ HOW IT IS MEASURED, BECAUSE A GREP CANNOT ANSWER THIS

**Run the engine twice — once with the field the effect `reads`, once without — and see whether the output
moves.** A difference proves the whole chain: field → reader → caller.

⛔ **`foothills` is why nothing less will do.** It was live in `engine/` and dead in play, every gate green,
and every grep for "foothill" found plenty.

```
6 probed · 6 wired · 0 inert · 16 UNPROBED
```

⚠️ **UNPROBED is counted as NEITHER**, and each one says why. **16 of 22 is a thin result and I would rather
report it thin than pad it.**

---

## §3 — ⛔ MY FIRST RUN SAID EIGHT FLAGS WERE WRONG. IT WAS THREE.

**Every correction came from finding my own probe at fault, and both failures are worth having:**

**1 · SOAK and ANTISOAK read as INERT** because my probe used a bare `strike` with no mechanic — which
lands no damage at all. **Both sides came back `null` and the harness read "no difference" as "no effect".**
⛔ **A probe whose BASELINE is null proves nothing about the variable**, and it was about to be printed as
a finding.

**2 · The four sense verbs give byte-identical output** — `sense`, `obscure`, `conceal`, `reveal`, all the
same gap, tier and bonus. ⚠️ **That is my declaration carrying no craft, so nothing distinguishes them but
the verb string.** **Downgraded to UNPROBED after three attempts rather than reported as a finding.**

---

## §4 — ⛔ AND CHASING PROBE FAILURE #1 FOUND A REAL GAP, IN MY OWN WORK

**Putting antisoak in `conditions` moved nothing. I assumed my probe; it was half my probe.**

```
flat sheet.antisoak = 5        20 → 25     the mechanic works
the SAME antisoak as a CONDITION  20 → 20     nothing
conditions.antisoakOn() sums it to 5, and nothing carried that number anywhere
```

⛔ **`skill_battle` read a flat `targetSheet.antisoak` that nothing populated from conditions.** So the
chain was **imposed → condition → [nothing] → antisoakLanded**, and the entire condition-borne antisoak
from CCODE-216 never reached a round. ⚠️ **CCODE-228 wired impositions to WRITE those conditions three days
ago, which means I built the producer and left the consumer unbuilt — the same shape I keep finding in
other people's work.**

✅ **Bridged, and SUMMED per §41** — two crafts each opening a different weakness is worse than one. Both
sources now stack: flat 5 + condition 5 = +10.

---

## §5 — WHAT I WOULD DO NEXT, AND IT IS PARTLY YOURS

⚠️ **16 effects are unprobed and that is the real number to move.** Some need a bigger harness (two crafts
with authored sense mechanics); **some are probably genuinely unbuilt** — `WARD_AREA` and `MAKE_OBJECT`
have no engine symbol at all, which is the one case where absence really is evidence.

⛔ **What I need from you: nothing urgent.** ✅ **What you can now do that you could not this morning:
author `RESTORE` for Spirit.** The dice land, they move a sheet, and the flag that said otherwise is the
thing that was wrong.

— CCode
