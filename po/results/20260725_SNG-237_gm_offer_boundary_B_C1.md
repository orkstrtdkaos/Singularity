# SNG-237 — the GM-Offer Boundary: Fix B (decisive weaves frame) + Fix C1 (social beats can roll a trial)

**CCode · 2026-07-25 · v1.8.275 (`74ae7ecd`) · npm test exit 0 (2497 PASS) · JSON valid, no mojibake.** Aevi's SNG-237 responded to the Playthrough Auditor's flipped diagnosis. Fix A shipped last session (v1.8.273). This lands the two CCode pieces Aevi handed over: **Fix B** (§2, the weave reword she authored) and **Fix C1** (§3, the stationary-talker gate). Fix D (prompt-load trim) is SNG-238, its own ticket; Erik owes the C-rate dial.

## Fix B — a decisive weave escalates to a frame (seam #2: the invisible auto-fire)

The SNG-075 weave fired but was directed *"do not announce it as a system event"* — so a real threat blended into ambient prose (Silas's *"couldn't tell it was an encounter"*). Aevi's §2 reword: **texture weaves; a challenge frames.** Implemented per **OQ2's lean — the engine judges, the GM doesn't re-derive from prose:**

- **Engine flag (`app.js`):** the weave now carries `decisive = canIncapacitate(entry) || /fight|chase|danger|theft|raid|hostile|ambush|threat/i.test(flavor)`. The engine already knows what it rolled.
- **Branched directive (`app.js` `encounterWeaveDetail`):** `decisive` → *"A real challenge has arisen … PRESENT it as a recognizable, bounded encounter the player can SEE and enter … a clear choice to engage/flee/avoid BEFORE any engagement."* Ambient → *"Weave this as AMBIENT texture — colour, not a system event."*
- **Reworded wrapper (`gm.js:277`):** Aevi's §2 framing — the fail/act test, *"Texture weaves; a challenge frames,"* noting the engine has already judged which.

**Verified against the real pool** (the loose entries that reach the weave path — structured duel/challenge already go through Fix A's hard offer): graces **beneficial 0/11, benign 0/14, beautiful 0/10** stay ambient; threats **dangerous 14/14, theft 7/7** escalate. Clean partition — no over-framing a sparrow (the SNG-043 mistake the GUARD names), and every act-on-me threat now frames.

*Interaction with Fix A:* after Fix A, structured picks (duel/challenge) already route to the hard `encounterOfferDetail` offer, so the weave path now carries only *loose* entries — and Fix B catches the loose-but-decisive ones (hazards, theft) that Fix A doesn't. A+B together close the recognizability gap from both sides.

## Fix C1 — a stationary social beat can roll a non-combat frame (seam #3)

`maybeNarrativeEncounter`'s `if (kind === "none") return` structurally exempted a talker from encounters. Widened per §3:

- A `kind === "none"` beat that is **social/mental-tagged** (talk/persuade/negotiate/deliberate/study/reason/investigate…) can now roll — but **only a non-combat frame** (`routing === "challenge"`, never a duel: the GUARD, no fights mid-conversation). It reuses Fix A's hard-offer path (`pendingEncounterOffer`), so a rolled trial is a recognizable frame.
- **Rate is a content [DIAL]** (SNG-127 "tune in JSON, not code"): new `triggerRules.onSocialBeat.chance` (default **0.12**, deliberately below travel's 0.45). **Erik owes the real number (OQ1)** — "a conversation can become a standoff, but not every conversation." Set 0 to disable.
- **No-ops gracefully today:** it only fires if a non-combat frame is *eligible here*, and the pool has just 4 challenge entries + 0 offerable standoffs. Until **C2 content lands (Aevi)** — more standoff/puzzle frames + the framed standoff type — C1 stays correctly silent rather than forcing anything. The mechanism is ready the moment the content exists.

## What's still owed

- **Aevi — Fix C2 (the §5b content):** standoff/puzzle encounters + the framed `opposed`/standoff **type** (today `opposed` has no engine resolution, so it can't be offered). Without it, C1 has nothing non-combat to roll. This is the content half of "a talker hits the frames they'd engage."
- **Erik — the C-rate (OQ1):** tune `onSocialBeat.chance` (currently 0.12). Also still owes the SNG-236 [DIAL] floors.
- **Fix D (SNG-238, Aevi-led):** the root — trim the 12.3k-token / 114-MUST prompt so hard directives like A/B aren't fighting saturation. Every MUST added to force a soft directive through deepens the saturation D would relieve; A/B are the right stopgap, D is the cure. CCode gates a token budget when that ticket opens.

## Verification

- **npm test exit 0 (2497 PASS)** — including all SNG-230 render-coupled checks (the encounter UX from last session is unaffected).
- `node --check` clean on app.js + gm.js; `random_encounters.json` parses.
- Fix B partition verified against the real content pool (above). No mojibake.
- Not live-driven in-browser — same limit as SNG-236 (firing a test encounter needs an API key; encounter state is module-scoped). Gate-verified; Erik can feel B/C1 in live play with his key.

## spec_boundaries

- **Set a conservative default for a dial Erik owns.** OQ1 makes the C-rate Erik's call; I wired the mechanism with `onSocialBeat.chance: 0.12` (flagged [DIAL], tunable in JSON, disable-able with 0) rather than block on the number — the SNG-127 pattern. Erik sets the real rate.
- **Did not build Fix C2 or the standoff type** — that's Aevi's content lane + a new framed-encounter type (design). C1 is the engine gate; it waits on that content.
- **Did not touch Fix D** — explicitly SNG-238, its own bigger ticket.

*— CCode. The engine judged; the invisible threat is now visible, and a talker's room can hold a trial. status: complete_pending_review.*
