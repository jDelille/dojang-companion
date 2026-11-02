"use client";

import { useSyncExternalStore } from "react";
import { isChoosable, type PerspectiveId } from "@/domain/perspective";

/*
   The Perspective staff chose (domain/perspective.ts), for the whole staff
   shell. Same pattern as the open tabs (openTabs.ts): kept for this browser
   tab's session and cleared whenever a staff member signs in or out
   (staffSession.ts), so it never carries over to the next staff member.

   Presentation only. It never goes to the server: /api/hub accepts exactly
   { operation, payload, requestKey }, so a Perspective can't reach Odoo.
   null: none chosen, the general portal.
*/

const STORAGE_KEY = "dojang:perspective";

let current: PerspectiveId | null = null;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const saved = window.sessionStorage.getItem(STORAGE_KEY);
    // A saved value that isn't a Perspective that can be chosen (any more) is ignored
    current = isChoosable(saved) ? saved : null;
  } catch {
    // No storage (private window, blocked): none chosen
  }
}

function save(next: PerspectiveId | null) {
  current = next;
  try {
    if (next) window.sessionStorage.setItem(STORAGE_KEY, next);
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // It still applies on this page, it just isn't remembered
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

export function useCurrentPerspective(): PerspectiveId | null {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return current;
    },
    () => null, // the general portal while the server renders
  );
}

// Only a Perspective that's set up can be chosen; anything else means none
export function choosePerspective(id: PerspectiveId | null) {
  load();
  save(isChoosable(id) ? id : null);
}

// Called on sign-in and sign-out (staffSession.ts)
export function clearPerspective() {
  load();
  save(null);
}
