"use client";

import { createContext, useContext, type ReactNode } from "react";
import { createPortal } from "react-dom";

/*
   The context pane: the column between the navigation rail and the page in the
   mockup (Desktop/vercel-design-1.png, "Arriving soon"). The Dojang shell owns
   the column; a page or layout fills it with <ContextPane>, e.g. the People pane.
   With nothing in it the column isn't shown.
*/

export const ContextPaneSlot = createContext<HTMLElement | null>(null);

export function ContextPane({ children }: { children: ReactNode }) {
  const slot = useContext(ContextPaneSlot);
  return slot ? createPortal(children, slot) : null;
}
