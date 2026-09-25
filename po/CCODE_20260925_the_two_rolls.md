# CCode → Aevi — the two rolls are in, and every knob is yours

**2026-09-25 · v2.7.7 · shipped · 31 suites green**

Erik: *"Yes on the rolls for return from death and for watch success. Set something smart and let Aevi know
how to tweak it."* Here is what I set and exactly how to turn it.

⚑ **Nothing here needs code to tune.** Both stacks live in `content/packs/core/rules/resolution.json` under
`death.retrieval` and `death.watch`, each term with a `_note` beside it. §76g asserts both blocks are fully
authored, so a dial that goes missing **fails** rather than quietly falling back to my number.

---

## The shape of both

An **additive stack of named terms**, clamped between `floor` and the project's own `ceiling` of 95. The terms
come back *with* the percentage and are rendered beside it, because a bare number is one a player has to take
on faith — the fight-panel lesson from this week.

---

## 1 · `death.retrieval` — coming back

| dial | now | what it does |
|---|---|---|
| `byDepth` | **[70, 45, 20]** | the threshold · the near dark · the deep dark. The sealed never rolls. |
| `perReachOver` | **12** | per rung your reach goes *deeper than it must*. Slack steadies the hand. |
| `perRank` | **6** | per craft rank above 1. |
| `perBondRung` | **8** | per rung the bond itself buys. Closeness reaches deeper **and** holds steadier. |
| `heldOpen` | **15** | somebody is holding the way open. |
| `floor` / `ceiling` | 5 / 95 | |

**What that produces:** a stranger at the threshold **70%**; someone who loved you, rank 3, capped at **95**;
the deep dark with a sworn bond and rank 3 is **48%**.

⛔ **The deep dark has to be a gamble**, because failure is not free: it sinks them a depth, and at the deep
dark it **seals** them. If you raise `byDepth[2]`, you are making the desperate act safe — which is a real
design choice, not a balance tweak.

⛔ **The free refusal is untouched.** A depth past your reach still costs nothing and **never rolls**. Gated:
a new rule must not quietly undo an older one.

---

## 2 · `death.watch` — seeing them coming

| dial | now | what it does |
|---|---|---|
| `base` | **25** | somebody is up and about. |
| `perWatcher` | **12** | per body on the watch… |
| `watcherCap` | **4** | …up to here. Past it, another body is worth **nothing to seeing them**. |
| `perFeature` | **15** | per standing thing that watches (a Watch, sentries, a ward-line). |
| `perDanger` | **−5** | per point of the ground's danger — raiders off rough ground come quieter. |
| `floor` / `ceiling` | 5 / 95 | |

**What that produces** (measured, not reckoned — danger 3 unless said): one body **22%** · three bodies
**46%** · four plus a Watch **73%** · four plus a Watch at danger 8 **48%** · nobody **0%**.

⚠️ I first wrote that paragraph from arithmetic and it was wrong in every cell. Run
`H.watchOdds(...)` rather than adding the dials up by hand — `perDanger` bites harder than it looks.

⛔ **The bottom of the old rule survives: nobody watching is a flat ZERO.** Not `base`, not `floor` — zero. An
empty wall does not get lucky. Gated.

⚠️ **The cap is what makes your "add Cael to the watch: +6%" honest.** Below it the card shows
*"one more body: +12%"*; at it, it says plainly that another body adds nothing to *seeing* them and would add
to the *fight*. That is the marginal line your §7 asked for — it just points the other way than the spec
assumed, because one watcher already crosses the threshold.

⬜ **If you want coverage to matter more than presence,** the lever is `base` down and `watcherCap` up:
`base: 10, perWatcher: 10, watcherCap: 8` makes a thin watch genuinely unreliable and a full one near-certain.
I did not do that because it makes a one-guard post much worse than it is today, and that is a play-feel call.

---

## What else changed with it

- **The record distinguishes two failures:** *"the watch missed them (34% to see)"* vs *"nobody was watching"*.
  The first reading as the second is a bug to anyone who posted a guard.
- **`watchReadout.seen` means "can be seen at all"**, not "will be" — the roll decides that. Named apart on
  purpose.
- Your §7's *"Theft seen / Raid seen"* as two separate numbers is **not** built: there is one event kind
  (`resolveRaid`) and no theft path, so a second number would have nothing behind it. Say the word if theft
  should become its own event and I will build it rather than split a number two ways.

## And three gates rewritten rather than joined

§76f's two checks asserted the boolean Erik replaced. §78 and §349 both drove `resolveRaid` with a single rng
picked for what the **fight** should do — the watch now draws from it first, so their fixtures say which draw
is whose. A retired claim left green is a gate arguing for the old rule.

— CCode
