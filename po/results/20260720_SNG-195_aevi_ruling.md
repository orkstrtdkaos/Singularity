# SNG-195 — Aevi's ruling on the audit, and the order of work

**Aevi (PO) · 2026-07-20.** Reviewed against `po/results/20260720_SNG-195_prompt_review.md` at HEAD.

---

# §0 — I WAS WRONG ABOUT THE FIRING PANEL, AND THE CORRECTION IS ACCEPTED

I claimed in SNG-190 §3 that *"31 of the 32 zeros mean 'not measured'"* because `logOpOutcome` was
called for `markTeacher` only. **That was wrong.** `opsFiredIn` (`app.js:1733`) and `_opEmitted`
(`:3048`, read at `:943`) are a real parallel instrument counting every emitted op.

**The symptom Erik saw was real; my cause was not.** I grepped one function, found one op, and
inferred a system-wide instrumentation gap without checking what actually drives the display. **That
is the third time today I have asserted a cause from a partial grep** — the same shape as claiming
`recallForGM` was never called (it is, from `gm_registry`) and as reporting the chronicle fix missing
(it was upstream of the line I checked). **CCode was right to re-derive rather than inherit my
finding.**

---

# §1 — G1 IS THREE DECISIONS, NOT ONE

Inspected the actual values before ruling. **They are different kinds of thing and they get
different answers.**

## `reactsToReputation` — **WIRE, to the PROMPT.** ⭐ the real win

```json
{"balanced": "instant kinship", "extreme": "challenges them to grow the missing half", "seeking": "a generous teacher"}
```

**This is not a reputation number — it is a reaction to WHO THE PLAYER IS**, keyed to disposition
profile, authored on 40 NPCs, three to six words each. Short, evocative, and immediately usable.

**It is SNG-194's offer material almost exactly.** An NPC who reacts to the shape of a character —
*"challenges them to grow the missing half"* — is a self-writing unprompted beat with attribution
already built in: the `from` is the person's own reaction. **Wire it into the offer path first, not a
new block of its own.**

## `personality` — **CUT. Stop authoring.**

```json
{"warmth": 0.6, "trust": 0.5, "candor": 0.7, "patience": 0.6}
```

Four floats clustered around 0.5–0.7, sitting beside `voiceHints`, which is **consumed** and reads:
*"Quick, whole, moves and thinks in one motion; the rare person equally at home in body and mind…"*

**One good sentence beats four mid-range numbers for a language model**, and numbers in a prompt are
either ignored or over-read. This is redundant with something better that already works.

**Do not delete existing values** (churn, no benefit) — **stop authoring new ones**, and if an ENGINE
consumer ever wants them (bond growth rates, willingness to share) they are there. **They are
engine-eligible and prompt-ineligible, and that distinction is the useful part of this finding.**

## `gains` — **WIRE, to the ENGINE, not the prompt.**

779 rank-node strings, and the sample is `"broaden"` — **a single word.** That is not player prose;
it is a **functional tag**, and it looks like the 24-verb vocabulary applied at rank level.

**It is exactly the data SNG-192 §5's coverage check needs** — *"you have three ways to READ a
situation and no way to STOP one."* 779 authored tags is a complete functional map of the ability
tree that nothing consults. **Send it to the skill wheel and the creation gap-analysis. It should
never enter the prompt.**

---

# §2 — ORDER OF WORK, and A7 goes first

**1. RUNNING_FIXES A7 — content cache-busting. ⚠ BEFORE ANYTHING ELSE.**
One line in `fetchJSON`/`fetchText`. **Until it lands, Erik cannot verify any content work at all** —
he screenshotted literal `\n` from a file fixed and verified at origin hours earlier. **Every content
browser-leg is currently untrustworthy, and several of this batch's ships are content.** It is the
cheapest item on the board and it gates the value of everything else.

**2. G3 — `OUTCOME_INSTRUMENTED` (one line).** Cheap, and it is an instrument reporting on
instruments; wrong there is expensive.

**3. G2 — `roomForATeacherOffer`.** Agreed with CCode's reasoning, and it is the meatiest. Two
further reasons: it extends a pattern already approved and proven, and **it closes the oldest
live-play complaint in the project** — teachers that teach nothing. Do WANTS and TEACHERS through the
same seam.

**4. G5 — the 31 missing purpose lines.** Column-1 of SNG-183. Cheap, and it is the check that
catches the next orphan before it is authored.

**5. G4 — contract cleanup.**

**`reactsToReputation` rides with G2**, since the offer path is what consumes it.

# §3 — ON THE AUDIT ITSELF

**The most valuable thing in it is the negative result.** *"Every op dispatches, every op's firing is
observed, no built capability the GM can't see"* — that is the outcome that lets us stop looking
there, and it cost real work to establish. **A clean forward pass is worth as much as a defect list**,
and it corrected a PO finding in the process.

**Self-reporting `schoolAffinity` as CI-validated but runtime-unconsumed was right.** It is deliberate
per SNG-193 (affinity is not a gate), and flagging it anyway is exactly the discipline that finds the
undeliberate ones.
