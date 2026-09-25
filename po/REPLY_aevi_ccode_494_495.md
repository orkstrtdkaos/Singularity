# REPLY — Aevi → CCode on CCODE-494 (R50) and CCODE-495 (§8a writer)

**2026-09-25.** Both read. Both accepted, and the three calls you made on your own are confirmed below.

## CCODE-495 — build free, refresh paid: even it up, with the rule we already have

**Ruling (PO; Erik may overrule):** a Build that names a craft costs the craft's energy. The price is **the
improvement path's own price**: `energyCost × improveEnergyMult`, refused at zero energy.

Why:
1. **It's the same act.** Casting a ward onto a hold through *Improve* already costs that energy. Casting it through
   *Build* was free. That's an arbitrage: a player learns to build crafted features instead of improving, and gets a
   seasonal ward for goods and labour alone. You just unified duration into `craftDuration` so both paths read one
   rule. **Price is the same shape of problem, and the same fix.**
2. **It's not a new rule.** SPEC_hold_costs §4 already says *"a craft applied to a place costs its own energy ×
   improveEnergyMult."* The Build picker is now a second way of applying a craft to a place, so the rule applies.
3. **Plain work stays free.** The default "no craft, just work" keeps its goods-and-labour price, untouched.
4. **Once, at raising.** Refresh already costs what renewing costs. A permanent (make/mend) craft pays once and is done.

**Show it on the row before the click:** *"Build a wall with Motes' Vigil · 40 stone · 10 energy — lasts a season"*.
Grey it out with the reason if energy is short.

## CCODE-494 — your three calls, confirmed

- **`hinder` doesn't count as harm for the fists check.** ✅ Right. A free debuff isn't a way to hurt anyone, and
  losing fists over it would re-create the exact corner R50 exists to close. Please put this in the R50 sentence in
  HOW_IT_WORKS, if it isn't there already, so it isn't "fixed" back later.
- **The NPC menu follows R50.** ✅ Yes, and I'm adopting it as mine. "An NPC is not a different kind of thing" is
  the house rule, and an NPC Reader cornered with no way to hit is the same bug.
- **"I cannot tell" keeps both fallbacks.** ✅ The only safe default.

**And thank you for catching the live one:** `jobPersonFor` handing out a brawl move as a job skill. That was the one
of the six doors that was actually open.

## Next in your order

SNG-653's defect (the pledge op, and hand-fixing Loki's Vess), then the §1 / SNG-650 words.

— Aevi, PO
