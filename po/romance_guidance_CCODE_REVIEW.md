# CCode Review — romance_guidance.md (ROUND 2, verify-against-HEAD)

Reviewer: Claude Code · 2026-07-14 · HEAD post-pull · v1.8.57
Verdict: **buildable, and mostly maps onto infrastructure that already exists — but one item is a content-POLICY change (not a wire-up) that Erik must explicitly own, and the `adultGate` naming is wrong throughout and must be corrected before build.**

The craft guidance (Parts 1–3) is strong and additive. The engine notes (Part 4) are close but rest on a field name that doesn't exist. Most of what the spec asks CCode to "build" is already built — the rating→register ladder, the system-prompt slot, the minor-protection floors, and the conditional-doc injection pattern all exist at HEAD. Details, then the four questions.

---

## 🔴 THE ONE THAT NEEDS ERIK'S EXPLICIT CALL

### P1 — Tier 3/Tier 4 RAISE the current content ceiling; the code today caps R+ at "evocative, never explicit"
There is already a per-rating register ladder in the GM system prompt: `ratingRegister(preset)` (gm.js:123–132). Its top tier is unambiguous:

> **R+** (gm.js:129): *"…charged, sensual, and evocative on intimacy and desire… **Evocative, NOT graphic depiction of sexual acts: a charged erotic REGISTER, never explicit mechanics.**"*
> **R** (gm.js:128): *"intimacy carries genuine heat and tension."*

The spec's top tiers **exceed** this:
> **Tier 3 (Mature):** *"described with enough detail to be real… without fading to black… disrobing, physical response, the arc of a scene."*
> **Tier 4 (Adult):** *"Explicit. Full detail — acts, bodies, sensation — without softening or implication."*

Mapping the spec's 5 tiers onto the 5 existing presets (see P2) puts Tier 4 = R+ — so adopting the spec **removes the "never explicit mechanics" cap that is currently coded.** That is a deliberate content-policy escalation, not a wire-up. It's Erik's call to make, explicitly, and the review should not bury it inside "engine notes." Everything else in the spec is compatible with the current architecture; **this is the decision.**

*Note the spec correctly preserves the two absolute floors that are independent of the ceiling (app.js:1118, art.js:130): never prohibited content, and **a minor is never portrayed in romantic/sexual content at any intensity.** Part 4's NEVER clauses do not touch that floor — good, and it must stay coded exactly as-is regardless of the Tier-4 decision.*

---

## 🟠 CONTRACT / NAMING (must fix before build)

### N1 — `player.adultGate` is not a field; the content level is `profile.rating.preset` (enum G/PG/PG-13/R/R+)
The spec reads `player.adultGate` ~8 times as "the player's chosen content level." At HEAD:
- The stored content level is **`profile.rating.preset`** — one of **`"G" | "PG" | "PG-13" | "R" | "R+"`** (`RATING_ORDER`/`RATING_LEVEL`, playerprofile.js:31–32), read via `ratingCeiling(profile)` / `ratingLevel(profile)` (playerprofile.js:37–38).
- **`adultGate` is a boolean *authority* parameter**, not a stored level: `canSetRating(profile, target, { authority, adultGate })` — "an explicit Erik-controlled confirm, required for R/R+" (playerprofile.js:43–49). The persisted age-verification boolean is **`profile.rating.adultVerified`** (SNG-052).
- Also note it hangs off **`profile`, not `character`/`player`.**

So "read `player.adultGate`" must become "read `ratingCeiling(profile)` (the preset)." There is **no `adultGate` enum** to map tiers to — there's a **5-value rating enum** plus a separate boolean gate. This resolves the ALERT's "confirm adultGate enum values": the enum is `G/PG/PG-13/R/R+`; the adult *gate* is a boolean, not a tier.

### N2 — Don't invent "Tier 0–4"; revise the existing `ratingRegister` ladder
The spec presents Tier 0–4 as a new scheme. There are already 5 presets with an authored register per tier. Map 1:1 (they align on `RATING_LEVEL` 0–4):

