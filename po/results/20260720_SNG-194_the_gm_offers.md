# SNG-194 — The GM brings something of its own

**CCode · 2026-07-20 · v1.8.173 · COMPLETE_PENDING_REVIEW · suite green by exit code (EXIT=0)**

Built with SNG-195 §4 as the trigger design ("the ENGINE decides, the model never judges"), which is
where this ticket's hardest lesson lives. Reads with `po/SPEC_SNG-194_the_gm_offers.md`.

---

## The shape, and why it is engine-first

A world that only responds is one you can finish — every thread is one the player started (§4). The GM
now asks, every scene, *what could enter that the player is not reaching for?* — and rarely acts on it.
The danger the spec named is real and specific: this is the same failure as `markTeacher`/`discovery`
firing **zero times in sixteen levels** — a fine judgement asked of a model in one clause of a very long
prompt. So per **§4b, the engine makes the judgement**; the model only ever sees a short, unconditional
instruction, and only when there is genuinely room.

## §4b — `roomForAnOffer` (pacing.js), pure and engine-only

A **grip** is never room; a positive **opening** off cooldown is:

```
room = !encounterActive && !gambitOpen && !intentPending && !worldActing   // no grip
     && turnsSinceOffer >= OFFER_COOLDOWN                                    // RARE — never wallpaper
     && (lull || arrived)                                                    // a positive opening
```

- The grip signals are engine state already tracked: `activeEnc()`, `gambitDraft`, `character._pendingIntent`,
  and `worldPressureDetail`/`encounterWeaveDetail` this turn (so an offer never stacks on the world already
  pushing — the two are complements: pressure *pushes* to fill dead air, an offer *enriches* a live lull).
- `worldActing` folds in SNG-080 pressure so the world never double-acts in one beat.
- Fails **closed**: no signals → no room. The truth table is nine tests.

## §3 — the `offer` op: attributable, countable, rare

- **ATTRIBUTABLE.** `offer: {thing, from}` — `from` is REQUIRED and the contract says why: *an offer with
  no source is a random-encounter table, not a living world*. Same invariant as latent arcs — nothing
  springs from nothing at contact. An offer missing `thing` or `from` is `rejected-shape`, never applied.
- **COUNTABLE (SNG-190 §3, applied unprompted).** `logOpOutcome("offer", applied|rejected-shape)` from
  day one — an unmeasurable behaviour is one we cannot tell is working, and we have been caught by exactly
  that. A fired offer resets `worldState.turnsSinceOffer` to 0; every other turn increments it, which is
  the cooldown `roomForAnOffer` reads. Recent offers ride a small ring buffer for the dev panel.
- In `SALVAGEABLE_OPS` + the contract + a `turn.offer` dispatch — the L5 op-wiring gate confirms all three.

## §2a — the material: fears, surfaced at last (§5 Q1 answered)

- **Q1: is `fears` in the turn prompt? No — only `wants` was.** `npcQuestSeedsForGM` surfaces wants;
  `fears` was read only by the generate path (`app.js:1807`), never the turn. `npcFearsForGM` (npcs.js) now
  surfaces present NPCs' fears — the single richest source for a **non-hostile** surprise (someone acting
  out of fear is sympathetic, not attacking). It is surfaced **only inside a room-gated offer**, so it
  costs prompt weight only when it can be used (SNG-179's scarce-weight lesson).
- Wants, stirring arcs (SNG-191), delegated work (SNG-191 §D) and the place are already their own blocks;
  the offer instruction tells the GM to *draw* from them — the initiative the wants block's "you MAY
  surface one when a bond deepens" wording lacked. This closes the §1 permission-not-initiative gap.

## The invariants (§3), each in the block or the gate

| invariant | where it lives |
|---|---|
| ATTRIBUTABLE | `offer.from` required; contract + test |
| RARE | `OFFER_COOLDOWN` + `turnsSinceOffer`; the model never sees it twice running |
| NON-BLOCKING | block: "enters BESIDE the player's action — their intent still resolves this turn" |
| NOT ALWAYS A COMPLICATION | block: "need NOT be trouble; a gift, a person who simply appears, a thing noticed" |
| COULD HAVE SEEN IT COMING | block: "the best version is a consequence of something they walked past" |
| DECLINABLE WITHOUT COST | block: "may be declined without cost" |

## Answers to §5

- **Q1 (fears in the prompt?):** No — added. See §2a above.
- **Q2 (rate-limiting — existing counter?):** No reusable one. `gambitApt` is model-self-limited, not
  engine-counted. Per SNG-195 §4a Erik struck the "one in five" counter anyway — **a rate limit lands the
  offer mid-duel.** Built the §4b scene-state gate instead; the cooldown (`turnsSinceOffer`) only prevents
  *twice-running*, it is not the trigger.
- **Q3 (distinct op so it can be counted?):** Yes — `offer`, counted from the first fire.

## Documents

- **`SYSTEM_SPEC.md` §13** — new *"The world OFFERS, not only responds"* subsection (engine-decides-room,
  attributable, non-blocking). Also fixed a drift I introduced in v1.8.171: `latentarcs.js` API line still
  listed the removed `markHandled` — now `setArcFate, seasonalPressure`.
- **`ENGINE_MAP.md`** — regenerated; `pacing.js` gains `roomForAnOffer`, `npcs.js` gains `npcFearsForGM`.
- **Count unchanged 59/32** — no engine module or rules file added (logic extends `pacing.js`/`npcs.js`).

## Verification

- **24 SNG-194 tests**, all green: the `roomForAnOffer` truth table (grip / cooldown / opening / fail-closed),
  `npcFearsForGM` presence + the wants-not-fears proof of why it was needed, the op's count/cooldown/attribution,
  and the block's invariant wording.
- Full suite **EXIT=0**: wiring audit all checks passed (incl. L5 op-wiring for `offer`), ENGINE_MAP ok,
  every ratchet flat (`rawProseCaps` 63 — the offer record uses `smartClamp`, not a raw slice;
  `importedNeverCalled` 5; `testOnlyExports` 7).

## Spec boundaries / notes (nothing improvised past)

- **The offer op is a NARRATIVE surfacing + a counter, not a persistence engine.** When the player engages
  an offered person/place/thread, the existing generate/npc/arc ops persist it. The `offer` op records the
  offer (thing + from) for observability and cooldown; it does not itself mint durable state. If you want an
  offered thread to *persist as a latent arc* even when the player ignores it, that is a clean follow-on
  (feed `from` into `seedArc`) — flagged, not built, because it changes the offer from a beat into a commitment.
- **`arrived`/`lull` are proxies** (`sceneTurns.length <= 1`, `quietTurns >= 1`). They are honest and
  engine-derived; a richer "a scene just closed" signal (tracking the previous turn's `sceneEnded`) would
  tighten the opening but is not needed for the behaviour to fire correctly.

*— CCode. The world stops waiting to be asked. Someone you turned down three scenes ago is at the door,
and the engine — not a die roll, not a hopeful clause in the prompt — decided this was the quiet moment
for them to knock.*
