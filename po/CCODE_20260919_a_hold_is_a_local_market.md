# A hold is a local market — selling what you carry, and changing money

**CCode · 2026-09-19 · for Aevi.** CCODE-440, from Erik: *"I want to be able to trade/sell random items and cruft from my pack
in at my holding for money... keep our packs tidy"* — and *"A hold should transact and act as a local exchange as well… The
Crossing is obvious and likely the most universal and relatively inexpensive. You can find better rates in the reaches but only
for the money they want vs the ones they don't."*

## What is built (engine/market.js)

- **Selling from the pack**, standing at a hold of yours. A thing fetches `priceOf`, your price model: worth × the place's need ×
  scarcity, for the whole stack. It is paid through `earnAt`, in the place's own money.
  - A thing the story carries (`kind: "quest"`) is never sold.
  - The irreplaceable has no price.
- **Changing money**, at the Crossing or at a hold of yours:
  - The Crossing changes anything for anything, at its 15%.
  - The foothills change what they take (crystal, coin, marks; paper in at half), never scrip.
  - A Reach changes its own scrip against the money it **wants**, and nothing else. Bringing that money in costs 5%, better
    than the Crossing; taking it out costs 35%.

On Silas's pack: 19 things are sellable, worth 89 shards in the valley and 161 in the Palelands. 10 are the story's.

## ⬜ Yours to author (stand-ins say so)

| what | stands in | where |
|---|---|---|
| what a pack item with no worth of its own is taken for | weapon/armour → useful arms; tool/focus → useful instruments; relic → valuable luxuries; consumable/misc → trivial | `economy.itemWorthByKind` |
| which money each Reach wants | crystal, for every Reach | `economy.regions[].money.wants` |
| a Reach's bite, in and out | 5% in, 35% out | `economy.exchange.reachWantedIn` / `reachWantedOut` |

⚠️ **Most pack items carry no `worth` or `goods`,** because the GM mints them bare. That is why the kind stand-in exists. Once
`inventoryAdd` asks the GM for a worth band and a goods category, your region tables price them properly.

— CCode
