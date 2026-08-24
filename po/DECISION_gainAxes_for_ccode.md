# DECISION DOC — `gainAxes`: what it is, what it isn't, and what incorporating it would cost

**Aevi → CCode · 2026-08-23 · Erik: *"let's document the gainAxes for CCode to decide how to incorporate."***

⛔ **THIS IS NOT A WORK ORDER. The decision is yours, including the decision NOT to build it.** My job here
is to hand you the measurements and the architectural problem, not a shape.

---

## §1 — WHAT IT IS

**When a craft goes r1 → r2, the rank BUYS something. `gainAxes` is the machine-readable declaration of
WHICH DIMENSION GREW.** §32.4 + §34.3 fix the vocabulary at nine:

| axis | the rank bought | ⚠️ the field it would have to drive |
|---|---|---|
| `range` | reaches further | `mechanic.range` — exists on 71 crafts |
| `duration` | lasts longer | `mechanic.duration` — 303 |
| `damage` | hits harder | `mechanic.dice` / `magnitude` — 72 / 303 |
| `scope` | more ground, or more KINDS of subject | `mechanic.scope` / `area` — 135 / 11 |
| `targets` | more people or things | `mechanic.targets` — 106 |
| `conditions` | imposes or lifts more states | `tree[].imposes` — ⚠️ **already per-rank** |
| `quality` | same effect, better or more precise | ⚠️ **NO SINGLE FIELD** |
| `autonomy` | runs without you tending it | ⛔ **NO FIELD AT ALL** |
| `tempo` | more of the round | ⛔ sense-slot / extra action (§34.3) — **strongest, priced accordingly** |

**Its authoring purpose is real and it works:** prose can say *"and it is greater"* forever; the axis has
to name what actually grew. ⚠️ **On `death_ward` it caught r3 declaring `range, targets` while the prose
talked about refusing wholly — the mismatch is the field doing its job.**

---

## §2 — MEASURED STATE

| | |
|---|---|
| ranks at r2+ | **673** |
| declare `gainAxes` | **446 (66%)** |
| declare nothing | ⛔ **227 (34%)** |
| ...of those, craft has `rankDeltas` so the axis is recoverable | ⚠️ **187** |
| genuine judgement calls | **40** |

**Axis use:** `scope` 179 · `targets` 153 · `duration` 108 · `quality` 80 · `conditions` 67 · `range` 60 ·
`damage` 45 · `autonomy` 26 · ⛔ **`tempo` 2**

**Ranks declaring 1 axis: 221 · 2 axes: 186 · 3+: 39.**

⚠️ **`tempo` at 2 is the one to look at.** §34.3 calls it *"the strongest axis on the list and it should be
priced that way"* — and it is used twice in 673 ranks. **Either it is under-reached or the pricing warning
worked too well.**

---

## §3 — ⛔ WHO READS IT: NOBODY IN THE ENGINE

**`gainAxes` appears in exactly three files, and none of them is runtime:**

- `po/matrix_gen.mjs` — my audit generator
- `scripts/axis_worklist.mjs` — your triage list
- `tests/smoke.mjs` — a gate

⛔ **IT IS AN AUTHORING-DISCIPLINE FIELD. It is invisible in play.** ⚠️ **I told Erik this in the same
breath as explaining it, because it is the authored-and-unread class we have both spent two days
cataloguing, and he should not commission 227 more declarations without knowing.**

---

## §4 — ⛔ THE ARCHITECTURAL PROBLEM, WHICH IS THE ACTUAL DECISION

**`mechanic` IS PER-ABILITY. `gainAxes` IS PER-RANK. There is no per-rank mechanic for it to scale.**

`engine/craftmechanics.js` opens by saying the verb families carry no field *"for damage, healing,
duration, range, area, targets or rank."* Resolution is
`craft.mechanic.<field> → familyDefaults[shape].<field> → the verb does not use that dimension` —
⛔ **and rank never enters it.**

⚠️ **THE ARCHITECTURE IS ALREADY MIXED, WHICH IS THE INTERESTING PART.** A handful of effects ARE authored
per-rank: `imposes` (19), `ongoingHarm` (10), `persistUntilHealed` (6), `antisoakImposed` (3). **So the
precedent for rank-level mechanics exists — it is just narrow, and `conditions` is the one axis that
already lines up with it.**

**So incorporating `gainAxes` means one of:**

1. ⚠️ **Rank-scaled mechanics.** r2 actually resolves a bigger `targets` than r1. **Truest to intent and the
   largest build** — it changes what a craft IS from one block to a ladder.
2. **Derive a rank multiplier from the axis** without restructuring — r2 declaring `targets` gets a
   standard step on that field. ⛔ **Cheaper, but it makes every craft scale identically**, which is
   exactly the discount-ladder failure Erik's scope-not-magnitude rule killed in `bargain`.
3. **Wire only `conditions` and `tempo`.** ⚠️ **`conditions` already has a per-rank home (`imposes`) and
   `tempo` already has a mechanism (the sense slot you built).** The other seven stay documentation.
4. ⛔ **Leave it as authoring discipline and SAY SO IN THE SPEC.** Legitimate, and better than a half-wire
   — but then §32.4 should stop reading as though a rank purchase means something mechanical.

**[A] IF I HAD TO PICK, 3 THEN 4** — wire the two that already have somewhere to land, and mark the rest
explicitly as authoring-only so nobody re-discovers this in six weeks. ⚠️ **But you know the resolution
path and I do not, and option 1 may be less frightening from inside the engine than it looks from here.**

---

## §5 — TWO THINGS I WOULD WANT EITHER WAY

1. ⛔ **`quality` and `autonomy` have no field, between them 106 declarations.** Whatever you decide, those
   two are asserting a progression nothing could ever represent. **They may want splitting into axes that
   map, or explicit marking as narrative-only.**
2. ⚠️ **The 187 recoverable-from-`rankDeltas` ranks are near-mechanical** — that is the cheap half of the
   227 and it is worth clearing regardless of this decision, because a declared axis is better triage than
   an absent one even if nothing reads it.

---

## §6 — WHAT PROMPTED THIS

**Erik asked what `gainAxes` was during the Death walkthrough.** I gave him the definition, then checked
the consumers before answering the second half — ⛔ **and the honest answer was that the field he was being
asked to reason about does not do anything yet.** ⚠️ **That is worth documenting as much as the axis list
is: the question was good and the answer changed the moment I ran `grep`.**
