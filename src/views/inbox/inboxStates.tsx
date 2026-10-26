"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

/*
   Small inbox building blocks adapted from licensed Roster 1.0.0
   (docs/LICENSE-MAP.md; originals in vendor/licensed/roster/):
   - Tabs, LoadingBlock, ErrorBlock  <- components/ui/layout.tsx
   - Badge, EmptyState               <- components/ui/data.tsx
   Changed: Dojang tokens instead of Roster's theme, no cn()/Button dependency.
*/

export type BadgeTone = "neutral" | "warning" | "info" | "agent" | "success" | "danger";

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: "border-(--crm-line) text-(--crm-text-secondary)",
  warning: "border-(--crm-warning)/50 text-(--crm-warning)",
  info: "border-(--crm-info)/50 text-(--crm-info)",
  agent: "border-(--crm-agent)/50 text-(--crm-agent)",
  success: "border-(--crm-success)/50 text-(--crm-success)",
  danger: "border-(--crm-danger)/50 text-(--crm-danger)",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${BADGE_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

// Tab bar with tablist semantics and arrow-key movement (Roster's Tabs)
export function Tabs({
  tabs,
  active,
  onChange,
  label,
}: {
  tabs: { key: string; label: string; count?: number }[];
  active: string;
  onChange: (key: string) => void;
  label: string;
}) {
  function onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next =
      event.key === "ArrowRight" ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length;
    onChange(tabs[next].key);
  }

  return (
    <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto border-b border-(--crm-line)">
      {tabs.map((tab, index) => {
        const selected = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onKeyDown={(event) => onKeyDown(event, index)}
            onClick={() => onChange(tab.key)}
            className={`-mb-px shrink-0 border-b-2 px-3 py-2 text-[12px] font-semibold transition-colors ${
              selected
                ? "border-(--crm-brand) text-(--crm-text)"
                : "border-transparent text-(--crm-text-secondary) hover:text-(--crm-text)"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ms-1.5 text-[11px] text-(--crm-muted)">{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function LoadingBlock({ label }: { label: string }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-3 py-16">
      <span
        aria-hidden="true"
        className="inline-block size-5 animate-spin rounded-full border-2 border-(--crm-line) border-t-(--crm-brand)"
      />
      <p className="text-[12px] text-(--crm-muted)">{label}</p>
    </div>
  );
}

// An inline error with a retry, so a failed read is never a blank pane
export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="grid size-11 place-items-center rounded-xl border border-(--crm-danger)/40">
        <AlertCircle size={20} aria-hidden="true" className="text-(--crm-danger)" />
      </div>
      <div>
        <h3 className="text-[13px] font-bold text-(--crm-text)">Something went wrong</h3>
        <p className="mt-1 max-w-sm text-[12px] leading-relaxed text-(--crm-text-secondary)">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-8 items-center rounded-lg border border-(--crm-line) bg-(--crm-interactive) px-3 text-[12px] font-bold text-(--crm-text) hover:border-(--crm-muted)"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon, title, description }: { icon?: ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {icon && (
        <div
          aria-hidden="true"
          className="mb-4 grid size-11 place-items-center rounded-xl border border-(--crm-line) text-(--crm-text-secondary)"
        >
          {icon}
        </div>
      )}
      <h3 className="text-[13px] font-bold text-(--crm-text)">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-[12px] leading-relaxed text-(--crm-text-secondary)">{description}</p>
      )}
    </div>
  );
}
