# SNG-190 — The teleport, and three more from the same capture

**Author:** Aevi (PO) · 2026-07-19 · Erik: *"dang… I got teleported. we need to fix this."*
Traced end to end from the See-the-Machine capture. Outcomes; engineering is CCode's.

---

# §1 — THE TELEPORT. CAUSE CONFIRMED, AND IT IS A CONTRADICTION IN OUR OWN RULES

**What the player did:** lifted the latch on his mother's garden gate.
**Where he ended up:** The Crossing, the world hub.

## The chain, every link verified in the capture

1. The GM emitted **`moveTo: {"location": "Silas's Mother's House — Kitchen"}`** — a **sub-place
   name**, not a location id.
2. Silas was standing in **Cairnhold, which IS a waygate** (*"a waygate stands at the north cairn"*).
3. `waygate.js:85` `routeGmMoveTo` fires **whenever the origin is a waygate** — it does not check
   whether the fiction touched the gate.
4. `resolve("Silas's Mother's House — Kitchen")` returns nothing. It is a sub-place; there is no such
   location.
5. `waygate.js:102` — **`return { destId: hub.id, routed: "hub", why: "unresolvable-from-gate" }`**

**He was sent across the world because a garden latch could not be resolved to a location id while he
happened to be standing in a town that contains a gate.**

## The part that makes this ours, not the model's

The prompt's `moveTo` rule tells the GM, in bold:

> *"The engine honors a move to any named place — it **resolves a real one or mints the named
> destination** — so **never omit moveTo for fear the place 'doesn't exist yet.'**"*

The waygate router says the opposite:

> *"the only honest destinations are a real gate or the hub — **never a new place invented** out of
> the words 'waygate'/'center'."*

**Two rules in direct contradiction, and the router silently wins.** The GM did exactly what it was
told and got its player teleported. This is not a model failure.

## Outcomes

1. **`routeGmMoveTo` must require evidence the FICTION used the gate** — not merely that the character
   stands somewhere containing one. Standing in Cairnhold is not stepping through the north cairn.
2. **Unresolvable must FAIL CLOSED.** An unresolvable destination is a reason to **stay and ask**, never
   a reason to move somewhere drastic. Same principle as SNG-188 §4.2 — this is the second time today
   a guard's fail-open sent Erik somewhere he did not choose.
3. **A sub-place reference must resolve to its PARENT.** *"Silas's Mother's House — Kitchen"* is a known
   sub-place of a known sub-place of Cairnhold. A `moveTo` naming it should keep him in **Cairnhold**.
   **This alone would have prevented the whole thing**, and it is the cheapest of the three.
4. **Resolve the contradiction in the prompt.** Whichever rule survives, the GM must not be told to
   name any place freely by one rule and punished for it by another.

---

# §2 — ONE PERSON, TWO RECORDS — and again the prompt REQUIRES both

The same turn emitted **both**:

```json
"npcUpdates": [{ "op": "meet", "npcId": "silas-mother", "name": "Silas's Mother", … }]
"generateRequest": [{ "type": "npc", "hint": "Silas's mother — a woman who keeps a cairn-line house…" }]
```

The generator returned **Hesta Vorn**. So Silas's mother now exists as **`silas-mother`** *and* as
**Hesta Vorn** — two records for one woman, created in one turn, at the most emotionally load-bearing
moment in the campaign so far.

**Both were mandatory.** Rule 14: *"you **MUST** emit an npcUpdates entry… op 'meet' the first time."*
The generateRequest rule: *"⛔ When your narration INTRODUCES a NEW named person… you **MUST** emit the
matching generateRequest the SAME turn."* Two `MUST`s on one person and **nothing reconciles them.**

**Outcome:** a `generateRequest` for an npc in the same turn as an `op:"meet"` for that person is one
person. Either the meet seeds the generation and keeps the id, or the generation fills the meet — but
two ids must not survive the turn. **SNG-185's shared minting helper is the natural home for this.**

---

# §3 — THE FIRING PANEL IS REPORTING FALSE ZEROS ⚠ trust-critical

The panel reads **NEVER FIRED (32)** — `npcUpdates 0`, `moveTo 0`, `placeUpdates 0`,
`generateRequest 0`, `timeOps 0`, `scene 0`.

**All six of those fired in the exchange displayed directly beneath the counter.**

**Cause:** `logOpOutcome` is called for **`markTeacher` only** (`app.js:3110`, `:3113`, `:3130`).
Nothing else is instrumented. **31 of the 32 zeros mean "not measured," and the panel renders them as
"never fired."**

The panel's own caption reads *"A zero is a signature — an op that has never fired may be built and
unreachable."* **Right now a zero is mostly a signature of missing instrumentation**, and this is the
one screen built to tell truth about what fires. Uncorrected, it will produce a confident wrong
diagnosis — the exact failure it exists to prevent.

**Outcome:** distinguish **not-instrumented** from **fired-zero-times**, visibly, and either
instrument the rest or label the uninstrumented ones plainly. Do not let a missing measurement render
as a finding.

---

# §4 — THE ENGINE INJECTS UNRENDERED MARKDOWN INTO NARRATION

On screen: `*✦ The world grows — **Hesta Vorn** is now a real presence in this place.*` — raw
asterisks, mid-prose, in a session that is **being read aloud at a table with children listening**.

**Cause:** `app.js:2938` appends that string, with markdown, to the narration. It is absent from the
RAW response and present in PARSED — **the engine wrote it, not the model.**

**Outcome:** render it or drop the markup. A read-aloud session should never surface asterisks, and
this is engine-authored text so it is entirely within our control.

---

# §5 — STILL PRESENT FROM SNG-189

`[object Object]` remains in the chronicle. Invented day-numbers continue: CURRENT TIME says
**World-day 20**, and this turn wrote *"World-day 23 afternoon"* into `npcUpdates.statusNote` **and**
`placeUpdates.note` — two more durable records carrying a date the engine does not agree with.

# §6 — WHAT WAS RIGHT

The prose is excellent, the `subPlace.parent` was named correctly, `timeOps` was proportionate at
0.25h, and caching held at **125 uncached input tokens against 11,419 cached**. **The model is doing
its job well. Three of these four defects are the engine contradicting itself.**
