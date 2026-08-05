# BRIEF — what kind of world does each setting make? (SNG-305)

**For Erik. A REPORT — nothing here is gated, and no setting is named correct.**
Measured 2026-08-05 · v1.9.24 · `node tests/world_presets.mjs [sensitivity|presets|both] [worlds] [days]`

> *"what do worlds do now through a long sim? I would expect there to be different results in a distribution…
> so we probably want to sim and do some variation to come up with what settings to use for what kind of
> world behavior."*

Every cell below is **mean ±sd across worlds run at the same settings**. The last column is the direct answer
to your question: how far apart the arcs *end* across worlds with identical dials.

---

## Three findings first, because two of them are problems

### 1. ⚠️ THE TOP OF THE LADDER IS CROWDED IN THE LONG GAME
> **↳ FIXED in SNG-306 — see the addendum.** Challenges now apply pressure at the top and the authored rates
> land on Erik's 1/4-of-traditions target. Also note the figures below count everyone who EVER reached mythic,
> including the dead; *living* mythics with no challenge at all is 12.2, not 13.5.

Mythic was meant to be the rare rung. It is not, past about three world-years — and the curve is sharp:

| horizon | figures reaching mythic (of 66) |
|---|---|
| 1 world-year | 1.0 |
| 2 world-years | 1.8 |
| **4 world-years** | **13.5** |
| 8 world-years | 20.3 |

Aevi's own target when we swept the deed ladder was *"a mythic in SOME worlds and not others."* At 470 days
that held. At 1460 it is a fifth of the roster, and at 2920 it is nearly a third. **Nothing applies pressure
at the top** — deeds only accumulate, tenure never decays, and demotion needs a figure to stop caring
entirely. This is the clearest dial-shaped gap the sweep found, and it is not one I should pick a number for.

### 2. ⚠️ VIOLENCE IS THE POPULATION ENGINE — THE BLOODIEST WORLDS GROW FASTEST
> **↳ FIXED in SNG-306b — see the addendum.** The graveside mint is gone and the successor is sent by the
> dead figure's own people. The bloody valley now nets **zero** (16 dead, 16 sent) instead of +23.8.

| preset | dead | minted | net |
|---|---|---|---|
| a quiet valley | 3.0 | 4.2 | **+1.2** |
| as authored | 6.2 | 14.3 | +8.2 |
| a bloody valley | 15.8 | 39.7 | **+23.8** |
| a churning valley | 17.8 | 48.3 | **+30.5** |

Minting is deaths-driven (deliberately — it replaced the runaway vacancy-driven version), so **killing people
is how the valley makes people.** Every configuration grows; the ones that kill most grow most. That is
structurally backwards for a world where you might want scarcity to mean something, and it is worth deciding
whether inflow should have a second, non-lethal source.

### 3. ✓ WORLDS GENUINELY DIVERGE — AND THEN CONVERGE AGAIN

Divergence at the authored numbers is **8.4** against an average arc travel of **12.5** — the spread between
worlds is two-thirds the size of the motion itself. Worlds are not running the same script.

But it peaks and falls back: 4.3 → 5.4 → **6.3** → 5.5 across 1/2/4/8 world-years. **The valley finds an
attractor.** Past about four world-years the arcs saturate and worlds start resembling each other again.

---

## A. SENSITIVITY — which dials actually move a world

One dial at a time, everything else at the authored value. 6 worlds × 1460 days each.
**No decorative dials: all seven move something.**

