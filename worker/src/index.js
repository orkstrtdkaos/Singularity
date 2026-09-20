/** ⛔ THE GAME'S PICTURE SERVICE (CCODE-454; Aevi's `po/PROPOSAL_aevi_image_provider.md`, my reply
 *  `po/CCODE_20260919_reply_image_provider.md`). Pollinations began charging on 2026-09-19 and answers every NEW
 *  picture with 500 "Insufficient balance", so the game cannot draw. This Worker re-exposes THE SAME ADDRESS SHAPE
 *  on our own host, stores every picture in R2 forever, and draws new ones with Workers AI.
 *
 *    GET /prompt/<encoded prompt>?width=&height=&seed=&nologo=true[&_cb=…]
 *
 *  ⛑ PRESERVE FIRST, AND THAT IS THE WHOLE POINT OF THE ORDER BELOW. 279 of the game's 498 pictures still serve
 *  from Pollinations' cache today and will not tomorrow. On an R2 miss this asks THE OLD ADDRESS, rebuilt exactly
 *  (same path, same query, `_cb` included), and keeps those bytes — the picture the players already know, pixel for
 *  pixel. Only when that is gone does it draw a new one, which is a new face, and a face should change at most once.
 *
 *  ⚠️ NEVER AN EMPTY 200. A zero-byte body is the cache poison SNG-435 exists to undo; a body under
 *  `MIN_BYTES` is refused with a status and a reason instead, which is what `serviceRefusal` and `mintAction` in
 *  engine/art.js are built to read. Nothing short is ever stored.
 *
 *  ⚠️ NO SECRET LIVES HERE. R2 and Workers AI are BINDINGS, not keys — this file can be read by anyone without
 *  giving anything away, which is why it can be deployed from the dashboard.
 */

const MIN_BYTES = 1000;                                   // engine/art.js IMAGE_MIN_BYTES — shorter than this is not a picture
const OLD_HOST = "https://image.pollinations.ai";         // where the pictures the players already have still live
const MODEL = "@cf/black-forest-labs/flux-1-schnell";
const STEPS = 4;
const A_YEAR = 31536000;

/** ⛔ CCODE-456 — A PICTURE DRAWN FROM A PICTURE. `flux-1-schnell` takes a prompt and nothing else; SDXL takes a REFERENCE (`image_b64`),
 *  how far it may move from it (`strength` 0–1), and a real width and height. So `?ref=<a picture this service already knows>` draws the
 *  new picture out of the old one — the way to keep a face the players know when the scene around it changes.
 *  ⚠️ THE REFERENCE MUST BE ONE OF OURS. It is resolved to a key in our own store (or preserved from the old service), never fetched from
 *  wherever a caller points: a public endpoint that fetches any URL on demand is an open proxy, and this one holds someone's account. */
const REF_MODEL = "@cf/stabilityai/stable-diffusion-xl-base-1.0";
const REF_STEPS = 20;

/** ⛔ WHO MAY SPEND A DRAW. Reading costs nothing; DRAWING spends the account's daily neurons, and this address is
 *  public. So an R2 hit and a preserved picture answer anybody, and a NEW drawing answers only the game — by the
 *  browser's own `Referer`/`Origin`, which is not proof, but is the difference between a bounded cost and an open
 *  tap. Set the `DRAW` var to "anyone" to open it, "off" to close it entirely. */
