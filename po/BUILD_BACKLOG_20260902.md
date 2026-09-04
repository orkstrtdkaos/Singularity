# BUILD BACKLOG — everything designed 2026-09-02 and not yet built

**Aevi (PO) · 2026-09-02** · ⬜ **CCode: this is the index. Each row points at its spec.**
> Erik: *"spec all of this so we don't lose what we need to build."*

⛔ **THIS IS AN INDEX, NOT AN AUTHORITY.** Per `OpFlow_RulingEnacted`, a thing is TRUE when
`docs/HOW_IT_WORKS.md`'s body says it. **Rows marked RULED still need enacting there.**

---

## §1 — ⛔ COMBAT: FIVE CALL-SITE DEFECTS. HIGHEST PRIORITY, ALL MEASURED BY CCODE.

| # | defect | why it is first |
|---|---|---|
| **1** | ⛔ **THE CRAFT NEVER REACHES A LIVE ROUND.** `sbDeclare` passes a bare declaration; dice, impositions, pierce and per-rank `harmRung` read off it and find nothing → **family-default dice by tier** | ⚠️ **EVERY TEST SPREADS THE DEF UNDER THE DECL, SO THE GATES ARE GREEN.** The suite constructs the correct input that production does not. ⛔ **With the def present the same duel ends in FOUR rounds** |
| **2** | player's dice follow **owned rank**, not craft tier — `keystone_blow` 7.0 vs 22.7 | a T4 craft hits like a T1 |
| **3** | energy in a round is **flat 5 × intensity** | ⚠️ **a T5 costs what a plain strike costs** |
| **4** | an authored **soak of 11** becomes threat-derived layers of **1** | authored armour is discarded |
| **5** | the **player seat carries no level and no soak** | |

⚠️ **DEFECT 1 IS THE CLASS THIS SESSION KEEPS FINDING** — a reader with no writer, hidden because the test
supplies what production omits. ⛔ **Same shape as `sheetFor`'s `authored` flag, `npcStanding`, `growthFor`,
`folkAccessible`, `local_layouts`.**

---

## §2 — ⬜ RULINGS ERIK OWES, and each blocks a build

| # | question | blocks |
|---|---|---|
| **1** | ⛔ **DAMAGE vs HP CURVES DIVERGE.** Damage scales ~5× across tiers; pools ~10× by level. Median craft **7 dmg** vs **191 HP**. ⚠️ **`the_cut_thread` — *"it simply stops"* — needs 8 castings.** ⬜ Is `harmRung` the kill condition and dice only erosion? | all combat |
| **2** | **NPC pool dials** — an NPC is `level×3` health, **40 energy FLAT**. ⚠️ Nobody has authored `healthPerLevel`/`energyBase`. ⛔ **40 energy is the whole fight: a pressure tick costs 22** | all NPC combat |
| **3** | ⛔ **WHICH OF THREE GROUND TABLES IS THE TRUTH.** The card reads the CRAFT; the roll reads the TRADITION; ⚠️ **and no substrate term enters a skill-battle roll at all** | `SPEC_body_source.md`, `SPEC_meaning_density.md` |
| **4** | **service band N** — how far below the player may someone in your service fall | `SPEC_npc_level_balance.md` |
| **5** | **charge rate** — what a completion and a `condition` step are worth | ↑ |
| **6** | **`meaningDensity`** — derived or stored; what two grounds do to a metaphysical roll | `SPEC_meaning_density.md` |
| **7** | **holdings economy smallest version** — one yield, one upkeep, missable | `SPEC_holdings_economy.md` |
| **8** | ⬜ **do Sovereigns advance an arc's stage, or is their feeding the stage's EFFECT?** | the Sovereign arc |

---

## §3 — THE SPECS, and what each is waiting on

| spec | state | waiting on |
|---|---|---|
| `SPEC_body_source.md` | ✅ §0 built — `craftSource` reads the craft | ⬜ §2 marcher/somatic; §4 **per-rank source** |
| `SPEC_meaning_density.md` | ⬜ ROUND 2 | §2 ruling 3 and 6 |
| `SPEC_holdings_migration.md` | ⬜ ROUND 2 | ⛔ **BLOCKS the economy — Silas's `holdings` is EMPTY** |
| `SPEC_holding_release_transfer.md` | ⬜ ROUND 2 | ⚠️ **release already exists unguarded as a bare `.filter()`** |
| `SPEC_holdings_economy.md` | ⬜ NEW | migration first |
| `SPEC_npc_level_balance.md` | ⬜ NEW | §2 rulings 4 and 5 |
| `SPEC_progressive_sheets.md` | ✅ mostly built | ⛔ storing a gained craft needs the charge rate |
| `SPEC_npc_sheet_architecture.md` | ✅ R30–R32 built | — |
| `SPEC_generative_pipeline.md` | ⬜ ROUND 2 | ⚠️ `wantsAuthoring` is the queue and now reaches the prompt |
| `SPEC_associativity.md` | ⬜ ROUND 2 | ⛔ **the instrument that stops the archaeology** |
| `SPEC_one_source_of_truth.md` | ⬜ ROUND 2 | `ruling_anchor` gate |
| `SPEC_undo_sect_merge.md` | ⬜ ROUND 2 | ⚠️ **superseded in part by R33 — re-read before building** |
| `SPEC_npc_character_sheets.md` | ⬜ ROUND 2 | — |
| `SPEC_party_contributions.md` | ⬜ ROUND 2 | ⛔ **`PROTECT` has no party-scale reader; Munin contributes nothing** |

