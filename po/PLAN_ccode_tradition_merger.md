# PLAN — the tradition merger, engine side

**CCode → Erik, then Aevi to fill in · 2026-08-31 · v1.9.280**

> Erik: *"let's get the initial game plan in for the merger update. then we'll send it to aevi to fill in before your implementation review."*

⬜ **Sections marked ⬜ are Aevi's to answer.** I have deliberately not guessed at any of them — every one is a
content decision that changes what the engine must do, and a plan that quietly assumes an answer is worse
than one that names the question.

---

## §1 — WHERE THIS ACTUALLY STANDS, MEASURED

Not from memory. Measured against HEAD today:

| | |
|---|---|
| abilities in the corpus | **412** |
| carrying `traditionV2` | ⚠️ **21** |
| **readers of `traditionV2` in engine, app, tests or scripts** | ⛔ **0** |
| in `schemas/ability.schema.json` | ✅ yes |

⛔ **`traditionV2` IS AT DOOR TWO OF FOUR.** Authored ✓ · registered in the schema ✓ · **loaded ✗ · read ✗.**
Nothing in the game can see it. That is the exact shape this project has been burned by repeatedly, and it
is the first thing the plan fixes — not because the field is wrong, but because until something reads it,
every further authoring pass is unverifiable.

**The direction of travel, from the 21 that exist:**

| current tradition | axis · pole | → `traditionV2` |
|---|---|---|
| cogitant | body_mind · mind | **Mind** |
| figurist | concrete_abstract · abstract | **Mind** |
| syllogist | emotional_logical · logical | **Mind** |
| somatic | body_mind · body | **Body** |
| mason | concrete_abstract · concrete | **Body** |
| ashwarden | death_life · death | **Death** |

⛔ **THIS IS NOT A RENAME — IT CROSSES AXES.** `Mind` absorbs poles from **three different axes**
(body_mind, concrete_abstract, emotional_logical). That is the whole difficulty, and §3 is about it.

**The current architecture it is replacing:** 12 axes × 2 poles = 24 pole-traditions, + 2 foothills
(god_named, bargainers) + 3 folk (harmonic, radiant_folk, valley_craft) = **29 records, 26 "traditions"**.
Every pole holds exactly one tradition today.

---

## §2 — THE BLAST RADIUS

| | count |
|---|---|
| engine modules touching `tradition`/`powerSystem` | **44 of 99** |
| references in `app.js` alone | **269** |
| content files keyed on tradition | **47** |
| combination recipes | **63** |
| modules touching the circle geometry (`ring`/`distances`/`opposite`/`adjacent`) | **24** |

### ✅ The good news — there is a seam

`engine/traditions.js` already centralises this: `buildTraditionIndex`, **`traditionOf(ability, index)`**,
`ringDistance`, `antipodeOf`, `neighborsOf`, `isKinAdjacent`, `domainAccess`, `crystallizeDomains`,
`inferDomains`. The access model is not scattered — it is one module.

**Measured:** all **412** abilities resolve through `traditionOf` today, **all 412 via their own `tradition`
field**. The reverse map (`abilityToTradition`, 195 entries built from `traditions[].abilities`) is
currently **never used as a fallback** — a dormant path that the merger will wake up.

### ⛔ The bad news — 36 reads bypass the seam

`app.js` reads `.tradition` (13) and `.powerSystem` (23) **directly**, without going through `traditionOf`.
Those 36 are where a merger leaks: the resolver returns `Mind` and the screen still says `cogitant`.

⚠️ **And `traditionOf` never reads `powerSystem` at all.** Anything relying on the `powerSystem` spelling is
already outside the resolver.

---

## §3 — ⛔ THE HARD PROBLEM: THE GEOMETRY DOES NOT SURVIVE A CROSS-AXIS MERGE

This is the part I most need Aevi and Erik to rule on, because the engine cannot infer it.

`domainAccessModel` is **entirely built on ring distance**:

- primary → full access
- **adjacent (steps = 1)** → free except capstones
- tertiary → *must* be a ring-neighbour of the secondary
- ⛔ **opposed → CLOSED.** *"You cannot learn the opposite pole of what you are."*
- cross-pole braids are *"the ONLY sanctioned road to your own antipode, which is precisely what makes
  carrying one mean something."*

If `Mind` = mind + abstract + logical, then:

1. ⬜ **What is Mind's antipode?** It has three today — body, concrete, emotional — and they land in
   different merged traditions. If Mind's opposite is Body, then *abstract*'s true opposite (*concrete*)
   collapses into the same closure by accident, and *emotional*'s (*logical*) becomes an **internal** tension
   inside two merged traditions rather than a barrier between them.
2. ⬜ **Do the 12 axes survive as a layer beneath the merged traditions, or are they retired?** The braids,
   the `axes` weights on every craft, `wheelgeom`, and `crystallizeDomains` all read the axis structure.
3. ⬜ **Is the ring still a ring?** 24 positions with `min(|i−j|, size−|i−j|)`. Fewer traditions means either
   a smaller ring (re-spaced, so every authored `distances` table is void) or the merged traditions occupy
   *sets* of positions and distance becomes set-to-set.
4. ⛔ **Whatever the answer, `distances` is authored per-tradition today and will be stale.** It must become
   derived, or it becomes 26 stored copies of a value the ring already implies — the defect this project
   hits most often.

⚠️ **My honest read:** the access model is the highest-risk part of the merger, well above the ability
re-tagging. Re-tagging is a lookup. The geometry is *the rule that decides what a character may ever learn*,
and it currently has no meaning under a cross-axis merge.

---

## §4 — WHAT AEVI NEEDS TO FILL IN

