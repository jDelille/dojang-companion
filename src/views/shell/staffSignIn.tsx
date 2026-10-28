"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInToHub } from "@/integrations/hub";
import { useResetOnAuthenticationLoss, useStaffSessionReset } from "./staffSession";

/*
   Staff sign-in to the real Hub, shown where a page needs Odoo data and nobody is
   signed in. The login and password go to this app's server, which signs in to
   Odoo and keeps only a sealed session cookie (src/server/hub-gateway.ts). Like
   Companion's sign-in, with the staff member's own Odoo account.

   It only appears when the Hub said nobody is signed in (SIGN_IN_REQUIRED or
   UNAUTHENTICATED: never signed in, signed out, or the session expired), so it
   also clears the open record tabs and the Do For Me rail when it appears.
   Signing in reloads the page's server data (router.refresh), so the site control
   and nav rail show who is signed in; onSignedIn is for a page's own reads.
*/

const field =
  "mt-1 h-10 w-full rounded-lg border border-(--crm-line) bg-(--crm-canvas) px-3 text-[13px] text-(--crm-text) focus:border-(--crm-muted) focus:outline-none";

export default function StaffSignIn({ onSignedIn }: { onSignedIn?: () => void }) {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resetStaffSession = useStaffSessionReset();
  useResetOnAuthenticationLoss();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const failure = await signInToHub(login.trim(), password);
    setBusy(false);
    setPassword("");
    if (failure) {
      setError(failure);
      return;
    }
    // A new staff session: nothing from a previous one carries over
    resetStaffSession();
    if (onSignedIn) onSignedIn();
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-sm p-6" aria-label="Staff sign-in">
      <h2 className="text-[15px] font-bold text-(--crm-text)">Sign in to Odoo</h2>
      <p className="mt-1 text-[12px] leading-relaxed text-(--crm-text-secondary)">
        Use your own Odoo staff account. Your password goes to Odoo only and isn&apos;t stored.
      </p>
      <label className="mt-4 block text-[12px] text-(--crm-text-secondary)">
        Login
        <input
          type="text"
          autoComplete="username"
          value={login}
          onChange={(event) => setLogin(event.target.value)}
          disabled={busy}
          className={field}
        />
      </label>
      <label className="mt-3 block text-[12px] text-(--crm-text-secondary)">
        Password
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={busy}
          className={field}
        />
      </label>
      {error && (
        <p role="alert" className="mt-3 rounded-lg border border-(--crm-danger)/50 px-3 py-2 text-[12px] text-(--crm-text)">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy || !login.trim() || !password}
        className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-(--crm-brand) text-[13px] font-bold text-white disabled:opacity-50"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
