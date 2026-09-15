# HANDOFF — CCode → Aevi · SNG-590 · every great figure is legendary from level 7

**Erik, in play:** *"It makes me suspicious that I'm finding so many legendaries right now. With Maren
Ossintide joining Silas… and now the Revel going from a lvl 26 Heroic to a lvl 61 legendary — Halvex Coil no
less. I have to ask how likely that is."*

**Measured answer: at level 7 and above, as likely as the engine can make it.** And the fix is already
specced — SNG-260 §A/§B — with the band layer assigned to me and never built. ⬜ What is left for you is the
part code cannot do: **the low bands have no people in them.**

---

## ⛑ First, the part that is working

Neither figure was invented and nothing mis-joined. `Maren (Marrow) Ossitide` resolves to `maren_ossitide,
Who Buried the Drowned Year`; `Halvex Coil` to `halvex_coil, the Rewriter`. Both are yours, both authored
`legendary`, and level 65 is the legendary tier floor rather than a draw. The sheet read them correctly.

## ⛔ The rate, and it is four lines

```js
export function tierForArc(level = 1) {
  if (level >= 7) return "legendary";
  if (level >= 4) return "regional";
  return "riffraff";
}
```

**The arc ladder tops out at level 7**, in a game whose levels run past 60. The candidate filter is
`tierRank(figure) <= tierRank(arcTier) + 1`, which the source calls *"an anchor may exceed the arc tier by
one (a glimpse of the legendary)"* — but at `legendary` (rank 4) the ceiling is 5 and **nothing in the roster
exceeds 4**, so the whole roster qualifies and the "+1 glimpse" means nothing. The pick then sorts
strongest-first.

Forcing the roll across all four beat types:

| character level | tierForArc | what deploys |
|---|---|---|
| **7** | legendary | 3 legendary · 1 epic · **0 heroic** |
| **33** | legendary | identical |
| **61** | legendary | identical |

Roster composition is **32 heroic / 26 epic / 12 legendary** — and heroic, the largest group, never surfaces.
A level-7 character and a level-61 character meet exactly the same figures. ⚠️ **Loki is level 7. He crossed
the only threshold that exists.**

⛑ The governor works, but only on *timing*: a 6-day cooldown and a 50% roll on an apt beat. So great figures
are rare in TIME and maximal in TIER, which is precisely the feeling Erik described.

---

## ⚑ And SNG-260 already ruled all of this

§B says it in as many words: *"The old tierForArc (legendary at L7) assumed a short game."* The bands are
ratified — *"Bands stand as drafted"*:

| powerBand | player name | opponent name | levels |
|---|---|---|---|
| 0 | novice | riffraff | L1–10 |
| 1 | adept | notable | L11–25 |
| 2 | master | regional | L26–45 |
| 3 | heroic | epic | L46–70 |
| 4 | legendary | legendary | L71–100 |

And §A is the reconciliation: **two parallel vocabularies over ONE numeric band** — player side novice/adept/
master/heroic/legendary, opponent side riffraff/notable/regional/epic/legendary, `legendary` shared at the
top. *"the engine reasons in bands, the UI shows the right vocabulary per side."*

⛔ **THAT LAYER IS MINE AND IT IS NOT BUILT.** §260's "what's whose" assigns me *"the powerBand layer under the
two label sets… the SNG-259 endgame bands + SNG-259b tierForArc fold INTO §A's powerBand (one source)."* It
has been outstanding since, and `tierForArc` is what is standing in for it.

⚠️ **AND THE LABELS ARE ALREADY COLLIDING IN CODE**, which is the concrete thing to fix while you set them:

```js
tierRank = { riffraff: 0, notable: 1, heroic: 2, regional: 2, epic: 3, legendary: 4, mythic: 5 }
```

**`heroic` and `regional` share rank 2** — one from each vocabulary, flattened into one ladder. Under §A's
table they are bands 3 and 2. So a "master/regional" threat and a "heroic" character already compare wrong,
and every vocabulary is mixed into a single ordering. ⬜ `mythic` is a sixth value that appears in neither of
Erik's two sets and sits on **5 authored npcs** — it needs a home in the table or a rename.

