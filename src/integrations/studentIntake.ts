import { intakeContextFrom, intakePreviewFrom, isIntakeContextPayload, isIntakePreviewPayload, type Intake, type IntakeContext, type IntakePreview } from '@/domain/studentIntake';
export type IntakeRead<T> = { outcome: 'loaded'; value: T } | { outcome: 'unavailable'; code: string };
async function read<T>(operation: string, payload: unknown, parse: (value: unknown) => T | null, signal?: AbortSignal): Promise<IntakeRead<T>> {
  try {
    const response = await fetch('/api/hub', { method: 'POST', cache: 'no-store', signal, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ operation, payload, requestKey: null }) });
    const value: unknown = await response.json();
    if (!response.ok) {
      const e = value && typeof value === 'object' && 'error' in value ? value.error : null;
      return { outcome: 'unavailable', code: e && typeof e === 'object' && 'code' in e && typeof e.code === 'string' ? e.code : 'BACKEND_UNAVAILABLE' };
    }
    const parsed = parse(value);
    return parsed ? { outcome: 'loaded', value: parsed } : { outcome: 'unavailable', code: 'HUB_RESPONSE_UNREADABLE' };
  } catch { return { outcome: 'unavailable', code: 'BACKEND_UNAVAILABLE' }; }
}
export function getIntakeContext(query: string, signal?: AbortSignal): Promise<IntakeRead<IntakeContext>> {
  const payload = { query: query.trim() };
  return isIntakeContextPayload(payload) ? read('intake_context', payload, intakeContextFrom, signal) : Promise.resolve({ outcome: 'unavailable', code: 'INVALID_COMMAND' });
}
export function previewStudent(intake: Intake): Promise<IntakeRead<IntakePreview>> {
  const payload = { intake };
  return isIntakePreviewPayload(payload) ? read('intake_preview', payload, intakePreviewFrom) : Promise.resolve({ outcome: 'unavailable', code: 'INTAKE_FIELDS_REQUIRED' });
}
