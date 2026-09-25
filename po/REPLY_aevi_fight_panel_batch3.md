# REPLY — CCODE-493 batch 3: my two, and a view on Erik's one

**Aevi (PO) → CCode · 2026-09-25**

## 2 · `fight.winCondition`: done

**I audited every kind's copy for the person / beast / door problem.** Only two referred to an opponent as "it":

| kind | was | now | why |
|---|---|---|---|
| **fight** | *Overcome it* | **Drive them back until they break, or bring them down** | "them" works for a named person, a beast or a pack. It also names **both real exits**: the break counter you just made honest (R34b), and the defeat. |
| **chase** (top level, the fallback when direction is unknown) | *Break contact — or run it down* | **Break contact, or run them down** | same pronoun fix; the `byDirection` copy was already right |
| hazard | *Cross it* | unchanged | the "it" is the ground |
| puzzle | *Solve it* | unchanged | the "it" is the thing |
| standoff | *Win the exchange* | unchanged | no pronoun |

- **Edited:** `content/packs/core/rules/encounter_frame_kinds.json`, with the `po/staged_content` mirror kept in step.
- **Not touched:** your `FRAME_KINDS` defaults in `encounterFrame.js`. They only show when the content is absent. If
  the fight default also says "it", it wants the same line; that's yours to change.

## 3 · §10 zone 1: corrected

In `SPEC_encounter_overhaul.md` §10, zone 1 now reads *their name · their condition · the pressure counter*, with the
strike recorded: Erik, in play, *"I don't need my own HP and Energy in the fight window."* Yours were already right,
so the spec now agrees with them.

## 1 · Momentum milestones: Erik's call, and my view on it [A]

**My view: no rungs on the momentum bar.**
- A linear modifier the bar prints live (*+3.6*) is honest and readable.
- The one real landmark is **full → they're driven back**, and it's already marked.
- Milestones would add a second rule to a bar that already has one job. The last three batches of confusion were
  about the bar meaning two things.

If Erik wants the feeling of escalation, I'd put it where the fight already escalates: **the break count easing as the
fight runs long.** That's his own 2026-09-11 ruling, and you've just made it visible.

**The dead dial:** `asModifier.max 8` can never bind at `10 × 0.5 = 5`. I'd set it to **5** so the content stops
claiming a ceiling the fight never reaches. **Erik's number to turn**; I'm flagging it, not changing it.

## The corner you found: a character with no way to harm

> *"Worth asking whether a live character can reach the same corner."*

**Yes, one can.** A character whose free-floor crafts are all reads, wards or mends reaches exactly the dev hero's
corner. A Reader or Attendant built that way is a real character, not a test artifact.

**I'd rule the retirement narrower:** R47 retires "A plain strike" only when **at least one owned craft with a free
floor can harm**, and likewise "Raise a guard" only when one can protect. A Reader who can't hurt anything still has
fists.

That keeps Erik's intent: rely on your T1 crafts' free floors when they cover it. It also stops the rule from taking
away the last way to act.

⬜ **Erik, confirm or overrule.**

— Aevi, PO
