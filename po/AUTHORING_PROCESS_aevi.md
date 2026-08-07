# AEVI CONTENT AUTHORING PROCESS — the gate I run on myself

**Author:** Aevi (PO) · **Created:** 2026-08-07, after Erik: *"You need to create a process for writing
content for yourself… no excuse for continuing to author in this way."*
**Runnable gate:** `po/authoring_gate.py`. **A process I cannot run is a resolution, not a process.**

---

## §0 — WHAT WENT WRONG, SO THE PROCESS IS SHAPED BY IT AND NOT BY GOOD INTENTIONS

On 2026-08-07 I authored ten tier-I offensive abilities to fix a catalog that had **39 `reveal` against
4 `strike`**. I shipped **6 `hinder` and 3 `strike`.** Four distinct failures, each of which this process
now gates:

1. ⛔ **I never read the vocabulary I was tagging against.** `function_vocabulary.json` defines `hinder`
   as *"WEAKEN, drain, impair, or slow — **without wounding**."* Tagging `hinder` on an attack is
   literally declaring it does not wound. **The file told me and I did not open it.**
2. ⛔ **I invented constraints and dressed them as canon.** *"Never hasten a person's ending — Ashwarden
   law, and the craft itself refuses."* That is **Marrow's** personal vow, from one companion's
   `boundaries` field. I promoted a single character's characterisation into a mechanical law binding an
   entire tradition's combat craft. Nothing in Ashwarden canon says it.
3. ⛔ **I asserted mechanics that have no evaluator.** *"The peace is spent." "You are standing in it
   too." "It does not know your allies from theirs."* There is no place-tension state, no wielder-harm
   mechanic, and no ally-targeting state. I wrote costs against three resources that do not exist —
   **in the same session I filed SNG-353 about authored fields with no reader.**
4. ⛔ **I removed player agency and called it a cost.** *"It does not stop when the fight does; cutting
   them out takes time you may not spend."* It is the wielder's own craft. Erik: *"can stop when you
   will it."*

**The common root: I authored from taste instead of from the substrate, then wrote prose confident
enough to hide that I had not checked.**

---

## §1 — PRE-FLIGHT (before writing a single record)

**Read, in this order. Not "consider" — open the file.**

| # | Read | Why |
|---|---|---|
| 1 | `rules/function_vocabulary.json` → `families` | The **closed** verb list WITH definitions. `strike`=harm a LIVING thing · `break`=harm a THING · `hinder`=weaken **without wounding**. The verb IS the mechanical claim. |
| 2 | `rules/consumer_required_subfields.json` → `skill` | Which fields a real consumer reads, with file:line. Authoring a field nothing reads is decoration. |
| 3 | `rules/craft_mechanics.json` | `shape`, `mechanic{magnitude,duration,scope}`, `operativeAxis` — the fields with actual engine teeth. |
| 4 | `rules/traditions.json` → the target tradition | `craft`, `axis`, `pole`, `aesthetic`, `cultOfPurity`, `opposite`. **Every bound must trace to something here.** |
| 5 | 2–3 sibling abilities in the destination file | Match the shape that exists; do not invent a schema. |
| 6 | The destination file's current `ids` | Collision check before, not after. |

⚠️ **Then state the delivery shape in one line before writing** — ranged / touch / area / spoken /
consented / reactive. If it matches an ability already authored, change it. Sameness of delivery is how a
catalog gets 39 of one verb.

---

## §2 — THE FIELD-READER MAP (know what is real before you write into it)

| field | who reads it | authoring consequence |
|---|---|---|
| `id` `name` `functions` `energyCost` `levelReq` | engine, CRASH/EMPTY severity | **must be right** |
| `mechanic` `shape` `operativeAxis` | `craftmechanics.js` | real numbers, real teeth |
| `tree[].grants` `tree[].cannot` `notFor` | **the GM prompt** (`app.js:3425`, `CAN: … CANNOT: … NOT FOR: …`) | ⚠️ **GM-adjudicable — so it must be CONCRETE.** A GM cannot act on atmosphere. |
| `tree[].harmRung` | harm ladder | `none · damaging · incapacitating · lethal` |
| `bounds` | ⛔ **NOTHING** | prose only. Do not encode a rule here and believe it exists. |
| `narrationHints` `plainly` | GM / player display | flavour, correctly |

---

## §3 — THE FOUR TESTS, applied to every record

**T1 — VERB TEST.** Does every function come from the closed vocabulary, and does its *definition* match
what the ability does? ⚠️ **An offensive ability tagged only `hinder` has declared itself non-wounding.**

**T2 — CANON-TRACE TEST.** For every bound, `cannot`, and `notFor`: **which line of which file is this
from?** If the answer is "it felt right," it is invented. ⚠️ **A character's `boundaries` is that
character's, never a tradition's law.**

**T3 — EVALUATOR TEST.** For every constraint: **who evaluates this — engine or GM?** If engine, name the
state variable. If GM, is it concrete enough to act on? ⚠️ *"Allies are caught too"* is not adjudicable;
*"allies in the area are struck one rung lower"* is. **If neither can evaluate it, it is not a rule, it
is a mood.**

**T4 — AGENCY TEST.** Does the constraint limit the *craft*, or limit the *player*? ⚠️ Costs, reach,
prerequisites, and materials are the craft. "You cannot choose to stop" and "it may not be used on a
person" are me taking the controls. **The wielder commands their own craft.**

---

## §4 — POST-FLIGHT: RUN THE GATE

```
python3 po/authoring_gate.py <authored.json>     # before the write
python3 po/authoring_gate.py <pulled-from-origin.json>   # after, against LIVE records
```

Gates: required fields · closed vocabulary · id collision · valid `harmRung` · **FIGHT without a HARM
verb** · **offensive-but-`hinder`-only** · reaches damaging/lethal without `strike`/`break` · every rank
`none` on an offensive craft · and WARNS on the three no-evaluator classes (friendly-fire, self-harm,
place-state).

⚠️ **Run it against origin after the write, not only against the draft.** It caught a live FAIL in
`the_name_invoked` that I had already shipped and believed was fine.

---

## §5 — STANDING

- **Lower Layer Wins applies to content.** The vocabulary file beats my sense of the word. The tradition
  record beats my sense of the people. Erik beats all of it.
- **Leave the record.** Corrections annotate; they do not overwrite.
- ⚠️ **The gate grows by incident.** Every new way I get this wrong becomes a check. It is not finished
  and is not meant to be.
