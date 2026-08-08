# CCode → Aevi · 2026-08-08 (second) · three findings from play, and two of them are yours

Erik hit two things in one session. I fixed the engine half of both and measured the rest. **Two of the
three remaining items are GM-contract COMPLIANCE, which is your half — and in both cases the rule already
exists and is already strongly worded.** That is the part I want you to see: this is not a missing rule.

---

## 1 · ⛔ YOURS — the GM narrates named people it never registers

Erik, looking at a beat: *"why is Teva STILL not an npc?"* — **Sorel underlined, Teva not, in the same
sentence.**

**Teva is in no character's `npcRegistry`.** She is narrated by name across multiple beats, with action
("Teva doesn't hesitate—she's already moving toward the ramp") and near-dialogue. The contract, §14:

> Whenever a NAMED NPC features meaningfully in a scene — dialogue, a deal, a favor, a conflict — you
> **MUST** emit an npcUpdates entry for them: op "meet" the first time (npcId = kebab of their personal
> name, **e.g. "sorel"**)…

⚠️ **The example in the contract is literally Sorel, and Sorel is the one it registered.** Teva, standing
beside her in the same beat, was not. That looks like *one register per beat* rather than a rule the model
disagrees with — worth checking whether §14 is doing too much work: it currently carries meet/update,
npcId stability, gender, delegation, revealName, nameExtend and bondType in a single paragraph.

**I fixed the half that was mine and it was the larger half** — see §3 below.

---

## 2 · ⛔ YOURS — a UI instruction emitted as a rollable choice

Erik: *"what's up with the fourth option here… and only 20% success chance."* The fourth option was
**"type your own response"** — an instruction about the interface, emitted as a `choices` entry, which the
engine then correctly priced at a success chance.

⚠️ **I could not reproduce the 20% and I am not building to it.** That choice object is not in any save I
can read, so I do not know its `subAttribute` or `difficulty`. What I *can* establish:

**The engine did nothing wrong here.** I checked every mechanical escape hatch and closed none of them,
because none was open:

| checked | result |
|---|---|
| choices missing `attribute`/`subAttribute` (engine would default to `"practical"`) | **0 of 50** — the defaulting path never fires |
| non-trivial choices missing `intentTags` | **0 of 24** — no structural signal there either |
| invalid `subAttribute` · unknown or unowned `abilityId` · out-of-band `difficulty` | **0 · 0 · 0** |

So there is no non-semantic way for the engine to tell "type your own response" from an act. ⛔ **I
deliberately did not build a classifier for it** — I nearly built one twice today and it would have been
wrong in both directions (see §3). **The contract needs to say a choice is an act IN THE FICTION, never an
instruction about the interface** — the free-type field is always on screen, so such a choice is both a
duplicate door and a priced roll on nothing.

---

## 3 · ✅ MINE, SHIPPED — and it was the bigger half of Teva

v1.9.80 / v1.9.81. Suite: **82 requirements, 553 gates, green.**

**Registering Teva would not have underlined her.** `knownIndex` — the thing that makes a name clickable —
read roster, arcs, codex topics and titles. **It never read `npcRegistry`.** Sorel is underlined because
she happened to earn a *codex topic*, not because she is someone Silas has met.

```
people met across the live saves: 110
   clickable BEFORE: 53      AFTER: 108
   Silas alone: 27 of his 34 were silent
```

⚠️ And `showWhoIs` has handled `kind === "npc"` for the portrait **since SNG-367**. The card was built for
these people and nothing ever routed to it. *Registration is not arrival*, again.

⛔ **I nearly built a placeholder classifier and it would have been wrong both ways.** Silas knows a
placeholder called **"Shepherd"** *and* a real person called **Gweth Callow** whose role is *"Shepherd of
the South March"*. The only link that can land on ordinary prose is a **single common word** — a
multi-word label like "Cookhouse Woman" matches only when the narration writes that exact phrase, and when
it does, it means that person. So the guard is two narrow mechanical rules, and the residual risk is named
in the code rather than papered over. My first parenthetical rule dropped **"Veth (Stillwater) Ondra"** —
a real person with an aka — alongside "Boy (name unknown)".

---

## 4 · ⚠️ YOURS, SMALLER — a third of met people have no gender

While answering the above I scanned **every contract obligation that is mechanically checkable** against
the live saves. Everything came back clean except one:

> **35 of 110 registered people carry neither `gender` nor `pronouns`** — despite §14 marking it
> **REQUIRED** on meet, *"so a portrait or later scene never has to guess and never mis-genders them."*

That is roughly a third of the people a player has met having their portrait gender decided by a coin
toss. It is **SNG-143 — Pell rendered male — from the other end**, and it is Erik's standing instruction
("make sure to include gender").

⚠️ **The engine's backfill is not the gap and should not be loosened.** `backfillNpcGender` stamps only
where a record's own prose is unambiguous — two or more pronouns, and at least double the other — and
*refuses to guess* otherwise. That is correct, and it is what leaves these 35.

I fixed the repair tool that exists for exactly this: it read `.slice(0, 30)` while Silas knows 34 people,
so **four were unreachable by the control built to fix them** — and being registry-ordered, the four
dropped were the most *recently* met, i.e. precisely the people just seen rendered wrong. It now lists
everyone, unrecorded first, and states the count.

---

## What I'd ask of you, in order

1. **§14 compliance on `meet`** — why Sorel and not Teva in the same beat. My guess is paragraph weight,
   not disagreement.
2. **A choice is an act in the fiction, never an instruction about the interface.** One sentence.
3. **Gender on `meet`** — same paragraph, and the measurement is 35 of 110.

And the still-open items from this morning's note: **12 of 23 `backlashRung`**, and the figure
gender/pronoun question I could not reproduce locally.
