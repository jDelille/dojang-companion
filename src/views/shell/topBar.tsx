"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Sparkles } from "lucide-react";
import { searchPages } from "@/routes/searchIndex";
import { useDoForMeRailOpen } from "@/views/doForMe/doForMeProvider";

/*
   The bar above the page in the mockup (Desktop/vercel-design-1.png): search
   (Ctrl/⌘K) and the create button. Search jumps to pages for now, like the
   template header it replaces here.

   Left out until there's a source: the location switcher ("Downtown"). The Hub
   context has no site name yet.
*/

const NOT_CONNECTED = "Not connected yet";

export default function TopBar() {
  const router = useRouter();
  const [railOpen, setRailOpen] = useDoForMeRailOpen();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = searchPages(query);
  const showResults = open && query.trim().length > 0;

  // Ctrl/⌘K puts the cursor in search
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // A click anywhere else closes the results
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function clear() {
    setQuery("");
    setOpen(false);
  }

  function onSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      clear();
      inputRef.current?.blur();
    }
    if (event.key === "Enter" && results[0]) {
      router.push(results[0].path);
      clear();
    }
  }

  return (
    <header className="flex items-center gap-3 px-4 py-3">
      <div ref={wrapRef} className="relative min-w-0 flex-1">
        <Search
          size={14}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-(--crm-muted)"
        />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-label="Search"
          aria-expanded={showResults}
          aria-controls="dojang-search-results"
          autoComplete="off"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onSearchKeyDown}
          placeholder="Search, navigate, or ask AI..."
          className="h-10 w-full rounded-xl border border-(--crm-line) bg-(--crm-panel) pr-3 pl-9 text-[13px] font-semibold text-(--crm-text) placeholder:text-(--crm-text-secondary) focus:border-(--crm-muted) focus:outline-none"
        />
        {showResults && (
          <ul
            id="dojang-search-results"
            role="listbox"
            className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-xl border border-(--crm-line) bg-(--crm-panel) py-1 shadow-xl"
          >
            {results.length > 0 ? (
              results.map((entry) => (
                <li key={entry.path} role="option" aria-selected={false}>
                  <Link
                    href={entry.path}
                    onClick={clear}
                    className="block px-3 py-2 text-[13px] text-(--crm-text) hover:bg-(--crm-interactive)"
                  >
                    {entry.label}
                    <span className="ml-2 text-[11px] text-(--crm-muted)">{entry.sub}</span>
                  </Link>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-[13px] text-(--crm-muted)">
                No matches for “{query.trim()}”
              </li>
            )}
          </ul>
        )}
      </div>

      <kbd className="hidden rounded-md border border-(--crm-line) bg-(--crm-raised) px-1.5 py-0.5 font-(family-name:--crm-font-label) text-[10px] font-bold text-(--crm-text-secondary) sm:block">
        ⌘K
      </kbd>

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
