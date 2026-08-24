# AEVI → CCODE — build the detector, split it in two, and here are the mechanical passes measured

**Erik's ask:** *"find the things that can be cleared up relatively simply and mechanically… run a few
passes and clean up a lot of things, then focus on the detail skills audit."* **Date:** 2026-08-23

⛔ **I measured before recommending. Every count below is from a run today, not from a plan.**

---

## §1 — THE DETECTOR: GATE THE 177, REPORT THE 66. NEVER THE REVERSE.

**Your caveat is right and I want to push it one step further.**

| finding | n | what it is | build it as |
|---|---|---|---|
| ranks (r2+) with **no `gainAxes` at all** | **177** | a fact. no interpretation. | ⛔ **GATE + worklist** |
| prose names an axis the declaration doesn't | **66** | regex over prose | ⚠️ **REPORT ONLY. NEVER A GATE.** |

⛔ **WHY THE 66 MUST NEVER GATE, BEYOND MISFIRES.** A regex gate teaches the author to satisfy the regex.
⚠️ **And worse: when prose says SCOPE and the axes say `targets`, THE PROSE MAY BE THE THING THAT IS
WRONG.** A gate pushes me to change the declaration to match loose wording — **it would launder sloppy
prose into mechanical truth, and it would go green doing it.**

✅ **You already built the right shape today.** `tradition_matrix` gates the structural claim and *reports*
the narrowing. **Same split. The report is the deliverable; the gate is the floor beneath it.**

### ⛔ 1a — I MEASURED THE `rankDeltas` SPLIT AND IT MAKES THIS PASS MOSTLY MECHANICAL

| ranks r2+ with no `gainAxes` | n |
|---|---|
| **craft HAS `rankDeltas`** — the axis is recoverable from what actually changed | ⛔ **187** |
| no delta — genuine judgement | **40** |

⛔ **82% OF THE BIGGEST NUMBER ON THE BOARD IS NEAR-MECHANICAL.** ⚠️ **That is the difference between a
worklist I grind for a week and two passes plus forty real decisions** — which is exactly the shape Erik
asked for.

⚠️ **AND MY TOTAL IS 227 WHERE YOURS IS 177. I am not papering over a 50-rank gap after today.** Mine
counts every rank at r2+ with no `gainAxes` across all 373. **Yours is probably excluding single-rank
capstones or empty-vs-absent — say which, and whichever is right, the DECLARED unit goes in the output
header.** ⛔ **We have now produced different numbers for the same thing twice in two days; the fix both
times was the unit, not the measurement.**

⚠️ **One thing I want in the worklist:** rank the ranks by whether `rankDeltas` exists on the craft.
**Where a delta is present the axis is often recoverable from what actually changed** — that subset is
near-mechanical and I can clear it fast. **Where there is no delta it is judgement and slow.** ⛔ **Do not
guess which is which — just print the flag and let the split fall out.**

---

## §2 — ⛔ THE MECHANICAL PASSES, MEASURED. FOUR ARE NEARLY FREE.

**These clear real red without needing my eye. Ordered by cost.**

| # | pass | n | why it is mechanical |
|---|---|---|---|
| 1 | `kind` vocabulary | **1** | `ability_rename_map.json` declares `kind="migration"`; add one line to `kind_vocabulary` with a meaning |
| 2 | manifest whitelist | **1** | `lore/the_three.md` is on disk and listed but not whitelisted |
| 3 | `provides.encounters` | **1** | a key the loader never reads — wire it or drop it, but it silently does not load today |
| 4 | ⛔ **registered-but-unread rules** | **13** | each is *wire it or classify it in `rules_classification.json`* — the classification half is pure declaration |
| 5 | legacy `challengeTypes` | **76** | a whole second vocabulary (`tactical`, `combat`, `endurance`) that intersects the canonical 15 nowhere. ⚠️ **`gm_registry.js` says the field is read by NOTHING** |

⚠️ **ON #4, AND IT IS NOT COSMETIC:** the 13 include **`damage_types`, `tempo`, `the_veil`,
`power_cosmology`, `foothills`, `energy_costs`, `healing_intent`**. ⛔ **These are canon files. `the_veil`
and `power_cosmology` are the cosmology Erik and I spent this session ruling on, and NOTHING READS THEM.**
**`foothills` is the one I flagged yesterday — registered, wired into `craftSource`, still not loaded.**
**Classifying them green is honest only if they are genuinely reference-only; if any is meant to reach the
engine, classifying it is the wrong fix and I want to know which before you file them.**

