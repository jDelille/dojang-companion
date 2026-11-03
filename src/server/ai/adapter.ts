// Adapted from Roster 1.0.0 lib/ai/adapter.ts. Provider-neutral server foundation.
// No vendor model catalog: model IDs must be verified by the configured provider.
export type ChatMessage = { role: 'user' | 'assistant'; content: string };
export type ChatRequest = { system: string; messages: ChatMessage[]; model: string; maxTokens?: number; signal?: AbortSignal };
export type ChatUsage = { inputTokens: number; outputTokens: number };
export type ChatResult = { text: string; model: string; usage: ChatUsage | null; stopReason?: string | null; refused?: boolean };
export type StreamChunk =
  | { type: 'text'; text: string }
  | { type: 'done'; model: string; usage: ChatUsage | null; stopReason?: string | null }
  | { type: 'error'; code: string };
export interface CompletionAdapter<Request, Result> {
  readonly id: string;
  complete(request: Request): Promise<Result>;
}
export interface AiProviderAdapter extends CompletionAdapter<ChatRequest, ChatResult> {
  stream(request: ChatRequest): AsyncGenerator<StreamChunk>;
}

// An interrupted stream must not turn into a successful completion or zero usage.
export async function collectStream(chunks: AsyncGenerator<StreamChunk>): Promise<ChatResult> {
  let text = '';
  for await (const chunk of chunks) {
    if (chunk.type === 'error') throw new Error(chunk.code);
    if (chunk.type === 'text') text += chunk.text;
    if (chunk.type === 'done') return { text, model: chunk.model, usage: chunk.usage, stopReason: chunk.stopReason };
  }
  throw new Error('AI_STREAM_INCOMPLETE');
}
