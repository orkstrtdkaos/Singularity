# RULING — Training gate, tome mechanism, Threnody, save migration, generative pipeline

**Ruled by:** Erik · **Date:** 2026-09-01 · **Recorded by:** Aevi
**Responds to:** `po/BUILD_STATUS_axis_balance.md` (v1.9.299) · closes the R19×R12 collision
**Flow:** `OpFlow_RulingRequest` — ruling recorded, dependent work named, unblocks stated

---

## R20 — Tier gate on training REMOVED; training unlocks at level 10 ✅ RULED

⛔ **R19 is retracted.** It gated rank-up purchasing on tier N+2 opening. Composed with R12's band
placement it produced: T1 trainable at **L21**, T2 at **L35**, T3 at **L48**.

### The measurement that killed it

**Silas, L30, 31 crafts stuck at rank 1:**

| gate | trainable at L30 |
|---|---|
| R19 as ruled (N+2) | ⛔ **3%** |
| CCode's proposed fix (N+1) | ⛔ 16% |
| **R20 — no tier gate** | ✅ **100%** |

⚠️ **Neither tier gate works, because a played sheet is not tier-sorted.** Silas's stuck crafts
span T1–T5 plus 13 custom records that carry no tier at all. R17's entire case for cheap training
was those 31 crafts; the gate reached almost none of them.

### ✅ THE RULING

**No tier gate. Training unlocks globally at level 10.** After L10, any craft the character owns
may be trained to rank 2 at `tierPrice` (R17).

**What this preserves from R19's intent:** you cannot deepen at level 1. Acquisition comes first
(R14: 1–10 personal), deepening second. **What it drops:** the pretence that a character's shelf
sorts by tier.

### Corroborated across all 16 saves

| finding | |
|---|---|
| characters with **zero** rank-2 crafts | ⛔ **12 of 16** |
| most skill points anyone has banked | **3** (Silas holds 2 at L30) |

➡️ Rank-up barely happens in play. The gate was throttling something already rare.
➡️ ✅ **And the Insight-dumper overflow is confirmed theoretical** — no live character banks points.

⬜ **OI-21 unchanged:** T4/T5 remain practice-and-GM only until Erik's pass.

---

## R21 — `adjacent` and `acquired` ceilings ✅ CONFIRMED

CCode's assumption stands: **adjacent 3, acquired 2.**

Erik: *"that's ok since we have other ways to increase tier access and upgrade poles."* The ceiling
is not the only path to depth — pole upgrade and tier access exist alongside it.

**Completed ladder:** primary 5 · secondary 4 · **adjacent 3** · tertiary 3 · far 2 ·
**acquired 2** · antipode **derived from `lean`** (R16).

---

## R22 — Tomes and artifacts are ONE mechanism ✅ RULED

Erik: *"Tomes are just a flavor way of describing an object that grants a skill when you have the
skill points to use for it. We can dress them up as precursor artifacts — quest items — miracle
grants etc… So one mechanism."*

**One mechanism: an object that grants access to a craft, which the character then buys with skill
points as normal.** The object removes the *access* barrier, never the *cost*.

| flavour | same mechanism |
|---|---|
| tome | ✅ |
| precursor artifact | ✅ |
| quest item | ✅ |
| miracle grant | ✅ |

⬜ **Unblocks build step 8.** `character.tomes` has a reader and no writer. CCode: the writer is
generic — any object carrying a craft grant. Aevi: authored content follows once the shape lands.

---

## R23 — Threnody emotional range: author more emotional abilities ✅ DIRECTION GIVEN

**The measured problem:** Threnody carries 15 crafts — 12 grief, joy 2 (never the subject),
love / hope / longing / awe **= 0**.

Erik: *"we need more emotional abilities — consider the romance and sex spec Aevi wrote up recently
(CCode reviewed it). Perhaps some skills could affect those elements?"*

### ✅ Direction

1. **Author emotional abilities beyond grief** — the tradition is Pathos, not mourning. Joy, rage,
   love, hope, longing, awe are all live territory.
2. ⚠️ **Cross-connect with the romance/attraction spec.** Crafts may legitimately *affect* the
   attraction and relational systems rather than sitting beside them. That is the connective tissue
   the emotional domain has been missing.
3. **The `civilization` prose should name the full-emotion scope**, not reflect the grief
   monoculture the current craft list demonstrates.

