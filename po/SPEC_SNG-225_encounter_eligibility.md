# SPEC — SNG-225: Encounters roll but the pool is starved — generated locations have null danger
## Aevi (PO) · 2026-07-22 · verified at origin with a live save + the actual eligibility filter

> **SUPERSEDED IN PART (Aevi, 2026-07-22, verified against CCode ship 8942da73):** §5 below proposed a
> SELECTIVE re-tag of region-locked encounters. Erik + CCode went further and RIGHT — §4c DROPPED the
> region-lock wholesale (`isEligible` no longer gates on `regions` at all; fitness = danger-threshold +
> tag-context, not geography. "The world is full of wonders and dangers; let each location have them as they
> come."). Combined with §4a/b (real dangerLevel on mint + `dangerOf` floors null→1 + backfill heals stubs
> from region median ≈2), the Waygate went 7/58-all-peaceful → 37/58 with 5 dangerous. So §5's "audit and
> re-tag selectively" is SUPERSEDED — no re-tag needed, the lock is gone. What Aevi DID author under §5
> still stands and COMPLEMENTS the drop: 4 low-danger (minD-0) stakes encounters (mistaken-identity, urgent
> courier, small debt, spooked animal, all regions:["*"]) that give even a genuinely danger-1 hearth/haven a
> little friction at the very bottom of the scale. They add texture; they do NOT reimpose any region clamp.


> **Erik, live (to the GM):** on the HIGHEST encounter setting, "I have yet to have any sort of encounter…
> can you verify the encounter rolls are happening?" The GM answered plausibly (rolls happen on arrival, come
> up empty) but couldn't see the real cause.

