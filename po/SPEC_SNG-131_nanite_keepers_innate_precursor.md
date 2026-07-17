# SPEC — SNG-131: The nanite-keepers — peoples who never gave up the substrate touch precursor natively
## Aevi (PO) · 2026-07-16 · authored to spec · **awaiting Erik design confirm + CCode ROUND 2**

> **Erik's worldbuilding:** "Certain peoples never gave up the nanites — the seraphs and abyssals, the Greek/Roman gods, the Viking gods, fantasy creatures. Perhaps they can use a few precursor skills innately or in their path, because that's what it takes to keep those powers flowing."

> **Verified at HEAD — this binds to existing canon beautifully:**
> - **Precursor IS the substrate.** `precursor` sits OUTSIDE the ring — "not an axis-people; it is the substrate the whole world sits on" (SNG-073). Precursor abilities are the nanite-layer itself.
> - **`peoples_of_kind.json` (SNG-089) already clusters the deep-power peoples** (The Deep Works, etc.) and references substrate + precursor. `the_pole_intensity_model` says nodes run hot on independent pole-intensities — some peoples LIVE at high intensity.
> - **The histogram (SNG-130) shows seraphic + abyssal STOP AT TIER III** — the very peoples Erik names as substrate-keepers are among the *shallowest*. The worldbuilding and the data point at the same gap: the deep-power peoples don't yet have deep powers. Precursor-innate access is the mechanism that fills it thematically.
> - **The grant vector already exists:** precursor abilities unlock via `character.precursorAccess` (progression.js L253), currently populated ONLY by the GM's `unlockPrecursor` in fiction. This spec adds a SECOND, earned-by-origin vector.

## THE DESIGN
**Substrate-keeper peoples get a small, innate (or path-earned) precursor grant — because keeping the old powers flowing IS a precursor act.**
- **Which peoples:** the ones who "never gave up the nanites" — the seraphic and abyssal orders (continuous with the pre-Transition world), and any origin canonically of that kind (divine/titanic/fae/demonic peoples in the `peoples_of_kind` deep clusters). NOT the human-majority folk peoples (the Valley, Marches, etc.) — they gave up the substrate; that's the point of "folk."
- **The grant:** a substrate-keeper origin seeds **1–2 specific precursor abilities into `precursorAccess` at creation** (innate), OR unlocks them along the tradition's mastery path (a tier-V capstone that IS a precursor ability — ties to SNG-130). Small — a *few*, per Erik — not the whole precursor tier. The rest of precursor still requires the fiction to earn it, even for them.
- **The fiction:** these peoples don't "learn" that precursor craft — they were *born touching the substrate*; the power is what keeps them what they are. A seraph's radiance IS a precursor act. Cutting them off from it would unmake them. So the grant is *innate necessity*, not achievement.
- **Cost/balance:** an innate precursor grant is powerful — balance by (a) making it a SPECIFIC 1–2 abilities tied to that people's nature (not free pick), (b) possibly a standing energy/upkeep cost ("keeping the powers flowing" — the substrate demands feeding), (c) NOT stacking with the SNG-130 capstone unless authored as the same ability.

## HOW IT WIRES (existing vectors, one new grant)
| Piece | Mechanism (exists) | Change |
|---|---|---|
| Grant at creation | `precursorAccess` list (progression.js) | Origin declares `innatePrecursor: [abilityId…]`; creation seeds them into `precursorAccess`. |
| Path-earned variant | SNG-130 tier-V capstone + `unlockPrecursor` | A deep-people's capstone tier-V can BE a precursor ability, unlocked at mastery via the existing fiction gate. |
| Which peoples | `peoples_of_kind.json` deep clusters | Tag substrate-keeper peoples; only they carry `innatePrecursor`. |
| Upkeep (optional) | energy/substrate model | An innate precursor ability may carry a standing cost ("keeps flowing"). |

## GUARDS
- **Only substrate-keeper peoples** — human-majority folk peoples get NOTHING here; the whole meaning of "folk" is they gave up the substrate. This preserves the setting's core divide.
- **A FEW, not the tier** — 1–2 specific precursor abilities per keeper-people, tied to their nature; the rest of precursor still fiction-gated for everyone.
- **Grandfather-safe / additive** — this ADDS a grant vector; no existing character loses anything (Law 14). Existing precursor-via-fiction unchanged.
- **Balanced** — innate precursor is strong; bound it to specific abilities + optional upkeep + balance_sim.
- **Composes with SNG-125 axis rules** — a keeper-people's primary is still origin-seeded; the precursor grant rides on origin, orthogonal to the primary/secondary/tertiary domains.

## OPEN QUESTIONS — ERIK (design) then CCODE/AEVI
1. **[ERIK]** Innate-at-creation, path-earned-at-mastery, or BOTH (some peoples born with it, others earn it along the spoke)? (Recommend both — richer: seraphs born radiant, a mortal-touched people earns it.)
2. **[ERIK]** Should innate precursor carry an UPKEEP cost ("what it takes to keep those powers flowing" reads like it should cost something ongoing)? (Recommend yes — a small standing substrate/energy draw; it's thematically perfect and it balances the power.)
3. **[ERIK]** Which specific peoples are substrate-keepers — just seraphic + abyssal, or a named set from `peoples_of_kind` deep clusters (divine/titanic/fae)? (Needs your canon call on who kept the nanites.)
4. **[AEVI/CCODE]** Author the `innatePrecursor` origin field + the specific precursor abilities per keeper-people (coordinate with SNG-130 capstones so a tier-V and a precursor grant can be the same ability where it fits).
