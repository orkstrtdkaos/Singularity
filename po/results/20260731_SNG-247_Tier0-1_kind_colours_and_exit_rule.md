# SNG-247 Tier 0+1 — the frame knows what kind of thing it is

**CCode · 2026-07-31 · v1.8.318 (`6c34c904`) · npm test exit 0 (20 seams, rawProseCaps 63) · verified live on a never-used port.**

Erik: *"what would it take to morph the other encounter types similarly as the fight... but put a different colour
border around them — a chase could be yellow or orange, a puzzle blue or purple. Let's think this through."*

Thought through, then Tiers 0 and 1 built, with a deliberate stop for review before four kinds get built on top of
the contract.

## What the survey found (it changed the cost estimate)

1. **The colour hook already existed and was completely unstyled.** `app.js` has emitted `enc-frame-<kind>` on
   every frame since SNG-230; `style.css` had no rule for any kind, and `.enc-frame` hardcoded `var(--danger)`.
   Built, then never used — so a chase, a sealed door and a knife fight all rendered fight-red.
2. **`mode: "skill_battle"` is set in exactly ONE place** — `startEncounter`, when an `oppSheet` is passed. One
   gate decides whether a thing gets the full turn structure or the old one-roll-per-stage path.
3. **`battleRound` was already kind-agnostic except for one block.** Two sheets, two rolls, a margin delta driving
   a meter — none of it knows it's a fight. Only the pressure block was fight-shaped.
4. **`standoff` is a fifth inert path.** `FRAME_KINDS` has it, `encounterKind` maps `type === "standoff"`, and Aevi
   authored both an exemplar (`enc_the_toll_keeper`) and a receipt-line format — but **nothing in the engine ever
   mints one**. Today a toll-keeper is minted as a challenge and reads as "hazard."

## The split that shapes everything after this

The four non-fight kinds are two problems, not one.

**Opposed — chase, standoff.** Someone is on the other side with intent and their own crafts. `battleRound` is
already the right model and `synthesizeOpponentSheet` already exists. They need a relabelled meter and a different
win condition. ~80% reuse.

**Unopposed — hazard, puzzle.** The ground and the door have no turn. Giving them an opponent sheet means inventing
an agent — the same error class as inventing a fight target in SNG-246 A. But `rollSide` produces a *margin*, and a
zero-variance sheet **is** a DC. So they can run the identical machinery against a static antagonist that resists at
a fixed number. That's an honest mapping: a sealed door genuinely is a number that doesn't move.

**And the risk worth naming:** if all five kinds become the same five-step panel, the variety is cosmetic and every
encounter just got longer. The answer is that each kind differs in **which step carries the weight** — a puzzle's
sense step is the whole game, a chase's is near-worthless (no time to read), a standoff's payoff is the bonus
action. That's a content dial, not new code, and it is what makes the morph worth doing rather than a reskin.

## Tier 0 — colour by kind

`--enc-hue` is set on **both** the play wrapper (`enc-kind-<kind>`, so the contest panel inherits it) and the frame
itself (so the strip is self-contained wherever it renders). Border, meter fill, takeover glow, `.sb-panel` and
`.sb-receipt` all read the one variable — one colour decision, not five, and when a chase runs on the battle engine
in Tier 2 its panel follows its border with no second decision.

| kind | hue | |
|---|---|---|
| fight | `#c05b4d` | blood — unchanged, the reference |
| chase | `#e07b39` | orange, pushed well clear of the gold quest-decision strip |
| hazard | `#6f7b8c` | stone — hard ground |
| puzzle | `#7c6bd4` | indigo — the sealed thing |
| standoff | `#5aa8a0` | teal — a contest of words, not heat |

Colour is a **third channel only**: the icon (⚔ 🏃 ⚠ 🧩 🗣) and the title already name the kind, so nothing depends
on telling red from orange.

## Tier 1 — the exit rule is content

The pressure block now reads `sb.kinds[kind]`: what one tick costs each side (`playerLoss` / `opponentLoss` as
`{health, energy}`), how many ticks break them (`pressure.breakAtPressure`), and what the tick is *called*
(`pressureLabel`, a per-side clause — "they open the gap" and "you lose ground" are not one sentence with the
subject swapped, so it is two fields with `{them}` interpolated by the caller).

**The fight deliberately authors no costs.** They keep flowing from `momentum.pressure` so those COMBAT_DIALS knobs
stay live — an explicit `playerLoss` would silently shadow them and kill a dial. Only its prose moved to content.
That discipline is written into the content block itself so the next author sees it.

`kind` comes from `encounterKind(def)` — the same function the frame uses for its colour, so the mechanics and the
border can never disagree about what kind of thing you are in.

**And it is DERIVED in `skillBattleRound`, not forwarded into it.** That wrapper hand-builds its `battleRound` call
and has now silently eaten a forwarded option twice (CCODE-35 `effects`, CCODE-45 `phase`). A value the wrapper
computes from what it already holds cannot be dropped on the way in. Declared as **seam #20**
(`seam_encounter_kind_single_source`) — that is `seam_battle_round_options`' lesson applied rather than repeated.

## Verification

9 new checks. The load-bearing one:

> *kind defaults to fight, and an UNKNOWN kind falls back to it — the numbers never move*

because lifting a rule into content is only safe if it provably didn't move the thing it was lifted from. Plus a
gate that **every** `FRAME_KINDS` kind has a hue rule on both hooks — so a new kind cannot ship colourless the way
this one did for months.

`npm test` exit 0 across every gate. Live on **never-used port 8447**: all five hues resolve on both the frame and
the contest panel, a kindless frame falls back to fight-red, and the gold quest-decision strip keeps its own colour
inside a live chase. No console errors.

## What is left (Tiers 2–4, not built)

- **Tier 2 — chase + standoff onto the battle engine.** Needs `type: "standoff"` to actually exist first. Aevi's
  receipt-line content for both kinds is already authored and waiting.
- **Tier 3 — the static antagonist** for puzzle. Per Erik's ruling, **hazard stays the fast one** — a three-stage
  cliff turned into three five-step turns makes the pacing worse, not better.
- **Tier 4 — the morph made visible.** `FRAME_TRANSITIONS` and `chaseFromFight` already exist and are wired: flee a
  fight and you *are* dropped into a chase. What's missing is that it isn't announced — the border should visibly go
  red → amber and say so.

## Files

`style.css` (the hues + every use site) · `app.js` (`enc-kind-<kind>` on the play surface, APP_VERSION) ·
`engine/skill_battle.js` (`kind` param, the per-kind exit rule) · `engine/encounters.js` (derives the kind, applies
the energy loss, per-side prose) · `content/packs/core/rules/skill_battle_system.json` (the `kinds` block) ·
`tests/skill_battle_sim.mjs` (+9) · `tests/seams.json` (seam #20) · `po/COMBAT_DIALS.md` (regenerated) ·
`index.html` (v1.8.318).

*— CCode. Stopping here for review, as recommended: four kinds are about to be built on this contract.
status: complete_pending_review.*