## §1 — Verified: the roll FIRES; the eligible POOL is starved (and skewed peaceful)
SNG-127 shipped correctly — `onNarrativeTime` config is present (rate 0.14/cap 0.6), the pacing selector is
wired (Erik's "highest" = relentless, `pace.mult` reaches `rollTrigger`). So the roll is NOT the problem.

The problem is `pickEncounter` → `isEligible(entry, location)`. Ran the ACTUAL filter against all 58
encounters for the Waygate (Silas's `gen-waygate`, verified fields: `dangerLevel: null`, `tags:
["transitional"]`, `regionId: "valley"`):
- **Only 7 of 58 encounters are eligible** — and they are ALL `beneficial (3) / benign (2) / beautiful (2)`.
  **Zero dangerous, zero theft, zero chase, zero fight.**
- **`minDanger > 0` eliminates 24 encounters** — because `dangerOf(location)` reads the Waygate's
  `dangerLevel` as **null → 0**, so EVERY encounter needing any danger (all the fights/raiders/hazards) is
  ineligible. **A null-danger location can NEVER roll a dangerous encounter.**
- **region-anchoring eliminates 44** — most encounters name specific regions; a `gen-` location's
  `regionId: "valley"` matches only the `regions:["*"]` ones + a few.

So even at max pacing, when the roll fires, `pickEncounter` draws from a pool of 7 gentle encounters — and
often the danger-weighting (`flavorMultiplier`) further favors the calm ones. The player experiences
"nothing happens" (or only quiet things), on the highest setting. **The roll works; the CONTENT POOL at
generated/low-danger locations is structurally starved.**

## §2 — Why the GM couldn't diagnose it (and a note for the repair theme)
The GM saw `encounterFlavor: "n/a"` on the location and correctly reported the field was empty — but it has
NO visibility into the eligibility filter that produced the empty pool. Its answer ("rolls happen, come up
empty") was TRUE but shallow: it couldn't know 51 of 58 encounters were filtered out upstream. Not a GM
escape (unlike SNG-207c) — a genuine blind spot: the GM can't see engine-internal filtering. (Minor: a debug
readout of "N encounters eligible here" would let the GM answer this kind of question truthfully — optional.)

## §3 — Root cause: generated locations have `dangerLevel: null`
The core bug is the same family as the `_gen` crash (SNG-216) and the null worldPos I just fixed: **generated
locations are minted without a `dangerLevel`**, and null danger silently disqualifies 24/58 encounters. The
Waygate isn't unusually safe by design — it just never got a danger value, and `null → 0` is the most
restrictive possible setting for encounter eligibility.

## §4 — The fix (three parts, ordered by impact)
### §4a — Generated locations must get a real `dangerLevel` (the root)
When a location is minted (`_gen`), assign a `dangerLevel` — derived from its region/community/tags/spectrum,
not left null. A March-road waypost isn't danger 0; it's low-but-nonzero (1). Derive on mint (and backfill
existing gen-locations, like the SNG-216 `_gen` backfill): a null `dangerLevel` → a computed default from the
location's nature. This alone un-starves the pool — a danger-1 Waygate makes the 24 `minDanger:1` encounters
eligible again.

### §4b — `dangerOf` should FLOOR null, not treat it as 0-and-restrictive
Defensive twin of §4a (same shape as the SNG-216 type-guard): `dangerOf(location)` should treat a missing
`dangerLevel` as a sensible floor (region-derived, or a global default of 1), NOT silently 0. A location that
forgot its danger shouldn't be the SAFEST possible place by accident. Guard the reader so one missing field
can't gut the pool.

### §4c — A pacing floor: highest setting should GUARANTEE variety, not just odds
Erik's on the HIGHEST setting and sees nothing — even with §4a/b, if a location's eligible pool is all-peaceful,
"relentless" still feels empty of STAKES. Two options (Erik's call):
- **Pool-aware pacing:** if the eligible pool at a location has no dangerous/stakes flavors, `relentless`/
  `eventful` should widen eligibility (relax region-anchoring, or pull from a region-neighbour pool) so the
  setting can actually deliver what it promises. The highest setting relaxing the filters is intuitive.
- **A floor guarantee:** at the top pacing, guarantee SOME encounter within N beats of travel through
  non-safe ground (a soft pity-timer), so "relentless" never means "nothing for a whole session."
- Keep the intimate/intense/gambit suppressors (SNG-127) intact — the floor never breaks a tender/charged beat.

## §5 — Content check (secondary)
Even fixed, the region-anchoring is aggressive (44/58 region-locked). Worth an audit: are enough encounters
`regions:["*"]` or valley-wide to give EVERY location a living pool across all 7 flavors? Right now the
"anywhere" pool skews peaceful. Consider re-tagging some dangerous/theft/chase encounters as valley-wide (or
region-group-wide) so no location is stuck with only gentle options. Aevi can author this re-tag pass (content).

## OWNERSHIP
- CCode: §4a (dangerLevel on mint + backfill), §4b (dangerOf floor guard), §4c (pacing floor — the pool-aware
  or pity-timer mechanic). Engine.
- Aevi: §5 (encounter region/flavor re-tag audit so the "anywhere" pool has stakes) — content, my lane.

## GUARDS
- **Null danger is a bug, not "safe"** — a generated location with no dangerLevel must get one (derived), and
  the reader must floor it; never let null = safest-possible silently gut eligibility.
- **The roll already works (SNG-127)** — do NOT re-multiply the rates; the fix is the POOL and the null-danger
  floor, not the trigger frequency. Over-cranking the rate on top of a fixed pool would over-fire.
- **Highest setting must DELIVER** — if a player picks relentless, the world owes them stakes; a floor/pool-
  widen makes the setting honest. But intimate/intense beats stay protected (SNG-127 suppressors hold).
- **Backfill idempotent** — gen-locations get a derived dangerLevel once, like the SNG-216 _gen backfill.

## OPEN QUESTIONS — CCODE ROUND 2
1. §4a — derive dangerLevel from what? region base danger + tags (a "ruin"/"disputed"/"wild" tag lifts it) +
   spectrum? Or a simple region-default table? (A derive is better than a flat default; region+tags is enough.)
2. §4c — pool-aware eligibility-widen vs. pity-timer? The widen is more elegant (the setting relaxes filters);
   the timer is simpler. Erik's call on which "highest setting delivers" mechanic.
3. §4b — global null-danger floor of 1, or region-derived? (Region-derived is better but needs the region
   base-danger table from §4a; a global 1 is the safe interim.)
4. §5 — how many encounters should be valley-wide with stakes? (Audit: currently the "*" pool is
   3 beneficial/2 benign/2 beautiful = 0 stakes. Needs some dangerous/theft/chase at "*" or valley-wide.)
