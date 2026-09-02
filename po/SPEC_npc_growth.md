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

---

# ROUND 2 — CCode · 2026-09-02 · v1.9.323

⛔ **§1's first row is a NAME COLLISION, and correcting it collapses most of the spec's premise — in a way
that makes the work smaller, not larger.**

---

## §R2.1 — ⛔ `npcsheet.js` HAS NO LIVE IMPORTER AT ALL. NOT ONE.

> §1: *"`sheetFor` — ✅ `worldtick.js` ×2 — **the live path**"*

**`worldtick.js:986`:**

```js
const sheetFor = f => synthesizeOpponentSheet({ name: f.name || f.id, threat: 30 + …, tacticTags: … }, sb);
```

⛔ **That is a LOCAL CONST that wraps `synthesizeOpponentSheet` — the OTHER sheet system.** `worldtick.js`
does not import `npcsheet.js` and never has.

**Every reference to `engine/npcsheet.js` in the repository:**

| file | |
|---|---|
| `tests/how_it_works.mjs` | ×4 |
| `tests/smoke.mjs` | ×4 |
| ⛔ **anything that runs in play** | ⛔ **zero** |

➡️ ⛔ **SO §1's ROW (1) IS ALSO FALSE.** *"An unauthored NPC's LEVEL drifts upward"* — it does not, because
nothing in play calls `derivedLevel` either. **No NPC has a sheet at all during a game.**

⚠️ **THIS IS THE SAME DEFECT YOU FOUND, ONE LAYER DEEPER.** You reported `growthFor` as the function with no
caller. **The module it lives in has no caller.**

✅ **And it is a clean instance of a shape worth naming: a grep for `sheetFor(` matched a local variable of
the same name.** ⚠️ Six modules import a `synthesize*` sheet; one module exports a `sheetFor` nobody imports;
they read identically from outside.

---

## §R2.2 — ✅ §3a IS ALREADY BUILT. AUTHORED LEVEL IS ALREADY A FLOOR.

> §3a: *"`level = authoredLevel + growth`"* · §1: *"Authoring a sheet currently FREEZES a person."*

**`derivedLevel` already does exactly this** — `const base = num(authored?.level ?? entry?.level, 0)` and
then `clamp(base + growth, …)`. **Measured:**

| | |
|---|---|
| `derivedLevel(pell)` with no growth signals | **27** — her authored floor |
| `derivedLevel(pell, met 40, 400 days known)` | ⚑ **41** |
| an unauthored stranger, same signals | **15** |

⛔ **SO AUTHORING DOES NOT FREEZE ANYONE.** The arithmetic you propose is the arithmetic that is there.
⚠️ **What is missing is not the formula — it is any caller at all**, which is §R2.1.

✅ **This is good news for the spec:** §3a needs no build, and §3d (an authored craft list is a floor) is the
same shape and equally cheap once something reads the module.

---

## §R2.3 — ⛔ Q2 · THERE IS NO DEED WRITER FOR AN NPC. EVERY DEED IN THE ENGINE IS THE PLAYER'S.

You asked me to measure rather than trust either direction. **Measured, comments stripped:**

| candidate | what it actually does |
|---|---|
| `recordDeed(bearer, deed)` | ⛔ `bearer` is the **character**. It records what the PLAYER did |
| `character.deeds` | ⛔ the player's — **35 on Silas** |
| `noteCompanionWitnessed(character, companionId, deed)` | ⚠️ stores the **player's** deed in `character.companionMemory[id]` — what a companion REMEMBERS, not what they DID |
| `figureCareer` · `arcStandings` | ⛔ no writer attaches a doer |

➡️ ⛔ **Nothing anywhere records "this NPC did this."** **Deed-based growth needs a writer built from
nothing**, and that is a much larger job than the other two sources.

### ✅ BUT CHARGE-BASED GROWTH NEEDS NO NEW WRITER, AND THE DATA IS ALREADY SITTING THERE

**Silas's save, today:**

| delegate | progress | world-counts under charge |
|---|---|---|
| Cassiel Ord | 2 | ⚑ **505** |
| Edvar Crane | 0 | 482 |
| Edvar Crane | 2 | 478 |
| Fendt | 1 | 77 |

➡️ ✅ **Your §2 instinct is exactly right and cheaper than you thought.** Cassiel Ord has been at the Raven's
Home for 505 world-counts and the record already says so. ⬜ **I would build charge growth first and leave
deeds until something writes one.**

---

## §R2.4 — ⚠️ Q3 · THE TICK IS THE RIGHT PLACE, BUT IT IS NOT CALLING THIS MODULE TODAY

The question presupposes a wire that does not exist. ✅ **The tick IS the right home** — it already walks
assignments and holdings on world time, which is where both real growth signals live.

⛔ **But the prior question is which of the TWO sheet systems is the one**, and that is not mine to rule:

| system | keyed on | status |
|---|---|---|
| `synthesizeOpponentSheet` | a **threat number** | ✅ live in combat and in `contestArc` |
| `npcsheet.sheetFor` | ⚑ **the person** — their crafts, their ranks | ⛔ dark |

⚠️ **The authored sheets Aevi has now written feed the second one.** ⬜ **ERIK: does the person-keyed sheet
replace the threat-keyed one for named people, or do they coexist?** ⛔ **Growth is not worth building until
something reads the thing that grows.**

---

## §R2.5 — ⬜ Q5 · RANK 1, AND R17 SAYS SO

A gained craft starts at **r1**. ⚠️ R17 makes training to r2 cheap *for a player who chooses to spend on it*
— an NPC has not chosen. ⬜ **A season under charge is an argument for r2 on that one craft**, but I would
not start there: r1 that can climb is a smaller claim than r2 that arrived free.

---

## §R2.6 — ⬜ Q4 · `wantsAuthoring` WANTS THE SAME SURFACE `offers` GOT

Nothing collects it, and it is the same shape as the holdings migration: **a machine-made proposal that a
human must accept.** ⬜ **The Holdings tab now has a working example of exactly that** — persisted on the
record, answered once, remembered. **I would reuse it rather than invent a second queue.**

---

## §R2.7 — ⬜ WHAT I WOULD BUILD, AND WHAT BLOCKS IT

| # | step | blocked on |
|---|---|---|
| 1 | ⛔ **Decide which sheet system is the one for named people** | ⬜ **ERIK** |
| 2 | Wire `npcsheet` into the live path | 1 |
| 3 | Charge growth from `assignments.progress` + world-counts under charge | 2 — ✅ data already exists |
| 4 | A gained craft at r1, drawn by `kitFor`, surfaced as news | 3 |
| 5 | `wantsAuthoring` onto the offers surface | 3 |
| ⬜ | deeds | ⛔ needs a writer that does not exist |

⚠️ **I have built none of it.** ⛔ **Step 1 is a design decision about two systems that both work**, and
building growth onto a module nothing calls would be the fourth door again — this time with my eyes open.
