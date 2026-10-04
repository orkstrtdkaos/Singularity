# Y — the Coliseum's bench, read

CCode → Aevi (cc Erik) · 2026-10-04 · v2.18.4 · SNG-669

Erik: *"every reach and distinct people should have at least one gladiator, if not a whole bench. The
coliseum is central in the culture here."*

Your content, my reader. Four functions in `engine/coliseum.js`, beside the blind grid they feed.

## What is built

**`benchAt(content, { reach })`** — heads and challengers grouped by reach. Pure.

⛑ It keys on `reach` rather than on a pool id, which turns out to be the thing that keeps it honest:
`saehara_challengers` sits in the same map and **none of its six carry a `reach`**, so the arc's opponents
stay off the Coliseum's card without the reader ever needing to know that pool's name. §422 gates it.

**`benchAxis(member)`** — the blind-grid four, by `drawAxis`'s own rule unchanged: three from what they
practise, the fourth from all eight including families they have never trained. A narrow fighter is not
protected; they are more exposed. Verified over 2,000 draws: always four, never a repeat, never outside
the eight.

**`benchBout(content, { reach, people, rank })`** — a bout by any combination of the three, returning the
fighter and their four. ⛔ **A head is never drawn.** Your Y2: *"Heads keep their authored encounters."*
Wired into the live duel: at the Coliseum, if the encounter named nobody, the opponent comes from the
bench — the player's own reach first, then anyone on the card. The grid, the blind pick and the resolution
are untouched; this only answers *who is across the sand*.

**`benchForGM(content, { here, day })`** — who is on the card today, rotated by the day rather than rolled
(the same rule `verbForPass` uses, so a card is reproducible), plus **this reach's own** fighters so the GM
can say *"our Haldor fights at the Crossing"* anywhere in that reach. Its own block in `gm.js`, separate from
the one about powers, and it says plainly that a card is not a threat list.

## ⬜ One question: "weighted" cannot do what it sounds like, on this content

Your Y2 says the four come from `families` *"(weighted, the fourth drawn from all eight, exactly as
`drawAxis` does for a competitor)"*. A bench member has a flat list where a player has ability ranks, so
there is no weight in the data. I read the list **order** as the weight — first listed is the one they are
known for, so two families weight 2:1.

**Measured, and the reading barely matters:** all **32 of 32** challengers carry **exactly two** families.
`drawAxis` takes three from practice, so with two families *both always reach the axis* — the weight cannot
decide who appears, only who **leads**. Measured over 6,000 draws: the first-listed takes the first column
**4,031 times, 67%** — the 2:1 weight exactly.

So it does something real (which column a family lands in is what the grid pairs on) but not what
"weighted" implies. If you meant the weight to decide **inclusion**, one of two things has to change:

- bench members carry **three or more** families, so three practice slots cannot take them all; or
- bench members draw with `fromPractice: 2`, so one of two families is left out and the wildcard widens.

Either is a one-line change here. I have shipped the order reading and gated it at 58–76% so a re-tune
does not redden the gate, with the number in the comment.

## Gates

**§422**, 10 checks on a fixture bench — the grouping, the pool without a reach staying out, the four
always well-formed, the narrow fighter still fielding four, the order weighting, the three filters, a head
never drawn as a bout, and the card being the same card on the same day and a different one tomorrow.

**`content_ci` SNG-669**, 6 checks on your authored bench, where claims about content belong and where they
will still be checked when you grow the benches: **every one of the 38 reaches keeps a fighter**, every
`families` entry is one of the eight, every challenger declares at least one, **every head's `npcId`
resolves**, and the bench fields more than one people — which is the whole point of it.

## And a gate caught me wiring a dead key

§232 — *"every env key a builder READS is a key some caller SETS"* — failed with `DARK: day`. My registry
row read `env.day`, which does not exist; the bag carries `time.worldDay`. The card would have frozen on
day 0 forever and looked like a deliberate fixed card rather than a bug. Fixed to the same expression its
neighbours use.

32/32 green, 4,500 checks.
