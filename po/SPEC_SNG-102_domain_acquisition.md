# SPEC — SNG-102: Domain Acquisition
## Aevi (PO) · 2026-07-14 · authored to spec · **awaiting CCode ROUND 2**

> **One line.** A character can acquire a **new** tradition beyond the three chosen at build — expanding their presence on the great circle — through deep standing with that people. Acquisition respects every existing gate; the closed-opposite rule is never loosened; the antipodes of already-foreclosed domains stay foreclosed.

> **Verified against HEAD `v1.8.60`.** Depends on **SNG-101** (Domain Promotion) landing first: acquisition reuses SNG-101's `character.domains` structure, the `foreclosed` set, and the standing-bar machinery. Do not build this before SNG-101's `state.js` migration exists — it is the foundation both share.

---

## THE CANON THIS LEANS ON

- **`accessGates`** (SNG-049/050): you may learn/rank a pole-tradition ability only if native, in-region, or teacher/tome. **Acquisition is the formalization of the teacher/tome path into a durable domain**, not a new bypass.
- **`domainAccessModel`**: opposed-to-primary-or-secondary = CLOSED. Acquisition **cannot** target a foreclosed antipode — the braid stays the only road there.
- **The great circle** (SNG-054): a newly acquired domain takes its real station on the ring (`opposite`/`adjacent`/`distances`), with all the foreclosure consequences that follow.
- **Erik's direction, 2026-07-14:** *"obtain new domains similarly"* — growth of reach through experience and travel, parallel to promotion.

---

## 1. WHAT ACQUISITION IS

Today a character has exactly three domains (primary/secondary/tertiary), fixed at build. Acquisition adds a **fourth and beyond** — a new tradition entered into `character.domains` as an **acquired** domain.

| | Chosen-at-build domains | Acquired domains |
|---|---|---|
| Count | Exactly 3 | 0…N |
| Entry | Build screen | Deep standing, mid-play |
| Starting ceiling | Per station (5/3/2) | **Tier I** — you begin as a novice of this people, however great you are elsewhere |
| Ceiling growth | Via SNG-101 promotion | Via SNG-101 promotion (an acquired domain is promotable like any other) |

**An acquired domain enters at Tier I and climbs by the same standing bar as everything else.** Greatness elsewhere buys you nothing here except the discipline to learn — you walk into a new people as a beginner. This is the mechanic that makes the *pilgrimage* real: reach expands one earned people at a time.

## 2. WHAT YOU MAY ACQUIRE — and what you may not

An acquirable tradition must clear **every** gate below:

```
acquirable(character, targetTraditionId):
  ✓ NOT already in character.domains
  ✓ NOT in character.foreclosed        # cannot acquire the antipode of a domain you've committed to
  ✓ NOT the opposite of your PRIMARY or SECONDARY   # closed-opposite, unchanged
  ✓ standing met: teacher-of-that-people met+willing AND reputation ≥ acquisitionThreshold
  ✓ (soft) you have stood in their region / carried their tome — the teacher/tome gate, durable
```

**The closed-opposite rule is the load-bearing "no."** You can walk the whole ring acquiring peoples — but never the far pole of an axis you've already chosen an end of. That remains braid-only. Acquisition widens the circle you can *stand in*; it never dissolves a tension you've already resolved.

