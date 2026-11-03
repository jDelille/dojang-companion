'use client';

// Adapted from Roster 1.0.0 components/agents/{agent-config,knowledge-base,test-chat}.tsx.
// Original source hashes: vendor/licensed/roster/ai-foundation/SOURCE-MANIFEST.json.
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AGENT_TONES, DRAFT_LIMIT, KNOWLEDGE_KINDS, NEW_AGENT_DRAFT, readAgentDraft,
  type AgentDraft, type AgentTone, type KnowledgeDocument, type KnowledgeKind } from '@/domain/ai/agentProfile';
import { buildAgentPrompt } from '@/domain/ai/prompt';
import { Button } from '@/templates/roster/components/ui/button';
import { Card, CardBody, CardHeader } from '@/templates/roster/components/ui/card';
import { Field, Input, Select, Textarea } from '@/templates/roster/components/ui/form';
import { PageHeader } from '@/templates/roster/components/ui/layout';
import { Modal } from '@/templates/roster/components/ui/overlay';
import AgentConversation from './agentConversation';
import { useStaffConnection } from '@/views/shell/staffConnection';
import type { AiSettingsRead } from '@/domain/ai/settings';
import AiSettingsPanel from './aiSettingsPanel';

const blankDocument = (): KnowledgeDocument => ({ id: crypto.randomUUID(), title: '', kind: 'doc', content: '' });
const initialFingerprint = JSON.stringify(NEW_AGENT_DRAFT);

