# PROPOSAL — replacing Pollinations. The contract is the problem, not the provider.

**Aevi · 2026-09-19 · for CCode.** Erik: Pollinations stopped the keyless free path. Verified — their free
"spore" tier is now ~0.01 pollen/hour (about a cent) and **an API key is required**; the project's own README now
leads with Pollen credits at ~$1/Pollen and secret keys.

---

## ⛔ §1 — MEASURE THE CONSTRAINT BEFORE SHOPPING

**The game is a PUBLIC STATIC SITE on GitHub Pages.** No server, no backend, no place to hold a secret. That is
*why* a keyless URL provider was chosen, and it is the whole of the problem.

`engine/art.js` builds one thing:

```js
`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt+", "+style)}?width=&height=&seed=&nologo=true`
```

⛑ **The contract that has to survive, in four parts:**

| | why it is load-bearing |
|---|---|
| **a plain `<img src>` GET** | no `fetch`, no CORS preflight, no async job-poll. The browser fetches it. |
| **no key in the URL** | the source is public. **Any key shipped to the client is a published key.** |
| **a deterministic seed** | `seedFrom(location.id)` etc. — the same subject must regenerate the same image. |
| **cached by URL** | the browser and the CDN both cache on the address. This is the performance model. |

⚠️ **AND THE URLS ARE PERSISTED.** `characters/player-*/char-*.json` carry **50+ absolute pollinations URLs in a
single save.** Under SNG-035 born-with-image, the URL *is* the record's field. ⛔ **So this is not a "new images
stop working" outage — every image already minted is a dead link.** That is the part the provider comparison
misses entirely.

---

## ⚠️ §2 — EVERY OPTION ON THE LIST FAILS THAT CONTRACT

Checked against the four requirements, not against the marketing:

| candidate | verdict |
|---|---|
| **Cloudflare Workers AI** | ⛔ **as a direct swap, fails** — needs a key and a POST body. ⚑ **But it is the right engine BEHIND a proxy.** See §3. |
| **Puter** | ⛔ JS SDK, not `<img src>`. Its model is **user-pays** — every player would need their own Puter account. Fails on contract and on audience. |
| **Replicate** | ⛔ key + POST + **async predict-then-poll**. No free tier, only trial credit. Fails hardest of the set. |
| **GenTube** | ⛔ **no API at all** — browser only. Cannot be called from a game. |
| **Craiyon** | ⛔ no documented keyless API; watermark on the free path. |
| **Krita AI Diffusion** | ⛔ a local desktop plugin. Not a service. Irrelevant to a web game. |

⛑ **The pattern: Pollinations was not one provider among many. It was the only one selling the CONTRACT.** No
remaining vendor sells a keyless seeded image URL, so **we stop shopping for one and build the contract ourselves.**

---

## ⚑ §3 — THE APPROACH: BE OUR OWN POLLINATIONS, AND STOP RENTING THE IMAGES

**A Cloudflare Worker that holds the key and re-exposes the exact URL shape, backed by R2 so a picture is minted
once and owned forever.**

```
GET https://art.<domain>/prompt/<encoded prompt>?width=&height=&seed=
   → key = sha256(prompt|w|h|seed)
   → R2 hit?  return the stored bytes, immutable cache            ← the usual path, costs nothing
   → miss?    Workers AI @cf/black-forest-labs/flux-1-schnell
              ⛔ reject anything under IMAGE_MIN_BYTES — do NOT store, do NOT cache
              → put to R2 → return bytes
```

**What this buys, in order of value:**

1. ⛑ **The key never reaches the browser.** It is a Worker secret. The static site stays static.
2. ⚑ **`art.js` changes in ONE function.** `pollinationsURL()` is the only place the host appears, and
   `imageURLFor` is already the single documented choke point (CCODE-193 §2 — *"every mint passes through here"*).
   Style, sizes, seeding, floors, compose-before-floors all keep working untouched.
3. ⛔ **IT KILLS THE WORST BUG IN THE PIPELINE, STRUCTURALLY.** `art.js` carries a long comment: pollinations
   answers a rate-limited request with **HTTP 200 and a zero-byte body**, Cloudflare caches it, and the poison is
   byte-identical in headers to a healthy hit. **We wrote `bustedURL`/`isBustedURL` to live with that.** Owning the
   Worker means we own the response and the cache header: **a short body is never stored and never cached.** The
   class of bug ends rather than being worked around. ⚑ *Keep the buster — it heals the already-poisoned records.*
4. ⚑ **R2 makes the mint permanent.** After first generation the image is **ours**, not the vendor's. ⛔ **The next
   time a provider changes its terms, nothing breaks** — which is the real lesson of this week, and it is worth
   more than which model we pick.

---

## ⛑ §4 — THE MIGRATION IS CLEANER THAN IT LOOKS

⚑ **The old URLs are not opaque — they carry their own prompt and seed.** `…/prompt/<encoded prompt>?…&seed=N`.
**Everything needed to re-mint is IN the dead link.**

```
on read, if url.host === "image.pollinations.ai":
    strip any &_cb= buster · decode the prompt · read width/height/seed
    rebuild against the new host, SAME prompt, SAME seed
```

⛑ **Same seed means the same intent, and with R2 the re-mint is permanent.** ⚠️ **The picture WILL differ** —
different model, different sampler. **Say that to Erik plainly rather than implying a pixel-identical restore.**
Faces and places will shift once, and then never again.

⬜ **Rewrite lazily on read, not in a batch pass over every save** — a save touched is a save migrated, and nothing
is rewritten that nobody looks at.

---

## ⬜ §5 — WHAT I HAVE NOT VERIFIED, AND WILL NOT ASSERT

| open | who |
|---|---|
| **the real mint rate.** Free budget is ~230 FLUX images/day shared across the whole account. Born-with-image means steady-state is *new records only*, which is probably far under — ⛔ **but I measured 50 URLs in ONE save and did not measure mints per day.** Measure before trusting the headroom. | CCode |
| **is `flux-1-schnell` on the free allocation**, and its neurons per 1024×320 image | CCode |
| **edge-cache behaviour on a Worker response** — whether `cache-control: immutable` gives us the same cheap repeat-hit pollinations gave | CCode |
| **the domain.** A Worker needs a hostname; `workers.dev` is free and adequate. | Erik |
| **SDXL is 10–30s/image; schnell is the fast path.** If latency reads badly in-game, that is a model choice, not an architecture change. | CCode |

⚠️ **A second provider behind the same Worker is a later slice, not this one.** ⛑ **The Worker IS the abstraction —
once the contract is ours, swapping what fills it is a config change.** That is the point of doing it this way
rather than picking the next free vendor and repeating this conversation in six months.

— Aevi
