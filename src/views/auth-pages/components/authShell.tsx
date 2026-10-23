import type { ReactNode } from "react";
import Link from "next/link";
import ThemeToggle from "../../../components/common/ThemeToggle";
import ImageWithBasePath from "../../../components/image-with-base-path";
export const GoogleMark = () => (
  <svg
    className="w-[15px] h-[15px]"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
  </svg>
);

/** Wordmark used in the brand panel and again, smaller, on mobile. */
export const AuthLogo = ({ compact = false }: { compact?: boolean }) =>
  compact ? (
    <Link
      href="/dashboard"
      className="flex items-center gap-3 mb-8 lg:hidden text-current no-underline"
      aria-label="Dreams GYM - Go to dashboard"
      title="Dreams GYM Dashboard"
    >
      <div className="logo-badge w-10 h-10 rounded-xl flex items-center justify-center p-1">
        <ImageWithBasePath src="assets/img/logo.svg" alt="logo" />
      </div>
      <div className="text-base font-black c-text">
        Dreams <span className="gt">GYM</span>
      </div>
    </Link>
  ) : (
    <Link
      href="/dashboard"
      className="relative z-10 block text-current no-underline"
      aria-label="Dreams GYM - Go to dashboard"
      title="Dreams GYM Dashboard"
    >
      <div className="flex items-center gap-3">
        <div className="logo-badge w-11 h-11 rounded-xl flex items-center justify-center p-1">
          <ImageWithBasePath src="assets/img/logo.svg" alt="logo" />
        </div>
        <div>
          <div className="text-lg font-black text-white leading-none">
            Dreams <span className="gt">GYM</span>
          </div>
          <div className="text-[9px] font-bold tracking-[0.16em] mt-1 c-gold">
            ELITE MANAGEMENT
          </div>
        </div>
      </div>
    </Link>
  );
export const AuthShell = ({
  brand,
  children,
}: {
  brand: ReactNode;
  children: ReactNode;
}) => (
  <div className="auth-wrap relative">
    <ThemeToggle variant="segmented" />

    <aside className="auth-brand">
      <AuthLogo />
      {brand}
    </aside>

    <main className="auth-form">
      <div className="auth-card">
        <AuthLogo compact />
        {children}
      </div>
    </main>
  </div>
);

export default AuthShell;
