# SKILL SOURCE OF TRUTH — every domain, tradition and craft

**GENERATED 2026-09-02 from the live corpus.** ⛔ **This file is DERIVED. Do not hand-edit —
regenerate it.** ⚠️ Where this disagrees with any working paper in `po/`, **this is right.**

**429 crafts · 14 domains · 24 poles · 47 folk-accessible · 3 pending R33**

⛔ **R33 (SNG-443) — LINEAGE AND ACCESS ARE TWO SEPARATE AXES.** Source:
`content/packs/core/rules/foothills.json` → `_twoAxes`.

| field | is |
|---|---|
| **`tradition`** | ⚑ **THE LINEAGE** — which people's craft this descends from. Permanent; the power source, aesthetic and wheel position all key off it. **This file groups by it.** |
| **`learnedAt`** | ⚑ **THE ACCESS** — the place a person can be taught it: a foothill, a school, or the wilds. **Shown as a row marker, never as a grouping.** |
| **`folkAccessible`** | an access flag, orthogonal to both |

⛔ **A FOOTHILL IS A PLACE OF ACCESS, NOT AN ANCESTRY.** Erik: *"Hardline teaches the Edge; it does not own
it — that is what makes a foothill an economic centre: it SELLS ACCESS to something it did not invent."*
⚠️ **A foothill therefore has NO axis and NO ring position, because it is a location and not a lineage** —
but **its crafts DO have lineages, and therefore domains.**

⚠️ **37 crafts were re-assigned on 2026-09-02.** They had carried `harmonic`, `radiant_folk`, `god_named`
or `bargainers` in `tradition`, which **confused access with ancestry** — the exact error R33 names.
⬜ **Assigned by AUTHORING, not arithmetic:** `foothills.json`'s blends are weights across a whole *place*
(who lives there), never a per-craft rule. Each craft's reason is recorded in its `_lineageWhy`.

✅ **AND THE BLENDS HAVE NOW BEEN RE-DERIVED FROM THE CRAFT DATA.** Erik, 2026-09-02: *"the harmonic breakdown was a guess prior to the allocation of skills — let's update the blend numbers now that we have better data."*

| foothill | authored guess | re-derived from crafts |
|---|---|---|
| **harmonic** (16) | threnodist .5 / lattice .3 / mason .2 | ⚑ **mason .4 / lattice .3 / threnodist .3** — ⚠️ **the guess was inverted.** Sound-work at the Heights is more MATERIAL than mournful |
| **radiant_folk** (15) | blazeborn .5 / wright .3 / lattice .2 | ⚑ **blazeborn .5 / wright .35 / lattice .15** — ✅ nearly right; the Plateau MAKES more and ORDERS less |
| **valley_craft** (15) | stillhold .4 / wright .3 / rootkin .3 | ⛔ **TEN parents at low weight** — mason .2, then horizon/rootkin/stillhold .15 each, then six more |
| god_named · bargainers · hardline · greyhearth | — | ⬜ **NOT re-derived** — fewer than 10 crafts, so the measurement would just BE the crafts. Authored intent stands |

⛔ **THE VALLEY_CRAFT CORRECTION IS THE INTERESTING ONE.** A three-way blend was always the wrong SHAPE for the Valley — it is not a place where three peoples meet, it is the place where **everyone's craft has left a little behind.** ✅ **No dominant parent IS the character.** ⚠️ `_parentsAuthored` preserves every original guess.

---

<!-- BEGIN skills-generated -->
## Summary

| pos | domain | antipode | sects | crafts | T1 | T2 | T3 | T4 | T5 |
|---|---|---|---|---|---|---|---|---|---|
| 0 | **Mind** | Body | Noesis, Logos, Formcraft | **31** | 12 | 6 | 6 | 4 | 3 |
| 1 | **Light** | Dark | Radiance, Verity | **37** | 14 | 13 | 5 | 1 | 4 |
| 2 | **Life** | Death | Vivimancy | **24** | 7 | 6 | 6 | 4 | 1 |
| 3 | **Angelic** | Demonic | Ascent | **24** | 8 | 5 | 4 | 4 | 3 |
| 4 | **Breaking** | Building | The Edge, Ruinwork | **39** | 12 | 12 | 7 | 5 | 3 |
| 5 | **Chaos** | Order | Wildcraft | **14** | 6 | 3 | 2 | 2 | 1 |
| 6 | **Span** | Spirit | Spanwork, Hourcraft | **30** | 12 | 9 | 3 | 3 | 3 |
| 7 | **Body** | Mind | Soma, Thingcraft | **34** | 19 | 6 | 5 | 2 | 2 |
| 8 | **Dark** | Light | Umbracraft, Falsecraft | **42** | 13 | 15 | 7 | 4 | 3 |
| 9 | **Death** | Life | Palework, Pathos | **44** | 13 | 14 | 10 | 3 | 4 |
| 10 | **Demonic** | Angelic | Descent | **23** | 9 | 6 | 2 | 3 | 3 |
| 11 | **Building** | Breaking | Makecraft, Stillcraft | **33** | 15 | 11 | 3 | 3 | 1 |
| 12 | **Order** | Chaos | Enginecraft, Latticework | **38** | 11 | 11 | 7 | 6 | 3 |
| 13 | **Spirit** | Span | Numenwork | **13** | 6 | 4 | 1 | 1 | 1 |

---

## Mind — ring 0, opposite **Body** · 31 crafts

### Noesis (`cogitant`) — 15 crafts

**Tier 1**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `ignore_me` | **Ignore Me** | 3 | mental | conceal,deceive | Nothing Worth Looking At · And Whoever Is With Me · Even Spoken To |
| `mind_read_folk` | **Cold-Read** | 3 | mental | foresee,reveal | Cold-Read · Cold Line · Open Book |
| `quiet_the_room` | **Quiet the Room** | 3 | mental | soothe | End the Condition · Stop the Rout · Back From It |
| `sustained_regard` | **Sustained Regard** | 6 | mental | bind,hinder,strike | Whole of It · Held Regard · Undivided  ⚑ harm:lethal · backlash:damaging |

**Tier 2**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `deduced_strike` | **Deduced Strike** | 4 | mental | strike,reveal,hinder | Aimed Thought · Called Effect · Strike in the Reading  ⚑ harm:damaging |
| `force_the_move` | **Force the Move** | 4 | mental | provoke | Make Them Answer · Shove the Rank · On the Record |
| `scholars_margin` | **Scholar's Margin** | 4 | mental |  | Margin Note · Thinking Out Loud · Dangerous Half |
| `solved_route` | **Solved Route** | 3 | mental | move,travel | Route · Moving Space · Designed Scene |

**Tier 3**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `memory_palace` | **Memory-Palace** | 6 | mental | empower,reveal,track | Cross-Reference · Whole House · Borrowed Room |
| `psychic_lance` | **Psychic Lance** | 7 | mental | strike | Driven Spike · Two at Once · Nothing Held  ⚑ harm:damaging |
| `working_model` | **Working Model** | 5 | mental | make,mend | Single Thing · Whole Working · Modelled Country |

**Tier 4**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `mind_meld` | **Mind Meld** | 8 | mental | empower,reveal,sustain | Open Door · Long Room · One Mind |
| `unmoving_mind` | **Unmoving Mind** | 11 | mental | resist | Still Mind · Stillness While Moving · Nothing Lands |

**Tier 5**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `convergent_strike` | **Convergent Strike** | 13 | mental | foresee,strike | Convergent Strike  ⚑ harm:lethal |
| `names_of_power` | **Names of Power** | 13 | mental | bind,command,hinder | Name They Are Called · Name They Are Known By · Name They Call Themselves  ⚑ harm:incapacitating |

### Logos (`syllogist`) — 7 crafts

**Tier 1**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `case_closed` | **Case Closed** | 4 | social | persuade,bind,empower | Matter Settled · Inescapable · Only Consistent Act  ⚑ harm:lethal |
| `contradiction` | **Contradiction** | 5 | mental | bind,break,hinder | Named Flaw · Reductio · Collapse  ⚑ harm:incapacitating |
| `known_price` | **Known Price** | 3 | mental | bargain | Open at the Close · Any Coin Is Coin · Terms Nobody Else Is Offered |
| `unbroken_thread` | **Unbroken Thread** | 3 | mental | resist,sustain | Held Through · Across Days · Last Thing to Fail |

**Tier 2**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `physicians_tome` | **Physician's Tome** | 2 | mental | heal,mend,restore | Diagnosis and First Care · Full Sequence · Root and Branch |

**Tier 3**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `built_system` | **Built System** | 6 | mental | bind,make,sustain | Working Rule · Self-Regulating · Lasting Structure |

**Tier 5**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `proof_halls` | **Proof-Halls** | 12 | mental | reveal,foresee,restore | Proof-Halls |

### Formcraft (`figurist`) — 9 crafts

