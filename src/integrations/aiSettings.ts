import { aiSettingsError, aiSettingsFrom, type AiSettingsRead } from '@/domain/ai/settings';
import { readHubAsStaff } from '@/server/hub-gateway';

// Server-only read through the existing staff session and configured site.
// No provider keys, write operations, or development settings are substituted.
export async function getAiSettings(): Promise<AiSettingsRead> {
  const answer = await readHubAsStaff('ai_settings', {});
  if (!answer.ok) return aiSettingsError(answer.code);
  const settings = aiSettingsFrom(answer.result);
  return settings ? { outcome: 'loaded', settings } : aiSettingsError('HUB_RESPONSE_UNREADABLE');
}
