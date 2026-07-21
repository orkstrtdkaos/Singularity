# SPEC — SNG-200: A companion is a character, not a bonus
## Aevi (PO) · 2026-07-21 · authored to spec · **awaiting CCode ROUND 2**

> **Erik, from the live save (v1.8.180, Silas Weir):** *"Huginn has his bond lvl 10 — s2. Progress with him
> seems to have stopped and he's basically the same as he started… the companions should have an Arc too.
> Aevi motes transform into their true evolved identity and gain their memory and skills, etc. Each should
> have its own arc and the evolved form should be really cool and useful. Then we should have the ability
> to generate a new companion, just like we can with NPCs. What's next for Huginn (Marrow)? What is he
> really? He should have his own codex piece too."*

**Erik's read is exact, and the reason is one line.** Progress did not slow — it *ended*, two bond points
ago, and the thing waiting on the other side is already written.

---

## §1 — THE FINDING: stage 3 is authored, and the resolver cannot return it

`engine/companions.js:24–28`:

```js
export function bondOf(character, companionId, rules) {
  const b = character.companionBonds?.[companionId] ?? 0;
  const stage2At = rules?.companions?.tiers?.stage2At ?? 8;
  return { bond: b, stage: b >= stage2At ? 2 : 1 };   // ← a ternary. There are two stages. Ever.
}
```

`growBond:40–41` can emit exactly two events in the lifetime of a bond — `"grant"` at 6, `"stage2"` at 8 —
and `:36` caps bond at 10.

Meanwhile `content/packs/valley/companions/marrow.json` authors **three** stages, and the third is the best
writing in the file:

```json
{ "stage": 3, "name": "The One Who Stays",
  "narrationHints": "You were dying, once, and it did not leave, and it did not lie to you,
                     and you have not spoken of it since." }
```

`companionsForGM:71` does `c.stages.find(st => st.stage === b.stage)` — **it would surface stage 3 the
moment `bondOf` could return it.** The content is authored, the reader is built, and the one function
between them is a boolean. L4 and L1 in the same seam.

**So: Huginn at bond 10 / stage 2 is at the terminal state of the entire companion system.** He hit it at
8. The last two points bought nothing, and no further point ever will. Erik has been maintaining a
relationship with a ceiling.

⚠️ Note the range defect alongside it: bond runs to **10** and the final stage triggers at **8**. The top
20% of the scale is inert by construction. Whatever stage ladder lands should use the range it has.

**OUTCOME WANTED:** stages come from the companion's own record — however many are authored — and the bond
scale reaches the last one. A companion with three authored stages can reach the third. Marrow's stage 3
should be reachable *by the save that already exists*, without Erik regrinding a bond he has already
maxed.

## §2 — What Erik asked for: an ARC, not a bigger bonus

The stage ladder above is the unblocking fix. It is not the feature. Erik's ask is that a companion has a
**story of its own that resolves** — the Aevi motes' language is the clearest statement of it: *transform
into their true evolved identity and gain their memory and skills.*

**OUTCOME WANTED — a companion arc, peer to the character's personal arc (SNG-133):**

- **It has stages that mean something narratively**, not just numerically. The authored `stages[]` is the
  right spine and most companions already have one; what is missing is that reaching a stage is an *event*
  — a beat with a moment, the way SNG-197 asks for the braid.
- **The evolved form is a real, distinct thing.** Erik's bar: *"the evolved form should be really cool and
  useful."* A companion that reaches its end-stage should be **mechanically different**, not the same
  assist with better prose. Marrow's own text tells you the shape: it goes from *watches endings* → *tells
  you plainly* → *stayed while you died*. Each is a different relationship with the same power.
- **It gains memory.** Erik named this specifically. A companion at its final stage should carry what it
  has been through with the character — the deeds it witnessed are already recorded; a companion that
  cannot refer to them is not evolving, it is being relabelled.
- **It can resolve.** An arc with no ending is a treadmill. What "done" means for a companion is a design
  question worth answering rather than deferring — Marrow's boundaries (*"leaves during births and will
  not say why"*) suggest these creatures have their own business.

⛔ **Not every companion arc should be an ascension.** Marrow's stage 3 is not a power-up; it is a debt
between two people that neither mentions. Building a system that can only express *becomes stronger* would
lose the best content already authored.

## §3 — Generate a companion

