# SPEC — SNG-102: Domain Acquisition
## Aevi (PO) · 2026-07-14 · **v2, post-CCode-ROUND-2 · GO after SNG-101**

> **DEPENDENCIES:** SNG-101 (which itself depends on the classification pass + SNG-100b). Acquisition inherits SNG-101's **additive** structures — `domainsAcquired`, `domainCeilings`, `foreclosed` — and adds **no schema or type change of its own.** Build order: classification → SNG-100b → SNG-101 → SNG-102.

> **One line.** A character can acquire a **new** tradition beyond the three chosen at build — expanding their presence on the great circle — through deep standing with that people. Acquisition respects every existing gate; the closed-opposite rule is never loosened; the antipodes of already-foreclosed domains stay foreclosed.

> **Verified against HEAD `bb36b5a`.** Depends on **SNG-101**: acquisition appends to SNG-101's `character.domainsAcquired` (string array), sets a Tier-I entry in `domainCeilings`, and applies foreclosure via the shared `foreclosed` path. Because SNG-101 §2 (v2) keeps `domains` as strings and generalizes `domainAccess` to iterate `[primary, secondary, tertiary, ...domainsAcquired]`, **acquisition needs no new schema** — it's a new entry in structures SNG-101 already built. The standing bar is **SNG-100b**, not the unwired `accessGates`.

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
| `progression.js` | `acquirable(character, traditionId, rules) → {ok, reason}` (reads SNG-100b standing); `acquireDomain(character, traditionId)` — pushes `traditionId` to `domainsAcquired`, sets `domainCeilings[traditionId] = 1`, adds the target's antipode to `foreclosed` via the shared SNG-101 path. Access reads already handle it once `domainAccess` iterates `domainsAcquired` (SNG-101 v2 §2). |
| `gm.js` | `offerAcquisition` op (narrative only) + whitelist + sanitizer clamped to `{traditionId}`. Engine ignores unless `acquirable` is already true. |
| `app.js` | Acquisition offer card; commit modal naming the antipode-foreclosure cost; domain panel lists acquired domains alongside the built three. |
| `skilltree.js` | Acquired domains render in the skill graph with their real ring position; their Tier-I ceiling shown; foreclosed antipode marked `FORECLOSED`. |
| `state.js` | **No new migration.** Acquired domains are entries in `character.domainsAcquired` (a string array SNG-101 v2 introduces). The earlier "make it a keyed collection" flag is **satisfied**: SNG-101 v2 keeps `domains` as its three named string fields AND adds `domainsAcquired` as a string array that `domainAccess` iterates — so 4+ domains work with zero type change. Acquisition just pushes a string. |
| `tests/content_ci.mjs` | Validate `acquisition` block; assert acquired-domain access respects `foreclosed` and closed-opposite. |

## 6. THE PILGRIMAGE — what this unlocks narratively

SNG-101 lets you deepen who you are. SNG-102 lets you *widen* it — walk the ring, join people after people, each entry earned and each entry costing you the far pole of that people's axis. A character who has acquired many domains is not "closer to having everything" — they are someone who has **stood in many places on the circle and closed many far sides**, whose antipodes are a growing set of committed foreclosures, and whose only road to any of them is a braid they earned. The completed pilgrimage is a *shape* — maximal presence, maximal foreclosure, the self held at a pole while spanning as much of the ring as standing allows. That is the endgame, reached by playing, with no endgame-specific code. (Ratified reframe, Erik + Aevi, this session.)

## 7. NON-GOALS / GUARDS
- **Closed-opposite is never loosened by acquisition.** You cannot acquire your way to your own antipode. P0 if any path allows it.
- **Acquired domains start at Tier I, always.** No "great elsewhere → start high here." The pilgrimage is walked, not skipped.
- **No count cap.** Geometry limits; numbers don't.
- **Requires SNG-101.** Do not schedule before it; they share `character.domains` and the foreclosure path.

## OPEN QUESTIONS — RESOLVED (CCode ROUND 2)
1. **4+ domains:** settled at SNG-101 v2 — `domainsAcquired` string array iterated by `domainAccess`; no keyed-collection type change, no schema cost here.
2. **"Teacher met and willing":** **not persisted at HEAD** — must be built. → **SNG-100b** provides the durable teacher-relationship flag this needs. Until then, acquisition has no durable gate input.
3. **Region-standing:** **not stored** (only current location). → **SNG-100b** provides the region-presence record. The soft prior-presence gate depends on it.

*All three collapse into: acquisition's inputs are built by SNG-100b. Full review: `po/SPEC_SNG-101_102_CCODE_REVIEW.md`.*
