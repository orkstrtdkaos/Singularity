# film_angelic_demonic: sources per shot

Canon dir: `/mnt/user-data/uploads/Singularity/.aevi_scratch/films/` (plus `open/EXESA_o1.md`). TP = tradition_profiles_f1.json `traditions[]`; LOC = locations_f1.json; NPC = npcs_f1.json; POW = powers_f1.json `powers[]`. No `_*`, `gm*`, `secretsGM`, `feedsGM`, `notes`, `threading` or `sovereignGM` fields used.

- **_1** (ring seraphic+abyssal): opening_v1.json argument_4 + EXESA_o1.md I ("the old stories name them ... the angels"); TP seraphic.name "The Ascent", TP abyssal.name "The Descent"; EXESA IV table "Angelic ⟷ Demonic".
- **_2** (veil): EXESA_o1.md Angelic ⟷ Demonic table note, "The Abyssals draw on the far side directly, being the other half of the same argument"; EXESA III (far side of the Veil).
- **_3** (source nanite_ordered): POW power_seraphic_orders.descriptionSeed ("humans made radiant by ordered nanite, and they bleed gold"); after: EXESA III "Seraphim and Enginewrights order wild nanite into ordered".
- **_4** (place choirheight): LOC choirheight.appearance (white spires in stepped rings, gold light from high arched openings) + descriptionSeed ("choral certainty that is genuinely hard to bear").
- **_5** (place choirheight_gate_yard): LOC choirheight_gate_yard.descriptionSeed ("receive every arrival from below", "the sisters watch who flinches", "You may go up. You will be looked at first."); LOC choirheight.descriptionSeed (gate at the foot).
- **_6** (region choirheight): TP seraphic.theCraft ("sees moral weight directly: what a person has done ... what they are still carrying ... lift it or pronounce on it ... Neither is gentle").
- **_7** (place the_mercy_house): LOC the_mercy_house.descriptionSeed ("A Seraph who grants mercy CARRIES what they lifted ... full of people who have taken on other people's worst things and are still standing") + appearance ("wide doors kept open").
- **_8** (ring seraphic): TP seraphic.whoPractices ("continuous with the pre-Transition world in a way almost nothing else is"); TP seraphic.distribution.modes (THE ORDERS: adjudication, charter, standing; the Vessel-Keepers: the long-lived and how they stay that way).
- **_9** (figure hierarch_brightmantle): NPC hierarch_brightmantle.role ("governs the Seraphs from Choirheight, gives mercy that costs her"), .appearance ("tired at the eyes the way only the very merciful get tired"), .knowledge ("what each has left to give").
- **_10** (region choirheight): POW power_seraphic_orders.descriptionSeed ("the ... inquisition is gaining ground", inquisitor not named) + bodies[Burning Inquisition].does ("the higher law with no mercy under it; an inquisition inside the Orders"); TP seraphic.distribution.tail THE SENTENCE.
- **_11** (place the_unfallen): LOC the_unfallen.descriptionSeed ("mercy without judgment is complicity") + appearance ("walls blackened on the facing sides"); POW power_seraphic_orders.appearance ("a burning pole above") for "higher still".
- **_12** (region the_mercy_house): TP seraphic.theTrade (weighing anyone at any distance without their knowledge; judgment that binds cannot be taken back; absolution given wrongly is still given).
- **_13** (place the_bargain_gate): LOC the_bargain_gate.appearance (horned gables, dark stone, stone tables in the open); "across the world" from worldPos of the_bargain_gate vs choirheight (opposite longitudes) and EXESA IV ("your opposite is your antipode").
- **_14** (ring abyssal): TP abyssal.theCraft ("names what a person actually wants, states the true price ... both sides pay what it cost"); after: LOC the_bargain_gate.descriptionSeed ("Their bargains are perfectly fair. That is the horror") + TP abyssal.oneLine.
- **_15** (place the_bargain_gate_gate_yard): LOC the_bargain_gate_gate_yard.appearance ("every price written on the wall in letters a yard high") + descriptionSeed ("Armies are offered terms. Most take them.").
- **_16** (place the_appetite_halls): LOC the_appetite_halls.descriptionSeed (naming aloud the wants people cannot admit to; nobody is forgiven; most liberating hour; many never recover).
- **_17** (region the_appetite_halls): TP abyssal.distribution.modes (THE MARKET: traders; THE HOLLOW: appetite-work as diagnosis); TP abyssal.distribution.note ("most are traders").
- **_18** (figure speaker_istvane): NPC speaker_istvane.role ("hears every petition at the Bargain Gate in public and sets the terms, which are always exactly fair") + .appearance ("an empty chair he never looks at").
- **_19** (region the_bargain_gate): POW power_hollow_court.plainly ("Everyone who takes a crown without being recognized comes here") + .descriptionSeed ("What it gets in return, it does not say").
- **_20** (place the_maw): LOC the_maw.appearance (city built downward, buildings around the shaft, lights sparser further down) + parentId/depth (below the Bargain Gate) + descriptionSeed ("The Devouring have stopped bargaining, because a bargain implies a price").
- **_21** (region the_maw): TP abyssal.distribution.tail THE MAW ("priced against something they cannot refuse: a child, a name, a breath ... Anyone who says the abyss cannot compel has met only its traders").
- **_22** (region the_bargain_gate): TP abyssal.theTrade ("catches only what already wanted the bargain ... what it ate does not come back").
- **_23** (axis): TP abyssal.acrossTheAxis ("The Ascent weighs what a person has done; the Descent names what they want ... Only one of them offers you a deal").
- **_24** (place stair_hollow): LOC stair_hollow.descriptionSeed ("beneath the Ascent ... you can bring a case, lose, and go home").
- **_25** (place the_low_market): LOC the_low_market.descriptionSeed ("Not far enough down to be the Maw ... Everything is for sale and the price is on it").
- **_26** (arc arc_the_poles_pull): greater_arcs_f1.json arc_the_poles_pull.stages[0].publicFace ("Each Reach is leaning harder into its own extreme"); LOC the_unfallen.descriptionSeed ("would burn the impure, and is beginning to"); LOC the_maw.appearance (lights sparser further down).
- **_27** (axis): TP seraphic.theTrade (weighing without their knowledge); NPC speaker_istvane.voiceHints ("Names what you want, out loud, before you do"); LOC choirheight.descriptionSeed (judged, "no appeal").
- **title**: EXESA IV domain "Angelic ⟷ Demonic"; peoples' names from EXESA table.
- **unlock**: TP seraphic/abyssal; homes per EXESA table (Choir-Height = choirheight; the Maw = the_maw).
