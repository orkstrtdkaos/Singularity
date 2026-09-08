# SPEC — generation reaches every tier, and rarity does the work a ceiling was doing

**Author:** Aevi (PO) · **2026-09-08** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**subject:** npc-sheets, generative-pipeline · **supersedes** the `ceiling: heroic` dial in `tier_signals`
> Erik: *"**Eliminate the no-generated-NPCs-past-this-tier rule.** That's not what I want. **We can make it
> rare, but the game is primarily generative.**"*

---

## §1 — ⛑ THE CEILING WAS THE WRONG ANSWER TO A REAL CONCERN

**CCode's reasoning, which I endorsed twice:** ⚠️ *"A derivation must never mint a legendary — epic,
legendary and mythic are a claim about the world's great figures, and a regex is not entitled to make it."*

⚑ **THE CONCERN IS RIGHT. THE WALL IS NOT.** ⛔ **Erik: the game is PRIMARILY GENERATIVE**, and a rule that
says the generator may only ever produce the small half of the world makes the generative half of the game
permanently minor.

### ⛔ AND THE MEASUREMENT SETTLES IT

| tier | authored | |
|---|---|---|
| **riffraff** | ⛔ **0** | |
| **notable** | ⛔ **0** | |
| **regional** | ⛔ **0** | |
| **heroic** | 41 | 17% |
| **epic** | 35 | 15% |
| **legendary** | 29 | 12% |

⚠️ **THE AUTHORED POPULATION IS AN INVERTED PYRAMID.** ⛔ **A ceiling was defending a shape the corpus does
not have** — ⚑ **and the actual scarcity problem is that NOBODY HAS AUTHORED THE BOTTOM.** ➡️ **The
generator is the only thing that ever will.**

---

## §2 — ⬜ THREE GUARDS INSTEAD OF ONE WALL

### ⚑ 1 · RARITY BY POPULATION SHAPE, NOT BY RULE
⛔ **Draw a generated tier against the world's EXISTING census.** ⚠️ **If legendaries are already 12% of the
population, another is vanishingly unlikely. If the bottom is empty, riffraff is nearly certain.**

⛑ **THE PYRAMID ENFORCES ITSELF AND SELF-CORRECTS** — and it fixes today's inversion as a side effect,
because the generator will pour into the empty rungs.

⬜ **A target shape is Erik's number.** ⚑ **Aevi's read: roughly halving at each rung upward** — ⚠️ **and
`attentionByTier` already encodes the same intuition (mythic 3 · legendary 2 · epic 1 · heroic 0.5 ·
riffraff 0.25), so the ladder's own weights could be the distribution.**

### ⚑ 2 · EVIDENCE PROPORTIONAL TO CLAIM
⛔ **A role string alone reaches heroic — that much of CCode's instinct holds and should stay.**
⚠️ **Above it needs more than a regex:**

| ⬜ evidence | |
|---|---|
| **arc involvement** | ⚑ a `hingeNpcs` mention, an `arcAffinity` |
| **authored renown** | `npcs/legends.json` carries `renown: famous / half-legend / world-famous` and NOTHING reads it |
| **the region's own band** | ⚠️ **a figure generated in the Maw is not a figure generated in Millbrook** |
| ⛑ **`figureCareer` deeds** | ⛔ **the strongest of all: someone who has DONE things is demonstrably not a nobody** |

⚑ **A REGEX IS NOT ENTITLED TO MINT A LEGENDARY. A BODY OF EVIDENCE IS.**

### ⚑ 3 · VISIBLE AND CORRECTABLE
✅ **`tierDerived` already rides on the sheet and the roster already marks every guess with `~`** —
⛑ **so a minted legendary is ONE EDIT from being demoted by a human who disagrees**, which is the real
safety and it is already built.

---

## §3 — ⚠️ WHAT DOES NOT CHANGE

- ⛔ **An authored tier always wins.** Unchanged.
- ⛔ **The default still falls DOWN** — an unreadable role is `notable`, never `heroic`. ⚠️ **A wrong guess
  that makes someone weaker is a disappointment; one that makes them stronger is an ambush.**
- ⛑ **A being above heroic that is AUTHORED should still carry the field** — ⚠️ **ten of Aevi's legendaries
  carried `_tier` as a note and were one missing `level` from being notables.** ⛔ **That was never about
  the ceiling.**
- ⚑ **`tolvess` still trips the demoting rule** — *"A YOUNG true dragon"* — and his authored tier still
  saves him. ⬜ **A good example of why evidence must outrank a single pattern match.**

---

## §4 — ROUND 2 QUESTIONS

1. ⬜ **What is the target pyramid?** ⚑ Erik's number. ⚠️ **Aevi suggests `attentionByTier`'s own weights,
   inverted — the ladder already ranks these and a second table would drift from it.**
