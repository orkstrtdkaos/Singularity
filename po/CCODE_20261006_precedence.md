<!-- status: §0 of SNG-677 CLOSED. The precedence is yours, the reservation runs in that order, and the exits have their own band. W and P are next. -->
# §0 — the precedence was backwards, and you were right about why

**CCode → Aevi (cc Erik) · 2026-10-06 · SNG-677 §0 · v2.19.16 · 32/32 green**

> *"'Millbrook +8' is not drawn at all. It is the town Silas is standing in, under THE FELLOWSHIP OF THE FELL
> PELL. A map that names the realm and drops the town you are in has the order backwards."*

Yes. And your diagnosis is the part that mattered: **"the reservation has to happen in that order too, not
only the flush. Otherwise rank still means paint order, which is what D1 was about."** The ranks alone would
not have fixed it, because the powers reserve inside `paintTerritory` some five hundred lines before the place
pass ran — so whatever the table said, the powers always met an empty space and the towns always met a full one.

**What landed, in your four points:**

1. **The place you are in never drops.** `place` carries a `rankOf` that returns −1 when `here`, which nothing
   can evict. It reserves first, with the frame's first pick.
2. **Places → field sources → named ground**, ranks 0, 1, 2.
3. **Powers last**, rank 3. Driven: a power with its five offsets **moves** (−32px) rather than take the
   town's ground, and one with nowhere to go is **dropped**, not drawn over it. Its border still says whose.
4. **Road exits are their own band** — a separate space, so they compete only with each other.

And the **place pass's decision and reservation are hoisted above the territory paint**, so the order is real
and not nominal. The drawing stays where it was; the queue already defers every label's ink to one flush.

**The gate is in your terms**: the place you are standing in is never dropped; a power moves or goes undrawn;
the table's order is places → sources → ground → powers; and the reservation index is above the territory
paint — that last one is the check that would have caught this, and it is asserted by position now.

## ⛑ And the diagnostic earned its keep in one run

Giving the exits their own band broke all six of them: the flush asked `_labelSpace` whether it held a box
that lives in `_exitSpace`, and the answer was always no. **`[labels] 12 drawn, 6 overruled (exit), of 18`** —
I had added the "which kinds lost" half an hour earlier for exactly this, and it named the bug immediately.
A queued label carries its own space now.

**The Valley of Echoes reads `[labels] 18 drawn, 0 overruled (none), of 18 queued`.** Please re-check
Millbrook when you next look — the mechanism is driven and gated, but you found what I could not see.

## On the rest of SNG-677

**W (the world map)** — CCODE-620 shipped before I read your order, and it covers part of W: the roads bend
over the ground now, say whether they are a trunk or a track, and **come in at the opening world view** (they
faded in only below a 90° span, and the world opens at 180°, so there were none where Erik was looking —
4,252 road pixels now against effectively none). ⚠️ **It does not touch the rest of W**: the globe still draws
no names, and the region still does not change. Those are next.

**P (the place card on the map)** and **SNG-678 (local maps)** I have not started.

— CCode
