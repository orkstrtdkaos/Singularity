# MIND — complete state proposal

**Author:** Aevi (PO) · **Date:** 2026-08-15 · **SNG-450 → SNG-470**
**Status:** ⛔ **PROPOSAL. Written to `content/packs/core/abilities/` but NOT migrated** — `tradition` still holds live pole ids (`cogitant`/`syllogist`/`figurist`); `traditionV2` holds `Mind`. See §6.

---

## §1 — WHAT CHANGED

**36 skills → 24.** Corpus-wide, driven almost entirely by this one tradition:

| metric | before | after |
|---|---|---|
| PERCEIVE rank-rows | 519 | **111** |
| CONTROL rank-rows | 372 | **251** |
| SOCIAL rank-rows | ⛔ **0** | **9** |
| abilities corpus-wide | 376 | **342** |
| `sense`-tagged crafts | 0 | **27** |
| `obscure`-tagged crafts | 0 | **13** |

⚠️ **The single biggest cut was not Mind-specific:** 21 traditions each carried an L1 "first gift" sense at **identical stats** — energy 3, magnitude 3, same three-rank arc. **One skill written twenty-one times.** Replaced by `Attunement`, whose `sectFlavour` carries what each tradition perceives.

---

## §2 — THE 24 SKILLS

### Case Closed · L1 · — · energy 4 · `setup` · *syllogist*

> Lay a matter out so completely that the argument ends — and at its height, walk one person to the conclusion that ends them.

- **r1** Matter Settled — +persuade
- **r2** Inescapable — +bind · *targets, conditions*
- **r3** Only Consistent Act — +empower · *damage, autonomy, duration*

### Contradiction · L1 · 1d4 · energy 5 · `hinder` · *syllogist*

> Interrupt an action by naming its actual error out loud while it is happening — the plan with the gap, the boast with the hole, the ritual with the wrong step — and the move falters. The Syllogists' f

- **r1** Named Flaw — +hinder, +break
- **r2** Reductio — +bind
- **r3** Collapse — no new function · *duration, scope*

### Cutting Figure · L1 · 1d6 · energy 6 · `strike` · *figurist*

> Impose a simple figure — a line, an angle, an arc — across a target in sight, and what it crosses is parted: mail, hide, timber, limb. No blade, no heat. The Figurists' first offense, and matter losin

- **r1** Drawn Line — +strike, +break
- **r2** Compound Figure — no new function · *scope*
- **r3** Cut Thought — +hinder · *damage, conditions*

### Ignore Me · L1 · — · energy 3 · `conceal` · *cogitant* · **OBSCURE**

> Suggest, without a word, that there is nothing here worth looking at — and walk through a lit room full of people who all decline to notice you.

- **r1** Nothing Worth Looking At — +conceal
- **r2** And Whoever Is With Me — no new function · *scope, targets*
- **r3** Even Spoken To — +deceive · *duration, conditions*

### Named Exclusion · L1 · — · energy 4 · `ward` · *figurist*

> Set a figure on a place and name what it keeps out — a threshold one named kind of thing cannot cross, and it holds without you standing there.

- **r1** Set Mark — +ward, +make
- **r2** Mark That Keeps — +bind · *scope*
- **r3** Governed Ground — +command · *scope*

### Quiet the Room · L1 · — · energy 3 · `guard` · *cogitant*

> End fear, rage or panic as a condition — stop a rout, talk a mob down, or bring an ally back who has been provoked, frightened or broken.

- **r1** End the Condition — +soothe
- **r2** Stop the Rout — no new function · *scope, targets*
- **r3** Back From It — +restore · *quality, conditions*

### Sustained Regard · L1 · 1d6 · energy 6 · `strike` · *cogitant*

> Fix the whole of your attention on one person in sight and refuse to give it back. Balance, breath, grip and the clotting of a wound all falter. No vector, no contact — the Cogitants' first offense.

- **r1** Whole of It — +strike, +hinder
- **r2** Held Regard — +bind · *duration, autonomy*
- **r3** Undivided — no new function · *duration, conditions*

### Unbroken Thread · L1 · — · energy 1 · `sustain` · *syllogist*

> Keep working — a thought, a watch, a translation, a wound being tended — through fear, pain, exhaustion and interruption, and come back to exactly where you were.

- **r1** Held Through — +sustain
- **r2** Across Days — +resist · *range, duration*
- **r3** Last Thing to Fail — no new function · *duration*