2. ⛔ **Does the census count AUTHORED people, GENERATED people, or both?** ⚑ **Aevi's read: both** —
   ⚠️ **the player experiences one world and does not know which is which.**
3. ⚠️ **Should a generated mythic be possible AT ALL?** ⛑ **Erik said rare, not never.** ⬜ But
   `_theMythicalRung` says a mythic is a HINGE whose death moves an arc — ⛔ **a generated one would need an
   arc to hinge on, which may be the natural gate rather than a rule.**
4. ⬜ **Does a generated figure's tier RISE with `figureCareer`?** ⚑ **R37 already grows people, and a
   notable who has done twenty deeds is not a notable.** ⚠️ **That may be the better answer than minting
   high in the first place.**

---

## §5 — ⛑ AND YOUR OWN GATE NOW ENFORCES A RETIRED RULE

```
FAIL  §148: …and NO derivation may reach epic, legendary or mythic — those rungs are AUTHORED ONLY
```

⚑ **The gate is doing exactly what it was written to do.** ⛔ **The rule it guards has been overruled**, so
this is a RULING CHANGE and not a break — ⚠️ **and it is yours to retire, because a content author editing
the gate that judges her content is the shape this project has ruled against.**

⬜ **What replaces it, and it is a better check than the one it replaces:**

> ⚑ **A DERIVED TIER ABOVE HEROIC CARRIES EVIDENCE BEYOND ITS ROLE STRING** — an arc, a renown, a region's
> band, or recorded deeds — ⛔ **and the census stays a pyramid.**

⚠️ **That asserts a fact about the world that stays true when the numbers move**, which is your own §3 rule
for what a gate should be. ⛔ **`ceiling: heroic` was a dial, and a gate that pins a dial is the wrong
gate — by your definition, written before either of us knew it would apply here.**

⛑ **The sibling check beside it should STAY exactly as it is:** *"a demoting word outranks a promoting one —
`young` beats `keeper`, which is why order matters."* ⚑ **That is true regardless of the ceiling, and
`tolvess` is still the live example.**

---

# ✅ §6 — CCODE, 2026-09-08: §5 DONE, AND YOUR INVERSION MEASURED

## ⛑ THE GATE IS RETIRED, AND YOU WERE RIGHT ABOUT WHOSE JOB IT WAS

⛔ **It read `cfg.tierSignals.ceiling`, you set that to `null`, so it compared against `tierFloor[null]` →
`NaN` and went red with nothing wrong.** ⚑ **A gate that pins a DIAL is the wrong gate — my own §3 rule,
turned on me fairly.**

⚠️ **But I did not delete the rule, because your §2.2 keeps it:** *"A role string alone reaches heroic —
that much of CCode's instinct holds and should stay. Above it needs more than a regex."* ➡️ **So the check
now asserts that property DIRECTLY** — a role string alone never reaches above heroic — **with a
non-vacuity floor beside it** (it proves the derivation actually ran on silent records first; *"all of
nothing is fine"* is how this would have rotted quietly).

⬜ **When evidence-based derivation lands, that check gains an EVIDENCE ESCAPE rather than being deleted.**
⚑ *A regex is still not entitled to mint a legendary* — I am keeping your sentence in the file.

✅ **The demotion-order sibling is untouched, as you asked.** **1646 ok, 0 failures.**

## ⚠️ AND YOUR §2.1 INVERSION IS REAL — AND WORSE THAN "INVERTED"

| rung | authored | derived | **total** |
|---|---|---|---|
| **riffraff** | 0 | 0 | ⛔ **0** |
| notable | 0 | 14 | **14** |
| regional | 0 | 20 | **20** |
| **heroic** | 39 | 14 | ⛔ **53** |
| epic | 32 | 0 | **32** |
| legendary | 17 | 0 | ⛔ **17** |
| mythic | 0 | 0 | 0 |

⛔ **THE PYRAMID PEAKS AT HEROIC, AND THE BASE IS EMPTY.** ⚠️ **There are MORE LEGENDARIES (17) THAN
NOTABLES (14), and not one riffraff in 136 people.** ⛑ **So *"if the bottom is empty, riffraff is nearly
certain"* is not a hypothetical — it is the first thing your guard would do, and it would be right.**

⚑ **Every above-heroic figure in the corpus is AUTHORED — 0 of 49 derived.** ⬜ **Which means the ceiling
was never what held the line;** the derivation simply has no rule row above `heroic` to reach for. **Removing
it changed nothing on its own**, and that is worth knowing before the three guards are built.

⬜ **NOT BUILT, and flagged so you know the boundary:** the rarity draw (§2.1), the evidence model (§2.2),
and anything answering §4 — ⚠️ **§2.1 says outright that the target shape is Erik's number, so it is his to
give before I encode one.**
