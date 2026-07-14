# SPEC — SNG-101: Domain Promotion
## Aevi (PO) · 2026-07-14 · authored to spec · **awaiting CCode ROUND 2**

> **One line.** A character's chosen domains can be *promoted* — tertiary→secondary, secondary→primary — by earned standing, lifting the tier ceiling on that domain. Promotion **forecloses the newly-chosen domain's antipode by ordinary means.** It is a confirmed decision, never automatic. It never removes anything already learned.

> **Verified against HEAD `v1.8.60`.** Domain layout is currently **static-at-build**: `domainAccessModel` in `traditions.json` assigns primary/secondary/tertiary at creation, and `progression.js` has **no** promotion, acquisition, or elevation surface. This spec adds the missing dynamic verb. It changes *access ceilings*, not the access *model* — every gate in `accessGates` and the closed-opposite rule stay exactly as they are.

---

## THE CANON THIS LEANS ON (all live at HEAD)

- **`domainAccessModel`** (`traditions.json`, SNG-055, Erik 2026-07-11): primary = full access all tiers; secondary = up to Tier III; tertiary = up to Tier II and **must be a ring-neighbour (steps=1) of the secondary**; opposed-to-primary-or-secondary = **CLOSED**.
- **`accessGates`** (SNG-049/050): *"rank IV–V of a pole-tradition additionally requires deep standing with that people (teacher + reputation), not merely presence. Greatness is taught, not bought."* — promotion reuses this exact standing bar.
- **The great circle** (SNG-054): 24 traditions, uniform antipodal topology, `opposite`/`adjacent`/`ring`/`distances` per tradition. `steps=12` is the antipode.
- **Cross-pole braids**: the *only* sanctioned road to your own antipode. This spec must not create a second road.
- **Erik's ruling, 2026-07-14 (this session):** *"Keep the ground you have if you promote."* Foreclosure is **directional** — closes the road forward, never confiscates what's behind.

---

## 1. WHAT PROMOTION IS

A domain a character already holds moves up one station:

| From | To | Ceiling before | Ceiling after |
|---|---|---|---|
| Tertiary | Secondary | Tier II | Tier III |
| Secondary | Primary | Tier III | Tier IV–V (capstones) |

**Promotion lifts the tier ceiling on that one domain. It does nothing else to access.** It does not move the domain on the ring, does not change its neighbours, does not grant abilities — it removes the ceiling that was capping what the character could already learn there.

**Promotion raises a ceiling; it does not mint a second station.** A character can end up with two domains at primary-tier *access* (the built primary, plus a secondary promoted to primary-tier ceiling) — but "primary" as a **geometric station** (the thing that forecloses an antipode at build) is not duplicated. What promotion grants is the higher station's **access ceiling** and its **foreclosure**, while leaving the domain's ring geometry (its `opposite`/`adjacent`) untouched. §2 makes station-vs-ceiling precise so CCode doesn't have to infer it.

## 2. STATION vs CEILING — the precise model

The current model conflates two things that this spec must separate:

- **Station** = the geometric role chosen at build. It determines *foreclosure* (primary's antipode closed, secondary's antipode closed) and the *tertiary-adjacency constraint*. Stations are fixed by the build-time choice **and by promotion** (see foreclosure below).
- **Ceiling** = the max tier learnable in a domain. Today ceiling is a pure function of station. This spec **decouples** them: a domain carries its own `tierCeiling`, initialized from its station, and **raised by promotion**.

So the character record gains, per chosen domain, an explicit ceiling that promotion edits — rather than re-deriving ceiling from station every read.

```
character.domains = {
  primary:   { traditionId, tierCeiling: 5, station: "primary" },
  secondary: { traditionId, tierCeiling: 3, station: "secondary" },
  tertiary:  { traditionId, tierCeiling: 2, station: "tertiary" }
}
```

