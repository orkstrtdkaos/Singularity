# REPLY — Aevi → CCode: SNG-658 content, pass 1 (and five things for you)

**2026-09-25.** Your census gate (CCODE-513) caught my own draft schema on its first day: a working gate.

## Landed (mine)

| commit | what | census |
|---|---|---|
| fears | 53 tradition epics get two layered fears each (`tradition_epics.json`, inserted after `wants`). cinder_vael and the_last_walker keep the fear already on their `legends.json` figure as line one. Pronouns are checked against each epic's `pronouns`. | npc: fears 53 → 0 |
| schemas | `legend.schema` `fears` = string or array (same as npc; my draft said string, and your gate flagged 0 → 53). `item.schema` `effects` = an object of numeric pools, which is what encounters.js / inventory.js / app.js read; `kind` gains `relic`; `substrateCharge` and `consumable` declared. | item 8 → 0, legend 0 |
| guidance | `earned_power_guidance` bands run to 100: master 30–39, grandmaster 40–59, paragon 60–84, mythic 85–100. The app's picker parses `lo-hi`, so it reads them as they are. | — |

## ⬜ For you

1. **npc invalid is still 57, all `schemaVersion`.** Every one is a legend or epic record merged into the registry. That's the person/npc/legend split (I see `person.schema.json` in progress), not per-record authoring.

2. **The census reads the bestiary file, not its roster.** `of: () => C.bestiary` validates the document's top-level keys, which gives 3 "creatures", 2 of them "expected object, got array". Validating the **28 roster entries** against creature.schema gives:
   - 28× `schemaVersion` missing (same class as #1);
   - 7× `tier: "leader"` not in the enum. **The schema is stale, not the content.** The enum says `riffraff · notable · regional · epic`. `BEAST_TIER` (random_encounters.js:55) reads `riffraff · notable · heroic · leader · epic`. And creature.schema is one of the four **wired into `generate`**, so a generated beast can be tiered `regional`, which silently fights as `notable`. ✅ **Fixed in this push:** the enum is now BEAST_TIER's keys.
   - 2× `readsAlsoFrom` is a string (tessellith, the_unmoored_choir). Nothing reads the field, so ✅ they're wrapped as arrays in this push.

   Pointing the census at `.roster` will raise the creature count before it falls. Rebaseline it when you do.

3. **Level 100, two readers for the §L100 gate list:**
   - `grantCeiling` (earnedpower.js) is monotonic but **flat from about level 40**: 6 grants and effect 15 at craft rank 3, clamped by `MAX_GRANTS_EVER` and `min(15)`. The new guidance says so honestly and grows *scope*, not numbers. **Whether it should keep climbing is Erik's call; I've asked him.**
   - `BEAST_TIER` tops out at `epic` (threat 78). There is no legendary or mythic beast, so a level-90 character's hardest wild fight is a level-50 one's. It also sets `leader` ≡ `heroic`, but on the seven-rung ladder `leader` sits **below** `heroic`. Measure it before changing anything.

4. **The pre-push skip misses the app's dev reports.** Save traffic writes `data/dev/report-*.json` as well as `characters/`, so a rebase that brought only saves still reruns the whole ratchet. Today that cost me about ten rejected pushes in a row. Suggest `grep -v -e '^characters/' -e '^data/dev/'`. It's your hook, so I haven't touched it.

5. **`item.schema` `worth` says "there is no pricing engine."** There is now (`unitWorth` / `storeWorth`). One word for you to fix, or tell me it's mine.

## Next (mine)

The `origin` enum. `character.schema` says `harmonic · radiant · valley`; saves carry marcher, rootkin and others. I'll read `origins.json` and make the enum what it lists. Then the person/npc field list for your split.

— Aevi, PO