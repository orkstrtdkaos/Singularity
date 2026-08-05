# CATCH-UP FOR AEVI — you are 35 entries behind, and five things are waiting on you

**From CCode, 2026-08-05, v1.9.30.** You last saw **CCODE-121**. The log is at **CCODE-156**.

⚠️ **Do not read all 35.** Most of it is engine work that does not change what you author. This is the part
that does. Read §1 (what I need), then §2 (what changed under you), then only the entries §3 names.

---

## 1. WHAT I NEED YOU TO AUTHOR — five gaps, each blocking something built and waiting

Every one of these is **engine-complete and content-starved**: the code is written, gated, and shipping, and
it is doing nothing (or doing something flat) because the content it reads does not exist yet. Numbers are
from `npm run coverage` and a direct probe, both run 2026-08-05.

### ⚠️ 1a. `aggressorKind` on encounters and bestiary — **0/19 and 0/7** (newest, CCODE-156)

Erik: *"make sure all the encounters could get you killed… you were slain by an assassin."*

A player who goes down now gets an OUTCOME — revived by a named companion · spared · left for dead with half
their gear gone · **slain**, entering the same death ladder every figure is on. Which outcome is likely
depends on **who put them there**:

| `aggressorKind` | what it means | slain weight |
|---|---|---|
| `beast` | it mauls you and moves on | 2 |
| `duelist` | they came to win, and won | 1 |
| `raider` | they came for what you carry | 2 |
| `assassin` | **finishing you was the errand** | 8 |
| `hazard` | a cliff has no intent at all | 3 |

**Nothing in content declares it**, so every aggressor currently falls to `_default` (weight 2). An assassin
does not yet read as an assassin. Add `"aggressorKind": "…"` to encounter defs and bestiary entries.

⛔ **INTENT, NOT MORALITY.** This is SNG-280 territory and I want to be explicit: a heroic duelist and an
abyssal one take the **same** tag, because a duel is a duel. The tag describes *what they came to do*, never
what kind of person they are.

### ⚠️ 1b. `strikes.byTradition` and `strikes.kindByTradition` — **0 and 0** (CCODE-150)

Your third-action spec has both kinds built: the **quiet work** (pays in EXPOSURE — a failed strike identifies
you) and the **crusade** (pays in COMMITMENT — every other front abandoned for the duration). Measured over
4 worlds × 4 world-years: **910 strikes, 0 crusades.** The declared kind is unreachable because no tradition
is named as a crusader.

Your own spec proposes umbral · veilwright · abyssal · ashwarden for the quiet work and blazeborn · seraphic ·
verist · marcher for the crusade. **I did not author it, deliberately** — deciding which people knife and
which declare is a characterisation judgement about a whole tradition, and an engine that hardcoded those
lists would be encoding exactly what SNG-280 forbids.

Both tables live in `content/packs/core/rules/arc_response.json` under `strikes`, with the dials beside them.

### ⚠️ 1c. `homeLocation` on the roster — **5/66**, and only 1 of 6 values resolves to a real location

Erik: *"they come from the home places and they will go back there when they can."*

Every figure the world mints from a death now carries a `homeland`, and the origin line says it — *"of the
ashwarden; survived the fighting that killed Sister Alder"*, *"sent by the redline to take up what Halvex Coil
left unfinished."* But **tradition is standing in for home**, because `homeLocation` is authored on five
figures. It is the right key and it is nearly empty.

**The precise ask: `homeLocation` on the 61 roster figures that lack it, resolving to one of the 96 authored
locations.** The whole going-home half of Erik's ask waits on this one field.

### ⚠️ 1d. `goods` category on items — **0/30** (CCODE-148, still open)

You authored 12 goods categories and need/scarcity for all 25 regions, richly, including the dead lists.
**Nothing maps an item into a category**, so `regionDemand` finds nothing for every item in the game and both
axes fall back to `ordinary`: a Traveler's Pack is 4 in the Crossing and 4 in the Quickwood.

The prices are not wrong — that is the band doing its job — they are just not **local**, which is the entire
point of a two-axis model. **The moment items carry `goods`, every region table you wrote goes live with no
engine change.**

### 1e. `rules.threat` — **unauthored** (CCODE-52, the oldest one still open)

The threat ladder. Lowest priority of the five; noted so it does not vanish.

**Already closed, thank you:** `bonusTags` 30/30 · `kind` 30/30 (shields landed) · `personalVerbs` 66/66 ·
`offscreenVerbs` 66/66 · `arcAffinities` 66/66 · `wantArcId` 66/66 · `tradition` 66/66.
*(`interests` and `kin` read 0/66 and that is FINE — they are alternates for the same reader and
`personalVerbs` satisfies it fully. Not a gap. I called it one once and was wrong.)*

---

## 2. WHAT CHANGED UNDER YOU — read before you author

### ⚠️ 2a. YOUR ENGAGEMENT PROPOSAL IS HALF-LANDED, AND THE HALF THAT LANDED USED YOUR VERSION

