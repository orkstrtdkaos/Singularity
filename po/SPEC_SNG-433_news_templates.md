# SNG-433 — §4 delivered: the clash templates, and three bugs testing found

**Author:** Aevi (PO) · **Date:** 2026-08-10
**Shipped:** `content/packs/core/rules/news_templates.json` (`b197b719`)

---

## §1 — WHAT ERIK ASKED, ANSWERED IN THE PROSE

**"Is it obvious why it's news?"** ⛔ **`rivals` is authored on 58 of 66 figures, 23 pairs MUTUAL, and read
by nothing since SNG-208.** Three variants per outcome:

- **mutual** — *"the ending both of them had been walking toward"*
- **rival** — *"they had been circling each other for years"*
- **stranger** — ⚠️ *"they had never met"*, which is itself interesting

**"Is it coherent?"** — the stutter was my template `${winner} bested ${loser} — ${loser} withdraws`.
**Short form on second mention.**

**"Does it say what changed?"** — *"withdraws to lick their wounds"* read the same whether the loser was
out eight days or had lost a war. **Four outcomes now carry four different consequences:** *"is not coming
back"* · *"out of the reckoning while the wound holds"* · *"stalled, not stopped"* · *"neither could break
the other."*

**Rendered with real figures:**

> *The Hollow King of the Wild Half killed The Last Walker of the Sealed Wood at The Maw — the ending both
> of them had been walking toward. The Hollow King left the field alone.*

---

## §2 — ⛔ THREE BUGS TESTING FOUND, ALL MINE

**1 · The short-name rule cut mid-phrase.** *"Morvane of the Harvest Hand"* → ⛔ **"Morvane of the"**. My
rule was *"before the comma, else last two words"*; the corpus has **three name shapes** — 9 comma, 18
beginning "The", 3 plain. **Rewritten to stop before `of`/`who`/`that`, and to fall back to the full name
when the result is too short.** ⚠️ **Verified across all 66: 0 cut on a stopword.**

**2 · The fragments come in TWO grammatical forms and one template cannot take both.**
*"pulls a novice back from dissolving"* is a verb; *"a daughter who thinks he is a clerk"* is a noun
phrase. ⛔ **"Overseer Grael was seen a daughter who thinks he is a clerk" is still not a sentence.**
Two templates, chosen by shape — **and when in doubt use the noun form, which is grammatical for both.**

**3 · ⛔ AN EDITORIAL MARKER LEAKED INTO PLAYER PROSE.** My stalemate line contained a literal *"⛔ THE
THIRD TIME"* — **a marker inside a string a player reads.** Rewritten.
⚠️ **Gate worth having: no string under `templates` or `fragments` may contain ⛔ or ⚠️.** I verified it is
clean now, but I put it there and would do it again.

---

## §3 — WHAT I NEED WIRED

1. **Read `templates[outcome][relationship]`**, choosing relationship from `rivals` — mutual, then rival,
   then stranger.
2. ⛔ **`{place}` IS A DISPLAY NAME, NEVER AN ID**, and when null the whole *" at {place}"* is dropped
   rather than printing "at null". **This is the "the the_ceaseless" fault again.**
3. **`_power` variants roughly one time in three** when an `abilityId` exists — ⚠️ **the power should read
   as a detail the teller happened to know, not a stat line on every entry.**
4. **The fragment form detector** (§2.2) for the offscreen lines.

---

## §4 — STILL OPEN, AND NOT MINE

⚠️ **The battle IMAGE.** The clash now records `locationId` and `abilityId` and `battleprompt.js` exists —
**that is Erik's original ask from three sessions ago and it is the last piece.** All the content is
waiting: `appearance` 66/66, `fightingStyle` 66/66, 374 abilities with `description` + `shape` +
`intensity`.
