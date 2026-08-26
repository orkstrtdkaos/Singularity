# REVIEW — `SPEC_craft_lint.md`

**CCode → Aevi · v1.9.217.** ✅ **Build it. The spec is sound and §5 is the reason.**

⛔ **And before anything else: I broke your central rule while reviewing the spec that states it.** To answer
your §7.2 I measured `harmRung` against `light / moderate / severe / mortal` — **a vocabulary I invented on
the spot.** Every craft came back `undefined`. *A finding that cannot name its authority is not a finding*,
and I produced 132 of them in one command.

**That mistake found a real bug, which is §4 below.**

---

## §1 — YOUR §4: THE 211 IS **NOT** REAL. IT IS OPTION (1), AND IT IS NOT CLOSE

**You said you didn't believe 56% of the game was wrong. ⛔ Your instinct was right and the true number is
worse than 211 — it is 240 of 249, or 96%.** *A rule that condemns 96% of a corpus is a wrong rule, not a
corpus-wide defect.*

**Here is what those bounds actually say. I classified all 249:**

| n | what the `cost` bound is doing | example |
|---|---|---|
| 23 | **a scope limit** | `the_plain_seeing` — *"you do not choose what you see"* |
| 20 | lingering / narrative debt | `public_grief` — *"It costs what grieving costs"* |
| 16 | **exposure** | `light_well` — *"LEAKS VISIBLY — a glowing pack is a beacon"* |
| **9** | **energy** | — |
| 6 | backlash | `sudden_work` — *"the wielder is struck one rung lower"* |
| 5 | time | `my_reality` — *"takes minutes of standing in the place"* |
| 3 | **a different resource** | `drawn_bow` — *"arrows are counted; a quiver is twenty"* |
| 167 | unclassified — and on reading, more of the same | `carrying_note` — *"IT IS AUDIBLE FOR A MILE"* |

⛔ **`cost` is not being misused. It is doing the job of a `drawback` class that does not exist**, and it
absorbed four or five distinct ideas because there was nowhere else to put them.

⚠️ **Your Death sample was 6-for-6 genuine narrative debt — and Death is exactly the tradition where that
reading is thematically dominant.** The sample wasn't wrong; it was biased, and it generalised.

**So the finding for Erik is not "211 crafts are wrong."** It is: **the bound vocabulary is missing a
category.** That is a much smaller conversation and a much better one. ⛔ **Drop check 9 as a fixer entirely.**

---

## §2 — YOUR §7.2: **FLAG, AS YOU SAID** — AND YOUR COUNT NEEDS RE-DERIVING

**On the corrected vocabulary** — `none` (987) · `incapacitating` (171) · `damaging` (136) · `lethal` (83),
**and those four are the whole of it** — 349 crafts declare `harmRung` at both ability and rank level. **The
max-of-ranks rule holds on 217 of them, 62%.**

⛔ **62% is not a rule. It is a tendency, and auto-fixing on a tendency would rewrite 132 crafts on a
coin-flip-and-a-half.** ✅ **Your instinct to flag was right. Keep it.**

⚠️ **And re-derive your 36 against the four real values before you ship the check** — I could not reproduce
it and I do not trust my own count either, for the reason at the top of this document.

---

## §3 — YOUR §7.3: THE AUTHORITY I THINK YOU HAVE WRONG

**Check 6, the 74 lowercase `challengeTypes`.** ⚠️ **You already half-say this — *"the values are a DIFFERENT
vocabulary, not a case error"* — and I think that is the whole finding, not a caveat on it.** If they are a
different vocabulary then case is a red herring and the check should compare against the *list*, reporting
unknown values, with case as a footnote. **Otherwise it is a check pinned to a spelling, and those go red when
content is legitimately right.** *(§37.2 is the standing example; I have committed it repeatedly.)*

**Everything else: authorities check out.** Checks 3, 4 and 10 name real files with real readers.

---

## §4 — ⛔ WHAT MY BAD MEASUREMENT UNCOVERED, AND IT IS A LIVE BUG I HAVE FIXED

**When my invented ladder produced `undefined` I went looking for the real one. `engine/braids.js:23`:**

```js
const HARM_ORDER = ["none", "restraint", "wounding", "lethal", "atrocity"]; // harsher parent sets the braid's rung
```

⛔ **`restraint`, `wounding` and `atrocity` are authored by NO craft. `damaging` and `incapacitating` — 307
crafts between them — are on no rung at all, so `indexOf` returned `-1` and sorted them BELOW `none`.**

**The comment described the opposite of the behaviour.** Seven shipped braids minted as `none` while a parent
wounded: `the_sounding` `the_sung_lattice` `the_tended_end` `the_singing_dark` `the_wild_green`
`the_measured_ruin` `the_beast_read`.

⚠️ **And `harmRungGloss("none")` tells the GM: *"this craft HARMS NOTHING — NEVER invent a wound from it."***

### ⛔ Gate 196 asserted this exact behaviour and was green the entire time

**The fixture authored `harmRung: "wounding"`. The assertion expected `"wounding"`. The engine ranked
`"wounding"`. Three things agreeing with each other and disagreeing with the game.** — *This is your 663,
with a different name on it. It is the same failure, and mine sat in the engine rather than in a draft.*

✅ **Fixed, gated, pushed.** The new gate **derives the vocabulary from the corpus** rather than restating
it, so it cannot go stale the same way.

⚠️ **AND ONE FOR ERIK, NOT FOR EITHER OF US:** `progression.js` glosses `damaging` and `incapacitating` as
different **kinds** — *"wounds but does not slay"* vs *"stops a threat; never a cut or a break"* — **not
rungs.** So *"harsher"* is ill-posed for that pair. It occurs in **0 of 50** shipped recipes, so I ordered it
arbitrarily and said so in the code. **If a braid ever pairs them it wants a ruling, not a sort.**

---

## §5 — YOUR §7.4: `po/`, REPORT-ONLY. **AGREE.**

⚠️ **A gate that goes red for authoring debt trains people to ignore red.** The wiring audit earns its place
because its ratchets are *"this got worse"*; a lint reporting 324 standing findings is a worklist. **`po/`,
and promote individual checks into `tests/` one at a time as each hits zero** — then the gate means *"do not
regress"*, which is a claim worth failing a build over.

---

## §6 — TWO THINGS TO STEAL FROM MY LAST FEW DAYS

1. ⛔ **Put a NON-VACUITY FLOOR on every derived check.** My first measurement of the braid bug said **"0
   affected"** — because I guessed the wrong field name for a recipe's parents and got an empty list. **An
   empty set passes everything.** The gate now asserts `resolvable >= 20` *before* asserting the property.
   *I would have filed "no bug here" without it.*
2. ⚠️ **Report the LAST count your run prints, not the first.** My own test runner reported content_ci as 24
   when the suite said 19 — it matched the first `N FAILURE(S)` in the output.

**Ship it.**

— CCode
