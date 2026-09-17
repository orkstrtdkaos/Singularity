# QUEUE — open items for CCode, from Aevi

**Maintained by Aevi (PO). Newest at the top. Erik does not need to relay these — read the file.**
**Last updated: 2026-09-14 (v2.0.0) · suite at time of writing: 28 green / 3 red**

---

## ⛔ OPEN

> ⛑ **BACKLOG AUDITED AGAINST LIVE CODE, 2026-09-17.** Five items closed by CCode and struck: the skill card now says what a craft rolls (**per verb**, with the table's guess marked *(derived)* — CCODE-379); a location image reads `appearance` first (CCODE-391), so all **141** authored looks are live; a fallback arc is retried as a debt (CCODE-393); the generators author to the standard (CCODE-397); and the aftermath reader prefers the event's `resolutions` (CCODE-392). ⚠️ **Verified by running the code, not by reading the commit titles** — my first check said the skill card was still silent, and the probe was wrong, not the card.

### 1 · ⛑ THE NEXUS FRAME IS AUTHORED AND TWO SEATS ARE LEFT FOR THE GENERATOR
`content/packs/core/rules/nexuses.json` — eight sites, named, sourced, organ-mapped, vectored and championed.
Standing math ruled (+2 on-band · −1 one step · −4 two steps · **+6 at a matching nexus**), and holding one now
moves the **regional density** of its power source in a radius — Erik rules the radius.

⛔ **TWO SEATS ARE DELIBERATELY OPEN — Great Engine and Neitherway — for the GM and the generative engine.** Erik:
*"perhaps we leave the remaining two for the GM and the generative engine to work out."* ⚠️ **This must not be
backfilled by a later authoring pass**; a board where every seat is taken by an authored legend is a board a
player can only visit.

⛑ `_whatAGeneratedChampionMUSTCARRY` in that file is the brief, as data rather than prose so a prompt can carry
it: a `vector`, a `purity`, a `turnability` (and the rule that decides it — **corrupt means unpersuadable**), a
reason they are at THAT site drawn from what the site already is, and the organ's faculty as character rather
than label. ⛔ And the one rule to keep if only one survives: **do not make both open seats the same vector** —
the authored six run permanence ×2, adjacency ×2, middle ×1, undecided ×1, and two more of any one tips an even
board.

⚠️ **This is SNG-582's argument at the top of the game.** The generators are the author now, and a minted nexus
champion has to meet the standard the authored six set.

### 2 · ⚠️ §236's two specimen lines, and a third placeholder-as-content
`tests/how_it_works.mjs` · from SNG-586

⛑ **I authored the threat ladder you asked for and §236 went red** — it asserts the authored ladder IS the
absolute one, and that the result carries `ladderIgnored`. ⛔ **The outcome it protects still holds
(`key === "beneath"`); it now holds because the ladder is RIGHT rather than because the fallback rescued
it.** Your own sentence, thirteenth instance, wants a fixture.

⚠️ **AND A THIRD PLACEHOLDER READING AS CONTENT, measured while authoring `gear`: 139 of 146 NPCs fell back
to `defaultLoadout` — the SAME TWO ITEMS, "a weapon of their trade" and a Healing Draught.** Every person in
the world was armed identically, and *"a weapon of their trade"* is a placeholder that renders as an item.
⛑ Authoring real kit now (76 of 146). **Same shape as the mint boilerplate and SNG-216's repair marker —
three instances in one day, which is why SNG-582 is item 1.**

### 3 · ⚠️ `gearWords` is singular-only, and a `purse` has no reader
`npcStanding.gearWords` · measured while authoring gear

⛔ **THE MATCHER TOKENISES AND THE WORD LIST IS SINGULAR, SO A PLURAL SILENTLY CARRIES NOTHING.** `a glaive`
arms a person; **`limbs like glaives` does not.** Same for `mauls`, `staffs`, and any compound: **`broadsword`
never matches `sword`**, `waystaff` never matches `staff`. ⚠️ I hit all four while authoring and worked
around them by rewording — **an author who does not check the parse will not notice**, and the failure is
silent: the line renders as prose and arms nobody.

⬜ **Cheapest fix is a suffix-tolerant match plus a substring check on the compound weapons.**

⛑ **AND I HAVE AUTHORED `purse` ON 69 NPCs** — `{"crystal": n}`, scaled to standing — **on Erik's ask for
money amounts. Nothing reads it.** It sits beside `gear` and wants the same treatment.

### 4 · A state can only ever be a place
`engine/quests.js` · SNG-577 · `po/HANDOFF_aevi_SNG-577_all_deeds_and_twelve_want_a_state.md`

`kind: "state"` routes everything through `recordPlaceChange` whatever the subject is, so a state about a
PERSON files as a place change. ⛑ **All 24 world facts are now marked `deed` and that is correct today.**
⚠️ **Twelve want a state and cannot say it** — what Saehara became, what happened to the Lightless Seraph,
whether the first waygate since the Transition EXISTS, whether Silas's made thing stands.

⬜ **And two of those twelve need a record for a MADE THING**, which is neither place nor person. `world/canon/`
already holds `gen-stillwater-s-trouble` beside the people, so the store can carry it; nothing mints one.

### 5 · The Fellowship matrix reads the one field nobody fills in
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

### 6 · `certify_counts` and private keys — **your call stands, I withdrew the sweep**
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
