<!-- status: CCode → Aevi & Erik. B2 SHIPPED (CCODE-563, v2.15.3) — SNG-663 §2c: holding one of the Lattice's arches is an ACT, with stigma and an escalating keeper, and both stop when you let go. Aevi's four keepers applied. ⛑ HER "never derived from `holds`" RULE IS THE WHOLE BUILD, and the measurement says why: a derived rule would have woken SEVEN holders on day one, two of them exempt. ⬜ Two things left for her/Erik: the peoples half of the stigma, and whether a power's verbs can take a gate -->
# CCode → Aevi & Erik, 2026-09-28. The keepers

**B2 is shipped** — CCODE-563, **v2.15.3**, 32 of 32 suites green, **4,170 checks** (§391 is 11 of them).

Your four keepers are content, `engine/gatehold.js` is the reader, and the whole thing is silent until somebody acts.

## ⛔ Aevi — your "never derived from `holds`" rule was the entire build, and the numbers say why

I measured before writing a line. **Five powers'** `holds` still names a place carrying an arch — the Echo Bridge, the
Ender's Host, Pressureholt, the Long Choir, the Deepwood Moot, exactly the five you named as gates in the wild (§2b
moved the other four's out into yards, so holding those towns is not holding a gate any more).

And **two players keep a holding at `gen-the-made-gate` — both with a garrison posted** (Silas's, and Loki's Standing
Annex). So a rule derived from *holds* or from *a garrison standing there* would have woken keepers on **seven holders
on day one**, two of them the very case §2c.3 exempts.

Derived from the act, it wakes nobody. §391's first check drives the pass over every frozen save and asserts zero news,
zero stigma, zero keepers — and asserts it actually looked at somebody, so it can't pass over an empty list.

## ⛑ And the exemption is the corpus itself, not a flag anyone has to remember

> *"The Made Gate is the exception. It was permitted."*

The Lattice's gates are the **authored** ones. Measured: **exactly 26** — your own number, which was a good moment. A
gate that exists because somebody built one in play is `_gen` and is nobody's inheritance to resent. So the test needs
no new field and can't be forgotten on the next made gate. Taking one says so in the fiction's terms rather than
refusing with a shrug:

> *The Made Gate was made, not inherited — it was permitted, and holding it costs you nothing.*

## What it does, driven end to end

| day | rung | what happens |
|---|---|---|
| 100 | signs | *The arch opened twice on nothing, and a lattice line hummed under the ground all night.* |
| 136 | **notable** | an arch-warden · stigma drifts a step with everyone |
| 172 | **heroic** | the threshold choir |
| 208 | **epic** | a lattice-hound |
| 244 | **legendary** | the Keeper of the Arch |
| — | — | **let it go → 0 keepers, 0 news, forever** |

A season is **36 days**, derived from the world's own 144-day year and its band's four seasons — not chosen. The stigma
lands the moment you take it (every power that has heard of you) and drifts a step each season after.

⚑ One call I made that is worth your eye: **the drift stops once a power already stands in the worst band.** A step a
season forever runs past every band the game has (`hated`'s own floor is −999, which is a way of writing "no floor").
Stopping at the bottom uses your own band vocabulary rather than a number I picked, so retuning the bands moves it.

⛔ And the stigma is **not refunded** on release. What people thought of you for doing it is a thing that happened.

## ⬜ Two things I did not build, and why

**1 · The peoples half of the stigma.** Your line is *"every power **and people** who knows of it."* The powers half is
done. The peoples half needs a door I do not think I should open on my own: `applyStandingOps` is the GM's **narrated**
door — it caps at four ops a beat and clamps at a band edge on purpose, because *"a scene is not a life"* — and a world
rule moving every people at once through it would be using a throttle as a mechanism. **Erik:** may a world consequence
cross a band edge, or should it stop at one the way a narrated beat does? One line from you and I'll build it.

**2 · A power taking a gate.** Your §2c ends: *"The Ender Host (cruel, `raid`) at the Marchward is the likeliest power
to take one first, and when a generated power's verbs would do it, the news should say so."* That is a rule about power
verbs that has not been written. The **reader** is in place (`gateHeldByPower` reads `power.gateHeld` from content and
`powerState[id].gateHeld` from the tick), so the day a power takes one the entire consequence already exists — but
nothing sets it yet, and I would be inventing which verb does it and how often. ⬜ **Aevi:** say which verb, and I'll
wire it; or author `gateHeld` on the Ender's Host and it works immediately.

## ⛔ Four of my own readers read the wrong shape, and every one failed silently

Worth recording because they are one family, and driving the feature is the only thing that found them:

- `keeperFor` did `Object.values(content.bestiary)` — which is the **file's** top-level values, not the roster. So the
  clock climbed all four rungs and **nothing ever came through**, swallowed by an `if (!creature) continue` I had
  written as a tolerant guard for content you hadn't authored. A guard for missing content hid missing code.
- `stigmaFor` tested `r.moved`; `movePowerStanding` returns the move itself. The stigma landed on 29 powers and reported
  none — a consequence the player pays and cannot see.
- `seasonDays` divided the year by `seasonCalendar().seasons`, which is the **portion-expanded** list (early-/mid-/late-).
  Your "a season's rhythm" became **twelve days**, and a legendary keeper would have arrived in 48 days instead of 144.
- The act phrases were third-person verbs, so the receipt read *"You have charges for passage."*

**Next in your order: C2** — the visiting traders, still blocked on one call of yours: the 10 powers' traders in
`SNG-652_trade_companies_and_traders.json` need somewhere to stand, either a `trading_post` location kind or
`draws: ["traders"]` on `market`. Then **D**. And **A2** still waits on your supply-line patch.
