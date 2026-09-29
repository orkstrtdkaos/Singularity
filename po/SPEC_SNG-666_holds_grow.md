<!-- status: SNG-666 — Aevi (PO); Erik's ruling 2026-09-29; builds SNG-652 §4 (written 09-25, never built); ⬜ CCode, with SNG-665 after the tail -->
# SPEC SNG-666: holds grow: clear ground, then build on it

**Aevi (PO) · 2026-09-29**

> **Erik:** *"on building hold features... YES! that was the point of all that authoring. And there is supposed to be
> a way to clear more ground (or prepare space) for new features. Adding space and filling it with features is how
> your holds grow."*

## §1 — What exists, measured on origin

- **Building is there.** `addFeature(..., { via: "built" })` pays the kind's authored price (`economy.holdStore.features`
  → `build.goods` + `build.days`) from the store, then the purse, and stalls into a build-in-progress when it can't
  pay. The Build tab calls it.
- **It's refused when the hold is full** (`roomOf` → `roomRefusal`), and the refusal names the way out: *"it would
  have to become a hamlet, which has N more"*, or for a moving hold, *"its frame would have to carry more"*.
- **Neither way out exists.** Nothing adds a spot, nothing raises a frame, so a full hold can never grow. That is
  exactly Loki's Annex: a post on legs, 2 spots, 2 features (shrine, watchtower), so every build is refused and CCode
  reported "no door". SNG-652 §4 specified the door (a *Clear ground* job and category budgets) on 09-25; it was never
  built.

## §2 — The rule (SNG-652 §4, now ruled by Erik)

1. **Clear ground** is a job at the hold. Assign hands (idle hands first) and pay the goods. Each pass they make
   progress weighted by their hand at the **clearing** duty. At 100% the hold gains **+1 feature spot**, in the budget
   the player chose when setting the job (defence / production / community / open, SNG-652 §4's table).
2. **Promotion is earned, not handed.** When cleared spots carry a hold past its rung's count, it becomes the next rung
   (post → steading → hamlet → village → town → keep → fortress → stronghold), with that rung's name on the card and
   in the news. `roomOf`'s stored rung then moves, which is the one thing a build alone can never do.
3. **A moving hold grows its frame instead** ("prepare space" for legs, a hull, a lift): the same job, named for the
   frame ("Build out the legs"), raising `frameRaised` by 1 at 100%, with the frame's own `raisedBy` goods.
4. **Build** stays as it is, and on the card it sits beside the spots: **"2 of 2 spots · Clear a new spot — 12 raw
   material, ~3 passes with these hands · Build…"**. With a free spot, Build lists every kind the hold can take (its
   budget has room, its ground allows it: a fishery needs water, a mine needs ground that has ore), each with its
   authored cost and passes, and its upkeep.
5. **The cost of clearing grows with the hold.** ⬜ Authored by me once you've built the reader. Starting shape:
   `holdStore.slots.clearing` = base goods × the rung's index + 1 (a post clears a spot for 6 raw material; a keep for
   36 and some cut stone), passes 2 + rung index at two average hands. Measure it on Silas's and Loki's holds and tell
   me where it lands.

## §3 — Gates

- A full hold always shows a way to grow (clear ground, or build out the frame), never a dead end.
- Clearing to 100% adds exactly one spot, in the chosen budget, once.
- Crossing a rung's count promotes the hold once, and the refusal text, the card and `roomOf` all agree on the new rung.
- Loki's Annex (post on legs, 2/2) can start "Build out the legs" today and, when it lands, build a third feature.
- A build's price and passes on the card are what the build actually charges (one reader).

— Aevi, PO