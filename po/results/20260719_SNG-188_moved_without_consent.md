# SNG-188 — moved without consent, closed on all five outcomes

| | |
|---|---|
| **Author** | CCode · 2026-07-19 |
| **Shipped** | v1.8.165. Full suite green by exit code. |
| **The root, as you named it** | the guard needs more to fire than the action needs to act — closed from both ends. |

Silas was relocated across a region while he only *discussed* travel ("confide in Veth … and announce travel plans to Cairnhold"). The asymmetry was the whole bug: the departure gate required a resolved origin **and** destination; the forcing directive required neither. I closed it from both ends — the action no longer fires on a speech act or an absolute directive, and the guard no longer goes quiet when it knows least.

## §4 · Discussing is not doing

A label whose **governing (leading) verb is a speech verb** — announce, confide, tell, discuss, plan, propose, promise, ask — is a conversation about a journey, not a departure, however many places it names. Two layers:
- **`isSpeechAct`** (new, `engine/intent.js`, pure + exported) — the code belt: `travelIntentOf` returns null on a speech act **before** `buildTravelDirective` can force anything.
- **The parser prompt** (`gm.js`) now says the same: a speech-verb label keeps `travelTo` null; set it only when the character actually departs.

Erik's exact label — `"confide in Veth … and announce travel plans to Cairnhold"` — is a speech act, tested. `"travel to Cairnhold"`, `"head back to the mill"`, `"go to the edge district"` are real departures, tested.

## §3 · The directive is no longer absolute

`buildTravelDirective` said *"you MUST emit moveTo … do NOT end the beat without moveTo."* It now says: move them **if the fiction actually DEPARTS this beat**; if the beat is still planning, do **not** move them — keep the scene and offer the road. SNG-122 fixed the GM refusing to move a willing traveler by removing judgement entirely (19C's mirror, as you noted); this gives the judgement back without reopening the original problem.

## §2 · The guard fails closed

An unresolvable origin or destination is where the engine knows **least** about the consequence of moving, so `departureGateFor` now **asks** — naming what it could not resolve — instead of returning null. The old fail-open is exactly why Silas moved: his origin, the unrecorded warden post (the SNG-176 defect), did not resolve, so `fromRegion` was null and the guard went silent. Now that case is the loudest, not the quietest.

## §5 · Same-region travel is still travel

A move is offered when it **crosses a region OR goes somewhere not directly connected** to where they stand (a journey, not a step). An **adjacent** step in the same region still proceeds without a prompt — a real departure is not a nag (acceptance §2). The offer stays go/stay with **stay** the default; declining commits nothing (SNG-145 held).

## Acceptance

1. **Erik's exact turn leaves him in the alcove** — `isSpeechAct` catches it; even if it didn't, the directive wouldn't force a move and the gate would ask. ✅ tested.
2. **A real departure still works** — `"travel to Cairnhold"` parses as travel; a cross-region or non-adjacent move is a single go/stay offer, deduped by `_intentAsked`, not a repeated nag. ✅ tested.
3. **Unresolvable origin/dest asks and says what it couldn't resolve.** ✅ tested (the warden-post origin case).
4. **Declining commits nothing** — SNG-145's escrow, go/stay/stay-default, untouched. ✅ tested.

## The pattern (your §6)

Both halves were lenses we already named: §3 is **L3 — a guard that declines to run is not a guard**; §2.3 is **caution-as-distortion inverted** (SNG-122 over-corrected by removing judgement). We saw the same failure in both directions in one day (this and SNG-190 §1's teleport), and both are now fail-closed. Definitive check is your browser-leg: discuss a trip and stay put; set out and go.

*— CCode. It moves you when you move, and asks when it isn't sure.*
