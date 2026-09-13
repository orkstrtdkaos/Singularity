<!-- status: SNG-550 spec_ready AWAITING GO (Erik 2026-09-12: "Figure out what we can do to keep the save content - but only append the repo file perhaps? Would that keep the size of the diff down?" → "Spec it for code") -->
# SPEC SNG-550 — The save is one file, every save uploads all of it, and appending cannot fix that

**CCode · 2026-09-12 · every number measured against `char-mrhs8286.json` and this repo's own history**

---

## §1 — ⛔ THE QUESTION, ANSWERED FIRST: APPENDING IS THE ONE THING THAT WILL NOT HELP

**Erik:** *"only append the repo file perhaps? Would that keep the size of the diff down?"*

⛑ **The diff is already 5.5 KB.** Git holds **1,088 distinct versions** of this save: **574 MB raw, 5.7 MB
packed** (`git cat-file --batch-check '%(objectsize:disk)'`). Delta compression has been doing this job the
whole time, and the whole repository is 60 MB.

⛔ **AND APPENDING CANNOT TOUCH THE PART THAT HURTS, because the GitHub contents API HAS NO APPEND.** Every
write is a `PUT` that replaces the entire file. A save uploads **1.09 MB** (measured average over the last
twelve saves) whatever order the bytes are in. ⚠️ **SNG-543 made that worse and I should say so plainly:**
moving the push from once-a-turn to every-save-debounced turned one upload per beat into one per twelve
seconds of play. On a phone that is mobile data, and it is the cost Erik is feeling.

| | measured |
|---|---|
| uploaded per save | **1.09 MB** |
| stored in git per save | **5.5 KB** |
| the file today | **1,371,530 bytes** |
| the file on 12 July | 23,201 bytes |
| growth | **~22 KB/day**, crossed 1 MB in late August |

⚠️ **AND THE 1 MB LINE IS NOT COSMETIC.** It is the contents API's inline-content limit, and crossing it is
what blinded both sync guarantees in SNG-549 — the read came back empty, `null` meant "no remote", the pull
kept a stale copy and the push guard waved it through. The raw-body read fixes the symptom. **The file being
over the line is still the condition that produced it.**

---

## §2 — ⛑ WHERE THE 1.37 MB ACTUALLY IS

| bytes | share | key | entries | changed in 11 saves |
|---|---|---|---|---|
| 200,642 | 14.6% | `codex` | 6 | 3 |
| 154,987 | 11.3% | `generated` | 6 | 3 |
| 124,450 | 9.1% | `gallery` | 122 | 8 |
| 121,396 | 8.9% | `worldState` | 64 | 6 |
| 103,997 | 7.6% | `npcRegistry` | 41 | 4 |
| 52,273 | 3.8% | `quests` | 10 | 2 |
| 50,720 | 3.7% | `placeMemory` | 22 | 2 |
| 43,914 | 3.2% | `abilityImages` | 47 | 6 |
| 344,374 | 25% | the other 124 keys | | |

⛔ **AND ONE CATEGORY CUTS ACROSS ALL OF THEM: 271 ART URLS, 211,878 BYTES, 15.4% OF THE SAVE.** Median 726
characters each, longest 1,386 — because the whole image prompt is encoded into the URL, and `imagePrompt`
is frequently stored beside it. ⚠️ **That is a stored copy of a derived value**, which is the defect Aevi
ruled on twice this week (the energy counts, the damage-type counts) in the same words: *"a stored copy of a
derived number is a staleness generator."*

⚑ Second: **`codex.mergeUndo` is 63,409 bytes** of merge-undo bookkeeping, and `generated.npc` is 131,173.
Both are capped (`UNDO_CAP`, `capGallery`) — generously.

---

## §3 — ⛔ THE DESIGN: THE CORE RECORD IS A MANIFEST, AND THE SECTIONS ARE SIBLING FILES

Nothing is deleted. That is Erik's constraint (*"keep the save content"*) and it is met exactly: the same
bytes live in more files.

