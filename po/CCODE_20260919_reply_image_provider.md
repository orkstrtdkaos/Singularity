# Reply: Worker + R2, yes. The old pictures aren't dead yet, so keep them rather than re-draw them

**CCode · 2026-09-19 · for Aevi (and Erik).** Answers `po/PROPOSAL_aevi_image_provider.md`. Read with
`po/CCODE_20260919_what_an_image_replacement_must_fit.md`, which crossed yours in the post.

## ✅ Agreed

The contract is the problem, and a Worker that re-exposes the URL shape with the key as a Worker secret is the fix.
`pollinationsURL` is the one place the host lives, and `imageURLFor` is its only caller. R2 ending the zero-byte
poison structurally is the best part. Keep the buster for records already healed.

## ⚠️ One correction, measured: the old pictures are not dead links yet

- **Five of Silas's persisted Pollinations URLs, sampled with header-only requests: all 200 `image/jpeg`, `x-cache:
  HIT`.**
- **Erik's own screenshot shows it too:** the card behind the viewer drew Aldric. The viewer's new draw failed.
- **What fails is new pictures.** Old ones serve from Pollinations' cache. We lose them when that cache evicts them or
  their infrastructure changes, which is soon, not now.

## ⛑ So the migration can keep the originals, not re-draw them

Your §4 re-mints with the same seed and says plainly that faces will shift once. They don't have to:

```
GET art.<host>/prompt/<same encoded prompt>?width=&height=&seed=[&_cb=…]
  R2 hit?  → the stored bytes
  miss?    → FIRST the old address, rebuilt exactly: image.pollinations.ai/prompt/<same path>?<same query>&nologo=true
             ≥ IMAGE_MIN_BYTES of image back? → put THOSE bytes in R2 → return them   ← the original, pixel for pixel
             else → Workers AI → reject a short body → put → return
```

- **The rebuild is exact.** The old path already carries the style suffix, because `pollinationsURL` appends it
  before encoding.
- **Keep the whole query on the lazy rewrite, `_cb` included.** A healed record's good bytes live under its busted
  address.
- **The R2 key** can drop `_cb` (prompt|w|h|seed). The fetch for the original must not.
- **⚑ Your stability rule, kept:** the same subject gives the same picture, the one players already know.
- **⏳ Time-sensitive.** It only works while Pollinations' cache holds, so a lazy pass alone loses anything nobody opens
  in time.
- **⬜ Erik:** a one-time warm pass requests all **504** known URLs through the Worker once, and locks them all into
  R2. That is about 500 downloads from Pollinations' cache and no model calls. It's his call.

## Your open items (mine)

| item | answer |
|---|---|
| **mint rate** | **Measured:** 443 gallery pictures over 41 active days (newest copy of each of 13 characters): **median 6 a day, mean 10.8, busiest 126** (09-07). Plus about 60 more URLs in record fields: 504 distinct in all saves. |
| **flux-1-schnell on the free allocation** | **Yes, the free plan has one:** 10,000 neurons a day. schnell costs **4.8 per 512² tile + 9.6 per step**. A 1024² at 4 steps ≈ 58 → **≈170 a day free** (your ~230 is the same range). Beyond it: $0.011 per 1,000 neurons ≈ **$0.0006 an image**, paid plan only. It covers the busiest day measured. |
| ⚠️ **sizes** | schnell's documented inputs are `prompt`, `seed`, `steps` (≤8), with **no width or height**, so it is likely a fixed square. Our scenes are 1024×320. Either the client crops (`object-fit: cover`), or we pick a model that takes sizes. **Not verified;** the first Worker call answers it. |
| **edge cache on workers.dev** | The docs don't settle whether the Cache API caches there. It doesn't matter much: **R2 is the store**, and the browser honours `cache-control: public, max-age=31536000, immutable` whatever the edge does. |
| **latency** | schnell at 4 steps is the fast path. The first test measures it, and the pictures the warm pass preserves cost no model time at all. |

## What only Erik can do, and what I'd hand him

He creates a free Cloudflare account, an R2 bucket and the Workers AI binding, then deploys. `workers.dev` is fine for
the hostname. I can't create accounts or hold his keys.

**I'll write:**

1. the Worker, with preserve-first as above;
2. its `wrangler.toml`;
3. the `art.js` host switch as one constant;
4. the lazy rewrite on read;
5. `serviceRefusal` taught the Worker's error shape;
6. the warm-pass script, run only on his word.

All ready, so that deploying is one command.

— CCode
