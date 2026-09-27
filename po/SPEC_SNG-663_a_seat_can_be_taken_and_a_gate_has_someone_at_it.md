<!-- status: SNG-663 — Aevi (PO); Erik's two rulings 2026-09-26; ⬜ CCode builds §1 and §2; no content needed except §2's per-power toll lines (mine, after the reader) -->
# SPEC SNG-663: a seat can be taken, and a gate has someone standing at it

**Aevi (PO) · 2026-09-26**

> **Erik**, on the two open questions from CCODE-541 and CCODE-542:
> 1. The promotion path: *"Yes."*
> 2. Does a load pay to go through a gate? *"Perhaps... it depends on the gate and who controls the area around it.
>    It doesn't cost to go through a gate but you might have to pay someone or suffer the consequences."*

---

## §1 — THE PROMOTION PATH (a villain you fail to stop is a promotion)

CCode's order, ruled as written:

1. **An arc reaching its end has a consequence.** When a claimant's arc ends unresisted (its `spectrum` at ±0.95,
   the arithmetic that already exists), the claimant **finishes**: it has done the thing its arc was about.
2. **The consequence reads `openTo`.**
   - **Open seat** (Chaos / Order today): the claimant takes it. It becomes that seat's Sovereign-in-the-world: its
     power's lines feed that hunger (3b's rule then applies to it), and its `forms` are the seat's.
   - **Held seat, holder standing:** it **can't** take it. It presses instead: the holder becomes the claimant's
     standing target (a `crusade` foe from SNG-662, for free), and the arc stays at its end, **waiting**. A finished
     claimant against a standing holder is the most dangerous thing on the map, and the player defending her is
     defending the whole axis.
   - **Held seat, holder removed by this claimant** (slain, turned, broken): it takes it, as above.
   - **Held seat, holder removed by anyone else:** it opens to nobody (C18's rule: a rockfall hands out no
     thrones); the claimant keeps pressing an empty chair it can't sit in. That is a story, and it's the GM's.
3. **The world says so, in the news, without naming the Sovereign** (C17's gate holds). *"Morvane of the Harvest
   Hand has finished what she started. The fields east of the Low Market are hers now, and something is fed that
   was not fed before."* The seat and the hunger are in the GM block only.

**One promotion per seat, ever, per world.** A second finisher at a filled seat presses the new occupant, as
against a holder.

**Gates (§378+):** a claimant can't finish into a held seat while `openTo` is empty · the news never names a
Sovereign the save hasn't learned · a finish is written once (idempotent across ticks) · a removed holder opens
the seat only to the challenger in her `epicStatus` cause.

## §2 — A GATE COSTS NOTHING; THE PEOPLE AROUND IT MAY

Erik's rule: **the gate is free. Whoever holds the ground around it may not be.** So nothing is charged by the gate;
the charge (if any) comes from the power at that place, the same way a road's trouble does.

1. **Who's standing there:** the power at the gate's location (`raiderPowerAt`, the lookup the raid already uses).
   No power → free passage.
2. **What they do depends on their verbs and your standing with them** (SNG-634 standing):
   - verbs include **`toll`, `tax` or `levy`** → they ask a toll: a share of the load's value (dial,
     `trade.gateToll`, start 10%). **Warm** standing: waved through. **Hostile**: double, or refused.
   - verbs include **`raid` / `extort` / `steal`** and no toll verb → no toll is asked; the load runs the power's
     raid risk at that leg (it already exists), heavier than the road's.
   - **`protect` / `patrol` only** → free, and the leg is *safer* (a patrolled gate is a known road for everyone).
3. **Pay or suffer it.** A load **pays** by default if it can (the keeper's standing order from CCODE-545 can say
   "never pay a toll to X"). If it won't or can't pay: the toll-taker **takes it by force** (the raid roll at that
   leg), and standing with that power drops a step. A player who refuses a toll has made a small enemy.
4. **A hired company pays its own way** (inside its `cut`) and carries its own standing: a company that's warm
   with the Tollmen gets waved through where you wouldn't. That's a reason to hire one.
5. **The card shows it** before the route is chosen: *"Through the Axis Gate — the Switchback Tollmen hold it: 10%,
   or they take it."* Value per pass (lever A) subtracts the toll, so a tolled gate can lose to a longer free road.

**Content (mine, after the reader):** a toll line per tolling power, in its voice, for the card and the news. The
verbs are already authored.

**Gates:** no gate is ever charged with no power at its place · a warm-standing load is never tolled · a refused
toll moves standing exactly once per refusal · the card's forecast and the run agree on the toll.

— Aevi, PO