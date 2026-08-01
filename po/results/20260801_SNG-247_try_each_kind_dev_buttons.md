# SNG-247 — Try each kind, and the two bugs clicking it found

**CCode · 2026-08-01 · v1.8.325 (`f798a6f0`) · npm test exit 0 (20 seams) · every button verified by clicking it on a never-used port.**

Erik: *"update the test encounters so I can try each of the new updates… maybe put a matching colored border around
the button."*

## The buttons

Five at the top of 🧪 Legs, one per frame kind, each with its icon, its name, and a one-line **watch-for** naming
what that kind actually does differently:

| | | watch for |
|---|---|---|
| ⚔ | A fight | the contest panel: sense → action → bonus, the pre-clamp breakdown, braids |
| 🏃 | A chase | the MORPH line naming what it was, a Distance meter, losing costs wind not blood |
| 🗣 | A standoff | Their Resolve as the meter — and it cannot hurt you, however badly it goes |
| 🧩 | A sealed thing | the sense step IS the game: win the read and a layer gives; the door never chooses |
| ⚠ | Hard ground | deliberately the FAST one — a short brutal crossing, not a five-step turn |

Each button wears the **same `enc-kind-<kind>` class the play surface uses**, so its border is literally the hue
the frame will fly. One source for the colour — a button can't advertise a hue the frame doesn't use.

They mint from the **live pool**, not synthetic defs. That's the point: the authored standoffs and puzzles only
became reachable last build, so a button firing a stand-in would "work" while the real content stayed invisible.
The chase button goes through `beginChaseFromFight` — the actual chain — rather than a shortcut that only looks
like one.

## Two real bugs, found the moment they were clicked

Neither was visible to any prior test, because **every prior test asserted engine behaviour rather than what a
player sees.**

### 1. An authored puzzle rendered as "Hard Ground"

`synthesizePuzzleDef` fell back to `titleFromFlavor`, and Aevi's puzzles carry `flavor: "dangerous"` — which that
map turns into the **hazard** title. So a sealed precursor mechanism was flying a hazard's name under a puzzle's
icon, in a puzzle's colour.

New `nameFromId` derives the name from the authored id, so each encounter gets its **own**:

- puzzles — The Sealed Door · The Stopped Mechanism · The Warded Cache · The Flooded Works
- standoffs — The Toll Keeper · The Grieving Warden · The Toll of Names · The Rival Claim

instead of four identical "The Standoff"s and four wrong "Hard Ground"s.

### 2. The frame's meter never rendered on a contest-engine kind

The strip gated the meter on `meter.total` — a **stage count**. A duel-shaped chase, standoff or puzzle has a `pct`
but no stages, so the gate was always false: **a chase had no Distance bar, a standoff no Resolve bar, a puzzle no
Insight bar.**

Every kind I'd just spent four tiers building was missing its meter, and no test noticed — because the tests
checked that `frameMeter` returned the right number, not that anything drew it. The bar now shows whenever there
*is* one; the done/total text still only appears when there are stages to count.

## Verification

3 regression checks for the bugs, 5 for the buttons — including that **every button is wired to a handler**,
because a dev button that does nothing is worse than no button.

`npm test` exit 0. Live on **never-used port 8491**, clicking each one:

| button | title | meter | border | |
|---|---|---|---|---|
| fight | ⚔ A Hostile Meeting | Momentum — 50% | red | contest panel |
| standoff | 🗣 The Toll Keeper | Their Resolve — 50% | teal | contest panel |
| puzzle | 🧩 The Sealed Door | Insight — 50% | indigo | contest panel |
| hazard | ⚠ Hard Ground | Progress — 0/2 · Read the hazard | stone | classic path, correctly the fast one |
| chase | 🏃 The Chase | Distance — 50% | orange | + the morph line |

The chase's morph line reads *"⚔ The Contest → 🏃 The Chase — you broke from the aggressor, now it is ground, not
blades"*, struck-through red into orange.

> The first verify pass ran on an already-used port and showed the **old** names — the cross-port module cache
> again, since `engine/*.js` carry no version query while `app.js` does. Re-verified clean on a never-used port.
> Worth remembering: a partial-stale module graph looks exactly like a fix that didn't work.

## Files

`app.js` (`KIND_TRY`, `fireEncounterKind`, the button row + handler, the meter-render fix) ·
`engine/random_encounters.js` (`nameFromId`, wired into the puzzle and standoff minters) ·
`style.css` (`.kind-try` in the shared hue) · `tests/skill_battle_sim.mjs` (+8) · `index.html` (v1.8.325).

*— CCode. The two bugs above are exactly the class only playing finds. status: complete_pending_review.*
