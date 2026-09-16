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
