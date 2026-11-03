// Adapted from Roster 1.0.0 components/agents/types.ts and lib/ai/prompt.ts.
// Original source hashes: vendor/licensed/roster/ai-foundation/SOURCE-MANIFEST.json.
// Draft configuration is not a permission grant or an active Hub configuration.
export const AGENT_TONES = ['professional', 'friendly', 'concise', 'enthusiastic', 'formal'] as const;
export const KNOWLEDGE_KINDS = ['doc', 'faq', 'pricing', 'policy'] as const;
export type AgentTone = typeof AGENT_TONES[number];
export type KnowledgeKind = typeof KNOWLEDGE_KINDS[number];
export type KnowledgeDocument = { id: string; title: string; kind: KnowledgeKind; content: string };
export type AgentProfile = {
  name: string;
  persona: string;
  tone: AgentTone;
  escalation: { keywords: string[]; afterTurns: number | null };
};
export type AgentDraft = { version: 1; profile: AgentProfile; knowledge: KnowledgeDocument[] };
export const NEW_AGENT_DRAFT: AgentDraft = {
  version: 1,
  profile: {
    name: 'Dojang Companion',
    persona: 'Help staff understand the records and prepare work for review.',
    tone: 'professional',
    escalation: { keywords: [], afterTurns: null },
  },
  knowledge: [],
};
export const DRAFT_LIMIT = 80000;
export type DraftResult = { ok: true; draft: AgentDraft } | { ok: false; message: string };
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown, max: number, required = false): v is string =>
  typeof v === 'string' && v.length <= max && (!required || !!v.trim());
const keys = (v: Record<string, unknown>, expected: string) => Object.keys(v).sort().join() === expected;

export function readAgentDraft(value: unknown): DraftResult {
  const invalid = (message: string): DraftResult => ({ ok: false, message });
  if (!object(value) || !keys(value, 'knowledge,profile,version') || value.version !== 1) return invalid('Choose a version 1 Companion draft.');
  const p = value.profile;
  if (!object(p) || !keys(p, 'escalation,name,persona,tone') || !text(p.name, 80, true) || !text(p.persona, 4000)
    || !AGENT_TONES.includes(p.tone as AgentTone)) return invalid('Check the agent name, instructions, and tone.');
  const e = p.escalation;
  if (!object(e) || !keys(e, 'afterTurns,keywords') || !Array.isArray(e.keywords) || e.keywords.length > 20
    || !e.keywords.every(k => text(k, 80, true))
    || (e.afterTurns !== null && (typeof e.afterTurns !== 'number' || !Number.isInteger(e.afterTurns) || e.afterTurns < 1 || e.afterTurns > 100))) {
    return invalid('Use up to 20 escalation keywords and a turn limit from 1 to 100.');
  }
  if (!Array.isArray(value.knowledge) || value.knowledge.length > 20) return invalid('Use up to 20 knowledge documents.');
  const knowledge: KnowledgeDocument[] = [];
  const ids = new Set<string>();
  for (const d of value.knowledge) {
    if (!object(d) || !keys(d, 'content,id,kind,title') || !text(d.id, 80, true) || ids.has(d.id)
      || !text(d.title, 160, true) || !text(d.content, 6000, true) || !KNOWLEDGE_KINDS.includes(d.kind as KnowledgeKind)) {
      return invalid('Each document needs a unique ID, a title, a supported kind, and 1–6,000 characters of content.');
    }
    ids.add(d.id);
    knowledge.push({ id: d.id, title: d.title.trim(), kind: d.kind as KnowledgeKind, content: d.content });
  }
  if (JSON.stringify(value).length > DRAFT_LIMIT) return invalid('The complete draft must be under 80,000 characters.');
  return { ok: true, draft: { version: 1, profile: { name: p.name.trim(), persona: p.persona, tone: p.tone as AgentTone,
    escalation: { keywords: [...new Set(e.keywords.map(k => k.trim()))], afterTurns: e.afterTurns as number | null } }, knowledge } };
}

// A recommendation only: no notification, task, or communication is created.
export function shouldEscalate(profile: AgentProfile, history: { role: 'user' | 'assistant'; content: string }[], reply: string) {
  const lastUser = [...history].reverse().find(m => m.role === 'user')?.content ?? '';
  const haystack = `${lastUser}\n${reply}`.toLowerCase();
  return profile.escalation.keywords.some(k => !!k.trim() && haystack.includes(k.trim().toLowerCase()))
    || (profile.escalation.afterTurns !== null && history.filter(m => m.role === 'user').length >= profile.escalation.afterTurns);
}
