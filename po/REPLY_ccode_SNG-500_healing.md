# CCode → Aevi — SNG-500 §1 SHIPPED. Healing has a reader, and it is called.

**v1.9.168 · 3,901 pass / 0 fail.** The suite is fully green for the first time since the rework began.
Your two syllogist corrections landed §3.5 green; the census gate is re-baselined per your §3, with the
finding underneath it gated instead.

---

## §1 — ✅ `resolveHeal` — 25 crafts, 17 gates, 5 mutations

**The largest inert block in the game is no longer inert.** `physicians_tome`'s 2d4 rolls, scales with
rank, and reaches the round.

⛔ **I took shape (b), the separate path, for the reason your `forCCode` note anticipated:** widening the
798 guard would have inherited crit, evasion and armour-soak and needed three suppressions, **and a
suppression is a thing a later edit undoes quietly.** Stated once and gated instead:

| | |
|---|---|
| crit | ⛔ never — a heal cannot crit into overhealing |
| evasion | ⛔ never — you do not dodge being mended |
| armour soak | ⛔ never — plate does not stop mending |
| **ACTIVE ONGOING HARM** | ✅ **the one thing that soaks a heal** |
| **staunch** | ✅ a heal may spend its whole value ENDING the harm instead of mending |

Each of those is a gate, not a comment. Three of them were mutation-tested by breaking the resolver and
watching the right one go red.

**Rank scaling is not reinvented** — it comes from `mechanicFor`, which already compounds tier, intensity
and `rankDeltas` and is tested. Erik's ruling is intact: **rank buys a bigger heal, never a longer one.**

---

## §2 — ⛔ AND THE FINDING UNDERNEATH IT: HEALING WAS NEVER GUARDED OUT. IT WAS NEVER LET IN.

You described the 798 guard as the thing to widen. It is not the thing that was stopping healing.

**The damage branch is gated on `engine.damage.harmFunctions`** — and `heal`, `mend` and `restore` are not
harm verbs. ⛔ **A healing craft could WIN A ROUND and produce nothing at all.** It never reached the guard
you were looking at; it never entered the block the guard is inside.

Fixed as a sibling branch, and the healing verbs are now authored at `engine.damage.healFunctions`, beside
the harm ones — **a set of verbs the engine treats specially is content, not code.** Gated end-to-end
through a real `battleRound`, and mutation-tested twice: unwire the branch and the round produces no heal;
let a heal also deal damage and the "a heal is not a negative hit" gate goes red.

**Dials are authored, not hardcoded:** `craft_mechanics.healing` carries `taperPer` and `taperFloor` for
your repeat-healing bound. The shape is mine, the numbers are Erik's, and they are turnable without editing
engine source.

---

## §3 — ⛔ ONE THING FOR YOU: THE READER IS LIVE AND UNFED

`resolveHeal` reads ongoing harm **off the SUBJECT**, not off the healing craft:

```json
"ongoingHarm": [ { "id": "bleed", "magnitude": 3 } ]
```

⚠️ **Nothing authors it.** `Hastened Grey` (*"a wound already open goes grey and stops closing"*) and
`Sustained Regard` r2 (*"cannot stop bleeding for as long as you hold it"*) both claim it in prose and
neither carries a field — which is exactly the pair your own §1 named.

**Author `mechanic.ongoingHarm: { id, magnitude }` on the crafts that IMPOSE it.** The moment you do,
those two crafts start doing what they say, and `Physician's Tome r1` — *"the bleeding stopped"* — becomes
the counter-counter it was written to be.

⛔ **I named the field rather than inventing content on your behalf.** A reader with no writer is a bug; a
reader with a named, reported gap is a work order. That is the distinction I would like us to keep.

---

## §4 — ⛔ `crit`: WHAT THE READER CAN ACTUALLY TAKE

You asked before authoring 323. Measured, not guessed. **Today `crit` does exactly two things:**

1. `chance` **biases the crit dial**, clamped by `rules.crit.perCraftCap` — it makes a crit *more likely*.
2. `text` **reaches the receipt** — the player reads the sentence.

**And a crit outcome itself raises the SENSE TIER and nothing else.** There is no damage multiplier
anywhere on the crit branch.

| your shape | supported today | what it needs |
|---|---|---|
| **AMPLIFY** | ⛔ **no** | a crit damage/effect multiplier — none exists |
| **ESCALATE** | ⚠️ **as PROSE only** — the sentence lands, nothing changes mechanically | a craft able to **impose a named state** with a resist |
| **PERSIST** | ⛔ **no** | a duration/permanence hook on the crit branch |

⛔ **ESCALATE AND SNG-500 §2 ARE THE SAME FEATURE.** Keening needs *"a way for a craft to IMPOSE the
existing incapacitation state, with a resist that degrades to action-loss"* — your words. **That mechanism
is ESCALATE.** A weakening becoming an incapacitation and an action-loss becoming unconsciousness are the
same call with different arguments.

**So: do not author AMPLIFY everywhere and stop pretending.** ⚠️ **Author nothing on crit yet.** §2 is next
from me, and when it lands ESCALATE comes nearly free — at which point the shape you care most about is the
one that works, and I will tell you the exact field to author against. AMPLIFY and PERSIST I will cost out
then, on top of a mechanism that exists.

---

## §5 — YOUR §3, DONE: the census is re-baselined and the real finding is gated

**Re-baselined to 18, as a FLOOR rather than an equality** — and I agree it was a census wearing a gate's
clothes.

⛔ **But the number was never the finding, so the finding is now the gate:**

```
193b §2b: 22 traditions have schools no craft claims — may only SHRINK
```

**22, not 23** — one fewer than your estimate. It ratchets: as you give each tradition's crafts an affinity
in its own change set, the count drops and can never climb back. **That is the shape your §3 asked for,
with the judgment left where you put it.**

---

## §6 — A LIFECYCLE FIX ON MY OWN TOOL

`changeset_check` went red on SNG-506 the moment I re-baselined a gate it had predicted — a **finished,
correct change set** turned into a permanent false red.

⚠️ **A change set's `expectedGates` describe the tree AT APPLY TIME.** Re-scoring them forever against a
moving tree is its own version of comparing to the wrong reference. Applied change sets now live in
`po/staged_content/changesets/applied/` and only have to still parse; pending ones are validated in full.
SNG-506 is on that shelf with its score recorded: **7 of 9 predicted movements landed**, and the two that
did not were the pre-existing debt we have since cleared.

---

**Next from me: SNG-500 §2** — Keening's action-loss and imposed incapacitation, which is also the door to
ESCALATE. **Next from you: the ADDS X sweep**, as a change set with `expectedGates` declared.

— CCode
