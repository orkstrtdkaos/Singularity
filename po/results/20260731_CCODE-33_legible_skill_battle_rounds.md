# CCODE-33 (Erik playtest) — legible skill-battle rounds: per-round receipt + machine-tab log + fight takeover

**CCode · 2026-07-31 · v1.8.297 (`1c04dab5`) · npm test exit 0 (all gates green, rawProseCaps 63).**

Erik, live-testing the skill battle: *"I clicked deceiving skills that should have allowed the aggressor to act
while keeping me safe. But I didn't see any description of that action, nor resolution of it… no rolls, no opposed
rolls or descriptions. Then the encounter ended inexplicably with me on my back and out of the fight — frustrating."*
Plus: narration should describe **both** sides' actions; the engage button said "stand and meet it" while **he** was
attacking; the normal options shouldn't sit under the fight controls; the whole window should read as a fight.

Root cause: `sbDeclare` (the skill-battle round resolver) is **API-free by design** — it moves momentum, applies
attrition, and re-renders, but it rendered **nothing per round** and gave **no reason on ending**. The Fix-D receipt
line only lived in the classic `onChoice` path, never the skill-battle path. So a round was invisible: click a
skill → the panel silently re-renders → eventually the fight ends with only an aftermath. Six fixes.

## The fixes

1. **Per-round receipt** (`sbRoundReceipt`). Each round now shows **your move + theirs + the interaction + who took
   the exchange + the momentum swing + energy** — engine-generated, no per-round GM call. Renders in the panel as
   `.sb-receipt` (red left-border). Examples verified live:
   - `⚔ You strike with A plain strike · they strike — the blows meet and both scatter · they take the exchange · momentum 0→-16 · you -5e`
   - `👁 You read them — they strike. You give nothing away. Momentum 0→7 · you -3e`
   The interaction clause reads the two functions: defensive-vs-attack → "you turn it aside"; attack-vs-attack →
   "the blows meet and both scatter"; etc. This is Erik's *"describe the results of my and the opponents actions —
   sometimes they cancel each other."*

2. **Ending reason** (`sbEnd`). The deciding exchange's receipt + the outcome line now render as a **persistent
   aside** AND are fed into the GM aftermath prompt ("The deciding exchange, mechanically: … Narrate how that final
   exchange landed"). So the fight never "ends inexplicably" — even with **no API key** the mechanical WHY is on
   screen. `sbLastRoundReceipt` is cleared on end so it can't leak into the next fight.

3. **Machine-tab combat log** — Erik's own idea (*"some output specifically going to the machine tab… I could click
   there and gather it for you"*). Every round's **full telemetry** — both rolls (chance/rolled/margin/matchup),
   the momentum swing + winner, hp/energy deltas, energy remaining, and the outcome — is mirrored to
   **🔬 Machine → ⚔ Combat rounds**, with a one-click **Copy combat log**. New `devcapture` ring
   (`recordCombatRound` / `combatRounds`), inert unless armed (dev-only), parallel to the model-call ring. Paste it
   back and I can see exactly why any fight went the way it did.

4. **Fight takeover.** The whole play surface carries the fight's red outline (`.play-in-fight`) and the GM's
   **normal story-choices are suppressed** during a skill battle — the fight IS the option set. **Ask GM** + the
   free-type field stay (Erik: *"keep the ask the GM"*).

5. **Contextual engage label.** `buildOffer`'s flat defensive *"Stand and meet it"* is now active and foe-named —
   **"⚔ Meet {foe} — take the fight"** — and swings to **"⚔ Press the attack on {foe}"** when the player is the
   aggressor (`opts.aggressor`, threaded through `fireEncounter`). Erik: *"I'm the one moving forward to attack — the
   button text should be contextual."*

6. **Dev surface** (Erik: *"put other options you're working on here for me to try live"*). A **"⚔ attack (you start
   it)"** test button fires an aggressor fight; the dev-panel hint now points at the machine-tab combat log.

## Live verification (fresh port 8361, pure-engine rounds — no API)
- **Engage labels:** aggressor button → `⚔ Press the attack on the aggressor`; world-offer → `⚔ Meet the aggressor — take the fight`. Both confirmed.
- **Takeover:** on engage, `.play` becomes `play play-in-fight` (red outline), `.sb-panel` renders in place with 8 grouped skills, **normal `.choices` = 0** (suppressed), **Ask GM present**.
- **Per-round receipt:** after a scout round the panel shows `.sb-receipt` with the read-them line and a `3px rgb(192,91,77)` left border, fight continues (round 2, momentum 6.5). After a strike, the strike-variant receipt.
- **Ending reason:** a one-round crush rendered the full deciding-exchange aside (`momentum 0→-16 · they take the exchange`) — no more inexplicable end.
- **Machine log:** `⚔ Combat rounds` block present, round card `round 1 — strike vs the aggressor · momentum 0→-16 (-16) · ENDED player_overcome · 10:16:57`, full JSON telemetry (you roll 64/margin 31, them roll 27/margin 68), Copy button present.
- **No console errors** across the whole flow (boot → fight → machine tab).

## Files
- `app.js` — `sbRoundReceipt` + `sbLogRound` + `sbLastRoundReceipt`; `sbDeclare` captures before-momentum, sets the
  receipt, logs the round; `sbEnd` surfaces the deciding exchange (aside + GM prompt); the machine-tab combat block
  + Copy handler; the renderPlay choice-suppression guard + `play-in-fight` class; the dev aggressor test button; v1.8.297.
- `engine/devcapture.js` — the combat-round ring (`recordCombatRound` / `combatRounds`), cleared with captures.
- `engine/random_encounters.js` — `buildOffer` active/foe-named + aggressor engage label (`opts.aggressor`).
- `style.css` — `.sb-receipt`, `.play-in-fight`.

## Flagged (not in this ship)
- **Persistent effects** (Erik: *"raising a shield gives a defense bonus; a sense/insight gives bonuses"*) — a
  per-fight buff state-machine is a design + build follow-on. The receipt now names moves, but effects don't yet persist across rounds.
- **Per-round GM prose** — the receipt is engine-generated (fast, API-free). Rich prose per round would need a GM
  call per round (slow/expensive); the aftermath prose already reflects the deciding exchange.
- **BRAIDS in combat** — still the big one (declaring a combined craft in one turn). Turn-by-turn is its foundation.
- **Momentum/crush dials** — a single big roll-margin gap still *crushes* in one round (surgeCrushEndsIt 16); the
  one-round losses in testing were legit RNG (opponent rolled 27 vs the player's 64). Whether crush should fire that
  readily is a dials call for Erik/Aevi — now at least the crush is fully explained on screen.

*— CCode. A fight round tells you what happened now: your move, their move, how they met, and where the meter went —
and if it ends, why. status: complete_pending_review.*
