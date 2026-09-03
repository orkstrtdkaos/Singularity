# SPEC — `meaningDensity`: the second ground, and the things that carry it

**Author:** Aevi (PO) · **2026-09-02** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**Closes:** `RULING_REQUEST_power_sources_open_20260815.md` §1 — open **18 days**, blocking everything
about metaphysical.

---

## §1 — THE CONTRADICTION IT RESOLVES

**Three canon statements about the Numinous cannot all be true:**

| | |
|---|---|
| **A** | metaphysical *"WANTS THIN GROUND"* — band `{0.15, 0.22}` |
| **B** | the Numinous are listed among those *"helpless where the lattice is gone"* |
| **C** | they are metaphysical 0.7, and their region reads **0.82 — dense** |

✅ **THE RESOLUTION: metaphysical keys off TWO grounds, not one.** Their own crafts said so and everyone
read past it — `numen_sense` reads *"where **MEANING** runs dense"*; `thin_place` reads *"where
**SIGNIFICANCE** runs dense."*

⛔ **`meaningDensity` HAS NEVER EXISTED, and the `{0.15, 0.22}` band was somebody expressing "thin
apparatus" with the only numeric field available.**

➡️ **A metaphysical practitioner needs TWO things that pull against each other: MEANING to work on, and
THIN APPARATUS to work through.** ⚠️ **Precursor sites have enormous meaning AND dense substrate — so the
Numinous live at 0.82 because that is where the meaning is, and are permanently slightly obstructed by the
ground they must stand on to find it.**

✅ **All three statements survive, and the tradition gets a real problem.**

---

## §2 — ⛔ ERIK'S MODEL: MEANING COMES FROM WHO AND WHAT IS THERE

> *"There are shrines, or temples, etc. that carry meaning (people living somewhere also carries meaning).
> Similar to how ordered or wild nanite can pool in certain areas, there are areas of meaning density.
> This is geography based — **but only because of WHO or WHAT is there.**"*

⚠️ **THIS IS WHAT THE 08-15 PROPOSAL LACKED.** It said what metaphysical keys off; it never said what
GENERATES it, so `meaningDensity` would have been one more hand-maintained number.

✅ **AND THE NANITE PARALLEL IS EXACT.** Nanite is *"the one source with no best-ground at all — it goes
where its makers put it and where people carry it."* ➡️ **Meaning pools the same way: not a property of
terrain, a property of who has been there and what they did.**

### 2a · ⛔ IT IS DERIVABLE. NOTHING NEW NEEDS AUTHORING.

| signal | already authored |
|---|---|
| `tags: sacred` | ⚑ **42 of 135 locations** |
| `tags: locus` · `cult` · `home` | 18 · 18 · 20 |
| `tier` | 96 settlement · 25 region · 14 site |
| `communityId` | ⚑ **134 of 135** |
| `npcsPresent` | who is actually standing there |

⬜ **Aevi's proposed shape — CCode to correct the weights:**
```
meaningDensity(loc) = base(tier)
                    + sacred/locus/cult tags
                    + community size
                    + weight of named people present
                    + accumulated deeds/history at the place
```

### 2b · ⚠️ THE PART THAT GOES FURTHER THAN ANYTHING AUTHORED, AND IS THE BETTER HALF

**The 08-15 proposal tied meaning to PRECURSOR SITES — archaeological, fixed.** ⛔ **Erik's version says a
VILLAGE carries meaning.** ➡️ **That makes the field DYNAMIC: a place gains meaning as people live there
and LOSES IT WHEN THEY LEAVE.**

⚠️ **And that lands on something already in the corpus** — the Wends' `unspooling`, and Saba trying to
reach a place she left as a girl. ✅ **Under this an abandoned road actually thins, and that is
mechanical rather than sentimental.**

### 2c · ✅ It completes the symmetry

`precursor : ordered_nanite :: veil : metaphysical` — and now the ground each wants:

| source | wants |
|---|---|
| precursor | dense substrate |
| veil | thin substrate |
| nanite | ⚠️ no ground at all — **supply** |
| **metaphysical** | ⚑ **dense MEANING and thin APPARATUS — two axes** |

---

## §3 — THE ITEMS, AND THE GAP THEY FILL

⚠️ **SNG-381 already built this pattern: eight items carrying `substrateCharge`, one per ratified source,
read by `engine/substrate.js`. Companions carry `substrateAura` — Aevi 0.2, Coil 0.14, Marrow −0.05.**

⛔ **AND THE METAPHYSICAL ITEM IS ONLY HALF AN ANSWER.** `quiet_stone` carries **−0.05, negative on
purpose** — *"metaphysical craft wants thin ground and treats a dense lattice as apparatus."* ✅ **That is
the THIN APPARATUS half. Nothing in the game addresses the DENSE MEANING half.**

➡️ **Proposed: `meaningCharge`, parallel to `substrateCharge`, and `meaningAura` parallel to
`substrateAura`.**

### 3a · ⛔ THE DESIGN CONSTRAINT THAT MAKES THESE INTERESTING

**Meaning comes from WHO. So a meaning-item must be SOMEBODY'S.**

⚠️ **An heirloom that is not yours carries almost nothing.** ⛔ **A stolen holy book is paper.** ➡️ **This
is the first item class in the game where PROVENANCE is mechanical rather than flavour** — and it falls
straight out of Erik's model rather than being bolted on.

⬜ **Proposed candidates — CCode to place, Aevi to author:**

| item | carries | the catch |
|---|---|---|
| **a family heirloom** | ⚑ meaning from a LINE — worth more the longer the line and the better it is known | ⛔ **near-zero to anyone not of that family** |
| **a holy book of a tradition** | meaning from a PEOPLE | ⚠️ needs standing with them; a curiosity otherwise |
| **a founder's tool** | meaning from a PLACE — the hammer that built the mill | ⛔ **loses charge if carried AWAY from the place** |
| **a name-keeping** (`names_of_the_lost`) | meaning from the DEAD who are still attended | ⚠️ **ties to R29** — an attended ending keeps a person, and a kept name is meaning |
| **a companion `meaningAura`** | ⚑ meaning from a PERSON standing beside you | ✅ the aura mechanism already exists |

⚠️ **`warden_ash` is already close to this** — *"scattered over a body or a threshold, it makes an ending
HARDER TO INTERFERE WITH."* ⬜ **It may want a `meaningCharge` rather than its current `substrateCharge`
0.03.**

---

## §4 — ROUND 2 QUESTIONS

1. ⛔ **Is `meaningDensity` DERIVED at load, or a stored field on a location?** ⚠️ Aevi says derived —
   **`foothills.json` already forbids stored copies of derived values and then carried them anyway.**
   ⬜ But 135 locations × a scan is a cost; CCode knows whether that is real.
2. **Can `engine/substrate.js` take a second density cleanly**, or does every reader assume one number?
3. ⚠️ **What does a metaphysical craft DO with two grounds?** ⬜ Aevi's guess: effectiveness scales with
   meaning, and the substrate band becomes a PENALTY for apparatus rather than a requirement. **That is a
   resolution change and it is CCode's to shape.**
4. ⛔ **PROVENANCE (§3a) needs a holder-check.** Is there an existing "is this yours / do you have standing
   with these people" test, or is that new?
5. **Does `meaningDensity` change over time**, per §2b? ⚠️ A place that empties should thin. ⬜ Does the
   world tick have a hook, or is this a load-time computation only?
6. **The 15 `density: null` entries** in `power_sources.json` are the sibling of this problem. ⬜ Should
   they be derived from region substrate the same way, rather than authored?
