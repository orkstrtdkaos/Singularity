# SPEC — SNG-233: Important NPCs are dull — dynamically-registered NPCs skip their interiority
## Aevi (PO) · 2026-07-22 · verified at origin · Erik-directed

> **Erik:** "Pell and Veth seem very dull — neither has opinions, both passive about what we do yet agreeable.
> I want the important NPCs to have real driven personalities. Pell jealous and horny sometimes; Veth mad when
> I do things that don't follow what she thinks is right. We need more ups and downs with people."

## §1 — Verified root: the schema HAS interiority; registered-in-play NPCs never got it
The NPC schema supports `personality, wants, fears, disposition, poleIntensity, reactsToReputation,
voiceHints` — everything needed for a driven NPC. But Pell and Veth, as they live in Silas's save, have ONLY
`bondType, bondStage, relationship:10, history, knownFacts` — **no personality, no wants, no fears, no
disposition.** They were REGISTERED IN PLAY (dynamic NPCs, not authored content files), and the registration
path captures the RELATIONSHIP scaffolding but NOT the interiority. So the GM has nothing to render an OPINION
from — it renders "your partner, relationship 10" as warm agreeable furniture. **They're dull because they're
empty where personality lives**, and the emptiness is a SEAM (SNG-232 family): the NPC-registration producer
omits fields the GM-rendering consumer needs to make a person feel driven.

## §2 — The fix (content + a GM lever + the registration gap)
### §2a — CONTENT: author interiority for the key NPCs (Aevi, DONE)
`po/staged_content/npc_interiority.json` — driven interiority for Pell + Veth, GROUNDED in their established
fiction (not invented):
- **Pell** (blacksmith, "reacts to competence over charm," reads iron, "her hand unclenched when he answered"):
  her DESIRE and JEALOUSY run through competence and possession — she wants Silas present and hers, measures
  love in presence not words, gets jealous (confronting, not sulking) when his attention goes where she can't
  follow, and wants him physically without performance. Erik's "jealous and horny" — grounded in who she is.
- **Veth** (former warden of 11 years, teaches through hard questions, "a witnessed ending vs. one given room —
  getting it wrong is a failure of CRAFT"): her ANGER is craft-JUDGMENT — cold and precise when Silas violates
  the Ashwarden discipline she's teaching, because to her a careless ending is corruption, not a mistake. Erik's
  "mad when I don't follow what she thinks is right" — grounded in her whole framework.
- Each has: wants (that pull AGAINST Silas), fears, `pushesBackWhen`, `emotionalRange` (the ups AND downs),
  `acknowledgeTone`.

### §2b — GM LEVER: render FROM the interiority, don't smooth to agreement (CCode)
The `drivenNpcDirective` (in the content file): when a key NPC has an interiority block, the GM renders them
from their wants/fears/pushesBackWhen — voices their own wants (which can oppose the player), pushes back in
character when the player hits `pushesBackWhen` (Pell's jealousy, Veth's craft-anger), gives earned approval in
`acknowledgeTone` and makes it MEAN something by not giving it freely. **The relationship must have UPS AND
DOWNS** — regard you can LOSE and REGAIN. CCode folds the interiority into the GM's NPC block + adds the
directive to the prompt.

### §2c — THE REGISTRATION GAP (CCode, the general fix): new NPCs should get interiority
The root is that the dynamic-NPC registration path (registerEstablishedNpc / the in-play NPC capture) writes
relationship scaffolding but no interiority. Two options:
- When a key NPC crosses a bond threshold (partner, sworn, mentor — a RELATIONSHIP that matters), PROMPT the GM
  to author a `wants`/`fears`/`disposition` for them (a one-time "who is this person, really" beat), so an
  intimate NPC accrues interiority as the bond deepens.
- OR the GM authors light interiority at registration for any NPC it's clearly establishing as important.
Either way: **an NPC the player is close to should never be a blank personality.** The interiority overlay
(§2a) handles the EXISTING important NPCs; §2c stops the gap recurring for future ones.

## §3 — Why this matters (Erik's real want: people who feel alive)
"More ups and downs with people" is the request. An important NPC who always agrees is furniture; one whose
regard you can lose and win back is a RELATIONSHIP. This is the difference between an RPG where NPCs are
service-providers and one where they're people with their own wants that sometimes cost you something. Pell
wanting him present (and being hurt when he isn't), Veth's approval being rare and earned — that friction is
what makes the warmth mean something. Ties the relationship/bond system (the numbers exist; this gives them
INTERIORITY to move for).

## OWNERSHIP
- Aevi: §2a interiority content — DONE for Pell + Veth (staged). Will author more key NPCs (Mara Wells,
  companions, family) as they matter. The per-NPC drives are content, my lane.
- CCode: §2b (fold interiority into the GM NPC block + the drivenNpcDirective in the prompt), §2c (the
  registration path gives important NPCs interiority so the gap doesn't recur). Engine + prompt.

## GUARDS
- **Grounded, not generic** — an NPC's drives come from THEIR established fiction (Pell's iron, Veth's craft),
  never a generic "jealous love interest" / "stern mentor" template. Aevi authors from the record.
- **Ups AND downs, but never cruel beyond the drive** — an NPC pushes back from their WANTS, not into abuse;
  the friction serves the relationship, it doesn't poison it. Never override the content-rating floor
  (Pell's desire is rating-gated to the surface, same as everything else).
- **Approval must be losable to mean anything** — if a driven NPC's regard can't be LOST, the "ups and downs"
  are theater. The pushesBackWhen has to actually cost the player standing/warmth, recoverable through play.
- **Don't overwrite the relationship NUMBERS** — this adds INTERIORITY (wants/fears/reactions); the bond/
  relationship values stay the engine's. The drives give the numbers something to move FOR.

## OPEN QUESTIONS — CCODE ROUND 2
1. §2b — does the interiority overlay merge into the NPC record at load (so it's part of the NPC everywhere),
   or fold into the GM context block only (lighter, prompt-time)? Lean: merge at load so wants/fears are part
   of the NPC for any system that reads it.
2. §2c — GM-authors-interiority-at-bond-threshold vs. at-registration? Threshold is cheaper (only NPCs who
   MATTER get the treatment) and more meaningful (interiority deepens with the bond). Erik's/CCode's call.
3. Should an NPC's `pushesBackWhen` firing actually MOVE the relationship number (a jealous beat costs a point
   until resolved), or stay narrative? Lean: it moves the number — that's what makes it a real up/down, not
   just flavor. Erik's call on how much.
