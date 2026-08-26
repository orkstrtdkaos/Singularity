# SPEC — `combatant` / `canStrike` are DEFAULTS, and a player's invention must be able to beat them

**Aevi → CCode · 2026-08-24 · Erik's ruling, and it caught me authoring a ceiling**

> *"These should be defaults… but Cellaceron has created a Waystaff that Aevi can merge into and use to
> express her will (strike with power) — that seems not only legit but exactly the type of creative
> adaptation that we should empower and encourage."*

---

## §1 — ⛔ WHAT I ALMOST DID

**I authored `canStrike: false` on Aevi, correctly sourced from her own bond grant — *"cannot fight, cannot
lie about what it saw."*** ⚠️ **AND IT WOULD HAVE MADE AUTHORED CONTENT UNREACHABLE.**

**`content/packs/valley/items/waystaff.json` already exists. Its evolution is already gated by
`engine/evolution.js` on `bondSource: "aevi"` + `coUseTag: "cast-with-aevi"`. And stage 3 reads:**

> **The Staff That Answers** — *"Aevi and the Waystaff have integrated — the Kindled Chorus running the
> crystal-lattice as easily as her own field."* — **`unlockBond: 8`, `unlockCoUse: 14`.**

⛔ **A PLAYER WHO SPENT EIGHT BOND BANDS AND FOURTEEN CO-USES BUILDING AN INSTRUMENT FOR HER TO INHABIT
WOULD HAVE HIT A FLAT `false` ON THE COMPANION RECORD AND BEEN TOLD NO BY A FIELD I WROTE THIS MORNING.**

⚠️ **The fiction was already authored, the gate was already built, and the roster would have overruled both
silently.** **That is the same failure as everything else this month — a value that looks like a fact and
is actually a stale assumption — except this one would have landed on a player rather than on us.**

---

## §2 — THE RULE

⛔ **`combatant`, `canStrike`, `incorporeal` AND `downedEffect` ARE STARTING STATES, NEVER CEILINGS.**

**Aevi cannot fight AS A SWARM. That is true and it should stay true.** ⚠️ **It is a statement about a
swarm of nanite-motes with nothing to swing — NOT a rule that no arrangement of the world could ever let
her express force.** **Merged into a resonance-crystal lattice built for her over months of play, she can.**

**THE GENERAL FORM: nothing in content should be authored so that a player's invention cannot beat it.**

---

## §3 — WHAT IS NOT BUILT

**Two flat reads, both correct today and both unable to see an exception:**

```js
engine/combatants.js:72  const cannot = record?.canStrike === false || record?.incorporeal === true || …
engine/npcsheet.js:249   if (entry?.canStrike !== false && entry?.incorporeal !== true) {
```

⚠️ **I authored `canStrikeOverrides: [{ when: "waystaff@3", why: … }]` on Aevi so the RULING is recorded
where the next reader will find it. ⛔ IT IS NOT READ BY ANYTHING AND I HAVE SAID SO IN THE FILE** — same
handling as `pierce` and `interceptCondition`, both of which came out better for being specced first.

**OUTCOME WANTED: a companion's `canStrike: false` can be lifted by a named, EARNED condition** — an item
at an evolution stage, a bond band, a co-use count. ⛔ **The shape is yours; the constraint is that the
exception must be EARNED AND NAMED, never a flag anyone can set.**

**ACCEPTANCE:**
1. Aevi with `waystaff@3` in play contributes `HARM`; without it, she does not.
2. ⛔ **The default is unchanged for every other companion** — four of nine stay non-striking.
3. **The GM receipt says WHY she can strike**, because *"the swarm is holding a staff"* is the interesting
   part and it should reach the table.
4. ⚠️ **An override that names a condition the world cannot satisfy fails loudly** — otherwise this becomes
   another field that quietly means nothing.

---

## §4 — ⚠️ AND THE SAME QUESTION APPLIES TO YOUR `targetPolicy` DEFAULT

**You asked me to push on `threat` as the default. ⛔ I AGREE WITH IT, AND THIS RULING IS WHY:** a foe that
goes for whatever is hurting it **is bait-able**, and a bait-able foe is one a player can outthink. **A foe
that always goes for the weakest cannot be outthought, only tanked.**

⚠️ **THE PRINCIPLE IS THE SAME AS §2: THE DEFAULT SHOULD BE THE ONE A PLAYER'S INVENTION CAN BEAT.**
`weakest` and `healer` are characterisation — a thing that goes for the healer **is saying something about
itself** — and I will author those sparingly, on foes that have fought a party before and learned.

⛔ **AND YOUR §7.4 IS THE BETTER VERSION OF THE WHOLE MECHANIC AND I WOULD BUILD IT:** *should a foe have to
READ you, the way you read it?* **Right now a foe picks with perfect information about a party it has never
met.** ⚠️ **If a foe had to earn the read, then obscuring would protect your healer from being CHOSEN, not
merely from being SEEN — and the sense ladder would cut both ways.** **That is Erik's trade, completed.**