**Tier 1**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `cutting_figure` | **Cutting Figure** | 6 | mental | break,hinder,strike | Drawn Line · Compound Figure · Cut Thought  ⚑ harm:lethal · backlash:damaging |
| `named_exclusion` | **Named Exclusion** | 4 | mental | bind,command,make,ward | Set Mark · Mark That Keeps · Governed Ground |
| `pattern_sense` | **Pattern-Sense** | 3 | mental | reveal,foresee | One Instance · Named Form · Where the Form Breaks |
| `the_true_figure` | **True Figure** | 4 | mental | reveal,foresee | Shape Under It · Continued Line · Whole Figure |

**Tier 2**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `formcraft` | **Formcraft** | 6 | mental | transform,make,reveal | Copied Form · Form from Report · Form Out of Need |

**Tier 3**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `my_reality` | **My Reality** | 6 | mental | conceal,deceive,make,strike | Ordinary Corner · Ordinary Room · My Reality  ⚑ harm:damaging |
| `walking_figure` | **Walking Figure** | 7 | mental | summon,ward,bind | Sent Figure · Figure That Stays · Figure That Judges |

**Tier 4**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `drawn_ascent` | **Borrowed Form** | 12 | mental | travel,transform | Borrowed Form · Long Form · Shared Form |
| `sent_meaning` | **Sent Meaning** | 9 | mental | make,summon,command | Sent Meaning · Finds Its Way · It Makes More |

---

## Light — ring 1, opposite **Dark** · 37 crafts

### Radiance (`blazeborn`) — 24 crafts

**Tier 1**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `kept_fire` | **Kept Fire** | 3 | practical | sustain,make | Fire Held · Several Fires · Long Burning |
| `kindle` | **Kindle** | 4 | mental | make,strike | Kindle · Flare · Struck Match  ⚑ harm:damaging |
| `light_bending` | **Light Bending** | 8 | practical | conceal,deceive,hinder,move | Haze Veil · Drawn Curtain · Second Sun  ⚑ folk · learnedAt:radiant_folk · harm:incapacitating |
| `lightsense` | **Lightsense** | 3 | mental | reveal,track | Lightsense · Spectrum-Read · Unbroken Beam |
| `prism_sight` | **Prism Sight** | 4 | mental | reveal | True Spectrum · Layered Reading · Light Beneath  ⚑ folk · learnedAt:radiant_folk |
| `radiant_ground` | **Radiant Ground** | 3 | mental | resist,sustain | Light as Fuel · Radiant Meal · In the Full Blaze |
| `read_burn` | **Read Burn** | 3 | practical | empower,foresee,reveal | Heat Read · Whole Burn · Fire's Whole Course |
| `sun_coax` | **Sun Coax** | 6 | practical | heal,mend,sustain | Warm Patch · Kind Season · Harvest-Hand  ⚑ folk · learnedAt:radiant_folk |

**Tier 2**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `afterimage` | **Afterimage** | 8 | practical | conceal,deceive,move | Slip-Frame · Double Walk · Crowd of One  ⚑ folk · learnedAt:radiant_folk |
| `beacon_chain` | **Beacon Chain** | 4 | mental | reveal,sustain,make | Set Beacon · Chain · Standing Waymark |
| `blaze_wall` | **Blaze Wall** | 5 | mental | shield,ward | Dazzle Wall · Radiant Barrier · Blaze Itself |
| `blazing_word` | **Blazing Word** | 4 | mental | bind,command | Open Word · Binding Light · Spoken In Blaze |
| `cleansing_light` | **Cleansing Light** | 4 | mental | break,heal,restore | Exposed to Light · Burn-Out · Full Restoration |
| `daybreak_mantle` | **Daybreak Mantle** | 6 | practical | command,empower,shield | Kindled Presence · Rallying Light · Standard of Dawn  ⚑ folk · learnedAt:radiant_folk |
| `glass_work` | **Glass Work** | 5 | mental | make,transform | Glass Form · Any Heat-Made Thing · Light as Material |
| `radiance` | **Radiance** | 6 | mental | break,reveal,strike | Revealing Light · Unshadowed · Blaze  ⚑ harm:lethal |
| `radiant_lance` | **Radiant Lance** | 12 | practical | break,strike | Needle Beam · Cutting Line · Sunlance  ⚑ folk · learnedAt:radiant_folk · harm:lethal |

**Tier 3**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `dawn_surgery` | **Dawn Surgery** | 12 | practical | heal,mend,restore | Sealing Touch · Fine Blade · Light in the Wound  ⚑ folk · learnedAt:radiant_folk |
| `focused_array` | **Focused Array** | 6 | practical | empower,make,command | Set Lens · Array · Lensward |
| `line_of_light` | **Line of Light** | 5 | mental | move,travel | Lit Crossing · Light the Target · Anywhere the Light Reaches |
| `unshadow` | **Unshadow** | 6 | mental | break,hinder,reveal | Unshadow · Stripping Light · Nothing Hidden  ⚑ harm:incapacitating |

**Tier 4**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `revealing_burn` | **Revealing Burn** | 11 | mental | reveal,strike | Revealing Burn · Wider Burning  ⚑ harm:damaging |

**Tier 5**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `last_light` | **Last Light** | 14 | mental | strike | Last Light  ⚑ harm:damaging |
| `light_borne` | **Light-Borne** | 12 | practical | move,travel | Light-Borne  ⚑ folk · learnedAt:radiant_folk |

### Verity (`verist`) — 13 crafts

**Tier 1**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `held_truth` | **Held Truth** | 3 | mental | resist,sustain | Anchored Self · What Is True Holds · Real Is Enough |
| `honest_price` | **Honest Price** | 4 | social | bargain,bind,empower,make | Price Named · Kept Terms · Standing Table  ⚑ learnedAt:bargainers |
| `standing_word` | **Standing Word** | 5 | social | bind,sustain | Word Set · Kept Account · Standing Truth |
| `the_plain_seeing` | **Plain Seeing** | 4 | mental | reveal | Cleared Look · Held Clarity · Unobstructed |
| `true_ground` | **True Ground** | 3 | mental | resist,shield | Lie Doesn't Stick · Protected Circle · Real as Defense |
| `unbearable_word` | **Unbearable Word** | 6 | social | break,strike | Said Thing · Public Fact · Unblinking  ⚑ harm:incapacitating · backlash:damaging |

**Tier 2**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `direct_path` | **Direct Path** | 3 | mental | move,reveal,travel | Real Route · Past the False Path · Actual Way |
| `established_fact` | **Established Fact** | 4 | mental | bind,make | Named Completely · Bound Record · Part of What Is So |
| `verity` | **Verity** | 6 | mental | bind,restore,reveal | Piercing Eye · Unmasking · Word That Holds |
| `weight_of_truth` | **Weight of Truth** | 4 | mental | break,command | Reliable Word · Plain Account · Record Commands |

**Tier 3**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `numenwork` | **Numenwork** | 8 | social | heal,restore,summon,sustain | True Attention · Negotiable World · Standing Presence |

**Tier 5**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `the_unsurvivable_fact` | **Unsurvivable Fact** | 13 | mental | reveal,strike | Unsurvivable Fact · Said Where It Carries  ⚑ harm:lethal |
| `whole_truth` | **Whole Truth** | 10 | mental | restore | Whole Truth |

---

## Life — ring 2, opposite **Death** · 24 crafts

### Vivimancy (`rootkin`) — 24 crafts

**Tier 1**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `beastfriend` | **Beastfriend** | 6 | social | bind,command,reveal,strike,summon | Gentle Presence · Working Trust · Old Accord  ⚑ folk · harm:damaging |
| `greenlore` | **Greenlore** | 5 | mental | heal,hinder,sustain | Hedge Remedy · Deep Pharmacopeia · Old Recipes  ⚑ folk · harm:incapacitating |
| `lifesense` | **Lifesense** | 3 | mental | reveal,track | Lifesense · Green Read · Whole Living Field |
| `pack_sense` | **Pack-Sense** | 4 | social |  | Stray's Read · Pack · What It Remembers |
| `snaring_green` | **Snaring Green** | 6 | practical | bind,hinder,make,strike | Green Comes Up · Thorn Turns In · Long Green Death  ⚑ harm:lethal · backlash:damaging |
| `staunch` | **Staunch** | 4 | practical | heal,sustain | Staunch · Held Wound · Refused Bleed |
| `thin_place_sense` | **Thin-Place Sense** | 3 | mental |  | Grove's Loan · Kept Flame · What It Carries |

**Tier 2**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `bark_and_briar` | **Bark and Briar** | 5 | practical | resist,shield,ward | Bark-Skin · Thorn-Ward · Grove's Resilience  ⚑ harm:damaging |
| `green_claim` | **Green Claim** | 5 | practical | strike,summon | Answer · Living Response · Reclamation  ⚑ harm:lethal |
| `quickening` | **Quickening** | 6 | practical | heal,make,restore,sustain | Green Touch · Quick Return · Unstoppable Spring |
| `root_road` | **Root Road** | 5 | practical | move,open,travel | Between the Roots · Opened Way · Root Network |
| `speaking_grove` | **Speaking Grove** | 4 | mental | command,reveal,track | A Word to the Green · Asking · Grove Speaks |
| `the_taking_root` | **Taking Root** | 5 | practical |  | Cutting · First Words · Young Rootkin |

