# SPEC SNG-500 — Engine work order

**Author:** Aevi (PO) · **Date:** 2026-08-16 · **For:** CCode
**Context:** `po/TRACKER_traditions.md` · `po/MATRIX_{mind,body,death}.md` ·
`content/packs/core/rules/mechanic_effects.json` · SYSTEM_SPEC §32–38

---

## §0 — WHAT THIS IS AND WHAT IT IS NOT

⛔ **Everything here is ENGINE work.** The content defects the audit found — **290 wrong `powerSystem`
values, 201 unauthored bounds, 604 thin ranks, 436 undeclared targets** — are **mine**, and they get fixed
per tradition. **Do not take them.**

⚠️ **Ordered by how much authored content is currently inert without it.** Items 1–3 unblock content that
already exists; 4–6 unblock content I am about to write; 7–8 are structural and can wait.

---

## §1 — ⛔ HEALING HAS NO READER · 38 abilities, 28 with dice

**The largest inert block in the game.** You measured it: `mechanicFor` has three call sites and healing
reaches none. Outside combat, health moves via `rules.recovery`, `ladder.js` grants and `encounters.js`
deltas — **not one reads a craft's mechanic.**

**Intent is authored in `content/packs/core/rules/healing_intent.json`.** The parts that constrain you:

- **Scale comes from dice**, on the existing ladder: **L1 `1d4` · L2 `2d4` · L3 `3d4` · L4 `4d4`.**
- ⛔ **A heal is not a negative hit.** It **cannot crit into overhealing** and **cannot be evaded.**
- ⛔ **BUT IT CAN BE SOAKED — by ACTIVE ONGOING HARM, never by armour.** Bleeding, hastened decay, rot,
  venom, and sustained holds reduce a heal. ⚠️ **Two crafts already claim this in prose and neither does
  it:** `Hastened Grey` (*"a wound already open goes grey and stops closing"*) and `Sustained Regard r2`
  (*"cannot stop bleeding for as long as you hold it"*).
- **A heal that ends the ongoing harm first may spend its whole value doing so** — that is the
  counter-counter, and `Physician's Tome r1` is written for it.

⚠️ **Mechanism is yours.** Widening the `798` guard reuses tested arithmetic but inherits crit/evade/soak
unless suppressed; a separate `resolveHeal` states the asymmetries once. **Your call.**

---

## §2 — ⛔ TWO CONDITIONS KEENING NEEDS · action-loss and imposed incapacitation

**`Keening` is authored and currently does nothing at any rank.**

**ACTION_LOSS** — *target loses their next action.* ⚠️ **You named `phaseDenied(…, "sense")` as the nearest
shape.** Keening r1 needs the same for the **action** step.

**UNCONSCIOUS** — ⛔ **you were right that I was half wrong.** `encounters.checkIncapacitation` already
holds the end-state and the engine never imposes death. **Keening does not need a new state — it needs a
way for a craft to IMPOSE the existing one**, with a resist that degrades to action-loss.

**Scope:** r1 area/action-loss · r2 up to three, unconscious-or-action-loss · r3 everyone you choose.

---

## §3 — ⛔ ANTISOAK · a third term beside `cutThrough` and `soak`

**Erik's definition, verbatim:** *a 10-damage strike lands, 8 gets soaked, the 2 that got through gets the
6 antisoak added for 8 damage.*

⛔ **It is NOT soak reduction. It is a bonus on damage that ALREADY GOT PAST SOAK** — which is why it
**stacks cleanly with piercing rather than competing**. A Ki Wield striking an antisoaked target ignores
soak *and* adds the antisoak. ⚠️ **I have written that into the bounds so it is not "fixed" later.**

**You noted the layer walk already splits `cutThrough` (rank ≤ penetration) from `soak`.** This is a third
term beside those two, not a rewrite. **Currently one carrier (`Grief Strike`, antisoak 3/5/8) — I will
author more once it resolves.**

---

## §4 — THE CONTESTED SENSE SLOT · 28 sense + 15 obscure tagged

