import { History } from "lucide-react";
import type { Backup } from "../../../types/settings";
import { fmtDate, fmtDateTime } from "../../../utils/json/settingsData";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Restore Confirm — ported from #modal-restore in tailwind/src/settings.html and
   openRestore()/confirmRestore() in assets/js/settings.js. Seeded restore points
   carry no snapshot, so they restore factory defaults in this demo.
*/

type SettingsRestoreModalProps = {
  backup: Backup | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
};

const SettingsRestoreModal = ({ backup: b, onClose, onConfirm }: SettingsRestoreModalProps) => {
  const open = b !== null;

  return (
    <div
      className={open ? "modal-overlay open" : "modal-overlay"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-420">
        <div className="confirm-ic warn">
          <History className="w-6 h-6 c-orange shrink-0" aria-hidden="true" />
        </div>
        <DialogEyebrow />
        <h3 className="text-base font-black c-text text-center mb-1">Restore This Backup?</h3>
        <p className="text-sm text-center mb-4 c-dim">
          Your current settings will be replaced by{" "}
          <span className="font-semibold c-text">
            {b ? b.name + " (" + fmtDate(b.at) + ")" : "this restore point"}
          </span>
          .
        </p>
        <div className="ctx-box mb-5">
          {b
            ? fmtDateTime(b.at) +
              " · " +
              b.size +
              " · " +
              (b.auto ? "automatic" : "manual") +
              " · seeded restore point — restores factory defaults in this demo"
            : "—"}
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => {
              if (!b) return;
              onConfirm(b.id);
              onClose();
            }}
          >
            <History className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Restore
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsRestoreModal;
