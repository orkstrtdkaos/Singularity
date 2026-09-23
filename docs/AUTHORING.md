# AUTHORING A RECORD — the procedure, and why it exists

**Aevi · 2026-09-18 · SNG-626**

> **Erik:** *"Make sure you document how to write and update objects. You made errors on writing skills — you
> shouldn't. Everything exists for you to be able to read and know how to author properly. Document it and
> follow it."*

---

## §1 — ⛔ WHAT WENT WRONG, EXACTLY, SO THE PROCEDURE HAS A REASON

Authoring four commander crafts I made **nine errors**, and **every answer was already in the corpus**:

| # | error | what would have caught it |
|---|---|---|
| 1 | `harmRung: 0` — a number | it is a **gate** vocabulary, not a schema enum: `lethal \| damaging \| incapacitating \| none` |
| 2 | `axes` as an array | the schema says `object`, and every neighbouring craft is one |
| 3 | authored `rankProgression` | the engine **stamps** it — it is on a loaded record and in no schema |
| 4 | `tier` ≠ `levelReq` | CCODE-224, a ratchet |
| 5 | no per-rank `functions` | 147c reads the RANK, not the ability |
| 6 | a rank verb the top level lacked | §88, a ratchet |
| 7 | `reachesDepth` as a unit scope | it is the **death ladder's** ordinal |
| 8 | **glyphs in player-facing fields** | A1 — pinned at zero **the day before**, by me |
| 9 | **quoted Erik by name inside a card** | nothing: a gate cannot see authoring voice. Only reading it can |

⚠️ **Eight of the nine are machine-checkable and I found them one gate at a time, over nine runs.** The ninth is
not checkable at all.

## §2 — ⛑ THE PROCEDURE

**1 · Does it already exist?** `node scripts/exists.mjs <name>` — searches every authored kind by id and name.
⛔ I once resumed intending to author a craft **I had written myself six minutes earlier**.

**2 · What is the shape?** `node scripts/authoring.mjs <type> [exemplarId]` — prints the required fields, the
closed enums, the **shapes that are not strings**, the fields the engine **stamps and you must never author**, the
vocabularies **closed by a gate rather than by the schema**, and a live exemplar to match field for field.

**3 · Open the nearest authored record and match it.** Not a remembered shape — the actual neighbour. If you are
writing a marcher craft, read a marcher craft.

**4 · Run the suite BEFORE the commit message, not after.** Every one of the eight was a single `npm test` away.

**5 · Then read your own player-facing text back.** ⛔ The ninth error passes every gate: `description`, `notFor`,
`plainly`, `grants` and `cannot` are **read by a player**, and the house notation, the shouting and the authoring
voice are all invisible to a machine and obvious to a person.

## §3 — ⚠️ THE TWO RULES UNDER ALL OF IT

**A GATE'S VOCABULARY IS NOT IN THE SCHEMA.** `harmRung`, `damageType`, `assistTags` and `vocation` are closed by
`content_ci`, `damage_families.json` and `combatants.js` respectively. ⛑ `authoring.mjs` reads each from its own
source so it cannot drift from what actually enforces it.

**AND THE CORPUS IS THE SPECIFICATION.** ⛔ Not this document — **this document goes stale and the tool does
not.** Everything here that is a fact rather than a habit is printed by `authoring.mjs` from the live schema, the
live gates and a live record. If the two ever disagree, **the tool is right.**


---

## §4 — ⛔ WHAT ELSE WENT WRONG, 2026-09-14 → 19, AND WHAT EACH TAUGHT

Every one of these was caught by a gate, by Erik, or by a later measurement of my own. **None was caught by
being careful.** That is the point of the list.

**1 · I ARGUED FROM RECALL ABOUT WHAT EXISTS.** Resumed intending to author a craft I had written **six minutes
earlier**. Nothing was stale except my memory of it. → `scripts/exists.mjs`, and it is step one of §2 for a
reason.

**2 · I MEASURED THE WRONG THING AND REPORTED IT.** Six instrument errors in one week: counted per-craft when
the engine stamps per-VERB (164 of 432 roll more than one); read `walkingDays` as miles; compared a truthy
string to `true`; called `typeof null === "object"` a schema failure; looked for tag families at the wrong path
and got zeros; read the rung a hold had FILLED rather than the one that FITS it, which showed three live holds
over capacity. ⚠️ **A zero from the wrong path is not a finding. Check the probe before reporting the result.**

