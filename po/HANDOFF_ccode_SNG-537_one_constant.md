# HANDOFF — SNG-537 landed, and one ratified constant is yours

**Aevi (PO) → CCode · 2026-09-11 · shipped at `25b24e4`**
**Erik ratified the approach 2026-09-11.** Content is in. **One line in your file is the only thing red that I put there.**

---

## §1 — ⛔ THE ASK, AND IT IS TWO NUMBERS

```
FAIL  SNG-392/398/396: the hierarchy matches the RATIFIED census
      — 25 regions, 96 settlements, 14 authored-in-play sites
      — {"settlement":98,"region":25,"site":14}
```

`tests/content_ci.mjs:875-876`. **96 → 98.** ⛔ **`tests/` is yours and I did not cross that line** (§21).

⚠️ **AND THE COMMENT ABOVE IT IS THE REASON THIS IS YOURS AND NOT A CHORE.** Line 874 says *"every number
here is a ratified decision rather than a measurement of drift."* **That is exactly right and it is why I
stopped.** If I edit a ratified census to match what I just authored, the gate stops being a ratification and
becomes a mirror. **The number should move because Erik ratified two new settlements, not because the corpus
changed under it** — so the new value wants the same one-line provenance the existing one carries.

Suggested, and the wording is yours:
```js
// SNG-537 (Erik 2026-09-11): 96 -> 98. Keelmouth and Firstsight minted onto the Outrun so a
// player walking to a port that does not exist arrives at one that does. Ratified, not drift.
```

---

## §2 — ⛑ THE SUITE, MEASURED BEFORE AND AFTER

| | before my work | after |
|---|---|---|
| suites | **31 ran · 27 green · 4 red** | **31 ran · 27 green · 4 red** |
| `content_ci` | 8 failures | 9 — **the one in §1** |
| `wiring_audit` | 1 (`testOnlyExports`) | 1 — unchanged, still yours |
| `how_it_works` | green | green — went red on stale counts, **restamped and fixed** |
| `npc_pipeline` | green | green — went stale, **regenerated** |
| `world --check` | red (river names) | red — **identical, and deliberately so** |

⛔ **THE SIX RED RIVER-NAME GATES READ EXACTLY AS THEY DID.** That was a spec requirement on this work and I
held it: the Outrun binds by **signature at 0° both ends**, so it did not join The Middle Run, The Burnwater,
The Milljaw, The Echofen, The Quiet Fen and The Upper Mire in the unresolved census. ⚠️ **It nearly did** —
my first author had `nearHead`/`nearMouth` only and tripped `no signature`. `reanchor.mjs:56` wants
`head`/`mouth` coordinate arrays; the town anchors are the *fallback*. **Fixed before it shipped, recorded
here because the next person authoring a name will make the same mistake.**

---

## §3 — ⛔ WHAT I LEARNED AT THE LOWER LAYER, AND IT SHRINKS YOUR B6a

`po/BUILD_LIST_2.0.0_ccode.md` §6 asked you to build a place-relocation path. **Most of it exists and the
rest is answered:**

**1 · Moving a location is a PROVEN CONTENT OPERATION, not an engine feature.** ⛑ **Fifteen locations
already carry a `worldPosNote` recording a move**, under two Erik rulings — SNG-407 (*"keep the land as
ground truth now and move the locations slightly to fit the land"*) and SNG-427. `the_harborward` moved
2.69°. **Nobody needs to build this.**

**2 · Minting is manifest + JSON.** No engine change. Two new files, two manifest lines, two
`location_kinds` entries — and `[substrate] field resolved onto 137 location(s)` with no code touched.

**3 · ⛔ BUT MOVING A REGION SEAT IS NOT SAFE, AND THIS IS THE REAL FINDING.** I compared `terrain.json`'s
baked `seats`/`fields.voters` against every authored `worldPos`: **38 of 38 in sync, 0 desynced.** The voter
array is **baked into a REGENERABLE asset we are forbidden to regenerate.** So moving a seat silently
desyncs the region field from the location — and **Longshore is a seat.** That is why it stayed put, and it
is measurement rather than caution.

⚠️ **AND THE FIRST TIME I RAN THAT COMPARISON IT SAID 17 SEATS WERE DESYNCED.** The bug was mine: terrain
uses −180..180 and locations use 0..360, so every western seat read as a 360° error. **§29.5 — the choice of
null is the claim; when a measurement is surprising, check the comparison before reporting the result.** I
nearly handed you seventeen phantom desyncs.

**So B6a is not a build. It is a two-line rule**, and I would take it as a gate rather than a doc:
⛔ **a location that is a region seat may not change `worldPos` while `terrain.json` is not being rebuilt.**
That is cheap, it is checkable from `terrain.json.seats` alone, and it would have caught this before a
player ever walked toward it.

---

## §4 — WHAT SHIPPED

**Longshore** — ⛔ **not moved, not renamed.** Measured: `kind: town`, biome `mountain`, elevation 205
against a sea level of 128, **416mi from the nearest sea**, and its namesake river runs 174mi away and never
touches it. **The name becomes true instead: the long shore-road BEGINS there.** Its own `descriptionSeed`
already called it *"the waygate town… people who know how long a road really takes"* — **the fiction was
already a road town and only the name said shore.** ⚠️ **Brynjar's line in Brayden's save survives intact**
as the half-truth a waypoint-keeper would actually tell.

**Firstsight** — the head of the Outrun (−42.25, 52.75; land/river/stone_grass, +20). Where the road tops
the divide and the water first appears. **Sited on the river head on purpose** — that is what makes the
river's signature bind.

**Keelmouth** — the mouth (−38.25, 52.25). ⛑ **Elevation 127 against a sea level of 128 — one below: a tidal
estuary.** The coast directly outward from Longshore is 100mi nearer and reads +31 to +99, plateau falling
into water. **The extra hundred miles bought the only landing on four hundred miles of cliff**, which is the
fiction as well as the terrain.

**Legs:** Longshore → Firstsight **403mi / 26 days** · Firstsight → Keelmouth **105mi / 7 days**.
**Both sites vote `foothill_hardline`, and Hardline is the nearest existing place** — so this is Hardline's
outward frontier, not Longshore's. Better story than the one I specced.

---

## §5 — ⛔ WHAT IS NOT DONE, AND WHAT WOULD PASS ON PAPER

- ⛔ **A player has not reached it.** Brayden's character is still walking, and the save still carries
  Brynjar's line as a recorded fact. **Minting a port does not retract a thing already said to a player.**
  `content_ci` green is not that test and I will not close on it.
- ⛔ **Keelmouth has a yard and nothing to sail.** The longship quest line needs **mobile holdings** (your
  #6) — a hull that carries you. **Until then Keelmouth is a harbour with no reader**, which is precisely
  the bug this spec was written to answer. ⚠️ **I would rather say that out loud than let it sit.**
- The quest line itself is mine and it is next; the `questSeeds` on both new places are seeds, not the line.

**Status: `complete_pending_review`. Yours: §1. Mine: the quest line, and closing this on a player, not a
diff.**

— Aevi, PO
