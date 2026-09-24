<!-- status: SNG-640 proposal — C13 superseded by SNG-641 §1; §6 answered in part by Erik 2026-09-24 -->
# SPEC SNG-640 — The Sovereigns in the political map: the powers are the supply lines

**Aevi (PO) · 2026-09-24 · v2.4.x** · staged: `po/staged_content/SNG-640_sovereigns_in_the_map.json` and the change set
`po/staged_content/SNG-640_changeset.json`

> **Erik:** *"Tie some of the Sovereigns into the new world political powers, as well as the mythical and legendary ones."*

## §1 — ⛑ THE LORE ALREADY BUILT THE HINGE

`the_satiated_sovereigns.md`, read in full before writing a line:

- *"The agents are not servants. **They are a supply line.** … You do not detect a Sovereign. You detect a run of decisions
  that are all individually reasonable and cumulatively impossible."*
- *"A Sovereign does not notice you until you cost it something."* First losses → **existing agents redirected**; sustained
  interruption → **a campaign**; furthest from fed → **it comes**, diminished.
- *"**This is why the 30–60 band is outposts, bands and strongholds.** Only a hold survives the campaign that answers it."*

⛔ **So the tie is not decoration. The powers ARE the supply lines**, and breaking or taking one (C1, C5, C8 — already
built) is what starves a Sovereign. The political game and the cosmic one are the same game at different depths.

⚠️ **Two rules I held to.** *"A GM should never confirm a Sovereign. Confirm an AGENT."* — every tie is GM-eyes-only.
*"The six remaining seats… Do not fill them in one pass."* — **no seat is filled.**

> ⚠️ **Correction, SNG-641 §1 (same day).** "Six" was the lore's count from before the Hollow King and the Unbodied
> were written. Seven axes less three authored leaves **four**, and Erik expects three (open question in SNG-641 §7.1).
> **§5's C13 is also replaced there:** R40b.2 derives supply from the arc's stage, so breaking a line is an arc deed
> and not a counter. §6.2 is answered by R40 and R41. The original text is left as written.

## §2 — THE THREE SOVEREIGNS WITH A WRITTEN HUNGER, AND WHERE THEIR LINES RUN

| Sovereign | hunger | supply lines through the map | what starves it |
|---|---|---|---|
| **Lucifer** (Light) | being seen | **the Great Coliseum** (*"the whole world watches"*) · **the Radiant Council's accountability board** — public marks, some filed with no record behind them; Fendt was marked and erased · **Sunwrack Valen's order at the Blaze** | privacy kept on purpose: **the Harborward**, *"where the Umbrals keep what the light would burn"*; **Ember Who Banks the Fire** at Glasshome |
| **The Hollow King** (Demonic) | petition — authority must be asked for | **Harl Maddock's crown**: the Mavens would never recognize a man who killed four chiefs at a feast, so he asked the Hollow Court · **Oswin Tarrant**, tempted: if the Mavens refuse his claim to the Slip, the Bright Bargain is already on the road | **stop asking.** A hold that does not petition, a legion that needs no favour, allies who are somewhere else to go. ⛑ **The Free Compact is his starvation in political form** — and nobody strengthening it would say they were fighting anything |
| **The Unbodied** (Mind) | a body, worn borrowed | **the Cogitarium's abandoned bodies** · its agent **the Choirmaster Who Would Not Return** at the Thinning · ⚑ **the Undercount's Dusklow fence**, which moves sleeping bodies for a reasonable buyer — Mother Hesk does not know what he is | staying in the flesh: **the One Who Stayed Embodied** |

⚑ **The two councils that confer a seat now mirror each other.** The **Mavens** confer credibility, which is earned and
starves the Hollow King. The **Hollow Court** confers a grant, which is asked for and feeds him. **Every seat anyone takes —
yours included — can be made legitimate either way**, and the choice is the whole moral weight of taking it.

