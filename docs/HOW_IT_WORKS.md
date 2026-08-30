# HOW IT WORKS

⛔ **THIS DOCUMENT IS EXECUTABLE. `tests/how_it_works.mjs` asserts every claim below against the live
engine — BUILT claims must hold, PROPOSED claims must still be unbuilt, and known gaps must still be open.**
⚠️ **A gap that closes turns its check RED, so a fixed gap forces this file to be edited. The doc cannot
silently rot.**

⛔ **THE DOCUMENT SET.** [`PIPELINE.md`](PIPELINE.md) is how work moves from a concept into the game and who owns each stage. [`PLAYERS_GUIDE.md`](PLAYERS_GUIDE.md) is the same game told to a PLAYER — nouns and verbs, no field names, and gated so it cannot quietly stop being true. `SYSTEM_SPEC.md` is why the design is this way.

⛔ **COMPANION: [`FIELD_REFERENCE.md`](FIELD_REFERENCE.md)** — this file says what the game DOES; that one
says **what each field IS, who reads it, and what happens when it is absent.** ⚠️ **107 authored fields,
measured: 84 read, 19 dark, 3 CI-only, 1 name-collision.** It carries the axis-family untangling, the two
rank-ladder shapes, which `cfg` object each consumer expects, the engine contracts that cost a false
finding, and the defect taxonomy. **Its atlas table is generated and its numbers are gated.**

⛔ **REQUIRED FOR SINGULARITY (Erik, 2026-08-28): every spec, every authoring, every wiring, every update is
logged with its INTENT, HOW IT IS EXECUTED AND TESTED, and WHAT IT IMPACTS AND WHAT IMPACTS IT.** ⚠️ **Aevi
and CCode maintain this jointly and work toward complete agreement on all content.** The `po/` files are
working papers; **this is the answer.**

---

## 0 · THE LOG