**3 · I TREATED A SCOPE ERROR AS A LIST OF MISTAKES.** A too-permissive walk wrote `vocation` and `domains` into
**164 files** — locations, rules, companions, crafts. I stripped abilities by hand, then companions by hand,
while the gates kept finding more. ⛔ **A surgical fix is the wrong tool for a scope error.** Revert and redo
scoped.

**4 · I PUT A NOTE INSIDE A RULES BAG.** Twice. `unreadRuleConstants` counts every leaf and does not care about
a leading underscore. **A note in a rules bag IS an unread constant.** Reasoning goes in a doc or a file whose
leaves nothing reads.

**5 · POSITION IS NOT PROXIMITY.** `loadRule` sits in a POSITIONAL `Promise.all`; I put a new rule beside the
name that receives it and shifted every rule after it by one — `powerBands` and `tierRarity` both went false and
the suite lost 34 checks. ⚠️ **The convention "beside the name that receives it" means *in this array*, not *at
this line*.**

**6 · I INVENTED IDS.** `crossing` for a region (`the_center`), `gearlands` for another (`the_gearlands`),
`build`/`organize`/`sustain` for assist tags, `healer` for a vocation, `unstated` for a sex enum. ⛔ **NEVER TYPE
AN ID. READ ONE.**

**7 · A POLARITY IS CHECKED AGAINST WHAT THE THING IS.** Reversing an axis name and flipping the sign preserves
the arithmetic and can invert the meaning — it read the **unmaker's capstone as strongly creative**. ⛑ I had
done this correctly an hour before, by checking `order_chaos` against the place it described. **Check the record,
never the sign it had.**

**8 · A NEGATIVE FIXTURE HAS A SHELF LIFE.** §216 used `command_field` as its "unknown craft" — a plausible name
chosen *because* it sounded like one that ought to exist. **I made it exist.** A negative fixture wants a name
nothing will ever author.

**9 · AND THE ONE NO GATE CAN SEE.** I quoted Erik by name inside a card a player reads, and put glyphs and
shouted clauses into `description`, `notFor`, `plainly`, `grants` and `cannot` — **the day after driving that
count to zero myself.** ⚠️ **Read your own player-facing text back, out loud if need be.** Nothing else will.

## §5 — ⛑ THE THREE TOOLS, AND WHY EACH EXISTS

- **`scripts/exists.mjs <name>`** — does it already exist, across every authored kind. *Because I duplicated my
  own work inside one session.*
- **`scripts/authoring.mjs <type> [id]`** — required fields, closed enums, **shapes that are not strings**,
  fields the engine **stamps**, **vocabularies closed by a gate rather than by the schema**, and a live exemplar.
  *Because nine errors on four crafts all had their answer in the corpus already.*
- **`scripts/coverage.mjs [type]`** — which fields are filled, per type, per field. *Because every hole I closed
  this week — five appearances, one tier, seventy gear, sixty assistTags, a hundred vocations — I had been
  finding by hand, one field at a time.* ⛑ It found `assistTags` at 61% within an hour of being written, and
  that closed a defect I had filed against **CCode** and which turned out to be **sixty missing records of
  mine**.

⛔ **AND THE RULE THEY ALL SERVE: the corpus is the specification.** Not this document — **this document goes
stale and the tools do not.** If they ever disagree, the tools are right.



---

## §6 — ⛑ A PERSON: A WHOLE NAME, AND THE ID PLAY ALREADY GAVE THEM *(2026-09-23, SNG-638)*

> **Erik:** *"When people surface in the future, they get a full name, first, middle and last, and/or a title — so they can be distinct."*

**1 · A WHOLE NAME.** Every person record carries `name` (what people say — given and family, or title and name),
`fullName` (given, middle, family — three parts, always) and `title` when they hold an office or an epithet. ⛔ **No two
records share a spoken `name`.** Check every new part with `scripts/exists.mjs` *and* against the given names already met
on the device (`namematch.usedGivenNames`) — four characters on this device have met a Maren.

**2 · A PERSON FROM PLAY KEEPS THE REGISTRY'S ID.** ⛔ A content record links to a save's person **by id**
(`mara-wells`, `cassiel-ord`). I authored the councils as `councilor_dresh` and `warden_maren` while the saves said
`councilor-dresh` and `tuning-warden-lower-terrace` — **strangers wearing your people's names.** Read the id out of the
registry; never type it.

**3 · BEFORE SEATING ANYONE, LIST WHO ALREADY LIVES THERE.** The Tollmen took Greta's waystation because I read the place
and never asked who kept it. A power's seat, or a person's home, gets its residents listed first.

— Aevi
