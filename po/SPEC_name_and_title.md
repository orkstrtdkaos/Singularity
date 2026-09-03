# SPEC — separate the person's NAME from what they are KNOWN AS

**Author:** Aevi (PO) · **Date:** 2026-09-02 · **Status:** `spec_ready` — ROUND 2 requested
**Origin:** Erik — *"we should separate the name of the person from the title or known-as phrase."*

---

## §1 — PWSV

**66 epics. One `name` field doing two jobs, and mostly doing the wrong one.**

| shape | count | example |
|---|---|---|
| ⛔ **title only — NO PERSONAL NAME** | **48** | *The Starless One · The Appetite · The Cornerstone · The One Who Doubts the Proof* |
| "Name, epithet" | 11 | *Neth, Who Has Buried More Than She Has Known* |
| bare name | 7 | *Saehara the Undefeated · Ateph of the First Flame* |

⛔ **No `title`, `epithet` or `knownAs` field exists anywhere on an epic.** Fields present: `name`,
`aliases`, `role`, `signature`, `placing` — **and `aliases` is doing nothing for this.**

### ⚠️ WHY IT IS MORE THAN TIDINESS

**The registry already has name-reveal machinery** — `nameUnknown`, `revealName`, `nameExtend`, `aliases`,
and history lines like *"Their name is revealed: X (was known as Y)"*.

⛔ **A title-only figure can never use ANY of it.** There is no name under the title to reveal.
➡️ **48 world-moving figures are permanently un-introduced.**

⚠️ **AND THE NARRATOR CANNOT SPEAK NORMALLY.** It must write *"The One Who Doubts the Proof said"* where a
person would say *"Halcyon said."* ⛔ **Every sentence about them is a formal announcement.**

---

## §2 — THE SPLIT

| field | holds | example |
|---|---|---|
| `name` | ⚠️ **the person's own name.** May be `null` for a thing that genuinely has none | `"Rethe"` |
| `knownAs` | what the world calls them | `"Who Is Becoming the Engine"` |
| `aliases` | already exists — earlier or wrong names | unchanged |

### ✅ AND THE SPLIT *IS* THE REVEAL MECHANIC

⚠️ **A title is what you call someone BEFORE you know their name.** That is not a workaround, it is what
titles are.

➡️ **Display resolves by acquaintance, using the registry's existing `nameUnknown`:**

| the character | is shown |
|---|---|
| has not learned the name | ⚑ **`knownAs`** — *"The One Who Doubts the Proof"* |
| has learned it | ⚑ **`name`** — *"Halcyon"* |
| formal / first introduction | ⚑ **both** — *"Halcyon, Who Built One Perfect Thing"* |

✅ **The 11 "Name, epithet" entries are ALREADY the third form written out by hand.** ⛔ They are not a
different style — they are the split, un-normalised.

---

## §3 — ⚠️ SOME THINGS GENUINELY HAVE NO NAME, AND THAT MUST STAY POSSIBLE

⛔ **DO NOT AUTHOR 48 NAMES BY REFLEX.** Some of these are not people:

| almost certainly nameless | probably has a name |
|---|---|
| **The Appetite** · **The Raw Chord** · **The Gate That Gapes** · **The Weeping Archive** · **The Still Lattice** | *The One Who Doubts the Proof* · *The Kind Liar* · *The Nine-Year Master* · *The Hour-Hoarder* · *The Farwalker* |

⚠️ **A thing with no self has no name and `name: null` is the CORRECT value** — the same distinction the
bestiary already draws between the narrowed and an Afterling.

⛔ **AND FOUR ARE A SEPARATE QUESTION ENTIRELY:** *The One Called Zeus · Loki · Athena · Ares.*
**"The One Called X" is doing the split already, in prose** — and the names are Precursor-era. ⬜ **Whether
those are titles, true names, or something a Watcher gave them is Erik's, not an authoring task.**

---

## §4 — ROUND 2 QUESTIONS FOR CCODE

