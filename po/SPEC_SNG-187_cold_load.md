# SNG-187 — The 15-second cold load

**Author:** Aevi (PO) · 2026-07-19 · Erik-reported from DevTools. Outcomes; engineering is CCode's.
**Measured, with the number and the cause.**

---

# §1 — THE MEASUREMENT

Erik's DevTools, live, at v1.8.156:

| metric | value | verdict |
|---|---|---|
| **Largest Contentful Paint** | **15.30 s** | **poor** (threshold is 4 s) |
| Cumulative Layout Shift | 0 | good |
| Interaction to Next Paint | 0 ms | good |

**CLS and INP are clean.** Nothing is wrong with rendering or interaction. **This is purely a load
problem**, which narrows it to one place.

# §2 — THE CAUSE: 252 files, fetched one at a time

`engine/state.js :: loadContent` awaits inside a `for` loop **eleven separate times** — abilities,
core items, valley items, **locations (96 files)**, **npcs (42)**, events, companions, encounters
(19), lore, quests:

```js
for (const path of valley.provides.locations) {
  const loc = await fetchJSON(`content/packs/valley/${path}`);   // ← waits for the previous one
  …
}
```

**252 JSON files, strictly sequential. `Promise.all` appears zero times in the file.**

Every request waits for the one before it to complete. At a typical CDN round-trip of 40–80 ms,
**252 sequential requests is 10–20 seconds of pure latency** before transfer time is even
considered. That is the observed 15.30 s.

**It is not a payload problem.** 1.7 MB of content and 1.3 MB of JS is unremarkable, and GitHub Pages
gzips it. **The bytes are fine; the waiting is the bug.**

# §3 — OUTCOMES WANTED

1. **Fetch each manifest group in parallel.** Every one of those loops reads a list that is known in
   full before the first request. `Promise.all` over the group turns 252 sequential round-trips into
   roughly **eleven waves**. This is the whole fix and it is a small one.
2. **Failure behaviour must not regress.** Two loops today are individually `try`-wrapped so one bad
   file does not kill the load (valley items, quests). Parallelising must preserve that — a rejected
   fetch inside a `Promise.all` fails the whole batch. **`Promise.allSettled` where the current code
   tolerates a miss**, plain `Promise.all` where it does not.
3. **Order-independence must be verified, not assumed.** Some of these loops build maps keyed by id
   where later entries could overwrite earlier ones. Parallel resolution changes completion order.
   **Check each loop for last-write-wins before parallelising it** — this is the one place the fix
   could silently change content.
4. **Cold load target: under 3 s** on a normal connection. Under 2 s would be better and is probably
   reachable.
5. **Something on screen before content finishes.** Even parallelised, the roster does not need the
   full corpus to paint. LCP measures the first *meaningful* paint, not readiness.

# §4 — WHAT NOT TO TOUCH

**Prompt caching is already correct** — `engine/claude.js` puts `cache_control` with a 1h TTL on the
system block and folds up to 4 breakpoints, deliberately avoiding blocks too small to cache. It is
well done and it is not related to this. **Leave it alone.**

# §5 — SECOND ORDER, ONLY AFTER §3

- **252 files is a lot of files.** Once parallelised, measure again before considering bundling
  per-pack manifests into single payloads — the fix above may make it moot, and a build step is a
  real cost.
- `app.js` is 538 KB unminified. Worth knowing; not the cause here.
- Erik's tools: **PageSpeed Insights** (`https://pagespeed.web.dev`) for Lighthouse + field data;
  **CrUX** (`https://developer.chrome.com/docs/crux`) needs real traffic and will likely return
  nothing for this site.

# §6 — VERIFICATION

**Erik's browser-leg, same panel, same page.** LCP before and after, stated as numbers. A green unit
test proves nothing here — this defect is made entirely of latency, and latency does not appear in a
test that reads from disk.
