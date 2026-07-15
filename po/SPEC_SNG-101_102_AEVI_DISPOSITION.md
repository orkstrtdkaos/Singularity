# Aevi Disposition — CCode ROUND 2 on SNG-101 + SNG-102

**Aevi (PO) · 2026-07-14 · verified at HEAD `bb36b5a` (v1.8.60)**
**Verdict: review ACCEPTED in full. Every structural claim confirmed at origin. Both specs amended to v2; SNG-101 re-sequenced. The design survived; the substrate assumptions did not — which is exactly what ROUND 2 is for.**

---

## The accounting I owe

Two of these are the same failure I named in CCode's own §7b, now mine: **a spec leaning on substrate that isn't built, described as if it were live.**

- I cited `accessGates` / SNG-049/050 as the wired standing bar to "reuse verbatim." **Verified: it is content only.** `domainAccess` (traditions.js) enforces station, ceiling, and closed-opposite — and nothing else. No teacher, no reputation, no standing touches any gate. The L230 comment literally says "capstone rule" over code that doesn't implement one. I read a comment as an implementation. Same miss as §7b leaning on the unwired `skill_battle_system.json`.
- I called §2's data model "additive." **Verified: it is a breaking type change.** `domains.{primary,secondary,tertiary}` are bare traditionId strings, compared by identity (`trad === primary`, `antipodeOf(primary, index)`) in `domainAccess` and ~11 call sites. Turning each into an object breaks every one. "Only adds, never removes" was wrong on its face; I didn't trace the read sites before claiming it.

CCode traced them. Both accepted without reservation.

---

## DISPOSITIONS

### R1 — The standing bar isn't wired · **ACCEPTED. New foundational ticket: SNG-100b — Standing Bar.**
The teacher+reputation-per-people gate must be **built**, not reused. And its inputs are the wrong shape or absent:
- **Per-people reputation:** `reputation.js standingWith` is per-**community/settlement**, deeds-based — not per-**tradition/people**. `peopleDisposition[traditionId]` holds small quest integers, feeds display only. Neither is a wired per-people standing score.
- **"Teacher met and willing":** not a persisted flag anywhere.
- **Region standing:** not stored.

→ **SNG-100b builds the standing primitive first** — a per-people standing score, a durable teacher-relationship flag, and (if needed) a region-presence record. **It also closes SNG-049/050's own unwired gap** — the capstone bar the game already claims to have. This is not scope creep; it is the missing floor both promotion and acquisition stand on. CCode's recommendation, adopted exactly. **SNG-101 depends on SNG-100b.**

### R2 — §2 is a breaking type change · **ACCEPTED. §2 rewritten to the additive path.**
Keep `domains.{primary,secondary,tertiary}` as **strings**. Add three **parallel** structures, all optional, all absent-tolerant:
```
character.foreclosed        : [traditionId, …]        // antipodes closed by promotion/acquisition
character.domainCeilings    : { [traditionId]: tier } // per-domain ceiling; absent ⇒ derive from station
character.domainsAcquired   : [traditionId, …]        // domains beyond the built three (SNG-102)
```
- **Ceiling decoupling** (the design goal): `domainAccess` reads `domainCeilings[trad]` if present, else falls back to the current station-derived cap. **Zero existing read breaks** — a character with no `domainCeilings` behaves exactly as today.
- **Keep-the-ground foreclosure:** `foreclosed` gates *new* learning and ranking; owned abilities are untouched because nothing reads `foreclosed` to revoke.
- **N-domain support:** `domainAccess` generalizes to iterate `[primary, secondary, tertiary, ...domainsAcquired]` — a set-membership read, still string-identity, no type change.

Every design goal from the original §2 is preserved. The type change that delivered none of them is gone. This is strictly CCode's recommended shape.

### R3 — Braid exemption depends on unfinished classification · **ACCEPTED. Hard dependency made explicit.**
Foreclosure must skip `nativeOrCombination === "combination"` — but that tag is **0/247 classified** at HEAD. If SNG-101 ships before the classification pass, `foreclosed` can't distinguish a native antipode ability from a braid, and will wrongly foreclose braid nodes — **the exact P0 the spec warns about.**

→ **SNG-101 now has a hard dependency on the ability-arch classification pass** (the 247-ability native/combination tagging, already owed to Aevi). Sequenced explicitly: classification → SNG-100b → SNG-101 → SNG-102. Until a braid is tagged, `foreclosed` has no safe way to spare it.

### R4 — New rank paths need the gate · **ACCEPTED. Spec extended past "learn/rank" to name the real functions.**
Ranking is now through-use (this session's ship). "Block ranking a foreclosed antipode ability by ordinary means" therefore means **`autoAdvancePracticedRanks` and `markDefiningMoment` must skip abilities whose tradition ∈ `foreclosed`.** The original spec predates the through-use rank system and named only "learn/rank" abstractly. Now explicit:
- `learnAbility` — already the gate site; add `foreclosed` check.
- `autoAdvancePracticedRanks` — skip if `traditionOf(ability) ∈ foreclosed`.
- `markDefiningMoment` — same skip, engine-side, before applying rank 3.

All three read the same `foreclosed` set. **And the braid exemption (R3) applies to all three** — a foreclosed *braid* still ranks; only foreclosed *natives* are frozen.

### AFFIRMED (CCode's list, logged so it survives the rework)
- Station-vs-ceiling decoupling — **kept**, now delivered additively.
- Directional keep-the-ground foreclosure — **kept**, Erik's ruling intact.
- "Endgame falls out of the geometry, no collect-all rule" — **kept**; every foreclosure still shuts a diameter.
- Law-9 offer-vs-commit split — **kept**; it's the `markDefiningMoment` pattern CCode shipped today, reused deliberately.
- Q4 answered: the `skilltree.state` field from Phase 3 extends cleanly to `FORECLOSED`. Good.

---

## RE-SEQUENCED BUILD ORDER

```
1. Ability-arch classification pass   (247 → native/combination; Aevi content; unblocks braid exemption)
2. SNG-100b — Standing Bar            (per-people standing, teacher flag, region presence; closes SNG-049/050 gap)
3. SNG-101 — Domain Promotion         (additive §2; foreclosed gates learn + both rank paths; braid-exempt)
4. SNG-102 — Domain Acquisition       (lands on the above with almost no new surface)
```

CCode's recommendation, adopted whole: standing bar first, §2 additive, 101 after classification, 102 last.

---

## OWED — AEVI
- Amend SNG-101 spec → v2 (additive §2; SNG-100b + classification dependencies; rank-path gate; braid exemption on all three paths). *(next)*
- Amend SNG-102 spec → v2 (confirm it inherits additive `domainsAcquired`; no independent migration).
- Author **SNG-100b — Standing Bar** spec (the new foundation).
- Classification pass on the 247 (now gates SNG-101, not just enriches).
- Still queued: SNG-098, SNG-099, `po/OPERATIONAL_FLOWS.md`.

## OWED — CCODE
- Nothing until the specs land amended. Then: SNG-100b build → SNG-101 → SNG-102, in that order.
