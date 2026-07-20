# SNG-191 — Two clocks, and a world that actually turns

**Author:** Aevi (PO) · 2026-07-19 · Erik-directed. Outcomes; engineering is CCode's.
Closes **RUNNING_FIXES C1** and supersedes SNG-189 §2's open question.

> Erik's ruling: *"Only their own clock… but then the world clock needs to not be days — it needs to
> be something else, ticks, clicks, beats… something that builds and doesn't obviously disagree with
> the player's time."*

---

# §1 — THE RULING

**A journey advances only the traveller's clock.** The world moves on its own and the tick reports
what was missed. Two clocks, permanently, deliberately.

**They must not share a unit.** Two clocks in the same unit invite arithmetic; two clocks in
different units simply coexist. Nobody compares a timestamp to "Tuesday." **This single change is
what stops the GM inventing day-numbers** — there will no longer be a world day-number available to
invent with.

- **CHARACTER TIME** — days, seasons, times of day. Human units. Personal. Advanced by `timeOps`,
  **uncapped** (today's silent 72h clamp, RUNNING_FIXES A1, dies here). This is what the GM narrates
  from, always.
- **WORLD TIME** — a monotonic count, real-time-derived, never rewound. The **shared ordering key**.
  It stamps news and shared canon. **It should almost never appear in prose.**

The distributed-systems shape, since it is the honest description: this is a **logical clock**, not a
wall clock. Players never need to agree on *when*. They need to agree on *what happened before what*.

---

# §2 — WHO KEEPS IT (Erik's worldbuilding ruling)

**The Hourkeepers KEEP the time.** Custody, authority, continuity — it is their craft and their
charge. **The Lattice-Cities MAINTAIN THE MEASUREMENT**, because measurement is *how* a thing is
kept: the standard, the instruments, the calibration that makes one count mean the same thing in two
places. **Neither owns it alone**, and that division is the reason it is trustworthy — the people who
hold it are not the people who verify it.

**And then it travels, and every people marks it in their own idiom.** One count underneath, many
words on top:

| people | idiom | why |
|---|---|---|
| **ashwarden** (Cairnhold) | **tolls** — a bell, rung | they already keep a bench and a bell; counting is how you attend an ending |
| **hourkeeper** | **the kept count** — the canonical form | theirs to keep |
| **lattice** | **measures** | the standard, stated precisely, slightly pedantically |
| **enginewright** | **revolutions** | the Engine turns; they count its turning |
| **marcher** | **watches** | you count what you must stand |
| **rootkin** | **risings** | they mark growth, not machinery |
| **umbral** | **darks** | they count what everyone else stops counting at |
| **churnfolk** | *refuse to keep a consistent one, and are cheerfully unbothered* | it is the joke that writes itself, and it is in character |

⛔ **The unit's canonical NAME is the one thing still needing Erik's word.** Recommendation: the bare
unit is **a count**; the Hourkeepers' formal term is **the Kept Count** (it rhymes with their
region, The Kept Hours). Locals translate. Say yes or name it and I will author the idiom table as
content.

**Granularity:** roughly one count per hour of real time, so a week away reads as ~170 — a number that
plainly *built*, which is what Erik asked for. Fine enough to accumulate, coarse enough to mean
something.

---

# §3 — PARTY FORMATION IS THE SYNC POINT (Erik's ruling)

**Forming a party syncs the members' CHARACTER clocks — not world time.**

From the moment of joining, they advance together. **Their pasts stay different lengths and that is
correct** — one character has lived twelve days of story and another forty, and that is biography,
not an error. Nothing is retconned. The join is stamped at the shared count; personal time runs
together from there and diverges again when they part.

This is West Marches' town-as-sync-point, and the waygate architecture already gives it to us: **The
Crossing is where players converge anyway.** The mechanism is built; it needs the rule.

---

# §4 — THE WORLD MUST TURN, NOT NARRATE ⚠ the substantive half

> Erik: *"The news itself does not need a threshold update — we don't need to know that someone ground
> a lens a certain way, unless that had some larger bearing on world or regional events… those NPCs
> SHOULD be doing things while I'm gone — working on the water problem, solving challenges, weathering
> crises. That's the world turns."*

## What it does today

`worldtick.js` §3: *"OFFSCREEN NPC EVOLUTION — an AI pass **imagines what happened** to known people
during the gap."* **Ask a model to imagine what happened to someone and it will write a small human
moment**, because that is what the question asks for. Erik's live prompt carried four of them: Vash
re-grinding a finished lens, Calvar re-checking instruments, **Pip talking her way into carrying a
bundle of waxed cord**, Siol standing in a plaza.

**Every one is well written. Not one of them changed anything.** Four news slots spent on colour
while the water crisis — the thing the whole valley is organised around — moved not at all.

## The inversion

**Stop asking what happened to a person. Ask what progressed on what they are responsible for.**

The fiction has already done the setup work. **Silas delegated four named roles at the Fell Pell:**
Calvar leads the repair crews, Dara runs crew logistics, Mara holds supply and communications, Aldric
anchors the accounts. Those are **commitments the world should honour while he is away.** The tick
should be asking *did the repair crews make progress* — not *what was Calvar feeling*.

1. **Assignments are state and the tick advances them.** A named NPC with a role makes progress,
   stalls, or hits a problem. Their situation is an *outcome*, not a mood.
