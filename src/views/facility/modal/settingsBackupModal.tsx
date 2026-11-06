import { Clock, Plus, Save, X } from "lucide-react";
import type { Backup } from "../../../types/settings";
import { fmtDateTime } from "../../../utils/json/settingsData";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Backup & Restore — ported from #modal-backup in tailwind/src/settings.html and
   openBackup()/renderBackups() in assets/js/settings.js.
*/

type SettingsBackupModalProps = {
  open: boolean;
  backups: Backup[];
  onClose: () => void;
  onNew: () => void;
  onDownload: (id: number) => void;
  onRestore: (id: number) => void;
};

const SettingsBackupModal = ({
  open,
  backups,
  onClose,
  onNew,
  onDownload,
  onRestore,
}: SettingsBackupModalProps) => (
  <div
    className={open ? "modal-overlay open" : "modal-overlay"}
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
    role="dialog"
    aria-modal="true"
    aria-hidden={!open}
  >
    <div className="modal-box glass modal-w-560">
      <div className="flex items-center justify-between mb-4">
        <div className="min-w-0">
          <DialogEyebrow />
          <h3 className="text-base font-black c-text">Backup &amp; Restore</h3>
        </div>
        <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
          <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        </button>
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[12px] c-dim">Restore points are kept for 30 days.</div>
        <button
          type="button"
          className="btn-gold px-3 py-1.5 text-xs flex items-center gap-2"
          onClick={onNew}
        >
          <Plus className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
          Create Backup
        </button>
      </div>
      <div className="key-scroll mb-5">
        {backups.length ? (
          backups.map((b) => (
            <div key={b.id} className="data-row">
              <div className={`icon-box ${b.auto ? "ic-cyan" : "ic-gold"}`}>
                {b.auto ? (
                  <Clock className="w-[16px] h-[16px] c-cyan shrink-0" aria-hidden="true" />
                ) : (
                  <Save className="w-[16px] h-[16px] c-gold shrink-0" aria-hidden="true" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="dr-t truncate">{b.name}</div>
                <div className="dr-s">
                  {fmtDateTime(b.at) + " · " + b.size + " · " + (b.auto ? "automatic" : "manual")}
                </div>
              </div>
              <button
                type="button"
                className="btn-ghost px-3 py-1.5 text-xs"
                onClick={() => onDownload(b.id)}
              >
                Download
              </button>
              <button
                type="button"
                className="btn-gold px-3 py-1.5 text-xs"
                onClick={() => onRestore(b.id)}
              >
                Restore
              </button>
            </div>
          ))
        ) : (
          <div className="text-xs c-dim text-center py-8">No restore points yet</div>
        )}
      </div>
      <div className="flex gap-3">
        <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  </div>
);

export default SettingsBackupModal;