**Tier 3**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `forced_bloom` | **Forced Bloom** | 10 | physical | transform,hinder,heal | Forced Bloom · Overgrowth · Strangling Green  ⚑ harm:lethal |
| `graftlife` | **Graftlife** | 6 | practical | heal,transform | Graftlife · Grafted Limb · Rootwork  ⚑ harm:damaging |
| `grown_guardian` | **Grown Guardian** | 7 | mental | empower,summon,sustain | Grown Guardian · It Does Not Stop · Bear You |
| `planted_years` | **Planted Years** | 7 | mental | foresee,reveal,track | Planted Years · Named Events · Who Comes |
| `quicken_the_ground` | **Quicken the Ground** | 7 | practical | open,sustain | Quicken the Ground · Ground Answers · Deep Rousing |
| `the_small_kingdom` | **Small Kingdom** | 7 | practical | strike,heal,command | Small Kingdom · Given Days · Ended Or Begun  ⚑ harm:lethal |

**Tier 4**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `carried_green` | **Carried Green** | 13 | physical | transform,travel | Carried Green · Thin Growth · Grown Wing |
| `green_road` | **Green Road** | 11 | practical | open,travel | Green Road · Deep Road |
| `last_gift` | **Last Gift** | 9 | social | heal,restore | Last Gift · Gathered Hour |
| `root_that_holds` | **Root That Holds** | 13 | physical | heal,sustain,summon | Root That Holds · Deep Green  ⚑ harm:incapacitating |

**Tier 5**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `spark` | **Spark** | 13 | mental | make,summon,sustain | Spark |

---

## Angelic — ring 3, opposite **Demonic** · 24 crafts

### Ascent (`seraphic`) — 24 crafts

**Tier 1**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `administered_mercy` | **Administered Mercy** | 4 | social | heal | Administered Mercy · Ordered Restoration · The Full Form |
| `measured_sentence` | **Measured Sentence** | 6 | social | break,reveal,strike | Weighing Light · Sentence Read · Unfallen Light  ⚑ harm:lethal · backlash:damaging |
| `name_invoked` | **Name Invoked** | 6 | social | command,empower,hinder,strike | Spoken Name · Weight of It · Name in Full  ⚑ learnedAt:god_named · harm:lethal |
| `sheltering_name` | **Sheltering Name** | 4 | social | ward,shield | Name Laid Over · Kept Household · Sanctuary Declared  ⚑ learnedAt:god_named |
| `shielding_light` | **Shielding Light** | 4 | social | shield,ward,resist | Light Interposed · Held Ground · Standing Light |
| `sustained_order` | **Sustained Order** | 3 | mental | empower,sustain | Order Holds · What the Order Provides · Part of What the Order Can Do |
| `the_measuring_eye` | **Weighing Look** | 3 | mental | reveal | Weighing Look · Clear Ledger · Unblinking Measure |
| `weighed_word` | **Weighed Word** | 4 | social | bind,command,reveal | Question Weighed · Weighed Room · Assize |

**Tier 2**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `ascent` | **Ascent** | 6 | mental | bind,command,restore,reveal | Measuring Eye · Mercy · Judgment |
| `ascent_path` | **Ascent Path** | 4 | mental | move,open,travel | Past the Limit · Opened Way · Choir-Height |
| `judged_strike` | **Judged Strike** | 4 | mental | reveal,strike | Warranted Blow · Named in the Strike · Hierarchy's Strike  ⚑ harm:lethal |
| `raised_form` | **Raised Form** | 4 | mental | command,make,summon | Ordered Thing · Organizing Made · What Should Exist |
| `set_in_order` | **Proper Order** | 5 | practical | make,restore,sustain | Proper Order · Company Stores · Poor Sources |

**Tier 3**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `answered_prayer` | **Answered Prayer** | 7 | social | heal,ward,empower,summon | Answered Prayer · Whole Line · One Of Us Comes |
| `carried_weight` | **Carried Weight** | 7 | social | heal,restore,soothe | Carried Weight · Long Weight · Not Survivable Alone |
| `majesty` | **Majesty** | 7 | social | hinder,provoke,reveal | Majesty · Held In Light · Seen From Outside  ⚑ harm:incapacitating |
| `shielding_word` | **Shielding Word** | 6 | mental | resist,shield,ward | Shielding Word · Standing Ward · Unbroken Word |

**Tier 4**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `burning_ones` | **Burning Ones** | 9 | social | strike,reveal,ward | Burning Ones · Wider Measure · Left Burning  ⚑ harm:lethal |
| `guardian_angel` | **Guardian Angel** | 9 | social | shield,travel,ward | Guardian Angel · Two Kept · Not While I Stand |
| `understudy` | **Understudy** | 9 | mental | empower,command,sustain | Understudy · Held Above Station · Two Rungs |
| `unfaltering_light` | **Unfaltering Light** | 12 | mental | empower,ward | Unfaltering Light · Light That Carries |

**Tier 5**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `kept_flame` | **Kept Flame** | 13 | mental | empower,sustain | Kept Flame |
| `lifted_word` | **Lifted Word** | 15 | mental | transform,travel | Lifted Word · Long Ascent |
| `miracle` | **Miracle** | 13 | social | heal,restore,summon | Miracle |

---

## Breaking — ring 4, opposite **Building** · 39 crafts

### The Edge (`marcher`) — 26 crafts

**Tier 1**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `disarm` | **Disarming Strike** | 4 | physical | break,hinder | Disarming Strike · Emptied Hand · Ended Fight  ⚑ harm:incapacitating |
| `held_line` | **Held Line** | 4 | physical | ward,shield,sustain | Set Stance · Long Hold · Line That Held |
| `hunters_strike` | **Hunter's Strike** | 4 | physical | strike | Hunter's Strike · Clean Kill · Strike That Feeds  ⚑ folk · harm:lethal |
| `levelled_crossbow` | **Levelled Crossbow** | 5 | physical | strike | Spanned and Levelled · Belt Claw · Windlass  ⚑ learnedAt:hardline / anywhere · harm:lethal |
| `read_field` | **Read Field** | 4 | practical | empower,reveal | Ground Read · Ground Read · Whole Field |
| `read_the_fight` | **Read the Fight** | 3 | physical | foresee,reveal | Read the Fight · Whole Field · Three Moves Ahead |
| `sling_and_stone` | **Sling and Stone** | 2 | physical | break,strike | Loosed Stone · Aimed Stone · Skull-Weight  ⚑ folk · learnedAt:the wilds · harm:lethal |
| `thrown_edge` | **Thrown Edge** | 3 | physical | strike | Underhand · Second Knife · Full Belt  ⚑ learnedAt:hardline / the wilds · harm:damaging |

**Tier 2**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `advance` | **Advance** | 4 | physical | move | Ground Control · Pressure · Geometry |
| `dressed_edge` | **Dressed Edge** | 5 | practical | make,empower,strike | Dressed Edge · Whole Party · Kept Ready  ⚑ harm:damaging |
| `edge` | **Edge** | 6 | physical | strike | First Cut · Marcher's Calm · Every Reach  ⚑ harm:damaging |
| `long_road` | **Hard Mile** | 3 | physical | empower,sustain | Hard Ground · Keep Pace · Long Campaign |
| `soldiers_hand` | **Soldier's Hand** | 4 | practical | empower,heal | Bind and Stand · Counted Cost · No One Falls While I Stand |
| `stand` | **Stand** | 5 | physical | resist,shield,ward | Stand · Rooted · Line That Holds |
| `weight` | **Weight** | 5 | social | bind,command | Stand Down · Agreement · This Ends Here |

**Tier 3**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `chosen_ground` | **Chosen Ground** | 7 | mental | provoke,deceive,foresee | Chosen Ground · Which Road · Prepared Beforehand |
| `drawn_bow` | **Drawn Bow** | 4 | physical | strike | Long Draw · Kept Rhythm · Heavy Head  ⚑ learnedAt:hardline · harm:lethal |
| `in_the_way` | **In the Way** | 6 | physical | move,hinder,strike | In the Way · That One · Not Him Either  ⚑ harm:lethal |
| `shieldwork` | **Shieldwork** | 6 | physical | shield,strike,empower | Shieldwork · Cover the Open Side · Wall  ⚑ harm:damaging |
| `small_company` | **Small Company** | 6 | mental | empower,command,foresee | Small Company · On the Road · They Keep the Shape |
| `whats_at_hand` | **What's At Hand** | 4 | practical | make,shield,strike | Armed · Ready in Any Room · Marcher's Forge  ⚑ harm:damaging |

**Tier 4**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `break_the_line` | **Breach** | 9 | mental | break,hinder,provoke | Breach · Not Again · From Across the Field  ⚑ harm:incapacitating |
| `the_known_name` | **Known Name** | 8 | social | hinder,provoke,strike | Known Name · Whole Field · Before You Arrive  ⚑ harm:incapacitating |
| `told_of` | **Told Of** | 8 | social | empower,reveal,persuade | Told Of · Carried Further · Arrives Before You |
| `who_falls_first` | **Who Falls First** | 8 | mental | reveal,empower,foresee | Who Falls First · And Then · From the Telling |

