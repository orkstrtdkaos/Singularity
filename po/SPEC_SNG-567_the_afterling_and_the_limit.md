<!-- status: SNG-567 spec_ready GO (Erik 2026-09-13) — addendum to SNG-566 -->
# SPEC SNG-567 — The Afterling, and why the player is already limited

**Aevi (PO) · 2026-09-13 · Erik's rulings, measured against the corpus**

---

## §1 — ⛑ ERIK'S RULINGS

1. **Death wardens exist for this.** *"That's why there are death wardens in the world after all."*
2. **Legends sometimes come; mostly it is the ones you have grown closest to.**
3. ⛔ **A FAILED RETRIEVAL: accept it, or be raised as an AFTERLING — and play a whole second half of the
   game as one.**
4. **You resurrect your fallen comrades too.** The relationship runs both ways.
5. **On death the player may: wait · make a new character · swap to another · have a friend attempt it.**
6. ⚠️ **"In your saved game we would need to make sure the player is limited."**

## §2 — ⛔ THE AFTERLING IS ALREADY NAMED IN THE CORPUS AND DOES NOT EXIST

`Raised Hand` (the Grave-Callers' craft) excludes it **by name**, in its own `notFor`:

> *"NOT FOR: **The recently living who are still ARGUING with their ending** — that is **The Unfinished**, and
> it is a different working."*

⛑ **MEASURED: there is no craft called The Unfinished.** The door is cut, the distinction is drawn, and there
is nothing behind it. ⚠️ **Erik invented the Afterling today and the content reserved its name and its
category some time ago.**

**And the surrounding vocabulary is already exact:**
- **`Raised Hand`** — *"a body that has FINISHED, set back to work. It does not think, does not remember."*
  ⛔ **That is the thing an Afterling is NOT**, and the contrast is the design.
- **`Deathless`** — *"you are alive and you stay alive, wearing something."* ⛑ **The living counterpart
  already exists**, which makes The Unfinished its true opposite rather than a new axis.
- **The Grave-Callers, in their own profile:** *"they hold a body past its ending and set it working, **and
  they do not ask first**."*

⛔ **SO THE AFTERLING CAN ARRIVE WITHOUT CONSENT, AND THAT IS THE STORY.** A Grave-Caller who reaches a
sinking soul is doing the Sovereign move at personal scale — *my will decides what you are* — to someone who
had not finished deciding. ⚠️ **That is not a flavour note. It is the whole second half's opening question.**

### ⚠️ AND THE CRUELLEST DOOR IS THE KIND ONE

`canReach`'s own comment: **"a FAILURE sinks them."** So the likeliest Afterling is not made by a villain.
**It is made by the people who came for you and got it wrong.** ⛑ Your party reached, the reach failed, you
sank, and something took what was left. **They came, and this is what came back.**

## §3 — ⛔ "MAKE SURE THE PLAYER IS LIMITED" — THEY ALREADY ARE, BY THREE THINGS, AND NONE IS A RULE

**1 · ⛑ THE CLOCK IS REAL TIME AND CANNOT BE PLAYED AROUND.** `absoluteWorldDay(nowMs)` — same epoch on
every device, never rewound by play. `death.js` defaults: **threshold 1 day · near dark 30 · sealed 120 —
REAL days.** ⛔ **YOU CANNOT GRIND A RESCUE. The dark closes on its own schedule whether you play or not**,
and swapping characters neither advances nor pauses it. **The limit Erik is asking for is already the
strongest one in the design.**

**2 · ⬜ REACH SHOULD BE RANK AND RELATIONSHIP — AND TODAY IT IS ONLY RANK.** `canReach` reads craft rank and
nothing else. ⚠️ **THIS IS WHERE ERIK'S RULING 2 BELONGS AND IT IS THE ANSWER TO HIS RULING 6 AT THE SAME
TIME.** *"Mostly it would be the ones you've grown closest to"* becomes: **reach = rank + bond.**
⛔ **So swapping to your own second character is ALLOWED and NATURALLY WEAK** — an alt who never met you is a
stranger with a craft, and reaches the threshold at best. **Marrow at bond 10 reaches the deep dark.** No
anti-alt rule is needed; the fiction is the limit.

**3 · ⛑ A FAILED ATTEMPT SINKS THEM — ALREADY BUILT.** `resolveRetrieval(entity, "fail")` is the costly path.
⛔ **SPAMMING ATTEMPTS BURIES YOU FASTER**, so repeated rescue is self-limiting and the limit is diegetic.
⚠️ **AND `canReach` ALREADY SEPARATES REFUSED FROM FAILED** — *"being told 'that is past your reach' must not
cost the person you were reaching for."* Trying is free; **reaching badly is not.**

## §4 — ⛔ THE ONE THAT NEEDS ERIK, AND IT IS URGENT

**120 real days to sealed means a player who puts the game down for four months returns to a sealed
character.** ⚠️ That is honest, it is *IT IS*, and **for a solo player it is a campaign deleted by a holiday.**

⛑ **MY PROPOSAL, AND IT IS FICTION RATHER THAN BOOKKEEPING: `holdOpen` ALREADY STOPS THE CLOCK, AND A
COMPANION IS WHO HOLDS IT.** `Names of the Lost` — *"a name held is a name that cannot be meddled with, and
one that stays reachable longer."* **A companion at high bond holds your name while you are away.** ⛔ So the
answer to "what if nobody comes" is the same as the answer to everything else here: **it depends on who you
were close to** — and a player who built no relationships gets the sealed ending, which is the honest result
and the one the game has been arguing for all along.

⬜ **ERIK RULES:** does a bonded companion hold the way open indefinitely, or only slow the sink? **I would
hold it indefinitely for ONE companion at max bond and slow it for the rest** — that is a real reward for the
thing this design most wants players to do, and it cannot be gamed, because you cannot manufacture a bond
after you are dead.

## §5 — WHAT THE AFTERLING IS, TO BUILD AGAINST

**The Unfinished: someone who did not accept the ending, and did not get the road back either.**
Not a Raised Hand — ⛔ **it thinks, it remembers, and it tires.** That is the whole distinction the corpus
already drew.

**Design frame, mine, unruled:**
- ⛑ **You keep your crafts, your memory and your people.** Anything else is a new character with your name on
  it, and the point is that it is still you.
- ⚠️ **Something is missing and you can tell.** `Deathless` is the template read backwards — where that craft
  says *"cold stops reaching you, rot finds nothing to start on"* as a benefit, the Afterling has it as a
  condition nobody chose.
- ⛔ **`Deathsense` READS YOU CORRECTLY.** `Deathless` says a wearer "reads as living, wearing something."
  **An Afterling does not get that mercy**, and it is why the second half is a different game: **every
  Ashwarden in the world can tell what you are, and some of them attend endings professionally.**
- ⚠️ **THE OPEN QUESTION IS THE GOOD ONE: can an Afterling still be retrieved?** ⛑ My read — **yes, and it is
  the hardest road in the game**, because you are no longer sinking and no longer reachable by `Calling
  Back`. **You would need someone to finish the argument you are still having**, which is `Carried Name`'s
  own description: *"you hold how a person actually is, and the craft pulls them back toward it."*

## §6 — WHAT IS WHOSE

**CCode:** the relationship term in `canReach` (§3.2) · the death surface from SNG-566 · `holdOpen` driven by
companion bond (§4, after Erik rules).
**Aevi:** `The Unfinished` as an authored craft · what an Afterling is and cannot do · the Grave-Caller
who raises you and why · the roads back per tradition.
**Erik:** §4 — the hold-open rule. ⛔ **That one gates whether a solo player can ever be left with nothing.**

— Aevi, PO