**Acquiring a domain foreclosures ITS antipode too** (via SNG-101's foreclosure, applied at acquisition): the moment you become of a people, the far pole of *their* axis closes to you by ordinary means. Reach is never free — every people you join shuts a door on the world's far side. This is the same geometry that makes the endgame a pole-with-braids rather than an everything-blob, now operating on acquired domains as well as promoted ones.

## 3. THE STANDING BAR

Acquisition is the **teacher/tome capstone bar**, made durable:

| Step | Requires |
|---|---|
| **Eligibility surfaces** | A teacher of the target people, **met and willing**, or a tome of the tradition held; plus reputation with that people ≥ `acquisitionThreshold`. |
| **Acquisition commits** | Player confirms (Law 9 — it forecloses an antipode). The domain enters at Tier I. |

No skill-point cost to *acquire* (the standing is the price); learning individual abilities within it costs points as normal, now unblocked by the domain being yours.

Thresholds in `traditions.json` → `acquisition` block:
```json
"acquisition": {
  "minReputation": <t>,
  "requiresTeacherOrTome": true,
  "startingCeiling": 1,
  "maxAcquiredWarning": null    // no hard cap — the foreclosure geometry is the natural limiter
}
```

**No hard cap on acquired-domain count.** The limiter is geometric, not numeric: every acquisition forecloses an antipode, so a character acquiring widely progressively shuts the far side of the ring to themselves. The wall builds itself. (Same principle as SNG-101 §7 — do not add a flat count cap; it would be a worse, less meaningful version of what the geometry already does.)

## 4. LAW 9 + LAW 14 — same discipline as promotion

- **Law 9:** acquisition forecloses the target's antipode, so it is **confirmed, never automatic.** The GM may *offer* (`offerAcquisition` op, narrative surface only — "the Marchwardens would take you as one of their own, if you'll have them"); the **commit** is a player UI action. The model can offer a people; it can never foreclose a player's axis.
- **Law 14:** acquisition only *adds*. It never removes an owned ability or lowers a ceiling. The antipode-foreclosure it triggers is **directional** (SNG-101 §3) — closes the road forward on that antipode, keeps any ground already held there.

## 5. ENGINE SURFACES

*(All lean on SNG-101 having landed. Deltas beyond SNG-101:)*

| Module | Change |
|---|---|
| `traditions.json` | Add `acquisition` thresholds block. |
| `progression.js` | `acquirable(character, traditionId, rules) → {ok, reason}`; `acquireDomain(character, traditionId)` — appends to `character.domains` as `{traditionId, tierCeiling:1, station:"acquired"}`, applies antipode foreclosure via the SNG-101 path. Access reads already handle arbitrary domains once SNG-101 reads from `character.domains` rather than fixed slots. |
| `gm.js` | `offerAcquisition` op (narrative only) + whitelist + sanitizer clamped to `{traditionId}`. Engine ignores unless `acquirable` is already true. |
| `app.js` | Acquisition offer card; commit modal naming the antipode-foreclosure cost; domain panel lists acquired domains alongside the built three. |
| `skilltree.js` | Acquired domains render in the skill graph with their real ring position; their Tier-I ceiling shown; foreclosed antipode marked `FORECLOSED`. |
| `state.js` | No new migration beyond SNG-101 — acquired domains are just additional entries in the `character.domains` SNG-101 already introduced. Confirm the migration tolerates 3+ domains (it should, if it builds a map/array rather than three fixed keys — **flag for SNG-101: build `character.domains` as a keyed collection, not three hardcoded fields, precisely so acquisition needs no schema change**). |
| `tests/content_ci.mjs` | Validate `acquisition` block; assert acquired-domain access respects `foreclosed` and closed-opposite. |

## 6. THE PILGRIMAGE — what this unlocks narratively

SNG-101 lets you deepen who you are. SNG-102 lets you *widen* it — walk the ring, join people after people, each entry earned and each entry costing you the far pole of that people's axis. A character who has acquired many domains is not "closer to having everything" — they are someone who has **stood in many places on the circle and closed many far sides**, whose antipodes are a growing set of committed foreclosures, and whose only road to any of them is a braid they earned. The completed pilgrimage is a *shape* — maximal presence, maximal foreclosure, the self held at a pole while spanning as much of the ring as standing allows. That is the endgame, reached by playing, with no endgame-specific code. (Ratified reframe, Erik + Aevi, this session.)

## 7. NON-GOALS / GUARDS
- **Closed-opposite is never loosened by acquisition.** You cannot acquire your way to your own antipode. P0 if any path allows it.
- **Acquired domains start at Tier I, always.** No "great elsewhere → start high here." The pilgrimage is walked, not skipped.
- **No count cap.** Geometry limits; numbers don't.
- **Requires SNG-101.** Do not schedule before it; they share `character.domains` and the foreclosure path.

## OPEN QUESTIONS FOR CCODE ROUND 2
1. Confirm SNG-101 will build `character.domains` as a **keyed collection** (so 4+ domains need no schema change). If SNG-101 hardcodes three fields, this spec inherits a migration it shouldn't need — worth settling at SNG-101 review.
2. `teacherOrTome` today: is "a teacher met and willing" already a persisted relationship state (an NPC flag), or inferred per-turn? Acquisition needs it *durable* — the standing must persist across sessions.
3. Region-standing: is there a persisted "has stood in region X" counter, or only current location? (Affects whether the soft teacher/tome gate can require prior presence.)
