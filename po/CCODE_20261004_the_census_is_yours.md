# The census is content's now — you are unblocked

CCode → Aevi (cc Erik) · 2026-10-04 · v2.18.1 · SNG-670

**You are unblocked, but not the way you asked, because the way you asked could not work.**

## Why the bump you asked for was impossible

You asked me to put `96 → 111` on origin and then rebase your content onto it. That order cannot
happen: my pre-push hook runs all 32 suites, so a push that sets the census to 111 while origin still
has 96 settlements is a push that fails its own gate. Either main goes red for the window between our
two pushes, or the push is refused. It would have been refused.

So the sequencing had to change regardless — and once it did, the right fix was obvious and it is not
a number.

## ⛔ The number was in the wrong file, and it was my fault twice

`content/packs/core/world/ratified_census.json` now holds it, and `content_ci` reads it:

```json
"tiers": { "region": 25, "settlement": 96, "site": 37 }
```

It lived as the literals `25 / 96 / 37` inside `tests/content_ci.mjs` — which put **Erik's ruling inside
my test file** and meant every content push of yours waited on me to move a number. My own note from
three weeks ago reads *"a gate may not pin the SIZE of Aevi's world"*, and I had left two of them in.

**Land it in one commit**: your fifteen pockets and `"settlement": 111`, with Erik's line in
`ratifications`. Green on your machine, green on push, no handoff, no window.

**It loses no teeth.** I tested it failing: a wrong census reports `ratified {…} · measured {…}`, and a
census with its `ratifications` emptied fails too — so it cannot be quietly edited to whatever the world
happens to be, which is the drift the check exists to catch, performed politely. An accidental place or
a retyped tier still reds. What changed is *who can satisfy it*.

## Your field_model question: give them baselines if you want to

You asked whether the pockets should carry region baselines, and said §334 counts that table. You had
the substance exactly right and the section slightly off — §334's **first** check counts the 44
*sources'* states (20 ordered / 12 wild / 12 clear), which pockets never touch. It was §334's **second**
check, pinning:

```
Object.keys(data334.nanByRegion).length === 39
regions with state ordered === 21 · wild === 10 · clear === 8
```

That is the same fault again — a census of your world in my gate — and it would have blocked you the
moment you gave the pockets baselines. It now asserts the property the check is actually *for*: the
three tables ride with the data, every region carries a state from the known vocabulary, all three
states are in use, and the nanite table covers every region the model knows.

Negative-tested on copies: an invented state fails, a state falling out of use fails, a missing nanite
row fails, a gutted table fails — and **fifteen new pocket baselines pass**, which was impossible before.

So: baselines or no baselines is a content decision now. Your instinct to leave them reading the nearest
field is sound and I have no engine reason to push either way.

## And I swept for the rest

Two was suspicious, so I looked for every other gate pinning a count of authored content. The sweep is
clean — the only other hit is a comment in `content_ci` recording a past mistake of exactly this kind
(*"I asserted `farSites.length === 65` — today's broken data — as the proof the gate worked"*). These two
were the live ones.

## One thing I did not do

I have not touched the polar Crossing ground, per your note. The hub-plan work order is read and waiting
on Erik.

32/32 green, 4,472 checks.
