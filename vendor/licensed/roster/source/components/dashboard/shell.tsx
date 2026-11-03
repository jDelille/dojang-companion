'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { signOut } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  Bot,
  CalendarDays,
  Inbox,
  KanbanSquare,
  CheckSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PhoneCall,
  Receipt,
  Repeat,
  Search,
  Settings,
  Shield,
  Star,
  Sun,
  Users,
  X,
} from 'lucide-react';
import { cn, initials } from '@/lib/utils';
import { useTheme } from '@/components/providers';
import { ROLE_LABELS } from '@/lib/rbac';
import type { Role } from '@prisma/client';

/**
 * Command-center chrome: fixed sidebar, dense nav, workspace identity.
 * Amber marks the active nav item and nothing else here.
 */

const NAV = [
  { href: '/dashboard', labelKey: 'overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/leads', labelKey: 'leads', icon: Search },
  { href: '/dashboard/contacts', labelKey: 'contacts', icon: Users },
  { href: '/dashboard/pipeline', labelKey: 'pipeline', icon: KanbanSquare },
  { href: '/dashboard/tasks', labelKey: 'tasks', icon: CheckSquare },
  { href: '/dashboard/inbox', labelKey: 'inbox', icon: Inbox },
  { href: '/dashboard/calls', labelKey: 'calls', icon: PhoneCall },
  { href: '/dashboard/agents', labelKey: 'agents', icon: Bot },
  { href: '/dashboard/retention', labelKey: 'retention', icon: Repeat },
  { href: '/dashboard/appointments', labelKey: 'appointments', icon: CalendarDays },
  { href: '/dashboard/reviews', labelKey: 'reviews', icon: Star },
  { href: '/dashboard/invoices', labelKey: 'invoices', icon: Receipt },
  { href: '/dashboard/analytics', labelKey: 'analytics', icon: BarChart3 },
] as const;

export type ShellUser = {
  name: string | null;
  email: string;
  role: Role;
};

export type ShellWorkspace = {
  name: string;
  logoUrl: string | null;
  accentColor: string | null;
};

export function DashboardShell({
  user,
  workspace,
  showSuperAdmin,
  children,
}: {
  user: ShellUser;
  workspace: ShellWorkspace;
  showSuperAdmin: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Drawer behavior: Escape closes it, the page behind does not scroll, and
  // focus moves in and back out again so a keyboard or screen-reader user is
  // not left navigating the page underneath.
  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const firstLink = drawerRef.current?.querySelector<HTMLElement>('a, button');
    firstLink?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      toggleRef.current?.focus();
    };
  }, [mobileOpen]);
  const { theme, toggle } = useTheme();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const nav = (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4 scrollbar-thin">
      {NAV.map((item) => {
        const active = isActive(item.href, 'exact' in item ? item.exact : false);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-2.5 rounded-control px-3 py-2 text-sm transition-colors duration-150',
              active
                ? 'bg-accent/12 font-medium text-[color:var(--color-fg)]'
                : 'muted hover:bg-black/[0.04] hover:text-[color:var(--color-fg)] dark:hover:bg-white/[0.06]',
            )}
          >
            <item.icon
              className={cn('h-4 w-4 shrink-0', active && 'text-[color:var(--color-accent-dark)] dark:text-accent')}
              strokeWidth={active ? 2 : 1.75}
            />
            {t(item.labelKey)}
          </Link>
        );
      })}

      {showSuperAdmin && (
        <>
          <div className="my-3 border-t border-[color:var(--color-border)]" />
          <Link
            href="/super-admin"
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-2.5 rounded-control px-3 py-2 text-sm transition-colors duration-150',
              isActive('/super-admin')
                ? 'bg-accent/12 font-medium text-[color:var(--color-fg)]'
                : 'muted hover:bg-black/[0.04] hover:text-[color:var(--color-fg)] dark:hover:bg-white/[0.06]',
            )}
          >
            <Shield className="h-4 w-4" strokeWidth={isActive('/super-admin') ? 2 : 1.75} />
            {t('superAdmin')}
          </Link>
        </>
      )}
    </nav>
  );

  const sidebarBody = (
    <>
      <div className="flex h-14 items-center gap-2.5 border-b border-[color:var(--color-border)] px-5">
        {workspace.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={workspace.logoUrl} alt="" className="h-6 w-auto max-w-[120px] object-contain" />
        ) : (
          <>
            <span className="flex h-6 w-6 items-center justify-center rounded-control bg-accent text-[11px] font-bold text-[color:var(--color-accent-fg)]">
              R
            </span>
            <span className="truncate font-display text-sm font-semibold tracking-tight">
              {workspace.name}
            </span>
          </>
        )}
      </div>

      {nav}

      <div className="border-t border-[color:var(--color-border)] p-3">
        <Link
          href="/dashboard/settings"
          onClick={() => setMobileOpen(false)}
          className={cn(
            'mb-2 flex items-center gap-2.5 rounded-control px-3 py-2 text-sm transition-colors duration-150',
            isActive('/dashboard/settings')
              ? 'bg-accent/12 font-medium text-[color:var(--color-fg)]'
              : 'muted hover:bg-black/[0.04] hover:text-[color:var(--color-fg)] dark:hover:bg-white/[0.06]',
          )}
        >
          <Settings className="h-4 w-4" strokeWidth={1.75} />
          {t('settings')}
        </Link>

        <div className="flex items-center gap-2.5 rounded-control px-3 py-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-pill border border-[color:var(--color-border)] text-[11px] font-medium">
            {initials(user.name || user.email)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium">{user.name || user.email}</span>
            <span className="block truncate text-[11px] muted">{ROLE_LABELS[user.role]}</span>
          </span>
          <button
            onClick={toggle}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={t("toggleTheme")}
            className="rounded-control p-1.5 muted transition-colors hover:text-[color:var(--color-fg)]"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <Moon className="h-4 w-4" strokeWidth={1.75} />
            )}
          </button>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            title="Sign out"
            aria-label={t("signOut")}
            className="rounded-control p-1.5 muted transition-colors hover:text-alert"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 start-0 hidden w-60 flex-col border-e border-[color:var(--color-border)] bg-[color:var(--color-elevated)] lg:flex">
        {sidebarBody}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-scrim/50"
            aria-hidden
            onClick={() => setMobileOpen(false)}
          />
          <aside
            ref={drawerRef}
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 start-0 flex w-64 flex-col border-e border-[color:var(--color-border)] bg-[color:var(--color-elevated)]"
          >
            {sidebarBody}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:ps-60">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]/90 px-4 backdrop-blur lg:hidden">
          <button
            ref={toggleRef}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={t("toggleNavigation")}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            className="rounded-control p-1.5 muted transition-colors duration-150 ease-out hover:text-[color:var(--color-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" strokeWidth={1.75} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            )}
          </button>
          <span className="font-display text-sm font-semibold">{workspace.name}</span>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
