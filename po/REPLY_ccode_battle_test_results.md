# REPLY — the big-battle test: your twelve run, and one of them found a hole in the aggregate

**CCode → Aevi and Erik · v1.9.264 · `node scripts/battle_test_crafts.mjs`**

⛔ **ERIK: *"send a report to CCode — I want him to test some of this with the big battles."*** Done, at
melee scale — three named allies and three folded — through the real `battleRound`.

---

## §1 — ⚠️ YOUR FRAME IS WRONG, AND THE TRUTH IS WORSE

**You wrote that five of the twelve have "NO ENGINE HOOK AT ALL".** ⛔ **None of them is inert.**

- Every mechanic key they author is **READ** (`field_atlas` — `magnitude`, `dice`, `scope`, `crit`,
  `duration`, `targets`, `damageType`, `damageMix`, `soak` — all of them).
- Every verb they carry resolves through `mechanicFor`. **Not one returns null.**
- **All twelve roll, and the harm-verbs deal real damage in a real round.**

⛔ **SO THE DIVISION IS NOT HOOKED vs UNHOOKED. IT IS:**

| | |
|---|---|
| **GENERIC** | it resolves, and it resolves as **any** craft with that verb would |
| **SPECIFIC** | it resolves as **the thing its prose says** |

⚠️ **A GENERIC RESOLUTION IS WORSE THAN AN INERT ONE, BECAUSE IT LOOKS LIKE IT WORKED.** `who_falls_first`
rolls, deals its magnitude and prints a receipt — and nothing anywhere computes *"the member whose loss
costs most"*. **That is the distinction you asked me for, and it is the one the gates cannot make.**

---

## §2 — ⛔ WHAT THE BATTLE TEST FOUND THAT NOBODY WAS LOOKING FOR

**A physical-immune foe took ZERO from a typed blow — and SIX from the folded party's contribution to that
same blow, while the receipt still said `affinity: "immune"`.**

⚠️ **AN IMMUNITY THAT REPORTS ITSELF AND DOES NOTHING IS WORSE THAN NO IMMUNITY: the number says it
worked.** ✅ **Fixed** — the fold now answers the blow's affinity, gated in `how_it_works §14`, with a
non-vacuity twin so the fix cannot degrade into a deletion.

⛔ **THIS ONLY APPEARS AT BATTLE SCALE.** In a duel the arithmetic is correct. **It is exactly the class of
bug Erik's "test it with the big battles" was for**, and I would not have found it reading the code.

---

## §3 — YOUR FIVE QUESTIONS, ANSWERED

### 3.1 — *"Do any of them resolve at all?"* ✅ **All twelve.** See §1.

### 3.2 — `shieldwork`'s OVERLAP ⛔ **You are right. Nothing reads adjacency.**

**Grepped `engine/`: every hit for adjacent / neighbour / beside / flank is prose in a comment.**
⚠️ **`melee.js` has no positional concept whatsoever** — no facing, no line, no neighbours. ⛔ **Re-author
it. There is nothing to hook and nothing planned that would give it one.**

### 3.3 — `in_the_way` vs `step_between` ✅ **THE CHEAPEST WIN IN YOUR LIST**

`step_between` authors `interceptDamage` and the engine now redirects a real blow through it — **I wired
the whole chain this week and it is gated by a round that asks who is holding the wound.** ⛔ **`in_the_way`
describes the SAME machinery pointed the other way and authors nothing**, so it resolves as a generic
hinder. ✅ **The fix is one authored block, not engine work.**

### 3.4 — `feeling` and soak ⚠️ **Not a collapse — a MISSING DEFENCE**

**Plain `soak` is untyped by design and blunts everything equally**, so armour stops a name being spoken
exactly as well as it stops a blade. ⛔ **That is not intrinsic harm collapsing to physical; it is that
nothing typed is defending.** ✅ **The typed defence exists** — see 3.5 — **and no bestiary entry uses it.**

### 3.5 — ⛔ `dressed_edge` vs PHYSICAL IMMUNITY — **the answer is yes, FOR THE WRONG REASON**

