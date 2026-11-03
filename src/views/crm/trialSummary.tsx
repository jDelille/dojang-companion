'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getTrialContext, type TrialRead } from '@/integrations/trial';
import HubUnavailable from '@/views/shell/hubUnavailable';
import { TimeLabel } from './localTime';
import type { PostTrialMode } from './postTrialReview';

const LABELS = { reserved: 'Reserved', attended: 'Attended', no_show: 'No-show', cancelled: 'Cancelled', converted: 'Converted' };
export default function TrialSummary({ leadId, revision, onRecord, onPostTrial }: { leadId: string; revision: number; onRecord: (trialId: string) => void; onPostTrial: (trialId: string, mode: PostTrialMode) => void }) {
  const [read, setRead] = useState<TrialRead | null>(null), [reload, setReload] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    void getTrialContext(leadId, '', controller.signal).then(result => { if (!cancelled) setRead(result); });
    return () => { cancelled = true; controller.abort(); };
  }, [leadId, revision, reload]);
  if (!read) return <p role="status" className="mt-3 text-[12px] text-(--crm-muted)">Loading saved trial records…</p>;
  if (read.outcome === 'unavailable') return <div className="mt-3"><HubUnavailable code={read.code} text={read.text} /><button type="button" className="text-[12px] underline" onClick={() => { setRead(null); setReload(n => n + 1); }}>Reload trial records</button></div>;
  return <div className="mt-3 space-y-3">
    {read.context.trials.length === 0 ? <p className="text-[12px] text-(--crm-muted)">Odoo returned no trial records for this lead.</p> : <ul className="space-y-4" aria-label="Saved trial records">
      {read.context.trials.map(trial => <li key={trial.id} className="space-y-1 border-b border-(--crm-line) pb-3 text-[12px]">
        <p className="font-bold text-(--crm-text)"><Link href={`/people/${trial.member.id}`} className="underline underline-offset-4">{trial.member.name}</Link> · {LABELS[trial.state]}</p>
        <p className="text-(--crm-text-secondary)">{trial.session.title} · <TimeLabel iso={trial.session.startsAt} /></p>
        <p className="text-(--crm-muted)">Trial #{trial.id} · Student #{trial.member.id} · Class #{trial.session.id}</p>
        {trial.state === 'reserved' && <><button type="button" className="mt-2 font-bold text-(--crm-text) underline underline-offset-4" onClick={() => onRecord(trial.id)}>Review / record attendance</button>
          {trial.session.canRecordOutcome === false && <p className="text-(--crm-muted)">Attendance opens 15 minutes before class starts.</p>}
          {trial.session.canRecordOutcome === null && <p className="text-(--crm-muted)">Attendance availability was not provided by this read.</p>}</>}
        {trial.state === 'attended' && <div className="space-y-2 pt-2"><p className="text-(--crm-text-secondary)">Recorded attendance supports post-trial follow-up and a stage-review proposal.</p><div className="flex flex-wrap gap-3">
          <button type="button" className="font-bold text-(--crm-text) underline underline-offset-4" onClick={() => onPostTrial(trial.id, 'follow_up')}>Prepare follow-up</button>
          <button type="button" className="font-bold text-(--crm-text) underline underline-offset-4" onClick={() => onPostTrial(trial.id, 'stage')}>Review stage proposal</button>
        </div></div>}
      </li>)}
    </ul>}
    {read.context.trials.length === 20 && <p className="text-[11px] text-(--crm-muted)">Latest 20 trial records returned by Odoo.</p>}
  </div>;
}