const GAME_ORIGINS = ["orkstrtdkaos.github.io", "localhost", "127.0.0.1"];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors() });
    if (request.method !== "GET" && request.method !== "HEAD") return refuse(405, "this address answers GET");
    if (url.pathname === "/" || url.pathname === "/health") {
      return new Response("the game's picture service — GET /prompt/<prompt>?width=&height=&seed=\n", { headers: { "content-type": "text/plain; charset=utf-8", ...cors() } });
    }
    if (!url.pathname.startsWith("/prompt/")) return refuse(404, "that is not a picture address");

    let prompt;
    try { prompt = decodeURIComponent(url.pathname.slice("/prompt/".length)); } catch { return refuse(400, "that address cannot be read"); }
    if (!prompt.trim()) return refuse(400, "a picture needs something to draw");

    const width = int(url.searchParams.get("width"), 1024);
    const height = int(url.searchParams.get("height"), 320);
    // ⚠️ A SEED IS NOT A SIZE. It was read through `int`, which caps at 4096 — and `seedFrom` in engine/art.js returns up to 99,999, so
    // every seed above 4,096 collapsed to the same number and two different pictures would have shared one key in the store.
    const seed = Math.abs(Math.trunc(Number(url.searchParams.get("seed")))) || 0;
    // ⚠️ THE KEY DROPS `_cb`. A cache-buster is a way of asking the OLD service again (SNG-435); it never meant a
    // different picture, and keying on it would store the same picture twice and lose the healed record's bytes.
    // ⚠️ …AND CARRIES THE REFERENCE. The same words drawn out of a different picture, or at a different strength, are a different
    // picture, so a key that ignored them would hand back the first one forever.
    const ref = url.searchParams.get("ref") || "";
    const strength = Math.min(1, Math.max(0.05, Number(url.searchParams.get("strength")) || 0.5));
    // ⚠️ …AND THE WAY IT WAS DRAWN. A probe that asked a different model with a different field is a different picture, and while the keys
    // were the same one probe's answer — FLUX.2's own sample image, branded in red — came back as the finished scene for every later ask.
    const how = ["j", "m", "field", "wrap", "mask", "maskfield", "maskas"].map(p => url.searchParams.get(p)).filter(Boolean).join("|");
    const key = await keyFor(`${prompt}${ref ? `|ref:${ref}|s:${strength}` : ""}${how ? `|how:${how}` : ""}`, width, height, seed);

    // ── 1 · the store
    const store = storeOf(env);
    if (!store) return refuse(503, "this service has no store bound yet, so it cannot keep a picture — nothing of yours is lost");
    const hit = await store.get(key);
    if (hit) return new Response(request.method === "HEAD" ? null : hit.bytes, { headers: { "content-type": hit.type, ...(hit.size ? { "content-length": String(hit.size) } : {}), ...kept("kept") } });

    // ── 2 · a picture drawn from a picture (CCODE-456) — never preserved from the old service, because it never drew this one
    if (ref) {
      const may = mayDraw(request, env);
      if (!may.ok) return refuse(403, may.why);
      if (!env.AI) return refuse(503, "this service has no drawer bound yet, so a new picture cannot be drawn");
      const from = await refBytes(ref, request, store);
      if (!from.ok) return refuse(400, `the reference picture could not be read: ${from.why}`);

      // ⚑ …and the same knobs for a PLAIN (JSON) call, so a different model and a different name for the picture field can be tried by
      // changing a URL. `@cf/stabilityai/stable-diffusion-xl-base-1.0` is documented to take `image`/`image_b64` and answers "input tensor
      // `image` is not present in the model" for both, so which deployed model actually has the tensor is a question only asking settles.
      const json = url.searchParams.get("j");
      if (json) {
        const field = url.searchParams.get("field") || "image";
        try {
          const input = { prompt, strength, num_steps: REF_STEPS };
          input[field] = field.endsWith("_b64") ? base64(from.bytes) : Array.from(from.bytes);
          // ⛑ AN INPAINTING MODEL REPAINTS WHERE THE MASK IS WHITE, so a mask that is white everywhere IS image-to-image. Workers have no
          // canvas, so the mask is a greyscale PNG written by hand, at the reference's own size (the model requires they match).
          if (url.searchParams.get("mask")) {
            const png = await whitePng(from.width, from.height);
            input[url.searchParams.get("maskfield") || "mask_image"] = url.searchParams.get("maskas") === "b64" ? base64(png) : Array.from(png);
          }
          if (url.searchParams.get("wh") !== "no") { input.width = width; input.height = height; }
          const out = await env.AI.run(json.startsWith("@cf/") ? json : `@cf/${json}`, input);
          const drawn = await bytesOf(out);
          if (!drawn || drawn.length < MIN_BYTES) return refuse(502, "that call was accepted and came back with nothing in it");
          const type = out instanceof ReadableStream ? "image/png" : "image/jpeg";
          await store.put(key, drawn, type, meta(`from:${json}:${field}`, prompt, seed));
          return new Response(drawn, { headers: { "content-type": type, ...kept("drawn-from") } });
        } catch (e) { return refuse(502, `${json} · field=${field} — ${String(e?.message || e).slice(0, 300)}`); }
      }

      // ⚑ CCODE-456 — FINDING THE SHAPE OF A CALL NOBODY DOCUMENTS. Cloudflare publishes FLUX.2's input as an opaque `multipart`, so the
      // field names are discoverable only by asking the model and reading what it says back. These four knobs (`m`, `field`, `wrap`, and
      // the presence of `ref`) make that a matter of changing a URL instead of redeploying, and every answer comes back as plain words.
      const flux = url.searchParams.get("m");
      if (flux) {
        const field = url.searchParams.get("field") || "input_image";
        const wrap = url.searchParams.get("wrap") || "buffer";
        try {
          const fd = new FormData();
          fd.append("prompt", prompt);
          fd.append(field, new Blob([from.bytes], { type: "image/jpeg" }), "reference.jpg");
          const req = new Request("https://ai.invalid/", { method: "POST", body: fd });
          const model = flux.startsWith("@cf/") ? flux : `@cf/black-forest-labs/${flux}`;
          // ⚑ `wrap=form` hands the FormData to the binding as it stands — the schema's opaque `multipart` may be how the docs SAY
          // "this model takes a multipart request" rather than a wrapper the caller has to build.
          const buf = wrap === "form" ? null : await req.arrayBuffer();
          const out = wrap === "form" ? await env.AI.run(model, fd)
            : await env.AI.run(model, { multipart: { body: wrap === "array" ? [...new Uint8Array(buf)] : wrap === "base64" ? base64(new Uint8Array(buf)) : buf, contentType: req.headers.get("content-type") } });
          const drawn = await bytesOf(out);
          if (!drawn || drawn.length < MIN_BYTES) return refuse(502, "that call was accepted and came back with nothing in it");
          await store.put(key, drawn, "image/jpeg", meta(`from:${flux}:${field}`, prompt, seed));
          return new Response(drawn, { headers: { "content-type": "image/jpeg", ...kept("drawn-from") } });
        } catch (e) { return refuse(502, `${flux} · field=${field} · wrap=${wrap} — ${String(e?.message || e).slice(0, 300)}`); }
      }

      try {
        // ⚠️ `image`, AS A PLAIN ARRAY OF BYTES. `image_b64` is documented but the deployed model answers "input tensor `image` is not
        // present in the model" for it; the array is what Workers AI's own img2img examples pass.
        const out = await env.AI.run(REF_MODEL, { prompt, image: Array.from(from.bytes), strength, width, height, num_steps: REF_STEPS, seed });
        const drawn = await bytesOf(out);
        if (!drawn || drawn.length < MIN_BYTES) return refuse(502, "the drawing came back with nothing in it");
        const type = out instanceof ReadableStream ? "image/png" : "image/jpeg";
        await store.put(key, drawn, type, meta(`from:${strength}`, prompt, seed));
        return new Response(drawn, { headers: { "content-type": type, ...kept("drawn-from") } });
      } catch (e) { return refuse(502, `the drawing failed: ${String(e?.message || e).slice(0, 200)}`); }
    }

    // ── 3 · preserve first: the old address, rebuilt exactly
    // ⚠️ EXACTLY means exactly: the old service caches by the whole address, so one extra parameter of ours turns a HIT into a MISS —
    // and a miss now answers "Insufficient balance", which reads as "the picture is gone" when it is not. Only `_debug`, which is ours
    // and never theirs, comes off.
    // (a string edit, not URLSearchParams, because re-encoding a query is its own way of changing the address)
    const theirs = url.search.replace(/([?&])_debug=[^&]*(&|$)/g, (m, p1, p2) => (p2 ? p1 : "")).replace(/[?&]$/, "");
    const address = `${OLD_HOST}${url.pathname}${theirs}`;
    // ⚑ `?_debug=1` SAYS WHAT THE PRESERVE ATTEMPT MET — it draws nothing and stores nothing. This exists because the first
    // deploy fell through to the drawer and the reason was invisible from outside: a picture that IS still out there must not
    // be re-drawn by mistake, and "it didn't work" is not a fault report.
    if (url.searchParams.get("_debug") === "1") {
      const out = { key, prompt: prompt.slice(0, 120), width, height, seed, address: address.slice(0, 300), store: store ? "bound" : "none", ai: env.AI ? "bound" : "none" };
      const tried = await keep(store, key, address, "preserved", { prompt, seed });
      out.preserved = tried.ok;
      out.bytes = tried.ok ? tried.bytes.length : 0;
      out.type = tried.type || null;
      if (!tried.ok) out.why = tried.why || "unknown";
      out.mayDraw = mayDraw(request, env);
      return new Response(JSON.stringify(out, null, 1), { headers: { "content-type": "application/json", "cache-control": "no-store", ...cors() } });
    }
    const old = await keep(store, key, address, "preserved", { prompt, seed });
    if (old.ok) return new Response(old.bytes, { headers: { "content-type": old.type, ...kept("preserved") } });

    // ── 3 · draw it
    const may = mayDraw(request, env);
    if (!may.ok) return refuse(403, may.why);
    try {
      if (!env.AI) return refuse(503, "this service has no drawer bound yet, so a new picture cannot be drawn");
      // ⚠️ NO SEED HERE: `flux-1-schnell` takes `prompt` and `steps` and refuses anything else ("Additional or unevaluated properties
      // '/seed' at '/' not allowed"). Stability does not come from the seed any more — it comes from the STORE: the first drawing of an
      // address is kept forever and every later ask returns those same bytes. The seed still separates addresses, which is its other job.
      const out = await env.AI.run(MODEL, { prompt, steps: STEPS });
      const bytes = await bytesOf(out);
      if (!bytes || bytes.length < MIN_BYTES) return refuse(502, "the drawing came back with nothing in it");
      await store.put(key, bytes, "image/jpeg", meta("drawn", prompt, seed));
      return new Response(bytes, { headers: { "content-type": "image/jpeg", ...kept("drawn") } });
    } catch (e) {
      // ⚠️ SAY WHICH REFUSAL THIS IS. engine/art.js reads the body to tell "the service will not draw" from "a
      // picture is missing", and the wrong word there deletes a player's picture or keeps a dead one.
      return refuse(502, `the drawing failed: ${String(e?.message || e).slice(0, 200)}`);
    }
  },
};