```
    configuration                    dead        minted        rises       mythics     strikes    arc travel  divergence
    (authored baseline)               6.2 ±1.9     14.3 ±8.7    36.7 ±3.8    13.2 ±3.6    235 ±13   12.5 ±3.6      8.4

    casualtyRate = 0                  3.7 ±1.7      8.5 ±2.8    43.7 ±1.8    14.8 ±1.8    236 ±22   12.3 ±2.9      6.9
    casualtyRate = 0.4               10.3 ±2.6     29.7 ±4.1    34.8 ±4.2    14.0 ±2.4    230 ±18    9.7 ±4.1      7.5

    directEngagementRate = 0.15       4.0 ±0.8     12.8 ±4.8    36.5 ±3.9    14.7 ±2.2    248 ±11    9.6 ±3.5      6.4
    directEngagementRate = 0.7        8.2 ±2.5     20.8 ±3.1    40.7 ±4.2    18.5 ±4.8    217 ±22   11.7 ±4.1     10.2

    strikeRate = 0                    4.0 ±1.6     10.8 ±3.4    40.2 ±2.8    15.5 ±3.1      0 ±0    11.1 ±2.6      5.3
    strikeRate = 0.35                 9.0 ±2.4     25.7 ±1.2    31.5 ±3.7    10.7 ±4.5    660 ±61    7.6 ±4.2      6.9

    mintRate = 0                      5.0 ±1.7      0.0 ±0.0    35.8 ±3.6    10.7 ±2.6    243 ±21   16.4 ±1.9      4.4
    mintRate = 1                      4.2 ±1.1     28.7 ±6.8    41.2 ±4.8    16.3 ±2.2    236 ±6    10.6 ±5.0      8.5

    retrievalRate = 0                14.2 ±1.6     11.5 ±2.4    39.2 ±3.0    12.8 ±3.8    210 ±36   11.9 ±3.7      6.0
    retrievalRate = 0.6               4.0 ±1.8     15.0 ±4.0    41.5 ±4.8    15.2 ±4.4    241 ±16    8.5 ±2.6      6.3

    personalShare = 0                 6.2 ±1.1     18.2 ±4.1    44.3 ±4.7    17.5 ±6.2    233 ±17   13.3 ±2.4     10.4
    personalShare = 0.7               5.7 ±2.1     16.5 ±4.6    35.7 ±4.1    13.0 ±2.3    230 ±18    7.2 ±2.9      6.8

    holding perPass=0                 6.8 ±1.9     18.7 ±6.5    39.5 ±4.5    13.5 ±2.6    239 ±11    7.8 ±2.9      6.8
    holding deedRepeats=true          6.3 ±1.9     15.5 ±5.4    53.3 ±3.6    31.7 ±4.7    236 ±22    9.7 ±3.8      8.0
```

### What each dial is FOR, in world terms

- **`personalShare` is the divergence dial** (0 → 10.4, 0.7 → 6.8). Counterintuitively, people who spend all
  their time on the arcs make worlds *more* different from each other, not less: their attention is what the
  contests are made of. Turning it up makes a gentler, more predictable valley.
- **`directEngagementRate` is the second divergence dial** (0.15 → 6.4, 0.7 → 10.2) and the mythic dial
  (14.7 → 18.5). More fighting means more contested outcomes, which means more histories.
- **`strikeRate` is non-monotonic and this surprised me.** More striking makes worlds *stiller*: at 0.35 arcs
  travel 7.6 against the baseline's 12.5 and divergence *falls* to 6.9. Strikes kill the people who push, so
  a valley full of assassins is a valley where less happens. Turning it off entirely collapses divergence to
  5.3 — some back-line risk is what keeps worlds distinct.
- **`mintRate = 0` gives the most legible world**: divergence 4.4, arcs travel furthest (16.4). A fixed cast
  of 66 who all know each other. Every minted figure is noise as well as life.
- **`retrievalRate` is purely a death dial** (0 → 14.2 dead, 0.6 → 4.0) and barely touches anything else.
  It is the cleanest single control over how final the valley feels.
- **`holding.deedRepeats` is the ladder dial** — 13.2 → 31.7 mythics. See CCODE-151; the default is off.

---

## B. PRESETS — six candidate characters, run as populations

**⛔ These are characters, not recommendations.** They exist to show the dials compose into recognisably
different valleys. 6 worlds × 1460 days each.

