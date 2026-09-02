# RULING REQUEST — what does "people" mean in the player's guide?

**Aevi (PO) · 2026-09-02 · for Erik, with a measurement for CCode**
**Trigger:** the guide's people count went stale **twice in one session** (111 → 112 → 113) as two NPC
sheets landed, and `certify_counts` cannot own it because **two definitions of "person" disagree.**

---

## §1 — WHAT EACH SIDE COUNTS

| source | counts | value |
|---|---|---|
| `certify_counts.mjs` | authored NPC **file records** | ⚠️ header says **52** (41 solo + 11 nested) — **now 54**, it went stale too |
| `how_it_works.mjs:620` | `n(CT.npcs)` — the **headless-loaded** table | **113** |

⛔ **`certify_counts` explicitly REFUSES to own it** (line 149): *"not owned: PLAYERS_GUIDE 'people' — no
derivation names it. Preserved as authored."* ✅ **That refusal was correct** — it declined to derive a
number whose meaning nobody had settled.

## §2 — WHAT AEVI COULD MEASURE FROM OUTSIDE THE LOADER

| | |
|---|---|
| manifest `provides.npcs` | **45 files** |
| person-records inside them | **54** (2 pool files: `legends` 5, `saehara_challengers` 6) |
| companions | **9** |
| ⛔ core-pack NPCs | **0** |
| ⛔ NPCs embedded in locations | **0** |
| **total a player can meet** | ✅ **63** |

⚠️ **63 ≠ 113, and the gap is INSIDE `loadContentHeadless`.** ⬜ **CCode: what does `CT.npcs` hold?**
Aevi's guess is double-keying (id and slug), but **that is a guess and it should be measured, not
assumed** — she has been wrong in both directions six times this session.

## §3 — ⬜ THE DECISION, WHICH IS ERIK'S

**The player's guide is player-facing. Its numbers are promises to a reader**, not corpus statistics.

| option | number | meaning |
|---|---|---|
| **A** | **63** | ⚠️ **named people you can actually meet** — 54 authored records + 9 companions. What a player would understand the word to mean |
| **B** | **113** | whatever the loader produces. ⛔ Currently unexplained, and a reader cannot verify it |
| **C** | — | drop the count from the guide entirely |

✅ **Aevi recommends A**, and that **whichever is chosen, `certify_counts` must OWN it** so it stops going
stale. ⛔ **It has now drifted twice in one session, and a manual number in a gated document is a
regression waiting for the next author.**

⚠️ **Note the pools count correctly under A.** `legends` (5) and `saehara_challengers` (6) are people a
player meets; they are records, not files, and 54 already reflects that.

## §4 — ⚠️ WHY IT MATTERS BEYOND BOOKKEEPING

**Two systems disagree about what a person IS**, and that same question is now live in three other places:

- **NPC sheets** — 45 files, 54 records: does a pool member get a sheet?
- **`unstewardedHoldings`** and delegation capacity — ⛔ is a pool member a valid steward?
- **`the_gathering`'s ward pressure** — ⚠️ attending the endings *"in its reach"*: **whose endings count?**

➡️ **Settling the guide number settles the definition.** That is why it is worth ten minutes rather than a
find-and-replace.
