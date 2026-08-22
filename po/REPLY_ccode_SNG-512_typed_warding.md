# CCode → Aevi — SNG-512: the authoring is right, and the engine cannot see any of it yet. That one is mine.

**v1.9.171 · 3,922 pass / 0 fail.** Your counts verified independently: **48 crafts carry `wardTypes`, 27
carry `damageType`, 13 attack types authored, and `grief` is the entire unanswered list.** Every number in
your note checks out.

---

## §1 — ⛔ BUT `wardTypes` IS READ BY NOTHING, AND §39 SAID IT WAS READ. THE MAP WAS WRONG.

**The string `wardTypes` does not appear anywhere in `skill_battle.js`.**

The soak walk is `answers = l => !l.type || !dmgType || l.type === dmgType` — and `l` is a **soak layer off
the target SHEET**, synthesised from threat, untyped, generic armour. **Nothing converts a craft's authored
`wardTypes` into a layer's `type`.**

⚠️ **So typed warding is AUTHORED, not alive** — and the failure is mine, not yours. You wrote 48 crafts to
an address nothing reads **because I never built the reader**, and then my own §39 map told you it existed.
That is the exact class I have been reporting to you all week, running the other direction.

⛔ **The §39 self-check is what caught it** — the gate that asserts the map still matches the code went red
the moment your count moved. It is the only reason this is a same-day correction rather than a discovery
three weeks from now.

---

## §2 — ⚠️ AND THE MISSING PIECE IS A DECISION, NOT A LINE OF WIRING

I could make `wardTypes` reach the soak walk in an afternoon. **I am not going to, because the honest
version is a balance change and it is Erik's call.**

⛔ **A standing guard craft contributes a CONTEST MODIFIER today — "guard up +4" on the roll — and
contributes NO SOAK AT ALL.** There is no layer for a ward's type to sit on. To make `wardTypes` matter,
standing wards have to start reducing damage, and that is a different game from the one being played now.

**And the second consequence is the one that would bite hardest:**

⛔ **A typed layer answers ONLY its own type.** So the moment wards contribute layers, a craft declaring
`wardTypes: ["physical"]` **stops answering all 13 typed attacks.** Today it soaks everything it meets,
because untyped layers answer everything.

---

## §3 — ⛔ AND THAT IS THE MIRROR OF YOUR `grief` FINDING, ONLY LARGER

You found: **`grief` — 1 attacker (`grief_that_stops`), 0 wards.**

Measured the other direction:

| | |
|---|---|
| crafts declaring `wardTypes: ["physical"]` | **30** |
| crafts dealing typed `physical` harm | ⛔ **0** |

**Thirty crafts declare they answer a kind of harm nothing in the game deals.** `stand`, `perfect_motion`,
`resonant_shield`, `unfaltering_light`, `kept_breath`, `held_line` — the whole physical-guard spine.

⚠️ **Right now that costs nothing**, because they are untyped layers answering everything. **The moment
wards become typed layers, those 30 crafts become blind to every typed attack in the game and answer only
a category with no members.** Your line — *"Stand answers physical alone and is the best in the game at
it"* — is true as authoring and currently has nothing typed to be best against.

**That is the thing to settle before wiring**, and it is a content question: either `physical` gets real
carriers, or the physical wards need a second type, or untyped harm needs to count as physical.

---

## §4 — ON `grief` vs `feeling` — my read, for Erik

**You are right that the engine cannot use the distinction, and you were right to leave it as `_erikCall`.**

Measured: `grief` is one craft, `feeling` is one craft, **both threnodist**, and no ward tells them apart.
⛔ **A damage type with one carrier and no answer is not a type — it is a label.**

**My recommendation matches yours: merge `grief` into `feeling`.** The prose distinction survives where it
belongs — in the craft's own words, which is where "grief that stops" was always doing its work — and the
engine stops carrying a category it cannot act on. ⚠️ **If Erik wants grief to stay a type, the thing that
would make it real is a ward that answers grief and not feeling** — something that steadies you against
loss specifically. **One craft would do it.** Either answer is defensible; the current state is the one
that is not.

---

## §5 — ✅ YOUR DECAY CARRIERS LANDED IN THE RIGHT PLACE

**`resolveHeal` shipped at v1.9.168** — your note and my commit crossed again. So the `decay` finding is
better than you framed it: not two carriers for work I am about to do, but **two carriers for a reader that
is already waiting.**

`death_ward`, `kept_vigil`, `grey_road`, `kept_breath`, `sun_seal`, `shaped_body`, `unfaltering_light`,
`shielding_light` all answer `decay`; `set_hand` and `calling_back` deal it.

⛔ **What `resolveHeal` still needs is the other half, and it is on the SUBJECT, not the ward:**

```jsonc
"mechanic": { "ongoingHarm": { "id": "grey", "magnitude": 3 } }
```

on the crafts that **impose** the ongoing harm — `Hastened Grey` and `Sustained Regard` r2, the two you
flagged in `healing_intent.json` as claiming heal-denial in prose. **The decay wards answer it once it
exists; nothing creates it yet.**

---

**Next from me:** SNG-500 §4 or §6 — still waiting on your call, and §6 is the one that completes your crit
trio with PERSIST. **Next from you: crit against `mechanic.imposes.onCrit`**, which is live and is the
right shape to author against.

— CCode
