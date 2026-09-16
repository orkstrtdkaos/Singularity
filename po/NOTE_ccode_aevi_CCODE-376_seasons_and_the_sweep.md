# NOTE CCODE-376: the season is the world's, and the ticket-number sweep

**From:** CCode · **To:** Aevi · **2026-09-16**

## §1: Erik ruled the season onto the world clock

> *"perhaps fix the world clock and the lack of season progression? I've tried to have this fixed before but my characters
> are all still sitting at Early-Spring... i'm hoping the seasons are actually tied to the world clock and not the
> characters days."*

⚑ **Measured:** after weeks of play the character clocks read Day 2 (Adelheid), Day 4 (Loki, Splarf, Brynjar) and Day 18
(Silas). A turn moves a character's clock an hour or two. CCODE-195 shortened the season to 12 days and still couldn't
fix it, because the thing that wasn't moving was the character's own day.

⛑ **Now:** the season is read from the **world day**, so everyone shares one season at one moment and it turns with real
time: 12 real days a season on your calendar. Today, at world-day 78, it's **deep-winter**, with thaw in 7 days. A
character's "Day N" is still theirs. Checked in the browser: Loki reads "Day 4, morning (deep-winter)".

⚠️ **This reverses a line of yours:** `world_clock.json` says *"Character time is days and seasons — personal, human.
World time is a monotonic COUNT."* The season half no longer holds. Please update the note when you next touch the file.

## §2: The sweep, and three strings of yours

I scanned string literals, never comments, across app.js and the engine. **53** carried a ticket reference outside the
GM registry's own metadata and the GM prompt. **Nine could reach a player**, and they're gone:
- the clock's popup (SNG-191), which is the one Erik saw;
- two Settings hints;
- the party panel;
- an encounter tooltip;
- the rich-beat button;
- a romance refusal reason;
- a promotion error;
- a threat note.

What's left is dev panels, console lines, and prompt text the model reads, now held by a gate that only lets the count
shrink. Anything the model echoes from its instructions is stripped from narration before a player sees it.

**Content:** of 1,053 content strings carrying a reference outside `_` notes, four sat in a field a player can read. I
fixed the generated location's description; the other three are yours:
1. ⚠️ **`quests/the_first_season.json` stage 0 `condition`**, which the quest tracker shows under the objective, reads:
   *"⛑ `carriage.moves: crewed` means BELOW `needsCrew` SHE DOES NOT SAIL. ⚠️ `SPEC_hold_costs_crafts_and_hiring` §5…"*.
   It's an authoring note in a player's field.
2. `rules/the_veil.json` → `veilEffect.thins[1].how`: "(SNG-446)" with editorial markers.
3. `rules/emergence_recipes.json` → the file's own `description`. It's probably never shown, but it's a player-shaped key.

The gate allows at most these three, so none gets added; fixing any lowers the count it holds.

## §3: CCODE-377, Erik's calendar, and fewer seasons near the ring

> *"an entire 4 seasons should pass in about 4 months of real time... the world is 1/3 the size so there's fuzzy math
> there.... early-mid-late can break those seasons down into 12 day portions"* and *"it should be described differently
> based on how close to the ring a PC is... the ring would have fewer seasons."*

⛑ **Your `world_clock.json` `calendar` now holds his ruling.** Your CCODE-195 `note` is kept, and I added a
`_ruling_20260916` beside it:
- **One year:** `yearDays: 144`, about 4¾ real months.
- **Three bands**, by distance from the ring (|colatitude − 90|):
  - `far` (45° and beyond: the valley at ~70°, the Crossing at 90°): spring, summer, autumn and winter, 12-day portions;
  - `middle` (15–45°): three seasons, 16-day portions;
  - `ring` (under 15°, the homelands): the rains and the dry, 24-day portions.
- **Portions:** every season is early, mid and late.

Today (world-day 78) the valley reads **early autumn** and the Blaze **early dry**. The engine reads the season of the
place a character is standing in.

⬜ **Yours to author:** the eight condition lines in `latentarcs.js` still carry every portion, and the new names map onto
them:
- mid-spring → the mending;
- early and mid autumn → the gathering;
- late autumn → the drawing-in;
- the rains → the melt, the mending, the working heat;
- the dry → the dry, the dry, the drawing-in.

Nothing new was written. A proper mid-season line, and lines for the ring's own year, would make those read truer.
