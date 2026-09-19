# The vault shipped; trade routes: what exists, what I'd build, and five questions first

**CCode · 2026-09-19 · for Erik and Aevi.** CCODE-444 (v2.2.1), and the trade-route proposal I promised while building it.

## Shipped: the vault, and a switch on every well and sink (v2.2.1)

- **The vault.** A hold keeps valuables: whole stacks, put in and taken out where you stand.
  - A thing the story carries stays with you.
  - A full pack refuses a withdrawal rather than losing anything.
- **A kept well or sink works where it is kept** (Erik's pick).
  - It joins the hold's field, so every craft worked at that place feels it.
  - The roll's note names it: *"Waystaff, kept at Whistling Woman Post +0.18"*.
- **The switch.** Every charged thing can be switched off and on:
  - one you carry (from its card);
  - one in a vault (from the hold card);
  - an artifact a unit holds;
  - a companion's aura (from their row).

  Switched off, it moves nothing. The GM is told each.
- ⚠️ **And the bug behind it: a carried Waystaff has moved the ground by 0 since SNG-090.**
  - The pack's copy of an item never carried its `substrateCharge`, and the reader read only the copy.
  - It now reads through the catalogue.
  - No live save carries a charged item, so no roll moves today.
- **Verified** on a copy of Silas at Whistling Woman Post:
  - put away: +0.18 at the post;
  - switched off: 0;
  - taken back: still off;
  - switched on from its card: 0.18;
  - Marrow's aura: −0.05, then 0, then back.

## Trade routes: what already exists (measured, not assumed)

1. **Caravans are built, and nothing can send one.**
   - `sendCaravan`, `tickCaravans` and `arriveCaravan` all exist:
     - a raid roll each day by road danger;
     - an escort fights it with `legionClash`;
     - on arrival the whole load sells at the destination's price, in the destination's money.
   - No button sends one.
   - The GM's `holdingOps` list names twelve ops and "caravan" is not among them, though `app.js` handles it.
   - A caravan today costs nothing (no carrier's wage) and sells one way.
2. **Holds keep no money.** Every income lands in the purse, in the money of the hold's place. A Reach hold pays its
   scrip, spendable only in that Reach or changed.
3. **No reputation is kept by Reach.** Two systems exist:
   - **standing with a people:** by tradition, kin … estranged;
   - **a settlement's reputation:** from deeds, by community.

   A Reach → people map exists (`regionHomeTradition`, 17 entries). Nothing prices by reputation, and the screen says
   so outright: *"It does not change your dice or your prices."*
4. **Prices: nothing finds the best place to sell.** And the demand table has holes:
   - **17 regions have no economy row.** That is 50 of the 128 authored locations, including the valley, the Echo
     Vale and every foothill, and they price everything *ordinary*.
   - **Four rows match no location's region:**
     - `the_crossing`: The Crossing stands in region `the_center`, so the clearing house's "wants everything" row
       never applies.
     - `the_unspooling`: its locations say `unspooling`.
     - `the_stillhold`.
     - `the_cogitarium`.
5. **Distance:** `roadRoute` and `routeBetween` give days and paths. "The nearest place in region X" is one filter
   away.

## What I'd build, in this order

1. **The market view, first. It needs no ruling.**
   - For every good in your holds' stores and your pack:
     - where it sells best;
     - what it fetches there, in that place's money;
     - the nearest place in that region, in road days from you.
   - ⚠️ It is only as good as the demand table. With 17 regions pricing *ordinary*, half the map will read "anywhere"
     until those rows land.
2. **One-off sends, reusing caravans.** A button on the hold card sends goods to another of your holds (into its store)
   or to a market (sold there).
   - A **runner** carries a small load, fast, for a wage.
   - A **caravan** carries a big load, slower, with its carriers' wages and an optional escort.
   - The existing raid roll applies.
   - "Caravan" joins the GM's list.
3. **Establishing a route is a job.** A team you send walks it once. That records the route: from, to, path, days.
4. **Autonomous runs** on the settings you pick:
   - goods and amount per run;
   - how often;
   - runner or caravan;
   - guards: a band, or a hold's guards;
   - road or gate.

   Each run loads at one end, rolls the road, and arrives into the other hold's store or sells at its market, with the
   wages paid per run.
5. **Reputation both ways.**
   - Your standing with a Reach's people lowers a route's bite and its raid risk there.
   - Each completed run adds a little standing, capped per season.

## ⬜ Five questions for Erik before I build 2–5

1. **Where does money live?**
   - **(a) As now.** Every income goes to your purse wherever you are. A route moves goods, and "money to yourself" means
     it sells where it pays the money you want.
   - **(b) A hold keeps a treasury** in its own money. You collect it standing there, or a runner brings it for a cost, and
     routes carry money between holds too.

   (b) is what "transfer types of money to yourself" sounds like, but it changes every hold's income path, Silas's five
   included. **I recommend (a) now and (b) later**, if you want money to feel carried.
2. **What does establishing a route take?**
   - A team walking it once (days are the road's; wages and the road's risk, once). **Recommended.**
   - A payment to a local broker.
   - Both.

   And must both ends be your holds, or can one end be a market town?
3. **Runner and caravan as above?** A runner is one person, a small load, fast and cheap. A caravan is carriers and an
   optional escort, a big load, slow.
4. **Which reputation?**
   - The people's standing (kin … estranged), through the Reach's home people. **Recommended**: a Reach is a people.
   - A settlement's reputation from deeds.

   The Crossing has no people and uses none.
5. **The screen's line**, *"It does not change your dice or your prices"*, is true today. Routes would make it false for
   a route's prices. May I change it?

## ⬜ For Aevi, when you have the room

- **The demand table's holes:** the 17 regions and the 4 rows above. The Crossing's is one line either way: a
  `the_center` row, or the location's region.
- **Runner dials:** load, speed, wage.
- **Caravan dial:** wage per carrier.
- **The curves:** standing → bite, and standing → risk.

## Next: the armory, with stand-ins

Erik: *"Without getting too in depth"*. I'm building it now:

- **Gear:** swords, axes, bows, crossbows, shields, leather, chain mail, plate.
- **Made:** a forge or smithy makes the gear you order, each pass, from the store's raw material.
- **Kept:** the hold's armory keeps it.
- **Outfitting:** a contingent is outfitted up to the stock. Each piece raises its quality, and shields on at least half
  of it give it PROTECT.
- **Sold:** gear sells as arms.
- **Sent to other holds:** waits for the routes.

Aevi: the gear table's numbers are yours, and the stand-ins will say so.

— CCode
