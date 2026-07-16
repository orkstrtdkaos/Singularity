# SPEC — SNG-113: Aptitudes — background grants, real decay, and many more (situational, earned)
## Aevi (PO) · 2026-07-14 · authored to spec · **awaiting CCode ROUND 2**

> **One line.** Play-style aptitudes are real `resolve.js` modifiers earned by crossing a tendency threshold — but there are only **7**, thresholds are low (6–8), and **decay is 0.995 (near-zero)**, so a long campaign collects the whole set and never loses any. Fix: **background grants 1–2 signature aptitudes** (lineage-taught); **make decay actually bite** so aptitudes become *situational* — maintained by how you play, not permanent trophies; **raise/curve earning**; and **add many more**, each a small bonus-and-cost.

> **Verified at HEAD `v1.8.67`.** `resolution.json.playerAptitudes` = 7 (strategist, rough_and_ready, silver_tongue, scholar, carouser, daredevil, good_samaritan), thresholds 6–8, each a real `mods` map feeding `successChance`/crit/reputation. Accrual: `playerprofile.js` — each turn every tendency `*= DECAY (0.995)`, then +1 per matching intent tag; `deriveAptitudes` grants when `tendency >= threshold`. **The decay-makes-them-situational design EXISTS but 0.995 is cosmetic** (~139 turns to halve) — so nothing ever falls off. Background grants **zero** aptitudes today. The `TAG_TO_TENDENCY` map has ~10 tendencies but only 7 have an aptitude (`cautious` has none).

> **DEPENDENCIES & SEQUENCING:**
> - **Hysteresis is a state change, not just tuning.** `deriveAptitudes` today recomputes the held set fresh each turn (`return rulesAptitudes.filter(tendency >= threshold)`) — it is stateless. The earn-at-threshold / keep-until-(threshold−margin) gap **requires knowing what was held last turn**, so `deriveAptitudes` must read the character's *currently-held* aptitudes and apply the margin only to those. This is a required change, stated here (not an open question): persist the held set and pass it in.
> - **`devoted_lover` depends on SNG-108** (the committed-partner bond). Build 113 without it and every OTHER aptitude works, but `devoted_lower`'s "in service of a partner" mod has no bond to read. **Ship `devoted_lover` only after SNG-108 lands, or ship it inert (mod is a no-op until a partner bond exists).** The rest of SNG-113 has no such dependency and is buildable now.

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

