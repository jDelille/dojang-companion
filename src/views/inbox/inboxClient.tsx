"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Inbox as InboxIcon, MessageSquare, Sparkles, UserRound } from "lucide-react";
import { focusKey, type CompanionContext, type Suggestion } from "@/domain/companion";
import { CHANNEL_LABELS } from "@/domain/inbox";
import { INBOX_QUEUES, inboxMessages, matchesQueue, selectedInboxMessage, type InboxQueue } from "@/domain/inboxWorkspace";
import { Select } from "@/templates/roster/components/ui/form";
import { Button } from "@/templates/roster/components/ui/button";
import { getInboxContext, SIGN_IN_CODES, type InboxContextAnswer } from "@/integrations/hub";
import { DoForMeFocus, useDoForMe } from "@/views/doForMe/doForMeProvider";
import { deliveryOf, inboxRailContext, memberName, messageRailContext } from "./inboxCompanion";
import ClassMovePlan from "./classMovePlan";
import InboxList from "./inboxList";
import { Card } from "@/templates/roster/components/ui/card";
import { EmptyState } from "@/templates/roster/components/ui/data";
import { ErrorBlock, LoadingBlock, PageHeader, Tabs } from "@/templates/roster/components/ui/layout";
import "@/templates/roster/roster.css";
import MemberContextPanel from "./memberContextPanel";
import MessageView from "./messageView";
import "./inbox.css";
import StaffSignIn from "@/views/shell/staffSignIn";

/*
   Inbox (CRM screen C05): guardian messages that WhatsMax received, as the Hub's
   inbox read gives them, one work item per row. Two-pane layout and filter tabs
   adapted from licensed Roster 1.0.0 components/inbox/inbox-client.tsx
   (docs/LICENSE-MAP.md), without its database, sign-in, polling, send box or
   Close/Reopen. The workflow is Companion's /hub Inbox; the rules are the Hub's.

   Read through POST /api/hub "context" (src/integrations/hub.ts). The server
   decides where that answers from (`source`):
   - "hub": the real Hub in Odoo, after staff sign in. Only existing
     allowlisted actions are available, subject to native grants/configuration.
   - "fixture": development sample messages, labelled as such.

   Beside the selected message, the Odoo member it's linked to
   (memberContextPanel.tsx, the same member read as Member 360).
*/

type Filter = InboxQueue;

// Do For Me's class move (classMovePlan.tsx) is hidden for now. Set to true to
// offer it again; the plan, its Hub operations and their checks are unchanged.
const SHOW_CLASS_MOVE = false;

// The inbox row width (px) from which the person gets its own card
// (list + message + person)
const SPLIT_WIDTH = 960;

const EMPTY_TEXT = { title: "No matching messages", description: "Try another tab or channel. Results cover the loaded messages only." };

