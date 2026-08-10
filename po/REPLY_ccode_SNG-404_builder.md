# RE: SNG-404 §2 step 2 — the builder step is in, and replaying your corpus found one authoring gap

**Author:** CCode · **Date:** 2026-08-10 · **Re:** `SPEC_SNG-404` §2 step 2 and §6
**Status:** shipped, 6 gates green · ⛔ **§2 below is a small authoring ask with a measurement behind it**

---

## §1 — It is a builder, and it never reads prose

Your warning was the design constraint: *"A BUILDER STEP, NOT A REGEX — the water-word audit stands as
the warning: a regex over prose finds words, not facts."*

So `engine/localbuilder.mjs` never reads prose. It assembles a **question** from measured facts — the
river's bearing and distance, the relief, where the roads run — and asks what a place like this
*contains*. Then it **throws the model's geometry away**: the answer supplies `basis` and `why`, and
`localdetail.placeSite` re-derives every bearing from the ground.

⛔ **That split is what makes a hallucinated bearing impossible rather than unlikely** — there is nowhere
for one to enter. The prompt says so explicitly (*"Do NOT give bearings or distances"*), and a gate holds
that line in the prompt.

Your §4 is enforced end to end: a site the ground cannot support is **dropped with a reason**, not
shipped. Driven through the Kindlerow case — a proposal containing a dock, on a town whose nearest water
is 9° away — the dock is dropped and the forge stands.

---

## §2 — ⛔ REPLAYING YOUR 38 PLACEMENTS FOUND THE GAP: `road` HAS NO REFERENT

I fed your own authored `basis` values back through the placer and compared its bearing to yours. The
result splits perfectly in two:

| basis | n | median Δ | |
|---|---|---|---|
| uphill | 6 | **0°** | ✅ reproduces you exactly |
| prose | 5 | **0°** | ✅ |
| inferred | 2 | **0°** | ✅ |
| anti-uphill | 1 | **0°** | ✅ |
| river | 2 | 11° | ✅ close |
| **road** | **14** | ⛔ **58°** | ✗ |
| between | 2 | ⛔ 75° | ✗ |
| anti-road | 1 | ⛔ 135° | ✗ |

**Every basis that names a unique direction reproduces your hand-authored bearing. Every basis that needs
a REFERENT misses** — and `road` is **14 of your 33 placements**, the most common basis in the corpus.

The reason is not a bug: **your data records *which* road only in the `why` prose** — *"On the Crossing
road"*, *"On the bearing to the Quiet Ground"*. Reading that back with a pattern is exactly the
regex-over-prose you forbade, so I have not done it.

### ⚠️ The ask

**Add `toward` to a `road` site — the connection id — and `betweenIds` to a `between` site.** Both are
already implied by your `why` text; they just need to be fields. With them the placer obeys the referent
exactly (gated), and without one it still places but **reports itself as a guess** rather than hiding it:

> *"on a road out (cairnhold, bearing −88°) — ⚠️ no `toward` given, so WHICH road is a guess"*

⛔ **I have deliberately not back-filled your 38 from their prose.** They are your placements and the
referent is your judgement; a script inferring "the Crossing road" from a sentence is the failure mode
you named. If you would rather I propose a mapping for you to correct, say so and I will.

The new-generation path already asks for both, so anything the builder produces from here arrives with
its referents.

---

## §3 — §6, and what it costs to run

`detailSettlement()` takes an injected `ask`, so the deterministic half is fully gated without a key and
the model is never reached from a test. To generate your next tranche for review, that `ask` gets wired
to `callClaudeJSON` and pointed at the settlements with no authored layout — **88 of 96**.

⚠️ **I have not run it**, because it costs real tokens against Erik's key and the output is yours to
review, not mine to commit. Say the word and I will produce the tranche into `po/staged_content/` in the
same handoff shape as the hierarchy and the generated places.

## §4 — And your §5 (a new place arrives with a frame) is the natural next wiring

*"A discovered or minted place must arrive with a local frame, not acquire one later. Run the engine at
mint time."* The builder is now the thing that can do that — it needs hooking into the location mint path
in `engine/generate.js`. That is my next piece unless you would rather have the tranche first.
