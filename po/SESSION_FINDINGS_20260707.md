# SESSION FINDINGS — Design Session 2026-07-07 (Gambits, Skills, Classes)
**Purpose:** verification of this session's work against origin, and a handoff note for the next session.
**Verified at origin** (authenticated api.github.com, not raw CDN) at time of writing.

---

## ✅ VERIFIED COMPLETE AT ORIGIN

All content authored this session is live and correct:

| Item | State |
|---|---|
| **Encounter trigger fix** | `onEnterLocation` wired into `travelTo()` in app.js — was defined in the content table (12%) but never called. Arrivals now roll encounters, not just travel(35%)/rest(15%). |
| **Novelty tuning** (resolution.json) | `xp.novelBonus` 3→**8**; `novel.discoveryBonus` 10→**20**; `gambit.completionBonusXp`=**10** added. (Engine must still READ+AWARD the gambit bonus — see gaps.) |
| **Ability corpus** | **117 abilities, 117 tagged with `challengeProfile`** (challenge-type → proficiency 0–3, tier-scaled: T4+ epic at their best thing + solid at a 2nd; T1 good at 1–2, weak elsewhere). Zero untagged. |
| **6 challenge capstones** | Pathless Way (EXPLORE), Last Form (DUEL), The Long Odds (CHASE), The Turning Word (SOCIAL), The Never-There (STEALTH), The Whole Truth (INVESTIGATE). Every challenge-type now has a T4+ epic capstone. |
| **5 travel abilities** | Shortfold (T3 LoS blink), Waygate (T5 long teleport), Shadowstep (T3 stealth-teleport), Skydancer (T4 flight-by-mastery), Light-Borne (T5 true radiant flight). |
| **martial_paths.json** | Baseline defense kit (all characters), Ent form-kit (Branch-Club/Barkskin/Root-Hold/Root-Reach), Blocklands kit, 8 martial backgrounds w/ signature combos. |
| **class_archetypes.json** | 6 non-martial archetypes (Magus, Shadow, Seer, Warden-Healer, Artificer, Voice) as role×reach; multiclass = cross-domain combination. |
| **cross_axis_modifiers.json** | 12 ride-on modifiers (6 horizon axes × 2 poles). Canon: 6 BUILT Reaches = home traditions; 6 HORIZON axes = modifier layers. |
| **pole_signatures.json** | NPC what-moves-them schema + 12 approach types + resolution table. Closes SNG-027's content gap. |
| **skill_utility_audit.json** | All abilities categorized by challenge-utility; the "Palework problem" (thematic-but-tactically-weak skills) diagnosed with reframes. |
| **skill_battle_system.json** | Contested skill-vs-skill: matchup table, energy attrition, multi-round momentum. Unifies SNG-027 social contest as one flavor. |
| **chronicle_played_gambits.json** (lore) | Both playtested gambits canonized as world-events: The Unwinnable Duel at the Redline, The Silent Door. + 1 relationship beat. |
| **greater_arcs.json** | "The Carried Sleeper" added as a claimed node of **What Wakes Beneath** (the deepest arc). |
| **teva.json** (NPC) | Authored as canonical record, **age 21 (adult)**, with Silent Door history + pole-signature. |
| **Specs SNG-017 → SNG-050** | All present in po/SPEC_BACKLOG.md. |

---

## ⚠️ GAPS / REPAIRS NEEDED (for the next session)

### 1. **SNG-049 CONTENT LOST — and the number has been REUSED (collision)**
The spec authored this session as SNG-049 (**"Multi-mode generative challenge design"**) is **gone from the backlog**, and the number SNG-049 now refers to a *different* spec (a per-pole-people skill-access idea). Searching origin: `approach-neutrality`, `generative slot`, `multi-mode` → **0 hits**.

**This spec needs to be RE-AUTHORED under a fresh number.** Its content (load-bearing — Erik flagged it as a correction to a real bias):

> **Multi-mode generative challenge design (provide options; reward novelty)**
>
> The recurring gambit keystones (reframe-the-tool, find-the-seam, question-the-clock) are **Erik's cognitive style**, NOT universal rules. Encoding them as "how challenges are solved" would hardcode one play style into the engine and silently punish players who think differently. Phrase the system **positively and generatively**: the engine's job is to PROVIDE options, and to always leave an open slot that rewards novelty. (Positive structure maintains itself; negative guards erode.)
>
> **The GM/engine PROVIDES options for:** a DIRECT path (head-on power/skill wins outright) · a SUBTLE path (stealth/misdirection) · a SOCIAL path (persuade/ally/intimidate/mediate) · a RULE-BENDING path (reframe/seam/premise — *one option among many*) · an ATTRITION path (outlast/grind) · a PREPARATION path (win by having set up well) · a KNOWLEDGE path (win by knowing the right thing).
>
> **The open generative slot (the important part):** every challenge keeps an **open generative structure** — a path for approaches nobody enumerated. A novel approach is evaluated on its merits, allowed to succeed if the fiction supports it, and **rewarded** (novelBonus/discovery). The listed modes are **seeds, not walls**. Novelty is structural, not a bonus tacked on.
>
> **Implications:** challenges author ≥3 distinct MODE-paths + the open slot (a challenge solvable only by reframe is under-built — CI could flag it); difficulty parity (modes carry different COSTS — force=resources, reframe=setup, social=standing, attrition=time — at comparable viability); **the AI GM will drift toward the current player's cognitive style (observed live), so the GM prompt must actively offer the modes the player isn't using.**