export default function InboxClient({
  initialMessageId,
  source,
}: {
  initialMessageId: string | null;
  source: "hub" | "fixture";
}) {
  const [answer, setAnswer] = useState<InboxContextAnswer | null>(null); // null while loading
  const [filter, setFilter] = useState<Filter>(initialMessageId ? "all" : "open");
  const [selectedId, setSelectedId] = useState<string | null>(initialMessageId);
  const doForMe = useDoForMe();
  const [personOpen, setPersonOpen] = useState(false);
  // Spec §14 "Inbox becomes a projection of the person": when the message card
  // has room, the person (Odoo member) sits beside the conversation. Narrower,
  // the Student button switches between them.
  const [split, setSplit] = useState(false);
  const [mobileDetail, setMobileDetail] = useState(!!initialMessageId);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [messageLocked, setMessageLocked] = useState(false), [contextLocked, setContextLocked] = useState(false);
  const [replyDirty, setReplyDirty] = useState(false);
  const actionLocked = messageLocked || contextLocked || replyDirty;
  const [channel, setChannel] = useState("all");
  const request = useRef(0);
  const workspace = useRef<HTMLDivElement>(null);

  // Read the inbox again (after an action, or Try again)
  const load = useCallback(async () => {
    const sequence = ++request.current;
    const next = await getInboxContext();
    if (sequence === request.current) setAnswer(next);
  }, []);

  // The first read, when the page opens
  useEffect(() => {
    void load();
    return () => { request.current += 1; };
  }, [load]);

  useEffect(() => {
    if (!actionLocked) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    const guard = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!(link instanceof HTMLAnchorElement) || link.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); event.stopPropagation();
    };
    window.addEventListener('beforeunload', warn);
    document.addEventListener('click', guard, true);
    return () => { window.removeEventListener('beforeunload', warn); document.removeEventListener('click', guard, true); };
  }, [actionLocked]);

  useEffect(() => {
    const viewport = window.visualViewport;
    const resize = () => {
      const element = workspace.current;
      if (!element) return;
      if (window.innerWidth >= 1024 || !viewport) { element.style.removeProperty('--inbox-visible-height'); return; }
      const bottom = viewport.offsetTop + viewport.height;
      const nav = document.querySelector('.ds-bottom-nav')?.getBoundingClientRect();
      const navHeight = nav && nav.top < bottom ? Math.max(0, Math.min(nav.bottom, bottom) - nav.top) : 0;
      element.style.setProperty('--inbox-visible-height', `${Math.max(160, bottom - element.getBoundingClientRect().top - navHeight - 10)}px`);
    };
    resize(); window.addEventListener('resize', resize); viewport?.addEventListener('resize', resize); viewport?.addEventListener('scroll', resize);
    return () => { window.removeEventListener('resize', resize); viewport?.removeEventListener('resize', resize); viewport?.removeEventListener('scroll', resize); };
  }, []);
  // A third card for the person once the inbox row is at least SPLIT_WIDTH wide
  // (and the cards sit side by side, from 1024px)
  useEffect(() => {
    const layout = workspace.current?.querySelector('.inbox-layout');
    if (!layout) return;
    const observer = new ResizeObserver(([entry]) => setSplit(window.innerWidth >= 1024 && entry.contentRect.width >= SPLIT_WIDTH));
    observer.observe(layout);
    return () => observer.disconnect();
    // Re-run after each inbox read: the card isn't there while signed out
  }, [answer]);
  function focusMessage() { requestAnimationFrame(() => workspace.current?.querySelector<HTMLElement>('.inbox-message-header h2')?.focus({ preventScroll: true })); }
  function retry() {
    setAnswer(null);
    setReceipt(null);
    void load();
  }

  const needsSignIn = answer?.outcome === "unavailable" && SIGN_IN_CODES.includes(answer.code ?? "");
  const loaded = answer?.outcome === "loaded" ? answer : null;
  const context = loaded?.context ?? null;
  const simulated = loaded?.simulatedOutbound ?? false;

  // No text search box (removed); "" matches every message
  const shown = context ? inboxMessages(context, filter, channel, "") : [];
  const selected = selectedId === initialMessageId && initialMessageId && !context?.messages.some(m => m.id === initialMessageId) ? null : selectedInboxMessage(shown, selectedId);
  const channels = context ? [...new Set(context.messages.map(m => m.channel))] : [];

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

  // Wide: the person has its own card. Narrow: the Student button swaps it in
  // for the message.
  const messageHidden = !split && personOpen;
  // The Odoo member the selected message is linked to (memberContextPanel.tsx)
  const personPanel = context && selected ? (
    <MemberContextPanel
      key={selected.memberId ?? "none"}
      message={selected}
      source={source}
      staffRole={context.principal.role}
      locked={actionLocked}
      onLockChange={setContextLocked}
      onAuthenticationLost={() => { setAnswer({ outcome: "unavailable", code: "SIGN_IN_REQUIRED", text: "Sign in again to continue." }); setSelectedId(null); setReceipt(null); setContextLocked(false); setReplyDirty(false); }}
    />
  ) : null;

  return (
    <div ref={workspace} className="inbox-workspace crm-scope roster-scope" data-detail={mobileDetail && !!selected}>
      {source === "fixture" && (
        <p className="mb-4 text-[11px] text-(--crm-text-secondary)">
          Sample messages · Development preview, not connected to Odoo or WhatsMax. Nothing is sent.
        </p>
      )}

      {/* Do For Me follows the selected message, or the inbox as a whole */}
      {railContext && <DoForMeFocus focusKey={railKey} context={railContext} />}

      <div className="inbox-page">
        <div className="inbox-page-heading"><PageHeader
          title="Inbox"
          description="Review incoming messages with the linked Odoo record, prepare replies and track delivery."
          actions={<Button disabled={actionLocked} onClick={retry}>Refresh</Button>}
        /></div>

        {context && (
          <div className="inbox-queues" inert={actionLocked}>
          <Tabs
            label="Message filters"
            active={filter}
            onChange={(key) => {
              setFilter(key as Filter);
              setMobileDetail(false);
              setPersonOpen(false);
              setSelectedId(null);
            }}
            tabs={INBOX_QUEUES.map(queue => {
              // Like Roster: a count on Open only, and none when it's zero
              const count = queue.showCount ? context.messages.filter(m => matchesQueue(context, m, queue.key)).length : 0;
              return { key: queue.key, label: queue.label, count: count || undefined };
            })}
          />
            </div>
        )}

        {context && (
          <div className="inbox-filters">
            <div className="inbox-filter-controls" inert={actionLocked}>
              <Select aria-label="Message channel" value={channel} onChange={e => { setChannel(e.target.value); setSelectedId(null); setReceipt(null); setContextLocked(false); setReplyDirty(false); }}>
                <option value="all">All channels</option>
                {channels.map(value => <option key={value} value={value}>{CHANNEL_LABELS[value] ?? value}</option>)}
              </Select>
              {channel !== 'all' && <Button onClick={() => setChannel('all')}>All channels</Button>}
            </div>
            <p className="inbox-result-count text-xs muted" role="status">{shown.length} matching of {context.messages.length} loaded messages. {context.messages.length === 50 ? 'The 50-message limit was reached; older messages may be missing.' : 'Messages available to your account.'} Messages are shown individually.</p>
            <details className="inbox-channel-status text-xs muted"><summary>Channel status</summary><p>Inbound: {context.capabilities.inbound === 'not_configured' ? 'not configured' : 'configured; live receipt not verified'}. Outbound: {simulated ? 'development simulation' : context.capabilities.outbound === 'not_configured' ? 'not configured' : 'configured; live delivery not verified'}. Email, calls and social channels are not available in this inbox yet.</p></details>
            {initialMessageId && !context.messages.some(m => m.id === initialMessageId) && <p role="status" className="text-xs muted">The linked message is outside this read or your current access.</p>}
          </div>
        )}

        {context && contextLocked && <p role="status" className="mt-3 text-xs muted">Finish the member action or discard its local changes before leaving this message. Unconfirmed actions must be checked using their original request.</p>}
        {context && replyDirty && <p role="status" className="mt-3 text-xs muted">Your reply has local edits. Review it or discard the edits before switching messages or refreshing. It is not saved or sent.</p>}
        {context && receipt && <div role="status" className="mt-4 flex items-start justify-between gap-3 rounded-lg border border-(--crm-line) p-3 text-xs"><p>{receipt}</p><Button onClick={() => setReceipt(null)}>Dismiss</Button></div>}
        {needsSignIn ? (
          <Card className="mt-4">
            <StaffSignIn onSignedIn={() => { setChannel('all'); setFilter('open'); setSelectedId(null); setMobileDetail(false); setPersonOpen(false); retry(); }} />
          </Card>
        ) : (
        <div className="inbox-layout" data-split={split}>
          {/* Roster list/detail layout; student context opens in the same detail pane. */}
          <Card
            role="region"
            aria-label="Messages"
            className="inbox-list-card"
          >
            {!answer ? (
              <LoadingBlock label="Loading messages…" />
            ) : answer.outcome === "unavailable" ? (
              <ErrorBlock message={answer.text} onRetry={retry} />
            ) : shown.length === 0 ? (
              <EmptyState icon={<InboxIcon strokeWidth={1.75} />} {...EMPTY_TEXT} />
            ) : (
              <InboxList
                context={answer.context}
                messages={shown}
                selectedId={selected?.id ?? null}
                onSelect={id => { setSelectedId(id); setPersonOpen(false); setMobileDetail(true); focusMessage(); }}
                locked={actionLocked}
              />
            )}
          </Card>

          <Card
            role="region"
            aria-label="Message"
            className="inbox-detail-card"
          >
            {context && selected && <div className="inbox-detail-toolbar"><Button className="inbox-back" disabled={actionLocked} onClick={() => { setMobileDetail(false); setPersonOpen(false); requestAnimationFrame(() => workspace.current?.querySelector<HTMLElement>('.inbox-list-card [aria-current="true"]')?.focus({ preventScroll: true })); }}><ArrowLeft size={16} />Messages</Button><span className="inbox-toolbar-label">{split ? 'Conversation · Person' : personOpen ? 'Student context' : 'Message'}</span>{!split && <Button disabled={actionLocked} aria-expanded={personOpen} aria-controls="inbox-person-context" onClick={() => { setPersonOpen(!personOpen); if (personOpen) focusMessage(); else requestAnimationFrame(() => workspace.current?.querySelector<HTMLElement>('.inbox-person-context')?.focus({ preventScroll: true })); }}><UserRound size={15} />{personOpen ? 'Back to message' : 'Student'}</Button>}<Button className="inbox-mobile-companion" aria-label="Open Do For Me for this message" onClick={() => doForMe.aim(railKey)}><Sparkles size={16} /></Button></div>}
            <div className={`inbox-message-view${messageHidden ? ' inbox-message-view-hidden' : ''}`} inert={messageHidden} aria-hidden={messageHidden}>
            {context && selected ? (
              <MessageView
                key={selected.id}
                context={context}
                message={selected}
                simulated={simulated}
                picked={doForMe.pickedFor(railKey)}
                onChanged={load}
                onLockChange={setMessageLocked}
                onReceipt={setReceipt}
                externalLocked={contextLocked}
                onDirtyChange={setReplyDirty}
                onAuthenticationLost={() => { setAnswer({ outcome: "unavailable", code: "SIGN_IN_REQUIRED", text: "Sign in again to continue." }); setSelectedId(null); setReceipt(null); setMessageLocked(false); setContextLocked(false); setReplyDirty(false); }}
                onSettled={() => doForMe.settle(railKey, "plan")}
              />
            ) : (
              <EmptyState
                icon={<MessageSquare strokeWidth={1.75} />}
                title="Pick a message"
                description="Choose a message on the left to see it and what to do next."
              />
            )}
            </div>
            {/* Narrow: the Student button shows the person in place of the message */}
            {personPanel && messageHidden && <div id="inbox-person-context" className="inbox-person-context" tabIndex={-1} role="region" aria-label="Student context">
              {personPanel}
            </div>}
          </Card>

          {/* Wide: the person as its own card beside the message (spec §14) */}
          {split && (
            <Card role="region" aria-label="Person" className="inbox-person-card">
              {personPanel ? (
                <div className="inbox-person-context">{personPanel}</div>
              ) : (
                <EmptyState
                  icon={<UserRound strokeWidth={1.75} />}
                  title="No message picked"
                  description="Pick a message to see the person it's from."
                />
              )}
            </Card>
          )}


        </div>
        )}
      </div>
    </div>
  );
}
