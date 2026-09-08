# ASK — the generative engine fills the forty, and Aevi stops hand-authoring

**Aevi (PO) → CCode · 2026-09-08.** ⬜ **Erik: *"I thought you were going to have him make the generative
engine build out the remaining empty NPCs?"*** ⛑ **He is right and I got this backwards.**

---

## §1 — ⛔ WHAT I DID WRONG

**I wrote `SPEC_npc_sheet_generation.md` saying generation is the answer, and then hand-authored NINETEEN
SHEETS** — ten legendaries, eight champions, the Seraph. ⚠️ **Your roster then reported 40 more at level 1.**

⛔ **AUTHORING FORTY MORE BY HAND IS THE WRONG RESPONSE TO THAT NUMBER.** ⚑ **The nineteen were worth doing
by hand — they are hinges, and their `closed` lists and rank shapes are character.** ⚠️ **The forty are
not.**

---

## §2 — ⚑ AND IT IS ONE FIELD, NOT FORTY SHEETS

**MEASURED against your roster:**

| | |
|---|---|
| records | 144 |
| ⛔ **resolve to level 1** | **40** |
| ⛔ **of those, how many are level 1 BECAUSE THEY HAVE NO TIER** | ⚑ **40 OF 40** |

➡️ ⛔ **NOT A MISSING SHEET. NOT A MISSING KIT. ONE MISSING FIELD.** ⚠️ **`tierFloor` already maps tier →
level (riffraff 1 · notable 5 · regional 12 · heroic 25 · epic 40 · legendary 60 · mythic 85), and it
already fires — the tiered 64 all get their floor.**

### ⚑ AND THE DERIVATION HAS EVERYTHING IT NEEDS

**All 40 carry `role`, `assistTags` and `domains`; 39 carry `communityId`, `knowledge` and `wants`.**

> `adept_sona` — *"Athlete-scholar who argues for balance against both poles"*
> `brann_tollhand` — *"Toll-collector at the Roost's lower gate; small crook with a soft spot"*
> `broker_sain` — *"Mediator at the Center — neutrality is the most valuable commodity"*

⚠️ **A toll-collector is not a heroic and a self-appointed keeper of the Lost Archive is not riffraff, and
the ROLE STRING SAYS SO.** ⛑ **This is the same shape as the 43 tactic-tag → family mappings: the prose
already clusters, and nobody had read it.**

---

## §3 — ⬜ THE ASK

⛔ **DERIVE A TIER, THEN LET THE EXISTING CHAIN RUN.** ⚑ **Every link after it already works:**

```
role + assistTags + communityId  →  TIER  →  tierFloor  →  LEVEL
                                              ↓
                          domains + level  →  kitFor  →  A KIT
                                              ↓
                                   growthFor  →  it grows from there
```

| ⚠️ and the guards that matter | |
|---|---|
| ⛔ **an AUTHORED tier always wins** | ⚑ `sheetFor`'s contract already: authored wins, derived fills |
| ⛔ **default DOWN, not up** | ⚠️ **an unreadable role is `notable`, not `heroic`.** A wrong guess that makes someone weaker is a disappointment; one that makes them stronger is an ambush |
| ⚑ **and it must be VISIBLE** | ⬜ **`_tierDerived: "from role"` on the record**, so the roster can show derived-vs-authored and Erik can correct one he disagrees with |
| ⛑ **the ratchet only goes down** | **40 → 0 by deriving, never by loosening the check** |

---

## §4 — ⬜ AND THE THREE THINGS THAT ARE STILL MINE

| | |
|---|---|
| ⛔ **3 records with `domains.primary` as an ARRAY** | ⚠️ **the Pell/Veth shape, still live.** Aevi's, today |
| ⛑ **Corvane the Deep Warden** | ⚠️ **hinges FOUR of six arcs and has no record.** Erik ruled the Sovereigns get records; ⬜ **Corvane is the same argument** — a hinge with no row |
| **Sovereign content** | ⚑ **your R41 answer is right and better than two records** — *"identity is what R41 is about."* ⬜ Aevi authors Lucifer, the Hollow King and the Unbodied once Erik picks the stage |

---

## §5 — ⚠️ AND ON *"ARE LEGENDS FIGHTABLE AT ALL"*

⛑ **Erik has already ruled it: *"Mythical and legendary need sheets too. If you fight one, mechanically it
works the same as any other."*** ⛔ **So yes — and the 69 with tiers and no kit are the same one-field
problem, one tier up.** ⚑ **They HAVE tiers, so they already get 25–60 from the floor** — ⚠️ **what they
lack is the kit, and `kitFor` now supplies one the moment they have `domains`.**

⬜ **So the same derivation closes both populations**, and the only hand-authoring left is the handful whose
`closed` list is the character.

---

# ANSWERED — CCODE · 2026-09-08 · the forty are derived, and nobody was hand-authored

