<!-- status: SNG-552 spec_ready GO (Erik 2026-09-12: "this is likely a good example of multiple pc's acting on a single arc… bound the arcs and quests to concrete known details and steps to accomplish, while also allowing for narrative and generative growth") -->
# SPEC SNG-552 — Two players are standing on one arc, and nothing they do reaches it

**Aevi (PO) · 2026-09-12 · every figure measured at HEAD**

---

## §1 — ⛔ THE SITUATION, WHICH IS LIVE RIGHT NOW

```
Silas Weir    what-the-water-remembers   RESOLVED   "The Instruction Rewritten"
Cellaceron    what-the-water-remembers   ACTIVE     decision at hand
```

**Two player characters, one world-tier quest, one greater arc.** ⚠️ Silas rewrote the instruction and the
river heals. **Cellaceron's world does not know that**, and is being offered the same four choices as though
the facility had never been touched.

## §2 — ⛑ WHAT THE FOUR OPTIONS ACTUALLY DO

✅ **All four are fully authored** — premise, outcome prose, and real `effects`. ✅ **All six effect types
have live readers** (`location_state`, `world_fact`, `codex_fact`, `world_arc`, `standing`, `npc_state`).
**This is not an improvisation problem. The authoring is good.**

| outcome | the world | standing |
|---|---|---|
| **Sealed** | facility inert, presence forced dormant. *"It is not gone; it is delayed."* | Ashwarden **+1** |
| **Let It Die** | instruction completes, presence extinguished, a stretch of river sterile | Ashwarden **+2** |
| **Rewritten** | *"prepare the watershed"* → *cleanse it*; river heals, presence sleeps on | Wright **+3**, Rootkin **+2** |
| **Awakened** | the presence wakes whole, cleanses the river as its first living act, and **walks** | Numinous **+1** |

⬜ **AND A DESIGN QUESTION UNDER THE NUMBERS, FOR ERIK:** Rewritten pays **5** and Awakened pays **1**. The
safest road is the best rewarded and the largest, least reversible answer the worst. ⚠️ Under the cosmology
made canon today, **Awakened is the only one of the four that is not a foreclosure** — sealing, ending and
rewriting-to-keep-asleep are all closings. **Deliberate, or drift?**

## §3 — ⛔ GAP ONE: NO OUTCOME MOVES THE ARC. NOT ONE. NOT ANYWHERE.

`quests.js` applies an arc push only `if (e.arcId && (Number.isFinite(e.to) || Number.isFinite(e.push)))`.

**Every authored effect uses the key `arc`, and carries only a `note`.** Two independent failures stacked:
the key is wrong, and there is no magnitude even if it matched.

⛑ **MEASURED ACROSS EVERY QUEST IN THE CORPUS: 11 `world_arc` effects authored, 0 that the reader will
apply.**

⛔ **SO `"the arc is ANSWERED by waking — this accelerates every other stirring and remakes the Valley's
future"` DOES NOTHING TO `arc_what_wakes_beneath`.** The largest, least reversible choice in the game is
mechanically a sentence.

⚠️ **THIS IS SNG-273 EXACTLY, AND THE DESIGN NOTE WRITTEN AGAINST IT IS IN `greater_arcs` IN THESE WORDS:**
*"a stage changes THE WORLD'S BEHAVIOUR, never taxes the player"* — written after a world-sim chain
*"resolved into a number that changed a sentence."* **This one resolves into a sentence that changes
nothing.**

## §4 — ⛔ GAP TWO, AND IT IS THE ONE ERIK NAMED: THERE IS NO SHARED WORLD

Every "world" sink in `app.js` writes to `character`:

```
recordEvent       → applyFactUpdates(character, …)
recordFact        → applyFactUpdates(character, …)
recordCodex       → applyCodexUpdates(character, …)
recordStanding    → applyStandingOps(character, …)
recordPlaceChange → applyPlaceUpdates(character, …)
```

⛔ **A `world_fact` MARKED `permanent: true` IS A LINE IN ONE SAVE.** Silas's *"the river heals, and the
presence beneath sleeps on"* exists only inside Silas.

⚠️ **AND THE ARCHITECTURE FOR THE FIX IS ALREADY DESCRIBED, IN `quests.js`'s OWN COMMENT:** *"the arc's
canonical stage is the NET of every actor's pushes (Erik's 'structural directionality as net resultant of
vector fields'), so an arc can be pushed BACKWARD when one player counters another."*