/** Ask the old address for the picture it still holds, and keep it. Never keeps a short body. */
async function keep(store, key, address, how, { prompt = "", seed = 0 } = {}) {
  try {
    const res = await fetch(address, { headers: { accept: "image/*" } });
    if (!res.ok) return { ok: false, why: `the old service answered ${res.status}` };
    const type = res.headers.get("content-type") || "";
    if (!/^image\//i.test(type)) return { ok: false, why: `the old service answered ${type || "nothing"}` };
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.length < MIN_BYTES) return { ok: false, why: `only ${bytes.length} bytes came back` };
    await store.put(key, bytes, type, meta(how, prompt, seed));
    return { ok: true, bytes, type };
  } catch (e) { return { ok: false, why: String(e?.message || e).slice(0, 200) }; }
}

/** ⚠️ WHAT IS REMEMBERED BESIDE A PICTURE, AND HOW LITTLE. Workers KV allows ONE KILOBYTE of metadata an entry — a longer one throws, the
 *  keep fails, and a picture that is still out there looks gone. The prompt is in the address already; a short note of it is a convenience,
 *  never the record. */
const meta = (how, prompt, seed) => ({ how, seed: String(seed), at: new Date().toISOString().slice(0, 10), prompt: String(prompt || "").slice(0, 300) });

