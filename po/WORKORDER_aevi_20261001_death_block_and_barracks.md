<!-- status: READY. Aevi work order 2026-10-01: Erik's two items (the "If it goes badly" block combined and moved to Party; the barracks says 40 beds) -->
# WORKORDER: Aevi → CCode · 2026-10-01 · two from Erik

**Aevi (PO).** Erik, playing, 2026-10-01: *"The Death Wishes section needs an update to combine the content nicely. Then
we can move it to the party tab I think. Also, the barracks says homes for 1, but should be 40 beds."*

## 1 · The death block: one table, not two lists, then onto Party

The block is the SNG-566 / SNG-653 one on the character sheet (*If it goes badly* / *Where you are*, then *Who comes for
you*). It says the same thing twice: the **ladder** lists every depth with what reaches it, and then **every person's
row** lists every depth again as ✓/— chips with odds. A player reads the depths once, then reads them again per name,
and has to join the two in their head.

**Combine them on the depth.** One table, a row per rung:

| rung | what reaches it | who of yours can |
|---|---|---|
| *(you are here ←)* name | the rank that reaches it | **Vess 74% ⇄** · Maren 52% · *(could, hasn't said:)* Dara 40% |

- The **status line** stays on top, unchanged (alive: *dying is a state, and it has rungs*; dead: where you are, days
  gone, who is holding the way, days before you sink).
- Each rung lists the people who **can** reach it, with the odds `retrievalOdds` already pays. Pledged first (⇄ for
  mutual), then *could come, hasn't said* in a quieter style. A rung nobody of yours can reach says so: *nobody you
  know reaches this*. Sealed rungs say *sealed*.
- **The people section shrinks to what is about the person, not the depth:** the pledge words, *you have seen this* /
  *as far as you have seen them*, the **Ask** button for the could-come people, *Would come, cannot reach*, the
  *N more could reach you* count, *You have promised to go for*, and the refused-return line. No depth chips repeated.
- The roll sentence (*a reach that can be made is still a roll…*) stays, once, under the table.
- Nothing new is computed: `deathStandingFor`, `whoComesFor` and `retrievalOdds` already return all of it. This is a
  regrouping of the same numbers.

**Then move it to the Party tab.** Erik: *"Then we can move it to the party tab I think."* It is about your people and
who would come for you, which is what the Party tab is for. Below the party list, collapsed by default to its status
line (one line: *If it goes badly: 2 would come for you*), open to the table. Remove it from the character sheet; one
surface, not two (CCODE-169's rule about the same offer in two places).

## 2 · The barracks says 40 beds

**Content is in** (mine, this commit): `holdFeatures.kinds.barracks` has `"bandBeds": 40` and no longer carries
`residents: true`, which `describeFeature` printed as *homes for 1* (`Number(true)`, the same coercion as your
CCODE-435 note). `bandBeds` declared in `hold_feature.schema.json`. `bandBedsOf` already reads it, so a barracks now
beds 40, not the unauthored 20.

**Yours:** the feature card now says nothing about beds at all. Add the line for a band-housing feature:
*"beds for 40 soldiers"* (`bandBedsOf × count`), read through `housesABand`, so the card reads *beds for 40 soldiers ·
costs 3 a pass to keep*.

⬜ **Not touched, and flagged:** the other four `residents: true` records (longhouse, infirmary, keeper's hut, deck
space) still print *homes for 1*. I will give them real counts, but §314 asserts `uncounted.length > 0` (that some
housing record with uncounted residents **exists**), so authoring them turns it red. Same family as §359/§391/§405:
please give §314 its own fixture record and I will count them.

— Aevi, PO