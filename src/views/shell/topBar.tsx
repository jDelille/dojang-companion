"use client";

import { PanelLeft, Plus, Sparkles } from "lucide-react";
import { useDoForMeRailOpen } from "@/views/doForMe/doForMeProvider";
import CommandPalette from "./commandPalette";
import SiteControl from "./siteControl";

/*
   The bar above the page in the mockup (Desktop/vercel-design-1.png) and the
   WhatsMax writeup: [site ▾] [Search, navigate, or ask AI…] [⌘K] [+]. The
   command bar (commandPalette.tsx) finds people, leads and pages; its actions
   beyond Open, Ask AI and live views are shown as not connected yet.
*/

const NOT_CONNECTED = "Not connected yet";

export default function TopBar({ contextOpen = false, onToggleContext }: {
  contextOpen?: boolean;
  // Opens the context pane (e.g. the People list) when it's a drawer (below 1024px)
  onToggleContext?: () => void;
}) {
  const [railOpen, setRailOpen] = useDoForMeRailOpen();

  return (
    <header className="flex items-center gap-3 border-b border-(--crm-line) px-4 py-3">
      {/* Shown only below 1024px, and only when the page has a context pane (dojang-shell.css) */}
      {onToggleContext && (
        <button
          type="button"
          onClick={onToggleContext}
          aria-expanded={contextOpen}
          aria-label="Show list"
          className="ds-context-toggle size-10 shrink-0 place-items-center rounded-xl border border-(--crm-line) bg-(--crm-raised) text-(--crm-text) hover:border-(--crm-muted)"
        >
          <PanelLeft size={16} aria-hidden="true" />
        </button>
      )}
      <SiteControl />
      <CommandPalette />

      <button
        type="button"
        disabled
        aria-label="Create"
        title={NOT_CONNECTED}
        className="grid size-10 shrink-0 place-items-center rounded-full border border-(--crm-line) bg-(--crm-raised) text-(--crm-text) disabled:opacity-60"
      >
        <Plus size={16} aria-hidden="true" />
      </button>

      {/* Brings the Do For Me rail back after it was closed */}
      {!railOpen && (
        <button
          type="button"
          onClick={() => setRailOpen(true)}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-(--crm-line) bg-(--crm-raised) px-3 text-[12px] font-bold text-(--crm-text) hover:border-(--crm-muted)"
        >
          <Sparkles size={14} aria-hidden="true" className="text-(--crm-agent)" />
          Do For Me
        </button>
      )}
    </header>
  );
}
