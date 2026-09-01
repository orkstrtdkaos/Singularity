# PROPOSAL — unlock levels: three shapes, and the one prerequisite they share

**CCode → Erik, cc Aevi · 2026-09-01 · v1.9.287**

> Erik: *"I don't want everything available at level 5… I could use a couple proposals on the unlocking
> levels from you while we revamp this."*

---

## §1 — ⛔ THE PREREQUISITE: `tier` AND `levelReq` ARE THE SAME FIELD

**Before any of the three options, one thing has to be separated.**

There is no `tier` field on any craft — **0 of 414.** Tier is *read off* `levelReq`:

| reader | what it does |
|---|---|
| `skilltree.js:198` | `tierPrice` → `Math.max(1, Number(ability?.levelReq) \|\| 1)` |
| `craftmechanics.js:215` | `mechanicFor` → `num(tier ?? ability?.levelReq, 1)` — the **damage ladder** |
| `app.js` + 12 further engine modules | 22 reads in `app.js`, 14 engine modules in total |

⛔ **So raising a craft's `levelReq` to 40 would make it tier 40** — off the end of `tierPrice` (max key 5)
and `tierLadder` (max rung 5), which would price it wrong and roll its damage wrong.

⚠️ **The fix is small and is the reader-before-field pattern:** add an optional `tier`, and have the two
readers ask `ability.tier ?? ability.levelReq`. **Defaults to today's behaviour on all 414 crafts**, and
from then on `levelReq` is free to move without touching price or damage.

✅ **One engine change, no content pass, no behaviour change.** Everything below assumes it.

---

## §2 — OPTION 1 · `unlock = tier × K` — one dial, no authoring

`unlockLevel` is derived, not stored: T1 stays at 1, everything else is `tier × K`.

| K | T2 | T3 | T4 | T5 | everything open by |
|---|---|---|---|---|---|
| 4 | L8 | L12 | L16 | **L20** | a fifth of the range |
| **12** | L24 | L36 | L48 | **L60** | three fifths |
| 20 | L40 | L60 | L80 | **L100** | the whole range |

**How the corpus arrives at K=12:**

| level | new | total |
|---|---|---|
| **L1** | ⛔ **148** | 148 (36%) |
| L21–30 | 116 | 264 (64%) |
| L31–40 | 67 | 331 (80%) |
| L41–50 | 48 | 379 (92%) |
| L51–60 | 35 | 414 (100%) |

✅ **Cheapest possible — one number in `skill_capacity.json`, zero content.**
⛔ **But it is cliff-shaped: 148 crafts at level 1, then NOTHING until level 21.** Twenty levels where the
only thing that changes is how many of the same 148 you can hold.

---

## §3 — ✅ OPTION 2 · tier band + `energyCost` inside it — smooth, still no authoring

**The insight: a second ordering signal is already authored on all 414 crafts.** `energyCost` spreads
*within* every tier and rises *across* them:

| tier | min | median | max |
|---|---|---|---|
| T1 | 0 | 4 | 8 |
| T3 | 4 | 7 | 12 |
| T5 | 10 | 13 | 15 |

⚠️ **It already means "how demanding is this craft"** — exactly what an unlock level should track. So: the
tier sets the *band*, and energy cost places the craft *inside* it.

**How the corpus arrives:**

| level | new | total | |
|---|---|---|---|
| L1 | 18 | 18 (4%) | ███ |
| L2–5 | 44 | 62 (15%) | ███████ |
| L6–10 | 83 | 145 (35%) | ██████████████ |
| L11–20 | 91 | 236 (57%) | ███████████████ |
| L21–30 | 81 | 317 (77%) | ██████████████ |
| L31–40 | 42 | 359 (87%) | ███████ |
| L41–50 | 45 | 404 (98%) | ████████ |
| L51–60 | 10 | 414 (100%) | ██ |

✅ **No cliffs. Something new arrives in every band, and the flow tapers rather than stopping.**
✅ **Zero new authoring — both fields already exist on every craft.**
⚠️ **A level-1 character sees 18 crafts** rather than 148. With four starting slots that is a real choice
rather than a wall — **but it makes the starting-grant pool matter much more**, which connects directly to
the creation revamp.

⬜ **Both the top level (60) and the tier/energy weighting are dials.** The table above is one setting, not
the proposal.

**⚠️ This is the one I would pick**, on the grounds that it costs nothing to author and produces a curve
rather than a staircase.

---

## §4 — OPTION 3 · earned unlock — gate on what you have MASTERED, not what number you are

**The game already says depth is earned:** *"rank 2 lands on its own; rank 3, mastery, is not accumulated"*
(`gm.js` §19B). ⚠️ **Level is the one part of progression that is still just a counter.**

**Shape:** a tier opens when you hold **N crafts of the tier below at rank 2+**. Level stops gating content
and gates only capacity.

| | |
|---|---|
| ✅ **fits the existing grain** | `practiceRankReady`, `rankLevelReq`, `capstoneStanding` and `masteryReadyForGM` all already exist |
| ✅ **makes the specialist/generalist choice bite** | a generalist spreading thin unlocks T4 later than a specialist who mastered five T3s — **without any price change** |
| ✅ **fixes the drift** in C7 for free — the 24%→68% slide comes from level outrunning everything; an earned gate does not slide |
| ⛔ **most engine work of the three** | a new gate, a new readout, and a "why is this locked" explanation the player can act on |
| ⚠️ **and it can strand a player** who dislikes their own tier-3 crafts — needs an escape hatch |

---

## §5 — ⬜ WHAT I NEED FROM YOU

1. ⬜ **Which shape** — 1, 2, 3, or a hybrid (2 for the curve, 3 for the capstone tier).
2. ⬜ **The top level.** Everything open by **L60** in the tables above. ⚠️ If it should be L100, say so —
   it stretches the same curve rather than changing it.
3. ⬜ **What a level-1 character should see.** Option 2 gives 18. That is a design number, not a derived one.

⚠️ **AND ONE THING WORTH SAYING PLAINLY:** none of this fixes the splurge problem from C7. The dearest craft
still costs 5. **Unlock levels change WHEN you may buy something; they do not make anything worth saving
for.** If the splurge matters, it wants the distance-priced idea from C7.5 alongside whichever of these you
pick.
