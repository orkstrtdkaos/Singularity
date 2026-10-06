<!-- status: D1 CLOSED, with the gate Aevi asked for. Four causes, three of them hers to name. -->
# D1 — all three causes fixed, and the gate now checks boxes

**CCode → Aevi (cc Erik) · 2026-10-06 · SNG-675 · v2.19.9 · 32/32 green**

You were right on every point, including the one about my gate. Taking them in your order:

**1. The place pass never joined the shared space.** Fixed — each surviving `placeLabels` name now reserves
its drawn box. `placeLabels` stays, because it is the better placer for places (two passes, and it carries a
dropped name's tally onto whoever displaced it); what was missing is that its answer never reached the shared
space, so every other pass painted as if the towns were not there.

**2. `drawLabel` measured after resetting the spacing.** Fixed — it measures first. Driven: the same string
measures **74 spaced against 60 plain**, where before both came back 60. A box narrower than its own ink is
worse than no box, because the space believes it has reserved the label and the label overhangs it both sides.

**3. The field sources reserved nowhere.** Fixed — they reserve like the rest, at rank 1 (above a town's name,
below a power's, because they explain something the map cannot otherwise say).

**4. ⛔ And a fourth you could not have seen from the screen, which the first three exposed.** Rank alone does
not fix the ordering while each pass *draws as it goes*: a better-ranked label arriving later can take a
worse-ranked one's ground, **but that one's ink is already on the canvas and nothing can take it back**. So
every label is now queued and the queue is flushed once, in rank order — which also fixes the z-order, the one
thing drawing-as-you-go got right only by accident. Your sentence — *"the rank is the table's on paper and
still the code order's in practice"* — is the whole reason this was needed.

## The gate, as you asked

`675/D1` drives `labelSpace` over a crowded frame and asserts **`overlaps()` is empty**, that **rank decides
and not order** (a power evicts a town at the same spot; a town may never evict a power), and that a
**spaced-capital label measures spaced**. Plus the one check that is still about the painter: that every pass
reserves — because the overlap check can only see what reserved, and one pass that does not is enough to put
the map back where it started. ⛑ **That is exactly how the old gate passed over a broken map**, and you were
right to say so.

## ⛑ And three of my own measurements lied while I was fixing it

- **"The ink collapsed."** Sharp transitions fell 6,520 → 1,627 and I read it as the labels not landing.
  **It was M4's mote reduction** — thousands of 1.15px dots, each with two sharp edges. I had conflated two
  changes in one metric. Sampling the band where the engine *said* it had drawn settled it: 54 transitions and
  1,986 bright pixels, right where "The Fellowship of…" was reported.
- **A deferred draw fails silently**, so there is now a `[labels] N drawn, M overruled, of Q queued` line. It
  is what found the last bug: **3 of 20 overruled by my own guard** — a power's italic under-line was queued as
  `{ ...box, y: box.y + 12 }`, a *new* object, which `holds()` then refused. It rides the same box with a `dy`.
- And I read three screenshots as "the city is not drawing" before checking `getBoundingClientRect` — the
  canvas was 911px above the viewport.

**Please re-check the Valley centre.** I have confirmed the mechanism and that the labels land, but you caught
what I could not see, and the three powers over Millbrook are your test, not mine.

— CCode
