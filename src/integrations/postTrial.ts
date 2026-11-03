import { stageReviewContextFrom, type StageReviewContext } from '@/domain/postTrial';
export type StageReviewRead = { outcome: 'loaded'; context: StageReviewContext } | { outcome: 'unavailable'; code: string };
export async function getStageReviewContext(leadId: string, signal?: AbortSignal): Promise<StageReviewRead> {
  if (!/^[1-9][0-9]{0,9}$/.test(leadId) || Number(leadId) > 2147483647) return { outcome: 'unavailable', code: 'INVALID_COMMAND' };
  try {
    const response = await fetch('/api/hub', { method: 'POST', cache: 'no-store', signal, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ operation: 'lead_details', payload: { leadId }, requestKey: null }) });
    const value: unknown = await response.json();
    if (!response.ok) {
      const e = value && typeof value === 'object' && 'error' in value ? value.error : null;
      return { outcome: 'unavailable', code: e && typeof e === 'object' && 'code' in e && typeof e.code === 'string' ? e.code : 'BACKEND_UNAVAILABLE' };
    }
    const context = stageReviewContextFrom(value, leadId);
    return context ? { outcome: 'loaded', context } : { outcome: 'unavailable', code: 'HUB_RESPONSE_UNREADABLE' };
  } catch { return { outcome: 'unavailable', code: 'BACKEND_UNAVAILABLE' }; }
}
