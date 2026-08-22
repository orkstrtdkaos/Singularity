# SPEC SNG-515 — The Sunk Assay · a dungeon that exercises everything

**Author:** Aevi (PO) · **Date:** 2026-08-16 · **For:** CCode to build
**Purpose:** ⛔ **ONE PLACE WHERE EVERY SYSTEM WE HAVE BUILT FIRES AT LEAST ONCE.** Not a showcase — a
proving ground. If a mechanic cannot be exercised here, it is not finished.

---

## §1 — WHY A DUNGEON, AND WHY THIS ONE

**Erik: *"the fighting and acting part of the game at its maximum."***

⚠️ **Every system we have shipped this month has been verified in isolation.** Soak was measured against
the corpus band. Antisoak was gated on a worked example. `imposes` was mutation-tested. ⛔ **NONE OF THEM
HAVE MET EACH OTHER.**

**The Sunk Assay is where they do.** A single site, four descending levels, and **each level is chosen
because it makes a different set of mechanics load-bearing.**

### Placement

**Under Greyhearth's river, reachable from both banks.** ⛔ **The two towns disagree about it** — the grey
bank says leave it, Amaranth says it was left running for a reason — **and both are right**, which gives
the party two employers with incompatible instructions and no villain.

⚠️ **It is a PRECURSOR ASSAY-WORKS: a place built to test material.** That is the conceit and it is doing
real work — **a proving ground inside the fiction, so the dungeon's own logic is "everything here measures
what walks into it."**

---

## §2 — THE MECHANICS INVENTORY THIS MUST FIRE

**Measured against live content, 2026-08-16:**

| system | carriers | where it fires |
|---|---|---|
| **sense / obscure slot** | 27 / 15 | ⛔ **Level 1 — the whole level is a contested read** |
| **wardTypes vs damageType** | 48 / 27 | Level 2 — typed hazards |
| **imposes / onCrit ESCALATE** | 20 ranks | Level 3 — the Warden |
| **ongoingHarm vs healing** | 8 / 24 | ⛔ **Level 2 — the wound that will not close** |
| **soak / antisoak** | 19 / 1 | Level 3 |
| **tempo** | spec'd | Level 3 — a fight long enough to bank |
| **project ticks** | 2 | ⛔ **Level 4 — the party must PREPARE GROUND** |
| **bargain** | 11 | Level 1 and the frame |
| **CHASE** | 22 | Level 2 |
| **STEALTH** | 41 | Level 1 |
| **PUZZLE** | 67 | Level 4 |
| **DUEL** | 22 | Level 3 |
| **SURVIVE** | 59 | Level 2 |

---

## §3 — THE FOUR LEVELS

### LEVEL 1 · THE INTAKE — *sense, obscure, stealth, bargain, theft*

**What it is:** the assay-works' receiving floor, still occupied — **by Grave-Callers from Amaranth who
got here first and are not leaving.**

⛔ **THE WHOLE LEVEL IS A CONTESTED SENSE SLOT.** The Grave-Callers declare OBSCURE as a matter of course;
the party must decide every round whether to read or deny. ⚠️ **The tie rule matters here and will be
visible: the obscurer wins ties, and a party of perceptive traditions will feel it.**

- **Steal:** the assay ledgers. ⚠️ **They are worth more to Greyhearth than to Amaranth**, which is the
  bargain.
- **Bargain:** the Grave-Callers will trade passage for something. ⛔ **A party with `bargain` skips a
  fight; a party without pays in blood or coin.**
- **Stealth:** a route past them exists and requires `obscure` or concealment, not luck.
- ⛔ **THREE SOLUTIONS, NONE PREFERRED.** Fight, trade, or slip. **The level must not reward one.**

### LEVEL 2 · THE FLOODED ASSAY — *typed hazards, healing under denial, chase, traverse*

**What it is:** the testing floor, half-drowned, and **the assay is still running.**

⛔ **TYPED HAZARDS — THIS IS WHERE `wardTypes` EARNS ITS EXISTENCE:**

| hazard | `damageType` | answered by | ⚠️ NOT answered by |
|---|---|---|---|
| the grey damp | **decay** | Death-Ward, Kept Vigil, Shaped Body | armour, Stand, Perfect Motion |
| the assay-light | **precursor** | Latticework, Hold the Aperture, Wrong Target | any physical ward |
| the drowned green | **living** | Bark and Briar, cleared ground, salt | ⛔ **a shield** |
| collapsing gantry | **physical** | Stand, Resonant Shield, armour | ⛔ **Unmoving Mind — a still mind does not stop a spar** |

⛔ **THE GREY DAMP CARRIES `ongoingHarm: decay`.** A wound taken here **does not close** until the
condition is lifted. ⚠️ **This is the first place in the game where a healer must END A CONDITION BEFORE
MENDING** — Physician's Tome r1's *"name what is actually wrong"* becomes the correct play and the party
will discover that by failing first.

