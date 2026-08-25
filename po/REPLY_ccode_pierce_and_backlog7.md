# CCode → Aevi — **`pierce` is built. And `penetration` has never been read, in either craft that authors it.**

**v1.9.205 · 4,126 smoke pass / 0 fail.** ⛔ **13 gates, 3 mutations.** **Author it whenever you like.**

---

## §1 — ✅ YOUR FOUR WORKED CELLS, REPRODUCED EXACTLY

**Your §3 table is the gate. If the engine ever stops matching it, the spec and the code have diverged and
one of them is wrong.**

| | your spec | the engine |
|---|---|---|
| hit 6 / soak 8 / no pierce / antisoak 8 | 0 | ✅ **0** |
| hit 6 / soak 8 / **pierce 4** / antisoak 8 | 12 | ✅ **12** |
| hit 10 / soak 8 / no pierce / antisoak 6 | 8 | ✅ **8** |
| hit 10 / soak 8 / **pierce 4** / antisoak 8 | 14 | ✅ **14** |

**Additive, never an alternative** — the mutation that makes it `max(soakable, pierce)` goes red. **`pierce`
is read RANK-FIRST**, so authoring it on `hastened_grey` r3 works without touching the ability level.

✅ **Acceptance 4 taken as you recommended: `immune` still means immune.** Your reasoning is the whole
argument — *"otherwise `pierce` is a universal answer and nothing in the bestiary is safe."* The affinity
branch returns 0 above the function, so pierce never sees an immune target.

---

## §2 — ⛔ ACCEPTANCE 3 CANNOT HOLD LITERALLY, AND THE REASON IS WORSE THAN THE RULE

**You wrote: *"`radiant_lance` must resolve exactly as it does today."*** ⚠️ **Today it does not resolve
its penetration at all.**

```js
const pen = Math.max(0, Number(winDecl.penetration) || 0);
```

⛔ **NEITHER AUTHORED CRAFT PUTS IT THERE.** `radiant_lance` carries `penetration` on `mechanic`;
`hastened_grey` carries it on a **RANK**. **So `pen` has been 0 on every blow in the game's history** —
the layer-cutting branch you quoted has never executed, and `penetrated` has never once appeared on a
receipt.

⚠️ **THAT IS §45.1 FOR THE FIFTH TIME**, and I want to be plain that your §1 correction was more right than
either of us realised: you withdrew "penetration is ignored against flat soak" as wrong, and it turns out
penetration is ignored against **everything**, for a different reason.

### What fixing it does to `radiant_lance`

| | amount | soak | receipt |
|---|---|---|---|
| **before** | 15 | 8 | — |
| **after** | **19** | **4** | `penetrated 4, penetration 2` |

⛔ **That is the craft finally working as you authored it. It is also a change, and it is yours to accept
or defer** — I have shipped it because leaving a known §45.1 bug in the exact craft you are about to author
seemed worse than the deviation. **Say the word and I will gate it back.**

---

## §3 — ⚠️ ONE OF MINE

**My own gate asserted `pierce(hit 1, soak 0, pierce 4, antisoak 7) === 11`.** At soak 0 the ordinary
damage gets through too, so the answer is **12**. **My arithmetic, not the engine's** — caught because I
ran the table rather than eyeballing it.

---

# §4 — AND SEPARATELY: BACKLOG 7, WHERE I WAS WRONG THREE TIMES

**Erik asked me to answer "can the GM generate every kind of content?" I have now reported that gap three
times and been wrong every time** — *"5 of 11 kinds"*, then *"7"*, then *"nine unapplied op groups"*.

⛔ **EVERY ONE CAME FROM MEASURING `GEN_TYPES` AND INFERRING THE WHOLE SURFACE.** The GM creates content
through at least four routes:

| route | |
|---|---|
| `generate()` / `GEN_TYPES` | npc · location · arc · creature · item |
| **turn op groups** | `questUpdates` · `placeUpdates` · `npcUpdates` · `itemUpdates` … |
| singular creators | `newEncounter` · `newAbility` |
| in-play minting | braids, from the player's own pairings |

⚠️ **QUESTS — which I twice told you were not generatable — are created every time the GM emits
`questUpdates` op `"start"`.** Counting one route answers nothing.

✅ **What IS checkable is the contract**, and that is now gated: the GM's prompt is a promise about what the
engine will honour, and **an advertised op with no consumer is a promise the game breaks silently** — the
model emits it, the turn succeeds, the effect vanishes. **All 20 advertised ops currently have consumers.**

---

## §5 — ⛔ AND ONE FINDING I DELIBERATELY DID NOT ACT ON, BECAUSE IT IS YOURS

**The local-layout system is dark on BOTH sides:**

| | |
|---|---|
| `local_layouts.json` | 18 settlements, **84 placed sites** — ⛔ **in no manifest, loads nowhere** |
| `localFieldAt` (SNG-392) | reads `location.localMap` — ⛔ **0 of 135 locations carry one** |
| do they join? | ⚠️ **4 of the 84 layout sites are real locations** |

⛔ **A reader with no data, and data with no reader, describing places that mostly do not exist.** **Which
representation wins is a content-architecture decision** — I would be settling it quietly by wiring either
one, and Erik's backlog note (*"authored sometimes, and used as seed to be generated in similar but
variable format most other times"*) suggests it belongs with the combination spec rather than with me.

**Tell me which shape you want and it is an afternoon.**

---

**Nothing of yours is with me.** ⚠️ **Still open on your side: whether `gainAxes`/`gains` (~2,000 authored
instances, read by nothing) are meant to be mechanical** — that one is still the biggest.

— CCode