**Tier 5**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `last_form` | **Last Form** | 10 | physical | strike | Last Form  ⚑ harm:lethal |

### Ruinwork (`unmaker`) — 13 crafts

**Tier 1**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `clean_taking` | **Clean Taking** | 4 | practical | make,open | Joins Found · Larger Work · Whole Unbuilding |
| `fault_sense` | **Fault-Sense** | 3 | physical | foresee,reveal | Fault-Sense · Rotten Beam · Whole Failing |
| `found_fault` | **Found Fault** | 5 | practical | break,strike | One Place · Clean Break · Beautiful Ruin  ⚑ harm:lethal · backlash:incapacitating |
| `given_way` | **Given Way** | 4 | practical | open | Way Given · Several Ways · Sealed Thing |

**Tier 2**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `clean_removal` | **Clean Removal** | 4 | physical | mend,restore | Precise Removal · What Shouldn't Be There · Clean |
| `demonstrated_end` | **Demonstrated End** | 4 | physical | bind,command | Known Capacity · Demonstrated Threat · Final Authority |
| `ended_burden` | **Ended Burden** | 4 | mental | restore,sustain | Cut · What You Don't Need · Lighter Load |
| `ended_threat` | **Ended Threat** | 4 | physical | break,foresee,shield | Early Intervention · Stopped Thing · Before It Arrives  ⚑ harm:incapacitating |
| `ruinwork` | **Ruinwork** | 6 | physical | break,open,reveal | Fault Line · Clean Break · Good Ending |

**Tier 3**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `open_material` | **Open Material** | 6 | physical | break,transform | Back to Parts · Unformed · Open Form |

**Tier 4**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `undoing_word` | **Undoing Word** | 12 | physical | break | Undoing Word · Longer Unmaking  ⚑ harm:damaging |

**Tier 5**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `last_fault` | **Last Fault** | 15 | mental | break,strike | Last Fault · Whole Fault  ⚑ harm:lethal |
| `last_unmaking` | **Last Unmaking** | 14 | physical | break | Last Unmaking  ⚑ harm:damaging |

---

## Chaos — ring 5, opposite **Order** · 14 crafts

### Wildcraft (`churnfolk`) — 14 crafts

**Tier 1**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `catch_as_catch_can` | **Catch as Catch Can** | 3 | practical | restore,sustain | Flexible Need · Group Scrounging · Chaos Supply |
| `chaos_sense` | **Chaos-Sense** | 3 | mental | foresee,reveal | Chaos-Sense · Coming Turbulence · Break Before It Breaks |
| `loose_thread` | **Loose Thread** | 3 | practical | empower,foresee,reveal | Thread Found · Several Threads · Fraying Whole |
| `misdirect` | **Misdirect** | 3 | practical | deceive,hinder,move | False Signal · Wrong Trail · Wrong Threat |
| `the_long_odds_come_in` | **Long Odds Come In** | 6 | practical | break,strike | Turn of It · Run of Bad · Long Odds  ⚑ harm:lethal · backlash:damaging |
| `the_way_out` | **Way Out** | 4 | practical | conceal,move,reveal | Out Found · Out For Us · Impossible Out |

**Tier 2**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `scatter` | **Scatter** | 4 | practical | break,move | Scatter · Scattering · Nothing Holds  ⚑ harm:incapacitating |
| `wildcraft` | **Wildcraft** | 6 | practical | break,make,transform | Lucky Break · Riding the Churn · Unspooling |
| `wrong_target` | **Wrong Target** | 4 | practical | move,resist,shield | Unpredictable · Moving Gap · Chaos Armor |

**Tier 3**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `churns_gift` | **Churn's Gift** | 7 | practical | make,summon,transform | Churn's Gift · Larger Asking · What the Churn Remembers |
| `probability_tilt` | **Tilt** | 6 | mental | empower,reveal | Tilt · Long Tilt · Loaded World |

**Tier 4**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `lucky_fall` | **Fae Wings** | 11 | physical | travel,transform | Fae Wings · Long Glide · Given Wing |
| `wild_flowering` | **Wild Flowering** | 11 | practical | open,transform | Wild Flowering · Long Flowering  ⚑ harm:incapacitating |

**Tier 5**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `long_odds` | **Long Odds** | 10 | practical | empower | Long Odds |

---

## Span — ring 6, opposite **Spirit** · 30 crafts

### Spanwork (`horizon`) — 16 crafts

**Tier 1**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `folded_pace` | **Folded Pace** | 6 | physical | break,move,strike | Wrong Stride · Gathered Ground · Closed Span  ⚑ harm:lethal · backlash:damaging |
| `known_way` | **Known Way** | 3 | practical | move,reveal,travel | Way Known · Better Way · Whole Country |
| `rivercraft` | **Rivercraft** | 5 | practical | move,reveal,travel | River Legs · Current's Confidant · Watershed Mind  ⚑ folk |
| `road_ahead` | **Road Ahead** | 3 | physical | empower,sustain | Keep Walking · Sustained March · No Stopping Place |
| `shortened_road` | **Shortened Road** | 5 | physical | travel,move,sustain | Ground Given · Long March · Road Made Short |
| `way_sense` | **Way-Sense** | 3 | mental | foresee,reveal,track | Way-Sense · Read Road · Whole Map |
| `wayfinding` | **Wayfinding** | 4 | practical | reveal,travel | Trail Sense · Cold Trail · Country Speaks  ⚑ folk |

**Tier 2**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `fresh_horizon` | **Fresh Horizon** | 4 | physical | empower,heal,restore,sustain | New Ground · Road Restores · Always More Ahead |
| `kept_distance` | **Kept Distance** | 4 | physical | move,resist,shield | Out of Reach · Managed Gap · Untouchable Distance |
| `land_knowledge` | **Land Knowledge** | 4 | mental | command | Scout's Word · Strategic Ground · Known Land |
| `long_reach` | **Long Reach** | 4 | physical | move,strike | Distance Closed · Running Strike · From Wherever You Are  ⚑ harm:damaging |
| `spanwork` | **Spanwork** | 6 | physical | move,travel | Long Stride · Closed Distance · {{region:the_open_reach}} |

**Tier 3**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `made_crossing` | **Made Crossing** | 6 | practical | make,open,reveal,travel | Found Way · Where the Gap Yields · No Uncrossable Gap |

**Tier 4**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `far_step` | **Far Step** | 11 | physical | travel | Far Step · Carried Step |
| `stepped_span` | **Stepped Span** | 12 | mental | travel,transform | Stepped Span · Long Span |

**Tier 5**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `edge_of_the_map` | **Edge of the Map** | 13 | physical | make,travel | Edge of the Map |

### Hourcraft (`hourkeeper`) — 14 crafts

**Tier 1**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `hour_sense` | **Hour-Sense** | 3 | mental | foresee,reveal | Hour-Sense · Long Count · Kept Ledger |
| `kept_count` | **Kept Count** | 3 | mental | reveal,foresee | Count Read · Several Counts · Whole Reckoning of Hours |
| `long_watch` | **Kept Vigil** | 3 | mental | resist,sustain | Patient Duration · Longer Wait · As Long as It Takes |
| `spent_hour` | **Spent Hour** | 6 | mental | break,strike | Levy · Long Toll · Whole Duration  ⚑ harm:lethal · backlash:damaging |
| `stretched_hour` | **Stretched Hour** | 5 | mental | sustain,ward | Hour Given · Held Hours · Long Gift |

**Tier 2**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `given_time` | **Given Time** | 4 | mental | heal,restore,sustain | A Little More Time · Hour Given · All the Time It Needs |
| `hourcraft` | **Hourcraft** | 6 | mental | bind,foresee,reveal | Kept Hour · Slow Hour · Pre-Remembered |
| `wasted_moment` | **Wasted Moment** | 4 | mental | foresee,shield | Their Moment Wasted · No Good Window · Protected Duration |
| `wrong_moment` | **Wrong Moment** | 4 | mental | strike | Their Bad Moment · Chosen Time · No Good Moment for Them  ⚑ harm:lethal |

**Tier 3**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `opened_moment` | **Opened Moment** | 6 | mental | make,move,open | Between Moments · Cleared Interval · Moment Made |
| `shaped_duration` | **Shaped Duration** | 6 | mental | bind,hinder,transform | Stretched Moment · Compressed Duration · Duration to Order  ⚑ harm:incapacitating |

**Tier 4**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `held_hour` | **Held Hour** | 12 | mental | bind,sustain | Held Hour · Kept Hours |

**Tier 5**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `borrowed_hour` | **Borrowed Hour** | 15 | mental | travel,transform | Borrowed Hour · Wide Draw · Taken Year |
| `the_kept_hour` | **Long Foreseeing** | 14 | mental | foresee | Long Foreseeing |

---

## Body — ring 7, opposite **Mind** · 34 crafts

### Soma (`somatic`) — 13 crafts

