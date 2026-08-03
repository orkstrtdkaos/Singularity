# SPEC — SNG-268: RING DISTANCE IN THE BRAID GENERATOR
## Aevi (PO) · 2026-08-02 · Erik: "these aren't the only braids I expect to exist — make sure all of these
## findings are also reflected in the generative engine that will instantiate new braids."

**He is right and the leak was real:** I authored mechanics for 3 hand-written braids. Braids are **minted at
runtime**, so every *future* braid would be born without what those three taught me. Findings that live only in
staged content are findings that leak.

## WHAT THE GENERATOR ALREADY DOES RIGHT (CCode, SNG-263 §9 — verified, not assumed)
`engine/braids.js` already derives mechanics for a minted braid: it **unions the parents' operative axes**,
**takes the stronger field**, and makes **a REFUSED intensity contagious**. Its comment is explicit that this
was measured — *"a minted braid was not mechanically empty… it was born GENERIC, losing the named axes and
per-intensity prose its parents carried."* **And bounds are deliberately NOT inherited**, because widening a
braid's boundary to the sum of its parents is exactly what `notFor` forbids. **That is all correct and I am
not proposing to change any of it.**

## ⚠️ THE GAP: THE GENERATOR HAS NO CONCEPT OF RING DISTANCE
`braidBaseCost` is `priciest parent + a share of the cheaper`. **It asks how expensive the parents are. It
never asks how FAR APART they are.** Braiding two adjacent traditions and braiding two exact antipodes cost
the same and read the same.
**AND THE EVIDENCE THAT THIS MATTERS IS IN MY OWN THREE BRAIDS — I only noticed on the sweep:**
| braid | parents | antipodal? |
|---|---|---|
| `meaning_engine` | enginewright + numinous | **YES — exact opposites** |
| `harbored_flame` | umbral + blazeborn | **YES — exact opposites** |
| `the_turning_word` | threnodist + syllogist | **YES — exact opposites** |
**All three authored braids in the entire catalog are exact antipodal pairs.** That is not coincidence — it is
the author telling us **what a braid IS FOR**: the interesting braid is the one that shouldn't work. And every
one of them carries a bound about **the joining itself**:
· `harbored_flame`: ***"THE TWO POLES FIGHT; the cost RISES WITH EVERY PERSON held."***
· `the_turning_word`: ***"a chord you MADE is a chord you are ANSWERABLE FOR."***
· `meaning_engine`: ***"being addressed specifically is not the same as being WELCOMED."***
**A minted braid gets none of this, because the generator cannot see that its parents are opposites.**

## PROPOSAL — three additions, all small, all derived from data already in `traditions.json`
### 1. `ringDistance(a, b)` — the missing primitive
`traditions.json` already carries `opposite` and `adjacent` per tradition. Distance is therefore free:
**0 = same · 1 = adjacent · 2 = same axis-neighbourhood · 3 = far · 4 = ANTIPODAL (`opposite`)**.
### 2. COST AND TENSION SCALE WITH DISTANCE
`braidBaseCost × tensionFactor(distance)` — **adjacent 1.0 · far 1.4 · antipodal 1.8.**
**Rationale, and it is the fiction's own:** an antipodal braid is *harder to hold*, so it costs more to run —
exactly what `harbored_flame`'s *"the two poles fight"* already says. **A cheap antipodal braid contradicts
authored text.**
### 3. ⚠️ THE TENSION BOUND — the one genuinely new thing
CCode is right that parents' bounds must not be inherited. **But a braid should carry ONE bound its parents
never had: the cost of the joining itself.** Derived, not invented:
- **antipodal (4):** *"The two poles fight. Holding them together is the cost, and it rises the longer you
  hold."* — class **COST**
- **far (3):** *"They were not made to run together; the seam shows under pressure."* — class **COST**
- **adjacent (0–1):** **no tension bound.** Kin traditions braid cleanly and should say nothing.
**This is additive — one bound, on the braid's own reach — so it does not widen the boundary and does not
violate the never-delete rule.**
### 4. `requiresPoles` ON MINTED BRAIDS TOO
All three authored braids carry it; a minted braid has `minted.from`, so it is **derivable at mint time for
free**. It matters because **dual-pole gating is now a real category** (checks 6e — four instances: the three
braids plus `the_whole_act`), and if minted braids don't declare it, the engine will only ever gate the
hand-authored ones.

## WHAT I AM DELIBERATELY *NOT* PROPOSING
- **No change to `deriveMechanic`.** It is correct.
- **No inherited bounds.** CCode's reasoning holds and the never-delete comment is right.
- **No block on antipodal braids.** They should be *expensive and marked*, never *forbidden* — they are the
  best braids in the game, and the catalog says so by containing only those three.

## THE TEST OF DONE
Mint a braid from two ADJACENT traditions and one from two ANTIPODES. **The antipodal one must cost visibly
more and must carry a tension bound; the adjacent one must carry neither.** If they come out identical, the
generator still cannot see the ring.