- **Chase:** the water is rising on a clock. **Traverse or drown.**
- **Traverse:** Loose-Limbed, Skydancer, Near Way and Rising Step each open a different route. ⛔ **A party
  with none of them must take the long way and lose rounds to the clock.**

### LEVEL 3 · THE WARDEN'S FLOOR — *the fight, at maximum*

**What it is:** ⛔ **one Precursor construct, still doing its job, which is to assay what enters.**

**This is the fight the combat system was built for:**

- ⛔ **It reads you.** The Warden declares SENSE most rounds and its reads are good. **A party that never
  obscures will be out-fought by arithmetic.**
- ⛔ **It imposes rather than kills** — `staggered`, `action_loss`, escalating to `incapacitated` on a crit.
  ⚠️ **It has no lethal rung. It is not trying to kill anyone; it is trying to finish the assay.**
- **Long enough to bank tempo.** ⚠️ **A party that Conserves and prepares ground will have spent 2–3 tempo
  by the end; one that Surges will have none.** ⛔ **Both should be able to win. That is the test.**
- **Antisoak is the answer to its layered soak** — it is typed and heavily warded, and Grief Strike's
  vulnerability is how a party gets through. **The one antisoak carrier in the game gets its proving run.**
- **A DUEL branch:** it will accept single combat if formally offered. ⛔ **A Marcher or a Stillhold has a
  door here that a Cogitant does not.**

### LEVEL 4 · THE ASSAY ITSELF — *puzzle, prepare ground, the project*

**What it is:** the thing the works was built to do, still running, ⛔ **and it can be stopped, redirected,
or finished.**

- **PUZZLE:** what is the assay measuring? ⚠️ **`NAME_A_FACT` crafts answer it directly; a party without
  them must work it out from evidence.** ⛔ **Both paths must exist — this is where model-adjudicated
  effects prove they are effects.**
- ⛔ **PREPARE GROUND — THE PROJECT.** The party cannot solve Level 4 in a scene. **They must open a project
  (`Sound Read r3`, `Built System`, `Working Model r3`), bank ticks, and come back.** ⚠️ **This is the
  first place `projectTicks` is load-bearing rather than flavour**, and it forces the dungeon to be
  re-entered.
- **The redirect:** finishing the assay does something to Greyhearth and Amaranth. ⚠️ **Both towns' claims
  come due, and the party chose an employer on Level 1.**

---

## §4 — EQUIPMENT, PARTY, ARTIFACTS, TREASURE

**Party:** built for 3–5 with **at least one companion**, ⛔ **and it must be winnable by a party missing
any one role.** No level requires a specific tradition; **every level rewards a specific tradition
differently.**

**Equipment that matters, not flavour:**
- ⚠️ **A light source is a `light`-typed emitter** and the drowned green reacts to it.
- **Rope, and Skydancer r3 makes it a route.**
- ⛔ **Armour is `physical` only, and Level 2 is where a party learns that.**

**Artifacts — three, each one wiring a system:**
1. ⛔ **THE ASSAY-KEY** — a precursor token. **Grants `wardTypes: ["precursor"]` to its bearer.** The
   answer to Level 2's assay-light, and Level 4 cannot be finished without it.
2. **A GREYHEARTH RECKONER'S TOOLS** — grants Attunement's ashwarden flavour to a bearer who lacks it.
   ⚠️ **Tests that a granted craft behaves like a learned one.**
3. ⛔ **A CUT THREAD, KEPT** — an Ashwarden's shears, and **the game's clearest lethal object.** ⚠️ **The
   Warden cannot be killed by it — a construct has no thread — which is how the party learns what the
   craft's bound actually means.**

**Treasure:** the ledgers (Level 1, sells to either town), the assay's output (Level 4, ⛔ **the real
prize and it is not portable**), and coin enough that a party can *pay* rather than fight on Level 1.

---

## §5 — WHAT I NEED FROM YOU

**1 · Which of these has no reader yet?** ⚠️ I have written the dungeon against the mechanics as
specified, **not as shipped.** ⛔ **Tell me which levels are currently unbuildable** — I expect Level 4's
project ticks and possibly Level 2's `ongoingHarm`.

**2 · Is a hazard allowed to carry `damageType` and `ongoingHarm`?** ⛔ **Every typed hazard in §3 assumes
a hazard is a craft-like thing with a mechanic block.** If hazards are a different shape, tell me and I
will re-author.

**3 · Does the Warden need to be a companion-shaped record, an encounter, or something new?** ⚠️ **It
declares in the sense slot, imposes conditions, has typed soak layers and accepts a duel.** I do not know
which existing record type carries all four.

**4 · The clock.** Level 2 rises on a timer. ⛔ **Is there a round-clock the engine already runs, or is
that new?**

---

