# SPEC — SNG-106: Roll-breakdown popup (tappable "why this number")
## Aevi (PO) · 2026-07-14 · authored to spec · **awaiting CCode ROUND 2**

> **One line.** The roll receipt shows `d100: 43 vs 62 — success` but never *why* 62. Make the chance tappable/hoverable to reveal the full component breakdown — attribute, skill, ability rank, spectral fit (self + place), aptitude mods, equipment, novel/discovery, substrate, exhaustion, and difficulty (including the opposed contribution named, not anonymous). Phone-reachable via tap, same mechanism as the vitals/info-dot work.

> **Verified against HEAD `v1.8.63`.** The `.roll-receipt` element already exists (`app.js` L4889) and already carries a contextual ⓘ (SNG-084 Ph2) — but it explains the *category* ("this was novel"), not the *arithmetic*. `successChance` (`resolve.js` L20–78) computes a rich breakdown and **throws every component away at `return`** (L78 returns a single rounded number). The popup cannot be honest until the resolver *retains* its parts. That data-retention change is the spine of this ticket.

---

## THE HONEST-DATA PROBLEM (why this is a resolver change, not just a UI one)

`resolveAction` returns `{ roll, chance, degree, action }` (L100). `chance` is the final clamped total; the *components* that produced it are local `chance += …` accumulations inside `successChance` that vanish. **A breakdown popup built from anything other than the resolver's own components would be a re-derivation — a second calculation that can silently disagree with the real one.** That is the exact "passes on paper, fails in use" class: a UI that computes its own explanation drifts from the engine the moment either changes. So the rule for this ticket:

> **The popup renders the resolver's retained components verbatim. It never recomputes them.** One source of truth: `successChance` emits the breakdown; the UI only formats it.

## THE COMPONENTS THAT EXIST TO SURFACE (all live in `successChance` today)

Every one of these is already computed; the ticket is to *keep* them:
1. **Base chance** (`rules.baseChance` seed).
2. **Attribute** — sub-attribute if present else parent; split across soft-cap (competence) and beyond-cap (mastery) so a high stat reads as two lines ("agility 5: +40 base, +5 mastery").
3. **Skill** (`skillId × skillBonus`), when present.
4. **Ability rank** (`abilityLevel × abilityLevelBonus`).
5. **Spectral fit** — self-alignment (who you are vs what you're doing) + location fit (does the place help), clamped. Two named contributions.
6. **Aptitude mods** — planned-action, physical/mental/social, rapport, social-finesse penalty, discipline penalty. Each only when it fired. (These are the player's character-shaping — worth showing by name.)
7. **Equipment** (`equipmentBonus`, with the helper items already named in `equipHelpers`).
8. **Novel −surcharge / Discovery +bonus** (mutually exclusive).
9. **Substrate penalty** (SNG-090 — the lattice starved/crowding; already surfaced as a receipt line, now itemized in the math too).
10. **Exhaustion** (−penalty at 0 energy).
11. **Difficulty** — `action.difficulty`. **THE OPPOSED TERM LIVES HERE.** In encounters, the opponent's threat becomes added difficulty (`encounters.js`: `threat × threatToDifficulty (0.3) + complications`). So an "opposed roll" is not a separate mechanic — it is *already* inside the difficulty subtraction, currently anonymous. This ticket **names it**: instead of "difficulty −11" the breakdown reads "the raider (threat 35) −11" (+ "complication −5" when one fired). That is the single most valuable line for player trust, and it costs only passing the opposition's label into the difficulty term.
12. **Clamp** — floor/ceiling (5–95). Show only when it actually bit ("clamped to 95").

## THE CHANGE

**1. `resolve.js` — `successChance` returns components, not just a number.**
Refactor so every `chance += x` also pushes `{ label, value }` into a `components` array. Return `{ total, components }` (or set an out-param). `resolveAction` attaches it: `resolution.breakdown = components`. Keep a thin back-compat: existing callers reading the numeric chance get `total`. **The math is not changed — only retained.** A regression test asserts `sum(components) clamped === old successChance(...)` for a battery of actions, so the refactor is provably behavior-preserving.

**2. Difficulty term carries its source.** Where the caller sets `action.difficulty` from an encounter, also set `action.difficultySource` (e.g. `"the raider (threat 35)"`, `"the seal"`, `"complication"`). `successChance` labels the difficulty component with it when present, else generic "difficulty". This is what makes the opposed roll legible.

**3. `app.js` — tappable breakdown on the existing receipt.** The `.roll-receipt` at L4889 already renders `d100 vs chance` + a contextual ⓘ. Wrap the `${r.chance}` in a `data-breakdown` span (tappable/hoverable). On tap/hover, render `r.breakdown` as a signed list into the **same popover surface the info-dot uses** (delegated click handler at L48 → `showHelp`-style popover), so phone parity is inherited, not rebuilt:
```
Success chance 62%
  agility 5            +40
  · mastery            +5
  Palework rank 2      +10
  spectral (you)       +6
  spectral (place)     −3
  planned action       +5
  the raider (threat 35) −11
  ────────────────────
  total                 62%   (rolled 43 → success)
```
Signed, aligned, tabular figures. The roll and degree are already known on `r` — close the popover with the outcome so the player sees number → roll → result in one place.

**4. Gambit receipts** (`.roll-receipt` at L4576) get the same `data-breakdown` treatment per step, reading each step's retained components.

## VERIFICATION
- **Behavior-preserving refactor:** `sum(components)`, clamped, equals the pre-refactor `successChance` for a fixture battery (attribute-only, +skill, +ability, novel, discovery, exhausted, substrate-starved, high-difficulty/opposed). This is the load-bearing test — the whole ticket's honesty depends on the popup showing the real math.
- Tap the chance on a phone viewport → breakdown popover; tap-away dismisses (info-dot parity).
- An encounter round shows the opponent as a **named** difficulty line, not "difficulty −N".
- A clamp shows only when it bit.
- Regression: `resolveAction`'s numeric `chance`/`degree` unchanged; narration path untouched.

## NON-GOALS / GUARDS
- **The popup never recomputes.** If `resolution.breakdown` is absent (old turn in history before this shipped), show the existing `d100 vs chance` line with no breakdown affordance — never fabricate a breakdown for a turn that didn't retain one. Graceful, honest degradation.
- **No math change.** Any diff to a resolved `chance` is a bug in this ticket, caught by the sum-equals test.
- **Opposed rolls are not re-architected.** SNG-098 (skill battles) may later add a true two-sided contest; this ticket surfaces the opposition *as it resolves today* (threat→difficulty). When SNG-098 lands, its contest can emit its own `difficultySource`/components into the same popup — the surface is forward-compatible.

## OPEN QUESTIONS FOR CCODE ROUND 2
1. Cleanest retention shape: does `successChance` return `{total, components}` (caller updates ~how many sites?), or push onto a passed-in `ctx._breakdown` to avoid touching every caller? Your call against the real call-site count.
2. `showHelp` signature — does it take raw text or a registered help-id? The vitals ticket (SNG-104) hit the same question; settle both the same way (a raw-text popover helper is cleaner for computed content).
3. Do gambit step receipts retain per-step `ctx` today, or only the final `{roll, chance, degree}`? If only the latter, step-level breakdown needs the same retention change threaded into the gambit runner.
