// engine/invitations.js — CCODE-360: AN INVITATION CARRIED BY SOMEONE YOU BOTH KNOW.
//
// ⛔ ERIK 2026-09-16: "I would like the opportunity to invite her to my Band of the Fell Pell - probably through mutual
// connections when I recruit."
//
// ⚑ MEASURED BEFORE A LINE OF THIS WAS WRITTEN:
//   · a band's members are contingents keyed by `npcId` in the LEADER's own save — every lookup resolves an npc, and nothing
//     in play adds a contingent at all;
//   · nothing let one player's character invite another's, and nothing carried an answer back;
//   · and each save's people are its own (SNG-595), so the only mutual connection either client can know for CERTAIN is its
//     own registry. Silas's device can see who is in his band; only Adelheid's save can say whether she knows them. On the real
//     saves: six people stand in the Fellowship of the Fell Pell, and Mara Wells is the one Adelheid's save knows.
//
// ⛑ SO: the sender names a CARRIER from his own band, and the invitation ARRIVES only where the receiver's own save knows that
// carrier — it reaches Adelheid through Mara, in her story, or it waits until she has met Mara. One shared file, one key per
// invitation, merged; the sender writes it, the addressee writes only her answer, and the leader's tick reads the answer
// back. ⚠️ Silence is not an answer and changes nothing.
//
// ⚠️ PURE. The IO is `worldtick.syncInvitations / sendInvitation / answerInvitation`.

import { smartClamp, namesMatch } from "./namematch.js";

export const INVITES_PATH = "world/invitations.json";

/** ⛔ A BAND'S NAME MID-SENTENCE. Bands are raised with their article ("The Fellowship of the Fell Pell"), and the first draft of
 *  this file printed "into the The Fellowship…" from every template that supplied its own "the". One phrase, used by every line
 *  that names a band. A possessive name ("Silas's Company") takes no article. */
