# SNG-392 — What CCode does next: the world is built and NOTHING READS IT

**Author:** Aevi (PO) · **Date:** 2026-08-09 · **Erik:** *"what do you want ccode to do next"*
**Status:** spec_ready · **Ordered by what unblocks what.**

---

## §0 — ⛔ THE STATE, MEASURED

I searched the repo for every mechanic specced across SNG-382 / 386 / 389 / 390:

| | where it appears |
|---|---|
| `naniteField` | `po/` documents only |
| `localMap` | `po/` documents only |
| `roadFactor` | `po/` documents only |
| `bearingBetween` | `po/` documents only |

⛔ **The world is fully built, verified, gated — and the ENGINE DOES NOT KNOW IT EXISTS.** SNG-390 §2 said
*"start by reading nothing,"* and that was right for shipping a viewer. **It is no longer right.**

---

## §1 — FIRST: `localMap` + `localSources` schema. It is the only thing blocking ME.

**Two fields on `tier: site` locations:**

```
localMap:     { x, y }          // a local frame, NOT a projection of anything
localSources: [ { kind, delta, radiusLocal, reason } ]
```

⚠️ **`localMap` is a floor plan.** A settlement's interior has no geographic projection — this is the one
place a non-geographic layout is unambiguously correct, and it is why the site tier is **authored, not
generated**. Resolve `localSources` **within the frame only**; they do not participate in the world field.

⛔ **AND ERIK'S RULING GOVERNS THE MAGNITUDE: local ground CAN overturn world ground.** I proposed a ±0.15
cap and he declined it — *"that's how different traditions INVADE and can be effective in an antipole. It
takes planning and resources."* **No cap.** A prepared expedition standing on a made shrine should be able
to work its craft in country that would otherwise starve it. The counter is the same mechanic pointed the
other way.

**I need the schema before I can author 65 sites. This is small and it is the gating item.**

---

## §2 — SECOND: the nanite resolver. ⛔ The biggest mechanical gap in the game.

`naniteField` is authored for **all 27 regions** — `ordered` / `wild` / `clear`, each with its
pre-Transition reasoning — and **nothing reads it.** Open since SNG-382, where I flagged it in the file
itself rather than letting it look wired.

⛔ **This is why nanite and body come out ground-indifferent everywhere.** They have no band against
lattice density, and `naniteField` **is the axis they should answer to**. A nanite craft on `clear 0.05`
should starve the way a precursor craft starves at lattice 0.05.

⚠️ **Until this lands, half of the six sources have no geography at all** — and the SNG-389 balance
discussion is being had about the three that do. **It needs its own resolver and its own band semantics**,
parallel to `resolveSubstrateField`, not folded into it: they are independent fields.

---

## §3 — THIRD: the map where a player can reach it

SNG-390 §4. **Read-only.** The viewer works; it is nowhere in the app. ⛔ **It must not become a second
source of position** — `worldPos` remains sole authority.

---

## §4 — ⛔ EXPLICITLY NOT YOURS YET

**The SNG-389 balance change.** You already established my diagnosis named the wrong constant —
`crowdSlope`, not `crowdFloor` — and you correctly changed nothing. **The ruling is Erik's**, between
`crowdSlope ≈ 1.6`, narrowing `wild` to `0.32 ± 0.20`, or both. ⚠️ **When it comes, ship it with the red
observed:** assert wild's worst crowded factor before and after.

**`roadFactor`** (SNG-390 §2a). A proposal with a measurement attached — median road/straight is 1.05×, so
do **not** rewrite `walkingDays`; only ~6 edges exceed 1.3×. **Also Erik's.**

---

## §5 — STILL MINE, so you do not wait on it

Naming (5 seas, 16 ranges, the fens — detected, unnamed) · `naniteSource` points · tier corrections ·
**the 65 site frames, the moment §1 lands.**

⚠️ **When the site tier ships it comes as ONE commit — data, rebuild step, and its gate with its red
already observed.** Rev 1 of SNG-391 is my argument for doing it that way.