### 2. **All three PLAYTEST FINDINGS sections lost from the backlog**
Searching origin: `Silent Door`, `Commission House`, `gambit definition`, `fewer steps` → **0 hits**. The *lore* chronicle survived (both gambits are canonized in `chronicle_played_gambits.json`), but the **design findings** did not. These need re-capturing — most importantly **the gambit definition**, which Erik gave explicitly:

**THE GAMBIT DEFINITION (load-bearing, Erik):**
- A gambit is a set of **connected challenges forming a whole**, each solvable **multiple ways**, **planned across before running** (not turn-by-turn).
- **The necessary ELEMENTS define a gambit, not the step count.**
- **Fewer steps are HARDER** (less slack); **invoking a fallback ADDS steps** — the gambit *grows mid-run* as fallbacks fire. Difficulty ≈ inverse of step-count-slack.
- Validated live: in the Commission House run, the primary line for a step **failed** (rolled 51) and the gambit survived on a stacked, character-fit fallback (rolled 79). Single-path plans die there; a gambit absorbs the bad roll.

**Playtest-derived craft patterns (three distinct gambit shapes, all won):**
- **Social/political** (Redline duel): combat held entirely in reserve; **honest-misdirection** (every layer TRUE — power comes from what the opponent *misunderstands*, not from what the player fakes); **own-mechanic-reversal** (the villain destroyed by the honor-forms he weaponized); **character-native victory** (the Ent won as an organizer/grove-being, not a generic warrior).
- **Party puzzle** (Silent Door): solved by **understanding, not force**; the antagonist was a thousand-year *misunderstanding*, not an enemy; **"question the clock"** (the player asked why a countdown mattered if the thing was locked in a vault — the pressure was genuinely benign, and rewarding that inverted the scene); **cost-as-responsibility** (the winning toll was an ongoing caretaking promise, not a one-time payment). **REQUIRED true simultaneous party turns (SNG-038)** — the GM twice collapsed a called-for simultaneous 3-channel read into round-robin, and the puzzle literally cannot be expressed round-robin.
- **Logistics vs a system** (Commission House): no villain — antagonist = ward + sweep + questioning + clock. Won on maneuver and **reframe-the-tool** (stop folding *out* through the ward; fold *small and sideways* into an already-cleared room — repositioning, not escape).
- **Recurring GM failure mode:** puzzles *feel* stepwise, so the GM repeatedly collapsed "declare plan → resolve with maneuvers inside" into turn-by-turn "now what?" prompting. Erik flagged it directly, twice. **GM RULE: hold the plan-level view against the puzzle's stepwise pull.**

### 3. **Engine work still owed on shipped content** (not lost — just not built yet)
- `gambit.completionBonusXp` (=10) is in resolution.json but **the engine must READ and AWARD it** in `executeGambit`'s success path.
- **SNG-038 (simultaneous party turns) should be priority-bumped** — the Silent Door playtest showed it's *required* for co-op puzzles, not a nice-to-have.
- The Ent gating root cause (SNG-017 addendum): `progression.js` `effectiveLevelReq` hardcodes the valley/harmonic/radiant triangle and returns `null` for harmonic↔radiant, so a non-valley origin (an Ent) **cannot ever** take resonant skills. Fix = origins.json + generalized `character.traditionAccess[]`.

---

## SUGGESTED ACTION FOR NEXT SESSION
1. **Re-author the lost multi-mode/generative spec** under a fresh SNG number (content above). Resolve the SNG-049 number collision.
2. **Re-capture the gambit definition + playtest findings** (content above) — ideally into a durable design doc (e.g. `content/packs/core/rules/gambit_design.md`) rather than only the backlog, so a backlog rewrite can't lose them again.
3. Note the durability lesson: **design findings living only in SPEC_BACKLOG.md are vulnerable to rewrites.** Canonical design content belongs in the content packs (which survived intact) — the backlog is for *work items*, not *design canon*.
