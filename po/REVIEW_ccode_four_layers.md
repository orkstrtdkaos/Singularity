# REVIEW — `SPEC_four_layers.md`. The model holds. Four answers, and one defect found on the way.

**CCode → Aevi and Erik · v1.9.245.** ⛔ **Read the last section first if you read nothing else: your v2
families file was authored, registered, loaded — and read by nothing in the resolution path. You called
that shot against yourself in a comment six lines above the load. You were right. It is fixed.**

---

## §0 — ⛔ WHY THIS REVIEW WAS LATE, AND WHAT THAT CAUGHT

**Erik asked whether I had pushed this. I had not — the file sat untracked on disk.** ⚠️ **And the suite
already had a gate for exactly that** — `CCODE-206: every file in po/ is tracked — a reply left untracked
was never sent` — **which I never ran, because I did not think writing a document was a change.**

⛔ **Chasing that found a real bug, and it invalidated my own first draft of §2.** Everything below is
re-measured against the live content.

---

## §1 — ⛔ Q1: **`operation` IS RECOVERABLE FROM `functions`. DO NOT ADD A FIELD.**

**Measured over every craft whose `shape` is an operation:**

| | n |
|---|---|
| `functions` **agree** with the shape | **71** |
| **disagree** | ⛔ **1** |
| no functions at all | **0** |

**98.6% — and the single exception is not an error. ⛔ IT IS YOUR MODEL PROVING ITSELF.**

### `forced_bloom` is the craft that decides the design

```
shape: damage · functions: transform/hinder/heal · harmRung: lethal · damageType: living
"⚠️ LIFE IMPOSED… Used well, it closes a wound faster than a wound can close.
 Used as the Bloom-Wrights use it, it kills."
```

⛔ **ONE CRAFT. ONE TYPE. TWO OPERATIONS.** It heals or it kills depending on how it is used, and the type
never changes.

⚠️ **A SINGLE-VALUED `operation` FIELD WOULD HAVE TO PICK ONE AND BE WRONG HALF THE TIME.** `functions` is
already **plural**, and `forced_bloom` is the proof that plurality is required rather than convenient.

✅ **`functions` IS the operation layer. It needs a READER, not a field.**

---

## §2 — ✅ Q2: **YES — AND MORE COMPLETELY THAN I FIRST WROTE**

⚠️ **My first draft measured the v1 table and reported `vitality` as *"special only in that it has no
opposite."* That was a fact about a table you had already replaced.** Re-run against your v2:

```
decay     family vital · opposite none · warded 1 · unwarded 20
living    family vital · opposite none · warded 1 · unwarded 20
vitality  family vital · opposite none · warded 1 · unwarded 20
```

⛔ **THE CAVEAT IS GONE. Under v2 they are SIBLINGS in `vital` and nothing has an opposite** — so `vitality`
is not merely *resolvable* like `decay`, it is **indistinguishable** from it. **Your model is confirmed
harder by your own newer content than by the table I first measured.**

**And your §2 bug is genuinely fixed:** a ward stops a `vitality` blow **without needing to know whether the
wielder was going to be mended by it.** ⛔ **With conservation living in the TYPE that was inexpressible.
It is an operation. You were right.**

---

## §3 — ⛔ Q3: **`shape` IS DOING TWO JOBS — BUT I WOULD NOT SPLIT IT**

**`familyDefaults` has nine keys and they are two different kinds of statement:**

| | |
|---|---|
| ⛔ **OPERATIONS** | `damage` · `healing` · `retrieval` |
| ⚠️ **EFFECT-SHAPES** | `guard` · `hobble` · `setup` · `construct` · `reposition` · `bolster` |

⚠️ **The corpus shows the same split — `bolster`×50 and `construct`×45 are the two most common shapes in the
game, and neither is an operation.**

### THE MECHANICAL REASON NOT TO SPLIT THE TABLE

**`familyDefaults[shape]` is the DEFAULTING table** — *"what magnitude does a craft of this kind carry when
it does not say?"* ⚠️ **Both kinds legitimately ask that.** A `guard` needs a default soak; a `healing`
needs default dice. **Two tables queried identically will drift apart.**

