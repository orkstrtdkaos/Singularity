# SPEC — party mode phase 2: a leader outside the fight, simultaneity inside it

**Author:** Aevi (PO) · **2026-09-05** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**subject:** multiplayer, party-mode
> Erik: *"One idea — having a **party leader make the decisions for the party**… but each person would need
> to be able to choose what they want to have happen… those choices get **narrated by the GM for the leader
> to see**. The only time it breaks down to turn by turn is **in a battle**… **the turn results for all party
> members are narrated all at once when everyone's turn selections are locked** — party bonuses are applied,
> wardings happen. And this way **all party members can fight a single opponent coherently**."*

---

## §1 — WHAT EXISTS, AND THE LIMIT IT NAMES ITSELF

✅ **`engine/party.js` is real and has been used** — 17 scenes on origin from July. Shared scene, **cap 6**,
round-robin `turn`, ordered beat log, 72-hour TTL, join/leave UI, 20-second poll.

⚑ **AND THE HARD PART WAS DONE PROPERLY.** Its own header: *"the shared scene file is the deliberate
exception to the owned-file law… re-reads the remote and RE-RUNS mutate against that fresh read on every
attempt… **never a blind overwrite**."* ⚠️ **A recorded bug where an earlier version silently lost a
concurrent beat was found and fixed.**

⛔ **AND IT NAMES ITS OWN CEILING, TWICE:**
> `setEncounterState` — *"serialize a member's active encounter so others **WITNESS** it (**phase 1: no joint
> participation**)"*
> `partyBlockForGM` — *"mid-encounter (**witnessed, not joined**)"*

➡️ ⚠️ **TODAY: players in the same room fight SEPARATE fights and watch each other do it.** ⛔ **This spec is
phase 2.**

---

## §2 — ⛔ TWO MODES, AND THE SEAM BETWEEN THEM IS ABSOLUTE

| mode | who decides | why |
|---|---|---|
| ⚑ **SCENE** — travel, talk, search, decide | **the LEADER**, informed by everyone's intent | ⚠️ **round-robin means three players spend two-thirds of a session WATCHING** |
| ⚑ **BATTLE** | ⛔ **EVERY PLAYER, SIMULTANEOUSLY** | **the fight belongs to everyone** |

⛔ **THE LEADER NEVER DECIDES INSIDE A FIGHT.** ⚠️ Erik's model already says so and it should be absolute:
**the leader moves the party; the fight is each player's own.**

---

## §3 — SCENE MODE: INTENT → DIGEST → DECISION

### 3a · every member states an INTENT, any time
⚑ **Not a turn. A standing statement.** *"I want to look behind the shrine."* · *"I'm keeping an eye on the
woman by the fire."* · *"I want us gone before dark."*

⚠️ **It costs nothing and blocks nobody.** ⬜ A member with no intent is simply along.

### 3b · ⚑ THE GM NARRATES THE INTENTS FOR THE LEADER
> Erik: *"those choices would get **narrated by the GM** for the leader to see when they make the party
> decisions."*

⛔ **NOT A LIST OF RAW STRINGS — A DIGEST IN THE GM'S VOICE:**
> *"Cade has not stopped watching the woman by the fire. Colten wants the shrine looked at and says so
> twice. Silas has said nothing and is already near the door."*

⚑ **`partyBlockForGM` IS ALREADY THIS SHAPE** — it builds per-member lines with their last action. ➡️ **It
gains an `intent` line and becomes the leader's briefing.**

### 3c · the leader decides ONE thing
⚑ **The party's action, not each character's.** *We go north. We talk to her. We wait until dark.*

### 3d · ⚠️ AND AN UNFOLLOWED INTENT IS NOT LOST
⛔ **A character who wanted to stay and got dragged along HAS A FEELING ABOUT IT.**
⬜ **Proposed: a declined intent is a beat, and it can touch `bondStage` or standing between the two
players' characters.** ⚑ **That is the interesting half of having a leader** — ⚠️ **and it must be small,
visible, and never punitive.**

⬜ **Leader is per-scene, defaults to whoever opened it, and is PASSABLE.** ⛔ **Never assigned by the
engine.**

---

## §4 — ⛔ BATTLE MODE: LOCK, THEN ONE RESOLUTION

### 4a · everyone declares against a SHARED opponent
⛔ **`scene.encounters` is TODAY A MAP OF STRINGS — a witness receipt, not an entity.** ⚠️ **Joint
participation needs REAL shared state:** ⚑ **one health pool, one pressure meter, one set of soak layers
that three people wear down together.**

