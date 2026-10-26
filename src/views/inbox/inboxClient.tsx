"use client";

import { useCallback, useEffect, useState } from "react";
import { Inbox as InboxIcon, MessageSquare } from "lucide-react";
import { focusKey } from "@/domain/companion";
import type { HubMessage } from "@/domain/inbox";
import { getInboxContext, signOutOfHub, SIGN_IN_CODES, type InboxContextAnswer } from "@/integrations/hub";
import { DoForMeFocus, useDoForMe } from "@/views/doForMe/doForMeProvider";
import { deliveryOf, inboxRailContext, messageRailContext, needsStaff } from "./inboxCompanion";
import InboxList from "./inboxList";
import { EmptyState, ErrorBlock, LoadingBlock, Tabs } from "./inboxStates";
import MessageView from "./messageView";
import StaffSignIn from "@/views/shell/staffSignIn";

/*
   Inbox (CRM screen C05): guardian messages that WhatsMax received, as the Hub's
   inbox read gives them, one work item per row. Two-pane layout and filter tabs
   adapted from licensed Roster 1.0.0 components/inbox/inbox-client.tsx
   (docs/LICENSE-MAP.md), without its database, sign-in, polling, send box or
   Close/Reopen. The workflow is Companion's /hub Inbox; the rules are the Hub's.

   Read through POST /api/hub "context" (src/integrations/hub.ts). The server
   decides where that answers from (`source`):
   - "hub": the real Hub in Odoo, after staff sign in. Read-only here: the
     message actions stay off and Do For Me offers none.
   - "fixture": development sample messages, labelled as such.
*/

type Filter = "needs" | "replied" | "all";

const EMPTY_TEXT: Record<Filter, { title: string; description: string }> = {
  needs: { title: "Nothing needs you", description: "Every message has an approved reply." },
  replied: { title: "No replies approved yet", description: "Approved replies and their delivery state show here." },
  all: { title: "No messages", description: "Guardian messages synced from WhatsMax show here." },
};

export default function InboxClient({
  initialMessageId,
  source,
}: {
  initialMessageId: string | null;
  source: "hub" | "fixture";
}) {
  const [answer, setAnswer] = useState<InboxContextAnswer | null>(null); // null while loading
  const [filter, setFilter] = useState<Filter>("needs");
  const [selectedId, setSelectedId] = useState<string | null>(initialMessageId);
  const doForMe = useDoForMe();

  // Read the inbox again (after an action, or Try again)
  const load = useCallback(async () => {
    const next = await getInboxContext();
    setAnswer(next);
  }, []);

  // The first read, when the page opens
  useEffect(() => {
    let cancelled = false;
    getInboxContext().then((next) => {
      if (!cancelled) setAnswer(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function retry() {
    setAnswer(null);
    void load();
  }

  async function signOut() {
    await signOutOfHub();
    retry();
  }

  const readOnly = source === "hub";
  const needsSignIn = answer?.outcome === "unavailable" && SIGN_IN_CODES.includes(answer.code ?? "");
  const loaded = answer?.outcome === "loaded" ? answer : null;
  const context = loaded?.context ?? null;
  const simulated = loaded?.simulatedOutbound ?? false;

  const matches = (message: HubMessage) => {
    if (!context) return false;
    if (filter === "needs") return needsStaff(context, message);
    if (filter === "replied") return deliveryOf(context, message.id) !== null;
    return true;
  };
  const shown = context ? context.messages.filter(matches) : [];
  // Like Roster: with nothing chosen, the first row in view is selected
  const selected =
    (context && selectedId ? context.messages.find((message) => message.id === selectedId) : null) ??
    shown[0] ??
    null;

  const railKey = selected ? focusKey({ kind: "message", messageId: selected.id }) : focusKey({ kind: "inbox" });

  return (
    <div className="crm-scope overflow-hidden rounded-2xl border border-(--crm-line)">
      {source === "fixture" && (
        <p className="border-b border-(--crm-line) px-5 py-3 text-[11px] text-(--crm-text-secondary) sm:px-6">
          Sample messages · Development preview, not connected to Odoo or WhatsMax. Nothing is sent.
        </p>
      )}
      {source === "hub" && context && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-(--crm-line) px-5 py-3 text-[11px] text-(--crm-text-secondary) sm:px-6">
          <p>
            Odoo · {context.principal.name} ({context.principal.role}) · site {context.principal.siteId} ·
            Read-only here: resolving, drafting and approving stay in Companion for now.
          </p>
          <button type="button" onClick={signOut} className="font-bold text-(--crm-text) hover:underline">
            Sign out
          </button>
        </div>
      )}

      {/* Do For Me follows the selected message, or the inbox as a whole */}
      {context && (
        <DoForMeFocus
          focusKey={railKey}
          context={
            selected ? messageRailContext(context, selected, simulated, readOnly) : inboxRailContext(context, simulated)
          }
        />
      )}

      <div className="p-5 sm:p-6">
        <header className="mb-4">
          <h1 className="text-xl font-bold leading-tight text-(--crm-text)">Inbox</h1>
          <p className="mt-1 text-sm text-(--crm-text-secondary)">
            Guardian messages received through WhatsMax, one per row. Replies are reviewed and approved here.
          </p>
        </header>

        {context && (
          <Tabs
            label="Message filters"
            active={filter}
            onChange={(key) => {
              setFilter(key as Filter);
              setSelectedId(null);
            }}
            tabs={[
              { key: "needs", label: "Needs you", count: context.messages.filter((m) => needsStaff(context, m)).length },
              { key: "replied", label: "Replied", count: context.messages.filter((m) => deliveryOf(context, m.id)).length },
              { key: "all", label: "All", count: context.messages.length },
            ]}
          />
        )}

        {needsSignIn ? (
          <div className="mt-4 rounded-xl border border-(--crm-line) bg-(--crm-panel)">
            <StaffSignIn onSignedIn={retry} />
          </div>
        ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[330px_minmax(0,1fr)]">
          <section
            aria-label="Messages"
            className="flex max-h-[calc(100vh-15rem)] min-h-64 flex-col overflow-hidden rounded-xl border border-(--crm-line) bg-(--crm-panel)"
          >
            {!answer ? (
              <LoadingBlock label="Loading messages…" />
            ) : answer.outcome === "unavailable" ? (
              <ErrorBlock message={answer.text} onRetry={retry} />
            ) : shown.length === 0 ? (
              <EmptyState icon={<InboxIcon size={20} />} {...EMPTY_TEXT[filter]} />
            ) : (
              <InboxList
                context={answer.context}
                messages={shown}
                selectedId={selected?.id ?? null}
                onSelect={setSelectedId}
              />
            )}
          </section>

          <section
            aria-label="Message"
            className="flex max-h-[calc(100vh-15rem)] min-h-64 flex-col overflow-hidden rounded-xl border border-(--crm-line) bg-(--crm-raised)"
          >
            {context && selected ? (
              <MessageView
                key={selected.id}
                context={context}
                message={selected}
                simulated={simulated}
                readOnly={readOnly}
                picked={doForMe.pickedFor(railKey)}
                onChanged={load}
                onSettled={() => doForMe.settle(railKey, "plan")}
              />
            ) : (
              <EmptyState
                icon={<MessageSquare size={20} />}
                title="Pick a message"
                description="Choose a message on the left to see it and what to do next."
              />
            )}
          </section>
        </div>
        )}
      </div>
    </div>
  );
}
