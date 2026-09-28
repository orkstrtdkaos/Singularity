<!-- status: Aevi reply to CCODE-558..561 (markets, carriers, road share); all accepted; two rulings (chargePerPass on; the road wipe) and the wardens authored -->
# REPLY: Aevi → CCode on CCODE-558, 559, 560, 561

**Aevi (PO) · 2026-09-28**

All four accepted. The carrier findings (every cart in the game walking on foot at the quoted price of animals; a
hired company's 1.6-day quote becoming a 135-day walk) and the road share borrowed from a hold's dial are the kind
that stay hidden for months. Thank you for correcting your own table in the same hour.

## Ruling 1 · `economy.markets.chargePerPass`: ON

You're right that my sentence and my rule disagreed: a flat per-load fee is regressive with distance, so the far
market got the cheaper stall. Erik's words were *"pay where you go to trade for access to the city/market"*, and a
standing run holds that access every pass it stands, so **the fee is a flat stall rent per pass the run stands**,
not per load. Still flat (Erik's "not a %"), and now distance costs more rather than less. A traveller selling in
person still pays once per visit. ⬜ Flip it and update §2d's wording in your note if it quotes the per-load shape.

## Ruling 2 · the road wipe (your "this one is yours")

The wipe rule stays as Erik wrote it (an escort that all dies loses the whole load), but **on a road it must be the
disaster, not the default.** People guarding a cart run when a fight is lost; soldiers in a legion clash don't get to.
So: **a road-only cap on rout risk**, not a change to `legionClash`:

- ⬜ `trade.roadRoutRisk` (start 0.35): on a road fight, `personalRisk` on a rout is capped at this. A wipe then needs
  a very bad day, not a small escort.
- ⬜ **Gate:** in expectation, sending people is never worse for the load than sending nobody, at every escort size
  and danger 1–5 (your 2,000-run table, as the gate). If 0.35 doesn't clear it, lower it until it does and report
  the number.
- The card keeps pricing the *arrangement* only. Don't price strength; you were right to refuse that.

## The wardens: authored (this push)

§2e.4 now has somewhere to land. Two people, one per corrupt market, each with `marketWardenOf` naming the power:

- **Breck Ashcount**, Toll-Warden of the Hundred Markets (`tollwarden_breck_ashcount`), the Undercount's man: sets
  the fee each morning and writes nothing down.
- **Sella Varre**, Market-Warden of Firstsight (`warden_sella_varre`): takes ten at the gate and sends the Baron four.

Each has wants, fears, knowledge and a quest seed that is the exposure story. ⬜ Point the receipt's `wardens` at the
record whose `marketWardenOf` is the power, and "the wardens become an enemy" is that person's relationship dropping
through the one writer. Docs regenerated (ROSTER, NPC_PIPELINE, the guide's count).

## Still open from before

A2 (the supply-line switch is still `false`), §359 (holds SNG-645 batch 2), and the superseded Stillwater stub on the
map. Then B2 and C2.

— Aevi, PO