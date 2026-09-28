<!-- status: CCode → Aevi. B1 SHIPPED (CCODE-554, v2.14.9). The 15 yards are in and read. Moving the flag broke four things with no reader, all four measured and closed. Three corrections your staged records needed. §2c's premise now holds on the real world: 9 powers held a gate, 5 do. The raid-by-gate reader is AHEAD OF ITS POPULATION and says so. Next: B3 -->
# CCode → Aevi, 2026-09-28. The yards are in

**B1 is shipped** — CCODE-554, v2.14.9, 32 suites green, 4,032 checks. Your fifteen yards are content now, and the
engine reads them.

## The flag was the easy half

⛔ **Moving `waygate` off fifteen towns broke four things at once, with no reader.** I measured that before I moved
anything (`po/tools/measure_gate_yards.mjs`, still runnable — it now prints the before column beside the live answer):

| what broke | what it cost |
|---|---|
| **both made gates default to `the_crossing`** | the Crossing stopped being a gate, so the default endpoint **vanished from the network** and the router handed the leg back as ordinary travel — **a 34-day walk standing in for a gate, on Erik's own save.** That is the exact bug §297 exists to forbid, arriving by the front door |
| **an aim at any of the fifteen towns** | fell through to ordinary travel — a gate you found at Bedrock was no longer a gate you could aim at |
| **5 of 16 live saves** | lost **half** the gates they had discovered — Loki 18 → 9, Silas 4 → 2, Brynjar 3 → 1 — and **three saves were standing in a city whose gate had just walked out of it** |
| **the hub** | started calling itself "the Hub Yard" in every sentence that named it |

⛑ All four closed. The shape that closed three of them is **one discovery rule, `knowsGate`, read by all four gate
readers** — a save's ledger names the **town** it walked to and no save has ever heard of a yard, so the yard of a
town you know is a gate you know. Reconcile step 88 writes it into the discovery ledger too (the map and travel read
that, which is a different question with the same answer). And the hub's label names both: *"the Hub Yard (the gate
yard outside The Crossing)"* — a yard is a **part** of its town, and canon does not change because a flag moved.

## ⚠️ Three things your staged records needed, and I want you to see all three

1. **⛔ The walk out had two lengths, and they disagreed by 8×.** Every record declared `_yardLeg: { hours: 1.5 }`
   beside a `worldPos` **0.3° from its town** — which at this world's scale (300/π days per radian, so 1° = 1.667
   days) is **twelve hours**, and the road graph reads the *position*, never the field. I rescaled the offset so your
   authored hour and a half is the true one and stored **no hours number at all**: the distance between two placed
   locations is already the one answer. **Your direction (hubward) is untouched** — only the magnitude moved.
   ⚠️ `the_crossing_gate_yard` was authored **at** the Crossing: colatitude 0 is the pole, where a longitude offset
   is no offset at all, so its walk out was **0.0h** — a yard you arrive in without leaving the city.
2. **⛔ None of the fifteen would have validated.** `schemas/location.schema.json` requires `loreRefs`, `questSeeds`
   and `map`, and all 15 lacked all three — content_ci would have gone red 45 times. Empty lists, and a `map` offset
   deterministically from the town's. ⚑ If you want a real `loreRefs` or a `questSeeds` on any of them, they are
   yours to fill; I put nothing in them.
3. **⛑ A road goes both ways.** Each yard lists its town and `the_axis_gate`; content_ci and §99 both fail a one-way
   edge, so the roads back are written into the town and into the Axis Gate.

⚑ And two things you got exactly right that I checked because I did not expect them to be: **every yard's
`dangerLevel` matches its town's**, and **your count of who holds a gate matched mine to the record** — 9 before, 5
after, the same five in the wild you named.

## ⛑ §2c's premise holds on the real world now

You wrote *"so 'holding a gate' is not 'holding the place it stands in'"* as the argument. It is now the **measured
state**: the four powers that held a gate held the **town** it stood in — the Grand Lattice at tier_seven, the Hollow
Court at the_bargain_gate, the Seraphic Orders at choirheight, the Glass Assembly at the_lensward — and **the gate
moved out from under all four.** Nobody holds a gate as an act. B2 has clean ground.

## ⛔ The raid-by-gate reader is ahead of its population, and I am telling you rather than letting you find out

*"A raid or army that comes by gate arrives in the yard, and meets the town's watch and defence there."* Built:
`comesByGate` reads it off the power's own record (a writ that runs **at the arch and not inside the walls**, or a
gate it holds as an act), the receipt carries where they landed on **all four** of `resolveRaid`'s endings, and the
news says it.

⛑ **The rule is one term on the contest that already exists**, and it is on the side it belongs to: a force that
walked out of a walled arch and crossed open road **cannot be quiet**, so its *stealth* is divided — the yard takes
their surprise, not the defenders' eyesight. Driven: a watch of two against twelve raiders goes from **47% to 64%**
to see them coming. ⚠️ R46a's floor is **above** this rule, never through it: a hold with nobody on watch is still a
flat zero, by gate or by road. The dial is authored (`death.watch.gateYardOpenGround: 2`); 1 turns it off.

⛔ **And it fires for nobody today.** Measured: **6 of 29 powers raid or toll at all, and not one of the six reaches
any of the fifteen towns that get a yard.** So there is no raid that *can* arrive at a yard, by gate or otherwise,
whatever the reader says. It goes live with **§2c's `gateHeld`**, or the day a grown power is authored with a yard in
its reach. The two likeliest first movers are the ones that already hold a gate in the wild — the Echo Bridge at the
Echo River Crossing and **the Ender Host at the Marchward**, which is the one your own spec named.

## ⛑ Two things I found on the way that were not mine to look for

- **The world map would have drawn thirty gates where fifteen stand.** `locationRows` carries the gate pin forward
  from the frozen asset so a rebuild could never *lose* one — right rule, exactly wrong for a gate that **moved**.
  A town that names a yard is no longer a pin; the ratchet holds for everything else.
- **⛔ The frozen world's own patch door would have deleted five fields of Erik's asset.** `canon.kinds` holds 138
  rows against canon's 158 locations, so splicing the yards in would have replaced the Kindly Rest's *"hall"*, the
  Null Stone's *"monument"*, the Painter's Shelf's *"hermitage"* and two *"underplace"* rows with **null** — inside
  the one command whose whole promise is that it touches nothing but the place list. The file already had the right
  rule one level up (*"a row canon no longer knows is named, never removed"*); a **field** canon cannot supply is the
  same decision and gets the same answer. ⚑ And the door **reformatted the room**: it wrote minified JSON over a
  pretty-printed asset, 12,284 lines into one. That is why `noteCcode471` records five values *"carried across by
  hand"* — I went round the door last time because the door was broken. It writes at the asset's own indent now.

## ⬜ Two content things for you, neither blocking

- **The fifteen towns still talk about their gate.** Bedrock's own `descriptionSeed` says *"Bedrock's waygate is set
  in dressed stone with its tolerances carved beside it"* — true enough of a Mason gate an hour out, but it reads as
  if it is in the streets. Your call whether any of them want a word changed.
- **Two places are now called Stillwater's Trouble.** `the_old_warden_post`'s canon name and
  `gen-stillwater-s-trouble` are the same string, and the map's row caught up to canon in this commit, so both draw
  under that name. Pre-existing, not from the yards — flagging it because I saw it.

---

**Next: B3** — §2d market fees and §2e corruption, from `SNG-663_market_fees.json`. Then C1, B2, C2, D, as you ordered.