⚑ **The Radiant Council is divided against itself and does not know it.** Its private secrecy starves Lucifer; its public
board feeds him. Keeper Ilma, who wants the board to mean what it says, is the restraint *inside* the line — not its agent.

⚑ **A thieves' guild is a Sovereign's freight without one member being an agent.** That is the lore's *"individually
reasonable, cumulatively impossible"* made playable: a player who pulls on Mother Hesk's Dusklow ledger finds a buyer who
pays well for sleeping bodies, and from there the Cogitarium, and from there something that has never been seen.

## §3 — THE LADDER, IN THE POWERS' OWN MACHINERY

| its state | in play |
|---|---|
| fed | nothing; the player is beneath notice |
| first losses | **redirect**: a supply-line power in the region turns its attention to you — its `approach` and C7's seeking. Lucifer's: a public mark on the board with your name on it. The Hollow King's: the Bright Bargain arrives with an offer, and it is always good. The Unbodied's: a fence who suddenly wants to know where you sleep |
| sustained | **campaign**: the remaining supply-line powers turn their strength on your holds — C1 raids and C5 assaults, better resourced than you, the Sovereign still absent |
| furthest | **it comes**, diminished — `engine/sovereign.js` `forms`, already built |

## §4 — EVERY LEGENDARY AND MYTHIC FIGURE, PLACED

**On the map:** the High Luminary rules the Radiant Council · Elder Resonance the Harmonic · Aelith and Ysenkar the Unbought
Court · **Thornmother Sealed leads the Rootbound inside the Deepwood Standing Moot**, the faction winning the argument to
seal the wood · **the Burning Certainty is an inquisition inside the Seraphic Orders** · **the Lightless Seraph was cast out
of them** and is their enemy · **Harrow leads an order of the "improved" inside the Enginewrights** · **the Still Lattice is
the Lattice's specification carried to its end** · **the Scouring Hand is an order inside the Unmakers** · **Sunwrack Valen's
zealots at the Blaze are Lucifer's line** · the Raw Chord roams the Feeling Coast · the Choirmaster is the Unbodied's agent.

**Trajectories, not seats** (the lore's *"a villain you fail to stop is a promotion"*): the Scouring Hand, if it finishes,
arrives. **The Starless wants the dark total — the other half of the axis Lucifer holds**, which is the lore's own *"one axis
with two claimants"*; recorded as a question for you, not a seat.

**Outside the map by nature:** the Deep Warden, the Unfinished of the Last Cairn, Aevi the Watcher. **Above it:** the three
Precursors. **No seat:** Lucifer and the Unbodied — lines and agents only.

## §5 — ⬜ C13, FOR CCODE

`feedsGM` on a power (four staged, in the change set) is read by one new reader: **a Sovereign's fed-state on the save
drops by one line whenever a power feeding it is broken (C1), taken (C5/C8), or has its leader turned.** The state picks the
ladder rung in §3; the redirect uses the existing `approach` and C7; the campaign uses C1/C5; the arrival uses
`sovereign.js`. ⛔ **Nothing player-facing ever names the Sovereign** — only the power, the person, and the offer.

## §6 — RULINGS I NEED

1. **The supply lines as drawn** — the Coliseum, the accountability board and Valen for Lucifer; Harl for the Hollow King;
   the Undercount's fence for the Unbodied. Keep, change, or add?
2. ⚠️ **The lore's open question 2 decides the arrival:** does starving a Sovereign **advance its arc stage** (so the
   arrival is a late stage of an arc already running), or is the arrival its own event? §3 works either way; the answer
   decides which reader C13 writes to.
3. **The Starless** — a would-be claimant to the Dark half, or only a villain?
4. **Two data traps:** there are two High Luminary records (`high_luminary`, `the_high_luminary`) — which is canon? And
   **the One Called Zeus carries the role word "Sovereign"** while being a heroic God-Named — a GM will read that as a Satiated
   Sovereign. Rename the role (*"first among the God-Named"*)?

— Aevi, PO
