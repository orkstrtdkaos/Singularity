# CCODE-493 — Erik's fight-panel feedback, batch 3: what was wrong, and the three things that are yours

**2026-09-25 · v2.6.3 · pushed · 31 suites green**

Erik stopped playing with *"I'm going to stop here because there is so much wrong."* He was right,
and two of them were not wording.

---

## ⛔ 1 · The round you won was reported as a draw — and sometimes as a loss

> *"after i executed the move it says the blows meet and both scatter... my roll was a crit success
> while theirs was a crit failure... I should have destroyed them."*

He had destroyed them. He had **driven them back** — the most decisive thing a round can do.

Filling the momentum meter banks a pressure tick against the losing side and then **resets the meter
to ±35%**, so they are still in the fight (CCODE-38, and right). The receipt worked out who won the
round by comparing the meter before and after — and the reset had already put it back. So:

| the meter | what the receipt said | what happened |
|---|---|---|
| 3.5 → (10) → 3.5 | *neither gains — it's even* | you drove them back |
| 9.0 → (10) → 3.5 | **they take the exchange** | you drove them back |

The second row is the bad one. On a round the player won outright, the line credited it to the opponent.

**Measured: 903 of 2,410 simulated rounds are break rounds.** This was not an edge case — it was
better than a third of every fight, and the GM narrates from the same verdict (`sbFightBeat` shared
the function), so the telling inherited it.

⚠️ **It is the 2026-08-01 bug wearing the other mask.** That one pinned the swing to zero by feeding
`after` in as `before`. This one pins it to zero by moving `after` back. And `contest_sim` — the file
that exists *because of* that bug — could not see it: its guard only calls a round decisive when
`|after − before| > 0.5`, and a break is exactly the round where that is false. **A gate that asks its
question in the terms of the bug is a gate the bug walks through.** There is now a gate that asks it in
the other terms: the engine banked a tick against a named side, therefore somebody won.

Fixed. The line now reads:

> ⚔ You shatter with Sonic Resonance · they feint — your blow is turned aside · **you take the
> exchange** · momentum 0 → FULL, then back to 4 · **⚡ you drive them back — 1 of 10 before they break**

---

## ⛔ 2 · "driven back ◆◆ 2/2" — on a fight that needed 10

> *"shows 2 pips AND 0/2 for driven back... is this a fight or a pushing contest?"*

