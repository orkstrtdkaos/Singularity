# SNG-393 — Re-anchoring place names after a terrain rebuild

**Author:** Aevi (PO) · **Date:** 2026-08-09 · **Data:** `content/packs/core/world/placenames.json`
**Status:** spec_ready · ⚠️ **REV 3. Erik's suggestion replaced my rule and the measurement backs him.**

---

## §1 — The three revisions, because the reasoning matters more than the answer

| rev | rule | measured |
|---|---|---|
| 1 | nearest river HEAD to a town anchor, fail beyond ~20° | ⛔ **4 of 10 ambiguous.** Anchor distance 5.3° vs head spacing 5.6° — signal and noise the same size. Threshold invented. |
| 2 | pair-match (head+mouth town anchors) over the 24 longest | 1 of 10 ambiguous. Tolerance had to be **45** |
| **3** | ⛔ **POLAR SIGNATURE — the feature's own (colatitude, longitude) head and mouth** | ⛔ **0 of 12 ambiguous. Tolerance ~3°.** |

**Erik:** *"can't you just tune polar coordinates for the mouth and head?"* **Yes, and it is not a tuning —
it is the right key.**

---

## §2 — ⛔ WHY THE SIGNATURE WINS, MEASURED

I generated two worlds a 1% threshold apart (0.20% of land/sea cells differ), ran full hydrology on both,
and matched the major rivers:

| | |
|---|---|
| **river head+mouth signature drift across a rebuild** | ⛔ **median 0.50°**, max 8.14° |
| distance from a river to its nearest town | 5.3° median, 8.3° max |

⚠️ **The thing I was going to anchor TO is ten times less precise than the thing I was anchoring.** A town
is stable but far; the signature moves a little and is exact. **Precision beats stability when the drift is
smaller than the error you are trying to avoid.**

⛔ **And this is not a coincidence of this world: colatitude and longitude ARE the polar frame, centred on
the Crossing.** A river's head and mouth in that frame is its **cosmic address**. That is why it is stable
under regeneration — the terrain wobbles, the address does not.

---

## §3 — THE RULE

Each named river carries `head: [colat, lon]`, `mouth: [colat, lon]`, `lengthDeg`.
Each named fen carries `centroid: [colat, lon]`, `extentDeg`.

```
pool     = 24 longest traced rivers   |   16 largest marsh polygons
score(q) = min( d(head, q.first) + d(mouth, q.last),
                d(head, q.last)  + d(mouth, q.first) )     // rivers
score(q) = d(centroid, centroid(q))                         // fens
match    = argmin score,  accepted if score <= 3.0
```

⚠️ **Both orientations still required** — flow direction flips between rebuilds when two headwaters trade
which is higher after smoothing.

⚠️ **`nearHead` / `nearMouth` / `near` are KEPT** as human-readable labels and as a **fallback** when a
signature fails. They are no longer the matching key.

---

## §4 — ⛔ THE GATE

| assert | value | measured basis |
|---|---|---|
| every name resolves | **score ≤ 3.0** | drift median 0.50° |
| unambiguous | **margin ≥ 2.0°** | runner-up measured 8–60° away |
| known drifters | **exactly 1** river exceeded 3° in the two-world test | census, not pass/fail |

⛔ **A name scoring above 3° means its river GENUINELY RESTRUCTURED, and that is information.** Report it;
do not widen the threshold to hide it. **The old 45 tolerance would have swallowed a river changing course
completely.**

⚠️ **Prove the gate red:** perturb `thr` by 0.01, rebuild, and the census should stay at 1. Zero drifters
means the perturbation did not take; several means the terrain is less stable than measured.

---

## §5 — OUTPUT SHAPE

```
placeNames: {
  rivers: [ { id, name, pathIndex, score, margin, resolved } ],
  fens:   [ { id, name, polyIndex, score, margin, resolved } ],
  unresolved: [ { id, name, reason: "no candidate within 3°" | "ambiguous" | "pool empty" } ]
}
```

⛔ **Unresolved names go in `unresolved` — never silently dropped, never bound to a too-far best
candidate.** A river named for Millbrook quietly attaching to another water is worse than an unnamed river.

⚠️ **After a successful resolve, WRITE THE NEW SIGNATURE BACK** to `placenames.json`. The address should
track the feature across rebuilds; a signature that never updates will eventually drift out of tolerance
on legitimate change.

---

## §6 — Why this is not cosmetic

Three names are load-bearing in content authored **before the terrain existed**:
**The Echo** (`echo_river_crossing`, `millbrook`), **The Stiltfen** (`greywater_stilts` is built on it),
**The Echofen** (the bridge exists because the fen made fording impossible).

⚠️ **The Echo runs 91.3° — most of the way round the world — and its course changes every regeneration
while Millbrook does not move.**

---

## §7 — Priority

⚠️ **Still behind SNG-392**: `localMap` schema, nanite resolver, map in-app.
