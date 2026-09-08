# FINDING — a gate read your prose and called it a mechanic (CCode, 2026-09-08)

## §1 — ⛔ FOUR CRAFTS WENT RED ON `d27fca4b` AND YOUR CONTENT WAS NEVER WRONG

**`drawn_bow`, `quick_hands`, `plain_weight`, `cast_twin`** — the `abilitiesCombatClaimedNotTaught` ratchet
went **0 → 4** on your rewrite of the eight body/weapon crafts.

⚑ **Every one of the four plainly deals damage and says so in dice** — *"DEALS 2d6 DAMAGE"*, *"for 1d6"*,
*"2d6 SHADOW"*. ⛔ **The gate grepped each rank's `grants` PROSE for an offensive word.** Your sentences got
better and the number got worse.

⚠️ **AND THE ANSWER WAS ONE FIELD AWAY THE WHOLE TIME.** Every one of those ranks already carries
`functions: ["strike"]` **and** `harmRung: "damaging"` — machine-readable, authored by you, sitting beside the
prose the gate was reading instead.

| | |
|---|---|
| ⛔ **wrong in BOTH directions** | it reddens when an author improves a sentence, and it stays green for a craft that is genuinely toothless but well-described |
| ✅ **no coverage argument for the prose** | **429 of 429** authored records carry per-rank `functions` AND `harmRung` |
| ✅ **and reading the field is not vacuous** | `harmRung: none` covers **919 of 1215** ranks — the field discriminates hard |

⛑ **Fixed by moving the reader, not by lowering the bar**, and a canary now proves the guard can still fail:
a synthetic craft claiming `strike` whose only rank is `harmRung: none` — with the word *"strike"* sitting in
its prose — is still caught. **`wiring_audit` 2 → 1.**

**Nothing for you to do on these four.**

---

## §2 — ⚠️ BUT READ THE OTHER WAY, THE SAME RULE FOUND SEVEN THAT ARE YOURS

147c says *if it can fight, a rank says HOW*. The inverse is the same mismatch: **a rank that deals damage
inside a record whose own `functions` never claim it.**

| craft | the record claims | the rank does |
|---|---|---|
| `case_closed` | persuade / bind / empower | ⛔ r2 **damaging** · r3 **lethal** |
| `graftlife` | heal / transform | ⛔ r2, r3 **damaging** |
| `bark_and_briar` | resist / shield / ward | ⛔ r2, r3 **damaging** |
| `calling_back` | heal / summon | ⛔ r3 **lethal** |
| `given_errand` | summon / bind / command | ⛔ r3 **lethal** |
| `grief_that_stops` | bind | ⛔ r2 **lethal** |
| `open_threshold` | bind / summon | ⛔ r3 **lethal** |

⚑ **WHY IT IS LOAD-BEARING AND NOT TIDINESS:** `battleSkillsForCharacter` builds the player's menu rows from
the **RECORD's** `functions`, one row per verb — it never reads the rank's. `intent.js` **does** read the
per-rank rung. ➡️ **So these are gated as harm and offer no harm verb to declare:** the lethal-intent
question fires, and the menu hands the player `heal`, `bind`, `ward`.

⬜ **Your call which way each one resolves** — add the verb to the record, or soften the rung. I have **not**
ratcheted it, because choosing between those two is authoring, and a ratchet would be me making the call for
you.

---

## §3 — ✅ AND SEVEN MORE THAT I AM *NOT* SENDING YOU, ON PURPOSE

`uttered_name`, `line_and_knot`, `root_that_holds`, `deep_covenant`, `lever`, `wild_flowering`,
`honest_bargain` all carry **`incapacitating`** ranks with no harm verb — and **that is correct**.

⚑ **The harm family is `strike` / `break` / `hinder`, and binding is not in it.** A binding craft that stops
someone is not misdeclared; `incapacitating` is a rung and `bind` is a verb.

⛔ **The flat number is 15, and reporting 15 would have sent you to seven false alarms** — which is how a note
stops being read. The audit prints the split, not the total.

---

## §4 — ⬜ ONE STANDING RED THAT IS MINE, NOT YOURS

`testOnlyExports = 19` against a baseline of **7** — nineteen engine exports reachable only from a test, so
they pass CI and **cannot fire in play**. ⚠️ **Measured: not from this session.** The newest of the nineteen
dates to **2026-09-04**, the oldest to **07-11**. Two months of accumulation, my debt to work down, and I am
recording it here rather than letting the number sit unexplained.
