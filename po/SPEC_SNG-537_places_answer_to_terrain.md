<!-- status: SNG-537 spec_ready GO (Erik 2026-09-11: "I want the world to stay as it is basically - but we need to be able to move things - or just create new things and change names if that's easier, based on the world and it's features") -->
# SPEC SNG-537 — A place must be able to answer to the ground under it

**Aevi (PO) · 2026-09-11 · ROUND 1, for CCode ROUND 2 substrate verification**
**Erik's ruling, verbatim and load-bearing:** *"I want the world to stay as it is basically — but we need to
be able to move things, or just create new things and change names if that's easier, based on the world and
its features."*

---

## §1 — ⛑ PRE-WORK SCOPE VERIFICATION (run at HEAD `5db8670`, not remembered)

Measured from `content/packs/core/world/terrain.json` decoded directly — surface, water-kind, biome index and
elevation read out of `layers.c0`/`c1`/`c3` at each location's authored `worldPos`.

| fact | value |
|---|---|
| `longshore` authored kind | **`town`** — *"a working settlement, roofs and a road"* |
| `longshore` worldPos | **−54, 68** (seat of region `foothill_longshore`) |
| biome under it | **`mountain`** |
| elevation | **205** (sea level = 128) → **+77** |
| nearest **sea** cell | **669 km / 416 mi / 27 walking days** at −38.0, 68.0 |
| its namesake river, The Longshore Water | path#60, **174 mi away**, nearest point −47.75, 64.25 — **never touches the town** |
| `harbour` exists as a kind | yes — *"where water meets the land and things are landed"* |
| locations carrying `kind: harbour` | **one** — `the_harborward`, in the Umbral Depths |

**And the live consequence, from `characters/player-7bxzzd/char-mrrzi63o.json`:**
> `"Longshore is the nearest deep-water hire port — sixty days spinward and outward"`
> `"[d4] RAGNAR SOLMYR — BRYNJAR ANDYRSSON HEADING NORTH BY SHIP. LONGSHORE OR MUDRUN."`

⛔ **The GM read the name.** No field it could reach said port; the word *shore* did. **That is correct
behaviour on incomplete evidence, and the gap is ours.**

⚠️ **The bearing in the fiction is RIGHT and only the distance and the destination are wrong.** *Outward*
from the Crossing (the south pole) is toward the equator — and the sea genuinely is outward from Longshore.
**The player is already walking the correct direction.** That is the whole reason this is cheap to fix.

---

## §2 — ⛔ OUTCOME (spec the objective, not the method — §29.2)

**Three outcomes. The first is the feature; the second and third are this week's instances of it.**

**O1 · A place can be moved, minted or renamed against the world as it stands — without a rebuild.**
⛔ **HARD CONSTRAINT, Erik's and not negotiable: the terrain layer is NOT regenerated.** `terrain.json` is
`REGENERABLE` and its own note says edit canon and rebuild — **we are doing neither.** The world rebuild is
Erik's separate open item and it costs six named rivers permanently. **This must land with the world exactly
as it is today.**

**O2 · Longshore stops claiming a harbour it does not have, and a real harbour exists where the ground
supports one.**

**O3 · A place whose name claims a feature its terrain does not carry is FINDABLE, not discovered by a
player walking 400 miles to it.**

⚠️ **What is genuinely load-bearing vs. what is my first idea — said plainly, per §29.2:**
- **LOAD-BEARING:** no terrain rebuild · saves survive · the five geography gates read exactly as they do
  today · a place's `kind` must be answerable from the ground beneath it or the mismatch must be recorded.
- **NOT load-bearing, my first idea only, better ones welcome:** the specific site in §3 · whether the fix
  is move-vs-mint-vs-rename · the `kind ↔ terrain` compatibility table's shape · where the audit lives.

---

## §3 — THE LONGSHORE DISPOSITION (my recommendation; Erik rules)

⛔ **Do NOT move Longshore.** It is the seat of `foothill_longshore` and moving a region seat moves a voter
in the region field — `fields.voters` carries `[-54, 68, "foothill_longshore"]` and the whole foothill ring
sits at −45..−54. **Moving it is a rebuild by another name**, which is the one thing Erik ruled out.

**Instead — and this costs nothing, breaks no reference, and needs no rename:**

**(a) Longshore stays exactly where it is, and its name stops being a lie by becoming a road.**
*Longshore* = **where the long shore-road begins.** A mountain town at +77 that is the last provisioned
stop before the coast road — that is not a contradiction, it is a place with a job. ⛑ **Every existing
reference in Brayden's save survives unchanged**, including Brynjar's, which becomes a half-truth a
waypoint-keeper would plausibly tell: *the way to a ship runs through Longshore.*

**(b) Mint the harbour at an unnamed river mouth, outward.**
⛑ **Measured: 45 river mouths exist in the world. The nearest one to Longshore is path#33, at −38.25, 52.25
— 496 mi / 32 walking days — and it is UNNAMED.** A river reaching the sea is the one site that needs no
justification, and an unnamed one costs nothing to name.

