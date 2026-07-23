# SPEC — SNG-218: Level-Up redesign — LLM suggestions + skill wheel, one reachability gate
## Aevi (PO) · 2026-07-22 · verified at origin · Erik design direction

> Five issues in the Level-Up modal (Erik, two screenshots). Erik's direction: **LLM-rationalized
> suggestions at the top; the skill wheel below for browsing AND to show the recommended crafts highlighted
> on it; reachable crafts highlighted, aspirational ones shown DIMMED and labeled "later" (not hidden).**

## §1 — THE BUG under everything: `reachable` ignores standing (verified)
The wheel's reachability predicate (app.js ~5012):
`reachable: v.allowed && !isOwned && (character.level) >= (ab.levelReq)`
— checks domain-allow, owned, and LEVEL, but **NOT tradition standing.** Yet the modal's own banner says
*"deep standing with this people is not yet earned (standing 7 of 10)."* So **The Cut Thread** (levelReq 5,
Silas level 19, no other prereq on the ability) reads `reachable: true` — and gets SUGGESTED with a Learn
button — while the actual learn-gate blocks it on standing. **The suggestion filter and the learn gate
disagree because `reachable` is missing the standing term.**

**Fix the predicate ONCE, both surfaces inherit it:** add the standing check (and any other real learn-gate
term) to `reachable`, so it means "learnable *right now*, all gates." Then:
- the LLM suggestion (below) filters on it → never suggests Cut Thread until standing is earned,
- the wheel highlight uses it → Cut Thread renders as ASPIRATIONAL (dimmed, "later"), not reachable,
- the Learn button only appears on genuinely-reachable crafts.
This is the root fix; the redesign below is the UX around it.

## §2 — The LLM-rationalized suggestion (the new capability Erik wants)
> Erik: *"I want to genuinely have an LLM-generated rationalized suggestion of next skills to learn at the
> top."*
The current "Suggested for you" is a HEURISTIC (rounds-out-kit / touches-all-8-families — app.js:2431). Erik
wants a REASONED pick. Add an LLM suggestion call:
- **Input context:** the character's owned crafts + ranks, declared aspirations, boosted crafts (SNG-215 A1),
  play-style tendencies (the intentTag accrual, SNG-113), current standing per people, skill points
  available, and the REACHABLE-NOW craft pool (§1 — only craft it can actually recommend learnable things).
- **Output:** 2-4 suggested crafts, EACH with a one-line rationale grounded in THIS character ("you lean on
  perception but have no way to WARD — Death-Ward covers the gap"; "you've been building toward the Cut
  Thread; deepen your standing and it opens"). Reasoned, not rule-derived.
- **Constraint:** suggestions must be REACHABLE-NOW (per §1). An aspirational pick the character is building
  toward may be MENTIONED in a rationale ("keep deepening for the Cut Thread") but not offered as a Learn —
  the "later" framing, not a button.
- **Home:** top of the modal, above the wheel. This is a real generate call (parallels suggestBuild, which
  already exists for character creation — app.js:552 — reuse its shape).
- ⚠️ Graceful fallback: if the LLM call fails, fall back to the current heuristic (never leave the top empty).

## §3 — The skill wheel as the browse + highlight surface
> Erik: wheel below the suggestions, doing double duty.
The wheel already exists (app.js:5009) with the detail panel (5086) and learn/deepen wired (5123). Bring it
into the level-up modal:
- **Browse:** the wheel replaces the exhaustive linear list (image 2 — every tradition, every craft, all the
  "need 3 points" locked ones in a giant scroll). Spatial, compact, all 24 traditions legible at once instead
  of a page-long dump.
- **Highlight the recommendations ON the wheel:** the §2 LLM picks light up on the wheel (a distinct marker),
  so the player sees both WHAT is recommended and WHERE it sits in the craft-space. The suggestion list and
  the wheel are the same information, twice — text rationale at top, spatial position below.
- **Reachable vs aspirational (Erik's ruling):** reachable-now crafts HIGHLIGHTED; aspirational ones DIMMED
  and labeled "later" (the wheel already has `dim`/`barred`/`closed` band states — map standing-locked to a
  "later" visual, not hidden). Nothing disappears; the player sees their whole future kit, with the
  learnable-now subset lit.

## §4 — The detail popup (Erik's "really important" point)
> Erik: *"there's no informational popup for skill progression and mechanics — that's really important when
> picking your next skill."*
The wheel's detail panel (app.js:5086) ALREADY exists and shows what a craft does + learn/deepen. Wire it as
the click target from the level-up wheel, and ensure it shows the PICK-RELEVANT info:
- **What it does** (the mechanical effect, function families).
- **Rank progression** — what rank 2 and rank 3 unlock (depth is earned through use — show the ladder so the
  player knows where this craft GOES).
- **What it deepens into / combines with** (chains, braids, emergence) — the craft's future.
- **Cost + gates** — energy cost, skill-point cost, and if aspirational, WHAT unlocks it ("earn deep standing
  with the Ashwardens").
This is mostly POINTING the modal at the existing detail panel + making sure progression/mechanics are IN it
— not building a new popup from scratch.

## §5 — What this retires
- The heuristic "Suggested for you" → replaced by the LLM suggestion (§2), heuristic kept only as fallback.
- The exhaustive all-traditions linear list (image 2) → replaced by the wheel (§3).
- The "suggests unlearnable crafts" bug → fixed at the `reachable` predicate (§1).
- The "no mechanics popup" gap → the wired detail panel (§4).

## OWNERSHIP
- **Aevi (me):** the LLM suggestion PROMPT + rationale structure (§2) — what context it reads, what a good
  rationale looks like, the reachable-only constraint. I author this as the suggestion spec/prompt content.
- **CCode:** the `reachable` predicate fix (§1), the modal render around the wheel (§3), wiring the detail
  panel into the modal (§4), the LLM call plumbing (§2). All app.js/engine.

## GUARDS
- **One reachability gate** — §1's fixed `reachable` is the SINGLE source for "can learn now"; suggestion,
  wheel highlight, and Learn button all read it. Never two disagreeing definitions again (that's THIS bug).
- **Aspirational is visible, not offered** — dimmed + "later" + a rationale mention; never a Learn button.
- **Reuse, don't rebuild** — the wheel, the detail panel, and suggestBuild's LLM shape all exist; this is
  composition + the standing-gate fix + a new suggestion prompt, not new subsystems.
- **LLM suggestion degrades gracefully** — heuristic fallback on failure.

## OPEN QUESTIONS — CCODE ROUND 2
1. §1 — beyond standing, does the learn-gate have OTHER terms `reachable` misses (energy? skill-point
   sufficiency? a chain prereq)? Enumerate the full learn-gate and make `reachable` mirror it exactly.
2. §2 — reuse suggestBuild's call path, or a new generate type? What character context is already assembled
   that the suggestion prompt can read vs. needs adding (aspirations, standing, play-style tendencies)?
3. §3 — does the wheel fit the modal's footprint, or does level-up become its own screen? (Image 2's list is
   already near-fullscreen; the wheel may want the space.)
4. §4 — does the detail panel already show rank progression + deepens-into, or only current effect? If only
   current, that's the one real ADD to the panel.