export default function AgentSetup({ liveSettings }: { liveSettings: AiSettingsRead }) {
  const [draft, setDraft] = useState<AgentDraft>(NEW_AGENT_DRAFT);
  const [document, setDocument] = useState<KnowledgeDocument | null>(null);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState('');
  const [baseline, setBaseline] = useState(initialFingerprint);
  const fileRef = useRef<HTMLInputElement>(null);
  const connection = useStaffConnection();
  const dirty = JSON.stringify(draft) !== baseline;
  const parsed = readAgentDraft(draft);
  const available = connection?.state === 'signedIn';

  // Drafts are deliberately not persisted in browser storage or shared across staff.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function exportDraft() {
    if (!parsed.ok) { setMessage(parsed.message); return; }
    const url = URL.createObjectURL(new Blob([JSON.stringify(parsed.draft, null, 2)], { type: 'application/json' }));
    const anchor = window.document.createElement('a');
    anchor.href = url;
    anchor.download = 'dojang-companion-draft.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setBaseline(JSON.stringify(draft));
    setMessage('Draft exported. Live Companion settings have not changed.');
  }

  async function importDraft(file: File | undefined) {
    if (!file) return;
    if (file.size > DRAFT_LIMIT * 4) { setMessage('This draft file is too large.'); return; }
    if (dirty && !window.confirm('Replace the current unexported draft?')) return;
    try {
      const raw = await file.text();
      if (raw.length > DRAFT_LIMIT) { setMessage('This draft file is too large.'); return; }
      const result = readAgentDraft(JSON.parse(raw));
      if (!result.ok) { setMessage(result.message); return; }
      setDraft(result.draft);
      setBaseline(JSON.stringify(result.draft));
      setDocument(null);
      setMessage('Draft imported for editing. It is not active.');
    } catch {
      setMessage('Choose a valid Companion draft JSON file.');
    }
  }

  function saveDocument() {
    if (!document) return;
    const candidate: AgentDraft = { ...draft, knowledge: draft.knowledge.some(d => d.id === document.id)
      ? draft.knowledge.map(d => d.id === document.id ? document : d) : [...draft.knowledge, document] };
    const result = readAgentDraft(candidate);
    if (!result.ok) { setMessage(result.message); return; }
    setDraft(result.draft);
    setDocument(null);
    setMessage('Document added to the draft. It is not used by live answers.');
  }

  return (
    <div className="roster-scope">
      <PageHeader title="Companion setup" description="Prepare an agent profile and reference documents, then test the current Companion connection."
        actions={<Link href="/inbox" className="text-sm underline underline-offset-4">Back to Inbox</Link>} />
      <p className="mb-5 rounded-lg border border-(--crm-line) bg-(--crm-raised) p-4 text-sm text-(--crm-text-secondary)">
        Draft workspace · Changes stay on this page until exported. Live answers use the current Hub configuration.
        Activating profiles and publishing knowledge require a Hub configuration integration.
      </p>
      {message && <p role="status" className="mb-4 text-sm text-(--crm-text-secondary)">{message}</p>}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader title="Agent profile" />
            <CardBody>
              <div className="space-y-4">
                <Field label="Agent name"><Input value={draft.profile.name} maxLength={80}
                  onChange={e => setDraft({ ...draft, profile: { ...draft.profile, name: e.target.value } })} /></Field>
                <Field label="Instructions" hint="Describe the agent’s job. These instructions cannot grant permissions or execute actions.">
                  <Textarea value={draft.profile.persona} maxLength={4000}
                    onChange={e => setDraft({ ...draft, profile: { ...draft.profile, persona: e.target.value } })} />
                </Field>
                <Field label="Tone"><Select value={draft.profile.tone}
                  onChange={e => setDraft({ ...draft, profile: { ...draft.profile, tone: e.target.value as AgentTone } })}>
                  {AGENT_TONES.map(tone => <option key={tone} value={tone}>{tone}</option>)}
                </Select></Field>
                <Field label="Recommend staff review after" hint="Number of user turns, from 1 to 100. Leave blank for no turn limit.">
                  <Input type="number" min={1} max={100} value={draft.profile.escalation.afterTurns ?? ''}
                    onChange={e => setDraft({ ...draft, profile: { ...draft.profile, escalation: {
                      ...draft.profile.escalation, afterTurns: e.target.value === '' ? null : Number(e.target.value),
                    } } })} />
                </Field>
                <Field label="Review keywords" hint="One keyword or phrase per line, up to 20. This recommends review; it does not create a task.">
                  <Textarea value={draft.profile.escalation.keywords.join('\n')} maxLength={1620}
                    onChange={e => setDraft({ ...draft, profile: { ...draft.profile, escalation: {
                      ...draft.profile.escalation, keywords: e.target.value ? e.target.value.split('\n') : [],
                    } } })} />
                </Field>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Knowledge draft" action={<Button type="button" size="sm" disabled={draft.knowledge.length >= 20}
              onClick={() => setDocument(blankDocument())}>Add document</Button>} />
            <CardBody>
              <p className="mb-3 text-xs muted">Reference text for prompt construction. This is not a connected knowledge library or vector search.</p>
              {draft.knowledge.length === 0 ? <p className="text-sm muted">No documents in this draft.</p> :
                <ul className="divide-y divide-(--crm-line)">{draft.knowledge.map(doc => (
                  <li key={doc.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div className="min-w-0"><p className="break-words text-sm font-medium">{doc.title}</p>
                      <p className="text-xs muted">{doc.kind} · {doc.content.length.toLocaleString()} characters</p></div>
                    <div className="flex gap-2">
                      <Button type="button" size="sm" onClick={() => setDocument({ ...doc })} aria-label={`Edit ${doc.title}`}>Edit</Button>
                      <Button type="button" size="sm" onClick={() => {
                        if (window.confirm(`Remove “${doc.title}” from this draft?`)) setDraft({ ...draft, knowledge: draft.knowledge.filter(d => d.id !== doc.id) });
                      }} aria-label={`Remove ${doc.title}`}>Remove</Button>
                    </div>
                  </li>
                ))}</ul>}
            </CardBody>
          </Card>
          {!parsed.ok && <p role="alert" className="text-sm text-(--crm-warning)">{parsed.message}</p>}
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" disabled={!parsed.ok} onClick={() => setPreview(true)}>Preview prompt</Button>
            <Button type="button" disabled={!parsed.ok} onClick={exportDraft}>Export draft</Button>
            <Button type="button" onClick={() => fileRef.current?.click()}>Import draft</Button>
            <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" aria-label="Import Companion draft"
              onChange={e => { void importDraft(e.target.files?.[0]); e.target.value = ''; }} />
            <span className="text-xs muted">{dirty ? 'Unexported changes' : 'Draft only'}</span>
          </div>
        </div>
        <div className="min-w-0 space-y-5">
        <AiSettingsPanel read={liveSettings} />
        <Card>
          <CardHeader title="Test current Companion" />
          <CardBody><p className="text-xs muted">Uses the authenticated Hub and site-level facts. Draft instructions and documents on the left are not sent.
            Provider credentials, model selection, and AI policy remain managed by Hub.</p></CardBody>
          {available ? <AgentConversation focusKey="today" onReview={() => {}} showSetupLink={false} /> :
            <p className="p-4 text-sm muted">Sign in to a connected Odoo site to test live answers. Draft editing remains available.</p>}
        </Card>
        </div>
      </div>
      <Modal open={!!document} onClose={() => setDocument(null)} title="Knowledge document" description="Edits affect this draft only."
        onSubmit={saveDocument} footer={<><Button type="button" onClick={() => setDocument(null)}>Cancel</Button><Button type="submit">Use in draft</Button></>}>
        {document && <div className="space-y-4">
          <Field label="Title"><Input value={document.title} maxLength={160} onChange={e => setDocument({ ...document, title: e.target.value })} /></Field>
          <Field label="Kind"><Select value={document.kind} onChange={e => setDocument({ ...document, kind: e.target.value as KnowledgeKind })}>
            {KNOWLEDGE_KINDS.map(kind => <option key={kind} value={kind}>{kind}</option>)}
          </Select></Field>
          <Field label="Content" hint="Up to 6,000 characters."><Textarea value={document.content} maxLength={6000}
            onChange={e => setDocument({ ...document, content: e.target.value })} /></Field>
          {message && <p role="status" className="text-sm muted">{message}</p>}
        </div>}
      </Modal>
      <Modal open={preview} onClose={() => setPreview(false)} title="Draft prompt preview" width="lg"
        description="This preview is not sent to a model and does not change live Companion behavior.">
        <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap break-words text-xs">{parsed.ok ? buildAgentPrompt(parsed.draft) : parsed.message}</pre>
      </Modal>
    </div>
  );
}