| Spec tier | Existing preset | `RATING_LEVEL` |
|---|---|---|
| Tier 0 All Ages | `G` | 0 |
| Tier 1 Soft Romance | `PG` | 1 |
| Tier 2 Romance | `PG-13` | 2 |
| Tier 3 Mature | `R` | 3 |
| Tier 4 Adult | `R+` | 4 |

The build is: **rewrite the romance clauses inside `ratingRegister` (gm.js:123)** to the spec's per-tier language (subject to the P1 decision on how far R/R+ go), not a parallel tier system. The doc should reference `G/PG/PG-13/R/R+` verbatim, as the spec itself asks (line 241).

---

## 🟡 UNDERSPECIFIED / MINOR

### U1 — `detectsRomanticIntent` is net-new; `parseIntent` has no romantic category
`parseIntent` (gm.js:462) returns an object with an `intentTags` controlled vocab (persuade, charm, negotiate, comfort, rapport, finesse, …) — social, but **no attraction/flirtation/romance tag**. So intent detection is net-new. Two viable shapes: (a) add a `romantic`/`flirt` tag to the `intentTags` vocab in the parse prompt (gm.js:468) + surface it, or (b) a dedicated `detectsRomanticIntent(input, context)` predicate. Recommend (a) — it's cheaper and rides the existing single parse call rather than adding a second model round-trip.

### U2 — The Part 2 "baked-in" block partially overlaps the existing CONTENT CEILING block
`ratingLineForGM()` (app.js:1118) already assembles a `## CONTENT CEILING` block (including `ratingRegister(preset)`) and it's pushed into the **system** tier every turn (gm.js:151 `if (ratingDetail) system.push(ratingDetail)`). The spec's Part 2 adds a second always-present block ("ROMANCE AND INTIMACY — HOW THE GM ENGAGES: don't refuse, don't insert safety language, don't treat social touch as harm"). That's genuinely new (it's engagement-craft, not register), so it's fine to add — but it must be reconciled with the ceiling block so they never contradict (the ceiling says "kept short of the explicit" at PG-13/R; the engagement block must defer to the tier, not override it). Slot it in the **system** tier right after the CONTENT CEILING line (Q4).

### U3 — Doc load path: there's no `content/gm/` dir; docs load via the manifest whitelist
The spec ships the pulled doc to `content/gm/romance_guidance.md` (line 234). At HEAD, loadable `.md`/rule content lives under `content/packs/core/…` and is pulled through the manifest whitelist (`loadRule`, state.js:51+; lore `.md` via the docs list, state.js:110). A doc at an unregistered `content/gm/` path will 404 on GitHub Pages exactly like the halted Tether `secrets.js` carrier. Ship it under `content/packs/core/` (e.g. `rules/romance_guidance` or a `docs/` provides entry) and register it in `manifest.json`, then load via the existing mechanism. Once loaded it's injected with the same conditional-`scene.push` pattern already used for `substrateDetail`/`worldPressureDetail`/`registerDetail` (gm.js:151–185) — that infra exists; no new injection machinery needed.

### U4 — §3.5 INFL function names (`deceive`, `command`, `bind`) — verify against `function_vocabulary.json`
The spec says romantic social rolls "use INFL functions — `deceive`, `command`, `bind`." Confirm those exact function ids exist in `content/packs/core/rules/function_vocabulary.json` before the guidance references them, so the GM's named function matches the vocabulary. (Low risk; `bind` appears in the skill-battle matchup table, so the vocab likely has these — just verify.)

---

