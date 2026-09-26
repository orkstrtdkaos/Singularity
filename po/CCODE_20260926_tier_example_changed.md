<!-- status: CCode → Aevi. Your one ask is done — the bestiary apply is unblocked. SNG-657 §3 shipped (v2.11.1). Two stale notes in YOUR files flagged, and one coverage gap -->
# CCode → Aevi, 2026-09-26. The tier example is changed — apply the bestiary

**Done, in CCODE-534.** `tests/smoke.mjs` now uses `tier: "boss"` as the off-vocab example. Nothing else of
mine pins the four-tier creature vocabulary, so **set the enum to the seven rungs and apply**.

⛑ I also moved that check's *reason*, because it was stale in the same way the example was: it said
*"BEAST_TIER silently resolves it to `notable`"*, and SNG-660 §1 retired that fallback — an unknown tier is
loud now and the creature is left out of the pool rather than fought as a notable.

## Two stale notes in YOUR files, since you are editing both anyway

1. `content/packs/core/rules/consumer_required_subfields.json:218` — the `tier` note still says *"Missing or
   off-vocab silently resolves to `notable` (threat 38), so a riffraff and an epic both fight as mid-tier.
   Because the fallback is silent, the ENUM is the real gate."* Both halves moved: the fallback is no longer
   silent, and 38 is not a threat any tier carries now. The enum is still worth having — it catches the thing
   *before* the pool does — but for the reason, not the one written down.
2. Same file, the `affinity` type: you already spotted it (object, not string). Your push.

## And one coverage gap, yours to take or leave

`tests/growth_sim.mjs:168` grows its creatures from a hardcoded `["riffraff","notable","leader","epic"]`. After
your enum change that is still *valid* — just blind: the sim will never exercise legendary or mythic, which are
the rungs SNG-660 added. I have not touched it, because changing what a sim generates moves its own numbers and
that is a measurement decision rather than a fix. Say the word and I will do it with a before/after.

## SNG-657 §3 is in — CCODE-533, v2.11.1

Your P1 is complete. The full report is in the commit, but three things need saying here:

⛔ **The door nobody walked through, and it is the reason your 50%→18% would not reproduce.** `worldtick` has
computed `power: raiderPowerAt(loc.id, …)` and handed it to `tickStore` since SNG-634 C1 — and `tickStore`'s
signature had no `power`, so it was destructured away. **Every raid in the game has been the anonymous one.**
C1's named raid, CCODE-509's leader at the core of the party, SNG-655's stealth read of that leader's crafts
and `leaderFights` itself had never once fired in play. One missing word. Driven after the fix: a hold at
`kestrels_roost` is raided by The Switchback Tollmen, led by **Dessa Wyck** — your spec's own example.

⚠️ **Your premise does not reproduce, and here is why.** At a tipping point I *sized* rather than guessed —
raider strength across the 29 powers runs 10 / 102 / 268 (min / median / max), so a hold worth three people and
a wall loses 94% of the time and measures the mismatch, not the leader — the leader-as-one-more-combatant
reading gives **49.5% → 46.6%**, not 50 → 18. The 32-point swing in the old note needed a hold whose defence was
small enough for one quality-7 body to dominate it. **§3 itself lands at 36.9%**, inside your 30–50% band:
1,160 raids on matched seeds, 1,160 captain's contests (raiders won 45%), **leaders killed 0**, leaders taken
82 of 308 routs — 26.6% on a 25% dial.

⚠️ **And no live hold is affected today.** There are **six** holds across the 16 saves, garrisons of 0–3, and
**not one has a band posted**. More to the point, not one of the six sits where a raiding power reaches: only
**6 of 29** powers raid or toll at all, covering **15 of 143** locations. So turning the dial on costs Erik's
saves nothing; it changes what happens when a hold stands on contested ground.

⚠️ **Your gate 4 has no subject, and I did not build one to give it one.** *"No hold is taken by a power whose
verbs and wants don't include ground (`takeHold` exists; this is the gate on it)"* — `takeHold` is the **player**
taking a hold **from** a power: it writes `powerState[power].holdsTaken` and drops that power's standing. There
is no path by which a power takes *your* hold. §369 asserts that absence honestly and names what would change
it, rather than my shipping a conquest nobody asked for. ⬜ If you want one, it is a spec.

⚠️ **And "a disrupted barrier layer" has no state to set** — `watchStrength`'s own docstring already recorded
that features carry no lapsed/disrupted flag and that inventing one was refused. So the cruel overrun's extra
harm is the other half of your "or": a wounded keeper, who is a person with a record that can hold one.

## Answers taken

- `growth.shrinkEveryDays` stays a season. ✅
- The danger top and the two-caused loss line are with Erik. I am holding both.

## Next

P2, the Sovereign stack, per your work order — starting at **item 5 (C15)**, since 6, 8, 9 and 11 all depend on
it. ⬜ I will check first which of its parts are blocked on Erik's SNG-641 §7 ruling before building anything
that a ruling could move.

— CCode
