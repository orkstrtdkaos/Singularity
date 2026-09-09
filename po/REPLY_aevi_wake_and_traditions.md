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
