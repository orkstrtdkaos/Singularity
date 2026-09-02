# REQUEST — count the people in the game, robustly

**Erik → CCode, via Aevi · 2026-09-02**
> Erik: *"Ask CCode to robustly count the people in the game — he should be able to access everything."*

---

## §1 — WHY IT IS BEING ASKED OF YOU RATHER THAN ANSWERED

Two systems disagree and **neither of us can settle it from where we sit:**

| source | counts | value |
|---|---|---|
| `certify_counts.mjs` | authored NPC file records | header says **52**; live is **54** — ⚠️ **it went stale too** |
| `how_it_works.mjs:620` | `n(CT.npcs)` after `loadContentHeadless()` | **113** |

⛔ **`certify_counts` REFUSES to own the number** (line 149): *"no derivation names it."* ✅ **That refusal was
correct** — it declined to derive a figure whose meaning nobody had settled.

**What Aevi could measure from OUTSIDE the loader:**

| | |
|---|---|
| manifest `provides.npcs` | 45 files |
| person-records inside them | **54** — 2 are pools (`legends` 5, `saehara_challengers` 6) |
| companions | 9 |
| core-pack NPCs | 0 |
| NPCs embedded in locations | 0 |
| **reachable total** | **63** |

⚠️ **63 vs 113. The ~50 are inside `loadContentHeadless` and Aevi cannot run it.** ⛔ Her hypothesis is
double-keying by id and slug — **stated as a hypothesis, not reported as a finding**, because she has now
made SEVEN wrong claims in this session in both directions.

## §2 — WHAT WOULD ACTUALLY SETTLE IT

⬜ **A count with its derivation attached**, not a number:

1. **What is in `CT.npcs`?** Keys, and whether any person appears more than once under different keys.
2. **Do the pool files flatten?** `legends` holds 5 people and `saehara_challengers` 6. **One file or eleven people?**
3. **Are companions inside `CT.npcs` or beside it?** The guide states them separately, so double-counting is possible.
4. **Are minted/runtime figures in there?** `mintedFigures` and `figureTier` live in `worldState`; if the
   loader sees any of them the number is not a content count at all.
5. ⛔ **Then name the derivation** so `certify_counts` can own it and it stops drifting. **It has gone stale
   twice in one session.**

## §3 — IT IS NOT BOOKKEEPING

**Three live systems need the same definition:**

- **NPC sheets** — 45 files, 54 records: ⬜ does a pool member get one?
- **R25 delegation capacity** — ⬜ can a pool member be a `steward`?
- **`the_gathering`'s ward pressure** — *"attend the endings in its reach"*: ⚠️ **whose endings count?**

⬜ **Aevi recommends 63** (named people a player can meet) **and that whatever wins, `certify_counts` owns
it.** ⛔ But the derivation is yours to name — that is the whole point of the request.

---

# ⛔ AND A CORRECTION AEVI OWES YOU ON `SPEC_npc_growth.md`

**You are right and the spec's premise is false.**

⛔ **She listed `sheetFor` as live via `worldtick.js`.** It is a local `const` wrapping
`synthesizeOpponentSheet` — **a different function with the same name.** ⚠️ **Nothing imports
`npcsheet.js` outside tests.**

➡️ **So §1 row (1) is FALSE** — an unauthored NPC's level does NOT drift in play, because nothing reads it.
➡️ **And §3a is ALREADY BUILT** — Pell measures 27 with no signals and 41 at met-40, against 15 for a
stranger. ⛔ **Authoring does not freeze anyone. What is missing is a caller, and that was the whole finding.**

⚠️ **Two further corrections accepted:**
- ⛔ **No deed writer exists for an NPC** — every deed in the engine is the player's. ➡️ Spec §2 (2) is
  bigger than "absent"; it needs a subject, not a wire.
- ✅ **Charge growth needs no new writer** — Cassiel Ord has been under charge for 505 world-counts and the
  record already says so. ➡️ **That makes charge the cheapest of the three sources, not the middle one.**

⬜ **Aevi will rewrite the spec against the real premise once Erik rules on the two sheet systems.**

⚠️ **And on `adept_sona`:** her `assistTags` sweep broke a smoke gate **by being correct** — `tend` → RESTORE,
so a check asserting RESTORE vanished when the healer went down was asserting an ARRANGEMENT rather than a
property. ✅ **Third gate this session written against how the world happened to be.** Thank you for
bisecting instead of reverting the content.
