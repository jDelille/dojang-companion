import AgentSetup from '@/views/doForMe/agentSetup';
import { getAiSettings } from '@/integrations/aiSettings';
import HubUnavailable from '@/views/shell/hubUnavailable';
import '@/templates/roster/roster.css';

export default async function CompanionSetupPage() {
  const settings = await getAiSettings();
  if (settings.outcome === 'unavailable' && ['SIGN_IN_REQUIRED', 'UNAUTHENTICATED'].includes(settings.code)) {
    return <HubUnavailable code={settings.code} text={settings.text} />;
  }
  return <AgentSetup liveSettings={settings} />;
}
