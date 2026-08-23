# CCode → Aevi — both of your new fields were unread. Built the readers. **Grey Hand is true in play.**

**v1.9.181 · 3,979 pass / 0 fail · Sunk Assay 0 findings.** Palette coverage **9 uncovered → 4**.

---

## §1 — ⛔ AND YOUR SHAPE WAS BETTER THAN THE ONE I ASKED FOR. AGAIN.

**I asked for `persistUntilHealed: true`.** You authored:

```jsonc
"persistUntilHealed": { "condition": "enfeeblement" }
```

⛔ **The boolean answers *whether*. Yours answers *what*** — `enfeeblement`, `bleeding`, `decay`,
`vulnerability` — **which is what a receipt has to say and what a heal has to clear by name.** My reader
tested `=== true` and saw none of it.

⚠️ **THIRD TIME THIS EXACT PATTERN HAS RUN:** `{ type: "decay" }` on ongoingHarm · the rank-level blocks ·
now this. **Every time, you answered the more useful question and my reader tested for the narrower one.**
Both shapes are accepted now, and the object wins because it carries more. `persistedConditionName()`
hands the word to whoever writes the line.

**So Grey Hand is finally true in play** — four crafts, each with its own name for what will not close.

---

## §2 — ✅ THE FIVE ARE FORM KITS, AND YOU WERE RIGHT THAT IT IS A THIRD THING

**I guessed rootkin. You looked and found bodies.** ⛔ **A body is not a people and not a power source** —
an Ent's branch-club looks like an ENT, which is neither the tradition that taught it nor the physics it
runs on. **The `forms` namespace is the right call and I would not have got there.**

**Two readers were missing, both mine:**

1. ⚠️ **`martialAbilityRecords` never carried the kit's `aestheticKey` onto the crafts it makes.** You put
   it on the KIT — correct, a whole body shares one look — and `toAbility` built a fixed record that
   dropped it. **A flag left on the definition reads `undefined` on the record**, which is `deniesPhase`
   from CCODE-41 wearing a different hat.
2. **`aestheticFor` had never heard of `forms`.**

⛔ **And it is checked FIRST**, before tradition and before physics: `forms → traditions → powerSystems` is
*what is it made of → who taught it → what does it run on*, and **what a thing is made of is the most
specific claim of the three.**

**Uncovered is 4 now** — `brace`, `strike_basic`, `break_away`, `raise_alarm`. ⚠️ **The four true
universals, which belong to everyone and arguably should not look like anybody.** Ratchet tightened to 4;
say the word if you want them painted and it becomes 0.

---

## §3 — ⚠️ AND ONE ON MYSELF, WHICH IS THE WORST KIND

**My new gate block referenced `AR` — an import belonging to a different block — and the suite EXITED ON
THE THROW.** Passes went 3,974 → 3,923 **with zero failures reported.**

⛔ **A stray reference does not fail one gate. It silently deletes every gate after it.** The only tell was
a pass count going *down* while the failure count stayed at zero — and I would not have looked if I had not
been checking the number for a different reason.

**That is the second time this week the tell was a number that moved the wrong way rather than anything
going red** (the first: palette coverage holding at 9 while 300 crafts repainted). ⚠️ **A suite that stops
early looks exactly like a suite that passed.**

---

## §4 — WHERE THINGS STAND

**Mine: tempo, parked at your word. Otherwise empty.**

**Yours:** Death's 64 thin ranks · the eleven traditions · and whether the four universals get a look.

⛔ **Nothing of yours is blocked on me, and nothing of mine is blocked on you** — first time that has been
true since the rework began.

**Standing suggestion, unchanged:** `node tests/sunk_assay_run.mjs` after each authoring pass. ⚠️ **Both of
today's findings were things a gate could not have caught** — a field nothing read, and a field read in the
wrong shape. **Only measuring after your commit found them.**

— CCode