2. **Crises move against the work.** Ignoring a crisis already worsens it (§1 of the tick, and it
   works). The other half is missing: **doing something about it should measurably help**, and the
   delegated roles are the mechanism. A crisis that cannot be affected by delegation makes delegation
   theatre.
3. **News is DERIVED from state changes, never authored beside them.** If nothing changed, there is
   no news, and **an empty news block is a legitimate result.**
4. **The threshold is Erik's: does it bear on world or regional events?** A lens re-ground is not
   news. A lens re-ground *that identifies the calibration term* is. Same beat, different weight —
   and the second one is a state change.
5. **Personal colour still belongs — attached to the person, not the news.** `statusNote` is the
   right home for "he has not looked away from the window." The news block is for what moved.

## §4b — ⚠ RETRACTED. Erik's correction, and he is right

I originally wrote here: *"do not let the tick generate work Erik must then undo — a crisis that
advances three stages while he is away is worse than a lens vignette."*

**Erik struck it:** *"don't say the tick must not generate work you have to undo — the success of the
work happening depends on how good the scene is prepared and luck — but it absolutely needs to be
unguardrailed."*

**He is right and the error is a familiar one.** That guardrail is the same shape as rule 19C, which
I diagnosed this morning: a caution written so carefully it prevents the thing it guards. Its effect
would have been a **timid world** — one that never does anything big enough to matter while you are
gone, which is the whole point of a world that turns.

**The standing rule instead: the world is UNGUARDRAILED.** Whether things go well depends on how
well the scene was prepared and on luck — not on a ceiling. A crisis that runs three stages because
nobody tended it is **the game working.** Progress should still be *attributable and legible* —
who did it, what moved — but that is for readability, never as a limit on how far it may move.

---

# §5 — WHAT DIES WITH THIS

- The silent 72h `timeOps` clamp (RUNNING_FIXES A1)
- Invented day-numbers in `statusNote` and `placeUpdates.note` (SNG-189 §2, SNG-190 §5) — **there
  will be no world day-number to invent**
- `CURRENT TIME` showing two numbers in one unit that disagree
- Four news slots per return spent on people having small days

# §6 — ACCEPTANCE

1. A four-day journey costs four character-days and is narrated as four days.
2. World time appears as a count, in the local people's idiom, and never as a bare day-number.
3. Returning after a week shows a world count that has plainly built, and news that reports **things
   that moved**.
4. The water crisis responds to whether the delegated work happened.
5. Two characters forming a party share a clock going forward and keep their own pasts.
6. No durable record is stamped with a date the engine did not issue.

---

# §7 — THE GENERATION TURN (Erik's addition — the world has its own agenda)

> Erik: *"There needs to be a good generation turn too — what are the unknown arcs doing? They are
> progressing in the background, or at least fomenting, and should show up somehow: new NPCs, local
> events, seasonal. Those can pop into existence and either be handled, go away on their own, or grow
> into a bigger problem. **All of this is the game itself.**"*

## The gap this fills, stated exactly

`generateRequest` is documented as **reactive only** — *"you request when the fiction needs it; the
world does not spawn on its own here."* That was a correct scoping decision and it left **half the
system unbuilt.** The world currently grows only when the GM reaches for something. It never reaches
for anything itself.

**The generation turn is the proactive half.** It runs on the world count, not on the player's
attention.

## What it does

1. **Latent arcs advance whether or not anyone has seen them.** An arc does not begin when the player
   discovers it — **discovery is a late event in a thing that has been building.** A feud, a
   shortage, a rot in a granary, someone's slow decision: all of it fomenting on the world clock.
2. **They SURFACE at thresholds** — as a new face, a local event, a rumour that is now specific
   enough to repeat, a change in a place. The surfacing is the player's first contact, not the arc's
   beginning.
3. **Three fates, and the middle one is the important one:**
   - **Handled** — the player intervenes.
   - **Resolves itself** — *the world solves its own problems.* Without this the world is
     hero-dependent, every thread waits politely for the player, and nothing that happens elsewhere
     is real. **A problem that went away because someone else dealt with it is one of the strongest
     signals a world can send.**
   - **Grows** — unattended, it becomes larger, and it should be allowed to become genuinely large.
4. **Seasonal pressure is its own layer** — a cyclical band under the arcs. Early-spring melt, a hard
   winter's scarcity, harvest. These are not arcs; they are the conditions arcs happen in, and they
   recur.
5. **Regional, not global.** An arc belongs to a place and its people, and should be discoverable
   from the disposition of that place. The Palelands ferment different problems than the Gearlands.

## Invariants

1. **Unguardrailed** (§4b). An arc may grow as far as its own logic takes it.
2. **Attributable** — every surfaced thing has a cause that existed before it surfaced. **No arc
   springs from nothing at the moment of contact**; that is the difference between a living world and
   a random encounter table.
3. **Not everything is the player's.** Arcs must be able to complete with no involvement, and the
   player should sometimes learn only that it happened.
4. **Surfacing is content, not notification.** An arc arrives as a person, a place changed, or
   something overheard — not as an alert.
5. **Uses the real minting paths** (SNG-177/185's shared helper), so anything generated here is a
   full citizen: provenance, domains, people, recurrence.