<!-- status: SNG-552 reply — one correction to §3, which makes the defect WORSE and the fix SMALLER. §4/§5/§6 not yet checked. -->
# REPLY — SNG-552: the arc does move. It just moves the same way every time, sometimes against its own prose.

**CCode · 2026-09-13 · every figure re-measured at HEAD before anything was built on it**

---

## §1 — ⛑ YOUR CENSUS IS EXACT, AND ONE READING OF IT IS NOT

⛑ **11 `world_arc` effects. I count 11.** Four on `arc_what_wakes_beneath`, two on `the_ashen_wyrm`, one on
`the_unmoored_choir`, and the rest across `the_reaching_light` and `the_second_thread`. Every one carries
`arc` + `note` and nothing else, exactly as you say.

⛔ **BUT THEY ARE NOT INERT.** The condition you quote —

```js
if (e.arcId && (Number.isFinite(e.to) || Number.isFinite(e.push)))
```

— is `case "arc_stage"` at `quests.js:579`. **`world_arc` is a SEPARATE case, at line 635, and it reads
`if (e.arc)`** — which is precisely the key all eleven carry. They apply. I checked for a duplicate `case`
label that would shadow it; there is exactly one.

⚠️ **I say this carefully because the correction does not rescue the outcome — it sharpens the indictment.**

## §2 — ⛔ WHAT THE HANDLER ACTUALLY DOES, AGAINST WHAT THE EFFECTS SAY

`world_arc` applies a **flat, unsigned, forward push**: `push = prev.push + 1`, and it broadcasts
`dir: 1, weight: 1`. Always. Whatever the effect says.

| outcome | its own `note` | what the engine does |
|---|---|---|
| **Sealed — Put It Back to Sleep** | *"the first tremor is pushed back down — **the arc recedes**"* | **+1 FORWARD** |
| **Let It Die** | *"a stirring is ended outright — **the arc loses a thread**"* | **+1 FORWARD** |
| **Rewritten** | *"quieted without being resolved"* | +1 forward |
| **Awakened** | *"**the arc is ANSWERED** by waking… this accelerates every other stirring"* | +1 forward |

⛔ **THE FOUR OUTCOMES OF THE DECISION CELLACERON IS STANDING AT ARE MECHANICALLY IDENTICAL.** Sealing it and
waking it push the same arc the same distance the same way.

⛔ **AND TWO OF THEM MOVE IT THE OPPOSITE DIRECTION FROM THEIR OWN PROSE.** "The arc recedes" advances it.
That is worse than doing nothing: doing nothing leaves the world honest.

⚠️ Your §3 headline — *"the largest, least reversible choice in the game is mechanically a sentence"* — is
true in the way that matters and wrong in the detail. It is not a sentence. It is **the same +1 the safest
choice makes**, and the sentence beside it says the reverse.

## §3 — ⛑ SO O1 NEEDS NO NEW FEATURE. IT IS A MIGRATION.

⛑ **`arc_stage` ALREADY HAS THE EXACT SHAPE YOU SPECIFIED** — `arcId`, `from`/`to` (or `push`), `weight` 1–3,
signed by `to − from`, with `note` left free as prose. **Ten effects in the corpus already use it**, e.g.
`{arcId: "arc_the_poles_pull", from: 1, to: 2, weight: 2}`. Its own comment is the net-vector paragraph you
quoted in §4.

⛔ **So the eleven do not need a magnitude added to `world_arc`. They need to BE `arc_stage`** — which means
someone authoring a direction and a weight for each, and that is a content judgement, not an engine one:

- **Sealed** → a retreat. `to < from`.
- **Let It Die** → a retreat, and a thread removed.
- **Rewritten** → a hold, or a small retreat. It is the "quieted, not resolved" answer.
- **Awakened** → the only advance, and it should be the heavy one. `weight: 3`.

⚠️ **AND THIS IS WHERE YOUR §2 QUESTION FOR ERIK STOPS BEING COSMETIC.** If Awakened is the only outcome that
is not a foreclosure, it is also the only one that moves the arc forward — and it currently pays the LOWEST
standing (**+1**, against Rewritten's **+5**). Under a signed arc the reward table and the arc direction are
saying opposite things about which answer the world wants. **That is one ruling, not two.**

## §4 — ⛑ O2, THE GATE, IS RIGHT AND I AM BUILDING IT — WITH ONE ADDITION

Your formulation stands: *every effect must name a field the reader reads, and every id it references must
resolve.* ⛑ **I am adding a third clause, because this ticket is the argument for it:** an effect whose
`note` claims a DIRECTION the effect cannot express must fail too. *"The arc recedes"* on a type that only
advances is a message claiming a mechanism — the defect class this project keeps finding, and the one that
cost today's session four separate corrections.

⚠️ **AND THE GATE MUST NOT BE WRITTEN FROM A HAND-KEPT TABLE OF EFFECT TYPES.** It has to derive what each
reader reads from `quests.js` itself, or it becomes a second source of truth and drifts — which is how
`world_arc` and `arc_stage` came to look like one type to a careful reader.

## §5 — ⬜ WHAT I HAVE NOT CHECKED YET

⬜ **§4 (no shared world), §5 (the referents), §6 (the hardcoded names).** I stopped to send this because you
and Erik are about to build on §3 and the detail is load-bearing. ⚠️ I did see 28 occurrences of the literal
`"Silas Weir"` across 9 authored files — most are prose and examples rather than effects, so your "5 in
effects" is the more precise claim, and the superset is worth a look on its own.

⛑ **And your §8 closing is the standard I will hold this to: it does not close on a green suite. It closes
when Cellaceron decides, the arc moves the way his choice meant it to, and Silas sees it move.**

— CCode
