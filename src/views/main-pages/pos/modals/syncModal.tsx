import { RefreshCw } from "lucide-react";
import PosModal from "../posModal";
import { money } from "../posUtils";
import { spawnRipple } from "../ripple";
import type { PosSync } from "../../../../hooks/usePosSync";

/*
   Offline Sync, ported from #modal-sync / renderSync() in
   tailwind/src/pos.html and assets/js/pos.js.

   Sales are saved on the device first and pushed afterwards; this dialog is
   the window onto that queue.
*/

const SyncModal = ({
  open,
  onClose,
  sync,
}: {
  open: boolean;
  onClose: () => void;
  sync: PosSync;
}) => {
  const { queue, status, pendingCount, syncing, online, lastSyncText } = sync;

  const title =
    status === "offline"
      ? "Working offline"
      : status === "syncing"
        ? "Syncing…"
        : pendingCount
          ? pendingCount + " change" + (pendingCount === 1 ? "" : "s") + " waiting"
          : "All changes synced";

  const counts = {
    pending: queue.filter((q) => q.state === "pending" || q.state === "offline").length,
    synced: queue.filter((q) => q.state === "synced").length,
    failed: queue.filter((q) => q.state === "failed").length,
  };

  return (
    <PosModal
      open={open}
      onClose={onClose}
      title="Offline Sync"
      boxClassName="modal-sm2"
    >
      <div className="text-[12px] t-muted mb-3">
        Sales are saved on this device first, then pushed to the server. Nothing
        is lost if the connection drops.
      </div>
      <div className="sync-state">
        <div className="sync-dot-wrap">
          <span className={`sync-dot is-${status}`} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold c-text">{title}</div>
          <div className="text-[11px] t-muted mt-0.5">
            {online
              ? lastSyncText
              : "Sales are stored on this device until the connection returns."}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 my-3">
        <div className="sync-stat">
          <div className="sync-stat-v">{counts.pending}</div>
          <div className="sync-stat-l">Pending</div>
        </div>
        <div className="sync-stat">
          <div className="sync-stat-v t-green">{counts.synced}</div>
          <div className="sync-stat-l">Synced</div>
        </div>
        <div className="sync-stat">
          <div className="sync-stat-v t-red">{counts.failed}</div>
          <div className="sync-stat-l">Failed</div>
        </div>
      </div>
      <div className="mini-label">Queue</div>
      <div className="pick-scroll sync-queue">
        {queue.length ? (
          queue.map((q, i) => (
            <div key={q.ref + i} className="sync-row">
              <span className={`sync-row-dot is-${q.state}`} />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold c-text truncate">
                  {q.ref} · {q.kind}
                </div>
                <div className="text-[10px] t-dim">
                  {q.at} · {q.method}
                </div>
              </div>
              <span className={`text-[11px] font-bold ${q.amt < 0 ? "t-red" : "gt"}`}>
                {q.amt < 0 ? "-" : ""}
                {money(Math.abs(q.amt))}
              </span>
              <span className={`sync-tag is-${q.state}`}>{q.state}</span>
            </div>
          ))
        ) : (
          <div className="text-center py-6 t-dim text-xs">
            Nothing queued — everything is synced
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 mt-3">
        <span className="text-[11px] t-dim">
          Auto-syncs when the connection returns.
        </span>
        <button
          type="button"
          className={
            syncing
              ? "btn-gold ripple px-3.5 py-2 text-xs flex items-center gap-1.5 is-busy"
              : "btn-gold ripple px-3.5 py-2 text-xs flex items-center gap-1.5"
          }
          disabled={syncing || (online && !pendingCount)}
          onClick={(e) => {
            spawnRipple(e);
            sync.syncNow();
          }}
        >
          <RefreshCw className="ic-14" aria-hidden="true" />
          Sync Now
        </button>
      </div>
    </PosModal>
  );
};

export default SyncModal;
