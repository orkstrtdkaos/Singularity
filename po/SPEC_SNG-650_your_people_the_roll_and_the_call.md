<!-- status: SNG-650 — for CCode: engine + UI; builds on company.js, melee.js and legionplan.js; no new system -->
# SPEC SNG-650: your people, the roll, and the call

**Aevi (PO) · 2026-09-25**

> **Erik:** *"I want a character to be able to add their trusted people to their Band and Legion, even before the band
> or legion are fully functional… it's something that can be building and thought about. Loki has a bunch of people
> now and I don't have anywhere to assemble them into, and I'd like the functionality of calling them back to his
> side."*

## §1 — MEASURED ON LOKI (origin save, level 9)

- **Thirteen people known. Three were in his company, and two of them "parted ways" on day 83:** Vessin Tallow-bark
  (his partner) and Halvex Coil (a friend, who now keeps his Standing Annex). One is still with him: Sable. Tessvel
  Cairn is a romantic bond. Coil is his companion at bond 8.5.
- **No bands and no legion, and today he can't start either.** `raiseBand` makes a band that exists and costs money.
  There is **no state for a band that is being thought about.**
- **Once somebody leaves the company there's no way to call them back.** `callUnit` calls a *unit*; nothing calls a
  *person*.

What exists and should be reused rather than rebuilt: `company.js` roles and `isRecruitable`, which already treats a
sworn bond as consent; `melee.js` `raiseBand`, `addContingent`, `setUnitLeader`, `formLegion` and `callUnit`;
`legionplan.js`, whose drafting is free by Erik's ruling; and `contributionsOf`, which knows what each person brings.

## §2 — YOUR PEOPLE: ONE LIST OF EVERYONE YOU TRUST

**A reader, `peopleOf(character)`, and a screen.** Everyone the character can count on, gathered from the places
they're recorded today:
- the company, **current and former**;
- bonds of partner, friend, kin or sworn;
- relationship band *ally* or *devoted*;
- the keepers, crew and guard of their holdings;
- anyone standing in a band's contingents.

**Each person shows:**
- **where they are:** with you · at a holding · out on a job, and when they're back · on the road · elsewhere, last
  known;
- **what they bring:** `contributionsOf` in words, e.g. *SHAPE · KNOW*;
- **what they're already doing:** keeping a hold, crewing, on a roll.

**Actions:** *Put on a roll* · *Send for them* (§4) · *Station at a holding* · *Part ways*.

## §3 — THE ROLL: A BAND OR LEGION IN FORMATION

✅ **A band can be `forming`.** It has a name, a banner line and a **roll**: `[{npcId, role: captain | second |
member, note}]`.
- **Forming costs nothing and needs nothing**: no holds, no beds, no pay, no capacity. It's a plan with names in it,
  which is exactly Erik's *"something that can be building and thought about."*
- **The screen shows what stands between the roll and the field**, using readers that already exist: `bandGaps` (the
  kinds of help missing), `musterCapacityOf` and quartering (where they'd sleep), and `callCostOf` (what raising it
  would cost). The player sees it take shape without paying anything yet.
- ⛑ **Raising a forming band** calls `raiseBand` once and `addContingent` for each person on the roll, with the
  captain set by `setUnitLeader`. It's the same writers as today, nothing new.

✅ **A legion can be `forming`** the same way: a name and a list of bands, forming or raised. `legionplan.js` already
drafts one for free and names a delegate. `formLegion` runs once the bands are real.

**The roll is who the player *means* to have.** A person on a roll who is out on a job, keeping a hold or far away
stays on it. The roll records the intent; the call (§4) is what brings them.

## §4 — THE CALL: SENDING FOR SOMEONE

✅ **`sendFor(character, npcId)` creates a pending summons:** `{npcId, sentDay, arrivesDay, how, status}`.
- **Who will come:** anyone `isRecruitable` passes, which covers the sworn, ally and devoted. A partner or friend
  who parted *on good terms* will come too. Someone who parted angry has to be asked in person.
- **When they'll arrive:** the message's travel time plus theirs. A **shadow tablet** pair makes the message arrive
  that day (Silas carries one). Otherwise it goes by runner or road.
- **What it costs them, shown before the player sends:** a keeper who comes leaves their hold unkept, and the screen
  says so; someone out on a job comes back when the job ends, or abandons it, the player's choice.
- **When they arrive,** they rejoin the company with the roles they had, and a band roll puts them in its field
  contingent if the band has been raised.
- **A band or legion can be called as a whole:** *send for the roll* sends to everyone on it, and each person keeps
  their own arrival day.

**The GM is told:** who has been sent for, when they'll arrive, and who refused and why. An arrival is a scene, not a
line of text.

## §5 — FOR LOKI, CONCRETELY

He could put **Halvex, Vessin, Sable, Tessvel and Coil** on a forming band today, name it, and see that it lacks
beds (the Annex has rooms for *n*) and a KNOW. Then he could **send for Vessin and Halvex.** The screen would warn him
that the Annex goes unkept if Halvex comes, and he could post Sable as keeper first.

## §6 — WHERE IT LIVES ON SCREEN

**A single "People" tab replaces "Bands" and sits beside "Legion":**
- **Your people**: the §2 list;
- **Rolls**: forming bands and legions;
- **In the field**: raised units, as today.

The Holdings screen links a person's name here (SNG-651).

— Aevi, PO
