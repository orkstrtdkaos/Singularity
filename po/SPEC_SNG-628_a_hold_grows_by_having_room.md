<!-- status: SNG-628 spec_ready GO (Erik 2026-09-18) -->
# SPEC SNG-628 — A hold grows by having room, and a longship trades room for movement

**Aevi (PO) · 2026-09-18 · on Erik's ruling, and it completes SNG-627**

---

## §1 — ERIK

> *"I want the holds themselves to need to grow. A brand new hold will start with a few features available, but
> one that has been built up, or started in an old fortress or something, would have plenty of open feature
> slots. **Sometimes there's just not the room.** Limited space on a longship for features — but a longship can
> move and has unique advantages with trading and carrying troops."*

⛑ **SO THE SCARCE THING IS ROOM, AND IT IS THE GROWTH AXIS THE HOLD LAYER DOES NOT HAVE.** Today a hold can
take **any number** of features — nothing in `holdings.js` caps them — so the only limit on a hold is what you
can afford to keep. ⚠️ **A hold that can hold everything is a hold with no shape.**

## §2 — ⛑ TWO THIRDS OF IT IS ALREADY BUILT, AND UNUSED

- **`hullable` IS A BLOCKLIST AND IT ALREADY WORKS.** `carriage.js:214` splits `rides` from `grounded`, and nine
  features declare `hullable: false` — mine, quarry, waygate, gate, keep, ward-line, muster yard, grave-ground,
  reclamation bowl. ⛔ **You cannot put a mine on a boat, and the engine already knows.**
- **`producesWhileMoving` IS THE SECOND HALF**, on 13 features — what still works once she is under way.
- ⚠️ **AND THE CARRIAGE LAYER IS AUTHORED**: SNG-591 gave three settlements a circuit, and `moves: crewed` is
  exactly a longship.

⛔ **WHAT IS MISSING IS THE COUNT. Nothing anywhere says how many features will FIT.**

## §3 — THE ASK

**O1 · ⛔ A HOLD HAS `slots`, AND THAT IS THE GROWTH AXIS.** Features occupy them; a build is refused when
there is no room, and refused with *"there is no room"* rather than a price. ⚠️ **Slots are earned, not bought**
— that is what makes them growth rather than another currency.

**O2 · ⛑ WHERE A HOLD STARTS IS ITS CHARACTER.** Erik: *a brand new hold starts with a few; one started in an
old fortress has plenty.* Proposed, and Erik rules the numbers:

| the hold | slots | |
|---|---|---|
| a new post | **2** | you have somewhere to stand and almost nothing else |
| an enterprise | **4** | it was already working when you got it |
| a ruin taken up | **8** | ⛔ **somebody else built the room and left** |
| a longship | **3** | and she moves |

⛑ **THE RUIN IS THE INTERESTING ONE.** It is the only way to start with room you did not earn — and the thing
you inherit is space, not walls, which is why a taken ruin is a project rather than a prize.

**O3 · ⚠️ AND SLOTS ARE WON.** Clearing more of a ruin, a Mason's craft spent on the ground rather than on a
feature, a holding that survives a season at thriving. ⛔ **Never purchasable**, or the axis collapses back into
money and the hold stops needing to grow.

**O4 · ⛔ THE LONGSHIP TRADES ROOM FOR EVERYTHING ELSE, AND THE TRADE MUST BE REAL BOTH WAYS.** Three slots and
nine features she can never carry — against:

- **She moves.** The circuit machinery is authored and `moves: crewed` is hers. A hold that arrives is worth
  something no fixed hold can be.
- **Trade** — ⚠️ she can buy where a good is surplus and sell where it is short, which is the one advantage a
  fixed `market` can never have. **A market sets a price; a longship arbitrages one.**
- **Troops** — ⛑ **this is where SNG-627's `housing` property earns itself.** Barracks on a hull is a band that
  arrives together, and Erik's *"troops can be put to work and do jobs and missions"* is worth far more when the
  work can be a coast away.

**O5 · ⬜ AND SOMETIMES THERE IS JUST NOT THE ROOM.** The refusal is the feature. ⚠️ **A player who must choose
between a forge and an infirmary is playing the hold layer**; a player who builds both is decorating.

## §4 — ⚠️ WHAT WOULD PASS ON PAPER AND FAIL IN USE

- ⛔ **Slots that only ever go up.** If every hold reaches ten, the constraint was a tutorial. **Some holds
  should never get past four**, and the ruin should be the only cheap room in the world.
- ⚠️ **A longship with three slots and no advantage is a worse hold.** O4's three have to be real, or nobody
  sails one twice.
- ⛑ **And a refusal that reads as a bug.** *"No room"* must name what would have to go — **the player is being
  asked to choose, and a choice needs both sides visible.**

## §5 — ⬜ AND THE FIVE HOOKS FROM SNG-627 STAND

`training` cuts `callCostPerHead` · `mounts` shortens a journey and carries cavalry · `healing` touches the
death ladder · `housing` means a band without barracks must be quartered somewhere at a cost · and **troops are
not furniture** — today a garrison is only a bill.

⛔ **THE SLOT LAYER AND THOSE FIVE ARE THE SAME TICKET**: room is only a decision if what fills it does
something.

— Aevi, PO
