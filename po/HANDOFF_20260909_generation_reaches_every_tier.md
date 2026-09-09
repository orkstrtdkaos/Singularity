# HANDOFF — generation reaches every tier: what shipped, what Erik ruled, and the one thing that is yours

**From:** CCode · **2026-09-09** · **To:** Aevi
> ⚠️ **You are mid-flight on the power-source map and the skill-success spec. This is written so you can read
> §1 alone and put it down.** Everything after it is reference for when you surface.

---

## §1 — ⬜ THE ONLY THING THAT NEEDS YOU: SEVENTEEN REGIONS, ONE FIELD EACH

⛔ **Erik: *"the Valley is just a region — so npcs minted there would need to get their domains from the
nearest foothills or poles (by distance) unless the story narratively gives them a hook."***

⚑ **The mechanism is mine and I will build it. But I measured what it would DO first, and it does not work
the way the sentence imagines — for a content reason, not a code one.**

> ⛔ **`readDomains` falls back to the REGION'S HOME TRADITION, and 17 of 38 regions do not have one.
> TWELVE OF THE SEVENTEEN ARE THE FOOTHILLS.**

⚠️ **So "the nearest foothills" have nothing to lend.** ⛑ **Measured, nearest anchor by great-circle
distance:**

| | |
|---|---|
| median orphan → nearest region WITH a tradition | ⛔ **34.3°** |
| within 10° | only **7 of 50** locations reached |
| within 30° | **19 of 50** |
| Millbrook → `rootkin` | ⚠️ **45.7° away, via the Greenward** |
| the Crossing → `somatic` | ⚠️ **52.0° away** |

➡️ ⛔ **A quarter of the world is not "the nearest foothills".** ⚑ **Give the twelve foothills a home
tradition and the distance rule becomes the short, sensible thing Erik is describing.** ⬜ **The other five
are `valley`, `the_center`, `the_echo_vale`, `manifest_domain`, `unspooling`.**

⚠️ **THIS IS THE SAME LOOSE END THE FOOTHILLS SPLIT LEFT.** When the twelve were split out they inherited
the parent's nanite, density and biome, flagged in the file as *"the split relabels ground, it does not move
it, and differentiating them is Aevi's call to make rather than one she has to discover."* ⛑ **This is that
call, one field wide.**

**Nothing is blocked on it.** I will ship the distance fallback with a distance cap either way; it simply
reaches further than anyone would like until those fields exist.

---

## §2 — ⛑ ERIK'S THREE RULINGS, AND WHERE EACH ONE LANDED

### ⚑ 1 · Q3 — *"we need a plausible path to mint"*

> **Erik:** *"so we might need to add the player's narrative — if the story is leading up to a big force
> behind the events… that could be one element that would lead to a mythic mint."*

⛔ **This is a FIFTH evidence source and it is the one that makes a mythic reachable at all.** ⚑ **And the
engine already has the signal: a GREATER ARC'S STAGE.**

| | |
|---|---|
| ✅ **6 greater arcs**, each with `currentStage` and 3–4 `stages` | `worldtick.arcStageNow` owns the live value |
| ✅ **`wake.js` ALREADY passes `arcPressure` into the generate hooks** | so a person born out of a wake arrives carrying the story that made them |
| ⛑ **arcs SEED at stage 1 in content and RISE with play** | ⚠️ **I first wrote "all six sit at stage 1" here and that was wrong** — I read `currentStage` out of CONTENT, which is the authored seed. `arcStageNow` is `seed + the character's pushes`, and in Erik's live save **The Second Manifestation is at 4/4 advancing** and **The Bleeding Grammar at 2/3**. ⛔ So the gate is not shut — it is ALREADY OPEN on at least one arc |

⛑ **AND IT IS THE SAME THRESHOLD R41 ALREADY USES.** A Sovereign arrives *diminished* at stage 3 and *final*
at stage 4. ⚑ **So "the story is building toward a big force" and "a Sovereign is close enough to arrive"
become ONE measurement rather than two opinions** — and `arc_the_disagreement`, scale **cosmic**, is the arc
both Precursor doors join.

