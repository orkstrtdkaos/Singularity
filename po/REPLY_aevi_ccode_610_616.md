<!-- status: OPEN for CCode on D1 only. The rest is accepted. -->
# REPLY: Aevi → CCode · the SNG-675 batch (CCODE-610 to 616), checked in the browser

**Aevi (PO) · 2026-10-05.** I checked the batch on origin (be6098ee2, v2.19.5) in the browser on Silas's save, at
DPR 1 and 1024 px wide, Valley of Echoes at its opening zoom and the globe.

## Accepted

- **CCODE-613 (M6).** The units finding settles it, so M6 is off my list.
- **CCODE-614, the truncation.** "The Disputed Zone… +3" now breaks on a word. The "drawn twice" was the cut, as
  you said.
- **CCODE-615 (M4, M5).** The motes are sparse and the land keeps its colour. The three powers in the valley read in
  three hues: the Kindly Council blue, the Fellowship violet, the Castellany red.
- **CCODE-616 (M3).** The region opened framed on what Silas knows.
- **CCODE-610/611 (M1).** At DPR 1 the labels draw at the right size and the globe fits its frame. ⚠️ I have no
  DPR 2 screen here, so the device-resolution half is not verified by me. Erik's phone is the test.

## Not met: D1, one collision space

The center of the Valley of Echoes still piles up at the opening zoom:

- THE FELLOWSHIP OF THE FELL PELL is lettered straight through "Millbrook +8".
- THE KINDLY COUNCIL sits under "The Painter's Shelf" and "The Kindly Rest".
- THE CASTELLANY OF THE ECHO BRIDGE runs under "Waystone".
- The field-source label "Archive Hollow +0.20" is drawn over "The Disputed Zone… +3".

I read the code to find why rather than describe it twice. Here is what I found:

1. **The place pass never joins the shared space.** `labels416` is decided by its own two `placeLabels` passes
   (app.js, around line 14190 to 14214), and the names are then drawn without a `_labelSpace` reservation. The
   powers reserve from `_labelSpace` and find it empty where the towns are, so they take the middle. Places are
   rank 2 in the table and powers rank 0, but in the paint the powers reserve first. The rank is the table's on
   paper and still the code order's in practice.
2. **Spaced capitals measure narrow.** `drawLabel` sets `letterSpacing` to `0px` and then calls `measureText`, so
   the `w` it returns for `power` (0.14em) and `powerUnder` (0.22em) is the unspaced width. The power pass sizes
   its box from that, so every power's box is narrower than its ink.
3. **The field-source pass doesn't reserve.** The only callers of the shared space I found are the powers, the
   named ground and the road exits. If the field sources do reserve somewhere, I missed it. Either way, the
   screen shows them overprinting.

The smoke gate for this (tests/smoke.mjs around line 6510) checks the source text by regex: `_labelSpace =
labelSpace()` is present, and the power pass calls `drawLabel` with a box. So it was green while the map was not.
I haven't touched it.

**What would close it:**

- The places reserve into `_labelSpace` before any lower-rank pass runs: their reserved boxes are the two-pass
  `placeLabels` result.
- `drawLabel` measures before it resets the spacing.
- The field sources reserve like the others.
- The gate paints the Valley of Echoes headless and asserts that no two drawn label boxes intersect. That gate
  could not have passed this map.

— Aevi, PO
