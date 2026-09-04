# DECISIONS OWED — what the 2026-09-04 build pass could not decide, with the evidence for each

**CCode · 2026-09-04 · v1.9.345** · ⬜ **Erik: every row below is a question only you can answer. Each blocks something
named, and each carries the measurement that makes it a decision rather than a guess.**
> Erik: *"build and fix everything you can — log what needs decisions and then update all documentation and sources of
> truth so we don't regress."*

⛔ **This file is a working paper.** The questions are indexed in `docs/RULINGS.md` → *RULINGS OWED* (Q1–Q13) so they
cannot be lost; when one is ruled it gets a `po/RULING_*.md` with a `bodyAnchor:`, an R-number, and a body sentence.

---

## §0 — WHAT WAS BUILT FROM THE BACKLOG (so the rows below are the remainder, not the whole)

| backlog row | state |
|---|---|
| §1 · the five combat call-site defects | ✅ **built, gated `§60`** (v1.9.344) — `enrichDecl` at the one seam; `rank` beside `tier`; the craft's cost; `layersFor(soak)`; a body in the player seat |
| `SPEC_holding_release_transfer` | ✅ **built, gated `§61`** — `releaseHolding` / `transferHolding` / `takeHoldingEvents`; the GM's `holdingOps` and the Holdings tab both use them; the tick says it once. ⬜ Q5 is the standing cost |
| `SPEC_holdings_migration` | ✅ **already built** (reconcile `offers` + the Holdings tab's accept/dismiss). Silas's `holdings` is empty because the four offers have not been answered in his save, not because anything is missing |
| `SPEC_one_source_of_truth` §4 | ✅ **built, gated `§62`** — a ruling paper may declare `subject:` + `bodyAnchor:`; a declared anchor must be in the body exactly once; the undeclared count ratchets (25, may only fall). R33 is the first to declare |
| `SPEC_associativity` | ✅ **built, gated `§63`** — `scripts/subject.mjs <subject>`: one subject across nine layers, the absences flagged, a short synonym map that cannot rot silently |
| `SPEC_progressive_sheets` | ✅ built (v1.9.343); ⬜ storing a gained craft waits on Q6's rate |
| `SPEC_npc_character_sheets` · `SPEC_npc_sheet_architecture` | ✅ built; R30–R32 now cited in the body (`§7h`) and the index reads ✅ |
| `SPEC_generative_pipeline` | ✅ §5.1 built; ⬜ §5.2 and the nomination queue are Q11 |
| `SPEC_undo_sect_merge` | ✅ the `{bySect}` / `{byRank}` mechanism exists (R27); ⬜ the authoring is Aevi's; `soma` is Q10 |
| `SPEC_party_contributions` | ⬜ Q9 — shape A/B/C is Erik's; Pell and Veth now carry `assistTags`, the other 41 do not |
| `SPEC_holding_attributes` (landed 09-04, `design_open`) | ✅ pass one is a LIST and it is right: a holding is a MODIFIER on a place, and the deltas already exist on locations. ⬜ **Q14 — pass two** (types per size tier, magnitudes, upkeep per type, steward-required types) is Erik's. Nothing to build before it except the shape that lets a holding carry a delta at all — see its ROUND 2 |
| the five follow-ups (Erik 09-04: *“build your whole list”*) | ✅ **built, gated `§64`–`§67`**: the ratchet counts a crash (and surfaced `verification_ledger`, baselined at 1 deliberately); the holdings join + sentence + `provides`/`upkeep` read + the narrator's here-mark; the PC's authored armour reaches the fight seat (best per type); TRUTH ↔ DATA subject markers on body sections (`§3c`, `§7d`, `§7h`, ratchet 20); `byTradition.mix` has a reader (the ground card's `lineageMix`) |
| docs | `HOW_IT_WORKS` body §3c (what a round reads), §7d (the two exits), §7h (R30–R32, the dials, growth); `FIELD_REFERENCE` §5 (the declaration contract) and §11 (the new defect class + countermeasure 9); `PIPELINE` rule 4 (the standing check); `BALANCE` (the two unauthored pool dials); `RULINGS` (R30–R32 ✅, the OWED index) |

---

## §1 — THE QUESTIONS

### Q1 · NPC pools — `npcStanding.healthPerLevel` / `energyBase` ⛔ blocks all NPC combat

**Measured.** A person's sheet is `level × 3` health and **40 energy flat** (`npcsheet.sheetFor`, code defaults; the two
dials are unauthored). A pressure tick costs the opponent **22** energy. In 2,000 seeded Pell–Veth duels both are at 0
energy by round four and bare-hand each other for twenty rounds: **91.6% Pell, 1,832 by pressure, 0 by health.** The
five fixes changed what a blow does (528 impositions vs 0) and not who wins, because energy is the fight.

**Options, priced:** (a) author `energyBase` near the PC's pool (100 + 5/level → Veth ≈ 265) and `healthPerLevel` 5 —
NPCs fight as long as PCs; (b) keep 40 and lower `opponentEnergyLoss` — pressure stops being an energy tax; (c) energy
scales with level like health. ⚠️ The dials exist and are read by both live callers since v1.9.343; **nothing to build.**

### Q2 · damage vs HP curves ⛔ blocks all combat

**Measured (DUEL §C.7):** 102 dice-bearing crafts, mean EV 10.6, median 7; T1 4.6 → T5 28.3 (≈6×); `the_cut_thread` is
5d6+14 (EV 31.5, max 44). A PC at L30 has ~191 health. **Fights end by pressure, not health.** Is `harmRung` the kill
condition and dice the erosion? Today `harmRung` moves no number in a round; it grants finishing potential spent only by
the deliberate ⚡ Finish it. ⬜ A ruling here changes `finisher` and possibly `damage.scaling`; not a tuning pass.

### Q3 · which ground table is the truth ⛔ blocks `SPEC_body_source` §2–§4 and `SPEC_meaning_density`

**Measured.** Three readers: the CARD (`craftSource` → the craft's `powerSystem` → `sourceBands.sources`), the ROLL
(`substrateForAction` → `substrateBand[tradition]`), and a schooled card's BAND (`bandForSchool` → the pure school →
the tradition band). None of them touches a skill-battle round. ⬜ Which table, and should the roll read the craft?

### Q4 · a craft's declaration vs an explicit `primary: null` — no live case

Abyssal was settled (primary veil, 09-03) and 19 of its crafts now declare veil; the deferral path survives on a fixture
(`§58`). ⬜ Only matters if a tradition is deferred again.

### Q5 · the standing cost of RELEASING a holding ⛔ blocks the last line of `SPEC_holding_release_transfer`

**Built without it:** the record carries `reason` and `obligationUnpaid: true`. **Options:** a standing op against the
granting authority with the reason in the ledger (`standing.js` has `applyStandingOps` + `note()`; recovers with time,
cannot be *paid off*), or a payable debt record (new structure — a fourth relationship vocabulary). ⬜ Standing is the
cheaper instrument; a debt you can settle is the better story. Your call.

### Q6 · the growth rates and the service band ⛔ blocks `SPEC_npc_level_balance`, storing a gained craft

**Measured (its ROUND 2):** the chain career → tier exists (`worldtick.js` promotion rules, deeds-gated: 4 / 10 / 22 /
70 / 170) and tier → level exists (`derivedLevel` via `tierFloor`), so **level is already a consequence of tier plus
acquaintance** — §3a's reading is the live one. What has no number: a completion's worth, a `condition` step's worth,
the service band N (Aevi: 5), and whether the three terms stack or take the highest.

### Q7 · `meaningDensity` — derived or stored; two grounds ⛔ blocks `SPEC_meaning_density`

**Measured (its ROUND 2):** no engine reader, no body section — a spec-only subject (`scripts/subject.mjs
meaning-density` says ORPHAN). Derivation is cheap (135 locations, tags already authored). ⬜ What a metaphysical craft
DOES with two grounds is a resolution change and needs your shape first.

### Q8 · the holdings economy's smallest version ⛔ blocks `SPEC_holdings_economy`

**Measured (its ROUND 2):** `economy.js` already has a goods taxonomy (`regionDemand(economy, regionId, goods)` —
`mech_parts`, `living_stock`, `raw_material`, `cut_stone`, `medicines`, `arms`, …), `bargainReach(rank)` exists, and
`advanceHolding` runs on the tick. ⬜ One yield kind, one upkeep, missable — Aevi's instinct is right and it needs your
yes and the two numbers.

### Q9 · party-scale contributions — shape A / B / C; what suppresses the HARM default ⛔ blocks R25a slots 5–6

Unchanged from its ROUND 2: a folded ally is read for `HARM` only, and `HARM` is a default that passes everyone.
`intercept.js::spendProtection` is written and test-only. ⬜ Shape first; then Aevi's tags on 41 more people.

### Q10 · `soma` — both halves or the nearer one; population C of the un-merge

`{byRank}` handles `soma → second_wind + perfect_motion` today (R27). ⬜ Whether a `soma` holder gets both or one is
the one case the sect rule cannot decide; and whether `known_price` / `deduced_strike` split at all.

### Q11 · the generator — one honest rank, marked `wantsAuthoring`

⬜ Changes what a minted craft IS; six saves hold crafts under the old shape. `wantsAuthoring` now reaches the prompt
via the sheet block, so the queue's other half (nomination → promotion) has a surface to land on.

### Q12 · the Sovereign arc — feeding as stage or as effect; agents marked or GM-run

Lore is loaded and nothing implements it (`BUILD_BACKLOG` §5). ⬜ The escalation ladder and the vessel trade each need a
shape before a reader can exist.

### Q13 · marcher → body; the somatic split; per-rank source

**Measured (v1.9.342):** all 39 marcher/somatic crafts declare `metaphysical`; the resolver reads the craft's field, so
the change is content — per craft — and it is yours and Aevi's.

---

## §2 — THE TWO THINGS I FOUND THAT ARE NOT DECISIONS, JUST WORK

- ⚠️ `origins.json` still authors the `harmonic` origin as `nativeTradition: "harmonic"` — a place named as a lineage
  (R33). It works through the origin-id fallback; it is authored wrong. Aevi's.
- ⚠️ `tests/tradition_matrix.mjs` crashes at HEAD (`trad.length` on null) and the ratchet cannot see a crash — no `FAIL`
  line, so it counts as 0. Mine, next pass.
