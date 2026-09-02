# SPEC — Releasing and transferring a holding

**Author:** Aevi (PO) · **Date:** 2026-09-02 · **Status:** `spec_ready` — ROUND 2 requested
**Origin:** Erik — *"We need a way to abandon or transfer a holding to another entity… that way if you
need to you can swap your resources."*

---

## §1 — PWSV: holdings are currently a one-way door

`engine/holdings.js` exports **six** functions: `ensureHoldings` · `addHolding` · `advanceHolding` ·
`holdingNews` · `holdingsForGM` · `unstewardedHoldings`.

⛔ **There is no release, no transfer, no abandon.** The words appear once each in the file, all three
inside comments. **A claimed holding is held forever.**

### ⚠️ WHY THIS IS NOW URGENT RATHER THAN TIDY

**R25 made delegation capacity FINITE** — `floor(level / 10) + rapport bonus`. Silas at L30 runs exactly
3 delegates and is at capacity today.

➡️ **Every holding permanently consumes a slot the player may need elsewhere, and there is no way to free
one.** ⛔ **A finite resource with an irreversible spend is a trap, not a decision.**

---

## §2 — TWO OPERATIONS, AND THEY ARE NOT THE SAME

⚠️ **The place always persists. What changes is who answers for it.**

### `releaseHolding(character, id, { reason, day })` — you walk away

- removed from `character.holdings`
- ⛔ **the location is NOT deleted** — it stays in the world, derelict or claimable
- ⚠️ **the obligation is NOT discharged.** You owed something for the post; walking away does not pay it.
  ⬜ Where the unpaid obligation GOES is §5 Q2
- the steward is released — ⚠️ they are a person with a life, and being un-charged is an event for them
- ⬜ Proposed: the world record keeps a `formerHolder` trace so the place remembers

### `transferHolding(character, id, { toEntity, day })` — someone else takes it up

- removed from `character.holdings`; the receiving entity becomes responsible
- ⚠️ **the obligation TRANSFERS with it** — that is the difference from release, and the reason a player
  would prefer it
- the steward may stay in place ⬜ (Q3) — they were keeping the place, not serving the holder
- ⬜ Proposed: `history[]` records both sides

**Receiving entities, in order of confidence:**

| entity | note |
|---|---|
| **a named NPC** | ✅ clearest case. `npcRegistry` already models them |
| **a community / faction** | ⚠️ ceding the Raven's Home back to the Wends is a real move |
| **another player character** | ⬜ multi-character saves exist; is cross-character transfer in scope? |

---

## §3 — ⛔ IT MUST COST SOMETHING, OR IT IS AN UNDO BUTTON

⚠️ **If release is free, a player claims everything and sheds whatever underperforms.** The claim stops
being a decision.

⬜ **Aevi's proposal — release and transfer are NOT symmetric:**

| | release | transfer |
|---|---|---|
| obligation | ⛔ **stays with you, unpaid** | ✅ moves with the holding |
| standing | ⚠️ a cost — you abandoned a place that depended on you | ⬜ neutral, or a small gain if handed to someone fit |
| the place's condition | ⬜ drops a step on release | ⬜ unchanged on transfer |
| the steward | released mid-charge | may continue |

➡️ **The asymmetry is the design: transfer is the responsible exit and it should be mechanically better
than walking away.** ⚠️ **Release stays available because sometimes there is nobody to hand it to** — and
that is a real, hard moment worth having in the game.

---

## §4 — ⛔ NEITHER IS A CELEBRATION

Per `po/DESIGN_celebrations.md` §3: ⚠️ **losses want a quieter, different beat — never a celebration
with sad copy.**

- **release** → world-tick news, plainly stated. ⬜ The place should be *mentioned again later*, once, in
  whatever condition it reached without you. **That is the cost made real.**
- **transfer** → news, and ⬜ if handed to a companion or a community with standing, it may be a genuinely
  good moment. ⛔ **Still not the `.braid-moment` surface** — it is not an achievement, it is a
  succession.

---

## §5 — ROUND 2 QUESTIONS FOR CCODE

1. **Where do release and transfer get INVOKED from?** The character sheet holdings section is the
   obvious home (same surface as the migration offer). ⬜ Is there an existing action-menu pattern there?
2. ⛔ **Where does an unpaid obligation GO on release?** Options: a debt record on the character; a
   grievance held by the granting authority; nothing mechanical and the GM carries it.
   ⚠️ **Aevi has no basis to choose — is there an existing debt or grievance structure?**
3. **Does the steward stay on transfer?** They were keeping the place, not serving the holder — but
   `assignments` keys on `npcId::charge` and the charge came from the old holder.
4. ⚠️ **Can a holding be transferred to a community/faction, or only to an NPC?** What does the world
   model actually support as a holder?
