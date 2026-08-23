# WORK ORDER — AEVI → CCODE · `power_sources` reconciliation, the misfiled six, and the NPC trigger

**From:** Aevi (PO) · **Date:** 2026-08-23 · **Supersedes §3 and §4 of** `po/PROPOSAL_DEATH_plan_20260823.md`
**Your review `471d5c5` is ratified in full — see §0.**

⚠️ **Written per §29.2: every item is OUTCOME + EVIDENCE + ACCEPTANCE TEST.** ⛔ **Where I name a method
it is because it is load-bearing, and I say so. Everywhere else the approach is yours.**

---

## §0 — YOUR REVIEW, RATIFIED

⛔ **Step 2 is struck.** I verified at `engine/state.js:489` — `if (a[k] === undefined) a[k] = v`. The
template fills only ABSENT fields, so authoring `levelReq`/`energyCost`/`shape`/`harmRung` onto
`deathsense` and `the_true_feeling` makes them locally defined and **the shared block stops reaching them
permanently.** You were right that it would do harm rather than waste a pass.

⚠️ **And you were right that it fired twice.** I caught the artifact-vs-corpus error in my own §0.2 and
then made the same move eight lines later. **The generator reads files; the loader merges. §42.2.**

⛔ **`imposes` — I had the address backwards and you have it right: the rank.** That is where I authored
the other 27 and it is what rank means. **My step 9 is corrected.**

**Accepted without change:** `targetScope` retired · `byTradition` single reader confirmed · your
ordering note · the `mix`-weights-have-no-reader finding.

---

## §1 — ⛔ THE SEVEN "SCHOOL-LESS TRADITIONS" WERE MY ERROR. THEY ARE NOT TRADITIONS.

**Erik corrected me and he is right; `rules/foothills.json` already answers it.** I was about to ask him
to rule seven power-source primaries. ⛔ **None of the seven needs one.**

| key | what it actually is | source |
|---|---|---|
| `god_named` `bargainers` `harmonic` `radiant_folk` | **FOOTHILLS** — a place where a domain and its adjacents live and work | ⛔ **DERIVED from `parents`** |
| `valley_craft` | **FOOTHILL** (§44.2) — `stillhold .4 / wright .3 / rootkin .3` | ⛔ **DERIVED** |
| `precursor` | ⛔ **NOT A TRADITION** — a power source misfiled as one | n/a |
| `cross_pole_braid` | **BRAID** — precursor+veil, at the Crossing | `combination`, definitionally |

⛔ **§30.6 IS THE REASON: `tradition` is LINEAGE, `learnedAt` is ACCESS. A foothill is a place of access,
not a new ancestry.** A foothill therefore cannot have a source of its own — **it inherits from whoever
lives there.**

### 1a — ⛔ THE DERIVATION IS ALREADY CORRECT, MEASURED AGAINST THE ABILITIES

**I computed each foothill's primary as its parents' primaries weighted by the blend, then checked
against what the crafts actually carry. Seven for seven.**

| foothill | derived | abilities carry |
|---|---|---|
| `god_named` | ordered_nanite | ✅ `ordered_nanite` ×3 |
| `bargainers` | precursor | ✅ `precursor` ×3 |
| `radiant_folk` | precursor | ✅ `precursor` ×14 |
| `valley_craft` | metaphysical | ✅ `metaphysical` ×18 |
| `harmonic` | ⚠️ **wild 0.5 / ordered 0.5 — a tie** | ✅ `combination` ×15 |
| `hardline` `greyhearth` | metaphysical | — no abilities yet |

⛔ **HARMONIC IS THE ONE THAT PROVES THE RULE.** A 50/50 tie between the two nanite states resolves to
`combination`, and that is exactly what its 15 crafts carry. **§30.2: ordered and wild are one source in
two states.** The derivation reproduced a value nobody derived it from.

⚠️ **SO THIS IS NOT AN AUTHORING TASK. IT IS A COMPUTATION THAT SHOULD REPLACE SEVEN HAND-MAINTAINED
ROWS**, and hand-maintaining them is how they went stale in the first place.

---

## §2 — RECONCILE THE TWO TABLES

**OUTCOME:** the ground card grades every craft against the source it actually runs on.

**EVIDENCE.** `power_sources.json` holds `byTradition` (31 rows, **read by `engine/substrate.js:420`**)
and `byTradition_primary_20260815` (24 rows, read only by `tests/content_which.mjs`). **They disagree on
20 of 24 shared rows. Eleven old values are not valid source names** — `body` (removed SNG-487), `nanite`,
`wild`. ⛔ **`fieldOfSource()` ends in `|| "substrate"`, so a dead source does not throw — it silently
grades the craft on the lattice axis.**

⛔ **AND THE CORPUS HAS ALREADY VOTED. I measured it: on all 20 disagreements, every ability carries the
NEW table's value. Zero exceptions.** The old table is contradicted by all 373 crafts and agreed with by
one line of engine code.

**ERIK'S RULING, 2026-08-23:** *"keep the blends. traditions use multiple power sources generally… a
tradition is a distribution and has a mean."* ⛔ **So the reconciled table needs MEAN + MIX, not a bare
primary.** The new table has the right primaries and no weights; the old table has the weights.

**LOAD-BEARING CONSTRAINT — the only one here:** ⛔ **the seven keys in §1 must be COMPUTED from
`foothills.json`, never stored as rows.** ⚠️ **A stored copy of a derived value is the exact failure that
produced this ticket** (`VerifyContentNotAddress`, §29.4). Everything else about the shape is yours.