```
    configuration                    dead        minted        rises       mythics     strikes    arc travel  divergence
    as authored                       6.2 ±1.9     14.3 ±8.7    36.7 ±3.8    13.2 ±3.6    235 ±13   12.5 ±3.6      8.4
    a quiet valley                    3.0 ±1.0      4.2 ±2.4    34.7 ±5.2    12.2 ±1.6     89 ±17   10.9 ±1.6      5.5
    a bloody valley                  15.8 ±2.5     39.7 ±5.1    33.5 ±2.4    15.0 ±4.3    503 ±16    8.9 ±4.4      8.6
    a valley of legends               4.7 ±1.7     19.0 ±5.8    54.3 ±2.2    33.5 ±3.8    246 ±13   15.4 ±5.2      9.4
    a stubborn valley                 5.0 ±1.3     10.7 ±1.9    35.0 ±6.1    13.2 ±3.7    238 ±24   12.6 ±2.6      6.4
    a churning valley                17.8 ±2.6     48.3 ±5.8    38.2 ±2.3    15.2 ±3.4    236 ±24    9.8 ±3.7      9.1
```

| preset | the dials | what it feels like |
|---|---|---|
| **a quiet valley** | casualty 0.05 · engage 0.2 · strike 0.04 · personal 0.6 | 3 dead in four years, 89 strikes, 489 duels. People have lives. **The most predictable valley** (divergence 5.5) — replayable but similar each time. |
| **a bloody valley** | casualty 0.35 · engage 0.6 · strike 0.3 · retrieval 0.15 | 15.8 dead, 13 killed from behind, 1085 duels, 503 strikes. The dead stay dead. Yet arcs travel *least* (8.9) — everyone is too busy dying to move anything. |
| **a valley of legends** | casualty 0.15 · engage 0.5 · `deedRepeats` · retrieval 0.5 | 54 rises, **33 mythics**, 1438 duels, arcs travel furthest (15.4), **most divergent (9.4)**. Half the roster ends legendary-or-above. Grand, and the ladder means little. |
| **a stubborn valley** | holding +20%/pass cap +100% · engage 0.25 · casualty 0.1 | Longest holds, fewest falls, **divergence 6.4** — the constant hold their fronts and the map settles. Positions calcify. |
| **a churning valley** | mint 1.0 · casualty 0.3 · retrieval 0.05 · vacancy 4 | 17.8 dead, 48.3 minted, **+30.5 net**. A valley of newcomers where nobody you met stays important. |

---

## What I would ask you to decide

1. **The mythic ceiling.** A fifth of the roster reaches the top rung by year four and it keeps climbing.
   Options are a decay on tenure deeds, a hard cap on the rung, or accepting that mythic means "old" rather
   than "rare." I did not pick one — it changes what the whole ladder is for.
2. **Whether inflow should be non-lethal.** Right now the only way the valley makes people is by killing
   them, so a peaceful world slowly runs out of newcomers (+1.2 net) while a bloodbath booms (+30.5).
3. **A default preset, or none.** The authored numbers sit close to the middle on every axis, which is a
   defensible default. If you want a *starting character* for the valley, "a quiet valley" and "a stubborn
   valley" are the two that read as places rather than as engines.

## Caveats, stated rather than buried

- **The NPC evolver is stubbed.** These runs use a deterministic stub, not the model — so the *mechanics* are
  measured honestly and the *colour* is absent. Nothing here depends on what the model would have said.
- **No player.** Party-0 worlds. `tests/player_impact.mjs` is the report for what a party changes; the
  headline there is that contests, not stages, are what a player adds.
- **6 worlds per configuration.** Enough to see a distribution, not enough to split hairs between two rows
  that differ by less than their own ±sd. Several pairs above are inside the noise; the ones I have called
  findings are the ones that are not.
- **`deedRepeats` is off by default** (CCODE-151). The `holding deedRepeats=true` row is what it costs.

---

# ADDENDUM — SNG-306: the ceiling, and where people come from (2026-08-05, v1.9.26)

Erik, on reading the above:

> *"Striking isn't just about the back line — between arc pushes there are ever present assassination risks,
> duel to the death challenges etc. We can use these to keep the Mythicals under control. We should set a
> target population and tune toward it, maybe 1/4 the traditions should have a mythical in play at any given
> time. And we should do something about the killing fields being the population producers… they don't COME
> from the field they died in, they come from the home places and they will go back there when they can… so
> is this how it works?"*

## Answering the question first: no, and it is more absent than that

**The world simulation has no geography at all.**