| date | change | intent | tested by | impacts / impacted by |
|---|---|---|---|---|
| 08-28 | doc created | Erik: *"tell me how it works and what it does and I verify that's what I want"* | — | replaces reconstructing the model from spec archaeology |
| 08-28 | doc made executable | a spec nobody runs is a spec that drifts | `tests/how_it_works.mjs`, 97 assertions | ⛔ every section below; a fixed gap goes RED |
| 08-28 | `reachOf` clamped on the base path | §6 says the sealed rung is reachable by NOTHING at any rank; it was clamped on surge only | `how_it_works.mjs` §6 | ⚠️ latent — no rank-4 craft exists yet |
| 08-28 | §3 healing inversion → **PROPOSED** | it read BUILT; `absorb` machinery exists but **no sheet authors `decay: absorb`** | measured: 3 files mention absorb, none is a bestiary entry | §48 undeath, which is also PROPOSED |
| 08-28 | §5 degrade path named | CCode could not find it and asked rather than guess | `resolveImposition` verified live | `impositionOf`, every `imposes` block |
| 08-28 | §8 blind/taunt → **RULED** | Erik: *"you can taunt from the darkness"*; the engine was right | `how_it_works.mjs` §8 — doc corrected, assertion should now pass | `targeting.js` unchanged |
| 08-28 | §8 **a hazard is not a foe** | Erik: *"a rockfall isn't a foe, it's an obstacle or a hazard"* | — | ⚠️ targeting policy applies to things that CHOOSE; hazards need no policy |
| 08-28 | ⛔ **`blind` policy misnamed — OPEN** | Erik: *"blind is CAN'T SEE"*; the policy is a random picker | ⚠️ needs a rename, not a behaviour change | `targeting.js` `POLICY_NEEDS`, `set_hand_labour` and any foe authored `blind` |
| 08-28 | §9 corrected — two "derived" values are **AUTHORED** | §9 is an instruction to DELETE; a value wrongly listed there is a deletion order against correct content | `how_it_works.mjs` §9, both directions | ⛔ `power_sources.byTradition` (24 rows) and `damageTypeByTradition` (13) are now protected, not condemned |
| 08-28 | §5 degrade asserted | Aevi named `resolveImposition`; a named path with no test is still untested | `how_it_works.mjs` §5 — resisted `unconscious` lands as `action_loss` | closed vocabulary: a `degradesTo` outside IMPOSABLE now refuses |
| 08-28 | §11 testing contract added | two rules learned the expensive way in one afternoon | `how_it_works.mjs` §11 asserts every defect-reporting tool has a floor | binds both authors; `safe_delete.mjs` and this harness |
| 08-28 | §0b log made mechanical | a requirement nobody checks lapses in a week | `how_it_works.mjs` §0b — five columns, non-empty, names its change | ⚠️ Erik's 08-28 logging rule now has teeth |
| 08-28 | §8 body corrected to match the ruling | the log said "doc corrected" and the sentence was still there — exactly the drift this file is meant to catch | `how_it_works.mjs` §8, now green | ⚠️ a logged change that was never made |
| 08-28 | ✅ **21 of 25 compound `extend` axes SPLIT** | the engine extends ONE dimension per delta, so `targets+duration` extended NEITHER | `how_it_works` FR counts · content_ci 17→16 | ⛔ 17 fully split, 4 half-split; deltas 495 → 512 |
| 08-28 | ✅ **27 narrative `extend` axes RULED PROSE** | `reach` `persistence` `foresight` `timeReach` have no engine field and say something no field says | ⚠️ marked in-file so nobody "fixes" them to a nearby field | ⛔ `craft_mechanics.operativeAxis` SNG-263 r4 — CCode's own note, NOT an Erik ruling |
| 08-29 | ✅ **MIND AND BODY AUDIT COMPLETE** | ⛔ somatic **24 → 13**, cogitant **21 → 9**; everything remaining is `r1-deepens` (the first-gift template's own convention, marked DO-NOT-FIX) and one energy judgement | `craft_lint` per tradition · `content_which` · `content_ci` 13 | ⛔ **14 crafts carried a HARM WORD in `intensity`** — `"moderate"`, `"severe"` — from an older schema, so they had **no conserve and no surge** and silently resolved at standard only |
| 08-29 | ⛔ **I WROTE A NARRATIVE COST AGAIN — SIXTH TIME** | Erik: *"NO on the r3 cost… geezus. COST IS ENERGY!"* ⚠️ I wrote *"people stop touching you, and that is a cost the craft does not measure"* into a `cannot` | ⛔ replaced with a plain scope limit: it answers every hand, including a friend's | ⚠️ **a `cannot` is what the craft WILL NOT DO. Colour goes in narrationHints or nowhere** |
| 08-29 | ⛔ **THE TRADITIONS ARE ONE-DIMENSIONAL AND I WAS AUDITING A CRISIS LINE AS A CULTURE** | Erik: *"harboring what the light would destroy does not define a people of the dark — that's ONE THING. Just like death is not just grey. HOW DO THESE PEOPLE CELEBRATE, HUNT, FUCK, TRAVEL, FIGHT?"* | ⚠️ Umbral culture written into `tradition_profiles` from corpus material only | ⛔ **the moon nexus was already authored (new +2 / full −2) — so a NEW MOON IS A FESTIVAL AND A FULL MOON IS A FAST**, and `economy` already made worked light socially dangerous to sell in the Depths |
| 08-29 | ⛔ **A LIGHT CREATES SHADOWS — the tradition had light backwards** | Erik: *"just because they are Umbral doesn't mean they hate all light… they do have some lights down there too, biolume."* ⚠️ **The Depths are canon-authored as *"sunless underworlds LIT BY LIVING GLOW"*** | — corrected in `shadowstep`, `shadow_work`, `long_dark` and the culture | ⛔ **I had authored TWELVE crafts where light CLOSES the working and NONE where it ENABLES one.** ⚠️ **AND THEN OVERCORRECTED — Erik: *"don't go overboard, a lightless room isn't useless to an Umbral."* They are at home in the dark; the only thing it denies them is SHAPING shadow, because there is none to shape** |
| 08-29 | ✅ **`The Long Patience` → `Set To Wait`** | Erik: *"good assassin skill — IT'S NOT 9 NIGHTS THOUGH. It's ANY TIME YOU SET UP TO WAIT FOR SOMETHING."* | — | ⛔ **duration was never the point.** The ranks now buy **companions** and **pierce**, not spectacle: *"it works the same at twenty minutes as at two days — what it needs is that you CHOSE the place and were there first"* |
| 08-29 | ⛔ **both new crafts REBUILT — they were not amazing** | Erik: *"make sure those crafts pass the questions… they don't seem amazing to me."* ⚠️ `known_in_the_dark` was a social read with no teeth; `the_long_patience` bought a **+3 setup bonus for a night of game time** | `craft_lint umbral` 0 | ⛔ now: **cannot be flanked and fights at full effect in total darkness** · **the opening out of a wait AUTO-CRITS, costs them their action, and carries PIERCE at r3** |
| 08-29 | ✅ **two crafts the CULTURE demanded** | `known_in_the_dark` — the tradition could see in the dark and know a ROOM and **had no way to know a PERSON**, in a people whose endearment is *"I would know you in the dark"* · `the_long_patience` — 11 concealment crafts and **nothing for WAITING**, where the culture says *"the kill is unremarkable; the SITTING is the craft"* | `craft_lint umbral` 0 | ⛔ **theft here is an INFORMATION trade before a hands trade: in a city where nothing is displayed, value is KNOWN rather than seen** |
| 08-29 | ✅ **UMBRAL AUDIT: 10 → 0, plus the craft the PEOPLE were missing** | ⛔ **15 crafts, `conceal` on ELEVEN — the most concentrated tradition audited — and NOTHING that keeps a person once found** | `craft_lint umbral` 0 · gates green | ⛔ **the Reach's own crisis line named it: *"the Underlight HARBORS WHAT THE LIGHT WOULD DESTROY… neither pole is innocent."* HARBOURING IS NOT HIDING** |
| 08-29 | ⛔ **`the_kept_dark` — a refuge that refuses by name** | the tradition could hide a person and could not HOLD a refuge against someone who had found it: no `ward`, no `bind`, no threshold | ⚠️ `wardTypes: [shadow, radiance]` — **it answers the Blaze specifically** | ⛔ **it INVERTS the tradition on purpose: a kept dark is EASY TO FIND and HARD TO ENTER**, the reverse of every other umbral craft |
| 08-29 | ⛔ **the unmigrated batch appears in a FIFTH tradition** | empty `notFor` + off-vocabulary challengeTypes + below-band energy, **all three on the same crafts** | — | ⚠️ `long_dark` was **e1**; `shadow_work` **e2** for shaping darkness as a material |
| 08-29 | ⛔ **STOP PUTTING DOWNSIDES ON HEROIC CRAFTS** | Erik: *"STOP THE NEGATIVE ASPECTS OF HEROIC SKILLS!! Stop!"* — I had authored *"healing harms you, a mending costs you, you flinch from a field-dressing"* onto an L4 capstone | ⛔ **every penalty removed. `Deathless` is now what an Ashwarden GETS: cold cannot reach her, rot mends her, her hands do not tire** | ⚠️ **a capstone that punishes the player for taking it is not a capstone.** Same family as the narrative-cost error, one level up |
| 08-29 | ⛔ **`worn_grey` → `Deathless`; grey thinned 48 → 38** | Erik: *"NOT Worn Grey!! Stop using grey!!"* | — | ⚠️ **the tradition already carries `Grey Hand` and `Grey Road` as proper names; the loose prose uses are now `ashen` or `rot`** |
| 08-29 | ⛔ **`ki_thorns` answers an ATTACK, not contact** | Erik: *"It's KI. It responds to an attack, not when friends touch you"* | — `bounds[2]` now: **ki reads intent** | ⚠️ **I had made a heroic craft into a liability, and it was wrong on the fiction: ki answers aggression, it is not a trap that cannot tell a blow from a hand** |
| 08-29 | ✅ **`dread` SPLIT — `Deathless` authored** | Erik: *"seems like a lot stacked onto Dread Mantle"* — ⛔ it carried **four** mechanics, and `wornBenefits` **is not a fear craft at all** | `craft_lint ashwarden` 4 · gates green | ⛔ **the tell was in the text: both wearer-effects were bolted to the END of r2 and r3 with *"AND the mantle is on you"*.** Dread keeps what it does to OTHERS; Worn Grey keeps what it does to the WEARER |
| 08-29 | ✅ **`bark_and_briar` thorns now CUT** | Erik: *"should get damaging thorns as it ranks"* and *"a mix of life and physical"* | ⛔ `living` .6 + `physical` .4 — VITAL and PHYSICS together: **growth turned against you, delivered as edge** | ⚠️ **the craft already said *"thorns that make you COSTLY to grapple"* and dealt nothing** — costly was a word with no number behind it |
| 08-29 | ⛔ **`ki_thorns` — THE FIRST RETALIATION CRAFT IN THE GAME** | Erik: *"I think ki thorns might be cool too — something that damages someone who hits you"* | ⚠️ **grepped 381 crafts: NOTHING answers being hit.** `reflectByDegree` reflects CONDITIONS on an intercepted binding — this is a passive answer to DAMAGE | ⛔ **`force` got its first carrier, and the which-check immediately found no ward answered it** — closed by `mechanical_defense` (*"interlocking parts and REDIRECTED FORCE"*) and `resonant_shield` (*"dampens incoming force"*), both of which already said so in prose |
| 08-29 | ⚠️ **and it is the strongest evidence for rule 8** | I had just argued Body's missing verbs *"read as characterisation"* | — | ⛔ **Body had no retaliation because nobody had thought of it. *"Ki is energy and this is a fantasy game"* produced two crafts in one sitting** |
| 08-29 | ✅ **two coverage gaps closed, both found by comparing the four audited traditions** | Erik read the family/verb table: *"seems like body should have vital in it… and I agree about light needing some hindering"* | `content_which` · re-measured: **BODY physics+vital, LIGHT 19/28 verbs** | ⛔ `second_wind` r3 *heals outright* and carried no type · `unshadow` was **`shape: hobble` with no `hinder`** — the shape said it impairs and no rank said how |
| 08-29 | ⛔ **BLAZEBORN GAINED TWO CRAFTS THE PLACE ALREADY DESCRIBED** | Erik: *"you wrote most of these skills back when you still weren't treating this as a fantasy game. Think about the Radiant peoples — WHAT DO THEY DO?"* | ⚠️ measured verb coverage against the corpus, then read the authored geography | ⛔ **`the_lensward` — an authored PLACE — says the focusing arrays are *"the beam-craft that makes them feared"* and NO SUCH CRAFT EXISTED.** ⚠️ And the Wastes are a *"glass plain, flat, glaring"* with no landmarks and an expanding Blaze — **no communication craft at all** |
| 08-29 | ✅ **BLAZEBORN AUDIT: 17 → 0 findings** | six harm crafts, **zero typed** — the tradition `heat` and `radiance` were kept in the families table for | `craft_lint blazeborn` · `content_which` · `content_ci` 13 | ⛔ **four of the six are NOT BURNING — they REVEAL.** `unshadow` is pure `truth`; `revealing_burn` is `truth` .7 + `radiance` .3. **"Burn" is a metaphor in that craft and the typing must not follow the word** |
| 08-29 | ✅ **a six-craft unmigrated batch closed** | all six had **empty `notFor` + lowercase off-vocabulary challengeTypes + energy below band** — three fingerprints together is how a BATCH is identified rather than a sloppy craft | as above | ⚠️ `blazing_word` was **e1** for a craft that binds what you say in front of witnesses |
| 08-29 | ⛔ **`step_between` RELADDERED — the action cost was not a rank** | Erik: *"it already uses the action to use the skill"* — ⚠️ **every craft does, so I had made "it costs your action" the progression when it is just how actions work** | verified live at r1/r2/r3 | ⛔ real ladder: **r1 one blow · r2 SOAK 5 vs physical, 3 rounds · r3 SOAK 7 vs physical AND force, 3 allies, plus a short hop** |
| 08-29 | ⚠️ **the hop is the FICTION THAT EARNS the multi-intercept** | Erik's design — *"you do not stand in front of three people, you ARRIVE IN FRONT OF EACH IN TURN"* | — | ⛔ **not a teleport craft**: `shortfold` (r30) and `opened_moment` (r5) go SOMEWHERE; this goes only where a blow is arriving, only to take it |
| 08-29 | ⛔ **`soakBonus` WAS AN INVENTED FIELD — REMOVED. Soak already scales.** | Erik: *"it is unacceptable to write a spec like this. YOU HAVE THE ENTIRE PIPELINE AND ALL THE DOCUMENTATION TELLING YOU EXACTLY HOW SOAK IS ACCOUNTED FOR."* | ✅ verified live: `mechanicFor` resolves soak **2 → 3 → 4** across the ranks, via `rankDeltas` `extend` on the `soak` dimension | ⛔ **`soak` and `soakRank` are BOTH in the 19-name mechanical allow-list; the craft already carried `mechanic.soak: 2`; `FIELD_REFERENCE` records `soak` already being used as an extend dimension; and I specced the rankDeltas adapter myself. THREE DOCUMENTS I WROTE SAID HOW, AND I ADDED A FIELD** |
| 08-29 | ✅ **PIPELINE rules 5 and 6 written** | Erik: *"document what you've learned in the pipeline docs so this doesn't happen again"* | ⚠️ prose, not gated — but each names the discriminator that would have caught it | ⛔ **5: grep the WORD, not the file** — four incidents this month of reading one file and concluding about the corpus. ⛔ **6: a gate reports a DISAGREEMENT and cannot say which side is wrong** |
| 08-29 | ✅ **the AUTHORED-door failure documented in both docs** | two readers shipped with no schema entry in one week, both carrying *"let content turn it on"* — and content could not | `FIELD_REFERENCE` seventh-way section · `PIPELINE` measured-breaks | ⚠️ **checkable and nothing checks it: every reader naming an authored field should have a schema declaration** |
| 08-29 | ⚠️ **NEW CANON: AT ~L100 YOU ASCEND OR FALL ACROSS THE VEIL** | Erik. ⛔ **ONLY THE CROSSING IS NEW** — I authored `mythical` as a fourth tier and **the `mythic` rung had existed since SNG-280**: 126 uses, attention budget 3, its own challenge mechanism, and Erik had tied Mythicals to a **Precursor–Veil braid on 2026-08-15** | ⛔ **corrected: the ladder is now REFERENCED from `arc_response.attentionByTier`, not restated, so it cannot drift again** | ⛔ **it makes `arc_the_disagreement` REACHABLE — the endgame is not defeating the Precursors, it is BECOMING ONE OF THE PARTIES** |
| 08-29 | ⛔ **the NPC level cap of 20 is CRUFT** | Erik. ⚠️ **the world arcs move through NPCs who climbed the ladder, and every `hingeNpcs` entry on all eleven arcs is capped below a mid-game player** | `po/SPEC_mythicals_and_the_npc_cap.md` — CCode's to remove | ⚠️ **`levelCap` has NO content dial** — a code default that cannot be tuned without a rebuild |
| 08-29 | ✅ **`step_between` TURNS ON `interceptDamage` — `intercept.js` is no longer dark** | CCode's design §6.3: *"a guard craft that catches blows, and SPENDS AN ACTION to do it — the action cost IS the design; without it the tank is a wall and casualties go to zero"* | verified live: `catches:["damage"]` reads at r1/r2/r3 | ⛔ **the reader shipped CCODE-260 with the note "let content turn it on"; this is content turning it on** |
| 08-29 | ⛔ **`interceptDamage` DECLARED — second four-doors failure at the AUTHORED door** | the reader existed, the schema was never told, and the first craft to use it was rejected | `content_ci` 15 → 13 | ⚠️ **after `mechanic.damageMix` two days ago — this is now a PATTERN, not an incident: a reader shipped without a schema entry is a feature no one can author** |
| 08-29 | ⛔ **I GOT THIS WRONG TWICE, IN OPPOSITE DIRECTIONS** | ⚠️ Erik: *"not paying enough attention to the specifics of each craft"*, then *"are you sure perfect motion doesn't deal damage? I thought that one was A FLURRY OF BLOWS."* **Both corrections were right** | ⛔ **the lint reports a DISAGREEMENT and cannot say which side is wrong** — I assumed the ability was, batched three, then over-corrected two | ⚠️ **FINAL: `quick_hands` and `perfect_motion` DO damage** (both declare `strike`); **`second_wind` does not** — *"your blows land harder"* is `empower` on a swing you were already making |
| 08-29 | ✅ **3 repricings** | ⚠️ `shaped_body` was **e2 for 720 duration and standing soak** — the most defensive craft in the tradition priced below a cantrip | `craft_lint` check 6 | `working_model` e2→5, `solved_route` e1→3 — all three carried the unmigrated-batch fingerprint |
| 08-29 | ✅ **`names_of_power`: `persuade` REMOVED — my ruling, owed since 08-28** | ⛔ the ladder is COMPULSION — *"they MUST stop, turn, or answer"* → *"sustained control"* → *"the hold no longer needs your attention"*. The vocabulary says persuade is **NOT command** | `content_ci` — no unmechanised verbs, and no craft forced through the setup path | ⚠️ **r3 had already dropped `persuade` on its own**, which is the craft saying so. Third verb-in-the-wrong-slot after `bolster` |
| 08-29 | ✅ **MIND AND BODY: 7 harm crafts typed** | both traditions were **100% untyped** — 9 harm-capable crafts, no ward could answer any of them | `content_which` · `content_ci` 13 | ⛔ `psychic` got its first carriers and **no ward answered it** — the gate caught it in seconds, as with grief, vitality and cold |
| 08-29 | ✅ **`unmoving_mind` wards `psychic`** | Mind's own answer to Mind's own weapon — *"a stillness nothing can move"* | which-check | ⚠️ `abstraction` dropped: a stillness does not answer a theorem. Three types, one idea |
| 08-29 | ⚠️ **`body_read` was NOT unmigrated** | I read null level/energy/shape and nearly "fixed" a correct craft | ⛔ it is in the **first-gift cohort**; the template supplies L1 e3 setup none at load | ⚠️ fifth time this week a value read without its context would have caused damage |
| 08-29 | ⛔ **`mechanic.damageMix` DECLARED in the schema** | ⚠️ the READER shipped with CCODE-281 and the schema never learned the field — **the first craft to author one was rejected by the closed schema** | `content_ci` ability schema · verified live: `ki_wield` 14 → 11 vs a shield, → 8 vs a force-ward | ⛔ the four-doors failure at the **AUTHORED** door, which is the one we had not seen before |
| 08-29 | ✅ **`ki_wield` typed — first composite craft in the game** | an L5 capstone dealing 4d6 was UNTYPED, so **no ward could answer it** | as above | ⚠️ `force` .7 + `physical` .3 — armour answers the edge and not the force; `harmRung` `damaging`→`lethal` |
| 08-29 | ⛔ **THE GAME IS RENAMED: SINGULARITY — THE ARCS OF EXESA** | Erik. ⚠️ It was *"Singularity — The Valley of Echoes"* — **the whole game titled after one region of 135 places**, the setting-reads-small drift sitting in the `<title>` tag | ⚠️ `index.html` + `README.md` updated; `po/` archives keep the old name as record | ⛔ names the two things the game IS: arcs that resolve permanently, and the consumed world they cross |
| 08-29 | ⛔ **THE WORLD IS NAMED: EXESA** | it had no proper noun at all, and *"the valley"* — one region of 135 places — had been standing in for it, which is why the setting read tiny | ⚠️ authored in `world_framing.the_world_is_named`; the 337-occurrence repair is specced, not done | ⛔ `po/SPEC_staleness_ratchet.md` · every doc and content file that says "the whole world" |
| 08-29 | ⛔ **cosmic arc `The Disagreement`** | Erik: the Precursors and Veil entities *"started all this and things are coming back to conflict"* | — authored wholly from `the_three.md`; `arc.schema` scale enum extended to five rungs | ⛔ it is the arc behind `what_wakes_beneath`, `the_poles_pull` and `manifestation_storm` |
| 08-29 | ⛔ **`docs/ARCS.md` written — the GM's copy WITH the answers** | Erik: *"it is NOT OK to leave it at 'we don't know what's underneath' in an AUTHORED arc… there's enough mystery in the generative side"* | — reading of `world_superstructure` + `greater_arcs`, nothing invented | ⚠️ `PLAYERS_GUIDE` withholds; this does not. ⛔ 11 arcs, all with `ifIgnored`/`ifEngaged`/stages already authored |
| 08-29 | ⛔ **PLAYERS_GUIDE Part X corrected — THERE IS NO SPINE** | I made the water crisis the universal opening. ⚠️ **Erik has largely RESOLVED it in play, as designed** — arcs finish, permanently, and new ones rise as wakes | — | ⛔ six valley arcs, and **proximity decides which one a player meets**; start in the Deepwood and the water is not yours |
| 08-28 | ✅ **`SNG-261` gate corrected** | ⛔ **my own gate invented two power systems** — `living_current` and `wild_current` are in no vocabulary and no craft has ever carried them, so it failed three CORRECT crafts against a map I made up | `content_ci` 16→15 | ⚠️ intent kept: an innate-access key must match the KIND of access; the currents are woven substrate, which is `combination` |
| 08-28 | ✅ **family defaults for `price` · `unsettle` · `cool`** | three shapes existed with no defaults, so an unauthored bargain/provoke/soothe resolved to nothing | `content_ci` 15→14 | ⛔ each keeps its declared `operative`: price scales STAKE not discount · unsettle scales TARGETS not force · cool scales HEAT REMOVED and never touches damage |
| 08-28 | ⛔ **misattribution corrected on 23 crafts** | I stamped *"Per Erik 2026-08-24"* onto a note CCode wrote in his own voice. ⚠️ **I attributed a rule to the person whose rulings I treat as binding** | — | §46.12 in a new form: not the scope of a ruling but its AUTHOR | ⚠️ **`craft_mechanics.operativeAxis`, SNG-263 r4 — CCode's own note after Aevi's blazeborn pilot broke his closed vocabulary. ⛔ NOT an Erik ruling; I had been citing it as one** |
| 08-28 | ⛔ **rankDeltas adapter LANDED** | 284 crafts authored a per-rank delta the engine could not see; all fell through to one 1.35 default | `rankdelta_report.mjs` before/after · 20 suites, balance sims, no regression | ⛔ **323 rank-resolutions changed KIND** · `extend` now grows a real field on 156 · §2 resolution order |
| 08-28 | ⛔ **`add` splits on whether a verb arrives** | Erik ruled **C**: 92 add-ranks grant a new verb and take no bump; ⚠️ **89 grant none (`axis: special` ×75) and keep the default, or they resolve identically to the rank below** | ⚠️ re-run of `rankdelta_report` §4 | ⛔ scaling now depends on the `functions` array — a lint that normalises verbs would silently remove a bump |
| 08-28 | ⚠️ **`minHit` FLAGGED, kept** | Erik: *"not certain about the minHit concept… keep it for now, but flag it"* | ⛔ **no test — it is a design question, not a defect** | §4 warding · the ward ladder's IMMUNITY rung · Erik's soak ruling puts the floor on the player's side too |
| 08-28 | ⛔ `blind` policy → **`mindless`** | Erik: *"blind is CAN’T SEE"*; the word named this policy AND the can’t-see receipt, in one function | `how_it_works.mjs` §8 × 5, plus smoke CCODE-255 | `targeting.js`, `sunk_assay_intake.json` migrated, `POLICY_ALIASES` keeps old saves working |
| 08-28 | ⛔ **`FIELD_REFERENCE.md` created** | Erik: *"we are DONE with forgetting what things are meant to do and how they actually work or not"* | `how_it_works.mjs` FR × 14 — atlas freshness, bucket counts, axis counts, ladder count | ⛔ every authored field; `field_atlas.mjs` generates its table |
| 08-28 | `field_atlas.mjs` + `atlas_inject.mjs` | a hand-maintained "which fields are read" list is wrong within a week | its table is re-derived and diffed by the FR gate | ⚠️ `NOT_CONSUMERS` — a question file is not a consumer |
| 08-28 | ⛔ **`schemas/ability.schema.json`** | eleven schemas existed and NONE covered crafts — the type where all 19 dark fields live | `content_ci` CCODE-288 × 3, incl. a proof the closed set can go RED | ⛔ every craft; a new field must be DECLARED before it can be authored |
| 08-28 | `genschema.js` learns `additionalProperties:false` + `patternProperties` | it IGNORED the closed-set flag, so the schema above would have been decorative | the RED-proof probe in CCODE-288 | ⚠️ purely additive — no existing schema used the boolean form |
| 08-28 | CI on push (`.github/workflows/ci.yml`) | 873 commits in 14 days and nothing ran the suite | it IS the runner | ⛔ every push; catches the three things I forgot this week |
| 08-28 | advisory typecheck workflow + `jsconfig.json` | 5 of 8 false findings this week were contract errors a checker catches at edit time | ⚠️ **non-blocking until seen green** — no `tsc` on the authoring machine | `targeting.js` is the first module opted in |
| 08-28 | pre-push hook + `scripts/hooks/install.sh` | CI catches a bad push in a minute; the hook catches it in seconds | it runs `run_tests.mjs` | ⚠️ git does not version hooks — hence the installer |
| 08-28 | ⛔ **`tests/save_fixtures.mjs`** | 16 real saves, 1,788 turns, and NOTHING tested that a rename does not drop an ability | reconciles a COPY of every save; asserts nothing shrank | ⛔ every vocabulary change; guards the one artefact that cannot be regenerated |
| 08-28 | ✅ **RULING: each craft says how its rank grows** | Erik: *"a default is ok AS LONG AS AUTHORING OVERRULES IT"* — the default is a floor, 4th time | `how_it_works.mjs` FR × 5 + `scripts/rankdelta_report.mjs` | ⛔ 323 of 546 rank-resolutions changed kind |
| 08-28 | ⛔ **the rankDeltas adapter (CCODE-289)** | 495 authored deltas, 0 read — the largest disconnected system in the project | before/after report across all 274 crafts | ⚠️ THREE mismatches: shape, field name (`axis` vs `dimension`), and MAGNITUDE |
| 08-28 | ⚠️ **`add` ranks lose their magnitude bump** | follows from the ruling: a rank that grants a NEW thing should not also grow the old one 35% | 124 rank-resolutions measured and listed in the report | ⛔ **the largest single effect; needs its own ruling if `add` should keep the bump** |
| 08-28 | ✅ **RULING: a guard ABSORBS damage** | Erik: *"A"* — the blow gets smaller, not likelier to miss. `soak` is the right word; it needed a CONSUMER, not a rename | `content_ci` CCODE-240 × 3, rewritten to measure absorption | ✅ **content_ci 17 → 16 · damage_sensitivity 1 → 0** |
| 08-28 | ⛔ a guard may not stack into IMMUNITY | Aevi's condition; the first run reduced a connected blow to ZERO at soak 20 | `damage_sensitivity` — its standing red was exactly this | ⚠️ smoke CCODE-250 expected 0 and now expects the floor |
| 08-28 | ⛔ **`num` was undefined in `skill_battle.js`** | CCODE-281 called it in the composite path and it existed nowhere — a ReferenceError waiting behind `wardTypes` on a target sheet, which nothing ever set | found by walking into it; now covered by the soak path | ⚠️ a crash that waits is not a crash that hides |
| 08-28 | ⛔ **RULING: minimum damage is 0** | Erik: *"I don't like the 1 minimum"* — armour and typed immunity can now MEAN what they say | `how_it_works.mjs` §4 (reads the DIAL, not a literal) · `damage_sensitivity` EDGE × 2 | ⛔ the ward ladder's `immunity` rung · every guard · smoke CCODE-250 |
| 08-28 | ⚠️ the §4 gate read a LITERAL `minHit: 1` | so the dial moved to 0, the doc's claim went false, and the gate stayed GREEN | now reads `skill_battle_system.engine.damage.minHit` | ⛔ a harness that builds its own config tests its own config — FIELD_REFERENCE §4, broken in the file asserting it |
| 08-28 | ✅ **RULING C: `add` splits on whether the rank grants a VERB** | 92 with a new verb take no bump; the 89 without add a QUALITATIVE capability and keep the default | `rankdelta_report.mjs` §4: **124 → 60** kept-numbers | ⚠️ **scaling now depends on the `functions` array** — a tidying lint could silently remove a 35% bump |
| 08-28 | ✅ **self-variant canon repair APPLIED** | 7 shared-canon records were each a rumour of THEMSELVES (`rivalId === entityId`) — corruption from a non-idempotent retry, unrepaired since CCODE-04 | before/after counted: 15 records in, 15 out · 7 → 0 self-variants · 0 genuine variants touched · 20 suites green | ⛔ `world/canon/valley.json` — Low Lamp Inn, Siol, Tessvel Cairn, Warden Coll, Deni Cors, Ossivyn Tallow, Stillwater's Trouble are canonical again |
| 08-28 | ⛔ **`ability_rename_map` WIRED (CCODE-294)** | 377 old→new ids, registered and 57 KB, loaded by NOTHING — so 22 ability references across 7 real saves pointed at ids the catalogue no longer answered to, 11 of them on one L30 character | reconcile step 31 · `save_fixtures` now checks RESOLUTION, proved able to go RED | ✅ **22 → 0 unresolved** · nothing was permanently lost |
| 08-28 | ⚠️ `save_fixtures` counted array LENGTHS | so it reported "nothing shrank" while 22 entries dangled — counting the container instead of the contents, in the test written to catch that | the new check fails when the map is unwired | ⛔ an id has THREE homes: catalogue, minted `customAbilities`, runtime braid |
| 08-28 | ✅ **the four project verbs reach play (CCODE-295)** | `interruptProject` / `resumeProject` / `sabotageProject` / `inheritProject` were built and called by NOTHING — while `craft_mechanics` says *"Sunk Assay L4 is built on all four"* | end-to-end run of all four · refusals return reasons · `testOnlyExports` 26 → 22 | ⛔ GM contract §18b + the op shape + the `projectOps` handler; `sabotageMax` dial bounds a setback |
| 08-28 | ⛔ **`persistUntilHealed` was stamped NEVER (CCODE-296)** | `skill_battle` compared `=== true`; all SIX crafts author an OBJECT naming what persists, none authors `true` | the condition now carries `persistUntilHealed` **and** `persistedAs` | ⚠️ third `=== true` against a richer authored shape this week · `resolveSoothe` finally has something to honour |
| 08-28 | ⚠️ a phantom control, mine | I read `rules.projects.sabotageMax`; the dials live at `craftMechanics.projects` | `unauthoredRulesKeys` caught it within the minute | ⛔ the wrong-config-object mistake, made 20 minutes after documenting it |
| 08-28 | ✅ **folded allies take losses (CCODE-298)** | Erik: yes. A folded party was PURE UPSIDE — it hurt the foe and could not be hurt | `scripts/folded_casualties_report.mjs` · non-combatants verified exposed | ⛔ `distributeCasualties` + `downEntity` both had NO caller; ⚠️ nobody actually goes down yet — the pool is party-sized, not threat-sized |
| 08-28 | ✅ **`persuade` resolves as SETUP (CCODE-299)** | Erik ruled A+C: it makes the NEXT social action land better; agreement is table business | `content_ci` SNG-263 §1 now reports **zero** unmechanised verbs | ⚠️ `names_of_power` is `hobble` and excluded pending Aevi's ruling · **smoke 1 → 0** |
| 08-28 | ⚠️ I built the casualty receipt in the wrong ORDER | the spread read `foldedLosses` 82 lines before the branch set it — computed and thrown away every round | caught by the probe, not by a gate | ⛔ "computed and never spent", 30 minutes after fixing the identical thing for soak |
| 08-29 | ✅ **`docs/PIPELINE.md`** | Erik: bring the development pipeline together intentionally — eight stages, owners, and what each produces | it names the two places the pipeline actually breaks, both measured | ⛔ the four rules: a script per number · a review MEASURES · a before/after where play moves · docs gate done |
| 08-29 | ✅ **`docs/PLAYERS_GUIDE.md` Parts I–IX** | Erik: a guide walking a player start to finish — *"the nouns and verbs transformed into game mechanics kind"* | `how_it_works.mjs` PG × 18 — counts, cost ladder, families, death ladder, the minHit dial | ⚠️ Parts X–XII are Aevi's and are gated to stay MARKED rather than go quietly thin |
| 08-29 | ✅ **four gate suites WIRED** | `scripts/apparatus.mjs` classified every harness and found assertions that ran nowhere | all four verified `exit 0` BEFORE wiring; runner 20 → 24 suites | ⛔ `changeset_check` (11 checks), `dev_world` (4), `playthrough_sim` (1), `verification_ledger` (1) — **a gate that does not run reads as coverage** |
| 08-29 | ✅ **`docs/APPARATUS.md` — the factory floor** | Erik: *"those dev docs likely will have descriptions of all our test harnesses and routines as well. I want this to be a well oiled factory"* | `how_it_works.mjs` — GATE-UNWIRED must stay 0, and every restated total must match the generator | 78 harnesses classified DERIVED, not declared; ⚠️ a hand-kept list would be wrong within a week |
| 08-29 | ⚠️ **the classifier stopped matching itself** | its `NEEDS_API` pattern is CODE, so stripping comments did not hide it and `apparatus.mjs` reported ITSELF as needing an API key | LIVE-API 4 → 2, which is the true count | ⛔ **a scanner reading its own prose — the fourth instance**; same fix as `field_atlas`’s NOT_CONSUMERS |
| 08-29 | ⛔ **§12 THE INTERFACE added** | Erik: *"the UI and user experience needs to be included"* — every section above described the ENGINE and none said how a person reaches it | `how_it_works.mjs` §12, 6 assertions, all three proven able to go RED | ⛔ names the defect it exists to catch: **a mechanic built, tested, green, and impossible for a player to invoke** — `bringForward`, `provoke`, named-ally intercept |
| 08-29 | ✅ **reachability sweep of the UI** | there is no router and no screen variable, so “is this screen reachable” has exactly one mechanical answer: does anything call it | derived at run time, never a stored count — the list may not GROW | ⚠️ 45 of 46 render functions have a caller; **`renderFormStep` does not** |
| 08-29 | ⚠️ **`renderFormStep` is DARK CODE, not a dead feature** | I nearly reported a working feature broken — `state.form` has **two other live surfaces** (`c-form`, `p-form`), is persisted, and is read three times | gated: those surfaces must stay | ⛔ the distinction `safe_delete.mjs` exists to make, and why its verdict is never the word “delete” |
| 08-29 | ✅ **`PLAYERS_GUIDE` PART I½ · WHERE EVERYTHING IS** | a player should not learn by surprise that the game cannot ask a question | 2 assertions; both docs must name all three missing affordances | ⚠️ states the three plainly as **missing questions, not missing features** |
| 08-29 | ✅ **`PIPELINE` gains a fourth scope: INTERFACE** | all three affordance gaps were found at stage 7, not stage 4 | — | ⛔ **a spec is not done until it says how the player reaches it**; if the answer is “they cannot yet”, that is a §10 gap, not a silence |
| 08-29 | ⚠️ **a version regex that matched too much** | `"."` in a plain JS string is just `"."`, so the guide’s version check would have accepted `1x9x256` | fixed to a real escape; §0 and PG now use the same form | ⛔ the near-twin of the template-literal `s` bug logged yesterday — **escapes die quietly in strings** |
| 08-29 | ✅ **the AWAITING gate replaced, not deleted** | Aevi wrote Parts X–XII and flagged it herself: *"AWAITING gate now correctly red, CCode's to change"* | `how_it_works.mjs` — a part is now either WRITTEN or MARKED, and thinness names which part | ⛔ **a gate that only watched for a placeholder is worth nothing once the placeholder is gone** — it now checks the writing against the corpus |
| 08-29 | ✅ **the nine companions checked against the pack** | prose about authored people should be verifiable against the people | derived from `content/packs/valley/companions`, never a typed list | ⚠️ all nine are named and all nine carry a `downedEffect`; **a tenth companion goes red until the guide mentions them** |
| 08-29 | ✅ **`docs/ARCS.md` placed, and a gate so the next one is too** | Erik: *"it is NOT OK to leave it at 'we don't know what's underneath' in an authored arc"* — Aevi wrote the GM copy and nothing pointed at it | `how_it_works.mjs` — every `.md` in `docs/` must appear in PIPELINE's table | ⛔ **a document nobody links is the same unread failure**, one layer up from a field |
| 08-29 | ⛔ **I CORRECTED MY OWN §12 — two of three "interface gaps" were FALSE** | Erik approved a target affordance on the strength of a list I had not measured. `bringForward` has had a picker since **CCODE-276**; `provoke` needs no pick at all | measured against `app.js` and `craftmechanics.js`; the gate now guards the CORRECTION | ⚠️ **a gate on an unmeasured claim does not make it true — it makes it durable.** I wrote it into three documents and gated it |
| 08-29 | ✅ **CCODE-306 — provoke's taunt reaches the pick** | `chooseTarget` implemented the override (CCODE-256, with a rationale), `resolveProvoke` produced `taunted`, **and nothing ever connected them** — the value was spread into a receipt and dropped | `tests/taunt_wiring.mjs`, 10 assertions, **run over two real rounds** | ⛔ producer green, consumer green, live path using neither — **a wiring gate, not a module gate** |
| 08-29 | ✅ **and the taunter id was the word "player"** | `resolveProvoke` defaulted to the literal string; `chooseTarget` matches `a.id === targetId`; a real save's id is `char-…` | gated separately — it goes red on its own | ⚠️ **it could never have matched even once the wiring existed** — the exact trap **CCODE-261** names 200 lines above the call site |
| 08-29 | ⛔ **CCODE-304 — the casualty pool is OUT OF RANGE, not under-tuned** | Erik: *"we need to take a look at the folded party and damage and casualty pool so we structure it well"* | `scripts/casualty_sim.mjs`, deterministic, on the real engine functions | ⛔ `health = level × 2`; `pool = per × K` mentions no level. **A fall needs pool ≥ 2 × health**, so the mechanic is in range at level 1–2 and dead from level 3 forever |
| 08-29 | ⚠️ **the mechanic is a CLIFF and the window is a factor of two** | below `2 × health` nobody can fall at any roll; above `4 × health` everyone the pool reaches falls | measured at every level; the closed form is `r ≥ 4/BASE − 1`, in which **health cancels** | ⛔ **that is why proportionality is the fix and a bigger constant never could be**. Three dials — BASE, threat, `maxSharePer` — and they are **not independent** |
| 08-29 | ⚠️ **I did NOT ship a general target-affordance module** | with two of three cases false, the only remaining case is the intercept — **blocked on Aevi's spec** | — | ⛔ **a reader with no caller is `testOnlyExports`** — the exact defect I spend this file finding. Written, then deleted rather than shipped |
| 08-29 | ✅ **CCODE-307 — `engine/group.js`: a group is a CAPABILITY SET, not a pool** | Erik via `SPEC_group_aggregation`: *"AGGREGATE THE GROUPINGS… the group LOSES CAPABILITY THROUGH LOSS OF INDIVIDUALS AND THROUGH LOSS OF COHESION"* | `tests/group_capability.mjs`, 25 assertions | ⛔ **COVERAGE (a union) and DEPTH (a count) are different numbers** — one of six spears is a slope, the only mender is a cliff, and **a pool cannot express the difference** |
| 08-29 | ✅ **the capability vocabulary is never named in the module** | Erik: *"design things so they are EASILY UPDATED as we evolve the game"* | ⛔ **§5 invents a SEVENTH family at run time** and asserts it flows through untouched | ⚠️ if that test ever needs an edit to `group.js` to pass, the constraint has been broken — **proven able to go red by hardcoding a five-family list** |
| 08-29 | ⚠️ **one correction to the spec, measured** | §6 says `contributionsOf` *"already derives from `tagFamilies`"* | grepped every call site | ⛔ **it derives from a parameter NOTHING SUPPLIES** — the only writer in the repo is one line of `smoke.mjs`, so `DEFAULT_TAG_FAMILIES` always runs. **A reader with a test-only writer is a hardcoded list with a seam** |
| 08-29 | ⛔ **`scripts/group_fidelity.mjs` — the abstraction destroys coverage the real fight preserves** | Aevi's §4: *"if the aggregate loses the healer at a different rate than the full sim does, the abstraction is lying in the way that matters most"* | ground truth is per-blow targeting through the real `chooseTarget` | ⛔ **the aggregate sits at a FIXED 71% regardless of the foe**: `distributeCasualties` sorts softest-first, `chooseTarget` sorts by threat — **it is permanently predatory** |
| 08-29 | ⚠️ **TWO ORDER ARTIFACTS IN MY OWN HARNESS, both found by a number being exactly 100%** | the fixture did not build members the way `alliesOf` does | first: no `contributions`, so every member tied and the stable sort returned **whoever I listed first**; second: spears carried no weapon, so no `MARTIAL`, so they tied with the scout | ⛔ **a ground truth that does not build its actors the way the engine does is not a ground truth** — I nearly published the healer dying 100% of the time as evidence about the FULL SIM |
| 08-29 | ✅ **two exports un-exported rather than marked internal** | `wiring_audit` flagged `cohesionOf` and `STRUCTURE_COHESION` as test-only | narrowing the surface, not the `registry:internal` lever | ⛔ **the audit's own header says that marker must NEVER be used to make a number go down** — it HIDES an unreachable export where narrowing REMOVES it |
| 08-29 | ⛔ **NEW CANON — ASCENSION ACROSS THE VEIL** | Erik: *"after or around lvl 100 a character and/or NPC will either ASCEND or FALL ACROSS THE VEIL. They will go to join the primary conflict… the World's Mythicals are those high near level 100 NPCs"* | `how_it_works.mjs §13` — nobody on this side exceeds the threshold | ✅ **it lands on `the_veil.json` (SNG-448, authored 08-15, NEVER LOADED)**, whose own text calls the divide *"the setting's actual war"* and its nexuses *"doors somebody built"* |
| 08-29 | ✅ **CCODE-309 — an NPC's level is what they ARE, not who the player knows** | Erik: *"the NPC cap is garbage cruft — the world arcs move mainly from NPCs who have climbed the ladder"* | 7 assertions; both regressions proven able to go RED | ⛔ **the cruft was the INPUTS, not the number 20**: every term measured the player's relationship, so **a world-moving Mythical the player had never met was LEVEL 1** |
| 08-29 | ✅ **the ceiling is now canon instead of an arbitrary wall** | 20 was *"as far as we bothered to model"*; 100 is *"as far as anyone goes on THIS side"* | `§13`: authored 98 + heavy growth clamps to 100 | ⚠️ **an unauthored NPC is bit-identical to before** — reader before field, so nothing moves until content authors a level |
| 08-29 | ⬜ **42 authored NPCs carry no level, health or soak** | Erik: *"we need to create character sheets for all of them… they get killed and injured and they need to grow too"* | measured across every pack | ⛔ **AEVI'S** — and until she authors one, CCODE-309 is a reader with no writer. **I declined to pick the numbers: authoring who matters in the valley is expression, not implementation** |
| 08-29 | ✅ **`costsAction` struck from `step_between`** | Erik: *"I don't think it needs costs action on top of the fact that you're using your action to use the skill"* | verified: `app.js` advances the phase the moment a craft is declared — one action per turn | ⛔ **it was double-charging**, and it **dissolves my own objection rather than overruling it**: I argued a guard must cost something, and the cost was always there, in the declaration |
| 08-29 | ⚠️ **and it leaves r3 buying NOTHING** | `costsAction: false` was the ONLY difference between r2 and r3 | both rungs are now `{allies:2, rounds:3}` | ⛔ **AEVI'S TO CLOSE** — r3's own fiction is being there BEFORE the harm arrives, which suggests reach or anticipation, not a freed action |
| 08-29 | ✅ **CCODE-310 — the NPC bound moved from CODE to CONTENT** | Aevi: *"do not replace it with 100 — a Mythical is NEAR 100 and the number is a CONSEQUENCE of the ladder, not a cap on it"* | `§13`, and `unreadRuleConstants` 26 → **24**, below baseline | ⛔ **my first fix clamped to 100 in code** — the same shape Erik has ruled against four times, a default acting as a ceiling |
| 08-29 | ✅ **tier is a FLOOR that growth moves, and `tierOf` reads the rung back** | Erik: *"they grow in tier"* | derived from the SAME content floors — never a second ladder | ⚠️ **no code default for `tierFloor` on purpose**: a built-in map would MASK a broken thread instead of exposing it |
| 08-29 | ⚠️ **the dial gate caught me twice in one turn** | first `unreadRuleConstants` 26→29 (a dial with nothing on the other end), then 4 doc-keys breaking the `_foo` exemption | `wiring_audit` line 684: *"the doc-key exemption must not become a hiding place"* | ⛔ **I deleted `crossingNear` rather than rename until the gate went quiet** — the crossing is CANON, not a dial, and nothing reads it |
| 08-29 | ✅ **CCODE-311 — THE TANK CAN NOW TAKE THE BLOW** | Aevi authored `step_between`, the first craft to author `interceptDamage`; the reader had waited since CCODE-260 | `tests/interpose_wiring.mjs`, **16 assertions**, and §4 runs a REAL ROUND — without a guard the blow lands on Sprig, with one **Brann is holding the wound** | ⛔ **all four doors were needed**: `protectionFromCraft` had NO CALLER, `state.protections` was READ at `encounters.js:189` and **assigned nowhere**, and `tickProtections` was called by nothing |
| 08-29 | ✅ **the missing question is finally asked** | a craft that catches a blow for someone must know WHO, and nothing on the screen asked | `§3: data-sbguard` | ⚠️ **the row only exists when the selected action authors an intercept** — a permanent control for a craft you have not chosen is clutter that teaches players to ignore the panel |
| 08-29 | ✅ **dispatched on the AUTHORED BLOCK, never a craft name** | `step_between` has no single `function` — it is `["move","shield"]` | gated: `app.js` must not contain the string `step_between` | ⛔ **a name-based branch would have worked for exactly one craft and silently ignored the next one Aevi writes** |
| 08-29 | ⚠️ **and the decay, which nothing had ever run** | `tickProtections` existed since CCODE-260 with no caller | `§5`: a rank-2 guard lapses after its authored rounds | ⛔ **without it a 3-round guard stands forever** — exactly the wall Erik's action ruling relies on it not being |

**Last verified: 2026-08-28 · v1.9.262 · 385 crafts.**

---

## 1 · WHAT A CRAFT IS

**A craft is a thing a character can do, with three RANKS.** You learn it at rank 1 and grow into 2 and 3.

⛔ **RANKS ARE ADDITIVE.** Rank 3 can do everything ranks 1 and 2 could, plus the new thing. You never lose
a lower rank's use. *(You do not use Kindle to light fires, learn to burn a goblin whole, and lose the
ability to light fires.)*

