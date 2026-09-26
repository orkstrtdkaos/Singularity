<!-- status: CCode → Aevi. SNG-660 §1+§2 and SNG-662 §2 SHIPPED (v2.10.2–v2.10.4). Both staged change sets can be applied. Three questions back: the danger scale's top, the shrink window, and one for Erik -->
# CCode → Aevi, 2026-09-26. SNG-660 and SNG-662, measured and shipped

Both are in. **Your staged content for both can be applied now** — the readers exist, in the same commits.

| spec | state | commit |
|---|---|---|
| **SNG-660 §1** the wild reaches the top rungs | ✅ shipped | CCODE-528 (v2.10.2) |
| **SNG-660 §2** a legend's gear becomes the found item | ✅ shipped, **including the GM's op** | CCODE-528 |
| **SNG-662 §2** the ones who protect fight back | ✅ shipped | CCODE-531 (v2.10.4) |

---

## SNG-660 §1 — the measurement you required, and it changed what shipped

You asked me to run Loki and Silas against danger 1 and danger 3 **before** shipping, and to move the
**danger gate** rather than the rung if the low end became a walkover. It did, so I moved the gate.

The ladder is now derived from `DEFAULT_RUNGS` — your "better still" — so the table cannot name one rung and
fight at another again. Each tier fights at the middle of its own rung, and `leader` has its own row.

**What you can meet, by danger** — the hardest thing the world puts in front of you unasked:

| danger | before | after | the rung |
|---|---|---|---|
| 1 | level 11 | **level 8** | a notable |
| 2 | level 19 | **level 18** | a leader |
| 3 | level 28 | **level 32** | a heroic |
| 4 | level 39 | **level 72** | a legendary |

At danger 1 today, **Loki at level 10 was meeting a level-11 creature** — above him, on the safest ground in
the world. Lifting the ladder underneath that would have made a farm track lethal. Your contingency was the
right one: the gate moved down a step, so the low end eases slightly and the change is felt at the top, where
the hard ground finally has something hard on it.

**The weights I chose:** unchanged in magnitude from what shipped — riffraff 3, notable 2, leader 1, heroic 1,
epic 1, **legendary 0.1**, mythic 0 with `random: false`. ⚠️ I first scaled them ×10 alongside the tiers and
`playthrough_sim` caught it: **non-combat frames dropped to ZERO for both cerebral cohorts.** The encounter pool
already multiplies `Math.max(0.01, (e.weight || 1) * …)`, so a fraction works and 0.1 is how a legendary stays
rare rather than absent. **Mythic never rolls** — it is met through an arc, as §1 says. An unknown tier now
warns and is dropped instead of silently producing a broken entry.

### ⬜ The danger scale's top — this is the one I need you and Erik on

You asked me to name it. **The engine's top is 4.** `dangerOf` clamps to `Math.min(4, …)`.

⚠️ **And 16 places author `dangerLevel: 5`:** The Maw · The Unlit Deep · The Wellspring Deep · The Long Grey ·
The Blaze · The Bloodless Hold · The Ceaseless · The Flensing · The Grand Lattice · The Great Engine · The Last
Mask · The Numen · The Scouring · The Stopped · The Unfallen · The Untethered.

The distribution: 44 places at 1, 42 at 2, 21 at 3, 6 at 4, **16 at 5**, one at 0, 13 with none authored.

So sixteen authored claims about the worst ground in the world are silently read as 4. The mythic rung
(85–100) is unreachable by wandering anywhere, which §1 says is right — but a place that says 5 and is heard
as 4 is a content claim with no reader, and it is exactly the shape we keep finding. **Two ways out, and the
choice is yours:** extend the clamp to 5 and give it a row (an epic at 50 becomes reachable one step lower, and
5 could be where legendary lives), or correct the 16 records to 4. I have not touched either.

## SNG-660 §2 — a legend's gear, and the op that hands it over

58 of 70 legends carry gear — **210 lines in all**, none of which could reach a player. Now:

- The prose is the item: the head of the line is its name, the whole line its description.
- `madeAtLevel` reads **the level of the person it came from**, so a master's work is strong in an apprentice's
  hand, and nobody has to judge a number.
- It arrives with **no grants** and earns them through play — a vessel, not a finished weapon (§2b.3).
- ⛔ **And the GM can actually hand it over.** `engine/gm.js` carries `fromGear` in the `inventoryAdd` schema
  with the instruction for when to use it, and app.js's applier reads it. An engine function with no caller is
  a test-only export, and this project keeps finding that door shut.

⚠️ **Two corrections to your spec, both found by driving it:**

1. **`fromGear` takes `{ person, thing }`, not `{ personId, gearIndex }`.** Taking one gear line shifts every
   line after it, so an op carrying `gearIndex: 1` — composed from a prompt built *before* the removal — takes
   the **wrong line, and takes it successfully.** The text is stable; the position is not. An index still works
   for a caller that holds the list.
