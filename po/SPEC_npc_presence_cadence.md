# SPEC — the world should be crowded

**Author:** Aevi (PO) · **2026-09-05** · ✅ **Status:** `built` — v1.9.393, §112

⛑ **CLOSED 2026-09-06.** ✅ **The roster block, the tier cadence, and the `presence` dial beside World pacing, default `peopled` per Erik's 'increase it for now'.** ⛔ **AND §112 IS THE CHECK AEVI DID NOT THINK TO ASK FOR:** *'a quiet day's people are always among a crowded day's, and a thronged moor is still a moor.'* ⚑ **HOW OFTEN, NEVER WHO** — which forecloses the real risk of a crowding dial: that turning it up would change a lonely fen into a market. ⬜ **Open beyond this spec:** the `service: true` reader — the runner-fee income — is named and unbuilt.
**subject:** npc-presence
> Erik: *"I want the NPCs to interact with the PCs a LOT more. We have so many of them at lower levels the
> player should be seeing them fairly frequently and helping or being helped by them **pretty much every
> day**. Most of the time it would be riff raff or notables, but you'd see and interact with a **heroic
> probably weekly**. **Epics every couple weeks**, legends and mythics more rarely, but **definitely at
> special events**."*

---

## §1 — ⛔ THE MEASUREMENT: NOTHING CHOOSES WHO IS THERE

| | |
|---|---|
| ⛔ **`npcsPresent` is the GM's own invention** | it comes back IN the turn, not into it. **Nothing offers the GM a roster to draw from** |
| ⛔ **KNOWN PEOPLE is the player's own registry** | ⚠️ **people already met.** A stranger can never arrive from it |
| ⛔ **`generateRequest` is REACTIVE BY RULE** | *"the world does not spawn on its own here"* |
| ⛔ **`attentionByTier` is `{}`** | the dial exists and is empty |
| ⚠️ **and the tier ladder is authored but unused for presence** | `arc_response.json` prices `notable: 0.5`, `riffraff: 0.25` |

### ⚑ THE POPULATION IS ALREADY THERE

| tier | authored | where |
|---|---|---|
| **heroic** | ⚑ **33** | `tradition_epics.json` (31) + `legends.json` (2) |
| **epic** | ⚑ **29** | `tradition_epics.json` (25) + `legends.json` (4) |
| **legendary** | **11** | |
| **mythic** | the rung, ~L100 | `_theMythicalRung` |
| ⚠️ **riffraff / notable** | **49 authored NPC files + everything generated** | the local layer |

⛔ **AND MEASURED ON SILAS: 73 TOTAL MEETINGS ACROSS 67 WORLD DAYS, 37 PEOPLE IN THE REGISTRY.** ⚠️ **Barely
one encounter a day, and 138 authored figures he has never met because nothing has ever offered them.**

---

## §2 — ⬜ THE CADENCE, AS ERIK SET IT

| tier | ⚑ how often | what an appearance IS |
|---|---|---|
| **riffraff · notable** | ⛔ **most days** | ⚠️ **the baseline texture of being alive somewhere.** Someone needs a hand, someone has news, someone is owed |
| **heroic** | ⚑ **weekly** | a person of real standing crosses your path — ⚠️ **and it is as often HELP AS OBSTACLE** |
| **epic** | **every couple of weeks** | ⛔ **they have their own errand** and you are in it or beside it |
| **legendary** | rarer | |
| ⛔ **mythic** | ⚑ **at special events, and that is the rule not a frequency** | ⚠️ **a mythic appearing IS the event** |

⛔ **AND THE VERB ERIK USED MATTERS: *"helping or being helped by them."*** ⚠️ **Not encountering. Not
fighting.** ➡️ **The default interaction with a higher-tier figure should be TRANSACTIONAL OR GENEROUS, and
combat should be the exception** — otherwise the world reads as a threat table with names.

---

## §3 — ⬜ WHAT TO BUILD

### 3a · ⛔ A PRESENCE ROSTER, HANDED TO THE GM
**The GM cannot use people it is not shown.** ⬜ **A block alongside KNOWN PEOPLE:**

> **WHO IS AROUND TODAY** — three to six people the fiction may reach for, **drawn by tier against the
> cadence**, each with their name, tier, what they are doing here, and ⚠️ **whether the player has met them.**

⚑ **These are OFFERED, NOT FORCED.** ⛔ The GM already has `generateRequest` for what it needs and does not
have; ➡️ **this is the other half — what it could use and does not know exists.**

### 3b · ⚠️ WEIGHTED BY PROXIMITY, NOT ONLY BY TIER
⛔ **A heroic of the Pale March should not turn up in Millbrook because a week elapsed.** ⬜ **Weight by:**

| | |
|---|---|
| ⚑ **region** | their `locus` or home against where the player is |
| ⚑ **arc** | ⛔ **a `hingeNpcs` figure on an arc the player is touching is FAR more likely** |
| **standing** | someone who owes you, or is owed |
| ⚠️ **`figureCareer`** | **what they have been DOING** — a figure mid-campaign is somewhere specific |
| ⛔ **and tier as a CEILING, not a schedule** | ⚠️ *"weekly"* is a rate, not a calendar entry |

### 3c · ⚑ AND IT MUST COST THEM SOMETHING TO BE THERE
⛔ **A figure who appears has left where they were.** ⚠️ **`figureTenure` and `figureCareer` already track
that**, so an appearance should mark it — ➡️ **which is what stops the roster feeling like a spawn table.**

