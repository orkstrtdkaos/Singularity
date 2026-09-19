# What an image replacement must fit, and the 504 pictures that are only cached

**CCode · 2026-09-19 · for Aevi, as you look at Pollinations replacements; and Erik, for one decision at the end.**

## What broke (measured)

- **Every new picture fails.** `image.pollinations.ai` answers HTTP 500 on every model, with *"Insufficient balance. This
  request costs ~0.0001 pollen, but your available balance is 0.0000"*. A `flux` request is served by the paid `sana`.
- **Cached pictures still load.** That's why Erik's card showed Aldric while the viewer's new draw failed.
- **Shipped in v2.2.3:** the viewer and the gallery now say the service is refusing, instead of "try Draw again".
- **The probe deletes nothing.** A refusal reads as `unknown`, and `mintAction` leaves `unknown` alone. No stored
  picture has been lost to this.

## The seam, which is narrow

| what | where | a replacement… |
|---|---|---|
| **builds every picture's address** | `pollinationsURL` in `engine/art.js`, called only from `imageURLFor` | swaps this one function |
| **recognises a generated picture** | `isGeneratedImage` (a host regex) | adds its host |
| **heals a poisoned cache entry** | `bustedURL`, `verifiedImageUrl`, the spaced mint queue | **Pollinations-specific.** It fixed their 200-with-zero-bytes cache. Drop or keep per the new service's behaviour |
| **reads a refusal** | `serviceRefusal` | learns the new service's error shape |

## What the pipeline assumes, which is your checklist

1. **Address-based (GET).** A picture is a URL an `<img src>` can load, minted before anything is fetched.
   - **A POST-only API breaks this.** Most paid ones are POST-only: fal, Replicate, OpenAI, Stability.
   - It needs a fetch step, and **somewhere durable to keep the bytes.**
   - Saves are pushed to GitHub, so a picture stored inside a save would bloat every save. 504 pictures are in play now.
2. **The same subject gives the same picture, forever.** This is your stability rule. It needs a **seed** and must be
   deterministic for a given prompt, seed and size.
3. **Sizes:** `IMG_SIZES` by kind, including wide scenes (1024×320).
4. **CORS on the picture's address.** The byte probe `fetch`es it.
5. **A key, if it charges.** It must never go in a save or the repo. Two ways:
   - each player enters their own in Settings, the way the GM's key works;
   - a small server-side proxy holds it.

   A key inside a picture's address would be persisted into saves, so a GET service with `?key=` needs the key added
   only at display time.
6. **Rating floors:** `ratingLevel` and `isMinorSubject` shape the prompt. The service's own filter should not fight them.

## ⬜ Erik: the 504 pictures only exist in Pollinations' cache

- **Scope:** 504 distinct pictures across 16 save files:
  - Brynjar 207;
  - Silas 159;
  - Loki 96;
  - Cellaceron 48;
  - and the rest.
- **Still served:** I sampled five of Silas's with header-only requests. All five are cache hits and still serve.
- **Why act now:** a new service won't bring them along. If Pollinations' cache drops them, they are gone, except the
  ones someone saved to a device with ⤓ Save.
- **Proposal: download them once, now, while they still load, into durable storage.** I didn't download anything
  without asking. Two questions:
  - May I?
  - Where should they go? The repo, a separate images repo, or somewhere else?
- **Size:** unknown until downloaded, because the service doesn't send a length. Aevi measured single pictures at about
  18–26 KB, so it is likely in the low tens of megabytes. That's a guess, not a measurement.

— CCode
