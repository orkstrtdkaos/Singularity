<!-- status: SNG-566 spec_ready GO (Erik 2026-09-13: "spec what happens when we die so CCode can build it correctly") -->
# SPEC SNG-566 — What happens when you die

**Aevi (PO) · 2026-09-13 · measured before designing**

---

## §1 — ⛑ MOST OF THIS IS ALREADY BUILT, AND IT IS RIGHT

`engine/death.js` (SNG-209) already says the thing this whole cosmology needs it to say:

> **"death is a STATE, not a terminus."**

Four depths — **the threshold · the near dark · the deep dark · the sealed** — computed from days-dead,
body status and fate-binding. `deepenDeaths` sinks untended deaths on the **world clock**. `holdOpen`,
`slowSink`, `releaseHold`, `canReach(rank, intensity)`, `resolveRetrieval(entity, outcome, {changed})`.

⛑ **AND THE PLAYER IS ALREADY ON THE LADDER**, deliberately — `battle_turn.js:432` puts the character
through the same `enterDeathState` every figure gets, and `worldtick.js` has the reason in its own words:
*"Putting the player on the death ladder is only half the job — the clock has to reach them too, or 'your
party can still come for you' is not a race against anything."*

⛔ **AND `character.dead` IS FORBIDDEN EXCEPT FOR A SEALED DEATH** — `incapacitation.js` states it: that flag
"makes the roster say their story is over and refuse to load the character — it is the TERMINUS."

**So the model is correct, wired, world-clocked, and applies to the player. I am not redesigning it.**

## §2 — ⛔ AND THE PLAYER IS NEVER TOLD ANY OF IT

⛑ **MEASURED: `deathDepth` and `DEATH_DEPTH_NAMES` have ZERO player-facing readers.** The only death-state
read anywhere in `app.js` is `heldOpenBy`, on an NPC.

⚠️ **THE ENGINE KNOWS EXACTLY WHERE YOU ARE AND HAS NO WAY TO SAY SO.** `death.js`'s own header names the
gap and defers it by name: *"the roads BACK (per-tradition method, the retrieval quests, **player-death
UX**) are content/design that build ON this model."* **That deferral is this ticket.**

---

## §3 — ⛔ THE DESIGN, UNDER *IT IS*

**`power_cosmology.theMiddleWay._defined` decides this and it decides it cleanly.** Death, ending and the
unchosen branch are **parts of the system that IS**. What is fought is a *direction*, not an act.

So the two standard RPG answers are both foreclosures:

| | | |
|---|---|---|
| **Respawn / reload** | insisting the ending did not happen | ⛔ foreclosure by DENIAL |
| **Delete the character** | insisting one ending is the only ending | ⛔ foreclosure by HASTENING |

⛑ **THE MIDDLE IS ALREADY THE MODEL: the ending is real, it has a depth, and the road back exists, costs,
and changes you.** SNG-209 built the middle way before the middle way was canon.

### O1 · The player is told where they are, in the authored words

**"You are at the threshold."** Then the near dark. Then the deep dark. ⛔ **Show the depth, and show that it
is MOVING** — a descent the player cannot see is a timer, and a timer nobody can read is not a race.

⚠️ **AND SHOW WHO CAN REACH YOU AND HOW FAR THEY WOULD HAVE TO COME.** `canReach` already answers it.

### O2 · ⛔ YOUR DEATH IS NOT YOUR EVENT. IT IS THE WORLD'S.

**This is the design's spine and it is what makes it this game's death rather than a genre default.**