**Promotion edits `tierCeiling` and the character's `foreclosed` set — never a domain's ring geometry.** A promoted tertiary reads as `tierCeiling: 3` and its antipode joins `foreclosed`. It is, in every access sense, now a secondary. The `station` label is updated to match for UI clarity, but **access is read from `tierCeiling` + `foreclosed`, which is the single source of truth** — never re-derived from the label.

*Rationale: reading access from an explicit per-domain ceiling is the only model where "keep the ground" is expressible. If ceiling were re-derived from station on every read, there'd be nowhere to record "this domain is promoted but that far ability you already learned survives.")*

## 3. FORECLOSURE — the bifurcation (Erik's ruling, exact)

**On promotion, the promoted domain's antipode (`steps=12`) is added to `character.foreclosed`.**

- A **tertiary** promoted to secondary: its antipode was previously *penalized-reachable* (steps=12 from a tertiary is not auto-closed under the current model — only primary/secondary antipodes close at build). Promotion **newly closes it.** This is the decision with teeth: before, you could dabble at both ends of that axis via the penalized ring; after, you have chosen your end.
- A **secondary** promoted to primary: its antipode was already closed at build. No new foreclosure; promotion here is purely a ceiling lift.

**Foreclosure is directional (Erik's ruling — KEEP THE GROUND):**
```
foreclose(antipodeId) means:
  • BLOCK: learning any NEW ability in antipodeId by ordinary means
  • BLOCK: ranking UP any already-owned antipodeId ability by ordinary means
  • PRESERVE: every already-owned antipodeId ability, at its current rank, fully usable
  • PRESERVE: the braid road — a cross-pole braid spanning this axis remains the sanctioned exception
```

You do not un-become what you'd started to be. You commit against *deepening* it. The road forward shuts; the ground under your feet stays yours.

**The braid clause is non-negotiable:** foreclosure must never touch `combination`/braid abilities. A foreclosed antipode is still reachable *as a braid*, which is the entire weight of the cross-pole system. `foreclosed` gates **native/single-tradition** learning and ranking only.

## 4. THE STANDING BAR — what earns a promotion

Reuses the `accessGates.capstones` bar verbatim — **greatness is taught, not bought:**

| Promotion | Requires |
|---|---|
| Tertiary → Secondary (unlocks Tier III) | Deep standing with that people: **teacher met + willing**, **reputation ≥ threshold**, **N ranks already earned in-domain** (you've done the work up to your current ceiling). |
| Secondary → Primary (unlocks Tier IV–V) | The full capstone bar: the above **plus** sustained region presence and the domain practiced *to its current ceiling* (every Tier-III ability at rank ≥2, i.e. you've genuinely exhausted what secondary allows). |

**No skill-point cost.** Promotion is not bought; it is *recognized*, exactly like `markDefiningMoment` recognizes rank 3. The standing is the price.

Thresholds live in a new `traditions.json` → `promotion` block (tunable, not hardcoded):
```json
"promotion": {
  "tertiaryToSecondary": { "minReputation": <t>, "requiresTeacher": true, "minInDomainRanks": <n> },
  "secondaryToPrimary":  { "minReputation": <t>, "requiresTeacher": true, "requiresRegionStanding": true,
                            "requiresCeilingExhausted": true }
}
```

## 5. LAW 9 — promotion is offered, never applied

Promotion **forecloses a door**, so it is precisely the class of change that must be confirmed, never silent (Law 9: nothing that takes or sets commits before the player confirms; contrast rank 1→2, which only *gives* and so auto-applies).

**The engine surfaces eligibility; the player commits.** The confirm names the cost:

> **Promote Marchcraft to secondary?**
> This raises your ceiling in Marchcraft to Tier III — and **closes The Deeps to you** by ordinary means. Anything you've already learned of The Deeps, you keep. The braid road remains. This is a choice about who you're becoming.
> **[ Commit ]  [ Not yet ]**

New GM op **`offerPromotion`** (GM may surface the opportunity narratively when standing is met — "your teacher says you are ready to be called one of them"); the **commit** is a player UI action, never a GM op. The GM can *offer*; only the player *commits*. This keeps foreclosure off the model's plate entirely — the model cannot foreclose a player's axis.

## 6. ENGINE SURFACES

| Module | Change |
|---|---|
| `traditions.json` | Add `promotion` thresholds block. |
| `state.js` | Migrate legacy characters: derive `character.domains` (with `tierCeiling` from station) + `character.foreclosed` (primary+secondary antipodes) on load if absent. Idempotent, `reconcileVersion`-gated. **This is the one real migration** — and it only *adds* derived structure, never removes. Old saves gain explicit ceilings equal to what they already had. |
| `progression.js` | `promotionEligible(character, domainKey, rules) → {eligible, missing[]}`; `promote(character, domainKey)` — edits `tierCeiling`, adds antipode to `foreclosed`, updates `station` label. Access reads (`canLearn`, `canRankUp`) read `tierCeiling` + `foreclosed` instead of re-deriving from station. **`foreclosed` gates native/single-tradition only — never braids.** |
| `gm.js` | `offerPromotion` op (narrative surface only) + whitelist + sanitizer clamped to `{domainKey}`. Engine ignores it unless `promotionEligible` is already true — the GM can't hand a promotion any more than it can hand mastery. |
| `app.js` | Promotion offer card (claimable, like a ripe combo); the **commit modal** naming the foreclosure cost; domain panel shows ceiling + any foreclosed axes. |
| `skilltree.js` | A foreclosed antipode renders `FORECLOSED` (visually distinct from `LOCKED` — locked is "not yet", foreclosed is "you chose otherwise"), except braid nodes on that axis, which stay reachable. |
| `tests/content_ci.mjs` | Validate the `promotion` block shape; assert every `foreclosed` reference resolves to a real `steps=12` antipode. |

## 7. THE ENDGAME FALLS OUT — do not build a rule for it

There is **no** "you may not master everything" rule, because the geometry already forbids it: **every promotion adds a closed diameter to `foreclosed`.** A character who promotes widely accretes foreclosures — the more domains you raise, the more far-sides you shut. "Own the whole circle by ordinary means" is **geometrically unreachable**, by construction, with zero enforcement code.

Mastery is therefore *definitionally* someone standing at a pole with a maximal braid-set spanning their own foreclosures — the completed pilgrimage, not the dissolved self. The philosophy is the mechanic. (Erik + Aevi, this session — the reframe is ratified; do not add a flat "collect-all" endgame.)

## 8. NON-GOALS / GUARDS
- **No new road to the antipode.** Foreclosure never loosens; the braid remains the only exception. If any code path lets a foreclosed native ability be learned/ranked by ordinary means, that is a P0 bug — it dissolves the braids.
- **No confiscation.** If a `promote` call would ever lower a `tierCeiling` or strip an owned ability, it must throw. Law 14 is a hard invariant here.
- **No auto-promote.** `promote` is only ever called from the commit UI action. `offerPromotion` sets no state.
- **Acquisition is out of scope** — that's SNG-102. This spec only moves *existing* chosen domains up the chain.

## OPEN QUESTIONS FOR CCODE ROUND 2
1. Does a `character.domains` structure already exist under another name, or is `primary/secondary/tertiary` currently stored flat on the character? (I read `domainAccessModel` as the *rules*, but need the *save-shape* confirmed — where is a character's chosen primary actually persisted today?)
2. Is there an existing `foreclosed`/closed-axis set on the character, or is closed-opposite currently computed on-the-fly from station + `opposite`? (Determines whether §6 `state.js` migration adds a field or formalizes an existing one.)
3. Reputation: confirm the live counter and scale (`reputation.js`) so §4 thresholds are expressed in real units, not invented ones.
4. Does `skilltree.js` have a state enum I extend for `FORECLOSED`, or does it derive node status differently?
