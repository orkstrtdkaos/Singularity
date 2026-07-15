# CCode Review — SNG-098: Skill Battles (ROUND 2, verify-against-HEAD)

Reviewer: Claude Code · 2026-07-15 · HEAD post-SNG-106 (v1.8.67).
Verdict: **substrate verified — the spec composes real, existing foundations honestly, and the fog-of-war-over-true-state model is sound. GO for build, with three build-shaping notes and the answers below. The largest real cost is the app.js duel-flow rewrite (a declaration→two-roll flow + picker + momentum + fog panel), not the engine round-resolver — budget it as the main piece.**

This is the most architectural spec of the run and it earns the ROUND-2 gate. Unlike the withdrawn §7b, it does **not** re-invent — it wires `skill_battle_system.json` (authored, unwired), points `sense.js` at the adversary, and stands on SNG-106's retained components (now shipped). Every foundational claim checks out at HEAD.

---

## ✅ FOUNDATIONAL CLAIMS — all verified true at HEAD
- **The opponent does not roll today.** `duelRound` (encounters.js:35–71) branches on the *injected* `resolution.degree` (the player's single d100) and applies `cfg.margins[degree] = {opponent, player}` to `opponentHealth`. There is no opponent roll, no opponent decision, nothing to reveal. **This is genuinely a model change, not a display one** — the spec's framing is accurate.
- **`skill_battle_system.json` exists and is unwired.** Authored 2026-07-07; no engine module reads it (confirmed — the ability-arch review found the same). Wiring it is exactly this ticket.
- **`sense.js senseTier` is the fog primitive** and is viewer-indexed (see Q2) — the right lens to point at the opponent.
- **SNG-106 retained `{total, components}` is shipped** (this session). The tier-3 "see their math" view is `showBreakdownPopover` pointed at the opponent's roll — the popover is already generic over any `{components, total, roll, degree}`, so it renders an opponent breakdown with zero change. Dependency satisfied.
- **`challengeProfile` / `challengeTypes` are dormant** (0 engine consumers) and abilities carry `functions[]` (e.g. `["strike","break"]`) — the matchup table's function-keyed edges have a real substrate to read. `nativeOrCombination` classification is done. All the matchup inputs exist.
- **Fog-over-true-state is the correct, non-negotiable doctrine** and matches `sense.js` exactly: compute both full rolls, gate *display* by tier, never fabricate a fake opponent number. The proposed test (internal true state identical across tiers) is the right guard.

---

## THE THREE OPEN QUESTIONS — answered from HEAD

**Q1 — Can a duel `def.opponent` synthesize a fair skill sheet, or must the generator author one at spawn?**
`sanitizeNewEncounter` (encounters.js:200–205) gives every duel opponent `{ name, health (2–8), threat, yieldAt, fleeDifficulty, tacticTags[] }` — **enough to synthesize a modest sheet, but it carries no `skills[]`.** So:
- **Synthesize from threat + tacticTags — viable, and the right default.** Map `threat → (attribute level, ability tier)` (a threat-35 raider → mid attribute + Tier-II archetypal skills), and `tacticTags → intensityPolicy + skill archetypes` (a `berserker` tag → a Surge-leaning striker; a `duelist` → a paced guard/strike). Energy from a `threat`-scaled pool. No generator change needed for the base build.
- **But make `opponent.skills[]` an OPTIONAL authored field that overrides the synthesis.** Synthesized opponents are archetypal (no tradition-specific craft) — PvE battles are shallower than PvP until an opponent is hand-authored. Add `opponent.skills[]` to `sanitizeNewEncounter`'s clamp and to the GM `newEncounter` schema so the generator (or a set-piece) *can* author a real sheet; fall through to synthesis when absent. Forward-compatible, and it's the single biggest lever on PvE depth. **Recommend: synthesize now, accept authored override — don't require the generator to author every sheet.**

**Q2 — Does `senseTier` compose when the sensed "action" is the opponent's declaration, not the player's own?**
Yes, cleanly — because **`senseTier` is a function of the VIEWER, not of the thing sensed.** Its body (sense.js:10–18) reads `character.attunement`, the `action?.planned` Strategist bonus (`aptitudeMods.senseTierBonus`), and `rules.senseTiers`; the `action`'s *content* (axes, difficulty, whose it is) is never inspected. So `senseOpponent(viewer, oppDeclaration, oppBreakdown, rules)` computes `tier = senseTier({ character: viewer, action: { planned: viewerIsScouting }, rules, aptitudeMods })` and returns the tier-appropriate slice of the opponent data. The "reveal skill buys a tier" is just a +1 to that round's tier (or set `action.planned` / a one-round `senseTierBonus`) — clamped to the max `rules.senseTiers` tier. **No signature change required;** `senseOpponent` is a thin wrapper that computes the viewer's tier and slices the opponent's declaration/breakdown by it. This is the cleanest part of the spec.

**Q3 — Momentum meter: net-new state, or does an existing field generalize?**
**Net-new.** The duel state is `{ schemaVersion, encounterId, type, status, round, log, opponentHealth, tactic }` (encounters.js:11–12). `opponentHealth` is the nearest analog but it is **one-directional damage** (depletes to `yieldAt`/fall); the spec's momentum is **bidirectional** (−X..+X, either side's round-win shifts it, resolves at either end). Reframing damage as momentum would lose the "you can be pushed back" half. Add `state.momentum` (bidirectional) **and** per-side energy/attrition tracking (`state.playerEnergy` is `character.energy`; the opponent's is its synthesized pool). Encounter state is a plain object, so this is purely additive — `status`/`round`/`log` and the offer/flee/yield/health lifecycle are untouched (which the spec correctly scopes as unchanged). Keep `opponentHealth` as the "someone falls/yields" outcome; momentum is the round-by-round advantage the meter renders.

---

## 🟠 BUILD-SHAPING NOTES (not blockers — size these before building)

**N1 — `skill_battle.js` becomes a ROLLER, departing from the encounters.js "injected resolution, never rolls its own d100" contract.** encounters.js today *receives* a pre-rolled resolution; the round functions only read `resolution.degree`. A two-sided contest needs **both** rolls, and the spec says both go through `successChance`. So `skill_battle.js` will *call* `successChance` (for the opponent's roll, and likely the player's too, to keep the round atomic). That's fine for a new module — but it means the app-side duel flow inverts: instead of `resolveAction(player) → duelRound(resolution)`, it becomes `collect player's {skill, intensity} → skill_battle.round(playerDecl, oppSheet, state)` which rolls both internally and returns `{playerRoll, oppRoll (full), momentumDelta, revealedForPlayer}`. **The app.js change is therefore not "swap the resolver" — it's a new declaration input (skill + intensity picker), the momentum meter, and the fog-gated opponent panel, replacing the current single-choice duel branch.** That app.js work is the largest single piece; the engine resolver is the cleaner half. Scope accordingly.

**N2 — Keep the player's roll on the SNG-106 rails.** The player's own roll in a skill battle should still produce a `resolution.breakdown` (so the player sees *their* math too, unchanged), and the opponent's roll produces a parallel breakdown that `senseOpponent` gates. One `successChance` path, two callers — don't fork the roll math. The `difficultySource`/matchup contribution the battle adds should enter as a named component (like SNG-106's opposed term), so the breakdown stays honest and self-summing.

**N3 — Matchup must read machine fields only (the §7b lesson, restated).** The matchup edges key on `functions[]` (present on abilities) and `challengeProfile` (dormant, wire here); the environmental modifier reads §9b substrate density (shipped). **Do not parse `notFor` or any prose as matchup input** — the spec says this, and it's the exact trap §7b fell into. The amended `skill_battle_system.json` must carry the matchup table + `opponentPolicy` rules + the `senseTier→visibility` mapping as structured data, never prose.

---

## ✅ AFFIRMED DESIGN (keep through build)
- **Two symmetric rolling agents** → PvP falls out (replace `opponentPolicy` with the other player's declaration). Correct and worth the two-sided cost.
- **Deterministic, seeded `opponentPolicy`** (engine decides the opponent's mechanical move; GM narrates the resolved exchange) — matches the project's "engine rolls, model narrates" doctrine and makes duels testable + PvP fair. Right call.
- **Fog is presentation over true state, never false** — the load-bearing invariant; the tier-0-has-no-number / tier-3-has-full-breakdown / true-state-identical-across-tiers test is exactly the guard to write.
- **Lifecycle reuse** (offer/flee/yield/health/lethal via the existing encounter shell) — only the round resolver is replaced. Sound scoping.

## RECOMMENDATION
GO for build. Sequence: (1) amend `skill_battle_system.json` with the §7b-salvage taxonomy + conditions + `opponentPolicy` + the visibility table (structured, no prose-as-input); (2) `skill_battle.js` pure two-sided resolver + `opponentPolicy`, both rolls via `successChance`, with `skill_battle_sim.mjs` proving matchup edges, momentum/attrition, and the fog-is-presentation-only invariant *first*; (3) `sense.js senseOpponent`; (4) `encounters.js` duel routing + opponent-sheet synthesis (with optional authored `opponent.skills[]`); (5) the app.js declaration/momentum/fog UI (the largest piece — reuse the SNG-106 popover for the tier-3 view). Build the engine + sim green before the UI. PvP stays a flagged follow-on.
