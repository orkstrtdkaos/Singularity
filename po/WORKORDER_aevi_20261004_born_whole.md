<!-- status: OPEN for CCode. Erik 2026-10-04: "Make sure the generation engines create fully formed objects." G0 is a live defect: generated LOCATIONS are rejected, so the world cannot grow places through the GM. -->
# WORKORDER: Aevi → CCode · generation makes whole things (SNG-673)

**Aevi (PO) · 2026-10-04.** Erik:

> *"Make sure the generation engines create fully formed objects."*
>
> and, on the deep lore: *"The world is generative so it always needs a way to grow and change."*

Read the second line as the reason for the first. The world grows through what play generates, so anything
generated has to be as whole as what we author by hand. Otherwise the generated half of the world is thinner,
and it gets thinner the longer anyone plays.

This audit was read-only, at 263ca53c5. Each finding has its file:line. G0 was run headless during the audit
and reproduced. I checked its premise in the code (the CRASH fields, and `checkBorn` running last and returning
null). **Before you fix G0, write the test that shows it red.**

## G0 · Generated locations are thrown away (live defect)

The location contract (`consumer_required_subfields.json`, contentTypes.location) marks `worldPos` and `axisVector`
as **CRASH**. `generate()` runs `checkBorn` last (generate.js:555) and returns null on any CRASH. Nothing inside
`generate()` supplies either field:

- `resolveRegionFor` (generate.js:531) returns only `regionId`. The comment at :544–550 says it "supplies the address".
- `worldPosForGenerated` is reached only from `commitGeneratedLocation` (app.js:11769) and reconcile v37.
- Nothing anywhere derives `axisVector` for a generated place.

Run headless with a fully filled LLM response, it returns
`NULL | rejects: worldPos:CRASH, axisVector:CRASH`. **Every `generateRequest` for a location comes back empty.**
That is the failure the comment at :544 says it fixed: "gate too strict, world quietly stops growing". The GM has
been unable to grow a place through this path. No test runs `generate("location")` against the real contract,
which is why nobody saw it.

## G1 · One finishing step, and every minter goes through it

Add a `finishBorn(type, record, ctx)` inside `generate()`, before `checkBorn`. Call the **same** step from every
other place that makes something:

| path | where | today |
|---|---|---|
| `generate("npc")` | generate.js:428 | `tier` only when `npcStanding` is passed; `romanceEligible` sits in `_gen`; no level, abilities, subAttributes, assistTags, knowledge, reactsToReputation, vocation, physicality, intimacyNotes, fullName/aliases, tradition, homeLocation |
| the `meet` op | npcs.js:498–563 | the commonest way a person enters play; name, role, description, sex/gender, age, and nothing that plays |
| company join | company.js:452 | a bare registry entry |
| quest-giver stubs | quests.js:675 | the same |
| `mintFigure` | worldtick.js:2689 | tier, weight, wants and verbs, in `worldState` and not on a sheet |
| `generate("location")` | generate.js + app.js:5828 | G0; also no `tier`, `parentId`, `role`, `kind`, `people`, `dangerLevel`, `substrateDensity` (parentId is set after the gate, and never reached) |
| transit / waygate | app.js:11778, :11840 | worldPos yes; no axisVector, kind, tier, role, spectrum; empty prose; never contract-checked |
| `generate("creature")` | generate.js:134 | whole stub, but tier and abilities are not drawn from the bestiary |
| `generate("arc")` | app.js:6957 | `hingeNpcs` always `[]`; `CONTENT.genArc` is undefined, so arcs get no examples |
| items | GM inventory op → `addItem`, app.js:9198 | contract stamped, nothing filled |

**What "whole" means is already written down.** It is the authoring standard:

- **A person:** `po/NPC_AUTHORING_TEMPLATE.md` and `docs/NPC_PIPELINE.md`.
  - **The engine stores what it can derive:**
    - `level` on the rung floor, stored rather than worked out on each read (npcsheet.js:84 does it on every read);
    - `abilities` as `{abilityId, level, why}` from `kitFor` against the person's traditions, every id resolving;
    - `subAttributes`, `assistTags` from the corpus vocabulary, `vocation`, and personality on 0–1;
    - `romanceEligible` at the top level, and `nameKnown`;
    - battle skills checked, so `battleSkillsFor()` returns more than one.
  - **The GM is asked for the prose**, which the engine can't derive: appearance, physicality (ADULT …), voice,
    wants, fears, knowledge, reactsToReputation as tags, intimacyNotes and a whole name.
  - ⛔ `NPC_PIPELINE.md:37–52` records that a person minted in the Valley gets **no craft at all**. Fixing that
    is part of G1.
- **A place:**
  - **Derived by the engine:** `worldPos` (from the parent first, then the first connection), `axisVector` and
    `poleIntensity` from the spectrum, `kind` (from the location_kinds rules), `tier`, `parentId`, `role`,
    `dangerLevel`, `substrateDensity` and `people`. It also inherits its parent's `loreRefs`, so a place made
    under the ground reads `the_deep_below`.
  - **Connections are reciprocal.** The neighbour gets the road too.
- **A creature:** tier and abilities from the bestiary it belongs to.
- **An arc:** at least one hinge person, generated whole by the same step if nobody fits.

## G2 · Ask for the prose, derive the numbers

The prompt (generate.js:786–862) asks only for `schema.required`.

- Widen each gen schema's `required` to the **prose** fields above. Never to the numbers: a model that
  invents a level is a model that invents a wrong level.
- Pass examples for every type. `pickExamples` covers npc and location; give creature and arc theirs.

## G3 · The gate: generated content passes the gates authored content passes

Generate N of each type headless, with canned LLM responses including truncated and degraded ones. Then run
the checks content_ci and `npc_pipeline --check` already run on authored content, and the NPC template's checks
(tier floor, abilities resolve, battle skills > 1, assistTags vocabulary, reputation tags).

- Negative: a canned response missing every derivable field still comes back whole, because the engine
  derived it.
- Negative: a response that cannot be placed comes back as a **stub that is still whole**, never a null.
  "A thin-but-present record beats a hole in the world" is your own line at generate.js:551. G0 shows the
  code doesn't do that yet.

## G4 · When play's creations are kept, the census moves with them

Erik: *"Go on the settlement count and increment it when the narrative makes new ones."* That ruling is recorded
in `ratified_census.json` as `standing`. Whatever promotes a generated place into content, whether a script or
a hand-carry, moves the census in the **same commit** and names the beat that made the place. An accidental
place still fails.

— Aevi, PO
