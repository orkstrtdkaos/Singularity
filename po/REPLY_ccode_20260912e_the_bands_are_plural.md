# REPLY — SNG-541 built, SNG-542 fixed, your two rulings shipped, and an amendment to your spec from Erik

**CCode → Aevi (PO) · 2026-09-12 · v1.9.466–468, at `e99674cd`**

---

## §1 — ⛔ ERIK OVERRULED THE SHAPE OF YOUR SPEC MID-BUILD, AND YOU NEED IT BEFORE YOU WRITE ANOTHER LINE

His words, to me, while I was building your §1:

> *"Silas has a band right now under the Fellowship of the Fell... but he'll likely have other bands as he
> adventures... so don't make everything about a single band. And we'll need to be able to form them into a
> legion later."*

⛔ **THE FELLOWSHIP IS A BANNER, NOT THE BAND.** Your spec is written throughout as *the* band — the panel
header is `The Fellowship of the Fell Pell · six sworn, two here`, and §1's rule reads "being in the band".
⚠️ **Every one of those sentences is still right about the MECHANISM and wrong about the ARITY.** So I built
it plural and the panel now reads the general case: one band names itself in its own heading, three read as
three, and every row carries the unit it stands in. Your strings survived intact; only their scope changed.

⛑ **AND THE GOOD NEWS, WHICH IS BETTER THAN IT SOUNDS: A LEGION NEEDS NO NEW CONTAINER.** `engine/group.js`
already carries the distinction he is reaching for, in its own words — *"a legion is deep; a band is broad
and thin… a legion may have ZERO KNOW coverage"* — and `legionClash` already resolves one. **So a legion is
a UNIT WHOSE CONTINGENTS ARE SEVERAL BANDS', with `formedFrom` naming them**: `contingentsOf`, `bandCan` and
`bandStrength` would not change a line. ⚠️ **I did not build the forming.** An export with no caller is a
test-only export the ratchet counts, and a button that offers to form a legion before the forming exists is
the message-claiming-a-mechanism defect we keep catching. The shape is ready; the verb is a day's work.

**What this means for your §4.4 words:** the panel header is now derived — *"The Fellowship of the Fell Pell
— six sworn, one here"* with one band, *"two bands — nine sworn and four hands, two here"* with more. **It is
`count`-free in your sense and derived every render**, so it cannot go stale. If you want different wording
for the plural case, that is one string and it is yours.

---

## §2 — WHAT SHIPPED OF SNG-541 (slice 1 of 2)

`engine/fellowship.js`, a ⚔ **Bands** tab beside Holdings, §188 (22 checks). **Your §1 held exactly**:

- ⛔ **THE POOL IS A VIEW.** Everyone sworn who is not in `company` today. No third container, nothing to
  migrate, and the gate proves it both ways: bringing someone forward and sending them back changes posture
  and never membership. **Sending someone back does not unswear them.**
- **Rows are what Erik asked for**: name · what they are · families as VERBS, two to a row · level · where
  they are. ⛑ **Your verb pairs are in** (*shapes · harms · protects · knows · restores · moves · sways ·
  sustains*), and `SHAPE/HARM` never reaches a card.
- **Where they are, with the basis named** — at your side · last seen (with its date once it is a fortnight
  old) · an authored home · the band's seat · where you met. ⚠️ **NO INVENTED POSITION**: an id that resolves
  to nothing degrades to the fact that survives it, never to a slug.
- **Hands are counted and never named.** A contingent with no `npcId` reads *"4 hands — ditch crew"*.

**On his save, live:** six sworn, one here. Pell at his side (level 35, *shapes and harms*), Calvar with the
band at The Fell Pell within the day, Dara at The Crossing 34 days hubward and spinward *as of day 13*,
Fendt at the Edge District 74 days spinward. **Slice 2 is your §2/§3 — the seven mission kinds, the four
degrees, `problem` reachable for every kind, and the refusal in their own voice through `delegationRefusal`.
Nothing in it changed.**

### ⚠️ Two things I found in the data you will want to know

1. ⛔ **`contingentsOf` WAS DROPPING THE PERSON.** It normalised a contingent to `{n, quality, does, what}`
   and discarded `npcId` — so **a band built out of real people read back as anonymous bodies to every
   consumer in the game.** The first run of your roster printed *"1 hands"* six times where the Fellowship's
   six names should be. The combat maths never needed identity, which is why it survived since CCODE-279.
   `npcId` now rides through both directions.
2. **A PLACE IS THREE THINGS and the roster needs all three**: an authored location, one the fiction minted,
   or **a holding of yours**. The Fellowship's seat is `the-fell-pell` — a *holding* standing at Millbrook —
   and resolving against `locations` alone printed that slug straight at the player.

---

## §3 — SNG-542: YOU WERE RIGHT, AND YOUR OPEN QUESTION HAS AN ANSWER

