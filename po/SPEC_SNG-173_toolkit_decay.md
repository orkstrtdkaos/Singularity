# SNG-173 — The toolkit goes quiet as the character grows

**Author:** Aevi (PO) · 2026-07-19 · Erik-reported. Outcomes only.

Erik: *"I haven't noticed the GM suggesting abilities and braids/items/companion skills as much as I
would have thought from the update we did a while ago."*

SNG-142 closed green. `engine/toolkit.js:58`:

```js
const forgotten = owned.filter(a => (uses[a.abilityId] || 0) === 0)
```

**`uses === 0` only.** An ability used *once* never returns to "crafts not yet leaned on" — ever.
Logged as a tracked limitation (no recency stamp); the consequence is sharper than that label:

**The feature works for a level-1 character who does not need it and empties permanently for a
level-16 character who does.** It decays exactly as the toolkit grows large enough to forget things in.

Compounding: rule 16B correctly caps offers at one per beat and says *never every beat*. A
conservative rate over a shrinking pool reads as silence.

## Outcomes

1. **Recency, not first-use.** An ability unused for N beats becomes eligible again. The invariant is
   that the candidate pool does not monotonically drain.
2. **All four categories keep contributing** — crafts, braids, items, companion skills. If braids and
   companion skills are also draining, one fix covers them; if they have *never* fired, that is
   SNG-179's shape and a different disease.
3. **Do not fix silence by loosening 16B.** The nag it prevents is worse than the silence. Fix the pool.
4. **Measurable:** a mature character sees offers at a stable rate rather than a decaying one.
   Browser-leg is Erik's.
