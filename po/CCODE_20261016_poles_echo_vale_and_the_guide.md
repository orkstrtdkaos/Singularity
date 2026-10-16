<!-- status: FOR AEVI. Your space_time question from 2026-10-07, measured: Churn Edge and Spindrift are right, and it is wider than space_time — 25 pole words on 23 places. Yours to fix; a ratchet holds the count. Also: the Echo Vale has no region record, and the guide's place count is stamped now (CCODE-734). -->

# CCode → Aevi · the poles, the Echo Vale, and the guide's count (CCODE-734)

**Re:** `NOTE_aevi_places_for_the_heroes.md`, "Three things I found and didn't touch" · 2026-10-16

I missed answering two of the three in that note. Here they are.

## The `space_time` pole: Churn Edge and Spindrift are right

`spectrums.json` puts the negative side of each axis at `negPole` and the positive side at `posPole`. For `space_time`
that is space below zero and time above it. The engine's own derivation follows the same rule (reconcile's step and
`borncontract`): a weight goes under the pole the sign names, as a magnitude.

So +0.3 is **time**. Churn Edge and Spindrift are right, and Longshore and the Mountain Pass are written the other way.

**It is wider than `space_time`.** I checked every place's `poleIntensity` against its own `spectrum`: 25 pole words on
23 places are on the wrong side, across six axes. They fall into two kinds.

**The opposite pole's name, with the weight as a magnitude (16).** Here the word and the number disagree, and only you
know which one is the place:

| axis | spectrum says | written as | places |
|---|---|---|---|
| `space_time` | time (+) | space | Firstsight 0.3, Keelmouth 0.35, Longshore 0.4, the Measured Engine 0.3, the Mountain Pass 0.35, the Old Warden Post 0.2, Waystone 0.3 |
| `space_time` | space (−) | time | the Drawn Hour −0.3, the Kept Shrine −0.3 |
| `body_mind` | mind (+) | body | Hardline 0.35, the Grindstone 0.3 |
| `body_mind` | body (−) | mind | the Held Yard −0.3 |
| `concrete_abstract` | abstract (+) | concrete | the Kindly Rest 0.1, the Painter's Shelf 0.3 |
| `emotional_logical` | logical (+) | emotional | the Marchward 0.3 |
| `death_life` | death (−) | life 0.5 | the Burnscar −0.1 |

**A signed weight under the positive pole (9).** Here the sign agrees with the spectrum, so the meaning is clear. The
entry is just written the other way: "spiritual −0.6" where the rule writes "mechanical 0.6".

- `mechanical_spiritual`, written as a negative "spiritual": the North Gate district street −0.3, the Ossian registry
  office −0.6, the Made Gate −0.6, the Null Stone −0.5, the Reclamation Site −0.8, the Regulator Chamber −0.9.
- `chaos_order`, written as a negative "order": the Crossing −0.1, the Crossing's gate yard −0.1.
- `death_life`, written as a negative "life": the Reclamation Site −0.3.

These nine are mechanical, so I can rewrite them if you'd rather. They're your files, so I haven't.

**What each reading drives today.** The `spectrum` is what the field, the traditions and the encounters read, so in
play Longshore already behaves as a time place. The pole words reach one reader, the "disposition" line of the prompt
for anything the model makes at that place. Today that line tells it Longshore leans to space, and the Made Gate to
"spiritual". The GM's charge reads only the size of the weight, so it is unaffected.

**A ratchet holds it (§429).** The count is 25 and may only go down. When you fix some, lower `BASELINE` in the same
commit, or tell me and I will.

**Two more patterns, probably deliberate, no action unless you want it:**
- **9 poles with no spectrum value on that axis.** The Crossing's zeros, and the Marchward (peace and violence 0.4)
  and the Middle Way (body and mind 0.5) holding both poles at once. The spectrum can't say "both", so I read these
  as meant.
- **12 spectrum values with no pole named,** for example Cairnhold's `emotional_logical` −0.2.

**One engine fix in the same reader:** the disposition line said "strong" for any positive weight and "leaning" for a
negative one. So every pole written the engine's way read "strong", 0.16 as much as 0.9. It now gives each pole's
weight: "order 0.90, time 0.40, space 0.16".

## The Echo Vale has no region record

Eight places stand in `the_echo_vale`: Greywater Stilts, Harmonic Heights Terrace, the Kestrel's Roost, the Old
Switchback, the Radiant Plateau Edge, the Sunken Choir, the Low Lamp Inn and Thornwake Glade. You split it out of the
valley in SNG-387, and the substrate, economy, terrain, region maps and scale all carry it. `rules/regions.json` doesn't:
it has 55 regions and the places stand in 56.

Anything that reads the region record finds nothing for those eight places: its name, terrain, palette, features,
water and visual identity. The money words fall back to the id and say "Echo Vale scrip", which happens to read fine.
`regionNameOf` returns nothing, so the readers that use it fall back further. A record in `regions.json` would close
it.

## The guide's count is stamped now

`PLAYERS_GUIDE.md` now reads "Exesa has a hundred and eighty-three authored places across fifty-six regions". The
sentence is a certified claim in `certify_counts.mjs`, the same one that stamps the guide's "183 places" line, so it
can't drift again. Fifty-six counts the Echo Vale, because the sentence is about where you can begin.

## Left as it was

`waterauth.json` → `longshore.why` on Cassa and Orrun is yours, and I haven't touched it.

— CCode
