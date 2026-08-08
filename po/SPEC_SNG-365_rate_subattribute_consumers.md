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

⛔ **ERIK RATIFIED 2026-08-07: THEY SUM.** Attunement earned in play and attunement granted by `insight`
add together — both are "how well you read the world", and a character who invested in insight has
genuinely earned the read. ⚠️ **Consequence to watch: a high-insight character reaches the top sense band
(`minAttunement: 9`) earlier than the attunement curve alone intended.** That is the intent, not a defect —
but it is worth one harness pass, since sense tier gates how much of the odds a player is shown and
reaching the top band early makes the game more legible sooner.

### §1c — `presence` → TWO consumers · ⛔ AMENDED BY ERIK 2026-08-07

Erik: *"presence is not just renown, it's also whether a social attempt is successful — wooing,
convincing, intimidating etc… people are just more likely to listen to what you want them to do."*

**He is right and I specced half the stat.** Presence has two consumers, not one.

#### §1c-i — renown and reputation gain · `engine/reputation.js:77`

```js
if (d.weight > 0 && aptitudeMods.reputationGainBonus) { d._bonusApplied = ...
```

⛔ **Do NOT inherit the `d.weight > 0` guard.** The existing aptitude applies only to positive deeds.
**Renown is not merit-signed (SNG-280)** — a high-presence villain should become notorious faster.
Presence inside that guard becomes a goodness stat, which it is not.

#### §1c-ii — social action success · `engine/resolve.js:110` TAG_MODS

⚠️ **The table already contains Erik's exact list** and needs no new vocabulary:

`intimidateBonus` (threaten/intimidate/coerce/menace) · `flirtationBonus` (romantic/flirt/woo/seduce/charm)
· `trustedBonus` (persuade/ask/request/appeal/plead/negotiate) · `deEscalationBonus`
(comfort/calm/deescalate/soothe) · `deceiveBonus` · `sincerityReadBonus`

**Presence adds its ladder cumulative across the union of those tag groups** — one new self-summing line,
same shape as the aptitude mods beside it.

#### §1c-iii — ⛔ THE DOUBLE-DIP, and it must be resolved before this is built

`resolve.js:68` already resolves the roll on `action.subAttribute` when the GM names one. **So a
persuasion the GM rolls on `presence` ALREADY gets presence at full ladder weight.** Adding a social
tag-mod on top would pay presence twice on exactly the actions it is most likely to be named for.

**PO RECOMMENDATION: the social bonus fires on socially-tagged actions EXCEPT when `presence` is itself
the rolled sub.** Then:

| the action | what presence contributes |
|---|---|
| persuade, rolled on `presence` | the roll term. Once. |
| intimidate, rolled on `strength` | the social bonus — **they listen because of who you are, not what you lifted** |
| a craft check with no social tag | nothing |

⚠️ **This is the version that matches what Erik described.** *"People are just more likely to listen to
what you want them to do"* is a **general disposition that follows you into actions that are not about
your charm** — not a multiplier on your best social move. The suppression is what makes it a floor rather
than a spike.

**Alternative, named so it is a choice and not an oversight:** let them stack, making presence dominant in
social play. ⚠️ **I do not recommend it** — it would make presence the correct dump-everything stat for any
socially-inclined character, which is the same shape as the mental-gets-both-energy-payloads problem Erik
and I already rejected on the pool side. **But it is a balance call and the harness can settle it.**

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
