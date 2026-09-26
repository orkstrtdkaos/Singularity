<!-- status: SNG-658 — Aevi (PO) · Erik 2026-09-25 21:46 · for CCode: the gate, save-side schemas, generator wiring, backfill. Aevi: content schemas and content gaps. -->
# SPEC SNG-658: every type of thing has one schema, the schema is checked, and it drives the generator

**Erik:** *"I don't like that we're still finding examples of types of things with schemas that are not complete. We
need to check every single type of thing against the latest schema and fill in gaps, then make the checks standard
and able to drive generative engine updates."*

**Why he's right, from today alone.** Every one of these was a record of a type with no schema, or with a schema
nothing enforced:
- holdings features with `craftIds: []` on 44 of 44;
- a pledge that existed only as prose;
- a party that existed only in the chronicle (Brynjar);
- a named band that existed in five places but not in `bands` (Loki);
- 3 company members with no person record;
- 17 regions with no prices;
- two price profiles pointed at region ids nobody uses.

**We keep finding them one at a time, by playing.** This spec finds them all at once, and then keeps them found.

---

## §1 — THE CENSUS (measured today; tools in `po/tools/schema_census*.mjs`)

**What exists:**
- 12 schemas in `schemas/`, and `engine/genschema.js` (the validator and repairer).
- The **generator** already validates against 4 of them (npc, location, arc, creature), via `state.js` → `CONTENT.genSchemas`.
- `content_ci` validates crafts and locations.

**Content, as loaded** (⚠️ this is the **runtime** layer, after loaders enrich records. Several failures below are
fields the loader adds and the schema doesn't declare, which is still a gap: the schema should describe what the
game actually holds):

| type | records | schema | invalid | top reasons |
|---|---|---|---|---|
| npcs | 174 | npc | **57** | `schemaVersion` missing (57), `fears` missing (53) |
| locations | 143 | location | 0 | ✅ |
| crafts | 441 | ability | **441** | `rankProgression` and `packSystem` undeclared (loader-added), `combinationAxis` null |
| items | 45 | item | **8** | `effects` object vs array (5), `kind: "relic"` not in enum (3) |
| bestiary | 3 | creature | **3** | the file is an array of arrays; missing `id` / `schemaVersion` |
| powers | 29 | **none** | — | |
| companions | 9 | **none** | — | |
| encounters | 23 | **none** | — | |
| quests | 25 | **none** | — | |
| legends roster | 70 | **none** | — | |
| hold feature kinds | 45 | **none** | — | |
| region price profiles | 40 | **none** | — | |

**Saves (16 characters):**

| type | records | schema | invalid | top reasons |
|---|---|---|---|---|
| character | 16 | character | **16 of 16** | `inventory` is objects, not strings (all 16); `origin` enum stale (`marcher`, `rootkin`) |
| — undeclared top-level keys | | | **109 keys** | `clock`, `npcRegistry`, `company`, `holdings`, `pledges`, `bands`, `codex`, `worldState`… **the schema describes almost nothing a save holds** |
| registry person | 133 | npc (wrong fit) | **133 of 133** | `schemaVersion`, `spectrum` required: authored-NPC fields a met person never has |
| company member → person | — | — | **3 with no person record** | Cellaceron: `maren-warden`; Loki: `sable`, `ravel` |
| holding, holding feature, improvement, band, legion, pledge, caravan, job, death state, codex topic | — | **none** | — | |

## §2 — THE RULE

**Every type of thing the game stores, authored or saved, has exactly one schema in `schemas/`,** and that schema is:

1. **The contract.** Closed (`additionalProperties: false`, with `^_` notes allowed). Every field the game reads or
   writes is declared, with a one-line `description` of what it's *for*. A new field without a declaration fails.
2. **The gate.** A standard check validates **every record of every type**, content and saves alike.
3. **The generator's spec.** Any code that *creates* a record of that type (the GM's ops, the generative pipeline,
   the minting paths, reconcile steps) validates against the schema **before writing**, and repairs or refuses on
   failure. This is what `genSchemas` already does for 4 types, extended to all.
4. **The migration driver.** When a schema gains a required field, the gate lists every record missing it. The
   **backfill job** fills each one:
   - **derived** where the engine can compute it (a level, a tier, a region);
   - **generated** where it needs authorship (an NPC's `fears`, a power's `comes`), through the generative pipeline,
     stamped `_filledFromGenerate: {by, day, schemaVersion}` so it's reviewable;
   - **flagged to Aevi** where it needs a ruling.

   Never a silent default.

**One schema per type, not per file.** A registry person and an authored NPC are two types. Split `npc.schema` into
**`person`** (what any met person has: id, name, relationship, status, history…) and **`npc`** (person + the authored
extras: spectrum, fears, schemaVersion…). A save's registry validates as `person`.

## §3 — THE STANDARD CHECK: `schema_census` in the suite

- **One gate, run by the pre-push ratchet:**
  - for each type, how many records, which schema, how many invalid, and the top reasons;
  - plus **types with no schema** and **stored keys no schema declares**.
- **A ratchet, not a cliff** (§B3's rule). Each count **may only go down**: types without a schema, invalid records per
  type, undeclared save keys. Today's numbers are the baseline, so nothing reds today, and everything we fix stays
  fixed.
- **The hard half:** a type that reaches 0 invalid is **locked at 0**, and a new type added without a schema fails
  outright.
- **Both layers:** authored files, **and** the runtime records after loading, since the game plays the second.
  Loader-added fields get declared.

## §4 — WHO DOES WHAT

**Aevi (content, and the content half of every schema):**
1. ✅ **Today:** DRAFT schemas derived from the corpus for the 7 content types that had none: `power`,
   `hold_feature`, `region_prices`, `companion`, `encounter`, `quest`, `legend`.
   - Rule: required = present on every record; each field's `description` says how often it's present.
   - They're marked `_draft`; nothing reads them yet.
   - Tool: `po/tools/derive_schema.mjs`.
2. **Next:** review and ratify those seven (tighten enums, write each field's *for*, remove `_draft`), in the order
   the census gate reads them.
3. **Fill the content gaps the census names:**
   - `fears` on 53 NPCs;
   - `schemaVersion`;
   - the item `effects` shape and the `relic` kind (enum or data, whichever is right);
   - the bestiary file shape;
   - the `origin` enum (add `marcher`, `rootkin`, …, or migrate).
4. **Author the `person` / `npc` split's field list** (which fields are authored-only).

**CCode (engine, saves, the gate, the generator):**
1. **`schema_census` as a standard gate,** with the ratchet (§3). My two tools are a starting point, not the gate.
2. **Save-side schemas:** character (all 109 keys declared, `inventory` corrected), person, company member,
   holding, holding feature, improvement, band, legion, pledge, caravan, job, death state, codex topic.
3. **The generator wiring:** every writer of a type validates against its schema before writing (§2.3).
   - Start with the three that failed today: **company joins** (a join must point at a person record; mint one if
     absent, which fixes the 3), **bands** (CCODE-510), and **holding features** (CCODE-495).
4. **The backfill job** (§2.4), driven by the census, with provenance stamps.

**Order:**
1. the gate at baseline;
2. the person / npc split, and company members' person records;
3. save-side schemas;
4. generator wiring;
5. backfill;
6. content ratification alongside.

**What passes on paper and fails in use:** a schema that validates and a writer that never calls it. So the gate
also asserts **every writer of a type imports its validator.** That's the lesson of `craftIds`.

— Aevi, PO