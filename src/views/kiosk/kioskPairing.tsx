'use client';

// Adapted from dojang/companion app/(kiosk)/integration/pair/page.tsx and its
// glass-card styles. Staff review continues to use the existing Odoo sign-in.

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function KioskPairing({ enabled }: { enabled: boolean }) {
  const [pairKey, setPairKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!enabled || busy || pairKey.length < 32) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/integration/pair', { method: 'POST', cache: 'no-store',
        headers: { 'content-type': 'application/json' }, body: JSON.stringify({ role: 'kiosk', pairKey }),
        signal: AbortSignal.timeout(12000) });
      const body = await response.json().catch(() => null);
      if (response.ok && body?.paired === true) { router.replace('/kiosk'); router.refresh(); }
      else setError(response.status === 403 ? 'Pairing was not authorized. Ask staff to check the pairing key.' : 'Pairing is unavailable. Ask staff to check the kiosk connection.');
    } catch { setError('Pairing could not be confirmed. Try again or ask staff.'); }
    finally { setPairKey(''); setBusy(false); }
  }
  return <div className="flex flex-1 flex-col justify-center py-8">
    <section className="kiosk-pair-card mx-auto flex w-full max-w-xl flex-col gap-6 rounded-3xl border border-(--kiosk-line) p-6 sm:p-8" aria-labelledby="pair-title">
      <div className="space-y-2.5">
        <h1 id="pair-title" className="text-2xl leading-tight font-bold text-(--kiosk-text) sm:text-[1.75rem]">Connect an authorized test device</h1>
        <p className="text-base leading-relaxed text-(--kiosk-text-secondary)">Connect this kiosk to the configured Odoo test environment. Device pairing does not grant staff access.</p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4" aria-describedby={!enabled ? 'pair-status' : undefined}>
        <label className="flex flex-col gap-2 text-sm font-semibold text-(--kiosk-text-secondary)">Access
          <select name="role" defaultValue="kiosk" className="kiosk-pair-input min-h-12 w-full rounded-xl border border-(--kiosk-line) px-4 text-base font-normal text-(--kiosk-text)">
            <option value="kiosk">Kiosk</option>
            <option value="staff" disabled>Staff review — use Odoo sign-in</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-(--kiosk-text-secondary)">Pairing key
        <input name="pairKey" type="password" autoComplete="off" minLength={32} maxLength={256} required value={pairKey}
          onChange={event => setPairKey(event.target.value)} disabled={busy}
          className="kiosk-pair-input min-h-12 w-full rounded-xl border border-(--kiosk-line) px-4 text-base font-normal text-(--kiosk-text)" />
      </label>
        <button type="submit" disabled={!enabled || busy || pairKey.length < 32} className="kiosk-pair-submit mt-2 flex min-h-16 w-full items-center justify-center rounded-full border border-(--kiosk-line) px-6 text-base font-semibold text-(--kiosk-text) transition-colors disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none">{busy ? 'Connecting…' : 'Connect test device'}</button>
      </form>
      {!enabled && <p id="pair-status" role="status" className="text-sm leading-relaxed text-(--kiosk-muted)">This server is not configured for Odoo test pairing. Staff must configure the kiosk connection before connecting this device.</p>}
      {error && <p role="alert" className="text-sm text-(--kiosk-text)">{error}</p>}
      <Link href="/kiosk" className="inline-flex min-h-12 items-center self-start text-sm text-(--kiosk-text-secondary) underline underline-offset-4">Back to kiosk</Link>
    </section>
  </div>;
}