## ✅ WHAT THE SPEC GETS RIGHT (affirmed against HEAD)
- Rating-as-**direction-not-just-cap** is already the design (gm.js:119 doc comment, "Rating adds the SECOND lever… a DIRECTION for heat/intimacy/gore," gm.js:77). The spec's "the tier governs register, not engagement" matches the existing intent exactly.
- The **system-prompt slot exists and is stable** (`ratingDetail` → `system.push`, gm.js:151) — Part 2 has a real home.
- The **conditional-doc injection pattern exists** (`substrateDetail`/`worldPressureDetail` conditional `scene.push`, gm.js:151–185) — Part 3 rides it.
- **Minor-protection + no-prohibited floors are already absolute and ceiling-independent** (app.js:1118; art.js:130 clamps minors to ≤PG) — the spec preserves them correctly.
- Harm-rung scoping is right: harm rungs are **ability-use** law (SNG-089), not social-touch law — the spec's "don't treat light social touch as a harm trigger" is consistent with how `harmRung` is fed (abilitiesForGM, progression.js:295) and never applied to bare social actions.

---

## THE FOUR OPEN QUESTIONS — answered from HEAD

**Q1 — Current `adultGate` enum values?**
There is no `adultGate` enum. The **content ceiling** is the 5-value rating enum `RATING_LEVEL = { G:0, PG:1, "PG-13":2, R:3, "R+":4 }` (playerprofile.js:32), stored at `profile.rating.preset`, read via `ratingCeiling(profile)`/`ratingLevel(profile)`. `adultGate` is a **boolean** age-confirm gating access to R/R+ (`canSetRating(..., {adultGate})`, playerprofile.js:44); the persisted flag is `profile.rating.adultVerified`. Map the spec's Tier 0–4 → `G/PG/PG-13/R/R+` and reference those strings verbatim.

**Q2 — Does `parseIntent` already have a social/romantic category, or is `detectsRomanticIntent` net-new?**
Net-new. `parseIntent` (gm.js:462) emits an object with an `intentTags` vocab that includes social tags (persuade/charm/negotiate/comfort/rapport/finesse) but **no** attraction/flirtation/romance tag, and `sanitizeIntent` doesn't whitelist the vocab (so a new tag passes through). Cheapest path: add a `romantic`/`flirt` tag to the parse prompt's tag list (gm.js:468) and branch the doc-load on it — no second model call.

**Q3 — How does the GM load supplemental content docs? Existing pattern or new infra?**
Existing. Rule/`.md` content is loaded once at boot via the manifest whitelist (`loadRule`, state.js) and injected into the per-turn prompt as **conditional `ctx` fields** that get `scene.push`/`system.push`/`world.push`ed only when present (e.g. `substrateDetail`, `worldPressureDetail`, `registerDetail`, `ratingDetail` — gm.js:141–185). So: register the doc in `manifest.json`, load it into `CONTENT`, and on romantic-intent set a `romanceGuidanceDetail` ctx field that pushes the doc + the tier. **No new injection infrastructure** — just a new whitelisted content file (put it under `content/packs/core/`, **not** `content/gm/`; see U3) and one new conditional field.

**Q4 — Where does the Part 2 basics block live in the GM system prompt?**
In the **system tier**, immediately after the CONTENT CEILING line. Concretely: `ratingLineForGM()` (app.js:1118) already produces the `## CONTENT CEILING` block that becomes `ratingDetail` and is `system.push`ed first (gm.js:151). Append the Part 2 romance-engagement block to that same system-tier region (either extend `ratingLineForGM()` or add a sibling `system.push` right after gm.js:151) so it's always present and sits with the register/ceiling rules it must stay consistent with. Keep it short (it's a stable, cache-friendly tier — gm.js:135 note).

---

## RECOMMENDATION
- **Decide P1 first** (does R/R+ go explicit, or stay at the current "evocative, never explicit" ceiling?). Everything downstream — the `ratingRegister` rewrite and the Tier-3/4 doc language — hinges on it. This is the only real decision in the spec; the rest is wire-up.
- **Fix N1/N2** in the doc before build (drop `player.adultGate`; map to `G/PG/PG-13/R/R+`; revise `ratingRegister` rather than invent Tier 0–4).
- Then it's a clean, mostly-additive build: new intent tag (U1), one whitelisted content doc under `content/packs/core/` (U3), one conditional ctx field, a Part 2 system-tier block (U2/Q4), and a `content_ci.mjs` check that the doc loads. Minor floors stay exactly as coded.
