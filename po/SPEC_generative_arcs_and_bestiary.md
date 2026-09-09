# SPEC — the generative engine finishes: arcs that succeed arcs, and a bestiary with a kit

**Author:** Aevi (PO) · **2026-09-08** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**subject:** generative-pipeline, bestiary
> Erik: *"The generative engine is made to be able to **create arcs, especially upon completion of other
> arcs.** Tie this work into getting that engine fully up to speed and wired in… Also, with the NPC
> generation path, we should look at the **bestiary — it needs an equivalent treatment.**"*

---

## §1 — ⛔ MEASURED: THE ARC BRANCH IS THE LEAST-FINISHED THING IN `generate.js`

**`GEN_TYPES = ["npc", "location", "arc", "creature", "item"]`.** ⚠️ **Compare two of them.**

**The CREATURE stub — born whole, and its comment says why:**
```js
// even the STUB must be born whole — a stubbed monster still has to be FIGHTABLE, or the fallback
// path quietly reintroduces exactly the hollow creature the contract exists to ban.
tier: context.tier || "riffraff",   // NOT notable: an unearned stub should be the least dangerous thing
pressures: ["KNOW (read what it is)", "WARD (keep it off you)"]   // real crafts, not flavour
```

**The ARC stub:**
```js
scale: "local", pressure: "medium",
tendency: `a tension local to ${loc.name}, untended it hardens`,
hingeNpcs: [],  ifIgnored: "it festers, unwatched",  ifEngaged: "someone patient could turn it"
```

⛔ **EVERY ARC IT MAKES SAYS THE SAME TWO SENTENCES, whatever it is about, AND NOBODY IS IN IT.**
⚠️ **R49 already ruled against exactly this shape for mysteries** — *"a hook without a story behind it is a
debt"* — ⛑ **and the arc generator is where that debt is minted.**

---

## §2 — ⛑ CORRECTED TWICE BY ERIK, AND THE SECOND CORRECTION FOUND THE ENGINE

> **Erik: *"The successor shouldn't just be the defeated argument's side — it can also include the WINNING
> side's argument, EVOLVED. And I'd look for the QUEST WAKE ENGINE to see if you can use its
> infrastructure."***

### ⛔ AEVI'S §2 WAS WRONG TWICE OVER

**She wrote: *"the successor is the defeated argument, carried by the people who lost it."*** ⚠️ **Half a
mechanism, and she then proposed building it from scratch.**

⛑ **`engine/wake.js` IS THIS, ALREADY BUILT.** Its own header:

> ⛔ *"SNG-204: the WAKE ENGINE. A resolved SIGNIFICANT outcome leaves a wake — a structured,
> **generation-ready trace of what changed and which way it pushes the world** — and the world CONTINUES
> from it. Before this, consequences landed durably and then stopped: `quest_seed` pinned 'A thread opens…'
> that nothing ever opened. **This closes the loop.**"*

### ⚑ AND IT ALREADY ANSWERS ERIK'S FIRST CORRECTION, IN A FIELD

**`createWake` records `dir` — the SIGN of the push:**
```js
const dir = arcEffect ? (Math.sign(arcEffect.delta ?? arcEffect.dir ?? 1) || 1) : 1;
```
⛔ **THE DIRECTION IS ALREADY CAPTURED.** ⚠️ Aevi's *"the defeated argument"* is `dir < 0` and nothing else —
⚑ **the winning side evolved is `dir > 0`, and the engine has been recording which since SNG-204.**

**And `wakeGenerationContext` already names all three outcomes:**
> ⚑ *"Author the consequence the LORE IMPLIES — **a faction reacting, a place coping, A PERSON SEIZING THE
> MOMENT** — never arbitrary new content."*

⛔ **A PERSON SEIZING THE MOMENT IS THE WINNING SIDE, EVOLVED, AND IT WAS ALREADY WRITTEN.**

### ⚑ WHAT THE WAKE ENGINE ALREADY HAS THAT AEVI WAS ABOUT TO RE-SPEC

| built | |
|---|---|
| ⚑ **`MAX_WAKE_DEPTH = 2`** | ⛔ **a consequence of a consequence of a consequence STOPS** — the runaway guard she had not thought of |
| ⚑ **`decayWakes`** | ⚠️ **an untended wake fades and closes unspawned** — *"the world moves on"* |
| ⚑ **idempotency** | one wake per `(quest, outcome)`, and `markWakeSpawned` marks on ATTEMPT so a failure is never an infinite retry |
| ⚑ **`connectsTo` + `wakeArcPushes`** | ⛔ **the cheap path: a wake leans on neighbouring arcs without any model call at all** |
| ⚑ **`WAKE_TIERS` / `WAKE_GEN_SCALES`** | ⚠️ **rarity is enforced** — *"a world that wakes on everything means nothing"* |
| ⚑ **`arcPressure` threaded into `generate`** | ⛔ **no new prompt plumbing needed** |

### ⬜ SO THE ASK SHRINKS TO ONE QUESTION

⛔ **PHASE 2 IS THE GAP, AND THE HEADER SAYS SO: *"The EXPENSIVE path (a model call minting a full new quest
FROM a wake) is SNG-204 Phase 2 and reads these open wakes."*** ⚠️ **`eligibleWakes` returns them. Does
anything consume it?**

### ⛑ AND IT IS NOT A FOURTH DOOR EITHER. IT IS WIRED, AND IT ALREADY MINTS ARCS.

**`app.js:4641`, in the world tick:**
```js
await runWakeGeneration({ character, content: CONTENT, worldDay: absoluteWorldDay(),
  generateFn: async (wakeCtx) => generate("arc", { ...wakeCtx, character, location, … })
});
```