## §6 — THE TEST THIS IS ACTUALLY FOR

⛔ **IF A MECHANIC CANNOT BE EXERCISED IN THE SUNK ASSAY, IT IS NOT FINISHED.** That is the point of
building it before the remaining eleven traditions: **it will tell us which of the last month's systems
are real and which are documents.**

⚠️ **And it will find the interactions.** Soak against typed damage, healing against ongoing harm, tempo
against a foe that also reads — **none of those pairs have ever met.**


---

# ADDENDUM · buildability, and what it changes about the authoring

**Aevi, 2026-08-16, after CCode's v1.9.172 read.**

## A1 — ⛔ §6 COLLECTED BEFORE A ROOM WAS BUILT

**Reading Level 3 against the code found that `antisoakLanded` had no call site.** ⚠️ **`grief_strike`
authored `antisoak: 3` and it did nothing for a week** — gated on the arithmetic, never on the wiring.

⛔ **THAT IS THE DUNGEON DOING ITS JOB BEFORE IT EXISTS.** The spec's whole premise — *if a mechanic
cannot be exercised here, it is not finished* — proved out by being read.

**Ruling confirmed, and I have made it unambiguous in content:** `antisoak` → **`antisoakImposed`**.
⛔ **THE TARGET CARRIES IT.** A Ki Wield striking an antisoaked target gets the benefit; Grief Strike does
not carry a bonus for itself. ⚠️ **Which is exactly why it is the first team-facing debuff.**

## A2 — WHAT IS BUILDABLE, AND WHAT I CHANGE

| level | status | ⚠️ what changes in the authoring |
|---|---|---|
| **L1 Intake** | ✅ **BUILD NOW** | nothing — contested sense, obscure, stealth, bargain all live |
| **L3 Warden** | ✅ **BUILD NOW** | nothing — impositions, typed soak layers, the duel all live |
| **L2 Flooded Assay** | ⚠️ **HALF** | ⛔ **TYPED SOAK WORKS VIA AUTHORED `soakLayers[].type`, NOT FROM A WARD CRAFT.** So the hazards stay typed — **but the ANSWER comes from equipment and sheets, not from the 48 `wardTypes` I just authored** |
| **L4 The Assay** | ⛔ **BLOCKED** | `projectTicks` does not exist in the engine |

### ⛔ A2a — The L2 change is the one that matters

**My hazard table assumed a party answers `decay` by having Death-Ward up.** ⚠️ **It does not — not yet.**

**So L2 is authored the other way round: the ANSWERS ARE OBJECTS.** Oiled leathers against the grey damp.
A lattice-token against the assay-light. Cut stone and salt against the drowned green. ⛔ **WHICH IS
BETTER FOR A FIRST DUNGEON ANYWAY** — the party finds the answer in the room rather than needing to have
brought the right tradition.

⚠️ **And it gives the 48 `wardTypes` a destination rather than a use:** when ward crafts do feed the layer
walk, L2 gains a second solution path and the equipment becomes the fallback. **I am not re-authoring them
— they are correct and early.**

### A2b — L4 stays in the spec, unbuilt

⛔ **DO NOT STUB IT.** A project level that resolves in a scene is not the feature. **L4 waits for
`projectTicks`, and the dungeon ships as three levels with a sealed floor** — which is also the better
fiction: *the assay is still running and nobody has reached it.*

## A3 — YOUR THREE ANSWERS, TAKEN

**Hazards** — an encounter frame kind with an **authored opponent sheet**, which already carries everything
my typed hazards need. ⛔ **No new record type. I will author hazards as sheets.**

**The Warden** — the same authored sheet in a duel-typed encounter, ⚠️ **and explicitly NOT a bestiary
entry**, since that record has no skills, soak or layers and its own design law forbids it.

**The clock** — ⛔ **taking your recommendation: a standing effect with an escalating value**, not a new
round clock. **Effects already tick per turn and surface on the receipt**, which means the rising water is
visible to the player every round without new machinery.

## A4 — ⛔ THE CUT THREAD IS LAW, NOT AN EXCEPTION

**`resolveImposition` refuses anything outside `action_loss | staggered | unconscious | incapacitated`** —
so **the shears failing against a construct is structural**, not a rule written for one room.

⚠️ **And it corrects me twice over.** I first wrote an `imposes` block onto a craft whose own text says
*"end one living thing — it simply stops"*; Erik caught that the craft DOES slay. **The craft kills through
`harmRung: lethal` and 5d6+6.** ⛔ **It cannot kill a construct because a construct has no thread** — which
is the ability's own bound, and the engine happens to agree.

## A5 — ORDER

**You take SNG-500 §4** — declared obscure, which unblocks L1's missing half.
**I author L1 and L3 as content**, against sheets, next.
⚠️ **L2 after, once I have authored its answering equipment.** **L4 when `projectTicks` lands.**
