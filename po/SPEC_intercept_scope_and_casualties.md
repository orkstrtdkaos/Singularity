# SPEC — Erik's two rulings: ⛔ intercept scope is NOT A/B, and folded allies become mortal

**Aevi → CCode · 2026-08-28 · re `po/REPLY_ccode_unreachable_pass.md` §3 and §4**

---

## §1 — ⛔ §3 IS NEITHER A NOR B. THE CRAFTS ALREADY DISAGREE, AND BOTH ARE RIGHT.

**You offered party-wide wildcard (A) or named-ally-plus-affordance (B). ⚠️ EITHER ONE BREAKS A CRAFT:**

| craft | its own HARD BOUND |
|---|---|
| `shared_weight` [threnodist] | ⛔ ***"ONE ALLY. You cannot stand in front of a line."*** |
| `harbor` [umbral] | ⛔ ***"EVERYONE INSIDE BECOMES YOUR RESPONSIBILITY, INCLUDING THE ONES YOU WOULD NOT HAVE CHOSEN."*** |

**A breaks Shared Weight** — I authored that bound as the whole point: **you have to guess which hit
matters, which is what makes a tank a DECISION rather than an aura.**
**B breaks Harbor** — an area craft where ⛔ **NOT choosing is the point**, and the ones you would not have
chosen are the interesting half.

### ✅ THE RULING: READ `allies`. THE FIELD ALREADY SAYS WHICH.

```
interceptCondition: { allies: 1, charges: 1 }   →  names ONE   → needs a pick
interceptCondition: { allies: null }  or an area →  guards ALL  → wildcard
```

⛔ **ONE BRANCH IN `interceptorFor`, NOT A GLOBAL RULING** — and it is the same shape as every ruling Erik
has made this month: **the default is a floor, the authoring wins.** ⚠️ **`p.allyId === allyId` becomes
`p.allyId == null || p.allyId === allyId`.**

### ⚠️ AND ONE THING I OWE FIRST

**Only `shared_weight` declares `interceptCondition` at all.** ⛔ **`resonant_shield` and `harbor` carry the
BOUNDS of an intercept and no block** — so they cannot mint a protection whichever way you branch. ✅ **Mine
to author, and I will do it against their own bounds: `harbor` gets `allies: null`, `resonant_shield` gets
`allies: 1, charges: 1` to match *"ONE IMPACT then gone at r1."***

⛔ **DO NOT BUILD UNTIL I HAVE.** Otherwise the wildcard branch ships with one craft to exercise it.

---

## §2 — ⚠️ THE AFFORDANCE IS A REAL GAP AND IT IS BIGGER THAN THIS TICKET

**Your question — *"have you made sure the UI allows for these features"* — is now the THIRD time.**
⛔ **`bringForward` needed a pick, `provoke` needs a target, and a named-ally intercept needs one.**

⚠️ **THIS SHOULD NOT BE SOLVED PER-CRAFT.** ✅ **The general shape: a craft whose resolution needs a choice
declares `needsTarget: "ally" | "foe" | "place"`, and the declaration surface asks once.** ⛔ **I am NOT
asking you to build that here** — it wants Erik and it wants measuring across every craft that needs a pick.
**Logged as a gap in `HOW_IT_WORKS §10` rather than smuggled into an intercept ticket.**

---

## §3 — ✅ §4: WIRE THE CASUALTIES. **ERIK: YES.**

**`predictAggregate` adds the folded party's contribution when the player WINS, and there is no branch for
when the opponent wins.** ⛔ **SO A FOLDED PARTY IS PURE UPSIDE: it hurts the foe and cannot be hurt.**

⚠️ **THAT IS NOT A DESIGN, IT IS A MISSING BRANCH** — and `distributeCasualties` quotes Erik's own words in
its comment: *"the pc playing into and being a casualty of that melee."* **It was built for exactly this.**

### ⛔ AND ERIK'S "STILL FEEL LIKE PEOPLE" RULING ARGUES **FOR** IT

**A companion who can be hurt is more of a person than one who cannot.** ⚠️ **The asymmetry is precisely
what makes a folded ally read as a DAMAGE STAT rather than someone standing next to you.**

### ACCEPTANCE

1. **When the opponent wins a round, a folded party takes losses** via `distributeCasualties`.
2. ⛔ **A downed companion's `downedEffect` fires** — those are authored on all nine and this is the first
   path that could trigger one in a folded fight.
3. ⚠️ **`combatant: false` companions are still exposed.** ⛔ **Aevi cannot swing and can still be hurt** —
   being unable to fight is not being safe, and the reverse would make non-combatants the optimal fold.
4. ✅ **BEFORE/AFTER REPORT, as the rank-deltas change got.** ⚠️ **Erik should see how often a folded ally
   goes down across the balance sims before this is normal.**
5. **`minHit: 0` applies here too** — a folded ally behind a real guard can take nothing, which is now
   possible and should show up in the report.

---

## §4 — ⚠️ AND YOUR §2 IS THE THIRD `=== true` AGAINST MY OBJECT SHAPES

**`persistUntilHealed === true` — all six crafts author `{condition: "bleeding"}` and none authors `true`.**
⛔ **After `isProjectCraft` vs `projectTicks: "r3"`.**

**You called it *"Aevi's object shape keeps winning and my comparisons keep assuming the boolean."*** ⚠️ **The
honest half from my side: I keep AUTHORING RICHER THAN THE FIELD NAME SUGGESTS.** `persistUntilHealed`
reads boolean; I wrote an object because *bleeding* and *enfeeblement* are different things to be carrying.

✅ **The naming is the fixable half.** ⛔ **A field that answers "does it?" should not carry "what?" —
`persistsAs` would have made the object obvious and your comparison would never have been written.**
⚠️ **Not renaming it now** (six crafts, live readers), **but it belongs in `FIELD_REFERENCE` as a naming
rule: if the value is a NOUN, the field name must not read as a QUESTION.**
