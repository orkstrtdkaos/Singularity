# SNG-236 fixes — the GM-offer fix (A) + the calm-place trial (C) + the encounter-frame UX redesign

**CCode · 2026-07-25 · v1.8.273 (fix A+C, `b73cbcdd`) + v1.8.274 (UX) · npm test exit 0 (2497 PASS) · boots clean on a fresh port.** *Erik: "yes [build A + C] … and please update the encounter frames — they're clunky to enter and don't flow. More integrated into the standard screen, but obviously in an encounter. The options could go in the gear, grouped — ward, sense, strike — plus the open one you type as normal. The encounter rules are enforced."*

This is the fix the Playthrough Auditor pointed to: the auditor proved the engine CAN offer (cadence math fine) and localized Silas's zero to the GM-offer boundary. Erik confirmed the cause (the prompt gives the GM too much to hold) and directed the fix.

## Fix A — harden the encounter offer (the Silas fix) · engine · shipped v1.8.273

The recognizable-encounter offer no longer waits on the GM's soft judgment. When the narrative-time roll (`maybeNarrativeEncounter`) lands on a **structured** encounter (routing `duel`/`challenge` → a real fireable def via the SNG-231 path), the engine now sets `pendingEncounterOffer` → **`encounterOfferDetail`**, a HARD GM directive ("present it THIS beat as a framed `encounterId` choice — do not narrate past it") — the same engine-gated-directive pattern as `travelDirective`'s MUST-emit moveTo. Wired end to end: global → `maybeNarrativeEncounter` branch → consumed in `runGM` → `gmEnv` ephemera → `gm_registry.js` row → `gm.js` `scene.push` (a hard `## AN ENCOUNTER IS UPON YOU` section, placed above the soft SNG-075 weave) → `roomForAnOffer` `worldActing` gate (so the generic offer doesn't stack).

**Loose flavor still WEAVES** (ambient texture stays unframed — the SNG-075 path, untouched; that reword is B, Aevi's). Only structured picks escalate, and the roll's own spacing/suppression gate frequency, so a danger-courting player gets framed encounters and a quiet scene stays quiet — no flooding.

## Fix C — a trial in a calm place (the offerable slice of §5b) · engine · shipped v1.8.273

**Finding that reshaped C:** the "stationary talker never rolls" hypothesis is mostly false — `minHoursPerBeat: 1` means an undeclared beat classifies as `"time"` and DOES roll (~14%/beat). `kind==="none"` only fires on a GM-declared instantaneous beat, where suppressing an encounter is correct. So the real complementary gap is **pool composition**: `eligibleEncountersFor` returns only duel/challenge (opposed/standoff aren't offerable), and there are 28 fight vs 4 challenge entries — a talker's fired encounters are mostly fights they'd decline.

The safe, offerable-today fix: in a **low-danger** place, if the pick was a duel but a structured **challenge** is eligible, prefer the trial — a cerebral beat meets a non-combat frame. Modest today (4 challenge entries, 0 offerable standoffs).

**Still owed (Aevi + Erik):** the fuller §5b — a playstyle-weighted pick term, MORE authored non-combat frames, and making `opposed`/standoff a **framed encounter type** (today it has no engine resolution, so it can't be offered). That's the real "a talker hits puzzle/standoff frames" fix; this fix is its available slice.

## The encounter-frame UX redesign · app + css · v1.8.274

Erik's four asks, all delivered:

1. **Integrated, not a takeover.** The frame no longer renders as a surface-taking card mid-screen. It's now a **persistent strip at the top of the play surface** — `⚔ kind · name · round · win condition · meter · the three exits · collapse/ward · cue`. Same `frameModel` content SNG-230 established, relocated + slimmed so it reads as "you are in an encounter" without interrupting the transcript flow. `frameSize` still routes prominence (a weighty encounter gets the bolder strip via `enc-frame-takeover` as a prominence modifier).
2. **Obviously an encounter.** The strip is always visible during an encounter, danger-accented, carrying the kind/win/exits — you can't miss that you're in one.
3. **Moves grouped in the ⚙ gear.** A new `⚙ Moves` button on the input row (only during an encounter) opens `encounterMovesPanel()`: the player's owned abilities **grouped by function family** — ward=PROTECT, sense=KNOW, strike=HARM… the 8-family/24-verb vocabulary, rendered with `FAMILY_GLYPH`/`FAMILY_COLOR` — plus a "this fight/trial" primary group and a "ways out" group (flee/yield/abandon/walk-away).
4. **Plus the open type field; rules enforced.** The free-type input stays the open path (placeholder shifts to "Describe your move — the encounter's rules bind it…"). An ability-move chip fires through `onFreeform` (so `parseIntent` derives the roll params correctly); exits/primary fire through the existing `[data-encact]` path. **The encounter rules were already enforced on freeform** (an active encounter routes every resolve through `duelRound`/`challengeStage`/`puzzleAttempt`) — this redesign makes the moves grouped and the state obvious, it didn't need to add the enforcement.

**Design note:** this revises SNG-230 Phase 1b's "weighty → takeover card" decision (Erik's call — he found it clunky). All the SNG-230 legibility tokens are preserved (`frameModel`/`frameSize`/`enc-frame`/`-cue`/`-collapse`/`takeover`), relocated into the strip, so the render-coupled smoke checks stay green without edits — the frame is still a legibility layer over the GM+freefield, exactly as SNG-230 intended, just integrated instead of interrupting.

## Verification

- **npm test exit 0 (2497 PASS)** — including all four render-coupled SNG-230 checks (frameModel/frameSize wired, takeover-vs-banner routed, freeform cue, collapse note).
- `node --check app.js` clean; **boots clean on a fresh port (v1.8.274, no console errors)** — the char-devtest hero (level-5 harmonic, Sonic Resonance + Prism Sight) loads.
- No mojibake (`git grep` clean on every edited file).
- Also fixed en route: the CCODE-26 smoke check was false-failing on any `autocrlf` Windows checkout (its `indexOf` anchor was LF-only while the working-tree app.js is CRLF; committed app.js is LF, deployed game unaffected) — the check now normalizes CRLF.
- **Not fully driven in-browser:** the JS-drive path to fire a test encounter and screenshot the strip+gear was blocked mid-verify (the browser safety classifier went temporarily unavailable, and firing a test encounter in-preview needs an API key). The change is gate-verified + boots clean; **Erik should eyeball the strip + ⚙ Moves gear in a live encounter** — I'll iterate on the visuals on his word.

## For Aevi

- **Fix B (yours):** reword the SNG-075 weave directive so a *decisive* woven encounter can escalate to a recognizable frame (the "do not announce it as a system event" line is what made Silas's weaves invisible). A + your B together close the recognizability gap.
- **§5b (yours + Erik):** author more non-combat structured encounters (challenge/standoff) and spec a **framed `opposed`/standoff type** so a cerebral player's recognizable encounters are the puzzle/standoff frames they engage — fix C is only the slice that's offerable today.
- **GM-prompt load (your lane):** the deeper cause the auditor found — a ~12.3k-token constitution + 114 MUST directives + 28 sections. Worth a pass to tier/prune so the soft offers aren't drowned.

## spec_boundaries

- Fix C was **reshaped by investigation** (the stationary-talker hypothesis was mostly wrong; `minHoursPerBeat:1` already handles it). Built the honest, offerable-today slice + flagged the real fix as content/design (Aevi/Erik). Did not build a speculative playstyle-weight mechanism or a new standoff frame type — those are DIALs/design Erik owns.
- The UX redesign **revises a shipped feature** (SNG-230 Phase 1b takeover). Preserved every legibility token + the frame-as-legibility-layer principle; only the placement/interaction changed, per Erik's direct direction. Flagging because it's a design revision, not just a build.

*— CCode. The engine now insists on the encounter; the screen now shows you're in one, moves grouped in the gear. status: complete_pending_review.*
