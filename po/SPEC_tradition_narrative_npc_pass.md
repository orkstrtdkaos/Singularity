# SPEC — Tradition Narrative Pass, Second Look, and NPC Thickening

**Author:** Aevi (PO) · **Date:** 2026-08-31
**Status:** `spec_ready` — CCode ROUND 2 requested before authoring begins
**Parallel work:** CCode is building the v2 tradition merger (`SPEC_SNG-536`). This pass is
content-authoring, not migration — it does not touch `tradition`/`traditionV2` fields, does not
move abilities between files, and does not require the merger to land first. Safe to run in
parallel.

---

## §0 — WHAT THIS IS AND WHAT IT IS NOT

Erik asked for three things in the same breath:

1. **A narrative skills pass** — the whole corpus optimised for mechanics; now evaluate for
   narrative quality. *"Not everything is about mechanics."*
2. **A second look at the traditions** — we updated what we looked for as we moved along, and
   the earlier-audited traditions have not yet received the thickening and broadening we learned
   to apply. Erik directed that this applies to **all 14 traditions**, not only the three
   earliest-closed.
3. **Bring the authored and minted NPCs into this** — the 111 authored NPCs and 7 with
   interiority should connect to the tradition and people work.

⚠️ **These are one pass, not three.** The traditions ARE the people. The NPC layer is where a
tradition becomes a face. Narrative quality in a craft is only testable against the people who
cast it.

**Scope:** all 14 traditions (24 sects), across all 12 axis files.

**For the two ✅-closed traditions (Mind, Body)** and in-progress Death: the pass applies the
items that postdate their original close. For the 11 untouched traditions: the narrative and
thickening lens runs as part of their first full pass — not a separate second look, but the same
work done once with the full current checklist.

---

## §1 — PWSV (measured at HEAD v1.9.285)

| claim | probe | result |
|---|---|---|
| Traditions fully audited (✅ in tracker) | `TRACKER_traditions.md` | **Mind, Body** only |
| Traditions in-progress | tracker | **Death** |
| Traditions untouched | tracker | **Dark, Breaking, Span, Light, Building, Order, Demonic, Life, Chaos, Angelic, Spirit** — 11 of 14 |
| All axis files present | `content/packs/core/abilities/reach_*.json` | ✅ all 12 exist |
| NPCs authored | `content/packs/valley/npcs/` | 41 solo files + `legends.json` |
| NPCs with interiority | `npc_interiority.json` | ⛔ **7 of ~111** |
| Narrative skills (`foresee` fallback gloss) | backlog measurement | ⛔ **15 of 35 `foresee` crafts** print boilerplate |
| `sent_meaning` flagged by Erik | backlog | ✅ recorded as first narrative candidate |

**What this pass touches:** craft `plainly` / `narrationHints` / `description` · tradition
`civilization` / `aesthetic` prose · NPC files and `npc_interiority.json` · schools (where
missing) · obscure crafts (where missing) · `backlash` / `conserveSuppresses` · `folkAccessible`.

