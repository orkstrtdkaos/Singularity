# Results — SNG-094 (skill learning fixed + a Level-Up window)

Date: 2026-07-13 · v1.8.52 · npm test green · live-verified. Status: **shipped, complete_pending_review.**

Erik live: *"the skill learning is broken… how can I slickly pick new skills? perhaps we should have a level up button that opens a helper window."* Two things — a real bug, and the UX.

## The bug — a native could not learn their OWN people's craft
The learn filter (sidebar + aspiration dropdown) and `learnAbility` gated **tradition access** through the legacy `effectiveLevelReq`, which matches `powerSystem === origin`. But the 24-tradition abilities carry `powerSystem` set to their **axis-file name** (`"reach_death_life"`), not the tradition — so `effectiveLevelReq` returned **null for every one of them**, and null meant "filtered out / wrong tradition." Result: a native Ashwarden (with Deathsense + Palework already) was offered **only Valley Craft** (folk, always open) at level-up — never any Ashwarden craft. The domain gate (SNG-055, the authoritative access model) already knew the ability was in-domain and was being overridden by the legacy filter.

**Fix:** for any character **with domains**, access is the domain gate's job and the level bar is the ability's own `levelReq` — not `effectiveLevelReq`.
- New `learnLevelReq(ab)` (app.js) mirrors the engine: accord → open; precursor → keeps its per-ability fiction gate; domains set → `domainVerdict(ab).allowed ? ab.levelReq : null`; else legacy. Wired into all three learn filters.
- `learnAbility` (progression.js) computes `req` the same way (uses `opts.traditionIndex`).
- **Verified (unit):** the legacy gate returned `null` for `palework` on an Ashwarden (the bug); `learnAbility` now returns `{ok:true, cost:1, band:"primary"}` and learns it.

## The UX — a Level-Up window (`renderLevelUp`)
One screen replaces hunting the sidebar's scattered ▲ buttons and collapsed "Learn" groups:
- **Deepen a craft** — each owned ability with rank pips, the next rank's name + what it grants, and a **▲ Rank up (N pt)** button (or a plain reason when blocked: mastered / needs level / needs points). Honors the branch-fork modal at rank III and free practiced ranks.
- **Learn a new craft** — everything the **domain gate** opens, grouped by people (your own group auto-expands), each row showing tier, cost, band (own/kin/far/open), a one-line *"what it grants,"* and a **Learn (N pt)** button (or 🔒 with the reason). Capacity is called out with the SNG-084 ⓘ.
- **Stays open** so a player with several points spends them in a row (status line confirms each).
- **⬆ Level Up** button in the play sidebar (beside the skill-pt badge) and on the Character screen. SNG-084 helper ⓘ woven into the headers (ranks, capacity, domains).

## Verification (live)
Opened the window on the dev character: **9 learnable people-groups** now appear (its own tradition + the 6 open Accord crafts + Valley Craft) — not just Valley Craft. Learned **mend_device** and ranked **sonic_resonance → 2**; both applied, points deducted (3 → 1), the window stayed open with a status line. No console errors.

## Erik test
"Open ⬆ Level Up with a native character — verify you can learn your OWN people's crafts (not just Valley Craft), deepen an ability, and spend several points without leaving the window." Confirmed (the native-learn path is unit-verified for Ashwarden; the window is verified live).

## spec_boundaries / notes
- **Reach crafts' `"gated": "learned"` note vs the domain gate.** The `reach_*` files say they're "learned by traveling the Reach / training under the people — not a Valley creation pick." For a **native** (primary domain = that tradition) the domain gate rightly opens them (a wright learning wright craft). For an **outsider** the domain gate applies the far-distance penalty rather than requiring a physical journey — the SNG-055 model and the "gated: learned" flavor diverge here. Went with SNG-055 (the shipped, engine-enforced model). If Aevi wants the journey to be a hard gate for cross-tradition reach crafts, that's a design call (ties the Accords' waygate-journey Phase 2).
- The old scattered surfaces (sidebar ▲ + Learn groups) still work; the Level-Up window is the consolidated front door.