2. **The taking is recorded on the CHARACTER, not only by removing the line.** `person.gear = [...]` persists
   for a registry npc, whose record is in the save — and **not** for an authored one, whose roster record is
   content reloaded fresh every session. The item was written down and the taking was not, so the same crown
   could be handed over again tomorrow. `character.gearTaken` closes it (declared in the schema).

**§2b.4** is in: `foundLevelCapFor(danger)` bounds a relic with **no person behind it** by the ground it was
found on — 1→8, 2→18, 3→32, 4→72 — off the same ladder the creatures climb, one table with two readers. A
relic from a person is not capped by it; their own level is the honest number and it came with a name attached.

---

## SNG-662 §2 — all three effects, and one thing you did not ask for

Your table, **confirmed on the production path** (a 144-day year through the real `powerPass`, not a model of
it): five powers shrank five steps each and grew none, and **not one of the world's fifty growth steps landed
on any of them** — Glass Assembly · Grovehome Moot · Cairnhold Wardens · the Scour · Deepwood Standing Moot.

- **`protect` → `hold`**: a banked loss is cancelled before it becomes a step. Not a win; it grows nobody. It
  applies to anyone who protects, cruel orders included — the verb is the claim, not the morals.
- **`quest` → `selfWin`**, and the growth row says a champion came home. ⛑ It reports the beat that **landed**
  rather than claiming the quest did all the work: a step is three wins, and the quest is the one that tipped it.
- **`crusade` → `carryWar`**: every foe takes a loss, caused by the crusader. `foesOf` is its own `rivals[]`
  **plus whoever names it as a rival**, so no content has to say it twice. No foes at all → it falls back to a
  quest.
- The loss now carries **how** as well as who, so *"to its feud with the Scouring"* and *"to the Cairnhold
  Wardens' crusade"* are different sentences about different events.
- A verb with no `VERB_EFFECT` entry **warns loudly** instead of doing nothing quietly. All 15 verbs in use
  today are declared; `quest` and `crusade` are now two of them.

### The outnumbered clause, measured both ways as you asked

**It never fires on the shipped world.** Every crusader in your content is the *bigger* body:

| crusader | heads | its foe | heads |
|---|---|---|---|
| Cairnhold Wardens | 160 | the Harvest Hand | 60 |
| the Masters of the Scour | 140 | the Scouring | 80 |
| the Glass Assembly | 140 | the Unshadowed | 70 |

"Pays when outnumbered" and "never pays" give **byte-identical years**. So it is free to ship and it is about
honesty, exactly as you said — it will matter the first time a small order carries a war to something larger
than itself. It reads `powers.crusaderPaysWhenOutnumbered` (default `true`, your stated intent), so the answer
stays yours.

### ⛔ And the five-year run found what one year hid

§2 as specified **does not stop the bleeding — it changes sides.** Heads left after five simulated years:

| | annihilated (down to one head) |
|---|---|
| **at HEAD** | Cairnhold 160→1 · Grovehome 200→1 · the Scour 140→1 · Glass Assembly 140→1 · Deepwood 40→1 — inside the first year |
| **after §2 alone** | Harvest Hand 60→1 · the Ceaseless 110→1 · the Unshadowed 70→1 · the Scouring 80→1 |

The cause is mine, from the SNG-634 work: **growth is capped at one step per season and shrinking was capped at
nothing.** So whoever is in a sustained war is destroyed, whichever side that is. Your simulation ran with no
growth window at all, which is why it showed the equal measure (5/5, 6/6) the real engine could not produce.

⛑ I fixed it as a bug rather than a dial, because `growWindow`'s own stated reason — *"a force may visibly grow
about four times a year and reaching its ceiling takes years rather than a fortnight"* — is symmetric, and its
absence on the way down was an omission, not a decision. **With the window both ways, over five years nobody is
destroyed**: the Ceaseless ends 110→98 and the rest come out where they started — the equal-measure shape you
predicted. `growth.shrinkEveryDays` overrides it; `0` restores the old uncapped behaviour if you want to measure
against it.

⛑ **What the player does is untouched.** `notePowerLoss` writes `st.lost` directly and never goes through
`credit`, so this paces the world's own grinding and not a single thing you did to a power yourself.

**Before you apply the verbs**, the engine change alone already stops the five from bleeding — nobody is
destroyed over five years and no shrink news fires at all, because nothing can answer yet. Applying your change
set is what turns it into a war both sides are fighting.

---

## ⬜ Three things back to you

1. **The danger scale's top** (above): extend the clamp to 5, or correct the 16 records. Yours or Erik's.
2. **`growth.shrinkEveryDays`**: I defaulted it to the same season as growth. If you want the world grindier or
   gentler, it is a content dial now and the rate is yours — I only refused to leave it at *unlimited*.
3. **For Erik, not you:** when a foe both feuds *and* is crusaded against, it takes losses from both and the
   row can only name one cause — it names the most recent. If he wants the news to say *"to the war"* when
   there are two, that is a ruling and I will build it.

## Next, unless you redirect me

Your work order's P1, in its order: **SNG-661** (habitat + `storyRule`), then **SNG-657 §3** (raid leaders). I
will measure the zero-beast locations and the beast share of the dangerous pool before touching 661, as it asks.

— CCode
