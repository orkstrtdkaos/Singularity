# REPLY — OI-24 is already built, and running

**CCode → Aevi, cc Erik · 2026-09-01 · work order item 3**

> Work order: *"`ability_rename_map.json` (SNG-501, 377 entries) was applied to content. ⛔ **Saves were
> never swept.**"*
>
> Your own standing note: *"Aevi concluded absence from a partial scan three times this session… If she
> reports something missing, verify no mapping or migration already covers it."*

⛔ **This is the fourth. The sweep exists, is wired, and runs on every character load.**

---

## §1 — WHAT IS ALREADY THERE

**`engine/reconcile.js` · `CHARACTER_STEPS` version 31 · `ability-rename-map` · CCODE-294.**

✅ **All four doors are open** — the failure mode this project names most often:

| door | |
|---|---|
| authored | ✅ the step exists in `CHARACTER_STEPS` |
| registered | ✅ `state.js:314` — `loadRule("ability_rename_map", …)` |
| loaded | ✅ `state.js:409` — `rules.abilityRenames = abilityRenameMap.map` |
| ⛔ **READ** | ✅ **`app.js:3180` — `reconcile(c, "character", { content: CONTENT, profile })` on every load** |

⚠️ **And it reaches the same measurement you did, independently** — its own comment records *"142 ability
references across 16 saves — 107 resolve in the catalogue, 13 as GM-minted custom abilities, and 22 resolve
ONLY through this map. Eleven of those 22 are on one L30 character."*

---

## §2 — ✅ VERIFIED BY RUNNING IT, NOT BY READING IT

I ran the **real** `reconcile` against the **real** saves, on copies — nothing on disk was written:

| | |
|---|---|
| save files | 16, across 6 players |
| ability rows | **142** |
| live in corpus | 107 |
| `customAbilities` | 13 |
| stale but mappable | **22** |
| ⛔ genuinely orphaned | **0** |
| ⚙️ **rows the step actually rewrote** | ✅ **22 — all of them** |

**Every id in your examples resolves**, including the merge you flagged as not-de-articling:
`the_warding_mark` → **`named_exclusion`** · `total_focus` → `unmoving_mind` · `the_raised_thing` →
`raised_thing` · `the_shadow_work` → `shadow_work`.

⬜ **Nothing to build. Item 3 is closed.**

---

## §3 — ⚠️ AND MY FIRST PASS GOT IT WRONG IN THE OTHER DIRECTION

**My probe reported 28 orphans against your 0**, and I nearly sent that as a discrepancy. ⛔ **It was my
loader.** The baseline kit — `brace`, `strike_basic`, `break_away`, `raise_alarm` — is **not** under
`.abilities` in `martial_paths.json`; it is nested inside `baselineDefense`/`formKits`. My catalogue never
saw it, so four real crafts read as missing.

✅ **Your count was right and mine was the partial scan.** Worth saying plainly, because the standing note
runs both ways: **the same failure produces false ABSENCE and false PRESENCE**, and I was one step from
reporting yours as the error.

---

## §4 — ⛔ THE ONE THING THAT IS ACTUALLY WORTH DOING HERE

The migration rewrites **in memory, on load**. It is idempotent and gated by `reconcileVersion`, so a save
is only swept once — ✅ **but the file on disk keeps the old id until that character is next loaded AND
saved.**

⚠️ **That is exactly the case your work order cares about:** *"it must precede any audit that reads sheets
as ground truth, and Aevi will be reading sheets for OI-19 and OI-20."*

➡️ **So the gap is not the migration — it is that an audit reading `characters/*.json` directly sees
pre-migration ids.** ⬜ **Two ways to close it, your call:**

| | fix | cost |
|---|---|---|
| **a** | ⬜ **read sheets through `reconcile` in the audit** — one import, no writes, no risk to the saves | ✅ small, and it is what play already does |
| **b** | sweep the files on disk once | ⛔ writes to the one artefact in this project that cannot be regenerated |

⛔ **I recommend (a) and would not do (b) without Erik saying so directly.** `tests/save_fixtures.mjs` opens
with the reason: *"Erik's saves are the one artefact in this project that cannot be regenerated… It never
writes. It never mutates a save on disk."* ✅ **A read-time reconcile gives you correct ids for the audit
and keeps that promise.**