⛔ **Blocked on C6 first.** CCode's review found `SPEC_SNG-NPC-ATTRACTION`'s eligibility gate has no
data behind it. **Aevi must resolve C6 before authoring crafts that reach into that system** —
otherwise the new crafts target a gate that does not hold.

➡️ Unblocks §2b and §2c of `SPEC_tradition_narrative_npc_pass.md` once C6 clears.

---

## ⛔ NEW FINDING — saves carry pre-audit ability ids and were never migrated

**Traced at Erik's instruction** after Aevi wrongly reported crafts as orphaned.

`content/packs/core/rules/ability_rename_map.json` (SNG-501, 377 entries) exists precisely for
this: the 2026-08-14→16 audit's naming SOP §31 stripped `the_` from **ids** as well as names.

### Correct classification — all 142 ability rows across 16 saves

| | count |
|---|---|
| ✅ live in corpus | 79 |
| ⚠️ **stale id, resolvable via rename map** | **22** |
| ✅ `customAbilities` (braids + bond-taught) | 13 |
| ✅ baseline kit (lives in `martial_paths.json`) | 4 |
| ⛔ genuinely orphaned | **0** |

Examples: `the_raised_thing` → `raised_thing` · `the_shadow_work` → `shadow_work` ·
`the_warding_mark` → **`named_exclusion`** (a merge, not just de-articling) ·
`total_focus` → `unmoving_mind`.

⚠️ **Silas's rank-3 and rank-2 crafts are in this set.** They work in play but carry pre-audit ids.

➡️ **OI-24 — save migration pass.** Apply the rename map to all character sheets. The map was
built and applied to content; **saves were never swept.** Affects every existing character.
Not urgent for play, but it must precede any audit that reads sheets as ground truth.

---

## ⛔ NEW FINDING — the generative pipeline has no path to the corpus

Erik on Marrow's Wings: *"that's one of my all time favorite skills I developed with Silas by
braiding… that type of generative nature needs to have a clear pipeline to the skill base list."*

**13 `customAbilities` across the saves. Two generative sources, neither with a path home:**

| source | example | shape |
|---|---|---|
| **braiding** | `braid_order_sense_palework` — *"Ashen Meridian"* | full record: `tradition`, `functions`, `harmRung: lethal`, `notFor`, description |
| **bond teaching** | `marrow-s-wings`, `the-attended-end` — `taughtBy: "Marrow (bond)"` | full record with `axes`, `notFor`, `narrationHints` |

⚠️ **These are authored content — just authored at runtime and never collected.** They carry every
field the gate checks. They cannot be audited, balanced, or offered to another character.

➡️ **OI-25 — generative-to-corpus pipeline.** A path from `customAbilities` to the canonical
skill base list. Related prior work exists (`SPEC_SNG-369_seed_braid_store_from_catalogue.md`,
`SPEC_SNG-370_nary_braids.md`) — **read those before speccing.**
⬜ Needs a promotion gate: which runtime crafts earn a place in the corpus, decided by whom.

---

## ⚠️ Aevi process note — recorded, not excused

**Three times this session Aevi concluded absence from a partial scan:** the v2 domain structure
(read the old traditions file), the `harmRung` rank question (reasoned from a table instead of
`engine/intent.js`), and these craft ids (scanned HEAD without checking for a rename map).

Erik's standing correction: ***"you should be looking this stuff up — don't guess."***

➡️ **The specific discipline being skipped: check whether a mapping, migration, or index exists
before declaring something missing.** Absence at HEAD is not absence.

---

## Open items after this ruling

| OI | item | owner |
|---|---|---|
| OI-19 | Thin domains — Life 3, Spirit 4, Angelic 5, Demonic 5 tier-1 crafts. Blocks creation for 4 domains | Aevi |
| OI-20 | Per-rank `backlashRung` in `tree[]` — ~88 crafts | Aevi |
| OI-21 | T4/T5 — should any be trainable? | Erik, deferred |
| OI-22 | R18 backlash percentage table | Aevi propose |
| OI-23 | Reconcile `surgeBacklashByTier` with `backlashByRung` | CCode — proposal filed |
| OI-24 | **Save migration via rename map** | CCode |
| OI-25 | **Generative-to-corpus pipeline** | Aevi spec → CCode |
| C6 | Attraction spec eligibility gate has no data — **blocks R23** | Aevi |
| — | `rankUpAbility` has no UI caller — training unreachable in play | CCode |
| — | R18 tier floor | Erik |
| — | Splurge problem / C7.5 distance pricing | Erik, deferred |
