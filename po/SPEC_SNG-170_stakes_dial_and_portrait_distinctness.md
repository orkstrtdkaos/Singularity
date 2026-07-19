# SNG-170 — A stakes dial, and portraits that aren't the same person

**Author:** Aevi (PO) · 2026-07-18 · Erik-directed from live play
**Numbering:** checked `po/` at HEAD (highest was 169).

Erik: *"Most of what happens right now is pretty bland — Pell defeated her opponent by hitting his
elbow with the flat of her blade… I disarmed the bandits… we need things we unequivocally want to
KILL and that want to kill us so there are stakes. But not everyone will want that, so we can tune it."*

---

# §1 — WHY THE GAME IS BLAND (measured, and partly my fault)

## 1a. The engine is non-lethal by design, globally, with no dial

**`gm.js` rule 18:** *"Defeat narrates as incapacitation and consequence — EXCEPT encounters marked
`lethal:true`, where falling can kill."*

**`newEncounter` contract:** `"lethal": false` is the literal default in the schema shown to the model.

**`offerIntent`:** marked **⛔ RARE**, *"never for ordinary harm"*, and `"default"` is required to be
*"the GENTLER option's id — a dropped answer must never kill."*

Every one of those is a defensible choice, and together they mean **the world cannot hurt you unless
a specific encounter was authored to.** That is not blandness by accident; it is the safety design
working exactly as written, with no way to turn it up.

## 1b. I made it worse today

I authored 15 duels in SNG-164. **Every one is `lethal: false`** — including `wild_boar_valley` and
`wild_greatcat_quickwood`. I gave them `yieldAt: 0` so they don't surrender, then left them unable to
kill.

**A boar that cannot kill you is not a boar.** The Coliseum bouts are correctly non-lethal — it is a
sporting venue under forms. The wild dangers are a content error and I will fix them under whatever
dial §1c lands on.

## 1c. The design: a per-profile STAKES dial

This rides the machinery SNG-144 already built — `plainness` and `bluntness` are per-profile
selects in Settings, read by `narrativeRegister` / `bluntnessDirective`. **Stakes is a third dial of
the same shape**, so there is nothing new to invent.

| tier | what it means |
|---|---|
| **Heroic** | today's behaviour. Defeat is incapacitation and consequence. Nothing in the world kills you. The family-safe default. |
| **Standard** | the world contains things that will kill you, and they are telegraphed. Predators, declared enemies, and anyone you have genuinely provoked fight in earnest. Defeat can be maiming or capture; death is possible where it was signposted. |
| **Perilous** | enemies fight to kill and expect the same. Defeat can be death. Yield is a real choice on both sides rather than an assumption. |

**What the dial actually changes:**
1. **`newEncounter` default** — `lethal` defaults to the dial, not to `false`.
2. **Authored `yieldAt`** — scaled. A Standard boar does not yield; a Perilous bandit does not either.
3. **Rule 18's defeat clause** — incapacitation at Heroic, consequence-or-death at Standard, death at Perilous.
4. **`offerIntent` frequency** — RARE stays RARE, but at Perilous the player having declared violence
   already *is* the answer, and asking it back is the annoyance.
5. **Narration** — Erik's "flat of the blade" is the model reaching for the gentlest reading of a win.
   At Standard and above it should narrate what actually happened.

**What the dial NEVER changes** (these are the reason a dial is safe to offer at all):
- **Telegraph before engagement.** Lethal stakes stay signposted at every tier.
- **A clear path to decline** before an encounter begins.
- **Flee available in round 1.**
- **Rating and minor-protection floors** are untouched — stakes is about *mortality*, not content
  rating. A PG game at Perilous means a character can die, not that the prose gets graphic.

Per-profile, because Erik and Brayden and the girls play the same world and should not share one
setting.

## 1d. Content: things you unequivocally want to kill

A dial alone will not fix it. Erik's phrase is *"things we unequivocally want to KILL and that want
to kill us"* — and the corpus currently has almost nothing that qualifies. Bandits who can be
disarmed are not that; they are an obstacle with a personality.

Needed as authored content (my lane):
- **Predators with no parley** — no `yieldAt`, no negotiation branch, no tacticTag that reads as
  hesitation. The greatcat should already be one.
- **Enemies that are already killing** — arriving mid-atrocity removes the moral question, which is
  what makes the fight clean. The Long Grey's drifted Ashwardens and the Wild Half both supply this
  honestly within existing lore.
- **Things that are not people** — the Unmade, churn-things, a precursor grave-seal's contents
  (`unmake_seal` r3 is already authored `lethal` and says *"meeting them kills"*). That ability
  promises a monster the world does not yet contain.

---

# §2 — WHY EVERY PORTRAIT LOOKS THE SAME

## Root cause

`art.js:npcPromptSeed` leads with:
```js
npc.appearance || npc.form || formOf(npc) || npc.description || npc.role || npc.name || "a person"
```

