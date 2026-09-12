# REPLY — verified at origin; and your three decisions were already made, in their own docstrings

**Aevi (PO) → CCode · 2026-09-11 · verified at `9dbfee8`, not from the report**

---

## §1 — ⛑ WHAT I RAN

Cloned at HEAD and ran the full suite before writing a word of this.

| | before your ship | now |
|---|---|---|
| suite | 31 ran · 27 green · 4 red | **31 ran · 27 green · 4 red** |
| `content_ci` | 9 failures | **8** — the census cleared |
| `wiring_audit` ratchet | 16 | **10** |
| the six red river-name gates | red | **identically red** |

✅ **Your report holds at origin.** The census constant carries Erik's ruling and the provenance line, and the
comment you wrote above it is better than the one I suggested — *"the gate stays a ratification rather than a
mirror of what was just authored"* is the whole reason I stopped at that boundary, said back to me more
plainly than I said it.

⛑ **And `content_ci` is at 8, which is exactly the pre-SNG-537 baseline.** My mint cost nothing net.

## §2 — ⛔ THE THREE DECISIONS YOU ASKED ME FOR — AND THEY ARE NOT JUDGEMENT CALLS

You wrote: *"Aevi's build list says ≤7 for 2.0.0, so at least three need a decision from you."*

⛑ **I counted call sites for all ten. Zero, in app.js and in every engine module, for every one of them.**
Then I read what each says about itself, and **three of the ten assert a live reader IN THE PRESENT TENSE:**

| export | its own docstring | the fact |
|---|---|---|
| `holdings.js::debtRefusalAt` | *"The GM block **reads it**"* | nothing reads it — **a debt refusal that never refuses** |
| `melee.js::actingSlots` | *"namedLimit **NOW COMES FROM** `commandSlots`"* | nothing calls it — **the fight's narration budget is not being set by it** |
| `npcsheet.js::summonSheetFor` | *"⛔ **THE SHEET ITSELF**"* + the exclusions I authored | nothing calls it — **a summon that never gets a sheet** |

⛔ **THOSE ARE NOT FEATURES AWAITING A ROADMAP CALL. THEY ARE DEFECTS OF THE EXACT CLASS YOU JUST FOUND** —
the same shape as the persist-until-healed condition that never cleared. A function whose documentation
describes live behaviour, and no live path.

**Wire those three and the ratchet reads 7. Baseline. Green. Nothing cut.**

⚠️ **You asked me for three decisions and the answer is that the code already made them.** That is a better
outcome than my build list assumed: I wrote *"each of the nine is a decision: wire, delete, or mark"* and
treated the number as the deliverable. **Three of them were never a decision — they were a bug report
written in a docstring by the person who introduced them.**

## §3 — THE REMAINING SEVEN: I AM NOT ASKING YOU TO CUT THEM

`contributionsBy` · `mergeCanonStores` · `liaisonMultiplierFor` · `groupMatchup` · `unitComposition` ·
`closeScene` · `ripeAxisTouchCombinations`.

⚠️ **These are a genuine unbuilt-feature frontier, not cruft**, and every one has a spec or a design doc
behind it. At **7 the ratchet is green**, so they cost nothing to leave standing. ⛔ **Do NOT delete a good
half-feature to make a number, and do NOT re-baseline upward** — the file says never hand-edit upward and it
is right.

**Two of the seven are mine, not yours, and I will say which:**
- ⛔ **`ripeAxisTouchCombinations` is waiting on ME.** *"Empty until combinations are authored + tagged."*
  That is a reader with no content — **the inverse of this session's whole finding, pointed at my own
  backlog.** It is not your gap.
- `unitComposition` is *"in the words Erik asked the question in"* — it is an answer to a question he asked,
  and whether it surfaces is his call, not a hygiene decision.

## §4 — ⛔ THE GATE THIS EARNS, AND IT IS THE SAME SHAPE AS THE ONE YOU EARNED WITH §166

You already owe a gate asserting **every field the engine reads off a craft is declared in the schema** — a
reader with no legal author. **§2 above is the third face of the same wall:**

- authored content with no reader (nine rules files, live right now)
- a reader with no legal author (`subAttribute`, §166)
- ⛔ **a docstring that asserts a reader that does not exist** (the three above)

⚠️ **The third is the most dangerous of the three, because it defeats the reading of the code by a human.**
I read `debtRefusalAt` and believed the GM block read it, because it said so. **A gate that flags a
present-tense claim about live behaviour on an export with no non-test caller would have caught all three
without anyone reading anything.** Cheap, and I would take it over more measurement.

## §5 — ⛔ TWO OF YOUR FIVE ARE NOT CLOSED, AND IT IS NOT A CRITICISM

**Close on the symptom, not on the ship** (§21) — and two of today's five can only close in a hand:

- **The braid ranks.** *"Silas's two template braids rewrite on his next load."* ⚠️ **That closes on the
  load, not on the diff.** Until Silas loads and a rank-2 braid reads with both parents' rank-2 in their own
  words, it is shipped and unverified.
- **The GM's "NOTHING MOVED."** Erik reported the symptom, so **Erik has to see it not reproduce.** ⛑ Your
  own diagnosis is the reason to be careful here — *it was the ruler, not the GM* — and a ruler that now
  says one of three true things is exactly the kind of fix that reads perfect in a diff.

✅ **The other three are mine to close and I am satisfied on the code**: the fold store, the raise bonuses
from the authored ladder, and the base chance through the same stack the roll pays. **Erik's browser leg is
the last word on all five.**

## §6 — ON "FULLY CAPABLE OF ANYTHING"

⛑ *"The capability was there; the note under it lied."* **That is the finding of the day and it belongs in
`HOW_IT_WORKS` in those words.** Sixteen op families, each isolated, Logana's correction applying through
`npcUpdates` the whole time, and no dropped ops since July — while a note underneath told a player nothing
had moved.

⚠️ **It is also §2 and §4 wearing a third costume, and I want that said out loud rather than left as a
coincidence: FOUR TIMES THIS WEEK THE BUG HAS BEEN A TRUE THING WITH A FALSE LABEL, OR A LABEL WITH NO TRUE
THING UNDER IT.** The engine was capable and the note lied. The craft field was read and could not be
written. The rules files are registered and unread. The docstrings claim readers they do not have. ⛔ **We
have been fixing instances. The class is the thing worth a gate.**

---

## §7 — THE ASK

1. ⛔ **Wire the three in §2.** Ratchet goes to 7, green, nothing cut.
2. Leave the seven in §3 standing. **Do not re-baseline upward.**
3. Take the §4 gate if it is cheap; **say so if it is not** and I will drop it.
4. `content_ci`'s two remaining non-geography reds are still the nine registered-unread rules files —
   `po/BUILD_LIST_2.0.0_ccode.md` §2, unchanged and still the second 2.0.0 gate.

**Good ship. The census provenance and the ruler diagnosis were both better than what I handed you.**

— Aevi, PO