### Deduced Strike · L2 · 2d6 · energy 4 · `strike` · *cogitant* · **SENSE**

> Read a foe mid-fight without breaking stride, and land an ordinary blow exactly where it does the most — thought aimed through a body, and it hits like a much stronger arm.

- **r1** Read the Fight — +strike, +reveal
- **r2** Called Effect — +hinder · *quality, conditions*
- **r3** Strike in the Reading — no new function · *tempo, conditions*

### Force the Move · L2 · 2d6 · energy 4 · `hobble` · *cogitant*

> Say the one thing that makes waiting impossible — and an enemy who was holding a good position gives it up to answer you.

- **r1** Make Them Answer — +provoke
- **r2** Break the Line — no new function · *targets, scope*
- **r3** On the Record — +bind · *duration, autonomy*

### Formcraft · L2 · — · energy 6 · `construct` · *figurist*

> See the pattern, symbol or structure a thing is an instance OF — the form behind the fact. The abstract-pole mastery: to a Figurist, matter is the coarse residue of form.

- **r1** Pattern Eye — +reveal
- **r2** Figure — +make, +deceive
- **r3** Argument Made Real — +bind · *targets*

### Physician's Tome · L2 · 2d4 · energy 2 · `healing` · *syllogist*

> Find what is actually wrong and put it right — by procedure or by pattern, but correctly, so that it does not come back.

- **r1** Diagnosis and First Care — +heal
- **r2** Full Sequence — +restore, +mend · *scope, quality*
- **r3** Root and Branch — no new function · *quality, targets*

### Solved Route · L2 · — · energy 1 · `reposition` · *cogitant*

> Work out the way through before you take a step, and then take it — the quickest line through a crowd, a ruin, a guard rotation or open country, walked as though you had been given the plan.

- **r1** Route — +move
- **r2** Moving Space — +travel
- **r3** Designed Scene — no new function · *targets, conditions*

### Built System · L3 · — · energy 2 · `construct` · *syllogist* · **PROJECT**

> Build a logical structure that operates in the world — a system whose internal logic sustains it without constant maintenance.

- **r1** Working Rule — +make
- **r2** Self-Regulating — +sustain
- **r3** Lasting Structure — +bind · *autonomy*

### Memory-Palace · L3 · — · energy 6 · `bolster` · *cogitant* · **SENSE**

> Search your own memory for something that bears on what you are doing — and let it sharpen the attempt.

- **r1** Cross-Reference — +empower, +reveal
- **r2** The Whole House — no new function · *quality*
- **r3** The Borrowed Room — +track · *targets, conditions*

### My Reality · L3 · — · energy 6 · `conceal` · *figurist* · **OBSCURE**

> Lay a suggested picture over a place so that everyone who enters sees somewhere else — and at its height, give the picture ONE thing it can really do.

- **r1** Ordinary Corner — +conceal, +deceive
- **r2** Ordinary Room — no new function · *duration, scope*
- **r3** My Reality — +make, +strike · *duration, targets, quality, autonomy, conditions*

### Psychic Lance · L3 · 3d6 · energy 7 · `strike` · *cogitant*

> Drive a spike of focused thought straight into a mind at range — no vector, no contact, nothing to block, and it hurts exactly as much as being hit.

- **r1** The Spike — +strike
- **r2** Two at Once — no new function · *targets, damage*
- **r3** Nothing Held — +hinder · *conditions*

### Walking Figure · L3 · — · energy 7 · `ward` · *figurist*

> Send a made figure to do a named thing in a place you are not — and, at its height, to judge the cases you did not foresee.

- **r1** Sent Figure — +summon, +bind
- **r2** Figure That Stays — +ward · *duration*
- **r3** Figure That Judges — no new function · *autonomy*

### Working Model · L3 · — · energy 2 · `construct` · *cogitant*

> Model a thing so completely in your head that the making is only following the thought — and build it faster and truer than your tools should allow.

- **r1** Single Thing — +make
- **r2** Whole Working — +mend · *scope, targets*
- **r3** Modelled Country — no new function · *targets, quality, autonomy*

### Borrowed Form · L4 · — · energy 12 · `reposition` · *figurist*

> ⚠️ FIGURIST FLIGHT — shape-taking. A figurist works in forms, so to fly they take the form of something that does. Your gear comes with you, folded into the form, and you remain yourself inside it. Th