⛑ **Shipped exactly as you asked.** `myQuests()` is `questsFor(character, CONTENT.quests)` and every surface
that prints a quest's words goes through it — the Quest Log, the detail panel, the codex block, the sidebar
section and its stage line, "Unstick a quest", the decision filter, both title lists, and the re-render after
a stage lands. **17 raw reads became 7 occurrences in 5 lines, and every one is prose-free**: the dev-mode
writer, a Set of ids, two lookups by `arcId`. §189 ratchets that number DOWN-only, and a second check fails
any *line* that both reaches the raw record and names a prose field — the pattern a count alone would miss.

**On his screen now**, where it said `resolve`: *"Start at the silent graze above the keeper's holding. Use
Deathsense or Order-Sense on the stag — it is past dying-right, and you need to see HOW before you can end
it."* The word `resolve` appears zero times on the page.

⛔ **AND YOUR ONE OPEN QUESTION — IT WAS NOT THE GM.** `the-stag-that-wont-die` carries `startedWorldDay: 26`
and `startedAt: 2026-07-26`. It was written from the **authored** def, before that def had stage prose.
`structuredQuestRecord` copies `{id, objective, condition, change}` per stage; all four were `undefined`, and
`JSON.stringify` drops them. **That is how a save comes to hold `[{}, {}, {}]` — not a bad writer, a def with
arity and nothing in it.**

⛑ **So I closed it where it opens, for your reason and not mine**: `isRealQuest` now requires every stage to
carry an id or an objective, so a hollow def is refused at the door rather than writing blanks a reader has
to hide. **Your sentence is the one that decided it** — covering it with `hydrateQuest` is fine today and
worthless the day that content is retired, when *"the snapshot IS the answer"* and the answer is `{}`.
⚠️ Measured before tightening: **0 of 54 authored stages are hollow** and both personal-arc builders always
write an id and an objective, so it refuses nothing that exists. **And the records are NOT repaired, per your
§5.3.**

---

## §4 — YOUR TWO CONTENT RULINGS, SHIPPED (v1.9.466)

**The five damage types — you were right and the diagnosis was the better half.** *"Two sources of truth, and
the gate was pointed at the narrower one."* `damageTypeReport` now admits a type **either** canon declares,
and the five are listed in `damage_types.json` with `what` **carried from the family canon** — Erik's
2026-08-24 ruling for physics, siblings-not-opposites for elemental, requires-a-will for intrinsic.

⚠️ **I DID NOT WRITE THEIR WARDS.** A ward is the half the typed-soak build will read, and an invented one is
a rule nobody ruled. **`wardedBy` is absent on all five and the gate reads the absence** — it names them
every run as *"5 declared type(s) with NO WARD written"*. ⛔ **That note is the one left to close and it is
yours**: SNG-512's defect was typed attacks that nothing answers, and five of eighteen types are still in
exactly that state. The sixth-new-type red stays, as you ruled, and §185 now proves the both-canons rule on a
fixture rather than on the live files — the live enum lists all five, so asserting against it would pass for
the wrong reason the day either canon narrows.

**`energy_costs` `n` counts — dropped, not restamped**, all 15. And the gate inverted the way your reason
implies: it no longer asks whether the copy is stale (it always goes stale) but **whether a copy exists**. The
live count is derived at read: T1 166 · T2 121 · T3 68 · T4 48 · T5 35. `median` and `band` stay, because
those are the authored structure the file exists to state.

⚠️ **ONE THING I DID ON YOUR RULING AND NOT YOUR INSTRUCTION, so say the word and it goes back:** I dropped
the 12 stored `n` counts from `damage_types.json` too. Same field, same defect, same author — and content_ci
prints the live count beside every type every run. **It is your file; I will restore them if you want them.**

---

## §5 — WHAT I OWE YOU NEXT, IN ORDER

1. ⬜ **The holdings feature-reader table** — every feature kind against the engine function that reads it,
   and the ones with no reader named, §182-style. **You bet on the record that yield and raid are most of it;
   I will measure it and print the table whichever way it falls.**
2. ⬜ **The world drift census**, to Erik's ruling and your shape constraint: *"the census must fail when a
   diff is UNEXPLAINED, not when a diff exists."* This retires SNG-391's byte-identity gate and, with it, the
   four reds that have been reporting your two ports and the Mountain Pass as a broken build. **Your six river
   names come back to you the moment it lands.**
3. ⬜ **SNG-541 slice 2** — the missions, from your §2/§3 unchanged.
4. ⬜ **`mechanic_effects`**: the six built-since flags are mine to restamp, and `TEMP_SOAK` / `SENSE_SLOT`
   get built or renamed with the answer in the note.

**And one small one back to you:** the five wards above are the highest-value thing on your list from where I
sit — they make 18 typed attacks mean something the day they land, and the gate is already waiting to go
quiet.

— CCode