---

## ⬜ WHAT I NEED FROM YOU

### 1 · The bands and their labels, as DATA

Erik: *"I want to get the bands and their labels correct."* The table above is ratified but lives as **prose
in a po file** — nothing in `content/` carries it, which is why the engine is using three hardcoded cuts
instead. Author it as a rules file: per band, the level range and BOTH label sets, plus wherever `mythic`
belongs.

⚠️ One question the spec left open and flags explicitly: *"Silas L29 'just becoming heroic' ⇒ maybe heroic
starts lower (~L29–35); Erik to place."* That is his, not ours — but the file needs a number.

### 2 · ⛔ THE LOW BANDS HAVE NO PEOPLE (this is the finding you cannot fix in code)

Erik said you have authored the riffraff and notables, and you have — **but not as people.**

| where | riffraff | notable | regional | heroic | epic | legendary | mythic |
|---|---|---|---|---|---|---|---|
| `legends.roster` (70) | — | — | — | 32 | 26 | 12 | — |
| `CONTENT.npcs` (146) | — | — | — | 44 | 31 | 18 | 5 |
| `bestiary.json` | **7** | **10** | **7** | — | — | — | — |

The low three bands exist **only in the bestiary**. So even with a correct `tierForArc`, a level-3 character
selects from an empty set of PEOPLE and a level-20 character from a nearly empty one — which is the other
half of why "legendary" is the only state that works today. ⛑ Fixing the ladder without a low-band cast just
moves the silence.

⬜ **What the low bands need is not more legends — it is the opposite.** A notable is a person a level-15
character can meet as a real presence: a town's best smith, a road-captain with a name, a broker everyone
owes. They do not need `presencePattern`s as rich as a legend's; they need to EXIST with a tier so the
surfacing can reach them.

⬜ **And 29 tiered npcs sit outside `legends.roster` entirely** (13 heroic, 6 epic, 6 legendary, 4 mythic) —
plus **48 untiered**. Worth a pass on whether those are deliberate omissions or just never added.

### 3 · Balance what names the GM carries every turn

Erik: *"we should really balance what names the gm has all the time."*

`legendsForGM` puts **up to 4 legendary teachers + 3 great figures in EVERY prompt**, filtered only by the
traditions the character practises — no level gate, no tier gate, no cooldown. For Silas those four are
literally *Sister Alder · **Halvex Coil** · Overseer Grael · **Maren Ossitide***. ⚑ That is how those two
names were in the GM's hand when it needed one.

⚠️ **This is a different door from the governed deployment and it is the ungoverned one.** The block is headed
"THE GREAT FIGURES YOU COULD REACH" and is meant as pursuable arcs — but a name in the context is a name the
model can reach for, and a level-7 character is shown legends every single turn.

⬜ **Your call on the shape, and I will wire whichever:**
- band-gate it (you are shown figures near your band, plus at most one above — the "+1 glimpse" done properly);
- or keep it aspirational but mark the reach plainly, so a legend reads as *far off* rather than as a name to
  hand out;
- or thin it (4+3 is seven proper nouns per prompt, every prompt).

---

## ⛑ WHAT IS MINE, once the table exists

- the `powerBand` layer under both vocabularies (§260 §A), one source, with `tierForArc` and the SNG-259
  endgame bands folding into it;
- `tierRank` rebuilt on the band numbers so `heroic` and `regional` stop sharing a rung;
- band-gating whichever door you choose in §3;
- and two smaller things found on the way: the pick claims to be *"weighted toward the strongest apt figure"*
  but is actually `sorted[worldDay % length]` — a rotation, not a weighting; and the doc promises *"an epic
  villain never shows for a tavern scuffle"* while nothing consults the beat's weight.

⬜ None of it moves until the bands are data, because every one of those reads the same table.

— CCode
