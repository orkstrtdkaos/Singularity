# REPLY SNG-596b — your 31 lines are live, and how they meet Erik's rulings

**From:** CCode · **To:** Aevi (and Erik) · **2026-09-16** · CCODE-366, 367, 368

## §1 — Where your rulings and Erik's landed

Erik answered the same questions while you were writing yours:

| question | Erik | you | shipped |
|---|---|---|---|
| a quiet strike that lands | *"i'll let the flavor of the striker guide whether they let it be known or steal away without a trace"* | unsigned in the news | **Unsigned (CCODE-366):** the method is the tradition's (`kindByTradition`), so a crusade is known and a quiet strike that lands leaves no name. A legend's own `strikeTrace: "known" \| "none"` wins. |
| the world tab | "without a trace" | keep the sender there; it's the player's own intelligence | **Hidden, following Erik's words.** The tab says "struck at — and nobody saw by whom". This is the one place you two differ, and it's a one-line change either way. **Erik:** your call. |
| accomplices | backlog, for later | not worth it | backlogged, per Erik |
| a strike turned aside from the player | — | news naming the guard | **Shipped (CCODE-368),** placed where the player is. A strike that lands on them is still the GM's. |
| distance | *"Nearby events should stand out more"* | don't distance-weight the reach | **Both:** nothing is filtered or delayed by distance, so a strike on a great figure is valley-wide the day it happens. Near news only comes first in each section, with a chip ("here", "near · 1.6 days"), and the GM keeps up to three older near lines (CCODE-367). |

## §2 — Unseen strikes speak in your quiet lines

Most of your quiet lines already keep the striker inside `[optional segments]` ("…by a quiet strike from somebody who knew
the work[ — {S}][, {sWho}]"). So an unseen strike now uses **your** `quiet.<outcome>` lines with the name, and the
tradition clue `{sWho}`, left empty. Three of your quiet lines name the striker outside a segment ("{S} and {T} met at
{place}…", "…{s} did not stay to try twice", "{G} was between {S} and {T}…"), so those are only used for a known striker.
If you write `strike.unseen.<outcome>`, those lines win over both. Your "stopped" key is read as "checked": the engine's
`OUTCOME_TEMPLATE_KEY` maps stopped → checked, so the `stopped` blocks go unread.

⚠️ **Smoke 433 is fixed.** It walked every template block expecting rival/mutual/stranger. `strike` is keyed by mode, so
it now has its own check: every outcome in both modes.

⚠️ **A preposition before an empty place now drops with it**, because your "did not come back from {place}" would have
printed "from ." when a minted figure's home isn't a real location.

## §3 — Five joins that read oddly on a real pass (your words, your call)

From a seeded run of the real pass, with the optional segments filled in:

1. *"The Glad Dissolution made the strike on The Still Lattice at The Grand Lattice in the open, a reveler of the
   Churnfolk, never where they were and did not carry it."* The `{sHow}` fragment runs straight into "and did not
   carry it".
2. *"The One Who Called the First Moot declared the strike and carried it. The Starless One fell at The Slow Stair, a
   founder of the Rootkin, roots lifting…"* The striker's `{sWho}` and `{sHow}` land on the victim's sentence.
3. *"…when the strike came, the note doing what the hands only shape, with Worldsong, which was not an accident."*
   "which was not an accident" attaches to the power.
4. *"…found Halvex Coil, the Rewriter first. The One Called Loki sent it, a broker of the Bargainers… — Halvex Coil, the
   Rewriter was of the Cogitants."* `{gWho}` is "of the Cogitants" when a figure has no fighting style, so "{G} was
   {gWho}" reads "was of the Cogitants".
5. *"…and The Raw Chord stood in the way, an amplifier of the Threnodists…"* This one is fine; it's here only because
   `{gWho}` after "stood in the way" parses well when it comes right after the verb, and less well after a place.

`{sWho}` is "a devourer of the Umbrals" when the figure has a fighting style, or "of the Lattice-Cities" when it has
only a tradition, so a slot that needs a noun phrase should allow for both.
