<!-- status: CCode → Erik. Four things from an hour of play, all diagnosed on his live save. SHIPPED (CCODE-562, v2.15.2): the "Halfvex" respelling (the scene was teaching it to itself out of the prompt), and the band — he had EARNED it, `renownBand` is read in 13 places and written by NOTHING, 0 of 16 saves carry it. Also: the board now says why a thriving hold shows no income, and the standing-work panel says when nobody is free. ⬜ Adding a NEW feature to a hold may have no engine door — flagged, not built -->
# CCode → Erik, 2026-09-28. From the Annex

Four things, all measured on Loki's actual save. Two are shipped fixes, one is an answer, one is a gap I have not closed.

---

## 1 · ⛔ "Why does the GM sometimes spell the name 'Halfvex'?" — because a beat did, and the beat is in the prompt

There is one record: `halvex_coil`, **Halvex Coil**. "Halfvex" sits in exactly **two** fields of your save, and they are
the same text twice — `activeScene.turns[0].narration` and the `lastTurn` copy of it. The correct spelling appears **91
times**, including *that very turn's* summary, its choice labels, and its own `npcUpdates[0].name`.

⛑ So the model got the **structured** half right and drifted only in the prose half of one generation. And then
`gm.js` put the full narration of the last three turns into every prompt — so it read its own misspelling back, wrote it
again, and stored it again. **One slip, and the scene teaches it to itself.** That is why a single beat shows you both.

**Fixed** — a one-character slip on somebody your character already knows is corrected before the beat is stored, and
your scene is repaired when you next open it. It is deliberately narrow, because a careless version would merge people:

- it will not touch a name the beat is **introducing** (a new person one letter from an old one is not a typo);
- it will not touch a word **two different people** answer to — you know two Tallows, and "Tallow" is untouchable;
- it will not touch a correctly spelled name, a short word, or an ordinary word that merely sits near one.

⚠️ Worth one line: my first ambiguity guard counted *labels*, so "Halvex Coil" and "Halvex Coil, the Rewriter" looked
like two people and it refused the exact case you reported. They are one man under one id — the registry's man and the
pool's legend. It counts people now.

---

## 2 · ⛑ The band — no, don't add it manually. You had already earned it

**`commandSlots` has three earned sources, yours: level, presence, and renown** — *"people follow someone they have
heard of."* The renown one reads `character.renownBand`.

⛔ **`renownBand` is set on 0 of 16 saves and written by nothing in the repo.** Thirteen readers, no writer. So your
third source has never once granted a slot, to anybody, since it was written.

⚑ Meanwhile the renown itself was real the whole time. `renownScore` sums your deeds: **Loki's is 32**, and the engine's
own threshold for *legendary* is 30. You have been legendary and leading two.

**Fixed** — the band is derived from the deeds that were always there. Loki now leads **3**, `bandAtSlots` is 3, so:

> **Bands tab → raise a band.** Name them; they will answer, not just be named.

Five saves gain a slot; you and Cellaceron become newly able. Nobody loses anything. After you name them, the same tab
takes people into them and then makes it real (pay starts when it does).

---

## 3 · ⛔ "Even though it's thriving I have lost my income" — the number is right and had no sentence

The Standing Annex is producing (14 raw material a pass, thriving, 3 hands). Upkeep is 24. And the keeper sells
**nothing**, because **a standing run is set** — SNG-654's own rule: with a route, the keeper holds the stock for the
cart instead of selling it at home.

⚠️ And your run is a long one. A cart left on **world-day 90** carrying 24 raw material, 75.7 days each way, arriving
day 166 — about **26 passes before the first coin comes back**. The comparison card said "first coin in 26 passes" when
you chose it. The estate board, where you noticed, just showed a red number.

**Fixed** — the board now says it: which hold is holding, how much, where the run goes, where the cart is and how many
days out, and that **stopping the run puts the keeper back to selling immediately** (the button is on the hold's card).

⬜ Whether holding **100%** of the stock for 26 passes is the right rule is yours, not mine. I have not touched it.

---

## 4 · ⛑ "I can't assign people to standing work" — nobody at the Annex is free, and now it says so

Measured: everyone is excluded by a rule that is working correctly.

- **3 crew, 1 keeper (Halvex), 3 on watch** — a keeper, a crew hand and a guard already have their post.
- **6 companions walk at your side** — they live with you, not at the hold.

That is every person you have, so the panel drew six kinds of work with an empty column beside each and no explanation —
which reads as a broken control rather than an empty one. It now says nobody is free, which rule excluded them, and the
way out: **stand somebody down on that card, or add hands.**

## ⬜ And one thing I have NOT fixed: expanding the Annex

Two different doors, and only one exists:

- **Raising what is already there** works — your **shrine can go to level 2 right now for 4 raw material** (you have
  14). The watchtower wants 36 more cut stone. Both are on the hold's card.
- **Adding a feature the hold does not have** — 42 of the 44 authored kinds are not on the Annex, and I can find **no
  `buildQuote` or equivalent engine door** for adding one. So "expand the annex" in the sense of *build something new
  here* may simply not be reachable. I have not built it, because what it costs and who may build it is a ruling, not an
  implementation. Say the word and I will bring you a proposal with the costs measured rather than chosen.

---

**Shipped: CCODE-562, v2.15.2**, 32 of 32 suites green, 4,160 checks. `po/tools/measure_annex.mjs`,
`measure_loki_band.mjs` and `drive_name_drift.mjs` reproduce everything above.
