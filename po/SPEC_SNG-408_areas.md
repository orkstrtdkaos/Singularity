# SNG-408 — Areas on the map, starting with the Disputed Zone

**Author:** Aevi (PO) · **Date:** 2026-08-10
**Erik:** *"the disputed zone needs to be drawn on the map — it's an area. It has sublocations within it."*
**Shipped:** `content/packs/core/world/areas.json` (`92cd981d`) — **the first area in canon.**

---

## §1 — ⛔ NOTHING IN THIS WORLD HAS A BOUNDARY

**All 135 locations are POINTS — including the 25 marked `tier: region`.** There is no `boundary`,
`polygon`, `extent` or `bounds` field anywhere in content. ⚠️ **Regions are drawn as a label at a medoid,
which is why a contested territory looks like a village.**

**So this needs a new content kind, and I have started it with one entry rather than inventing a scheme
for 27.**

---

## §2 — ⛔ THE ZONE DEFINES ITS OWN SHAPE, IN ITS OWN TEXT

> *"The band of broken country **where Harmonic and Radiant power fields interfere.** Sound bends light
> here; light carries sound."*

**That is a formula, not a mood.** A point is in the zone when both powers are **comparably distant**:

```
|d_harmonic − d_radiant| / separation < 0.35     and     max(d_h, d_r) < 1.1 × separation
```

**Measured: the two powers are 22.4° apart, midpoint lat −68.5 lon 78.0.**

⛔ **A LENS IS DERIVED, NOT DRAWN.** Give it two foci and a tolerance and the zone follows the powers if
they ever move. **That is the difference between an area and a polygon somebody typed** — and it is the
same principle as the polar signature: bind to the thing, not to the coordinates.

---

## §3 — ⛔ TWO FINDINGS THAT NEED ERIK, NOT CODE

### §3a — The Fringe is 113 walking days from the dispute it is named for

**`disputed_zone_fringe` sits 67.7° from the midpoint of the two powers.**

⚠️ **This predates my SNG-407 move — it was 67.7° away before I touched it, and a 4.75° snap cannot
explain it.** ⛔ **A place called "the Disputed Zone Fringe" is standing four months' walk from the
dispute.**

**Erik's call: relocate it into the band, or accept the name refers to a dispute it is not near.** ⚠️ **I
have not moved it** — 67.7° is not "slightly", and this is a fiction decision.

### §3b — Its membership is the parenting artifact again

**Of the 8 locations parented to the Fringe, exactly ONE — Echo River Crossing — is in the band.** The
other seven span **288° of longitude**, which is most of the world.

⛔ **Meanwhile the Great Coliseum and the Old Switchback ARE in the band and are not parented to it.**
The Coliseum measures **asymmetry 0.00 — perfectly equidistant from both powers.**

⚠️ **Same failure as SNG-398: topology grouped these, geography never did.**

---

## §4 — WHAT I NEED FROM CCODE

1. **Read `areas.json` and draw the lens** — a soft band, not an outline. ⚠️ **It is interference, so it
   should read as a gradient with no clean edge**; the fiction says shimmer-vortices *wander*.
2. **Membership is COMPUTED, not listed.** ⛔ **Do not read the `parentId` graph for who is in the zone** —
   it is wrong by measurement. Test each location against the formula.
3. **`kind: "lens" | "hull" | "disc"`** so the next areas have somewhere to go. ⚠️ **I have authored one;
   I would rather see it drawn before I author 26 more.**
4. **A gate:** every location the formula places in an area should be reachable from it. ⛔ **The Coliseum
   is in the band and belongs to the Crossing — an area and a parent are different claims and both can be
   true.**

---

## §5 — WHY A LENS AND NOT A HULL

I could have taken the convex hull of the members. ⛔ **It would have spanned 288° of longitude and drawn
a band around the entire world**, because the membership is wrong.

⚠️ **The derived shape is right where the listed membership is wrong** — which is the argument for
deriving areas generally, and the reason I did not simply wrap the existing children in a polygon.