Verified: `engine/generate.js:24` — `export const GEN_TYPES = ["npc", "location", "arc"];`

Companion is not a generatable type. The nine authored companions are the whole population, forever.

**OUTCOME WANTED:** a companion generates the way an NPC does, in-grain for where it is found and who found
it, persists with stable identity, and arrives with its own authored-quality `stages[]` — because §1 and §2
make stages the spine, a generated companion without them would be born incapable of an arc. The existing
corpus is the few-shot taste; nine records is a good template library.

⚠️ **`bondGrants` is the balance risk.** Each authored companion teaches a real ability (Marrow teaches
*The Attended End*). A generation path that mints abilities freely is an ability-inflation vector. Same
discipline as SNG-197 §4: **the model authors flavour, the engine decides legality** — a generated
companion's granted ability validates against the same vocabulary and cost rules as an authored one, or it
does not mint.

## §4 — Companions are not in the codex

Erik: *"He should have his own codex piece too."* He is right, and the gap is structural.

`generate.js:295` **does** auto-mirror generated entities into the codex (`person` / `place` / `lore`).
`npcs.js` does not (SNG-199 §5). Companions go through *neither* — they are not NPC-registry entries and
not generated records, so there is no path by which a companion becomes codex-known at all.

**This is the third instance of the same shape this batch:** two paths do a job, one is complete and the
other is silent. SNG-185 found it on domain-stamping (`generate.js` stamps with provenance,
`applyNpcUpdates` does nothing). SNG-199 found it on codex-mirroring. Here the companion falls through
both. ➡️ **Worth one look at whether these are three tickets or one missing shared primitive** — I would
rather CCode rule on that than have me guess.

**OUTCOME WANTED:** a companion has a codex node that accumulates — what it is, what it has done with the
character, what stage the relationship has reached. Subject to SNG-199's caps guard.

## §5 — Erik's two direct questions, answered from content

**"What's next for Huginn (Marrow)?"** — **Stage 3, "The One Who Stays."** It is authored, it is good, and
`bondOf` cannot return it. That is the whole of what is next, and it has been sitting there.

**"What is he really?"** — ⚠️ **`marrow.json` carries a `hooks` field marked GM-EYES-ONLY, and it answers
this directly.** Erik owns this canon and asked as PO; flagging the tier so the choice to read it is his.

> `"hooks": "GM-EYES-ONLY: Marrow may be an Ashwarden proper — not their bird but one of them, in a shape
> that lets it attend the endings the March cannot reach. Let it be deniable. Let it know things it should
> not."`

So the answer to *what is he really* is **already canon and deliberately deniable** — which is a strong
argument for §2's arc being a *revelation* arc rather than a power ladder for this particular companion.
⚠️ **`hooks` is GM-eyes-only and must stay that way** — whatever surfaces a companion arc to the player
must not leak the hook. Deniability is the design.

## GUARDS

- **Existing saves reach the new stages without regrinding.** Huginn is at max bond; he should arrive at
  stage 3 on reconcile, not after another 40 hours. Same discipline as the SNG-196 braid backfill.
- **`hooks` never surfaces to the player.** GM-eyes-only is load-bearing here, not decorative.
- **Stage count comes from content, not from a constant.** A companion with two authored stages has two.
- **Generated companions validate like authored ones** — abilities, costs, vocabulary. No inflation lane.
- **Not every arc is an ascension** — the system must be able to express Marrow's ending as well as Aevi's.

## OPEN QUESTIONS — CCODE ROUND 2

1. **§1:** is `stage2At` referenced anywhere outside `companions.js` (rules JSON, UI, tests) such that a
   generalised ladder breaks a consumer? Cheapest correct shape: derive stage from the authored
   `stages[]` length against thresholds, or author thresholds per stage in the record?
2. **§2 memory:** what does a companion already have access to at narration time — is there a path to the
   deeds it witnessed, or does that link need building?
3. **§3:** does a generated companion need its own generate branch, or is it an NPC variant with
   `assistTags` + `stages` + `bondGrants`? What breaks if it is the latter?
4. **§4:** three tickets now report the same two-paths-one-complete shape (SNG-185, SNG-199, this).
   One shared primitive, or three local fixes? Your call — you have the clearest view of all three seams.
5. **Sequencing:** this touches the codex ledger like SNG-198 and SNG-199. Four tickets on one surface now.
   ⚠️ **Rule on the ordering before any of them build.**