➡️ ⬜ **What I need from you, when you surface: what counts as "leading up to".** My proposal is *an arc at
or past its second-to-last stage*, because that is R41's own line and a second threshold would drift from it.

### ⚑ 2 · domains by distance — §1 above

### ✅ 3 · The Hollow King — ⛔ **YOU ALREADY DID IT, AND I REPORTED STALE**

> **Erik:** *"The Hollow King needs a sheet… and I thought he'd be higher than epic, but perhaps not."*

⛑ **He is right, and you got there first.** `the_hollow_king` is **mythic, L85, R41 `forms`, 23 abilities,
82 craft rows** — and *"NO harm craft at all; never fought head-on, outlasted or out-wanted"* is a better
answer than the one I would have given.

⛔ **AND I OWE YOU A CORRECTION.** I measured him at `epic` with **zero** crafts, flagged it to Erik as an
open gap — and **kept repeating it in two later reports after you had already fixed it at 22:31.** ⚠️ **I
carried a measurement forward instead of re-taking it, which is the specific mistake I have spent two days
writing gates against.**

⬜ **One observation, not a request:** his three harm verbs being *"someone else's hand"* means
`personOpponentFor` gives him a body with **no harm verb of his own**. ⚑ **That reads as correct for him** —
he never takes; he is given — **and it is worth knowing that the fight path will hand a player a Sovereign
who cannot strike them directly.** That is a feature if it is intended, and it looks intended.

---

## §3 — ✅ WHAT SHIPPED, SO YOU CAN RELY ON IT

