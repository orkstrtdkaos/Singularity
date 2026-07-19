# SNG-165 — Reachability audit: for every capability, what actually triggers it?

**Author:** Aevi (PO) · 2026-07-18 · **Lane:** CCode · **Raised by:** Erik
**Type:** systematic audit, not a feature

---

## §0 — Why this exists

This batch has surfaced **eight** capabilities that were built correctly, tested, and could not be
reached in play:

| capability | built | why unreachable |
|---|---|---|
| `skill_battle` (SNG-098) | complete, sim-tested | **zero** encounter definitions exist corpus-wide |
| structured quest stages | complete, branching effects | only two button handlers can advance one |
| `pushMergedFile` | correct | called once |
| `gmAdviceFull` | correct | called once |
| `stateOps` | correct | called once |
| `smartClamp` (SNG-076) | correct | applied to 4 of 23 files |
| `mergeCodexTopics` | correct | called once |
| reconcile digest | correct | called once |

Eight is not a coincidence. It is a **structural property of how this repo is built**: engine work
lands with a test, the test passes, the capability is declared shipped — and nothing checks that
anything in *content* or *prompt* ever calls it. Law 16 and §23 were written for exactly this and
cover only the wiring they were pointed at.

Erik's question after the Coliseum was *"where are they?"* — and neither of us could answer without
reading source. That is the defect.

## §1 — What to produce

A single report, `po/REACHABILITY_AUDIT.md`, with **one row per engine export**:

| column | meaning |
|---|---|
| module / export | `engine/skill_battle.js :: battleRound` |
| callers | every call site, or `NONE` |
| trigger class | see §2 |
| content dependency | what content must exist for it to fire (`encounters with opponent`, `locations with encounterIds`, …) |
| does that content exist? | **count at HEAD**, not yes/no |
| verdict | `LIVE` / `BUTTON-ONLY` / `CONTENT-STARVED` / `DEAD` |

The **content-dependency column is the one that matters** and the one a normal dead-code scan misses
entirely. `battleRound` has callers, imports, and a passing test — a static scan calls it live. It is
`CONTENT-STARVED`: the count of content that can trigger it is zero.

## §2 — Trigger classes

- **`LIVE`** — reachable from ordinary play. A GM verb, a turn handler, or an engine path that runs
  every turn. *This is the only class that counts as shipped.*
- **`BUTTON-ONLY`** — reachable solely by the player clicking in a panel. Legitimate for genuine
  player choices (resolving a quest, spending XP); a **defect** for anything the fiction should drive.
  Structured quests were here, and it took live play to notice.
- **`CONTENT-STARVED`** — the code path is wired but the content that feeds it does not exist, or
  exists in numbers too small to ever fire. Report the count.
- **`DEAD`** — no caller at all.

## §3 — Method

1. Enumerate every `export` in `engine/*.js`.
2. Resolve call sites across `engine/`, `app.js`, `tests/`. **Test-only callers are not callers** —
   flag as `test-only`, which is how a capability passes CI while being unreachable.
3. For each, identify its content dependency by reading what the code branches on
   (`def.opponent`, `q.structured`, `location.encounterIds`, a manifest key…).
4. **Count that content at HEAD.** Zero and near-zero are the findings.
5. For anything the GM must invoke, check the verb is (a) in the documented contract, (b) in
   `salvageOps`, and (c) actually described in the prompt somewhere a model will act on it.
   SNG-163 found six documented keys missing from salvage — assume more divergence of this kind.

## §4 — Known seeds

Start from these, already confirmed:

- `skill_battle.js` — all four exports, `CONTENT-STARVED` (0 encounters).
- `encounters.js` — `startEncounter` reachable only via `choice.encounterId`, and no content
  supplies one. Note `challenge` and `puzzle` types have **never been authored at all**.
- `quests.js :: completeQuestStage`, `resolveStructuredQuest` — `BUTTON-ONLY`. SNG-162 fixes.
- `salvageOps` — carries 20 of 26 documented keys.
- The **§23 freshness gate covers engine-module and ability counts only**; locations, regions, and
  rules-file counts drifted silently this session and had to be hand-corrected.

## §5 — Deliverable and follow-up

The report is the deliverable — **do not fix anything as part of this.** Findings become specs, and
the fixes get prioritised against play value. A `CONTENT-STARVED` verdict is usually PO work (mine)
and a `BUTTON-ONLY` verdict is usually engine work (yours), so mixing the audit with fixes would
tangle both lanes.

**Suggested permanent guard, if the audit supports it:** a test asserting every documented GM
contract key appears in `salvageOps`, and every engine module with a content dependency has a
non-zero count at HEAD. That converts this audit from a one-off into a gate — which is the only way
a ninth instance does not happen.

## §6 — Questions back to me

- If a capability is `CONTENT-STARVED` but the content is expensive to author, say so in the row —
  I would rather know the cost than receive a clean list that quietly assumes I will fill it.
- If you find a capability that *should not* be reachable yet (built ahead of a dependency), mark it
  `DEFERRED` with the blocker rather than `DEAD`. Not everything unreached is a defect.
