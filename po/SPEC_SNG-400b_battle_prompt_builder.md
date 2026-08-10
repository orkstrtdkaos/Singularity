# SNG-400b — The battle image is a PROMPT BUILD, not a string join

**Author:** Aevi (PO) · **Date:** 2026-08-09 · **Supersedes SNG-400 §2**
**Erik:** *"the prose not working very well to just be thrown together. If we have an appearance for each
NPC then the battle needs to describe the scene based on the POWER they used. This is a combined context
prompt build task that would generate a beautiful short prompt."*
**Content shipped:** `2e594be4`, `68b65f55`

---

## §1 — ⛔ MY DESIGN WAS WRONG AND HE NAMED WHY

I authored `combatPresence` as **half a prompt**, to be concatenated with the other half. Composed, that
gives:

> *Neth, Who Has Buried More Than She Has Known — master, a cut-thread motion that ends rather than
> wounds; the one who attends an ending unsent-for AGAINST Morvane of the Harvest Hand — reaper, a
> cut-thread motion that ends rather than wounds; the one who ends what she deems finished*

⛔ **That is a list with a conjunction in it. No amount of authoring fixes a join** — the prose was never
going to work because concatenation is not composition.

⚠️ **And it ignored the thing that actually happened: the POWER.** A death by *The Cut Thread* and a death
by *sonic resonance* are different pictures, and my design could not see the difference.

---

## §2 — WHAT I SHIPPED INSTEAD: BUILDER INPUTS, NOT PROMPT FRAGMENTS

### `appearance` — 66/66, NEW (`2e594be4`)

**The static look**, which did not exist. ⚠️ **`imagePrompt` is a SCENE** — *"closing a grove path as vines
knit behind her"* — and cannot be reused as "what this person looks like" in a different scene.

**Kind is honoured**, per `peoples_of_kind`: masons **DWARVEN**, enginewrights **PART-MACHINE**, abyssals
**HORNED**, and the human majority human.

⛔ **This also fixes SNG-399 from the content side.** `showWhoIs` reads `known.appearance`, which existed on
none of the 66. **It exists now** — the field mismatch is half-closed from my end, and your side still
needs to prefer `imagePrompt` where a scene is wanted.

### `fightingStyle` — 66/66, DEMOTED from `combatPresence` (`68b65f55`)

One short clause: *"master, a cut-thread motion that ends rather than wounds."* ⛔ **An INPUT, not a
fragment of the output.**

---

## §3 — ⛔ THE BUILD TASK

**Context in:**

| | source | coverage |
|---|---|---|
| both figures' look | `appearance` | ⛔ **66/66, new** |
| both figures' craft | `fightingStyle` | 66/66 |
| ⛔ **the power actually used** | ability `description` + `shape` + `intensity` + `effectTags` + `powerSystem` | **374/374** |
| the place | biome, terrain, water, the location's own seed | live |
| the outcome | who fell, how deep the deathRoad ran | live |

**Out: ONE short image prompt.** ⚠️ **Short is the requirement, not a nicety** — a long prompt averages
into a generic picture, which is what the Thornmother card is already showing.

⛔ **THE ABILITY IS THE SUBJECT OF THE IMAGE, not decoration.** *The Cut Thread* used on a person is a
different photograph from *sonic resonance* used on the same person in the same place. **Build the picture
around what the power DID.**

⚠️ **Cache on `victimId|killerId|abilityId|worldDay`** — same fight, same picture, forever. **A re-rolling
battle quietly says it was a different fight.**

---

## §4 — CORRECTIONS TO MY EARLIER SPEC

⛔ **"Fall back when the death was by illness" — THERE IS NO ILLNESS IN THIS GAME.** Erik corrected me and
he is right; I invented a cause of death the world does not have. **The real fallback is a death with no
named killer** — an arc casualty, a world-tick ending — and that takes `deathImagePrompt`, the
single-figure scene from SNG-399b.

⚠️ **SNG-400 §1 still stands and is still the blocker: death news is prose with no `victimId`,
`killerId`, `abilityId` or `locationId`.** ⛔ **The builder cannot run on a sentence.** Structure the news
first; everything above is inert until then.