| | |
|---|---|
| ⛑ **`docs/NPC_PIPELINE.md`** | **the seven doors a person passes to become playable, DRIVEN** — every row calls the production function, gated by `npc_pipeline --check` |
| ⛔ **the `ceiling: heroic` dial is RETIRED** | your SPEC §5 was right that it was mine to retire. §148 asserts the PROPERTY now (*a role string alone never reaches above heroic*), not the dial |
| ⚑ **`tierNow` on the sheet** | **the rung a level has REACHED.** Deeds already carried a generated nobody to L40/60/85 — the epic, legendary and mythic floors — while every label said `notable`. The ladder always reached the top; nothing read it back |
| ✅ **the rarity draw** | `tier_rarity.json` — **one ratio (0.667, Erik's "gentler than halving")** and every share derived from it. A rung's weight is its DEFICIT, so the generator pours into the empty rungs |
| ✅ **Erik's floor** | `rarityFloor: 0.5` — *"it can be half of the goal, but i don't want a 0 chance"*. An over-filled rung is **rare, never impossible**, so the world can rebalance instead of being walled |
| ✅ **the evidence ladder (§2.2)** | four sources, **one rung each**: none → heroic · one → epic · two → legendary · three → mythic |
| ✅ **the draw reaches the MINT** | `generate('npc')` now draws a rung with a receipt (`_gen.tierDraw`). Before this it was a mechanism with no consumer |
| ✅ **four mythicals built from your prose** | Lucifer + Akinetos, Kenosis, Parakletos |

### ⚠️ AND ONE OF YOUR FOUR EVIDENCE SOURCES WAS NOT WHERE THE SPEC LOOKED

| your source | measured |
|---|---|
| ✅ arc involvement | `arcAffinity` on **58** records + **11** hinge ids — plentiful |
| ✅ **authored renown** | **4 records**, and ⛔ **you were exactly right that nothing read it.** This is its first consumer, ever |
| ⛔ **"the region's own band"** | ⚠️ **REGIONS CARRY NO BAND.** Only elevation, terrain, water, palette, features. ⛑ **The field is `dangerLevel` on the LOCATION** — 127 of 135, 0–5, **the Maw is 5 and Millbrook is 1**. Your instinct was right one level down |
| ✅ `figureCareer` deeds | **runtime** state, so 0 records carry it and that is correct — the only source that is **earned** rather than born with |

---

## §4 — ⛔ THE MYTHICALS, BUILT FROM YOUR PROSE

⚠️ **Erik: *"I thought there are some mythics authored."*** ⛑ **He was right and I had said otherwise — I
grepped `tier: "mythic"` over the npc map, found none, and reported zero.** ⛔ **That is the same
wrong-shaped search you made and wrote up a day earlier**, in `SPEC_one_roster_and_the_mythicals` §1, which I
had read: *"THE MYTHICALS ARE AUTHORED — IN PROSE, WITH NO RECORD TO CARRY A TIER."*

**So they have rows now, transcribed from your two lore files, nothing invented:**

| | |
|---|---|
| ⚑ **Lucifer** | the Light seat. **Carries R41 `forms`** — diminished at stage 3 (L45), final at stage 4 (L85) — **the first content that field has ever had**, and a null `arcId` because a Sovereign with no arc has no arrival |
| ⛔ **Akinetos · Kenosis · Parakletos** | **`notAnOpponent: true`, on your prose's own authority** — *"Appears? No, and its absence is the content"* · *"dead… there is no resurrection in this"* · *"it cannot appear as a figure — it appears as ANSWERING"* |

⛑ **Driven through all seven doors:** Lucifer fields **18 craft rows** and a real body; the Three field
nothing and `personOpponentFor` returns **null** for each — **the declaration working, not a gap.**

⚠️ **Where your prose is silent the field is ABSENT, not guessed** — Lucifer has no tertiary domain and no
arc, because *"six seats… should be filled slowly and separately"* is an instruction about exactly that.
⬜ **I authored the records. Every word of the character is yours, and all of it is quoted rather than
paraphrased.**

⚑ **The correction propagated where it mattered:** with mythic at 0 the draw offered them at **3.7%**; with
four in the world it offers **1.9%**. **The census was blind at the top and is not any more.**

---

## §5 — ⬜ WHERE THE MYTHIC GATE STANDS, MEASURED FROM TWO DIRECTIONS

⛔ **Both are shut today, and NEITHER is a rule forbidding anything:**

| | |
|---|---|
| **evidence** | corpus distribution `{0 sources: 70 · 1: 55 · 2: 15}` — ⛔ **not one record carries THREE**, and three is what a mythic draw needs |
| **arc hinges** | **0 of 20** hinge slots vacant — no arc is waiting for a mythic to fill it |

➡️ ⚑ **That is Erik's *"rare, not never"* as arithmetic.** ⛑ **And his narrative source is precisely what
would open it: an arc reaching its late stages is a third kind of evidence, and it arrives exactly when the
story has earned it.**

---

## §6 — ⚠️ TWO CORRECTIONS I OWE, BOTH THE SAME SHAPE

⛔ **I reported the Hollow King as broken after you had fixed him** (§2.3).

⛔ **And my own pipeline doc caught its own generator lying.** I reported *"the generated path fields no
kit"* after driving `stubEntity → enforceFloors` and stopping — **the real mint path also runs
`affiliationFor`**, which I had not called. ⚠️ **Driving a PARTIAL path and calling it the production path is
the exact defect that file exists to catch.**

⛑ **What is actually true is §1: door 5 is uneven BY PLACE.** The same minted person fields **7 craft rows
in the Maw and 0 in Millbrook** — not a missing mechanism, a missing home tradition on the ground players
actually walk.

⬜ **Both are the same mistake: carrying a measurement forward instead of re-taking it.** ⚑ **It is why
everything in §3 is gated by a call to the production function rather than by a number in a document —
including this document's own claims.**

---

## §7 — ⬜ ERIK WANTS ARC WORK SPEC'D, AND IT IS YOURS: **REGIONAL AND LOCAL ARCS**

> **Erik, 2026-09-09:** *"Let's have Aevi spec some Arc work. I want regional and local arcs as well."*

⛑ **Measured, so the ask starts from the shape rather than a guess:**

| | |
|---|---|
| **arcs today** | ⛔ **6** — `world` 3 · `cosmic` 1 · `regional` 2 · ⛔ **`local` ZERO** |
| **regions any arc touches** | ⚠️ **15 of 38** — over half the map is in no arc's `crossesRegions` |
| **arcs naming a LOCATION** | ⛔ **0.** The field does not exist; an arc reaches a region and stops |
| stages per arc | 3–4 |

### ⚑ WHY THIS IS NOW LOAD-BEARING RATHER THAN FLAVOUR

⛔ **The arc stage is about to be the fifth evidence source (§2.1), so an arc is no longer only a story — it
is the thing that decides what the world may MINT.** ➡️ ⚠️ **With 6 arcs, all of them world-or-regional, the
only narrative that can ever justify a great figure is a world-scale one.** ⛑ **A LOCAL arc is what lets a
valley town earn a heroic without the cosmos having to move.**

⬜ **Three things only you can settle, and I have deliberately not guessed at any:**

1. ⚑ **What is a LOCAL arc?** One location, or a settlement and its ground? ⚠️ **`crossesRegions` is the
   only reach an arc has today — a local one needs a narrower field, and naming it is authoring.**
2. ⛔ **Does a local arc push tier at all?** A regional arc reaching its last stage is a plausible reason for
   a heroic; ⚠️ **it should probably NOT be a reason for a legendary, or the ladder collapses.** **Which
   scales license which rungs is a design call, not arithmetic.**
3. ⬜ **How many, and where?** **23 of 38 regions are in no arc at all.** Whether that is a gap or a
   deliberate quiet is yours — ⛑ **a world where everywhere has an arc is a world with no quiet ground.**

⚠️ **AND ONE MEASUREMENT THAT WILL MATTER TO THE SPEC:** ⛔ **the live stage is not the authored one.**
`arcStageNow` = **the content seed PLUS the character's pushes**, so every arc ships at stage 1 and RISES in
play. ⛑ **In Erik's save The Second Manifestation already stands at 4/4.** ➡️ **So a spec that says "an arc
at stage 3 does X" is describing something that has already happened to at least one player** — the numbers
in `greater_arcs.json` are a starting line, not a state.

---

## §8 — ✅ THE DISTANCE RULE IS BUILT (2026-09-09), AND IT SHIPPED WITH THE FIELD YOU FILL

⛑ **Erik's rule works, driven through the mint:**

| minted in | takes | from | craft rows |
|---|---|---|---|
| **Millbrook** | `rootkin` | ⚠️ **45.7° away** | **3** |
| **the Crossing** | `somatic` | ⚠️ **52.0° away** | **4** |
| the Maw | `abyssal` | ✅ its own region | **7** |

### ⛔ AND THE FIELD IS YOURS: `homeTradition`, ONE PER REGION

⚠️ **Until now the region→tradition map lived on the TRADITION (`traditions[].region`), which CANNOT serve
twelve foothills — a tradition names one region.** ⛑ **A region may now name its own `homeTradition`:
many-to-one, additive, and read FIRST.** ⬜ **Every region without one answers exactly as before, so nothing
you have already authored changes.** It goes in `rules/regions.json`, beside the region.

### ⚠️ THE CAP IS 60° AND THAT NUMBER IS A SYMPTOM, NOT A DESIGN

⛔ **I set it to 45 first and measured what that does: Millbrook gets NOTHING** (its nearest anchor is
45.7°) **and neither does the Crossing** (52°) — ⚠️ **the two places play actually happens in.** ⛑ **At 60 all
fifty orphaned locations are reached.**

➡️ ⚑ **Fill the foothills and this number should come DOWN.** **A craft borrowed from a third of a world
away is a stopgap, not a rule** — and the dial says so in its own note, so whoever lowers it will know why it
was ever this large.

⬜ **Marked `domainsSource: "nearest"`, one rung BELOW `derived`,** with `domainsVia: {location, degrees}` —
a borrowed craft says *"the closest people who practise anything practise this"*, which is a fine start for
a GM and poor evidence for standing credit. **The provenance ladder already weighs `derived` at half; this
is the rung under it.**

⚠️ **One thing found on the way that would have bitten anyone:** `rules/regions.json` was loaded as
`regionsDoc.regions` and **the sibling keys were thrown away one character before they were read** — a dial
could be authored, registered, loaded and dropped. **The whole doc is attached now (`CONTENT.regionRules`),
so the next dial you put beside `regions` will actually arrive.**
