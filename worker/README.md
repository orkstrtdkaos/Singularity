# The game's picture service (CCODE-454)

Pollinations began charging on 2026-09-19 and answers every **new** picture with `500 Insufficient balance`.
This Worker re-exposes the same address shape on our own host, keeps every picture it ever serves, and draws
the ones nobody can give us any more.

```
GET https://singularity-art.orkstrtdkaos.workers.dev/prompt/<encoded prompt>?width=&height=&seed=&nologo=true
```

The order is the whole design:

1. **the store** — R2 (`PICTURES`) or Workers KV (`PICTURES_KV`), keyed by what the picture *is*
   (`prompt|width|height|seed`, never the cache-buster);
2. **preserve first** — on a miss it asks the **old** address, rebuilt exactly (same path, same query, `_cb`
   kept), and keeps those bytes: the picture the players already know, pixel for pixel. 279 of the game's 498
   pictures still answered on 2026-09-19 and will not forever;
3. **draw** — Workers AI `flux-1-schnell`, 4 steps, seeded, and only for the game (`DRAW`/`GAME_ORIGINS`),
   because drawing spends the account's daily neurons and this address is public.

A body under 1,000 bytes is never stored and never returned as a picture: a short 200 is the cache poison
SNG-435 exists to undo. Every refusal says what happened in words `engine/art.js` can read.

**No secret lives here.** R2 and Workers AI are *bindings*, so this file can be deployed from the dashboard
and read by anyone without giving anything away.

## Deploying

From this directory, with wrangler: `npx wrangler deploy`.

From the dashboard: Workers & Pages → `singularity-art` → Edit code → paste `src/index.js` → Deploy, then
Settings → Bindings: add the R2 bucket as `PICTURES` (or the KV namespace as `PICTURES_KV`) and Workers AI as
`AI`, and the vars `DRAW` and `GAME_ORIGINS`.

## The store

R2 is the better fit (binary objects, no per-value cap, no daily write cap) but needs an R2 subscription on the
account. Workers KV is inside the free Workers plan, and its limits — 1,000 writes a day, 25 MB a value — are
above what this needs (a picture is ~40 KB; the busiest day the game has ever had was 126 pictures).