---

## §4 — CONTENT OWED BY AEVI

| # | item | note |
|---|---|---|
| 1 | **50 NPC sheets** (`docs/ROSTER.md`) | ⚠️ companions first — they fight beside you |
| 2 | ✅ ~~Veth's crafts~~ — **WITHDRAWN, NO WORK OWED** | ⛔ **THE CONTENT IS CORRECT AND AEVI'S DUEL WAS WRONG.** `ashwarden` is authored `primary: metaphysical` **0.94** — *"palework tends endings; what tends endings does not hold a charge."* ⚠️ **And Erik's own Abyssal line settles it: *"they ALONE reach for what is on the far side."* If the Abyssals are alone in it, Ashwarden works THIS side.** Conjuring a bone spike is mind-past-matter, not the far side answering. ⛔ **Aevi invented `ashwarden → veil` for the duel and never checked it** |
| 3 | **six Sovereign seats** | ⛔ **do not fill in one pass** |
| 4 | **Threnody emotional crafts** (R23) | blocked on the attraction gate |
| 5 | **`physicality` for epics/legends** | 73 figures, none has one |
| 6 | **`learnedAt` on non-foothill crafts** | only 6 carry it |
| 7 | **the naming guard** (`AUDIT_naming.md` §3) | ⚠️ 14% of names share one construction |

---

## §5 — THE LORE, WRITTEN AND NOT YET MECHANICAL

`content/packs/valley/lore/the_satiated_sovereigns.md` — **registered in the manifest, loads.**

⬜ **What it implies that nothing implements:**

| | |
|---|---|
| **agents as supply lines** | ⚠️ an agent is *"not possessed — CORRECT"*. ⬜ Is there a mark, or is it purely GM-run? |
| ⛔ **the escalation ladder** | ignored → agents redirected → campaign → **arrival**. ⬜ Does it key off a Sovereign's supply state? |
| **the Hollow King's petition hunger** | ⚑ **his starvation looks like ordinary competence** — a region that solved its own problems |
| **the Unbodied's vessel trade** | ⚠️ `arc_the_poles_pull` already says *"the Cogitarium abandons more bodies"* — **that arc line IS the supply line** |
| ⬜ **the Mythical crossing at ~L100** | `legends.json` `_theMythicalRung` — ascend or fall, and either joins `arc_the_disagreement` |

---

## §6 — ⚠️ THE PATTERN, RECORDED BECAUSE IT WILL RECUR

**Every major finding today was a reader with no writer, or a writer with no reader:**

`folkAccessible` · `backlashRung` · `holdings` · `sectFlavour` · `local_layouts` · `npcsheet.js` ·
`growthFor` · `resolution.npcStanding` · `foothillOf` · `wantsAuthoring` · **`sbDeclare`'s missing def**

⛔ **AND THE TESTS DID NOT CATCH IT, BECAUSE THE TESTS CONSTRUCT THE CORRECT INPUT.**

➡️ ⚠️ **THE STANDING CHECK, FROM CCODE'S OWN WORK:** *does the SUITE build the input, or does PRODUCTION?*
**If only the suite builds it, the feature is dark and green at the same time.**

---

## §7 — ⛔ AND THE DUEL'S REAL LESSON

**Aevi's hand-played duel got SEVEN of seven mechanics wrong**, and CCode measured every one:

| she assumed | the engine |
|---|---|
| pools 171/248 and 214/309 | ⛔ **81/40 and 99/40** — an NPC is `level×3` health, **40 energy flat** |
| the forge at density 0.88 | ⛔ **the forge does not exist.** Millbrook resolves **0.47** |
| `ashwarden → veil`, four crafts gated off | ⛔ **false** — every Veth craft declares `metaphysical` |
| ground penalises the roll | ⛔ **NO SUBSTRATE TERM ENTERS A SKILL-BATTLE ROLL AT ALL.** Ground decides free actions only |
| a gated craft spends its energy | ⛔ refused **before** the cost |
| surge backlash on crit-fail | ⛔ **any degree** — 50/37.5/25/7.5% — and **free-action path only** |
| a critical doubles the dice | ⛔ **never.** The margin raises the floor, capped at the dice ceiling |
| `harmRung: lethal` kills | ⛔ **does nothing in a round.** And `keystone_blow` is `damaging`, not lethal |

⚠️ **2,000 seeded duels: Pell wins 80%, 1,595 by PRESSURE, 8 by health. NOBODY DIES OF DICE.**

⛔ **THE LESSON IS THE SESSION'S LESSON: Aevi read the CONTENT and inferred the RULE.** Every one of those
eight is a thing she could have run and instead reasoned about. ➡️ **The fiction was fine. The mechanics
were invented, and they were invented CONFIDENTLY.**
