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

---

## §6 — T5: RANK IS MASTERY *(added 2026-08-07 after Erik: "why are there still skills that would suck to take to lvl 3?")*

⛔ **Depth is EARNED, not bought.** Rank 2 lands on practice; rank 3 is a GM-marked defining moment. The
player did not choose to arrive — so **a cost that appears for the first time at rank 3 makes mastery a
punishment for something they did not opt into.** I did this to six of nine abilities in one batch:
*"the wielder is measured too," "the wielder is struck one rung lower."*

**And once in a worse form — rank 3 taking CONTROL away** (`the_offered_mouth`: *"it stops when it is
done, not when you are"*). That is T4 failing at the top of the ladder, where it does the most damage.

**THE RULE:**
- **Rank = mastery. Strictly better than the rank below, always.** More reach, more precision, and —
  the best shape — *control the lower ranks did not have*: exempt your own, set where it falls, call it
  off, stand outside the run.
- **`intensity.surge` = where risk lives.** A cost the player CHOOSES is a real decision. A cost bolted
  to a rank they earned is a tax on progress.

⚠️ **The good rank-3 grant is usually the removal of an earlier limitation, not a bigger number.**
`the_spent_hour` rank 3 is not "more time taken" — it is *the levy passes you by*.

⚠️ **Positional costs remain fine** — "if you are inside the ruin" is avoidable by play and is a real
tactical constraint, not a tax. The gate distinguishes these.

---

## §7 — T6: THE CANNOT IS THE BACKLASH *(added 2026-08-07, Erik's insight)*

Erik: *"many of the cannots could actually translate into surge failure costs… similar to a conserve
being able to avoid the negative effects."*

⚠️ **I had been writing every failure mode into `cannot`, where it can only ever be a prohibition, while
`surge` — which is the game's actual risk dial and is fully wired — got a line of flavour.** The
constraint and the failure were the same thought and I was only writing half of it.

- **`backlash`** — what going wrong looks like for THIS craft. ⛔ **Not "you take damage."** The Thinned
  Veil's backlash is *the thinning does not close.* The Offered Mouth's is *it looks at the person who
  showed it.* **Derive it from the craft's own `cannot`; that is where it was already hiding.**
- **`conserveSuppresses`** — what conserve buys beyond a smaller number. ⚠️ **Without this, conserve is
  strictly worse and no one ever picks it.** With it, conserve is *"the snare stays at bind only — no
  bite, on anyone, including you."* That is a decision.

⚠️ **Verified before authoring, per T3:** `shouldBacklash()` and `applySurgeBacklash()` are live, degree-
scaled and tier-costed. **The prose `intensity.conserve/surge` I had been authoring for weeks was read by
nothing** — my own writer-with-no-reader, found by running my own evaluator test on my own back
catalogue. The gate now requires `backlash` on anything that claims FIGHT.

---

## §8 — T7: THE SECOND-TURN TEST *(added 2026-08-07, Erik: "make sure these skills are concrete, useful, and not just pretty prose that seems to mean something")*

⛔ **THIS ONE CANNOT BE GATED. It can only be asked, in writing, per ability.** Every other test in this
document is mechanical — a verb checked against a vocabulary, a rung checked against a tree. **This one is
a judgement about whether a sentence means anything, and no regex distinguishes evocative prose from
prose that only sounds evocative.** Saying so is part of the discipline: pretending it is gated would be
its own version of the failure.

**Three questions, answered in one concrete sentence each, before an ability ships:**

1. **SECOND TURN.** *What does a level-1 character DO with this on their second turn?* If the answer needs
   a paragraph or a hypothetical, it is not concrete.
2. **OBSERVABLE OUTCOME.** *If it succeeds, what does the GM narrate CHANGING?* ⛔ **A perception craft
   must return a SPECIFIC ANSWER, not a described experience.** *"See the figure it makes"* is a feeling
   about looking; *"the craft names the element that does not fit"* is a thing the GM must now say out
   loud.
3. **DISTINGUISHABLE.** *Could a player tell this apart from the other option in front of them?* Two
   abilities that produce the same table moment are one ability and a wasted point.

### §8a — The three that failed it, and the shape of the failure

Audited all 43 authored 2026-08-07. **40 passed. Three failed, and all three failed the SAME way — they
described the ACT OF PERCEIVING rather than naming the OUTPUT:**

| ability | was | now |
|---|---|---|
| `the_true_figure` | *"see the figure it makes — the repeat, the symmetry, the gap"* | **names ONE thing**: the element that does not fit, or the missing piece and what shape it must be |
| `the_standing_figure` | *"a threshold that turns what crosses it wrong… a mark that holds its meaning"* | **declare one of three at setting**: stops one named kind of thing, makes building/aiming along it reliable, or stays legible unaltered |
| `the_plain_seeing` | *"illusion, staging, and your own preference come off it"* | **tells you WHAT WAS ADDED**: this blood was poured, that seal is recent, this man is not who he is dressed as |

⚠️ **The tell is a grants clause with no OBJECT.** *Turns what crosses it wrong* — wrong how? *A mark that
holds its meaning* — which meaning, and against what? **Both read as authored constraint and are actually
the absence of a decision.** The prose was doing the job of deciding, which is the thing Erik named.

⚠️ **Note which ones failed: all three are REVEAL-family or make-family perception crafts.** Offensive
abilities are hard to fake concrete because they must say what breaks. **Perception crafts are where pretty
prose hides, because "you see truly" feels like it means something.** Weight the audit there.
