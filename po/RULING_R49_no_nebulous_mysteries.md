# RULING R49 — a mystery must come with its story, or it is not generated

**Ruled by:** Erik · **2026-09-06** · **Recorded by:** Aevi
**subject:** codex, generative-pipeline
**bodyAnchor:** "A HOOK WITHOUT A STORY BEHIND IT IS A DEBT"

> Erik: *"Agree about Case 3, but **it's a mystery without a GM KNOWN story or quest hook — that's a
> problem.** If something like Case 3 does get generated the engine/GM **MUST generate the quest with full
> list of facts, npcs, objectives, enemies, challenges** etc. Those can grow if the PC encounters parts of
> that particular local arc, but **shouldn't be left as a nebulous hook.**"*

---

## §1 — ⛔ THE CASE, FROM ERIK'S OWN SAVE

**`the-person-with-a-list`, kind `mystery`, ONE fact:**
> *"Someone has been moving deliberately through old pre-Transition infrastructure — removing the operator's
> instrument from the wash-room cradle-recess and, separately, removing targeted material…"*

⚑ **It is a good hook. It links to four things. And there is NOBODY BEHIND IT** — no arc, no quest, no
person, no objective. ⚠️ **The GM wrote a mystery and nothing in the world knows the answer.**

⛔ **THIS IS *"NO MORE NEBULOUS UNKNOWN AUTHORING"* ARRIVING IN THE GENERATIVE LAYER.** ⚠️ Erik ruled it for
hand-authoring on 09-02; **the engine has been doing it automatically ever since.**

---

## §2 — ⛔ AND THE ARC GENERATOR CANNOT CURRENTLY ANSWER IT

**`generate.js:155` — everything a generated arc contains:**
```js
scale: "local", pressure: "medium",
tendency: `a tension local to ${loc.name}, untended it hardens`,
hingeNpcs: [],                       // ⛔ EMPTY
ifIgnored: "it festers, unwatched",  // ⛔ BOILERPLATE
ifEngaged: "someone patient could turn it"
```

⚠️ **`type: "arc"` EXISTS IN `generateRequest` AND PRODUCES A STUB.** ⛔ **Nobody is in it, nothing happens
in it, and it says the same two sentences whatever it is about.** ➡️ **So the GM emitting an arc request for
a mystery would produce a second nebulous thing rather than fixing the first.**

---

## §3 — THE RULING

⛔ **A `mystery` TOPIC MAY NOT BE MINTED WITHOUT A STORY BEHIND IT.** ⚑ **Either it attaches to an arc or
quest that already exists, or one is generated WITH IT, carrying:**

| ⛔ required | ⚠️ and it must be REAL |
|---|---|
| ⚑ **facts** | **what is actually true**, including what the player does not know yet |
| ⚑ **who** | ⛔ **named people — `hingeNpcs` may not be empty.** Someone is doing this |
| ⚑ **objectives** | what finding out requires |
| ⚑ **opposition** | ⚠️ **enemies or challenges — what makes it hard** |
| **stages** | ⛔ **and the quest-stage shape is already authored and gated** (`SPEC_quest_snapshot`) |

⚑ **IT MAY GROW.** Erik: *"those can grow if the PC encounters parts of that particular local arc."*
⛔ **BUT IT MAY NOT START EMPTY.**

### ⚠️ WHY THIS IS DIFFERENT FROM ORDINARY GENERATION

**`generateRequest` for an npc or a location is fine as a stub** — ⚑ **a face at a gate becomes real by
being met.** ⛔ **A MYSTERY IS NOT LIKE THAT: a mystery whose answer does not exist cannot be solved, and
the player will pull on it.** ⚠️ **The hook is a promise, and an unbacked promise is the one thing the
codex should never store.**

---

## §4 — ✅ AND THE OTHER THREE CASES, RULED

| case | ⬜ |
|---|---|
| ⛔ **`edge-district-contacts`** | ✅ **NOT A TOPIC.** Log the fact under **`radiant-plateau-edge` as information gained** — Erik. ⚑ **Seven `edge-district-*` topics collapse this way** |
| ⚑ **`rabbit-structural-seam`** | ✅ **NOT A TOPIC** — the fact belongs to `the-unnamed-gift`. ⛔ **BUT THE RABBIT PERSISTS.** Erik: *"I'm always hoping I run back into that rabbit at some point."* ⚠️ **Folding the FACT must not delete the CREATURE** — it wants a registry entry, not a codex topic, and then it can recur |
| ✅ **`dav-cutter`** | **STAYS.** ⚠️ Met once, no links, and he will grow the moment he is seen again. ⛑ **He may drop off the registry through long absence** — ⚑ **but being on the list is itself a reason to reappear**, which is `SPEC_npc_presence_cadence` doing exactly its job |

---

## §5 — ⬜ FOR CCODE

1. ⛔ **The arc generator needs a real prompt**, not `stubEntity`'s defaults. ⚑ **`buildGeneratePrompt`
   already exists for places and gives the model the region list** — ⚠️ **an arc wants the same treatment
   with `hingeNpcs` REQUIRED and rejected when empty.**
2. ⚠️ **Who mints the people?** ⛔ **A mystery needs someone doing it, and that is an npc generation nested
   inside an arc generation.** ⬜ **Does `generateRequest` support that, or does the arc emit its own?**
3. ⬜ **What happens to `the-person-with-a-list` on Erik's live save?** ⚑ **It is a good hook with nothing
   behind it** — ⚠️ **it wants an arc generated FOR it, retroactively, rather than deletion.**
4. ⚑ **A creature that should recur wants a home.** ⬜ The rabbit is not an NPC and not a topic —
   ⚠️ **`npcRegistry` is the only thing that recurs, and a rabbit in it is odd but not wrong.** ⛔ Erik's
   call whether that is the shape.
