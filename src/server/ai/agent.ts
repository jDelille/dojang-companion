// Adapted from Roster 1.0.0 lib/ai/index.ts: injected context/provider/usage owner.
// This runtime is not an alternative staff authentication or business database.
import { readAgentDraft, shouldEscalate, type AgentDraft } from '@/domain/ai/agentProfile';
import { buildAgentPrompt } from '@/domain/ai/prompt';
import type { AiProviderAdapter, ChatMessage, ChatUsage } from './adapter';

export async function generateAgentReply(options: {
  adapter: AiProviderAdapter;
  draft: AgentDraft;
  model: string;
  history: ChatMessage[];
  signal?: AbortSignal;
  recordUsage: (usage: ChatUsage | null, model: string) => Promise<void>;
}) {
  const parsed = readAgentDraft(options.draft);
  if (!parsed.ok) throw new Error('INVALID_AGENT_CONFIG');
  if (!options.model.trim() || options.history.length < 1 || options.history.length > 40
    || options.history.some(m => !['user', 'assistant'].includes(m.role) || !m.content.trim() || m.content.length > 6000)) {
    throw new Error('INVALID_AGENT_REQUEST');
  }
  const result = await options.adapter.complete({ system: buildAgentPrompt(parsed.draft), messages: options.history,
    model: options.model, maxTokens: 2048, signal: options.signal });
  await options.recordUsage(result.usage, result.model);
  if (result.refused) throw new Error('AI_REFUSED');
  if (!result.text.trim()) throw new Error('AI_EMPTY_RESPONSE');
  if (result.stopReason === 'length' || result.stopReason === 'max_tokens') throw new Error('AI_RESPONSE_INCOMPLETE');
  return { ...result, escalate: shouldEscalate(parsed.draft.profile, options.history, result.text) };
}