Worse than redundant: **the 2 was wrong.** R34b (Erik's own ruling, 2026-09-04) made the break
threshold `ceil(level × 0.5)`, capped at `breakAtMax` and eased by `breakEasesEvery`. Against
Kestrin at level 20 the engine wants **10**. Three UI sites still read the flat `breakAtPressure`,
whose own comment in the content calls it *"the flat fallback for a sheet with no level"*.

So the header told him the fight was over and the fight carried on. `breakThresholdFor` is exported
now and is the only place that knows it. The pips are gone with it — with a real threshold of 10 a
pip row is a wall of diamonds nobody counts. One number, in words: **driven back 1 of 9**.

⬜ The number falls as the fight runs long — that is the ease Erik asked for on 2026-09-11 ("I want
breaking to be the outcome that increases likelihood after a long fight"), and the tooltip now says so,
because otherwise 10 becoming 9 looks like a wobble.

---

## The rest of the batch

| what he said | what it was | state |
|---|---|---|
| *"my 'blow' was turned aside... i did no blow"* | the clause was picked on ONE bit — defensive or not — and a read is neither, so it was filed as an attack and got an attack's words. The same sentence had already said "You read with Prism Sight". | ✅ sensing verbs have their own clauses in fight / standoff / chase |
| *"'gathering to reveal (a crushing move)'... makes absolutely no sense"* | a tense splice. Everything in the fog comes from **last round's** receipt; the markup wrapped it in "gathering to", which is the future. | ✅ split and labelled — `last round …` / `next …` |
| *"'see their math' is generic... should show what their NEXT move is and what's affecting it, perhaps suggesting a counter"* | it showed last round's roll. | ✅ `opponentPolicy` is documented deterministic, so their next move is knowable without inventing anything. Shown only from the action step on, where the state it reads **is** the state the fight will hand the same function — before that it would be a guess. With why, and which of your crafts costs them most. |
| *"It's THEIR roll and it's saying ← 'your base'???"* | one renderer served both rolls and had no notion of which. | ✅ it takes a side and a name |
| *"What does it mean for the roll to 'Land'? use Succeeds or Fails"* | my word. | ✅ |
| *"the card's % is a different question... different from WHAT"* | my SNG-589 fix named the contrast and neither side of it. | ✅ both named by the question each answers |
| *"no way to hit enter on a custom action"* | the fight grew its own text box and did not inherit the one behaviour every text box has. | ✅ |
| *"remove the Rich button"* | | ✅ gone from the input row; ✦ Tell it again, richer and the Settings default both stay |
| *"the finisher note... if it doesn't point to something the pc can do, remove it"* | it announced a category; finishing is a property of a specific craft. | ✅ it names the crafts, or renders nothing |
| *"I don't need my own HP and Energy in the fight window"* | it was in **three** places at once. | ✅ — see §142 below |
| *"at level 20 I should have a whole suite of skills... I have no ability to attack"* | my scenario's fault. | ✅ — see below |
| momentum milestones | | ⬜ — see §3 below, it is yours |

---

## ⬜ THREE THINGS THAT ARE NOT MINE

### 1 · Erik — a full momentum bar does not drive them back, and you thought it should

> *"if your momentum bar is full is when it would make sense to drive them back, if you take the
> exchange again... not sure how this currently works."*

It **is** how it works — that is the one landmark on the bar, and I have made it say so. But the rest
of your instinct does not match the build, so here it is plainly:

- Momentum is a **linear roll modifier**: `perPoint 0.5`, no milestones anywhere. At 73% it is worth
  about **+3.6** to your rolls. The bar now prints that number live.
- **Drawing rungs on it would be drawing a rule that does not exist.** If you want milestones — a step
  at half, a bigger step at three-quarters — that is a real design change and it is your call.
- ⚠️ **A dead dial fell out of this:** `asModifier.max` is **8**, and `meterMax × perPoint` is
  `10 × 0.5 = 5`. **The cap has never once bound.** Reported rather than quietly retuned — the numbers
  are yours.

### 2 · Aevi — `fight.winCondition: "Overcome it"`

Erik: *"'Overcome it' (which is wrong grammar)"*. Two things were happening:

- It rendered as a bare bolded phrase between the round header and the opponent's name, so it parsed
  as a **title**. ✅ Mine — it has a `TO WIN` label now and reads as the slot it is.
- **"it" for a named person.** *Overcome it* → Kestrin of the Riven Marches. That is your copy in
  `encounter_frame_kinds.json` and I have not touched it. A kind-level phrase has to work for a person,
  a beast and a sealed door; the other kinds may have the same problem.

### 3 · Aevi — SPEC §142's zone-1 row

§142 lists zone 1 as *"their name · their condition · the pressure counter · **your hp/energy**"*.
Erik struck the last one in play. I have followed his word and moved the gate with it; **the spec row
wants correcting** rather than the two of them quietly disagreeing.

---

## The dev scenarios, and a finding inside them

Erik was **stuck** — a level-20 character who could read and could not hit. My scenario lifted his
level for the command slots and never touched his kit. But the way he got stuck is worth keeping:

⛑ **R47 retires the universal "A plain strike" / "Raise a guard" fallbacks for anyone whose own crafts
carry a free floor** ("he should just rely on the zero-cost fallbacks of his T1 skills as we designed").
The dev hero's two crafts do carry one, and **neither of them harms**. So the floor was withdrawn and
nothing replaced it. The ruling is right; the dev hero was simply never a character it was written for.
⬜ *Worth asking whether a live character can reach the same corner.*

The scenarios now learn a spread through `learnAbility` — every gate still running. ⚠️ **Measured
live:** the first version got *"wrong tradition"* from every harming craft, so it now records a
**willing teacher** (Erik, 2026-09-13: *"If Orrin is a teacher who is willing, that qualifies a player
to learn the craft"*) — the same durable record the GM's `markTeacher` op writes — and **says so in the
alert**, so nobody mistakes that sheet for one that earned its teachers in play.

---

## Gates

Four went green over these defects because **they pinned markup where they meant to pin a rule** —
one of them pinned `breakAtPressure ?? 2`, an expression the rules had moved past, and so was actively
arguing for the bug. Each re-asked in the terms of the thing it was defending, plus new ones for a break
round, for R34b itself, and for the popover knowing whose roll it is.

## Still open from the last batch

- `applyTurn`'s `bandOps` step is unreachable from a synthesised turn — a probe in the applier's own
  step never fired, with no early return between them.
- `firetests.js` fires `op:"form"`, which the applier does not handle.
- Zero of the 23 authored encounters carry `theatres`, so the legion tier cannot be reached in play.
- Aevi: SNG-652 §10's questions for me are noted and next.