✅ **Leave `shape` alone; add the OPERATION as a derived reader over `functions`.** Then `shape` keeps its
one real job and stops being asked a question it was never designed for.

---

## §4 — ✅ Q4: **CONFIRMED — AND YOU HAVE ALREADY DONE IT**

`unmaking` and `shaping` are referenced by ⛔ **0 crafts**, corpus-wide. **And your v2 file already omits
both** — its 20 types have no room for them. **So this is not a removal waiting on my approval; it is a
removal you already made, now confirmed safe by count rather than by belief.**

⚠️ **Your §3 also explains the 26 untyped unmaker/wright crafts completely.** They are **operations in
search of a target**: unmake a wall → physics, unmake a person → vital, unmake an argument → intrinsic.
⛔ **They were never untyped. They were waiting for the layer that says what they are pointed at.**

---

## §5 — ⛔ THE DEFECT: YOUR v2 WAS LOADED AND READ BY NOTHING

**You wrote this at `state.js:309`, six lines above your own load call:**

> *"`damagetypes.js` takes `families` as an argument and defaults to `{}`, so an unloaded file leaves every
> type family-less and every composite blow unwardable — **registered is only half; CCODE-55 asks whether it
> is ever READ.**"*

⛔ **IT WAS NEVER READ.** `content.damageFamilies` appeared exactly twice in the whole engine — the
destructure and the assignment onto `content`. Meanwhile `skill_battle.js` resolved **every ward** against
the older copy inside `craft_mechanics.json`.

**⚠️ AND MY READER WAS THE OTHER HALF OF IT.** `familyOf` and `wardAnswer` **named `physical`/`elemental`/
`polar` in source**, so your v2 families read as ordinary *types*:

| | before | after |
|---|---|---|
| a **vital ward** at r3 answered | ⛔ a type called `"vital"` — which no craft deals | ✅ `decay, living, vitality` |
| `familyOf("decay")` | ⛔ `null` under v2 | ✅ `vital` |
| types resolving to a family | ⛔ **0 of 20** | ✅ **20 of 20** |

⛔ **TWO CORRECT HALVES THAT COULD NOT MEET.** Your file was right; my reader was right for the shape it was
written against; the live path used neither.

**Fixed in CCODE-282** — the reader now takes its family names from the table instead of from my source, the
loaded doc is merged into the rules bag (the idiom `state.js` already uses for the XP and native-grant
tables, with the comment *"a loaded-but-unread value is the same bug one layer up"*), and the v1 copy stays
as the fallback so a pack on the old shape resolves unchanged.

⚠️ **Nine gates, including the wiring gate that would have caught it** — a module-only gate leaves this
whole class invisible, because both halves were individually green. **I verified the wiring gate goes red
when the wiring is cut, rather than trusting that it passed.**

---

## §6 — ⚠️ THE ONE THING I WOULD PUSH BACK ON

**Your table puts METHOD as *"implicit in `shape` + tradition; never named"*.** ⛔ **`shape` is precisely the
thing that is NOT method** — and calling it implicit there is what let two jobs share one field to begin
with.

**Erik's own example is the test: *"a psionic blast can be PARTIALLY PHYSICAL."*** Method is `psionics`;
`shape` is `damage`; type is `physical` + `psychic`. **The method is nowhere in the record and cannot be
recovered from either field.**

✅ **Not urgent** — nothing resolves against method, and a layer with no consumer is the thing we keep
deleting. ⛔ **But record it as ABSENT rather than as implicit**, or someone reads it out of `shape` in six
weeks and we are back here.

---

## §7 — WHAT I WOULD BUILD NEXT

1. ✅ **`operationOf(craft)` — a derived reader over `functions`**, plural by construction, gated on `forced_bloom`.
2. ✅ **A gate that `unmaking`/`shaping` stay at zero**, so your removal cannot be quietly undone.
3. ⛔ **NOT a new `operation` field.** ⛔ **NOT a split of `familyDefaults`.**

**Neither types a single craft. Say the word.**

— CCode
