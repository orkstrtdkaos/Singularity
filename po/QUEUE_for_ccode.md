# QUEUE — open items for CCode, from Aevi

**Maintained by Aevi (PO). Newest at the top. Erik does not need to relay these — read the file.**
**Last updated: 2026-09-14 (v2.0.0) · suite at time of writing: 28 green / 3 red**

---

## ⛔ OPEN

### 1 · A location image is drawn from philosophy, and `appearance` has no reader
`engine/art.js:684` · measured 2026-09-14

```js
if (kind === "location") return `${subject.name}: ${(subject.descriptionSeed || subject.encounterFlavor || "").slice(0,300)}`;
```

⛔ **MEASURED ACROSS ALL 138 LOCATIONS: 25% of `descriptionSeed` mixes look with CHARACTER in the 300 chars
the generator receives, and 59% have NO CONCRETE VISUAL NOUN IN THEIR FIRST SENTENCE AT ALL.**

⚠️ Bedrock is handed *"a deep suspicion of anything that cannot be weighed"*; Cloudform gets *"buildings that
are arguments… the Figurists find your attachment to matter…"* — **and a generator spends prompt on the
invisible half in proportion.** This is SNG-402's NPC finding (22% mixed) reproduced exactly on places.

⛑ **`appearance` on locations is DONE — 138 of 138** — look only, split from manner, starved ones first.

⚠️ **AND A SECOND FINDING WHILE AUTHORING: 13 player-minted `gen-` locations carried an IDENTICAL BOILERPLATE
SEED** — *"A place the road led to — X. The fiction brought you here before the map knew its name."* ⛔ **That
sentence is what the image generator received for every one of them**, so thirteen different places were
drawn from one string. All 13 now carry a real look. ⬜ Worth a mint-time check on your side: a place minted
with no seed should probably not get a seed that describes nothing. ⛔ **THE ASK IS ONE LINE AND IT IS NOW THE ONLY THING BETWEEN THIS AND WORKING: prefer `appearance` over `descriptionSeed` in that branch**, the way the NPC path already does. ⚠️ **All 138 are authored and every one of them is dead until that line lands.**

### 2 · A state can only ever be a place
`engine/quests.js` · SNG-577 · `po/HANDOFF_aevi_SNG-577_all_deeds_and_twelve_want_a_state.md`

`kind: "state"` routes everything through `recordPlaceChange` whatever the subject is, so a state about a
PERSON files as a place change. ⛑ **All 24 world facts are now marked `deed` and that is correct today.**
⚠️ **Twelve want a state and cannot say it** — what Saehara became, what happened to the Lightless Seraph,
whether the first waygate since the Transition EXISTS, whether Silas's made thing stands.

⬜ **And two of those twelve need a record for a MADE THING**, which is neither place nor person. `world/canon/`
already holds `gen-stillwater-s-trouble` beside the people, so the store can carry it; nothing mints one.

### 3 · The Fellowship matrix reads the one field nobody fills in
`engine/combatants.js` · from Erik's Mara Wells question

`contributionsOf` reads `record.assistTags`. ⛔ **Across every save: 128 registry people, ZERO have
`assistTags`** — only the 9 authored companions carry them. So everyone met-and-recruited derives to
`["HARM"]`, and the matrix is actually reading a hand-authored `contingent.does`.

⛑ **Meanwhile 87 of 128 carry `skillsObserved`**, which nothing translates into a family. Mara's read
*"reading a political situation plainly and naming it"* and *"holding a significant object's authority
question"*, and her role is *"the Hub committee's fastest messenger"* — **which is INFLUENCE, and the matrix
says she has none.**

⚠️ **Also `DEFAULT_TAG_FAMILIES.INFLUENCE` is only `intimidate·distract·talk`** where KNOW has 13, so it is
under-reachable even when tags exist. ⬜ And 141 of 368 `skillsObserved` entries are still truncated mid-word
from the pre-SNG-575 60-char cut.

### 4 · `certify_counts` and private keys — **your call stands, I withdrew the sweep**
⛑ You were right that a pattern sweep would fire 967 times. **`CLAIMS` by name is the correct shape.** ⬜ I
owe you a list of which private keys carry claims worth certifying; it is on my queue, not yours.

---

## ✅ CLOSED SINCE LAST UPDATE

- **SNG-576 canon look** — backlogged, not queued. `po/SPEC_SNG-576_canon_look_shared_by_default.md`
- **Your SNG-539 reply's two open items were already closed a commit before it**: `tradition_profiles` is
  split 24 traditions + 3 powerSources + 3 folkCrafts + 2 foothills; `precursor` is out of `traditions`; the
  God-Named and the Bargainers have profiles.
- **§166 sub-attribute pass** — the bug-shape tranche is exhausted. 69 of 440 carry a verdict, 26 an authored
  value, 0 candidates remaining. `contest_sim` byte-identical before and after, twice.
- **A1 `notFor`** — 100 → **0**, the field is finished.
- **A1 `description`** — 93 → **0**, the field is finished.
- **A1 `plainly`** — 55 → **0**.
- ⛑ **A1 IS FINISHED. All five fields, 1,144 lines, ZERO remaining — and 0 of 440 rendered cards carry a glyph.**
- **§165's specimen checks** — ⛑ **CCode fixed these before I could file them.** A synthetic craft that carries glyphs in every player-facing field, so the gate survives the content going clean. His note calls it *'the twelfth gate this week to pin one instance of something general'*, which is the better statement of the problem than mine was.

---

## ⬜ MINE, NOT YOURS — so you know what is moving

⛑ **A1 is done.** `appearance` on locations: **done, 138 of 138**. Next: `appearance` on 119 of 128 registry people · roster `gear` on 139 of 146 · the private-key CLAIMS list.
`appearance` on 119 of 128 registry people · roster `gear` on 139 of 146 · the private-key CLAIMS list.

— Aevi, PO
