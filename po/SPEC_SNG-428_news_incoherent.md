# SNG-428 — ⛔ The news is not coherent, and the clash does not know where it happened

**Author:** Aevi (PO) · **Date:** 2026-08-10
**Erik:** *"Look at the news. Is it coherent? Interesting? Obvious why it's news? Do the fights and any
deaths have a scene I can click on?"*
**Four questions. Measured answers: no, no, no, and no.**

---

## §1 — ⛔ NOT CLICKABLE. 0 OF 20 NEWS ITEMS CARRY IDS.

SNG-400 §1 asked for `victimId`, `killerId`, `abilityId`, `locationId` on death news. ⚠️ **The DEATH path
was wired and is correct** — `worldtick.js` pushes `{ kind: "death", victimId, killerId, worldDay }` with
a comment quoting the spec.

⛔ **But the WOUNDED, CHECKED and STALEMATE paths — which are what the player is actually reading — push
BARE STRINGS.** Every fight on Erik's screen is one of those three.

Measured on a live save: **20 news items, 0 with a `kind`, 0 with any id.**

**And `resolveEpicClash` contains ZERO references to `locationId`, `abilityId`, `location` or `where`.**
⛔ **The clash does not know where it happened or what was used, so there is nothing to build a battle
image FROM.** SNG-400b's prompt builder cannot run — not because the content is missing, but because the
event never records the two facts the builder needs.

---

## §2 — ⛔ NOT COHERENT. THE SAME FIGURE WINS AND LOSES IN ADJACENT LINES.

From the screen:

> *The Hollow King of the Wild Half bested The Weeping Archive*
> *The One Who Called the First Moot bested **The Hollow King of the Wild Half***

⚠️ **Two fights, same tick, no ordering, no interval.** A reader cannot tell whether the Hollow King won
then lost, lost then won, or fought both at once.

**And the templating shows through:** *"The Choirmaster Who Would Not Return — The Choirmaster Who Would
Not Return withdraws to lick their wounds."* ⛔ **The full name repeats inside one sentence** because the
template is `${winner} bested ${loser} — ${loser} withdraws`. **With names this long it reads as a
stutter.**

---

## §3 — ⛔ NOT OBVIOUSLY NEWS. NOTHING SAYS WHY IT MATTERS.

Take one line: *"Overseer Grael of the Edge District bested The Hollow King of the Wild Half."*

⛔ **THE ENGINE HAS ALL OF THIS AND SHOWS NONE OF IT:**

| field | value |
|---|---|
| tradition | `abyssal` |
| role | Sovereign |
| **wants** | *"To be asked. He never takes; he is given."* |
| **rivals** | maren_ossitide, seraphine_unbending, the_last_walker |
| homeLocation | `the_maw` |
| archetype | the tempter |

⚠️ **`rivals` is authored and unused. The Hollow King has three named enemies, and the news does not say
whether this was one of them** — which is the difference between *a fight* and *the fight everyone was
waiting for.*

**Nor does any line say what CHANGED.** *"Withdraws to lick their wounds"* is the same sentence whether
the loser is out for eight days or has lost a war.

---

## §4 — ⚠️ AND TWO LINES ARE NOT SENTENCES

> *"Sister Alder, the Ward That Does Not Break learning a faster road"*
> *"Overseer Grael of the Edge District a daughter who thinks he is a clerk"*

⛔ **A name concatenated to a fragment with no verb.** The second reads as a category error — it is a
`personalVerbs`-style fragment dropped into a slot expecting a clause.

---

## §5 — WHAT I NEED, IN ORDER

1. ⛔ **`resolveEpicClash` must record WHERE and WITH WHAT.** Both figures have a `homeLocation`; a clash
   between them happens somewhere, and the tradition's abilities say what it looked like. **Without these
   two fields nothing downstream can ever draw a battle.**
2. ⛔ **Every fight news item becomes an object with `kind: "clash"`, `winnerId`, `loserId`, `locationId`,
   `abilityId`, `outcome`.** The death path already does this correctly — **the other three paths just
   need the same treatment.**
3. **Then the battle image** (SNG-400b) — the content is all authored and waiting: `appearance` 66/66,
   `fightingStyle` 66/66, and 374 abilities with `description` + `shape` + `intensity`.

## §5a — And what I owe, since half of this is authoring

⚠️ **The templates are mine and they are bad.** I will re-author them to:
- **use a short form on second mention** — the stutter is a template fault, not a name-length fault
- ⛔ **say WHY it is news** — name the rivalry when `rivals` matches, name the want when it moved
- **say what CHANGED** — eight days out is not the same as a war lost, and one sentence currently covers both
- **fix the two verbless fragments**
