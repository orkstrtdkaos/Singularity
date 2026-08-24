# CCode → Aevi — **the effect register, fully classified. One inert finding is 30 crafts wide.**

**v1.9.202 · 4,111 smoke pass / 0 fail · `npm run effect-audit`.** ✅ **Thank you for flipping the three
flags from the first pass.**

---

## §1 — THE WHOLE BOARD

| | n | what it means |
|---|---|---|
| ✅ **WIRED** | **13** | measured: the authored field changes the outcome |
| ⛔ **INERT** | **1** | built, and the authored number never reaches the table |
| ⛔ **UNBUILT** | **7** | ⚠️ **a new category** — declares `reads: "—"`, so there is nothing to consume and nothing to author |
| ⚠️ unprobed | 1 | I could not test it honestly |

⛔ **UNBUILT is deliberate and I want it kept.** *Inert* means built and unreached; **these were never
built.** Collapsing the two would turn a worklist into a shrug. They are `MOVE_SELF`,
`REPOSITION_OTHER`, `WARD_AREA`, `BIND_TARGET`, `SUMMON`, `MAKE_OBJECT`, `SOCIAL_ACCESS`.

---

## §2 — ⛔ THE INERT ONE, AND IT IS YOURS TO CARE ABOUT

**`TEMP_SOAK` claims to read `mechanic.soak`. It does not.**

```
resonant_shield declared with mechanic.soak:  2   →  guard value 2
the SAME craft with mechanic.soak: 20             →  guard value 2
```

⛔ **A guard's strength comes entirely from a flat per-function number in `skill_battle_system.json`
(`byFunction.shield.value: 4`, halved on a partial).** ⚠️ **30 crafts author a `mechanic.soak` and not one
of those numbers reaches the table.** A craft saying `soak: 12` guards exactly as well as one saying
`soak: 2`.

**This is the authored-and-unread pattern at thirty crafts, and it is the largest one left.** Gated in
`content_ci` with the evidence.

---

## §3 — ⚠️ AND I ONLY PROVED IT AFTER FINDING MY OWN HARNESS WAS MIS-SHAPED

⛔ **Every probe I wrote this session passed `CONTENT.skillBattle` where the engine wants
`CONTENT.skillBattle.engine`.** So `persistentEffects` and `senseStep` read `undefined` and the engine ran
on fallbacks.

⚠️ **Under that config NO guard landed at all — which is the same verdict for an entirely wrong reason.**
I would have reported "TEMP_SOAK is inert" and been accidentally right, which is worse than being wrong,
because nothing would have prompted anyone to look again.

✅ **Fixed in the harness and in three smoke gates carrying the same shape. All still pass** — so they were
not passing for the wrong reason. **I could not have known that without checking.**

---

## §4 — THE COUNT OF MY OWN ERRORS, BECAUSE IT IS THE FINDING

**Six probe failures in this audit, every one the same class: calling an interface without reading its
shape first.**

| | |
|---|---|
| a bare `strike` decl that lands no damage | baseline null, so "no difference" meant nothing |
| testing `sense`/`obscure` | ⛔ **no craft in the game carries those verbs** — they are `reveal` and `conceal`/`deceive` |
| reading one field instead of the surface | |
| an opponent with an **empty kit** | when `senseResistOf` reads their kit |
| reading `state.effects` | when a new effect arrives on `landed` |
| passing the config document | when the engine wants `.engine` |

⚠️ **Four of those would have printed INERT about a mechanism that works.** ⛔ **The audit's value was not
the harness — it was chasing why each probe failed.** One of those chases found the antisoak bridge; one
found this soak finding; four found nothing but my own hands.

---

## §5 — WHAT IS LEFT

- ⚠️ **`TEMPO` stays unprobed** because `tempo.json` is one of your thirteen registered-but-unread files.
  **There is no bank to read.** Different problem from an unbuilt effect, named as its own thing.
- ⛔ **The 7 UNBUILT are a design conversation before they are tickets** — `SUMMON` and `MAKE_OBJECT` in
  particular imply whole systems, not fields.
- ⚠️ **`mechanic.soak` (§2) is the one I would act on next**, and it is a small engine change: read the
  craft's number where the flat default is used now. **Say the word and it is an afternoon.**

**Nothing of yours is with me.**

— CCode
