# Prototype — the world as a flat map, projected from what is already authored

**Aevi (PO) · 2026-07-18 · Erik asked: what would the world look like as a 2D map, and how do the
Reach axes translate?**

**Short answer: you have already authored it. In twelve dimensions.**

---

# §1 — THE DISC IS ALREADY CANON

`traditions.json :: architecture` — the Valley's crafts are *"FOLK-SHADOWS of the great poles, diluted
and mixed **because the Valley sits near the centre where all axes cross faintly**"*, while the pole
traditions are *"the great crafts, **practised at the Reaches**."*

That is a **disc**, stated in prose:
- **centre** — all axes cross faintly, everything diluted and mixed
- **rim** — the Reaches, where a single pole is expressed purely
- **24 traditions** at authored 15° intervals (`ring.degrees`), antipodes at exactly 180°

So the map is **polar**: *angle* = which disposition, *radius* = how purely it is expressed.

# §2 — AND THE COORDINATES ARE ALREADY IN THE DATA

**73 of 95 locations carry a 12-component `axisVector`** — one signed value per axis — plus a
`poleIntensity`. That is a position in 12-dimensional disposition-space.

The 2D map is a **linear projection** of it onto the ring:

```
x = Σ vᵢ · cos(θᵢ)      y = Σ vᵢ · sin(θᵢ)
```

where θᵢ is the authored ring bearing of axis *i*'s positive pole. Nothing invented; the ring supplies
every angle and the locations supply every magnitude.

**⚠️ The axis order is `world_node_atlas.axisOrder`, NOT the traditions-file order.** I got this wrong
on my first run and every bearing was wrong. It is the kind of detail that silently produces a
plausible map.

## It validates

| | |
|---|---|
| **`the_crossing`** | **r = 0.00 — the exact origin.** The hub gate, the Council, the Coliseum. Not arranged; it fell out. |
| `the_quickwood` | θ ≈ 258.9° vs **rootkin authored at 255.0°** — off by **3.9°** |
| `the_gearlands` | θ ≈ 158.1° vs **enginewright at 150.0°** — off by **8.1°** |
| rim | `the_numen`, `the_scouring`, `the_maw` — the pole loci, farthest out |

The centre of the world computes to the centre of the map from data authored years of sessions apart.

## And it found a bug of mine

The projection put the Palelands 130° from the Ashwarden bearing. Cause: **I authored `cairnhold`,
`the_quiet_ground`, `the_long_grey` and `the_hollowing` in SNG-151 against the wrong axis index
order** — `cairnhold`'s `poleIntensity` said *death 0.7* while its vector encoded **life +0.5**.
Rebuilt all four from their own `poleIntensity`.

**Corpus audit after the fix: 0 of 95 locations disagree with their own `poleIntensity`.**

**This is the strongest argument for the projection:** it is a *consistency check on 12D authoring*.
A wrong vector is invisible in a JSON file and obvious as a place in the wrong half of the world.

---

# §3 — SCALE: a year to walk across

Erik's proposal, costed. Sustained march ≈ 20 miles/day; ~300 travel days a year.

| | |
|---|---|
| rim-to-rim | ~6,000 miles ≈ **300 walking days** |
| centre to rim | ~3,000 miles ≈ **150 days** |
| 1 projected unit (r ≈ 1.0) | ≈ **1,800 miles** ≈ 90 days |
| neighbouring Reaches (15° apart at the rim) | ~780 miles ≈ **39 days** |
| **antipodal Reaches** | **the full 300 days** |

For scale: that is roughly Earth-sized, and the Valley-to-Palelands trips Erik actually plays become
**weeks**, not an afternoon.

## What that buys

1. **Waygates stop being convenience and become infrastructure.** A tier-1 gate at the Crossing is the
   difference between a season and an afternoon. SNG-148's 25-gate network becomes the circulatory
   system of the setting, and gate *tier* becomes a political fact worth fighting over.
