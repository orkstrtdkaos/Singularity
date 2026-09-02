# BACKLOG — The folded party fights from its own character sheets

**Raised by:** Erik, 2026-09-02 · **Logged by:** CCode · **Status:** ⬜ `backlog` — not specced, not built

> *"expand and enrich the folded party battle rules — i want it based on the NPC character sheet with the
> skills they know, etc."*

---

## §1 — WHAT EXISTS TODAY, MEASURED

`bringForward` (`melee.js`) splits allies into **forward** (narrated blow by blow) and **folded** (in the
fight, not narrated). ✅ **It is live and wired end to end** — `encounters.js:186` feeds `folded` into
`battleRound`, and two mechanics read it:

| | how it works today |
|---|---|
| ✅ folded allies **add damage** | `perFoldedAlly` (default **2**), √K-compressed by `predictAggregate`, multiplied by `groupCapability` cohesion |
| ✅ folded allies **absorb losses** | a pool proportional to the fold's own median health |

⛔ **AND THAT IS THE WHOLE OF IT.** Comment-stripped scan of `skill_battle.js`:

| | |
|---|---|
| `contributions` read | ⚠️ **exactly once** — `folded.filter(f => … (f.contributions ‖ []).includes("HARM"))` |
| `PROTECT` | ⛔ **0 occurrences** |
| area / splash | ⛔ **0 occurrences** |
| any read of a folded ally's **abilities** | ⛔ **none** |

➡️ **A folded ally is a number with a name on it.** Veth's crafts, her ranks, her damage type, what she is
*for* — none of it reaches the fold. Two allies of wildly different capability contribute identically.

⚠️ **A warder folded into slot 5 contributes exactly what a bystander does**, because the only filter is
`HARM`. ⛔ **Erik has already flagged the consequence** — *"providing a use for the area effects and
bolster/protection that is a bit more intimate than band or unit level"* — and `PROTECT` coverage exists
**only at BAND scale** (`bandGaps` → `lossMultiplier`), which is the scale he called too coarse.

---

## §2 — ⚠️ THE SHEET ALREADY EXISTS AND HAS NO LIVE CALLER

⛔ **This is the part that makes the request cheaper than it sounds.** `engine/npcsheet.js` — **361 lines**,
built for Pell — produces a real character sheet for a person: what they know, at what rank.

| system | keyed on | wired? |
|---|---|---|
| `synthesizeOpponentSheet` | **`threat`** — a number | ✅ live |
| `npcsheet.sheetFor` | ⚑ **the person** | ⛔ **no live caller** |

➡️ **The thing Erik is asking the fold to read is already written.** ⚠️ **This is the fourth door again:
authored, registered, loaded — and never READ.**

---

## §3 — ⬜ THE SHAPE OF THE WORK (not a spec — the questions a spec would have to answer)

1. ⬜ **Does the fold read `sheetFor`?** If so, `bringForward` stops emitting bare ids and starts emitting
   sheets, and every consumer of `folded` gains access to real crafts and ranks.
2. ⬜ **What does a folded PROTECT do?** The intimate-scale equivalent of `bandGaps`' `lossMultiplier` —
   ⚠️ but at party scale a warder should protect *someone in particular*, not divide a pool.
3. ⛔ **What damage type does the fold deal?** Today the fold rides the player's declared blow and inherits
   its affinity — a deliberate choice recorded in `skill_battle.js`, and **wrong the moment a folded ally
   swings their own craft.** ⚠️ **This is the decision the whole feature turns on.**
4. ⬜ **Do folded allies spend energy?** A craft used is a craft paid for; a fold that fights for free is a
   fold that never tires.
5. ⬜ **Area effects.** Erik named them twice. Nothing at party scale reads or produces one.
6. ⚠️ **What must NOT change:** `predictAggregate`'s √K compression. The naive K× alternative matches on the
   average and is **614% wrong on the spread** — which is invisible to anyone checking averages, and is how
   a party that recruits a fourth member starts seeing wipes.

---

## §4 — ✅ WHY THIS IS WORTH DOING NOW

R25a gives the party a **fifth and sixth place** (presence 10 and 14). ⛔ **Those milestones land in a
system where the fourth member already contributes a flat +2.** ⚠️ **The ladder is shipped; the reason to
climb it is not.**
