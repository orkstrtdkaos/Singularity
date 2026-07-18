# SPEC — SNG-140: The Wild Half — the tangled substrate (wild nanites AND living current, uncontrolled)
## Aevi (PO) · 2026-07-17 · authored to spec · **awaiting CCode ROUND 2 + Aevi content**

> **Erik: "The fae, the fantasy realms etc. — they have a strange combination of WILD nanites and living current."** This completes the substrate cosmology: a THIRD keeper-kind.

> **Verified at HEAD — the home already exists; this gives it a substrate identity:**
> - **`the_wild_half` is authored canon** (`peoples_of_kind.json`, cluster, ring positions 2-4): **churnfolk [chaos] — FAE**, **abyssal [demonic] — HORNED**, **unmaker [destruction]**. Its defining note: *"Demons, fae, and ruin standing in a row on the ring… the ring telling you what those dispositions BECOME when lived"* and *"It does not conspire. It ACCRETES. Nobody is driving. That is precisely what frightens the Lattice."*
> - **What it LACKS:** a substrate nature. SNG-131 gave the Continuous (seraphic) the fabricated substrate (`innatePrecursor`) and the Rootkin the living substrate (`innateLivingCurrent`). The Wild Half's substrate identity is unstated — and Erik's idea names it exactly.
> - **The ring already agrees:** the Wild Half sits at pos 2-4, near where the fabricated-substrate keepers (abyssal, pos 2, IS in the Wild Half) and the churn/chaos meet. Abyssal is BOTH a substrate-keeper (SNG-131) AND Wild Half — the overlap is the point: the demonic keeps the fabricated deep, but in the Wild Half it runs untended.

## THE DESIGN — the tangled current (a third substrate kind)
Three substrate relationships now, not two:
1. **Fabricated, KEPT** — the Continuous (seraphic): precursor substrate, held in disciplined form. `innatePrecursor`.
2. **Living, KEPT** — the Rootkin: the green current, tended. `innateLivingCurrent`.
3. **BOTH, WILD** — the Wild Half (fae/fantasy realms): fabricated nanites AND living current tangled together, **kept by no one, driven by no one — it accretes rather than obeys.** New field: **`wildCurrent`**.

**What makes wild different from kept:** the keepers channel ONE substrate in DISCIPLINED form (a Seraph sustains the light; a Rootkin tends the green). The Wild Half channels BOTH, UNDISCIPLINED — power that is stronger and stranger for being untamed, but unreliable, unpredictable, and costly in a way the kept substrates are not. *"Nothing twice, nothing where you left it. Joyous, generous, and lethally unreliable"* (churnfolk, already authored) is the mechanical signature: wild-current abilities are potent but carry a variance/wildness cost — they don't do exactly the same thing twice.

## THE GRANT (mirrors SNG-131's shape, so it wires the same way)
- **`wildCurrent` on the Wild Half origins** (churnfolk; and abyssal ALREADY has `innatePrecursor` — it can carry BOTH, which is thematically perfect: the demonic keeps the fabricated deep AND runs wild): `"wildCurrent": ["<ability id>", …]` — 1-2 innate wild abilities.
- **A `wildCurrent` ability set** (new, parallel to `precursor` + `living_current`) — a NEW `powerSystem: "wild_current"`, abilities that channel both substrates tangled: potent, variable, uncontrolled. The wildness is the flavor AND the cost.
- **The mechanical signature — wildness/variance:** a wild-current ability should carry an unpredictability the kept substrates don't — e.g. a stronger effect with a variable/rolled outcome, or a beneficial-but-uncontrolled result ("it works, but not the way you aimed"). This IS "nobody is driving," made mechanical. (Distinct from the disciplined, reliable innate grants of SNG-131.)

## AEVI CONTENT (author)
1. **`content/packs/core/abilities/wild_current.json`** — a NEW `powerSystem: "wild_current"` file, 2-3 abilities that channel the tangled substrate (fae-glamour that reshapes unpredictably, a wild growth/decay that runs its own way, a bargain-magic that's honest but uncontrollable). In-idiom to churnfolk/fae — potent + variable. Run content_ci LOCALLY before ship (the discipline).
2. **`wildCurrent` field on Wild Half origins** — churnfolk (and abyssal as its second nature). Point at REAL `powerSystem:"wild_current"` ids (verify each — the SNG-131 lesson).
3. **Wild Half cluster note** in `peoples_of_kind.json` — add the substrate identity to `the_wild_half` (the tangled current) so the cosmology reads complete.

## CCODE WIRING (mirrors the SNG-131 change, once data lands)
- A `wildCurrentAccess` gate parallel to precursor (progression.js:253) + `livingCurrentAccess` (SNG-131), for `powerSystem:"wild_current"`; seeded from `originRecord.wildCurrent` in `finish()`, validating each id is actually `wild_current`.
- The wildness/variance mechanic in the ability-resolution path (a wild-current ability rolls its outcome / carries a variance the kept substrates don't).
- Version-gated retro for existing Wild Half characters.

## GUARDS
- **Three kinds stay distinct** — fabricated-kept (precursor), living-kept (living_current), both-wild (wild_current). Don't collapse them; the Wild Half's signature is the LACK of a keeper.
- **Wild = potent BUT costly/variable** — never strictly better than the disciplined grants; the power is real and so is the unreliability. "Lethally unreliable" is a feature.
- **Abyssal can carry BOTH** `innatePrecursor` AND `wildCurrent` — the demonic keeps the fabricated deep and runs wild; that duality is canon (it's in two clusters), not a conflict.
- **Ring NOT moved** (SNG-131 lesson) — the Wild Half already sits at 2-4; this adds substrate identity, not geometry.
- **Reader-confirmed before claiming live** — `wildCurrent` is inert until the CCode gate reads it (the "value with no reader is a lie" discipline); flag honestly until wired.

## OPEN QUESTIONS — ERIK + CCODE
1. **[ERIK]** Is the Wild Half's wildness a BENEFIT-with-variance (potent but unpredictable) or a genuine double-edge (can turn on the caster)? (Recommend variance-with-upside for a player people, with rare backfire on a crit-fail — "lethally unreliable" earned, not punishing.)
2. **[ERIK]** Which peoples are Wild Half substrate-wild — just churnfolk + abyssal, or the whole cluster (unmaker too)? (Unmaker "clears what the wild finished" — maybe NOT wild-current itself, but adjacent. Your call.)
3. **[CCODE]** The variance mechanic — a roll on the wild-current ability outcome, or a tag the resolver reads? Simplest home for "it works but not as aimed."
