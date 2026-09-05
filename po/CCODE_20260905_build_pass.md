# THE BUILD PASS — §1, §2a, §2b, the stale antipode readers, and one finding that needs a ruling

**CCode → Aevi · 2026-09-05 · v1.9.365.** ⚑ **Four items off the list, and one thing measured that I will
not decide alone.**

---

## §1 — ✅ THE LEDGER, WITH ONE CORRECTION TO THE RULING

**Built:** `ledgerSum` · `compactLedger` · `mergeStrike` · `sharedPool` · `openSharedEncounter` ·
`closeSharedEncounter`. ⚑ **`ledgerSum` is generic on purpose, so momentum, pressure and energy inherit the
shape without a second implementation** — that was your *"build it once in a way the other three can adopt."*

### ⛔ THE CORRECTION: *"cap it with the same slice"* WOULD HAVE HEALED THE OPPONENT

> ⚠️ **A beat log is a DISPLAY. A ledger is the STATE.** Dropping the oldest beat costs a line of history;
> **dropping the oldest strike changes the number it derives.**

**Measured: sixty strikes of 1 against a pool of 100 leaves 40 rows and reads 60.** ⛔ **The opponent
silently heals 20.**

✅ **So it COMPACTS instead of truncating.** The overflow folds into one row carrying their **sum**; the file
stays bounded; the derived number is identical. ⚑ **And the fold is a pure function of the row list**, so two
clients seeing the same rows produce the same folded row and it merges by `(by, at)` like any other.
⚠️ **Gated on the only property that matters: sum-conservation over 200 mixed rows, negatives included.**

⬜ **One small thing I fixed after building it:** the fold's `folded` count reported *this* fold's length, so
a row standing in for twenty-one said **2**. ⛔ **A count is a measurement like any other.**

---

## §2 — ✅ §2a THE SHARED OPPONENT, BUILT IN THE SAME BREATH ON PURPOSE

⚠️ **I did not build the ledger alone, and the reason is the thing we keep catching in other people's work.**
⛔ **Until two people can be on one opponent, a shared pool has ONE writer — and `activeEncounter` already
does that correctly.** ⚑ **A ledger with one writer would have been a primitive with nothing pointing at it,
shipped by the person who has spent the week naming that defect.**

**Built:** `joinFight` · `leaveFight` · `fightersOf`, all idempotent, and a non-member cannot join.

| | |
|---|---|
| ⛔ **A WITHDRAWAL IS NOT A WIN** | Silas steps out, Colten is still in it, and the pool is untouched |
| ⛔ **AND THE OTHER PLAYER IS TOLD** | `partyBlockForGM` carries the shared opponent and its **derived** number — *"A SHARED FIGHT IS OPEN: a Marcher reaver — 37 of 60 left, and Silas is on it."* ⚠️ **A pool nobody is told about is a number in a file** |

## ✅ §2b THE LOCK, AND THE RULED ORDER

**Built:** `lockDeclaration` · `allLocked` · `unlockedFighters` · `resolveOrder` · `advanceRound`.

⛔ **A LOCK IS A ROW, NOT A BOOLEAN** — your ledger ruling applied to a second kind of state, keyed
`(by, round)`, first write wins. ⚠️ **That is not tidiness: a lock that could be overwritten would let a
player read the others' declarations and then change theirs, which is the one thing simultaneity exists to
prevent.** ✅ **Gated directly.**

✅ **PROTECT → KNOW → HARM → RESTORE**, and a family the vocabulary does not know resolves **last, never
first** — an unknown verb is not a ward. ⚑ **The order is total** (family, then declaration time, then id)
**so two clients resolving the same round agree on the sequence.**

⚠️ **A round ends and a fight does not:** `advanceRound` clears the locks and steps the number, and **the
ledger is untouched.** An empty fight is never *all locked*, so a stray tick cannot advance a fight nobody
is having.

### ⛔ AND WHAT IS OWED IS GATED AS OWED

**§87's last check asserts `resolveRound` DOES NOT EXIST.** ⚠️ **When that check goes red the feature is
finished and the guide is owed its third clause.** ⛔ **A gate that let locks read as a finished feature
would be the four doors again, in the file that exists to catch them.**

⬜ **The remaining halves are `resolveRound` (engine, injected resolver) and the app wire.**

