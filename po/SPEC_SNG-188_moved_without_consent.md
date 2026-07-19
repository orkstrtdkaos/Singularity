# SNG-188 — Moved without consent, on a turn that only TALKED about moving

**Author:** Aevi (PO) · 2026-07-19 · Erik-reported from live play, with a screenshot. **Second occurrence.**
Outcomes; engineering is CCode's.

> Erik: *"The GM is moving me without verification again. I was just talking about PLANS to travel…
> and it moved us."*

---

# §1 — THE SYMPTOM, WHICH THE SCREENSHOT PROVES

Header reads **CAIRNHOLD**. Every line of the prose is still in the alcove at the warden post —
*Memory stands at the hollow's center*, *the ward holds the hollow's mouth*, *from the apex rafter,
Huginn shifts his weight*. The scene never left.

The player's action was **"confide in Veth about soul bond and announce travel plans to Cairnhold."**
A conversation about a future journey. The character was relocated across a region boundary in the
middle of it.

# §2 — THE CHAIN, TRACED

1. **The intent parser cannot distinguish a speech act from an act.** `gm.js:578` tells it to set
   `travelTo` when the player is *"trying to GO/HEAD/JOURNEY/SET OUT."* The label contained
   *"…travel plans to Cairnhold"* and it matched on the surface tokens. **Announcing a plan is not
   departing.**
2. **`departureGateFor` did not fire** — the one guard that would have caught it. See §3, which is
   the interesting part.
3. **`buildTravelDirective` (SNG-122) then removed the GM's judgement.** `app.js:3704` injects:
   *"The player is TRAVELING to X. You **MUST** emit moveTo … do **NOT** end the beat without
   moveTo."* Absolute. The GM understood the scene perfectly — it wrote a quiet alcove
   conversation — **and moved him anyway, because it was ordered to.**

# §3 — THE ROOT DEFECT: the guard needs more to fire than the action needs to act

`intent.js:68–74`, the departure gate:

```js
if (!travelIntent?.destId) return null;                                   // unresolvable dest → fail OPEN
if (!fromRegion || !toRegion || fromRegion === toRegion) return null;     // unknown origin → fail OPEN
```

`app.js:3704`, the forcing directive:

```js
"location": "${ti.destId || ti.ref}"     // ← resolves, or just uses the raw string. Acts regardless.
```

**The gate requires a resolved origin AND a resolved destination before it will protect you. The
forcing directive requires neither before it will move you.** That asymmetry is the whole bug: the
only two conditions under which the guard goes quiet are conditions under which the action still
proceeds.

## Why it went quiet HERE, and it is our own doing

Cairnhold resolves fine (`the_palelands`). **The ORIGIN did not.** Silas was standing at the old
warden post — a place invented across an entire quest in narration and **never written to state**
(the SNG-176 defect, confirmed in `chronicle/20260719_…`). So `locations[currentLocationId]` is
`undefined`, `fromRegion` is null, and line 74 returns null.

**The unrecorded location caused a second, unrelated defect.** SNG-176 is not a tidiness ticket.

# §4 — OUTCOMES

1. **A travel intent is OFFERED, never imposed.** This codebase already ratified exactly this shape
   for lethal encounters — `lethalOfferClamp`, SNG-002b: *always offered, never imposed*. **Five days
   on the road out of a region is at least as consequential as a duel.** Movement gets the same
   contract.
2. **The guard must fail CLOSED, not open.** An unresolvable origin or destination is a reason to
   **ask**, not a reason to skip asking. Both `return null`s at `intent.js:69` and `:74` are
   backwards — they are the two cases where the engine knows least and should therefore ask most.
3. **The forcing directive stops being absolute.** SNG-122 fixed the real problem of the GM refusing
   to move a player who wanted to travel. It fixed it by removing judgement entirely, which trades
   one failure for its mirror. The directive should say *the player intends to travel; move them if
   the fiction actually departs this beat* — leaving the GM the one reading that would have caught
   this.
4. **The parser distinguishes discussing from doing.** A label whose governing verb is a speech verb
   — announce, tell, say, confide, discuss, propose, plan, ask, promise — is **not** a travel intent
   however many place-names it contains. *"Announce travel plans to Cairnhold"* and *"travel to
   Cairnhold"* must not parse the same.
5. **Same-region travel is still travel.** §3's second `return null` means a move within a region is
   never confirmed. Crossing a region is a good reason to ask; it is not the only one.

# §5 — ACCEPTANCE

1. Erik's exact turn — *"confide in Veth … and announce travel plans to Cairnhold"* — leaves him in
   the alcove, with the conversation intact.
2. An actual departure still works in one beat and does not become a nagging prompt.
3. A travel intent with an unresolvable origin or destination **asks**, and says plainly what it
   could not resolve.
4. Declining still commits nothing — SNG-145's *"declining a departure simply… stays"* holds.

# §6 — NOTE ON THE PATTERN

Both halves of this are lenses we already named. §3 is **L3 — a guard whose result is not read is not
a guard**, in its subtler form: *a guard that declines to run is not a guard.* §2.3 is
**caution-as-distortion inverted** — SNG-122 is 19C's mirror image, a rule that over-corrected by
removing the model's judgement instead of weighting it. **We have now seen this failure in both
directions in one day.**
