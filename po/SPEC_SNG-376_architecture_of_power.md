# SNG-376 — The architecture of power: five sources, three candidates, and a test for what counts

**Author:** Aevi (PO) · **Date:** 2026-08-08 · **Origin:** Erik — *"we need to build the architecture of
power first, then we can assess skills against it… what else?"*
**Status:** proposal · **Extends** SNG-172 (ratified 2026-07-19, §4 never executed)

---

## §0 — WE DID START THIS, AND IT STALLED. HERE IS EXACTLY WHERE.

Erik: *"which I think we started one time."* ⚠️ **He is right, and the state is worth stating plainly:**

- **`po/SPEC_SNG-172_power_sources.md` — RATIFIED by Erik 2026-07-19.** It amended the founding physics
  (*"all power is nanite-mediated"*) to admit **natural, non-lattice power**, and named four sources.
- **`content/packs/valley/lore/power_systems.md`** still says *"All power in this world is
  nanite-mediated"* — ⛔ **the lore file was never updated to match the ratified amendment.** Thirteen
  months of authoring has run against a canon sentence Erik already overturned.
- ⛔ **SNG-172 §4, the classification pass, NEVER RAN.** Measured: **zero of 374 abilities carry a source
  field.** `powerSystem` is present on all 374 but is purely an access taxonomy (89 `attribute`, 142
  `reach_*`) exactly as §2 warned.
- §5's questions to CCode were never answered.

**So the model is ratified, unimplemented, and contradicted by its own lore file.** That is the ground we
are building on.

---

## §1 — YOUR FIVE, RECONCILED AGAINST THE RATIFIED FOUR

Erik's list today: *nanite from pre-transition · wild nanites · precursor · mental/metaphysical
post-transition enlightenment · plain body work and technique.*

| SNG-172 (ratified) | Erik 2026-08-08 | change |
|---|---|---|
| lattice / nanite substrate | **precursor lattice** | ⚠️ **SPLIT** — Erik separates the alien Precursor lattice from… |
| — | **pre-transition nanite** | ⚠️ **NEW** — deployed, human-made, older than the Transition but younger than the lattice |
| wild nanites | **wild nanites** | unchanged |
| natural | **metaphysical / enlightenment** | ⚠️ **SPLIT** — mind reaching past matter, post-Transition |
| natural | **body work and technique** | ⚠️ …from plain trained flesh, which asks nothing of anything |
| combination | *(implicit)* | ⛔ keep as a MODE, not a source — see §3 |

⛔ **Both splits are the same insight and it is a good one: SNG-172's two broad buckets each contained two
things that behave differently.** "Nanite" lumped a designed human tool with an alien substrate.
"Natural" lumped a monk's breath with a Cogitant's untethered mind. **Neither pair should share a rule.**

---

## §2 — ⛔ THE TEST FOR WHETHER SOMETHING IS A SOURCE

Before adding more, the discriminator — otherwise "what else?" produces a list that grows forever:

> **A source is real if it has its OWN answer to: what does thin lattice ground do to it?**
> Precursor: penalised. Natural: improved (SNG-172 §3.1, Erik-ratified). Wild: distorted, both crit
> bands widen.
> ⚠️ **If a candidate's answer is identical to an existing source's, it is FLAVOUR, not a source.**

**This makes the taxonomy checkable rather than a matter of taste, and it ties directly to SNG-172's
invariant 2: every region must be SOMEONE'S good ground.** Each source is, in effect, a different map of
where the world is kind to you.

---

## §3 — THE FIVE, AS OUTCOMES

