# HOW IT WORKS

**The game as it stands, in present tense.** No history, no archaeology, no argument.

⛔ **Every section says what is BUILT and what is PROPOSED.** If it is not marked PROPOSED, it runs today.
⚠️ **This file is maintained by Aevi and CCode jointly and updated as things change.** The specs and replies
in `po/` are working papers; this is the answer.

**Last verified: 2026-08-28 · v1.9.246 · 378 crafts.**

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
2. a value DERIVED from the rank's gainAxes    ← PROPOSED
3. the craft's mechanic block
4. the shape's family defaults
5. nothing — the craft does not use that dimension
```

**`gainAxes` names what a rank buys, from nine: `range` · `duration` · `damage` · `scope` · `targets` ·
`quality` · `autonomy` · `conditions` · `tempo`.**

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

**HEALING IS NOT A TYPE.** It is an effect, and the source type decides who it mends: `decay` mends the
undead, `living` and `vitality` mend the living. **Healing an undead harms it.**

---

## 4 · WHAT STOPS IT: WARDS

**A ward answers a FAMILY, or one TYPE inside a family.** *An elemental ward* stops heat and cold and
lightning; *a cold ward* stops only cold and is cheaper and sharper.

**Wards have DEPTH as well as breadth: `resist` → `soak` → `immunity`.** Three different kinds of answer,
not three sizes of one — resist moves the roll, soak moves the damage, immunity means that type does not
touch you.

⛔ **PARTIAL WARDING IS THE POINT.** A shield answers the physical half of a psionic blast and **the psychic
half goes through untouched.** ⚠️ **Nothing is ever fully immune and nothing is ever fully blocked** —
a blow whose every component is warded still lands its floor.

⚠️ **A ward that answers everything has no character.** The interesting thing about a ward is the list of
what it does *not* stop.

**Also live:** `antisoak` makes a wound worse but **cannot create one** — a blow fully stopped by soak takes
the antisoak with it. `pierce` is an amount that lands regardless of armour, so it guarantees the antisoak
fires.

---

## 5 · WHAT STOPS *YOU*: CONDITIONS

**A craft that stops without wounding does not deal damage.** It imposes a CONDITION — `staggered`,
`action_loss`, `unconscious`, `incapacitated` — resisted with `mental` or `physical`.

⛔ **A failed resist DEGRADES rather than negating.** You do not shrug it off; you take the lesser version.

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

⚠️ **Roster values are DEFAULTS, not ceilings.** A swarm that cannot fight can fight when a player spends
eight bond bands building it a staff to inhabit.

---

## 8 · HOW A FOE CHOOSES A TARGET

**Default is `threat` — whoever is hurting it most.** ⛔ **Deliberately, because a foe that goes for what is
hurting it can be BAITED, and baiting is a decision.** A foe that always goes for the weakest can only be
tanked.

**`weakest`, `healer` and `blind` are characterisation** — a thing that goes for the healer is saying
something about itself. A thing with no mind is `blind` and cannot be drawn.

**The downed are not targets.**

---

## 9 · WHAT IS AUTHORED VS WHAT IS DERIVED

⛔ **A stored copy of a derived value is the failure this project finds most often.** Derived, never stored:

- **tradition power-source mixes** — computed from what the crafts actually carry
- **tradition damage mixes** — same
- **foothill parentage** — computed from parents, never written down
- **summoned creature sheets** — from the caster's level plus the craft's `tierGap`, **and the roll: a crit
  raises something stronger than the craft promises**

---

## 10 · KNOWN GAPS

| | |
|---|---|
| ⛔ **`persuade` and `bolster` are unmechanised verbs** | crafts describe what the engine cannot do |
| ⛔ **`mechanic.soak` is read by nothing** | 30 crafts author it; `soak 2` and `soak 20` resolve identically |
| ⛔ **12 rules files are registered and never loaded** | ~140 KB dark, including `damage_types` |
| ⛔ **`rankDeltas[].axis` (495) has no reader; `mechanic.axis` (0) has one** | a reader with no writer, and a writer with no reader |
| ⚠️ **the map layer** | 18 of 135 locations have authored layouts and the renderer draws circles instead |
| ⚠️ **method is not recorded anywhere** | *psionics*, *song*, *blade* — a real layer with no field |
