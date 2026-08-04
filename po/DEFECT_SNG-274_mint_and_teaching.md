# DEFECT — SNG-274: why Silas has minted nothing, and why Veth won't teach
## Aevi (PO) · 2026-08-03 · both root-caused. Both are CONTENT, both are mine.

# PART 1 — SILAS HAS RAISED MULTIPLE CREATURES AND MINTED NOTHING
## THERE ARE THREE WAYS TO GAIN A CRAFT. HIS PATH MATCHES NONE OF THEM.
**1. `newAbility` (GM-emitted).** The prompt bar is explicit: *"explicit training with a master, a quest's
reward, a hard-won unlock the story actually did the work for."* And the only HARD directive that forces it is
**"A CRAFT HAS BEEN TAUGHT TO COMPLETION."**
⚠️ **Every route on that list is TAUGHT OR GIVEN. None of them is DID IT REPEATEDLY.** Silas inventing
necromancy by practising it is *exactly* the case the bar excludes.
**2. EMERGENCE (practice ripens power).** This is the right path for him — and here is the finding:
### ⚠️ THERE ARE THREE EMERGENCE RECIPES IN THE ENTIRE GAME.
```
resonant_sight  = prism_sight + sonic_resonance   (ripenAt 6)
wardens_chord   = sonic_resonance + resonant_anchor (ripenAt 7)
true_ward       = prism_sight + prism_ward        (ripenAt 6)
```
**All three are radiant/harmonic. Zero necromantic. Zero for 25 of 27 traditions.** The engine dutifully checks
`practice.uses` against a table with three rows in it. **Silas can raise a hundred creatures and ripen
nothing** — there is nothing authored for his practice to ripen INTO.
**3. `unlockSubstrate` / `unlockPrecursor`** — gated on fiction events (a remnant answering, a Heartroot rite),
not on repetition.
## THE HOLD-UP, STATED PLAINLY
**It is not a bug. It is 3 recipes where there should be ~80.** The emergence system is built, wired, and
starved — the same shape as the tier ladder before the re-tier: *a correct mechanism with almost nothing to act
on.* **And it is my authoring gap, not CCode's.**
## WHAT SILAS SHOULD BE RIPENING INTO
The catalog already has the components. **12 crafts carry `summon`**, and ashwarden owns `ask_the_dead`
alongside `palework`, `the_grey_hand`, `draw_down`, `the_kept_breath`. Necromantic emergences write themselves:
- **`ask_the_dead` + `the_grey_hand`** → *a hand that holds what is already gone* — the raised guardian.
- **`palework` + `the_kept_breath`** → *a body kept past its hour* — not raised: **prevented from finishing.**
  ⚠️ **And that is the ashwarden version, which is the right one:** their whole tradition is *"never raises,
  never forces a death that was not coming."* **A necromancy that obeys `palework`'s own bound is far better
  than a generic raise-dead.**
- **`ask_the_dead` + `draw_down`** → *the drawn-down thing that answers* — with `draw_down` r3's authored line
  already waiting: *"what is left is not dead, exactly. It is FINISHED."*
**RECOMMENDATION: an emergence pass, ~3 per tradition, built from components each tradition already owns.**
Same method as the craft catalog — read what the crafts are, and name what two of them make together.

---
# PART 2 — VETH HANGS AROUND AND ANSWERS VAGUELY
## THE MACHINERY IS ALL THERE — MORE THAN I EXPECTED
`gm.js` carries **five** teaching mechanisms: rule 19C (mark a mentor bond) · 19D (`offerPromotion`) · 19E
(`offerAcquisition`) · a **`## A TEACHER TAKES THE INITIATIVE`** hard directive that *explicitly* says
**"do NOT wait to be asked and do NOT judge 'when the moment fits' yourself"** · and a `teacherDetail` block
listing *"what each teacher present can teach and the next step THEY would choose."*
**Someone already anticipated this exact complaint and built against it.**
## SO WHY IS SHE VAGUE? THREE CANDIDATES, IN ORDER OF LIKELIHOOD
1. **⚠️ SHE IS PROBABLY NOT MARKED AS A TEACHER.** Rule 19C is explicit that a teaching relationship exists
   only if `bondType: "mentor"` or `markTeacher` was **recorded** — and warns exactly what happens otherwise:
   *"A described teaching with no recorded bond leaves the student with no teacher and the capstones shut."*
   **If Veth was never marked, `teacherDetail` is empty for her, the initiative directive never fires about
   her, and the GM has nothing concrete to offer — so it improvises something vague.** That is the observed
   behaviour precisely.
   **CHECK FIRST:** does Veth's NPC record carry `bondType: "mentor"`? If not, this is the whole answer.
2. **She may have nothing teachable.** `teacherDetail` lists what a teacher can teach *from their tradition*.
   If Veth's tradition isn't set, or the player already knows her reachable crafts, the block is empty even
   when the bond exists.
3. **The initiative directive is gated on the engine judging the beat has room.** If that gate rarely opens,
   the fallback branch says *"absent that, do not push an offer this beat"* — **i.e. the GM is instructed to
   stay quiet.** Erik's *"every time I try to get her to teach me"* suggests the player is initiating, which
   should bypass this entirely — **a direct request should always be answerable.**
## WHAT I'D FIX REGARDLESS OF WHICH IT IS
- **⚠️ A DIRECT ASK MUST NEVER GET A VAGUE ANSWER.** When the player explicitly asks an NPC to teach them,
  the engine should surface **that NPC's teachable list** — or, if there is none, say so **concretely**:
  *"she does not teach what you are asking for"* / *"you are not ready — she wants X first."* **A vague
  deflection is the one answer that tells the player nothing and cannot be acted on.**
- **THE TIES TAB SHOULD SHOW IT** (character-sheet overhaul): *who travels with you · what they can teach ·
  what they want before they will.* **A teacher whose curriculum is invisible is indistinguishable from a
  teacher who has none.**
- **AND IT TIES TO THE ACCESS TIGHTENING** (SNG-273): if access is about to depend on teachers, **a teacher who
  cannot be pinned down becomes a blocked character.** Fix the teaching surface *before* tightening the gate.