| source | what it draws on | thin ground does | its cost | its failure |
|---|---|---|---|---|
| **Precursor lattice** | the alien substrate that reads structured will | ⛔ **penalises** — nothing to speak to | energy; the lattice answers, you do not push | it stops answering |
| **Pre-transition nanite** | deployed human machinery, still running, still obeying its old spec | ⚠️ **indifferent to depth, sensitive to CONDITION** — works where the machines are maintained | maintenance, supply, expertise | it breaks, and breakage is mechanical and repairable |
| **Wild nanite** | the tangled, untended field | ⚠️ **distorts** — both crit bands widen (SNG-140) | unpredictability, and it is not free | it does something else |
| **Metaphysical** | mind reaching past matter, opened by the Transition | ⚠️ **indifferent to lattice; sensitive to the PRACTITIONER** | attention, self, coherence | it reaches back |
| **Body & technique** | trained flesh, breath, hand | ✅ **improved** (SNG-172 §3.1) — thin ground is quiet ground | conditioning, injury, age | you are simply not good enough today |

**⛔ COMBINATION IS A MODE, NOT A SIXTH SOURCE.** SNG-172 invariant 3: a combination ability scales by its
MIX, never rounded to a dominant label. ⚠️ **Erik's own Cogitant example is the case: nanite to move the
cup, metaphysics for the mind that aims it — and thin ground should help one half and hurt the other in
the same action.** Making combination a source would destroy exactly the effect it exists to produce.

---

## §4 — REVISED BY ERIK 2026-08-08. Belief is OUT. The Veil is an ANTI-POWER, not a seventh source.

### §4a — ⛔ BELIEF/CONSENT REJECTED, and the mistake is worth naming

I proposed belief as a source because the God-Named's name *"works only on those who credit it"* and a
Bargainer's term dies on refusal.

**Erik: the God-Named use PRE-TRANSITION NANITE, mostly — some have learned wild nanite or a little
Precursor lattice. It has never been tied to population belief.**

⛔ **I read a TARGETING CONSTRAINT as a FUEL SOURCE.** *"Works only on those who credit it"* describes who
the ability can be USED ON. It says nothing about what powers it. **Those are different fields and I
collapsed them** — the same category error as reading `challengeTypes` as a claim about offence.

⚠️ **And Erik's replacement is better because it is PHYSICAL:** *"if their population tended to also have
a store of nanites, then their manipulation of said nanites makes them more effective on their home
turf."* **The home-ground effect is real — it is just nanite density carried in a POPULATION rather than
in the ground.** That is a genuinely new geography (power that travels with people, not terrain) and it
belongs to pre-transition nanite, not to a new source.

### §4b — ⛔ THE VEIL IS THE ANTI-POWER TO THE PRECURSORS. That is a structure, not an addition.

Erik: *"The thinning of the Veil seems like the anti-power to the ancient precursors… The Seraphs might
idealize the precursors and the Abyssals might idolize the ones beyond the Veil."*

**This changes the shape of the model. The sources are not a flat list — at least one pair is OPPOSED:**

> **Precursor lattice ←→ Beyond the Veil.**
> ⚠️ **Thinning one strengthens the other.** The Numinous do not merely work *despite* thin ground — the
> thinning IS the mechanism, and it is subtraction of Precursor rather than a substance of its own.

⛔ **That is why `the_thinned_veil` was always going to be hard to place: it is not powered BY something,
it is powered by the ABSENCE of something.** And it explains, without any new mechanic, why a Numinous
strengthens exactly where a lattice-user starves.

⚠️ **And it gives the Seraphic/Abyssal opposition a spine.** They are not two flavours of "mostly nanite"
— **they are the two devotional positions on a single axis**: one idealises the builders of the lattice,
the other idolises what is on the far side of it. **Their craft is nanite; their FAITH is the axis.**
⛔ **Worth flagging that this aligns with the existing `demonic_angelic` reach**, which may be the same
axis seen from the ability side. **If so, that is a real unification and Erik should confirm it rather
than have me assume it.**

### §4c — THE DEAD: two mechanisms, one per pole. Erik's, and it resolves §4c cleanly.

I had argued the dead were flavour. **Erik: they are two competing mechanisms, and which one took you
matters.**