- **r1** Borrowed Form — +travel, +transform
- **r2** Long Form — no new function · *range, duration, targets*
- **r3** Shared Form — no new function · *duration, scope, targets*

### Mind Meld · L4 · — · energy 8 · `bolster` · *cogitant* · **SENSE**

> Open your mind to another and hold it open — see what they see, know what they know, and act as one thing across a distance neither of you could shout across.

- **r1** Open Door — +reveal, +empower
- **r2** Long Room — +sustain · *range, scope*
- **r3** One Mind — no new function · *quality, conditions*

### Unmoving Mind · L4 · — · energy 11 · `guard` · *cogitant*

> Enter a stillness nothing can move — fear, pain, deception and the fastest attack all slide off it, and you keep reading the room while they try.

- **r1** Still Mind — +resist
- **r2** Stillness While Moving — no new function · *conditions*
- **r3** Nothing Lands — no new function · *conditions, quality*

### Convergent Strike · L5 · 5d6 · energy 13 · `damage` · *cogitant* · **SENSE**

> Read every thread of threat in a contest at once — the unarmoured seam, the failing grip, the worst possible instant, the sharpest part of the blade or the finest edge of a psychic figure — and bring 

- **r1** Convergent Strike — +strike, +foresee

### Names of Power · L5 · 4d6 · energy 13 · `hobble` · *cogitant*

> Hold a person by the names they answer to — and the more of them you have, the less of them is left to refuse you.

- **r1** Name They Are Called — +bind, +persuade
- **r2** Name They Are Known By — +command · *conditions*
- **r3** Name They Call Themselves — +hinder · *duration, autonomy, targets*

---

## §3 — FUNCTION ALLOCATION

| function | rows | target | note |
|---|---|---|---|
| CONTROL | 17 | 3 | ⛔ **`bind` alone is 9** — see §5.1 |
| HARM | 8 | 3 | 4 damage skills: 1d4 / 1d6 / 2d6 / 3d6 / 5d6 |
| MAKE | 7 | 1 | `make` 5 · `summon` 1 · `transform` 1 |
| PERCEIVE | 6 | 4 | ✅ near target after the per-rank review |
| BOLSTER | 6 | 3 | |
| RESTORE | 5 | 2 | |
| DEFEND | 4 | 2 | |
| SOCIAL | 4 | 3 | ✅ `persuade` 2 · `provoke` 1 · `soothe` 1 · ⛔ **`bargain` 0** |
| CONCEAL | 5 | 2 | |
| MOVE | 3 | 1 | |

**Gain axes:** conditions 10 · targets 9 · quality 7 · autonomy 4 · damage 3 · duration 3 · scope 2 ·
**tempo 1**. ⚠️ **Scope was 29 before the rebalance** — "bigger area" had been the default answer to what a
rank buys.

---

## §4 — NEW SYSTEMS PROPOSED (all Erik-ruled, none wired)

### 4.1 The sense slot — `content/packs/core/rules/tempo.json`

**A round has two slots: SENSE and ACTION.** A craft tagged `sense` or `obscure` resolves in the sense
slot and **does not consume the action slot.**

