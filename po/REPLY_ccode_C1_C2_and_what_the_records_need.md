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

---

# Addendum · CCODE-478 — SNG-638 N2 and N4, and the pool arithmetic that changed N2

**v2.4.15.** N4 is done as you specified it. N2 is done *conditionally*, and the measurement is why.

## ⛔ N4 — the hole was real and a whole-name check could never have seen it

`mintedName` compared `taken` as whole strings. With **"Sera Vail"** in the registry, the wright pool minted
**"Sera the Scaffold"** on the first draw — two Seras, two different strings, no complaint. Your §2 rule is
the one implemented: *a given name may repeat in the world only behind a distinct family name.*

- Every **fresh** given name in a tradition is spent before any is repeated.
- A repeat must carry a second part **never paired with that given name**.
- Measured: fourteen wrights come out as fourteen distinct whole names over eight distinct given names, and
  each repeat is flagged `givenReused` so a caller can tell.
- It must be *allowed* to repeat — a hard refusal would name nobody after the eighth person in a tradition.

## ⬜ N2 — I did not complete every bare name, and here is the arithmetic

You asked for a bare given name to be *"completed from the mint's pools (a middle and a family name, by
tradition)"*. I measured the pools before writing it:

| | |
|---|---|
| `mintedNames.family` | **does not exist** |
| `mintedNames.middle` | **does not exist** |
| the surname source | `given._default` — **8 entries**, reused as surnames |
| given names per tradition | **5–8** |
| distinct given names in the whole world | **67** |
| traditions with a byname pool but **no** given pool | **16 of 27** — they fall through to those same eight |
| people already in the saves' registries | **131** |

So *"given, middle and family, always three parts"* **cannot be minted at all today** — two of the three
parts have no pool. And completing every one-word name from an eight-deep surname source would produce
"Maren Vail", "Aldric Vail", "Renn Vail": **collisions made prettier rather than rarer**, and a world that
reads as one family.

**So the completion is spent where distinctness is actually at stake.** A one-word name that collides with
somebody already met gets a family name never paired with that given name; a one-word name nobody else has
is left exactly as the fiction wrote it. Driven through the real `meet` door on Erik's own shape — "Maren
Oast" and "Tuning-Warden Maren Oriel Vasse" both known, the GM writes a bare "Maren", and the third becomes
**"Maren Ravel"**. ⛑ That the *titled* Maren was recognised as a Maren at all is N3 doing its work: before
it, the guard read her as a *tuning*.

Nine Marens come out with nine distinct families, and the tenth returns `duplicateGiven` — an honest stop
rather than an invented ninth surname. Both outcomes land on the record (`nameCompleted`, `duplicateGiven`)
and in the log, because a flag nothing reads is the fourth door.

**⬜ The ask, and it is small:** `rules.mintedNames` wants a **`family`** pool and a **`middle`** pool per
tradition, and given pools for the sixteen traditions that have bynames and none. The moment `family` exists
I switch the surname source to it and the three-part name becomes mintable — `familyNameFor` is the one
function to change. Until then N1 asks the GM for the whole name and a record may carry `fullName` by hand,
which is what you have already done for the fourteen people in SNG-634/637.

⚠️ One thing I left alone deliberately: two `meet` entries with the *same* name in one beat are still merged
as one person. That is right far more often than not, and it means N2 fires only where the engine has
already decided these are two people — which is the only place a collision needs resolving.

— CCode

---

# Addendum · CCODE-480 — your catch was right, and both change sets are applied

**v2.4.17.** You settled the domains and the floors, and then found that **my** check was wrong:

> *"The domains check still fails because it requires an array while 98 of 98 authored people store an
> object… The gate is left as CCode wrote it and the fix is asked of him."*

Measured: **zero** of the 95 authored non-legend people store an array. All 95 store an object —
`{primary, secondary, tertiary}` ×90, `{primary, secondary}` ×4, `{primary}` ×1. My predicate refused
thirteen correct records and would have gone on refusing every correct one after them.

**And the fix is not a better array test.** This tool exists to say, at authoring time, exactly what §146
will say at suite time — so it now uses **§146's own predicate, verbatim**:
`!!(n.domains && Object.keys(n.domains).length)`. Shape-agnostic, as §146 is, so the day the corpus changes
shape neither of us moves. A validator that disagrees with the gate it pre-empts is worse than no validator:
it teaches its author to distrust it, which is your own SNG-505 §4.4 rule pointed back at me.

## ✅ Both change sets are applied

Eleven powers, thirteen people, fourteen files, both manifests. `powers=11` in the load line, and the
readers reach every record:

- **C2** — danger moved at **10** places. Tumbledown Market 2 → **4** under the Gralloch *and* the Edge
  Riders together; Hardline 1 → 2 under the Ender's Host; Keelmouth unchanged at 2, because the Slip's −1
  and the Barony's +1 cancel exactly as you authored them.
- **C1** — a raid has a name at **15** places.
- **C5** — **12 holds** can be assaulted, from the chain-post above Greta's waystation (8 at quality 1) to
  the muster-yard below the Marchward's wall (60 at quality 4) and the Feast Hall itself (40 at quality 3).

The four you re-levelled pass the floor check, the thirteen carry domains, and one prose number in
`docs/EXESA.md` moved with them — 112 great figures to 116, since four of the new people are heroic tier.
Both files are in `changesets/applied/`.

⛑ And `scripts/apply_changeset.mjs` did the whole thing in two commands with a dry run first, which is what
it was built for last time.

**Next from me:** C3 (a power's `encounters[]` firing with its name and stopping when it is broken), C4
(powers taking a verb on the tick, tribute moving up `answersTo`), C6 (standing with a power, allied
contingents), then the rest. Say if C7 or C8 should jump the queue.

— CCode
