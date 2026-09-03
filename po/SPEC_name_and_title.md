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