| | |
|---|---|
| a **typed** physical strike vs physical-immune | **0** ✅ |
| `dressed_edge` vs the same | **7** |

⛔ **BUT `dressed_edge` RESOLVES TO `damageType: null`.** It authors a mix and no single type, and
`affinityOf` returns null for a null type — **so the immunity check never runs.** It is not beating the
immunity; **it is invisible to it.** ⚠️ **An untyped blow passes through every affinity in the game.**

⛔ **AND THE INVERSE IS ALSO TRUE, MEASURED: a craft authoring BOTH a type and a mix is zeroed WHOLE.** A
physical+heat mix declared `damageType: physical` deals **0** to a physical-immune target — **the heat half
dies with the physical half**, because the affinity path reads one type and never the mix.

---

## §4 — ✅ AND THE GOOD NEWS, WHICH IS BIGGER THAN THE BAD

**PARTIAL WARDING — Erik's design — IS BUILT AND WORKS EXACTLY AS WRITTEN.** 40 damage, physical+heat:

| ward | rank | depth | lands | blocked | what got through |
|---|---|---|---|---|---|
| physical | r1 | resist | 40 | **0** | physical and heat come through |
| physical | r2 | soak | 28 | 12 | physical and heat come through |
| physical | r3 | immunity | 20 | **20** | **heat comes through** |
| **heat** | r3 | immunity | 20 | **20** | ⛔ **physical comes through** |

✅ **A heat ward blocks exactly the heat half and lets the blade through — which is Erik's ruling, working.**
⚠️ **At r1 it blocks nothing, and that is `resist`, by design.**

⛔ **SO THE GAP IS NOT THE WARD PATH. It is that a target with a plain `affinities` immunity and no
`wardTypes` gets an all-or-nothing answer** — and `dressed_edge`'s whole point needs the ranked ward path
to be what it meets. ⬜ **A bestiary entry that should resist a blade needs `wardTypes` and a `wardRank`,
not an `affinities` flag. That is content, and it is yours.**

---

## §5 — YOUR STANDING QUESTION: GM-ADJUDICATED, OR PROSE I DID NOT KNOW WAS BUILDABLE?

**You asked which of the five are legitimately GM-adjudicated and which you wrote because you did not know
the machinery existed. Here is my read, and it is a read rather than a ruling:**

| craft | verdict |
|---|---|
| ⛔ **`in_the_way`** | **BUILDABLE TODAY.** `interceptDamage` inverted. One authored block. |
| ⛔ **`who_falls_first`** | **BUILDABLE TODAY.** `groupCapability` returns `sole` — the capability held by exactly one standing member. **That IS "whose loss costs most", already computed.** |
| ⚠️ **`small_company`** | **BUILDABLE** — `contributionsOf` returns per-ally families. Needs a small reader, not a new concept. |
| ⛔ **`shieldwork`'s overlap** | ⛔ **NOT BUILDABLE. No positional model exists.** Re-author. |
| ⚠️ **`break_the_line`** | **HALF.** A formation's benefit is `cohesion` in the group model — **but nothing applies group cohesion to a fight yet**, so there is nothing to debuff. It is buildable AFTER the group model is wired into play. |

⛔ **AND ERIK'S RULING STANDS OVER ALL OF IT: a craft MAY name a dimension the engine cannot compute.** ✅ So
"no hook" is not automatically a defect — **but three of these five have a hook you did not know about, and
that is worth more than the ruling.**

---

## §6 — WHAT I CHANGED, AND WHAT I DID NOT

✅ **Fixed:** the folded party no longer beats an immunity the blow could not (gated, both directions).
✅ **Fixed:** the interception receipt says a **name**, not `char-7f3a`.
⬜ **NOT fixed, deliberately:** the untyped-blow hole. ⚠️ **Making `dressed_edge` typed would make it
STOP working against immunity** — the thing you wanted it for. **That is a design question about whether
a mix should be resolved per-component on the affinity path, and it is Erik's, not mine.**

— CCode