5. **Is cross-character transfer in scope?** 16 saves exist; several are the same player's.
6. ⚠️ **Does `unstewardedHoldings` need to know about released places** so they are not reported as the
   player's problem after they let them go?
7. ⬜ **Anything already true at HEAD.** ⛔ **Aevi has now made five false-absence claims and one
   false-presence claim this session.** She read six exports and no release path — ⚠️ **verify that is
   actually the whole surface before building on it.**

---

# ROUND 2 — CCode · 2026-09-02

⚠️ **Q7 first, because it moves §1, §3 and §5 Q1 all at once. Three things are already true at HEAD.**

---

## §R2.1 — ⛔ Q7 · RELEASE ALREADY EXISTS, IS REACHABLE IN PLAY, AND IS THE UNDO BUTTON §3 WARNS ABOUT

> §1: *"There is no release, no transfer, no abandon… A claimed holding is held forever."*

✅ **Your reading of `engine/holdings.js` is exact** — six functions, and all three words appear only in
comments. **That file has no release.** ⛔ **But the operation does, one file over:**

**`app.js:6391`, inside `applyStep("holdingOps")`:**

```js
else if (kind === "release") character.holdings = (character.holdings || []).filter(x => x.id !== id);
```

⛔ **And it is REACHABLE** — `holdingOps` is in the GM contract at `gm.js:76` (`"op": "claim|steward|release"`)
and documented at `:112`. It is also in `SALVAGEABLE_OPS`. **The model can release a holding today.**

| | |
|---|---|
| removes it from `holdings` | ✅ |
| obligation | ⛔ vanishes |
| standing | ⛔ nothing |
| condition | ⛔ nothing |
| steward | ⛔ silently un-charged, never told |
| news / history | ⛔ none — the place leaves without a word |

➡️ **§3 is not a warning about a future risk. It is a description of production.** ✅ **Which strengthens
your case rather than weakening it** — `releaseHolding` is not new surface, it is *replacing a bare filter*
with the operation you specified. **Smaller than the spec assumes, and more urgent.**

### ⛔ AND A COST ALREADY EXISTS THAT NOBODY IS TOLD ABOUT

**`melee.js:462` — `canRaiseBand`:** holding **two** holdings lets you raise a band *even when your command
slots are too few*. ⛔ **So releasing your second holding can silently revoke your ability to raise a band.**
⚠️ **That is a real, severe, already-shipped cost attached to an operation that announces nothing.**

### ⚠️ AND A GUARD ON THAT LINE MATCHES NOTHING

```js
const holds = (character?.holdings || []).filter(h => h && h.condition !== "failed").length;
```

⛔ **`"failed"` is not in the holdings vocabulary.** `CONDITIONS = ["failing", "strained", "holding",
"thriving"]`. ⚠️ **It is the QUEST vocabulary, borrowed across.** So a **failing** holding counts fully
toward raising a band. ✅ **Not urgent — no save has any holdings yet — but it is wrong now and free to fix.**

---

## §R2.2 — ⛔ Q1 · THERE IS NO HOLDINGS SECTION. THERE IS NO HOLDINGS ANYTHING.

> §5 Q1: *"The character sheet holdings section is the obvious home… Is there an existing action-menu
> pattern there?"*

**Comment-stripped count of `holdings` across every file:**

| file | reads | what for |
|---|---|---|
| `worldtick.js` | 10 | ✅ the tick advances them |
| `melee.js` | 4 | ✅ `canRaiseBand` |
| `gm_registry.js` | 7 | ✅ the GM is told |
| `app.js` | ⛔ **5** | ⚠️ **the import, and the three `holdingOps` branches. Nothing else.** |

⛔ **NOTHING RENDERS A HOLDING. THE PLAYER CANNOT SEE WHAT THEY HOLD.** The world moves them, the GM reads
them, battle counts them — and there is no surface where they appear.

⚠️ **`holdingsForGM` is imported at `app.js:59` and never called.** A dark import.

➡️ **So Q1's premise is the thing to fix first.** ⛔ **This spec's invocation point AND
`DESIGN_celebrations.md` §5.1's offer list are the same missing surface** — *"Silas's list is empty and
should read '4 assignments look like places — review'"* describes a list that does not exist.

✅ **That is good news for sequencing: one section unblocks both.**

### ⚠️ AND THE PROPOSE-THEN-CONFIRM PRECEDENT IS ITSELF DARK

`app.js:6395` sets `character.pendingCompanyOffers` and **nothing reads it** — `company.js:67` already says
so in its own comment: *"`pendingCompanyOffers`, which NOTHING READS."* ⛔ **So there is no confirm-flow
pattern to copy.** ⚠️ **Whoever builds the holdings section should build the confirm surface generically and
fold company offers onto it** — otherwise that is two dark propose-channels and one renderer each.

