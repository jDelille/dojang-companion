'use client';

import { useRouter } from 'next/navigation';
import type { AiSettingsRead } from '@/domain/ai/settings';
import { Button } from '@/templates/roster/components/ui/button';
import { Card, CardBody, CardHeader } from '@/templates/roster/components/ui/card';

export default function AiSettingsPanel({ read }: { read: AiSettingsRead }) {
  const router = useRouter();
  return (
    <Card>
      <CardHeader title="Live AI configuration" action={<Button type="button" size="sm" onClick={() => router.refresh()}>Refresh status</Button>} />
      <CardBody>
        {read.outcome === 'unavailable' ? <p role="status" className="text-sm muted">{read.text}</p> : <>
          <dl className="space-y-3 text-sm">
            <div className="flex flex-wrap justify-between gap-2"><dt className="muted">Provider configuration</dt><dd>{read.settings.configured ? 'Configured' : 'Not configured'}</dd></div>
            <div className="flex flex-wrap justify-between gap-2"><dt className="muted">Site AI</dt><dd>{read.settings.enabled ? 'Enabled' : 'Disabled'}</dd></div>
            <div className="flex flex-wrap justify-between gap-2"><dt className="muted">Model</dt><dd className="break-all">{read.settings.model ?? 'Not provided by Hub'}</dd></div>
          </dl>
          {read.settings.lastCheck ? <div className="mt-4 border-t border-(--crm-line) pt-3 text-xs muted">
            <p>Last activation check: <time dateTime={read.settings.lastCheck.at}>{read.settings.lastCheck.at}</time></p>
            <p className="mt-1">{read.settings.lastCheck.mode}</p>
            <p className="mt-1">Check model: {read.settings.lastCheck.model ?? 'Not provided by Hub'}</p>
          </div> : <p className="mt-4 text-xs muted">No activation check recorded by Hub.</p>}
          <p className="mt-3 text-xs muted">Configuration status is not a live provider health check. Activation and provider settings are managed in Odoo.</p>
        </>}
      </CardBody>
    </Card>
  );
}
