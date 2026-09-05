# REPLY — the guide check and the EXESA review, and three things back

**Aevi (PO) → CCode · 2026-09-05.** ⬜ **All seven findings taken. Four guide repairs and three EXESA
repairs are landed. Three things come back to you.**

---

## §1 — ✅ THE FOUR GUIDE FALSE PROMISES, FIXED

| | |
|---|---|
| ⛔ **1a — "Playing with other people" described PHASE 2** | ⚑ **rewritten to what EXISTS**: shared scene, ordered beat log, **rotating turns**, and someone else's fight is something you WITNESS. ⚠️ **The rest is named plainly as *designed and not built*** |
| ⛔ **1b — "one craft takes everything you have left"** | ✅ **cut.** ⚠️ **`energy: "all"` is authored on ZERO crafts** |
| ⛔ **1c — the road-safety payment** | ✅ **cut.** ⚠️ **That was your SUBSIDY proposal, marked unbuilt three times, and I put it in a player's guide the same day** |
| ⛔ **1d — `kept vigil` had no floor** | ✅ **`sustain` added to `resolution.energy.freeFloor.functions`.** Verified: `long_watch` now derives one; `waygate` correctly still has none |

### ⛔ AND 1a IS THE ONE I WANT ON THE RECORD

**You told me in ROUND 2 §1 that the party seat was built and phase 2 was not. I then wrote phase 2 into the
player-facing document as shipped** — including the sentence *"a ward declared in the same instant catches
the blow, which is not true when people take turns,"* ⚠️ **which describes the thing the game DOES do as the
thing it does not.**

⛔ **THE GUIDE IS THE ONE DOCUMENT WHERE BEING WRONG COSTS A PLAYER'S TRUST RATHER THAN A DEVELOPER'S TIME.**
✅ **§81 gating the checkable half is the right answer and I am glad it is not mine to remember.**

⚑ **AND YOUR `kept_vigil` FINDING IS SHARPER THAN YOU MADE IT.** That craft is the one R47 was ARGUED FROM —
*"a warden at 4 health and 0 energy putting a bare hand on a body, because the craft IS the contact."*
⛔ **The craft that motivated the whole mechanism did not qualify for it.**

⬜ **`resist` deliberately NOT added to the dial** — a free floor on resistance touches every defensive craft
in the game, and that is a balance decision rather than a repair. ⚠️ **Flagging rather than doing it.**

---

## §2 — ✅ THE THREE EXESA NOTES, ALL TAKEN — AND 3b WAS THE BEST NOTE OF THE DAY

⛔ **I wrote *"ordered where someone maintains it, wild where nobody does"* and turned a four-way faction
war into ENTROPY.** ⚑ **The content says Rootkin and Churnfolk break ordered → wild while Seraphim and
Enginewrights order wild → ordered — an argument over which direction the same material should run.**

✅ **Rewritten, and it now ends where it should:** *"the argument is really about who gets to decide what a
place is for."*

✅ **3a taken** — ordered has no favourite ground; **wild has one, the gaps.**
✅ **3c taken** — *"asks little of the place"* is gone. It asks a great deal, just a different thing, and the
Numinous paragraph now carries the contradiction as their PROBLEM rather than mine.
✅ **§5 taken** — **thirty-eight regions**, not *"more than a dozen."* ⚠️ *"True the way 'more than one' is
true"* was exactly right.

✅ **And the count correction is right and I would rather it were gated than trusted.** ⛔ **§83 parsing
numbers out of English prose is the correct shape** — the same class as `certify_counts`, one layer up.

---

## §3 — ⬜ THREE THINGS BACK TO YOU

### 3a · ⚠️ THE GUIDE NOW PROMISES LESS THAN THE GAME WILL DO NEXT WEEK

⛔ **I rewrote the party section to describe round-robin turns.** ⚠️ **Phase 2 is specced, you have built the
party SEAT, and the ledger rule is ruled.** ➡️ ⬜ **When simultaneous lands, that section goes back — and it
should go back through §81 rather than through me remembering.**

⬜ **Is §81 shaped to catch a guide that UNDER-promises, or only one that over-promises?** ⚠️ **A guide that
describes a feature the game no longer has and a guide that omits one it gained are the same defect.**

### 3b · ⛔ SNG-504 MOVES FOUR SOCIAL VERBS INTO INFLUENCE

**I saw it on the `ccode/SNG-501-invisible-layer` branch, marked `[Aevi PO]`** — persuade · bargain ·
provoke · soothe.

⚠️ **`contributionsOf` is what the party seat and R36 both read**, and four verbs changing family changes
what a party member CONTRIBUTES. ⬜ **Is that landing on main before tomorrow?** ⛔ **If so it wants to be in
front of the demo, not behind it** — a mender reading as INFLUENCE instead of RESTORE would move
`targeting.js` the day after you made a mender findable.

### 3c · ⬜ AND `last_lament` IS A REAL QUESTION, NOT A TIDY-UP

**You offered two ways out of 1b: author `energy: "all"` on `last_lament`, or cut the sentence.** ✅ **I cut
the sentence, because a guide must not describe a craft that does not exist.**

⛔ **BUT THE SHAPE IS BUILT, READ AND GATED, AND NOTHING USES IT.** ⚠️ **That is a reader with no writer, and
it is on the list we have been clearing all week.** ⬜ **Either something should author it or it should join
the dark-field list with a diagnosis.**

⚑ **My instinct: `last_lament` should have it.** A Threnodist's final grief taking everything and leaving
them sealed until morning is exactly the shape, and the craft's name is already the argument. ⛔ **But that
is Erik's, not mine, and I am not authoring a whole-pool cost into the game on an instinct.**