```
characters/<playerKey>/<id>.json              ← THE CORE. Every small field, plus `sections`.
characters/<playerKey>/<id>/codex.json        ← one file per split section
characters/<playerKey>/<id>/generated.json
characters/<playerKey>/<id>/art.json          ← gallery + abilityImages + likeness + locationImages
characters/<playerKey>/<id>/worldState.json      + sceneImages + battleImages + composedImages
characters/<playerKey>/<id>/npcRegistry.json
```

**The core gains:**

```json
"saveFormat": 2,
"sections": {
  "codex":       { "sha": "9f2c…", "bytes": 200642, "rev": 2081 },
  "generated":   { "sha": "41ab…", "bytes": 154987, "rev": 2044 },
  …
}
```

`sha` is a content hash of the section's serialised bytes. ⛔ **THE CORE IS THE ONLY AUTHORITY ON WHAT A
COMPLETE CHARACTER IS** — `rev`, `updatedAt`, `syncedAt`, xp, level and the clock all stay on it, so
`resolveSaveConflict` keeps working unchanged and §117's rev lead and SNG-549's game-state rule need no edit.

### ⛑ THE COMMIT PROTOCOL — SECTIONS FIRST, CORE LAST

⛔ **This is the whole of the crash-safety argument and it must not be reordered.**

1. Write every **dirty section** file.
2. Write the **core** last, naming the new hashes.

- Core lands, a section did not → the next read sees a **hash mismatch** and refuses (below). Nothing is lost.
- Sections land, the core did not → the old core still names the **old** hashes, which are still on the
  remote. The state is the previous consistent one. Nothing is lost.
- ⚠️ **There is no interleaving that produces a silently wrong character**, which is the property the single
  file gave us for free and the only thing worth paying for here.

### ⛔ A TORN READ IS A REFUSAL, NEVER A PARTIAL CHARACTER

A pull assembles: read the core, then fetch each section it names and verify the hash.

- Any section **missing, unreadable, or hash-mismatched** → ⛔ **the assembly FAILS. Keep the local copy, say
  so on the play surface, and do NOT adopt.**
- ⛔ **AND NEVER WRITE BACK A CHARACTER ASSEMBLED FROM AN INCOMPLETE READ.** A character whose codex failed to
  load looks exactly like a character with no codex, and saving it destroys 200 KB of play. ⚠️ This is
  SNG-549's lesson one level up: *a guard that passes when it cannot see is not a guard.* The assembled
  record carries `_complete: true`, and **`saveCharacter` refuses to push anything without it.**

---

## §4 — ⚠️ THE MIGRATION, WHICH IS THE RISKY HALF

Two devices are live and both hold format-1 copies. ⛔ **An old build reading a format-2 core would see a
character with no codex, no gallery and no world state, play happily, and write it back.** That is the
SNG-549 loss again with more zeros.

**So the cutover is:**

1. **The split lives at a NEW path** (the directory above). The legacy single file stays exactly where it is.
2. A **format-2 client** prefers the directory. If the legacy file's `rev` is higher than the core's, it
   adopts the legacy file, splits it, and writes the directory — that is the migration, and it happens on
   whichever device opens first.
3. A **format-1 client** never sees the directory, keeps using the legacy file, and its writes are picked up
   by rule 2 on the next format-2 open. ⚠️ **It cannot corrupt the split save because it cannot see it.**
4. After both devices have run format 2 (checkable: the legacy file stops advancing), the legacy file is
   frozen with a one-line marker and left in place. ⛔ **It is never deleted** — it is the last format-1
   snapshot and it costs nothing but disk we have already paid for.

---

## §5 — WHAT IT BUYS, MEASURED ON HIS LAST TWELVE SAVES

| | bytes uploaded per save |
|---|---|
| today, one file | **1,085,529** |
| split, one file per section (5 sections + core) | **571,567** avg · 261,738 min · 1,114,215 max |
| split, one file per top-level key (upper bound) | **368,932** avg (34% of today) |

- **Files written per save: 4.0 average**, 1 minimum, 9 maximum — well inside the API's rate budget.
- **The core is 261,836 bytes and a pull must always read it**, so that is the floor. ⚠️ **This is a 2–3×
  win, not a 10× one**, and the spec should not pretend otherwise. The rest of the win is in §6.

---

## §6 — ⛑ THE CHEAP WINS THAT ARE NOT THE SPLIT

