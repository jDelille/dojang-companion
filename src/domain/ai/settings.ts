// Verified read: dojo_companion_hub/models/ai_settings.py _ai_settings.
// Owner/manager visibility is enforced by Hub, not by the selected Perspective.
export type AiSettings = {
  enabled: boolean;
  configured: boolean;
  model: string | null;
  canEnable: boolean;
  siteVersion: number;
  configVersion: number;
  lastCheck: { at: string; model: string | null; mode: string } | null;
};
export type AiSettingsRead =
  | { outcome: 'loaded'; settings: AiSettings }
  | { outcome: 'unavailable'; code: string; text: string };
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const nullableModel = (v: unknown): v is string | null => v === null || (typeof v === 'string' && !!v.trim() && v.length <= 160);
const version = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;

export function aiSettingsFrom(value: unknown): AiSettings | null {
  if (!object(value) || typeof value.enabled !== 'boolean' || typeof value.configured !== 'boolean'
    || typeof value.canEnable !== 'boolean' || !nullableModel(value.model)
    || !version(value.siteVersion) || !version(value.configVersion)) return null;
  let lastCheck: AiSettings['lastCheck'] = null;
  if (value.lastCheck !== null) {
    const check = value.lastCheck;
    if (!object(check) || typeof check.at !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(check.at)
      || !Number.isFinite(Date.parse(check.at)) || !nullableModel(check.model)
      || typeof check.mode !== 'string' || !check.mode.trim() || check.mode.length > 240) return null;
    lastCheck = { at: check.at, model: check.model, mode: check.mode };
  }
  // Explicit projection: never pass through provider secrets or arbitrary fields.
  return { enabled: value.enabled, configured: value.configured, model: value.model,
    canEnable: value.canEnable, siteVersion: value.siteVersion, configVersion: value.configVersion, lastCheck };
}

export function aiSettingsError(code: string): AiSettingsRead {
  const messages: Record<string, string> = {
    FORBIDDEN: 'AI settings are available to site owners and managers. Your normal Companion access is unchanged.',
    HUB_NOT_CONFIGURED: 'The Hub connection is not configured. Live AI settings are unavailable.',
    BACKEND_UNAVAILABLE: 'Odoo could not be reached. Live AI settings are unavailable.',
    HUB_RESPONSE_UNREADABLE: 'Odoo returned AI settings this app cannot read. No configuration status was inferred.',
    INVALID_COMMAND: 'The deployed Hub rejected the AI settings read. Its supported operations need checking.',
    SIGN_IN_REQUIRED: 'Sign in to read live AI settings.',
    UNAUTHENTICATED: 'Your staff session has ended. Sign in again.',
  };
  return { outcome: 'unavailable', code, text: messages[code] ?? 'Live AI settings could not be read.' };
}