| | how | what comes back |
|---|---|---|
| **Lattice-save** | the lattice SAVES a person's identity within itself, to be **rewritten onto a new entity or body** | a faithful copy in something else — continuity of pattern, not of flesh |
| **Veil-pull** | what is beyond the Veil can **pull a presence back across** | ⚠️ *"similar to metaphysics but not as nice"* — a presence recovered, by something with its own reasons |

⛔ **So the dead are not a source — they are a CONTESTED OUTCOME of the two opposed sources**, and that is
much better than a seventh entry. **It also means the two resurrections are not interchangeable**: one is
an archive restoring a record, the other is something reaching in and taking hold of a person. ⚠️ **A
Threnodist carrying a name, an Ashwarden attending an ending, and an Abyssal's bargain are all now
positions on the same question**, which is the kind of thing that makes a setting cohere.

## §5 — WHAT REMAINS OPEN

1. ⛔ **Are pre-transition nanite and Precursor lattice really different, or is one a subset?** Still the
   load-bearing question. The split rests on human machinery that postdates the Precursors and predates
   the Transition. **If true, state it once, properly, in the lore file.**
2. ⚠️ **Does the Precursor↔Veil axis coincide with the `demonic_angelic` reach?** §4b argues it might.
   **Erik's confirmation, not my assumption.**
3. **Weighted mix per tradition — AGREED by Erik.** `seraphic: {pre_transition_nanite 0.6, precursor 0.3,
   metaphysical 0.1}`; an ability inherits its tradition's mix unless it declares its own.
4. ⛔ **The lore file is still wrong.** *"All power in this world is nanite-mediated"* has been false since
   July, and is now doubly false: **the Veil is powered by the absence of the lattice.**

---

## §5a — ⛔ ERIK'S ASK: SHOW WHAT A CRAFT DEPENDS ON

Erik: *"We need a better way to show what each skill depends on for success — the skills themselves are
ideal with certain levels."*

⚠️ **Today a player is shown `energyCost` and `levelReq` and nothing else about what makes a craft work
WELL.** Four dependencies exist or will exist, and none of them are surfaced together:

| dependency | exists today? | what it should say |
|---|---|---|
| **source** | ⛔ no — SNG-172 §4 never ran | *"draws on the Precursor lattice"* — and therefore where it is strong |
| **attribute / sub** | ⚠️ partly — `attribute` is authored, the GM picks the sub | *"resolves on presence, or on strength if you use it that way"* |
| **ideal rank** | ⛔ no | Erik's *"ideal with certain levels"* — the band where the craft is worth its cost |
| **conditions** | ⚠️ scattered through `cannot` prose | *"needs living ground · needs a source of flame · fails in full sun"* |

**PO proposal: one `dependsOn` block per ability, and it is a DISPLAY problem before it is a data one.**
⚠️ **Do not author the field before a consumer exists** — the mistake I have made twice this week. **Spec
the card first: what should a player see on one line?** My answer: *source · what it resolves on · where
it is strong · what it needs present.* **Then author to that.**

⛔ **And this is the piece that makes the whole source architecture land in play rather than in a file.**
A weighted mix nobody can see is a spreadsheet.

## §6 — THE ORDER

1. **Ratify the source list** (§3 + §4 decisions).
2. **Fix `lore/power_systems.md`** — it is the canon everything else quotes.
3. **Author the per-tradition weighted mix** — 26 rows. Mine.
4. **Then the per-ability pass**, inheriting from tradition, overriding where the craft differs.
   ⚠️ SNG-172 §4's prediction still stands as the check: **if the pass produces a lattice-dominant
   Rootkin, the pass is wrong, not the world.**
5. ⛔ **THEN reassess the skills.** Erik is right that this comes first — **a `reveal` powered by
   metaphysics and a `reveal` powered by pre-transition sensors are not the same craft, and the entire
   glut analysis in SNG-373 was blind to that distinction.**