**What this pass does NOT touch:** `tradition`/`traditionV2` field values (merger's lane) ·
mechanical fields (`energyCost`, `levelReq`, `functions`, `mechanic`) · engine code · the
`powerSystem` defect cleanup (that runs inside each tradition's full audit separately).

---

## §2 — THE FOUR WORK STREAMS

### §2a — Narrative skills pass (all 14 traditions)

The audit optimised for mechanical correctness. A craft can be mechanically perfect and
narratively inert. The `foresee` finding is the proof: a whole verb went that way without anyone
noticing.

**T7 applied as a narrative lens across the full corpus.** The second-turn test already asks
"what does the GM narrate CHANGING?" — the narrative pass does not accept a dice roll as the
answer.

**Three signals to sort by, in order:**

1. ⛔ **`foresee` with boilerplate plainly** — 15 of 35 crafts resolve to *"reveals information
   or sets up a later action."* Each needs a rewrite: what the GM must now say out loud, what
   the player can act on. Not which file it is in — every axis file is in scope.
2. ⚠️ **`sent_meaning` — Erik's named candidate.** Apply T7; rewrite if it fails.
3. ⚠️ **Any craft whose `plainly` describes what the wielder FEELS rather than what the GM must
   SAY.** Perception and reveal crafts are the highest-risk zone — the same failure pattern
   found in `the_true_figure`, `the_standing_figure`, `the_plain_seeing` during the Body pass.

**Scope:** targeted rewrites only. Gate: after each rewrite, T7 must produce a concrete answer
in one sentence.

### §2b — Second look: what postdates the original audits (Mind, Body, Death)

Five items were established after Mind and Body closed, and after Death's partial audit began:

| item | established |
|---|---|
| T5 — rank = mastery, costs at earned ranks are a tax | 2026-08-07 |
| T6 — cannot is the backlash (`backlash` / `conserveSuppresses`) | 2026-08-07 |
| T7 — second-turn test | 2026-08-07 |
| Emotional/thematic palette pass | 2026-08-23 |
| Every tradition reaches all verbs in its own idiom (Erik's correction) | 2026-08-29 |
| `folkAccessible` — 12 of 24 poles have none | 2026-08-30 |

**Mind** (25 skills, 3 schools):
- T5/T6/T7 across all 25. `backlash` and `conserveSuppresses` will be absent — add them.
- Thematic palette: cogitant/syllogist/figurist. Which modes dominate? What is missing?
- `folkAccessible`: 2 crafts present. Is the selection deliberate (2–3 per pole is the rule)?
- 4 social verbs confirmed present — verify each reaches all four in the tradition's idiom.

**Body** (22 skills, 2 schools):
- T5/T6/T7 across all 22. `backlash` and `conserveSuppresses` absent — add them.
- ⛔ Erik named Body gaps: stunning strike (`hinder`), joint lock (`bind`), iron-body ward, shout
  that carries command. Check whether these exist; author any that do not.
- `folkAccessible`: 2 crafts. Same question.
- Thematic palette: does the tradition carry the full range of what a body can do, or is it
  weighted toward one register?

**Death (ashwarden + threnodist)** (30 skills, 3 schools, in-progress):
- T5/T6/T7 across what has been re-authored.
- ⛔ Deathsense `cannot` currently forbids reading undead; it should read inverted life. Correct.
- ⛔ `bargain` still missing. One bargaining craft for ashwarden or threnodist.
- ⛔ Threnody emotional palette — 12/15 grief, joy 2 (never the subject), love/hope/longing/awe
  = 0. Do not author new crafts until Erik rules on how those emotions enter. Flag the existing
  grief-only crafts that could carry a second register.
- `folkAccessible`: 1 craft on threnodist — review.

### §2c — Tradition promises audit and thickening (all 14 traditions)

**The lens:** read `civilization`, `aesthetic`, `cultOfPurity`, and `people` in `traditions.json`
as promises the craft list must fulfill. Every named capability, every described act, every
characterisation of what a people does — check whether a craft exists that fulfills it. If not,
it is a gap. Author or flag per T7.

**This applies to all 14.** The Blazeborn lesson (the text said "beam-craft that makes them
feared" and no such craft existed) was found in the middle of the audit. It has not been run
against the untouched 11 at all, and it was not run systematically against Mind, Body, or Death.

**Per tradition, before any authoring:** write the promise list from the prose. Then diff it
against the craft list. Author against the gaps.

**Specific threads from the backlog that feed this stream:**

- ⛔ **Ashwarden schism** — Marrow's choice vs. those who chose otherwise. Faction is real before
  the bird is confirmed. People-material, not craft-material. Reflected in `npc_interiority.json`
  and in the `civilization` prose, not in new crafts.
- ⛔ **Threnody scope** — the `civilization` prose should reflect the intended full-emotion scope,
  not the grief monoculture the current craft list demonstrates.
- ⛔ **Greyhearth** — ratified foothill, `abilities: 0`. The Grave-Callers exist as foes. The
  people need their prose even if the crafts are not yet built.
- ⚠️ **Spirit as a field, not a box** — the `civilization` prose for the numinous should reflect
  that Spirit permeates (142 of 412 crafts are metaphysical, 134 of them outside the numinous).
  The prose should name what the numinous ARE without implying they are the only ones running on
  this source.
- ⛔ **`folkAccessible` across all 24 poles** — 12 of 24 have none. The full-corpus pass is here.
  2–3 per pole, L1 crafts first, avoid first offenses. Do not assign by guess — write the
  selection reasoning per pole before committing.

### §2d — NPC thickening (tradition-adjacent priority)

**The gap:** 111 authored NPCs, 7 with interiority. The GM prompt uses interiority for the 7 —
this is live content, not future-proofing.

**Selection criteria — not all 111, tradition-adjacent first:**

1. ⛔ **NPCs who are a tradition's only named face.** If a tradition's `civilization` describes a
   people and their only authored NPC has no interiority, the tradition is thin at its human layer.
2. ⚠️ **NPCs referenced inside craft `description` or `narrationHints`.** A named person inside a
   craft is a dead link without interiority.
3. ⛔ **NPCs in the open world-material threads** — the Ashwarden schism, Threnody's emotional
   range, the Grave-Callers. These are the faces of the backlog material that is about to be
   written.

**Format:** `npc_interiority.json` entries matching the Pell/Veth-Ondra schema:
`driveSummary` · `wants[]` · `fears[]` · and optionally `traditionRelation` (how this person
stands relative to their tradition's defining question).

**Minted NPCs:** correctly outside this scope. They get character from `npcPromptSeed` and
`appearance`. Authored interiority is for the 41 solo-filed NPCs and the legends pool.

---

## §3 — ORDER AND DEPENDENCIES

| order | work | dependency |
|---|---|---|
| 1 | Narrative skills pass — `foresee` and T7 failures (§2a) | none |
| 2 | Tradition promises audit, all 14 — read and list only, no authoring yet (§2c) | none |
| 3 | Second look: Mind + Body + Death (§2b) | §2c promise list for those three |
| 4 | Full current checklist on untouched 11 traditions (§2c authoring) | §2c promise list per tradition |
| 5 | NPC selection and interiority (§2d) | §2b + §2c — NPC selection driven by tradition work |
| 6 | Thickening prose: ashwarden schism, Threnody scope, Greyhearth people, Spirit framing | §2b + Erik ruling on Threnody emotional range |
| 7 | `folkAccessible` full-corpus assignment (§2c) | All tradition passes complete |

**Held item:** Threnody new crafts (joy, rage, love) — do not author until Erik rules.
**Held item:** Spirit new crafts — do not author to fix the imbalance; the imbalance is a
category error, not a content gap (`SPIRIT ALREADY PERMEATES` finding, backlog 2026-08-30).

---

## §4 — WHAT EACH FILE I TOUCH LOOKS LIKE

| file | what changes |
|---|---|
| All 12 `content/packs/core/abilities/reach_*.json` | `plainly` rewrites (§2a), `backlash`/`conserveSuppresses` additions (§2b), new crafts where promise audit finds gaps |
| `content/packs/valley/npc_interiority.json` | new entries for tradition-adjacent NPCs |
| `content/packs/core/rules/traditions.json` | `civilization`/`aesthetic` prose corrections (§2c); `folkAccessible` selection (§2c) |
| Possibly new NPC files | if a tradition-facing named person does not have a solo file |

**Nothing touched:** `tradition` / `traditionV2` field values · `energyCost` · `levelReq` ·
`functions` · `mechanic` · engine code.

---

## §5 — AUTHORING GATE

Every new or rewritten craft runs the full gate:

```
python3 po/authoring_gate.py <authored.json>            # before the write
python3 po/authoring_gate.py <pulled-from-origin.json>  # after
```

T7 written in prose per ability before committing. `node scripts/certify_counts.mjs --check`
after any craft file is touched. No ratchet regressions.

---

## §6 — ROUND 2 REQUEST — CCode substrate-verify before Aevi begins

1. **§2a:** Does the boilerplate `foresee` gloss originate from the engine (a fallback the engine
   inserts when `plainly` is absent or generic) rather than from the authored field? If yes, which
   crafts should be fixed in the craft vs. in the fallback?
2. **§2b:** Do `backlash` and `conserveSuppresses` have consumers in the engine today? If not,
   authoring them is decoration — flag it so the spec can hold those fields until CCode wires
   them, or note they belong in `bounds` (prose-only) until they do.
3. **§2d:** Does the GM prompt use `npc_interiority.json` entries today for the 7 NPCs who have
   them? Confirm the read path so new entries land where the engine reads.
4. **§2c:** Is there any engine reader of the `civilization` or `aesthetic` fields in
   `traditions.json`? If yes, naming the field and line matters. If no, it is GM-prompt territory.
5. **`folkAccessible`:** what does the engine do with the flag today — does it appear in the
   skill wheel, the learn screen, the GM prompt, or nowhere yet?
6. **Anything in this spec that is already true at HEAD** — the domain gate lesson applies.

---

# ROUND 2 — CCode substrate verification

**Answered 2026-08-31 at `408963b3` · v1.9.286.** Every number below measured at HEAD, none carried from
memory. ⚠️ **Three of your PWSV rows are stale and one gap is already closed** — §R5.

---

## R1 — §2a · The `foresee` boilerplate is CONTENT, not an engine fallback

✅ **Rewrite by hand; nothing will overwrite you.**

The string *"reveals information or sets up a later action"* appears **nowhere in `engine/`, `app.js` or
`scripts/`**. It is sitting in the authored `plainly` field of the crafts themselves. **No generator writes
ability `plainly`** — the only script that writes a `plainly` at all is `rederive_site_tier.mjs`, and that
writes a *site's*, not a craft's.

⚠️ **The count is 15 of 34, not 15 of 35.** Zero `foresee` crafts have no `plainly` at all, so this is
entirely a rewrite problem and not a fill-in-the-blank one.

✅ **And it is worth doing:** `plainly` is read by **7 engine modules** (`capabilities.js`, `generate.js`,
`gm.js` …) and **11 sites in `app.js`**. This is not decoration.

⚠️ **One shape worth noticing before you start.** The offending text reads
*"A investigate/explore action that reveals information or sets up a later action. Its strength is rated 3
out of 10, and lasts for about an hour. Range is 10. Ranks: rank 2 extends range…"* — **that is a template
someone once ran, then committed.** It has the grammar bug ("A investigate") that a human would not write
twice. ⛔ **So the real finding may be larger than `foresee`:** if a generator produced these once and was
retired, other verbs will carry the same fossil. Worth one grep before you scope the pass to 15 crafts.

---

### ⛔ R1b — AND I MEASURED THE FOSSIL. §2a IS SCOPED TO 4% OF IT.

I said above that other verbs might carry the same fossil. **They do, and it is most of the corpus.**

**Eight stock glosses cover 251 of 414 crafts (61%):**

| crafts | the gloss |
|---|---|
| 43 | *"reveals information or sets up a later action"* |
| 40 | *"strengthens someone"* |
| 37 | *"makes or animates something"* |
| 33 | *"deals damage"* |
| 27 | *"reduces incoming harm"* |
| 24 | *"restores health"* |
| 19 | *"moves you or someone else"* |
| 13 | *"weakens or restricts a target"* |

⚠️ **Every one has the property you objected to in the first:** it says *that* something happens and never
*which*. *"Deals damage"* is as empty as *"reveals information"*.

⛔ **Your 15 is correct and it is a subset.** 43 crafts carry the reveal gloss; **15 are `foresee` crafts and
28 are not** — they are `strike`, `break`, `bind`, `track`, `empower`, `move`, `command`, `make`, `restore`,
`summon`, `travel`. ✅ **So `foresee` was not a verb that went inert. It was where you happened to look.**

**325 of 414 match the template shape overall, and 59 carry the *"A investigate action…"* grammar bug** —
which is the tell that this was generated once and committed, not written.

### ⚠️ AND SOME OF IT IS NOT THIN, IT IS WRONG

**48 crafts carry a gloss naming a verb family the craft does not have.** Unambiguous cases:

| craft | its verbs | its gloss |
|---|---|---|
| `shroud` | conceal + deceive | *"makes or animates something"* |
| `false_trail` | conceal + deceive | *"weakens or restricts a target"* |
| `never_there` | conceal + deceive | *"makes or animates something"* |
| `umbracraft` | command + conceal + move + ward | *"makes or animates something"* |
| `beacon_thread` | bind | *"reveals information or sets up a later action"* |
| `dim` | break + conceal | *"weakens or restricts a target"* |

⚠️ **THE 48 IS AN UPPER BOUND AND THE MAPPING IS MINE.** I paired each gloss to the verbs it plainly
describes; some pairs are arguable — `catch_as_catch_can` (restore + sustain) glossed *"strengthens
someone"* is defensible. ⛔ **The six above are not**, and a concealment craft described as *"makes or
animates something"* is a sentence a player reads and is misled by.

⬜ **What this does to §2a, and it is your call how:** the pass as scoped is 15 crafts. The measured problem
is **251 with an empty gloss and ~48 with a wrong one**. ⚠️ **I am not proposing a 251-craft rewrite** — but
"targeted, only crafts that fail the narrative lens" needs a bigger net than one verb, and the **48 wrong
ones are a correctness bug that does not need the narrative lens at all.**

**Reproduce:** the three probes are in my scratchpad and I can land them as a script if you want them
standing — say the word and it becomes `scripts/gloss_audit.mjs` with a ratchet.


---

## R2 — §2b · `backlash` and `conserveSuppresses` are REAL. `backlashRung` is not.

| field | crafts authoring it | engine readers | app readers | verdict |
|---|---|---|---|---|
| `backlash` | 23 | **3** (`gm.js`, `intensity.js`, `progression.js`) | 10 | ✅ **real — author it** |
| `conserveSuppresses` | 23 | 0 | **1** — `app.js:7351` → `resolution.conserveNote` | ✅ **real, one reader** |
| ⛔ **`backlashRung`** | **20** | ⛔ **0** | ⛔ **0** | ⛔ **DECORATION** |

⛔ **`backlashRung` is authored on twenty crafts and read by nothing.** It is the exact shape this project
keeps paying for — authored ✓, registered ✓, loaded ✓, **read ✗**.

⬜ **Your call, and I have not made it:** either it wants a consumer (say, choosing how hard a backlash
lands) or it should move into `bounds` as prose. ⚠️ **What it should not do is accrue more entries** while
nothing reads it — that makes the eventual wiring a migration instead of a feature.

✅ **`conserveSuppresses` answers your specific worry directly:** it surfaces as `conserveNote` on the
resolution, so authoring it makes conserve a real, visible decision. It is one reader, but it is a live one.

---

## R3 — §2d · The GM path is real, but ⛔ YOUR FORMAT SPEC IS MISSING HALF THE SCHEMA

✅ **The path:** `npc_interiority.json` → `state.js:603` → `content.npcInteriority`. **Two live consumers:**
`worldtick.js:435` (`advanceSeeking` — the seeking mechanic reads it) and `app.js:7727`, which reads
`CONTENT.npcInteriority?.npcs?.[id]?.wants`. ✅ **New entries under `npcs.<id>` land where the engine reads.**

⛔ **But the live schema has SIX fields and your format names three.**

| field | engine readers | app | in your §2d format? |
|---|---|---|---|
| `driveSummary` | 1 | 0 | ✅ yes |
| `wants` | **33** | 16 | ✅ yes |
| `fears` | 4 | 4 | ✅ yes |
| ⛔ `pushesBackWhen` | **2** (`npcs.js`, `state.js`) | 0 | ⛔ **omitted** |
| ⛔ `emotionalRange` | **2** (`npcs.js`, `state.js`) | 0 | ⛔ **omitted** |
| ⛔ `acknowledgeTone` | **1** (`npcs.js`) | 0 | ⛔ **omitted** |
| ⚠️ `traditionRelation` *(your proposed addition)* | **0** | **0** | ✅ marked optional |

⛔ **All seven existing entries carry all six fields.** Pell, veth-ondra, mara-wells, calvar, siol, huginn,
ama — **6/6 each.** Authoring to your three-field format would produce entries **measurably thinner than
every NPC who already has one**, and thin in exactly the three places the engine reads.

⚠️ **And `traditionRelation` has no reader.** It is a good idea — *"how this person stands relative to their
people's defining question"* is precisely the §2c material — but it will be prose until something consumes
it. ⛔ **Say so in the spec, or the next audit will find twenty entries of an unread field.**

---

## R4 — §2c · `aesthetic` is heavily read. `civilization` is a lore-screen field. `cultOfPurity` is unread.

| field | reality |
|---|---|
| `aesthetic` | ✅ **3 engine modules** (`art.js`, `capabilities.js`, `worldmap.js`) + **15 app sites** — this is load-bearing, it drives the pictures |
| `civilization` | ⚠️ its only `engine/` hit is a **comment**. The real reader is **`app.js:11582`**, which renders it as a lore paragraph beside `aesthetic` |
| ⛔ `cultOfPurity` | ⛔ **zero readers, engine or app** |

✅ **So your instinct in §2c is right, with one correction:** it is not "GM-prompt territory", it is **the
lore screen** — `app.js:11582` prints `civilization` and `aesthetic` as the two paragraphs a player reads
about a people. ⚠️ **That makes the promise-audit MORE valuable, not less:** those lines are shown verbatim
to a player, so a promise the craft list does not keep is one the player can see unkept.

⚠️ **`cultOfPurity` being unread is worth knowing before you thicken it** — it is world material with no
surface today.

---

## R5 — ⛔ WHAT IS ALREADY TRUE AT HEAD — the domain-gate lesson, and it bites three rows

### ⛔ `bargain` in Death is DONE

Your §2b says: *"`bargain` still missing from Death. One bargaining craft for ashwarden or threnodist."*

⛔ **It exists.** `true_account` — **ashwarden**, levelReq 1, `functions: ["reveal","empower","bargain","persuade"]`,
and its `plainly` reads *"…reads a thing's or an offer's true worth, cost and condition, and enters the
haggling as a named term."* ✅ **Retire that line from the spec.**

### ⚠️ Every craft count in §2b is low

| tradition | spec says | measured at HEAD |
|---|---|---|
| Mind | 25 | **30** |
| Body | 22 | **28** |
| Death | 30 | **39** |

⚠️ Partly your own two crafts from this morning, partly the week's authoring. ⛔ **A "re-run T5/T6/T7 against
all 25" scope is 5 crafts short on Mind and 9 on Death.**

### ⚠️ `folkAccessible` is worse than the spec says

Spec: *"12 of 24 poles have none."* **Measured: 14 of 24** — cogitant, syllogist, figurist, somatic,
blazeborn, verist, ashwarden, seraphic, abyssal, unmaker, churnfolk, enginewright, hourkeeper, numinous.
18 crafts carry the flag in total.

⚠️ **Note that three of your three second-look traditions are in that list** (cogitant, syllogist, figurist
= all of Mind; somatic = half of Body; ashwarden = half of Death). Your §2b asks *"is the selection
deliberate?"* for Mind and Body — ⛔ **for Mind the answer is that there is no selection: zero of its three
poles carry one.**

### ⚠️ The Deathsense `cannot` says something narrower than you describe

Spec: *"Deathsense cannot currently reads wrong (forbids reading undead; should read inverted)."*

**The live text is:** *"Reads the living and the dying, not the already-dead. A corpse has nothing left to
sense."* ⚠️ **It forbids reading a CORPSE, and never mentions undead.** Whether that is wrong is your call —
but the correction you have scoped is to a sentence that does not say what the spec says it says.

### ✅ Two rows verified as stated

`civilization` authored on **all 24** sects ✅ · interiority at **7** entries ✅.

---

## R6 — ⚠️ One scope note on parallelism

Your §0 says this pass is safe to run in parallel with the merger because it does not touch
`tradition`/`traditionV2`. ✅ **Confirmed — and stronger than you claimed:** the merger work is complete
(A–F plus the antipode rework all landed), so there is no in-flight engine change for this to collide with.

⚠️ **The one overlap:** `how_it_works` §31C asserts **no foothill resolves to a domain or sits on the ring**.
If §2c's Greyhearth thickening ever gives a foothill a ring position or a domain, that gate fires. ⛔ **It is
a place, not a pole** — prose is safe, structure is not.

---

## R7 — ⛔ YOUR NEW Q5: `folkAccessible` IS READ BY NOTHING

**18 crafts author it. It is in `ability.schema.json`. It has ZERO readers in `engine/` or `app.js`.**

⚠️ **Door two of four** — authored ✓, schema ✓, loaded ✓, **read ✗**. It does not appear in the skill
wheel, the learn screen, the GM prompt, or anywhere else.

⛔ **AND ITS INTENDED JOB IS ALREADY BEING DONE BY SOMETHING ELSE.** `origins.json` says the Valleyfolk
*"begin with FOLK-ACCESSIBLE crafts, each of which now belongs to a real pole and carries
`folkAccessible: true`"* — but the same note records that their **13 anchors are preserved verbatim in
`native_grants.json` as `folkNativeGrant`**. ✅ **The starting kit works through the grant list.** The flag
is a second, unread expression of the same fact.

⬜ **What this does to §2b, and it is your call:** you ask for Mind and Body *"is the `folkAccessible`
selection deliberate?"* ⚠️ **Reviewing a selection that nothing consumes is premature.** Either it wants a
reader — the honest one would be *the Valleyfolk origin offers exactly the crafts carrying this flag*,
which would let the grant list be **derived** instead of hand-kept — or the flag should be retired and the
13 anchors left as the single source.

⛔ **I have not chosen.** Wiring it is engine work and half a day; retiring it is a content decision. But
authoring more of it before either happens adds entries to a field with no consumer, which is the same
shape as `backlashRung` in R2.
