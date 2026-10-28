"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOutOfHub, SIGN_IN_CODES } from "@/integrations/hub";
import { useMarkSignedOut } from "./staffConnection";
import StaffSignIn from "./staffSignIn";
import { useStaffSessionReset } from "./staffSession";

/*
   What a server-rendered page shows when its real Hub read failed: the staff
   sign-in when Odoo needs one, otherwise the honest reason and Try again.
   Never sample data instead.
*/

export default function HubUnavailable({ code, text }: { code: string; text: string }) {
  const router = useRouter();

  if (SIGN_IN_CODES.includes(code)) {
    // Signing in reloads the page (StaffSignIn), which reads it again
    return <StaffSignIn />;
  }
  return (
    <div role="alert" className="grid min-h-60 place-items-center p-6 text-center">
      <div>
        <p className="text-[13px] font-bold text-(--crm-text)">{text}</p>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="mt-3 inline-flex h-8 items-center rounded-lg border border-(--crm-line) bg-(--crm-interactive) px-3 text-[12px] font-bold text-(--crm-text) hover:border-(--crm-muted)"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

// "Sign out" in a page's Odoo banner. Only a confirmed sign-out clears the tabs
// and the rail, shows "not signed in" in the site control and reloads the page;
// otherwise it says sign-out didn't complete.
export function HubSignOutButton({ onSignedOut }: { onSignedOut?: () => void }) {
  const router = useRouter();
  const resetStaffSession = useStaffSessionReset();
  const markSignedOut = useMarkSignedOut();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function signOut() {
    setBusy(true);
    setFailed(false);
    const confirmed = await signOutOfHub();
    setBusy(false);
    if (!confirmed) {
      setFailed(true);
      return;
    }
    resetStaffSession();
    markSignedOut();
    if (onSignedOut) onSignedOut();
    else router.refresh();
  }

  return (
    <span className="flex items-center gap-3">
      {failed && (
        <span role="alert" className="text-(--crm-danger)">
          Sign-out didn&apos;t complete. You may still be signed in. Try again.
        </span>
      )}
      <button
        type="button"
        onClick={signOut}
        disabled={busy}
        className="font-bold text-(--crm-text) hover:underline disabled:opacity-50"
      >
        {busy ? "Signing out…" : "Sign out"}
      </button>
    </span>
  );
}