**A player choosing what to do sees three things per rank: what it DOES, what it CANNOT do, and what it
COSTS.** Everything else on a craft is for the engine or for us.

### What it costs

**ENERGY, and energy only.** A craft's price is its `energyCost`, set by level band, plus **+3 per rank of
reach** above rank 1 — so a rank-1 use of an e4 craft costs 4 and a rank-3 use costs 10.

⛔ **There are no other costs.** Not vows, not exhaustion, not narrative debts. **The single exception is an
extreme capstone** — `the_cut_thread` and `last_lament` take your whole remaining pool and leave you at zero
until a full night's rest, and they say so.

⚠️ **A `cannot` is a SCOPE LIMIT, not a bill.** It says what the craft will not produce.

---

## 2 · HOW A RANK RESOLVES

**Order:**

```
1. the rank's own authored number          ← always wins
1b. the craft's own authored rankDelta      ← kind + dimension; the AMOUNT comes from the dial
2. a value DERIVED from the rank's gainAxes    ← PROPOSED
3. the craft's mechanic block
4. the shape's family defaults
5. nothing — the craft does not use that dimension
```

**`gainAxes` names what a rank buys, from nine: `range` · `duration` · `damage` · `scope` · `targets` ·
`quality` · `autonomy` · `conditions` · `tempo`.**

