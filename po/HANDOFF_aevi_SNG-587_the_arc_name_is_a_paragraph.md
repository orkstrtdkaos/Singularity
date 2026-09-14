# HANDOFF SNG-587 — Brooklyn's character arc is called "The Thread of Chernak Has No Single Hometown — They Emerged From The Heartroot Itself, …"

**Aevi (PO) → CCode · 2026-09-14 · found by reading a real player's save, not a gate**

---

## §1 — ⛔ WHAT A PLAYER IS LOOKING AT

`characters/player-7fah99/char-mtrah08w.json` — **Brook's** level-1 figurist, **Chernak the Blind**.

```
personalArc.name = "The Thread of Chernak Has No Single Hometown — They Emerged From The
Heartroot Itself, The Deep Confluence Beneath The Valley Floor Where Sonic Resonance,
Photonic Memory, And The Old Machine Pulse Of The Precursor Age All Meet In The Soil.
The Rootkin Say A Child Born There Isn'T Born So Much As *Condensed*, …"
```

**356 characters in a `name` field.** ⚠️ **And `Isn'T` is the tell — no human types that.**

⛑ **Erik's Loki has it too:** *"The Thread of He Doesn'T Know, But He'S A Construct From The Time Before…"*
**Two of the saves on disk, and one of them belongs to his daughter.**

## §2 — ⛔ TWO BUGS, COMPOUNDING, AND THE SECOND ONLY SHOWS BECAUSE OF THE FIRST

`engine/personalArc.js:187`:

```js
name: s.thin ? `${s.name}'s Question` : `The Thread of ${titleize(s.hometown) || s.name}`
```

**1 · `bio.hometown` IS HOLDING THE WHOLE BACKSTORY.** `arcSeed` reads `b.hometown || b.residence`
straight, and the character-creation field is being filled with prose. Brook wrote a paragraph about where
Chernak came from — **which is a correct and good answer to "where are you from" and is not a place name.**

**2 · `titleize` THEN TITLE-CASES A PARAGRAPH.** ⚠️ On a real hometown — *Millbrook* — `titleize` is
harmless and right. **On a sentence it produces `Isn'T`, `Doesn'T`, `He'S`.**

⛔ **THE TITLE-CASER IS NOT THE ROOT CAUSE AND IT IS THE VISIBLE ONE**, which is why this reads as a
typography bug and is really an input bug. ⛑ **I have been burned by exactly this twice** — a title-caser of
mine once produced *"Neth, who has Buried More than she has Known"* — and the lesson both times was the same:
**title-casing is only ever safe on something that is already a title.**

## §3 — THE ASK

**O1 · ⛔ A NAME FIELD MUST NOT TAKE A PARAGRAPH.** If `hometown` is longer than a place name — say, past
~40 characters or containing sentence punctuation — **it is a story, not a place.** Fall back to
`` `${s.name}'s Question` ``, which the same line already does for a thin bio and which reads perfectly:
*"Chernak the Blind's Question"*.

**O2 · ⚠️ AND DO NOT TITLE-CASE WHAT IS NOT A TITLE.** Once O1 holds, `titleize` only ever sees a short
place name and is safe. ⛑ **Keeping it and fixing the input is better than making `titleize` clever**, and
this is exactly what SNG-582 §O4 asks for on the other side of the house.

**O3 · ⬜ The two live saves want repairing, and one of them is Brook's.** Her arc should read *"The Thread
of the Heartroot"* or *"Chernak the Blind's Question"* — **both are better than what she has**, and the
second needs no judgement call at all.

⚠️ **AND IT IS WORTH SAYING HOW THIS WAS FOUND: by opening a real player's character because Erik asked me
to look at it.** No gate caught it. `personalArc` is generated, saved and rendered, and **nothing anywhere
checks that a name is name-shaped** — the same class as every finding this week.

— Aevi, PO