### 4a. Romantic aptitudes (Erik) — the `amorous` tendency
**Verified gap:** the `romantic`/`flirt` intent tags (added SNG-100) currently route to **NO tendency** — they parse but never accrue anything. So romantic play has a clean, unused home. Add an **`amorous`** tendency fed by `romantic`/`flirt` (and `woo`/`seduce` if added), plus romantic aptitudes:
- **charmer** (+flirtation/rapport in social-romantic scenes / −gravitas in formal ones) — the light end: woo, banter, ease.
- **devoted_lover** (bonus to actions *in service of* a committed partner — SNG-108 partner bond; e.g. protecting/aiding them / small penalty when acting against that bond's interest) — the deep end: love as sustained attention, mechanized.
- **ardent** (+intensity/presence in intimate scenes, within the profile's rating ceiling / −composure under pressure elsewhere) — passion as a trait with a cost.
**Content-ceiling + minor-safety are absolute here:** an `amorous` aptitude's *bonus* only expresses within the profile's rating ceiling (an R-capped game gets the social/rapport bonus, not explicit-scene effects), and **NONE of these can involve or apply to a minor character in any way** — same floors as the romance/art systems, non-negotiable. The aptitude is a social/relational modifier, not a content unlock; it never changes what content is permitted, only how well romantic/relational *actions* resolve.

### 4b. Innocence / naivety (Erik) — INVERSE aptitudes (start-with, lose-through-play)
These are the system's first **inverse** aptitudes: you don't *earn* them by acting — you **start** with them (background/youth) and **lose** them as experience accrues. That's a genuine new axis and it's a lovely fit for the decay engine run backwards.
- **innocent** — a starting trait: bonus to being *trusted/underestimated* (NPCs open up, lower their guard, extend benefit of the doubt / penalty to deception, intimidation, worldly-cunning actions). **Eroded by experience:** accrual of `ruthless`/`deception`/`carousing`/high-`amorous` tendency *reduces* it; it fades as the character is marked by the world. Once gone, not easily regained (a one-way door, mostly — innocence lost is lost).
- **naive** (a lighter/rougher form) — bonus to sincerity-read (people believe you because you believe it) / penalty to detecting deception and to cynical/strategic reads.
- **untouched / sheltered** — a background-only variant for a character who hasn't seen violence or intimacy; confers a small "clean slate" bonus but a real penalty in charged situations until worn off.

**The mechanism (elegant, reuses everything):** innocence aptitudes have an **inverted threshold** — held while a "worldliness" score (sum of ruthless/deception/amorous/carousing tendencies) is BELOW a ceiling, lost when it crosses. So they decay *up* out of existence as you live. No new engine — it's the existing threshold logic with a `<` instead of `>=` and a composite tendency. Background grants them; play removes them; the removal is the character's coming-of-age, mechanized. **This is the attention-makes-real thesis in reverse: what you turn your attention toward, you become — and cannot un-become.**

**Minor-safety note on innocence:** these are temperament traits about worldly experience, NOT about age, and carry no romantic/sexual content whatsoever. A `sheltered` adult and an `innocent` adult are ordinary character builds. The floors that forbid minor romantic/sexual content are entirely separate and unchanged.

## ENGINE SURFACES
| Module | Change |
|---|---|
| `content/packs/core/rules/resolution.json` | Move `DECAY` here (`aptitudeDecay`), add `aptitudeKeepMargin`; expand `playerAptitudes` to ~18–24 with curved thresholds + bonus/cost mods. |
| `engine/playerprofile.js` | Read decay/keepMargin from rules (not the JS constant); hysteresis in `deriveAptitudes` (earn at threshold, keep until threshold−margin — needs to track *currently held* to apply the gap); "fading" flag when near keep-floor. |
| `content/packs/core/rules/backgrounds.json` / `origins.json` | `grantsAptitudes: [id,…]` per background; seed at creation above threshold. |
| `engine/*` (creation) | Apply `grantsAptitudes` at character creation. |
| `engine/gm.js` | Extend intent-tag vocabulary for new tendencies (stealth/deceive/patience/craft/lead/devotion/cruelty). **Route the existing `romantic`/`flirt` tags to a new `amorous` tendency (they currently map to nothing).** Optionally add `woo`/`seduce` tags. |
| `engine/playerprofile.js` (inverse) | Support **inverse aptitudes**: held while a composite "worldliness" score is BELOW a ceiling, lost when crossed (the `>=` threshold logic with `<` + a summed tendency). Powers innocence/naivety. |
| `content/.../resolution.json` (amorous + inverse) | Add `amorous` aptitudes (charmer/devoted_lover/ardent) with rating-ceiling-bounded mods; add inverse aptitudes (innocent/naive/sheltered) with a `worldlinessCeiling` + component tendencies. |
| `app.js` | Style panel shows held aptitudes + a "fading" indicator near keep-floor; background-granted ones marked as lineage. |
| `tests/*` | Background grant seeds above threshold; decay at new rate drops an unfed tendency in a realistic horizon; hysteresis prevents flicker but allows genuine loss; a varied-but-not-exhaustive campaign does NOT collect all; each aptitude's cost applies. |

## GUARDS
- **Hysteresis to prevent flicker** — earn/keep gap so a single off-tag turn never toggles an aptitude.
- **Loss is legible** — "fading" surfaced before an aptitude drops; never a silent disappearance mid-scene.
- **Every aptitude keeps a cost** — the bonus-AND-cost law holds for all new ones; no free-lunch aptitudes.
- **Background grants are a start, not a shackle** — lineage aptitudes can still be lost by playing against them (kept above threshold at creation, but subject to the same decay).
- Balance: the new decay + thresholds run through `balance_sim.mjs` — a normal campaign should hold **2–4** aptitudes at a time, not all of them.
- **Romantic aptitudes are rating-ceiling-bounded and minor-absolute.** An `amorous` aptitude's bonus expresses only within the profile's rating ceiling; it is a social/relational resolution modifier, never a content unlock. **No romantic/amorous aptitude involves or applies to a minor character in any way** — the romance/art minor-safety floors are unchanged and override everything here.
- **Innocence aptitudes are about worldly experience, not age** — temperament traits, no romantic/sexual content, entirely separate from minor-safety floors. Inverse-earned (start-with / lose-through-play); loss is legible ("your innocence is fading") and largely one-way.

## OPEN QUESTIONS — CCODE ROUND 2
1. Confirm decay is the only place tendencies decrease (no other reset), so moving it to rules + raising it is the single lever.
2. New tendencies need intent tags — does the parse-prompt vocabulary have room, or does adding stealth/deceive/patience/etc. crowd the tag list (interacts with SNG-100's cap)? **Flag: if new tags push the vocabulary past the intentTags cap, that cap needs the same load-bearing-hoist discipline as SNG-100.**
3. Inverse aptitudes read a composite "worldliness" sum — confirm the component tendencies (ruthless/deception/amorous/carousing) all exist post-population so the sum is well-defined at build time.

*(Resolved and moved to DEPENDENCIES above: `deriveAptitudes` is stateless today and must track the held set for hysteresis; `devoted_lover` depends on SNG-108.)*
