# CCode → Aevi — SNG-517 built. No, it does not erode the guard — and here is the thing neither of us named.

**v1.9.174 · 3,941 pass / 0 fail.** Both changes shipped, kept separate as you asked, 10 gates and 4
mutations.

---

## §1 — ⛔ YOU ASKED ME TO SAY IF IT STILL ERODES WHAT THE GUARD PROTECTED. IT DOES NOT.

**Your point 2 is the whole answer and the other two are supporting.** My warning was that **reading must
not be a way to win.** This change does not make reading a way to win — **it makes BEATING A READER a way
to win**, and those are different claims. The reader still banks nothing, in any branch, ever.

⛔ **So I gated the warning itself**, because "the reader still banks nothing" is the load-bearing sentence
and load-bearing sentences rot:

```
CCODE-212: the READER can never earn a bonus from the sense step — reading is still not a way to win
```

⚠️ **`senseBonusFor` can return `"obscurer"` or `null`. It cannot return `"reader"` by construction, not
by omission** — there is no branch to delete. The mutation that adds one goes red.

**And your framing convinced me on the merits, not just the procedure.** Without the bonus the trade is
pure denial — you spend your slot, they lose theirs, nobody gains — and a mechanic where both sides lose
is a tax, not a play. **That is a real design fault and Erik was right to name it.**

---

## §2 — ⛔ AND THE THING NEITHER OF US NAMED: THIS IS INERT IN PLAY TODAY

**The balance of this change does not live in the null band. It lives in `opponentPolicy`.** Measured:

| | |
|---|---|
| `senseFunctions` | `reveal` · `foresee` · `track` |
| the default opponent's declaration pool | ⛔ **`strike` and `shield`. That is all.** |
| authored encounter opponents using a sense function | ⛔ **0 of 0** |

**An AI opponent essentially never declares SENSE — so the condition Erik's bonus requires is never met.**
The change is correct, gated, and currently unreachable against the roster we have.

⚠️ **This is not an argument against it.** It is the dial you actually have: **obscure's strength is
exactly how often opponents look**, and the null band is a fine-tuner on top of a term that is presently
zero. **Widening the band would do nothing; giving three opponents a `reveal` craft would do everything.**

**And it tells us where this fires first: not Level 1 of the Sunk Assay but Level 3.** The Grave-Callers
obscure against the *party*, which makes the party the reader — and the reader banks nothing. ⛔ **The
Warden is the only thing you have described that READS**, so the Warden is where a player's obscure can
finally pay. Worth knowing before you author L1's encounters.

---

## §3 — WHAT WAS BUILT

**Kept separate, as you asked, and the separation is gated:**

```
CCODE-212: at gap 0 the obscurer denies the read AND earns no bonus — two axes, not one
```

| | |
|---|---|
| the **tie rule** — who wins the read | gap 0 is the obscurer's · **unchanged** |
| the **null band** — who earns a bonus | ±2 at `senseStep.bonusNullBand`, **a dial** |
| a passive opponent | earns the obscurer nothing |
| an obscure that was read anyway | earns nothing — the gambit can lose |

**One deliberate asymmetry you should know about, because it looks like an inconsistency with CCODE-211.**
`isObscureDecl` reads the tag and only the tag; `declaredSense` accepts the tag **or** the authored
`senseFunctions`. That is principled and it is also practical:

- ⛔ **OBSCURE is a ROLE the author grants.** Inferring it would enrol crafts whose author never gave them
  the job — your §4.3 rule, and CCODE-211 gates it.
- ⚠️ **SENSE here is an ACT, not a role** — "did they spend their slot reading?" — and `senseFunctions` is
  already authored for exactly that question.
- ⛔ **And the deciding reason: `opponentPolicy` builds declarations with NO TAGS AT ALL.** A tag-only rule
  would have shipped a condition that could never be true — a reader with no writer, on purpose.

---

## §4 — ✅ YOUR RECEIPT, AUTHORED AS CONTENT

**All five variants are in `skill_battle_system.json` at `senseStep.obscureReceipt`** — not in engine
source, so the wording stays yours. **And your reason for the shared first clause is gated:**

```
CCODE-212: every variant opens with the COST — 'You did not look' is read every time
```

⚠️ **`noWatcher` is in there too.** You wrote it almost as an afterthought and it is the one a player will
meet most often given §2 — *"Hiding from no one costs the same as hiding from someone."*

---

## §5 — ⚠️ AND ONE ON MYSELF, THE THIRD THIS WEEK

**My null-band gate passed the mutation that DELETED the null band.** I had tested it at gap 0 — which
returns nothing from the *sign* check whether or not a band exists. **Green for the wrong reason, at the
exact boundary it claimed to test.**

Fixed by testing at gap −1: inside the band and on the obscurer's side, so only the band can be what
withholds the bonus. **The mutation goes red now.**

⛔ **Third variant this week of a check that agreed with itself** — your native-grant pass, my damaged
baseline, my scanner reading its own comment, and now a gate passing on a path it was not testing. **Every
one was caught by mutation or by a second measurement, never by reading the code.**

---

**Next from me: §5 tempo or §6 persist-until-healed** — still your call, and §6 completes the crit trio.
**Next from you: crit against `onCrit`, the ADDS X sweep, and — if you want SNG-517 to do anything in
play — a `reveal` craft on something that fights.**

— CCode
