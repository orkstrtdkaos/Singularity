<!-- status: SNG-651 — proposal for Erik's eye before CCode builds; UI only, the engine readers already exist -->
# SPEC SNG-651: the Holdings screen, again, organised by what you came to do

**Aevi (PO) · 2026-09-25** · *Erik: "We should look at another overhaul of the holding UI as well."*

## §1 — WHAT IT IS TODAY (measured in `app.js`)

`renderHoldingsTab` plus the manage popup come to **about 280 lines of markup carrying 33 different actions**:
- **list card actions:** here, hands, guard, sail, craft, sell, sell-pack, exchange, vault;
- **popup actions:** keeper, crew, guard, build, improve, promote, rename, release, transfer;
- **offers:** accept, dismiss, reclaim.

Each holding card shows a facts line, a grid (keeper · per pass · yields), where it is, who lives there, standing
work, its features with levels, store, vault and armory. **Then the popup shows most of it again, alongside the
controls.** The code's own comment, from the last pass, names the problem: *"READING … this is for DOING. They were
interleaved, so neither worked."* We separated reading from doing inside the popup. **The list never got the same
treatment**, and the screen has grown every week since.

## §2 — THE PROPOSAL: THREE LEVELS

**1 · A ground strip at the top: your whole estate in one line.**
It shows how many holdings, the **net per pass across all of them** (coloured, since a quiet drain is what a player
most needs to notice), and the alerts: *unkept · full · raided · offers waiting*. **Each alert is a link to the hold it
means.**

**2 · A card per hold, and the card only reads.**
Each card has:
- the image and name;
- the one facts line (`holdingFactsLine`, which is already shared);
- three numbers: **people · per pass · condition**;
- **one primary alert**, the most urgent thing about this place;
- **one button: Open.**

The inline selects and buttons move off the card. On a phone the card is one row high.

**3 · The place page (it replaces the popup), with tabs by job:**

| tab | holds | the actions that live there |
|---|---|---|
| **Overview** | facts, image, where, what it makes, per pass, its story | rename · appearance · portrait |
| **People** | keeper, crew, guard, residents, band beds, standing work | appoint keeper · add hands · post a guard · stand down · **pick from Your People** (SNG-650), where each person shows what else they already keep |
| **Build** | rooms used and free, features with levels, promotion offer, improvements | build · raise a feature · promote · apply a craft |
| **Store & money** | store, vault, armory, debts, wages | sell the store · sell from your pack · change money · vault in/out · make gear. ⚠️ **The actions that need you there are shown greyed with *you must be here* rather than hidden.** Today they simply vanish when you're elsewhere, and the player can't tell what's possible |
| **Defence** | guard strength, `defenceOf`, what it watches, recent raids, **the powers whose reach touches this ground** (from the SNG-634 powers, C7 interest and approaches) | post a guard · answer an approach |
| **Records** | history, holding events, former keepers | give it up · hand it over · take back |

**"To review" becomes an inbox** above the cards. It shows a count and each offer's hold by name, and every offer
opens the tab it's about.

## §3 — WHAT DOESN'T CHANGE

**No engine change.** Every number and sentence comes from the same readers as today: `holdingLedger`, `yieldsFor`,
`residentsOf`, `roomOf`, `defenceOf`, `holdingFactsLine`, `featuresOf`, `vaultOf`, `storeWorth`. **The list and the
page stay one source**, as SPEC_holdings_screen §3/§4 required.

## §4 — ⬜ FOR ERIK, BEFORE CCODE BUILDS

1. **Tabs, or one long page with sections?** Tabs are cleaner on a phone. One page lets you read a place end to end.
   I'd recommend tabs.
2. **Should the People tab and the new People screen (SNG-650) be the same view filtered to this place?** I'd say yes,
   so there's one list of people with a filter.
3. Want me to **mock it up as a design first**, so you can react to it before a line of code?

— Aevi, PO
