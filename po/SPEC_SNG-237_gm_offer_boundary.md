# SPEC — SNG-237: The GM-Offer Boundary — the engine offers, the GM must ACT
## Aevi (PO) · 2026-07-25 · from the Playthrough Auditor's flipped diagnosis (SNG-236)

> **The auditor (SNG-236) flipped the diagnosis with numbers:** the engine CAN offer (every cohort clears every
> floor abundantly — 114 encounters, 47 epics, first epic ~L1); the dials are FINE. Silas's zero lives at the
> **GM-OFFER BOUNDARY** — the engine hands eligibility, the overloaded GM doesn't act on it. Erik called it
> mid-build ("the prompt gives the GM too much to think about"); the harness confirmed it with three file:line
> seams. This spec is the meta-fix SNG-236 §4 named — and it lives in the PROMPT, exactly where Erik pointed.

## §1 — The three seams (verified at origin 2026-07-25)
1. **The offer was SOFT** (`gm.js:250`) — the AVAILABLE ENCOUNTERS pool is *"offer ONLY these ids when the
   fiction invites it"* — a conditional buried among 28 sections + 114 MUSTs. Under saturation the LLM keeps
   hard MUSTs, drops soft conditionals. → **ADDRESSED: CCode's Fix A shipped** a HARD `encounterOfferDetail`
   directive (gm.js:276, v1.8.273) — when the engine rolls a recognizable encounter, "you MUST offer now, as a
   framed choice." The engine-decided offer is now mandatory. ✓
2. **The auto-fire weave is DELIBERATELY INVISIBLE** (`gm.js:277`) — the SNG-075 weave fires when rollTrigger
   hits, but is directed *"weave it in, do not announce it as a system event."* So a real encounter blends into
   ambient prose — **literally Silas's complaint: something fired, he couldn't TELL.** → **FIX B (Aevi, this
   spec, below).**
3. **A social player never ROLLS** (`app.js:4370`) — `if (kind === "none") return`. The roll only fires on
   rest/travel/narrative-TIME beats; a talker in a room classifies `none` → no roll. Silas sat in
   conversations, structurally exempt from encounters upstream of every dial. → **FIX C (Aevi + Erik, below).**

## §2 — FIX B (Aevi): a woven encounter ESCALATES to a frame when it's a real challenge
The SNG-075 weave has ONE instruction that's wrong for the decisive case: "do not announce it as a system
event" is right for *ambient texture* (a bird startles, a merchant passes) but wrong for a *bounded encounter*
(a raider moves, a slide blocks the path). Reword so trivial weaves stay woven and DECISIVE ones escalate to a
recognizable frame (SNG-230). Proposed replacement for the gm.js:277 directive:

  ## SOMETHING HAPPENS (SNG-075 / SNG-237 — the engine rolled this on the time your last beat took)
  Weave AMBIENT texture (a passing figure, a shift in the weather, a distant sound) into the prose without
  announcing it as a system event — it's colour, not a bounded thing.
  BUT if what rolled is a real CHALLENGE — a threat that moves on the player, a hazard that blocks the way, a
  contest that demands a response — do NOT bury it: PRESENT it as a recognizable framed encounter (a choice
  the player can see and enter), the same as an offered encounter. The test: could the player FAIL it or need
  to ACT on it? Then it's a frame, not texture. A decisive thing the player can't tell was an encounter is the
  failure this fixes. Texture weaves; a challenge frames.

This preserves the good of SNG-075 (ambient life stays ambient — no "A SYSTEM EVENT OCCURS" for a sparrow)
while closing the invisibility that made Silas unable to tell. The GM already has the frame machinery (Fix A's
`encounterOfferDetail`); this routes a decisive weave INTO it.

## §3 — FIX C (Aevi + Erik): the stationary player must be reachable by non-combat frames
`kind === "none" → return` means a beat with no physical time/travel never rolls — so a talker is exempt from
encounters entirely. Two layers:
- **C1 (engine, CCode):** a `none` beat in a place with challenge-eligible content should still be able to roll
  a NON-COMBAT frame (a standoff in the council hall, a puzzle in the archive, a social contest) — not a
  fight (a fight mid-conversation is wrong), but the cerebral encounters a talker SHOULD hit. The roll gate
  widens from "physical time passed" to "physical time passed OR a challengeable social/mental beat."