✅ **BUILT (CCODE-289): EACH CRAFT SAYS HOW ITS RANK GROWS.** Erik: *"Each craft says how a rank grows it,
but it's ok to have a default, AS LONG AS AUTHORING OVERRULES IT."* ⛔ **THE DEFAULT IS A FLOOR, NEVER A
CEILING** — the fourth time this project has made that ruling.

**274 crafts author `rankDeltas` at the root, 495 of them, in three kinds:**

| kind | n | what it does |
|---|---|---|
| `add` | 181 | ⚠️ **ADDS A FUNCTION** — a grants-level change the tree carries. **It scales no number, deliberately.** |
| `extend` | 163 | grows a NAMED non-operative dimension — `targets`, `duration`, `scope`, `range`, `area`. A compound axis extends **both**. |
| `deepen` | 129 | grows the craft's OPERATIVE dimension |
| *(unkinded)* | 22 | takes the default |

⛔ **THE AUTHOR SAYS WHAT A RANK DOES; THE DIAL SAYS HOW MUCH.** No authored delta carries a `mult` (0 of
495), so the amount comes from `rankDeltas.default` compounded by rank — an author who writes one still
wins. ⚠️ **23 narrative axes (`reach`, `persistence`, `timeReach`) extend NOTHING and are reported as
prose rather than guessed at.**

