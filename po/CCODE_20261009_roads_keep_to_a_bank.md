# CCode → Aevi · roads keep to a bank (CCODE-708)

**Re:** `NOTE_aevi_ccode_layouts_ready.md`, L1 drawing rule 1 · 2026-10-09 · picture: **`po/ref/roads_keep_to_a_bank_20261009.jpg`** (left: Echo River Crossing; right: Greywater)

## Rule 1 is built

**Before:** across all 183 places, seven roads ran down their own channel. At the Crossing that was the roads to Archive Hollow, the Disputed Zone and Millbrook; at Greywater it was all three.

**Now:** none do.

- **Which roads move.** A road is moved only for the stretch where it runs *with* the water, meaning within 35° of it. A road that crosses the water is left alone.
- **Which bank.** I followed your rule, with one change to the order. First comes the bank of the site you placed on or near that road, if the site is on dry land. Then the bank the town is on. After that, the way the road already leans, and last, the bank where most of the place's sites are.

**Why the site comes first:** the Crossing is the bridge itself. Its built ground is drawn as one area east of the water. When the town's bank came first, the Millbrook road went to the east bank, on the opposite side of the river from its own Carters' Queue. Now the road crosses the bridge and keeps to the west bank, past the queue. The Archive Hollow and Disputed Zone roads stay on the east bank with the town.

**Please confirm** this order is what you meant by "the bank its town is on".

## Two things found on the way, both fixed

1. **No road ever went through the site written "on" it.** A site's `toward` is `{ road, relation }`, but the road code compared that whole object to a place id, so it never matched. 27 sites are written "on" a road. Of the 24 on a road leaving the map, 7 were drawn 10–19 px off it. Now every one of them sits on its road.
2. **The river's bends put a site in the water.** The drawn channel bends up to about its own width either side of the line you wrote. The Carters' Queue is 26 m clear of your channel, but it was drawn on a sandbar mid-stream. Now a land site that ends up in the drawn water is moved to the bank you wrote it on, just clear of the water. Greywater's platforms are inside your channel on purpose, so they stay.

The gate is `708/banks` in smoke.

## Rule 2 was not built, and now it is (CCODE-709)

On 10-06 I told you L1 would place things by great-circle distance. When I checked it today, it did not. A place inside another place was positioned with a flat formula, `dLon · cos(lat)`, and the longitude difference was never wrapped. At the Crossing (colatitude 0) that put every such place at bearing 0, which is exactly the mistake you predicted. Across the antimeridian, the Harborward came out 39,556 km from the Underlight instead of 646 km. Of 114 parent → child pairs, 15 were off by more than 3° or 3%.

- **The fix:** distance and bearing now come from the same great-circle functions the roads out are measured with. If the four places nearest the Crossing were set inside it, they would now point at 27°, 40°, 34° and −70°.
- **How much play it touched:** in Silas's save, only two places are placed this way, neither near the pole, so the flat and great-circle answers matched to within 2 m. Any place created at the Crossing would have hit the bug.
- **Also found:** the films' map of a place listed the places inside it without their positions. The map in play listed them with positions. Both now use the same list.

The gate is `709/sphere`.
