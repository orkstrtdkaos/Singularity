# SPEC — SNG-124: The skill system reads at a glance — functions forward, level-up smarter
## Aevi (PO) · 2026-07-16 · authored to spec · **awaiting CCode ROUND 2**

> **Five coupled asks, one story: make the skill system legible instead of click-to-discover — and make the function families (what a skill DOES) the organizing spine.** (1) Level-up button only when points are unspent. (2) The level-up modal RECOMMENDS skills for your style/class/gaps. (3) Function indicators more prominent. (4) The skill wheel organizes around functions. (5) Skill titles + cost readable at a glance, not only on click.

> **Verified at HEAD `v1.8.82`.**
> - **Level-up button:** the CHARACTER-SCREEN button `cs-levelup` (L3919) is **unconditional** — shows regardless of `skillPoints`, only appending `(N)` when points exist. (The SIDEBAR affordance L5180/5203 already gates on `skillPoints > 0 || aspirationRipe` — correct; the character-screen one is the leak.)
> - **Modal:** `renderLevelUp` (L3778) lists "Your crafts" + "Learn a new craft" grouped by tradition — a flat catalog, **no recommendation** of any kind.
> - **Functions:** `functionChips` (L1177) + `FN_ICON` (9 glyphs) render the tags in the ability LIST only. The **skill wheel** node (L3532) is a bare colored circle; name/tier/function live only in the `<title>` (hover) — **nothing readable without hover/click.** The wheel organizes purely by TRADITION (SNG-073 great circle); **function is invisible on it.**
> - **Canon:** `function_vocabulary.json` (SNG-092) = **8 families / 24 verbs**: HARM (strike·break·hinder), RESTORE (heal·mend·restore), CONTROL (bind·command·move), MAKE (make·summon·transform), KNOW (reveal·foresee·track), HIDE (conceal·deceive), WARD (ward·shield·resist), EMPOWER (empower·sustain…). This is the cross-cutting structure the wheel should speak.

---

## PART 1 — Level-up button only when points are unspent (bug)
`cs-levelup` (L3919): show **only if** `character.skillPoints > 0 || aspirationRipe(...)` — mirror the sidebar's existing condition. When nothing to spend, the button is gone (deepening is earned through use, not bought — so a 0-point character has nothing to do in the modal). One-line fix; make the two Level-Up affordances share one `canLevelUp(character)` helper so they never diverge again.

## PART 2 — The level-up modal RECOMMENDS (style/class/gaps)
Add a "**Suggested for you**" block at the top of the modal, above the flat catalog. Recommend 2–4 learnable skills, each with a one-line WHY, scored on:
- **Style** — your tendencies/aptitudes (a high-`amorous`/social build → social-function skills; a strategic build → KNOW-family). Reuse the `tendencies`/`aptitudes` the profile already tracks.
- **Class/domain** — your primary tradition's unlearned natives first (the by-right basics), then secondary/tertiary.
- **Gaps** — **function coverage.** Compute which of the 8 families your current kit is missing (a character with all HARM and no RESTORE/WARD is fragile) and surface a skill that fills the hole. *This is the highest-value axis — it uses the function families directly and teaches the player what a balanced kit looks like.*
- **Ripe aspirations** — anything `aspirationRipe` (already computed) surfaces here as "ready to learn."
Each suggestion: name · function icons · cost · one-line why ("fills your RESTORE gap" / "your ashwarden by-right basic" / "suits how you play"). Tapping learns it in place (existing `learnAbility` path).

## PART 3 — Function indicators more prominent
- Promote `fn-chip` from muted text to a **first-class colored badge** — each of the 8 families gets a color (HARM red, RESTORE green, KNOW blue, WARD gold, HIDE grey, CONTROL purple, MAKE amber, EMPOWER teal), the `FN_ICON` glyph carried through. A skill's functions become instantly scannable by color+glyph.
- Show them **everywhere a skill appears** — ability list (have it), level-up modal, and the wheel (new).
- A small function legend (8 family colors) available via infoDot so the vocabulary is learnable.