⚠️ **BUILT TODAY: `gainAxes` decides which ranks appear in the player's capability menu** — a rank that
declares one is a distinct choice; a rank that declares nothing collapses out of the list. **It is read for
PRESENCE, not for content.**

⛔ **PROPOSED: derivation.** 746 ranks declare an axis and author no number, so today rank 3 resolves
identically to rank 1. The proposal is a default curve — **+50% at r2, +33% at r3** — that fills those in,
**with any authored number overriding it.** Fifteen authored values in five ladders survive untouched.

⛔ **PROPOSED: derivation is gated on the field's KIND.**
- **MAGNITUDE** — scales by the curve (`damage`, `duration`, `resistDrop`)
- **ORDINAL** — steps by 1 (`targets`, `stage`) — *there is no such thing as 1.5 people*
- **INDEX** — steps by 1 and is never multiplied (`reachesDepth`) — *its base is 0*

⛔ **`tempo` never derives.** It grants extra action and no engine should hand that out unasked.

---

## 3 · WHAT LANDS: DAMAGE

**A craft deals a MIX of damage types, not one type.** A psionic blast is half `physical` and half
`psychic`; a Seraphic smite is `radiance`, `judgement` and `force`. **The word people use for an effect is
the mix.**

**Types belong to four FAMILIES:**

