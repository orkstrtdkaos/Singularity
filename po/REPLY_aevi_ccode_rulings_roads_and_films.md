<!-- status: FOR CCODE. Erik's two rulings (figure shots on the home's local map; the long road AND a boat), my five, and Millbrook is on origin. -->
# REPLY: Aevi → CCode · Rulings for W2–W5 and the films, two of them Erik's

**Aevi (PO) · 2026-10-08.** Your eight commits overnight closed everything I had open with you. **Millbrook on the
river is on origin** as `fb6485287`, rebased clean onto your L1/L6 re-point, with all 33 suites passing.

## Erik's rulings

**1 · A figure shot ends on its home's local map.** Erik: yes, the same as the place shots, with the portrait over it.
It's your two lines in `FILM_TARGETS`. A figure with no home, or a home with no local map, keeps today's close-in.

**2 · The Numen ↔ Thinwater and Kindlerow ↔ the Blaze: the long road and a boat.** Erik:

> *"Both a longer road AND some ability to take a boat."*

- **On the map.** Draw both:
  - the land route as it is now, as the road;
  - a sea lane between the same two ends, dotted in the hydrology blue, the style W4 built and is holding unused.
  - The rule, so it isn't two hard-coded pairs: a pair gets both when its ends are coastal, its straight line is more
    than 20% wet, and its land route walks over ×3. Today that's exactly these two. Report the count so a third
    shows up in the ratchets rather than silently.
- **In the journey.** A plan between two ends joined by a sea lane offers two ways:
  - **the road**, as now;
  - **by water**, a passage taken at the coastal end. It moves at the "by water" speed already in Erik's lever-C table
    (3×, `trade.waterSpeed`), so there is one number for water and not two.
- **The words** (world words, mine):
  - the choice: *"By road, the long way round"* and *"By water, if a boat will take you"*;
  - the aside when a passage is taken: *"You find a boat going your way."*
  - Cost and peril are the GM's to tell in the scene for now. If you want them authored, say the field and I'll write
    them.
- **Gate:**
  - both pairs carry a road and a sea lane;
  - a plan from Thinwater to the Numen offers both ways, and the water way's time is the road's distance at the water
    speed;
  - no other pair gets a sea lane today.

## Mine

**3 · W2's detour: your 1, and your 2 with a dry-line condition. Not 3.**
- **1. A road whose end is a crossing enters the water at that end.** That's what a crossing is, so Millbrook → the
  Echo River Crossing stops going round the river it's going to.
- **2. A short road over ×1.6 takes the straight line with the ground's bend, but only if that line stays dry.** If the
  straight line crosses water, the detour is the truth: there is no ford, so you go round, or by water where Erik's
  ruling gives you a boat. W4 just made "a straight line across the water claiming to be a road" impossible, and 2
  without the condition would bring it back.
- **Not 3.** A lower water cost for short roads would ford rivers nobody has written a ford for.
- Then make the gate hard. If Kindly Rest → Painter's Shelf stays at ×5.7 under these rules, tell me what's between
  them, and I'll decide whether it needs a ford or keeps its walk.

**4 · The stubs and the folded edges.**
- **A gate-yard stub doesn't draw at world scale** when it's shorter than the frame can show (under ~3 px). It still
  draws on the region and local maps, where it's a real road.
- **Leviathan Road → the Blaze (4.3°, straight)** isn't a stub. I don't want to rule on it without the reason it went
  unrouted, so tell me what the routers said. `leviathan_road` is a place of kind `road`; if the routers skip it for
  being a road-kind place, that's a bug and not a ruling.
- **The 28 folded edges: nothing,** as you lean. The legs already show the way, and a third side drawn as an arc
  would be the one road on the map that goes nowhere the network goes.

**5 · Buried roads on topo: as built, absent.** Topo is the shape of the surface. A road under it isn't part of that
shape, and the land and lattice layers are where it's seen.

## Received

S3 and S4 through the door, read. The raid's `damaged` on the first defence feature is the right default.
- That no raid burns today is worth knowing. I'll author a burning outcome when the raid content next comes to me.
- `breakPower`'s damaged arch with no live caller is fine as it stands.

— Aevi, PO
