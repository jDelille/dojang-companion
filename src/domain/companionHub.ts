export const COMPANION_MODE = "AI explanation of scoped Odoo data - no actions executed";
export type CompanionPayload = { question: string; memberId: string | null; sessionId: string | null };
export type CompanionAnswer = {
  answer: string;
  mode: string;
  focus: { kind: "member" | "session" | "site"; id: string | null };
};
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const recordId = (v: unknown) => typeof v === "string" && /^[1-9][0-9]{0,9}$/.test(v);

export function isCompanionPayload(value: unknown): value is CompanionPayload {
  if (!object(value) || Object.keys(value).sort().join() !== "memberId,question,sessionId") return false;
  return typeof value.question === "string" && value.question === value.question.trim()
    && value.question.length >= 1 && value.question.length <= 500
    && (value.memberId === null || recordId(value.memberId))
    && (value.sessionId === null || recordId(value.sessionId))
    && (value.memberId === null || value.sessionId === null);
}

export function companionPayloadFor(focusKey: string, question: string):
  | { ok: true; payload: CompanionPayload }
  | { ok: false; code: string; status: number } {
  if (focusKey.startsWith("lead:") || focusKey.startsWith("sales:")) {
    return { ok: false, code: "LEAD_AI_UNSUPPORTED", status: 409 };
  }
  const memberId = focusKey.startsWith("member:") ? focusKey.slice(7) : null;
  if (memberId === null && !["people", "sales", "inbox", "front-desk", "today", "instructor"].includes(focusKey)) {
    return { ok: false, code: "CONTEXT_UNSUPPORTED", status: 409 };
  }
  const payload = { question: question.trim(), memberId, sessionId: null };
  return isCompanionPayload(payload) ? { ok: true, payload } : { ok: false, code: "INVALID_COMMAND", status: 400 };
}

// Fail closed if Jodi answers for a different record or scope. replayed is ignored.
export function companionAnswerFrom(value: unknown, payload: CompanionPayload): CompanionAnswer | null {
  if (!object(value) || typeof value.answer !== "string" || !value.answer.trim()
    || value.mode !== COMPANION_MODE || !object(value.focus)) return null;
  const expected: CompanionAnswer["focus"] = payload.memberId ? { kind: "member", id: payload.memberId }
    : payload.sessionId ? { kind: "session", id: payload.sessionId } : { kind: "site", id: null };
  if (value.focus.kind !== expected.kind || value.focus.id !== expected.id) return null;
  return { answer: value.answer, mode: value.mode, focus: expected };
}