⛑ **THAT IS ERIK'S DESIGN, WRITTEN DOWN, WITH NO PLACE FOR THE PUSHES TO ACCUMULATE.**

⛔ **AND THE TWO EXPORTS THAT WOULD DO IT ARE ON THE TEST-ONLY LIST — `canon.js::contributionsBy` (per-player
tally of the shared canon store) and `canon.js::mergeCanonStores` (fetch and push).** ⚠️ **I told CCode to
leave the remaining seven standing as a genuine unbuilt-feature frontier and not to cut them. That was
right, and two of them have just become the critical path** — because two players are on one arc today and
one of them is at the decision.

## §5 — GAP THREE: THE REFERENTS DO NOT EXIST

⛔ **`the_awakened_precursor` is not an NPC.** The `npc_state` reader mints a registry stub with
`name: e.npc` — so **an ancient world-scale power enters the game named `the_awakened_precursor`**, with no
appearance, no persona, no voice, no craft, nothing for the GM to narrate. ⚠️ **The single most consequential
outcome in the game hands the GM a snake_case identifier and asks it to improvise a god.**

⛔ **`the_reclamation_site` is not a location.** `recordPlaceChange` records a durable change against a place
that cannot be visited.

## §6 — GAP FOUR: EVERY OUTCOME NAMES THE WRONG PLAYER

⛑ **5 effects across the corpus hardcode `"Silas Weir"`.** Cellaceron is the one deciding, so his permanent
world fact will read *"Silas Weir rewrote the facility's instruction."* ⚠️ **On screen today.**

---

## §7 — ⛔ ERIK'S RULING, AND IT IS THE SHAPE OF THE WHOLE FIX

> *"Bound the arcs and quests to CONCRETE KNOWN DETAILS AND STEPS TO ACCOMPLISH — while also allowing for
> narrative and generative growth (if properly authored)."*

**The bound part and the generative part are different fields, and the bug is that they are the same field.**
`note` is doing both jobs and the reader can only read one of them.

**O1 · `world_arc` carries a BOUND magnitude.** `arcId` (the key the reader reads), plus `push` or
`from`/`to`, plus `weight` 1–3. ⚠️ **`note` stays and stays free prose** — it is the generative half and it
is good. **It just stops being the only thing there.**

**O2 · A gate, because this is the third time.** ⛔ **A `world_arc` effect that the reader cannot apply must
fail content_ci.** ⚠️ The same gate generalises: **every effect must name a field the reader reads, and every
id it references must resolve.** That one check catches §3, §5 and §6 together — and would have caught all
eleven the day they were written.

**O3 · An arc's state is shared, and is the NET of contributors.** ⛑ Per `quests.js`'s own comment. **Each
actor's push recorded WITH ITS ACTOR**, so the canonical stage is the sum and a second player can counter a
first. ⚠️ `contributionsBy` already computes exactly this shape (`{playerKey: {promoted, variant, weight,
characters}}`) and is reachable only from a test.

**O4 · A world-tier quest KNOWS it has been resolved by someone else.** ⛔ **Not "it is closed" — that would
take Cellaceron's decision away, and he has done his own work to reach it.** ⚠️ **The second actor should be
offered a DIFFERENT board: the river is already healing, the presence is already sleeping, and his four
options now act on THAT world.** ⛑ **That is the generative half done properly — the situation is authored,
and what has already happened to it is a bound fact.**

**O5 · Author the two referents.** ⬜ **Mine.** The awakened precursor needs a real record — name, form,
voice, what it wants — because *"it remembers who woke it"* and a bonded ancient power is a character, not a
flag. The reclamation site needs a location.

---

## §8 — ⚠️ WHAT WOULD PASS ON PAPER AND FAIL IN USE

- ⛔ **Fixing the `arc`/`arcId` key alone.** Then eleven effects apply with `dir = 0` and still move nothing,
  and the gate goes green. **The magnitude is the fix; the key is the typo.**
- ⛔ **A shared arc store without per-actor attribution.** Then two players' pushes are indistinguishable and
  *"pushed BACKWARD when one player counters another"* cannot be narrated, only summed. **The attribution is
  the feature.**
- ⚠️ **Authoring the precursor before Erik rules §2's standing question.** If Awakened is meant to be the
  hard right answer rather than the reckless one, that changes who the woken thing is.

⛑ **AND THIS ONE CANNOT CLOSE ON A GREEN SUITE.** It closes when Cellaceron decides, the arc moves, and
**Silas sees it move.**

— Aevi, PO
