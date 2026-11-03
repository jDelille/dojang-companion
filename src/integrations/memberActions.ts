import { isRequestKey } from '@/domain/hubAction';
import { memberPayloadAllowed, memberResultAllowed, type MemberCommand, object, recordId } from '@/domain/memberActions';
import type { HubAnswer } from './hub';
export async function memberRead(operation: string, payload: Record<string, unknown>, signal?: AbortSignal): Promise<HubAnswer<Record<string, unknown>>> {
  try {
    const response = await fetch('/api/hub', { method: 'POST', cache: 'no-store', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ operation, payload, requestKey: null }), signal });
    const result: unknown = await response.json();
    if (!response.ok) return { outcome: 'failed', code: object(result) && object(result.error) && typeof result.error.code === 'string' ? result.error.code : 'BACKEND_UNAVAILABLE' };
    if (!object(result)) return { outcome: 'failed', code: 'HUB_RESPONSE_UNREADABLE' };
    if (operation === 'member_details' && (!object(result.member) || result.member.id !== payload.memberId)) return { outcome: 'failed', code: 'HUB_RESPONSE_UNREADABLE' };
    if (['member_workspace', 'archive_review', 'guardian_kiosk_access', 'consent_overview', 'waiver_context', 'member_onboarding', 'billing_ledger'].includes(operation) && result.memberId !== payload.memberId) return { outcome: 'failed', code: 'HUB_RESPONSE_UNREADABLE' };
    if (operation === 'attendance_sheet' && (!object(result.session) || result.session.id !== payload.sessionId)) return { outcome: 'failed', code: 'HUB_RESPONSE_UNREADABLE' };
    return { outcome: 'done', result };
  } catch { return { outcome: 'failed', code: 'BACKEND_UNAVAILABLE' }; }
}
export async function memberWrite(command: MemberCommand, requestKey: string): Promise<HubAnswer<Record<string, unknown>>> {
  if (!isRequestKey(requestKey) || !memberPayloadAllowed(command.operation, command.payload) || (command.subjectId !== undefined && !recordId(command.subjectId))) return { outcome: 'failed', code: 'INVALID_COMMAND' };
  try {
    const response = await fetch('/api/hub', { method: 'POST', cache: 'no-store', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ operation: command.operation, payload: command.payload, requestKey }), signal: AbortSignal.timeout(45000) });
    const value: unknown = await response.json();
    if (response.ok) return memberResultAllowed(command, value) ? { outcome: 'done', result: value } : { outcome: 'notConfirmed' };
    const code = object(value) && object(value.error) && typeof value.error.code === 'string' ? value.error.code : null;
    return code && !['CONCURRENT_RETRY', 'BACKEND_UNAVAILABLE', 'BACKEND_UNAVAILABLE_RETRY_SAME_ACTION'].includes(code) ? { outcome: 'failed', code } : { outcome: 'notConfirmed' };
  } catch { return { outcome: 'notConfirmed' }; }
}
export const memberOnly = (p: Record<string, unknown>) => Object.keys(p).join() === 'memberId' && recordId(p.memberId);
