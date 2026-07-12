# Results — Preview legs: auto-detect in play + drop-out once verified to Aevi

Date: 2026-07-11 · Shipped v1.8.16 · 743 smoke + parse_probe green · verified in-browser. Status: **shipped, awaiting Erik preview-leg before complete_pending_review**. Only Aevi closes.

Two Erik-directed additions so the preview-legs checklist tends itself: **auto-detect** legs as their moment happens in normal play (no manual ▶ Run needed), and **drop verified legs out** of the list once they're reported back to Aevi.

## 1. Auto-detect in play
`autoVerifyLeg(legId, note)` marks a leg **auto ✓** the instant its pass-condition fires during real play — **dev boxes only** (`devEnabled`-gated; zero effect on normal players). Hooked at the real event sites:

| Leg | Fires when… |
|---|---|
| b9p1-rating | a content ceiling is set |
| b5-crossclass | a **cross-class** ability is ranked (2 pts spent) — sheet or sidebar |
| b5-fork | a branch fork is chosen (the other locks) |
| b9p2-keep | ⭐ Keep is tapped on a grown entity |
| b9p1-generate | a new NPC/location is minted |
| sng035-scene | a generated entity / location is born with its image |
| sng035-portrait | a portrait is generated + persisted |
| b8-gambit | a gambit runs to completion (+xp) |
| b8-time | narrative `timeOps` moves the clock ≥2h |
| b9p2-offscreen | an established entity advances offscreen |
| b9p3-promote / b9p3-lens | an entity promotes to shared canon / the rating-lens dials down or filters |
| b7-inv | a quest progresses to complete |

The remaining legs (b5-feel affinity *feel*, sng041-clock two-character, the cross-player b9p3 flows) stay manual/▶ Run — they need a felt judgment or a second profile.

## 2. Drop-out once verified back to Aevi
- When **sync is on**, `reportLegStatus` pushes every locally-verified-but-unreported leg into a synced file **`data/preview_legs_status.json`** (via the concurrency-safe `pushMergedFile`), then marks them `reported`. That's "verified **back to Aevi**" — the PO reads the file to close.
- A leg **clears** (drops out of the active checklist) once it's `reported`, **or** once **Aevi marks it closed** in `preview_legs.json` (per-leg `"closed": true` or a top-level `"closed": [ids]`).
- Cleared legs collapse into a **"✓ N cleared — verified & reported to Aevi"** section (expandable), so the active list only ever shows what's genuinely left. The header tally reads e.g. **"0 of 16 left · 2 cleared"**.

## Guardrails held
Dev-only (`devEnabled`; normal players never touch this path); auto-verify never downgrades a manual mark or re-marks a cleared leg; report is fire-and-forget + retried (offline-safe); the report file is a separate status file (does not mutate Aevi's authored `preview_legs.json`); reused `pushMergedFile` (no new sync mechanics). Suites + parse_probe green. Never touched the ErikIAm pipeline.

## Verification
- `node tests/smoke.mjs` — 743 green (unchanged — app-level); `node tests/parse_probe.mjs` — green.
- **Live-verified in-browser** (v1.8.16): setting up the fork leg then performing the **real** rank+fork action auto-marked **both** `b5-fork` and `b5-crossclass` (`auto ✓`, with notes), prism→rank 3, fork=`deep_read`. Marking them `reported` moved them into the **cleared** section and dropped them from active (tally "0 of 16 left · 2 cleared"). No console errors.

## For Aevi
- **To close legs**: they auto-report to `data/preview_legs_status.json` (`{verified:{legId:{status,auto,note,at,by}}}`) as Erik plays. Read that to see what's verified; close per protocol; and/or set `"closed": true` on a leg (or a top-level `"closed": [legId,…]`) in `preview_legs.json` to make it drop from Erik's panel authoritatively.
- The status file is CCode-written / Aevi-read; `preview_legs.json` stays Aevi-authored.

## Erik use-test
"Just play on the dev build (`?dev=1`). As you rank a cross-class ability, choose a fork, ⭐ Keep something, generate a place, run a gambit, etc., those legs auto-check themselves — and with sync on they report to Aevi and drop off the 🧪 Legs list. You only ever see what's genuinely left to check by hand."
