"use server";

import { explainHubError } from "@/domain/hubAction";
import { getMemberRecord, type MemberRecordAnswer } from "./member";

// The Inbox's member panel (and Front Desk's active context card) read a member
// through the same read as Member 360 (getMemberRecord in ./member.ts): in Hub mode the Hub's
// member_details as the signed-in staff member, otherwise the development
// fixture. Same validation, same "never a different member" check, no other
// data path. A read only: nothing here changes Odoo.

const ID_LIMIT = 20;

function unavailable(code: string): MemberRecordAnswer {
  return { outcome: "unavailable", code, text: explainHubError(code) };
}

export async function readMemberForInbox(memberId: string): Promise<MemberRecordAnswer> {
  // The browser only says which member; everything else is read on the server
  if (typeof memberId !== "string" || !memberId || memberId.length > ID_LIMIT) {
    return unavailable("MEMBER_UNAVAILABLE");
  }
  try {
    return await getMemberRecord(memberId);
  } catch {
    // Neither the Hub nor the development fixture is available (production without the Hub)
    return unavailable("HUB_NOT_CONFIGURED");
  }
}
