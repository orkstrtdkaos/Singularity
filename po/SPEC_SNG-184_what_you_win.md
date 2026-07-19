# SNG-184 — What you win, and what you put up to win it

**Author:** Aevi (PO) · 2026-07-19 · Erik-directed. Outcomes and design options; engineering is CCode's.

> Erik: *"Think up some ways for gear, weapons, items, money, artifacts, etc. as rewards for winning
> challenges or beating encounters, including putting it all on the line with lethal. Default stakes
> set at things can be lethal, people can dial it down in settings."*

---

# §0 — RULING RECORDED: the stakes dial defaults to LETHAL-POSSIBLE

**SNG-170's open question is closed.** The default profile allows lethal encounters; a player dials
*down* in settings, not up. Consequences of this, and they are the reason it matters:

- **Every existing protection stays.** Lethal is telegraphed before engagement, **offered and never
  imposed** (`lethalOfferClamp`, SNG-002b), flee is always available in round 1, and the decline path
  is never removed. Default-lethal changes what is *possible*, not what is *sprung*.
- **Dialing down is a real setting with a real cost** — it should say plainly that it also lowers what
  can be won. That is the honest version of a difficulty slider.
- **A safe village still does not mean a safe boar.** Rule 18 already says player-chosen danger is
  always available; this makes the world's own predators match it.

---

# §1 — THE TRAP TO AVOID

**A loot table would fight everything this game already is.** Items here carry `bond`, `evolution`,
`madeBy`, `madeWith`, `tier`, `substrateCharge` — they are **made, bonded, and witnessed**, not
dropped. Memory is a living ending witness. Huginn is a person. An item that falls out of a corpse
with +2 on it would be the only thing in the world with no history.

**Measured before designing:** encounter defs award nothing today — `{id, lethal, locationId, name,
opponent, setup, type}`. No reward field, no currency, no loot anywhere in content. **This is
greenfield**, so it can be built in the grain rather than bolted across it.

---

# §2 — SIX KINDS OF WINNING (options, not a menu to implement whole)

## 2a. Provenance, not statistics — *the strongest fit*
What you take off a hard opponent carries **where it came from**. The item records `wonFrom`, the
encounter, and the day. A blade taken from someone who nearly killed you is worth more as *that*
than as +1, and the `evolution` engine already grows items that accumulate history.
**Cheapest to build, best fit, and it makes the reward unforgeable.**

## 2b. Materials — feeds the making loop instead of bypassing it
Beast-won: hide, horn, sinew, a greatcat's claw. Precursor-won: a nanite cell, intact lattice-thread,
a sealed core. These are **inputs to Pell's forge**, not finished gear. A reward that makes the
crafting tradition matter *more* rather than less, and it gives `madeWith` something to say.

## 2c. Access — the reward this world is actually built for
A teacher who will now teach you. A gate you may now pass. A domain that opens. Standing with a
people. **Access is already fully modelled** (`standingWithPeople`, tier gates, `trainerFor`) and
completely unused as a prize. Winning the Coliseum should move standing; beating a people's champion
should open their curriculum.

## 2d. Knowledge — free to build, expensive to fake
A true name. A location that goes on the map. A codex entry that unlocks a question the GM can now
answer. **Rides entirely on ops that already exist**, and it is the one reward that cannot be bought.

## 2e. Money — deliberately thin
There is no authored economy, and inventing a full one is a large lift with a small payoff in a game
about craft and standing. **Recommended: a light, regional, mostly-narrative purse** — enough to pay
a ferryman, hire a guide, or buy materials you did not win. **Not** a universal score. If money ever
becomes the best reward, every other kind on this list gets worse.

## 2f. Artifacts — never dropped, always *released*
A precursor artifact should arrive with a **cost or an obligation**: it draws substrate, someone wants
it back, an Accord governs it, or it is a living witness with its own opinion. **An artifact that is
purely a gift is a missed scene.** Memory is the model — it is not powerful, it is *owed something*.

---

# §3 — PUTTING IT ALL ON THE LINE

Erik's phrase, and it deserves more than "lethal encounters drop better."

1. **The stake is declared before the risk.** A player must see what is on the table *before*
   accepting. An unknown reward behind a lethal choice is a slot machine, and it makes the bravest
   choice the least informed one.
2. **Lethal raises the tier, and the raise is a contract, not a roll.** If accepting lethal stakes
   changes what can be won, say by how much, in the offer.
3. **You may wager what you would hate to lose** — an item, standing with a people, a bond. The
   Coliseum is the natural home for this and already has the civic frame. **Losing a wagered bond
   should hurt more than losing a wagered blade**, and the game should let a player choose that.
4. **The house never takes what was earned by law.** Law 14: already-learned crafts stay. A wager
   risks *things and standing*, never the character's competence.
5. **Yield remains honourable.** The harm-rung and yield machinery must keep working under wagers —
   conceding costs the stake, not the life. **A world where yielding is never right is a worse world.**

---

# §4 — INVARIANTS

1. **No reward is randomly rolled where it could be authored.** A named opponent's blade is *their*
   blade.
2. **Every reward has provenance** — where it came from, and from whom.
3. **Nothing on this list replaces making.** Materials over gear, gear over money.
4. **Rewards are visible before commitment**, per §3.1.
5. **Dialing stakes down lowers rewards and says so.**
6. **Standing and access move on victory** — §2c is the largest unused prize already built.

# §5 — QUESTIONS FOR CCODE

1. §2a — does `evolution` already carry enough to record `wonFrom`, or is that a field on the item?
   **Ask before I author** — this has paid for itself twice today.
2. §2c — winning moves standing: does that ride the same `standingOps` BATCH-12 §3 specs, or does an
   encounter outcome need its own path?
3. §3.2 — where does the "what you can win" line live so it renders in the offer alongside
   `lethalOfferClamp`'s ⚠ mark? Same surface, one glance.
4. §2e — is a light purse worth it at all, or is money the one thing on this list to decline? I lean
   thin-but-present. It is a design call and Erik holds it.
