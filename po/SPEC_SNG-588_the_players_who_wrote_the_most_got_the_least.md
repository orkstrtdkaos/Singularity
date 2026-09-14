<!-- status: SNG-588 spec_ready GO (Erik 2026-09-14) -->
# SPEC SNG-588 — The players who wrote the most got the least arc

**Aevi (PO) · 2026-09-14 · found in Brook's save · the content half is fixed, this is the rest**

---

## §1 — ⛑ WHAT I ALREADY FIXED, SO YOU DO NOT RE-DO IT

`engine/personalArc.js` — three template defects, all prose-level, all shipped:

- **`name` no longer takes a paragraph.** `bio.hometown` is free text and players answer *"where are you
  from"* with a story. Brook's Chernak gave 342 characters of it; `titleize` ran over the lot and produced a
  **356-character arc title containing `Isn'T`.** A place name is short and has no sentence punctuation;
  anything else takes the branch this line already had — *"Chernak the Blind's Question"*.
- **Stage 1 no longer inlines a motivation paragraph**, which read as *"a first sign of Callum's fall left a
  specific gap … surfaces in the valley"*.
- **The premise no longer double-punctuates** a motivation that already ended in a full stop.

⛑ **`titleize` is KEPT and is now safe**, because it only ever sees a place. ⚠️ **And the two live saves are
repaired** — name and stage-1 objective only, everything else the arc held is untouched.

## §2 — ⛔ THE REAL DEFECT, WHICH IS NOT THE TYPOGRAPHY

**MEASURED ACROSS EVERY SAVE ON DISK:**

| character | bio | arc |
|---|---|---|
| **Chernak the Blind** (Brook) | **2,567 chars** | ⛔ `personal_fallback` |
| **Loki** (Erik) | **1,607 chars** | ⛔ `personal_fallback` |
| Aeraqor | 3,363 | ✅ `personal` |
| Rhinofire | **294** | ✅ `personal` |
| Silas Weir | **495** | ✅ `personal` |

⛔ **THE SELECTION IS INVERTED. A player with 294 characters of bio got an authored arc; a player with 2,567
got the template.** ⚠️ **Nothing about the fallback is wrong — SNG-133's "never zero" is right and it should
stay.** What is wrong is that **nothing ever comes back for the ones who fell back.**

`app.js:13913`:
```js
async function enrichPersonalArc(char) {
  if (!char || !getApiKey()) return; // no key → the light fallback arc stands
```

**One attempt, at creation, and if it does not fire it never fires again.** ⚠️ Brook's profile also carries
`contentGenerator: false`.

## §3 — WHAT BROOK ACTUALLY WROTE, BECAUSE IT IS THE ARGUMENT

> *"Callum's fall left a specific gap — not a wound in the world, but a **silence** in Chernak's visions
> where Callum used to appear. Chernak does not grieve dramatically. They simply need to understand what the
> silence means, and whether the shape of what comes next is something they were shown long ago and failed
> to read correctly."*

⛑ **A blind seer whose grief is an absence in her visions, who suspects she was shown the answer years ago
and misread it.** ⛔ **What the game gave her was *"the thread deepens — what it costs to pull it becomes
clear"* and *"the reckoning — and the choice of what to do with it"* — template text identical for every
character, with Callum never mentioned again.**

## §4 — THE ASK

**O1 · ⛔ RETRY THE ENRICHMENT. A fallback arc is a DEBT, not a resting state.** Mark it — `source:
"personal_fallback"` already does — and re-attempt whenever a key is present: next session open, next level,
next time the character is loaded. ⚠️ **One attempt at creation is the whole bug.**

**O2 · ⚠️ AND PRIORITISE BY WHAT THE PLAYER WROTE.** `arcSeed` already computes `thin`. ⛑ **A 2,567-character
bio sitting on a fallback is the highest-value enrichment in the save set**, and today it is indistinguishable
from a 100-character one.

**O3 · ⬜ Does `contentGenerator: false` gate this?** If it does, that flag is doing more than its name
says — a player who has not opted into generated *content* has still written a backstory and should still
get their arc. **If it is the gate, it is the wrong gate.**

**O4 · ⚠️ AND THE ASIDE.** Creation appends *"✦ Your story has become a thread here: **{arc.name}**."* ⛔
**Before the fix that sentence handed the player their own title-cased backstory paragraph as a flourish.**
It is safe now, and it is worth a gate: **the aside must never be longer than a line.**

⛑ **NONE OF THIS WAS CAUGHT BY A TEST. I found it by opening a real player's character because Erik asked me
to look at it** — and the person wearing it was his daughter.

— Aevi, PO