**Mostly shipped and you said so.** CCODE-45 gives `sense → action → bonus`; CCODE-51 opposes the read via
`senseResistOf`; `phaseDenied(…, "sense")` is obscure-as-an-effect.

**Three things are new:**

1. ⛔ **OBSCURE AS A DECLARED CHOICE.** Today the resistance is passive, read off the sheet. **Declaring
   obscure means you are NOT reading** — that cost is what makes it a decision.
2. ⛔ **THE TIE RULE: THE OBSCURER WINS TIES.** ⚠️ You flagged this as the rule most likely to get softened
   during implementation because it looks unfair in a unit test. **It is not unfair — it is the whole
   balance.** Without it the sense slot belongs permanently to the perceptive traditions.
3. **Tags to read:** `ability.sense` (28) and `ability.obscure` (15).

---

## §5 — TEMPO · `content/packs/core/rules/tempo.json`

**Per your correction, it does NOT live in `charges.json`** — different lifetime, and *"two clocks in the
same unit invite arithmetic."* **Contest state, cap 3, empties at contest end.**

⛔ **AND SENSE BANKS ZERO.** You warned that the sense step was built consequence-free so reading is not a
way to win. **My first table had a read as the largest accrual — that would have reversed a deliberate
design decision as a side effect.** Tempo now banks only off the action slot and the momentum meter.

**Spend:** 1 → second action · 2 → whole-round action · 3 → act before the round opens. **Counter-spends:**
1 refuses an opponent's declared tempo action; 2 recovers the energy of your last craft.

---

## §6 — PERSIST_UNTIL_HEALED · a different clock

**Your words: *"not a longer duration, a different clock."*** Durations are rounds
(`craftDurationMax` default 5). **This needs a condition the rest-and-recovery path clears.**

**Carriers:** `Grey Hand` (weakness persists until healed — ⚠️ Erik's ruling, it does not lift when
attention stops), `Grief Strike r3` (antisoak 8 until a mending craft closes it).

---

## §7 — PROJECT TICKS · 2 abilities, more coming

**`downtime: true` + `projectTicks: true`.** Banks progress per world tick and completes on a **threshold,
not a date** — your correction. **Carriers: `Built System`, `Sound Read r3`.**

⚠️ **SYSTEM_SPEC §33 also defines JOURNEY skills** — apply per leg against `walkingDays`, consuming
`scale.json` and the region-map ways rather than restating them. **No carriers yet; I will author them
into Span.**

---

## §8 — COMPANION STAGE 3 IS UNREACHABLE

**`engine/companions.js` `bondOf` is a ternary returning stage 1 or 2 only.** Bond caps at 10, the last
stage fires at 8 — ⛔ **the top 20% of the scale is inert and no companion can reach an authored stage 3.**

⚠️ **This now blocks content, not just lore:** `Attended End` is authored with `progression: "stage"` and
its third tier (**Deathly Premonition**) cannot be reached. **The other eight bond grants are stubs I will
author to the same pattern.**

---

## §9 — NOT YET · held deliberately

| item | why held |
|---|---|
| **taxonomy swap `traditionV2` → `tradition`** | 21 abilities carry it. ⛔ **Your read stands: 52 reader sites, and the wheel's 24-position ring means every antipode moves. A game-rule change wearing a rename** — Erik's call, not a refactor |
| **`bind` split** (bind / ward / establish) | ⚠️ Doing it with the taxonomy move is one migration; separately it is two, and the second lands on content the first just moved |

---

## §10 — TWO THINGS I WANT YOU TO CORRECT ME ON

**1 · `EVASION` and `CRIT` are authorable today and appear in NONE of Mind, Body or Death — 220 ranks.**
⚠️ **`evasionOf` has rank behaviour I did not know about** (at rank 1 an attacker who read you first still
finds you; at rank 2+ the read stops helping). **Is there a reason content should not be setting these, or
have I simply never authored them?**

**2 · `damageType` / `wardTypes` are live and mostly unauthored.** `answers(l)` matches a layer to a
damage kind and a wrong-type layer contributes nothing. ⛔ **If crafts are not declaring a damage type,
what is the current default, and is typed warding effectively dead?**
