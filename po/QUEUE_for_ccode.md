# QUEUE — open items for CCode, from Aevi

**Maintained by Aevi (PO). Newest at the top. Erik does not need to relay these — read the file.**
**Last updated: 2026-09-14 (v2.0.0) · suite at time of writing: 28 green / 3 red**

---

## ⛔ OPEN

### 1 · ⚠️ AN ABSENT PURSE IS NOT A ZERO ONE
From Erik pointing at the Library's *The Game & the Coin* while I was authoring purses.

⛑ **Your `purseBands` ladder is right and it exposed something in my authoring.** I gave the Precursors,
Sovereigns, Ents and dissolved things `purse: {crystal: 0}`, and the ladder read them as its bottom rung —
*"not a shard. You are asking, or going without."* ⛔ **AKINETOS HAS NEVER ASKED ANYONE FOR ANYTHING.** All
22 at zero were outside the economy, not destitute.

⛑ **Fixed in content: no `purse` field at all.** Absence means *the question does not apply*; zero is an
answer to it. **86 NPCs now carry a purse and none is zero.**

⬜ **The ask is that the display keep the distinction** — a missing purse must not render as *"nothing on
you"*. A dragon with 60,000 reads `rich`; **a Precursor with no purse must not read as a beggar.**

### 2 · ⛔ A SKILL CARD NEVER SAYS WHAT THE SKILL ROLLS
**Erik 2026-09-16: 'I want the attribute a skill uses to be obvious in the skill pop-up and description.'**

⛑ **MEASURED: `skillDetail` renders NEITHER the attribute NOR the sub-attribute.** Drawn Bow rolls
`physical/agility` and its card says nothing about it — a player cannot tell which of their eight numbers a
craft leans on without opening the data.

⛔ **THIS IS RENDERING, NOT CONTENT, AND DELIBERATELY SO.** Writing *"rolls Agility"* into 440 `plainly`
strings is a stored copy of a derived value — the same defect as the hand-typed size table, the doc line
counts, and `tierRank`. **The card should read the record.**

⚠️ **AND ONE CAVEAT THAT DECIDES THE SHAPE: only 26 of 440 crafts carry an AUTHORED `subAttribute`.** The
other 414 would be showing the DERIVATION — the same one that had a bow rolling `strength` until it was
authored. ⛔ **A GUESS SHOWN AS A FACT IS WORSE THAN NOTHING.** Mark it the way `sheetFor` already marks a
rung: `tierNow` versus `tierDerived`. *"Rolls Agility"* when authored; *"rolls Agility (derived)"*, or a
quieter treatment, when not.

⛑ Suggested: attribute and sub-attribute on the card head beside the energy cost, where a player looks before
committing — **and it makes the §166 pass visible, which is the fastest way the remaining derivations get
caught by someone playing.**

### 2 · ⛔ THE PLAYERS WHO WROTE THE MOST GOT THE LEAST ARC — `po/SPEC_SNG-588_the_players_who_wrote_the_most_got_the_least.md`
**Found by opening Brook's character. No test caught it.**

⛑ **I HAVE FIXED THE CONTENT HALF AND SHIPPED IT** — `personalArc.js`'s template no longer puts a paragraph
in a `name`, no longer inlines a motivation into stage 1, and no longer double-punctuates the premise.
`titleize` is kept and is safe now that it only ever sees a place. **Both live saves repaired.**

⛔ **THE REST IS YOURS, AND IT IS NOT THE TYPOGRAPHY.** Measured across every save: **Chernak 2,567 chars of
bio → fallback. Loki 1,607 → fallback. Rhinofire 294 → a real authored arc. Silas 495 → a real one.**
⚠️ `enrichPersonalArc` fires ONCE at creation and returns on `!getApiKey()`; if it does not fire then, it
never fires again. **A fallback arc is a debt, not a resting state.** Retry it, and prioritise by what the
player actually wrote.

⬜ Also: does `contentGenerator: false` gate this? **If it does, it is the wrong gate** — a player who has
not opted into generated content has still written a backstory.

### 2 · ⛔ A PLAYER'S ARC NAME IS A 356-CHARACTER TITLE-CASED PARAGRAPH — `po/HANDOFF_aevi_SNG-587_the_arc_name_is_a_paragraph.md`
**Found by opening Brook's character because Erik asked me to look at it. No gate caught it.**

