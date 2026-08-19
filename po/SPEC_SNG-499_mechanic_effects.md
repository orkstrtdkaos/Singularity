# SNG-499 → CCODE · The mechanical effect vocabulary, and what it needs from the engine

**Author:** Aevi (PO) · **Date:** 2026-08-16
**File:** `content/packs/core/rules/mechanic_effects.json`

---

## §1 — WHY THIS EXISTS

**Erik: *"I think we need a game mechanic list we can evaluate all of these skills against — a full
mapping of every skill and rank based on what it DOES at each level. Then when we get skills like these we
can easily see that they are NOT CLEARLY MAPPING to what they do."***

⚠️ **The audit has been judging crafts by `functions` (what a craft is FOR) and `shape` (how it resolves).
⛔ NEITHER SAYS WHAT HAPPENS AT THE TABLE.** Two crafts can both be `bind`/`reveal` and do completely
unrelated things — which is exactly how Carried Name and Names of the Lost read as duplicates for an hour.

**First measurement: of 952 ranks, 480 named no effect I could recognise.** ⚠️ **That number is WRONG and
Erik corrected it** — see §3.

---

## §2 — ⛔ THREE CLASSES OF EFFECT

| class | resolved by | the rank must state |
|---|---|---|
| **ENGINE** | code, from a field | the number |
| **MODEL** | ⛔ **the model, at runtime** | **what the model is OBLIGED to produce** |
| **PERMISSION** | neither — it changes what may be attempted | the capability, and its bound |

---

## §3 — ⛔ THE CORRECTION THAT MATTERS

**My first pass treated `REVEAL` as an empty mechanic — 130 ranks claiming it, most saying only *"you
know."*** ⛔ **Erik: *"the items that say reveal MIGHT be relying on the GM to author the outcome — and
that IS a real effect."***

**He is right. In an LLM-run game, "the model decides what you find" is a mechanic** — resolved by a
different engine. ⚠️ **But it is only a mechanic if the rank states the CONTRACT:**

> **Not a mechanic:** *"You know what is failing."*
> ⛔ **A mechanic:** *"The model must name ONE specific failing thing, its cause, and roughly how long it
> has."*

**Test: could two GMs produce answers differing in KIND rather than in detail? If yes, underspecified.**

**Six model-adjudicated effects are now enumerated** with contracts and worked examples: `NAME_A_FACT` ·
`NAME_A_WEAKNESS` · `NARRATE_ACCESS` · `ADJUDICATE_PLAUSIBILITY` · `AUTHOR_A_CONSEQUENCE` · `SPEAK_AS`.

---

## §4 — ⛔ WHAT I NEED FROM YOU

### 4a · The ENGINE column — correct my `wired` flags

**I have marked these from your Q1 reply and my own reading. Please correct:**

| effect | field | I believe | your call |
|---|---|---|---|
| **DAMAGE** | `mechanic.dice` | ✅ read, guarded on `shape === "damage"` (and strike) | |
| **SOAK** | `mechanic.soak` | ✅ read; guard mirrors magnitude | |
| **ANTISOAK** | `mechanic.antisoak` | ⛔ **new — SNG-498.** Adds to damage that already passed soak. **Stacks with piercing** | |
| **HEAL** | `mechanic.dice` on healing shape | ⛔ **authored, unread** — 57 abilities, 27 with dice | |
| **ACTION_LOSS** | — | ⛔ **no field.** Keening r1 needs it | |
| **UNCONSCIOUS** | — | ⛔ **no field.** Keening r2/r3 | |
| **TEMPO** | contest state | not built (`tempo.json`) | |
| **SENSE_SLOT** | `ability.sense` / `.obscure` | ✅ shipped — CCODE-45, CCODE-51 | |
| **DENY_READ** | `ability.obscure` | ⚠️ passive via `senseResistOf`; **declared choice is new** | |
| **PERSIST_UNTIL_HEALED** | — | ⛔ **no duration class for this.** Grey Hand, Grief Strike r3 | |
| **PROJECT_TICKS** | `ability.projectTicks` | not built (§33) | |

### 4b · ⛔ THE QUESTION I CANNOT ANSWER FROM CONTENT

**For each MODEL effect: is there a prompt path that carries the contract to the model at runtime, or is
the contract invisible?**

⛔ **A contract the model never sees is not a contract.** If `grants` text reaches the prompt, the
contracts work as written. **If the model sees only `plainly` or a summary, then every model-adjudicated
effect in the game is currently unenforced** — and that is a bigger finding than any of the content work.

### 4c · What else belongs on this list

⚠️ **I expect I have missed effects that exist in the engine and are not represented in content** — status
conditions, positioning, initiative, anything the battle loop tracks that no craft names. **Add them.**

---

## §5 — HOW THIS CHANGES THE AUDIT

⛔ **Every rank must name at least one effect from the list, with its number or its contract.** A rank
that cannot is flavour, a duplicate, or unfinished.

⚠️ **And it settles arguments I was having by intuition.** Carried Name and Names of the Lost looked like
duplicates — both `bind`/`empower`, both about holding the dead present. **Under the vocabulary they are
not:** Carried Name is `NAME_A_FACT` (correct a memory) and Names of the Lost r2 is an ENGINE buff
(*"steadied, harder to move off it"*) **with an unstated number.** ⛔ **Different classes entirely, and I
would have cut one of them.**
