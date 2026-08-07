# SNG-351 — Points at 2, points from the world, and the tier-I floor that has no offense in it

**Author:** Aevi (PO) · **Date:** 2026-08-07 · **Origin:** Erik, from Splarf's level-up
**Status:** §1 SHIPPED · §2 spec_ready · §3 my answer, Erik's call · §4 spec_ready, content is mine

---

## §1 — `skillPointPerLevel` 1 → 2. SHIPPED (`e81f3679`), Erik ratified.

Craft affordability moves from **40% → 80%** of the breadth cap, permanently. Points still bind — that is
deliberate, choosing is the game — but capacity is now visible from inside the economy instead of being a
ceiling no paying character approaches.

⚠️ **CCode: this changes what `learnBuyableOnly` (SNG-348) shows and what "at capacity" means.** The
buyable filter was written against a 40% world where almost nothing was in reach. Re-check the filter's
empty-state copy — "nothing in reach yet" was accurate at s=1 and will now be rarer, which is the point.

---

## §2 — POINTS FROM THE WORLD: teachers, tomes, artifacts, entities (Erik's ask)

⚠️ **THE HOOK ALREADY EXISTS AND IS UNUSED.** `traditions.json` gives every tradition an access block:

```
"access": { "native": true, "inRegion": true, "teacherOrTome": true }
```

`teacherOrTome` is canon already — it gates *whether a tradition is open to you*. Erik is asking for the
adjacent thing: a source in the world that grants **skill points**, not access. Same fiction, different
currency. Build it beside the existing gate, not on top of it.

### §2a — Grant points, or grant a craft? BOTH, and they are different stories.

| Grant | Fiction | When |
|---|---|---|
| **skill points** | "you have been *taught how to learn*" — a teacher opens your capacity to study | the reward is player CHOICE; the source shapes what you could pursue but does not pick |
| **a specific craft, free** | "she showed you *this*" — the tome holds one thing and now you hold it | the reward is the THING; the source is the whole story |

The second already exists in two forms (`nativeGrants` by-right starter kits, ripe aspirations at zero
cost), so it is a wiring job, not a new system. **The first is what does not exist.** Build §2 as point
grants and let the existing free-learn path carry the specific-craft case.

### §2b — Sources, and what distinguishes them

Four kinds, and each should feel different at the table, not just differ in number:

- **Teacher** — *repeatable, relational, capped.* A person who will teach you again if the standing holds.
  Should read against `peopleStandingBands` and the existing `capstoneStanding.requiresTeacher: true` — a
  teacher you have burned does not teach. **This is the one with the most game in it,** because it makes
  points a reason to keep a relationship.
- **Tome** — *one-shot, transferable, findable.* An object; it can be lost, sold, or given to another
  character. The only source that survives its owner.
- **Precursor artifact** — *one-shot, gated, costly.* Should carry a `cannot` and probably a price beyond
  finding it. Precursor is learned-only in canon; an artifact that hands out points cheaply undercuts that.
- **Supernatural entity** — *bargained, not earned.* This is the Bargainers' whole territory. A grant with
  a hook in it. Should be able to be REGRETTED, which none of the other three should.

### §2c — The three guardrails, and why each exists

1. **⛔ Grants must not be repeatable-by-grinding.** A teacher who gives a point every visit converts
   points from a level-paced resource into a farming loop, and the §1 measurement stops describing the
   game. Per-source ledger on the character (`character.grantsTaken[sourceId]`), not a global counter.
2. **⛔ A grant is an EVENT, and the ledger must survive a reload.** SNG-343's lesson: if the record is
   store-time and lossy, the fiction hardens wrong. Write the grant with its provenance — who, where,
   what world-day — so the codex can say where a point came from.
3. **⚠️ Budget it against §1 before authoring quantities.** At s=2 a level-12 character has 26 points. A
   handful of 1–2 point grants across a campaign is seasoning. A dozen is a second income and re-opens
   the balance question we just closed. **PO recommendation: total world-granted points across a full
   arc should sit under ~15% of level-granted points.** That number is a starting position, not a
   measurement — flag it for revision once there is play data.

**CCode: spec review before build.** Open question I want your read on: should a granted point be
*marked* (spendable only within the granting tradition) or fungible? Marked is better fiction and worse
UX, and I do not have a strong position.

---

## §3 — SKILL POINTS FOR HP / ENERGY: my answer is NO, and the reason is §1

Erik asked. Here is my read, held with the reasoning exposed so it can be overruled on its merits.

⛔ **The sink already exists — twice — and neither is skill points.** Verified in `engine/progression.js`
at the level-up block:

```
character.maxHealth += 5; character.maxEnergy += 5;
character.pendingSubPoints += subPointPerLevel;   // = 1
character.skillPoints      += skillPointPerLevel; // = 2
```

Reserves grow **automatically** every level, and there is a **separate currency** — sub-attribute points —
that buys the attributes those reserves and every roll depend on. The game already answers "I want to be
tougher": spend sub-points. It is a different pocket on purpose.

**Three reasons against, in order of weight:**