Her level-1 figurist's `personalArc.name` reads *"The Thread of Chernak Has No Single Hometown — They
Emerged From The Heartroot Itself, … The Rootkin Say A Child Born There **Isn'T** Born So Much As
*Condensed*…"* ⚠️ **Erik's Loki has it too** — *"The Thread of He **Doesn'T** Know, But **He'S** A
Construct…"*

⛔ **TWO BUGS COMPOUNDING** at : `bio.hometown` holds the whole backstory, and
`titleize` then title-cases a paragraph. **The title-caser is the visible bug and not the root one.** Full
detail and the ask in the handoff.

### 3 · ⛔ THE GENERATORS ARE THE AUTHOR NOW — `po/SPEC_SNG-582_the_generators_are_the_author_now.md`
**Erik, and it is the item that makes the rest of today last:** *"All of this authoring will fall to the
generators, so they need to be able to faithfully continue what you are doing."*

⛔ **Today I closed A1 (1,144 lines), location `appearance` (138 of 138), the sub-attribute pass and the
world-fact `kind` pass BY HAND. Every one is now a standard the mint has to meet**, and the game is
primarily generative. **I am not going to hand-author the next 138.**

**Four measured gaps, full detail in the spec:**
- ⛔ `generate.js:119` mints `descriptionSeed: name` — **a place is handed its own name as its description**,
  and `art.js:684` draws the picture from it.
- ⚠️ 13 minted places share one boilerplate seed. I authored looks for all 13; **the next one gets the
  boilerplate again.**
- ⛑ **No generator emits `appearance` for a location at all**, so 138 authored is a one-time fix on a
  growing set.
- ⛔ **`playerText` strips the glyphs and LEAVES THE CAPITALS** — and the capitals are the whole of what I
  rewrote today. `gm.js` carries 94 glyph markers. **A1 re-accumulates from the first generated craft.**

⬜ **And the A1 pin only counts authored packs, not what a live save holds** — so it can read zero while
every minted craft arrives shouting.

### 4 · ⚠️ §236's two specimen lines, and a third placeholder-as-content
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

### 5 · ⚠️ `gearWords` is singular-only, and a `purse` has no reader
`npcStanding.gearWords` · measured while authoring gear

⛔ **THE MATCHER TOKENISES AND THE WORD LIST IS SINGULAR, SO A PLURAL SILENTLY CARRIES NOTHING.** `a glaive`
arms a person; **`limbs like glaives` does not.** Same for `mauls`, `staffs`, and any compound: **`broadsword`
never matches `sword`**, `waystaff` never matches `staff`. ⚠️ I hit all four while authoring and worked
around them by rewording — **an author who does not check the parse will not notice**, and the failure is
silent: the line renders as prose and arms nobody.

⬜ **Cheapest fix is a suffix-tolerant match plus a substring check on the compound weapons.**

⛑ **AND I HAVE AUTHORED `purse` ON 69 NPCs** — `{"crystal": n}`, scaled to standing — **on Erik's ask for
money amounts. Nothing reads it.** It sits beside `gear` and wants the same treatment.

### 6 · A location image is drawn from philosophy, and `appearance` has no reader
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

### 7 · A state can only ever be a place
`engine/quests.js` · SNG-577 · `po/HANDOFF_aevi_SNG-577_all_deeds_and_twelve_want_a_state.md`

`kind: "state"` routes everything through `recordPlaceChange` whatever the subject is, so a state about a
PERSON files as a place change. ⛑ **All 24 world facts are now marked `deed` and that is correct today.**
⚠️ **Twelve want a state and cannot say it** — what Saehara became, what happened to the Lightless Seraph,
whether the first waygate since the Transition EXISTS, whether Silas's made thing stands.

⬜ **And two of those twelve need a record for a MADE THING**, which is neither place nor person. `world/canon/`
already holds `gen-stillwater-s-trouble` beside the people, so the store can carry it; nothing mints one.

### 8 · The Fellowship matrix reads the one field nobody fills in
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

### 9 · `certify_counts` and private keys — **your call stands, I withdrew the sweep**
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
