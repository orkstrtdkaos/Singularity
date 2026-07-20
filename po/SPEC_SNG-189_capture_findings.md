# SNG-189 — Four defects from one captured exchange

**Author:** Aevi (PO) · 2026-07-19 · From Erik's first "See the Machine" capture (v1.8.157, gm-narrate,
Cairnhold). Outcomes; engineering is CCode's.

**The panel paid for itself on its first capture.** None of these four would have been visible from
play — three are invisible by construction, and the fourth looks like normal prose.

---

# §1 — `[object Object]` IS IN THE PERMANENT CHRONICLE ⚠ data loss

The captured prompt contains, in `## CHRONICLE (this character's story so far)`:

```
[object Object]
```

**A scene of Erik's story is gone and cannot be recovered.**

**Cause:** `app.js:3334` — `character.chronicle.push(turn.sceneSummary)`, with **no type check**. The
model is asked for a string; when it returns an object that still parses, the object is pushed
straight into the permanent record. The salvage fallback at `gm.js:497`
(`sceneSummary: smartClamp(narration, 120)`) only covers a *missing* summary, not a **wrong-typed**
one.

The prompt itself tells the model this field *"becomes the chronicle entry — the **ONLY durable
record** of what this scene was."* It is the highest-stakes string in the system and it is written
unguarded.

**Outcome:** coerce or reject before the push — a non-string `sceneSummary` falls back to the
narration clamp rather than corrupting the record. Then sweep existing saves: any `[object Object]`
or non-string entry gets repaired from the turn's narration where one survives.

---

# §2 — THE CALENDAR HAS DESYNCED, AND THE GM IS PAPERING OVER IT

The prompt says:

```
## CURRENT TIME
Day 12, afternoon (early-spring)
Shared world calendar: World-day 19 (early-spring)
(Reference dates ONLY as given here — the engine owns the calendar; never invent a bare day-number.)
```

**Every other block says World-day 23.** Place history: *"arrived at Cairnhold western crossing lane
on World-day 23."* Pell's and Veth's status notes: *"Arrived at Cairnhold … on World-day 23."* And
this very turn emitted `placeUpdates` containing *"Party arrived at the gate on World-day 23."*

**The GM was told never to invent a day-number, and it is inventing one every turn — into durable
facts.** It is not disobeying; it is resolving a contradiction the engine handed it.

## Why they diverged, and this is the part that needs a ruling

1. **The shared world day is derived from REAL elapsed time** — `worldtime.js:108`,
   `absoluteWorldDay(nowMs, epoch)`. That is SNG-041 working as designed: the far world runs while
   the player is away.
2. **In-fiction travel time cannot reach it.** The party walked four days from Stillwater's Trouble
   to Cairnhold. Nothing about that journey can move a clock computed from `Date.now()`.
3. **And it could not have been declared anyway** — `app.js:3213` clamps `timeOps.hoursPassed` to
   **`Math.min(72, …)`**. **72 hours is three days. A four-day journey is not expressible in one
   turn**, and the ceiling is silent: the model asks for four days, gets three, and is told nothing.

**Erik's ruling wanted (§5 Q1):** does a long in-fiction journey advance the character's own day
count independently of the shared calendar, or does the shared calendar need an in-fiction component?
The two clocks are both correct and they are describing different things, so the GM cannot reconcile
them — but it is currently being asked to, and it does so by writing fiction into fact.

**Regardless of the ruling:** the 72h clamp should either lift or report. A silent ceiling on a
declared duration is how the fiction and the clock got four days apart in the first place.

---

# §3 — `moveTo` MINTED A LOCATION WHERE THE LAST TURN USED A SUB-PLACE

This turn emitted `moveTo: {"location": "cairnhold-center-district"}` — a place that does not exist,
which the engine mints. But the **previous** turn recorded *"Western Crossing Lane"* as a **sub-place
of Cairnhold**, which is in the place history.

**Two spots of the same kind, in the same town, one turn apart, filed at two different levels of the
world tree.** Repeat that across a campaign and Cairnhold quietly becomes four sibling locations
whose shared identity nothing records.

The prompt gives the model an excellent rule for a sub-place's *parent* and **no rule at all for when
a named spot is a sub-place versus a location.** It cannot choose consistently because it was never
told how.

**Outcome:** state the boundary. A district or quarter *within* a named settlement is a sub-place; a
location is somewhere you travel *to*. Whatever the rule, it needs to be one rule.

---

# §4 — THE SCENE CLOSED ON A LIVE QUESTION

`sceneEnded: true`, with the scene's own `threads` reading *"Pell has not met Silas's mother — the
introduction is moments away."*

The rule says: *"Do NOT end a scene mid-action, mid-sentence, or while a question is hanging in the
air."* The model had the thread in hand, wrote it out, and closed anyway.

Minor beside the other three, and worth noting because **the model is holding the contradiction in
the same object** — the evidence and the violation are adjacent fields.

# §4b — a mis-tag worth one line
The choice *"Turn to Pell first — a word before the introduction"* is tagged `intentTags: ["romantic"]`.
It is a word before meeting his mother. These tags accrue play-style tendencies (SNG-113), so an
over-broad romantic tag quietly skews the profile.

---

# §5 — QUESTIONS

1. **Erik:** §2 — do in-fiction journeys advance a character-local day count, or should the shared
   calendar carry an in-fiction component? Both clocks are currently right and they disagree.
2. **CCode:** §1 — is `sceneSummary` the only unguarded write into a permanent record, or are
   `factUpdates.text` and `placeUpdates.note` equally open? Worth one sweep rather than three tickets.
3. **CCode:** §3 — does the engine already have a notion of settlement-versus-district it could tell
   the model about, or is that a new distinction?

# §6 — WHAT WAS RIGHT, and worth saying

**Caching is excellent on this call: 132 uncached input tokens against 11,419 read from cache.** The
four-breakpoint structure is doing exactly what it was built to do.

**And the move itself was correct.** The player chose *"Go directly to your mother's house"* — a real
travel intent — and the GM moved them and paired it with `timeOps`. That is SNG-188's machinery
behaving properly when the intent genuinely is travel. **The 35.4-second response time is the thing
worth watching**, not the move.
