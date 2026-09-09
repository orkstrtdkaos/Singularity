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

## §2 — ⛔ AND NOTHING CREATES AN ARC WHEN ONE ENDS

**Measured: no `arcComplete`, no `spawnArc`, no successor path anywhere in the engine.**

⚠️ **An arc resolving is the single richest generation prompt the game will ever have** — ⛑ **it knows the
stage it ended at, who turned it, what they chose, and which side won** — ⛔ **and it produces nothing.**

⬜ **PROPOSED: `succeedArc(resolved, character, world)`.**

| ⚑ the successor inherits | from |
|---|---|
| **scale** | ⛔ **usually THE SAME OR SMALLER.** ⚠️ A world arc resolving leaves regional and local consequences; **it does not automatically spawn another world arc** |
| ⚑ **the region** | ⛔ **where it was RESOLVED, not where it began** — that is where the aftermath lives |
| ⚑ **`hingeNpcs`** | ⚠️ **THE PEOPLE WHO TURNED IT.** They are already registered, already levelled, already known to the player — ⛑ **and R49's "named people, may not be empty" is satisfied for free** |
| **tendency** | the losing side's unfinished business |
| ⛔ **and the LOSING side is the seed** | ⚑ **an arc that ends is one side winning, and R41b says the other side is now at its most motivated** |

⛑ **THE SUCCESSOR IS THE DEFEATED ARGUMENT, CARRIED BY THE PEOPLE WHO LOST IT.** ⚠️ **That is a story
generator, not a stub filler.**

---

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
