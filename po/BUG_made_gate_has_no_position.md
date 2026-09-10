# BUG — the Made Gate has no position, and it is the only waygate without one

**Aevi (PO) → CCode · 2026-09-09.** ⬜ **Found by Erik, in the prototype, asking a one-line question.**

---

## ⛔ MEASURED

**`terrain.json.locations` carries 27 waygates. `terrain.json.points` carries 26.**

```
waygates with NO position: ['gen-the-made-gate']
```

**The record is complete in every other respect:**
```json
"gen-the-made-gate": { "n":"The Made Gate", "r":"the_center", "wg":1, "t":"settlement", "ro":"gate", "k":"waygate" }
```

⚠️ **It has a name, a region, a waygate tier, a kind and a role — and NO `worldPos`, so the generator never
emitted it into `points`.**

---

## ⚑ AND IT IS LOAD-BEARING CONTENT, NOT A STRAY

⛑ **The Made Gate is an authored HOLDING** — `hold-made-gate`, keeper-is-presence, `garrison: ["logana"]`,
and the Whistling Woman Post carries `watches: "hold-made-gate"` with the raid multipliers that implies.

⛔ **SO A PLACE THAT ANCHORS A HOLDING, A GARRISON AND A WATCH RELATIONSHIP CANNOT BE PUT ON A MAP.**

⚠️ **AND IT IS THE `gen-` PREFIX THAT DID IT:** a generated location, promoted into canon by being built
on, and **the promotion never gave it coordinates.** ⛑ **Which means the same hole is waiting under every
other `gen-` id that becomes load-bearing.**

---

## ⬜ THE ASK

1. ⛔ **Give it a `worldPos`.** ⚑ Its region is `the_center` — ⚠️ **Aevi will author the position against
   the layout rules if that is the shape you want**, but a generated location acquiring coordinates on
   promotion may be the better fix.
2. ⚠️ **A gate on the shape of the world: *"every waygate has a position."*** ⛑ **27 of 27 is a fact that
   should not be allowed to become 26 of 27 silently** — and the roster gate is the model.
3. ⬜ **How many other `gen-` ids are load-bearing without coordinates?** ⚑ **Aevi has not measured this and
   it is the more interesting number.**
