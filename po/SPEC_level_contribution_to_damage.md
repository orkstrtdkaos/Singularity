# SPEC — let LEVEL contribute to damage without rebuilding the old system

**Aevi → CCode · 2026-08-30 · Erik's ruling, plus the content now clean enough to re-run the tournament**

---

## §1 — ✅ THE CONTENT IS FIXED. RE-RUN IS UNBLOCKED.

**Erik: *"I don't think we can take away too much from the test because untyped damage and undiced things
drive everything. LET'S FIX THE SKILLS THEN WE CAN RUN IT AGAIN."***

**Done. What changed under your tournament:**

| | before | now |
|---|---|---|
| `damage`/`strike` crafts with **no dice** | ⛔ **11** | ✅ **0** |
| harm crafts **untyped** | ⛔ 6 of those 11 | ✅ **0** |
| ⛔ **mis-declared harm rungs distorting the field** | ⛔ **2** | ✅ **0** |

⚠️ **YOUR SEVEN WERE ELEVEN, AND THEY WERE ONE BATCH** — every one **L1**, every one a tradition's *"first
offense"*, every one carrying `magnitude` 5–8 and no dice. **One authoring pass from the old system.**

⛔ **AND TWO OF YOUR TOP FIVE WERE MEASURING A MIS-DECLARATION.** `shatterpoint` placed **3rd at 70%** — its
own text is *"a minute's study names the weakest point; YOUR NEXT STRIKE does more."* **It is a `setup`
craft that does no harm**, and a harm rung with no dice inherited the top tier. Same for `unmake_seal`
(`construct`, *"its danger is WHAT COMES OUT"*). ✅ **Both rungs are now `none` and they will drop out of
the harm field entirely.**

⬜ **RE-RUN WHEN YOU CAN.** I expect the spread to compress and the driver table to change shape, because
three of your seven inputs were partly measuring this.

---

## §2 — ⛔ ERIK'S RULING ON LEVEL, AND THE MECHANISM ALREADY EXISTS

**Erik: *"At some point we used magnitude and level to determine damage, but I think we have since moved to
AUTHORED DICE. I DO STILL WANT LEVEL TO HELP WITH DAMAGE, but I want to do it SMARTLY and NOT RECREATE THE
SYSTEM."***

⚠️ **The level→damage relationship is already built. It is `rung.dice`, and today it only fires when an
author writes NOTHING:**

```js
const dl = diceAuthored ? { nMult: 1, plus: 0 } : (rung.dice || { nMult: 1, plus: 0 });
fields.dice = { n: round(fields.dice.n * dl.nMult), d: fields.dice.d };
fields.plus = round(fields.plus + dl.plus);
```

⛔ **SO THE DIAL IS POINTED BACKWARDS.** An author who does the work gets `nMult: 1, plus: 0` — **level
contributes nothing.** An author who leaves the field blank gets the full tier multiplier. ✅ **Erik does
not want the old system back; he wants THIS ONE aimed the right way.**

### ⚠️ WHY I AM NOT PROPOSING THE OBVIOUS FIX

**The obvious fix is to stop exempting authored dice.** ⛔ **Do not do that** — your own comment records why:
it would re-break what `diceAuthored` was added to fix (*"2d6 → 4d6, 3d4+3 → 9d4+6"*). **Tiered dice
multiplied a second time.**

### ✅ THE SHAPE I THINK IS RIGHT, AND IT IS YOUR CALL

⛔ **SPLIT THE RUNG'S TWO HALVES.** `rung.dice` carries `nMult` **and** `plus`, and they are different kinds
of thing:

- **`nMult` MULTIPLIES AUTHORED DICE** — this is the double-scaling bug, and authored dice should keep
  exempting it. **Leave as is.**
- ⚠️ **`plus` IS ADDITIVE AND DOES NOT COMPOUND.** A flat `+n` on top of authored dice **cannot** produce
  `9d4+6` from `3d4+3`. ✅ **That is level contributing to damage, smartly, without recreating anything.**

**Concretely:** `dl = { nMult: diceAuthored ? 1 : rung.nMult, plus: rung.plus }` — **the multiplier stays
exempt, the flat bonus always applies.**

⚠️ **AND IT SCALES THE WAY ERIK'S CURVE ALREADY DOES:** a flat `+n` is worth proportionally more to a 1d6
craft than a 5d6 one, **which narrows the low-to-high spread rather than widening it** — the opposite of
what the current fallback does.

⬜ **WHAT I CANNOT JUDGE AND YOU CAN:** whether `plus` at the top tiers is sized for this. It was authored
as *part of* a replacement, not as an addition, so the numbers may want re-scaling once it stacks.

---

## §3 — ⬜ AND ONE THING TO MEASURE ON THE RE-RUN

**Your mender result (−0.47) is a UNIT-SIZE fact, not a healing one** — your own caveat, and I agree.
⚠️ **Please measure the crossover if you can spare a run.** ⛔ **Left unmeasured, "a mender is a net loss"
will get read as "healing is undertuned" and produce exactly the wrong content response** — I would be
authoring healing buffs to fix a five-person-unit artefact.