**Tier 1**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `answered_motion` | **Answered Motion** | 5 | physical | break,strike | Turned Joint · Given Fall · Taken Apart  ⚑ harm:incapacitating · backlash:damaging |
| `body_read` | **Body-Read** | 3 | mental | foresee,reveal | Body-Read · Whole Tell · Body Cannot Lie |
| `false_stance` | **False Stance** | 3 | physical | deceive,conceal | False Stance · Wrong Fight · Nothing True |
| `hurled_weight` | **Hurled Weight** | 4 | physical | break,strike | Get Under It · Committed Throw · Scattering  ⚑ learnedAt:hardline / the wilds · harm:damaging |
| `loose_limbed` | **Loose-Limbed** | 3 | physical | move,travel,resist | Run and Vault · Slip Anything · Nothing Holds |
| `quick_hands` | **Quick Hands** | 2 | physical | hinder,strike | Early Hands · Turned Catch · Both Hands  ⚑ learnedAt:anywhere · harm:damaging |
| `second_wind` | **Second Wind** | 4 | physical | sustain,resist,empower,heal | Embrace the Suck · Third Wind · Dream Breath |
| `steady_hands` | **Steady Hands** | 2 | physical | soothe | Hand On Them · Held Together · Everyone Standing |

**Tier 2**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `perfect_motion` | **Perfect Motion** | 5 | physical | move,resist,shield,strike | Acrobatics · Unwasted Motion · Motion Without Thought  ⚑ harm:damaging |

**Tier 3**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `ki_thorns` | **Ki Thorns** | 6 | physical | ward,strike,resist | Set Thorns · Barbed Frame · Every Touch Answered  ⚑ harm:damaging |
| `shaped_body` | **Shaped Body** | 7 | physical | resist,transform,sustain | Hardened · Seasoned · Body Is Clay |
| `skydancer` | **Skydancer** | 9 | physical | move,travel | Air-Step · Long Air · Carry the Line |

**Tier 5**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `ki_wield` | **Ki Wield** | 12 | physical | strike,shield,resist | Ki Edge · Ki Bolt · Ki Wield  ⚑ harm:lethal |

### Thingcraft (`mason`) — 21 crafts

**Tier 1**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `drumline_stride` | **Drumline Stride** | 7 | practical | empower,move | Catch the Beat · Carried Cadence · Thunder-Step  ⚑ folk · learnedAt:harmonic |
| `echo_sense` | **Echo Sense** | 4 | mental | reveal | Near Echo · Carried Echo · Deep Listening  ⚑ folk · learnedAt:harmonic |
| `keen_appraisal` | **Keen Appraisal** | 4 | mental | reveal | True Worth · Provenance · Nothing Hidden  ⚑ folk |
| `near_way` | **Near Way** | 3 | practical | make,move,open | Seam · Material Passage · Way In |
| `plain_weight` | **Plain Weight** | 6 | physical | break,strike | True Weight · Settled Fact · Leaden Word  ⚑ harm:lethal · backlash:incapacitating |
| `sonic_resonance` | **Sonic Resonance** | 8 | practical | break,move,strike | Focused Push · Standing Wave · Resonant Break  ⚑ folk · learnedAt:harmonic · harm:damaging |
| `sound_read` | **Sound Read** | 3 | practical | empower,foresee,reveal | Hand On It · Whole Fabric · Prepare the Ground |
| `stone_read` | **Stone-Read** | 3 | mental | reveal,track | Stone-Read · Long Grain · Given Word |
| `stonewise` | **Stonewise** | 5 | mental | break,mend,reveal | Sound Footing · Mason's Eye · Bones of the World  ⚑ folk · harm:damaging |
| `tremor_sense` | **Tremor Sense** | 4 | mental | reveal | Ground Ear · Deep Tread · Valley's Pulse  ⚑ folk · learnedAt:harmonic |
| `worth_the_work` | **Worth the Work** | 3 | practical | bargain | Days and Stone · Paid in Work · Standing Account |

**Tier 2**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `boundary_stone` | **Boundary-Stone** | 4 | practical | bind,ward | Boundary-Stone · Kept Boundary · Old Boundary  ⚑ folk |
| `chord_of_mending` | **Chord of Mending** | 10 | practical | empower,heal,mend,restore | Re-seat · True the Frame · Songwright  ⚑ folk · learnedAt:harmonic |
| `set_word` | **Set Word** | 4 | social | bind,command | Plain Statement · Word That Holds · Word As Stone |
| `sound_repair` | **Made Whole** | 4 | practical | mend,restore | Correct Fix · Sound Again · As It Was |
| `thingcraft` | **Thingcraft** | 6 | practical | bind,make,reveal,shield | Weighed Thing · Set Stone · Denial |

**Tier 3**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `reduction` | **Reduction** | 8 | mental | break,reveal | Plain Fact · Reduction · Nothing Left Standing  ⚑ harm:incapacitating |
| `shatterpoint` | **Shatterpoint** | 8 | mental | break,reveal,strike | Flaw-Note · Read the Load · Thin Song  ⚑ folk · learnedAt:harmonic |

**Tier 4**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `keystone_blow` | **Keystone Blow** | 11 | practical | break,reveal | Keystone Blow · Made Keystone  ⚑ harm:damaging |
| `raised_road` | **Rising Step** | 14 | physical | travel,transform | Rising Step · Company Stair · Kept Crossing |

**Tier 5**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `unmaking_of_walls` | **Unmaking of Walls** | 13 | practical | break | Unmaking of Walls |

---

## Dark — ring 8, opposite **Light** · 42 crafts

### Umbracraft (`umbral`) — 26 crafts

**Tier 1**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `carried_dark` | **Carried Dark** | 4 | practical | conceal,move | Pocket of Unlight · Shared Dark · Travelling Night |
| `darksight` | **Darksight** | 3 | mental | move,reveal | Darksight · Deep Sight · Nightborn |
| `dim` | **Dim** | 4 | mental | break,conceal | Dim · Douse · Long Dusk  ⚑ harm:incapacitating |
| `felt_room` | **Felt Room** | 4 | mental | foresee,move,reveal | Read Dark · Held Sense · Whole Deep |
| `known_in_the_dark` | **Known In The Dark** | 3 | social | reveal,resist,empower | Known In The Dark · Whole Room · By Their Absence |
| `long_dark` | **Long Dark** | 3 | mental | resist,sustain | No Fear of Dark · Dark Sustains · Deepest Ground |
| `quiet_step` | **Quiet Step** | 6 | physical | conceal,move | Soft Ground · Unremarked · Unseen Errand  ⚑ folk |

**Tier 2**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `false_trail` | **False Trail** | 4 | practical | conceal,deceive | False Trail · Braided Trail · Trail That Was Never Walked |
| `harbor` | **Harbor** | 5 | mental | conceal,ward | Harbor · Deeper Harbor · Sanctuary |
| `line_and_knot` | **Line and Knot** | 5 | practical | travel,bind,make | Line and Knot · Rigged for Others · Held Without Watching  ⚑ harm:incapacitating |
| `premeditate` | **Premeditate** | 5 | practical | foresee,empower,conceal | Premeditate · Set For Others · Set For Anything |
| `shadowed_mending` | **Shadowed Mending** | 4 | mental | heal,mend | Sure Hands · Dark Aids · Dark Heals |
| `shroud` | **Shroud** | 5 | mental | conceal,deceive | Shroud · Shroudwork · Long Shroud |
| `slow_cup` | **Slow Cup** | 5 | practical | strike,hinder,make | Slow Cup · No Taste At All · Wasting  ⚑ harm:incapacitating |
| `the_kept_dark` | **Kept Dark** | 6 | mental |  | Uninvited Dark · Kept Watch · Harbor |
| `umbracraft` | **Umbracraft** | 6 | mental | command,conceal,move,ward | Seeing Dark · Past Finding · Deep Umbral |

**Tier 3**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `cast_twin` | **Cast Twin** | 7 | mental | summon,make,strike | Cast Twin · Left in Another Hand · Twinned at Distance  ⚑ harm:damaging |
| `kept_dark` | **Kept Dark** | 7 | mental | ward,bind,sustain | Set Threshold · Kept Without You · Underlight |
| `shadow_work` | **Shadow Work** | 5 | mental | conceal,make,transform | Shaped Pocket · Held Dark · Shadow Craft |
| `shadowstep` | **Shadowstep** | 7 | mental | conceal,move,travel | Shadowstep · Stepping Dark · Shadowroad |
| `standing_deep` | **Standing Deep** | 7 | physical | shield,ward,resist | Standing Deep · Two Behind · Nothing Moves You |
| `swallowed_word` | **Swallowed Word** | 7 | mental | bind,hinder,conceal | Swallowed Word · No Word Between Them · Void Space  ⚑ harm:incapacitating |

**Tier 4**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `stopped_breath` | **Stopped Breath** | 12 | mental | strike,conceal | Stopped Breath · Unlit Room  ⚑ harm:incapacitating |
| `unlit_step` | **Unlit Step** | 12 | mental | conceal,travel | Unlit Step · Long Fall |
| `uttered_name` | **Uttered Name** | 10 | mental | bind,command,reveal | Uttered Name · Held Without Speaking · Called and Answered  ⚑ harm:incapacitating |

