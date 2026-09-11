# COPY — the ground tag on a fight menu craft

**Aevi (PO) · 2026-09-11.** ⬜ **CCode's OPEN #6. Copy, not a build — `groundForDecl` already returns
everything below.**

---

## §1 — ⛑ WHY IT MATTERS MORE THAN A LABEL USUALLY DOES

**`maxChancePenalty: 65`.** ⛔ **A fully starved craft loses SIXTY-FIVE POINTS of success chance** — and
CCode measured the average foe craft paying **−15 across the world's places**, with the player's Spirit
crafts at **−24.5**.

⚠️ **THE PLAYER PICKS A CRAFT FROM A MENU AND THE MENU DOES NOT SAY.** ⛑ **The wheel shows it; the fight
does not.** ⛔ **That is a decision made blind, and it is the single largest hidden modifier in the game.**

---

## §2 — ⬜ THE TAG: FOUR STATES, ONE SHORT PHRASE EACH

⚑ **The receipt line CCode built is correct and reads like a diagnostic:** *"the ground here (starved, 40%
of its strength)"*. ⚠️ **A MENU TAG IS A DIFFERENT JOB — it sits on a craft row, is read in a second, and
must say WHICH WAY and HOW MUCH without a second glance.**

| side | ⬜ tag | tooltip | ⚑ |
|---|---|---|---|
| **starved** | ⛔ **`thin ground −24`** | *"Little of what this craft draws on is here. −24 to the roll, and it costs more."* | ⚠️ **the number is the point — `thin ground` alone is decoration** |
| **crowded** | ⚠️ **`crowded −9`** | *"More here than the craft can use cleanly; it interferes."* | ⛑ **a DIFFERENT problem from thin, and the player must not read them as one bad thing** |
| **floored** | ⛑ **`bare hands −18`** | *"The ground is thin, but this craft falls back on what your body can do. It will not fail entirely."* | ⚑ **the material floor — *"the school that travels"*.** ⚠️ It is a REASSURANCE and should read as one |
| **full** | ⚑ **no tag** | — | ⛔ **silence means good.** ⚠️ **Tagging the normal case makes every row noisy and the warnings stop standing out** |
| ⛔ **off / no source** | ⚑ **no tag** | — | a bare strike is not grounded (SNG-089) |

⬜ **AND ONE MORE, IF ERIK RATIFIES THE EMPOWERED BAND** (`MEASURED_empowered_band_and_damage` §2):
⚑ **`rich ground +12`** — ⚠️ **the only positive tag in the game, and the reason to travel.**

---

## §3 — ⚑ THE RULES THE COPY FOLLOWS

1. ⛔ **ALWAYS SHOW THE NUMBER.** ⚠️ *"Starved"* is a mood; **`thin ground −24` is a decision.**
2. ⛑ **NAME THE GROUND, NOT THE CRAFT.** ⚠️ *"Weak here"* blames the craft; **`thin ground` says the world
   is wrong for it and somewhere else is not** — ⛔ **which is the whole point of a field model.**
3. ⚑ **NO JARGON ON THE ROW.** ⚠️ **Not `substrate 0.32`, not `factor 0.41`, not the source's name.**
   ⛑ **The tooltip may say *"what this craft draws on"*; the row may not say `precursor`.**
4. ⛔ **SILENCE IS THE GOOD STATE.** ⚠️ Four states, and only two of them ever show.
5. ⚑ **THE SAME WORDS EVERYWHERE.** ⛑ **The wheel, the fight menu and the ground card must not invent three
   vocabularies for one fact** — ⚠️ and the wheel is already shipping some of this.

---

## §4 — ⬜ WHAT AEVI IS NOT DECIDING

⚠️ **Placement, truncation and whether it is a chip or a suffix are CCode's** — ⛑ **the fight menu's row is
his and he knows what fits.**

⛔ **AND ONE THING WORTH HIS EYE:** ⚠️ **the tag must read the LEAD craft's ground, which is what
`groundForDecl` already computes** — ⛑ **but a menu shows many crafts at once, so it is many calls, not
one.** ⬜ **If that is expensive, the honest fallback is to tag only the thin ones**, which is also the
tidier display.
