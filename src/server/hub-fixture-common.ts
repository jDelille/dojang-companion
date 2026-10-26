// DEVELOPMENT-ONLY helpers shared by the Hub fixtures (crm-fixture.ts,
// inbox-fixture.ts). Ported from Jodi's dojo_companion_hub service.py.

import type { HubError } from "../domain/hubAction";

export type ActionAnswer<T> = { status: number; body: T | HubError | null };

// HubProblem(code, status=409)
export const fail = (code: string, status = 409): ActionAnswer<never> => ({
  status,
  body: { error: { code, status } },
});

// The request's fingerprint, with keys in a fixed order (the Hub's fingerprint())
export function fingerprint(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(fingerprint).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : 1));
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${fingerprint(item)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

// dojo_kiosk record_id(): an Odoo record id as a string
export const isRecordId = (value: unknown): value is string =>
  typeof value === "string" && /^[1-9][0-9]{0,9}$/.test(value);

// text(): 1..maximum characters after trimming, or null
export function cleanText(value: unknown, maximum: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length >= 1 && trimmed.length <= maximum ? trimmed : null;
}

// exact(payload, "a b c"): an object with exactly these keys
export function hasExactKeys(value: unknown, keys: string[]): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.keys(value).sort().join() === [...keys].sort().join();
}

export const isRevision = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value);
