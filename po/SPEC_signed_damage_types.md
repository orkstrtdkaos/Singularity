# SPEC — damage types have POLARITY, and the engine already carries it

**Aevi → Erik and CCode · 2026-08-24 · Erik: *"Life and decay are the descriptors of the SAME DAMAGE TYPE
but in + and − directions. Harm and heal are similar for vitality. Does this help?"***

⛔ **YES, AND IT COLLAPSES WORK RATHER THAN ADDING IT.**

---

## §1 — THE ENGINE ALREADY DOES SIGNED DAMAGE

**`skill_battle.js:1075`, in CCode's own words:**

> *"NEGATIVE amount with `absorbed` set, rather than quietly becoming zero and reading as a miss."*

⛔ **`absorb` IS THE NEGATIVE DIRECTION OF A DAMAGE TYPE, ALREADY IMPLEMENTED AND ALREADY TESTED.** ⚠️ What
is missing is not machinery — **it is the VOCABULARY saying that is what it is.**

---

## §2 — THE MEASUREMENT THAT MAKES THE CASE

| | |
|---|---|
| `decay` — the ending direction | **3 crafts** |
| `living` — growth turned against | **2 crafts** |
| ⛔ **healing-shaped crafts — the ADDING direction** | ⛔ **26 crafts, ALL UNTYPED** |

⚠️ **THE NEGATIVE HALF OF THE LIFE AXIS HAS TWO TYPES. THE POSITIVE HALF HAS NONE.** ⛔ **26 crafts do a
typed thing and carry no type, so nothing can ward, resist, absorb or invert against healing — which is
exactly the hole §48.5 fell into when Erik ruled that healing HARMS the undead.**

---

## §3 — THE MODEL

**A damage type is an AXIS WITH A SIGN, not a one-way effect.**

| axis | **−** | **+** |
|---|---|---|
| ⛔ **life** | `decay` — an ending hastened | ⛔ **healing — currently untyped, 26 crafts** |
| ⛔ **vitality** | taking | giving |
| light | — | radiance at intensity |
| feeling | grief as force | ⚠️ **is comfort the + of this? Threnody suggests yes** |

**AND `vitality` IS THE CONSERVED CASE: − here and + there in the same act.** ⚠️ **That is why Draw Down
needed a type nothing else had — it is the only craft that fires BOTH SIGNS AT ONCE.**

---

## §4 — ⛔ WHAT IT EXPLAINS THAT WE HAD AS SPECIAL RULES

1. ⛔ **HEALING HARMS THE UNDEAD (§48.5) STOPS BEING A SPECIAL RULE.** An undead's affinity on the life axis
   is INVERTED — so `+life` lands as harm and `−life` lands as mending. ⚠️ **One affinity value replaces a
   bespoke rule, and `absorb` already expresses exactly this.**
2. **GREY HAND BOLSTERING THE UNDEAD is the same fact**, not a second special case.
3. **WITHER MENDING A NEAR-EMERGED COCOON is the same fact again.**

⛔ **THREE INVERSIONS WE AUTHORED SEPARATELY TODAY ARE ONE PROPERTY OF ONE AXIS.**

---

## §5 — THE ASK, AND IT IS ERIK'S FIRST

⚠️ **This is a vocabulary change to `damage_types.json`, so it wants ruling before building:**

1. ⛔ **Does healing get a type?** **[A] It must** — 26 crafts, and without one nothing can ward or invert
   against it.
2. **Do `living` and `decay` collapse into one signed axis, or stay two names for two directions?**
   ⚠️ **[A] KEEP BOTH NAMES.** *"Growth turned against — root, bloom, choking green"* is not the positive
   direction of decay; **it is its own thing.** ⛔ **The axis is `life`, and `decay` is its minus. `living`
   is a separate axis about GROWTH.** **Erik should overrule me if he sees it differently, because this is
   the one place the model could over-collapse.**
3. **Is `vitality` still needed as its own type?** ⛔ **YES — it is the only CONSERVED one**, and
   conservation is a property no single-signed type has.

**NOTHING BUILT. `draw_down` and `consumed_wound` carry `vitality` and `death_ward` answers it; that stands
whichever way this is ruled.**
