'use client';

// Adapted from dojang/companion app/(kiosk)/integration/pair/page.tsx and its
// glass-card styles. Staff review continues to use the existing Odoo sign-in.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import styles from './kioskPairing.module.css';

export default function KioskPairing({ enabled }: { enabled: boolean }) {
  const [clock,setClock] = useState('');
  useEffect(()=>{const timer=setInterval(()=>setClock(new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})),1000);return()=>clearInterval(timer);},[]);
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
  return <>
    <header className={styles.header}><span className={styles.logo}>DOJANG</span><span className={styles.clock}>{clock}</span></header>
    <div className={styles.page}>
      <section className={styles.card} aria-labelledby="pair-title">
        <div className={styles.titles}>
          <h1 id="pair-title">Connect an authorized test device</h1>
          <p>This connection is limited to the configured Odoo test environment. Device pairing does not grant staff access.</p>
        </div>
        <form onSubmit={submit} className={styles.form} aria-describedby={!enabled?'pair-status':undefined}>
          <label className={styles.field}>Access
            <span className={styles.selectWrap}>
              <select name="role" aria-label="Access" defaultValue="kiosk" className={styles.input} disabled={busy}>
                <option value="kiosk">Kiosk</option>
                <option value="staff" disabled>Staff review — use Odoo sign-in</option>
              </select>
              <ChevronDown size={16} aria-hidden="true" className={styles.chevron}/>
            </span>
          </label>
          <label className={styles.field}>Pairing key
            <input name="pairKey" type="password" autoComplete="off" minLength={32} maxLength={256} required value={pairKey}
              onChange={event=>setPairKey(event.target.value)} disabled={busy} className={styles.input}/>
          </label>
          <button type="submit" disabled={!enabled||busy||pairKey.length<32} className={styles.submit}>{busy?'Connecting…':'Connect test device'}</button>
        </form>
        {!enabled&&<p id="pair-status" role="status" className={styles.notice}>This server is not configured for Odoo test pairing. Staff must configure the kiosk connection before connecting this device.</p>}
        {error&&<p role="alert" className={styles.notice}>{error}</p>}
        <Link href="/kiosk" className={styles.back}>Back to kiosk</Link>
      </section>
    </div>
  </>;
}