| | |
|---|---|
| `mintFigure` takes a `region` parameter | **all three call sites omit it** — every minted figure came from nowhere |
| `homeLocation` is an authored roster field | **5 of 66** figures carry one, and **1 of 6** distinct values resolves to a real location |
| `worldtick.js` reads `homeLocation` | **never.** `legends.js` and `worldmap.js` do; the offscreen sim does not |

So there was no "going back" because there was nowhere to go back to and nothing that could carry them. The
`region` parameter is a reader with no writer — the fourth door of the PromisedButUnread family — and it has
been sitting in the mint signature the whole time looking like a feature.

## 1. The ceiling — built, and it lands on your target

Prominent figures are now called out between the arc pushes. It resolves through the same injury model as
everything else, so a challenge can kill and `deathCooldownDays` still keeps deaths landmarks.

⛔ **Prominence, not merit.** The rate is keyed to the RUNG and nothing else — a mythic of the Maw and a
mythic who has mended the same wall for forty years are called out identically, because what draws a
challenger is being worth beating. There is a gate that rate-tests a saint against a horror.

Your target is “1/4 the traditions”. **The roster has 27 traditions, not 24** (the ring's poles plus the folk
crossings), so the target is 6.8:

```
    challenge rate       living mythics   traditions with one   challenges   died   all dead
    0× (before)              12.2 ±2.7          10.8/27              0        0.0      5.8
    0.5×                      7.8 ±1.7           7.7/27             50        1.8      7.3   ← on target
    1× authored               7.7 ±2.0           7.3/27             61        3.3      5.5   ← on target
    2×                        7.8 ±4.3           7.0/27             60        3.3      8.0   ← on target
    4×                        5.7 ±1.5           5.3/27             78        3.5      5.3
    8×                        5.3 ±3.7           4.8/27             82        4.3      6.8
```

**The authored rates already sit on the target** (7.3 against 6.8) and the curve is gentle either side, which
is what you want from a dial nobody should have to be precise with. Note the plateau from 0.5× to 2×: past a
point, more challenging does not thin the top much further — it just kills more people on the way.

⚠️ **And a correction to my own number above.** The “13.5 mythics” in the main brief counted figures who had
EVER reached mythic, including the dead. Your phrasing — *in play* — is the better metric and I should have
used it from the start: living mythics with no challenge at all is **12.2**, not 13.5. The crowding was real;
my number was measuring the wrong thing by a little.

## 2. Where people come from — the coupling is broken

Two mints fired per death and both at the graveside. One of them, `casualty_survivor` (*“stood beside them and
walked away from it”*), was **literally the killing field producing a person**. It is gone. The successor is
real, but they are not born of the battle — they are **sent by the dead figure's own people**.

| preset | before (dead / minted / net) | after (dead / minted / net) |
|---|---|---|
| a quiet valley | 3.0 / 4.2 / **+1.2** | 3.3 / 5.2 / **+1.9** |
| as authored | 6.2 / 14.3 / **+8.2** | 5.5 / 10.5 / **+5.0** |
| a bloody valley | 15.8 / 39.7 / **+23.8** | 16.0 / 16.0 / **0.0** |
| a churning valley | 17.8 / 48.3 / **+30.5** | 15.7 / 20.8 / **+5.1** |

~~**The bloody valley now nets exactly zero** — 16 die, 16 are sent. Violence replaces losses instead of~~

⚠️ **SUPERSEDED — I MISREAD THE ASK. See §4 below.** Erik: *"I didn't mean that no one is minted in the
battle as a new NPC or role — they should be. I meant that the successors have home lands; it's just that the
MOMENT mints them in the game."* Both mints are restored; the fix was never to delete one.

producing a surplus. That was the inversion you spotted, and it is gone.

⚠️ **Side effect, stated rather than buried:** fewer minted figures means fewer actors, and divergence fell
from 8.4 to 6.1 at the authored numbers. The valley became more predictable as well as more sensible. If you
want the spread back, `personalShare` and `directEngagementRate` are the two dials that buy it (see §A).

## 3. ⛔ What I did NOT build, and why

**“They come from the home places, and they go back there when they can” is half-built, deliberately.**

