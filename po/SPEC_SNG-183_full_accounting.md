# SNG-183 — Full accounting: the engine map, the connections, and the six lenses

**Author:** Aevi (PO) · 2026-07-19 · **Erik-directed.** Outcomes; engineering is CCode's.
The capstone for BATCH-13. `ENGINE_MAP.md` exists with mechanical columns; this is what completes it.

> Erik: *"How do we wrap all of this up, and spec a full accounting for the engine map and
> connections now that so many things have been fixed."*

---

# §1 — WHY THIS IS WORTH DOING NOW

This batch found **twelve** capabilities that were built, correct, tested, and unreachable — plus
three whole op-classes that have never fired in sixteen levels, a lore loader that starved 84 of 95
locations for months, and a verification gate piped into a mask.

**Not one of those was a coding error.** Every one was a *connection* that nobody could see was
missing. The map exists to make that class visible before a person hits it in play.

**The accounting must cover CODE, CONTENT, and OPS.** CCode's lore-loader finding proved the point:
an orphaned `.json` is exactly as dead as an uncalled function, and no code-only audit sees it.

---

# §2 — THE SIX LENSES

Each is a defect *shape* this batch produced repeatedly, stated so it can be checked mechanically.

### L1 · Built-never-reached
An export with no non-test caller. **Twelve found this batch** — `npcImage`, `skill_battle`,
`entityHover`'s item branch, `carriedSubstrate` (running against zero content), `itemDetail`, others.
*Already implemented* as `testOnlyExports`, ratchet at 7 and falling.

### L2 · Permission isn't initiative — CCode's line
A capability that is reachable but has **no trigger**. The teacher gate decided what you were
*permitted* to learn and nothing ever made a teacher act. Same shape: SNG-142's toolkit (candidates
existed, offers did not), SNG-163's contests (complete system, no trigger).
**Check:** a module with a player-visible surface and no path that *initiates* it.
**This is the one no existing gate catches** and it is the most common failure in the batch.

### L3 · A guard whose result is not read is not a guard
`npm test | grep … && commit` chains on grep's status. **The guard fired and the pipeline swallowed
it.** The verification layer is the one place this cannot be caught by more verification.
**Check:** every gate consumed by explicit exit code; no test result crossing a pipe.

### L4 · Orphaned content
A content file no consumer references. **18 of 27 lore files** reached no location, and the loader
dropped the rest by extension — `the_twelve_reaches` is referenced by 80 locations and **had never
once reached the model.**
**Check:** every content file is referenced, pulled by a rule, or explicitly flagged not-GM-visible.

### L5 · Never-fired ops
An op-class with zero occurrences across a whole character history. **`discovery`, `markTeacher`,
`markDefiningMoment`: 0 in sixteen levels**, while list-shaped ops fired 171 times. Root cause behind
three separate player reports.
**Check:** op-class firing counts per save; zero across a mature character is a defect, not a
statistic. (SNG-179 — cause still to be measured.)

### L6 · A universal gate is the wrong tool for a local fact — Erik's line
`re_toll_bandits` had `minDanger: 3` and could never appear on the road it is named for.
`placeMemoryForGM(character, locationId)` answers only about where you are standing, so *"where is my
mother's house"* is unanswerable however well the game knows it.
**Check:** a gate expressed globally that encodes a local condition; a retrieval scoped to *here*
when the question is about *there*.

---

# §3 — WHAT THE ACCOUNTING CONTAINS

## 3a. Per module (extends today's `ENGINE_MAP.md`)

| column | source |
|---|---|
| purpose | **authored**, one sentence — a module nobody can describe in one line is a design smell |
| exports · depends on · depended on by · blast radius | generated (no dynamic imports, so the graph is complete) |
| content it reads | generated |
| GM verbs served | authored — they come from the reply contract, not imports |
| **player-visible surface** | **authored. Not derivable.** `NONE` is the L1 flag |
| **what makes it fire** | **authored. The L2 flag** — the column that does not exist yet and catches the most |

## 3b. Per content file
Referenced-by count · reaches the GM (y/n) · reaches the player (y/n) · `gmVisible:false` if
deliberately player-only. **L4.**

## 3c. Per GM op
Schema entry · prompt rule · dispatch path · salvage slot · **observed firing count**. **L5.**
The first four all existed for `markTeacher`; only the fifth would have shown the problem.

## 3d. Connections — the part Erik asked for by name
- **module → module** (imports; complete)
- **module → content** (what each reads)
- **content → content** (`loreRefs`, `encounterSeeds`, manifests, `questSeeds`)
- **op → engine → surface** — the full path from a GM verb to something a player sees. **A break
  anywhere in that chain is invisible today**, and every one of L1/L2/L5 is a break in it.

---

# §4 — OUTCOMES

1. **Every module carries an authored `purpose`, `player-visible surface`, and `what makes it fire`.**
   Incremental per CCode's accepted split: authored as each spec touches a module, never as a
   53-sentence documentation project in front of a defect Erik can see.
2. **New module ⇒ must declare all three, or CI fails.**
3. **The six lenses run as checks**, not as review culture. L1 and L4 exist; L2, L3, L5, L6 do not.
4. **Blast radius appears in the spec template** — any spec touching a module states its downstream
   count, so impact is known before work starts. Erik's original ask.
5. **The accounting covers content and ops, not only code.**
6. **It regenerates**, with authored columns held separately so regeneration cannot clobber them —
   the pattern CCode already built.

# §5 — WRAP-UP: what BATCH-13 leaves behind

**Shipped and live:** 40 NPC appearances · 41 NPC `people` + domains · all 95 `axisVector` ·
all 95 `worldPos` · 26 `substrateSource` with `radiusWorld` · 36 `powerSystem` fills · wild animals
lethal · toll bandits restored · `threeGrounds` canon.

**Erik's rulings, all closed:** falloff constants · natural craft benefits from thin lattice ·
world positions authored · renames land through SNG-182 · wild animals lethal · local-not-universal
danger · reduced gains for multiple primaries · Ents are a people · the canon amendment ·
43/95 coverage is correct.

**Still open and named:** SNG-179's cause (needs a live instrumented turn — Erik only) ·
SNG-172 power-source classification · the renames themselves · stakes-dial default · browser-legs.

**The standing corrections, which outlast the tickets:**
- Audit for existence before speccing a build — six proposed builds already existed.
- Verify one layer down before naming a cause — three of Erik's reports were diagnosed too high.
- Ship the verification with the claim — an uncommitted `/tmp` script is not evidence.
- The record lives in the repo, not in chat.