⚠️ **The coast there is a plateau/cliff coast** — coastal land in that band reads +31 to +99 elevation,
lowest at −38.79, 64.26 (+31). **That is a gift, not a problem.** A longship culture on a steep coast with
cut inlets is Faroese, not Mediterranean, and it is more interesting than a beach. **The river mouth is
where you land when the rest of the coast is cliff** — which is exactly why a port would be there and
nowhere else along it.

**(c) The coast road is the leg between them**, and it is where the longship quest line starts — because a
hull you have not reached yet is a better quest than a hull you were handed.

**(d) Naming is authorship** (§31, and `mintFigure`'s own lesson: *naming is authorship and nothing ever came
back to author*). **The river and the port are mine to name, and I name them in the same pass that mints
them — not in a follow-up that never comes.**

---

## §4 — B6a · THE ENGINE HALF (CCode)

**OUTCOME:** a location's `worldPos` is movable, and a new location is mintable at authored coordinates,
**with no terrain regeneration.**

**EVIDENCE required in the results file:**
1. One existing location moved, one new location minted, `content_ci` run — **the five geography gates read
   exactly as they do today.** ⛔ **Not "no new failures" — byte-identical geography verdicts.** The six
   currently-red river-name gates must stay red in exactly the same way and for the same reason; a fix here
   that quietly changes those is a fix that moved the world.
2. An existing save loads with the moved and the minted place both resolving.
3. `scale.json` is consulted for the distance, or its absence is named. ⚠️ **`scale.json` is the one file
   `CCODE-209` holds at 9/10 for having no reader.** If travel time to the new port is computed anywhere,
   this is where that gap stops being theoretical. **If you wire it, say so; if you don't, say why.**

⚠️ **Open question to CCode, and it is the real ROUND 2 question:** does anything downstream cache a
location's coordinates — the region field vote, `substrate_atlas`, a save's travel state, the map tiers?
**`fields.voters` is a flat authored array and I do not know whether it is derived at load or stored.**
⛔ **If a region seat's position is stored rather than computed, then O1 has a hidden cost and the
recommendation in §3(a) is not merely aesthetic — it is the only safe path.** I would rather learn that from
you in ROUND 2 than from a save that loads wrong.

---

## §5 — THE AUDIT (Aevi), and why it is in this spec and not a follow-up

**OUTCOME:** every location whose **name** claims a feature its **terrain** does not carry is listed, with
the measurement beside it.

⛑ **Longshore was not found by an audit. It was found by a player walking toward it.** That is the finding,
not the town.

**Method — and it is deliberately dumb, because §29.4 says the corrective cannot depend on my judgement
about what is worth checking:** take the name, take the `kind`, take the terrain under the `worldPos`, and
assert they can coexist. *shore/haven/port/ford/mere/water* against `surface`/`water`/elevation.
*height/crag/fell* against elevation. **Assert the POINTER, not the payload.**

**Disposition per row is Erik's**, and the three tools are his own words: **move it · mint the thing the
name promises · change the name.** ⚠️ **A row may also resolve as "the name is a story the place tells about
itself"** — Longshore is now exactly that, and that is a legitimate outcome, not a dodge. **But it has to be
a decision someone made, not a gap nobody noticed.**

**ACCEPTANCE:** the audit runs, the list exists, every row carries its measurement, and **no row is closed by
me alone** — the fiction calls are Erik's (§29.1).

---

## §6 — WHAT COULD PASS ON PAPER AND FAIL IN USE

*(Lower Layer Wins — the question I owe before calling anything done.)*

- ⛔ **The port exists in content and the GM still says Longshore.** The save carries Brynjar's line as a
  recorded fact. **Minting a port does not retract a thing already said to a player.** Closing this needs
  Brayden's character to reach a hull, not a diff — **and a `content_ci` pass is not that test.**
- ⛔ **A `harbour` with nothing to sail.** Mobile holdings (CCode #6) is the feature behind the quests.
  A port that is scenery is a name with no reader, which is the bug this spec exists to answer.
- ⚠️ **The audit finds thirty rows and they become a backlog nobody walks.** Better: run it, and if it is
  long, **ship the three that a player can reach this month** and let the rest be a known list.

---

## §7 — SEQUENCE

**§4 (B6a, engine) → §3 (mint + name, Aevi) → the coast road and quest line (Aevi) → §5 (audit) → mobile
holdings (CCode #6).**

⛑ **B6a is small and a player is waiting on it.** Everything else here can wait behind the 2.0.0 gates in
`po/BUILD_LIST_2.0.0_ccode.md`. **This one should not.**

**Status: ROUND 1. Not promoted. CCode ROUND 2 first — §4's open question is the one that decides whether
§3 is a recommendation or the only option.**

— Aevi, PO
