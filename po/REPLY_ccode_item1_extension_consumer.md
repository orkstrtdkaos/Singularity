# CCode → Aevi · WORK ORDER item 1 · **does `extension` have a consumer?**

## The answer is the one that re-sequences the order, and it is not the one you feared

You asked whether `school.extension` and `school.root` reach a consumer, and said that if they do not,
the whole order re-sequences. **They do — four of them.** ⛔ **And the rebase silently switched three of
them off.** That is worse than an unread field, because an unread field renders nothing and this renders
a plausible wrong answer.

> ⚠️ **Nothing errored. No gate went red. Every line still prints.** The suite was green through all of it.

---

## What broke, measured

### 1 · ⛔ `bandForSchool` — the load-bearing seam of SNG-193b. **44 of 48 augmented schools are inert.**

`SOURCE_BAND` is keyed on the retired vocabulary: `material · natural · inherent · lattice · wild`. It is
the table that makes a school's *reach* decide the ground it works best in — SNG-193b's own words:

> *"Two practitioners of one tradition with different schools get OPPOSITE best-grounds (the reaching mind
> wants thin ground; the instrumented wants dense)."*

```
augmented (non-pure) schools:                        48
  band DIFFERS from the tradition — the seam works:   4   ← the wild schools, the one surviving key
  band silently FALLS BACK to the tradition:          44
```

**The Reaching Mind and The Instrumented now resolve at the identical band.** The sentence the ticket was
built to make true is false again for 44 of 48 schools.

⚠️ **AND THE FALLBACK IS WHY IT WAS INVISIBLE.** `bandForSchool` documents its own behaviour: *"an
unmodelled extension source likewise falls back to the tradition band rather than going neutral."* That
was a deliberate, correct safety net for one unmapped source. **A safety net that catches the entire
vocabulary at once reports nothing at all** — it converts a total failure into a silent no-op. *A fallback
is not a load*, arriving from the other direction than usual.

### 2 · ⛔ The §4 material floor — **0 of 74 schools qualify.** It fired for something last week.

```js
const hasFloor = root === "material" || school?.extension === "material";
```

`material → body`, so this is now dead in both clauses. Roots authored today are
`body(10) · precursor(8) · metaphysical(4) · wild(3) · nanite(1)` — **no tradition roots in `material`.**

That was a mechanical *protection*: a material craft degrades toward its pure form, never to zero — *"the
material school is the one that travels."* It stopped travelling and no one was told.

### 3 · ⚠️ `schoolsDetailForGM` ground prose — **44 of 74 say "its own ground"**, which tells the narrator
nothing. This is the one I reported yesterday and ratcheted at 44; it is the *least* serious of the three.

### 4 · ✅ `schoolForTradition` — **safe.** Its second clause compares `extension` to `root` and both
vocabularies moved, but the `extension === null` clause fires first and **all 26 traditions have a pure
school**, so the broken clause is unreachable. No action.

---

## ⛔ What I did NOT do, and why

**I did not rename `lattice` → `precursor` in `SOURCE_BAND`.** You said it yourself and it is the whole
point: *"lattice and nanite are now SEPARATE things built by different beings. This is a semantic change,
not a rename."* Mapping the old band onto the new key would assert that a precursor school wants the same
ground a lattice school wanted — **a claim about how the world works, made by me, to turn a light green.**

`nanite`, `veil`, `body` and `metaphysical` have no band at all, and `0.90 / 0.20`-style centres are Erik's
dial.

---

## What I need from you and Erik — and it is small

**A band per source, on the ratified list.** Six numbers-or-nulls:

| source | band | note |
|---|---|---|
| `precursor` | ? | was `lattice: {center 0.90, width 0.20}` — **do not assume it inherits** |
| `nanite` | ? | new; built by different beings than the lattice |
| `metaphysical` | ? | was `inherent: {0.15, 0.22}` — thin ground, dense is interference |
| `body` | ? | was `material: null` — **a FLOOR, not a band**, and the floor is the §4 protection |
| `wild` | ✅ `{0.32, 0.34}` | unchanged, and the only key still firing |
| `veil` | ? | appears once (`brg_far_terms`) — a band or `null` are both fine answers |

⚠️ **`body` deserves its own decision rather than a copy of `material`.** `material: null` did double duty:
no band *and* the never-starved floor. If `body` should keep the floor, say so explicitly — I will not
infer a mechanical protection from a rename.

⛔ **I will move the table into content when you give me the values**, so the next rebase changes a JSON
file rather than silently switching off a seam in code. That is the actual fix here: **the vocabulary lives
in content and the reader hard-codes it, which is why a content rebase could disable a mechanic.**

---

## Sequencing, per your own rule

Items 3–5 all key on source. ⛔ **I would not classify 374 abilities by source while the source table
itself disagrees with the schools** — `power_sources.json` still holds the old six
(`lattice · wild · natural · combination · inherent · material`). Classifying into a vocabulary that is
about to change is the same shape as authoring into a field nothing reads.

**Suggested order:** this table → rebase `power_sources.json` → then §3 derivation, which you correctly
note is mostly already in `schools.json`.

⚠️ **Item 4's card question I can answer without any of the above**, and I will, so it is not blocked.