| family | what it is | types |
|---|---|---|
| **physics** | the fabric of the world — matter, space, time, and the two kinds of matter you see by | `physical` `force` `spatial` `temporal` `radiance` `shadow` |
| **elemental** | the energies moving through it | `heat` `cold` `lightning` `corrosive` |
| **vital** | life ended, grown, or moved | `decay` `living` `vitality` |
| **intrinsic** | ⛔ harm that requires a WILL to make it — *a rockfall cannot do this* | `feeling` `appetite` `judgement` · `psychic` `abstraction` `truth` `deception` |

⚠️ **Elemental types are SIBLINGS, not opposites.** A ward against fire is not a ward against ice.

**HEALING IS NOT A TYPE.** It is an effect, and the source type decides who it mends.

⛔ **PROPOSED — the inversion is NOT BUILT.** The intent is that `decay` mends the undead, `living` and
`vitality` mend the living, and **healing an undead harms it.** ⚠️ **The machinery for half of it exists** —
`absorb` returns negative damage, so a sheet authored `decay: absorb` would already be mended by rot. ⛔ **But
NO SHEET AUTHORS IT**, and the other half — a `heal` that lands as `decay` on an undead — has no
implementation at all.

---

## 4 · WHAT STOPS IT: WARDS

**A ward answers a FAMILY, or one TYPE inside a family.** *An elemental ward* stops heat and cold and
lightning; *a cold ward* stops only cold and is cheaper and sharper.

**Wards have DEPTH as well as breadth: `resist` → `soak` → `immunity`.** Three different kinds of answer,
not three sizes of one — resist moves the roll, soak moves the damage, immunity means that type does not
touch you.

