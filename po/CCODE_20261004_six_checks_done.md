<!-- status: DONE on origin. Aevi's six checks are re-pointed or moved to content; `aevi-foothills` can land without touching a test file. Two corrections to her table, both in her favour. -->
# The six checks — done, and three of them are yours now

**CCode → Aevi (cc Erik) · 2026-10-04 · SNG-676 · 32/32 green**

Erik ruled A and your six checks are off your path. **Three are re-pointed at the property they were always
about, and three have moved into content**, which was your suggestion and the right one.

## The three that are yours now

`content/packs/core/world/ratified_name_census.json` — the CCODE-602 pattern, with a `ratifications` list.

| was a literal in | now |
|---|---|
| `content_ci.mjs` `KNOWN_UNRESOLVED` | `unresolvedNames[]` — **add the Stairfen here with its `_why`** |
| `content_ci.mjs` `KNOWN_FEN_COLLISIONS` | `fenCollisions[]` — **drop the Marchfen + Stairfen row** |
| `how_it_works.mjs` `AUTHORED` (your SNG-386 §2 rows) | `authoredBearings[]` — **amend `kindlerow → the_blaze` to `"outward"`** |

⛔ **The gates lose no teeth.** An accidental unbound name or an unexpected collision still reds; the only
way to pass is a deliberate row here saying which, and why. And the engine must still reproduce every bearing
row exactly — I only moved where the rows live.

⚠️ **One thing to know before you edit it:** the diagnoses are `_why`, not `why`. §262 counts ticket
references that could reach a player and it reads the *leaf name*, so a `why` carrying "SNG-676" fails. Mine
did, four times, until I renamed them.

## The three re-pointed

- **§183** now perturbs a seat the census is currently *silent* about, chosen rather than named. The claim —
  a perturbed seat appears by name, the size check stays silent — is unchanged and holds on any world.
- **§99** now asserts the ordering instead of the number: a one-leg road can be among the costliest in the
  world, driven across every connected pair, so a hop count would mis-rank it. That is what "weighted by
  days" means; 150 was only ever an illustration, and your fix shortening it to 98 should not have reddened
  anything.
- **SNG-404 §2's converse — ⛔ retired, and this is my first correction to your table.**

## ⚠️ Two corrections, both in your favour

**1. The converse did not need narrowing — its premise is already gone, on main.** You wrote that the two
layouts you re-placed carry `toward` "so they reproduce". I measured the corpus: **29 of 29 road-basis sites
carry `toward` today**, every one with a `localMap`, and the placer has read the field since it was built.

So "the corpus records which road only in prose" stopped being true some time ago, and the check has been
passing for a different reason than its own sentence gives. What it actually measures now is **how far your
hand-authored road bearings sit from what the placer computes** — 30° on main, 13° on your branch — and that
is a *convergence*, which falls every time you re-place a layout. **A gate that pins a convergence goes red
when the work succeeds**, which is exactly what happened to you.

It is retired with its reason, and replaced by the authoring claim the old comment was really asking for:
*every road-basis site says which road*. The convergence is printed as a note so it stays visible.

**2. Your §183 suggestion would have worked, and the version I shipped is slightly stronger.** You suggested
"the first seat with `movedDeg` 0". I take it from the set the drift census is silent about, which is the
same idea stated in terms of the census itself — so it cannot drift apart from what the check asserts.

## Order

**All six are on origin now.** Push `aevi-foothills` with your content plus the three census edits in one
commit, exactly the way 602 was meant to work. Nothing of mine is waiting on you and nothing of yours is
waiting on me.

⛑ **I did not verify your world**, because `aevi-foothills` is not pushed — I only have your note. The six
are written to hold on both worlds, so if any of them reds on your branch it is a real finding and I want to
see it rather than have you work around it.

— CCode
