# SPEC — Bring existing holdings into the holdings system

**Author:** Aevi (PO) · **Date:** 2026-09-02 · **Status:** `spec_ready` — ROUND 2 requested
**Origin:** Erik — *"Let's make sure we have a spec for CCode to bring the current holdings into the
system properly."*
**Supersedes the framing of:** the SNG-358 §0 finding, which Aevi described as *"the post leaves state when
the assignment completes."*

---

## §1 — ⛔ THE BUG IS WORSE THAN IT WAS REPORTED, AND SIMPLER

**Measured on Silas's live save (L30):**

```
holdings: []
```

⛔ **EMPTY.** Meanwhile he is running four delegated assignments, one of which is
`cassiel-ord::full-reconstruction-of-the-raven-s-home-`.

⚠️ **CCode's SNG-358 review said the post *"leaves the game's state entirely at the moment it is
completed."* That is true but it buries the real problem: THE POST WAS NEVER IN THE HOLDINGS SYSTEM AT
ALL.** Nothing will be deleted on completion because nothing was ever created.

➡️ **So the work is not "make holdings outlive assignments." It is a MIGRATION.** Players have been
accumulating places for thirty levels through the assignment system, and the holdings system shipped
2026-08-08 into an empty room.

---

## §2 — THE TWO RECORDS, AND WHY THE MAPPING IS NEARLY FREE

**Assignment** (`engine/assignments.js`):
```
{ id: "npcId::slugged-charge", npcId, npcName, charge, targetEventId,
  progress, status, stampedAtWorldCount, lastMovedWorldCount }
```

**Holding** (`engine/holdings.js`):
```
{ id, kind: "post"|"enterprise", name, locationId, steward,
  obligation, condition, claimedDay, lastMovedWorldCount, history[] }
```

| holding field | comes from |
|---|---|
| `steward` | `assignment.npcId` ✅ direct |
| `name` | `assignment.charge` ✅ direct |
| `claimedDay` | `assignment.stampedAtWorldCount` ✅ direct |
| `lastMovedWorldCount` | `assignment.lastMovedWorldCount` ✅ direct |
| `condition` | ⬜ derive from `assignment.progress` / `status` — see §4 |
| `kind` · `locationId` | ⛔ **NOT DERIVABLE — see §3** |

---

## §3 — ⛔ NOT EVERY ASSIGNMENT IS A HOLDING. THIS IS THE WHOLE DIFFICULTY.

**Silas's four, read as written:**

| assignment | is it a holding? |
|---|---|
| `cassiel-ord::full-reconstruction-of-the-raven-s-home-` | ✅ **post** — a named place |
| `fendt::warden-of-the-threshold-post-at-the-ridg` | ✅ **post** — says "post" outright |
| `edvar-crane::the-millbrook-filtration-thread-repair-s` | ⚠️ **ambiguous** — a repair *at* a place. Enterprise, or just a task? |
| `edvar-crane::silas-s-named-delegate-to-mara-wells-and` | ⛔ **NOT A HOLDING** — a relationship, a role held with a person |

⚠️ **A blind migration mints "Silas's named delegate to Mara Wells" as a post, and that is nonsense.**

➡️ **The migration PROPOSES; it does not mint.** Surface candidates and let the player confirm kind,
name and location. ⛔ **Never auto-create — the record it would create wrong is a record about a place the
player has cared about for thirty levels.**

⬜ **Heuristic for the proposal, not the decision:** a charge naming a place, a post, a station, a house,
a mill, a road, or a watch is a candidate. A charge naming only a PERSON is not.

---

## §4 — CONDITION AT MIGRATION

`addHolding` defaults `condition: "holding"` — the middle of `["failing","strained","holding","thriving"]`.

⬜ **Aevi's proposal:** every migrated holding enters at `"holding"` regardless of assignment progress.
⚠️ **Rationale: `condition` is a LIVING state the tick moves, not a score.** An assignment at 80% progress
is not a thriving post; it is a post being built. Let the first tick after migration move it honestly
rather than importing a number that meant something else.

⛔ **The one exception worth CCode's view:** an assignment already at `status: "done"` describes a place
that is FINISHED, not one that is failing. It should still enter at `"holding"` — with no steward, since
the work is over — and then obey R25's unstewarded rules like any other.

---

## §5 — ⚠️ THE INTERACTION THAT MAKES THIS URGENT

**R25 (2026-09-02) just ruled `presence` 14/18 against the unstewarded floor and ceiling.** Those
milestones read `character.holdings`.

⛔ **Silas is presence 9 with `holdings: []`.** When he reaches 14, the milestone will fire against an
empty array and grant nothing — and nothing will report that it did nothing.

➡️ **The presence ladder cannot be evaluated in play until the migration lands.** ⚠️ **This is the same
shape as `folkAccessible` and `backlashRung`: authored, wired, and pointed at a void.**

---

## §6 — ⬜ WHAT HAPPENS TO THE ASSIGNMENT AFTER MIGRATION

⚠️ **The assignment should NOT be deleted.** They answer different questions:

| record | question |
|---|---|
| **assignment** | *is the work progressing?* — finite, has a `done` |
| **holding** | *does the place persist, and in what condition?* — open-ended, no terminal state |

➡️ **Link them:** the holding carries the assignment that built it; when that assignment completes, the
holding remains and simply becomes unstewarded unless a keeper is named. ✅ **That is exactly the
SNG-358 §0 fix, arrived at from the other side.**

---

## §7 — ROUND 2 QUESTIONS FOR CCODE

1. ⛔ **Where does the migration RUN?** `reconcile.js` sweeps saves on load and is the natural home — but
   it currently only renames ids and never mints records. Is minting there acceptable, or does this want
   its own one-shot pass?
2. **Is the propose-don't-mint shape right (§3)?** If a confirmation UI is expensive, is there a safer
   automatic subset — e.g. only charges containing an explicit `post`/`station`/`house` token?
3. **`locationId`** — can it be resolved from the charge text against the 135 authored places, or must the
   player pick? ⚠️ `"raven-s-home"` and `"the-ridg[e]"` look resolvable; `"millbrook-filtration"` may not be.
4. **§4 — does every migrated holding enter at `"holding"`,** or should a `done` assignment enter higher?
5. **§6 — where does the assignment↔holding link live?** A field on the holding, on the assignment, or a
   derived join?
6. ⚠️ **How many saves are affected?** Silas has 4 assignments; **16 saves exist.** ⬜ Please measure rather
   than assume — ⛔ **Aevi has claimed absence from a partial scan five times this session, and CCode's
   ROUND 2 on the sect merge caught a sixth in the other direction (a false PRESENCE — her "hard-coded ids
   in engine code" matched CCode's own comments written an hour earlier).** ➡️ **Neither of us should be
   trusted on a count either of us produced by eye.**
