# DECISION — SNG-344: which combination set is canon. ⚠️ NEITHER, AND THAT IS THE ANSWER.
## Aevi (PO) · 2026-08-06 · CCode: "which combination set is canon — merging them is a content decision."

## THE MEASUREMENT FIRST
| | `world/braid_recipes.json` (loaded) | `rules/combination_recipes.json` (dark) |
|---|---|---|
| entries | **7** | **56** |
| shape | keyed dict, `braidKey: "a+b"` | array with `id` |
| fields | `braidKey · name · description` | `id · name · parts · functions · domains · effect · cannot · discovery` |
| overlap | **0 ids in common** | **0** |
**⚠️ ZERO OVERLAP. Neither is a stale copy of the other — they are DIFFERENT SYSTEMS that were never
reconciled, and "which is canon" has no answer as asked.**

## WHAT EACH ACTUALLY IS
**`braid_recipes` is a NAMING table.** `order_sense+palework → "Ashen Meridian"`, with a description of what
the pairing evokes. **It answers: what do you call it when these two crafts meet?** It carries no mechanics —
no parts list beyond the key, no effect, no bound. **It is loaded because the braid generator needs a name.**
**`combination_recipes` is a MECHANICAL table.** `warding_peace = prism_ward + stillcraft`, with `effect`,
`cannot`, `functions`, `domains`, and `discovery`. **It answers: what does the combination DO, what can it
not do, and how is it found?** It is everything the naming table lacks.
**⚠️ SO THEY ARE NOT COMPETITORS. ONE NAMES, THE OTHER RESOLVES.** The live system can tell a player their
braid is called *Shatterlight* and cannot tell them what it does.

## THE DECISION I RECOMMEND
**Keep both. Neither is deleted. `combination_recipes` gets wired as the mechanical layer beneath the naming
layer that already runs.**
1. **`braid_recipes` stays the naming authority** — it is live, it is consumed, and naming is a real job.
2. **`combination_recipes` becomes the effects authority** — 56 authored `effect`/`cannot` pairs are the
   largest body of unreachable mechanical content in the project, and **the braid system is visibly missing
   exactly what they provide.**
3. **⚠️ THE JOIN IS THE WORK, AND IT IS MINE.** They key differently — `"a+b"` versus `parts: [a, b]` — and
   **have no ids in common**, so nothing merges automatically. I will author the crosswalk: for each of the 7
   named braids, the matching mechanical recipe; for the 56 mechanical recipes, a name.
4. **Neither file is canon over the other. The PAIR is canon**, and that should be stated in both so the next
   person does not ask this question again.

## ⚠️ WHY THIS WAS INVISIBLE, AND IT IS PARTLY MY DOING
CCode found the existing gate skipped any file whose own `kind` was not `"rules"` — **and `kind` is free text
the author typed.** Nine files opted out by declaring `emergence`, `world_structure`, `social_mechanic_spec`.
**I wrote several of those `kind` values**, choosing descriptive words because they read better in the file.
**A field I treated as a label was load-bearing for a gate**, and my accuracy in naming a thing is precisely
what removed it from the check.
**That is the same failure as `oneWay` and `condition`'s "ENGINE-TESTABLE" promise, from the other side:
there I trusted authored text to describe engine behaviour; here I authored text that CHANGED engine
behaviour without knowing it did.** ⚠️ **The lesson is one sentence: in a content-driven engine there is no
such thing as a purely descriptive field.**

## AND ON `martial_paths`
`baselineDefense` — **every character can defend itself with no build investment** — is a real mechanic with
no code honouring it. **That is the same class as the missing skills**, and it lands on the same complaint
Erik opened with: a new character being a walking disaster. **I would sequence it directly after SNG-339.**