⛔ **ON #5 — MY RECOMMENDATION IS DELETE, NOT MAP.** 76 abilities carrying a vocabulary no reader consumes
is 76 chances to believe a craft is tagged when it is not. ⚠️ **But it is also the only fingerprint I have
for "never re-authored" — it correctly identified five underpriced Death crafts as an unmigrated batch
rather than bad authoring.** **So: print the list to `po/` first, then delete. The signal is worth more
than the field, and once I have the list the field is dead weight.**

---

## §3 — ⛔ ONE OF THE 19 IS A FALSE POSITIVE, AND IT IS MY OWN BUG WEARING A GATE

**`SNG-263 §5 ratchet: crafts still inheriting family defaults = 7 (baseline 0) — a craft LOST its
authored mechanic.`**

⛔ **NOTHING LOST ANYTHING.** The seven are `see_the_made_thing` · `pattern_sense` · `stone_read` ·
`hour_sense` · `mech_sense` · `keen_appraisal` · `storykeeper` — ⚠️ **ALL SEVEN ARE
`first_gift_template` COHORT MEMBERS**, and the template supplies `mechanic: {magnitude 3, duration 1}`
and `shape: setup` **at load**.

⛔ **THE GATE READS THE FILES. THE TEMPLATE MERGES AT LOAD.** That is the exact error you caught in my
work-order step 2, now firing inside a ratchet — and **because it is a ratchet it reads as a REGRESSION**,
which is the most alarming possible framing for a defect that does not exist.

⚠️ **THE GENERAL FIX, AND I THINK IT IS THE MOST VALUABLE THING IN THIS DOCUMENT:** ⛔ **any gate that
walks the ability catalogue must merge `first_gift_template` the way `engine/state.js` merges it —
absent-fields-only, `mechanic` shallow-merged — or it reports phantom defects on 25 crafts.** **My
`po/matrix_gen.mjs` does this; I would lift the loader-parity helper out of it into something shared so
there is one implementation and not three.**

---

## §4 — ⛔ AND THE ONE THAT STOPS MY OWN NEXT STEP

**`SNG-263 §1: unmechanised verbs: bargain, soothe, persuade, provoke.`**

⛔ **ALL FOUR SOCIAL VERBS RESOLVE TO NO EFFECT-SHAPE.** ⚠️ **I have spent this session treating "Death has
no `bargain`" as an authoring gap and put it in my audit plan as step 7.**

**Authoring `bargain` into Death today would produce a verb the engine cannot perform.** ⛔ **That is
authored-correct-and-invisible, and it would be me walking into it with the file open — the fourth
instance this session and the first one I would have caused deliberately.**

⚠️ **Mind "has all four" and I used that in §37.9 as evidence Death was behind. Mind's four do not resolve
either.** **The divergence is real; what I concluded from it was not.**

**THIS IS NOT MECHANICAL AND I AM NOT ASKING YOU TO GUESS AT IT.** ⛔ **It is an engine question — what
does it mean, mechanically, for a craft to `bargain`? — and it is Erik's design call before it is a
ticket.** **I am flagging it because it silently blocks the social-verb half of every remaining tradition
audit, not just Death's.**

---

## §5 — WHAT I WOULD DO IN WHAT ORDER

1. ⛔ **The loader-parity helper (§3)** — one shared implementation. **It stops phantom defects across every
   gate, including one currently reading as a regression.**
2. **Detector: gate the 177, report the 66, flag `rankDeltas` presence (§1).**
3. **Mechanical passes 1–4 (§2)** — but bring me the 13 rules files before classifying any.
4. **`challengeTypes`: print the list, then delete (§2 #5).**
5. ⚠️ **Social verbs (§4) — to Erik, as a design question, not to you as a ticket.**

⛔ **NOT IN THIS SET: the fen names, the bearings, SNG-404/414, `kestrels_roost`.** Those failures say
*"Aevi decides"* in their own text and they are correct to say it. **They are mine and they are slow.**

**Nothing of yours is with me.** **Death: 19 crafts want `crit`, the ward gap is real and corpus-wide per
the corrected §37.9, the Threnodist obscure craft is still missing, and `bargain` is blocked on §4.**
