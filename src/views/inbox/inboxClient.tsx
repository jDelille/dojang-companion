"use client";

import { useCallback, useEffect, useState } from "react";
import { Inbox as InboxIcon, MessageSquare } from "lucide-react";
import { focusKey, type CompanionContext, type Suggestion } from "@/domain/companion";
import type { HubMessage } from "@/domain/inbox";
import { getInboxContext, SIGN_IN_CODES, type InboxContextAnswer } from "@/integrations/hub";
import { DoForMeFocus, useDoForMe } from "@/views/doForMe/doForMeProvider";
import { deliveryOf, inboxRailContext, memberName, messageRailContext, needsStaff } from "./inboxCompanion";
import ClassMovePlan from "./classMovePlan";
import InboxList from "./inboxList";
import { Card } from "@/templates/roster/components/ui/card";
import { EmptyState } from "@/templates/roster/components/ui/data";
import { ErrorBlock, LoadingBlock, PageHeader, Tabs } from "@/templates/roster/components/ui/layout";
import "@/templates/roster/roster.css";
import MemberContextPanel from "./memberContextPanel";
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

   Beside the selected message, the Odoo member it's linked to
   (memberContextPanel.tsx, the same member read as Member 360).
*/

type Filter = "needs" | "replied" | "all";

// Do For Me's class move (classMovePlan.tsx) is hidden for now. Set to true to
// offer it again; the plan, its Hub operations and their checks are unchanged.
const SHOW_CLASS_MOVE = false;

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

  // Do For Me's class move for the selected message: a confirmed student and an
  // upcoming class, not replied to yet. Reviewed and applied in the rail's Work
  // tab (classMovePlan.tsx), with the steps, Review and Apply.
  const fromSession = context && selected ? context.sessions.find((session) => session.id === selected.sessionId) : undefined;
  const canMove =
    SHOW_CLASS_MOVE && context !== null && selected !== null && selected.state === "resolved" && selected.memberId !== null &&
    deliveryOf(context, selected.id) === null && fromSession !== undefined && fromSession.future;
  const moveSuggestion: Suggestion | null =
    canMove && context && selected
      ? {
          id: `class-move:${selected.id}`,
          title: `Move ${memberName(context, selected.memberId) ?? "the student"} to another class`,
          explanation: "Moves the booking, replies to the guardian and adds a follow-up task. Nothing changes until you review and apply.",
          actionLabel: "Apply",
          capability: "inbox.move_class",
          risk: "medium",
          preview: [],
          panel: (
            <ClassMovePlan
              key={selected.id}
              context={context}
              message={selected}
              onClose={() => doForMe.settle(railKey, "plan")}
              onChanged={load}
            />
          ),
        }
      : null;
  let railContext: CompanionContext | null = null;
  if (context && selected) {
    const messageRail = messageRailContext(context, selected, simulated);
    railContext = moveSuggestion ? { ...messageRail, suggestions: [...messageRail.suggestions, moveSuggestion] } : messageRail;
  } else if (context) {
    railContext = inboxRailContext(context, simulated);
  }

  return (
    <div className="crm-scope roster-scope">
      {source === "fixture" && (
        <p className="mb-4 text-[11px] text-(--crm-text-secondary)">
          Sample messages · Development preview, not connected to Odoo or WhatsMax. Nothing is sent.
        </p>
      )}

      {/* Do For Me follows the selected message, or the inbox as a whole */}
      {railContext && <DoForMeFocus focusKey={railKey} context={railContext} />}

      <div>
        <PageHeader
          title="Inbox"
          description="Guardian messages received through WhatsMax, one per row. Replies are reviewed and approved here."
        />

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
          <Card className="mt-4">
            <StaffSignIn onSignedIn={retry} />
          </Card>
        ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[330px_minmax(0,1fr)] 2xl:grid-cols-[300px_minmax(0,1fr)_18rem]">
          {/* Messages | message | linked member. The member pane sits under the
              message until there's room for a third column. */}
          <Card
            role="region"
            aria-label="Messages"
            className="flex max-h-[calc(100vh-15rem)] min-h-64 flex-col overflow-hidden"
          >
            {!answer ? (
              <LoadingBlock label="Loading messages…" />
            ) : answer.outcome === "unavailable" ? (
              <ErrorBlock message={answer.text} onRetry={retry} />
            ) : shown.length === 0 ? (
              <EmptyState icon={<InboxIcon strokeWidth={1.75} />} {...EMPTY_TEXT[filter]} />
            ) : (
              <InboxList
                context={answer.context}
                messages={shown}
                selectedId={selected?.id ?? null}
                onSelect={setSelectedId}
              />
            )}
          </Card>

          <Card
            role="region"
            aria-label="Message"
            className="flex max-h-[calc(100vh-15rem)] min-h-64 flex-col overflow-hidden"
          >
            {context && selected ? (
              <MessageView
                key={selected.id}
                context={context}
                message={selected}
                simulated={simulated}
                picked={doForMe.pickedFor(railKey)}
                onChanged={load}
                onSettled={() => doForMe.settle(railKey, "plan")}
              />
            ) : (
              <EmptyState
                icon={<MessageSquare strokeWidth={1.75} />}
                title="Pick a message"
                description="Choose a message on the left to see it and what to do next."
              />
            )}
          </Card>

          {/* The linked member: the WhatsMax writeup's Inbox ("WhatsMax provides the
              communication. Odoo provides the member truth.") */}
          {context && selected && (
            <div className="min-w-0 lg:col-start-2 2xl:col-start-3 2xl:row-start-1">
              <MemberContextPanel
                key={selected.memberId ?? "none"}
                message={selected}
                source={source}
                staffRole={context.principal.role}
              />
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
