# SPEC — SNG-113: Aptitudes — background grants, real decay, and many more (situational, earned)
## Aevi (PO) · 2026-07-14 · authored to spec · **awaiting CCode ROUND 2**

> **One line.** Play-style aptitudes are real `resolve.js` modifiers earned by crossing a tendency threshold — but there are only **7**, thresholds are low (6–8), and **decay is 0.995 (near-zero)**, so a long campaign collects the whole set and never loses any. Fix: **background grants 1–2 signature aptitudes** (lineage-taught); **make decay actually bite** so aptitudes become *situational* — maintained by how you play, not permanent trophies; **raise/curve earning**; and **add many more**, each a small bonus-and-cost.

> **Verified at HEAD `v1.8.67`.** `resolution.json.playerAptitudes` = 7 (strategist, rough_and_ready, silver_tongue, scholar, carouser, daredevil, good_samaritan), thresholds 6–8, each a real `mods` map feeding `successChance`/crit/reputation. Accrual: `playerprofile.js` — each turn every tendency `*= DECAY (0.995)`, then +1 per matching intent tag; `deriveAptitudes` grants when `tendency >= threshold`. **The decay-makes-them-situational design EXISTS but 0.995 is cosmetic** (~139 turns to halve) — so nothing ever falls off. Background grants **zero** aptitudes today. The `TAG_TO_TENDENCY` map has ~10 tendencies but only 7 have an aptitude (`cautious` has none).

## THE DIAGNOSIS (Erik's read, confirmed)
"I racked up all there are" = three tuning facts compounding:
1. **Only 7 aptitudes** — a varied campaign trips every category.
2. **Low thresholds (6–8)** vs. dozens of hours of play.
3. **Decay 0.995 doesn't bite** — once earned, permanent. The situational mechanism is dead-on-arrival tuned.
The core design (earned modifiers with bonus AND cost) is good. It's under-populated and mis-tuned, not mis-designed.

## THE FIX

### 1. Background grants 1–2 signature aptitudes (lineage-taught)
Each origin/background declares `grantsAptitudes: [id, …]` (1–2). At creation the character *starts* with them — a scholar-lineage begins a `scholar`, a warrior-lineage `rough_and_ready`. Answers Erik's "what do these even do / where do they come from": some are who your people made you, before you ever act. Granted aptitudes are **seeded above their tendency threshold** so they persist unless you play against them long enough to decay out (they can be *lost* like any other — lineage is a start, not a shackle).

### 2. Make decay bite — aptitudes become situational
- Raise decay so a tendency you stop feeding actually falls: propose **DECAY ~0.97–0.98** (tunable in `resolution.json`, moved out of the JS constant). At 0.975, ~27 turns to halve — a real "you've stopped being that lately" horizon.
- Add a **hysteresis gap**: earn at `threshold`, *keep* until `threshold − keepMargin` (e.g. earn at 10, lose below 6). Prevents flicker at the boundary while still letting a genuine shift in play drop an aptitude. **This is what makes them the situational bonuses Erik wants** — you're a strategist *while you play strategically*; brawl for twenty turns and the edge dulls.
- Surface it honestly: an aptitude near its keep-floor shows "fading" on the chronicle/style panel, so loss is legible, not silent.

### 3. Raise + curve earning
- Thresholds up (propose 10–14, per-aptitude, stronger aptitudes cost more).
- Optionally a small **actionCount gate** (can't earn a deep aptitude in the first N turns) so early game isn't a scramble to collect.

### 4. Many more aptitudes (the population pass — Aevi content)
Fill the existing tendencies and extend the vocabulary. Every one is a **bonus AND a cost** (the existing law), most requiring a *sustained* lean to earn and keep. Seeds:
- `cautious` → **stalwart** (+defense / −tempo) — the tendency with no aptitude today.
- stealth → **shadow** (+stealth/scout / −presence)
- deception → **cold_read** or **trickster** (+deceive/finesse / −reputation-on-fail)
- mercy/generous (2nd tier) → **peacemaker** (+de-escalation / −intimidation)
- cruelty → **dread** (+intimidation / −rapport)
- patience → **long_game** (+sustained/ritual actions / −burst)
- craft → **artisan** (+making/repair / −improvisation)
- leadership → **banner** (+ally/party actions / −solo)
- devotion → **faithful** (+aligned-tradition actions / −cross-pole)
- recklessness (2nd tier of risky) → **berserk** (+damage / −defense)
Target **~18–24 total** so no single campaign trips them all, and each is a real identity choice. Requires extending `TAG_TO_TENDENCY` for new tendencies (stealth, deception, patience, craft, leadership, devotion, cruelty) with the intent tags that feed them.

## ENGINE SURFACES
| Module | Change |
|---|---|
| `content/packs/core/rules/resolution.json` | Move `DECAY` here (`aptitudeDecay`), add `aptitudeKeepMargin`; expand `playerAptitudes` to ~18–24 with curved thresholds + bonus/cost mods. |
| `engine/playerprofile.js` | Read decay/keepMargin from rules (not the JS constant); hysteresis in `deriveAptitudes` (earn at threshold, keep until threshold−margin — needs to track *currently held* to apply the gap); "fading" flag when near keep-floor. |
| `content/packs/core/rules/backgrounds.json` / `origins.json` | `grantsAptitudes: [id,…]` per background; seed at creation above threshold. |
| `engine/*` (creation) | Apply `grantsAptitudes` at character creation. |
| `engine/gm.js` | Extend intent-tag vocabulary for new tendencies (stealth/deceive/patience/craft/lead/devotion/cruelty) so they actually accrue. |
| `app.js` | Style panel shows held aptitudes + a "fading" indicator near keep-floor; background-granted ones marked as lineage. |
| `tests/*` | Background grant seeds above threshold; decay at new rate drops an unfed tendency in a realistic horizon; hysteresis prevents flicker but allows genuine loss; a varied-but-not-exhaustive campaign does NOT collect all; each aptitude's cost applies. |

## GUARDS
- **Hysteresis to prevent flicker** — earn/keep gap so a single off-tag turn never toggles an aptitude.
- **Loss is legible** — "fading" surfaced before an aptitude drops; never a silent disappearance mid-scene.
- **Every aptitude keeps a cost** — the bonus-AND-cost law holds for all new ones; no free-lunch aptitudes.
- **Background grants are a start, not a shackle** — lineage aptitudes can still be lost by playing against them (kept above threshold at creation, but subject to the same decay).
- Balance: the new decay + thresholds run through `balance_sim.mjs` — a normal campaign should hold **2–4** aptitudes at a time, not all of them.

## OPEN QUESTIONS — CCODE ROUND 2
1. Does `deriveAptitudes` currently track *held* state, or recompute fresh each turn? Hysteresis needs to know what's currently held to apply the keep-margin — confirm whether that's a state change.
2. Confirm decay is the only place tendencies decrease (no other reset), so moving it to rules + raising it is the single lever.
3. New tendencies need intent tags — does the parse-prompt vocabulary have room, or does adding stealth/deceive/patience/etc. crowd the tag list (interacts with SNG-100's cap)? **Flag: if new tags push the vocabulary past the intentTags cap, that cap needs the same load-bearing-hoist discipline as SNG-100.**