/** ⛑ THE STORE, WHICHEVER ONE IS BOUND — R2 (`PICTURES`) or Workers KV (`PICTURES_KV`). Two lines of difference,
 *  and it means the picture service does not have to be redeployed if the store underneath it ever changes.
 *  ⚠️ A missing store is SAID (503), never a silent empty picture. */
function storeOf(env) {
  if (env.PICTURES && typeof env.PICTURES.put === "function" && typeof env.PICTURES.head === "function") {
    return {
      async get(key) {
        const hit = await env.PICTURES.get(key);
        return hit ? { bytes: hit.body, type: hit.httpMetadata?.contentType || "image/jpeg", size: hit.size } : null;
      },
      put: (key, bytes, type, meta) => env.PICTURES.put(key, bytes, {
        httpMetadata: { contentType: type, cacheControl: `public, max-age=${A_YEAR}, immutable` },
        customMetadata: meta,
      }),
    };
  }
  if (env.PICTURES_KV && typeof env.PICTURES_KV.put === "function") {
    return {
      async get(key) {
        const { value, metadata } = await env.PICTURES_KV.getWithMetadata(key, { type: "arrayBuffer" });
        return value ? { bytes: value, type: metadata?.contentType || "image/jpeg", size: value.byteLength } : null;
      },
      put: (key, bytes, type, meta) => env.PICTURES_KV.put(key, bytes, { metadata: { ...meta, contentType: type } }),
    };
  }
  return null;
}

/** ⛔ CCODE-456 — THE REFERENCE PICTURE'S BYTES, and only from our own store. `ref` is a picture ADDRESS: ours, the old service's, or just
 *  the `/prompt/…` part of either. It is resolved to the same key the picture would be stored under, and preserved from the old service if
 *  we have not seen it yet. ⚠️ Anything else is refused rather than fetched — this endpoint is public, and an image fetcher that will pull
 *  any URL on request is an open proxy standing in someone's account. */
