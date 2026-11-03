import { isTrialContextPayload, trialContextFrom, type TrialContext } from '@/domain/trial';
import { explainHubError } from '@/domain/hubAction';
export type TrialRead = { outcome: 'loaded'; context: TrialContext } | { outcome: 'unavailable'; code: string; text: string };
export async function getTrialContext(leadId: string, query: string, signal?: AbortSignal): Promise<TrialRead> {
  const unavailable = (code: string): TrialRead => ({ outcome: 'unavailable', code, text: explainHubError(code) });
  const payload = { leadId, query: query.trim() };
  if (!isTrialContextPayload(payload)) return unavailable('INVALID_COMMAND');
  try {
    const response = await fetch('/api/hub', { method: 'POST', cache: 'no-store', signal,
      headers: { 'content-type': 'application/json' }, body: JSON.stringify({ operation: 'trial_context', payload, requestKey: null }) });
    const value: unknown = await response.json();
    if (!response.ok) {
      const error = value && typeof value === 'object' && 'error' in value ? value.error : null;
      return unavailable(error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' ? error.code : 'BACKEND_UNAVAILABLE');
    }
    const context = trialContextFrom(value, leadId);
    return context ? { outcome: 'loaded', context } : unavailable('HUB_RESPONSE_UNREADABLE');
  } catch { return unavailable('BACKEND_UNAVAILABLE'); }
}
