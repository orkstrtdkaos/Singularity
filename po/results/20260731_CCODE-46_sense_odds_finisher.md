# CCODE-46 — the sense step is a real sense, moves are priced, and finisher is a tag

**CCode · 2026-07-31 · v1.8.312 (`6fae08bf`) · npm test exit 0 (all gates, rawProseCaps 63, 19 seams) · live-verified on never-used ports.**

Erik's four asks from the preview screenshot. All built.

## 1. The sense step only allows senses

*"During the sense action, you shouldn't be able to use clearly attacks during the sense round — it should only
allow skills that can sense, or an attribute based generic type sense."*

The SENSE step now lists only sense-capable crafts (`reveal` / `foresee` / `track`, from content) — **plus three
generic attribute senses**, because *"a wits sense could find a solution that a Reason based sense might miss"*:

| move | what it finds |
|---|---|
| **Size them up (Wits)** | the opening, the trick, the thing they are not guarding |
| **Reason it out (Reason)** | the pattern in how they fight, and where it breaks |
| **Read them (Insight)** | their intent and how much resolve is behind it |

You can always *look*, craft or no craft — and the attribute you look **with** changes what you find.

## 2. The read now pays — and the fogged math actually shows

*"I don't see it giving me the fogged math at all - even though I did a read step."*

**Root cause:** the fog gate was `sbLastRound?.opponent && st.round > 1`. But CCODE-45 made the sense step
deliberately **not advance the round** — so that gate **never opened**, and a read bought the player nothing they
could see. A fix in one place broke the visibility of another. The fog now reads a receipt **persisted on the
encounter state**, and a read buys the scouting tier.

And a read **always** returns something, per *"Even no success might give you some idea of what you COULD read if
you succeeded"*:

| degree | what you get |
|---|---|
| fail | names what you *would* have seen had it landed |
| partial | a glimpse of their tendency, not its shape |
| **success** | *"they favour strike. Pick a craft that answers it."* |
| **crit** | *"they lean on \<craft\>, and their guard opens when they commit. Counter that function and the exchange is yours."* |

## 3. Every move is priced — and the confidence is itself fogged

*"The skills should also bring in the players read of how likely each are to succeed… If the enemy uses umbracraft
then I might not be able to tell certain success chances as well - unless of course i have a radiant skill."*

Each move now shows an estimated chance to **win the exchange** — a real opposed calculation, not a solo success
roll. You win when your margin beats theirs, i.e. when `(theirRoll − yourRoll) > (theirStack − yourStack)`; both
rolls are d100, so the difference is triangular and the probability is **closed-form** (`pDiffExceeds`). Matchup and
standing effects are in it.

**The confidence is what the fog gates** — never the honesty:

| confidence | shown |
|---|---|
| 0 (unread) | *"you cannot price this yet"* |
| 1 | a band — *"likely"* |
| 2 | band + rough — *"likely (~70%)"* |
| 3 | the number — *"70%"* |

**Holding a craft that counters what they're doing buys confidence too** — light finds shadow, so a reveal-user can
price a concealer. At low confidence we show a **band, never a fabricated number**: the fog hides what you know, it
never lies about it.

## 4. Finish-it is a tag on the move, not a button

*"the finish It button should be an indicator on skills instead of a button. any harm skill, even the basic, could
eventually be tagged with finish it. Instakill skills have that from the beginning."*

A craft that **can kill** (harmRung `lethal`/`atrocity`) carries finishing potential from the start; an ordinary
harm craft **earns** it at tier 3 and shows **"⚡ at T3"** until then. The separate ⚡ Finish it button is gone.

## Live verification (never-used ports 8416 / 8417)
- Sense step lists **6 sense-only moves**, including all three attribute senses. No attacks.
- Odds before a read: **"you cannot price this yet"**. After: **"likely (~70%)"**.
- The crit read named the opponent's tendency *and* the counter.
- **"⚡ at T3"** renders on harm crafts that haven't earned finishing potential.
- No console errors.

## Files
- `engine/skill_battle.js` — `pDiffExceeds`, `estimateExchange`, `hasCounterCraft`, `finisherPotential`.
- `app.js` — sense-step filtering, generic attribute senses, `sbPriceMove`, `sbReadPayoff`, the persisted fog
  receipt, odds + finisher tags on every move; v1.8.312.
- `content/.../skill_battle_system.json` — `senseStep`, `oddsPreview`, `finisher`.
- `style.css` — `.sb-odds`, `.sb-fin`.

## Dials
`senseStep.senseFunctions` / `genericSenses` · `oddsPreview.confidenceByFogTier` / `counterCraftBonus` / `bands` ·
`finisher.finisherTierAt` / `alwaysAtHarmRung`.

## Still unbuilt
- **CCODE-42** — the finisher *odds*. The **tag** is done; the situational opposed odds Erik described (Cut the
  Thread ~50/50 vs a healthy peer, **near-certain vs a run-down foe when you hold momentum**, low with momentum
  against you) are not. The pricing machinery now exists, so this is a smaller job than it was.
- **CCODE-43** — items in combat (dagger vs axe, metal vs energy shield, throw a chemical, drink a potion).

*— CCode. A read is worth taking now: it costs you nothing but energy, it tells you something usable, and it turns
"you cannot price this yet" into a number you can bet on. status: complete_pending_review.*