⛔ **A RESOLVED OUTCOME LEAVES A WAKE, THE WAKE IS ELIGIBLE, AND THE WAKE MINTS AN ARC.** ⚠️ **Erik's entire
ask — *"the generative engine is made to be able to create arcs, especially upon completion of other
arcs"* — IS BUILT, WIRED AND RUNNING.**

⛑ **AEVI SPECCED A MECHANISM THAT EXISTS END TO END, AND THEN PROPOSED BUILDING IT.** ⚠️ **She read
`generate.js` for the arc STUB, found it thin, and concluded the pipeline was missing** — ⛔ **without ever
searching for the thing that CALLS it.** ⚑ Erik: *"I'd look for the quest wake engine."* **He knew.**

---

## §2b — ⬜ SO WHAT IS ACTUALLY LEFT, AND IT IS §3

⛔ **THE STUB IS THE WHOLE PROBLEM AND IT IS THE ONLY PROBLEM.**

⚠️ **The wake gives the generator a rich context — the pressure, the source arc, the neighbours it presses
on, the direction it pushed** — ⛑ **and then `stubEntity` fills every unanswered field with
`hingeNpcs: []`, *"it festers, unwatched"* and *"someone patient could turn it."***

➡️ ⛔ **A GOOD CONTEXT MEETING A BOILERPLATE FLOOR.** ⚑ **Every arc the wake engine has ever minted carries
those two sentences**, and R49 says why that is a debt rather than a hook.

⬜ **So §3 is not a nice-to-have alongside a new mechanism. §3 IS THE WORK.**

## §3 — ⬜ AND THE ARC STUB MUST BE BORN WHOLE, LIKE THE CREATURE ONE

⚑ **Copy the creature branch's discipline verbatim:**

| ⛔ required at stub time | ⚠️ why |
|---|---|
| ⚑ **`hingeNpcs` NON-EMPTY** | **R49.** ⛔ Somebody is doing this. ⬜ **Draw from the region's registered people before inventing one** |
| ⚑ **a `regions` field** | ⚠️ **no arc in the corpus has one** — and a local arc that does not name its place is not local |
| **`scale` from the prompt, not defaulted** | ⛔ `"local"` on everything is how six arcs became world-3/regional-2/local-0 |
| ⚑ **stages with DIFFERENT text** | ⛔ *"it festers, unwatched"* on every arc is the `_strike`/`_guard` fallback wearing prose |
| ⚑ **an `arcAffinity` direction** | ⚠️ which pole it pushes toward — **`tradition_epics` already carries this field and arcs do not** |

---

## §4 — ⛔ THE BESTIARY: SAME ONE-FIELD SHAPE, ONE TIER OVER

**MEASURED — 28 entries:**

| | |
|---|---|
| ⚑ **with a `tier`** | **28 of 28** |
| ⚑ **with `pressures`** | **28 of 28** |
| ⛔ **with a `level`** | ⛔ **0** |
| ⛔ **with `domains` or a kit** | ⛔ **0** |

⛑ **THIS IS EXACTLY THE NPC FINDING AGAIN.** ⚠️ **The NPCs were 40-of-40 at level 1 for want of `tier`;
the beasts HAVE tier and want `level` — and `tierFloor` already maps one to the other.**

⬜ **So the chain is already built and one link is missing:**
```
tier → tierFloor → LEVEL → 30+5/level health, 100+5/level energy, breakAtPressure
```

### ⚑ AND A BEAST'S KIT IS ITS `pressures`, ALREADY AUTHORED

⛔ **`pressures: ["KNOW (read what it is)", "WARD (keep it off you)"]` NAMES CONTRIBUTION FAMILIES** — ⚠️ **the
same 43-tag → family map that gave the coliseum champions their archetypes.**

⛑ **A beast does not need `domains`.** ⚠️ **It is not a person and the bestiary's first law says so** —
⛔ **it needs a declarable move set, and `pressures` is that list already written.**

⬜ **`family:harm`-style archetype rows already exist. A beast's class should map the same way:**
`manifested_creature` · `feral_construct` · `substrate_warped_beast` · `made_weapon` ·
`great_manifestation` · `narrowed_dead` — ⚑ **six classes, six kits, and the fiction of each is distinct.**

⚠️ **AND TWO CLASSES ALREADY HAVE ENGINE MEANING:** `deathSave.notForClasses` bars `feral_construct` and
`made_weapon` — ⛔ **so the classes are already load-bearing and nothing else reads them.**

---

## §5 — ⬜ ORDER

| # | | who |
|---|---|---|
| **1** | ⛔ **beast `level` from `tierFloor`** — one link, and every beast in the game currently fights at whatever `personOpponent` invents | CCode |
| **2** | ⚑ **class → kit archetypes**, mirroring the contribution-family rows | ⚠️ **Aevi authors the six, CCode wires** |
| **3** | ⛔ **the arc stub born whole** (§3) | CCode |
| **4** | ⚑ **`succeedArc`** (§2) | CCode |
| **5** | ⬜ **six local arcs, authored, deliberately away from the valley** | Aevi |

---

## §6 — ROUND 2 QUESTIONS

1. ⛔ **Does a successor arc need Erik's approval before it goes live?** ⚑ **Aevi's read: NO for local,
   YES above regional** — ⚠️ **a generated world arc is a claim about the whole setting, and the same
   instinct that put a ceiling on tiers belongs here instead.**
2. ⚠️ **Can an arc succeed itself at a larger scale?** ⛔ **Aevi says no by default** — ⚑ **but The Green
   Schism sealing the wood plausibly escalates, and Erik may want the door.**
3. ⬜ **Do beasts grow?** ⚑ **`growthFor` grows people from deeds.** ⚠️ **A great manifestation that has
   been fought twice and survived is arguably harder** — ⛔ **but the bestiary's law says a beast has no
   story, and growth is a story.**