**Tier 5**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `never_there` | **Never-There** | 10 | mental | conceal,deceive | Never-There |

### Falsecraft (`veilwright`) — 16 crafts

**Tier 1**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `blend_in` | **Blend In** | 3 | social | conceal,deceive | Blend In · One of Them · Nobody At All  ⚑ folk |
| `borrowed_certainty` | **Borrowed Certainty** | 4 | social | empower,sustain | Word Given · Steady Company · Named Cause  ⚑ learnedAt:god_named |
| `ordinary_face` | **Ordinary Face** | 4 | social | conceal,deceive | Expected Person · Held Face · Long Belonging |
| `see_the_made_thing` | **See the Made Thing** | 3 | mental | foresee,reveal | Construction · All the Seams · Unfinished Lie |
| `useful_absence` | **Useful Absence** | 5 | practical | conceal,deceive | Uncounted Thing · Quiet Yard · Missing Wing |
| `wrong_wound` | **Wrong Wound** | 6 | practical | conceal,deceive,strike | Moved Guard · Two Knives · Mistaken Man  ⚑ harm:incapacitating · backlash:damaging |

**Tier 2**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `better_story` | **Better Story** | 4 | mental | heal,restore | Liveable Frame · Healing Retelling · Better True Story |
| `false_door` | **False Door** | 4 | mental | deceive,open,travel | Made Opening · False Wall · Through the Veil |
| `false_target` | **False Target** | 4 | mental | conceal,deceive,shield | False Position · Occupied Pursuit · Protected Real |
| `falsecraft` | **Falsecraft** | 6 | mental | conceal,deceive,sustain | Fitting Mask · Standing Lie · Woven Untruth |
| `maintained_veil` | **Maintained Veil** | 4 | mental | bind,sustain | Running Falsehood · Long Veil · Permanent Feature |
| `wrong_reality` | **Wrong Reality** | 4 | mental | deceive,hinder,strike | Wrong Read · Real Consequence · Indistinguishable  ⚑ harm:incapacitating |

**Tier 3**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `made_truth` | **Made Truth** | 6 | mental | deceive,make,transform | Working False · Transformed History · Built World |

**Tier 4**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `perfect_veil` | **Perfect Veil** | 12 | mental | conceal,deceive | Perfect Veil · Veil That Keeps |

**Tier 5**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `perfect_erasure` | **Perfect Erasure** | 14 | social | bind,deceive,strike | Perfect Erasure · No One At All  ⚑ harm:lethal |
| `useful_lie` | **Necessary Fiction** | 13 | mental | deceive | Necessary Fiction |

---

## Death — ring 9, opposite **Life** · 44 crafts

### Palework (`ashwarden`) — 24 crafts

**Tier 1**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `deathsense` | **Deathsense** | 3 | mental | foresee,reveal | Deathsense · Long Count · Hour Known |
| `hastened_grey` | **Necrotic Strike** | 6 | mental | break,strike | Necrotic Touch · Nearer End · Keeper's Due  ⚑ harm:lethal · backlash:damaging |
| `kept_vigil` | **Kept Vigil** | 4 | mental | sustain,ward | Held Edge · Longer Wait · Unfinished Ending |
| `palework` | **Palework** | 3 | social | persuade,soothe,command,ward | Professional Standing · Called For · Last Authority |
| `the_attended_end` | **Attended End** | 4 | mental | reveal,foresee,track,empower | Patient Gaze · Death's Certainty · Deathly Premonition |
| `true_account` | **True Account** | 4 | social | reveal,empower,bargain,persuade | Reckoning · Ledger of a Place · Whole Reckoning |

**Tier 2**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `dread` | **Dread Mantle** | 4 | social | hinder,bind,provoke | Mantle Worn · Open Ground · Certain Hour  ⚑ harm:incapacitating |
| `grey_hand` | **Grey Hand** | 5 | mental | hinder | Withered Touch · Failing Reach · Grey Hand  ⚑ harm:incapacitating |
| `grey_road` | **Grey Road** | 5 | mental | move,open,resist | Through Here · Passage · Long Walk |
| `kept_breath` | **Kept Breath** | 5 | mental | sustain,resist,heal | Not Yet · Stand Between · Palelands Patience |
| `last_cold` | **Last Cold** | 5 | mental | strike,hinder | Cold Reach · Deep Cold · Last Cold  ⚑ harm:lethal |
| `soul_stare` | **Soul Stare** | 4 | mental | conceal,hinder | Soul Stare · Every Living Thing · Everything Has an Address  ⚑ harm:damaging |
| `wither` | **Wither** | 5 | practical | break,hinder | Wither · Grey Touch · Withering  ⚑ harm:damaging |

**Tier 3**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `ask_the_dead` | **Ask the Dead** | 5 | mental | reveal | Ask the Dead · Long Question · Full Account |
| `bone_lance` | **Bone Lance** | 6 | practical | strike,break | Called Splinter · Bone Lance · Bone Volley  ⚑ harm:lethal |
| `calling_back` | **Calling Back** | 12 | mental | heal,summon | From the Threshold · From the Near Dark · From the Deep Dark  ⚑ harm:lethal |
| `death_ward` | **Death-Ward** | 6 | mental | ward,resist,shield | Warded Ground · Carried Sign · Not Today |
| `draw_down` | **Draw Down** | 6 | mental | heal,strike | Draw Down · Long Draught · Emptied Vessel  ⚑ harm:lethal |
| `grey_ground` | **Killing Field** | 7 | mental | strike,hinder,ward | Marked Ground · Wearing Field · Killing Field  ⚑ harm:lethal |
| `reaping_sickle` | **Reaping Sickle** | 7 | physical | strike,hinder | Conjured Sickle · Reaping Arc · Wide Arc  ⚑ harm:lethal |
| `set_hand` | **Raised Hand** | 9 | mental | summon,bind,command | Set Hand · Standing Crew · Long Labour |

**Tier 4**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `deathless` | **Deathless** | 8 | mental | resist,sustain,empower | Cold Enough · Rot Mends · Not Breathing Often |
| `given_errand` | **Driven Shade** | 11 | mental | summon,bind,command | Driven Shade · Errand Road · Does Not Stop  ⚑ harm:lethal |

**Tier 5**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `the_cut_thread` | **Cut Thread** | 14 | mental | strike | Cut Thread  ⚑ harm:lethal |

### Pathos (`threnodist`) — 20 crafts

**Tier 1**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `carried_name` | **Carried Name** | 4 | social | restore | Name Held · Kept Shape · True Shape |
| `keening` | **Keening** | 4 | social | strike,hinder | Wail · Dark Wail · Oblivion Pulse  ⚑ harm:incapacitating · backlash:damaging |
| `shared_weight` | **Shared Weight** | 5 | social | shield,resist,ward | Portion Taken · Steady Hand · Borne Grief |
| `stillness_field` | **Stillness Field** | 6 | practical | bind,conceal,resist,ward | Stilled Air · Long Quiet · Unspoken  ⚑ folk · learnedAt:harmonic |
| `storykeeper` | **Storykeeper** | 4 | mental | foresee,reveal,track | Long Memory · Threads Between · Keeper of the Deep Stock  ⚑ folk |
| `the_true_feeling` | **Feeling-Sense** | 3 | social | reveal,track | Actual State · Feeling Trail · Emotional History |
| `wellspring` | **Wellspring** | 3 | social | sustain,empower | More in the Depth · Carried Weight · Wellspring Holds |

**Tier 2**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `felt_wall` | **Felt Wall** | 4 | social | reveal,shield | Early Feel · Feeling Guard · Felt Ward |
| `grief_strike` | **Grief Strike** | 6 | social | strike,hinder | True Feeling · Unguarded Place · Shattered Fortification  ⚑ harm:damaging |
| `harmonic_voice` | **Harmonic Voice** | 6 | practical | command,empower,heal | Calming Undertone · Carrying Tone · Concord  ⚑ folk · learnedAt:harmonic |
| `made_elegy` | **Made Elegy** | 4 | social | bind,make | Feeling Held · Acting Elegy · Lasting Work |
| `pathos` | **Pathos** | 6 | social | command,empower,heal | Open Heart · Shared Fire · Deep Chord |
| `public_grief` | **Public Grief** | 4 | social | conceal | Open Weeping · Shared Mourning · Grief-House |
| `voice_of_the_flock` | **Voice of the Flock** | 6 | practical | command,empower | Work-Rhythm · Hunting Chord · One Body  ⚑ folk · learnedAt:harmonic |

**Tier 3**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `echo_memory` | **Echo Memory** | 11 | mental | reveal,track | Lingering Note · Stone Remembers · Long Echo  ⚑ folk · learnedAt:harmonic |
| `shared_grief` | **Under-Song** | 7 | social | reveal,provoke | Under-Song · Named Sorrow · Long Lament |

**Tier 4**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `names_of_the_lost` | **Names of the Lost** | 11 | social | empower,ward | Names of the Lost · Kept Names · Unmeddled Dead |

