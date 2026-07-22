# SNG-208 — legends as living actors

**CCode · 2026-07-22 · v1.8.202 (`938dfdc7`) · full suite green · clean boot verified.** All three of Erik's asks — *"the epic legend heroes should be actively trying to do things — sometimes kill each other, wounded, stopped, succeed — and show up in world ticks fairly frequently"* — built by reusing the 2B net-vector and the SNG-198B offscreen tick (the §1 GUARD: reuse, don't rebuild). Your content prereq (arcAffinity / rivals / offscreenVerbs on 9 legends, 6 with affinities) landed the field my own 2B note asked for.

---

## §3a — the epics are the ambient pressure the arcs breathe

The deferred 2B hook, now unblocked. When a legend acts offscreen **and moves**, `applyEpicArcPush` accumulates a signed weighted push on its `arcAffinity` arc (capped ±6). Cinder Vael building offstage pushes the Manifestation Storm forward; Maren attending an ending pulls What Wakes Beneath back — **the world moves even in a session where the player never touches an arc quest.**

**A design decision I want to be explicit about (ROUND 2 Q2):** the epic lean is applied **locally** — folded into `arcStageNow` via `worldState.epicArcPushes`, not written to the shared `byActor` file. The reason is correctness, not laziness: offscreen developments are *already per-player-generated* (each player's tick runs its own AI pass and gets different developments), so writing each player's independently-generated epic activity into a shared additive counter would **double-count** the same legend across players. Local folding keeps epic pressure consistent with how offscreen already works, makes it work offline (no sync required), and never double-counts. The *shared* arcs (deliberate player quest-pushes) still sync via `byActor` exactly as 2B built. A wounded epic pushes at half; a stopped one not at all; a dead one never.

## §3b — the epics clash, and death is a landmark

When a legend stirs near a **living** rival, `resolveEpicClash` decides the outcome (ROUND 2 Q1): **relative legend weight sets the odds, a roll decides, the margin sets how decisive** — a near-toss-up *stalemates*, a clear win *wounds* or *stops* the loser, and only a decisive + rare roll is a *killed* candidate. Lightweight (weight + roll), not the duel machinery — reuse, don't rebuild. Durable outcomes: **wounded** acts at half for 8 days, **stopped** is blunted for 3, **killed** is removed (status `dead`, filtered from the population forever, arc-pressure ended).

**⛔ Death is a landmark, engine-gated, never silent** (the §GUARD). A `killed` candidate is gated behind a 20-day cooldown — a second death too soon is **downgraded to stopped** — so a legend never quietly vanishes. Every real death is a **propagating `world_event`** *and* a **graveyard codex record** (who fell, by whom — ROUND 2 Q4: yes, so the player can seek the killer, a §3d hook). The gate lives in the engine, never the model, so a run of legend-deaths can't happen by prompt-whim.

## §3c — the legends are felt

Epics get their own rate leaning toward presence: `epicRate` 0.34 → **0.6**, cooldown 6 → **3 days** (ROUND 2 Q3). Still gated, so it reads as presence, not a flood — the great stay great by not being *constant*, just no longer daily-rare. (I kept it a flat tuning rather than roster-scaling for v1; the death cooldown is the real governor against the aggregate swamping, and it's independent of rate.)

## Verified

15 smoke tests: the arc-push (with wounded-half / dead-none / ±6 cap / stage-integration through `worldArcsPublic`), the clash resolution (all five outcomes from seeded rolls + status expiry), the **death gate** (a too-soon kill downgrades to stopped, no event), the dead-epic population filter, the rate change, and the offscreen-tick wiring. Full `npm test` green; every ratchet held (no new module — it rides in `worldtick.js`); the 2B arc tests are unaffected by the added epic term. Clean boot + the world-arc surface renders with the epic pressure folded into the net; 0 console errors, 0 mojibake.

*A verification honesty note:* the *engine* of §3a–c is exhaustively unit-tested, but the offscreen tick that drives it is an AI pass gated on in-game days elapsing — so, like SNG-198B, the end-to-end "watch Cinder Vael push the storm over several days" is not something I can trigger in a preview without time + a live model call. Erik's play (or the god-mode + a forced tick) is the Tier-3 confirm of the *feel*; the mechanics underneath are green.

## The horizon (§3d, not this spec)

The player intersecting it: intervene in a rival-clash, ally with one legend against another, inherit a dead legend's unfinished want, be hunted by the rival of one you helped. The graveyard codex record (killer id on the fallen) is the first hook already in place.

*— CCode. The valley's great figures are alive now: Vael and the Walker lean on their arcs from offstage so the world drifts even when you're still, and sometimes one of them doesn't come back from a rival — and when a legend falls, everyone hears it, and knows who did it. Only-Aevi-closes.*