I used **tradition as a stand-in for home** — it is on 66 of 66 figures, and a tradition IS a people with
places in the fiction. `homeLocation` is the *right* key and it is authored on 5 of 66, so keying on it today
would give 61 figures successors from nowhere. When homes are authored this becomes a finer grain, not a
rewrite.

**The going-back half is not built at all.** Figures have no location in the world sim, so there is no
movement to model yet. That is the real ask hiding inside your question, and it is a bigger piece than a
dial: it means the offscreen world gets a map. Worth doing — it would make “the Redline sent three and got
one back” a thing the world can actually say — but it is a build, not a tune, and it needs the content first.

**For Aevi:** the precise ask is `homeLocation` on the 61 roster figures that lack it, resolving to one of the
96 authored locations. Everything above is waiting on that one field.

---

## 4. CORRECTION — the moment mints them; it is not where they came from (v1.9.27)

> *"I didn't mean that no one is minted in the battle as a new NPC or role — they should be. I meant that the
> successors have home lands… it's just that the MOMENT mints them in the game."*

**I collapsed two different things.** Reading *"they don't come from the field they died in"* as *"delete the
battlefield mint"*, I cut `casualty_survivor` outright. That was wrong, and the distinction Erik is drawing
is the important part of the whole model:

> **Minting is when somebody ENTERS THE STORY. It is not when they come into existence.**

Everyone the world mints was already alive, living an ordinary life in the place they are from. A death is
the MOMENT that makes them matter — the one who stood beside it and walked away is now somebody the valley
has a name for, and the one who takes the empty chair was sent for. Both are real births-into-the-story.
What was wrong was never the second mint. It was that **neither of them came from anywhere.**

Both mints are restored, and both now carry a `homeland` — the figure's authored `homeLocation` if they have
one, else their people. The origin lines say it: *“of the ashwarden; stood beside Sister Alder and walked away
from it”*, *“sent by the redline to take up what Halvex Coil left unfinished”*.

### ⚠️ And asserting a POSITIVE found two real bugs an absence-check never could

The replacement gate is *“every figure the world mints from a death has a homeland”*. It failed immediately:

1. **`casualties[].loser` is an ID, not a name.** I wrote `c.loserId ?? null` — reading a field that does not
   exist — so **every battlefield death resolved to no origin** and its heirs came from nowhere. Strike and
   challenge deaths were fine, which is why the sim looked healthy.
2. **The same slip had been printing raw ids into epithets since the mint was written** — *“the one who
   outlived sister_alder”* rather than *“Sister Alder”*. Nobody had looked at a minted figure's epithet
   closely enough to notice.

My original gate (“nobody is born of the killing field”) not only asserted the opposite of the requirement,
it was also the kind of check that can only ever pass. **A gate that asserts an absence is satisfied by a
world where nothing happens at all.**

### The population question, separated from the origin question

Restoring the second mint restores the growth — as it should, since that was never the defect:

```
    configuration          dead        minted       arc travel  divergence
    (authored baseline)     6.3 ±2.1    17.7 ±4.4     17.3 ±3.4      8.0     ← net +11.4
    mintRate = 0            6.0 ±1.9     0.0 ±0.0     16.3 ±2.0      3.3     ← net  -6.0, a closed cast
    mintRate = 1            6.7 ±1.1    39.0 ±5.5      7.7 ±4.6      8.9     ← net +32.3, a crowd
```

**`mintRate` is the dial for how many, and it is now independent of where they are from.** Conflating the
two is exactly what produced my over-correction. Note the side effect at each end: a closed cast (mintRate 0)
collapses divergence to 3.3 — the same six worlds every time — while a crowd at mintRate 1 chokes the arcs
(travel falls to 7.7) because attention is spread across too many people to move anything.

The authored 0.5 sits between them, and the valley grows by about 11 figures per four world-years. Whether
that is the right number is yours; nothing about the origin model depends on it.

### ⛔ Still not built: going home

`homeland` is now RECORDED on every minted figure, but nothing moves anyone. *“They will go back there when
they can”* still needs the offscreen world to have a map, and it still waits on `homeLocation` being authored
on more than 5 of 66 roster figures — today a minted figure's homeland is usually their people rather than a
place, because their people is all the content knows.
