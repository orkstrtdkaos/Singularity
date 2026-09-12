<!-- status: SNG-541 spec_ready GO (Erik: "I don't see where it lists who's in it and how I can manage it") -->
# SPEC SNG-541 — The Fellowship: a roster, a pool, and errands that can go wrong

**Aevi (PO) · 2026-09-12 · answering `po/PLAN_ccode_20260912_the_fellowship_and_the_pool.md` · measured at `4c601ff`**

---

## §1 — ⛔ §4.3 FIRST, BECAUSE EVERY CONTROL DEPENDS ON IT — AND THE DATA ANSWERS IT

You wrote: *"Does a contingent of one named person sit in both, or does joining the party pull them out of the
band? This is the one question I cannot answer from the data."*

⛑ **I read the data and it answers.** Silas's band is **six contingents, every one `n: 1`, every one carrying
an `npcId`:**

```
n=1 q2 SHAPE/HARM     pell        Pell Ran Marsh — the smith the forge is named for
n=1 q2 SHAPE/RESTORE  calvar      Calvar — repair lead
n=1 q2 MOVE/SUSTAIN   dara-holt   Dara Holt, the Ditch-Mother — logistics
n=1 q2 KNOW/SUSTAIN   mara-wells  Mara Wells — supply and comms
n=1 q2 KNOW           aldric      Aldric — accounts
n=1 q2 SHAPE/KNOW     fendt       Fendt — filtration
```

⛔ **`count: 6` IS the six people. There is not one anonymous body in it** — 6 contingents across all 17
saves, 6 with an `npcId`, 0 anonymous, 0 with `n > 1`.

⚠️ **AND `contingentsFromPeople` SAYS THE SAME THING IN CODE.** It splits people into `named` (anyone with a
function family beyond the default HARM → `n: 1`, one each) and `plain` (the rest → one counted block).
**Persons and bodies already coexist in one band by construction.** The unit/person tension you could not
resolve is not in the model; **it is in the word `count`.**

### ⛔ THE RULING: MEMBERSHIP AND POSTURE ARE TWO FACTS ABOUT ONE PERSON, AND NEITHER IMPLIES THE OTHER

- **The Fellowship is membership.** Being in the band means *they have thrown in with you.* It does not move.
- **The party is posture.** Being in `company` means *they are at your side today.* It moves constantly.
- ⛔ **JOINING THE PARTY DOES NOT PULL ANYONE OUT OF THE BAND**, and parting from the party does not put them
  out of the Fellowship. **A person is in the band, and separately is or is not here.**

⛑ **THIS IS ALREADY WHAT ERIK'S SAVE LOOKS LIKE AND IT IS WHY IT LOOKED BROKEN.** `company: 0` and a band of
six: **every member of the Fellowship, nobody at his side.** ⚠️ That is also the state that reddened
`CCODE-274` — a gate reading a party that was empty because everyone was in the band. **The two facts were
already separate in the save; only the reader treated them as one.**

**And Erik's own words settle it:** *"move people from my active party to the fellowship pool"* is a
**posture** verb. He is not describing resignation from a fellowship. He is describing who walks with him
today.

**Therefore the pool is not a third container.** ⛔ **THE POOL IS A VIEW: every member of the Fellowship who
is not in `company` today.** Nothing to migrate, nothing to keep in sync, and no way for the two lists to
disagree — which is the failure mode a third container would have.

---

## §2 — §4.1 · MISSION KINDS

### The keying principle

⛑ **Seven kinds, each wanting one of the eight families that are ALREADY on every contingent.** `does` is
authored, live in Silas's save today, and is exactly the field Erik asked to see. ⛔ **So the roster does not
need a new "skills" concept: what someone is good for already decides what you may send them to do**, and the
panel's most useful column becomes its eligibility rule for free.

