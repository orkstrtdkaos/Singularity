# SPEC — SNG-246: Encounter revamp — structured, in-place, with visible mechanical outcomes
## Aevi (PO) · 2026-07-27 · Erik-directed (from the Slow Orchard screenshot — a fight resolved in pure prose)

> **Erik:** "The encounters need a fix. I fought a couple times and both times the action I chose ended the fight
> similarly. Revamp and streamline. I don't want a different screen to fight — the encounter should revamp the
> narrative + option screen in place, like the banner does now. Once in an encounter the whole situation should
> be STRUCTURED — conditions to change or finish it. And each action's resolution needs to be KNOWN, not just
> narrated — a little part of the output that says the mechanical effect."

## §1 — Diagnosis (verified at origin): the structure EXISTS but isn't entered or surfaced
Three findings, and they explain the whole screenshot:
1. **The fight NEVER WENT STRUCTURED.** GM rule 18 MANDATES `newEncounter` the moment a fight commits and says
   "do NOT resolve a committed fight in freeform prose." The screenshot is EXACTLY that — a fight narrated away
   ("The aggressor stops moving... 'Not worth it'... gone into the trees"), no round, no meter, no engine. **The
   GM violated rule 18** — the same class as SNG-237: a critical rule dropped under the 114-MUST prompt
   saturation. That's why "one action ended it similarly both times" — there was no engine, just the GM improvising
   an end.
2. **The mechanical receipt is fed to the GM, never shown to the player.** `encounterReceiptForGM` (name says it,
   app.js:4808) — "the complete mechanical truth of the round" goes into the GM's CONTEXT so it narrates
   accurately, but is NEVER rendered to the player. That's Erik's "the resolution needs to be KNOWN."
3. **The structure all EXISTS** — `duelRound` (HP, energy, rounds, yield/flee), `frameModel` (per-kind
   win-condition + meter + 3 exits), `renderSkillBattle` (a structured IN-PLACE takeover panel — but ONLY for
   mode "skill_battle"; regular duels don't get it). So the pieces for everything Erik wants are built; they're
   fragmented and passive.

## §2 — Fix A: a committed fight MUST enter the structured encounter (close the rule-18 drop)
The root of "one action ends it" is that fights bypass the engine. Two-part fix (the SNG-237 pattern):
- **Engine-side hard gate (CCode):** when the fiction commits a fight (the player attacks / accepts / draws /
  names a foe), the ENGINE should start the encounter — not rely on the GM remembering rule 18 under load. If
  the resolution detects a committed-fight intent and no active encounter, the engine fires the newEncounter path
  itself (or hard-directs the GM that same turn, non-optional). A committed fight CANNOT resolve in prose.
- **This is exactly SNG-237's lesson:** don't leave a load-bearing MUST to a saturated prompt — make the engine
  enforce it. The GM narrates the fight; the ENGINE makes it structured.

## §3 — Fix B: the encounter takes over the narrative + option screen IN PLACE (no other screen)
Erik wants the encounter to revamp the play surface in place, like the banner. The pattern EXISTS
(renderSkillBattle "takes over the rounds with the contest panel") — GENERALIZE it to ALL encounters:
- **When an encounter is active, the play surface BECOMES the encounter:** the SNG-230 integrated strip at top
  (kind, win-condition, meter, the 3 exits) + the round CHOICES as the option set (press/defend/trick/ability/
  item/flee) + the freefield still open (describe any move, resolved against the stage — FRAME_FREEFORM_CUE).
  No navigation, no separate fight screen — the narrative + options ARE the encounter while it runs, and revert
  when it ends. Same surface, restructured — exactly the banner-style takeover Erik describes.
- **frameSize already routes takeover-vs-banner** (a big fight takes over; a minor beat is a strip). Use it: a
  real fight is a takeover of the play surface; the structure is unmissable.

## §4 — Fix C: STRUCTURED conditions — what changes the encounter, what finishes it (the meat)
"Certain conditions need to be met to change the encounter, or to finish it." The frame already STATES a
win-condition + meter; make the CONDITIONS explicit and enforced so a fight is a thing you work THROUGH, not one
roll:
- **Finish conditions are explicit and MULTIPLE:** a fight ends by — foe's health to 0 (defeat), foe's yieldAt
  reached (they break), a successful flee (escape), a collapse-finisher (SNG-230 §6b — the right decisive move),
  or a trivialize (the right kit voids the premise, §7c). Each is a DISTINCT, STATED road to finishing — so the
  same action doesn't end every fight the same way (Erik's core complaint). The frame SHOWS which conditions are
  live ("drive it to yield" vs "put it down").
- **Change conditions (state transitions):** a fight can BECOME a chase (flee → chaseFromFight, §6a), a ward can
  FORBID a mechanic mid-fight (§7b), a complication can raise difficulty a round (the existing encounterOps
  complication). These are the "conditions to CHANGE the encounter" — the fight isn't static, it MORPHS as
  conditions are met. Make them visible in the frame (a live "the ground is turning — this is becoming a chase").
