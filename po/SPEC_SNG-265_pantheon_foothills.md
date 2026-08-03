# SPEC — SNG-265: the PANTHEON FOOTHILLS (Erik's idea, and the ring already supports it)
## Aevi (PO) · 2026-08-02

Erik: *"For the foothills versions of the seraphic and demonic traditions (combined with a neighbor or two) is
where we can bring in the Greek gods and Norse gods etc."*

I checked the ring before writing this, and **the adjacencies are almost embarrassingly well-suited.** This is
not a bolt-on; it is a shape the geometry was already holding open.

## WHY IT FITS — the structural argument
**A foothill is, by the catalog's own definition:** `access.open: true` (folk — learnable by anyone, where a
pole is gated) · `foothillOf` one or more poles · **its own MEDIUM** · **the gentle, worked, SURVIVABLE version
of the pole's extremity.** Every one of those is what a pantheon IS:
- **Pantheons are FOLK.** Everyone in a culture has the gods. You do not join an Order to pray to Zeus. That is
  `access.open: true` exactly.
- **A god is the survivable version of a cosmic principle.** The seraphic pole's judgement *"binds anyway if
  you are wrong"* — it is not something a person can hold. **A sky-father you can petition, argue with, and
  occasionally cheat IS that same judgement, made bearable.** That is precisely the foothill relationship, and
  it is why myth exists in the first place.
- **The medium is WORSHIP-PRACTICE** — oath, offering, omen, festival, name — which no pole-tradition uses.

## THE ADJACENCIES (verified in traditions.json)
- **SERAPHIC** (position 14, *the Ascent*, locus *the Choir-Height*) neighbors **VERIST** (truth) and
  **LATTICE** (order). → a foothill there is **judgement + truth + order**.
- **ABYSSAL** (position 2, *the Descent*, locus *the Maw*) neighbors **VEILWRIGHT** (falsehood) and
  **CHURNFOLK** (wild). → a foothill there is **appetite + deception + chaos**.
**Those two blends are the two great mythic families, and nobody designed them to be.**

## THE TWO OBVIOUS PANTHEON-SHAPES
### THE OLYMPIAN SHAPE — foothillOf [seraphic, lattice, verist]
Judgement + order + truth: sky-father law, **oaths that bind because they were sworn**, a hierarchy of powers
with domains, judgement that can be *appealed to* rather than merely suffered. Greek/Roman, and most
law-giving pantheons.
The foothill's job: give a player the seraphic pole's **weighing and binding** in a form that **can be
petitioned, bargained with, and got wrong survivably.** `ascent` binds whether or not you are right; an oath
sworn at an altar **can be broken, at a price** — that difference is the whole reason a foothill exists.

### THE TRICKSTER-AND-HUNGER SHAPE — foothillOf [abyssal, veilwright, churnfolk]
Appetite + deception + wild: gods who **bargain**, who are **not safe**, whose gifts are real and cost exactly
what was named. Norse (Loki, and the whole Æsir habit of oath-and-consequence), Dionysian rites, the fae
bargain.
The foothill's job: `descent`'s bargain is *"exactly fair, which is the horror of it"* — a **god's** bargain
can be **haggled, tricked, or fulfilled cleverly.** Same principle, survivable.

### AND THE REST OF THE RING SUPPORTS MORE (if Erik wants them)
- **rootkin/ashwarden + churnfolk** → a fertility/underworld pantheon (Demeter-Persephone, Freyr/Hel).
- **marcher + somatic + wright** → a war-and-forge pantheon (Ares/Hephaestus, Týr/Thor).
- **hourkeeper + horizon** → fate and roads (the Moirai, the Norns, Hermes).
**The twelve-axis ring can carry any pantheon, because pantheons ARE how cultures cover a full ring of concerns.
That is the deep reason this works.**

## WHAT THE FOOTHILL MECHANICALLY IS (proposal)
1. **Crafts are the pole's crafts, made survivable** — lower tier ceiling (T-I to T-III, no capstones), softer
   bounds (many pole HARD bounds become foothill SOFT), and **the cost lands as OBLIGATION rather than
   drift/self-cost.** A seraphic *drifts* judgement-hot; an Olympian devotee **owes the temple a hecatomb.**
2. **The medium is OBSERVANCE** — the mechanic hook is that crafts key off **oath, offering, festival-day,
   omen-read**. That is a genuinely new resource shape and it belongs to foothills alone.
3. **Its gods are NPCs/legends, not stats** — this plugs straight into the existing `legends.js` tier ladder and
   Erik's arena-fame idea (item 27): **a god is a legend with a cult, a domain, and deeds that SPREAD.**
4. **A player can belong to a pantheon-foothill AND a pole** — that is what a foothill is for, and it is the
   natural answer to `the_whole_act`'s dual-pole problem (checks 6e).

## HONEST CAUTIONS
- **Do not import a pantheon's ROSTER, import its SHAPE.** "Zeus, Athena, Ares" in a Valley game reads as
  borrowed; *a sky-father whose oaths bind, a grey-eyed craft-and-strategy patron, a war-god nobody likes but
  everybody needs* reads as **a people's own gods that happen to rhyme with ours.** The catalog has been
  scrupulous about this everywhere else — every tradition is its own thing that RESEMBLES something.
- **Keep the poles unsurvivable.** The foothills only mean anything if `ascent` and `descent` stay as terrifying
  as they currently are. **The gods are bearable BECAUSE the thing behind them isn't.**
- **This is a large content job** — comparable to a tradition each. Recommend ONE pantheon-foothill authored end
  to end as a pilot (I'd take the trickster-and-hunger shape, because the abyssal bargain is the sharpest
  mechanic to make survivable) before committing to a set.

## ERIK'S CALLS
1. **Which pantheon-shape gets piloted** — Olympian (judgement/order/truth) or trickster-and-hunger
   (appetite/deception/wild)?
2. **How literal?** Recognisable-but-renamed (my strong recommendation), or openly Greek/Norse in the fiction?
3. **Does the observance resource (oath/offering/festival) get built**, or do pantheon foothills reuse the
   existing energy/substrate economy? It is the difference between a flavourful foothill and a genuinely new
   way to play.
