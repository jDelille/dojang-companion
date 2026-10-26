"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import {
  closeWorkspaceTab,
  openWorkspaceTab,
  openWorkspaceTabIfMissing,
  tabForPage,
  useWorkspaceTabs,
} from "./openTabs";

// The open pages, under the top bar. Opening a Dojang page adds its tab.
export default function WorkspaceTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const tabs = useWorkspaceTabs();

  const current = tabForPage(pathname);
  const currentHref = current?.href ?? null;
  const currentLabel = current?.label ?? "";
  const currentFinal = current?.final ?? false;

  useEffect(() => {
    if (!currentHref) return;
    const tab = { href: currentHref, label: currentLabel };
    if (currentFinal) openWorkspaceTab(tab);
    else openWorkspaceTabIfMissing(tab);
  }, [currentHref, currentLabel, currentFinal]);

  // Closing the tab on screen goes to the tab before it, or home (/ opens People)
  function closeTab(href: string) {
    const index = tabs.findIndex((tab) => tab.href === href);
    closeWorkspaceTab(href);
    if (href !== currentHref) return;
    const remaining = tabs.filter((tab) => tab.href !== href);
    const next = remaining[Math.max(0, index - 1)];
    router.push(next ? next.href : "/");
  }

  return (
    <nav aria-label="Open pages" className="border-b border-(--crm-line) px-4">
      <ul className="-mb-px flex gap-1 overflow-x-auto pt-2">
        {tabs.map((tab) => {
          const active = tab.href === currentHref;
          return (
            <li
              key={tab.href}
              className={`flex shrink-0 items-center gap-1 rounded-t-lg border px-3 py-2 text-[12px] ${
                active
                  ? "border-(--crm-line) border-b-(--crm-raised) bg-(--crm-raised) font-bold text-(--crm-text)"
                  : "border-transparent text-(--crm-text-secondary) hover:text-(--crm-text)"
              }`}
            >
              <Link href={tab.href} aria-current={active ? "page" : undefined} className="max-w-48 truncate">
                {tab.label}
              </Link>
              <button
                type="button"
                onClick={() => closeTab(tab.href)}
                aria-label={`Close ${tab.label}`}
                className="grid size-4 place-items-center rounded text-(--crm-muted) hover:text-(--crm-text)"
              >
                <X size={11} aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// Put on a record page to name its tab after the record ("Lead" → "Ava Martinez")
export function WorkspaceTabName({ label }: { label: string }) {
  const pathname = usePathname();
  useEffect(() => {
    if (tabForPage(pathname)) openWorkspaceTab({ href: pathname, label });
  }, [pathname, label]);
  return null;
}