`heldTheLine` is **built** (CCODE-151) and it closes the gap you diagnosed. Measured: mean rise rate is 58%
for traditions that seek fights and 56% for those that rarely do — against SNG-300's marcher 50% / stillhold
8%. **Stillhold went 8% → 58%.**

⚠️ **And your spec beat mine.** You wrote *"crossing 5 consecutive passes credits `heldTheLine`."* I read that
as too weak, built it to pay every 5 passes, and measured both: repeating made `heldTheLine` **41% of all deed
credits** (against `arcContestWon`'s 11%) and pushed every tradition to a 78% rise rate, because a 185-pass
hold pays 37 times. Your one-shot closes the same gap at **2%**. The default is what you wrote; `deedRepeats`
is the dial.

**`resolutionMode` and the revised `engages` table are NOT built** — they are staged, and they are yours and
Erik's to ratify. Two things before you do:

1. ⚠️ **Raising the floor to 0.9–1.3 will invalidate a number I published.** CCODE-150 reports that moving the
   striker to the working pool took low-engagement traditions from 42% → 69.2% of the striker pool. **That was
   measured against the OLD numbers**, where stillhold sat at 0.15. Re-run `node tests/strike_mix.mjs` after
   the new table lands.
2. ⛔ **`removal` and the `strikes` disposition are the same thing.** Your `resolutionMode: removal` (umbral ·
   veilwright · horizon) and the `strikes` disposition I built for 1b are describing one behaviour. **Removal
   *is* striking.** Two dials for one behaviour is how a mechanic ends up half-wired to each. Worth collapsing
   before either is authored — your call which name survives.

### 2b. HOW TO WIRE A NEW RULES FILE — written down, and one step is now machine-checked

**SYSTEM_SPEC §4e.** The same six lines of content wiring failed three separate ways: not registered (the
zero-XP bug), registered but never loaded (your economy — which you caught yourself with the check, in under a
minute), and **destructured from the wrong `Promise.all`**. That third one is invisible to careful reading,
because positional destructuring pairs names to entries by *counting*. `tests/wiring_shape.mjs` now asserts
the counts match. The procedure is six steps; step 6 is the one that matters — **gate the behaviour, never the
presence.** A check that a key exists passes just as happily when nothing reads it.

### 2c. IT IS A WORLD ENGINE, NOT A SIM

Erik's correction, and it matters for how you think about content. `worldtick.js` runs inside a player's save
and produces **people** — named, homed, with careers and standings that outlive every pass. The harnesses
(`world_presets`, `strike_mix`, `player_lives`) produce **numbers** and write nothing. When the engine is
wrong, **canon is wrong**. SYSTEM_SPEC §4d′.

### 2d. YOUR ARC-STAGE EFFECTS ARE ALL LIVE NOW

`priceShift` had no consumer for months; `economy.js` gave it one and I then left the register saying
otherwise, so `npm run coverage` printed *"priceShift has NO consumer"* on every run for a mechanic that
worked. Fixed, and the report now derives that list instead of repeating it. **Every effect kind you have
authored has a consumer.**

### 2e. THE WORLD HAS A CEILING AND AN HONEST INFLOW NOW

Mythics were going 1.0 → 1.8 → 13.5 → 20.3 across 1/2/4/8 world-years — nothing applied pressure at the top.
Prominent figures are now **called out** between arc pushes (⛔ prominence, not merit: a mythic of the Maw and
one who has mended the same wall for forty years are challenged identically). At the authored rates, 7.3 of 27
traditions hold a living mythic, against Erik's "1/4" target of 6.8.

And the killing fields no longer *produce* population — minting is decoupled from the body count, and
everyone minted comes from somewhere.

---

## 3. THE ONLY ENTRIES WORTH READING IN FULL

| entry | why |
|---|---|
| **CCODE-156** | the incapacitation system — 1a lives here |
| **CCODE-151** | `heldTheLine`, and why your version beat mine |
| **CCODE-150** | the third-action reconcile — 1b lives here |
| **CCODE-149** | the wiring procedure (§4e) |
| **CCODE-153** | where minted people come from — 1c lives here |
| **CCODE-147** | ⚠️ **a correction owed to you**: I claimed for four turns that the personal-life content was unauthored. It was authored, and had been live the whole time. Erik caught it. |

Everything else is engine mechanics that do not change what you write.

---

## 4. HOW TO NOT FALL BEHIND AGAIN

The log grew 35 entries while you were working, and nothing told you. Three commands answer "what is the state
of my content" without reading any of it:

```bash
npm run coverage
```

*is it authored yet?* — every field the engine reads from authored content, with a count and a date. This is
the file that would have told you `bonusTags` was at 27/30 and is now at 30/30, without asking anyone.

```bash
node tests/verification_ledger.mjs
```

*what is claimed, and does it hold?* — 43 requirements, 220 gates, each tied to the words Erik or you asked in.

```bash
node tests/world_presets.mjs presets
```

*what does the world actually do?* — six preset characters as populations, with the spread across worlds.
