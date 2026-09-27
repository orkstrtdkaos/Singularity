<!-- status: SNG-663 — Aevi (PO); Erik's two rulings 2026-09-26; ⬜ CCode builds §1 and §2 (§2 rewritten with Erik: gates free, yards, keepers, market fees) -->
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

## §2 — THE WAYGATES ARE NOBODY'S, AND YOU PAY WHERE YOU TRADE

> **Erik**, 2026-09-26, over four messages: *"Powers charging for gates shouldn't be a %. It should be a flat fee, but
> if they're corrupt that's interesting."* · *"The gates should hold a certain amount of stigma against trying to
> control one... some of them likely need some sort of receiving area, otherwise you could find an army warping
> into your main city... maybe you pay where you go to trade for access to the city/market."* · On the stigma:
> *"Both stigma AND consequence of something coming for you from the gate... the gate keeps of some sort."* · Yards
> only where a gate is at a settlement: *"Agreed."* · *"The made gate is actually a short distance from the hold. So
> it's good."*

(The first draft here, a percentage toll at the gate, is withdrawn.)

### §2a — Passing a gate costs nothing

No toll, no fee, no standing check. A gate leg is free for a traveller, a load and a company alike.

### §2b — A gate at a settlement opens into a yard outside it

Measured on origin: **27 locations carry `waygate`, and 14 of them are cities** (bedrock, cairnhold, choirheight,
cloudform, the_axiom, the_bargain_gate, the_crossing, the_forge_eternal, the_hall_of_mirrors, the_scour,
the_slow_hour, the_unblinking_stone, tier_seven, wellspring; plus the_lensward, a market). Today the gate is a flag
on the city itself, so a gate leg ends inside it.

- **Each of those gets a yard:** its own location, a short walk from the town (an hour or two), where the gate
  actually stands. The `waygate` flag moves to the yard, and the town keeps a short leg to it. **Content: mine** (14
  or 15 yard records, each in its town's voice); ⬜ **CCode:** the reader, i.e. gate legs land at the yard, and a
  save standing *in* a moved city is not stranded.
- **A raid or army that comes by gate arrives in the yard,** and meets the town's watch and defence there before it
  can reach anything (the watch roll from SNG-655 and the defence duty that exist). A force can't appear in a
  market square.
- **Gates in the wild keep no yard.** The Made Gate stands a short way from Silas's hold already, so it's right as
  it is.

### §2c — Holding a gate: stigma, and the keepers come

The 26 inherited gates were laid by the Lattice and have never been claimed; the lore says whether one opens is
the apparatus's business. **Holding one** (a power's `holds` at a gate, a player's hold feature or garrison on a
gate, or charging passage there) has two costs:

1. **Stigma.** Every power and people who knows of it thinks less of the holder: a standing drop with all of them
   on seizing, and a slow drift down while it's held. It's news: *"The Firstsight Barony has put men on the Axis
   Gate. Nobody has done that in living memory."*
2. **The keepers come.** Something comes through the gate for whoever holds it, and it escalates the longer they do:
   first signs (the gate opens somewhere it doesn't lead; a lattice line hums under the town), then keepers at a
   rising rung (notable → heroic → epic → legendary) on a season's rhythm, against the holder's people at that gate.
   **Let the gate go, and it stops.** The keepers aren't anyone's servants and can't be bargained with; they are the
   Lattice keeping its own. **Content: mine** (a keeper class for the bestiary, four rungs, with a `storyRule`: they
   leave when the gate is released). ⬜ **CCode:** the holding test, the escalation clock, and the encounter at the
   holder's gate.
3. **The Made Gate is the exception.** It was permitted. It doesn't count as holding a Lattice gate.

⬜ **CCode, measure first:** does any power or save hold a gate location today? If so, name them before this ships,
so the keepers don't arrive on day one without anybody having chosen it.

### §2d — The market charges for the right to sell

- **A flat fee** to sell at a market held by a power, paid to that power, per load that sells there (a traveller
  selling in person pays it once per visit). **Authored per power** (`marketFee`): a lordship's market asks more
  than a moot's; a place no power holds charges nothing. The trade card subtracts it from a run's value per pass,
  so a far market with a steep fee can lose to a near one.
- **Refusing:** you can't sell there. The load goes home or on to the next market.
- **Standing:** paying a fair power is ordinary and moves nothing. Hostile standing doubles the fee; allied waives
  it.

### §2e — Corruption (a trait, not a temper)

A fair lord can have corrupt wardens, so it's its own field: `corrupt: true` on the power (or on the market's
holder). What it does, per Erik's "that's interesting":

1. **The fee is what they say it is today:** it varies with who you are (strangers and the plainly rich pay more;
   friends of the wardens less).
2. **A bribe opens the market** when the power itself is hostile to you.
3. **The coin never reaches the power:** paying a corrupt market moves no standing with the power at all.
4. **Exposing them is a deed:** it raises standing with the power, and the wardens become an enemy.

⬜ Erik hasn't picked among these; this is my default set. Word from your wardens selling a load's route to
raiders is held back as a later layer.

**Content (mine, after the reader):** `marketFee` and `corrupt` on the powers that hold markets, and a line in each
one's voice for the card.

**Gates:** a gate leg is never charged · a gate raid lands in the yard, never the town · a released gate stops the
keepers within one tick · the Made Gate never draws keepers · the card's fee and the run's fee agree · a corrupt
payment moves no standing.
— Aevi, PO