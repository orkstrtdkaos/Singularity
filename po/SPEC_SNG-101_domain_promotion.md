# SPEC — SNG-101: Domain Promotion
## Aevi (PO) · 2026-07-14 · **v2, post-CCode-ROUND-2 · GO after dependencies**

> **DEPENDENCIES (both confirmed at HEAD `bb36b5a`):**
> 1. **SNG-100b — Standing Bar** must build first. The teacher+reputation-per-people bar this spec gates on is **not wired** — `domainAccess` enforces station/ceiling/closed-opposite and nothing else; per-people standing doesn't exist as a score (`reputation.js standingWith` is per-settlement; `peopleDisposition` is display-only). SNG-100b builds the primitive and closes SNG-049/050's own unwired gap.
> 2. **Ability-arch classification pass** must complete first. Foreclosure must never touch braids (`nativeOrCombination === "combination"`), but that tag is **0/247 classified** — without it, foreclosure can't tell a native antipode ability from a braid and would wrongly foreclose braid nodes (the P0 §8 warns of).
>
> Build order: **classification → SNG-100b → SNG-101 → SNG-102.**

> **One line.** A character's chosen domains can be *promoted* — tertiary→secondary, secondary→primary — by earned standing (the **SNG-100b** bar), lifting the tier ceiling. Promotion **forecloses the newly-chosen domain's antipode by ordinary means** — directionally: the road forward shuts, the ground already held stays. Confirmed decision, never automatic.

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

## 2. STATION vs CEILING — the additive model (rewritten post-review)

*The original §2 proposed turning each `domains.{primary,secondary,tertiary}` from a string into a `{traditionId, tierCeiling, station}` object. **That is a breaking type change, not the additive migration it claimed** — those fields are bare traditionId strings compared by identity (`trad === primary`, `antipodeOf(primary, index)`) in `domainAccess` (traditions.js) and ~11 call sites. The object-swap breaks every one. Withdrawn. The version below delivers every design goal with **zero type change** — CCode's recommended path.*

Two things the current model conflates and this spec separates:
- **Station** = the geometric role chosen at build (`primary`/`secondary`/`tertiary`). Determines foreclosure and the tertiary-adjacency rule. Stays a **string**, exactly as today.
- **Ceiling** = the max tier learnable in a domain. Today it's derived from station. This spec lets it be **overridden per-domain** by promotion.

**Keep the strings. Add three parallel, optional, absent-tolerant structures:**
```
character.domains = { primary: "reach_death_life", secondary: "...", tertiary: "..." }   // UNCHANGED — strings

character.foreclosed      : [traditionId, …]           // antipodes closed by promotion/acquisition
character.domainCeilings  : { [traditionId]: tier }    // per-domain ceiling override; ABSENT ⇒ derive from station (today's behavior)
character.domainsAcquired : [traditionId, …]           // SNG-102; domains beyond the built three
```

**How each design goal lands, additively:**
- **Ceiling decoupling** — `domainAccess` reads `domainCeilings[trad]` when present, else the current station-derived cap. A character with no `domainCeilings` behaves **exactly as today**. Promotion writes a raised ceiling into that map.
- **Keep-the-ground foreclosure** — `foreclosed` gates only *new* learning and *new* ranking. Nothing reads `foreclosed` to revoke an owned ability, so owned ground is preserved by construction (Law 14 holds because there is no removal path).
- **N-domain support** — `domainAccess` generalizes to iterate `[primary, secondary, tertiary, ...domainsAcquired]` as a membership test. Still string-identity. No type change. (This is the hook SNG-102 lands on.)

**Single source of truth for access:** `domainAccess(ability, tier, character, index)` reads `domains` (strings) + `domainCeilings` + `foreclosed`. Every existing read that passed `character.domains` keeps working; the new structures are consulted when present and ignored when absent. **The migration only ever ADDS these three fields to a save — it never rewrites `domains`.** That is what "additive" actually means, and this version earns the word.

## 3. FORECLOSURE — the bifurcation (Erik's ruling, exact)

**On promotion, the promoted domain's antipode (`steps=12`) is added to `character.foreclosed`.**