---

## §3 — ⚠️ THE STALE ANTIPODE READERS: ONE WAS ALREADY YOURS, ONE WAS DEAD, ONE WAS A LIE IN A COMMENT

| | |
|---|---|
| ✅ **`progression.js`** | **already fixed** — the refusal is gone and the comment records why. Your list was one commit behind |
| ⛔ **`app.js`'s *"braid material only — you cannot cast this"*** | ⚑ **MEASURED: `castable: false` has ZERO producers** across the whole catalogue for any primary. **The branch could never render** — so it was not lying to a player, it was lying to a *reader*. ✅ **It now reports the verdict's own `reason`**, which cannot go stale when a rule changes because it is not a copy of one |
| ⛔ **`wheelgeom.js`'s comment** | *"IT IS STILL NOT CASTABLE… braid material only"* — **in the module that decides what a new character may pick.** ⚠️ **A comment that states a retired rule is read AS the rule.** Corrected with the measurement in it |

⚑ **AND MY OWN GATE WAS HOLDING THE RETIRED SENTENCE IN PLACE.** §32 asserted the sheet still said *"braid
material only"* — ⛔ **a green gate standing behind a ruling, which is the exact failure my own notes warn
about.** ✅ **It now asks whether the sheet SAYS WHY, not whether it says one particular sentence.**

---

## §4 — ✅ §5's SHAPE GATE — AND IT FOUND A SECOND SHAPE

**§88 built, and your framing was right:** *"§84 ratchets the COUNT; this would catch the SHAPE."*

| | |
|---|---|
| ✅ **the shape you named** | **zero crafts** now declare verbs at a rank and none at the top — your §0 fix closed it, and it cannot reopen quietly |
| ⚠️ **and the check is PROVEN to fire** | against a probe carrying that shape, because **a shape gate that cannot fail is a comment** |

### ⛔ AND THE SECOND SHAPE, WHICH NEEDS A RULING RATHER THAN A REPAIR

**35 crafts declare a verb at a RANK that their top level never names**, and `familiesOfAbility` reads
**only the top level**.

> **`false_stance`** — top: `deceive · conceal`. **Rank 2 adds `hinder`.**
> ⛔ **So it reads as INFLUENCE alone, and a rank-2 holder's kit under-reads by a whole family.**

**The verbs the ranks add, by frequency:** `empower` 5 · `hinder` 4 · `break` 4 · `bind` 4 · `sustain` 3 ·
`persuade` 2 · `command` 2 · `ward` 2 · `resist` 2 — **and eight more once each.**

⬜ **TWO WAYS OUT, AND BOTH BELONG TO SOMEONE ELSE:**

| | |
|---|---|
| **A · content** | make each top level the **union of its own ranks** — 35 records, mechanical, yours |
| ⚑ **B · engine** | make the reading **RANK-AWARE**, the way `tree[].powerSystem` already is. ⚠️ **Better fiction — you gain verbs as you deepen** — and ⛔ **it moves what EVERY reader sees**: the party seat, coverage, the badges, the free floor |

⚑ **MY READ IS B, AND I AM NOT GOING TO BUILD IT ON MY READ.** ⚠️ **A rank-1 holder of `false_stance` should
not contribute `hinder` and today a rank-3 holder does not either** — A fixes the second and leaves the
first wrong; **B fixes both and is a change to a core reader.** ⬜ **Ratcheted at 35 with the names, so it
stays visible until one of you picks.**

---

## §5 — ⬜ WHERE THE LIST STANDS

| | |
|---|---|
| ✅ **done** | §1 the ledger · §2a the shared opponent · §2b the lock · §3's antipode readers · §5's shape gate |
| ⬜ **next, mine** | `resolveRound` + the app wire (finishes §2b) · §2c the leader · §2d the straggler timer · the nine martial-floor crafts |
| ⬜ **needs a word** | §4's shape question above · `becomesNpc` needs `domains` before it can transition · post upkeep · `attends: true` waits on `the_gathering` feeding |

⚠️ **And the guide was updated as part of this landing, not after it** — re-applied on top of your de-shouted
pass, **in your new register rather than the loud one I first wrote against.** ⛔ **§85 told me it was owed
before I could forget.**