⬜ **1 · The complete mapping.** Every one of the 29 records → its merged tradition. 21 abilities carry
`traditionV2`; **391 do not**. I can apply a tradition-level mapping to all 412 mechanically — I need the
table, not per-ability tags.

⬜ **2 · The roster and the names.** How many merged traditions, and what each is called. `Mind`, `Body`,
`Death` are the three visible so far.

⬜ **3 · Do the old names survive as anything?** A Cogitant character today — do they become "a Mind
practitioner", or "a Cogitant, of the Mind tradition"? ⚠️ **This is a mechanical question, not a flavour
one:** if the old id survives as a sub-identity, 47 content files and every authored NPC keep working and
the merge is additive. If it does not, every reference migrates.

⬜ **4 · The antipode rule** (§3.1). What is closed to whom.

⬜ **5 · Folk and special systems.** harmonic · radiant_folk · valley_craft are *folk-shadows of the great
poles*; god_named and bargainers are foothills; Precursor is fiction-gated and outside the matrix. Merged,
re-parented, or untouched?

⬜ **6 · The 63 combination recipes and the cross-pole braids.** A braid whose two poles now sit inside the
*same* merged tradition is no longer a cross-pole braid. Which ones does that hit, and what happens to them?

⬜ **7 · What a merged tradition means in the world.** The current `principle` is *"a tradition is a PEOPLE's
craft — you learn it by being native, standing in their region, or being taught by one of them."* Three
peoples merging into `Mind` is three peoples, not one. Is a merged tradition a **people**, or a **domain
that several peoples practise**? ⛔ **The access gates read the answer:** "native to that people" and
"standing in their region" are region-keyed, and three peoples have three regions.

---

## §5 — THE ENGINE SEQUENCE I OWN

Deliberately ordered so that **nothing is authored against an unread field**, and each step is verifiable
before the next depends on it.

**Phase 0 — the reader, before the field.** Teach `traditionOf` about the merged layer behind a content
dial that defaults to a **no-op**. `buildTraditionIndex` gains a merge map read from `traditions.json`.
Nothing changes until content turns it on. ✅ *This is the step that moves `traditionV2` from door two to
door four, and it can land before any of §4 is answered.*

**Phase 1 — the mapping becomes content, once.** One authored table, tradition → merged tradition.
⛔ **Derived everywhere else.** No per-ability `traditionV2` tag survives as a source of truth — 412 stored
copies of a lookup is exactly the defect that keeps costing us. The existing 21 become a *cross-check*
against the table, which is a use they are genuinely good for.

**Phase 2 — close the 36 bypasses.** Every direct `.tradition` / `.powerSystem` read in `app.js` goes
through the resolver. ⚠️ **Gated so it cannot regress**, the same way §27 now gates the melee config.

**Phase 3 — the geometry, once §3 is ruled.** `ringDistance` / `antipodeOf` / `neighborsOf` /
`domainAccess` re-derived from the merged roster. **`distances` becomes derived, not authored.**

**Phase 4 — migration.** Existing characters keep every learned skill: ability id → merged tradition, with
the old id preserved on the record so a save written before the merge still reads. `traditions.json`'s own
`migration` note already sets this rule; it just has to be honoured.

**Phase 5 — the surfaces.** Aesthetics, names, art, the skill graph, the learn screen. These are keyed by
tradition id and will show the merge or fail to.

### The gates that go with them

- ⛔ **Every ability resolves to exactly one merged tradition, and the count is asserted** — a
  non-vacuity floor so a half-applied mapping cannot read as success.
- ⛔ **A merged tradition's members are its parts and nothing else** — proved red by adding a phantom part.
- ⛔ **No `app.js` read bypasses the resolver** (Phase 2's regression guard).
- ⛔ **The 21 authored `traditionV2` tags AGREE with the derived table.** ⚠️ This is the one gate I most
  want: a disagreement means either the table or the tag is wrong, and finding out *later* means finding out
  from a player.
- ⛔ **A character built before the merge loads with every skill intact** — the migration's only real test.
- ⚠️ **`--ratchet` on unresolved abilities**, so the number may only go down.

---

## §6 — RISKS I WANT ON THE RECORD BEFORE WE START

1. ⛔ **The geometry is the whole risk** (§3). Everything else is a lookup.
2. ⚠️ **`distances` is authored today and will silently be wrong.** A stale distance table does not throw —
   it quietly closes a door that should be open, or opens one that should be closed, and the only symptom
   is a player unable to learn something.
3. ⚠️ **The 5 records with no ring position** — god_named, bargainers, harmonic, radiant_folk, valley_craft —
   are already outside the geometry. Whatever the merged model is, they need a defined answer rather than
   inheriting one by omission.
4. ⛔ **The tournament will move, and that is not evidence of anything.** `tradition_war.mjs` groups by
   `tradition || powerSystem`; the moment the merge lands, a "tradition" is a merged one and the field is a
   different measurement. ⚠️ **I will re-baseline before and after so the change is attributable** — otherwise
   we will read a re-grouping as a balance shift.
5. ⚠️ **21 abilities are already tagged.** If the final table disagrees with any of them, that is a real
   finding about the intent and should be surfaced, not silently overwritten.

---

## §7 — WHAT I CAN START NOW, BEFORE ANY OF §4 IS ANSWERED

**Phase 0 only** — the reader, defaulted off. It is the one piece that is safe under every possible answer
to §4, it turns the schema field into something the game can actually see, and it makes the eventual
authoring pass verifiable instead of hopeful.

⬜ **Erik: say the word and I will land Phase 0 while Aevi fills in §4.** Everything past Phase 1 waits on
the §3 ruling, and I would rather not guess at it.
