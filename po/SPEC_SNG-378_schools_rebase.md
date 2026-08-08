# SNG-378 — The schools exist, and they are built on the superseded source list

**Author:** Aevi (PO) · **Date:** 2026-08-08 · **Origin:** Erik — *"we need a complete list of the
schools — it's not just about traditions, but also a combination of power sources."*
**Status:** measurement + rebase proposal

---

## §0 — WE BUILT THIS ALREADY, AND THE DEFINITION IS ALREADY ERIK'S

`content/packs/core/rules/schools.json` (SNG-193, Erik-ruled 2026-07-19) opens:

> *"A tradition has a ROOT; a school is what that root reaches WITH. Same tradition, same abilities,
> different extension source, different best-ground. **A school NEVER grants exclusive abilities — the
> moment it does it becomes a subclass and the tradition fractures.**"*

⛔ **That is precisely what Erik asked for today — tradition × power source — and it shipped three weeks
ago.** ⚠️ **And the no-exclusive-abilities rule is the load-bearing part**: it is what keeps schools from
multiplying the catalogue, which matters enormously given SNG-373.

**Measured state:** 67 schools across **24 of 26 traditions** · mean 2.8 each (7 have two, 15 have three,
2 have four) · ⛔ **missing: `bargainers` and `god_named`** — the same two that had no visual aesthetic
until yesterday. **Those two traditions keep falling out of every sweep and that is itself a finding.**

---

## §1 — ⛔ THE REBASE: schools use the OLD four-source vocabulary

| schools.json uses | Erik 2026-08-08 |
|---|---|
| `lattice` (root 8 · ext 10) | ⚠️ **splits** — Precursor lattice vs **nanite**, now ratified separate |
| `material` (root 9 · ext 13) | → **body & technique** |
| `inherent` (root 4 · ext 17) | → **metaphysical** |
| `wild` (root 3 · ext 3) | → **wild nanite** (unchanged) |
| `null` — the PURE school (24) | ⛔ **KEEP.** Erik: *"the pure never loses because it never leaned on anything."* |
| — | ⛔ **MISSING: nanite** as an extension distinct from lattice |
| — | ⛔ **MISSING: veil** as an extension |

**Two real gaps, and both matter:**

**§1a — `nanite` has no school anywhere.** Erik today: *"the God-Named use nanites from pre-transition,
mostly."* ⚠️ **There is currently no way to express that** — they would have to be filed as `lattice`,
which under the new canon is a different thing built by different beings. **And god_named is one of the
two traditions with no schools at all**, so the tradition that most needs this vocabulary has none of it.

**§1b — `veil` has no school, and it should be rare and expensive.** ⚠️ **A veil-extension school is a
tradition that reaches by opening a breach.** Numinous obviously. Abyssal probably. ⛔ **It should NOT be
widely available — most traditions should not have this school, and its absence is characterisation.**

---

## §2 — WHAT ERIK'S COSMOLOGY DOES TO THE SCHOOL MODEL

**Erik: *"an ancient disagreement between two entities of the same race who followed different paths…
some people don't care and they braid the two to great effect."***

⛔ **So a Precursor-extension school and a Veil-extension school are not enemy camps. They are two
inheritances of one argument, and declining to inherit it is a legitimate position.** ⚠️ **That kills my
"treason" framing from SNG-377 §2d, and Erik is right that it was oversimplifying.**

**It also means the school layer is where the leaning lives, not the tradition layer.** Two Seraphics of
different schools may have less in common than a Seraphic and an Abyssal of the same one — **the
Instrumented of any tradition share a supply chain, a vocabulary and a set of enemies.**

⚠️ **That is the answer to Erik's *"therefore, leanings about who you like or dislike"*: animus should key
on SCHOOL as much as tradition**, and I had it filed at the tradition level in SNG-377 §4. **Amending
that — the grievance belongs wherever it is actually earned, and "you reach with the thing that took my
sister" is a school-level sentence.**

---

## §3 — THE WORK

1. ⛔ **Rebase the extension vocabulary** onto the ratified sources: `precursor · nanite · wild ·
   metaphysical · body · veil · null(pure)`. **A rename plus two additions — 67 rows, mechanical.**
2. **Author schools for `bargainers` and `god_named`** — ⚠️ god_named is *"nanites, mostly, some wild,
   some lattice"*, which is now three schools that write themselves.
3. **Add `veil` schools** where the fiction earns them. **Deliberately few.**
4. ⚠️ **Then the weighted source mix per tradition (SNG-376) is nearly free** — a tradition's mix is
   largely the distribution of its own schools, and the schools already exist. **I proposed authoring 26
   rows from scratch; most of the answer was already in this file.**
5. **Then animus, keyed on school and tradition both** (§2).

⛔ **CHECK BEFORE ANY OF IT: does `extension` have a consumer?** SNG-193b was a wiring ticket, so probably
— **but I have been caught three times this week authoring into fields nothing reads, and a rename of a
field with no reader is busywork with a commit message.**
