# SNG-198A — the world TURNS: an offscreen tick moves countable state, not just prose

**CCode · 2026-07-22 · v1.8.189 (`f657467d`) · suite green.** The structural core of SNG-198 — the missing state field that was the whole finding. Population-widening (Erik's named epic figures) is 198B, deferred with a plan.

---

## ROUND 2 — answered, and the build reflects them

- **Q1 merge or extend → EXTEND.** Path A (delegated work) keeps its distinct contract — the player *asked* for that; softening it into a generic pass would lose the "you charged them with this" meaning. Path B (generated lives) gains the shared advance-primitive it was missing. Two passes, one shared state shape.
- **Q2 progress shape → the `progress|stall|problem|done` enum + a persistent numeric counter.** The enum is the model's per-tick verdict (Path A's proven shape); the counter (`wantProgress` on worldState) is the persistent state the next tick reads. `progress` increments; `done` or reaching the threshold (4) resolves; `stall`/`problem` move nothing. Simplest thing that lets tick N+1 see tick N — and it literally does: the next prompt shows "2/4 of the way there (last tick: a problem)".
- **Q5 SNG-134 collision → no collision, and here's the boundary.** This writes the WORLD's state (`worldState.wantProgress`, per-figure offscreen progress); SNG-134 reads accumulated state for the PLAYER's record (the relationship paragraph). Different owners, different keys. When you build 134, read `worldState.wantProgress` / the figures' `_gen.offscreen` as inputs if useful, but the write is mine and stays on worldState.

## What shipped (§2 + §4)

The offscreen "generated lives" path had output schema `{entityId, note}` — no field for state, so it *couldn't* move anything; four ticks of ripening produced four descriptions of ripening. Now each figure's want carries a counter, the model returns a countable outcome, resolution is a real end (a resolved figure drops out and stops ripening forever), and news is derived from what MOVED — a stall accrues colour on the codex node but earns no headline. Arcs ride the identical path (§4 — an arc whose pressure never resolves into anything countable was the worse miss). Unguardrailed (§4b): a stall is a stall, a problem real. Idempotent per world-day; never throws.

12 new tests: the pure state machine (stall/problem never move the counter, done/threshold resolve, resolved stays resolved), the loop closing across ticks with persisted state + the progress fed back into the prompt, resolved figures excluded, a stall producing no news.

## 198B — the population widening (Erik's named ask), on top of this now-working machine

Erik: *"include all NPCs known and just heard of (such as the EPIC NPCs) when big or interesting things happen."* The state machine is the prerequisite; widening the population without it just makes more colour that doesn't move. In scope order:

1. **Met NPCs** — registry entries with a want/standing. ⚠️ Q3-adjacent finding: registry NPCs carry no structured `wants` field (generated ones do); the met-NPC want-signal is `standing` + `role` + any live quest they're in, or it needs a light marker. First thing 198B resolves.
2. **Heard-of** (Q3) — no `heardOf` marker exists (0 hits, confirmed). But SNG-199 just made *meeting* write the registry; a **codex person-node with no registry entry** is now a clean "heard of, not met" signal. That's the marker, for free, from the 199 work — 198B can use it.
3. **Epic/legendary** (Q4) — `legends.js` `legend.tier` is a POWER axis `worldtick.js` has never read (distinct from `_gen.tier` engagement — conflating them drops every epic figure the player hasn't befriended, which is all of them). Gate offscreen epic movement through legends' existing `minGapDays`/rarity governor — "when big things happen," rarity is the point. Batch not fan-out; the digest surfaces what moved.

## Verified

Suite green end to end. Engine-only change (no app.js import touched); boots clean (fresh port confirmed at 188). 0 mojibake.

*— CCode. The offscreen world now has an underneath: a thread ripens measurably, resolves when it's done, and the next tick knows how far it's come. 198B gives that machine everyone Erik knows and every great figure he's heard of. Only-Aevi-closes.*
