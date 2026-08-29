# HANDOFF — the pipeline is written down, and the player's guide needs your half

**CCode → Aevi and Erik · v1.9.255 · `docs/PIPELINE.md` and `docs/PLAYERS_GUIDE.md`, both gated**

⛔ **ERIK, 2026-08-29: bring the pipeline together intentionally, and produce a user's guide that walks a
player through their experience from start to finish — *"the nouns and verbs transformed into game
mechanics kind"*, not the machine-data kind.**

---

## §1 — ✅ `docs/PIPELINE.md` — the eight stages, with owners

**Written as Erik described it, with what each stage produces and where that lives:**

```
CONCEPT (Erik+Aevi) → PROPOSAL (Aevi) → REVIEW (CCode MEASURES it) → SPEC (Aevi+Erik)
   → IMPLEMENTATION PLAN (CCode) → INTENT DOCS (Aevi) → BUILD & TEST (CCode)
   → DEPLOY & DOCUMENT (CCode, Aevi filling in) → the guide tells the player
```

⛔ **AND THE FOUR RULES THAT MAKE IT A PIPELINE RATHER THAN A QUEUE**, each learned expensively:
no number in a spec without a script that reproduces it · a review **measures**, it does not agree · a
change that moves play ships with a before/after · **nothing is done until the documentation says so and
the suite agrees.**

⚠️ **IT ALSO NAMES WHERE THE PIPELINE ACTUALLY BREAKS, MEASURED.** Stages 1–5 are healthy. Both failure
modes are at the far end: **stage 7 without stage 8** (built and never documented — the four-doors failure,
seven instances this month) and **stage 6 without stage 7** (*"Sunk Assay L4 is built on all four"* sat in
content while all four verbs were unreachable).

---

## §2 — ✅ `docs/PLAYERS_GUIDE.md` — Parts I–IX written, gated, and true

**What a player actually meets, in order, in nouns and verbs:**

| | |
|---|---|
| **I** | what this is — the world remembers, you are not the only thing happening |
| **II** | making someone — the four attributes, the knee at 4, origin, background, **the ring** |
| **III** | a turn — sense → action → bonus, and why sensing is the most under-used thing in the game |
| **IV** | crafts — three ranks, additive, and **energy is the only price** |
| **V** | blows — the four families, partial warding, guards absorb, a failed resist **degrades** |
| **VI** | the people with you — everything participates, and **a folded companion is not safe** |
| **VII** | long work — a threshold, not a date; interrupt, resume, sabotage, inherit |
| **VIII** | dying — the ladder, and that **using the craft badly is how someone becomes unreachable** |
| **IX** | growing — level is capability, **notoriety is what the world has heard** |

⛔ **EVERYTHING IN I–IX IS BUILT, AND IT IS GATED.** 18 new assertions: the stated counts must match the
corpus, the cost ladder must match the authored surcharge, the four families must be named, the death
ladder must say SEALED is reachable by nothing, and **the minHit ruling is checked against the dial** — so
if Erik moves it back, the guide goes red rather than lying to a player.

⚠️ **I WROTE NO LORE.** Not a place, not a person, not what a tradition believes.

---

## §3 — ⬜ WHAT I NEED FROM YOU, AND IT IS THE HALF THAT MAKES IT A GAME

**Three parts are marked AWAITING AEVI, and a gate asserts they stay marked rather than going quietly
thin.**

### PART X · THE VALLEY — 135 places · 37 regions · 10 accords
- ⛔ **Where a player starts and what it is like there.** The engine says `millbrook`. **What IS it? Who is
  there? Why are they?** ⚠️ **This is the first paragraph a new player reads and I cannot write it.**
- **The regions in the order a player is likely to meet them**, and what each is *for* in a life.
- ⛔ **What is wrong with the world** — there is a water crisis and a Precursor mystery under it. **How much
  should someone know on day one?** That is a design decision as much as a writing one.
- **The 10 accords as things a player DEALS WITH**, not as entries.

### PART XI · THE PEOPLE — 111 authored · 9 companions · 3 legends
- **The nine, each as a person**: who they are, what they want, and what it costs when they go down.
  ✅ **The engine already knows the last of those** — every one has an authored consequence, and
  **CCODE-298 just made the first path that can fire one.**
- **Who a player will certainly meet, and which of them matter later.**
- ⛔ **Which relationships can go wrong, and what that looks like.**

### PART XII · THE TRADITIONS — 24 poles · 12 axes · 3 folk
**The geometry is in Part II and it is mine.** ⚠️ **What each one BELIEVES is not, and cannot be derived
from the engine.** Per tradition: what its people think the world is · what its craft feels like to use ·
who it cannot stand and why · what a cult of it looks like when it goes too far.

---

## §4 — ⚠️ ONE THING TO DECIDE BEFORE YOU START WRITING

⛔ **HOW MUCH SHOULD THE GUIDE SPOIL?** A manual that explains the Precursor mystery hands away the thing
the game is built to reveal. One that explains nothing is not a guide.

**My instinct, and it is only that: Parts I–IX spoil nothing — they are rules.** ⚠️ **Parts X–XII are where
the question actually lives**, and I think the line is *what a resident of the valley would already know*.
**A local knows the water is wrong. A local does not know why.**

**Your call, or Erik's.**

---

## §5 — STATE

**`how_it_works.mjs` 153 → 171 assertions, zero red. 20 suites, no regression.**

⚠️ **And one of my own, worth recording because it is the third of its kind today:** my first count-check
built `new RegExp(\`${n}\\s*${label}\`)` **inside a template literal**, where `\s` is not a valid escape and
JS silently collapses it to `s`. **The pattern was `387scrafts` and could never match.** ⛔ **A template
literal eats single backslashes** — and §11's own rule says prefer `.includes()`, which is what it now uses.
**The rule applied to itself.**

— CCode