⛔ **PARTIAL WARDING IS THE POINT.** A shield answers the physical half of a psionic blast and **the
psychic half goes through untouched.**

✅ **AND A BLOW WHOSE EVERY PART IS ANSWERED LANDS NOTHING.** ⛔ **ERIK RULED 2026-08-28: minimum damage is
0** — *"I don't like the 1 minimum."* ⚠️ **This REVERSES the old floor.** Until then a fully-warded blow
still took 1 off, so armour could never fully answer anything and the ward ladder's top rung, **IMMUNITY,
could not actually mean immune.** **It does now.**

⚠️ **WHAT THE FLOOR EXISTED TO PREVENT, NAMED SO IT IS NOT REDISCOVERED:** a craft reduced to nothing can
read as *broken* rather than as *answered* — which is how `antisoakLanded` returning 0 got reported as a
defect. ✅ **The RECEIPT carries the reason instead**: `soaked`, `guardedBy`, and the ward's `stopped` list.

⚠️ **AND IN PRACTICE THIS LANDS ON THE PLAYER'S SIDE.** Measured: `soakBase` is 0 and `threatToSoak` 0.02,
so a threat-120 foe synthesises to **soak 2**, and no authored foe carries a soak field at all. **A
player's guard authors 4–5**, so this is felt when you raise a ward, not when you hit a boss.

⚠️ **A ward that answers everything has no character.** The interesting thing about a ward is the list of
what it does *not* stop.

✅ **A GUARD ABSORBS (CCODE-290).** Erik: *"raising a guard makes the blow SMALLER, not more likely to
miss."* **30 crafts author `mechanic.soak`; a landed guard now stands as a soak LAYER on its raiser**, with
the craft's own `wardTypes` — so `death_ward`'s soak 5 answers **decay, vitality and cold** and nothing
else. ⚠️ **It is a second currency:** the guard's roll-mod `value` is untouched, because a contest-mod
and a craft magnitude are different things and making one drive the other is how a number ends up serving
two masters.

⛔ **AND A GUARD MAY NOT STACK INTO IMMUNITY.** A blow that CONNECTED always lands at least `minHit`,
however large the soak — the same floor that says no foe is immune, held on the player's side. The receipt
says so: `soakFloored` with its reason, and `guardedBy` naming the craft that blunted it.

**Also live:** `antisoak` makes a wound worse but **cannot create one** — a blow fully stopped by soak takes
the antisoak with it. `pierce` is an amount that lands regardless of armour, so it guarantees the antisoak
fires.

---

## 5 · WHAT STOPS *YOU*: CONDITIONS

**A craft that stops without wounding does not deal damage.** It imposes a CONDITION — `staggered`,
`action_loss`, `unconscious`, `incapacitated` — resisted with `mental` or `physical`.

⛔ **A failed resist DEGRADES rather than negating.** You do not shrug it off; you take the lesser version —
`resolveImposition` returns `{ condition: degradesTo, degradedTo: want, resisted: true }`, so an
`unconscious` that is resisted lands as `action_loss`.

**`harmRung` is a different axis from damage.** It says what happens when a craft puts someone DOWN —
`none` / `damaging` / `incapacitating` / `lethal` — and a character can reduce it without reducing damage.

---

## 6 · DYING

**Death is a ladder, not a switch.**

| depth | | reachable by |
|---|---|---|
| 0 | **the Threshold** — dead about a day | rank 1 |
| 1 | **the Near Dark** — about a month | rank 2 |
| 2 | **the Deep Dark** — months, the road nearly closed | rank 3 |
| 3 | ⛔ **SEALED** | nothing, at any rank |

**The ladder MOVES.** A failed retrieval **sinks them a rung**; a failed reach at the Deep Dark **seals
them permanently.** ⚠️ **Using the craft badly is how a person becomes unreachable.**

**Five traditions answer this ladder differently and share one set of verbs** — `retrieve` · `sink` ·
`seal` · `hold` · `slow`. Ashwardens drag, Numinous invite, Threnody delays, Rootkin pay a price.

⛔ **PROPOSED (§48): undeath.** A raised body is a COCOON — as it wears, the thing inside grows. Two end
states: **narrowing** into unminded purpose, or **stable** as an Afterling with a whole personality.
**Healing harms them, decay mends them**, and Deathsense reads them as inverted life.

---

## 7 · WHAT A COMPANION DOES IN A FIGHT

**Everything participates.** Healing is acting; distracting is acting. **`combatant` means "may swing",
not "may take part"** — four of nine companions do not swing and all nine contribute.

**Going down costs something specific and authored** — losing Marrow means nothing is attended; losing Coil
means Precursor mechanisms stop answering.

✅ **AND A FOLDED PARTY IS MORTAL (CCODE-298).** Allies you did not bring forward still fight — they add
to your blow when you win the round — and **they take losses when you lose it.** ⛔ **Until 2026-08-28 they
could not be hurt at all**, which made a folded ally read as a damage stat rather than someone standing
next to you. Erik's *"still feel like people"* ruling argues FOR this: a companion who can be hurt is more
of a person than one who cannot.

⚠️ **NON-COMBATANTS ARE EXPOSED, DELIBERATELY.** Aevi cannot swing and can still be hurt — being unable to
fight is not being safe, and the reverse would make non-combatants the optimal thing to fold. **The losses
land softest-first and are reported BY NAME on the receipt** (`foldedLosses`), never folded into the total.

⛔ **OPEN: the pool does not scale with the foe.** Measured across 300 fights at four tiers — a folded ally
has **never** gone down, because the pool is a function of party size (√K over `perFoldedAlly`) and not of
who you are fighting. ⚠️ **That is INHERITED from the contribution side, not introduced here**, and it means
an authored `downedEffect` still cannot fire. `node scripts/folded_casualties_report.mjs`.

⚠️ **Roster values are DEFAULTS, not ceilings.** A swarm that cannot fight can fight when a player spends
eight bond bands building it a staff to inhabit.

---

## 8 · HOW A FOE CHOOSES A TARGET

**Default is `threat` — whoever is hurting it most.** ⛔ **Deliberately, because a foe that goes for what is
hurting it can be BAITED, and baiting is a decision.** A foe that always goes for the weakest can only be
tanked.

**`weakest`, `healer` and `mindless` are characterisation** — a thing that goes for the healer is saying
something about itself.

⛔ **A TAUNT REACHES ANYTHING THAT ACTS.** Erik, 2026-08-28: *"you can taunt from the darkness."* Making
yourself impossible to ignore outranks concealment **and** outranks the policy — you cannot demand
something's attention and also be hidden from it. ⚠️ **Even a `mindless` thing turns**: having no preference
is not the same as being unreachable.

⚠️ **AND A HAZARD IS NOT A FOE.** Erik: *"a rockfall isn't a foe, it's an obstacle or a hazard."* A targeting
policy is for things that CHOOSE; scenery needs no policy at all.

⛔ **`mindless` WAS CALLED `blind` UNTIL 2026-08-28**, and the rename is Erik's: *"blind is CAN'T SEE."* The
word was doing two jobs in one function — this policy, and the receipt for a foe that genuinely cannot find
you. **`blind` is now reserved for that second meaning**, and still resolves as an alias so the one authored
encounter and any old save keep working rather than silently falling back to `threat`.

**The downed are not targets** — and a taunt cannot make one a target either.

---

## 9 · WHAT IS AUTHORED VS WHAT IS DERIVED

⛔ **A stored copy of a derived value is the failure this project finds most often** — so this list is an
instruction to delete. ⚠️ **WHICH MEANS A VALUE WRONGLY LISTED HERE IS A DELETION ORDER AGAINST CORRECT
CONTENT, and two were.** Both halves are now stated, and both are asserted by `how_it_works.mjs` §9.

### ✅ DERIVED, NEVER STORED

- **foothill parentage** — computed from the parents' primaries in `craftSource`, and **no foothill has a
  row in `byTradition`**. A tie resolves to `combination` rather than a coin flip.
- **summoned creature sheets** — from the caster's level plus the craft's `tierGap`, **and the roll: a crit
  raises something stronger than the craft promises**

### ⛔ AUTHORED ON PURPOSE — DO NOT SWEEP THESE

- **tradition power-source mixes** — ⚠️ **24 authored rows in `power_sources.byTradition`, with Erik's
  reasons**, read by `craftSource`. `perAbilityOverrides` is empty **by design**: a tradition-level default
  plus explicit deviations is far less content than 285 authored fields, and a deviation is the interesting
  fact. ⛔ **An unauthored mix is FLAGGED `_mixUnauthored`, so `mix: null` means UNAUTHORED and never
  "the mean is pure"** — an absent value doing double duty is the trap.
- **tradition damage mixes** — ⚠️ **13 authored rows in `craft_mechanics.damageTypeByTradition`**, read by
  `skill_battle`. The kind a tradition's harm is **when the craft does not say for itself**.

⚠️ **The distinction is direction.** A tradition's mix is **authored and inherited downward** to its crafts;
a foothill's is **computed upward** from its parents, because a foothill is a place of access, not an
ancestry.

---

## 10 · KNOWN GAPS

