# RULING — R35 CORRECTED: `killCost` is the insta-kill marker, not `harmRung`

**Ruled by:** Erik · **2026-09-04** · **Recorded by:** Aevi
**Answers:** Q15 · ⛔ **corrects R35, which Aevi wrote and CCode built exactly as written**
**subject:** lethal-harm
**bodyAnchor:** "BEING ABLE TO KILL IS NOT AN INSTA-KILL"

---

## ⛔ THE ERROR, AND IT IS AEVI'S

> Erik: *"Don't confuse INSTA-KILL with BEING ABLE TO KILL. Hunter's Strike is not an insta-kill."*

**R35 attached the death save to `harmRung: lethal`.** ⚠️ **But that rung has only ever meant *this craft
can kill you* — and it ALREADY HAS A GATE.** `intent.js:30` asks the player to confirm before a lethal
cast; `gm.js`: *"the engine already gates a declared lethal-craft cast."*

➡️ ⛔ **SO R35 TURNED 53 CRAFTS INTO INSTA-KILL CRAFTS BY REDEFINING A RUNG THAT ALREADY MEANT SOMETHING
ELSE.** ✅ CCode built precisely what was written and reported the consequence: *"a rank-1 sling now offers
the same insta-kill."*

---

## R43a — ⛔ THE DISCRIMINATOR IS *KILLS WITHOUT DAMAGE* ✅ RULED

| craft | kills by | insta-kill? |
|---|---|---|
| `hunters_strike` | ⚑ **wounding you.** 1d6, and you bleed out | ⛔ **NO — and it is correct as authored** |
| `the_cut_thread` | ⚑ **STOPPING you.** *"No wound, no struggle, no argument."* Bypasses health entirely | ✅ **YES** |

⚠️ **AEVI PROPOSED DEMOTING `hunters_strike` TO `incapacitating`. WITHDRAWN.** ⛔ **That would make a
hunter's killing blow UNABLE TO KILL, which is worse than the bug.** ✅ **A hunting strike can absolutely
kill you. That is what the rung says and it was always right.**

---

## R43b — ⚑ `killCost` IS THE MARKER. NO NEW FIELD. ✅ RULED

> **The death save fires where a `killCost` is authored.**

✅ **CCode already measured it: of 53 lethal crafts, exactly ONE carries a `killCost`.**

| a craft with | means |
|---|---|
| `lethal` + **no** `killCost` | ⚑ **it can kill you the ordinary way, through damage.** Gated by `intent.js` as it already is |
| `lethal` + **a `killCost`** | ⛔ **it can STOP you outright, and the killCost is what that costs** |

➡️ ⚑ **The population is ONE craft, not 53** — and **any future insta-kill is OPTED INTO by authoring a
price.** ⚠️ **A craft cannot become an insta-kill by accident.**

⬜ **AND `deathSave.defaultKillCost` SHOULD NOT EXIST.** ⛔ **A default price would re-create exactly the
defect this ruling closes** — 52 crafts silently acquiring an insta-kill.

---

## R43c — the Cut Thread costs DOUBLE, not everything ✅ RULED

> Erik: *"I'm rethinking it — it should just be DOUBLE COST if it lands, not your whole pool. It doesn't
> make sense for a high level PC to use it and have it drain their whole pool."*

⚠️ **THE SCALING ARGUMENT IS THE PROOF: whole-pool is a FIXED penalty against a GROWING pool** — crippling
at L20, trivial at L100. ✅ **`energyMultiplier: 2` — 28 energy, a real bite at every level.**

⛔ **AND *"unable to use any craft until a full night's rest"* WAS NEVER IN THE CRAFT'S FICTION — only in
its bound.** ✅ **Paid only when the save fails and the thing stops; a held save costs the standard 14.**

✅ **DONE IN CONTENT** — `reach_death_life.json`, bound replaced, `intensity` re-worded.

---

## R43d — `slow_cup` is ONGOING DAMAGE, not a landed kill ✅ RULED

> Erik: *"slow_cup is more of a narrative skill and is questionable. I could see it being a DAMAGE EVERY
> ROUND skill."*

⛔ **AND ITS OWN BOUNDS ALREADY SAID SO:** *"⛔ SLOW BY DESIGN. **NOTHING HERE KILLS IN THE ROOM**, and speed
cannot be bought"* · *"a decay-ward or a good physician answers it."*

⚠️ **R35 fires on a LANDED HIT, and this craft's entire design is that the landing is not the killing.**
✅ `harmRung` → `incapacitating`; **2d6 on landing, then 1d6 corrosive per round until TREATED.**
⚑ **The lethality lives in the ongoing condition, and it is answerable by treatment — which is the craft.**

✅ **DONE IN CONTENT** — `reach_dark_light.json`.

⬜ **`stopped_breath` is the sibling case** — *"unattended, they die"* — ⚠️ **and Aevi has NOT touched it.
Same shape, and it wants Erik's eye before it moves.**

---

## ⬜ FOR CCODE

1. ⛔ **Re-gate the death save on `killCost` presence, not `harmRung`.** ⚠️ **One line, and it drops the
   population from 53 to 1.**
2. **`killCost: {energyMultiplier: 2}`** is a new shape — ⬜ the previous was `{energy: "all",
   sealedUntilRest: true}`.
3. ⛔ **Do NOT author `deathSave.defaultKillCost`** — R43b.
4. ⚠️ **The ⚡ Finish-it overlap resolves itself:** with the save on `killCost`, `lethal` alone keeps
   Finish-it and there are no longer two ends on one rung.
5. ⬜ **`mechanic.ongoing`** on `slow_cup` — `{perRound, damageType, endsOn: "treated"}`. **Does a reader
   exist, or is this a new one?**
6. ⚠️ **`notForClasses` for the save** is now nearly moot — ⛔ **one craft, and its `notFor` already reads
   *"what has no thread: a machine, a figure, a Precursor working."***
