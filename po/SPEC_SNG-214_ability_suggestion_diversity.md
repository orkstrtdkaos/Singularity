# SPEC — SNG-214: The suggested craft defaults to Order-Sense (choice.abilityId has no diversity structure)
## Aevi (PO) · 2026-07-22 · verified at origin

> **Erik, live (screenshot):** the GM is supposed to suggest DIVERSE skills — aspirations, variety — but
> "almost always it just suggests Order-Sense. It needs a better structure to what it suggests, and just
> defaults to Order-Sense because that would almost always be useful."

## §1 — Verified: two suggestion surfaces, only ONE has diversity guidance
The GM has TWO ways to point at a craft, and they're governed differently:
- **16B "OFFER THE TOOLKIT — LIGHTLY" (SNG-142)** — the NARRATIVE offer, "woven into the fiction as a door."
  This IS well-structured: favor a declared ASPIRATION, offer combos/underused crafts, one-per-beat, never
  override a stated intent. Good guidance.
- **`choices[].abilityId`** (gm.js:45) — the craft PRE-FILLED on a mechanical choice, which populates the
  APPLY block (the "Order-Sense" sitting selected in Erik's screenshot). **This field has NO diversity
  guidance at all.** Line 45 is just `abilityId: null`; the choice-rules at line 97 govern APPROACH variety
  ("3-4 genuinely different approaches, not flavors of the same one") but say NOTHING about varying the
  attached craft.

**So the good diversity logic (16B) exists but is wired to the wrong surface.** The narrative door is
diverse; the mechanical pre-fill is unguided, and defaults to Order-Sense because it's the broadest
always-plausible craft (a perception/read craft fits almost any "assess the situation" framing). Erik's
diagnosis is exactly correct: it defaults to the universally-useful option because nothing structures the
choice.

## §2 — Why Order-Sense specifically wins by default
Order-Sense is a broad perception craft — "read the situation / what does this remember / what's the shape
here" fits nearly every beat. When the GM fills `abilityId` with no rule to diversify, the safest,
always-defensible pick is the craft that's plausible everywhere. So the MOST GENERALLY USEFUL craft crowds
out the SITUATIONALLY POWERFUL or ASPIRATIONAL one every time. This is a ranking failure identical in shape
to the news one (SNG-211): the safe-default outranks the meaningful pick because nothing structures the
choice.

## §3 — Outcome wanted: structure the abilityId suggestion
Extend the choice-authoring rules (gm.js:97 + the schema) so `choices[].abilityId` is DIVERSIFIED, not
defaulted:
1. **Across the 3-4 choices of a turn, vary the craft.** If several choices carry an `abilityId`, they should
   pull from DIFFERENT crafts — not the same one relabeled. The same "don't flavor one approach four ways"
   rule the APPROACHES already follow should apply to the CRAFTS. If Order-Sense fits three framings, that's
   ONE choice using it, not three.
2. **Favor the aspirational / underused, per 16B — on the mechanical surface too.** Bring 16B's instinct to
   the abilityId field: when a beat could fit a craft the player is trying to GROW (a declared aspiration),
   or one they OWN but rarely use, prefer suggesting THAT over the always-safe broad craft. The world quietly
   offering the growth they said they wanted — but in the tappable choice, not only the prose.
3. **Order-Sense is a fallback, not a default.** Reserve the broad perception craft for when it's genuinely
   the fitting tool, not the reflexive fill. A beat where the DISTINCTIVE craft is Deathsense or Palework or
   Wither should suggest THAT; Order-Sense when the beat is actually about reading/order.
4. **Not every choice needs an abilityId.** Many good choices are plain-attribute or freetext ("keep
   walking," "ask plainly"). Don't force a craft onto a choice that doesn't want one — an over-eager
   abilityId is as bad as a monotonous one. (Erik's screenshot shows 3 no-roll choices + the APPLY block —
   the mix is right; the APPLY pre-fill is the problem.)

## §4 — The structure Erik asked for
A simple selection discipline the GM applies when filling abilityId across a turn's choices:
- **Diversity:** no craft appears on more than one choice unless genuinely distinct uses.
- **Aspiration-weight:** a declared-aspiration craft or an underused owned craft is PREFERRED when it fits.
- **Distinctiveness-weight:** the craft that is SPECIFICALLY apt for THIS beat beats the craft that is
  generically apt for ANY beat.
- **Fallback:** Order-Sense (or any broad craft) only when it's the actually-fitting tool.
This is the "better structure" — a small ranking rule that stops the universally-useful craft from winning
by default, exactly parallel to how SNG-211 ranks meaningful news over ambient.

## GUARDS
- **Don't over-rotate into forced variety** — if the fitting craft for a beat genuinely IS Order-Sense,
  suggest it; the rule prefers distinctive/aspirational WHEN THEY FIT, it doesn't ban the broad craft.
- **Respect 16B's restraint** — the toolkit offer is still light, one-per-beat, never overriding a stated
  intent. This structures WHICH craft, not HOW OFTEN to push one.
- **Prompt-side fix** — this is choice-authoring guidance in gm.js, not engine work. No new op.

## OPEN QUESTIONS — CCODE ROUND 2
1. Does the GM context already surface the player's DECLARED ASPIRATIONS + per-craft USE COUNTS? If so the
   diversity/aspiration rule can reference them directly ("prefer a craft with low use count or on the
   aspiration list"). If not, that context block may need adding so the GM can see what's underused.
2. A soft engine nudge as backstop? If the GM still monotonously fills Order-Sense after the prompt fix, the
   engine could detect "same abilityId on 3+ consecutive turns' top choice" and surface a diversity hint —
   but try the prompt structure first (parallel to how we're trying prompt-first on the repair-emit side).
3. Should the APPLY block itself (the UI) show a rotating/aspirational suggestion independent of the GM's
   pick, or is the GM's abilityId the single source? (Keeping it GM-authored is cleaner; flag for Erik's UI
   preference.)
