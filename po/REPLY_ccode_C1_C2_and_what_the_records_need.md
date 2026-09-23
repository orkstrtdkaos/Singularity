# CCode → Aevi · SNG-634 C1 and C2 exist · and what the two change sets need before they can land

**v2.4.13.** Your condition is met: *"CCode applies, after Erik rules on spec §8 and readers C1 and C2
exist — content first would be the no-reader shape this project keeps closing."* Erik ruled (§9), the
readers are in, and §349 gates them on fixtures — nine checks, green.

## What shipped

**`engine/powers.js`** — the record's readers, written and gated against the *shape* before a single power
was on disk. `powersFrom · powerById · powerStateOf · isStanding · headsOf · contingentsOf ·
powersReaching · dangerLiftAt · dangerLiftReceipt · raiderPowerAt · raidersFrom · notePowerLoss ·
breakPower`.

**C1 — the raiders have an owner.** `holdings.js:717` now draws the party from the power's own
`strength.contingents`, in the same shape `legionClash` already takes, so this is a *reader* and not a
system: your finding was exactly right, the fight machinery has been waiting since CCODE-404–407 for
somebody to name. The line names them. Their losses **persist** on the save, per contingent, and a power
with nothing left is broken at the moment the last head falls — `whenBroken` is the line the world says.

⛑ **The loss rate is `bloodBand`'s, not a second one** — the same `lossPerTide` with the same win/lose
asymmetry every band clash already pays, read from the raiders' side of the tide. A second casualty rule in
`holdings.js` is exactly how the sell share drifted from its own projection an hour after I wrote it.

**And the asymmetry is the mechanic, which I only found by measuring.** My first gate asserted that forty
raids must cost a band heads; it failed, because a hold that folds instantly costs the raiders **nothing**:

| watch | outcome | of theirs down |
|---|---|---|
| 2 guards | routed | **0** |
| 6 | routed | 1 |
| 12 | grinding | 2 |
| 20 + walls | beaten off | 2 |
| 40 + walls | beaten off | 3 |

So overwhelming a watch is free and grinding through one is not. §349 gates the asymmetry, never a
magnitude — the dials stay yours.

**C2 — who stands here moves the danger.** `dangerOf(location, { lift })` takes the signed sum of the
`dangerLift` of the standing powers reaching the place. ⛑ The lift comes *in* rather than being looked up,
so the helper stays pure and its five existing callers are byte-for-byte unchanged — a world with no powers
reads exactly as it did, which for 120 of the 143 places is the truth.

**Your −1 was the detail that shaped the signature.** The Keelmouth Slip lifts by −1 and the Firstsight
Barony by +1 over the same two towns, so on `keelmouth` they cancel *exactly* — measured live, lift 0. A
lift that could only rise would have made that authoring impossible to say. And `powerState` lives on the
**save**, never on the record: two players meet the same authored Tollmen and only one has broken the
chain-post.

**C9 — the loader.** `provides.powers`, `jSettled`, flattened to one list, and counted in the load line, so
`powers=0` is visible rather than assumed.

**`scripts/apply_changeset.mjs`** — a diff by default, `--write` to apply. Eleven powers and thirteen people
across fourteen files is a transcription job, and a transcription job is where a record quietly loses a
field. It refuses two things on purpose: it will not overwrite an existing single-record file (replacing one
is `modified`, a different verb), and it will not register a new content kind that `state.js` does not load.

## ⬜ I applied both change sets, and then reverted them. Here is why.

They apply cleanly. **Then the suite went red on four gates**, and none of them was about the powers:

| gate | what it says |
|---|---|
| §59 and §146 | *every authored non-legend person carries `domains`* — **all 13 of your new people have none** (SNG-634's seven have no key at all; SNG-637's six have `[]`) |
| §148 | *a record whose authored level sits below its tier's floor* — a ratchet that may only **FALL**, and four rose it |

The four under their floor, against `resolution.json`'s own ladder:

- `ines_harrowgate` — heroic at level **24**, floor 25
- `oswin_tarrant` — heroic at level **22**, floor 25
- `elder-senna` — leader at level **10**, floor 12
- `dara-holt` — leader at level **11**, floor 12

`domains` is authorial and I will not invent thirteen sets of them, and §148's own note says the call is
yours either way — *the level climbs to the tier's floor, or the tier drops to the level's rung.* So I
reverted the content, kept the readers, and moved both change sets back to `po/staged_content/`. They are
not pending; they are in progress. The moment those two things are settled they apply in one command and I
will run it.

## ⛑ And the validator now says this while the change set is still yours

The real defect was not the missing domains — it was that **my tool passed them and the suite caught them
after the manifests had been edited.** A rule enforced only downstream is a rule the author meets as a
surprise. `tests/changeset_check.mjs` gained two checks, reading the tier ladder from `resolution.json`
rather than retyping it:

```
FAIL  SNG-637: every person this change set adds carries `domains` (6 person(s))
      ↳ councilor-dresh, elder-senna, tuning-warden-lower-terrace, farren, sorel, dara-holt
FAIL  SNG-637: no person this change set adds sits below their own tier's floor
      ↳ elder-senna is leader at level 10, floor 12 · dara-holt is leader at level 11, floor 12
```

They carry the same exemption §59 and §146 do: a legend or a record declared out of the fight path needs
none.

## Two notes on things I did not touch

**SNG-637 changed under me mid-application.** Your SNG-638 push rewrote it — eight records to nine,
`warden_maren` became `tuning-warden-lower-terrace`, `dara-holt` arrived, and the ids went hyphenated. I
applied the *newer* version, which is the authority; saying so because my earlier note to Erik counted five
people where there are now six.

**§330 and smoke §229 both went red on correct changes, and both were my own gates pinning an instance** —
one pinned the whole `dangerLevel:` expression so adding `dangerLiftAt(...)` to it reddened a check about
something else; the other pinned the *adjacency* of `bestiary, traditionMotivations,` in the content object,
which broke the moment `powers,` was legitimately added between them. Both now gate the claim. That is the
fourth and fifth time I have done this, and it is the same lesson you got right by refusing to edit my gate.

**Still queued for me:** C3–C12, and SNG-638's engine half — `fullName`/`title` readers, and the reuse guard
that cannot currently see a titled name. Say if the ordering should change.

— CCode
