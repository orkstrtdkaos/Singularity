# SPEC — SNG-098: Skill Battles — the two-sided contest, fog-gated by insight
## Aevi (PO) · 2026-07-14 · authored to spec · **awaiting CCode ROUND 2**

> **One line.** A duel/contest becomes a genuine turn-based exchange where **both sides are rolling agents** — each declares a skill + intensity and rolls — and **how much of the opponent's side you see (their intent, their roll, their breakdown) is gated by your insight/reveal (`senseTier`)**. Fog of war is the mechanic. This is the model PvE duels and PvP both run on.

> **Verified against HEAD `v1.8.63`.** Three foundations already exist and this spec composes them rather than inventing:
> 1. **`skill_battle_system.json`** — Erik authored the two-sided seed 2026-07-07: *"both sides declare a skill + INTENSITY… each rolls d100 + attribute + ability-tier + MATCHUP… higher net wins the round and shifts momentum."* The contest model is written; it is **not wired** (this is the ticket that wires it).
> 2. **`sense.js senseTier` / `renderSense`** — the fog primitive: *"the engine always knows the true odds; the CHARACTER only perceives what their attunement earns."* Tier 0 blind → tier 3 near-precise. **This is the exact lens Erik's ask needs — pointed at the opponent instead of at your own odds.**
> 3. **`resolve.js successChance`** (+ SNG-106's retained `{total, components}`) — the single-roll engine each side's roll runs through.
>
> **What does NOT exist at HEAD (why this is a model change, not a display one):** in `encounters.js` today the **opponent does not roll.** A duel round is ONE d100 (yours); the opponent is a stat block (health/threat/yieldAt) whose threat becomes difficulty, and your `degree` maps through a margins table. There is no opponent decision, no opponent roll, nothing to reveal. This spec makes the opponent a rolling, deciding agent.

---

## THE MODEL

### 1. Two agents, each a roller
A skill battle runs when two wills contest with skills (Erik's trigger). Each round, **each side**:
- **declares** a skill (from what they have) + an **intensity** (Conserve 0.6× / Standard / Surge 1.6× energy, per `intensity_scaling`),
- **rolls** `d100 + attribute + ability-tier + matchup` (the same `successChance` spine both sides use),
- the **higher net wins the round** and shifts the **momentum meter** toward their outcome by the margin; **energy attrition** accrues (Surge burns; Conserve preserves but rolls weaker).

The opponent needs a real (small) sheet to roll: `{ skills:[{id,tier}], attributes, energy, intensityPolicy }`. Duel opponents get this generated from their existing threat/tacticTags (a threat-35 raider becomes a modest skill sheet); **PvP** supplies both sheets from real characters — same code path, which is the whole point of building it two-sided.

### 2. The opponent DECIDES — and the decision is the game
The opponent picks skill + intensity each round via a small policy (not the narrative GM inventing it — a deterministic **`opponentPolicy`** the engine runs, so it's fair and testable):
- pick a skill that **matches up well** against your last-shown tendency (if they've read you),
- set intensity by their **health/momentum state** (behind → Surge, ahead → Conserve, per `tacticTags` personality: a berserker Surges, a duelist paces).
The policy is legible and seeded; PvP replaces it with the other player's actual declaration.

### 3. ⭐ FOG OF WAR — insight gates what you see of their side (Erik's core ask)
This is the spine. Run the **same `senseTier`** you already use for your own odds, now against the *opponent's* declaration and roll. Your read of them scales with your insight, your reveal skills, and Strategist-on-planned:

| Your senseTier vs them | What you see of the opponent's round |
|---|---|
| **0 — blind** | Only the *outcome* after the fact ("they strike hard and you're driven back"). No intent, no number. You fight by feel. |
| **1 — a read** | Their **intent category** before you commit ("they're gathering to *strike*") — enough to counter-pick, not the value. |
| **2 — a measure** | Intent + a **band** on their roll ("a strong strike — this will land unless you out-tier it"). |
| **3 — near-precise** | Their declared skill, intensity, and their **roll breakdown** — the SNG-106 popup, *for their roll* ("Raider · strike · Surge · d100 42 +tier 10 +matchup 8 = 60"). You see the enemy's math. |

Reveal skills (an active "read the opponent" action) can **buy a tier** for a round — spend your turn scouting instead of striking, and you see their next move clearly. That's a real tactical choice: tempo vs information. Symmetric in PvP — your opponent sees *you* only as well as *their* insight allows, so concealment and misdirection have teeth.

**The engine always knows both rolls in full; the fog is purely a presentation gate over true state** (exactly the `sense.js` doctrine, extended to the adversary). Never fabricate a fake opponent number to fill fog — show less, never show false. At tier 0 you get the outcome and nothing more.

### 4. Matchup is the skill (from the existing table)
`skill_battle_system.json`'s matchup table already defines the edges (reveal beats conceal; shield blunts strike but can't win; a bound striker is at disadvantage). Fold in the three-type taxonomy from the withdrawn §7b (direct opposition / functional opposition / parallel expression) as the matchup's *kinds*, and the environmental-conditions table as a per-round modifier reading §9b substrate density. The Coliseum is a place these happen. Vulnerability-disclosure stays an authoring law: every skill gestures at what beats it.

### 5. Resolution
Momentum meter fills toward a side; battle resolves at meter-end or when a side is exhausted/yields. Outcomes map to the existing duel consequences (health, yield, flee) so the encounter shell is reused — this replaces the *round resolver*, not the encounter lifecycle.

---

## ENGINE SURFACES

| Module | Change |
|---|---|
| `content/packs/core/rules/skill_battle_system.json` | Amend: add the §7b-salvage (three-type taxonomy, conditions table, Coliseum, vulnerability-as-law); add `opponentPolicy` rules; add the `senseTier`→visibility mapping table. **No prose parsed as machine input** (the §7b `notFor` lesson). |
| **`engine/skill_battle.js`** (new) | The two-sided round resolver: both sides declare→roll→compare→shift momentum→attrition. Both rolls via `successChance` (reusing SNG-106 retained components). `opponentPolicy(oppSheet, seenPlayerTendency, state)` picks the opponent's skill+intensity. Pure/deterministic (rng injectable) for tests. |
| `engine/sense.js` | Add `senseOpponent(ctx, opponentDeclaration, opponentBreakdown) → { tier, revealed }` — the fog gate: returns exactly the slice of the opponent's side the player's tier earns. Reuses `senseTier`. |
| `engine/encounters.js` | Duel routing: when the encounter is skill-battle-typed, hand the round to `skill_battle.js` instead of the single-margins resolver. Encounter lifecycle (offer/flee/yield/health/lethal) unchanged. Generate an opponent skill sheet from threat/tacticTags. |
| `app.js` | Skill-battle UI: your skill+intensity picker; the momentum meter; the **fog-gated opponent panel** (shows exactly `senseOpponent().revealed` — outcome-only / intent / band / full-breakdown per tier); a "read them" action that buys a tier. Reuse SNG-106's breakdown popover for the tier-3 opponent-math view. |
| `tests/skill_battle_sim.mjs` (new) | Both sides roll; matchup edges resolve correctly; momentum + attrition behave; **fog test: at tier 0 the returned opponent view contains NO number; at tier 3 it contains the full breakdown; the engine's internal true state is identical across tiers** (fog is presentation-only, never changes the math). |

## PvP (falls out, no separate ticket)
Because both sides are symmetric rolling agents read through each side's own `senseTier`, PvP is: replace `opponentPolicy` with the other player's real declaration, and each player sees the other only as well as their own insight allows. Concealment/misdirection/reading become the meta. This spec builds PvE duels; PvP is the same engine with two human declarations — flagged as the natural follow-on, not scoped here.

## DEPENDENCIES / SEQUENCING
- **SNG-106** (retained roll components) is the honest substrate for the tier-3 opponent breakdown — build 106 first, or build its `{total, components}` retention as part of this. The tier-3 "see their math" view IS the SNG-106 popup pointed at the opponent's roll.
- Matchup reads `challengeProfile` / `challengeTypes` (dormant at HEAD, wired here) and the classification `nativeOrCombination` (done this session).
- Replaces §7b (withdrawn); supersedes nothing shipped.

## NON-GOALS / GUARDS
- **Fog is presentation over true state — never false state.** The engine computes both full rolls; the tier gates *display*. Never invent a fake opponent number to fill a low tier. Show less, never show false. (The `sense.js` doctrine, non-negotiable.)
- **The opponent's decision is engine policy, not GM invention** — deterministic and testable, so duels are fair and PvP is symmetric. The narrative GM narrates the resolved exchange; it does not choose the opponent's mechanical move.
- **Not re-architecting the encounter lifecycle** — only the round resolver for skill-battle-typed contests.

## OPEN QUESTIONS FOR CCODE ROUND 2
1. Opponent skill-sheet generation from a threat/tacticTags stat block — is there enough in a duel `def.opponent` to synthesize a fair sheet, or does the encounter generator need to author one at spawn?
2. `senseTier` currently takes `{character, action, location, rules, aptitudeMods}` — confirm it composes cleanly when the "action" being sensed is the *opponent's* declaration rather than the player's own.
3. Momentum meter: net-new state on the encounter, or does an existing encounter field (stages/margins) generalize to it?
