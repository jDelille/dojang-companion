"use client";

import { useRouter } from "next/navigation";
import { signOutOfHub, SIGN_IN_CODES } from "@/integrations/hub";
import StaffSignIn from "./staffSignIn";

/*
   What a server-rendered page shows when its real Hub read failed: the staff
   sign-in when Odoo needs one, otherwise the honest reason and Try again.
   Never sample data instead.
*/

export default function HubUnavailable({ code, text }: { code: string; text: string }) {
  const router = useRouter();

  if (SIGN_IN_CODES.includes(code)) {
    return <StaffSignIn onSignedIn={() => router.refresh()} />;
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

// "Sign out" in a page's Odoo banner
export function HubSignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await signOutOfHub();
        router.refresh();
      }}
      className="font-bold text-(--crm-text) hover:underline"
    >
      Sign out
    </button>
  );
}