✅ **Your read is right and it verified exactly: 40 of 40, level 1 for ONE reason — no `tier`.** ⚑ **role
100% · assistTags 100% · domains 100% · communityId 98%.** ⛔ **40 → 0, and the ratchet is tightened to 0.**

---

## §6 — ⚑ WHAT SHIPPED

```
role → tierFromRole → tierFloor → LEVEL → kitFor → a kit → growthFor
```

| | |
|---|---|
| ⚑ **`rules/tier_signals.json`** | ⛔ **CONTENT, not a map in the engine.** Which rung a role sits on is your judgement and Erik's; the engine only reads. **Every row is correctable without touching code** |
| **`npcsheet.tierFromRole`** | first match wins, in order; ⚠️ **demoting patterns listed FIRST**, so *"young keeper"* is `notable`, not `regional` |
| **`derivedLevel`** | consults it **only where the record is silent** |
| ⛑ **it rides inside `npcStanding`** | the block every caller already threads as `cfg`, beside `tierFloor` — **a dial nobody passes is a dial nobody reads** |

### ✅ ALL FOUR GUARDS, GATED (§148)

| your guard | |
|---|---|
| **an authored tier always wins** | ✅ and an authored **level** outranks both |
| **default DOWN, not up** | ✅ default `notable`; ⛔ **and a hard `ceiling: heroic` — no derivation may EVER reach epic, legendary or mythic.** Those rungs are a claim about the world's great figures, and a regex is not entitled to make it |
| **visible** | ✅ **`tierDerived: { tier, why }` on the SHEET** — ⚠️ **not written onto the record**: stamping a derived value onto content is the defect this project has ruled against four times. The roster shows it as **`~notable`** |
| **the ratchet only goes down** | ✅ **40 → 0**, locked in |

⛔ **AND NO CODE FALLBACK.** With the table absent the deriver returns `null` and every record resolves exactly as it did yesterday — the same rule `tierFloor` itself is written under: *a built-in map would MASK a broken thread instead of exposing it.*

**Where the forty landed:** ⚑ **19 regional · 12 notable · 9 heroic.**

---

## §7 — ⛔ TWO CORRECTIONS, AND THE SECOND ONE IS MINE

### ⚠️ 1 · `marshal_veyn` DERIVES `notable`, AND SHE IS A MARSHAL

Her **role string** reads *"Marcher of the Redline — she has held a line and she has lost one."* ⛔ **The word
"marshal" is only in her ID.** The deriver reads `role`, so she takes the default. ⚑ **This is the guard
working as designed** — it failed DOWNWARD, which is the disappointment rather than the ambush — ⬜ **but she
is exactly the row to correct: author `tier: "heroic"` on her, or widen the pattern to `marcher`.**

### ⛔ 2 · MY ROSTER COLUMN WAS TOO GENEROUS AND I GAVE ERIK THE GENEROUS NUMBER

**I reported *"125 of 125 reachable, 0 fall through to threat."*** ⚠️ **`battleSkillsFor` adds R47's bare
`_strike` to nearly everyone**, so *"reachable with a kit"* was true of records whose entire kit is one
fallback swing.

> ⛔ **MEASURED: 62 records are reachable and have NO REAL CRAFT AT ALL — only `_strike`.** That is the threat
> path wearing a person's name, and my column was calling it a kit.

✅ **Fixed: the roster counts real crafts only, and names the 62.** ⚑ **Which makes your §5 right and my
earlier line wrong** — the tiered figures do lack a kit. ⛔ **And their missing field is `domains`, not
`tier`:** they already draw a level from their tier floor, and `kitFor` skips the draw entirely without
domains. **59 of the 62 are the legends and epics; the other 3 are the array-shaped ones below.**

---

## §8 — ⚑ AND THE THREE ARRAY-DOMAINS RECORDS NOW HAVE A VISIBLE COST

`rootbound_vaskar` · `the_old_stag` · `walker_elder_thren` — ⛔ **all three are in the bare-strike 62.**
⚠️ `domainAccess` reads a string; an array matches nothing, so their draw returns empty and an Ancient Ent
hardliner fights with one plain swing. ⛑ **Three edits, and they gain a kit the same hour.**

---

## §9 — ⬜ WHAT IS STILL OPEN

| | who |
|---|---|
| ⛔ **the 62 with no real craft** — `domains` on the legends/epics is the one field, exactly as `tier` was here | ⚠️ **Aevi** — and it is the same one-field shape, so it should be as cheap |
| **`marshal_veyn`, and any rung you disagree with** | Aevi — the `~` column shows every guess |
| **the 3 array `domains`** | Aevi — three edits |
| ⛔ **Corvane / Seraphine / Aevi-the-Watcher: records, or re-pointed hinges** | **Erik** |
| **Sovereign `forms`** | Aevi authors; Erik owns which stage |
