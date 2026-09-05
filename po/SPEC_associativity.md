# SPEC — associativity: every subject findable across every layer

**Author:** Aevi (PO) · **2026-09-02** · **Status:** `part_built` — the instrument and the markers v1.9.346 (`§63`–`§64`); the rest open (was `spec_ready` — marked 2026-09-04) — ⬜ **CCode ROUND 2**
> Erik: *"spec something for CCode to wikilink everything so we can easily find subjects that are the
> same but have different scope — data fields, engine readers/writers, design intent, UI locations, how
> it works, pipeline documentation. Everything needs associativity so we can root out the old when we
> bring in the new."*

---

## §1 — ⛔ THE FAILURE THIS ANSWERS, MEASURED

**One subject — foothills — is described in SEVEN places that cannot see each other:**

| layer | where | said |
|---|---|---|
| **ruling** | `foothills.json` → `_twoAxes` | ⛔ **the correct answer, indexed nowhere** |
| **definition** | `foothills.json` → `_theDefinition_20260823` | a foothill is a PLACE |
| **data** | `traditions.json` → `folkTraditions[].foothillOf` | ⚠️ **stale parents that contradict `foothills.json`** |
| **data** | 31 crafts' `tradition` field | ⛔ **carries the error the ruling names** |
| **engine** | `traditions.js` `isFolkTradition`, `app.js:7157` | routes them out of the ring |
| **doc** | `HOW_IT_WORKS` body | was recommending a WITHDRAWN proposal |
| **doc** | `SKILLS.md` | files them under "no domain" — ⛔ **wrong under R33** |

⚠️ **Aevi made THREE wrong statements about this subject in one day, each from a different layer, each
consistent with the layer she happened to open.** ⛔ **Every layer was internally coherent. None pointed
at the others.**

---

## §2 — THE PROPOSAL: a SUBJECT is a first-class thing

**Not a wiki of pages. A join key.**

> ⚑ **Every artefact that discusses a subject declares that subject by a stable id. The instrument
> gathers them and reports every layer that mentions it — and, critically, every layer that DOESN'T.**

### 2a · The declaration

A `subjects:` line in a markdown front-matter block; a `_subjects` key in a JSON content file; a
`// @subject` comment above an engine function.

```
subjects: [foothills, traditions, folk-access]
```

### 2b · The layers to join across

| layer | what it holds | how it declares |
|---|---|---|
| **RULING** | what was decided | `po/RULING_*.md` + ⛔ **`_`-keys in content files** (R33 proves these exist) |
| **TRUTH** | `HOW_IT_WORKS` body | section-level |
| **DATA FIELD** | which fields carry it | `field_atlas` already derives this |
| **ENGINE** | readers and writers | `// @subject` |
| **UI** | where a player meets it | `// @subject` in `app.js` |
| **DESIGN INTENT** | why it is shaped this way | `po/DESIGN_*.md` |
| **PIPELINE** | how it gets built and gated | `PIPELINE.md` |
| **CONTENT** | the authored records | pack files |

### 2c · ⛔ What the report must say — the absences, not the presences

⚠️ **A list of what mentions a subject is a search result. The VALUE is the gaps:**

| flag | meaning |
|---|---|
| ⛔ **RULED BUT NOT ENACTED** | a ruling exists, the TRUTH layer never carried it. **R33 was this for seven days** |
| ⛔ **ENACTED BUT NOT BUILT** | truth says it, no engine reader. `folkAccessible`, `backlashRung`, `local_layouts`, `npcsheet` were all this |
| ⛔ **BUILT BUT NOT RULED** | engine does something no ruling authorises |
| ⛔ **TWO LIVE RULINGS** | ⚠️ **the contradiction class** — `traditionKind` withdrawn in the log, recommended in the body |
| ⛔ **DATA CONTRADICTS RULING** | 31 crafts carry a `tradition` the ruling forbids |
| ⛔ **ORPHAN** | an artefact whose subject nothing else touches — either the only source, or dead |

---

## §3 — ⚠️ THE HARD PART, AND WHY THIS IS A SPEC RATHER THAN A SCRIPT

⛔ **Declared subjects rot exactly like stored counts.** `foothills.json` already forbade stored counts —
*"a stored copy of a derived value is the failure that produced this ticket. DO NOT RE-ADD THEM"* — **and
then every row stored one.** ⚠️ **A hand-maintained `subjects:` line will drift the same way.**

⬜ **So the design question for CCode: how much can be DERIVED rather than declared?**

- **Derivable:** which files mention a term · which fields exist (`field_atlas`) · which engine functions
  name it · whether a ruling id appears in the truth layer (`§56` already does this)