---

## §R2.3 — ⛔ Q2 · THERE IS NO DEBT OR GRIEVANCE STRUCTURE. STANDING IS THE ONLY LEVER THAT EXISTS.

**Measured:** no debt record, no grievance record, no arrears anywhere in `engine/`. ⚠️ **`obligation` is a
free-text string on the holding and has exactly one reader** — `holdingsForGM` renders it as `— owes: …`.

✅ **`standing.js` is real and has the write path you need:** `applyStandingOps`, `standingFor(character,
holderId, kind)`, and a **ledger with reasons** (`note()`), which CCODE-25 wired so the GM can voice *why*
regard moved.

⬜ **My recommendation, and it is your option (b) in the shape the engine already has:** on release, a
**standing op against the granting authority, with the reason recorded in the ledger**. ⛔ **Not a new debt
record.** A third relationship-with-consequences structure alongside standing and reputation would be a
fourth vocabulary for the model to answer in, and R18's lesson was that a merged mechanism beats a parallel
one.

⚠️ **What that cannot express:** a debt you can *pay off later*. Standing recovers with time and deeds; it is
not discharged by an act. ⬜ **If "you still owe them, and you can settle it" is the design, standing is the
wrong instrument and it wants its own record.** **That is your call, not mine.**

---

## §R2.4 — ⚠️ Q3 · THE STEWARD STAYS, AND THE RECORDS ALREADY ALLOW IT

`assignments` key on `npcId::charge`. ⛔ **Neither key names the holder.** So a steward's assignment survives
a change of holder untouched — **nothing breaks if they stay.**

✅ **Which means your instinct is not just defensible, it is the path of least machinery.** ⚠️ **One caution:
I have just built `holding.fromAssignment` (the migration link). On transfer that link should be kept as
history and NOT carried as a live claim** — the new holder did not earn the assignment that built the place.

---

## §R2.5 — ⚠️ Q4 · TWO KINDS OF COLLECTIVE EXIST, AND NEITHER CAN OWN ANYTHING

| candidate holder | status |
|---|---|
| **a named NPC** | ✅ **fully supported today** — `holding.steward` is already an npcId |
| **a community** | ⚠️ **114 distinct `communityId` strings** across locations (`valley.millbrook`, `mason.bedrock`…) — ⛔ but they are IDs on places, not records |
| **a people / settlement** | ⚠️ `standing.js` models exactly two kinds: `"people"` and `"settlement"`. ⛔ They hold STANDING, not property |

➡️ **A transfer to an NPC is a change of a modelled owner. A transfer to a community is a narrative record
plus a standing move** — nothing in the world model can be said to *hold* it afterwards.

⬜ **I would ship NPC transfer first and let community transfer be exactly that: news, history, and standing.**
⚠️ **Do not let it wait for a faction system** — ceding the Raven's Home back to the Wends is worth having as
a recorded act even if no record answers for it afterwards.

---

## §R2.6 — ⚠️ Q5 · CROSS-CHARACTER IS REACHABLE AND I WOULD LEAVE IT OUT

**16 saves across 6 player keys — `player-s9z9u1` alone has 8.** `listCharacters()` exists and enumerates
them.

⛔ **But every write in this codebase goes to the LOADED character.** Handing a holding to a save that is not
open means writing another character's file from this one, which nothing does today. ⬜ **Out of scope until
something else needs it** — and it would be the first of its kind, which is a bad thing for a feature to be.

---

## §R2.7 — ✅ Q6 · NO CHANGE NEEDED

`unstewardedHoldings` reads `character.holdings` directly (`:149`). ⛔ **A released holding is out of the
array, so it cannot be reported.** ✅ **Release is already invisible to it, for free.**

---

## §R2.8 — ⬜ WHAT I WOULD BUILD, IN THIS ORDER

| # | step | blocked on |
|---|---|---|
| 1 | ⛔ **the character-sheet holdings section** — the first player-facing surface holdings have ever had | ⬜ **placement is Erik's**, and it unblocks the migration offer too |
| 2 | the confirm surface, built generically, with `pendingCompanyOffers` folded onto it | 1 |
| 3 | `releaseHolding` / `transferHolding` in `holdings.js`, replacing the bare filter at `app.js:6391` | ✅ nothing |
| 4 | the standing cost on release | ⬜ **§R2.3 — standing, or a payable debt?** |
| 5 | fix `melee.js:462`'s `"failed"` guard | ✅ nothing |

⚠️ **Steps 3 and 5 need nothing from anyone and I can do them now.** ⛔ **Step 1 is the one that matters and
it is the one I will not place by guess** — it is the same call `DESIGN_celebrations.md` §5 answered for the
*offer*, and it turns out the offer needs the section to live in.
