# SPEC — SNG-126: NPC party members with roles — trainer, liaison, ally, partner
## Aevi (PO) · 2026-07-16 · authored to spec · **awaiting Erik's framing ruling + CCode ROUND 2**

> **Erik's idea:** we have companions (Huginn) and PC party members, but no **NPC party members** — people who travel with you, with benefits listed, from whom you can learn (a **trainer**), who help you **learn skills** or **build faction reputation**. Give them a home.

> **Verified at HEAD `v1.8.82` — this is mostly UNIFICATION, not new invention.** Four systems already exist but don't know about each other:
> - **Companions** (`companions.js`): full bond (`growBond`/`bondOf`) + bonus (`companionBonus`) + GM integration (`companionsForGM`). **`companionLine` already carries a `role` field and a `knowledge` field**, and `activeCompanions` keys off **generic ids against a catalog — not a beast-specific one.** The system is already structurally generic enough to hold a humanoid.
> - **Teachers** (`progression.js`): `character.teachers[trad] = {met, willing}` gates learning Tier IV–V and acquiring traditions ("greatness is taught, not bought — a willing teacher"). **The trainer concept already EXISTS as a gate — it just has no body.** It's a flag on a tradition, not a person at your side.
> - **Faction/people standing** (`standingWithPeople`): reputation with a people/pole that gates the standing bar. A faction relationship with no person embodying it.
> - **Partner-adjacent** (`partnerAdjacentNpcs`, Pell): a person in the party with a bond but **none of the companion mechanics.**
>
> So an "NPC party member" is the missing **body** that unifies these: a person who travels with you and carries a ROLE, each role wiring to the system that already implements it. A trainer-in-your-party IS `teachers[trad]={met,willing}` — now visible as the person who makes that learning possible.

## ✅ ERIK'S RULING — LOCKED (2026-07-16): UNIFY (A)
**One concept — "your company."** companion / trainer / liaison / partner / ally are **ROLES** an NPC-in-your-company holds, and **roles stack freely** on one person (Pell can be partner + liaison; a mentor can be trainer + ally). The bond/bonus/GM machinery is SHARED across all of them. Huginn is a company member whose role is `companion` (beast). **Feasible now** — `companionLine` already carries `role` + `knowledge`, and `activeCompanions` is id-keyed against a catalog (generic, not beast-specific), so this turns on fields that exist rather than forking the system. No parallel humanoid category is built.

## THE MODEL — unified company, roles wire to existing systems
An NPC in your **company** is a record with one or more **roles**, each wiring to an existing system:
| Role | What it wires to (exists today) | Benefit surfaced |
|---|---|---|
| **companion** | `companionBonus` + `growBond` | the assist bonus (Huginn) |
| **trainer** | `teachers[trad] = {met, willing}` | unlocks learning that tradition's high tiers / acquisition — **"you have a trainer" made visible** |
| **liaison** | a bonus to `standingWithPeople` with their faction/people | faster faction reputation while they travel with you |
| **partner** | SNG-108 partner bond | the relational + party-adjacent benefits (Pell) |
| **ally** | generic bond + presence | GM knows they're at your side |
A company member lists their **roles + benefits + what they can teach** (the `knowledge`/tradition they'd train), exactly as a companion lists its assist. Learning from them uses the **existing teacher gate** — having the trainer *in your company* is what sets `{met: true, willing: true}` for their tradition.

## SURFACING (composes with SNG-119/120)
- The **"Company" section** (SNG-120) already merged Party + Companions — extend it to a third group **"Allies"** (NPC party members), each shown with role badges (⚔ trainer · 🤝 liaison · ♥ partner) + their benefit line + a "what they teach" note.
- A trainer in the company shows on the **skill wheel / level-up** (SNG-124) as *why* a gated skill is now learnable ("Sorel can teach you this").
- A liaison shows on faction/standing displays as an active reputation multiplier.

## ENGINE / UI SURFACES
| Module | Change |
|---|---|
| `engine/companions.js` (or a new `engine/company.js`) | Generalize to a company member with `roles[]`; keep `companionBonus`/`growBond`; add `trainerFor(character)` (which traditions your company can teach) + `liaisonFactions(character)`. |
| `engine/progression.js` | When resolving the teacher gate, a **company member with role `trainer` for that tradition** satisfies `teachers[trad]={met,willing}` — wire company → teacher gate. |
| `engine/reputation.js` | A company `liaison`'s faction gives a `standingWithPeople` gain multiplier while active. |
| `engine/npcs.js` | Recruiting an NPC to the company (bond threshold + willing) — a strong-enough bond + their consent adds them with role(s). |
| `app.js` (Company section, SNG-120) | "Allies" group: role badges, benefit lines, "teaches: {tradition}", recruit/part-ways controls. |
| `content` | NPC records can declare recruitable roles + what they teach (`teaches: tradition`, `liaisonFor: people`). |
| `tests/*` | A trainer in the company satisfies the teacher gate for their tradition (learn a gated skill that was blocked before); a liaison multiplies faction standing gain; a partner (Pell) shows partner+ally roles; roles stack on one NPC; parting ways removes the benefits cleanly. |

## GUARDS
- **Reuse the teacher gate — don't fork it.** A trainer-in-company SETS the existing `{met,willing}`; it doesn't invent a second learning path. (Composes with SNG-100b.)
- **Benefits are tied to presence** — part ways and the trainer/liaison benefits end (the gate closes for high tiers not yet learned; already-learned stays, Law 14).
- **Recruitment is consensual + earned** — bond threshold + the NPC's willingness; you don't conscript people. Minor NPCs can never be recruited to a romantic/partner role (existing floors).
- **Composes, doesn't duplicate** — this extends the SNG-120 Company section and the SNG-100b teacher gate; it is not a parallel party system.

## OPEN QUESTIONS — CCODE ROUND 2 (design settled; build confirmations)
1. Confirm `activeCompanions`/`companionBonus` generalize to a humanoid company member without breaking Huginn (beast path stays valid as role=companion).
2. The teacher gate reads `teachers[trad]` — can a company `trainer` populate it while present (transient) distinct from the durable `markTeacher` (met-once)? Clarify present-in-company vs permanently-taught (recommend: presence sets willing+met transiently; once they've actually taught you a skill, `markTeacher` makes met durable so parting doesn't erase that you were taught).
3. Roles stack (ruling: yes) — confirm the record holds `roles[]` and every wire (bonus/teacher/liaison/partner) reads its own role independently so one NPC firing multiple benefits is clean.
