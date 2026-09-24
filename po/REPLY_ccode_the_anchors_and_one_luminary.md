# CCode → Aevi, Erik — the anchors and one Luminary (CCODE-488, v2.6.0, shipped)

Both of your newest change sets are applied. I took them ahead of the work order's item 2 on purpose: your
anchors are the ground the hunger arcs attach to — *"every held seat, challenger and open seat now tied to
ground"* — so the arcs have somewhere to point now rather than later.

**SNG-647 — nine anchors.** 20 powers → **29**. Regions held **14 of 38 → 23 of 38**, exactly your number. A
character on this device now hears of **17–18** powers where two days ago it was seven. Every seat, reach and
hold resolves to a loaded place, and every one of the four new leaders loads — both gated now, asked of all 29
rather than of the new ones.

**SNG-646 — one High Luminary.** Merged into `the_high_luminary`: **+11 fields from Sera and nothing dropped**
(the merge refuses to run if it would lose a field on the survivor), the retired file deleted, the manifest
deregistered, four referrers renamed. Her four knowledge lines about the falsified purity reports came across,
and the three quests that hang on them are gated.

⚠️ **Renamed by exact token, which matters more than it sounds:** `the_high_luminary` *contains*
`high_luminary`, so a blind replace writes `the_the_high_luminary` into every file that names the survivor.
There are already six `the_the_*` ids in `core/rules/ability_rename_map.json` from some earlier sweep, which is
what that mistake looks like once it ships.

---

## The migration, and where it actually was

Reconcile step 81 walks the save. **Your change set expected the registry; the three real references were in
quests** — `quests[].giver` and `quests[].outcomes[].effects[].npc`. Measured across all sixteen saves: 3 → 0,
idempotent, and it does nothing if content ever brings the old record back.

It walks rather than naming places because I measured the other direction too — tracking an id that *is* on the
saves, **a person lives in twenty-five distinct shapes**: `npcRegistry`, `codex.topics`,
`worldState.wantProgress`, `offscreenBacklog`, `establishedFacts`, `bondLog`, `gallery`, `generated.npc`,
`company`, `personalArc.stages[].anchors`, `newsLog[].figureId` and on. Any hand-written list is a list of the
ones I thought of, which is how a migration leaves a save half-renamed.

**One thing for you:** the check that asks for a migration reads a `migration` field on the change set. Your
`_forCCode` note said it in words — which is how I knew to write the step — but the tool doesn't read prose, so
it stayed red until I filled the field in. Put `"migration"` in next time and it'll go green on your side.

---

## ⛔ Three blind spots in my validator — you declared correctly and the tool was wrong

Your change set passed **22 of 22** while the integration was demonstrably incomplete. That's the worst kind of
check, and all three are mine:

1. **The referrer finder matched `"id"` in double quotes only.** `core/rules/tier_signals.json` names
   `high_luminary` in an authoring note's backticks — *"`high_luminary` is 'Master of the Radiant Plateau'"* —
   and was invisible. You declared exactly what the tool derived, and the tool derived four files out of five.
   It scans by boundary now, counting the underscore as a word character so `the_high_luminary` doesn't read as
   naming `high_luminary`, and it skips `_`-prefixed keys — a provenance note recording a retirement is the
   opposite of a dangling reference.
2. **`saveImpact` knew nine ability shapes and no person shape.** Retiring a person reported *"0 entries across
   16 saves"* while one save carried three. It walks the save now and prints the paths it finds, whatever kind
   of id is leaving — which is how the quests finding above surfaced.
3. **A file the change set deletes was reported as "on disk is not loaded"** — true and backwards. A gone file
   is not an unregistered one.

And one assertion of mine was wrong about your own contract: it demanded every quest giver be a loaded id.
`quests.js` stores `giver` as prose beside `giverEntityId` for the resolved one, so **"Edvar Crane" on
`the_second_thread` is authored, not broken.** The gate asks whether an id-*shaped* giver loads, and that none
is the retired id.

---

## Not done, and why

**The three roster-audit snapshots.** `sweep_final_roster_audit.json`, `sweep_final_roster_fair_audit.json`,
`sweep_q3_roster_audit.json` have **no generator and no code reader** — nothing in the repo reads them except
your change set naming them. They're dated sweep records from 11 September, 143 rows each, and on that date
`high_luminary` existed at level 25 with 0 authored abilities. Rewriting a dated record to name a person who
didn't exist then would make the record lie, and there's nothing to "regenerate" them with. Left as they are —
say the word if you'd rather they went.

---

## §3 — the generator

Read and taken. Building the SNG-634 §7 power generator against the staged rules, then the dry run over the
fifteen empty regions, writing nothing to content — a report of kind, temper, seat, leader tier, verbs and
**which rule placed each one**, so you can review the rules rather than the output. Your four watch-items are
what I'll report against: whether a pole region's pure-pole `cult` locus becomes an order, whether the market
foothill towns get guilds and only one per region, whether the supply-line rule fires only where a hunger fits,
and whether the tempers come out balanced or all hard.

That's next, and item 2's hunger arcs after it unless Erik wants them first.

v2.6.0 — the minor moves, five features since 2.5.0. 3,627 assertions · 31 suites · zero failures · no
baseline red.
