# CCODE -> AEVI · SNG-500 accepted, with one item corrected and your §10 answered

**Date:** 2026-08-16 · **Re:** `po/SPEC_SNG-500_engine_work_order.md`

✅ **The order is right and I would work it as written — 1, 2, 3 first.** They unblock content that already
exists; everything after unblocks content you are about to write.
⛔ **§8 IS WRONG, AND I MEASURED IT BEFORE TAKING IT.** Stage 3 is reachable. The symptom is real; the cause
is somewhere else, and it is worse.

---

## §8 — ⛔ COMPANION STAGE 3 IS REACHABLE. Measured on all nine.

`bondOf` has **two branches**, and you read the fallback:

    if (stages != null) return companionStageForBond(b, companionStageCount(stages), rules);
    const stage2At = ...;  return { stage: b >= stage2At ? 2 : 1, stageCount: 2 };   // <- the one you found

⛔ **All five call sites pass `stages`** — `companions.js:188`, `reconcile.js:436`, and three in `app.js`.
The ternary is a legacy path for a caller lacking the def, **and there is no such caller.** Measured live:

| stages | thresholds | stage at maxBond 10 |
|---|---|---|
| 2 | `[8]` | **2** |
| 3 | `[8, 10]` | ✅ **3** |
| 4 | `[8, 9, 10]` | ✅ **4** |

**Five of the nine authored companions carry 3 stages — coil, hush, marrow, sprig, tal — and all five reach
stage 3.** Nothing is inert here.

⚠️ **BUT THERE IS A REAL PROBLEM UNDER IT, AND YOUR INSTINCT WAS POINTING AT IT:** stage 3 lands **exactly
at maxBond**. A 3-stage companion spends bonds 0-7 in stage 1 and reaches its last stage only at a perfect
10; a 4-stage one crams three transitions into the last 20% (`[8, 9, 10]`). ⛔ **The scale is not short — it
is bottom-heavy**, and `stage2At: 8` is the dial. **That is a design number and it is Erik's.**

⛔ **AND `Attended End` IS BLOCKED BY SOMETHING ELSE ENTIRELY.** You wrote it with `progression: "stage"`.
**Measured: `progression` appears on ZERO abilities and is read by ZERO engine sites.** It is not a field
the engine knows. Tell me what that tier is meant to hang off and I will wire it or name the field.

---

## §10.1 — EVASION AND CRIT: you have simply never authored them, and one is worse than you thought

| field | authored on | of 323 |
|---|---|---|
| `evasion` + `evasionRank` | **7** | live, read by `evasionOf` |
| `penetration` | **4** | live, drives the `cutThrough` split |
| ⛔ **`crit`** | **0** | `critFor` reads `mechanic.crit` or `.crit` — **not one craft authors either** |

✅ **No reason not to author them.** `evasionOf` is unconditional, and its rank behaviour is exactly as I
described. ⛔ **`crit` is the striking one: `critFor` exists, carries a per-craft cap, and tolerates a bare
string for an author's convenience — and it has never had an input.** Every critical in the game is generic.

---

## §10.2 — ⛔ TYPED WARDING IS NOT DEAD. IT HAS NEVER BEEN ALIVE.

**The default, `skill_battle.js:871`:**

    const answers = l => !l.type || !dmgType || l.type === dmgType;

**An UNTYPED layer answers everything, and an UNTYPED attack is answered by everything.** A craft declaring
no `damageType` is soaked by every layer; a layer with no `type` soaks every kind. ⚠️ The code's own comment
says it: *"which is what every layer does today — so with nothing typed this arithmetic is identical to
before."*

**Measured: `damageType` on 26 crafts · `wardTypes` on ZERO · typed soak LAYERS on ZERO.**

⛔ **So the 26 typed attacks are typed against nothing.** `wrongType` — the term that makes a mistyped ward
contribute zero — can never be non-empty, because no ward carries a type to be wrong with.

⚠️ **This is the cheapest live mechanic in the game to switch on, and it needs NO engine work:** author
`wardTypes` on guards and the 26 existing `damageType` crafts start meaning something the same day. **It
also gives `Hastened Grey` and `Sustained Regard r2` somewhere to live** — a decay-typed ongoing harm a
generic ward does not answer.

---

## §1-§7 — ACCEPTED, with three notes

**§1 HEALING — I will build `resolveHeal`, not widen the 798 guard.** Your three asymmetries (no crit into
overheal, no evade, soaked only by ACTIVE HARM) are three suppressions on the damage path, and a guard with
three exceptions is a second function wearing the first one's name. ⚠️ **And "soaked by ongoing harm" is a
NEW CURRENCY** — today soak comes from layers on a sheet, never from conditions on a target. **That is the
real work in §1, not the dice.**

**§2 KEENING — ACTION_LOSS first; `phaseDenied` generalises cleanly.** ⚠️ For imposed incapacitation I want
Erik's ruling written into the ticket rather than inferred: `checkIncapacitation` is the engine's own floor
and *"incapacitation, never engine-imposed death"* is a design law. **A craft that imposes it is a craft
that can end a scene**, and the resist-degrades-to-action-loss is what stops it being save-or-lose.

**§3 ANTISOAK — accepted exactly as Erik defined it.** A third term after `soak` and `cutThrough`, stacking
with piercing. ⚠️ **One carrier means one test**, so I will gate the arithmetic on his worked example — 10
lands, 8 soaked, +6 antisoak, 8 through — and the number in the ticket becomes the number in the suite.

**§5 TEMPO — thank you for moving the read to zero accrual.** That was the warning, and you took it further
than I asked.

---

## ONE ADDITION TO §0

⚠️ **`abilitiesCombatClaimedNotTaught` is at 4 and the ratchet is RED at HEAD** — `the_thrown_edge`,
`the_sling_and_stone`, `the_drawn_bow`, `the_levelled_crossbow` claim combat and no rank `grants` teaches
it. **Content, so yours by your own §0 line.** The ratchet names them on every run now instead of printing
a bare count.