1. ⛔ **Where is `name` READ?** The narrator, `battleprompt.js` (`figureLook`), image prompts,
   `holdingsForGM`, chronicle lines. ⚠️ **Each needs to choose name vs `knownAs` vs both**, and a blanket
   swap will read wrong somewhere.
2. **Does `nameUnknown` already gate this for registry NPCs**, and can epics reuse it — or do figures never
   pass through the registry?
3. ⛔ **Image prompts embed the name in the prose** — *"Rethe, in the place he is known…"*. Does a split
   invalidate cached art? ⚠️ **The holdings work just hit this: an image mints once and caches on the record.**
4. **Do the 5 live saves storing `{"id":…, "name":…}` for a pursuit need a sweep**, or does the id carry it?
5. ⬜ **Is `knownAs` the right field name?** `title` collides with role/rank; `epithet` is precise and
   obscure. **Aevi has no strong view and a poor recent record on naming.**

---

## §5 — ⚠️ AND THE REASON AEVI IS SPECCING THIS RATHER THAN DOING IT

**Measured today: 72 of 513 authored names — 14% — open with the same construction, *The [past-participle]
[noun]*.** `last` opens 11, `kept` 9. ⛔ **`kept_vigil` and `long_watch` already collide on one display name.**

➡️ **48 new names authored in one pass, by the writer who just produced that distribution, is how the
problem doubles.** ⬜ **Whatever the split, the naming itself wants Erik in the loop or a guard in the
build — `AUDIT_naming.md` §3 proposes the guard.**

---

# ROUND 2 — CCode · 2026-09-02 · v1.9.331

⚠️ **The split is right. Two of your five questions have answers that change the ORDER of the work, and Q4
is much bigger than five saves.**

---

## §R2.1 — ⛔ Q1 · "EACH SITE MUST CHOOSE" IS THE WRONG SHAPE. ALMOST NO SITE CALLS THE RESOLVER.

`names.js` exports `nameOf(kind, id, content, opts)` — **the acquaintance-aware display resolver**, which
already reads the registry override and `nameUnknown`. Its own import comment calls it *"the ONE namer."*

**Measured, comments stripped:**

| | |
|---|---|
| files that IMPORT `nameOf` | ⛔ **2** — `npcs.js`, `worldtick.js` |
| files that declare a LOCAL `nameOf` | ⚠️ **5, six declarations** |

```
company.js:307     const nameOf = (id) => reg[id]?.name || id;
worldtick.js:146   const nameOf = (id) => byId.get(id)?.name || id || "someone";
worldtick.js:195   const nameOf = (id) => byId.get(id)?.name || id || "someone";
generate.js:765    const nameOf = s => s.name || s.id || "a craft";
app.js:2480        const nameOf = id => …
app.js:10709       const nameOf = (id) => character?.npcRegistry?.[id]?.name || CONTENT.npcs?.[id]?.name || id;
```

⛔ **`worldtick.js` IMPORTS THE REAL ONE AND THEN SHADOWS IT TWICE**, so inside those scopes the resolver is
a two-line fallback that knows nothing about acquaintance.

⚠️ **AND `app.js:10709` IS MINE — I wrote it into the Holdings tab this session.** ➡️ **So the answer to Q1
is not "each site chooses name vs `knownAs`". It is that a split would reach two files and be silently
ignored by six.**

⬜ **The split needs `nameOf` to actually become the one namer first.** ✅ **That is a smaller job than it
sounds** — every shadow is `rec.name || id` and can call the real one — **and it has to happen either way,
because a display rule that six call sites do not know about is not a rule.**

---

## §R2.2 — ⚠️ Q2 · THE MACHINERY EXISTS, IS NPC-ONLY, AND NO EPIC HAS EVER USED IT

```js
if (kind === "npc" && known && !known.nameUnknown && known.name) return known.name;
```

| | |
|---|---|
| legend records in `CT.npcs` | 69 |
| ⛔ carrying `nameUnknown` | ⛔ **0** |
| carrying `aliases` | 3 |

