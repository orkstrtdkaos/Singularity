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

---

# ROUND 2 — CCode · 2026-09-02 · v1.9.318

⚠️ **Both of your framings for Q1 and Q2 turn out to be half-built already, in opposite directions.**

---

## §R2.1 — Q6 · THE MEASUREMENT, FIRST, BECAUSE IT SHRINKS EVERYTHING

⚠️ **You asked me not to assume. My first pass looked for `character.assignments` and found ZERO across
all 16 saves** — they live at **`character.worldState.assignments`**. ⛔ **Another guessed field name that
would have reported an empty migration.**

| | |
|---|---|
| save files | **16** |
| ⛔ **with assignments** | **1** — Silas only, **4 assignments** |
| with holdings | **0** |

➡️ **The migration touches ONE save.** ✅ Which makes propose-don't-mint cheap: it is four confirmations,
once, not a feature.

---

## §R2.2 — ⛔ Q1 · RECONCILE ALREADY MINTS. YOUR PREMISE IS THE SEVENTH CLAIM.

> §7.1: *"`reconcile.js` … currently only renames ids and **never mints records**."*

**`engine/reconcile.js:393`:**

```js
const def = buildBraidDef(c, m.components, catalog);
if (def && mintBraid(c, def, { at: null })) names.push(def.name);
```

⛔ **It mints braids.** A whole step exists whose job is to mint records a player had earned and never
received. ✅ **So minting in reconcile is not a question — it is established practice, with precedent for
exactly this shape: a thing the player earned that the system never created.**

⬜ **Answer: reconcile, as its own versioned step.** Not a one-shot pass — a step is idempotent by
`reconcileVersion`, runs on every save automatically, and needs no separate invocation you would have to
remember for the seventeenth save.

---

## §R2.3 — ✅ Q2 · YOUR SHAPE IS RIGHT, AND THE MECHANISM IS ALREADY IN THE CONTRACT

**`reconcile.js:34`** — a step returns `{ notes?, offers?, warnings? }`. And **`:1059`**:

```js
if (r.offers) out.offers.push(...r.offers); // GRANTS: surfaced, never auto-imposed
```

⛔ **`offers` IS propose-don't-mint, written into the reconcile contract, with the intent stated in the
comment.** ⚠️ **And it has never been used:**

| | |
|---|---|
| steps returning `offers` | ⛔ **0** |
| `app.js:3187` | checks `rec.offers.length` — then assigns only `rec.notes` to `_reconcileNotes` |
| anything rendering an offer | ⛔ **nothing** |

➡️ **The channel exists end-to-end except at both ends.** ✅ **So the work is one producer and one
renderer, against a contract already agreed** — not a new mechanism and not a confirmation UI built from
scratch.

### ⛔ AND THE EVIDENCE THAT SETTLES IT IS IN SILAS'S SAVE

The charge you correctly classify as **not a holding** —

> `"Silas's named delegate to Mara Wells and the Hub committee water meeting — **holds the Millbrook
> crisis thread** if Silas…"`

⛔ **contains a real authored place name.** ⚠️ **A location resolver finds Millbrook in the one assignment
that must never become a holding.** ➡️ **Auto-minting would create "Silas's named delegate to Mara Wells"
as a post at Millbrook.** ✅ **Propose-don't-mint is not caution here; it is the only correct shape.**

---

## §R2.4 — ⚠️ Q3 · LOCATION RESOLVES FOR ONE OF FOUR, AND ONE MATCH IS A TRAP

Matched the full `charge` text (not the truncated id) against all **135** authored places:

| charge | resolves to |
|---|---|
| `full reconstruction of the Raven's Home post…` | ⛔ none |
| `warden of the Threshold Post at the ridge node…` | ⛔ none |
| `the Millbrook filtration thread…` | ✅ **Millbrook** |
| ⛔ `Silas's named delegate…` | ⚠️ **Millbrook — on an assignment that is not a holding** |

➡️ **One usable resolution in four.** ⬜ **Offer the match as a default the player can change; never take
it.** ⚠️ Your instinct that *"raven-s-home"* and *"the-ridg"* look resolvable was reading the **id**, which
is truncated — the full charge does name Raven's Home, but no authored place carries that name.

---

## §R2.5 — ✅ Q4 · AGREED, INCLUDING THE EXCEPTION

**Every migrated holding enters at `"holding"`.** ✅ Your rationale is the right one and it is the same
argument I made against importing `assignment.progress`: **`condition` is a living state the tick moves,
not a score.**

⬜ **And on your exception — a `done` assignment — I agree with your instinct, for a reason worth
stating:** entering at `thriving` would grant a rank a place has not earned under R25's rules, and
`unstewardedFloor`/`Ceiling` would then govern a value nothing produced. ✅ **Enter at `holding`,
unstewarded, and let the first tick be honest.**

---

## §R2.6 — ⬜ Q5 · THE LINK LIVES ON THE HOLDING

**`holding.fromAssignment = assignment.id`.**

⛔ **Not on the assignment, and not a derived join.** The assignment is FINITE — it has a `done` — and the
holding is not. ⚠️ **A field on the terminal record is lost exactly when the relationship becomes
interesting:** the moment the work completes is the moment you want to know which holding it built.

✅ A derived join on `npcId + charge` would work today and break the first time a steward is replaced —
which is precisely the event SNG-355 exists to model.

---

## §R2.7 — ⬜ WHAT I WOULD BUILD, AND WHAT I NEED FIRST

| # | step | needs |
|---|---|---|
| 1 | a `reconcile` step that PROPOSES holdings from assignments, returning `offers` | ✅ nothing — precedent at `:393`, contract at `:1059` |
| 2 | a renderer for `offers` — the first one | ⬜ **where it belongs in the UI is a call I would rather you made** |
| 3 | `holding.fromAssignment`, and the completion path leaving the holding unstewarded | ✅ nothing |

⛔ **I have built none of it.** The step is easy; **the renderer is the first surface `offers` has ever
had**, and a confirmation flow that mints records about places a player has cared about for thirty levels
is not something to place by my own guess.

⚠️ **One caution for whoever writes step 2:** `app.js:3187` currently drops `rec.offers` on the floor while
checking its length. ⛔ **A producer added without fixing that reads as working and does nothing** — the
same shape as every dark field this session.
