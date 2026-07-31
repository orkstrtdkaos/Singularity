# CCODE-43 + CCODE-47 — inventory becomes functional; waiting becomes visible

**CCode · 2026-07-31 · v1.8.314 (`9aff593f`) + v1.8.315 (`f81f4a5c`) · npm test exit 0 (19 seams, rawProseCaps 63) · live-verified on never-used ports.**

## CCODE-47 — you can see that you're waiting

*"locking in the sense choice didn't indicate we were waiting for the results.... might want to have it be obvious
somehow."*

A dashed banner with a spinner names what is in flight — **"Reading the aggressor…"**, **"Resolving the turn…"**,
**"Telling the turn…"** — and every control (moves, Proceed, Execute, Edit) is hard-disabled while a call is out,
so a second click can never double-resolve a turn.

### And a fast Haiku beat before the big one
*"you could have haiku do a short narration of the different skills each is using to describe the turn - and
indicate the narration is processing - then show the big narrative result."*

On Execute, a **Haiku** call (new `combat-quick-beat` task, 160 tokens) writes two sentences naming *only* the
clash of techniques — no outcome, no aftermath. It lands in about a second while the banner still says "Telling the
turn…", then the flagship narration replaces it.

It is a **grace, not a gate**: wrapped in try/catch, and a failure leaves the turn and the full narration untouched.

**Honest limit:** the quick beat needs an API key, so the next real fight is its first true exercise. What is
verified here is the code path and its failure path.

## CCODE-43 — inventory is functional

*"do I use my dagger, or my axe... my metal shield or my energy shield? Inventory becomes functional - throw a
chemical at them or drink a potion."*

Two doors, both reading fields items **already carry** (`bonusTags`, `effects`) — so no existing content needed
re-authoring.

### 1. Wielded — what you carry helps the moves it suits
An item's own tags map to battle functions:

| tag | helps |
|---|---|
| blade | strike |
| axe | break, strike |
| shield | shield, ward |
| armor | resist, shield |
| focus | reveal, foresee, empower |
| rope | bind |

Carrying the right thing adds a **named line** to the roll (*"wielding Iron Dagger + Bearded Axe"*), capped so a
full pack can never out-weigh a craft. **That is what makes dagger-vs-axe a real choice** — they suit different
verbs, and you can see which.

### 2. Used — a consumable is a move you spend a step on
Drink to restore, throw to harm. Item moves appear in **ACTION** and **BONUS** and are filtered out of **SENSE**
automatically (you cannot drink a potion as a read).

**Drinking is the honest answer to being spent** (CCODE-39): your crafts have gone quiet, but a flask has not.

A consumable gives **no passive wield bonus** — a flask you have not thrown is not helping you swing. It earns its
keep by being spent, which is the whole point.

## Two bugs the live walkthrough caught
1. **The acid flask was buffing strikes just by being carried** — its `thrown` tag maps to strike, and
   `wieldBonusFor` counted it. Consumables are now excluded from the wield bonus.
2. **A drink was uncapped** and could push energy past `maxEnergy`. Now clamped.

Neither would have shown in a unit test; both came from putting a real kit on a character and playing a turn.

## Live verification (never-used ports 8422 / 8423)
- The waiting banner was caught with a **MutationObserver** — the window is milliseconds without an API key, which
  is why a direct DOM sample first reported it missing (a false negative I nearly acted on).
  `{ waiting: true, label: "Reading the aggressor…", spinner: true }`.
- With a real kit (dagger + axe + shield + waterskin + acid flask): `wield@strike` = *"Iron Dagger + Bearded Axe"*
  (+8, capped) · `wield@shield` = *"Round Shield"* (+4) · `wield@reveal` = null.
- Item moves showed in the **action** step and **not** in sense.
- Drinking the Waterskin restored energy **and removed it from the pack**.
- No console errors.

## Files
- `engine/inventory.js` — `itemCombatFunctions`, `wieldBonusFor`, `usableCombatItems`.
- `engine/skill_battle.js` — the wielded line as its own contestMod.
- `engine/claude.js` — the `combat-quick-beat` Haiku task.
- `app.js` — the waiting banner + busy lock, the Haiku beat, item moves in the step list, item spending; v1.8.315.
- `content/.../skill_battle_system.json` — `engine.items` · `style.css` · `po/COMBAT_DIALS.md` (regenerated).

## Erik's list is now clear — 42 and 43 were the last two.

## Not done, worth a look
A **thrown item resolves as a plain tier-2 strike** — it does not yet carry item-specific harm (acid and a rock
should not land the same). That wants a `combat` block on item content, which is an authoring pass (Aevi), not code.

*— CCode. The pack is part of the fight now: what you carry shapes the moves it suits, and what you spend is a move
in its own right. status: complete_pending_review.*
