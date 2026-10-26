"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ImageWithBasePath from "../image-with-base-path";
import LucideIcon from "../common/LucideIcon";
import Dropdown from "../common/dropdown";
import ThemeToggle from "../common/ThemeToggle";
import Breadcrumb from "../breadcrumb/breadcrumb";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  toggleDrawer,
  toggleSidebarCollapsed,
  toggleSidebarOpen,
} from "../../redux/slices/layoutSlice";
import { useIsMobile } from "../../hooks/useMediaQuery";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { searchPages } from "../../routes/searchIndex";
import { all_routes } from "../../routes/all_routes";
import { SHOW_TEMPLATE_UI } from "../../config/dojang";

const BRANCHES = [
  { label: "Austin — HQ", short: "Austin HQ", icon: "building-2" as const },
  {
    label: "Los Angeles",
    short: "Los Angeles — Silver Lake",
    icon: "building" as const,
  },
  {
    label: "San Francisco",
    short: "San Francisco — Mission District",
    icon: "building" as const,
  },
];

const CommonHeader = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isMobile = useIsMobile();
  const drawerOpen = useAppSelector((state) => state.layout.drawerOpen);
  const variant = useAppSelector((state) => state.layout.variant);

  /*
     Mirrors toggleSidebar() in script.js: mobile always drives the off-canvas
     drawer; the mini and hidden layout variants key their CSS off #sidebar.open
     instead of .collapsed/.expanded, so they get their own toggle.
  */
  const handleToggleSidebar = () => {
    if (isMobile) {
      dispatch(toggleDrawer());
    } else if (variant === "mini" || variant === "hidden") {
      dispatch(toggleSidebarOpen());
    } else {
      dispatch(toggleSidebarCollapsed());
    }
  };

  const [branch, setBranch] = useState(BRANCHES[0].short);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebouncedValue(query, 200);
  const results = searchPages(debouncedQuery);

  const closeSearch = useCallback(() => setSearchOpen(false), []);

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

  useEffect(() => {
    if (!searchOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) closeSearch();
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [searchOpen, closeSearch]);

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setQuery("");
      closeSearch();
      inputRef.current?.blur();
    }
    if (event.key === "Enter" && results[0]) {
      router.push(results[0].path);
      setQuery("");
      closeSearch();
    }
  };

  const handleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.();
  };

  return (
    <>
      {/* HEADER */}
      <header className="header-glass header-bar sticky top-0 z-40 flex items-center gap-3 px-5 py-3">
        <button
          type="button"
          data-toggle-sidebar=""
          onClick={handleToggleSidebar}
          className="hbtn"
          title="Toggle menu"
          aria-label="Toggle menu"
          aria-controls="sidebar"
          aria-expanded={isMobile ? drawerOpen : undefined}
        >
          <LucideIcon name="menu" className="w-4 h-4" />
        </button>

        <Breadcrumb className="hidden md:flex" maxItems={3} />
        <div className="flex-1" />

        {/* Search */}
        <div
          ref={searchRef}
          className="dropdown search-wrap relative hidden md:block"
        >
          <LucideIcon
            name="search"
            className="search-ic absolute left-3 top-1/2 -translate-y-1/2 z-10"
          />
          <input
            ref={inputRef}
            type="text"
            id="global-search"
            className="fp-input pl-9 pr-12 py-2 w-64 text-sm"
            placeholder="Search, navigate, or ask AI…"
            autoComplete="off"
            role="combobox"
            aria-expanded={searchOpen && query.trim().length > 0}
            aria-controls="search-menu"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={handleSearchKeyDown}
          />
          <kbd className="search-kbd absolute right-3 top-1/2 -translate-y-1/2 text-[10px] rounded-sm px-1.5 py-0.5 font-semibold">
            ⌘K
          </kbd>
          <div
            id="search-menu"
            role="listbox"
            className={`dropdown-menu menu-w-300${
              searchOpen && query.trim() ? " open" : ""
            }`}
          >
            <div className="menu-label">Jump to</div>
            <div id="search-results">
              {results.length > 0 ? (
                results.map((entry) => (
                  <Link
                    key={entry.path}
                    href={entry.path}
                    role="option"
                    className="dropdown-item gap-3"
                    onClick={() => {
                      setQuery("");
                      closeSearch();
                    }}
                  >
                    <LucideIcon name="file-text" className="w-[13px] h-[13px]" />
                    <div>
                      <div className="n-title">{entry.label}</div>
                      <div className="n-sub">{entry.sub}</div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="search-empty">
                  No matches for “{query.trim()}”
                </div>
              )}
            </div>
          </div>
        </div>

        {/* The template's demo menus (sample data) are hidden in Dojang mode */}
        {SHOW_TEMPLATE_UI && (
        <>
        {/* Quick Actions */}
        <Dropdown id="quick-menu" className="hidden md:block">
          <Dropdown.Trigger className="qa-btn">
            <LucideIcon name="zap" className="w-[14px] h-[14px]" />
            <span className="text-xs xl:inline">Quick Actions</span>
            <LucideIcon name="chevron-down" className="w-3 h-3" />
          </Dropdown.Trigger>
          <Dropdown.Menu className="menu-w-220">
            <div className="menu-label">Create New</div>
            <Link href={all_routes.pos} className="dropdown-item">
              <LucideIcon name="shopping-cart" className="w-[13px] h-[13px]" />
              New Sale (POS)
            </Link>
            <Link href={all_routes.members} className="dropdown-item">
              <LucideIcon name="user-plus" className="w-[13px] h-[13px]" />
              Add Member
            </Link>
            <Link href={all_routes.checkin} className="dropdown-item">
              <LucideIcon name="scan-line" className="w-[13px] h-[13px]" />
              Check-In Member
            </Link>
            <Link href={all_routes.invoices} className="dropdown-item">
              <LucideIcon name="file-text" className="w-[13px] h-[13px]" />
              Generate Invoice
            </Link>
            <div className="menu-sep" />
            <Link href={all_routes.classes} className="dropdown-item">
              <LucideIcon name="calendar-plus" className="w-[13px] h-[13px]" />
              Schedule Class
            </Link>
          </Dropdown.Menu>
        </Dropdown>

     
        <Dropdown id="branch-menu" className="hidden">
          <Dropdown.Trigger className="chip-btn">
            <LucideIcon name="building-2" className="w-[13px] h-[13px] c-gold" />
            <span id="branch-label" className="text-xs font-medium">
              {branch}
            </span>
            <LucideIcon name="chevron-down" className="w-3 h-3" />
          </Dropdown.Trigger>
          <Dropdown.Menu>
            {BRANCHES.map((entry) => (
              <button
                key={entry.short}
                type="button"
                className="dropdown-item"
                aria-pressed={branch === entry.short}
                onClick={() => setBranch(entry.short)}
              >
                <LucideIcon name={entry.icon} className="w-[13px] h-[13px]" />
                {entry.label}
              </button>
            ))}
            <div className="menu-sep" />
            <Link href={all_routes.branches} className="dropdown-item">
              <LucideIcon name="plus" className="w-[13px] h-[13px]" />
              Add Branch
            </Link>
          </Dropdown.Menu>
        </Dropdown>

        </>
        )}
        <div className="md:block hdr-divider" />

        {/* Fullscreen */}
        <button
          type="button"
          onClick={handleFullscreen}
          className="hbtn sm:flex"
          title="Fullscreen"
          aria-label="Fullscreen"
        >
          <LucideIcon name="maximize" className="w-4 h-4" />
        </button>

        {/* Messages, theme, notifications and profile: template demo content.
            Dojang is dark only for now, and the staff state lives in the sidebar. */}
        {SHOW_TEMPLATE_UI && (
        <>
        {/* Messages */}
        <Dropdown id="msg-menu">
          <Dropdown.Trigger className="hbtn" title="Messages" aria-label="Messages">
            <LucideIcon name="mail" className="w-4 h-4" />
            <span className="badge-ping" data-badge="msg">
              2
            </span>
          </Dropdown.Trigger>
          <Dropdown.Menu className="menu-w-300">
            <div className="menu-head">
              <span className="text-sm font-bold c-text">Messages</span>
              <span className="text-[11px] menu-link">Mark all read</span>
            </div>
            <Link href={all_routes.chatApp} className="dropdown-item gap-3">
              <div className="mini-av avatar-gold">DF</div>
              <div>
                <div className="text-[13px] c-text font-medium">
                  Daniel Foster
                </div>
                <div className="n-sub-trunc">Client schedule updated for…</div>
              </div>
            </Link>
            <Link href={all_routes.chatApp} className="dropdown-item gap-3">
              <div className="mini-av av-indigo">AS</div>
              <div>
                <div className="text-[13px] c-text font-medium">
                  Rachel Morgan
                </div>
                <div className="n-sub-trunc">Can we add a 7 AM yoga slot?</div>
              </div>
            </Link>
            <div className="px-3 pt-2 pb-1">
              <Link href={all_routes.chatApp} className="menu-foot-link">
                Open Inbox
              </Link>
            </div>
          </Dropdown.Menu>
        </Dropdown>

        <ThemeToggle id="theme-menu" />

        {/* Notifications */}
        <Dropdown id="notif-menu">
          <Dropdown.Trigger
            className="hbtn"
            title="Notifications"
            aria-label="Notifications"
          >
            <LucideIcon name="bell" className="w-4 h-4" />
            <span className="badge-ping badge-red" data-badge="notif">
              4
            </span>
          </Dropdown.Trigger>
          <Dropdown.Menu className="menu-w-310">
            <div className="menu-head">
              <span className="text-sm font-bold c-text">Notifications</span>
              <span className="text-[11px] menu-link">Mark all read</span>
            </div>
            <Link href={all_routes.notifications} className="dropdown-item gap-3">
              <div className="mini-ic tint-gold">
                <LucideIcon
                  name="user-check"
                  className="w-[13px] h-[13px] c-gold"
                />
              </div>
              <div>
                <div className="n-title">New member registered</div>
                <div className="n-sub">Ashley Bennett — 2 min ago</div>
              </div>
            </Link>
            <Link href={all_routes.notifications} className="dropdown-item gap-3">
              <div className="mini-ic tint-orange">
                <LucideIcon
                  name="alert-triangle"
                  className="w-[13px] h-[13px] c-orange"
                />
              </div>
              <div>
                <div className="n-title">Low stock: Whey Protein</div>
                <div className="n-sub">Only 3 units — 15 min ago</div>
              </div>
            </Link>
            <Link href={all_routes.notifications} className="dropdown-item gap-3">
              <div className="mini-ic tint-red">
                <LucideIcon name="x-circle" className="w-[13px] h-[13px] c-red" />
              </div>
              <div>
                <div className="n-title">Membership expired</div>
                <div className="n-sub">Marcus Coleman — 1 hr ago</div>
              </div>
            </Link>
            <Link href={all_routes.notifications} className="dropdown-item gap-3">
              <div className="mini-ic tint-gold">
                <LucideIcon
                  name="calendar"
                  className="w-[13px] h-[13px] c-gold"
                />
              </div>
              <div>
                <div className="n-title">Yoga class starts at 6 PM</div>
                <div className="n-sub">Trainer: Rachel — 2 hr ago</div>
              </div>
            </Link>
            <div className="px-3 pt-2 pb-1">
              <Link href={all_routes.notifications} className="menu-foot-link">
                View all notifications
              </Link>
            </div>
          </Dropdown.Menu>
        </Dropdown>

        {/* Profile */}
        <Dropdown id="profile-menu">
          <Dropdown.Trigger className="profile-btn" aria-label="Profile menu">
            <div className="ring-gold relative">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs overflow-hidden">
                <ImageWithBasePath
                  src="assets/img/avatars/avatar-19.jpg"
                  alt=""
                />
              </div>
            </div>
          </Dropdown.Trigger>
          <Dropdown.Menu className="menu-w-230">
            <div className="flex items-center gap-3 px-3 py-2.5 mb-1 menu-profile-head">
              <div className="ring-gold relative">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm overflow-hidden">
                  <ImageWithBasePath
                    src="assets/img/avatars/avatar-19.jpg"
                    alt=""
                  />
                </div>
              </div>
              <div>
                <div className="text-sm font-bold c-text">Nathan Reeves</div>
                <div className="text-[11px] c-dim">nathan@example.com</div>
                <span className="role-badge">SUPER ADMIN</span>
              </div>
            </div>
            <Link href={all_routes.settings} className="dropdown-item">
              <LucideIcon name="user" className="w-[13px] h-[13px]" />
              My Profile
            </Link>
            <Link href={all_routes.settings} className="dropdown-item">
              <LucideIcon name="settings" className="w-[13px] h-[13px]" />
              Settings
            </Link>
            <Link href={all_routes.payments} className="dropdown-item">
              <LucideIcon name="credit-card" className="w-[13px] h-[13px]" />
              Billing
            </Link>
            <Link href={all_routes.help} className="dropdown-item">
              <LucideIcon name="help-circle" className="w-[13px] h-[13px]" />
              Help &amp; Support
            </Link>
            <div className="menu-sep" />
            <Link href={all_routes.login} className="dropdown-item danger-link">
              <LucideIcon name="log-out" className="w-[13px] h-[13px]" />
              Sign Out
            </Link>
          </Dropdown.Menu>
        </Dropdown>
        </>
        )}
      </header>
    </>
  );
};

export default CommonHeader;
