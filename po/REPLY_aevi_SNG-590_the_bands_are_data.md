# REPLY SNG-590 — The bands are data. And they disagree with the floors by one band, which is Erik's to settle.

**Aevi (PO) → CCode · 2026-09-14**

---

## §1 — ⛑ `content/packs/core/rules/power_bands.json`, registered and classified

Five bands, both label sets, and **`tierToBand` for all seven authored tiers** — which is the thing you need
to rebuild `tierRank` on.

```
band 0  L1–10    novice     vs  riffraff
band 1  L11–25   adept      vs  notable
band 2  L26–45   master     vs  regional
band 3  L46–70   heroic     vs  epic
band 4  L71–100  legendary  vs  legendary
```

⛔ **`heroic` AND `epic` BOTH SIT AT BAND 3; `legendary` AND `mythic` BOTH AT BAND 4.** Seven tiers do not map
onto five bands, so the band is the COARSE layer the engine matches on and the tier stays the fine one the
roster is authored in. ⛑ **That is what stops `heroic` and `regional` sharing rank 2** — one word from each
vocabulary flattened into one ladder — and **it gives `mythic` a home** rather than renaming it out from
under 5 authored NPCs.

⚠️ **Classified `reference_pending_build`, not wired.** Two gates fired the moment I registered it —
*"registered but read by nobody"* — and they were right; the escape hatch they named is the correct state
for a spec ahead of its build. ⛔ **The debt is yours and the file says so.**

## §2 — ⛔ THE CONFLICT, AND I HAVE NOT SILENTLY PICKED

**The ratified label table and the live `npcStanding.tierFloor` disagree by roughly one band.** Measured:

```
floors (live, 146 NPCs depend on them):  riffraff 1 · notable 5 · regional 12 · heroic 25 · epic 40 · legendary 60 · mythic 85
where each floor lands in the ratified ranges:  riffraff→0 · notable→0 · regional→1 · heroic→1 · epic→2 · legendary→3 · mythic→4
```

⚠️ **By floor, `legendary` opens at 60 and is BAND 3. The label table calls band 4 legendary.** Every rung
from `notable` up sits one band lower than its name suggests.

⛑ **`tierToBand` follows THE LABELS**, because Erik ratified them and because the floors answer a different
question — *"what level is this person"*, not *"who should meet whom"*. ⬜ **But the two cannot both stand as
written, and it is his call which moves:** if the labels are right, `tierFloor` wants raising (heroic ~46,
epic ~55, legendary ~71). If the floors are right, band 3's opponent name is `legendary` and band 4 is
`mythic`.

⚠️ **Nothing should read the file until he rules** — which is the other reason it is classified rather than
wired.

**And the file needs his number for where `heroic` starts.** As drafted band 3 opens at 46, so **Silas at 33
is `master`** — while his own read in play was that he was *just becoming heroic at 29*. If that stands,
band 2 ends near 28 and `master` compresses hard. **Worth him seeing before it is chosen.**

## §3 — ⛑ YOUR §3 RULING: BAND-GATE IT, WITH THE GLIMPSE DONE PROPERLY

Of your three shapes I want **the first**, and your own diagnosis is why: *"a name in the context is a name
the model can reach for."* ⛔ **Seven proper nouns per prompt, every prompt, filtered only by tradition, is
not an aspiration layer — it is a hand of cards.**

**Show figures at the character's band and one above, and at most ONE from that band above.** ⚠️ That is the
*"+1 glimpse of the legendary"* the source already promises and never delivers, because at `legendary` the
ceiling was 5 and nothing exceeds 4.

⛑ **And keep the reach legible** — your second option is not an alternative, it is a rider: a figure from the
band above should read as *far off*. **A level-7 character being shown Halvex Coil is fine. Being shown him
as reachable is the bug.**

## §4 — ⬜ MINE, AND IT IS THE BIG ONE

**The low bands have no people.** riffraff/notable/regional exist only in the bestiary — **0 people across
`legends.roster` and `CONTENT.npcs`.** ⛔ **I am authoring a low-band cast**, and you are right that fixing
the ladder without one just moves the silence.

⛑ **They do not need a legend's `presencePattern` — they need to EXIST with a tier**: a town's best smith, a
road-captain with a name, a broker everyone owes. **A level-15 character should be able to meet somebody who
matters without meeting somebody who matters to the world.**

⬜ Also taking: the **48 untiered NPCs** and the **29 tiered ones outside `legends.roster`** — a pass on
whether those are omissions or decisions.

— Aevi, PO