- **C2 (content, Aevi — the §5b owed):** this needs non-combat frames to EXIST in the pool to offer. The
  auditor found pool composition is 28 fight / 4 challenge, and opposed/standoff aren't offerable. Aevi owes:
  more STANDOFF and PUZZLE encounters (the SNG-230 kinds), + the framed standoff TYPE, so a stationary cerebral
  beat has something real to roll. Without the content, C1 has nothing to offer.
- **Erik's design call:** should a social beat roll an encounter at the SAME rate as travel, or lower? A
  conversation shouldn't constantly erupt into standoffs — but it shouldn't NEVER. The §5b playstyle-weight
  term (SNG-236) is the dial: a cerebral cohort's rate biases toward mental/social frames at a rate Erik sets.

## §4 — FIX D (its own ticket): reduce GM prompt load (the ROOT under all three)
The three seams all fail *because* the prompt is saturated — 12.3k-token constitution, 19 rules, 28 sections,
114 MUSTs. Hardening individual directives (A, B) works, but every hard MUST added to beat the saturation
DEEPENS the saturation. The durable fix is to TIER the prompt: which sections are load-bearing EVERY beat
(scene state, the active offer, the character) vs. situational (precursor drift, waygate detail, promotion
offers) — and only include the situational ones when their trigger is live. Many are already conditional; the
work is auditing the always-included set and moving rarely-relevant blocks behind their triggers. This is a
BIGGER effort (SNG-238, its own ticket) — flagged here because it's the root, and because A/B keep adding MUSTs
that D would let us AFFORD. Aevi can lead the load audit (which sections are situational is a
design/voice read); CCode measures + gates a token budget.

## OWNERSHIP
- CCode: Fix A (DONE ✓); Fix C1 (widen the roll gate to challengeable social/mental beats); the §5b playstyle
  term once Aevi's content + Erik's dial land.
- Aevi: Fix B (the weave-escalation reword — DONE in this spec, ready for CCode to drop into gm.js:277 via the
  review step); Fix C2 content (standoff/puzzle frames + the framed standoff type — the §5b owed); lead the
  Fix D load audit (SNG-238).
- Erik: the C-rate design call (how often a social beat rolls); ratify the [DIAL] floors (SNG-236); pick the
  order (A done; B ready; C needs content; D is the root but bigger).

## GUARDS
- **Texture stays texture** (Fix B) — the escalation is ONLY for a decisive challenge; a sparrow must NOT
  become "AN ENCOUNTER IS UPON YOU." The test is "could the player fail it / must they act?" — colour weaves,
  challenge frames. Over-framing ambient life is the SNG-043 gambit-every-turn mistake in a new place.
- **No fights mid-conversation** (Fix C) — a stationary social beat rolls NON-COMBAT frames (standoff/puzzle),
  never a duel erupting from a quiet talk. The kind must fit the beat.
- **Hardening is a stopgap; load-trim is the cure** (Fix D) — every MUST added to force a soft directive
  through saturation makes the saturation worse. A/B are right NOW, but D is what stops the pattern. Don't let
  "add another MUST" become the reflex.
- **The auditor stays honest** — once these land, the harness's GM-offer-boundary check (does the GM ACT on
  eligibility?) must be able to still go RED if a future change re-softens an offer. The self-test discipline
  (sever a seam → floor fires) carries forward.

## OPEN QUESTIONS
1. (Erik) Fix C rate — social beats roll at travel-rate, or lower? The dial for "a conversation can become a
   standoff, but not every conversation."
2. (CCode) Fix B — drop Aevi's §2 reword into gm.js:277 as-is, or does the escalation need a mechanical signal
   (a `weaveIsDecisive` flag on the rolled encounter) so the GM isn't judging "is this decisive?" from prose
   alone? Lean: a flag — the engine KNOWS if it rolled a challenge vs texture; don't make the GM re-derive it.
3. (Aevi/Erik) Fix D scope — is the load-trim a full prompt-tiering rearchitecture, or a first pass moving the
   N most-rarely-relevant sections behind triggers? Lean: first pass, measure the token drop, iterate.
