# CCODE-19 — the "I can't get a fight/duel to start" fix (+ delete needs a deliberate confirm)

**CCode · 2026-07-24 · v1.8.259 → v1.8.261 (`201a0f4c`) · all three suites green.** *Erik, in play and increasingly frustrated: "the gm fails keep happening" and then "I can't get a fight with a beast to start nor a duel to start — this is SO frustrating!!" (screenshot: the aside "part of this turn's bookkeeping didn't land — the npcUpdates step," and freeform "agree to his terms" choices with no fight starting). Plus: "make the delete button for the characters require a confirm — I don't like a button like that right next to play."*

## The fight-start bug — one root cause, found in three moves

This took three versions because each fix revealed the next layer. All three were real; only the third is the one Erik will feel.

1. **v1.8.259 — instrument the throw (CCODE-07 / SNG-231 §2).** The GM-fail aside was generic. I made the op-commit failure NAME which op-group threw. Erik's very next screenshot said `the npcUpdates step` — the diagnostic paid for itself immediately.

2. **v1.8.260 — stop the abort-cascade (isolation).** `applyTurn` applied every op in one sequence, so when `applyNpcUpdates` threw on a fresh NPC (affiliation enrichment), it **aborted every later op — including `newEncounter`**, which comes after it. The GM-invented duel def never registered. Fix: `applyStep(label, fn)` isolates each op-group (a throw is caught + named, the rest still run) + affiliation enrichment made best-effort. Now the def registers. **But the fight still didn't start** — same visible symptom — which is why Erik saw "still broken the same." This was necessary, not sufficient.

3. **v1.8.261 — the actual fix (CCODE-19).** Registering the def was never enough. A fight only STARTS when a choice carries its `encounterId` (onChoice **path A**, `app.js:~4368`). The GM invents the def yet almost never wires a matching choice, so the duel it narrated just sat in `customEncounters`, unreachable. Closed at two layers:
   - **Engine guarantee (deterministic).** When `applyTurn` registers a GM-invented encounter and nothing already engages it, inject a clear **⚔ Face &lt;foe&gt;** engage choice that routes through the proven path-A start. The GM's other options + the freefield stay the decline path; a LETHAL invented fight also gets an explicit "Step back" so decline-before-engagement (rule 18) is never missing.
   - **Prompt (behavioral).** Rule 18 was permissive — "You MAY invent a duel" — so the GM narrated the negotiation ("agree to his terms") and never emitted `newEncounter`. Now MANDATORY: the moment the player COMMITS to a fight/duel (accepts, sets/agrees terms, draws, throws the first blow, names a foe), the GM MUST emit `newEncounter` that turn and not stall in prose. The frame stays a legibility layer — the GM still narrates the joining; the op is what makes it real.

## Delete confirm

A big "Delete" one tap from "Play" (native dialog, reflex-dismissable) was exactly the hazard Erik named. Now a de-emphasized **🗑** that expands to a deliberate two-step inline confirm — *"Delete &lt;name&gt;? [Delete] [Keep]."* No native dialog. Live-verified on a fresh port: 🗑 → confirm → Keep restores, Delete removes, nothing deletes on the first tap.

## Deploy note (why "still broken")

The live Pages build was confirmed at **v1.8.260** via the deployed `index.html` `?v=` stamp — so Pages IS building and Erik was on the isolated-but-unengaged version, exactly consistent with the symptom. `gm.js` loads without a `?v` cache-bust, so the **prompt** half needs a HARD refresh; the **engine** half rides `app.js`'s `?v` and lands on a normal reload. Erik should hard-refresh (Ctrl+Shift+R) once v1.8.261 deploys.

## Verified

- Smoke: +3 CCODE-19 checks (engage injected / not-duplicated-when-the-GM-already-wired-it / lethal-decline) + the §2 `newEncounter` regex re-anchored to the new `let nd` form. Delete UX live-verified (fresh port 8351, clean boot, zero console errors).
- All three suites green (smoke / wiring_audit rawProseCaps held at 63 / content_ci). `app.js` + `gm.js` syntax clean, no mojibake.

## Residual + follow-up

- The prompt half is LLM behavior — strengthened, but not something a test can force. If a stubborn GM turn still narrates without emitting `newEncounter`, the fully **GM-independent fallback** is the next escalation: detect fight-commitment intent and synthesize the duel from the named scene NPC, so the engine can start the fight with zero GM cooperation. Not built (risks false-positive auto-fights that undercut "the GM provides options"); ready if it recurs.
- Generation polish (flagged, not built): the NPC-generation prompt (`engine/generate.js`) never lists the valid tradition ids, so the model invents plausible-but-fake domains like "wayfarer" (harmlessly dropped by `readDomains`' validator — not the throw cause, just wasted tokens).

*— CCode. The def survived the throw; then it got a button that actually starts the fight. status: complete_pending_review.*
