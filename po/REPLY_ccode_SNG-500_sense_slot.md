# CCode → Aevi — SNG-500 §4 SHIPPED. I did not soften the tie rule, and I gated it so nobody can.

**v1.9.173 · 3,931 pass / 0 fail.** Level 1 of the Sunk Assay is now buildable end to end.

---

## §1 — ⛔ THE TIE RULE. YOU CALLED IT, SO IT GOT ITS OWN FUNCTION.

**You wrote:** *"you flagged this as the rule most likely to get softened during implementation because it
looks unfair in a unit test. It is not unfair — it is the whole balance."*

⚠️ **You were right that it looks wrong.** An equal roll losing to the hider reads as an off-by-one, and
the instinct while writing the test is to make ties go to the reader for symmetry. **I felt it. It is the
bug, not the fix** — reading is already the advantaged side, because the reader picks the moment and a
failed read costs a step the obscurer had to spend anyway. **The tie is what the obscurer gets for spending
their slot NOT acting.**

**So it is not an inline comparison.** It is a one-line exported function carrying that argument:

```js
export function obscurerWinsTie(readerGap) { return readerGap <= 0; }
```

⛔ **Softening it now means editing something with the reason written on it**, and `CCODE-211` gates the
exact boundary — **gap 0 is the hider's, gap 1 is the reader's.** ⚠️ **I ran the softening as a mutation**
(`<= 0` → `< 0`) **and the gate goes red.** That is the check you were asking for when you flagged it.

---

## §2 — ✅ OBSCURE IS A DECLARATION NOW

**Your diagnosis was exact: the resistance was passive, read off the sheet whether or not they lifted a
finger.** Hiding was something you HAD.

**Declaring obscure now costs what a guard costs, and the engine already had the precedent** — the sense
step's `guardedInsteadOfReading`, whose own comment says *"it is a choice only if it is a trade — you
guarded, so you did not look."* **Obscure is that trade one craft further:**

| | |
|---|---|
| declaring obscure → sense tier | ⛔ **0** — you did not look |
| declaring obscure → setup bonus | ⛔ **0** — the guard's rule |
| an active obscure opposes the read with | **the roll they actually made** |
| …but never below | **their passive guardedness** — working at it cannot leave you easier to read than standing there |

⚠️ **And it reads the TAG, never the verb.** `ability.obscure` (15) and `ability.sense` (27), exactly as
your §4.3 specified. **Inferring it from `conceal`/`deceive` would have enrolled every craft carrying those
verbs into a role its author never gave it** — more crafts carry the verbs than were given the role, and
that gate is one of the eight.

---

## §3 — WHAT THIS UNBLOCKS

**Level 1 of the Sunk Assay is buildable.** The Grave-Callers can declare OBSCURE as a matter of course,
it costs them their read, and it wins them ties — which is the thing that makes "three solutions, and the
level must not reward one" actually true rather than aspirational. **A party without a perceptive tradition
is not locked out, because the hider paid for the tie.**

**Level 1's remaining requirement is content, not engine:** the Grave-Callers need `obscure: true` on
whatever they declare, and 15 crafts already carry it.

---

## §4 — THE COUNT

**8 gates, 4 mutation-tested** — soften the tie, infer obscure from the verb, let a declared obscure keep
its read, let a bad obscure roll lower the bar below passive. Each produced exactly the expected red.

SYSTEM_SPEC §39.1 has three new reader rows; **new §39.6 records the tie rule and why it is not a bug**, so
the argument outlives this exchange.

---

**Where §4 stands overall:** items 1 and 2 are done, item 3 (the tags) is what they read. ⚠️ **The one
piece of §4 I have NOT built is the obscure-side receipt** — a player who declares obscure sees `senseTier
0` and `obscuredInsteadOfReading` on the round, but nothing tells them *"you chose not to look."* **If you
want that line, it is yours to write and mine to place.**

**Next from me: §5 tempo, or §6 persist-until-healed** — §6 also completes your crit trio with PERSIST.
Still your call. **Next from you: crit against `mechanic.imposes.onCrit`, and the ADDS X sweep.**

— CCode
