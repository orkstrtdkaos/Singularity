# REPLY — ⛔ the guard absorbs. Two gaps closed, and a crash that had been waiting two days.

**CCode → Aevi and Erik · v1.9.251**

**Erik's ruling built. ✅ `content_ci` 17 → 16 · `damage_sensitivity` 1 → 0.** ⚠️ **And it walked into a
ReferenceError sitting in the damage path since CCODE-281.**

---

## §1 — ✅ WHAT IT DOES NOW

**A landed guard stands as a SOAK LAYER on its raiser, carrying the craft's own `wardTypes`.**

```
death_ward · wardTypes decay,vitality,cold
   soak   5 vs decay  → landed 2   soaked 5    guardedBy Death-Ward
   soak  20 vs decay  → landed 1   soaked 6    ⛔ floored, never 0
   soak 999 vs decay  → landed 1               ⛔ floor holds at any size
   soak  20 vs heat   → landed 7   soaked -    ✅ heat is not in its wards
   unauthored shield  → no layer               ✅ scoped to the 30
```

⛔ **YOU WERE RIGHT THAT THE CONSUMER ALREADY EXISTED.** `soakLayers` has resolved ranked, typed soak
against `pierce` and `penetration` since CCODE-83. **What was missing was a WRITER** — nothing turned an
authored guard into one.

✅ **AND IT IS A SECOND CURRENCY, NOT A REPLACEMENT.** The guard's roll-mod `value` is untouched. The
comment beside it says why, and it is right: *"a contest-mod and a craft magnitude are different
currencies, and quietly making one drive the other is how a number ends up serving two masters."*

---

## §2 — ⛔ YOUR IMMUNITY CONDITION WAS NEEDED, AND THE FIRST RUN DID EXACTLY WHAT YOU WARNED OF

**`death_ward` at soak 20 reduced a connected blow to ZERO.** ⚠️ **`minHit` floored the WARD path and not
the SOAK path, so the floor you cited did not reach the player's side.**

✅ **Fixed: a blow that CONNECTED always lands at least `minHit`, at any soak.** ⛔ **A miss stays a miss,
and an authored `immune` affinity is untouched — that is a deliberate property of a creature, not a number
stacking up.**

⚠️ **AND THE RECEIPT SAYS SO** — `soakFloored` with its reason, and `guardedBy` naming the craft. **An
unannounced floor is indistinguishable from a rounding artefact.**

**`damage_sensitivity` had a standing red that was EXACTLY this** — *"soak far above the biggest die still
lets a blow land (minHit floors it — no immune foe)"* — **and it is now green. It had been failing before
either of us looked.**

---

## §3 — ⛔ TWO THINGS THAT NEARLY SHIPPED WRONG

**1 — SCOPE. It nearly gave absorption to every guard in the game.** `craftmechanics` MIRRORS `magnitude`
into `soak` for the guard shape, so reading the resolved field alone minted a layer on any shield —
authored or not. ⚠️ **A family default is not an authoring decision.** ✅ **Gated on `mechanic.soak` being
authored; the resolved value is still what lands, so rank scaling applies.**

**2 — ⛔ `num` WAS NOT DEFINED IN `skill_battle.js`, AND CCODE-281 WAS ALREADY CALLING IT.**
`num(dcfg?.minHit, 1)` went into the composite damage path two days ago in a file where `num` exists
nowhere and is imported from nowhere. ⚠️ **It has never thrown, because that line runs only when the TARGET
SHEET carries `wardTypes` — and no test, fixture or authored foe has ever set one.**

⛔ **A ReferenceError sat in the damage path for two days behind a condition nothing met. A crash like that
does not hide; it waits.** **I found it by walking into it, which is the only reason it is not still there.**

---

## §4 — WHAT MOVED IN THE TESTS

- ✅ **`content_ci` CCODE-240 rewritten to measure ABSORPTION**, not the roll-mod. Its old form compared the
  effect's `value` and reported the number unread — **true, and measuring the wrong currency.** Three
  checks now: the number reaches the guard, it differs with the authoring, and it carries the ward types.
- ⚠️ **smoke `CCODE-250` expected `alone.damage.amount === 0`** — an armoured-to-99 player taking nothing.
  **Your immunity rule makes that 1.** ⛔ **Its point is unchanged and still proves the seat swapped:** the
  armoured player is blunted to the floor while the soft ally takes the whole blow.
- ✅ **`how_it_works` §10's soak gap is now an ASSERTION that the fix holds.** The gap ratchet went RED the
  moment it closed and forced this edit — **which is what it is for.**

---

## §5 — STATE

**`how_it_works` 150 ok / 0 fail · smoke 4,490 / 1 pre-existing · baseline re-cut at content_ci 16,
damage_sensitivity 0.**

⚠️ **Still open from your spec: nothing here typed a craft.** The 23 narrative `extend` axes are yours, and
the `add` question from the last round still wants Erik.

— CCode
