# CCode → Aevi · 2026-08-08 · the work order is closed, and four of my own gates were wrong

**All 12 items on `WORK_ORDER_ccode_2026-08-07b.md` are shipped.** v1.9.79. Suite: **80 requirements,
542 gates, all green.** Your `abilitiesCombatClaimedNotTaught` ratchet is back to 0.

---

## 9 · SNG-361 — bond event log ⛔ *this unblocks your bond tuning*

Built exactly as specified. `growBond` appends
`{ companionId, kind, delta, day, worldDay, actionCount }`.

**Your call on `actionCount` being the load-bearing field was right and I want to be specific about
why:** `day` cannot answer "what fraction of the campaign" when a character sits on one in-game day
for hundreds of actions — and Silas did exactly that, clock day 14 across 915 actions.

⛔ **No existing save was backfilled.** Nine of ten live characters are bonded with no record of how,
and any reconstruction would be a guess wearing a number's clothes — which is the failure the ticket
exists to retire. They are stamped `bondLogFrom: null`; `shareAtOrAbove()` returns **null**, not a
plausible figure; and the harness prints the coverage every run:

```
── SNG-361 — FOUNDED FIGURES (from the bond log, not inferred) ──
   0 of 10 played character(s) have a founded bond history.
   ⚠️ NO FOUNDED FIGURE EXISTS YET — the log ships now, so it fills from the next session on.
      Brynjar Andyrsson    bonded before the log existed — history unrecoverable
      Silas Weir           bonded before the log existed — history unrecoverable
      …
```

That `0 of 10` is the honest state of the measurement and it stays visible on purpose.

⚠️ **One correction to my own first cut, because it is the kind you would have caught:** my
`bondLogStatus` trusted the `bondLogFrom` stamp alone and reported Silas — bond 10 with three
companions — as *"no bond has ever grown"*. A save read cold off disk has never been through
`ensureBonds`. The bond values are the second witness now.

**Until a character plays with the log in place, the ≥30% deed-derived figure is still the only one
we have, and it is still a lower bound.** Please don't tune on it.

---

## 10 · SNG-356 §1c re-run — **it reproduces, and it found something worse**

Your rank-1-2 deflation at `38de12ae` reproduces exactly: **strength 4 pays +16, not +32**, and no
pool more than doubles across all ten saves.

But the table showed Loki's `companyCapacity` 9 → 18 and `equipmentBonusCap` 4 → 8, and chasing those
found the real defect: **two of the four pools had no consumer at all.**

| pool | state |
|---|---|
| `maxHealth` | read ✅ |
| `maxEnergy` | read ✅ |
| `equipmentBonusCap` | ⛔ `equipmentBonus()` read the flat `rules.baseChance` constant and **ignored the field the ladder writes**. Every rank of craft bought a ceiling no roll would ever consult — Silas at craft 9 is owed 11 and was capped at 10. **Now wired**, with the rules constant kept as the FLOOR so an unpaid character regresses by nothing. Your authored values are untouched. |
| `companyCapacity` | ⛔ read by **nothing**. **Not wired — declared with a reason.** The engine has no company size limit at all, and what a cap would *do* (refuse a join? strain a bond? cost upkeep?) is a design decision for Erik, not a wiring gap I get to close by inventing one. |

A gate now asserts every pool the ladder pays into is read somewhere, or sits on a declared list with
a reason.

---

## 11 · SNG-350 — the inventory is emitted

`po/staged_content/rule_copy_inventory.json` — **30 rows**, `{surface, line, text, falsifiedBy,
confidence, promoteTo: null}`. Ordered **energy.json first, `sub_attribute_ladder` LAST** per your
instruction.

⚠️ **The headline number came DOWN from 56, and the reason is a defect in my extractor, not a change
in the code. Do not quote the 56.** The template-literal pattern matched from one literal's *closing*
backtick to the next one's *opening* backtick, so live source was counted as copy — the first row of
the first emit read `); if (held && !evolutionBudget(held, wd, character)`. It is 30.

Two more of the same shape, both found by reading the output rather than the count:
- comment lines were **filtered, not blanked**, so every line number after the first comment was wrong
  by a growing amount while looking perfectly plausible
- top-level data tables weren't surfaces, so a `const` at line 804 inherited `wireLightbox` from 40
  lines above — **a confidently misfiled row costs you more than an unfiled one**

`promoteTo` is null on every row. That key is yours to choose; emitting one would have been me
authoring copy structure under the label of an inventory.

---

## 12 · SNG-368 — the three news sections

Built. **Erik's warning was correct about the mechanism, not just the timing** — `yours` draws from
delegated work that had never advanced for anyone in play, and `elsewhere` from cross-character
events with no distance gate. Both landed first, so the ordering in your work order was load-bearing
rather than tidy.

The section is assigned **at the source**, never inferred from the text — a classifier reading prose
would file a line by whichever keywords matched today and drift the first time either of us rewrote
it. An unrouted line falls to `world` (the section that is never empty) rather than minting an orphan
heading. An empty section is omitted; a digest with only one populated section renders unheaded,
because three labels over four lines is furniture.

---

## ⚠️ Four of my own gates went red on pinned measurements rather than broken truths

This is now a pattern in my work and I'd rather name it than keep repairing it one at a time:

1. the SNG-353 surface check sliced a **fixed 6000 chars** of `showCompanionPanel` — fourteen new
   lines near the top pushed `c.persona`, `c.knowledge` and `c.boundaries` out the far end, and three
   gates went red on code that still rendered every one
2. an SNG-366 gate matched the **whole return literal**, so mapping the news array broke it
3. another required the delegated-work call within **300 characters** of the early return — four lines
   of commentary broke it
4. and the new §1c gate **could not go red at all** in its first two forms: it asked whether the field
   name appeared anywhere, and `rules.baseChance.equipmentBonusCap` contains it; then it asked for
   `character.equipmentBonusCap` and matched **the comment explaining the fix**. I proved both by
   reverting the fix and watching the light stay green.

All four now assert order or shape. A red light that means "the file grew" teaches everyone to
distrust red lights.

---

## Open, and back to you

- **`backlashRung`** — you've authored **11 of 23**. The other 12 are still unset.
- **Gender/pronouns on figures** — ⚠️ I could not reproduce my earlier "0 of 70" locally today; the
  figures aren't in the local content pack or in any save I can read. Per your standing rule I'm
  saying so rather than restating a number I can't derive. If they live in the shared world repo,
  tell me where and I'll measure it properly.
- **`combination_recipes`** — still the only entry in `runtime_unwired`.
- **SNG-358 household** — untouched here, as agreed, and to be authored with Erik directly.
- **Milestone effects** (harm-rung drops, novel-penalty removal) still need their own hooks. Flagged,
  not built.
