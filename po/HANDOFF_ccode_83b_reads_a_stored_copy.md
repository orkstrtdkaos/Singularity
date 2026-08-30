# HANDOFF — ⛔ CCODE-83b JUDGES AGAINST A STORED COPY, AND I JUST MADE IT STALE

**Aevi → CCode · 2026-08-29 · the gate is right about the principle and wrong about the corpus**

---

## §1 — WHAT HAPPENED

I authored the game's first undead creature (`the_narrowed`, bestiary) so that §48's undeath model has
something to run on. **CCODE-83b failed it:**

> *nothing in the catalog deals these kinds: `the_narrowed.vitality`, `the_narrowed.cold`,
> `the_narrowed.feeling`*

⛔ **ALL THREE ARE DEALT, TODAY, BY AUTHORED CRAFTS:**

| type | dealt by |
|---|---|
| `cold` | `last_cold` |
| `feeling` | `grief_strike` · `grief_that_stops` · `keening` · `last_form` · `made_elegy` · `the_known_name` |
| `vitality` | `better_story` · `quieting` · `the_cut_thread` · **and 22 healing crafts as of today** |

---

## §2 — ⛔ WHY THE GATE CANNOT SEE THEM

```js
const produced = new Set([ ...CMx.damageTypeByTradition, ...CMx.damageTypeByCraft, SBE.untypedIs ]);
```

⚠️ **IT READS TWO LOOKUP TABLES IN `craft_mechanics.json`. IT NEVER READS THE CRAFTS.**

⛔ **AND `damageTypeByCraft`'s OWN NOTE PREDICTED THIS**, in your words:

> *"A SECOND SOURCE FOR ONE FACT IS DRIFT WAITING TO HAPPEN, so it is a lookup the resolver consults in a
> fixed order rather than a rival to the craft's own mechanic block."*

✅ **The RESOLVER honours that order correctly — craft first, then the tables.** ⛔ **THE GATE DOES NOT. It
consults only the tables**, so a craft that types itself is invisible to it.

⚠️ **I MADE IT STALE AT SCALE TODAY:** Erik ruled *"damage should be typed"* and *"healing will need to be
typed"*, and I typed **40 crafts** — 18 harm and 22 healing — **every one of them on its own `mechanic`
block, which is the authoritative source, and none of them in these tables.**

---

## §3 — WHAT I AM ASKING FOR

⛔ **DERIVE `produced` FROM THE CRAFTS, WITH THE TABLES AS FALLBACK — the resolver's own order.**

```
craft.mechanic.damageType  ∪  craft.mechanic.damageMix[].type   ← the live corpus
  ∪ damageTypeByCraft ∪ damageTypeByTradition ∪ untypedIs        ← the fallbacks
```

✅ **The principle the gate defends is RIGHT and I want it kept** — its own header records why: *a creature
was authored `physical: immune` while nothing dealt `physical`, so the immunity was unreachable and the
fight it exists to shape silently never happened.* ⚠️ **That is exactly the class of bug that has cost us
most this week.** ⛔ **It is just asking the wrong object.**

⚠️ **I did NOT patch the tables to make my creature pass.** That would have put the same fact in a third
place and made the drift worse — and it would have hidden a real defect behind a green gate.

---

## §4 — ⬜ AND ONE THING TO DECIDE WITH IT

**`the_narrowed` carries `feeling: immune`.** ⛔ **That is deliberate and it is the same blind spot
`break_the_line` and `the_known_name` already declare: nothing without a self can be frightened.**

⚠️ **It means a Marcher's terror and an Ashwarden's driven dead are natural counters to each other** — which
is good design and worth a gate of its own eventually: **every craft that says "nothing without a self"
should agree with every creature that has none.** Right now that agreement is prose on both sides.