- **Not derivable:** that `foothillOf` and `foothills.json` are the SAME subject under different names ·
  that `learnedAt` and `folkAccessible` are related · **synonymy generally**

⚠️ **Aevi's instinct: a small hand-kept SYNONYM MAP plus fully derived everything else.** The map is the
only hand-maintained part and it is short. ⬜ **CCode may see a better split.**

---

## §4 — ⬜ START NARROW

⛔ **Do not build the whole graph.** ⚠️ **Start with the join that would have prevented today:**

1. **RULING ↔ TRUTH** — ✅ `§56` already gates this. **Extend it to rulings authored in content-file
   `_`-keys**, which is where R33 hid.
2. **TRUTH ↔ DATA** — where truth names a field, assert the field exists and no record contradicts it.
   ⛔ *Would have caught 31 crafts carrying a forbidden `tradition`.*
3. **DATA ↔ ENGINE** — ✅ the dark-field list already does this.
4. ⬜ Then the rest.

---

## §5 — ROUND 2 QUESTIONS

1. ⛔ **Is a declared `subjects:` line acceptable, or does it rot?** ⚠️ Aevi believes it rots and wants
   maximum derivation. **CCode has better evidence — the atlas and the dark-field list are his.**
2. **Where does a content-file `_`-key ruling get detected?** R33 sat in `_twoAxes`. ⬜ Is there a
   distinguishable shape — a key stating a RULE rather than a fact?
3. **Can `// @subject` be avoided entirely** by deriving engine association from identifier names?
4. ⚠️ **What is the smallest version that would have caught today's failure?** ⛔ **Build only that first.**

---

# ROUND 2 — CCode · 2026-09-04 · v1.9.345 · ✅ BUILT (§4's narrow start, and gated)

**Q4 first, because it is the answer to the other three.** The smallest version that would have caught the foothill
day is a **report, not a graph**: given one subject, every layer that mentions it and — the part that matters — every
layer that does not. ✅ **`scripts/subject.mjs <subject>`**, gated `§63`.

```
node scripts/subject.mjs foothills
  ✅ TRUTH · LOG · RULING (3) · SPEC (19) · CONTENT (54) · ENGINE (2) · UI · TESTS (4) · DOCS
  ⚑ rulings living in content-file _keys: foothills.json → _twoAxes  (the shape that hid R33 for seven days)
  R33  ✅ enacted
  ✅ no absences flagged
```

Run against the two subjects that cost the most, it said what the day should have said:

| subject | what it reported |
|---|---|
| `npc-sheets` | ⛔ **RULED BUT NOT ENACTED — R30, R31, R32** indexed ⬜, the truth layer did not carry them. ✅ Fixed the same hour: cited in body §7h, index ✅ |
| `meaning-density` | ⛔ **ORPHAN / spec-only** — six specs, no engine reader, no body section. Which is true, and is DECISIONS_OWED Q7 |

**Q1 · does a declared `subjects:` line rot?** ✅ **Yes, and I did not build one.** Nine layers are DERIVED on every
run (word-boundary hits, comments stripped from engine/UI/tests so a comment naming a thing does not count as a reader).
⚠️ **The one hand-kept part is a SYNONYMS map** — the thing a scan cannot derive (that `foothillOf` and `foothills.json`
are one subject) — and `§63` asserts every synonym still hits at least one layer, so a dead synonym is RED rather than
quietly wrong. That is your "small synonym map plus fully derived everything else", with the map made unable to rot.

**Q2 · where a content-file `_`-key ruling is detected.** ✅ **Derived by shape**, as you guessed: an underscore key
whose value names one of the subject's terms AND carries a ruling word (`RULED`, `Erik`, `must`, `never`, ⛔). It finds
`foothills.json → _twoAxes` and the tradition-profile `_parentsMirrored` notes. ⚠️ It will also find some prose that is
not a ruling; the report names them and a person judges — that is the same contract as §56's multi-ruling list.

**Q3 · can `// @subject` be avoided?** ✅ **Entirely.** Engine association is derived from identifiers — the synonyms
ARE identifiers (`releaseHolding`, `enrichDecl`, `bandFactor`). No marker in code, nothing to forget.

**And the join you asked for in §4.1 — RULING ↔ TRUTH extended to content-file rulings — is the other half of
`SPEC_one_source_of_truth` §4, built the same hour:** a `po/RULING_*.md` may declare `subject:` + `bodyAnchor:`, `§62`
asserts a declared anchor is in the body **exactly once** and ratchets the undeclared count (25 today, may only fall).
R33 declares first. ⬜ **§4.2 (TRUTH ↔ DATA: where the truth names a field, assert no record contradicts it) is not
built** — it needs the truth layer to name fields in a form a scan can read, and that is the `subject:` marker on body
sections, which nobody has written yet.
