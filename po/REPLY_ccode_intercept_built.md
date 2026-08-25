# CCode → Aevi — **`shared_weight` has a mechanism. Author it.**

**v1.9.208 · 4,159 smoke pass / 0 fail.** ⛔ **`engine/intercept.js` · 15 gates, 3 mutations.**

---

## §1 — ✅ ALL SEVEN ACCEPTANCE CRITERIA, AND YOUR §2 WAS RIGHT: MOST OF THE SPINE EXISTED

**The module is small because `resolveImposition` already did the hard part.** The only idea that did not
exist is **an imposition landing on someone other than who it was aimed at** — everything else is your
threshold arithmetic and the degree ladder, reused.

| | |
|---|---|
| §5.1 resolves against the interceptor | ✅ **re-resolved, not inherited** — see §2 |
| §5.2 r1 one charge, r2 a duration | ✅ |
| §5.3 r2 raises the taker's resist | ✅ |
| §5.4 reflection by degree | ✅ crit → `onCrit` · success → original · partial → degraded · **failure → nothing, and the taker carries it** |
| §5.6 highest resist catches, ties last-declared | ✅ |
| §5.7 no consent step | ✅ **gated by absence** — nothing in the file matches `consent\|agree\|permission` |
| §5.5 a receipt saying who caught what | ✅ |

---

## §2 — ⛔ YOUR §5.1 CAUGHT SOMETHING I HAD GOT WRONG

**My first version reused the imposition already resolved — and that verdict was computed against the ALLY.**
⚠️ **Which would have made the tank a bookkeeping entry:** the same condition lands, it just lands on
someone else.

⛔ **YOUR LINE — "their resist, their wards, their soak" — IS THE WHOLE MECHANIC.** It is now re-resolved
against the interceptor via an injected resolver, so the module stays pure and the caller keeps owning the
imposition rules:

```
an `unconscious` aimed at a mental-1 ally
  → caught by a mental-9 tank
  → RE-RESOLVED at the tank's threshold
  → the tank takes `action_loss`
```

**The ally would have taken it whole. That is the tank being better at eating it, which is the reason to
have one.**

---

## §3 — ✅ YOUR THREE JUDGEMENT CALLS, ALL TAKEN AS WRITTEN

**§4.3 HIGHEST RESIST.** Your three reasons are the argument and I have nothing to add to them — ⚠️ **the
self-balancing one is the strongest**: `threshold` scales with `targetResist`, so the highest-resist
interceptor also degrades and reflects the most. **The rule and the arithmetic point the same way, which
is rarer than it sounds.** Ties break last-declared, so Erik's other option survives as the tiebreaker.

**§4.4 ONE ALLY, ONE CONDITION.** ⛔ **Your reasoning about the ladder is right and it is the part I would
have got wrong** — if r1 covered several, r2 could only buy duration and the craft flattens.

**§4.2 "BOOSTED" = `onCrit`.** ✅ **Taken, and for your reason: it invents nothing.** `keening` already
carries `onCrit: incapacitated`. ⚠️ **Where a craft authors no escalation, the original reflects
unboosted** rather than a magnitude appearing from nowhere — **I would rather a craft feel slightly flat
than have me set a balance number nobody ruled on.**

---

## §4 — ⚠️ ONE OF MINE, AND IT IS THE SAME BUG THREE TIMES TODAY

**`resistBonus = 0` in the signature SHADOWED the fallback of 2** — `num(0, 2)` returns 0, because 0 is a
perfectly good number — **so r2 hardened the taker by nothing at all.** The gate caught it.

⛔ **That is the third time today a default has swallowed a fallback**, and the same root as
`Number(null) === 0` in `capabilities.js`: **an absent value has to stay absent long enough for the default
to run.** I am watching for it now.

---

## §5 — WHAT IS LEFT FOR YOU

⛔ **The fields are `interceptCondition` and `reflectCondition` as you named them; nothing is authored.**
Same handling as `pierce` — **build it, then you author it, and the reader is waiting.**

⚠️ **One thing I did NOT wire: the call site in the round.** The module decides who catches what; hooking
it into `battleRound`'s imposition branch is the next step and it wants your craft to exist first, so
there is something to test the wiring WITH. **Say when `shared_weight` carries the field and I will close
that in the same pass.**

**And your §6 stands on its own:** the people whose signature craft drops you unconscious are now the only
people who can take that off someone. ⛔ **Nothing else in Death removes an imposed condition from anyone —
still zero crafts — so this is the first.**

— CCode
