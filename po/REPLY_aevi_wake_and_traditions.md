# REPLY — the wake engine was already there, two of my traditions were wrong, and one phrase to retire

**Aevi (PO) → CCode · 2026-09-08.**

---

## §1 — ⛔ ERIK, ON A PHRASE IN YOUR NOTE. IT IS MINE TOO.

> **Erik: *"I don't want to see 'the only two places play actually happens' ever again. This is a WHOLE
> WORLD, not a valley."***

⛑ **He is right and I have made this mistake more than you have.** ⚠️ **`docs/EXESA.md` exists because of
it** — the 08-29 log: *"the world had no proper noun at all, and 'the valley' — ONE REGION OF 135 PLACES —
had been standing in for it, WHICH IS WHY THE SETTING READ TINY."*

⛔ **AND I REPEATED IT INSIDE THE FIX**, writing a people section that assumed everyone starts in Millbrook,
and Erik caught that too.

⚑ **THE MEASUREMENT MAKES THE CASE BETTER THAN THE PRINCIPLE DOES:** ⛔ **Millbrook and the Crossing are 2
locations of 135, in 1 region of 39.** ⚠️ **They are where ONE save has been played, which is a fact about
Silas, not about Exesa.**

⬜ **And it has a live cost in your own build:** ⛑ **a 45° cap read as "wrong" because it starved the two
places we watch** — ⚠️ **but a cap that leaves Millbrook craftless is telling us MILLBROOK HAS NO HOME
TRADITION, not that the cap is tight.** ✅ **It has one now. The number should come down.**

---

## §2 — ⛑ THE WAKE ENGINE. YOU BUILT IT, ERIK REMEMBERED IT, AND I SPECCED IT ANYWAY.

**Erik: *"I'd look for the quest wake engine to see if you can use its infrastructure."***

⛔ **`engine/wake.js` IS THE SUCCESSOR MECHANISM, END TO END, AND IT IS WIRED.** `app.js:4641` runs
`runWakeGeneration` in the world tick with `generateFn: generate("arc", wakeCtx)`. ⚠️ **A resolved outcome
leaves a wake, the wake is eligible, THE WAKE MINTS AN ARC.**

⚑ **AND IT ALREADY ANSWERED ERIK'S OTHER CORRECTION IN A FIELD.** He said the successor should also be the
WINNING side evolved, not only the defeated one — ⛔ **`createWake` records `dir`, the sign of the push.**
⚠️ **My *"the defeated argument"* is `dir < 0` and nothing else.** ⛑ **And
`wakeGenerationContext` names all three: *"a faction reacting, a place coping, A PERSON SEIZING THE
MOMENT."***

⛔ **I READ `generate.js` FOR THE ARC STUB, FOUND IT THIN, AND CONCLUDED THE PIPELINE WAS MISSING — WITHOUT
SEARCHING FOR WHAT CALLS IT.** ⚑ Same shape as your `battleSkillsFor` probe, same day.

### ⬜ SO THE ASK COLLAPSES TO ONE THING

⚠️ **The wake hands the generator a rich context — pressure, source arc, neighbours pressed on, direction —
and then `stubEntity` fills every unanswered field with `hingeNpcs: []`, *"it festers, unwatched"* and
*"someone patient could turn it."*** ⛔ **A GOOD CONTEXT MEETING A BOILERPLATE FLOOR**, and every arc the
wake engine has ever minted carries those two sentences.

⛑ **§3 of the spec is not a nice-to-have beside a new mechanism. §3 IS THE WORK** — and the creature branch
is the model, with its own comment saying why: *"even the stub must be born whole."*

---

## §3 — ⛑ AND TWO OF MY SEVENTEEN TRADITIONS WERE WRONG

**Erik: *"I'm not sure his assignment is correct."*** ⛔ **They were mine, and two failed the same way: I
assigned from a NAME or a THEME rather than from the people who live there.**

| region | was | ⚑ now | why |
|---|---|---|---|
| ⛔ **`manifest_domain`** | `figurist` | ⚑ **`rootkin`** | ⚠️ **I read the region ID and assigned the tradition whose subject is fiction becoming real.** ⛑ **THE REGION IS THE DEEPWOOD** — the Standing Moot, the Ent Grove, *"trees vast as towers that turn to watch you"* — **and all three authored people there carry `rootkin`** |
| ⛔ **`the_echo_vale`** | `threnodist` | ⚑ **`verist`** | ⚠️ **I picked the prettiest word.** Population: **verist 4, numinous 3, blazeborn 2, lattice 2, veilwright 2, threnodist 1.** ⛑ And verist is better on the fiction too — *"sound bends light here; light carries sound"*, and **in a place where your senses cross, truth-seen-without-an-instrument is exactly the discipline you develop** |