⛔ **DO THESE FIRST — they are smaller, safer, and one of them is bigger than it sounds.**

**6a · Raise the push debounce from 12s to 60s.** One constant. Cuts uploads during active play ~5×. ⚠️ It
costs almost no safety: `visibilitychange`/`pagehide` is what actually protects a closing tab, and the
debounce only decides how often a *still-open* tab writes. **Do this immediately; it needs no migration.**

**6b · Stop storing derived art URLs — 15.4% of the file. ⛑ THE CENSUS IS RUN AND IT IS THE BEST BUY ON THIS
PAGE.**

| | |
|---|---|
| art URLs on the record | **271 · 211,878 bytes · 15.4% of the save** |
| hosted at `image.pollinations.ai` | **270 of 271** — one host, one URL shape |
| **with a prompt already stored beside them** | **158 (58%)**, and those prompts cost 18,318 bytes |
| where they live | `gallery` 95 KB · `abilityImages` 43 KB · `generated` 24 KB · `likeness` 17 KB · `locationImages` 10 KB |

⛔ **FOR 158 OF THEM THE SAVE IS STORING THE SAME TEXT TWICE.** A pollinations URL is
`https://image.pollinations.ai/prompt/<percent-encoded prompt>?seed=…`, so where `imagePrompt` sits in the
same object the URL is a **second, inflated copy of it** — percent-encoding makes it *longer* than the prose
it duplicates. Dropping those is **~123 KB with nothing lost at all**: the URL rebuilds exactly.

⚠️ **For the other 113 the URL is the only copy of the prompt**, so it is not deleted — it is **decoded into
a prompt field**, which is smaller than the encoded form it replaces (every space stops costing three bytes).

⛑ **Estimated total: ~160 KB, about 12% of the file, and it needs NO new files, NO migration and NO change
to the save's shape** — a reconcile step converts records in place and one builder function derives the URL
at render. ⛔ **That is a better buy than §3 and it carries none of §3's risk.**

**6c · Tighten `codex.mergeUndo` (63 KB) and `generated.npc` (131 KB).** Both already capped; the caps are
generous. ⛔ **A ruling, not an engineering call** — how many merges should be undoable, and how long a
generated person nobody has met should be kept.

---

## §7 — ORDER, AND WHAT I WILL NOT DO

⚠️ **THE CENSUS REORDERED THIS PAGE.** I wrote §3 first because Erik's question was about the file, and then
measured 6b and found a better answer: **the same 12% of the save, in place, with no new files and no torn
read to protect against.** The split stays specced because it is still the right answer *eventually* — but it
is no longer the first thing to build, and a spec that hid that would be selling its own §3.

1. **6a** — the debounce. Minutes. No migration, no format change. ⚠️ **This is a trade Erik should make, not
   me**: fewer uploads against up to 60s of play at risk if a device dies mid-session, four days after one of
   his devices lost a save. If he would rather keep 12s, the other items stand on their own.
2. **6b** — the art URLs. **~160 KB, ~12%, in place.** A reconcile step to convert, one builder to derive, and
   a gate that every converted record still renders the identical URL.
3. **6c** — after Erik rules on the two caps.
4. **§3/§4** — the split, re-measured after 6b lands. At −160 KB the core drops under a megabyte on its own,
   which removes the API-limit argument and leaves only the upload-size one.

⛔ **I WILL NOT START THE SPLIT WITHOUT A GO.** It changes the shape of the file that holds his character, on
two live devices, four days after one of them was overwritten. The debounce and the census are reversible in
a line; the split is not.

### The gates it must ship with

- ⛔ **Sections-first-core-last**, asserted by driving a write that fails partway at each point and proving the
  assembled read is either the old state or a refusal, never a mixture.
- ⛔ **A hash mismatch refuses**, and the refusal reaches the player.
- ⛔ **`_complete: false` can never be pushed**, driven on a fixture whose section read threw.
- ⛔ **A format-1 client's higher `rev` still wins and is migrated**, not silently overwritten.
- ⚠️ **Round-trip identity**: split-then-assemble is byte-identical to the original record, proven on the live
  save, because the first thing a reader will ask is whether it lost anything.

— CCode
