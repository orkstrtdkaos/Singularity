# SPEC — the world guesses its own features

**Author:** Aevi (PO) · **2026-09-05** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**subject:** hold-features, generative-pipeline
> Erik: *"I can place features for now since I'm building the game by play testing, but **I also want the
> game to guess and get better at building itself.**"*

---

## §1 — THE ASK IS NOT AUTOMATION, IT IS INFERENCE

⛔ **Not "the engine invents a mine."** ⚑ **"The engine notices a mine is already described and records
it."**

⚠️ **The gap is exactly the one Erik hit in play:** *"the Threshold Post **is supposed to have** a mine"* and
*"is a Temple to Attending"*, and **Stillwater's Trouble has "barriers, a wall, skeletal undead sentries"** —
⛔ **every one of those was TRUE IN THE FICTION AND ABSENT FROM THE RECORD.**

➡️ ⚑ **THE WORLD ALREADY KNOWS. NOTHING READS IT BACK.**

---

## §2 — ⚑ FOUR SOURCES THAT ALREADY EXIST

| source | what it already holds | the inference |
|---|---|---|
| **the location record** | `tags`, `descriptionSeed`, `substrateSource`, `communityId`, `tier` | ⚠️ **42 locations tagged `sacred`** → a meaning feature is already asserted |
| ⛔ **the chronicle** | ⚑ **prose the player and GM wrote.** *"barriers, a wall, skeletal undead sentries"* | **the richest source and entirely unread** |
| **the craft applied** | `improveHolding` already records **which craft lifted a rung** | ⚑ **a `mason` craft applied to a post is a WORKSHOP being built** |
| **the store** | what the hold has actually been yielding | ⛔ **a hold producing `raw_material` HAS a mine, whatever the record says** |

⚑ **THE LAST ONE IS THE STRONGEST AND THE CHEAPEST: a hold that yields ore has a mine. That is not a guess,
it is a reading.**

---

## §3 — ⛔ IT PROPOSES. IT NEVER WRITES.

⚠️ **The house pattern, and it is already built twice:** the holdings **offer** flow (*"a place is yours"* —
proposed, accepted by the player) and `growthFor`'s **`wantsAuthoring`**.

| ⛔ never | ✅ instead |
|---|---|
| the engine adds a feature silently | ⚑ **it OFFERS one, with its evidence** |
| *"your post now has a mine"* | ⚑ ***"this post has been producing ore for six passes. Was there a mine? [Yes, record it] [No]"*** |
| a feature the player cannot see the reason for | **the offer carries the reason** |

⛔ **AND IT MUST NOT BECOME A CHORE** — `SPEC_hold_store.md`'s governing constraint. ⚠️ **An offer at most
once per hold per pass, and only when the evidence is strong.**

---

## §4 — ⚑ AND IT GETS BETTER BY BEING CORRECTED

> Erik: *"get better at **building itself**."*

⛔ **A REJECTED OFFER IS DATA.** ⚠️ If a player declines *"was there a mine?"* on a hold yielding ore, the
inference was wrong about that hold and should not fire again there.

⬜ **And an ACCEPTED offer teaches the shape:** *a post with `tags: sacred` and a steward of the Numinous
accepted a shrine* is a pattern worth weighting. ⚠️ **Small, local, and never a model — just a record of what
was accepted and what was refused.**

⚑ **THIS IS `wantsAuthoring` POINTED AT PLACES INSTEAD OF CRAFTS**, and R39's rank-evolution is the same
shape a third time: ➡️ **the engine proposes from evidence, the player disposes, and the disposal is
remembered.**

---

## §5 — ROUND 2 QUESTIONS

1. ⛔ **Can the chronicle be read for feature nouns at all?** ⚠️ It is free prose. ⬜ **A keyword pass over the
   33 authored `label`s is crude but might be enough** — *"a wall"*, *"a mine"*, *"sentries"* are the labels.
2. **Where does the offer surface?** ⬜ The Holdings tab has the buttons; the world tick has the news.
   ⚠️ **The holdings OFFER flow already exists and may be the whole answer.**
3. ⚠️ **What is "strong evidence"?** ⬜ Aevi's instinct: **the store reading is strong (yield implies a
   source), the tag reading is moderate, the chronicle reading is weak and should always ask.**
4. ⛔ **Does a refusal persist?** §4 says yes. ⬜ Where — on the holding record, or a world-state list?
5. ⬜ **Silas's holds carry NO features today** and CCode will not write into his save. ⚠️ **This spec is how
   they would get some without anyone hand-authoring them** — ⛔ **but Erik places them for now, and that is
   the right order: the inference should be checked against holds he has already labelled.**
