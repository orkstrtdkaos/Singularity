# DESIGN INTENT — Celebrations

**Erik, 2026-09-02 · recorded by Aevi**

> *"There are certain things that pop up as Celebrations! Such as minting a new skill. Those are fantastic
> and should be the format for things like the news of milestones for holdings or other big deals in
> the game."*

---

## §1 — ✅ THE FORMAT ALREADY EXISTS AND IS ALREADY GENERIC

`showBraidMoment` (`app.js:5936`) — the `.braid-moment` modal on the `.help-overlay` surface. ⚠️ **It
already runs FOUR variants off one implementation**, with only the kicker and the arrow line changing:

| variant | kicker | arrow |
|---|---|---|
| braid mint | ✦ A BRAID FORMS ✦ | *"braided together into"* |
| discovery | ✦ A TECHNIQUE DISCOVERED ✦ | *"found in the doing — a thing neither could do apart"* |
| recognition | ✦ A BRAID RECOGNISED ✦ | *"you have earned, together"* |
| bond gift | ✦ A BOND DEEPENS ✦ | *"taught to you by X — what the bond was always for"* |

➡️ **It was built for braids and generalised itself twice already. Making it the house format is
recognising what it became, not repurposing it.**

## §2 — WHY IT LANDS, so new variants keep the parts that matter

| part | why it is load-bearing |
|---|---|
| **the kicker** | names the KIND of moment before the player reads anything. `✦` on both sides. Present tense. |
| **provenance** | *"what this came from"* — the parents line. ⛔ **A celebration with no history is an award; with history it is an ACHIEVEMENT.** |
| **the arrow** | one line on HOW it happened. Never mechanical. |
| **the name, big** | `<h2>`. The thing itself. |
| ⚠️ **"…or name it yourself" / "Make it mine"** | ⛔ **THIS IS THE PART THAT MAKES IT LAND.** The player is not shown a thing they received — they are invited to OWN it. Every variant that can be named should offer it. |
| **"Hold it close"** | the dismiss. ⚠️ Not "OK". Not "Close". **The button is part of the tone.** |
| **`presented` flag** | ⛔ fires ONCE, ever. CCODE-26 exists because Silas's Declared Threshold re-popped on every load. **A celebration that repeats is a bug that feels like nagging.** |

## §3 — ⛔ WHAT MUST *NOT* BE A CELEBRATION

⚠️ **The format spends attention. Spending it on the ordinary makes it worthless for the extraordinary.**

- ⛔ **Anything recurring.** Level-ups, condition drift, routine news.
- ⛔ **Anything the player did not earn.** A grant that arrives by schedule is not an achievement.
- ⛔ **Losses.** A holding falling to `failing` is real and should be felt — ⚠️ **but it wants a quieter,
  different beat, not this one inverted.** ⛔ **Never a celebration with sad copy.**
- ⛔ **Anything that fires more than once for the same subject.**

**The test: would the player tell someone about this?** ✅ If yes, celebrate. ⛔ If it is bookkeeping, put
it in the news digest.

## §4 — ⬜ VARIANTS TO ADD

| moment | kicker | notes |
|---|---|---|
| **holding claimed** | ✦ A PLACE IS YOURS ✦ | provenance = the assignment that earned it, the steward who kept it. ✅ **Nameable — "Make it mine" applies exactly** |
| **holding reaches `thriving`** | ✦ IT PROSPERS ✦ | ⛔ once per holding, ever. Not on every climb |
| **`presence` 14 / 18 first fires** | ✦ YOUR NAME KEEPS IT ✦ | ⚠️ the R25 milestone becoming REAL — the first time a place holds without you |
| **a companion reaches bond 10** | ✦ (per companion) ✦ | ⚠️ Marrow's stage-3 reveal is ALREADY this beat, hand-built. ⬜ Worth folding onto the shared surface |
| **first delegate** | ✦ WORK IN YOUR NAME ✦ | the party→delegation threshold crossing |

## §5 — ✅ HOLDINGS OFFER PLACEMENT — Erik's ruling

**BOTH surfaces, and they do different jobs:**

1. ⬜ **Character sheet, in the holdings section.** The persistent, returnable home. Silas's list is empty
   and should read *"4 assignments look like places — review."* ⚠️ **This is where the player goes
   LOOKING.**
2. ⬜ **World-tick news.** Where delegated work already reports. *"Cassiel Ord made progress on the Raven's
   Home"* already appears — the offer belongs beside it. ⚠️ **This is where the player is TOLD.**

⛔ **The OFFER is not a celebration.** It is a question. ✅ **The ACCEPTANCE is** — minting the holding
fires *✦ A PLACE IS YOURS ✦*.

⚠️ **That ordering matters: the celebration marks the player's DECISION, not the engine's detection.**
