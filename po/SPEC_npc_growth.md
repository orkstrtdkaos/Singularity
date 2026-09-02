# SPEC — NPCs level up, and gain crafts when they do

**Author:** Aevi (PO) · **Date:** 2026-09-02 · **Status:** `spec_ready` — ROUND 2 requested
**Origin:** Erik — *"we also have to connect a system that makes it so NPCs level up appropriately."*
**Builds on:** CCODE-248/249 (`engine/npcsheet.js`), R29 (attending), the two authored sheets

---

## §1 — PWSV

| function | callers (comments stripped) |
|---|---|
| `sheetFor` | ✅ `worldtick.js` ×2 — **the live path** |
| `derivedLevel` | ⛔ tests only |
| `kitFor` | ⛔ tests only |
| `battleSkillsFor` | ⛔ tests only |
| ⛔ **`growthFor`** | ⛔ **NO CALLER AT ALL** |

⚠️ **Exactly ONE growth input is ever written anywhere in the engine:** `npcs.js:214` — `n.met += 1`.

### ⛔ SO THE STATE IS

1. ✅ **An unauthored NPC's LEVEL drifts upward** as the player meets them — `derivedLevel` reads
   `met`, days known, and standing.
2. ⛔ **NO NPC EVER GAINS A CRAFT.** `growthFor` computes exactly that and nothing calls it.
3. ⛔ **AN AUTHORED NPC DOES NOT GROW AT ALL.** Pell is L27 and Veth L33 because a human typed those
   numbers. Nothing adds to them, ever.

⚠️ **AND (3) IS NEW DAMAGE THAT THE AUTHORED SHEETS INTRODUCED.** Before them, every NPC at least drifted.
**Authoring a sheet currently FREEZES a person** — the better the record, the deader the character.

### ⚠️ The design was already written down and not built

`npcsheet.js` header, CCODE-309: *"AN AUTHORED LEVEL IS WHAT THEY ARE, AND THE RELATIONSHIP TERMS BECOME
GROWTH ON TOP OF IT. Erik: 'they get killed and injured and they need to grow too.'"*

➡️ ⛔ **`derivedLevel` accepts `authored` and adds growth on top. `sheetFor` never passes it.** The
intent is in the file; the wire is not.

---

## §2 — WHAT "APPROPRIATELY" HAS TO MEAN

⛔ **The current inputs are all about the PLAYER'S ADDRESS BOOK** — how often you met them, how long you
have known them, your standing with them. **CCODE-309 already named this as the real cruft** and fixed
half of it by letting an authored level win.

⚠️ **But growth ON TOP is still measured in meetings.** ➡️ **A world-moving NPC the player never sees
still does not move.**

### Three growth sources, and only the first exists

| # | source | status |
|---|---|---|
| **1** | **Acquaintance** — met, days known, standing | ✅ built (`derivedLevel`) |
| **2** | ⛔ **DEEDS** — what they actually did, seen or not | **absent** |
| **3** | ⛔ **CHARGE** — a delegate running a holding for a season is working at it | **absent** |

⚠️ **(3) IS ALREADY MEASURED AND UNREAD.** `assignments` carry `progress` and `lastMovedWorldCount`;
`holdings` carry `condition` and `history[]`. ➡️ **Cassiel Ord has been reconstructing the Raven's Home
since world-count 566. He should be better at it than when he started, and nothing says so.**

---

## §3 — PROPOSED DESIGN

### 3a · Authored level is a FLOOR, not a value
```
level = authoredLevel + growth
```
✅ Matches CCODE-309's stated intent. ⛔ Pell never drops below 27; Veth never below 33.

### 3b · Growth accrues from deeds and charge, not only from being met
⬜ Aevi proposes, CCode tunes:

| input | signal |
|---|---|
| acquaintance | ✅ existing `derivedLevel` terms |
| **charge** | an assignment advancing (`progress` moving) is its holder practising |
| **holding** | ⚠️ a steward whose holding climbs a `condition` step **learned something** |
| **deeds** | ⬜ needs a writer — see §5 Q2 |

### 3c · A level gained offers a CRAFT, and `growthFor` already computes which
`growthFor` returns `capacity = level / craftsPerLevels` and `thin` — *"a person the story keeps showing
doing one thing has one thing."*

⚠️ **`thin` IS THE IRONSENSE DETECTOR, ALREADY WRITTEN.** ⛔ It has never run.

**When capacity exceeds held crafts, the NPC gains one** — drawn by `kitFor` from their `domains`, the
same function a PC's creation pool uses. ✅ **Not a parallel system; the same system with a different
character in it** (CCODE-249's own words).

### 3d · ⛔ AN AUTHORED CRAFT LIST IS A FLOOR TOO
Pell's 17 crafts are hers. **Growth adds; it never replaces or reorders.** ⚠️ Her capacity at L27 computes
to ~14 and she holds 17 — **the authored list is ALREADY above formula, and that must not trigger removal.**

### 3e · ⚠️ R29 — attending is a growth input for the Death domain specifically
Attending preserves personhood across the crossing. ➡️ **An Ashwarden who attends endings is practising the
thing the tradition is FOR.** ⬜ Worth considering whether attended endings count as deeds for them —
**a domain-specific growth source, which no other tradition currently has.**

---

## §4 — ⛔ WHAT MUST NOT HAPPEN

- ⛔ **NPCs must not out-scale the player by sitting still.** Charge-based growth is slow by construction.
- ⛔ **No retroactive rewriting of authored sheets.** Growth is additive and recorded, never a silent edit.
- ⚠️ **A gained craft should be VISIBLE.** Per `DESIGN_celebrations.md` §3 this is not a celebration — it
  is news. *"Cassiel Ord has learned something at the Raven's Home."*
- ⛔ **`met` must not remain the dominant term.** It is the player's address book, and CCODE-309 already
  ruled that a world-moving figure the player has never met should not be level 1.

---

## §5 — ROUND 2 QUESTIONS FOR CCODE

1. ⛔ **`sheetFor` never passes `authored` — is that the whole fix for §3a**, or does `derivedLevel`'s
   growth arithmetic also need to change once an authored floor is in play?
2. ⛔ **Is there ANY deed writer?** `recordDeed`, arc participation, `figureCareer`, `arcStandings` all
   exist in `worldState`. ⚠️ **Aevi could not tell from outside whether any of them attaches a deed to an
   NPC id** — and she has been wrong in both directions six times this session. **Please measure.**
3. **Where does growth get EVALUATED?** `worldtick` already calls `sheetFor`; is the tick the right place,
   or does it want its own pass?
4. ⚠️ **`growthFor` returns `wantsAuthoring` — the crafts the story showed that the catalogue cannot
   express.** ⬜ **Where should that surface?** It is Aevi's authoring queue and nothing collects it.
5. **What does a gained craft's RANK start at?** r1 presumably — but an NPC who has done a thing for a
   season might reasonably start at r2. ⚠️ Ties to R17: training to r2 is cheap for a PC.
6. ⛔ **Do the 111/113 people all get growth**, or only those with sheets? ⬜ **Ties directly to
   `RULING_REQUEST_people_count.md`** — another place the definition of "person" is load-bearing.
