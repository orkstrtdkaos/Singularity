# SNG-400 — Death news should open the battle that caused it

**Author:** Aevi (PO) · **Date:** 2026-08-09
**Erik:** *"I want the news of their death to have an image of the battle that killed them… if one NPC and
another battle — I click it and see the two battling."*
**Content shipped:** `3b314910` · **Wiring: yours.**

---

## §1 — ⛔ THE BLOCKER: DEATH NEWS IS PROSE. THERE IS NOTHING TO CLICK.

A real death item, from a live save:

```json
{ "day": 1, "worldDay": 32, "tier": "event",
  "text": "Word reaches you: Veln Ashpause was killed at the braided confluence below the rise
           in the Disputed Zone. (near millbrook)" }
```

⛔ **No `victimId`. No `killerId`. No `locationId`. A sentence, and a tier.** The engine knew all three
when it wrote that sentence and kept none of them.

⚠️ **Same shape as `arcCasualties`, which your own comment at `app.js:9095` calls out: *"who died on which
arc… collected then never read."*** The facts exist at the moment of the event and are flattened into
prose immediately.

**Needed on the news item:** `victimId`, `killerId` (nullable — not every death is a killing),
`locationId`, `kind: "death"`.

---

## §2 — ⛔ WHY THE IMAGE CANNOT BE PRE-AUTHORED, AND WHAT I SHIPPED INSTEAD

A death image is one figure. **A battle image is two, and the pairing only exists at the moment it
happens** — I cannot author 66 × 66 prompts.

**So every figure now carries `combatPresence`** (`3b314910`): how *this* person looks in a fight.
**The engine composes the pair:**

```
"{victim.combatPresence} against {killer.combatPresence}, at {location}."
```

**Composed, from real rivals:**

> *Neth, Who Has Buried More Than She Has Known — master, a cut-thread motion that ends rather than
> wounds; the one who attends an ending unsent-for*
> **AGAINST**
> *Morvane of the Harvest Hand — reaper, a cut-thread motion that ends rather than wounds; the one who
> ends what she deems finished*

⚠️ **`rivals` is already authored on the figures** — Neth/Morvane, Cinder Vael/Halcyon. **The pairs the
world most wants to draw are named in content already.**

## §2a — My first attempt failed and the failure is instructive

⛔ **I built `combatPresence` from TRADITION alone: 29 distinct strings for 66 figures.** And because
**rivals share a tradition**, Neth and Morvane composed as *the identical sentence twice* — **the two
people most likely to kill each other rendered as one person fighting a mirror.**

**Fixed by individuating from each figure's own `offscreenVerbs[0]`**, which is authored per person.
**66 distinct.** ⚠️ **A shared-category attribute cannot distinguish members of that category** — the same
error as deriving the site tier from topology.

---

## §3 — WHAT I NEED

1. **Structure the death news** (§1). ⛔ **Without ids there is nothing to click.**
2. **Make `kind: "death"` news items clickable**, opening a scene card with the composed battle image.
3. **Compose from `combatPresence` ×2 + the location.** ⚠️ **Seed on `victimId|killerId|worldDay`** so the
   same battle is the same picture every time it is opened — a re-rolling battle quietly says it was a
   different fight.
4. **Fall back to `deathImagePrompt`** (SNG-399b, single-figure) when `killerId` is null — ⚠️ **not every
   death is a killing, and a death by illness or by the world should not invent an opponent.**

---

## §4 — ⚠️ THE THREE PROMPT FIELDS AND WHEN EACH APPLIES

| field | when | shape |
|---|---|---|
| `imagePrompt` | the figure surfaces alive | one figure, authored |
| `deathImagePrompt` | died, no killer | one figure, authored (SNG-399b) |
| `combatPresence` | died to a named opponent | ⛔ **half a prompt — composed with the other half** |

⛔ **All three are now authored on all 66 and NONE of them currently has a reader.** That is the general
gate from SNG-399b, and it would go red three times on this one file.