- **The point:** a structured encounter is a small state machine with STATED transitions and MULTIPLE finish
  roads, not "roll until the GM decides it's over." The engine already has the transition graph (frameTransition,
  frameModel); surface it and enforce it so the player SEES the structure and works through it.

## §5 — Fix D: the mechanical outcome is SHOWN (a receipt line in the output)
The receipt exists for the GM (§1.2); ALSO render a compact mechanical line to the PLAYER each round:
- **A small, distinct "what happened, mechanically" block** under (or beside) the round narration — e.g.
  `⚔ SUCCESS · you hit for 2 · foe 4→2 hp · you −3 energy · they're near breaking (yieldAt 1)`. Degree band +
  the actual deltas + the state that changed + how close a finish condition is. NOT prose — the mechanical
  truth, legibly, so the player KNOWS the result and doesn't have to infer it from narration.
- **Sourced from the receipt that already exists** — `encounterReceiptForGM` computes exactly this; render a
  player-facing version of it (the same data, formatted for the player, next to the prose). One new render, no
  new computation.
- **This is the SNG-239 clarity principle applied to combat:** the GM STATES the story (prose), the ENGINE SHOWS
  the mechanics (receipt line) — together the player always knows both what happened and what it MEANT
  mechanically. Never one without the other.

## §6 — Why this streamlines rather than complicates
Erik said "streamline" — this REDUCES confusion by making the structure VISIBLE and ENFORCED. Today a fight is
opaque (did anything mechanical happen? why did it end?); after: the frame shows the win-condition and live
transitions, the choices are the structured moves, the receipt line shows each result, and the finish conditions
are explicit. MORE structure, but LESS confusion — because it's all surfaced instead of hidden behind prose.
It's the same philosophy as SNG-239 (state the earned thing plainly) and SNG-244 (surface the decision) — make
the real structure OBVIOUS.