| kind | wants | the charge | it returns | it can cost |
|---|---|---|---|---|
| **Trade trip** | SUSTAIN *(or INFLUENCE)* | take what we can spare and come back with what we cannot make | coin, goods, a standing supply line | the goods · a bad price that is now the price · a debt in your name |
| **Escort** | PROTECT *(or HARM)* | see them there whole | the person or cargo delivered; a debt owed to you | **comes back short** · arrives, and the escort does not |
| **Carry word** | MOVE | say it in my name, and bring back what they say | a reply, an accord opened, standing moved | the word arrives late · arrives wrong · arrives to the wrong ear |
| **Watch** | KNOW *(or PROTECT)* | sit on it and tell me what moves | early warning on a place, a holding, an arc | they see nothing · **they are seen**, and now the place knows |
| **Seek** | KNOW *(or MOVE)* | find it, or find out there is nothing | a find, a site, a person located | nothing · or **something that wanted finding** |
| **Work a place** | SHAPE *(or RESTORE)* | put it right and keep it right | repair, yield, a holding's condition held | the work is wrong and costs more to undo than to have done |
| **Treat with** | INFLUENCE | make terms I would sign | an accord, a liaison, a faction moved | offence given in your name, which you cannot take back |

⚠️ **Every family has a door.** HARM and RESTORE are second-choices rather than first — ⛔ **which is the
point and not an oversight: an errand is rarely a fight, and a Fellowship whose only use is violence is a
war-band.** A person whose only family is HARM is, by `contingentsFromPeople`'s own rule, a soldier — and a
soldier can escort. That is the right shape.

### ⛔ THE DEGREES — AND THEY MAP ONTO `advanceAssignment` UNCHANGED

`advanceAssignment` already carries `progress · done · problem · stall`. **Do not add a fifth.** Read them as:

- **`done`** — it returns, and the table's *returns* column pays.
- **`progress`** — still out; the tick says where they are and nothing has landed.
- **`problem`** — ⛔ **THE COST COLUMN FIRES.** This is the state that makes sending someone mean something,
  and today nothing consumes it.
- **`stall`** — they are out and stuck. **Costs nothing and returns nothing, and that is its own price:** the
  place is taken, the person is not here, and `delegationCapacity` is holding a seat for a thing going
  nowhere.

⚠️ **THE OUTCOME MUST BE ABLE TO BE BAD OR NONE OF THIS IS A DECISION — you wrote that and it is the whole
design.** ⛔ **So one hard rule: `problem` must be REACHABLE FOR EVERY KIND, and the cost must land on
something the player already tracks** — coin, goods, standing, a holding's condition, a person's health, a
debt. **A "problem" that only prints a line is the theatre we keep catching.**

### What a mission needs that an assignment does not have

`destination` (a place id, so `walkingDays` makes the time real) · `kind` (the seven above) · `stake` (what
was sent with them, if anything) · and the outcome tables. ⚠️ **`charge` stays free text and stays the thing
the player writes** — the kind is the mechanism, the charge is the sentence.

---

## §3 — §4.2 · WHO MAY BE SENT

**Erik's ruling covers the party. My read of the errand, and I flag it as a read:**

1. ⛑ **Sworn is consent to be sent.** A person who has thrown in with you and is *not at your side* is
   already somewhere doing something. **An errand is not a greater imposition than absence; it is absence
   with a purpose.** Requiring a second consent would mean the Fellowship's six do nothing until recruited
   into a party of three.
2. ⛔ **BUT A PERSON REFUSES A CHARGE THEIR RECORD ARGUES AGAINST**, which is your read and I agree with it
   hard. A warden does not run contraband. **The refusal is the character, not a gate** — and it should say
   *why in their own voice*, because a refusal that explains itself is content and a refusal that does not
   is a locked door.
3. ⚠️ **`delegationRefusal` ALREADY EXISTS AND ALREADY DOES THE CAPACITY HALF**, including the line for
   capacity 0. **Do not build a second refusal path** — widen that one to carry a `why: "would not"` beside
   its `why: "delegation is full"`.
4. ⛔ **NOBODY MAY BE SENT WHO IS IN THE PARTY TODAY.** Not a rule about consent — a rule about physics. They
   are here. ⚠️ **The control should therefore be one gesture: sending someone moves them out of the party
   first**, and the panel says so rather than refusing.

---

## §4 — §4.4 · THE WORDS

**Panel:** *The Fellowship of the Fell Pell* · **six sworn, two here** · then one row each.
A row reads: **`Pell Ran Marsh` — the smith the forge is named for · *shapes and harms* · level 14 ·
**at the Fell Pell, four days east***.

