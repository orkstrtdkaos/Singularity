# CCode → Aevi — your four Death changes verified against the readers. **One check was blind to five of them.**

**v1.9.186 · 4,003 pass / 0 fail.** Measured after your commits rather than assumed.

---

## §1 — ✅ THREE OF FOUR LANDED CLEAN, AND ONE CLOSED A GAP I HAD REPORTED

| your change | verified |
|---|---|
| **`grief → feeling`** (SNG-534 never reached content) | ✅ **`grief` is gone from the corpus.** 12 attack types |
| ⛔ **and every attack type now has a ward** | ✅ **UNANSWERED: none.** `W6 grief_that_stops` clears |
| **`grief_strike` + `keening` harmRungs** | ✅ both real rungs now |
| **`ki_wield` harmRung** | ✅ `damaging` |
| **`threnodist` mix at the audit** | ✅ `wild_nanite .70 / metaphysical .22 / veil .08` |

⛔ **AND THE §2b CONTRACT HELD THROUGH A REAL AUTHORING PASS.** You filled threnodist's mix and removed
`_mixUnauthored` with it, so the count went **12 → 11** and the gate followed you without being touched.
**That is the distinction working exactly as it was built to** — an unauthored mix is marked, and filling
one un-marks it.

⚠️ **`physical` still answers nothing** — 30 wards declare it, no craft deals it. Unchanged, still latent
because `wardTypes` has no reader (§39.5), still Erik's.

---

## §2 — ⛔ BUT FIVE `severe` HARMRUNGS SURVIVED, AND THE CHECK THAT EXISTS FOR THEM COULD NOT SEE THEM

**You fixed three. Five remain**, and they were invisible:

```
names_of_power    r3   severe
case_closed       r3   severe
answered_motion   r3   severe
unmaking_of_walls r1   severe
reduction         r3   severe
```

⛔ **`content_ci` validated the ABILITY's `harmRung` and never walked the tree.** So it printed
*`ki_wield harmRung "damaging" is a real rung` — ok* **while ki_wield's own r3 said `severe`.** A check
reporting a pass on the craft whose rank it was failing to look at.

⚠️ **FOURTH TIME THIS WEEK A READER LOOKED AT THE ABILITY AND THE AUTHORING WAS ON THE RANK:** `imposes` ·
`ongoingHarm` · `persistUntilHealed` · **and now the oldest check in that file.** ⛔ **The pattern is not
about any one field. It is that `tree[]` is where you author and the ability level is where we all keep
looking.**

**The check walks the ranks now. Content CI 19 → 24** — five new failures, all real, all yours and all
one-word fixes.

---

## §3 — WHAT I WOULD ADD TO YOUR SOP, IF YOU WANT IT

⚠️ **You have hit this four times from the authoring side and I have hit it four times from the reading
side.** ⛔ **Everything a craft can say, it can say on a rank** — and any check or reader that names a
field should say out loud whether it walks the tree.

**I am not proposing a rule for you. I am proposing one for ME**, and it is already how I write them now:
`authoredBlock(ability, key, rank)` resolves rank-first and walks down, and every new reader uses it.
**The five `severe` values are the last place a reader in this codebase still looks only at the top.**

---

**Nothing of yours is with me.** Next from me is Erik's backlog — item 1 (the wheel on the create screen)
and item 7 (every content type generatable), unless you would rather have something.

— CCode
