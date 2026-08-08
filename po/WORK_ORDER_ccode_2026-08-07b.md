# WORK ORDER — CCode — 2026-08-07 (second, supersedes the first)

**From:** Aevi (PO) · Ordered by dependency. **SNG-357 harness is shipped; everything below assumes it.**

---

## 1 · SNG-366 — DELEGATED WORK ON WORLD DAYS ⛔ DO THIS FIRST
`po/SPEC_SNG-366_delegated_work_on_world_days.md` · **Erik ratified.**

**⛔ It unblocks 2 and 12, and it is small.** `advanceAssignment()` already writes
`lastMovedWorldCount = worldCount()` — **the stamp has always been there; the gate never read it.**
Gate **per-assignment**: `worldCount() - (lastMovedWorldCount ?? stampedAtWorldCount) >= INTERVAL`.
Suggest 72 (~3 real days); Erik's number, harness can sim it.

⚠️ **Lift ONLY the assignment block out from under the `elapsed <= 0` early-return at `worldtick.js:235`.
Do not repoint the whole tick.** ⚠️ **Catch-up needs a digest** — a month away is ~10 intervals, and ten
separate progress notices would feel worse than the silence they replace. PO lean: cap ~3, one digest line.

## 2 · SNG-358 — POST (then enterprise; household NOT here)
`po/SPEC_SNG-358_...` + `po/REPLY_aevi_SNG-358_holdings_review.md`

**Your review won on all three points and the spec is amended to match:** shared base discriminated by
`kind`, a **condition that moves both ways** rather than a counter to a terminus, household out entirely.
⚠️ **Erik's save calls it a FORGE, not a smithy** — key the migration on the save's vocabulary, not the spec's.

## 3 · SNG-363 — NEWS DISTANCE GATE ⛔ AMENDED — DO NOT INVENT THRESHOLDS
`po/SPEC_SNG-363_...` §2 rewritten at `b5a898d0`.

**Call `spreadDeeds`, do not reimplement it.** Weight 1→2 communities, 2→5, 3→12. **And the `whois.js`
TIER_MEANING ladder is already a distance ladder** — *"a name in their own country"* / *"known well beyond
where they started"* — so actor tier widens reach. ⚠️ **`impactsLocal: true` bypasses the gate entirely.**
⚠️ **Ledger entries have no `weight` — try `Σ|spectrumDeltas|` on the same 1/2/3 band before adding a field.**
⛔ **Trace `where: "gen-object-object"` first** (3 of 8 live entries) or the gate inherits unplaceable events.

## 4 · SNG-365 — RATE SUB CONSUMERS
`po/SPEC_SNG-365_...` @ `63e4a211`

`agility`→`resolve.js:111` first (simplest, proves the pattern) · `wits`→crit · **`insight`→attunement:
ERIK RATIFIED, THEY SUM** · **`presence` has TWO consumers** — renown (⛔ **do not inherit the `d.weight > 0`
guard; renown is not merit-signed**) and social TAG_MODS. ⛔ **Erik ratified the anti-double-dip: the social
bonus fires EXCEPT when `presence` is the rolled sub.** ⚠️ Three milestone effects (harm-rung drops,
novel-penalty removal) are not addends and need their own hooks — **your call where.**

## 5 · SNG-367 — FIGURE PORTRAITS (content shipped, engine yours)
`po/SPEC_SNG-367_...`

⛔ **33 of 34 NPCs in Silas's save draw from the literal string `"a person"`.** `people` layer now authored
for all 26 traditions (`9e5d62ac`, `f6c473c4`). **`npcPromptSeed` should take `ctx.aesthetic` the way the
ability path already does**, composing form → tradition.people → role → tier → style.
⚠️ **An authored `form` MUST WIN over the tradition layer — that is what stops Erik's Ent rendering human.**
⛔ **The upstream fix: figure generation should AUTHOR `form`.** Also `whois` needs the ability path's
`.replace(/[-_]+/g," ")` — the popup is showing `precursor_nanite_cold_noesis` raw.

## 6 · SNG-359 — BACKLASH NARRATION + CONSERVE
Content shipped (23 abilities carry `backlash` + `conserveSuppresses`). **§2a is most of the value and is
tiny: hand `ability.backlash` to the GM when backlash fires.** ⚠️ Fold with your `applyBacklash` finding —
they are one feature. **Open question still yours: conserve-suppresses-collateral as code or GM guidance.**

## 7 · SNG-355 — PARTY ENTRY/EXIT · 8 · SNG-353 — COMPANION PANEL
Unchanged. ⚠️ 353 renders a completed bond bar until 9 lands — ship after, or accept it.

## 9 · SNG-361 — BOND EVENT LOG ⛔ BLOCKS ALL BOND TUNING
Encounters and assists leave no trace; every bond figure is a lower bound on an unmeasurable.
**Append-only at the `growBond` chokepoint. `actionCount` is the load-bearing field.**

## 10 · SNG-356 — LADDER WIRING
Registered in the manifest; ⚠️ **registration is not arrival — `state.js` must LOAD it.** Derived grants are
safe. ⛔ **The `roll` column is Erik's call on your harness evidence, not mine.** ⚠️ **Re-run §1c** — the
rank-1-2 baseline inflation is fixed (`38de12ae`), strength 4 now gives +16 not +32.

## 11 · SNG-350 — EMIT THE COPY INVENTORY
`po/staged_content/rule_copy_inventory.json` — `{line, text, falsifiedBy, surface}`. ⚠️ **`surface` matters
more than `line`.** Then I author; you wire the reader and delete the inlines **in the same change**.
**Energy (14) first. `sub_attribute_ladder` (8) LAST — it changed twice today.**

## 12 · NEWS SECTIONS (Erik) — AFTER 1 AND 3
Three sections, three existing sources: **the world turning** (arcs/events) · **your work while you were
elsewhere** (assignments — ⚠️ **always empty until 1 lands**) · **word from elsewhere** (deed spread +
ledger — ⚠️ **floods until 3 lands**). ⛔ **Sectioning first shows an empty middle and a flooded third.**

---

## STANDING
- Only Aevi closes, and only on symptom reproduced at authenticated origin.
- ⚠️ **If a number in a spec does not reproduce, say so — do not build to it.** Four of my claims were
  wrong today and Erik or you caught every one.
