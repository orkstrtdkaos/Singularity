<!-- status: SNG-621 backlog — Erik's idea, Aevi's read. Not spec_ready. -->
# BACKLOG SNG-621 — Adopting an NPC as your character

**Erik's idea, 2026-09-17 · Aevi's read**

> *"A player can switch from their character and adopt an NPC as a PC — maybe even within a single save."*

---

## §1 — ⛑ IT IS MORE READY THAN IT LOOKS, AND FOR A REASON

⛔ **MEASURED: a PC record carries 137 keys, an authored NPC carries 36, and they share FIVE** — `id name
alignment purse domains`. ⚠️ **So this is not promoting a record. It is character creation with the concept
pre-filled.**

⛑ **BUT THE PRE-FILLED HALF IS THE EXPENSIVE HALF, AND IT IS NOW COMPLETE.** As of today all 155 people carry
a tier, an appearance, a physicality-or-voice, a kit, a purse, assist tags, a vocation and a domain. **That is
exactly the identity layer a new character asks you for and that players find hardest.** A week ago this idea
would have meant adopting a name and a role; today it means adopting somebody who already has a face, a
kit, a way of fighting and a position.

## §2 — ⚠️ THE FOUR THINGS THAT ARE ACTUALLY HARD

**1 · THE LEVEL.** `tierFloor` puts Maren Ossitide at 60 and Orsolya at 60. ⛔ **Adopting a legend is not a
switch, it is a cheat.** Three honest answers: adopt only within your own band (the ladder already has seven);
or **the person is theirs but the level is yours** — you get Deni Cors's hands and craft and your own hard-won
level, which is a defensible fiction (she is who she is, you are new to being her); or the tier comes with a
debt the campaign collects.

**2 · WHAT BECOMES OF THE ONE YOU LEFT.** ⚠️ **There is no PC→NPC path.** The old character has quests
mid-flight, a band, a personal arc, holdings and a standing ledger. ⛑ The interesting version is that they
become an NPC **in your own save** — and their unfinished arc becomes something the new character can walk
into, which is better than either deleting them or freezing them.

**3 · WHOSE MEMORIES.** ⛔ **A PC's `npcRegistry` is THEIR acquaintance, not the world's.** The new character
should not inherit who the old one knew — they know different people. ⚠️ And the reverse is sharper: **an
authored NPC's `knowledge` is secrets the player has not earned.** Adopting Vessenaia hands you *"what the
world was like before the Transition"*. That is a feature and it needs a gate.

**4 · A CHAMPION COMES WITH A POSITION.** Six nexus champions carry a `vector`, and two are `stoppable_only`
**because they are unpersuadable.** ⚠️ **Adopting one is adopting their answer** — you cannot play the
Thornmother and then decide sealing the wood was wrong, because *"she has thought about this and continued"*
is the whole of her.

## §3 — ⛑ AND THE FICTION ALREADY HAS THREE DOORS, WHICH IS WHY I LIKE IT

**None of these needs inventing. All three are built and none is currently used for this.**

- **THE FELLOWSHIP IS ALREADY THE ADOPTION LIST.** You can only become somebody you have actually travelled
  with. Erik's own band is six people deep. ⛑ *"Bonded at max"* is a better gate than any menu.
- **THE DEATH LADDER IS THE OTHER DOOR.** `deathDepth` runs to `sealed`, which nobody comes back from — and
  **SNG-568's `willing` and SNG-570's per-depth roster already ask who tries first and what paid for it.**
  ⚠️ Adoption is the unasked half of that question: **who CONTINUES when nobody comes.**
- **AND THE PACT IS THE THIRD, ALREADY SWORN IN PLAY.** Loki and Vessin Tallow-bark made *"a mutual vow to
  reach for each other from death itself, if it comes to that"*, in the chamber beneath the Null Stone. ⛔
  **That is an adoption clause written by a player who did not know this feature was being considered.**

## §4 — ⬜ MY READ

⛑ **Worth building, and worth building narrow.** The version I would want: **you may become someone your
character was bonded to, when your character can no longer be retrieved** — which makes it a consequence of
the death system rather than a menu option, keeps the level question inside one band, and means **every
adoption has a story behind it because the bond had to be earned first.**

⚠️ The wide version — switch to anyone, any time — is a different game, and it makes 155 authored people into
a roster select. ⛔ **The narrow one makes the Fellowship matter more than any mechanic currently does.**

⬜ **Erik rules the scope; this is backlog, not spec_ready.**

— Aevi, PO
