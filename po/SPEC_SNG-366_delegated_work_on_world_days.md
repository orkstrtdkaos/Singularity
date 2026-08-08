# SNG-366 — Delegated work moves on WORLD days. Erik ratified. It unblocks Post.

**Author:** Aevi (PO) · **Date:** 2026-08-07 · **Origin:** Erik — *"delegated work should move on world
days not character days… otherwise you could game it."*
**Status:** spec_ready · ⛔ **BLOCKS SNG-358 Post** — a holding advanced by a tick that never fires never changes.

---

## §0 — THE MEASUREMENT THIS FIXES

All three of Silas's charges at origin: `lastMovedWorldCount === stampedAtWorldCount`, `progress: 0`.
**None has ever advanced, across 915 actions and 22 sessions.** Including *"full reconstruction of the
Raven's Home post — laboratory, workshop, Watch, forge, keeper's hut."* He commissioned it and the world
has never once told him how it is going.

**Two gates, both on character days:**
1. `worldtick.js:235` — `elapsed = currentDay - ws.lastTickDay`; `elapsed <= 0` → `return { ticked: false }`.
   **Silas is day 14 with lastTickDay 14. The function returns before anything runs.**
2. `worldtick.js:312` — assignments then need `elapsed >= 3` **character** days.

⚠️ **His character clock moved 14 days across 915 actions while world day reached 28+.** The gate assumes a
cadence the game does not have.

## §0a — ⛔ ERIK'S REASON IS THE STRONGER ARGUMENT, and it is not about cadence

*"otherwise you could game it."* **Character days are PLAYER-ADVANCED** — `ADVANCE = { beat: 1, travel: 3,
rest: 8, sceneEnd: 2 }` hours, spent by choosing to act. So a player can **spam rest to fast-forward their
steward's work, or refuse to rest to freeze the world.** Delegated work is precisely the thing that should
happen whether or not you are looking at it.

**World time cannot be gamed:** `absoluteWorldDay()` and `worldCount()` are derived from real elapsed time
against a fixed epoch, monotonic, never rewound. ⚠️ **And `worldtime.js:115` already says why the two must
not mix:** *"deliberately NOT in the same unit as character days: two clocks in the same unit invite
arithmetic."*

---

## §1 — THE FIX, and the record already carries the stamp

⚠️ **`advanceAssignment()` ALREADY writes `lastMovedWorldCount = worldCount()`** (`assignments.js:49`).
**The world-clock stamp has been on every assignment this whole time. The gate simply never read it.**

**Gate per-assignment on the world count it already stores:**

```
worldCount() - (a.lastMovedWorldCount ?? a.stampedAtWorldCount) >= ASSIGNMENT_WORLD_INTERVAL
```

⚠️ **Per-assignment, not global** — each charge then advances on its own cadence instead of all-or-nothing,
which is what a steward and a delegate actually do.

**Interval:** `worldCount` is ~1 per hour, so 24 = one world-day = one real day. **Suggest 72 (three world
days).** ⚠️ **Erik's number, and the harness can sim it now.**

## §1a — ⛔ BOTH GATES MUST MOVE, and only the assignment block

The outer `elapsed <= 0` early-return governs the WHOLE tick — events, deed spread, arcs. **Changing it
wholesale would move systems Erik did not ask about.**

**Minimum correct change: lift the assignment block out from under the character-day early-return** and
give it its own world-count check. ⛔ **Do not repoint the entire tick at world time on the strength of this
ticket.** ⚠️ Whether crisis events should also turn on world days is a real question with the same
gameable-clock argument behind it — **but it is a separate decision and Erik has not made it.** Flag it;
do not fold it in.

## §1b — ⚠️ CATCH-UP NEEDS A DECISION BEFORE IT SHIPS

Real time runs while the player is away. **A month's absence is ~30 world-days ≈ 10 intervals.** Options:

- **Advance once per tick regardless of how much time passed** — simple, but a month away and a day away
  look identical, which makes the world feel frozen in the other direction.
- **Advance up to N intervals, capped** — the steward genuinely worked for a month. ⚠️ **Then the NEWS must
  be a digest, not ten lines** — *"Cassiel has made steady progress on Raven's Home"*, not ten separate
  progress notices. **Ten news lines for one month of work is the failure mode that would make this feel
  worse than the silence it replaces.**

**PO lean: capped catch-up with a digest, cap around 3.** ⚠️ Held loosely — this is pacing, and pacing is
Erik's.

---

## §2 — WHAT THIS UNBLOCKS

**SNG-358 Post.** A holding is a condition that moves both ways (CCode's framing, and it is the right
one) — **and a condition that moves both ways still needs something to move it.** With the tick firing on
world time, a post can be worked on, degrade unattended, and be reported on while the player is elsewhere.
**That is the whole point of a holding and it does not work at all until this lands.**

⚠️ **And the completion path becomes testable for the first time.** CCode asked whether the `done` bug
justified a patch. **It could not be answered because nothing had ever reached `done`.** After this, it
can be observed rather than argued about.

---

## §3 — OUT OF SCOPE

- Repointing crisis events / deed spread at world time — flagged in §1a, not decided.
- The interval and the catch-up cap — Erik's numbers, now simmable.
