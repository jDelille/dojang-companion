"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { CompanionContext, Suggestion } from "@/domain/companion";
import { doForMeActivation } from "@/domain/doForMeActivation";
import DoForMeRail, { type RailTab } from "./doForMeRail";
import { revealCompanion } from "./revealCompanion";

/*
   The shared Do For Me rail for the Dojang staff pages.

   The provider lives in app/(main)/layout.tsx, the one layout every staff page
   shares. The Dojang shell (src/views/shell/dojangShell.tsx) places the rail with
   <ConnectedDoForMeRail />, as the right-hand column of the mockup
   (Desktop/vercel-design-1.png). Template pages under (main) never show it.

   - Each page says what the rail is focused on with <DoForMeFocus> ("people",
     "member:5001", "sales", "lead:9005") and hands it that focus's context, which
     the page read on the server through src/integrations/companion.ts.
   - When the page that set a focus goes away (another page, or sign-in / error
     replacing it), its focus is cleared, so the rail never keeps showing a record
     that's no longer on screen.
   - The rail keeps its tab and picked task per focus, so going back to a record
     finds the rail as it was left. reset() forgets all of it; staff sign-in and
     sign-out call it (views/shell/staffSession.ts). The layout isn't re-mounted while staff move
     between Dojang pages, so this survives navigation (not a page reload).
   - A page's "Do For Me" button calls useDoForMe().aim(key), like Companion's
     dojang:do-for-me event: the focus's top suggestion opens, otherwise Plan.
     It also reopens the rail if staff closed it.
   - Picking a suggestion opens its review in Work. A suggestion marked
     review: "page" is reviewed and applied on the page instead (Jodi's 19 Oct
     spec): the rail switches to Evidence, the page reads it with pickedFor(key)
     and calls settle(key, tab) when the review is done or cancelled.
*/

type Focus = { key: string; context: CompanionContext };
type RailState = { tab: RailTab; picked: Suggestion | null };

const START: RailState = { tab: "plan", picked: null };

// What a page can ask of the rail
type RailActions = {
  aim: (key: string) => void;
  pickedFor: (key: string) => Suggestion | null;
  settle: (key: string, tab: RailTab) => void;
  reset: () => void;
};

// Two contexts: the setter never changes, so pages that only set the focus
// don't re-run their effect every time the rail changes
const SetFocusContext = createContext<Dispatch<SetStateAction<Focus | null>> | null>(null);
const ActionsContext = createContext<RailActions | null>(null);

// What the shell needs to draw the rail, and to open or close it
type RailView = {
  focus: Focus | null;
  current: RailState;
  open: boolean;
  setOpen: (open: boolean) => void;
  showTab: (tab: RailTab) => void;
  doForMe: (suggestion: Suggestion) => void;
};
const RailViewContext = createContext<RailView | null>(null);

// Where a picked suggestion opens: its own review in Work, or Evidence when the
// review happens on the page
const tabFor = (suggestion: Suggestion): RailTab =>
  suggestion.review === "page" ? "evidence" : "work";

export function DoForMeProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const [focus, setFocus] = useState<Focus | null>(null);
  const [stateByKey, setStateByKey] = useState<Record<string, RailState>>({});
  const focusRef = useRef(focus);
  useLayoutEffect(() => { focusRef.current = focus; }, [focus]);

  const current = focus ? (stateByKey[focus.key] ?? START) : START;

  const update = useCallback((key: string, next: RailState) => {
    setStateByKey((previous) => {
      const current = previous[key] ?? START;
      if (current.tab === next.tab && current.picked === next.picked) return previous;
      return { ...previous, [key]: next };
    });
  }, []);

  function showTab(tab: RailTab) {
    if (focus) update(focus.key, { ...current, tab });
  }

  // Do For Me on a suggestion
  function doForMe(suggestion: Suggestion) {
    if (!focus) return;
    update(focus.key, { tab: tabFor(suggestion), picked: suggestion });
    setOpen(true);
    revealCompanion(suggestion.review === "page");
  }

  // A page's own "Do For Me" button, for the record the page is showing
  const aim = useCallback((key: string) => {
    const focused = focusRef.current;
    if (!focused || focused.key !== key) return;
    const next = doForMeActivation(focused.context);
    update(key, { tab: next.tab, picked: next.picked });
    setOpen(true);
    revealCompanion(next.picked?.review === "page");
  }, [update]);

  // The suggestion picked for this record, if any
  const pickedFor = useCallback((key: string) => {
    return stateByKey[key]?.picked ?? null;
  }, [stateByKey]);

  // The page finished (or cancelled) a review: nothing picked, rail on `tab`
  const settle = useCallback((key: string, tab: RailTab) => {
    update(key, { tab, picked: null });
  }, [update]);

  // Forget every focus and its tab/picked task (the staff member changed)
  const reset = useCallback(() => {
    setFocus(null);
    setStateByKey(previous => Object.keys(previous).length ? {} : previous);
  }, []);

  // Publishing focus must not notify action consumers: those pages build and
  // publish their own context. Otherwise publication recursively renders them.
  const actions = useMemo(() => ({ aim, pickedFor, settle, reset }), [aim, pickedFor, settle, reset]);

  return (
    <SetFocusContext.Provider value={setFocus}>
      <ActionsContext.Provider value={actions}>
        <RailViewContext.Provider value={{ focus, current, open, setOpen, showTab, doForMe }}>
          {children}
        </RailViewContext.Provider>
      </ActionsContext.Provider>
    </SetFocusContext.Provider>
  );
}

// The rail itself, where the Dojang shell puts it. Nothing while it's closed.
export function ConnectedDoForMeRail() {
  const view = useContext(RailViewContext);
  if (!view || !view.open) return null;
  return (
    <DoForMeRail
      context={view.focus?.context ?? null}
      focusKey={view.focus?.key ?? null}
      tab={view.current.tab}
      picked={view.current.picked}
      onTab={view.showTab}
      onDoForMe={view.doForMe}
      onClose={() => view.setOpen(false)}
    />
  );
}

// For the shell's "Do For Me" button, shown while the rail is closed
export function useDoForMeRailOpen(): [boolean, (open: boolean) => void] {
  const view = useContext(RailViewContext);
  return [view?.open ?? false, (open) => view?.setOpen(open)];
}

// Put on each Dojang page: tells the rail what to focus on
export function DoForMeFocus({
  focusKey,
  context,
}: {
  focusKey: string;
  context: CompanionContext;
}) {
  const setFocus = useContext(SetFocusContext);
  useEffect(() => {
    setFocus?.({ key: focusKey, context });
    // Gone from the page: clear the rail, unless another page has focused it since
    return () => setFocus?.((current) => (current?.key === focusKey ? null : current));
  }, [setFocus, focusKey, context]);
  return null;
}

// For a page's Do For Me button and page reviews. Does nothing outside the Dojang layout.
export function useDoForMe(): RailActions {
  const actions = useContext(ActionsContext);
  return actions ?? NO_ACTIONS;
}

const NO_ACTIONS: RailActions = {
  aim: () => {}, pickedFor: () => null, settle: () => {}, reset: () => {},
};
