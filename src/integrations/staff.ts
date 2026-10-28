import { cache } from "react";
import { explainHubError } from "@/domain/hubAction";
import type { StaffConnection } from "@/domain/staff";
import { hubEnabled, readHubAsStaff } from "@/server/hub-gateway";
import { SIGN_IN_CODES } from "./hub";

// Who is signed in, for the staff shell's site control and nav rail. Runs on the
// server, through the same Hub "context" read (and the same sealed staff
// session) as Inbox and People. Only the principal is kept. Never a fixture
// person in Hub mode.

const USES_SAMPLE_DATA = process.env.NODE_ENV !== "production";

const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const isText = (value: unknown): value is string => typeof value === "string" && value.length > 0;

// cache(): one read per request, however many places ask
export const getStaffConnection = cache(async (): Promise<StaffConnection> => {
  if (!hubEnabled()) {
    if (USES_SAMPLE_DATA) return { state: "development" };
    return { state: "unavailable", text: explainHubError("HUB_NOT_CONFIGURED") };
  }

  const answer = await readHubAsStaff("context", {});
  if (!answer.ok) {
    if (SIGN_IN_CODES.includes(answer.code)) return { state: "signedOut" };
    return { state: "unavailable", text: explainHubError(answer.code) };
  }

  const principal = answer.result.principal;
  if (!isObject(principal) || !isText(principal.name) || !isText(principal.role) || !isText(principal.siteId)) {
    return { state: "unavailable", text: "Odoo sent staff details DreamOS can't read." };
  }
  return { state: "signedIn", name: principal.name, role: principal.role, siteId: principal.siteId };
});
