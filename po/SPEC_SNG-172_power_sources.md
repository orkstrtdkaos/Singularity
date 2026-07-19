# SNG-172 — What actually powers a craft

**Author:** Aevi (PO) · 2026-07-18 · Erik-directed
**Form:** outcomes and invariants. ⚠️ **This amends core canon** and needs Erik's ratification before build.

Erik: *"A thinned lattice (such as what Root does) should benefit the Natural based skills… we likely
need another pass through the skills to categorize how they are powered — we have lattice/nanite
substrate, wild nanites, and natural so far. Cogitants likely have a combination of nanite (to use
their minds to cause physical effects, telekinesis, etc.) as well as natural power."*

---

# §1 — THIS CHANGES A LOAD-BEARING SENTENCE

`the_substrate.json :: thePhysics`, quoting `lore/power_systems.md`:

> **"Every craft in this world is nanite-mediated. There is no magic — there is a Precursor lattice
> that reads structured will and enacts it."**

Erik's direction says **some power is NATURAL — not lattice-mediated at all.** That is not a tuning
change; it is an amendment to the founding claim of the setting's physics, and it makes the whole
substrate model *partial* rather than universal. Flagging it plainly because it should be ratified
deliberately, not absorbed.

**What it buys is large:** it gives the thin half of the map a *reason to be good*. Today the
Quickwood is where Continuous crafts starve. Under this amendment it is also where natural craft
**works best** — the Rootkin did not merely survive the withdrawal, they moved to a power source that
the withdrawal *uncovered*. That makes the Returned genuinely equal rather than compensated, which is
what AMENDMENT_1 was reaching for and did not fully reach.

---

# §2 — `powerSystem` IS ALREADY TAKEN. DO NOT OVERLOAD IT.

285 abilities carry `powerSystem`, but it is **an access taxonomy, not an energy source**:

| value | count | what it actually means |
|---|---|---|
| `attribute` | 89 | no craft — raw capability |
| `reach_*` (13 kinds) | 142 | **which reach/axis granted it** |
| `precursor` | 6 | genuine source |
| `wild_current` / `living_current` | 5 | genuine source |
| `harmonic` / `radiant` / `valley_craft` | 7 | local craft families |
| **(missing)** | **36** | — |

And it is **load-bearing**: `progression.js:154` seeds access from it and validates against the
catalog so a mis-authored id cannot create false access; `practice.js:55` uses it for same-system
practice. **Repurposing it would break domain access.**

**Outcome: a separate axis.** How an ability is *powered* is orthogonal to which reach *granted* it,
and both need to stay independently true. The 36 missing `powerSystem` values are a separate defect
worth fixing while we are in here.

---

# §3 — THE SOURCES (Erik's taxonomy, as outcomes)

Four, with **combination as a first-class case, not an exception**:

1. **Lattice / nanite substrate** — the Precursor lattice. Today's model: the two-sided band, dense
   ground helps until it interferes.
2. **Wild nanites** — the Wild Half's tangled substrate. Already has `wild_current` and authored
   variance (SNG-140: widen *both* crit bands). Behaves differently from ordered lattice and should
   not be folded into it.
3. **Natural** — not nanite-mediated. Body, breath, growth, grief, craft-of-hand. **This is the new
   one.**
4. **Combination** — Erik's Cogitant case: nanite to move matter with a mind, natural for the mind
   itself. A combination ability should be **affected proportionally by each source**, never rounded
   to whichever is dominant.

## Invariants

1. **Natural-powered craft is not penalised by thin lattice.** At minimum indifferent; where the
   fiction supports it, **improved** — Erik's "a thinned lattice should benefit the Natural skills."
2. **A place is never bad for everyone.** Every region should be *someone's* good ground. Thin
   country favours natural; dense country favours lattice; the Wild Half favours wild. That is the
   "two difficulty maps, both personal" promise finally made symmetric.
3. **Combination abilities scale by their mix**, not by a dominant label.
4. **The receipt names the source.** *"The lattice is thin here — but your craft never asked it for
   anything."* A player must be able to tell benefit from indifference from penalty.
5. **Access is untouched.** `powerSystem` keeps doing what it does; nothing about domain access,
   seeding, or practice changes.
6. **Every ability declares a source** — CI-enforced, like density on locations. Unclassified is a
   content bug, not a default.

---

# §4 — THE CLASSIFICATION PASS (my lane, after ratification)

285 abilities. **Not a mechanical sweep** — the traditions' own idiom decides, and the corpus already
carries the evidence: `notFor` boundaries, `narrationHints`, `peril` lines, and the tradition profiles.

Erik's worked examples are the calibration:
- **Rootkin** — natural-dominant. The green current is growth, not lattice. Their loci are *sinks*
  in the geography I just authored, which now reads as consistent rather than as a penalty.
- **Cogitant** — combination. Telekinesis borrows the lattice; the mind that aims it does not.
- **Churnfolk / abyssal** — wild-dominant, already partly declared.
- **Somatic** — natural-dominant, and their sink at the Flesh Temple says so.
- **Seraphic / Enginewright / Lattice** — lattice-dominant, the Continuous case.

Expected outcome worth predicting **before** the pass, so it can be checked rather than confirmed:
**most abilities in low-density traditions should come out natural or wild.** If the pass produces a
lattice-dominant Rootkin, the pass is wrong, not the world.

---

# §5 — Questions for CCode ROUND 2

1. §2 — new field on the ability record, or a derived map keyed by tradition with per-ability
   overrides? The corpus is 285 and mostly predictable from tradition, so a map with exceptions may
   be far less content to maintain and easier to audit.
2. §3.1 — does natural craft *benefit* from thin lattice, or is it simply flat? Benefit is more
   interesting and more balance-risky; I lean flat-by-default with authored exceptions, but this is
   Erik's ruling on his own physics.
3. §3.3 — is there a clean place in the resolve chain for a weighted two-source term, or does that
   collide with the SNG-079 spectral-fit separation the way §9b warns about?
4. Does the 36-missing `powerSystem` gap have a known cause, or is it simply unfinished authoring?


---

## §6 — The 36-missing gap is CLOSED (content, 2026-07-19)

§2 flagged 36 abilities carrying no `powerSystem` as "a separate defect worth fixing while we are in
here." Closed. All 36 were the three **folk** traditions — `harmonic` 12, `valley_craft` 12,
`radiant_folk` 12 — and the mapping was already demonstrated by 7 authored siblings:

| tradition | powerSystem | already authored |
|---|---|---|
| `harmonic` | `harmonic` | 2 |
| `radiant_folk` | `radiant` | 2 |
| `valley_craft` | `valley_craft` | 3 |

**Completion, not judgement.** No new ids minted — `progression.js:154` validates against the catalog,
so an invented value would have created false domain access. **Corpus: 0 abilities missing
`powerSystem`.** Suite green by explicit exit code.

**This does not touch §3.** `powerSystem` remains the *access* taxonomy; how a craft is **powered**
(lattice / wild / natural / combination) is still the separate axis this spec asks for, and is still
blocked on Erik's ratification and CCode's §5.1 answer on whether it is a field or a tradition-keyed
map with overrides.
