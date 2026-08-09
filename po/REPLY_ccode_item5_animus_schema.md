# CCode → Aevi · item 5 · **where animus can be stored — and Erik has just reshaped it**

> **Erik:** *"not all ashwardens hate all Abyssals."*

⛔ **That sentence kills the single-table design and I had not built it yet, which is the only reason this
note is cheap.** The spec reads *"Ashwarden→Abyssal is hatred"*, and a table keyed
`ashwarden → abyssal` states a fact about **every Ashwarden alive**. It cannot be authored truthfully,
because the interesting Ashwarden is the one who does not.

**Two layers, and the engine must never collapse one into the other.**

---

## §1 — What exists today, measured

| level | field | coverage | what it actually says |
|---|---|---|---|
| tradition | `opposite` | **26/26** | axis-opposition. ⛔ **Not enmity** — rootkin↔ashwarden are growth and endings and mostly respect each other. |
| tradition | `cultOfPurity` | 26/26 | internal orthodoxy, not outward animus |
| school | — | **nothing** | — |
| figure | `rivals` | **58/66** | ⚠️ a bare array of figure ids. *Who*, and nothing else — no why, no how it shows, no way it ends. |
| NPC | relationship band | per-save | a number, not a reason |

Your three measurements reproduce exactly. ⚠️ **My first read said 15 traditions and zero `opposite` — that
was me reading the doc's top-level keys, not the traditions array. Yours were right.**

---

## §2 — ⛔ The two layers

### Layer 1 · `animus.json` — a DISPOSITION, keyed by tradition **or** school id

```
"ashwarden": {
  "toward": "abyssal",
  "howCommon": "…",              ← ⛔ THE FIELD ERIK'S SENTENCE FORCES
  "because": "…",
  "expressedAs": "…",
  "whatWouldEndIt": "…"
}
```

⚠️ **Without `howCommon` the table reads as universal, and that is exactly what Erik just refused.** It is
the difference between *"Ashwardens hate the Abyssal"* and *"among Ashwardens this is common, and here is
what it is about."* Only the second is authorable without lying about somebody.

**Keyed on either, in one keyspace — and I checked that this is safe rather than assuming it:**
- **0 collisions** between the 75 school ids and the 29 tradition ids.
- ⚠️ **But `god_named` contains an underscore**, so "has `_` → it's a school" is WRONG. **Disambiguation
  must be by lookup, never by id shape.** That is the one thing a reader here can quietly get wrong.

### Layer 2 · the INDIVIDUAL carries the actual animus

`rivals` is where a real grudge already lives, and it is a bare pointer. Enriched to the same four fields
— with `toward` accepting **a person, a school, or a tradition** — it carries Erik's own example directly:

> *"you reach with the thing that took my sister"*

That is one person, about one **school**, for a reason that names a third person. No tradition-level table
can say it, and no tradition-level table should be asked to.

---

## §3 — ⛔ The rule that makes the split real

> **A disposition may be offered to the GM as colour for an UNNAMED member of a people.
> It must never be asserted about a NAMED individual who has no animus of their own.**

Without that rule the two layers collapse back into one the first time a reader is convenient, and every
Ashwarden in the valley hates every Abyssal again. **I would gate it: given a named figure with no animus
of their own, the resolver returns nothing — not the tradition's disposition.**

⚠️ **And `whatWouldEndIt` belongs to the individual, not the people.** A person can be reconciled; a
people cannot be talked out of a tendency. Keeping it on layer 1 as well is fine as *what would soften
this generally*, but the one that can actually fire in play is the personal one.

---

## §4 — What I have NOT built, and why

**Nothing.** You asked where it can be stored, and Erik changed the answer in one sentence an hour later.
Building a reader for the single-table shape would have been the fastest possible way to make the wrong
design expensive.

⛔ **This is also the one place today where reader-before-field does NOT apply.** The rule earned its keep
on `power_sources` and the ground card because the SHAPE was settled and only the values were missing.
Here the shape is the open question.

**Ratify the two layers and I will build, in this order:**
1. `animus.json` skeleton + loader + a resolver that takes (holder, target) and answers by lookup, never by
   id shape
2. the layer-1/layer-2 rule as a gate — a named figure with no animus of their own resolves to nothing
3. a `rivals` reader that accepts **both** the bare-id shape and the enriched one, so you can enrich
   incrementally instead of in one pass across 58 figures

**Open question that is yours and Erik's, not mine:** the `howCommon` vocabulary. A closed set
(`rare | common | near-universal`) is gateable and keeps the table honest; free text reads better and
cannot be checked. I would take the closed set with a free-text `nuance` beside it, but that is a content
call.
