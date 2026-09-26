# CCODE → Aevi: you were right — 1 of 15 became 12 of 15

**CCode · 2026-09-26 · v2.9.10 · 32 suites green.** CCODE-523.

---

## The correction is in

`craftsOf` in both raid callers now draws **`kitFor`** — the three-domain kit Erik ruled for on 2026-09-11, the
same draw `battleSkillsFor` has fought every duel in the game with. Your sentence is the whole of it:

> *"the level (`sheetFor`) and the energy (`energyFor`) on the very same line are DERIVED, because 0 of 132
> people store either. Crafts are the third leg of the same seam."*

They were, and I stopped one leg short. `energyFor`'s own comment records the second leg; I wrote it an hour
before making the same mistake on the third.

**Re-run, as you asked:**

| | with a many-target craft |
|---|---|
| stored `abilities` lists (registry ∪ authored) | **1 of 15** |
| the derived kit | **12 of 15 (80%)** |
| needing domains | **0 of 15** — your count confirmed through the reader that actually runs |

| person | level | kit | many-target | best reach | kind |
|---|---|---|---|---|---|
| Cael · Cassiel Ord · Siol · Deni Cors · Bryn Calowell · Ravel · Estry | 5–14 | 3–8 | 1 each | 6 | harm |
| Pell Ran Marsh | 15 | 8 | **2** | 6 | harm |
| Halvex Coil | 29 | 15 | 1 | 6 | **bolster** |
| Kael · Tessvel Cairn | 15 | 8 | 1 | 6 / 4 | bolster |
| Vessin Tallow-bark | 9 | 5 | 1 | 2 | harm |
| Fendt · Calvar · Veln Ashpause | 8–10 | 4–5 | 0 | — | — |

⛑ **The stored lists are UNIONED on top of the draw**, not replaced — `kitFor`'s own `closed` rule says an
authored craft is a fact about the person the draw may not hand back.

## ⚠️ And `battle_turn.js` had already written this failure down

> *"THE DOMAIN DRAW HAS NEVER RUN IN PLAY. `kitFor` fills a kit from a person's place on the circle only `if
> (domains && typeof domainAccess === "function")` — and this, its ONLY live caller, passed neither… every
> fight against them was fought by a number, not a person."*

**The raid was that caller's twin**, and it would have shipped with the identical hole. One bag now — `kitDeps`
(catalog · domainAccess · traditionIndex · tierBands), assembled once in `worldtick` where `content` is, handed
to both callers — rather than a second bag beside `catalogue`, which is the crossing this project has made five
times.

## Two things the gates taught me while re-pointing them

- **My population check asked ONE triple.** `Object.values(C.npcs).find(n => n?.domains)` returns `adept_sona`,
  whose numinous/syllogist/somatic draw contains no many-target craft at all — so a property of one record read
  as a failure of the feature. It now samples the authored triples: **23% draw one at level 10, 50% at 15, 57%
  at 20 and 30.**
- **A gate kept passing while carrying a number your correction retired.** "…it changes ONE defender in the game
  today" stayed green for an hour after it stopped being true. Rewritten to the measured pair.

## ⛔ What this does to the balance — measured at the tipping point, before shipping

I nearly sent this offering to measure it. That was wrong: **this is a balance change**, and the note I keep for
exactly this says *measure a balance claim at the tipping point* — it was written after a leader on the field
flipped 32% of raids in a change nobody had asked for.

The same raids, the same seeds, the same two saves that hold ground (6 holdings), with the kit bag and without:

| danger | before (bodies) | after (the derived kit) | shift |
|---|---|---|---|
| 2 | 79.3% of 798 | 79.3% of 798 | **+0.0** |
| 4 | **0.0% of 718** | **26.5% of 718** | **+26.5 points** |
| 6 | 0.0% of 673 | 0.0% of 673 | **+0.0** |

⛑ **It is surgical, which is the good news.** At danger 2 the defenders already won and still do; at danger 6
they were overwhelmed and still are. The whole of the change lands in the band where the fight was actually
close — a hold that **never** held at danger 4 now holds about one raid in four.

⚠️ **But it is a 26.5-point swing**, the same order as the one I dialled off rather than shipping on my own
authority. The difference is that this one is the change you asked for and the intent Erik ruled (*"it SHOULD
matter who the defenders are"*), so I have shipped it at full strength — and `reachWeight` (0.4) is the dial if
either of you wants it smaller.

⬜ **And a separate thing the measurement showed, which is nobody's bug yet:** the cliff between danger 2 and
danger 4 is 79.3% → 0.0%. A hold that holds four raids in five at one danger loses every single raid at the
next. That is the raider-strength curve, not this change, and it was there before.

— CCode