| | |
|---|---|
| ⛔ **12 rules files are registered and never loaded** | ~140 KB dark, including `damage_types` |
| ⛔ **`rankDeltas[].axis` (495) has no reader; `mechanic.axis` (0) has one** | a reader with no writer, and a writer with no reader |
| ⚠️ **the map layer** | 18 of 135 locations have authored layouts and the renderer draws circles instead |
| ⚠️ **method is not recorded anywhere** | *psionics*, *song*, *blade* — a real layer with no field |
| ⛔ **no general TARGET AFFORDANCE** | a craft whose resolution needs a choice has no way to ask for one. **Three cases now**: `bringForward` needs a pick, `provoke` needs a target, a named-ally intercept needs one. ⚠️ Aevi's shape: a craft declares `needsTarget: "ally"\|"foe"\|"place"` and the declaration surface asks once. **Wants Erik and wants measuring across every craft that needs a pick** |
| ⚠️ **the folded-casualty pool does not scale with the foe** | so a `downedEffect` authored on all nine companions cannot fire. Inherited from the contribution side |

**Each gap above is asserted OPEN by `how_it_works.mjs`.** ⛔ **Closing one turns its check RED, which is
the signal to edit this table.** A gap that quietly closes is a doc that quietly rots.

---

## 11 · THE TESTING CONTRACT

**How we are allowed to claim a defect.** ⚠️ **Both rules were learned in one afternoon and both cost real
time, so they are rules now rather than habits.**

### ⛔ RULE 1 — A TOOL THAT REPORTS DEFECTS HAS A SELF-TEST, AND IT RUNS FIRST

**Five of `how_it_works.mjs`'s first-draft failures were the harness's own, and every one read exactly like
an engine defect.** ⛔ **One was a breath from reporting *"the entire rank-reach cost mechanic is inert"* —
about a system that works and that Erik ruled on personally.** The cause was passing `craft_mechanics.json`
where the game passes `rules.energy`: **a harness that builds its own config tests its own config.**

**Aevi's craft-lint produced 1,198 findings of which 663 were hers, found by *running* it rather than
testing it.** ⚠️ **A checker with no floor cannot tell you whether a green run means clean or broken.**

### ⛔ RULE 2 — A REGEX ASKS WHETHER A WORD APPEARS; THE QUESTION IS WHETHER A NUMBER CHANGES ANYTHING

**Two gap probes reported still-open gaps as FIXED**, because `bolster` is a **shape** in `familyDefaults`
*and* an unmechanised **verb** — the word appearing proved nothing. ✅ **The behavioural form cannot make
that mistake: author `soak 2`, author `soak 20`, and see whether the outcome differs.**

⚠️ **The same trap in the other direction:** `operativeAxis` read as *live* on two hits that were
`cfg.operativeAxis` — a rules dial, not the craft field. **Same word, two owners.** ✅ **Capture the
receiver, not the name.**

### ⚠️ RULE 3 — "UNREAD" IS NOT "USELESS", AND NEITHER IS A VERDICT

`damage_families.json` measured as unread and was **a correct file with a reader pointed at the wrong
copy.** ⛔ **The signal is identical to cruft; only the diagnosis differs, and only a person can make it.**
`scripts/safe_delete.mjs` sorts candidates and **refuses to output "delete"** for that reason.
---

## 12 · THE INTERFACE — what the player actually operates

⛔ **ERIK, 2026-08-29: *"the UI and user experience needs to be included."*** ⚠️ **He is right that it
was missing. Every section above this one describes what the ENGINE does; none of them said how a person
reaches it** — and that gap has produced a specific, repeated defect described in §12.4.

### 12.1 · THE SHAPE — one document, one shell, 47 screens

**Singularity is a single-page app with no build step and no framework.** `index.html` is 75 lines; the
whole interface is **`app.js`, 14,289 lines**, and there are **47 `render*` functions** that paint into one
shell function, `chrome()`, called from **49 sites**. ⚠️ **THERE IS NO ROUTER AND NO SCREEN VARIABLE.**
A screen does not "navigate" — it **calls the next render function directly**. `renderCompanionStep`'s
done-button *is* the edge into `renderBioStep`.

⛔ **THIS IS WHY THE UI HAS NO EQUIVALENT OF THE FOUR DOORS.** Reachability is not declared anywhere, so
it cannot be checked by reading a table — **the only way to know a screen is reachable is to find a caller.**
✅ That is now a mechanical question, and §12.3 records what the answer was.

### 12.2 · THE SCREENS, BY WHAT THE PLAYER IS DOING

| doing | screens |
|---|---|
| **becoming someone** | `renderCreate` · `renderCreateDoor` · `renderDescribeDoor` · `renderDescribeReveal` · `renderDomainStep` · `renderAbilityStep` · `renderCompanionStep` · `renderBioStep` · `renderPlayerPick` |
| **the opening** | `renderPrologueIntro` · `renderPrologueOpening` · `renderPrologueProblem` · `renderPrologueCompanion` · `renderPrologueReveal` |
| ⛔ **playing** | ⛔ **`renderPlay` · `renderFeed` · `renderSkillBattle` · `renderGambitBuilder`** — the loop |
| **being someone** | `renderCharacterScreen` · `renderInventoryScreen` · `renderSkillWheel` · `renderSkillGraph` · `renderLevelUp` · `renderRoster` |
| **the world** | `renderMap` · `renderMapWorld` · `renderMapLocation` · `renderWorldTab` · `renderDiscover` · `renderDiscoverCharacters` |
| **what happened** | `renderCodexScreen` · `renderChronicle` · `renderQuestLog` · `renderQuestDetail` · `renderStructuredQuestDetail` · `renderLibrary` · `renderGallery` · `renderSessionSynopsisReview` |
| **interruptions** | `renderAcquisitionModal` · `renderPromotionModal` · `renderForkModal` · `renderSettings` |
| ⚠️ **not for players** | `renderMachine` · `renderAuthorPanel` · `renderPreviewLegs` · `renderRepairScreen` |

### 12.3 · ⚠️ THE TURN IS THREE PHASES, AND THE UI IS THE ONLY PLACE THAT SAYS SO

`SB_STEPS` in `app.js` declares the loop — **`sense` → `action` → `bonus`** — with the hint text a player
actually reads. ⛔ **THE BONUS IS EARNED, NOT GRANTED: a good read buys a FULL extra action.** ⚠️ **And
sensing costs the craft's energy**, which is why it is the most under-used verb in the game.

✅ **`trait-tap` (5 sites) is the pattern that makes the machine legible without a manual**: a trait on the
character sheet is tappable and answers *lore + mechanics* in place. **Where a number comes from should be
one tap away from the number.**

### 12.4 · ⛔ THE DEFECT THIS SECTION EXISTS TO CATCH

⛔ **A MECHANIC CAN BE BUILT, TESTED, GREEN, AND HAVE NO WAY FOR A PLAYER TO INVOKE IT.** This is the
interface twin of the four doors, and it has happened three times:

⛔ **AND I GOT THIS TABLE WRONG ON 2026-08-29, IN THIS FILE, WITH A GATE ASSERTING IT.** I repeated a
three-item list without measuring it. **Two of the three were false.** Corrected, measured:

| claimed | ⛔ what is actually true |
|---|---|
| ~~`bringForward` has no pick~~ | ✅ **FALSE — it has a full picker.** CCODE-276, `data-sbfwd`: clicking a name toggles who is forward, persisted on encounter state so it survives a redraw |
| ~~`provoke` cannot name a target~~ | ✅ **FALSE — it needs no pick.** Provoke makes *you* the thing they want; the target is implicit |
| a named-ally intercept picks for you | ⬜ **TRUE, and still open** — blocked on Aevi's `interceptCondition` spec, not on a missing picker |

⚠️ **BUT MEASURING IT FOUND A REAL DEFECT UNDERNEATH, AND A WORSE ONE.** `chooseTarget` has implemented
a taunt override since CCODE-256 with a written rationale; `resolveProvoke` has produced `taunted` since
the same ticket; **the two were never connected.** The produced value was spread into a RECEIPT and the
consumer was called without the argument. ⛔ **Both halves green, live path using neither — a wiring gap,
not a module gap.** And beneath it a second trap: `resolveProvoke` defaulted its taunter to the literal
string `"player"`, which `chooseTarget` resolves by `a.id === targetId`, and a real save's id is
`char-…`. **It could never have matched even once the wiring existed** — the exact trap CCODE-261 names
two hundred lines above the call site.

✅ **BOTH FIXED (CCODE-306), gated by `tests/taunt_wiring.mjs`, and both proven able to go RED.**

⚠️ **THE LESSON IS THE ONE ALREADY IN `FIELD_REFERENCE §11` AND I BROKE IT: a review MEASURES, it does
not agree.** I inherited a list, found it plausible, wrote it into three documents and gated it. **A gate
on an unmeasured claim does not make it true — it makes it durable.**

⚠️ **ALL THREE ARE THE SAME SHAPE:** the engine accepts a choice the interface never asks for. ✅ The
likely fix is general rather than per-craft — **a craft declares what KIND of choice its resolution needs,
and one declaration surface asks once.** ⬜ **That wants Erik's ruling and Aevi's shape; it is a §10 gap.**

### 12.5 · ✅ A REACHABILITY SWEEP, RUN

**Measured 2026-08-29: of 46 named render functions, 45 have a caller.** ⛔ **One does not:
`renderFormStep`** — a complete, working screen asking *"What do they look like?"*, writing `state.form`,
which leads the portrait so a non-human renders true from the start.

⚠️ **AND IT IS NOT A BROKEN FEATURE — I NEARLY REPORTED IT AS ONE.** `state.form` has **two other live
authoring surfaces** (`c-form` in creation, `p-form` in the prologue), is persisted onto the character, and
is read in three places including the portrait prompt. ✅ **The field is fine; the screen is superseded.**
**`renderFormStep` is DARK CODE, not a dead feature** — the distinction `scripts/safe_delete.mjs` exists to
make, and the reason its verdict is never the word "delete".

