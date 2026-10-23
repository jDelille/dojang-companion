import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calculator,
  Clock,
  Cloud,
  CloudCheck,
  CloudOff,
  CloudUpload,
  History,
  Maximize,
  Minimize,
  Moon,
  Receipt,
  RefreshCw,
  ScanLine,
  Search,
  ShoppingCart,
  Sun,
  User,
  Volume2,
  VolumeX,
  Zap,
  type LucideIcon,
} from "lucide-react";
import useClock from "../../../hooks/useClock";
import useFullscreen from "../../../hooks/useFullscreen";
import useTheme from "../../../hooks/useTheme";
import { CASHIER } from "./posData";
import { money } from "./posUtils";
import type { SyncStatus } from "../../../hooks/usePosSync";
import type { ModalId } from "./types";

/*
   The register-specific header, ported from <header class="pos-header"> in
   tailwind/src/pos.html.

   It lives in the page rather than in PosLayout because every chip reads live
   cart state (item count, grand total, invoice number, sync status); hoisting
   it into the layout would mean hoisting the cart with it.

   The template's swapIcon() dance is gone — React just renders a different
   component when the state changes.
*/

const SYNC_ICON: Record<SyncStatus, LucideIcon> = {
  offline: CloudOff,
  syncing: RefreshCw,
  pending: CloudUpload,
  synced: CloudCheck,
};

type PosHeaderBarProps = {
  invoiceId: string;
  itemCount: number;
  total: number;
  syncStatus: SyncStatus;
  syncPending: number;
  muted: boolean;
  onToggleSound: () => void;
  onToggleCalc: () => void;
  onOpenModal: (id: ModalId) => void;
};

const PosHeaderBar = ({
  invoiceId,
  itemCount,
  total,
  syncStatus,
  syncPending,
  muted,
  onToggleSound,
  onToggleCalc,
  onOpenModal,
}: PosHeaderBarProps) => {
  const clock = useClock();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

  const isDark = resolvedTheme === "dark";
  /* The icon shows the mode you'd switch TO, so dark mode shows a sun. */
  const themeLabel = isDark ? "Switch to light mode" : "Switch to dark mode";
  const ThemeIcon = isDark ? Sun : Moon;

  const SyncIcon = SYNC_ICON[syncStatus] ?? Cloud;
  const syncLabel =
    syncStatus === "offline"
      ? "Offline"
      : syncStatus === "syncing"
        ? "Syncing…"
        : syncPending
          ? syncPending + " pending"
          : "Synced";

  // Leave POS the way the cashier came in.
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/index");
  };

  return (
    <header className="pos-header">
      <button
        type="button"
        className="ph-btn"
        onClick={goBack}
        title="Back (Alt+←)"
        aria-label="Back to previous page"
      >
        <ArrowLeft className="ic-15" aria-hidden="true" />
      </button>
      <div className="ph-brand">
        <ScanLine className="ic-18" aria-hidden="true" />
      </div>
      <div>
        <div className="ph-title">Point of Sale</div>
        <div className="ph-sub">Austin HQ · Register 01</div>
      </div>

      <span className="ph-sep" />

      <div className="ph-meta">
        <span className="ph-chip ph-chip-live">
          <span className="ph-live-dot" />
          Register Open
        </span>
        <span className="ph-chip ph-chip-gold">
          <Receipt className="ic-12" aria-hidden="true" />
          <span>{invoiceId}</span>
        </span>
        <span className="ph-chip ph-hide-md">
          <User className="ic-12" aria-hidden="true" />
          {CASHIER}
        </span>
        <span className="ph-chip ph-hide-md">
          <ShoppingCart className="ic-12" aria-hidden="true" />
          <span>{itemCount}</span> items
        </span>
        <span className="ph-chip">
          <Clock className="ic-12" aria-hidden="true" />
          <span className="ph-clock">{clock}</span>
        </span>
        <button
          type="button"
          className={`ph-chip sync-chip is-${syncStatus}`}
          onClick={() => onOpenModal("sync")}
          title={
            syncStatus === "offline"
              ? `Offline — ${syncPending} queued`
              : syncStatus === "pending"
                ? `${syncPending} waiting to sync`
                : "Offline sync status"
          }
          aria-label="Offline sync status"
        >
          <SyncIcon className="ic-12" aria-hidden="true" />
          <span>{syncLabel}</span>
        </button>
      </div>

      <div className="ph-actions">
        <button
          type="button"
          className="ph-btn"
          onClick={() => onOpenModal("quick-search")}
          title="Quick find (F2)"
          aria-label="Quick find"
        >
          <Search className="ic-15" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="ph-btn"
          onClick={() => onOpenModal("recent-tx")}
          title="Order history"
          aria-label="Order history"
        >
          <History className="ic-15" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="ph-btn"
          onClick={onToggleCalc}
          title="Calculator (F4)"
          aria-label="Calculator"
        >
          <Calculator className="ic-15" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="ph-btn"
          onClick={() => onOpenModal("quick-actions")}
          title="Quick actions"
          aria-label="Quick actions"
        >
          <Zap className="ic-15" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="ph-btn"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          title={themeLabel}
          aria-label={themeLabel}
          aria-pressed={!isDark}
        >
          <ThemeIcon className="ic-15" aria-hidden="true" />
        </button>
        <button
          type="button"
          className={muted ? "ph-btn is-muted" : "ph-btn"}
          onClick={onToggleSound}
          title={muted ? "Unmute sounds (F8)" : "Mute sounds (F8)"}
          aria-label={muted ? "Unmute sounds" : "Mute sounds"}
          aria-pressed={!muted}
        >
          {muted ? (
            <VolumeX className="ic-15" aria-hidden="true" />
          ) : (
            <Volume2 className="ic-15" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          className="ph-btn"
          onClick={toggleFullscreen}
          title="Toggle fullscreen"
          aria-label="Toggle fullscreen"
        >
          {isFullscreen ? (
            <Minimize className="ic-15" aria-hidden="true" />
          ) : (
            <Maximize className="ic-15" aria-hidden="true" />
          )}
        </button>
        <div className="ph-total">
          <span className="ph-total-l">Cart Total</span>
          <span className="ph-total-v gt">{money(total)}</span>
        </div>
      </div>
    </header>
  );
};

export default PosHeaderBar;