async function refBytes(ref, request, store) {
  let path;
  try {
    const here = new URL(request.url);
    const u = new URL(ref, `${here.origin}/`);
    if (u.origin !== here.origin && u.origin !== OLD_HOST) return { ok: false, why: "a reference must be a picture this service knows" };
    path = `${u.pathname}${u.search}`;
  } catch { return { ok: false, why: "that is not an address" }; }
  if (!path.startsWith("/prompt/")) return { ok: false, why: "a reference must be a picture address" };
  let prompt;
  try { prompt = decodeURIComponent(path.slice("/prompt/".length).split("?")[0]); } catch { return { ok: false, why: "that address cannot be read" }; }
  const q = new URLSearchParams(path.includes("?") ? path.slice(path.indexOf("?")) : "");
  const width = int(q.get("width"), 1024), height = int(q.get("height"), 320);
  const key = await keyFor(prompt, width, height, Math.abs(Math.trunc(Number(q.get("seed")))) || 0);
  const hit = await store.get(key);
  if (hit) return { ok: true, width, height, bytes: hit.bytes instanceof Uint8Array ? hit.bytes : new Uint8Array(await new Response(hit.bytes).arrayBuffer()) };
  const kept = await keep(store, key, `${OLD_HOST}${path}`, "preserved", { prompt, seed: 0 });
  return kept.ok ? { ok: true, bytes: kept.bytes, width, height } : { ok: false, why: kept.why || "it is not in the store and the old service no longer has it" };
}

/** ⛑ A WHITE GREYSCALE PNG, WRITTEN BY HAND — a Worker has no canvas, and an inpainting model needs a mask the size of its picture.
 *  ⚠️ COMPRESSED, with the platform's own deflate: uncompressed it is 328 KB for one 512×640 mask, which becomes megabytes of JSON on the
 *  way to the model and is dropped before it arrives ("missing required input mask_image" for a field that was plainly sent). 1.6 KB. */
async function whitePng(width, height, value = 255) {
  const be32 = (n) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  const table = [];
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; table[n] = c >>> 0; }
  const crc32 = (buf) => { let crc = 0xffffffff; for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8); return (crc ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => { const body = [...[...type].map(c => c.charCodeAt(0)), ...data]; return [...be32(data.length), ...body, ...be32(crc32(Uint8Array.from(body)))]; };
  const raw = new Uint8Array(height * (1 + width));
  for (let y = 0; y < height; y++) { const o = y * (1 + width); raw[o] = 0; raw.fill(value, o + 1, o + 1 + width); }
  const z = new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream("deflate"))).arrayBuffer());
  return Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ...chunk("IHDR", [...be32(width), ...be32(height), 8, 0, 0, 0, 0]), ...chunk("IDAT", [...z]), ...chunk("IEND", [])]);
}

/** Bytes as base64, in chunks — `String.fromCharCode(...bytes)` on a whole picture blows the stack. */
function base64(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 8192) s += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(s);
}

/** The R2 key: what the picture IS, and nothing about how it was asked for. */
async function keyFor(prompt, width, height, seed) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${prompt}|${width}|${height}|${seed}`));
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 40);
}

/** Workers AI hands back base64 in `image`, or a stream. Both become bytes here. */
async function bytesOf(out) {
  if (!out) return null;
  if (typeof out.image === "string") {
    const bin = atob(out.image);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
  if (out instanceof ReadableStream) return new Uint8Array(await new Response(out).arrayBuffer());
  if (out instanceof ArrayBuffer) return new Uint8Array(out);
  return null;
}

function mayDraw(request, env) {
  const rule = String(env.DRAW || "game").toLowerCase();
  if (rule === "off") return { ok: false, why: "this picture has not been drawn yet, and drawing is switched off" };
  if (rule === "anyone") return { ok: true };
  const where = request.headers.get("origin") || request.headers.get("referer") || "";
  const allowed = String(env.GAME_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean).concat(GAME_ORIGINS);
  let host = "";
  try { host = where ? new URL(where).hostname : ""; } catch { host = ""; }
  if (host && allowed.some(a => host === a || host.endsWith(`.${a}`))) return { ok: true };
  return { ok: false, why: "this picture has not been drawn yet, and this request did not come from the game" };
}

const int = (v, fallback) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Math.min(4096, Math.round(Number(v))) : fallback);
const cors = () => ({ "access-control-allow-origin": "*", "access-control-allow-methods": "GET,HEAD,OPTIONS", "access-control-max-age": "86400" });
const kept = (how) => ({ "cache-control": `public, max-age=${A_YEAR}, immutable`, "x-picture": how, ...cors() });
const refuse = (status, why) => new Response(`${why}\n`, { status, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", ...cors() } });
