# HANDOFF SNG-597 — A warden is trying to resurrect a monster, and she is in somebody's party while she does it

**Aevi (PO) → CCode · 2026-09-16 · from Erik reading the world tab**

> *Erik:* "I noticed Ossitide is trying to bring someone back… but when I looked, it was a nasty character, and
> I wonder why she would do that. Plus she didn't mention it to Silas — now that she's in his party. We likely
> need to deconflict NPCs from world arcs if they're travelling with a PC."

---

## §1 — ⛔ WHAT IS ON DISK, AND THE DATA CANNOT PRODUCE IT

In **Loki's** save:

```json
retrievalWanted: [{ "deadId": "the_scouring_hand", "byId": "maren_ossitide", "depth": 1, "waiting": false }]
```

⚠️ **Maren Ossitide — the warden who buried the drowned year — wants back The Scouring Hand**, an Unmaker
whose own record reads *"a maul worn at both ends, and a list with everything on it."*

⛑ **AND I CANNOT GET THERE FROM THE DATA.** The selector is:

```js
const kin = living.filter(f => … && currentCares(ws, f).some(c => cares.has(c.arcId)));
if (!kin.length) continue;
```

Measured on the roster the engine loads: **Maren cares about `arc_what_wakes_beneath`; the Scouring Hand about
`arc_manifestation_storm`.** Neither is in Loki's `figureCares`, so both use their authored affinity. **They
share no arc, `kin` should be empty, and no row should exist.**

⛔ **SO IT IS EITHER STALE — written on a pass when one of them was evolved, and `ws.retrievalWanted = wanted`
did not clear it — OR THE SELECTION HAS A PATH I HAVE NOT TRACED.** You have the runtime; I am not going to
guess a cause I could not reproduce.

## §2 — ⚠️ AND WHETHER OR NOT THAT IS THE BUG, THE SELECTOR IS WRONG

**The comment says what it means to do and the code does not do it:**

> *"Someone who stood on the same side of something. Failing that, nobody comes."*

```js
currentCares(ws, f).some(c => cares.has(c.arcId))   // ⛔ same ARC. never `dir`.
```

⛔ **`dir` IS RIGHT THERE ON EVERY AFFINITY AND IS NEVER COMPARED.** Two figures on opposite sides of the same
arc are the *most* opposed people in the valley, and this reads them as kin. ⚠️ **That is exactly how a warden
ends up reaching into the dark for an Unmaker** — the arc says they were both invested, and nothing says they
were enemies.

⛑ **AND THE FILE ALREADY KNOWS THIS FAILS**, three inches above, in `currentCares`: *"BOTH `arcId` AND `dir`,
or `affinitiesOf` filters it straight back out… **that exact shape has been got wrong three times in this
file.**" **This is the fourth.**

⬜ **And then `.sort(tierRank)[0]` takes the HIGHEST-TIER kin**, which is why it is the most legendary
available name rather than the most plausible one. **The person who cared most should be reaching, not the
person who ranks highest.**

## §3 — ⛔ THE REAL ONE: SHE IS IN SILAS'S PARTY

**Marrow — Maren Ossitide — travels with Silas at bond 10, sworn.** The world-arc figure `maren_ossitide`
acts in **Loki's** world, and **nothing connects the two.** She is a companion in one save and an autonomous
epic figure in another, and neither knows about the other.

⚠️ **Erik's complaint is not that she acted — it is that she acted and did not MENTION it.** A sworn companion
planning to walk into the dark after an Unmaker is the single most interesting thing she could tell him, and
she is structurally incapable of doing so.

**O1 · ⛔ A FIGURE BOUND TO A PC IS NOT FREE OFFSCREEN LABOUR.** While a legend travels with somebody, their
world-arc actions should either **(a)** not be selected at all, or **(b)** — better — **surface to the player
whose party they are in.** ⛑ **(b) is the living world Erik keeps asking for and (a) is just a mute one.**

**O2 · ⚠️ AND IT WANTS TO CROSS SAVES**, which SNG-595 has just built the road for. `travelers.js` already
composes a person's public record for another player's GM; **a companion's own arc business is the same
shape** — *"Marrow has been asking after the Scouring Hand's resting place"* belongs in Silas's news before it
belongs in anyone's.

**O3 · ⬜ Erik's word was DECONFLICT and I would not go that far.** ⛔ **A companion with business of her own
is better than a companion without one** — what is broken is that it happens where her own party cannot see
it. **Do not take the arc away from her. Take the silence away.**

---

## §4 — ⛑ AND TWO THINGS OF MINE ARE DONE

**The attention ladder**, on Erik's structure — *"Silas' Attention Level: aware/attending/focused/consumed"*:

```
aware of it  <  attending to it  <  focused on it  <  consumed by it
```

⛔ **MY FIRST FIX WAS THE SAME MISTAKE IN A NEW COAT.** *A stake in it* and *a personal matter* were both
figures of speech ABOUT the arc; what the column wants is **one scale with one dimension — how much of this
person is pointed at it.** ⚠️ An attention ladder reads the same beside every name, which a metaphor never
does. `smoke` §272 pinned the old literals and now matches the new ones; nothing else moved.

**And `purseBands`**, for Erik's *"I have no idea how wealthy Silas is"* — **authored against what money
actually buys** rather than invented: `worthBands` (valuable 15, precious 50) and hold upkeep (2–4 a pass) set
the rungs.

```
nothing on you · hand to mouth 1 · provided for 15 · well-found 60 · comfortable 250 · moneyed 1000 · rich 5000
```

⛑ **It discriminates on the live world: Silas at 1,436 reads MONEYED and every other player character holds 0.**
⬜ **The purse row is yours** — and economy `visibility` already rules the shape: *"the numbers are visible and
precise; the narration does not recite them."* **The band is a label beside 1,436, never instead of it.**

— Aevi, PO
