// scripts/certify_claims.mjs — HOW A CERTIFIED CLAIM IS MATCHED AND RESTAMPED. Pure; imported by
// scripts/certify_counts.mjs and by §184, so the gate proves the behaviour the tool actually uses.
//
// ⛔ AEVI 2026-09-12 (SNG-538 §5): "certify_counts also refuses unless its claim line keeps its bold, which my
// unbolding broke and I restored. Both are small, and both mean a gate currently pins the typography of content
// it doesn't own." She is right. Every claim pattern hard-required `**`, so a register pass over a PLAYER
// document — unbolding a line in the guide she owns — made the stamper refuse, and the way to a green run was
// to put my emphasis back into her prose.
//
// ✅ THE NUMBERS ARE MINE; THE TYPOGRAPHY IS THE AUTHOR'S. The wrapper is optional, and whatever the document
// wears is what the restamp comes back wearing: `**…**`, `__…__`, or nothing at all.
//
// ⚠️ IT MUST STILL BE THE SAME LINE. The wrapper is captured as a matched PAIR — an opener with no closer is
// not a claim, or a stamp could swallow the `**` of the sentence after it.

/** The claim pattern: `body` (a regex source that must not itself capture) wearing an optional, matched wrapper. */
export function claimRe(body) {
  return new RegExp(`(?:(\\*\\*|__)(${body})\\1|(${body}))`);
}

/** Wrap a stamp builder so the wrapper the document wore is the wrapper it keeps. `build()` returns the bare text. */
export function keepWrap(build) {
  return (...m) => {
    const wrap = m[1] || "";
    return `${wrap}${build()}${wrap}`;
  };
}