- A **tertiary** promoted to secondary: its antipode was previously *penalized-reachable* (steps=12 from a tertiary is not auto-closed under the current model — only primary/secondary antipodes close at build). Promotion **newly closes it.** This is the decision with teeth: before, you could dabble at both ends of that axis via the penalized ring; after, you have chosen your end.
- A **secondary** promoted to primary: its antipode was already closed at build. No new foreclosure; promotion here is purely a ceiling lift.

**Foreclosure is directional (Erik's ruling — KEEP THE GROUND). Named against the LIVE rank system (post-review):**
```
foreclose(antipodeId) means, for NATIVE (nativeOrCombination !== "combination") abilities of antipodeId:
  • BLOCK: learnAbility                 — no NEW native ability in antipodeId by ordinary means
  • BLOCK: autoAdvancePracticedRanks    — skip; a foreclosed native does not auto-rank-2 through use
  • BLOCK: markDefiningMoment           — engine refuses rank 3 on a foreclosed native
  • PRESERVE: every already-owned antipodeId ability, at its current rank, fully usable
  • PRESERVE (BRAID EXEMPTION): a combination/braid ability spanning this axis is NEVER foreclosed —
                                it learns, ranks, and masters normally. foreclosed gates NATIVES ONLY.
```
*Rank blocking is new to this version: ranking became through-use this session (`autoAdvancePracticedRanks` + `markDefiningMoment`), so "block ranking" now means those two functions must skip `traditionOf(ability) ∈ foreclosed` — but only for natives. The braid exemption applies to all three paths (learn, auto-rank, defining-moment): a foreclosed braid is still fully advanceable, because the braid is the sanctioned road across the very axis foreclosure closes.*

**⚠ Braid exemption requires the classification pass.** `nativeOrCombination` is 0/247 classified at HEAD. Until an ability is tagged, foreclosure cannot safely tell a native from a braid. This is why SNG-101 depends on the classification pass — see header.

You do not un-become what you'd started to be. You commit against *deepening* it. The road forward shuts; the ground under your feet stays yours.

**The braid clause is non-negotiable:** foreclosure must never touch `combination`/braid abilities. A foreclosed antipode is still reachable *as a braid*, which is the entire weight of the cross-pole system. `foreclosed` gates **native/single-tradition** learning and ranking only.

## 4. THE STANDING BAR — what earns a promotion

**Built by SNG-100b, not reused.** *(Corrected: the `accessGates` capstone bar is content-only at HEAD — `domainAccess` enforces no standing whatsoever, and per-people standing doesn't exist as a score. SNG-100b builds the primitive.)* On that primitive, the bar is — **greatness is taught, not bought:**

| Promotion | Requires |
|---|---|
| Tertiary → Secondary (unlocks Tier III) | Deep standing with that people: **teacher met + willing**, **reputation ≥ threshold**, **N ranks already earned in-domain** (you've done the work up to your current ceiling). |
| Secondary → Primary (unlocks Tier IV–V) | The full capstone bar: the above **plus** sustained region presence and the domain practiced *to its current ceiling* (every Tier-III ability at rank ≥2, i.e. you've genuinely exhausted what secondary allows). |

**No skill-point cost.** Promotion is not bought; it is *recognized*, exactly like `markDefiningMoment` recognizes rank 3. The standing is the price.

Thresholds live in a new `traditions.json` → `promotion` block (tunable, not hardcoded), read against SNG-100b's per-people standing score, teacher flag, and region-presence record:
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
| `state.js` | On load, if absent, seed `character.foreclosed` with the primary+secondary antipodes (today's implicit closed set, now made explicit) and leave `domainCeilings`/`domainsAcquired` unset (absent ⇒ station-derived, unchanged behavior). Idempotent, `reconcileVersion`-gated. **Additive only — `domains` strings are never rewritten.** |
| `traditions.js` | `domainAccess` generalizes: read ceiling from `domainCeilings[trad]` if present else station-derived; iterate `[primary, secondary, tertiary, ...domainsAcquired]` for membership; treat `trad ∈ foreclosed` as closed **for natives only**. Signature gains `character` (or the extra maps) — all ~11 call sites pass the character already or trivially can. |
| `progression.js` | `promotionEligible(character, domainKey, rules) → {eligible, missing[]}` (reads SNG-100b standing); `promote(character, domainKey)` — writes raised ceiling into `domainCeilings`, adds antipode to `foreclosed`, updates the `station` string. **`learnAbility` + `autoAdvancePracticedRanks` + `markDefiningMoment` all skip `traditionOf(ability) ∈ foreclosed` for natives; braids exempt on all three.** |
| `gm.js` | `offerPromotion` op (narrative surface only) + whitelist + sanitizer clamped to `{domainKey}`. Engine ignores it unless `promotionEligible` is already true — the GM can't hand a promotion any more than it can hand mastery. |
| `app.js` | Promotion offer card (claimable, like a ripe combo); the **commit modal** naming the foreclosure cost; domain panel shows ceiling + any foreclosed axes. |
| `skilltree.js` | A foreclosed antipode renders `FORECLOSED` (visually distinct from `LOCKED` — locked is "not yet", foreclosed is "you chose otherwise"), except braid nodes on that axis, which stay reachable. |
| `tests/content_ci.mjs` | Validate the `promotion` block shape; assert every `foreclosed` reference resolves to a real `steps=12` antipode. |

## 7. THE ENDGAME FALLS OUT — do not build a rule for it

There is **no** "you may not master everything" rule, because the geometry already forbids it: **every promotion adds a closed diameter to `foreclosed`.** A character who promotes widely accretes foreclosures — the more domains you raise, the more far-sides you shut. "Own the whole circle by ordinary means" is **geometrically unreachable**, by construction, with zero enforcement code.

Mastery is therefore *definitionally* someone standing at a pole with a maximal braid-set spanning their own foreclosures — the completed pilgrimage, not the dissolved self. The philosophy is the mechanic. (Erik + Aevi, this session — the reframe is ratified; do not add a flat "collect-all" endgame.)

## 8. NON-GOALS / GUARDS
- **No new road to the antipode.** Foreclosure never loosens; the braid remains the only exception. If any code path lets a foreclosed **native** ability be learned or ranked (via learn, auto-rank, OR defining-moment) by ordinary means, that is a P0 bug — it dissolves the braids.
- **Braid exemption is unconditional and requires classification.** A foreclosed **braid** must always learn/rank/master normally. This cannot be implemented safely until `nativeOrCombination` is classified (0/247 at HEAD) — hence the hard dependency. Shipping foreclosure before classification would foreclose braid nodes: the P0 above, guaranteed.
- **No confiscation.** If a `promote` call would ever lower a `tierCeiling` or strip an owned ability, it must throw. Law 14 is a hard invariant here.
- **No auto-promote.** `promote` is only ever called from the commit UI action. `offerPromotion` sets no state.
- **Acquisition is out of scope** — that's SNG-102. This spec only moves *existing* chosen domains up the chain.

## OPEN QUESTIONS — RESOLVED (CCode ROUND 2, verified at HEAD)
1. **Save-shape:** `character.domains.{primary,secondary,tertiary}` are **bare traditionId strings**, compared by identity across `domainAccess` + ~11 sites. → drove the additive §2 rewrite.
2. **Closed set:** closed-opposite is **computed on-the-fly** (`antipodeOf(primary)`, `antipodeOf(secondary)` in `domainAccess`); there is no persisted `foreclosed`. → §6 `state.js` makes it explicit, additively.
3. **Reputation:** `standingWith` is **per-settlement** (deeds-based); per-people standing **does not exist as a score** — `peopleDisposition` is display-only. → drove **SNG-100b** (build the per-people primitive).
4. **skilltree:** the Phase-3 `state` field **extends cleanly to `FORECLOSED`.** Confirmed by CCode. ✓

*Full review: `po/SPEC_SNG-101_102_CCODE_REVIEW.md`. Disposition: `po/SPEC_SNG-101_102_AEVI_DISPOSITION.md`.*