### 3d · ⬜ SPECIAL EVENTS ARE THE MYTHIC CHANNEL
⛔ **Erik: *"legends and mythics more rarely, but definitely at special events."*** ⚑ **So the trigger is
not elapsed time — it is the EVENT.** ⚠️ Arc turnings, a Sovereign's arrival, a gathering, a duel that draws
a crowd. ➡️ **`arcTurnings` already records who turned each one; a turning is exactly the occasion a legend
attends.**

---

## §4 — ⚠️ WHAT MUST NOT HAPPEN

- ⛔ **The roster must not become a QUOTA.** ⚠️ *"You have not met a heroic this week"* is not a reason for
  one to appear in an empty fen.
- ⛔ **Presence is not an encounter.** ⚑ **Most appearances should be someone doing their own work near
  you.**
- ⚠️ **A figure met must be REGISTERED** — rule 14A already requires it, and this multiplies how often it
  fires.
- ⛔ **And it must not flatten the tiers into one texture.** ⚑ **A heroic should feel like a heroic**: they
  are competent, they are known, and they have somewhere else to be.

---

---

## §6 — ⚑ THE SETTING: RAISE IT NOW, AND GIVE IT ITS OWN DIAL

> Erik 2026-09-05: *"Increase it for now, but we can tie it to the encounter setting, or **add another
> setting next to that one**."*

### ✅ THE SIBLING SETTING ALREADY EXISTS AND IS THE RIGHT NEIGHBOUR

**Settings carries *"World pacing — how often things happen"*: `calm · balanced · eventful · relentless`,
defaulting to `eventful`.** ⚑ **And `engine/pacing.js` opens with the same complaint this spec does:**

> ⛔ *"SNG-080: **THE WORLD MUST PUSH.** Erik sat in the safest village and nothing happened, because the
> world is REACTIVE — it waits. **The player must never have to ask the world to be interesting.**"*

⚠️ **BUT PACING AND PRESENCE ARE DIFFERENT THINGS AND SHOULD NOT SHARE A DIAL:**

| | fires on | produces |
|---|---|---|
| ⚑ **pacing** | ⛔ **QUIET** — `quietTurns >= 3`, escalating 1→4 | ⚠️ **PRESSURE**: a rumour, a problem, a hook that will not wait, *something arrives* |
| ⚑ **presence** | ⛔ **A CADENCE** — most days, weekly, fortnightly | ⚠️ **PEOPLE**, mostly not as pressure at all — *"helping or being helped"* |

➡️ ⛔ **A BUSY VILLAGE IS NOT A DANGEROUS ONE.** ⚠️ **Tying presence to pacing would mean a player who wants
a crowded, peaceful market has to accept a world that keeps throwing hooks at them** — ⛔ **and one who
wants a tense, lonely game gets an empty street.** ⚑ **Those are two different preferences and they should
be two dials.**

### ⬜ PROPOSED — *"How crowded the world is"*, beside World pacing

| | |
|---|---|
| **solitary** | ⚠️ **you mostly travel alone.** Roughly today's rate |
| **occasional** | people turn up when there is reason |
| ⚑ **peopled** ← **DEFAULT** | ⛔ **Erik's cadence: someone most days, a heroic weekly, an epic every couple of weeks** |
| **thronged** | ⚠️ **you are never the only one who matters in the room** |

### ⛔ AND RAISE IT NOW, AHEAD OF THE DIAL

**Erik: *"increase it for now."*** ⬜ **Ship the cadence at `peopled` as the standing behaviour**, ⚠️ **and
add the setting when the roster block lands.** ⛔ **The dial is worth nothing until there is something to
turn down.**

### ⚑ AND ONE THING PACING ALREADY GETS RIGHT THAT PRESENCE MUST INHERIT

⛔ **`pressureDirective` RESPECTS THE PLACE:** *"This is a SAFE place — pressure here is human and small: a
frightened neighbour, a rumor off the road. **NEVER a bandit ambush here.**"*

➡️ ⚠️ **Presence needs the same discipline pointed the other way: a quiet fen does not produce a heroic
because a week elapsed.** ⛔ **The place decides WHO is plausible; the cadence only decides HOW OFTEN.**

---

## §5 — ROUND 2 QUESTIONS

1. ⛔ **Where does the roster get built?** ⬜ `gm_registry.js` assembles KNOWN PEOPLE; ⚠️ **this is a sibling
   block, and the selection is the whole spec.**
2. **Does `figureCareer` know WHERE a figure is?** ⬜ It has deeds, wins, tenure — ⚠️ **if it has no
   location, proximity weighting needs one.**
3. ⚠️ **What is a "special event" in data?** ⬜ `arcTurnings` is the obvious one. ⛔ Is there a wider set?
4. ⬜ **Does the cadence run on world days or on passes?** ⚑ **One pass ≈ 3 days, so *"weekly"* is roughly
   every other pass** — ⚠️ **and that is close enough to *"every pass or two"* that it may be simpler to
   author in passes.**
5. ✅ **ANSWERED — raise it now, dial later (§6).** ⚠️ Target is **2–4 a day** for the local layer against
   today's ~1, and ⛔ **that is a pacing change the GM's turn length has to survive** — ⬜ which is the one
   risk worth measuring before it ships.
6. ⬜ **Does `profile.pacing` want a sibling `profile.crowding`**, or is presence a second axis on the same
   record? ⚑ **Aevi reads it as a separate field for the reason in §6: a busy village is not a dangerous
   one.**
