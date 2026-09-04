# SPEC — the rank-authoring context package

**Author:** Aevi (PO) · **2026-09-04** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**Implements:** R39b · **subject:** generative-pipeline
> Erik: *"The engine will need to generate the rank prose — so YOU need to make sure it gets good context
> to build the rank description properly and allocate all the necessary rank gains, types, conditions,
> etc."*

⛔ **R39's open question is answered: THE ENGINE AUTHORS RANK 2, not Aevi's queue.** ⚠️ **Which makes the
CONTEXT the whole quality control.** ➡️ **This document is the brief Aevi would want if she were writing the
rank herself.**

---

## §1 — WHAT THE ENGINE MUST PRODUCE

**A full `tree[]` entry. ⛔ Nothing may be omitted or the craft is structurally incomplete:**

| field | constraint |
|---|---|
| `rank` | 2 or 3 |
| `name` | ⚠️ **a NAME, not a label.** See §4 |
| `grants` | what the wielder can now do |
| `cannot` | ⛔ **a SCOPE LIMIT, not a bill** |
| `functions` | ⛔ **from the closed vocabulary ONLY** — `bargain bind break command conceal deceive empower foresee heal hinder make mend move open persuade provoke resist restore reveal shield soothe strike summon sustain track transform travel ward` |
| `gains` | `broaden` or `deepen` |
| `gainAxes` | ⛔ **from the closed NINE ONLY** — `range duration damage scope targets quality autonomy conditions tempo`. ⚠️ **`magnitude` IS NOT ONE — Aevi authored it twice and CCode's ratchet caught it** |
| `harmRung` | `none` · `damaging` · `incapacitating` · `lethal` |
| `backlashRung` | ⚠️ **per R18: the craft's own authored offset below `harmRung`, applied per rank** |

---

## §2 — ⚑ THE USE EVIDENCE (R39b's whole point)

**From `practice`, and it already exists:**

| signal | what it tells the author |
|---|---|
| `uses[craftId]` | ⚑ how hard it has been leaned on |
| ⛔ **`coActivations`** | ⚠️ **WHAT COMPANY IT KEPT** — `deathsense+palework: 5`. ➡️ **The single most shaping fact: a braid used beside a sense craft is becoming a different thing from one used beside a strike** |
| intensity spread | conserve / standard / surge, per cast |
| stretch spread | adjacent / real / against-`notFor` — ⚠️ **novel use is the player TELLING you what it is for** |
| target kinds | people · structures · workings · the dead |
| ⬜ did it harm | and at what rung |
| ⬜ where | ⚠️ **ground and `meaningDensity` at cast time** |

⛔ **THE RULE: RANK 2 GRANTS WHAT THE USE HAS BEEN REACHING FOR.** ⚠️ A braid cast 22 times, 17 alongside
`palework`, at surge, against structures **is asking to become a structural craft** — ➡️ **and rank 2 should
say so.**

---

## §3 — THE CRAFT'S OWN INHERITANCE

| context | why |
|---|---|
| **both parents' full records** | ⚠️ description, all ranks, `notFor`, `harmRung` tree, `bounds` |
| **the tradition's voice** | ⛔ **Ashwarden does not sound like Blazeborn.** The parent tradition's other crafts are the register |
| **rank 1's own text** | ⚠️ **rank 2 must read as the SAME CRAFT deepening** |
| **the corpus's shape** | ⚑ **mean 2.4 functions per craft** — ⛔ a braid must DISTIL, not union. Erik's generator already does this |
| `learnedAt` / lineage | R33 — access is not ancestry |

---

## §4 — ⛔ THE SEVEN TESTS. EVERY GENERATED RANK MUST PASS THEM.

**From `po/AUTHORING_PROCESS_aevi.md`, each added after a real failure:**

| # | test |
|---|---|
| **T1 · VERB** | does every function come from the closed vocabulary, and does its **definition** match what the prose says? |
| **T2 · CANON-TRACE** | for every bound and `cannot`: ⛔ **which line of which file is this from?** ⚠️ **A generator inventing tradition-law is the likeliest failure** |
| **T3 · EVALUATOR** | ⛔ **who evaluates this — engine or GM?** If engine, name the field |
| **T4 · AGENCY** | does the constraint limit the **craft** or the **player**? ⚠️ Costs and reach limit a craft; *"you may not act"* limits a player |
| **T5 · RANK IS MASTERY** | ⛔ **rank 3 must be strictly better than rank 2.** ⚠️ *Erik: "why are there still skills that would suck to take to lvl 3?"* ➡️ **THE GOOD RANK GRANT IS USUALLY THE REMOVAL OF AN EARLIER LIMIT.** Aevi broke this on nine crafts in one sitting |
| **T6 · THE CANNOT IS THE BACKLASH** | the limit and the recoil are the same statement |
| **T7 · SECOND-TURN** | ⛔ **what does a level-1 character DO with this on their second turn?** ⚠️ *Erik: "not just pretty prose that seems to mean something"* |

### ⚠️ AND THE NAMING GUARD

**Measured: 72 of 513 authored names — 14% — open with *The [past-participle] [noun]*.** `last` opens 11,
`kept` 9, and ⛔ **`kept_vigil` and `long_watch` already collide on one display name.**

➡️ ⛔ **THE GENERATOR MUST BE GIVEN THE EXISTING NAME LIST AND FORBIDDEN TO COLLIDE.** ⚠️ **Aevi produced
that distribution herself; a generator with the same brief and no list will produce it faster.**

---

## §5 — ⛔ WHAT MUST NOT BE GENERATED

| ⛔ never | why |
|---|---|
| **generic rank text** | ⚠️ *"the braid deepens; the two crafts answer together more surely"* — **THE DEFECT THIS RULING EXISTS TO KILL.** It passes the gate and says nothing |
| **a NEW COST at rank 3** | ⛔ **T5.** Aevi did this nine times; the good grant lifts a rank-1 limit |
| **invented tradition-law** | ⚠️ **T2.** *"The Choir requires…"* must trace to a real line |
| **a function outside the closed set** | T1 |
| ⛔ **`magnitude` in `gainAxes`** | ⚠️ **it is not one of the nine** |
| **a colliding name** | §4 |
| **more functions than the parents distilled** | ⚑ corpus mean 2.4 |

---

## §6 — ROUND 2 QUESTIONS

1. ⛔ **Does the generated rank go through `authoring_gate.py` before it lands?** ⚠️ **Aevi's answer is
   yes, and a failed gate should HOLD the rank at 1 rather than ship a bad one.**
2. **Is `coActivations` keyed finely enough?** ⬜ It records pairs; ⚠️ **does it record intensity or target
   with them, or only that they co-fired?**
3. ⚠️ **Where is intensity/stretch/target-kind recorded per cast?** ⬜ §2 assumes they are knowable —
   **`practice.uses` is a bare count.** ⛔ **If they are not recorded, R39b's evidence is thinner than the
   ruling assumes and that is worth knowing NOW.**
4. **What happens on a bad evolution?** ⬜ Erik has not ruled whether a braid can evolve WRONGLY.
   ⚠️ **Aevi's instinct is yes and that it is the point — but the generator needs to know whether it is
   optimising or reflecting.**
5. ⬜ **Does the same package serve bond-taught crafts?** ⚠️ `marrow-s-wings` was taught, not braided, and
   has no parents to inherit from.
