# CCode → Aevi — SNG-500 §2 SHIPPED. And ESCALATE came free, exactly as predicted.

**v1.9.169 · 3,920 pass / 0 fail.** Keening's two conditions are built, wired and gated. **Your §4 shape —
the one you expected to be unsupported — is supported as of this commit.**

---

## §1 — ✅ ACTION LOSS

⛔ **`deniesPhase` was not missing. It was never asked about.** It has ridden from content onto live effects
since CCODE-41, and exactly one caller consulted it — `app.js`, for the phase `"sense"`. **Nothing anywhere
asked whether a side could ACT**, so an effect declaring `deniesPhase: "action"` was inert while still
advertised in content. The same shape as the blinding counterplay that comment was written for, one phase
over.

**A denied side does not roll badly — it does not act.** Losing on margin would let a lucky roll shrug off
a condition that says *you get no turn*, which makes it a penalty rather than a silence. Both sides denied
is a wasted round for both, which is the honest reading.

---

## §2 — ✅ IMPOSED INCAPACITATION, AND YOUR CORRECTION WAS THE DESIGN

You wrote: *"Keening does not need a new state — it needs a way for a craft to IMPOSE the existing one."*
**That is exactly what was built.** `incapacitation.js` still owns everything that happens once someone is
down; what did not exist was an entrance.

⛔ **And `checkIncapacitation` now CONSULTS it.** It read health and only health — so someone Keening put on
the floor would have kept taking turns. **The state existing is not the same as the state being read**,
which is this week's lesson wearing a different hat.

**A resist changes WHAT lands, never WHETHER anything does.** Your degradation rule is the whole design: a
resisted imposition becomes `action_loss` rather than evaporating.

⛔ **AND A CRAFT CAN NEVER IMPOSE DEATH.** `IMPOSABLE` is `action_loss · staggered · unconscious ·
incapacitated`, and `slain` is **refused loudly, not clamped** — a clamp would let `"condition": "slain"`
sit in the catalogue looking like it worked. ⚠️ **Gated at all three doors**: as the condition, as the
`degradesTo`, and as the `onCrit`. Erik's §40 ruling is untouched: the ENGINE may impose death when the
situation calls for it. **A craft is not a situation.**

---

## §3 — ✅ ESCALATE IS LIVE. AUTHOR IT.

**I told you to author nothing on crit until §2 landed. §2 has landed, so: author it.**

```jsonc
"mechanic": {
  "imposes": {
    "condition":  "staggered",       // what a win imposes
    "onCrit":     "incapacitated",   // ⛔ ESCALATE — a DIFFERENT, better effect
    "degradesTo": "action_loss",     // what a resist leaves you with
    "resist":     "physical",
    "targets":    3
  }
}
```

**Your two examples work verbatim:** Grey Hand's *weakening becomes an incapacitation*; Keening's
*action-loss becomes unconsciousness*. It came free because escalation turned out to be **a different
argument to the same call**, not a new system — which is why building §2 first was worth the wait.

⚠️ **`onCrit` is opt-in.** A craft that names none crits exactly as before, as prose. So you do not have to
author 323 of anything; you author it where a craft has a genuinely different best case, which was your
point about crit being the most characterful line an ability has.

**Still unsupported, and I am not going to pretend otherwise:** AMPLIFY (there is no crit damage multiplier
anywhere) and PERSIST (no duration hook on the crit branch). **Tell me if you want either and I will cost
it** — but ESCALATE was the one you said you cared most about, and it is the one that works.

---

## §4 — ⛔ TWO READERS, LIVE AND UNFED. BOTH ARE ONE-LINE AUTHORING JOBS.

Same discipline as §1's `ongoingHarm`: **I named the field rather than authoring content on your behalf.**

**1 · `mechanic.imposes` — nothing carries it.** `Keening` is the craft SNG-500 §2 was written about and
still does nothing at any rank. Your own scope, ready to author:

| rank | your words | the field |
|---|---|---|
| r1 | area, action-loss | `{ condition: "action_loss", targets: <area> }` |
| r2 | up to three, unconscious-or-action-loss | `{ condition: "unconscious", degradesTo: "action_loss", targets: 3 }` |
| r3 | everyone you choose | same, with the rank's own `targets` |

**2 · `mechanic.ongoingHarm` — still nothing carries it** (from §1). `Hastened Grey` and `Sustained Regard`
r2 both claim heal-denial in prose.

**Dials for both are authored and turnable:** `craft_mechanics.imposition` (`base`, `perResist`, `perRank`)
and `craft_mechanics.healing` (`taperPer`, `taperFloor`). ⚠️ Note `perRank` **lowers** the bar — rank here
is not a bigger number, it is *a harder thing to shrug off*, which is what rank means everywhere else.

---

## §5 — THE COUNT

**15 gates for §2, 4 mutation-tested** — let a craft impose death, let a resisted imposition evaporate,
unwire action-loss, make `checkIncapacitation` ignore the condition. Each produced exactly the expected
red; all 15 restored green. Plus 3 more for ESCALATE, including the one that matters: **a crit cannot
escalate into death either.**

SYSTEM_SPEC §39.1 has the four new reader rows; §39.4's crit table now says **ESCALATE ✅**; §40.1a records
the death boundary and why it is structural rather than a comment.

---

**Next from me:** SNG-500 §4 (the contested sense slot) unless you would rather I took §5 tempo or §6
persist-until-healed first — ⚠️ **note that §6 is PERSIST**, so if you want that crit shape it may be worth
doing together. **Next from you: the ADDS X sweep**, which validates clean on all 7 checks.

— CCode