export function bandPhrase(name, { capital = false } = {}) {
  const n = String(name || "").trim();
  const art = capital ? "The" : "the";
  if (/^the\s+/i.test(n)) return `${art} ${n.replace(/^the\s+/i, "")}`;
  if (/^\S+['’]s\s/.test(n)) return n;
  return `${art} ${n || "band"}`;
}

const dayOrNull = (d) => (d !== null && d !== undefined && Number.isFinite(Number(d))) ? Number(d) : null;

/** One invitation per sender, addressee and band — asking again after a "no" reopens the same record rather than adding a second. */
export function invitationId(fromId, toId, bandId) {
  return `inv-${fromId}-${toId}-${bandId}`.replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 140);   // prose-cap-ok: a record key, never shown
}

export function makeInvitation({ from, band, to, carrier, worldDay = null, now = Date.now(), line = null } = {}) {
  if (!from?.id || !to?.id || !band?.id || !carrier?.name || from.id === to.id) return null;
  return {
    id: invitationId(from.id, to.id, band.id), kind: "band",
    bandId: String(band.id), bandName: String(band.name || band.id),
    fromCharacterId: String(from.id), fromName: String(from.name || from.id), fromPlayerKey: from.playerKey || null,
    toCharacterId: String(to.id), toName: String(to.name || to.id),
    carrierNpcId: carrier.id ? String(carrier.id) : null, carrierName: String(carrier.name),
    line: line && String(line).trim() ? smartClamp(String(line).trim(), 280) : null,
    sentWorldDay: dayOrNull(worldDay),
    sentAt: new Date(Number(now) || Date.now()).toISOString(),
    answer: null, answeredAt: null,
  };
}

/** The merge body for a SEND. ⚠️ An acceptance is never overwritten by a pending copy — a retry, or a second tap, must not
 *  un-answer a yes. A send after a "no" reopens it: asking again is allowed, and it is the same question. */
export function mergeInvitation(remote, inv) {
  const invitations = { ...(remote?.invitations || {}) };
  if (inv?.id && invitations[inv.id]?.answer !== "accepted") invitations[inv.id] = inv;
  return { schemaVersion: 1, invitations };
}

/** The merge body for an ANSWER: only the addressee, only once, only yes or no. */
export function answerInto(remote, id, answer, { byCharacterId = null, now = Date.now() } = {}) {
  const invitations = { ...(remote?.invitations || {}) };
  const cur = invitations[id];
  if (cur && byCharacterId && cur.toCharacterId === byCharacterId && !cur.answer && (answer === "accepted" || answer === "declined")) {
    invitations[id] = { ...cur, answer, answeredAt: new Date(Number(now) || Date.now()).toISOString() };
  }
  return { schemaVersion: 1, invitations };
}

/** ⛔ DOES THIS CHARACTER'S OWN WORLD KNOW THE CARRIER? By id, or by name for someone met under another id. */
export function knowsCarrier(character, inv) {
  const reg = character?.npcRegistry || {};
  if (inv?.carrierNpcId && reg[inv.carrierNpcId]) return true;
  return !!inv?.carrierName && Object.values(reg).some(n => n?.name && namesMatch(n.name, inv.carrierName));
}

/** What has ARRIVED: addressed to her, unanswered, and carried by someone her own world knows. ⚠️ One carried by a stranger is
 *  still on the shared file and still true — it is said to nobody until she meets them. */
export function incomingInvitations(store, character) {
  return Object.values(store?.invitations || {}).filter(i => i && i.toCharacterId === character?.id && !i.answer && knowsCarrier(character, i));
}

/** What this character has SENT, answered or not. */
export function sentInvitations(store, character) {
  return Object.values(store?.invitations || {}).filter(i => i && character?.id && i.fromCharacterId === character.id);
}

/** Accepting, on HER save: a membership she chose. Idempotent. */
export function joinBandLocally(character, inv, { worldDay = null } = {}) {
  if (!character || !inv) return false;
  const list = character.bandsJoined || (character.bandsJoined = []);
  if (list.some(b => b.bandId === inv.bandId && b.leaderId === inv.fromCharacterId)) return false;
  list.push({ bandId: inv.bandId, bandName: inv.bandName, leaderId: inv.fromCharacterId, leaderName: inv.fromName,
    via: inv.carrierName, joinedWorldDay: dayOrNull(worldDay) });
  return true;
}

/** ⛔ THE LEADER'S SIDE: answers that have come back, applied ONCE each (`invitationsSeen`).
 *  ⚠️ AN ACCEPTANCE PUTS THE TRAVELER ON THE BAND AS A TRAVELER, NEVER AS A CONTINGENT. Contingents are what `bandStrength`,
 *  `bandThreat` and every clash count; another player's character is not a number on this player's dice. Returns the news lines. */
export function applyAnswers(character, store, { worldDay = null } = {}) {
  if (!character) return [];
  const seen = character.invitationsSeen || (character.invitationsSeen = {});
  const news = [];
  for (const inv of sentInvitations(store, character)) {
    const mark = `${inv.answer}@${inv.answeredAt}`;
    if (!inv.answer || seen[inv.id] === mark) continue;
    seen[inv.id] = mark;
    const band = (character.bands || []).find(b => b && String(b.id || b.name) === inv.bandId);
    if (inv.answer === "accepted") {
      if (band) {
        band.travelers = Array.isArray(band.travelers) ? band.travelers : [];
        if (!band.travelers.some(t => t.characterId === inv.toCharacterId)) {
          band.travelers.push({ characterId: inv.toCharacterId, name: inv.toName, via: inv.carrierName, joinedWorldDay: dayOrNull(worldDay) });
        }
      }
      news.push(`Word came back through ${inv.carrierName}: ${inv.toName} said yes, and is one of ${bandPhrase(inv.bandName)} now.`);
    } else {
      news.push(`Word came back through ${inv.carrierName}: ${inv.toName} will not join ${bandPhrase(inv.bandName)} — not now.`);
    }
  }
  return news;
}

/** ⛔ THE GM: an invitation to deliver, in the carrier's voice. Null when none has arrived. */
export function invitationsForGM(character, store) {
  const inc = incomingInvitations(store, character);
  if (!inc.length) return null;
  return inc.slice(0, 2).map(i => `- ${i.carrierName} carries word from ${i.fromName} (another traveler — a player's character): ${i.fromName} would welcome ${character.name} into ${bandPhrase(i.bandName)}.${i.line ? ` In ${i.fromName}'s words: "${i.line}"` : ""}`).join("\n");
}

/** ⛔ THE GM: the bands this character CHOSE to join — a member, not a subordinate. */
export function bandsJoinedForGM(character) {
  const list = Array.isArray(character?.bandsJoined) ? character.bandsJoined : [];
  if (!list.length) return null;
  return list.map(b => `- ${character.name} is one of ${bandPhrase(b.bandName)}, led by ${b.leaderName} (another traveler — a player's character), by ${character.name}'s own choice${b.via ? `; the word came through ${b.via}` : ""}.`).join("\n");
}