**Tier 5**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `grief_that_stops` | **Grief That Stops** | 13 | mental | bind | Grief That Stops · All Of It  ⚑ harm:lethal |
| `last_lament` | **Last Lament** | 13 | social | empower,restore | Last Lament |
| `worldsong` | **Worldsong** | 13 | practical | empower | Worldsong  ⚑ folk · learnedAt:harmonic |

---

## Demonic — ring 10, opposite **Angelic** · 23 crafts

### Descent (`abyssal`) — 23 crafts

**Tier 1**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `appetite_sense` | **Appetite-Sense** | 3 | social | reveal | Appetite-Sense · Hollow Read · Whole Hunger |
| `choir_sustains` | **Choir Sustains** | 3 | social | empower,sustain | Deep Holds · Sustaining the Group · Unexhausted Deep |
| `hungry_step` | **Hungry Step** | 3 | practical | move,reveal | Hungry Step · Shared Way · Deep Current |
| `offered_lesser` | **Offered Lesser** | 4 | social | ward,bind | Lesser Given · Standing Offering · Turned Appetite |
| `offered_mouth` | **Offered Mouth** | 6 | social | strike,summon | Introduction · Shown Table · Devouring Introduced  ⚑ harm:lethal · backlash:incapacitating |
| `struck_term` | **Struck Term** | 5 | social | bargain,strike | Terms Offered · Exact Price · Standing Term  ⚑ learnedAt:bargainers · harm:lethal |
| `the_read_hunger` | **Read Hunger** | 3 | mental | reveal,foresee | Shape of Its Eating · Fed and Starving · Great Appetite |
| `the_read_want` | **Read Want** | 4 | social | reveal,foresee | Want Under It · Table Read · Whole Appetite  ⚑ learnedAt:bargainers |
| `veil_stroke` | **Veil Stroke** | 4 | mental | break,strike,summon | Claw Through · Wider Gap · What Comes Most Of The Way  ⚑ harm:lethal · backlash:incapacitating |

**Tier 2**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `appetite_strike` | **Appetite Strike** | 4 | social | strike | Unguarded Want · Named and Struck · Thing They Would Not Name  ⚑ harm:incapacitating |
| `consumed_wound` | **Consumed Wound** | 4 | social | bargain,break,heal,restore | Give It Down · Consumed Entirely · Transfer |
| `descent` | **Descent** | 6 | social | bind,command,reveal | Named Want · Bargain · Deep Descent |
| `descent_path` | **Descent Path** | 4 | social | open,travel | Way Down · Deep Road · Guide the Descent |
| `dread_mantle` | **Dread Mantle** | 4 | social | hinder,shield,ward | Let It Show · Real Weight · It Precedes You |
| `offered_price` | **Offered Price** | 5 | social | bargain,bind,foresee,reveal | Offered Price · Held Price · True Cost |

**Tier 3**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `called_form` | **Called Form** | 5 | social | command,summon,transform | Surfaced Want · Called and Held · What You Called Is Yours |
| `lever` | **Lever** | 10 | social | bargain,bind,command,reveal | Lever · Held Lever · Long Lever  ⚑ harm:incapacitating |

**Tier 4**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `collection` | **Collection** | 12 | social | strike | Collection · Standing Account  ⚑ harm:lethal |
| `deep_covenant` | **Deep Covenant** | 12 | social | bargain,bind,command | Deep Covenant · Covenant That Spreads  ⚑ harm:incapacitating |
| `honest_bargain` | **Honest Bargain** | 11 | social | bargain,bind,command | Honest Bargain · Standing Bargain  ⚑ harm:incapacitating |

**Tier 5**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `borne_bargain` | **Borne Bargain** | 14 | social | bind,travel | Borne Bargain · Standing Passage |
| `drowning_deep` | **Drowning Deep** | 14 | social | hinder | Drowning Deep  ⚑ harm:incapacitating |
| `hollow_that_holds` | **Hollow That Holds** | 13 | social | open,sustain | Hollow That Holds |

---

## Building — ring 11, opposite **Breaking** · 33 crafts

### Makecraft (`wright`) — 20 crafts

**Tier 1**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `glasswork` | **Glasswork** | 3 | practical | conceal,make | Caught Light · Set Piece · Valley Glass  ⚑ folk · learnedAt:radiant_folk |
| `glimmer_script` | **Glimmer Script** | 4 | practical | conceal,make,ward | Fingerlight · Keyed Hand · Written In Light  ⚑ folk · learnedAt:radiant_folk |
| `held_repair` | **Held Repair** | 3 | practical | mend,sustain | Thing Persuaded · Long Persuasion · Kept Machine |
| `light_well` | **Light Well** | 5 | practical | bind,heal,hinder,ward | Carried Coal · Banked Noon · Bottled Summer  ⚑ folk · learnedAt:radiant_folk |
| `makers_eye` | **Maker's-Eye** | 3 | mental | make,reveal | Maker's-Eye · Better Shape · Thing It Wants to Be |
| `quick_work` | **Quick Work** | 4 | practical | make | Thing Made · Larger Build · Built Answer |
| `raised_thing` | **Raised Thing** | 4 | practical | make,mend | Raised Thing · Sound Work · Thing That Outlasts |
| `second_pair_of_hands` | **A Second Pair of Hands** | 3 | practical |  | Uninvited Apprentice · Genuinely Useful · One Who Argues |
| `sudden_work` | **Sudden Work** | 6 | practical | break,make,strike | Driven Spar · Raised Work · Thing That Was Not There  ⚑ harm:lethal · backlash:incapacitating |
| `tinkers_hand` | **Tinker's Hand** | 5 | practical | make,mend,open | Field Fix · Coaxing Function · Speaker to Machines  ⚑ folk |

**Tier 2**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `built_way` | **Built Way** | 5 | practical | make,open,travel | Crossing · Made Passage · Road That Wasn't |
| `clarity_lens` | **Clarity Lens** | 5 | mental | empower,reveal,track | Jeweler's Air · Far Glass · Patient Eye  ⚑ folk · learnedAt:radiant_folk |
| `makecraft` | **Makecraft** | 6 | practical | make,mend,shield,sustain | Quickmake · Made Better · Unfinished |
| `ongoing_work` | **Ongoing Work** | 4 | physical | empower,sustain | Hands Moving · Built Through It · Left in Motion |
| `weapon_at_hand` | **Weapon at Hand** | 4 | practical | make,strike | Improvised · Made to Harm · Right Tool  ⚑ harm:damaging |
| `work_speaks` | **Work Speaks** | 4 | social | command,reveal | Demonstrated Craft · Reputation · Undeniable |

**Tier 3**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `sun_seal` | **Sun-Seal** | 6 | practical | bind,shield,ward | Sun-Seal · Deeper Seal · Seal That Holds  ⚑ folk · learnedAt:radiant_folk |
| `true_making` | **True Making** | 7 | practical | make,mend | True Making · Set Sound · Work That Outlasts |

**Tier 4**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `reforging` | **Reforging** | 11 | practical | make,mend | Reforging · Deep Reforging |

**Tier 5**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `masterwork` | **Masterwork** | 13 | practical | empower,make | Masterwork |

### Stillcraft (`stillhold`) — 13 crafts

**Tier 1**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `broken_quiet` | **Broken Quiet** | 6 | mental | break,strike | Lid Lifted · Long Silence · Hold Breaks  ⚑ harm:lethal · backlash:damaging |
| `calm_word` | **Calming Word** | 4 | social | bind,command,heal | Calming Word · Cooling Word · Word That Lands |
| `hearthbinding` | **Hearthbinding** | 5 | social | bind,heal,sustain | Good Camp · Table Peace · Standing Hearth  ⚑ folk |
| `mediators_tongue` | **Mediator's Tongue** | 5 | social | bargain,bind,command | Cool the Room · Fair Measure · Binding Word  ⚑ folk |
| `read_the_room` | **Read the Room** | 3 | social | foresee,reveal | Read the Room · Room's True Weather · Thing Nobody Said |

**Tier 2**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `laid_ground` | **Laid Ground** | 5 | social | make,sustain,ward | Marked Place · Held Ground · Lasting Ground |
| `price_shown` | **Price Shown** | 4 | social | bargain,hinder,reveal | Reckoning · Room That Sees · Unseen Thing  ⚑ harm:incapacitating |
| `safe_ground` | **Safe Ground** | 4 | social | heal,sustain | Clear Camp · Known House · Open Table |
| `step_between` | **Step Between** | 4 | physical | move,shield | Step Between · Living Line · Already There |
| `stillcraft` | **Stillcraft** | 6 | social | bind,shield,sustain | Held Room · Binding Truce · Long Peace |

**Tier 3**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `broker_truce` | **Broker Truce** | 6 | social | bind,restore,sustain | Broker Truce · Kept Truce · Binding Peace |

**Tier 4**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `held_breath` | **Held Breath** | 9 | social | bind,resist,shield | Held Breath · Long Breath |
| `quieting` | **Quieting** | 13 | physical | strike,ward | Quieting · Held Field  ⚑ harm:lethal |

---

## Order — ring 12, opposite **Chaos** · 38 crafts