1. **⛔ It re-opens the problem we just closed.** Points are the binding constraint. We raised supply to
   fix a 60% shortfall. Adding a competing sink is treating a scarcity problem by *adding demand* — the
   80% we just bought gets spent on hit points and craft affordability falls back toward where it was.
   **This is the whole argument. The other two are secondary.**
2. **It collapses two currencies into one.** Sub-points are *who you are*; skill points are *what you can
   do*. One currency for both means every character optimises the same axis, and the distinction that
   makes a frail scholar different from a tough one stops being a choice and becomes a conversion rate.
3. **HP-for-points is the genre default,** and it is the move that would make this feel like every other
   levelling system. The crafts are what is distinct here.

**⚠️ BUT I think you are feeling something real, and I do not want to answer only the question asked.**
The thing that makes a points-for-HP sink attractive is *points sitting unspent with nothing to do*. Two
better fixes for that, both cheaper than a new sink:

- **`subAttributeCap` is 20 and `subPointPerLevel` is 1** — so the *body* currency is the one that is
  actually starved, not the craft one. If you want tougher characters to be reachable, that is the dial,
  and it is untouched.
- **If you want a skill-point sink anyway, make it a conversion at a punitive rate** (e.g. 3 skill points
  → 1 sub-point, never the reverse). It respects the boundary, it is a genuine sacrifice rather than a
  parallel track, and it self-limits. I would still rather not, but this is the version I would build.

**Your call. I have not touched anything here.**

---

## §4 — ⛔ THE REAL FINDING: 23 OF 26 TRADITIONS HAVE NO TIER-I OFFENSIVE ABILITY

Erik: *"I was trying to get Splarf an attack skill, but there wasn't anything available for 1 point that
was in his domains."* **Measured across the full 311-ability catalog, and it is worse than a gap — it is
the shape of the entry tier.**

### §4a — Tier I is a perception tier with almost no offense in it

72 tier-I abilities. Function counts:

| function | count | | function | count |
|---|---|---|---|---|
| **reveal** | **39** | | **strike** | **4** |
| sustain | 18 | | ward | 3 |
| foresee | 16 | | shield | 1 |
| resist | 13 | | summon | 1 |

**39 reveal against 4 strike.** And of those four, **two are `valley_craft`** — the folk crafts Erik
explicitly excluded, since they are open to everyone and are not anyone's tradition. So the entire
catalog offers a tradition-bound level-1 character effectively **two** offensive options, and only if
their tradition happens to be harmonic or the dark/light Reach.

### §4b — Per-tradition, the floor is bare

| | count |
|---|---|
| Traditions with **zero** tier-I offensive ability | **23 of 26** |
| Traditions with **zero tier-I abilities at all** | **6** — threnodist, syllogist, veilwright, verist, god_named, bargainers |
| Median tier-I abilities per tradition | **2** |

⛔ **Numinous — Splarf's — has 2 tier-I abilities and 0 offensive.** Erik did not hit an edge case. He hit
the median.

⛔ **And six traditions cannot buy ANYTHING at level 1 in their own tradition.** A character created into
threnodist, syllogist, veilwright, verist, god_named, or bargainers has a starting kit and then a wall.
That is a creation-path defect wearing a content-gap costume.

⚠️ **Two tier-I options is not a choice.** Erik's phrasing — *"the ability for various characters to have
choices"* — is the correct frame and I would put a number on it: **a tradition needs ~5–6 tier-I abilities
before its level-1 character is choosing rather than accepting.** At 26 traditions that is roughly
**80–100 new tier-I abilities**, against 72 today. This is the largest single authoring job left in the
catalog.

### §4c — Authoring plan (mine), sequenced so play unblocks first

1. **The six empty traditions first** (~5 each, ~30 abilities). A character who cannot spend a point in
   their own tradition at level 1 is the live defect; everything else is thinness.
2. **The offensive floor across all 26** (~1–2 each, ~35). Every tradition gets a tier-I ability that acts
   ON something — and ⚠️ **not by bolting `strike` onto the existing sense-abilities.** The Threnodists'
   offense should be a lament, the Enginewrights' should be a mechanism; the function tag is `strike`,
   the fiction is the tradition's. **A tradition whose offense reads like another tradition's has been
   authored lazily.**
3. **Backfill the thin ones to ~5** (~20–30).

⚠️ **AMENDMENT 3 APPLIES AT FULL FORCE HERE.** *Audit what you write — would a player actually use this
for the intent?* The failure mode this job invites is 80 abilities that exist to fill a table. **Each new
tier-I must answer: what does a level-1 character DO with this on their second turn?** If I cannot answer
that in one concrete sentence, it does not ship.

⚠️ **AND THE COST-NEGATION CHECK:** at tier I the price is 1 point. An ability that costs 1 point and is
worse than the free folk-craft alternative is a trap, not a choice. Every new tier-I gets checked against
`valley_craft`'s thirteen — if Hunter's Strike is strictly better, the new one has failed.

---

## §5 — OUT OF SCOPE

- `subAttributeCap` / `subPointPerLevel` (§3) — named as the untouched dial, not proposed.
- Rebalancing tier prices — closed, and §1 solved this from the supply side.
- Marked-vs-fungible granted points (§2c) — open question to CCode, not decided.