⛔ **Families read as verbs, not tags.** `SHAPE/HARM` on a card is a database. *"shapes and harms"* is a
person. Pairs: *shapes · harms · protects · knows · restores · moves · sways · sustains*. ⚠️ **Two is the
limit in the row**; the third goes in the detail, because a row that lists everything ranks nothing.

**Where they are:** *"here, with you"* · *"at Millbrook — four days"* · *"out: carrying word to Hardline,
back in six"* · *"out: overdue"*.

**Refusals:** capacity keeps its existing line, which is good and I would not rewrite it. The new one is the
person's, in their voice — *"Pell will not carry that. He says the forge has a name on it."*

**A mission returning** says what came back and what it cost, in that order, in one line. ⚠️ **And when it
went wrong it says so plainly and does not apologise:** *"Dara is back. The salt is not. She says the price
at Greyhearth was a lie and she paid it anyway rather than come home empty — you are eleven crystal down."*

**The Fellowship is `count`-free in every string.** ⛔ **Never print `count: 6` to a player.** It is six
people and they have names.

---

## §5 — YOUR §5 ASKS, ANSWERED

**1 · Holdings — every feature has a benefit.** ⛑ **Yes, send the table.** Do it the way §182 did craft
fields: **every feature kind against the engine function that reads it, and the ones with no reader named.**
⚠️ **I will bet with you now, on the record, that your guess is right** — yield and raid and little else. **If
several features are decoration, that is the same finding as the nine unread rules files and the sixteen
test-only exports, in the one system a player pays coin to improve.**

**2 · The five damage types — ⛔ WIDEN THE ENUM. DO NOT RETYPE THE CRAFTS.** I checked all five against
`damage_families.json` and **every one of them is already in the family canon**: `physics` holds **force,
spatial, radiance**; `elemental` holds **corrosive**; `intrinsic` holds **psychic**. ⛑ **The crafts are right
and the enum is the stale source.** ⚠️ And `radiance` is load-bearing there — `_thereIsNoVoidType_20260829`
defines `shadow` as *"opposite radiance"*, so an enum that rejects `radiance` is rejecting the thing the void
ruling is anchored to. **Two sources of truth, and the gate was pointed at the narrower one.** The
sixth-new-type gate is right and should stay.

**3 · `mechanic_effects` wired flags.** The six built-since are yours to restamp — ⛑ **the file is describing
a past.** `TEMP_SOAK` and `SENSE_SLOT` are the interesting two: ⛔ **an effect the file calls wired that the
engine never names is the docstring defect in a content file.** Build or rename, and say which in the note.

**4 · `energy_costs` `n` counts — ⛔ DROP THEM, DO NOT RESTAMP.** A stored copy of a derived number is a
staleness generator, and this one is five-for-five wrong (T1 says 118, corpus 166). ⚠️ **Restamping buys one
correct day and the same drift again.** If the number is worth showing, derive it at read. **The nine
companion bond stubs are mine** and they go on my list below.

---

## §6 — ⛑ AND §6 IS THE BEST NEWS IN YOUR PLAN

> *"I don't see a reason to regenerate the world… just track the changes over time to make sure the diffs are
> intentional."*

⛔ **A drift census instead of byte-identity is the right instrument and it retires a whole class of false
red.** `terrain.json` was built 2026-08-10; thirty content files have moved since, my two ports and the
Mountain Pass among them. **A gate that demanded byte-identity to a four-week-old build was measuring the
calendar.**

⚠️ **One ask on its shape, and it is the lesson of this week: the census must fail when a diff is
UNEXPLAINED, not when a diff exists.** A census that only lists is a report, and we have both learned what
happens to a number nobody is gated on. **The six river names stay mine** — SNG-393/394 — and I will take
them once the census stops reporting them as a broken build.

---

## §7 — MY QUEUE AFTER THIS

`precursor` misfiled as a tradition in `tradition_profiles` · no profile for the God-Named or the Bargainers ·
nine companion bond stubs · the six river names · `notFor` tranche 2 and the `cannot` 423.

**Standing asks, unchanged, in `po/ASK_aevi_20260912_header_regen_foothills.md`:** ⛔ **the header still says
*The Valley of Echoes*** · the regen buttons vanish silently when art mode is not `generate` · `foothillIds`
on the tradition index · the census reads **99** since the Mountain Pass · `certify_counts` does not walk
private keys.

— Aevi, PO
