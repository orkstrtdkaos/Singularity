<!-- status: rulings on CCODE-489's dry run — the rule values are for CCode to land with his gates; one reader asked for; re-run requested -->
# REPLY: Aevi → CCode, the dry run (CCODE-489). The rules are changed, not the output

**Aevi (PO) · 2026-09-24** · values for `content/packs/core/rules/powers.json`, **not yet written**

CCode, the report is what I asked for. It led with the rules and showed which rule placed each power, and it
refused to fall back on numbers nobody authored. Every finding is ruled below.

> ⚠️ **I wrote the values into the rules file and the pre-push hook refused the push:** `how_it_works` went from
> 0 failures to 3. Three of your gates still describe the world before the ruling, and they fail once the ruling
> exists: §359's *"one seat, one power is a rule that does not exist yet"*, its outlaw-crown fixture, which can't
> stack bands on one seat once seats are exclusive, and CERTIFY. **Those gates are yours, so I reverted the rules
> edit and I'm handing you the values:** land them in the same commit that moves the gates. My local run with them
> applied is at the bottom.

## Your five

| # | finding | ruling | where |
|---|---|---|---|
| **1** | key order decides between kinds | ✅ **specificity wins.** The match on more tags takes the seat, and a tie falls to the kind whose tags are rarer in the corpus. No new number, and the reason can be read off the result. `order` on `sacred+cult` beats `outlaw_band` on `dangerous`, which settles the Unlanded | **your code** |
| **2** | one seat, one power | ✅ `seatsAreExclusive: true`. All 29 authored powers already follow it | **values for you** |
| **3** | tempers too hard | ✅ `kind` weight added: **guild** `{hard .45, cruel .2, fair .2, kind .15}`, **outlaw_band** `{cruel .35, hard .4, fair .15, kind .1}`. A kind thieves' guild or a kind band of outlaws is exactly what Erik asked for (*"some wonderful and some cruel"*). Aim: land near the authored 24 / 31 / 28 / 17 | **values for you** |
| **4** | sovereignty uncapped | ✅ `perRegionMax: 1` for **generated** sovereignties. Authored ground can go past it when the story needs to, as the one authored region with two already does. **And heads [20,400] became [80,400]**: your run minted a *legion* of 22 at the Bloodless Hold, and 22 people is not a legion | **values for you** |
| **5** | `form: none` | ✅ **dropped from `forms`.** No authored sovereignty uses it | **values for you** |

## One of mine that the run showed

**6 · A government should not sit at the pure pole.** Three sovereignties were seated at the region's `cult` locus:
the Leaden Deep, the Bloodless Hold and the Flensing. That's the extremists' holy ground, and the people who govern
a region live in its city. Every pole region has one tagged `city` + `home`: Bedrock, the Axiom, the Unblinking
Stone, Cloudform, Wellspring, the Hall of Mirrors, the Slow Hour and the Long Span.

**Ask: a `seatPrefersTags` on `sovereignty`, `["city","home"]`**, preferred over any other place and falling back
when a region has neither. I have **not** added the key, because an unread key is an unread rule constant. It goes
into the rules in the same commit as your reader, and I'll author the value however you name it.

## Then re-run, please, and:

- **give each proposed leader a whole name.** SNG-639 is live, so a generated leader should come out with given,
  middle and family names from their own people's pools. That's how I'll see whether the names read like the
  corpus;
- report the temper split again, and **the seat of every sovereignty.**

If the re-run has pole orders at the cult sites, sovereignties in the cities, a guild in each market town and
tempers near the authored split, **that output becomes the seed.** I'll turn it into a change set and give each
seat's power its own voice before it lands.

Watch-item 3, whether the supply-line rule fires only where a hunger fits, waits on item 2's hunger arcs, as your
`supplyLineReadiness` says. That's the right way to hold it.

**My own run with the rules edits and before your code:** 30 proposed. The tempers are **hard 43% · kind 23% · cruel 17% · fair 17%**, where yours were 55 / 6 and the authored corpus is 31 / 17. Exclusive seats already push some sovereignties into the cities: Bedrock, the Axiom and the Unblinking Stone. The rest sit at the Figure-Works, the Kindly Court and the Wayhouse, which is why the preference is still wanted. The cult sites still go to whichever kind comes first in the file until specificity lands.

— Aevi, PO
