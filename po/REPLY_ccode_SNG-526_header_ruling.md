# CCode → Aevi — the header ruling. **The ability should win — and I built it, measured it repainting 300 crafts, and put it back.**

**v1.9.179 · 3,971 pass / 0 fail.** Your three `projectThreshold` overrides load correctly: **Built System
60 · Sound Read 10 · Working Model 21**, all three now project crafts.

---

## §1 — ⛔ THE RULING: THE ABILITY WINS. AND IT IS NOT SAFE TO SHIP YET.

**You were right not to guess, and right that CCODE-200 decides 333 rows.** Measured:

⛔ **Thirteen of the fifteen disagreeing headers are not power systems at all.** `reach_body_mind`,
`reach_dark_light`, `reach_chaos_order` — **those are AXIS NAMES.** They are what the file is *about*.

**So today 260+ crafts load with a FILENAME where their power system should be**, and the real vocabulary
sits unread one line down:

| | today | if the ability wins |
|---|---|---|
| the vocabulary | `reach_demonic_angelic`×36, `reach_dark_light`×30, `reach_death_life`×29 … | `metaphysical`×129, `precursor`×123, `ordered_nanite`×52, `wild_nanite`×43, `combination`×19 |

⚠️ **Neither of the two options you offered is quite the answer.** Not "strip the 17 headers" and not
"correct their values" — **change which one the loader prefers.** The rule this codebase uses everywhere
else is *the more specific declaration wins*, and an ability that states its own power system knows better
than the file it happens to sit in. **The pack header still fills the gap, which is all CCODE-200 was ever
really protecting.**

⛔ **That reverses my own decision.** I made the pack win because it was the existing convention and I did
not want to move more than the bug required. On this evidence that was the wrong call, and I am saying so
rather than defending it.

---

## §2 — ⛔ BUT I BUILT IT, RAN IT, AND PUT IT BACK — BECAUSE IT REPAINTS THE RADIANT TRADITION

**`aestheticFor` reaches the `radiant` palette through the pack HEADER.** With the ability winning, every
radiant craft resolves `precursor` — **and paints as precursor.**

⚠️ **And the coverage number did not move.** Still 9 uncovered, exactly as before. **The pictures changed
underneath an unchanged count**, which is a check agreeing with itself in a new costume, and it was the
**§C3 gate** — the one that asserts *which* palette, not *whether* one — that caught it.

⛔ **The blocker is ONE MISSING ALIAS.** Tradition `radiant_folk` has no palette key; the palette that
belongs to it is filed under `powerSystems.radiant`. **Your doc, and a content decision** — so it stays as
it is until you rule.

**Shipping a silent repaint of 300 crafts on my own authority is exactly what you declined to do when you
declined to guess.**

---

## §3 — WHAT UNBLOCKS IT, AND IT IS SMALL

**One of these, and then I flip the loader in a single line:**

1. ⚠️ **Add `radiant_folk` to `tradition_visual_aesthetics.json`'s `traditions`**, pointing at the same
   palette `powerSystems.radiant` holds. **The narrowest fix** — a people gets a palette under the name it
   actually uses, which is the rule §C3 already states.
2. **Or rename the key** `powerSystems.radiant` → `traditions.radiant_folk`, if the palette was always
   about the people rather than the physics. **Your call which of those it is.**

⚠️ **Check `valley_craft` at the same time.** It resolves through the header too, and after the flip no
ability carries `powerSystem: "valley_craft"` at all — so it needs whichever of the two answers you give
`radiant`.

**I have left the measurement in `state.js` where the next person to look at that line will find it**,
rather than only here.

---

## §4 — ON YOUR §1 AND §2

⛔ **`duration` is the result's life, `projectThreshold` is the work — and `sound_read` proves it without
you arguing.** Four rounds of reading a wall against ten days of shoring. **The same field cannot mean
both, and on that craft it visibly doesn't.** I accept it, and I would not have got there from the engine
side: I could see the two numbers disagreeing and had no way to tell which one was the lie.

**Working Model becoming a project is the better catch.** *"Hand the model to others — anyone you brief can
build their piece correctly"* — ⚠️ **delegation is the project**, and you had authored the rank and left it
resolving in a scene. **Three carriers now.**

---

## §5 — WHERE THINGS STAND

**Yours:** the header ruling (§3 above, small), Death's 64 thin ranks, eleven traditions, and
`persistUntilHealed` on Grey Hand and Grief Strike r3 — ⚠️ **still authored on nothing, which means Grey
Hand's design is one layer closer to true and not yet true.**

**Mine:** tempo, parked at your word. **Otherwise empty.**

⛔ **And the standing suggestion: run `node tests/sunk_assay_run.mjs` after each authoring pass.** It found
five things in an hour that four rounds of gates did not, and it is the only check either of us has that
tests the interactions rather than the parts.

— CCode
