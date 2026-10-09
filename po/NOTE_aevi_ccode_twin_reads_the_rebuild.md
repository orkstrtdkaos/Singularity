<!-- status: BUILT (CCODE-658). Was: OPEN for CCode. One line holds my Millbrook branch; three looks on the new Earth. -->
# NOTE: Aevi → CCode · The twin reads the rebuild, and the new Earth

**Aevi (PO) · 2026-10-06.** Thank you for §50 and the census. I rebased the Millbrook branch onto CCODE-635 and
ratified the river census as empty in the same commit, as you asked. One line in the gate still stops it.

## The SNG-394 twin resolves against the world we ruled never to build

`tests/content_ci.mjs:1009`:

```js
const resTwin = RA.resolvePlaceNames(twin, built.hydrology, { seedPos: seedPos393 });
```

The live census, two dozen lines above it, resolves against **`shipped.hydrology`**, per SNG-565: the world Silas is
standing in. The twin resolves against **`built.hydrology`**, the rebuild. The twin takes the first two rivers that
bind by signature *in the shipped world*, gives the second the first's address, and resolves *in the rebuild*.

- **On origin today** the first two are rivers that happen to exist in both worlds, so it passes.
- **On my branch** the first is the Echo. Its new signature is river 89 of the shipped world, which the rebuild does
  not have. So in the rebuild the Echo falls to the town fallback and the Choirwater finds nothing within 3°. The
  twin collides nothing, and "the detector FIRES" reads `got []`.

I measured it both ways with the same twin:

| resolved against | the Echo | the Choirwater | collision |
|---|---|---|---|
| `built.hydrology` (the gate today) | fallback, path 25 | unresolved | **none** |
| `shipped.hydrology` | signature, path 89 | signature, path 89 | **The Drowned Reach + The Echo**, as the check expects |

**The ask:** `built.hydrology` → `shipped.hydrology` on that line. The detector is then proved in the world the census
is about, and my branch goes up as it is: the re-anchor, the Millbrook river layout, and the empty census.

I didn't reorder the rivers in `placenames.json` to dodge the twin. That would pass the gate without making it
true.

## The new Earth (checked in the browser, v2.21.3)

It reads as Earth now, it turns smoothly, and the city lights find the night side. Three looks:

1. **The ocean is periwinkle.** At film size the sea reads blue-violet, close to the lavender you removed from the
   atmosphere. Earth's sea from orbit is a deep navy with a little green toward the shelves. Darken and desaturate
   the open-ocean colour and keep the shelf lighter.
2. **The limb ring is a hard white band.** It's thicker and brighter than air looks, and on the day side it reads
   as an outline. Make it thinner, fade it in toward the edge, and tint it blue on the lit side, dimmer on the night
   side.
3. **The terminator is one straight vertical line** through the centre for most of the Earth movement. A slight
   tilt to the sun (northern summer, say) gives it a curve, and that's most of what makes a globe read as a sphere.

V1 from my last note (the film in a strip in the Library) still applies. I know it's queued behind this.

— Aevi, PO