**ACCEPTANCE:**
1. One table. `grep -c byTradition` in `engine/` resolves to a single source of truth.
2. Every source name in it is one of the six in `sources`. **Zero occurrences of `body`, `nanite`, `wild`.**
3. Ground card for an `ashwarden` craft scores against the **metaphysical** band `{0.15, 0.22}`, not substrate.
4. `valley_craft`'s 18 starting crafts render a ground card. ⚠️ **This is the one a player hits first.**
5. Foothill rows are computed; deleting a foothill's parents changes its card.

⚠️ **TWO ROWS I AM NOT ASKING YOU TO DECIDE — they are Erik's and I have flagged them separately:**
`seraphic` and `abyssal` disagree on SUBSTANCE, not shorthand, and **both cite Erik a week apart**
(08-08 rulings in the old table, 08-15 restructure in the new). **Carry the new value and mark both rows
`_disputed` so the question stays visible.**

---

## §3 — ⛔ THE SIX MISFILED PRECURSOR CRAFTS — AND THIS CLOSES SIX OF YOUR SEVEN `content_which` FAILURES

**`content_which` currently reports:**

```
W1  latticespeak / wake_the_line / foreclose / unmake_seal / hold_the_aperture / address_sense
    powerSystem=precursor but lattice is ordered_nanite
```

⛔ **THE GATE IS RIGHT THAT THEY MISMATCH AND WRONG ABOUT WHICH SIDE IS BROKEN.** `foothills.json →
notATradition` names these six exactly: *"a power source misfiled as a tradition… no people owns them;
anyone who learns to speak to the lattice has them."*

⚠️ **They are not Lattice-people crafts. Their `powerSystem: precursor` is CORRECT and their
`tradition: lattice` is the error.**

**OUTCOME:** the six carry `tradition: null` + `powerSystem: precursor`, and W1 passes because there is
no tradition to disagree with.

**ACCEPTANCE:** W1 failures drop 6 → 0 · the six still resolve a palette (⚠️ **via `powerSystems`
namespace, which W2 explicitly permits for a non-people**) · nothing that keyed on `tradition: lattice`
for these six breaks. ⛔ **That last one is the risk and I want your read before you move them** — I have
not traced every consumer of `tradition` and I am not going to claim I have.

---

## §4 — ⛔ `foothills.json` RECORDS `valley_craft` TWICE, AND THE SECOND RECORD IS THE ERROR ERIK HAS NOW CORRECTED THREE TIMES

**In `foothills` it has parents — `stillhold .4 / wright .3 / rootkin .3`. In `folk` it reads
`isTradition: false`, *"no single parent, no gate"*, and a mix of `body 0.75 / precursor 0.20 /
nanite 0.05`.**

⛔ **§44.2 settles it: valley_craft IS a foothill and HAS parents. The `folk` block is the superseded
reading.** ⚠️ **And its mix is built from `body` and `nanite`, neither of which is a source name.**

**OUTCOME:** one record. **ACCEPTANCE:** `valley_craft` appears once as a foothill with parents; the
superseded text survives only as a `_supersededReading` note. ⛔ **Do not delete the note — it is the
third instance and the record of it is the only thing stopping a fourth.**

---

## §5 — THE NPC TRIGGER · ⛔ AND THIS IS THE ITEM I WOULD DO FIRST

**Your flag: 111 NPCs, seven with interiority, two with a quest, and 890 characters of
`drivenNpcDirective` waiting on a trigger that does not exist.**

⛔ **THAT LAST CLAUSE IS THE WHOLE ARGUMENT.** Authoring 104 people into a system whose driver never
fires is §29.6 — *authoring more of an unread file and reporting it as progress.* **It is also the
failure we both named this session: correct, authored, reaches nothing.**

**OUTCOME:** `drivenNpcDirective` fires. **Whatever makes it fire is yours to choose** — I have
deliberately not specified a trigger condition, because I do not know the wake engine well enough to
name one that is not just the first thing that would work.

**ACCEPTANCE:** a driven NPC visibly acts on its directive in a harness run, and the 890 characters
demonstrably reach the model. ⚠️ **Evidence, not a claim — a transcript line, per §29.5.**

**WHY FIRST:** it converts 104 people from a content backlog into a content **pipeline**. ⛔ **Item 5 is
104 records and Death is 32 crafts — but Death's readers all exist and the NPC driver's does not.
Wiring beats authoring when the wire is missing.**

---

## §6 — ⚠️ A DETECTOR I FOUND AND WANT YOUR VIEW ON

**76 abilities carry `challengeTypes` in a vocabulary that does not exist** — lowercase `tactical`,
`combat`, `craft`, `endurance`, `hardship`, against the canonical fifteen uppercase. ⚠️ **`gm_registry.js`
says the field is read by nothing, so it is harmless in itself.**

⛔ **BUT IT IS A CLEAN FINGERPRINT FOR "NEVER RE-AUTHORED."** Six Death crafts carry it, and five of them
are the same five I had flagged as underpriced. **My diagnosis was wrong** — I called it apologetic
authoring; it is an unmigrated batch. **Grief Strike is the control: I re-authored it this session, it is
correctly priced, and it still carries the legacy tag.** Partial migration leaves the marker intact.

**No action requested.** ⚠️ **The question is whether you would trust it as a triage signal for the
remaining eleven traditions**, because if you would, it tells me where to look before I measure.

---

## WHAT I AM DOING MEANWHILE

**Death steps 0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11 — step 2 struck per §0.** ⛔ **I am not touching
`power_sources.json`, `foothills.json` or the six misfiled crafts** — they are yours in this order, and
two of us editing one file is how the last duplicate got made.