### Enginecraft (`enginewright`) — 12 crafts

**Tier 1**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `mech_sense` | **Mechanism-Sense** | 3 | mental | reveal,track | Mechanism-Sense · Whole Mechanism · Engine's Confession |
| `mend_device` | **Mend** | 4 | practical | empower,make,mend | Mend · True Mend · Better Than New |
| `running_engine` | **Running Engine** | 3 | practical | resist,sustain | Calibrated Effort · Maintained Function · Indefinite Run |
| `seized_works` | **Seized Works** | 6 | practical | break,strike | Seized At Load · Failing Line · Great Refusal  ⚑ harm:lethal · backlash:damaging |

**Tier 2**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `command_engine` | **Command the Small Engine** | 5 | practical | command,mend | Command the Small Engine · Larger Engine · Engine Obeys |
| `fault_strike` | **Fault Strike** | 4 | practical | break,strike | Fault Point · Controlled Failure · One Strike  ⚑ harm:incapacitating |
| `mechanical_defense` | **Mechanical Defense** | 4 | practical | resist,shield,ward | Redirected Force · Set Defense · Active System |

**Tier 3**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `enginecraft` | **Enginecraft** | 8 | practical | command,make,mend | Wright's Eye · System-Speaker · Master of the Works |
| `shortfold` | **Shortfold** | 7 | mental | move,travel | Shortfold · Longer Fold · Folded Road |
| `the_old_procedure` | **Old Procedure** | 7 | practical |  | Assignment · Kept Lamp · Chosen Function |

**Tier 4**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `self_mending_work` | **Self-Mending Work** | 12 | practical | make,mend | Self-Mending Work · Work That Learns |

**Tier 5**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `deep_works` | **Deep Works** | 13 | practical | make | Deep Works |

### Latticework (`lattice`) — 26 crafts

**Tier 1**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `carrying_call` | **Carrying Call** | 3 | practical | command,travel | Call That Carries · Worked Line · Whole Valley Hears  ⚑ folk · learnedAt:harmonic |
| `established_route` | **Established Route** | 3 | practical | move,open,travel | Protocol Path · Seam-Walker · Inside Line |
| `motes_vigil` | **Motes' Vigil** | 5 | mental |  | Curious Constellation · Kindled Chorus · What She Tastes |
| `order_sense` | **Order-Sense** | 3 | mental | reveal | Order-Sense · Pattern Beneath · Whole Design |
| `ordered_record` | **Ordered Record** | 3 | mental | bind,foresee,reveal | Departure Named · Held Order · City's Order |
| `predicted_man` | **Predicted Man** | 5 | mental | bind,break,hinder,strike | Closed Line · Solved Position · Resolved Man  ⚑ harm:lethal · backlash:damaging |
| `working_order` | **Working Order** | 4 | mental | make,bind,empower | Arrangement Set · Standing Arrangement · Ordered Body |

**Tier 2**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `beacon_thread` | **Beacon Thread** | 7 | practical | bind | Hearth-Line · Woven Watch · Constellation  ⚑ folk · learnedAt:radiant_folk |
| `latticework` | **Latticework** | 6 | practical | break,make | Sure Plan · Binding Frame · Grand Order |
| `maintained_order` | **Maintained Order** | 4 | practical | bind,sustain | Kept Running · Against Entropy · Standing Order |
| `old_roads` | **Old Roads** | 4 | mental | reveal,travel | Straight Feeling · Reading the Bones · Where They Walked  ⚑ folk |
| `resonant_anchor` | **Resonant Anchor** | 9 | practical | bind,resist,shield,ward | Set Stance · Breakwater · Mountain's Patience  ⚑ folk · learnedAt:harmonic |
| `resonant_shield` | **Resonant Shield** | 12 | practical | resist,shield | Flicker Guard · Held Chord · Bulwark Harmony  ⚑ folk · learnedAt:harmonic |
| `set_to_rights` | **Set to Rights** | 2 | practical | heal,mend,restore | Correct Assessment · Structural Repair · Full Restoration |
| `truename_order` | **Set in Order** | 4 | practical | bind,command,restore | Set in Order · Righted Thing · As It Should Be |

**Tier 3**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `address_sense` | **Address-Sense** | 8 | mental | reveal,track | Standing Vector · Coordinate Read · Address Itself |
| `fixed_point` | **Fixed Point** | 6 | practical | bind,resist,shield | Fixed Point · Anchor · Point That Does Not Move |
| `latticespeak` | **Latticespeak** | 8 | practical | bind,reveal | Handshake · Deeper Grammar · Fluent in the Old Tongue |
| `prism_ward` | **Prism Ward** | 10 | mental | resist,shield,ward | Threshold Eye · Woven Rooms · Bright Fence  ⚑ folk · learnedAt:radiant_folk |

**Tier 4**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `carrying_note` | **Carrying Note** | 12 | mental | travel,transform | Carrying Note · Long Carry  ⚑ folk · learnedAt:harmonic |
| `foreclose` | **Foreclose** | 13 | mental | bind,break | Close the Door · Standing Denial · It Will Not Be  ⚑ harm:incapacitating |
| `riding_order` | **Riding Order** | 9 | practical | break | Riding Order · Long Riding |
| `sustained_chord` | **Sustained Chord** | 12 | practical | empower,sustain | Sustained Chord · Standing Chord  ⚑ folk · learnedAt:harmonic |
| `wake_the_line` | **Wake the Line** | 12 | practical | command,open,summon | Stir the Buried · Line Runs · Road Remembers |

**Tier 5**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `hold_the_aperture` | **Hold the Aperture** | 11 | social | bind,open,ward | Held Gap · Against the Tendency · Standing Refusal |
| `unmake_seal` | **Unmake Seal** | 12 | mental | break,open,strike,summon | Lesser Seals · Deep Doors · Nothing Stays Shut |

---

## Spirit — ring 13, opposite **Span** · 13 crafts

### Numenwork (`numinous`) — 13 crafts

**Tier 1**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `bound_witness` | **Bound Witness** | 4 | social | bind,reveal | Bound Witness · Held to It · Standing Witness |
| `hallowed_ground` | **Hallowed Ground** | 4 | social | ward,resist | Hallowed Ground · Kept Place · Named Ground |
| `numen_sense` | **Numen-Sense** | 3 | social | reveal | Numen-Sense · Thinning · Numen Plain |
| `steady_soul` | **Steady the Soul** | 4 | social | empower,heal,resist | Steady the Soul · Steadied Hand · Unshaken |
| `thin_step` | **Thin Step** | 3 | practical | move | Thin Step · Taken Through · Long Thin |
| `unbroken_practice` | **Unbroken Practice** | 3 | social | resist,sustain | Form Holds · Endurance of Attendance · As Long as the Practice Continues |

**Tier 2**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `answering` | **Answering** | 6 | social | soothe,persuade | Answering · Answered Early · Standing Answer |
| `dimmed_meaning` | **Dimmed Meaning** | 4 | social | break,hinder | Weight Withdrawn · Broken Meaning · Voided Place  ⚑ harm:incapacitating |
| `plain_seeming` | **Plain Seeming** | 6 | social | conceal | Plain Seeming · Unremarked · Nothing Here |
| `weight_of_practice` | **Weight of Practice** | 4 | social | bind,command | Settled Presence · Deep Pull · Organizing Presence |

**Tier 3**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `thin_place` | **Open the Thin Place** | 6 | social | make,open,strike,summon,sustain | Open the Thin Place · Held Thin Place · Open Door  ⚑ harm:lethal |

**Tier 4**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `open_threshold` | **Open Threshold** | 14 | mental | bind,summon | Open Threshold · Long Door · Door That Waits  ⚑ harm:lethal |

**Tier 5**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `waygate` | **Waygate** | 12 | mental | open,summon,travel | Waygate |

---

## Pending R33 lineage assignment · 3 crafts

⛔ **R33 (SNG-443): `tradition` is LINEAGE, `learnedAt` is ACCESS.** Every craft below still
carries a PLACE (or an unresolved value) in its `tradition` field where a real pole belongs.
⚠️ **This is not a corrected state — it is the error R33 names, not yet re-authored.** A foothill
craft has a lineage and therefore a domain; only the PLACE has no ring position. ⛔ **This
generator does not assign the lineage** — `foothills.json`'s blends are weights across a whole
foothill, and which parent one craft actually descends from is authoring, not arithmetic. Once
`tradition` is corrected to the real pole (with `learnedAt` carrying the place), these crafts
fall into their domain section automatically on the next run.

### `cross_pole_braid` — 3 crafts (not in foothills.json — genuinely unresolved, not a place-lineage confusion)

**Tier 4**

| id | name | energy | attr | functions | ranks |
|---|---|---|---|---|---|
| `harbored_flame` | **Harbored Flame** | 9 | mental | conceal,heal | Harbored Flame · Carried Harbor |
| `meaning_engine` | **Meaning-Engine** | 9 | mental | command,mend | Meaning-Engine · Deeper Register |
| `turning_word` | **Turning Word** | 9 | social | bind,heal | Turning Word · Word That Holds |

---
<!-- END skills-generated -->