You cannot retrieve yourself. Someone has to come. ⛑ **Which makes every relationship the game has been
building into a mechanic at exactly the moment it matters most** — the party, the Fellowship, a companion,
an NPC who owes you, **another player character** (SNG-552's shared world is what carries this).

⚠️ **AND THE CRAFTS ARE ALREADY THE SYSTEM, AUTHORED, WITH THE LADDER IN THEIR OWN PROSE:**
- **`Calling Back`** — *"the Ashwarden road runs both ways, and this is the walk back… THE DEEPER THEY HAVE
  SUNK, THE HARDER."* The retrieval. ⛔ And its limits are already written: not the **sealed**, *"who refuse
  every road"*, and not *"anyone dead of a cause still acting — pull them back into a poison and they simply
  die again."*
- **`Names of the Lost`** — *"a name held is a name that cannot be meddled with, and one that stays
  reachable longer."* ⛑ **THAT IS `holdOpen` + `slowSink`, ALREADY BUILT.** Someone singing your name slows
  your descent. **It does not save you and it buys the road time.**
- **`Kept Breath`** — stands between a person and the threshold. The catch BEFORE the ladder.
- **`Ask the Dead`** — ⛔ **AND THIS ONE MAKES A DEAD PLAYER PLAYABLE.** *"The recently dead will answer you
  — poorly, briefly, and only about what they actually knew in life… each question costs them something."*
  **Your party can ask you questions, and you answer, and every answer sinks you further.** That is a scene,
  it is authored, and the player is IN it.

### O3 · The player is not out of the game while dead

⛔ **A death screen that ends the session is the denial answer wearing a different coat.** Three things a
dead player can still do, all authored:
1. **Answer** — be the voice on the other side of `Ask the Dead`, at a cost they can see.
2. **Witness** — the retrieval is a scene happening TO them; they should watch it.
3. ⚠️ **Refuse.** *"The SEALED, who refuse every road."* **Choosing the sealed road is a legitimate act and
   the game must let you make it.**

### O4 · ⛑ ACCEPTING THE ENDING MUST BE A REAL AND HONOURED CHOICE

⛔ **IF A PLAYER CANNOT STAY DEAD, DEATH IS NOT REAL AND THE COSMOLOGY IS A LIE.** An ending acknowledged is
the Ashwarden's own position and the middle way's plainest instance.

⚠️ **SO HONOUR IT RATHER THAN PUNISHING IT.** A sealed character becomes **a fact of the world**: a name
another player can meet, a figure in the codex, a name on a memorial — Silas's shrine already keeps names.
⛑ **`standing is established by what the seeded actually do`, and dying well is a thing done.** The player
makes a new character in a world where that person died and is remembered.

### O5 · ⛔ WHAT DEATH MUST NOT BE

- **No XP loss, no stat tax, no level drain.** `greater_arcs.designNote`: *"a stage changes THE WORLD'S
  BEHAVIOUR, never taxes the player."* ⚠️ **A death that debits a number has been converted into a fine.**
- **No respawn point. No silent reload.**
- ⛑ **AND WHAT COMES BACK IS CHANGED, NOT HEALED** — `Calling Back` says so, and `resolveRetrieval` already
  carries `changed`. **The change is content and it is mine to author.**

### O6 · ⚠️ THE COSMOLOGICAL STAKE, WHICH IS NEW SINCE SNG-209 AND MAKES ATTENDANCE URGENT

**Souls are power, and the Veil entities burn them.** ⛔ **AN UNATTENDED SOUL SINKING NEAR A THIN NEXUS IS
FUEL.** *(`power_cosmology.theTwoMethods`, `_theAppetite`.)*

⚠️ **SO WHERE YOU DIE MATTERS, AND IT IS THE MAP DOING WORK AGAIN.** A death at Millbrook and a death at the
Heartroot Hollow — the thinnest ground in the world — are not the same death, and `Names of the Lost`'s
*"cannot be meddled with"* stops being sentiment and becomes a ward.

⬜ **ERIK RULES WHETHER THE DEPTH CLOCK RUNS FASTER ON THIN GROUND.** My read is that it should, and that it
is the single best argument the game can make for the geography it already has.

---

## §4 — WHAT IS WHOSE

**CCode:** the player-facing death surface (O1, O3), the descent made visible, `canReach` rendered, the
`Ask the Dead` scene, and the sealed-choice path (O4). ⛑ **Nothing in §1 needs rebuilding.**

**Aevi:** the roads back per tradition, what `changed` means for each, the sealed-character-becomes-a-figure
content, and the prose for four depths a player will read at the worst moment of their campaign.

**Erik:** O4 in principle, and O6's thin-ground clock.

## §5 — ⚠️ WHAT WOULD PASS ON PAPER AND FAIL IN USE

- ⛔ **A beautiful death screen with no one coming.** If a solo player dies with no party, no Fellowship and
  no second character, the descent is a countdown to a sealed ending they cannot affect. **That is honest and
  it may be unbearable, and it is the case to design FIRST rather than last.**
- ⚠️ **Retrieval that is always taken.** If coming back is the obvious move every time, the ladder is a
  respawn with extra steps. **The cost has to bite and `changed` has to mean something.**
- ⛑ **And this cannot close on a green suite.** It closes when somebody's party comes for them, or doesn't.

— Aevi, PO
