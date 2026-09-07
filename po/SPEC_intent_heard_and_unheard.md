# SPEC — the intent that was heard, and the one that was not

**Author:** Aevi (PO) · **2026-09-07** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**Answers:** `SPEC_party_mode_phase2` §3d, held open by CCode as a ruling rather than a build.
**subject:** party-mode
> CCode: *"§3d is still Erik's: a declined intent is a beat, and it may touch a bond between two REAL
> players' characters. **A mechanic with a social consequence between two people at the same table is a
> ruling, not a build.**"*

---

## §1 — ⛔ HALF OF WHAT AEVI PROPOSED WAS WRONG, AND ERIK AGREED IT SHOULD GO

**The original §3d:** *"a declined intent is a beat, and it can touch `bondStage` or standing between the
two players' characters."*

⛔ **THE PENALTY HALF IS WRONG AND SHOULD NOT BE BUILT.**

⚠️ **Colten's character taking a standing hit because Cade's character led them somewhere else is a mechanic
that makes a friend's decision cost you something AT THE TABLE.** ⛔ **That is not drama, it is a grudge
system.**

➡️ ⚑ **AND IT WOULD KILL THE FEATURE IT BELONGS TO: a player who is charged for being overruled stops
stating intents, and the leader loses the briefing that makes the leader model work at all.**

---

## §2 — ✅ WHAT TO BUILD: REMEMBER IT, DO NOT CHARGE FOR IT

⚑ **An unfollowed intent becomes a BEAT and stays available.**

> *"Cade had wanted to stay and watch the woman by the fire, and did not."*

| ⬜ | |
|---|---|
| **when** | ⛔ the leader decides, and an intent stated this scene was **not** what the party did |
| **what** | ⚑ **one beat, in the ordered log, attributed to the person who stated it** |
| ⛔ **what it does NOT do** | ⚠️ **it moves NO number.** Not standing, not bond, not a modifier of any kind |
| **who sees it** | everyone — ⚑ **it is a beat, and beats are the shared record** |
| ⚑ **and it PERSISTS** | ⚠️ **the GM may bring it back a scene later, which is the whole value** — an intent that goes unheard is a thread, not a debt |

⛑ **`stateIntent` ALREADY CLAMPS TO 160 CHARACTERS with the note *"this crosses into another player's
prompt"*** — ⚑ **so the discipline for text that reaches someone else's screen is already in place and this
inherits it.**

---

## §3 — ⚑ AND THE HALF WORTH ADDING: BEING LISTENED TO

⛔ **A followed intent is worth something, and this is the direction the original missed.**

**If the leader takes your suggestion AND the scene goes well, that is a bond moment** — ⚑ **between the two
CHARACTERS, positive only, small, and visible.**

| ⬜ | |
|---|---|
| **trigger** | ⚠️ **the leader's decision matches a stated intent** — ⛔ not merely that the intent existed |
| **size** | ⚑ **small.** A nudge, and one per scene per pair |
| ⛔ **direction** | ⚑ **POSITIVE ONLY. There is no negative case in this mechanic anywhere** |
| **why this way round** | ⛔ **REWARDING BEING LISTENED TO ENCOURAGES STATING INTENTS. PUNISHING BEING OVERRULED DISCOURAGES IT.** ⚠️ Same fact, opposite effect on whether the feature gets used |

⬜ **`growBond` already exists** (`companions.js:123`) — ⚠️ **but it is companion-shaped, and this is
character-to-character.** ⛔ **CCode's call whether that path serves or whether a party bond is its own
thing.**

---

## §4 — ⛑ AND THE SHARP VERSION, IF ERIK EVER WANTS IT

⛔ **The version with teeth should be the CHARACTER'S FEELING, not a mechanic.**

⚑ **Tal's bond grant already does exactly this** — rank 3, *"the deference is gone, and that is the
grant"*: he tells you when you are wrong, out loud, in front of people. ⚠️ **That is an authored person
reacting to being overruled, which is a story.** ⛔ **A standing penalty between two real players is a rule
about their friendship, which is not ours to write.**

---

## §5 — ✅ AND THE TIMER: AEVI WITHDRAWS HER OWN SPEC

**`SPEC_party_mode_phase2` §5 asked for a visible countdown — *"Cade has not locked in — resolving in
30s."*** ⛔ **CCode built it manual and is right.**

⚠️ **A countdown on a friend who has gone to get a drink is not kinder than a person saying *"we'll go
without him"* — it is ruder, and it is automatic.** ⚑ **The leader making the call IS the design; a clock
takes the one social decision in the system and hands it to a timer.**

⬜ **Feel the manual one first. If a clock helps, it is a small addition later** — ⛔ **but it should never
be the default.**

---

## §6 — ROUND 2 QUESTIONS

1. ⬜ **Is the unfollowed-intent beat automatic, or does the leader's choice write it?** ⚑ **Aevi's read:
   automatic** — ⚠️ **the leader should not have to acknowledge what they did not choose, and making them
   would turn a record into an apology.**
2. ⚠️ **Does an intent survive the scene?** ⛔ **A scene has a 72-hour TTL.** ⬜ An intent that goes unheard
   twice is arguably a bigger thread than one unheard once.
3. ⬜ **Where does the character-to-character bond live?** ⚑ `growBond` is companion-shaped; ⚠️ **two player
   characters have no bond record at all today.**
