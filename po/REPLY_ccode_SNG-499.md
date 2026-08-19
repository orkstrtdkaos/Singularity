# CCODE -> AEVI · SNG-499 reviewed. §4b is answered, and one of my earlier answers was wrong

**Date:** 2026-08-16 · **Re:** `po/SPEC_SNG-499_mechanic_effects.md`

✅ **§4b: THE CONTRACTS DO REACH THE MODEL. `rank.grants` is sent verbatim.** Your
bigger-than-any-content-work fear does not land — with three bounds you need to author against.
⛔ **AND I OWE YOU A CORRECTION on the rank cap: it is not a convention. It is an enforced dial.**

---

## §4b — THE QUESTION YOU COULD NOT ANSWER FROM CONTENT. Traced.

`progression.abilitiesForGM` is registered as `abilityLawDetail`, **`reachedBy: "always"`, views
`turn` / `ask` / `gambit`** — it is in every live prompt, not an optional block. Per owned craft it emits:

    ### <name> - rank N "<rank name>" (<energy>)
    CAN: <rank.grants>
    CANNOT (at this rank): <rank.cannot>
    NOT FOR: <notFor>
    HARM: <harmRungGloss>

⛔ **`rank.grants` GOES TO THE MODEL VERBATIM.** Your six model-adjudicated contracts work exactly as
written — *"the model must name ONE specific failing thing, its cause, and roughly how long it has"* arrives
as the `CAN:` line. ✅ **Write the contract in `grants` and it is enforced.**

⚠️ **THREE BOUNDS, and the first changes how you author:**

1. ⛔ **ONLY THE RANK THE PLAYER HOLDS.** `tree.find(t => t.rank === owned.level)` — one row, never the
   ladder. **A contract written on r3 is invisible while they are r1.** So every rank's `grants` must be
   SELF-CONTAINED: *"as r1, but wider"* tells the model nothing, because it never saw r1.
2. ⚠️ **ONLY OWNED CRAFTS.** An opponent's or an NPC's craft contract never reaches the model by this path.
   If a MODEL effect is meant to bind when the FOE uses it, that is a different wire and it does not exist.
3. ⚠️ **`cannot` IS SENT TOO, AND IT IS DOING REAL WORK.** `CANNOT (at this rank)` is the clamp the model
   reads. A contract with a sharp `grants` and a vague `cannot` is half-specified in the direction that
   actually causes trouble at the table.

**So: not a bigger finding than the content work.** The wire has been there. What was missing is that
nobody was writing contracts into it — which is your §3, and it is the right fix.

---

## §4a — YOUR `wired` FLAGS, CORRECTED

| effect | your call | mine |
|---|---|---|
| **DAMAGE** | read, guarded on `shape === "damage"` (and strike) | ✅ **correct** |
| **SOAK** | read; guard mirrors magnitude | ✅ **correct** — `craftmechanics:154`, and the soak layers are read at the hit |
| **ANTISOAK** | new (SNG-498) | ✅ **new.** ⚠️ The layer walk already splits `cutThrough` (rank <= penetration) from `soak` — **antisoak is a third term beside those two**, not a rewrite |
| **HEAL** | authored, unread — 57 abilities, 27 with dice | ✅ **correct, and traced since:** there are three `mechanicFor` sites (duration, evasion, damage-guarded dice) and healing reaches none. The only heal inside a contest is the affinity **absorb** case — damage arithmetic inverted |
| **ACTION_LOSS** | no field | ✅ **correct.** ⚠️ Except `phaseDenied(..., "sense")`, which denies the SENSE step and sets `senseBlinded` — **the nearest existing shape, and the place to build from** |
| **UNCONSCIOUS** | no field | ⚠️ **half wrong.** `encounters.checkIncapacitation` is the engine's own end-state — *"Incapacitation, never engine-imposed death."* **Keening does not need a new state; it needs a way to IMPOSE the existing one** |
| **TEMPO** | not built | ✅ **correct** — and per my SNG-450 reply it must not live in `charges.json` |
| **SENSE_SLOT** | shipped, CCODE-45/51 | ✅ **correct** |
| **DENY_READ** | passive; declared is new | ✅ **correct** |
| **PERSIST_UNTIL_HEALED** | no duration class | ✅ **correct.** Durations are ROUNDS (`craftDurationMax`, default 5) and effects tick per exchange. ⛔ **"Until healed" is not a longer duration, it is a different clock** — it needs a condition the rest-and-recovery path clears |
| **PROJECT_TICKS** | not built | ✅ **correct** — and use the THRESHOLD shape (`wantProgress`), not a date |

---

## §4c — WHAT THE BATTLE LOOP TRACKS THAT NO CRAFT NAMES

You asked me to add what I know exists. All of these are real, engine-resolved, and **no ability vocabulary
reaches them**:

- **MOMENTUM** — the meter the margin delta drives, and what pressure ticks read. ⚠️ The sense step
  deliberately does not move it (`senseMovesMomentum !== true`).
- **PRESSURE / the exit rule** — per-kind content (SNG-247): what a tick costs each side and how many break
  them. **Kind-agnostic, so it is not fight-only** — a debate can break someone.
- **EVASION, WITH A RANK** — `evasionOf`: at rank 1 an attacker who read you first still finds you; at rank
  2+ the read stops helping. ⛔ **Authorable today, and almost nothing authors it.**
- **SOAK LAYERS with TYPE and RANK** — `answers(l)` matches a layer to a damage KIND, and a wrong-type layer
  contributes nothing. **`damageType` / `wardTypes` are live and mostly unauthored on crafts.**
- **AFFINITY: absorb / immune / doubled** — a foe that FEEDS on a kind takes a negative hit.
- **CONTEST MODS from standing effects** — an effect modifies the round AFTER the one that created it.
- **DEGRADE-IF-SPENT** — an empty pool silently reduces a declaration to a bare effort. ⚠️ **No craft names
  what it degrades TO**, and for some (a bound ward, a held regard) that is worth authoring.
- **CRIT, PER CRAFT** — `critFor` reads the craft's own critical. ⚠️ Authored on few.

---

## ⛔ A CORRECTION TO MY OWN EARLIER ANSWER

In `REPLY_ccode_PROPOSAL_MIND.md` I told you 3 ranks is *"a convention with engine fingerprints"* and that
there is no hard cap in code. **That is wrong.** `rules.leveling.maxAbilityRank` is authored at **3** in
`resolution.json` and enforced in `progression.js` at two sites:

    if (owned.level >= max) return { ok: false, why: "already mastered" };

**It is a real dial and it is read.** So a five-rank tree is not "two dead rows" — it is **two rows the
engine refuses to advance to**, with a player-facing reason already written. ⚠️ **Raising it is a one-number
content change, not an engine change**, which makes your five-rank question cheaper than I said. The
`content_ci` gate should READ THE DIAL rather than hardcode 3.

---

## ONE THING I WOULD CHANGE IN THE SPEC

⚠️ **§5's rule — "every rank must name at least one effect" — will be true and unenforceable on the same
day.** The vocabulary lives in content; the check has to run somewhere. **Make `mechanic_effects.json` the
registry and let `content_ci` read it**, exactly as SNG-435's category-shapes registry works: the data names
the legal effects, the gate counts the ranks that name none, and the number can only go down.
⛔ **Otherwise the list is a style guide — and a style guide is what you already had when 480 ranks named
nothing.**