**But the `npcUpdates` contract has no `appearance` field.** It carries `name`, `role`, `gender`,
`pronouns`, `description` ("one line, on meet"), `note`, `learned`, `skillsObserved` — and nothing
physical.

So an authored NPC (which does carry `appearance`) renders distinctly, and **every NPC the GM meets
in play falls through to `role` or `name`**. The prompt becomes *"a dock-master, character portrait,
named Sorel, she/her"* — which gives the generator nothing to differentiate on. Of course they
converge: they are the same prompt with a different noun.

## Fix

1. **Add `appearance` to `npcUpdates`**, required on `op: "meet"` alongside the gender field SNG-143
   already made mandatory — same reasoning, same place, and gender was added for exactly this class
   of bug.
2. **Ask for physical specifics**, not vibe. The contract line should demand the things a generator
   can actually draw: build and height, colouring, age, hair, one distinguishing mark, bearing,
   what they are wearing and how it has worn. *"Weathered"* is not a face; *"a short, heavy-shouldered
   woman near sixty, grey hair cropped to the ear, a burn-scar down the left forearm"* is.
3. **Push variety explicitly.** Models regress to a default face the same way they regress to a
   default name (SNG-166 §3). The prompt should say so: vary age, build, and colouring across the
   people of a region; most people are not young, not symmetrical, and not beautiful.
4. **Regional look, like regional names.** SNG-166 proposes per-region onomastics; the same file
   should carry per-region *appearance* notes — the Palelands are grey and tended, the Gearlands wear
   their trade, the Lattice is uniformed. One content file serving both.
5. **Backfill.** Existing NPCs with no `appearance` should get one on next meaningful appearance
   rather than staying generic forever.

**Note:** `formOf` (SNG-053) already solves the non-human case — an Ent renders as an Ent. The gap is
specifically *human physical variety*, which no existing field carries.

---

# §3 — THE CHRONICLE (Erik will detail; recorded so it is not lost)

Erik: *"I want to make sure the character chronicle feeds into the portraits generated every couple
levels. That's a whole batch of work I need to detail later. The Chronicle is at the bottom of the
character sheet accessed via a button right now — it needs to be more integrated into the sheet itself."*

**Not specced here, deliberately** — Erik has said he wants to define it. Two things noted so the
shape is ready:

- **Chronicle → portrait** is a real and good idea: `characterPromptSeed` currently draws on the
  character record, not on what they have *done*. A portrait at level 6 should show the scar from
  the thing that happened at level 4. `ensureImage` + the gallery already exist to hold a series.
- **Chronicle placement** is a sheet-integration question, and it overlaps SNG-168 §2 (the world
  feed) — the chronicle is the private version of what the feed shares. They should be designed
  together, and I would rather wait for Erik's detail than guess at it now.

---

# §4 — Acceptance

1. A player at **Heroic** sees today's behaviour exactly.
2. A player at **Perilous** who provokes a fight can die, having been told beforehand.
3. Telegraph, decline-before-engagement, and round-1 flee hold at **every** tier.
4. Ten NPCs met in a row are visibly different people.
5. `wild_boar_valley` and `wild_greatcat_quickwood` behave like animals that can kill.

# §5 — Questions for CCode ROUND 2

1. §1c — should the dial scale authored `yieldAt` at runtime, or should encounters declare a
   per-tier block? Runtime scaling is less content work and less honest; I lean per-tier where it
   matters and runtime elsewhere, but you own the clamp path.
2. §1c.3 — rule 18's defeat clause is prose, not data. Is there a clean way to make it dial-driven
   without three near-duplicate paragraphs in the prompt?
3. §2.1 — `npcUpdates` is already a long contract. Does adding a required field on `meet` risk the
   model dropping others, and is that measurable before we ship it?


---

## CORRECTION + §2 CLOSED (Aevi)

**§2 said authored NPCs "do carry `appearance`" and render distinctly. Measured: 1 of 42 did.**

The portrait convergence was never mainly a generated-NPC problem — it was corpus-wide. The prompt
seed leads with `npc.appearance` and there was almost nothing to lead with, so effectively every
portrait in the game resolved from `role` and `name`. Another claim asserted from the shape of the
code rather than from counting the data.

**§2 content half is now SHIPPED: 40 NPCs given physical descriptions** — build, height, age,
colouring, one distinguishing mark, bearing, and how the clothing has worn. Deliberate variety:
most are past forty, several past seventy, few are symmetrical, and the non-human forms (three Ents,
the Old Stag, the Lightless Seraph) are described as what they are rather than as people.

**This is live with no engine change** — `npcPromptSeed` already reads the field. Unlike the substrate
pass, which needs a resolver before it does anything.

**Still open in §2:** the `npcUpdates` contract field (so NPCs met in play get an appearance too),
the variety directive in the prompt, and the per-region look notes that pair with SNG-166's onomastics.
Those are build/prompt work, not content.