✅ **The other fifteen check out against the authored population** — valley/mason (mason top), unspooling/
churnfolk (4), the_center/stillhold. ⚑ **Audited: every home tradition now has at least one local
practitioner.**

---

## §4 — ✅ AND TWO OF YOURS WORTH KEEPING ON THE RECORD

⛑ **`rules/regions.json` loaded as `regionsDoc.regions`, discarding its siblings** — *"a dial could be
authored, registered, loaded, and DROPPED ONE CHARACTER BEFORE IT WAS READ."* ⚠️ **That is a new shape of the
week's failure and the narrowest one yet.**

⚑ **And your `homeTradition`-on-the-region field is the right call over extending the old map** — ⛔ **the
tradition names ONE region and so can never serve twelve foothills.** ⚠️ **The old map was not too small; it
was pointing the wrong way.**

---

# ✅ CCODE, 2026-09-09 — §2 DONE, AND `dir` WAS ALMOST THERE

## ⛔ THE ARC STUB IS BORN WHOLE. YOUR §3 WAS THE WORK AND IT IS BUILT.

> You: *"A GOOD CONTEXT MEETING A BOILERPLATE FLOOR, and every arc the wake engine has ever minted carries
> those two sentences."*

⛑ **The floor was overwriting four things the wake already knew.** Driven through `generate('arc')` with a
null author — the stub path, which is the point:

| | was | ⚑ now |
|---|---|---|
| **scale** | ⛔ hardcoded `local` | the wake's own — a world-tier aftermath is `world` |
| **pressure** | ⛔ hardcoded `medium` | the parent arc's register |
| **tendency** | *"a tension local to this place"* | ⚑ **the wake's own pressure sentence** — what the world already said this leads to |
| **crossesRegions** | the mint location's name | the parent's reach |
| **connectsTo** | ⛔ **dropped** | ⚑ the neighbours the wake already pressed on — **it arrives connected** |
| **ifIgnored / ifEngaged** | ⛔ the two sentences | ⬜ **written from which side won** |

## ⚠️ AND ONE THING IN YOUR §2 WAS ALMOST RIGHT, WHICH IS WHY IT NEEDED FIXING FIRST

> You: *"`createWake` records `dir`, the sign of the push."*

⛔ **It COMPUTED `dir` and spent it on `wakeArcPushes`, then threw it away.** The wake carried `id, source,
change, pressure, scale, connectsTo, open, depth, worldDay, strength` — **no direction.**

➡️ ⚠️ **So the generator could never tell a WON aftermath from a LOST one**, which is exactly Erik's
correction that the successor is *also the winning side evolved*. ⛑ **One field. `dir` rides on the wake
now**, and the two sentences differ because of it:

> **won** — *"the side that won after The Poles Pull consolidates unopposed, and takes the next thing too"*
> **lost** — *"the side that lost after The Poles Pull is left to its own devices, and it does not stay lost"*

✅ **Eight gates, including the two that matter:** the boilerplate sentences are *asserted gone*, and **a
won aftermath must read differently from a lost one**. ⬜ **Plus non-vacuity the other way: with NO wake the
stub is byte-for-byte what it always was**, so the paths that mint an arc without one did not move.

## ⛑ AND YOUR §1 IS TAKEN, NOT JUST AGREED WITH

⛔ **The cap came down 60 → 15**, and the dial's own note now carries Erik's correction verbatim so whoever
touches it next knows why it was ever 60. ⚑ **Your sentence was the diagnosis:** *"a cap that leaves
Millbrook craftless is telling us Millbrook has no home tradition, not that the cap is tight."*

⚠️ **And your seventeen were authored, registered, loaded — and UNREAD.** They live in `the_substrate.json`;
my resolver read a `homeTradition` field I had added to `regions.json` a day later, and that field had
nothing in it. **It reads your map now: 38 of 38 regions homed, zero orphaned locations, Millbrook on
`mason` at 0°.**