⛔ **THE SLOT IS CONTESTED.** Each side declares **SENSE** (read them: bank tempo, take your craft's edge)
or **OBSCURE** (deny their read: they bank nothing). **SENSE vs SENSE — both bank. SENSE vs OBSCURE —
contested roll, and ⛔ THE OBSCURER WINS TIES**, because throwing dirt is easier than reading a man with
dirt in his eyes. **That tie rule is the whole balance** — it stops the slot belonging permanently to the
perceptive traditions.

**Already tagged on existing crafts: 27 sense, 13 obscure.** ⚠️ **10 of 14 traditions still have no
obscure** — being authored per tradition as each is audited.

### 4.2 Tempo — the bonus-action buildup

**Built on `charges.json` `rate` accrual, not beside it.**

| banks | rate | | spends | |
|---|---|---|---|---|
| a read that produced usable information | 1.0 | | **1** | a second action this round |
| winning a round on the momentum meter | 0.6 | | **2** | a whole-round action |
| an ally's read shared with you | 0.5 | | **3** | ⛔ act before the round opens |
| acting on ground you prepared | 0.4 | | | |
| **Conserve** intensity | 0.3 | | | |
| ⛔ **Surge** intensity | **0.0** | | | |

**Cap 3, empties at end of contest.** ⛔ **Surge banking nothing is the design point** — the greedy line and
the patient line become genuinely different strategies.

**Tempo is also a rank-gain axis** (`§34.3`) with four forms: **sense-slot use** (Mind) · **extra action**
(Body — a flurry) · **banking** (Breaking, Order) · **compression** (Span). ⚠️ **Strongest axis on the
list — at most one or two per tradition, never unconditional.**

### 4.3 Projects and journeys — `SYSTEM_SPEC §33`

**Three resolution scales: scene · PROJECT (banks progress per world tick) · JOURNEY (applies per leg).**
⛔ **A skill judged on the wrong clock reads as useless and gets cut** — I proposed cutting Built System
for failing "how often does this arise" when the answer was *"every time the party has a week."*

---

## §5 — KNOWN PROBLEMS I HAVE NOT FIXED

### 5.1 ⛔ `bind` is doing four unrelated jobs

**9 of 17 CONTROL rows.** It currently means: *interrupt an act* (Contradiction), *hold a threshold*
(Named Exclusion), *maintain an institution* (Built System), and *psychic domination* (Names of Power).

⚠️ **Proposed split — and it applies corpus-wide, not just to Mind:** `bind` (hold a person) · `ward` (hold
a place) · `establish` (hold a rule). ⛔ **This would drop CONTROL to near target without cutting a single
ability.** Not done — it needs a corpus-wide migration and Erik's ruling.

### 5.2 Three skills marked for removal, not deleted

**Formcraft** remains (Erik: abstraction belongs in Mind). **Noesis and Logos are cut.** ⚠️ Their
"mysteries" were never authored — **if a mystery is ever written, it attaches here.**

### 5.3 Ranks that still add nothing

**Convergent Strike** (single rank, 5d6, L5) and **Borrowed Form r3**. ⚠️ Both are legitimate as
single-effect capstones but neither names a gain.

---

## §6 — ⛔ QUESTIONS FOR CCODE

**Q1 · `mechanic.dice` and `magnitude` have ZERO consumers.** Combat resolves **d100 + attribute + tier +
matchup** per `skill_battle_system.json`. **Every damage number in the corpus is authored and unread.**
⚠️ **Which is true: does the battle system gain a damage step that consumes `dice`, or should `dice` be
dropped in favour of `intensity`/`harmRung`?** I have been recording damage intent on the assumption it
gets wired — **tell me if that assumption is wrong before I do a second tradition.**

**Q2 · The sense slot.** Minimum viable is: a second slot per round, a declared SENSE/OBSCURE per side,
obscure wins ties. **The tags are already on 40 crafts** (`sense: true`, `obscure: true`). ⛔ **Is this one
flag on the round object, or does the exchange loop need restructuring?**

**Q3 · Tempo.** Banks per `charges.json` `rate`, caps at 3, empties at end of contest. ⚠️ **Does the charge
system already support a per-contest bank that clears, or is that new?**

**Q4 · Rank cap.** I authored a five-rank tree before checking; **282 abilities carry 3, 38 carry 2, 21
carry 1.** ⛔ **Is 3 a hard engine limit or a convention?** If it is a limit, it should be a content_ci
gate.

**Q5 · `read` / `sense` / `obscure` as fields.** I have added three booleans to ability records. ⚠️ **Do
these belong on the ability, or should they be `functions` entries so the existing tag machinery picks
them up?**

**Q6 · Project skills.** `downtime: true` + `projectTicks: true` on Built System. ⛔ **Does `worldtick.js`
have anywhere to bank per-tick progress against a named completion date, or is that new?**

**Q7 · The taxonomy split.** New abilities carry `tradition` = live pole id and `traditionV2` = `Mind`.
⚠️ **At migration: swap `tradition` ← `traditionV2` and drop the field.** **Is anything else reading
`tradition` that would break on a 14-value vocabulary?**

---

## §7 — REVERT

**Every batch logged before edit**, in `po/staged_content/`:
`revert_SNG-450_batch1` · `revert_SNG-453_batch2` · `revert_SNG-454_sense_cull` ·
`revert_SNG-455_perceive_strip` · `revert_SNG-456_control_review` · `revert_SNG-457_mind_final` ·
`revert_SNG-460_mind_rebalance`.
