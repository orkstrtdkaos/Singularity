<!-- status: CCode → Erik. FIXED (CCODE-566, v2.15.6). Your sail list had shrunk to FIVE records: the Made Gate has one connection, and four of the five were stretches of road the GM named in passing. The 158-place authored world was not in it at all. Now grouped by region, nearest first — 144 places across 38 regions from the Annex. ⛔ And the option at the top of your screenshot was a grown duplicate: the hold named "Stillwater's Trouble" is 195 days away, not under a day -->
# CCode → Erik, 2026-09-29. The sail list

**Fixed — CCODE-566, v2.15.6**, 32 of 32 green, 4,194 checks. You were right twice over.

## ⛔ Where the list came from

It was built from `the place she stands in`'s connections **plus every location this save has ever grown**. On your
save that comes to **five records** — because the Made Gate has exactly **one** connection, and four of the five are
stretches of road the GM named while you walked them:

| what you were offered | what it actually is |
|---|---|
| Stillwater's Trouble — under a day | a **grown** record in the valley, minted in transit |
| The Road From Kindly Rest To Standing Annex — 1 day | a road |
| The Waygate Path — 117 days | a road |
| The Passage Below the Unlit Deep — 205 days | a passage |

⛔ **And the 158-place authored world was not in the list at all.** Every settlement, every gate yard, every seat of a
power — none of it. That is the half you noticed.

⚠️ **The top option was also wrong about its distance.** There are two records named *Stillwater's Trouble*: the hold
(`the_old_warden_post`, in the Palelands) and a grown copy in the valley minted as transit. You were being offered the
copy at "under a day". **The real one is 195 days away**, and that is what the list says now.

## ⛑ What it does now

The whole world, grouped under its region, nearest region first — from the Annex that is **144 places across 38
regions**:

```
  ── valley
     The Watershed Road          under a day
     Millbrook                   under a day
     The Reclamation Site        under a day
     Echo River Crossing         1 day            … and 7 more
  ── the center
     The Quiet House             42 days
     The Crossing                42 days
     the Hub Yard                43 days
     The Axis Gate               43 days          … and 4 more
  ── the echo vale …
```

Anywhere she cannot reach is still shown, greyed, with the reason — a ship refusing a landlocked place says so rather
than vanishing.

⛑ **Roads are struck by the minter's own flag** (`_mintedAs: "transit"`), never by reading names — "The Waygate Path"
and "The Ent Grove" are both roads, and no rule about names would separate those from a real place. Measured: **zero
authored places carry that flag**, so the filter cannot reach the settled world, and §394 gates exactly that so an
author tagging a settlement would fail loudly rather than quietly losing it from your list.

⚡ One of my own, worth noting: I first read region names off `CONTENT.rules.regions`, which **does not exist** — I
guessed at the bag instead of looking. The wiring audit's unauthored-key ratchet caught it in one run, which is what
that ratchet is for: a fallback on a key nobody authored behaves exactly like the real thing until you try to turn it.
