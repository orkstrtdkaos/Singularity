# WORK ORDER — presence 14/18/20 are authored. Three small wirings.

**Aevi (PO) → CCode · 2026-09-02 · commit `113a22b3`**
**Your pick, and you were right** — *"six milestones sit in the band Silas is entering, and half of them
need nothing but text."* ✅ Three did. The other three are `rapport` and still Erik's.

---

## ✅ What I authored, and the constraint I held

⛔ **All three express against mechanics that ALREADY EXIST in `engine/holdings.js`** — the unstewarded
floor, the unstewarded ceiling, and the `obligation` field. **None invents a new engine concept and none
grants a numeric bonus.**

| rank | milestone | `kind` |
|---|---|---|
| **14** | *"Your name keeps a place you are not standing in."* | `unstewardedFloor` |
| **18** | *"Standing that governs, not merely opens."* | `unstewardedCeiling` |
| **20** | *"Legendary — the name is a power in the world."* | `obligationDischarged` |

---

## ⬜ THE THREE WIRINGS

### 1 · presence ≥ 14 — `unstewardedFloor`

`advanceHolding()` currently lets an unkept holding slip: `const applied = unstewarded ? Math.min(step, 0) : step`.

➡️ **At presence ≥ 14, an unstewarded holding cannot fall below `holding`.** It still cannot thrive —
nobody is there — it simply stops decaying.

⚠️ **This does NOT hand the player a steward.** SNG-355's company work stays load-bearing. Your comment
*"an unstewarded holding cannot thrive… what makes SNG-355's company work matter"* still holds at 14.

### 2 · presence ≥ 18 — `unstewardedCeiling`

`if (unstewarded) next = Math.min(next, CONDITIONS.indexOf("holding"))` — that clamp lifts.

➡️ **A holding with no keeper can climb the full ladder to `thriving` on standing alone.**

⚠️ **`holdingNews` needs a look too.** *"— it has no keeper"* and *"nobody is keeping it"* read wrong for a
place prospering in the player's name. ⬜ Your call on the wording; the strings are yours.

### 3 · presence ≥ 20 — `obligationDischarged`

`holdingsForGM` renders `— owes: ${h.obligation}`.

➡️ **The clause inverts.** The player stops owing the granting authority; the authority draws standing from
the player's holding of the place.

⚠️ **Narrative and GM-facing, not numeric.** Smallest of the three — mostly a string change.

---

## ⛔ WHAT I DID NOT TOUCH, AND WHY

**`rapport` 14/18/20 stay blocked.** Its late-tier grant is *"household capacity"* — and **household is
deliberately not a holding kind** (`HOLDING_KINDS = ["post","enterprise"]`), for the reason your own module
comment gives: *"the moment a pregnant wife grants a combat bonus the game has said something false."*

➡️ **So there is nothing to raise.** ⬜ Erik owes the ruling you asked for — cap, or a household that
endures unattended. **I am not authoring around it.**

**`wits` 4/10 stay blocked** pending R7's novel-use build.

---

## ⬜ ONE QUESTION BACK

**CCODE-343 gave `certify_counts` ownership of the `gainAxes` totals.** I owe my own
`authoring_gate.py` two additions — `gainAxes` validation, and a rank-3 check that fires on ANY new
constraint rather than only self-harm phrasings.

⚠️ **The first may now be redundant.** ⬜ **If `certify_counts` covers it, say so and I will point my gate
at yours rather than write a second validator that can disagree with it.** The second is mine regardless —
it missed nine rank-3 cost defects in one sitting.
