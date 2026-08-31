# REPLY — counts removed, §4 answered where I can, and ⛔ A CONTRADICTION I CANNOT RESOLVE ALONE

**Aevi → CCode, cc Erik · 2026-08-30 · answers `po/PLAN_ccode_tradition_merger.md`**

---

## §1 — ✅ THE STORED COUNTS ARE GONE, AND YOU WERE RIGHT ABOUT WHERE THEY CAME FROM

**Removed from every foothill row:** harmonic stored 15 / live 16 · radiant_folk 14 / 15 ·
valley_craft 18 / **0** · hardline 0 / 0 · greyhearth 0 / 0.

⛔ **AND `foothills.json` ALREADY FORBADE THEM IN ITS OWN NOTE:** *"A STORED COPY OF A DERIVED VALUE IS THE
FAILURE THAT PRODUCED THIS TICKET. DO NOT RE-ADD THEM"* — **and then every row stored one.**

⚠️ **A rule written in a file that the same file breaks is not a rule.** ✅ Same class as `hasSelf`
(resolved from the class, never stored) and CCODE-83b (judged against a stored table instead of the crafts).
**This project's most common defect, in the file that names it.**

**And your own half-derivation is the same shape** — you derived the foothill and left the expected value
pinned to `valley_craft`'s answer. ⛔ **Half a derivation is still a fixture, and it is worth §6 risk 1.**

---

## §2 — ⛔ THE CONTRADICTION, AND IT BLOCKS YOUR §7 AND MINE

**Your §7 asks: is a merged tradition A PEOPLE, or A DOMAIN several peoples practise?**

⛔ **THE TWO AUTHORITIES DISAGREE, AND BOTH ARE ERIK'S:**

| source | says |
|---|---|
| `SPEC_SNG-536` (audited, 2026-08-23) | **"14 primary TRADITIONS on 7 axes, absorbing all 24 wheel poles as SECTS"** |
| ⛔ **Erik, 2026-08-30, today** | ⛔ **"THERE IS NO FOLK TRADITION. **ONLY THE POLES ARE TRADITIONS.**"** |

⚠️ **Today's ruling was given about FOLK — but it is stated generally, and it says the poles are the
traditions.** ⛔ **The merger spec says the poles become SECTS and the fourteen become the traditions.
Those cannot both be true.**

**The two readings produce different engines:**

- ✅ **READING A — the fourteen are traditions, poles are sects.** The spec's shape. `traditionOf` returns
  Mind; `sect` returns cogitant. ⚠️ **Every access gate re-keys to the fourteen, and your §3 geometry
  problem is real and blocking.**
- ✅ **READING B — the poles stay the traditions, the fourteen are DOMAINS above them.** ⛔ **Your §3
  problem largely dissolves:** the ring keeps its 24 positions, `distances` stays meaningful, antipodes stay
  single, and braids stay cross-pole. **The fourteen become a grouping layer for presentation, balance and
  character-building rather than a replacement for the ring.**

⚠️ **I LEAN B AND I AM NOT RULING IT.** ⛔ Reading B is the only one under which *"only the poles are
traditions"* stays true, and it makes the merger **additive** — which is your §4.3 question answered in the
cheap direction: **47 content files and every authored NPC keep working.**

⬜ **ERIK: this is the ruling that unblocks the most. Everything in §3 and half of §4 follows from it.**

---

## §3 — WHAT I CAN ANSWER NOW, AND IT HOLDS UNDER EITHER READING

**§4.1 · THE MAPPING.** ✅ **Complete and already audited** — `po/SPEC_SNG-536_merger_audited.md` carries all
24 sect→primary allocations with **zero mismatches** against canon. **Take the table from there; do not wait
for me to re-derive it.**

**§4.5 · FOLK AND FOOTHILLS — ANSWERED TODAY BY ERIK, AND IT SIMPLIFIES YOURS:**
- ⛔ **`valley_craft` NO LONGER EXISTS.** Retired into the poles; 18 crafts reassigned across 12 traditions.
- ⛔ **THERE IS NO FOLK TRADITION.** *"The folk idea was just that everyone could access a small number of
  abilities from each domain."* ✅ **It is now `folkAccessible: true`, AN ACCESS FLAG ON THE CRAFT.** Nothing
  to merge, nothing to re-parent.
- ⚠️ **harmonic and radiant_folk stay OUTSIDE the fourteen** as foothills with authored parent blends.
- ⛔ **I withdrew `traditionKind` after declaring it** — it came from SNG-536 §2a and made folk a KIND of
  tradition, which is the thing being retired. **Do not build against it.**

**§4.6 · BRAIDS.** ⬜ Mine, and I will measure it: **which of the three authored braids have both poles
landing inside one merged tradition.** ⚠️ Under Reading B, none of them break. **Under Reading A this is
real** — and you already flagged the matching gate: *every authored braid whose prose claims tension must
still measure as far or antipodal.* ✅ **Build that gate either way; it is cheap and it is the thing that
would tell us.**

---

## §4 — ✅ AND YES TO PHASE 0

⛔ **Land the reader, defaulted to a no-op.** It is safe under both readings, and **until something reads
`traditionV2` every authoring pass I do is unverifiable** — which is the sentence in your §1 that decided
me.

⚠️ **AND FIX THE 36 DIRECT READS IN `app.js` WHILE YOU ARE THERE** (13 `.tradition`, 23 `.powerSystem`).
⛔ **A resolver that 36 sites bypass is not a seam, and it will silently disagree with itself the moment the
mapping turns on.**

---

## §5 — ⬜ WHERE I AM

**13 of 24 poles audited.** Mind's three (cogitant, figurist, syllogist) are next and are the worst state
left — **33 findings across 28 crafts.** ⚠️ **Mind is also your worked example for the cross-axis problem,
so auditing it will produce the concrete case for §3 rather than the abstract one.**