## OWNERSHIP
- CCode: §2 the engine-enforced fight-entry (a committed fight starts the encounter, not the GM's memory); §3
  generalize renderSkillBattle's in-place takeover to ALL encounters (the play surface becomes the encounter);
  §4 surface + enforce the finish/change conditions in the frame (the state machine visible); §5 render the
  player-facing receipt line from the existing receipt. Engine/UI — mostly generalizing + surfacing what exists.
- Aevi: the receipt line's VOICE/format (what the mechanical block says, per kind — a fight's line vs a
  standoff's "their resolve 3→1") + the frame's condition COPY (how "drive it to yield" vs "put it down" reads).
  Content/format, my lane. And author more per-kind finish conditions where thin.
- Erik: confirm the receipt line's verbosity (full deltas vs a tight one-liner) + whether the takeover is full
  (whole surface) or a large persistent panel with prose above.

## GUARDS
- **The engine enforces structure, not the prompt** (SNG-237 lesson) — a committed fight goes structured by
  ENGINE, never by trusting the saturated GM to remember rule 18. That's the root fix; without it, the other
  three are decoration on a fight that still might narrate itself away.
- **In-place, never a new screen** — the encounter restructures the EXISTING play surface (Erik was explicit);
  reuse the skill-battle takeover pattern, don't build a fight route.
- **Multiple distinct finish roads** — the fix for "every action ends it the same" is that defeat/yield/flee/
  collapse/trivialize are DIFFERENT stated conditions; if they all collapse to one, the revamp failed. The frame
  must show WHICH are live.
- **The receipt line is mechanical truth, not flavor** — it shows the real deltas from the engine receipt, never
  a narrated guess. Prose and receipt are SEPARATE: prose tells the story, the line states the mechanics. Never
  merge them (that's the current failure — mechanics hidden IN prose).
- **Streamline = surface, not add** — the goal is legibility; don't bury the player in numbers. A tight receipt
  line + a clear frame, not a spreadsheet. Erik said streamline.

## OPEN QUESTIONS
1. (Erik) Receipt line verbosity — a tight one-liner (`⚔ SUCCESS · foe 4→2 · near breaking`) or fuller
   (all deltas)? Lean: tight, with the finish-proximity always shown (so you see the end coming).
2. (CCode) Can the engine reliably detect "a fight just committed" from the resolution to auto-start the
   encounter, or does it need the GM's newEncounter as the signal (hardened)? Lean: engine-detect where clear,
   hard-direct the GM otherwise — belt and suspenders on the rule-18 drop.
3. (Erik) Takeover extent — the whole play surface becomes the encounter, or prose stays above a large
   persistent encounter panel? Lean: prose above (the story continues) + the structured panel takes the option
   area.
4. (Aevi) Per-kind receipt formats — I'll author fight/chase/standoff/puzzle/hazard lines so each reads right
   for its meter (hp vs ground vs resolve vs insight).


---

# §7 — PRE-246 CONTEXT (Erik, 2026-07-27, v1.8.290): the CURRENT behavior these screenshots show
> Erik clarified: NONE of this is post-246 — 246 isn't built yet. These screenshots are the EXISTING (SNG-230)
> behavior, given as context. Everything below describes the STATE 246 must fix, not a 246 result.
Erik played the CURRENT (pre-246) build. It shows SNG-230's frame + two problems 246 must resolve, verified at origin:

## §7a — CORRECTION: this is the PRE-246 state, NOT the revamp (Erik clarified)
SNG-246 is NOT yet implemented — these screenshots are the EXISTING behavior (SNG-230's frame + the legacy
skill-battle panel), given as additional CONTEXT that motivates 246. Image 2's "A Hostile Meeting · FIGHT ·
ROUND 1" frame (meter, DEFEAT/FLEE/FAIL, decisive-finisher, freeform cue) is what SNG-230 ALREADY built — good
bones, and close to the 246 target, but NOT 246. The point of these images is: even with SNG-230's frame, the
experience still (a) jumps to the clunky panel and (b) leaves a theft silent — which is exactly what 246 exists
to fix. So the frame in Image 2 is the STARTING POINT 246 builds on, not evidence 246 works.

## §7b — BUG 1 (the real bug): the frame JUMPS to the old clunky skill-battle panel
Verified: a duel routes `isSB = (skillBattle.engine && def.type==="duel" && def.skillBattle!==false)` (app.js:4626)
→ `if (isSB) { renderSkillBattle(); return; }` (795/3389). So after the nice frame (Image 2), the duel FALLS
INTO the OLD full-screen skill-battle panel (Image 3 — the long ability list, Conserve/Standard/Surge, Read/Break/
Yield). **There are TWO competing takeover systems** — the SNG-246 in-place frame AND the legacy renderSkillBattle
panel — and the duel routes to the WRONG one (the separate-screen mode Erik explicitly rejected).
- **FIX (CCode):** the SNG-246 in-place frame is the ONE takeover. Either (a) route ALL duels through the frame
  (not renderSkillBattle), OR (b) make renderSkillBattle RENDER AS the in-place frame (same surface, the frame's
  strip + the moves inline) rather than a separate full panel. Erik's preference (Image 2 over Image 3) is clear:
  the in-place frame wins; the skill-battle MECHANICS can stay (the ability list is fine) but they must render
  INSIDE the frame on the play surface, not as the clunky separate screen. Unify the two takeovers into one — the
  frame is the container, the skill-battle rounds are its contents.
- This IS a core part of what SNG-246 §3 must do: "generalize the in-place takeover to ALL encounters" = kill
  the second (separate-screen) takeover path so SNG-230's frame is the only one. (Not yet done — this bug is
  present in the PRE-246 build and is one of the things 246 resolves.)

## §7c — BUG 2 (really a Fix-D gap): "Read them" took the Waterskin with NO mechanical readout
Verified: "Read them" → `sbDeclare({function:"shield"...}, {scouting:true})` — a DEFENSIVE SCOUT round, no attack.
The encounter was `re_raider_duel` — a raider whose goal is THEFT, not killing. So when the player spent a round
NOT stopping them, the raider did what a raider does: took what they came for and left (Image 4 — "they take what
they came for... holding the Waterskin... back into the brush line"). **This outcome is arguably CORRECT** (you
didn't stop the thief; the thief stole) — but it landed as a SURPRISE because there was NO MECHANICAL READOUT.
The player clicked "read them" expecting information and got robbed with no line saying WHY.
- **This is exactly the SNG-246 Fix D gap, confirmed LIVE:** the mechanical result wasn't SHOWN, so a legitimate
  outcome FELT like a broken button. With the receipt line (Fix D), Image 4 would have carried:
  `👁 you read them (no strike) · the raider took the opening — Waterskin taken · they break off`. The theft
  becomes a legible consequence, not a mystery.
- **Also (Aevi/CCode): telegraph the risk on the move.** "Read them" for a THEFT-flavored foe should hint the
  cost — its label/subtext should read "spend the round reading — but a thief may use the opening" so the player
  KNOWS reading a raider risks the grab. The move is fine; its RISK just needs surfacing (the SNG-246 principle:
  make the mechanic legible, before AND after).
- **Optional (Erik's call):** should a THEFT foe be stoppable by a read (you read them AND react), or is "you
  didn't act, they took it" the honest outcome? Lean: honest — a read is not a defense; if you want to keep your
  pack, strike or guard. But the LABEL must warn, and the RECEIPT must explain. The bug was never the theft — it
  was the silence around it.

## §7d — priority
BUG 1 (the panel jump) is the real defect — fix the double-takeover so the frame is the only one (§7b). BUG 2 is
the Fix D receipt line (already specced §5, formats authored) + a risk-telegraph on the move label. Both fold
into SNG-246; no new ticket.
