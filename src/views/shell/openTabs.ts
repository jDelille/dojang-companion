"use client";

import { useSyncExternalStore } from "react";

/*
   The pages open as tabs above the page ([People] [Maya Chen ×] [Sales ×]), as in
   the mockup (Desktop/vercel-design-1.png). Ported from Companion 1cab554b
   src/components/shell/workspace/openTabs.ts and pageTabs.ts.

   Companion keeps "Today" as a fixed first tab. Today (C01) doesn't exist here
   yet, so every tab can be closed. The tabs last for this browser tab's session,
   and are cleared whenever a staff member signs in or out.
*/

export type WorkspaceTab = { href: string; label: string };

// A page's tab: its address, and whether its label is only a placeholder until
// the page says its real name ("Member" → "Maya Chen")
type PageTab = WorkspaceTab & { final: boolean };

const STORAGE_KEY = "dojang:workspace-tabs";
const MAX_TABS = 8;

let tabs: WorkspaceTab[] = [];
let loaded = false;
const listeners = new Set<() => void>();
const noTabs: WorkspaceTab[] = [];

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? "[]");
    if (Array.isArray(saved)) {
      tabs = saved.filter(
        (tab: WorkspaceTab) => typeof tab?.href === "string" && typeof tab?.label === "string",
      );
    }
  } catch {
    // No storage (private window, blocked): start with no tabs
  }
}

function save(next: WorkspaceTab[]) {
  tabs = next;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
  } catch {
    // The tabs still work for this page, they just aren't remembered
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useWorkspaceTabs(): WorkspaceTab[] {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return tabs;
    },
    () => noTabs, // nothing open while the server renders
  );
}

// Adds the tab, or renames it if it's already open. The oldest tab goes when
// there are too many.
export function openWorkspaceTab(tab: WorkspaceTab) {
  load();
  const existing = tabs.find((open) => open.href === tab.href);
  if (existing) {
    if (existing.label !== tab.label) {
      save(tabs.map((open) => (open.href === tab.href ? tab : open)));
    }
    return;
  }
  const next = [...tabs, tab];
  save(next.slice(Math.max(0, next.length - MAX_TABS)));
}

// Only adds a tab when it isn't open yet, so a real name is never replaced by a placeholder
export function openWorkspaceTabIfMissing(tab: WorkspaceTab) {
  load();
  if (tabs.some((open) => open.href === tab.href)) return;
  openWorkspaceTab(tab);
}

// Every tab goes: member names and record addresses must not outlive the staff
// member who opened them (called on sign-in and sign-out, staffSession.ts)
export function clearWorkspaceTabs() {
  load();
  save([]);
}

export function closeWorkspaceTab(href: string) {
  load();
  save(tabs.filter((open) => open.href !== href));
}

// Which tab a Dojang page gets. Query values (/inbox?message=4001) don't make a new tab.
export function tabForPage(pathname: string): PageTab | null {
  if (pathname === "/today") return { href: pathname, label: "Today", final: true };
  if (pathname === "/people") return { href: pathname, label: "People", final: true };
  if (/^\/people\/[^/]+$/.test(pathname)) return { href: pathname, label: "Member", final: false };
  if (pathname === "/crm") return { href: pathname, label: "Sales", final: true };
  if (pathname === "/crm/follow-ups") return { href: pathname, label: "Follow-ups", final: true };
  if (/^\/crm\/leads\/[^/]+$/.test(pathname)) return { href: pathname, label: "Lead", final: false };
  if (pathname === "/inbox") return { href: pathname, label: "Inbox", final: true };
  if (pathname === "/front-desk") return { href: pathname, label: "Front Desk", final: true };
  if (pathname === "/instructor") return { href: pathname, label: "Instructor", final: true };
  return null;
}
