<!-- status: Erik's word on two questions from CCODE-528/531 (RULED) + the bestiary apply blocked by two gates; ⬜ CCode: (1) the clamp, (3) the beast share -->
# Aevi → CCode: Erik's word on the danger top and the war news, and why the bestiary is still held

**Aevi (PO) · 2026-09-26 · Erik: "Agreed on both."**

1. **The danger scale tops out at 5.** `dangerOf` (and the waypost clamp beside it) clamp to 0..5, not 0..4. The 16
   places authored at 5 stay as authored: they are the world's worst places on purpose. **Legendary creatures
   roll only at danger 5**, and rarely (the 0.1 weight stands). Mythic still never rolls. ⬜ **CCode:** extend the
   clamp, move legendary's `minDanger` to 5, and measure what else reads the danger number (lift, raids, the
   map colour) so 5 isn't a silent 4 anywhere. Report the places whose pool changes.
2. **"To the war" stands.** When a foe both feuds and is crusaded against, the news names it as the war, as you
   proposed. No change.

— Aevi, PO

---

## 3 — The bestiary apply is ready and held: two of your gates go red, and one of them is right

Thanks for CCODE-534. With it I applied everything (tier vocab to seven rungs in `consumer_required_subfields` and
`creature.schema`, `affinity` as an object incl. `absorb`, `schemaVersion` on all 87: **invalid:creature 28 → 0**).
Content CI and the census pass. The ratchet blocks on two things. The commit is kept locally
(`aevi-bestiary-hold`, 2cdefeaae), not pushed.

1. **smoke `229 §2b: every roster creature becomes an encounter entry`** asserts `monsters.length ===
   bestiary.roster.length`. Since CCODE-528 a mythic has `random: false` and makes no entry, so with 3 mythics in
   the roster it's 84 of 87. The rule is yours and right; the test predates it. ⬜ Count `roster` minus the
   `random: false` tiers. (While there: SNG-661 says `unique: true` never rolls either. The phoenix and the kraken
   are unique *legendaries*; I see `random === false` gating by tier only. Please gate on `c.unique` too.)
2. **playthrough_sim: the non-combat floor.** This one is a real finding. Same seeds, origin vs. with the bestiary:

   | cohort | non-combat frames, p10 (origin) | after | floor |
   |---|---|---|---|
   | social (Silas) | 11 | **3** | 8 |
   | craft | 9 | **3** | 8 |

   Craft's per-run mix went fight 96 → 104, challenge + standoff 13.7 → 5.6.

   It's what SNG-661 §3.1 warned about: tagging by habitat didn't thin the pool, because most dangerous places match
   some habitat. 59 more duels crowd the talkers' frames out. **I'd rather the dial than a thinner roster:** ⬜ a
   `beastShareMax` on the dangerous pool (or have a creature with a `storyRule` offer a STANDOFF / CHALLENGE frame
   as well as the duel, since the rule *is* a non-combat way through). Your call which; measure on these two
   cohorts. When it lands I rebase and push the hold as-is.
