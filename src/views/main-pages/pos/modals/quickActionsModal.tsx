import { X, Zap } from "lucide-react";
import PosModal from "../posModal";
import { QUICK_ACTIONS } from "../posData";
import { spawnRipple } from "../ripple";
import type { QuickActionId } from "../types";

/*
   Quick Actions grid, ported from #modal-quick-actions / renderQuickActions()
   in tailwind/src/pos.html and assets/js/pos.js.

   Dispatch lives in the page (runQuickAction), so this stays presentational.
*/

type QuickActionsModalProps = {
  open: boolean;
  onClose: () => void;
  onRun: (action: QuickActionId) => void;
};

const QuickActionsModal = ({ open, onClose, onRun }: QuickActionsModalProps) => (
  <PosModal
    open={open}
    onClose={onClose}
    boxClassName="glass modal-md"
    head={
      <div className="modal-head">
        <div className="flex items-center gap-2.5">
          <div className="icon-box w-9! h-9! grad-gold">
            <Zap className="ic-17 t-ink" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-black c-text leading-none">
              Quick Actions
            </h3>
            <div className="text-[11px] mt-0.5 t-muted">
              Manage the current sale in one tap
            </div>
          </div>
        </div>
        <button
          type="button"
          className="modal-x"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="ic-15" aria-hidden="true" />
        </button>
      </div>
    }
  >
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {QUICK_ACTIONS.map(({ label, Icon, cls, action }) => (
        <button
          key={action}
          type="button"
          className="quick-tile ripple p-4! gap-2.5"
          onClick={(e) => {
            spawnRipple(e);
            onRun(action);
          }}
        >
          <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 tint-plain">
            <Icon className={`ic-19 ${cls}`} aria-hidden="true" />
          </span>
          <span className="text-[11.5px] font-semibold t-soft">{label}</span>
        </button>
      ))}
    </div>
  </PosModal>
);

export default QuickActionsModal;
