<!-- status: FOR CCODE (two asks) and ERIK (one ruling recorded). Five places authored; the four unplaced heroes now stand somewhere. -->
# NOTE: Aevi → CCode, Erik · Five places, and the heroes who had nowhere to stand

**Aevi (PO) · 2026-10-07.** In the films, four of the people named had no place to be framed on. Their homes were a
region or nothing:

- Orsolya → `the_palelands`;
- Urd → `the_churn`, which didn't exist;
- Cassa → `unspooling`;
- Harrow → no home at all.

The films fell back to the turning globe for each of them, as F2 says to. They have places now.

| place | tier · kind | where | who stands there |
|---|---|---|---|
| **Cairnsend** | settlement · town | the Palelands, past the Quiet Ground, two days short of the Long Grey | the Afterlings' town (`the_afterlings.md`): the Vigil, Speaker Barrowe |
| **The Last Cairn** | site of Cairnsend · shrine | 0.53° (0.9 days) past the town, at the edge of the Long Grey | **Orsolya** |
| **The Churn** | settlement · strange | the deep of the Unspooling, between Tumbledown and Spindrift | **Urd Stonefast** and the Unbought Court |
| **Loose Moorings** | settlement · harbour | the western shore of the Unspooling's gulf, which opens to the open sea | **Cassa Redsail** |
| **The Fitting House** | settlement · works | the Gearlands, five days from the Great Engine | **Harrow** |

## How they were placed

Every position was probed before it was written. I wrote a tool for it: `po/tools/probe_ground.mjs <colat> <lon>`,
which reports land or water, the biome, the region vote, the nearest places in days, the nearest water, and a small
land/water grid. All five sit on land, in the region they claim. Loose Moorings has water 0.25° to its east. Each record
carries what the probe said in `_placed_20261007`, and why the place is where it is in `_why_20261007`.

Each place has two-way roads to its neighbours:

| place | neighbours |
|---|---|
| Cairnsend | the Quiet Ground, the Long Grey |
| the Churn | Tumbledown, Spindrift |
| Loose Moorings | the Churn, Tumbledown |
| the Fitting House | the Great Engine, Pressureholt |

Parents follow the pattern already in each region:
- Cairnhold for Cairnsend;
- the Churn Edge for the Churn and the Moorings;
- Pressureholt for the Fitting House.

## In the same commit, so the gates agree

- **The census.** `ratified_census.json` goes from 96 settlements and 37 sites to **100 and 38**. Erik's words are in
  `ratifications`. The ruling was his "Proceed" to a list that named these places. **Erik, if you meant otherwise,
  this is the line to strike.**
- **The frozen world.** `node scripts/world/place_rows.mjs` added five rows and nothing else.
- **Kinds.** The five are in `location_kinds.json`, and `_counts` is updated.
- **Generated counts.** `NPC_PIPELINE.md` is regenerated, the certified counts are restamped, the header of `SYSTEM_SPEC`
  reads 163 locations, and `EXESA.md` reads "a hundred and sixty-three authored places".
- **The Last Cairn.** `the_palelands` region map had it as `namedGround`, a point 717 km out at bearing 25°. That point sat
  *inside* the tending, nearer Cairnhold than the Quiet Ground, which contradicts the Long Grey's own first line
  (*"Out past the last cairn the tending stops"*). The place now stands past the Quiet Ground, and the namedGround entry
  is retired, so there is one name and one mark.

## For CCode

- **P1 · A `figure` shot can only frame someone in `CONTENT.npcs`.** Neth, the Deep Lantern, Rethe, Kesh Ardent and
  Cinder Vael are in the films' lines. So are the Hourkeepers' and the Verists' great figures: the Clockmother and
  Seraphine the Unbending Witness. All of them are **epics** in `tradition_epics.json`, and each has a real
  `homeLocation`. None can be a `figure` shot, so their lines play over the globe.
  - **Ask:** resolve `shot.figure` against the epics as well, the way `resolveByName` already does.
  - Then I'll give each of them a figure shot in their film. G1 would fail if I authored the shots first.
- **P2 · Harrow's, Cassa's and Orsolya's homes now resolve,** so `atHome` makes them present there. That's intended, but
  it's a change in who you meet where.

## Three things I found and didn't touch

- **`waterauth.json` → `longshore.why`** says Cassa and Orrun were *"authored to `foothill_longshore` before the town had
  water"*. Cassa's record has said `unspooling` since 2026-09-08, and Longshore is about forty days from the Unspooling.
  The note is stale for her. I haven't checked it for Orrun.
- **The pole a `space_time` value names is inconsistent.** `space_time` +0.3 is written as pole **time** on the Churn Edge
  and Spindrift, which matches the first-negative, second-positive rule every other axis follows. On **Longshore** and
  the **Mountain Pass** the same positive value is written as **space**. One of the two readings is wrong, and the
  pole-intensity model reads the field. I avoided `space_time` in the five new places until it's settled.
- `PLAYERS_GUIDE.md:495` still says *"a hundred and forty authored places"*. It isn't gated. If that's your part, it's
  163 now.

— Aevi, PO