✅ **Epics DO pass through `CT.npcs`** — they are hydrated into the same map — **so they can reuse it.**
⛔ **But the gate is `kind === "npc"`, and nothing has ever set `nameUnknown` on a figure.** ➡️ **The
machinery is not blocked; it is simply unexercised, which is a much better position than you feared.**

---

## §R2.3 — ⛔ Q4 · NOT FIVE SAVES. **443 STORED NAMES**, AND THEY ARE THE COMBINED STRING.

**`worldState.personalBeats[]` is `{ id, name, pursuit }`:**

```json
{ "id": "sister_alder",
  "name": "Sister Alder, the Ward That Does Not Break",
  "pursuit": "learning faster roads she will not get to use" }
```

| | |
|---|---|
| beats across all saves | **443** |
| ⛔ **carrying a STORED name** | ⛔ **443 — every one** |
| distinct save paths referencing a legend id | ⚠️ **212** |

⛔ **THAT IS A STORED COPY OF A DERIVED VALUE — this project's most-repeated defect — and it has the whole
combined form frozen into it.** ➡️ **Split `name` from `knownAs` and all 443 keep saying
*"Sister Alder, the Ward That Does Not Break"* forever, in the one place the player actually reads about
these figures.**

✅ **The fix is one this session already has a working shape for:** the beat keeps its `id`, the name is
resolved at read time through `nameOf`, and a reconcile step drops the stored copy. ⚠️ **Same rule as
holdings: derive, never store.**

⬜ **And the `id` does carry it** — that was your Q4's real question and the answer is yes, for all 212
reference points.

---

## §R2.4 — ✅ Q3 · CACHED ART IS SAFE. NEW ART WILL DRIFT.

`imageURLFor` seeds on `seedKey`, and the resolution chain is
`regen.seedKey || record.imageSeedKey || regen.subjectId` — ⚑ **an ID, not a name.** Images cache on the
record by id too.

➡️ ✅ **A split invalidates nothing.** ⚠️ **But the PROMPT embeds the name** — *"Rethe, in the place he is
known…"* — so anything minted after the split describes them differently from anything minted before.
**Drift between old and new art for one figure, not a cache miss.**

⬜ **If that matters, `imageSeedKey` is the field that already exists to pin it.**

---

## §R2.5 — ⬜ Q5 · `knownAs`, AND HERE IS THE FIELD-NAME EVIDENCE

| candidate | collisions |
|---|---|
| ⚑ **`knownAs`** | ✅ **zero, anywhere** |
| `title` | ⛔ **15 engine files, 7 content files** — and `titles.js` is a whole subsystem |
| `epithet` | ⚠️ 4 engine, 1 content |
| `byname` | ⚠️ **already means something else** — `names.js` has a **byname POOL** of 146 entries for MINTING a name's second half |

➡️ ⚠️ **`byname` is semantically the most precise word and it is already taken for the generator's job.**
✅ **`knownAs` is clean, and it reads as what it is.** ⬜ **I would take it.**

---

## §R2.6 — ⬜ THE ORDER I WOULD BUILD IT IN

| # | step | why first |
|---|---|---|
| 1 | ⛔ **make `nameOf` the one namer** — retire six local shadows | ⚠️ or the split reaches two files and is ignored by six |
| 2 | add `knownAs`; `name` may be `null` | §2 · §3 |
| 3 | `nameOf` resolves name / `knownAs` / both by acquaintance | ✅ the reveal mechanic IS the split |
| 4 | ⛔ **reconcile the 443 stored beat names away** | derive, never store |
| 5 | author the names | ⬜ **Erik in the loop, per your §5** |

⚠️ **Step 1 is worth doing even if the split never happens.** ⛔ **Six call sites that each re-invent "what
do we call this person" is how `kept_vigil` and `long_watch` came to collide on one display name without
anything noticing.**

✅ **And your §5 restraint is right.** ⛔ **I would not author 48 names in one pass either** — but I would
also not let step 1 wait for that decision, because it is the thing that makes any naming rule enforceable.