2. **Antipodal access is expensive for a reason you can feel.** Ring distance already governs domain
   access; now it is *also* travel time. **One number, two meanings, no contradiction** — the reason
   your antipode is hard to learn is that its practitioners are a year away.
3. **Travel skills become a real tradition axis** — Horizon craft is not flavour if the alternative
   is nine months of walking.
4. **Epic NPCs carrying their own substrate (§M) explains itself.** Crossing that distance without a
   personal pool is not merely hard; it is a different kind of undertaking.
5. **The Valley being small and central is now a *fact*, not a starting-zone convention.**

---

# §4 — COINCIDENT PLACES (Erik's question)

*"Even if some locations are coincident, such as underground ones and above ground ones."*

The projection gives this a clean answer: **the 2D map is a shadow of a 12D space, so coincidence on
the map means dispositional identity, not spatial identity.** Two places that project to the same
point are *the same kind of place* — which is often exactly why one is under the other.

Practical handling: carry a **`depth`** (or layer) alongside `{x, y}`. Coincident-on-the-plane is then
legal and meaningful, and the collision I found earlier — **`ent_deepwood` and `the_lampless_market`
at exactly (40,300), in different regions and unconnected** — stops being a bug and becomes a
question with an answer, since derived coordinates would separate them anyway.

---

# §5 — WHAT FOLLOWS, IF WE DO THIS

1. **Derived coordinates replace hand-placed ones.** Today's `map:{x,y}` are placed for legibility and
   carry at least one collision. Derived ones are *meaningful* — position becomes an assertion about
   what a place IS.
2. **The substrate field gets a real distance basis.** CCode resolved the coordinate-vs-connection
   tension with shortest-path-over-connections weighted by coordinate distance. **With derived
   coordinates that stops being a compromise and becomes correct** — the geometry and the topology
   would finally be measuring the same thing.
3. **Travel time becomes computable** rather than narrated, which SNG-168's messaging and SNG-175's
   companion growth both want.
4. **Address derivation (SNG-166) gets a fourth, strong rule**: a generated place lands where its
   disposition puts it.
5. **Region boundaries become derivable** — a region is the set of places within an angular wedge and
   radial band. That is a *check* on region membership, which is exactly the class of bug SNG-166 §1
   is about.

## The honest caveats

- **22 of 95 locations have no `axisVector`** and would need one — authorable from `poleIntensity`,
  which is what I just did for four.
- **A projection loses information.** Two dispositionally-similar places land together even if the
  fiction wants them apart. The `depth`/layer field absorbs some of this; some will need an override,
  and overrides should be authored and rare.
- **This is a big migration.** Every `map:{x,y}` changes, the world map re-renders, and anything
  reading coordinates shifts under it. Worth prototyping against a copy before committing.
- **Region bearings will not all match their tradition** — the Palelands sit 79° off after the fix,
  because that region holds a haven, a seam and a peace-ground. **That is variety, not error**, and we
  should not "fix" it by flattening regions into their nominal pole.

---

# §6 — RECOMMENDATION

**Prototype it against a copy, do not migrate yet.** Compute derived coordinates for all 95, render
the map, and *look at it*. The cheap test is whether the world it draws is a world we recognise —
whether the Palelands sit where the Palelands should sit.

If it looks right, the migration is mechanical and everything in §5 follows. If it looks wrong, the
projection has told us something true about the authoring, exactly as it did with my four Palelands
files.

---

# §7 — SEPARATE BUG: the log entry is cut mid-word

Erik's screenshot: *"Veth leads the group up the path toward the old Warden Post, eager to see what h"*
— truncated mid-word, no ellipsis. It is the player's own detailed entry echoed in the turn log.

Not a token limit (`intent-parse` has a 1024 budget). No ellipsis and a mid-word cut points at a
**fixed-length slice or a CSS overflow on the log line**. `sharedCanonForGM` has a `slice(0, 90)` but
that is a different surface.

**Outcome wanted:** the player's own words are never truncated in their own log. If the line must be
short by default, it wraps or expands on tap — but a player's input is the one string in the app that
should always be shown in full.