## PART 4 — The skill wheel organizes around functions
The wheel is a beautiful tradition-circle (SNG-073); functions are the missing cross-cut. Add function as a **visible layer**, not a replacement:
- **Node function ring/glyphs:** each wheel node carries its function icon(s) as a small colored ring or a glyph cluster on/beside the circle — so scanning the wheel shows not just WHERE (tradition) but WHAT (function) each skill does, in color.
- **Function filter/highlight:** a row of 8 family toggles; tapping "RESTORE" highlights every restore-capable node across all traditions and dims the rest — so you can SEE "where can I heal?" as a pattern across the circle. This makes the function families a navigable axis over the tradition geometry. (The wheel keeps its tradition spokes + antipode geometry; function is an overlay.)
- This directly answers "organize around them": tradition is the ring, function is the color/filter layer laid over it — both structures visible at once, which is the wheel's whole ethos ("access, lore and geometry, one picture").

## PART 5 — Titles + cost readable at a glance (no click required)
- **Wheel nodes get a label + cost at a glance** for owned/reachable nodes: a short name and energy cost rendered near the node (at least for owned + one-away nodes; distant/unknown stay glyph-only to avoid clutter, revealed on hover as now). The bare-circle-that-needs-hover is the complaint; owned and learnable nodes should announce themselves.
- **Cost everywhere:** the effective energy cost (SNG-103 — the discounted number) shown on the node label and in the level-up suggestions, so "what can I afford / what does this cost me" is answerable without opening anything.
- Zoom-aware: at low zoom show glyphs+color; as you zoom in, labels+cost fade in (avoid a wall of text on the full circle).

## ENGINE / UI SURFACES
| Module | Change |
|---|---|
| `app.js` (L3919 + sidebar) | `canLevelUp(character)` shared helper; `cs-levelup` shows only when true. |
| `app.js` `renderLevelUp` (L3778) | "Suggested for you" block: `recommendSkills(character, catalog, rules)` → 2–4 scored suggestions (style/class/gap/aspiration) with why + function icons + cost. |
| `engine/*` (recommender) | `recommendSkills` + `functionCoverage(character)` (which of 8 families the kit covers/lacks) — pure over catalog + character. |
| `app.js` `functionChips` + `FN_ICON` + css | 8-family color system; promote fn-chip to colored badge; render in list + modal + wheel; legend via infoDot. |
| `app.js` wheel (`buildWheelModel`/`renderSkillWheel` L3368/3490) | Node function glyphs/ring; 8 family filter toggles that highlight/dim nodes by function; owned/reachable node labels + effective cost; zoom-aware label reveal. |
| `content/.../function_vocabulary.json` | (Read-only) source of the 8 families + verbs for coverage + colors. |
| `tests/*` | Level-up button hidden at 0 points/no-ripe; recommender returns style/class/gap-scored suggestions incl. a function-gap fill; fn-badges render with family color in all 3 places; wheel function-filter highlights the right nodes; owned nodes show name+cost without hover. |

## GUARDS
- **The wheel's tradition geometry is preserved** — function is an OVERLAY (color/glyph/filter), not a reorganization that loses the great-circle/antipode structure. Both axes visible.
- **No clutter at full-circle zoom** — labels/cost fade in with zoom; distant unknown nodes stay glyph-only.
- **Recommendations never auto-spend** — they suggest + one-tap-learn; the player always chooses (Law 9 offer-not-commit).
- **Cost shown is effective** (SNG-103 discounted), never base, so the glance-number matches what you actually pay.
- Minor/rating floors irrelevant here (skill system), but the recommender must not push a foreclosed/closed-opposite tradition (respect SNG-101 foreclosure).

## OPEN QUESTIONS — CCODE ROUND 2
1. `recommendSkills` scoring weights — is there an existing "build lean" signal (highest attribute investment) to key style off, or compute from tendencies? (Both exist; pick the stabler.)
2. Wheel label rendering at scale — 24 traditions × several tiers is many nodes; confirm the zoom-aware label reveal keeps the SVG performant (only render labels for nodes above a zoom threshold + owned/one-away).
3. Function color palette — 8 families need 8 distinguishable colors that also read on the dark wheel; reuse any existing tradition-color logic or a fresh function palette? (Recommend fresh — function ≠ tradition, shouldn't share colors.)
4. Should the function filter be on the wheel only, or also filter the ability list / level-up catalog? (Recommend wheel first; list filter is a cheap follow-on.)