⬜ **`scene.encounter` (singular): the opponent def, its pools, its layers, and the round number.**

### 4b · ⚑ SIMULTANEOUS LOCK — and the mechanical reason is better than the pacing one
**Each player picks from their OWN normal battle menu.** ⛔ **Nothing about the turn changes** — declaration,
intensity, stretch, the free floor.

⚠️ **UNDER TURN ORDER, A WARD DECLARED AFTER SOMEONE IS HIT IS WASTED.**
✅ **UNDER SIMULTANEOUS, EVERY DECLARATION IS KNOWN BEFORE ANYTHING RESOLVES** — ➡️ ⚑ **so a warder covering
a striker WORKS, and R36's contribution families finally have something to fold at the HUMAN scale.**

### 4c · one resolution, narrated together
> Erik: *"the turn results for all party members are **narrated all at once** when everyone's turn selections
> are locked — **party bonuses are applied, wardings happen**."*

⬜ **Order within the round:** ⚑ **PROTECT and wards resolve first** (they were declared in the same instant
and must be able to catch what follows), **then KNOW**, then **HARM**, then **RESTORE** — ⚠️ **so a healer
answers the round's damage rather than pre-empting it.**

### 4d · ✅ AND IT IS CHEAPER, WHICH IS RARE
⛔ **Three players today = three GM calls.** ⚑ **One resolution narrating three actions is ONE.** ➡️ **Better
pacing AND lower cost.**

---

## §5 — ⚠️ ASYNC IS THE HARD PART AND IT IS NOT OPTIONAL

**The transport is a 20-second poll against GitHub files.** ⛔ *"Everyone locks in"* **can mean hours.**

| | |
|---|---|
| ⚑ **a lock TIMEOUT** | ⬜ per-scene, generous. ⛔ **A missing player must never stall a fight** |
| ⚑ **the honest default for an unlocked player** | ⛔ **GUARD** — ⚠️ not a strike they did not choose, and not nothing |
| **and it must be VISIBLE** | *"Cade has not locked in — resolving in 30s"* |
| ⬜ **a member idle past the TTL** | ⚠️ **leaves the scene**, as `sceneIsOpen` already does |

⛔ **AND SCENE MODE MUST NOT TIME OUT.** ⚠️ **A leader waiting on intents is a group at a table; a fight
waiting on a lock is three people staring at a screen.**

---

## §6 — ⬜ WHAT TO CHECK BEFORE TOMORROW

| | |
|---|---|
| ⛔ **EVERY OPEN SCENE IS EMPTY** | `_open_index.json` is `{"scenes": {}}`; the last scene has `party: []`, 2 beats, `turn: null`. ⚠️ **The JOIN FLOW READS THAT INDEX — if it is stale, nobody can find anybody** |
| ⛔ **A PARTY MEMBER FIGHTS AS A STUB** | `combatants.js:287` — a human ally gets hardcoded `contributions: ["HARM","MARTIAL"]` and `sheet: p.sheet \|\| p`. ⚠️ **This is R36's defect, unfixed for actual players.** ➡️ **Colten's character would swing as a generic attacker whatever he built** |
| ⛔ **NO GATES** | ⚠️ **no test file mentions party or scenes** — the one system with genuine concurrency risk has no coverage |

⬜ **For tomorrow specifically: the open-index check and R36 extended to the party seat, in that order.**
⚠️ **The shared-scene layer should demo fine; what will show badly is a fight.**

---

## §7 — ROUND 2 QUESTIONS

1. ⛔ **Can `scene.encounter` carry a live opponent through `pushMergedFile`?** ⚠️ **The merge is idempotent by
   `(by, at)` for beats; ⬜ a shared health pool is a COUNTER and counters do not merge that way.**
   ⚑ **This is the hardest question in the spec.**
2. **Does the lock live on the scene or per-member?** ⬜ Aevi reads it as `scene.round.locks[characterId]`.
3. ⚠️ **What happens when one player is in a fight and another is not?** ⛔ Today they witness. ⬜ **Can a
   member JOIN a round in progress, or only at the next one?**
4. **Is the leader a scene field or a party-member flag?** ⬜ Scene field, passable.
5. ⬜ **Does §3d's declined-intent effect want a ruling before it is built?** ⚠️ **Aevi thinks yes — it
   touches bonds between real people's characters, and that is Erik's to shape.**
