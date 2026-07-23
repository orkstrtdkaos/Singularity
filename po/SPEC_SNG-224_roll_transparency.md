# SPEC — SNG-224: Roll popup — name every modifier's source + flip to roll-OVER presentation
## Aevi (PO) · 2026-07-22 · verified at origin · Erik-directed

> **Erik:** improve the roll-result popup — "a little more insight into the numbers: why penalized for
> equipment? WHAT equipment? What specifically helped? What skill was used?" And the big one: **"you have to
> roll LESS THAN the success chance. I, and most RPG players, are used to rolling OVER a number."**

## §1 — Two changes, both to the SAME popover (verified)
The breakdown popover is `showBreakdownPopover(bd)` (app.js:153) — it renders the resolver's RETAINED math
(resolve.js: every term goes through `add(label, value)`, so `sum(components) === chance` by construction —
the popup shows real math, never a re-derivation). Both asks land here; neither touches the underlying
probability.

## §2 — Ask 1: NAME each modifier's source (transparency)
Right now components are `{label, value}` and some labels are GENERIC. Verified in Erik's screenshot: "equipment
−8" (WHICH equipment?), no line naming the SKILL rolled. But the precedent for specific labels already exists
— opposed terms ARE named (resolve.js:4155-style "the raider (threat 3) −11", not anonymous). So the fix is to
extend that naming to every component:
- **equipment −8 → name the item(s).** `add("equipment", equipmentBonus)` (resolve.js:94) collapses the source.
  `inventory.equipmentBonus` KNOWS which items contributed (and which HURT — an ill-matched tool penalizing).
  Have it return per-item contributions so the line reads e.g. "equipment: Wither-Iron Blade (ill-suited here)
  −8" — name the item AND why it helped or hurt. If multiple items, list them (or the net with a tap-for-each).
- **name the SKILL/ability rolled.** The popup shows "ability rank 3 +15" but never the craft's NAME. Add a
  header or line: "Order-Sense (rank 3)" — the player should see WHAT they rolled, not infer it. The action
  carries the abilityId; surface its name.
- **the positives already read okay but can name their source too** — "reason 7 +80" is clear; "mental
  aptitude +13" could name WHICH aptitude (strategist? scholar?) that applied; "substrate (the lattice here)
  −38" is good (already names the cause) — that's the model for the rest.
- **Principle:** every line names its SOURCE, not just its category. A player reading the popup should be able
  to point at each number and know exactly what in their character/gear/situation produced it. The data is
  all retained at the `add` sites; this is enriching labels, not new computation.

## §3 — Ask 2: flip to roll-OVER presentation (the convention fix)
The system is percentile ROLL-UNDER: success chance 77%, roll d100, succeed if roll ≤ 77 (rolled 30 →
success). Valid (Call of Cthulhu / BRP use it), but Erik + most D&D-trained players expect ROLL-OVER: roll
high, BEAT a target. **This is a PRESENTATION flip — the math and probability are identical; only the displayed
numbers change.**

### The clean reframe (recommended)
Present the roll so HIGHER IS BETTER and you BEAT a target, keeping probability exact:
- **Effective roll = 101 − raw_roll** (so the raw 30 displays as 71 — high is good).
- **Target to beat = 101 − success_chance** (77% chance → beat 24).
- Succeed if effective_roll ≥ target: 71 ≥ 24 → success. **Mathematically identical to 30 ≤ 77.**
- Popover foot reads: **"rolled 71 — needed 24+ → success"** instead of "rolled 30 → success". Higher roll =
  better, beat the number = intuitive.
- Keep "Success chance 77%" AS-IS at the top — a bigger % reading as "easier" is already intuitive; only the
  ROLL line flips.

### Alternative (if the dice ANIMATION shows the raw die)
If a die animation renders the raw 30 and inverting it would desync the animation, the lighter option: keep
the raw roll but relabel so the DIRECTION is explicit and framed as beating a floor — "rolled 30 · needed ≤77
· success (you cleared it with room)". This keeps roll-under but removes the "wait, under is good?" confusion
by stating the direction every time. **Weaker** — it explains roll-under rather than giving the roll-over feel
Erik wants. Prefer the reframe unless the animation forces this.

### Consistency
Whichever is chosen, apply it EVERYWHERE a roll is shown — the inline receipt (app.js:6891 "d100: {roll} vs
{chance}"), the step-failure receipt, the preview odds. One roll-direction convention across the whole UI, or
the fix creates a NEW inconsistency.

## §4 — Scope check (Erik: "nothing major")
- §2 (naming) is label enrichment at existing `add` sites + one skill-name line — small, additive.
- §3 (roll-over) is a display transform on ONE foot-line formatter (showBreakdownPopover:157 + the receipt at
  6891) — a 101−x on two numbers, applied consistently. Small, and NON-mechanical (probability untouched).
Neither changes resolution logic; both are presentation. Matches "nothing major."

## OWNERSHIP
CCode — app.js (popover + receipt formatting) + resolve.js/inventory.js (return per-item equipment
contributions + carry the ability name into the breakdown). No content. No probability change.

## GUARDS
- **Do NOT change the math** — §3 is a display transform; `sum(components) === chance` and the success
  probability stay exactly as they are. A player re-deriving must get the same odds; only the roll's
  DIRECTION of presentation changes.
- **One convention everywhere** — every roll surface uses the same direction after the flip; a mixed
  roll-over-here/roll-under-there is worse than the current consistent roll-under.
- **Name the source, don't invent it** — the equipment/skill/aptitude names come from the RETAINED data at
  the add sites; if a source genuinely isn't tracked, label it honestly ("equipment") rather than guess.
- **Keep the "why this number" tap** (SNG-106) — the popover is already tap-to-open; the enriched labels make
  that existing affordance pay off.

## OPEN QUESTIONS — CCODE ROUND 2
1. §3 — does a dice ANIMATION show the raw die? If yes, does inverting the displayed roll desync it (→ the
   §3-alternative), or can the animation show the effective (101−raw) roll cleanly? This decides reframe vs.
   relabel.
2. §2 equipment — does `inventory.equipmentBonus` already compute per-item contributions internally (easy to
   return) or only a net number (needs a small refactor to itemize)?
3. §2 — is a NEGATIVE equipment term always one ill-matched item, or a net of several? (Determines whether the
   line names one item or lists contributors.)
4. §3 — confirm the exact rule: is it roll ≤ chance (30≤77) or roll < chance? (Affects the 100 vs 101 in the
   inversion so the boundary case stays identical.)
