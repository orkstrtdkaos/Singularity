# SNG-358 — ROUND 2 REVIEW (CCode)

**For:** Aevi (PO) · **Date:** 2026-08-07 · **Status:** review only — nothing built, per your instruction
**Your two questions:** the `worldtick.js` hook, and whether posts and enterprises share a base record.

Both answered below, with a third finding that I think changes the sequencing.

---

## §0 — ⛔ THE FINDING THAT CHANGES THE SPEC: ONE HOLDING IS ALREADY HALF-MODELLED

§0 says "no holdings structure anywhere in the schema" and cites `locationState: {}`. That is true, and it
is not the whole picture. **Silas's `worldState.assignments` already carries a holding**, with a steward:

```
[working p0] Cassiel Ord — "full reconstruction of the Raven's Home post —
                            laboratory, workshop, Watch, forge, keeper's…"
[working p0] Edvar Crane — "Silas's named delegate to Mara Wells and the Hub committee water meeting…"
[working p0] Edvar Crane — "the Millbrook filtration thread — repair sequence…"
```

The **WORK ON** a holding is modelled. The **HOLDING** is not.

⚠️ **AND THAT IS A DATED BUG, NOT A GAP.** `advanceAssignment` is monotonic and terminal: `progress`
counts up and `done` ends the record. So when Cassiel finishes the reconstruction, the assignment closes —
**and the Raven's Home post leaves the game's state entirely at the moment it is completed.** The better
Silas's steward performs, the sooner his station stops existing anywhere the engine can see.

That is worth knowing before design, because it means holdings are not only a late-game feature. There is
live state today that is going to quietly delete something Erik built.

---

## §1 — YOUR QUESTION 1: THE `worldtick.js` HOOK

**Yes to the PASS. No to the RECORD.** They are separable and I think the spec is conflating them.

**The pass is exactly right and already proven.** `runWorldTick` step 3 gates on `elapsed >= 3`, advances
at most 6 items through one batched model call, derives news *only from what moved*, and puts personal
colour on the person's `statusNote` rather than the news. That is the shape a holding wants, and its
standing directive — **"the world TURNS, it does not narrate"** — is the one that keeps a smithy from
becoming a diary. Holdings should ride this loop.

**The record is wrong for holdings, on one specific point.** `advanceAssignment`:

```js
case "progress": assignment.progress++;  assignment.status = "working"; break;
case "done":     assignment.progress++;  assignment.status = "done";    break;
```

A task legitimately ends. **A holding has no `done`.** A smithy does not finish being a smithy; it is
thriving, or idle, or unstaffed, or lost. What a holding needs is a **condition that moves in both
directions**, not a counter that only rises to a terminus.

⛔ **So: reuse the loop, not the lifecycle.** If holdings are stored as assignments they inherit a
completion state that will silently retire them — the §0 bug, made permanent by design rather than by
accident.

⚠️ **One concrete consequence for the outcome vocabulary.** `progress | stall | problem | done` is right
for work. For a holding I would want something closer to `thrives | holds | strains | fails`, mapped onto
the same four model outcomes so the prompt does not need a second vocabulary — the model keeps answering
the question it already answers well, and the engine interprets it against the kind.

---

## §2 — YOUR QUESTION 2: SHARED BASE RECORD, OR SEPARATE?

**Shared base, discriminated by `kind`** — and the evidence is in Silas's own save rather than in
principle.

His charge reads *"the Raven's Home **post** — laboratory, workshop, Watch, **forge**, keeper's…"*.
**That is a post that CONTAINS an enterprise.** If post and enterprise are separate top-level records,
this one real holding has to be split into two that point at each other, and the fiction is unambiguous
that it is one place with one steward.

Proposed shape — the shared spine is small, and everything kind-specific stays out of it:

| field | why it is shared |
|---|---|
| `id`, `kind` | one discriminator, read from one place (SNG-247's lesson) |
| `locationId` | every holding is somewhere |
| `steward` (npcId) | every holding is run by someone, or is not — and "or is not" is a failure state |
| `condition` | the both-directions state from §1 |
| `obligation` | what it costs you; the thing that makes it a claim on attention |
| `lastMovedWorldCount` | so the tick can be idempotent, as assignments already are |

Kind-specific, deliberately **not** in the base: `post` → `writ`, `grantedBy`, `reach`; `enterprise` →
`produces`, `inputs`.

⚠️ **This is not the generic `holdings[]` you warned against in §1 of the spec, and the distinction is
worth stating.** A generic bucket is one where the KIND stops meaning anything and every consumer
re-derives behaviour from free text. A shared spine with a closed `kind` and kind-specific extensions is
the opposite: it is what lets the tick advance all of them and still let `presence` govern one and `craft`
the other.

⛔ **HOUSEHOLD IS NOT IN THIS RECORD AT ALL, AND SHOULD NOT BE.** It has no steward, no condition that
improves, and no production. Your own framing settles it: a household is *stake and obligation*, not a
thing you run. Putting it in the same table as the smithy is the first step toward it acquiring a
`condition: thriving`, and that is exactly the sentence about a family the game must never say.

---

## §3 — A THIRD FINDING: THE SAVE ARGUES FOR YOUR SEQUENCING, AND NAMES THE MIGRATION

Word counts across Silas's chronicle, deeds and codex:

```
warden  112     forge   27     Raven    6     station  3
child     5     wife     1     smithy   0     pregnant 0
```

- **The post is richly attested** — 112 mentions. It migrates from real text.
- **The "smithy" is called a FORGE.** Zero occurrences of "smithy", 27 of "forge". A backfill searching
  for the spec's word would have found nothing and concluded there was no enterprise to migrate.
- **The household is the thinnest thing in the save** — one "wife", zero "pregnant". It exists almost
  entirely in Erik's head and the GM's recent context, not in durable text.

⚠️ **That last line independently confirms your sequencing** (post → enterprise → household) and your note
that household should be *designed with Erik directly rather than specced at him*. It is not merely the
most delicate; it is the one with the least evidence to migrate from. **A backfill would be inventing it.**

---

## §4 — WHAT I RECOMMEND, AND WHAT I AM NOT DOING

**Recommend:**
1. **Post first**, as you sequenced — but treat it as *urgent-ish* rather than late-game, because §0's
   completion bug is live and will fire when Cassiel finishes.
2. Base record with a closed `kind`; `condition` not `progress`; ride the existing tick pass.
3. Steward resolves through `activeCompany`/`npcRegistry` — SNG-355 already made departure a status, so
   "your castellan left" becomes expressible rather than a deletion.
4. Migration reads the chronicle for **"warden"/"forge"/"Raven's Home"**, not the spec's vocabulary, and
   goes to Erik as a proposal.

**Not doing, and flagging instead:**
- I have not touched the ladder's `presence`/`rapport` 14–20. They stay blocked, as you said.
- I have not designed household. On your own reasoning it should not be specced without Erik, and I would
  add: it should not be *stored* until it is designed, because the schema is where a wrong model becomes
  permanent.

**One thing I want your call on before I build anything:** whether the completion bug in §0 justifies a
small, immediate patch — teaching `done` not to retire a holding-shaped assignment — or whether that is a
sticking-plaster on a record that is being replaced anyway. I lean toward leaving it and building Post
properly, but it is your call how much risk Erik's live save should carry in the meantime.
