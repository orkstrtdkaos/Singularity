# SNG-365 — The four rate sub-attributes need consumers at four separate sites

**Author:** Aevi (PO) · **Date:** 2026-08-07 · **Origin:** CCode — *"only the four pool subs are wired…
a rate is read where it applies; banking one into a stored field would be the writer-with-no-reader bug
inverted."*
**Status:** spec_ready · **Depends on:** SNG-356 ladder (shipped, `38de12ae`)

---

## §0 — CCODE IS RIGHT AND THE DISTINCTION IS THE WHOLE TICKET

The ladder has two kinds of sub. **Pool** subs (`strength`→maxHealth, `reason`→maxEnergy,
`rapport`→companyCapacity, `craft`→equipmentBonusCap) accumulate into a stored number — those are wired.
**Rate** subs do not accumulate; they modify a calculation *at the moment it happens*.

⛔ **Banking a rate into a stored field would be the exact defect I have filed three tickets about today,
inverted** — a value written where nothing needs it, while the site that does need it goes on not reading
it. **Four sites, four separate reads, one ticket.**

⚠️ **This is why it is NOT "wire the rates" as one line of work.** Each site has different mechanics and
one of them has a real design question in it.

---

## §1 — THE FOUR SITES, located at origin

### §1a — `agility` → defense · `engine/resolve.js:111`

```js
["defenseBonus", ["defend", "guard", "block", "brace", "careful"], "defense"],
```

An aptitude-driven bonus applied when the action carries a defensive tag. **Add the ladder's `agility`
cumulative to the same term.** ⚠️ **Cleanest of the four — an existing named term, an existing tag list,
one addend.** Do this one first to prove the pattern.

⚠️ **Plus two milestone effects the ladder authored that this site does NOT cover:** rank 7 and rank 14
each drop an incoming blow by one harm rung. **That is not a `defenseBonus` addend — it is a post-outcome
rung adjustment and needs its own hook.** Flag whether that belongs here or in `incapacitation.js`; I do
not know and would rather ask than guess.

### §1b — `insight` → sense tier · `engine/sense.js` via `app.js:2307`

`senseTier` already takes `aptitudeMods`. The ladder grants *attunement toward sense tier*, and
`senseTiers` gates on `minAttunement` (0/2/5/9). **Add the ladder's `insight` cumulative to the attunement
term the tier lookup reads** — so insight buys tier bands without touching attunement itself.

⚠️ **Check the interaction: attunement is earned in play AND now granted by a sub.** If they simply sum, a
high-insight character skips earned attunement entirely. **My view: they should sum, because both are
"how well you read the world" — but that is a design call, not an implementation detail, so it goes to
Erik rather than being decided in the wiring.**

### §1c — `presence` → renown and reputation gain · `engine/reputation.js:77`

```js
if (d.weight > 0 && aptitudeMods.reputationGainBonus) { d._bonusApplied = aptitudeMods.reputationGainBonus;
```

⛔ **Note the `d.weight > 0` guard: the existing bonus applies ONLY to positive deeds.** The ladder grants
*"% renown and reputation gain"* — **and renown is not merit-signed.** Directive SNG-280: a massacre and a
rescue of the same magnitude travel equally far.

⚠️ **So presence should widen BOTH directions — a high-presence villain becomes notorious faster.**
Applying it inside the `weight > 0` guard would make presence a goodness stat, which is not what it is.
**Flag it; do not silently inherit the guard.**

⚠️ **And this composes directly with SNG-363 §2b** — renown tier widens news reach, so presence
compounds: faster renown gain → higher tier → wider spread. **That may be exactly right, or it may be a
runaway. Worth one harness pass before it ships.**

### §1d — `wits` → crit and the novel penalty · `engine/resolve.js:267` and `:299`

```js
addS("aptitude", aptitudeMods.critSuccessBonus || 0);
const dial = degree === "success" ? crit.successChance : crit.failChance;
```

**Add the `wits` cumulative to the crit success term.** ⚠️ **Second, separate effect: the ladder's rank-4
and rank-10 milestones halve and then remove the `novel` untried-action penalty.** That is a different
term at a different place and must not be folded into the crit addend.

---

## §2 — SEQUENCE AND SCOPE

1. **`agility` defense addend** — prove the pattern on the simplest site.
2. **`wits` crit addend** — same shape.
3. **`insight` attunement term** — after Erik answers §1b.
4. **`presence`** — after Erik answers §1c, and ideally after a harness pass on the SNG-363 compounding.
5. **The three milestone effects** (harm-rung drops, novel-penalty removal) — separate from the addends,
   and each needs its own hook.

⚠️ **Do NOT bank any of these into character state.** If a rate ever appears as a stored field, that is
the bug this ticket exists to avoid.

---

## §3 — OUT OF SCOPE

- Any ladder value change — the numbers are authored and Erik-ratified.
- The roll column — still gated on the harness, separately.
