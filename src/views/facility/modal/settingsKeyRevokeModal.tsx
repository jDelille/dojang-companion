import { Ban } from "lucide-react";
import type { ApiKey } from "../../../types/settings";
import { fmtDate } from "../../../utils/json/settingsData";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Revoke API Key — ported from #modal-key-revoke in tailwind/src/settings.html
   and openRevoke()/confirmRevoke() in assets/js/settings.js.
*/

type SettingsKeyRevokeModalProps = {
  apiKey: ApiKey | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
};

const SettingsKeyRevokeModal = ({ apiKey: k, onClose, onConfirm }: SettingsKeyRevokeModalProps) => {
  const open = k !== null;

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
        <div className="confirm-ic danger">
          <Ban className="w-6 h-6 c-red shrink-0" aria-hidden="true" />
        </div>
        <DialogEyebrow />
        <h3 className="text-base font-black c-text text-center mb-1">Revoke API Key?</h3>
        <p className="text-sm text-center mb-4 c-dim">
          Any integration using{" "}
          <span className="font-semibold c-text">{k ? "“" + k.name + "”" : "this key"}</span> will
          stop working immediately.
        </p>
        <div className="ctx-box mb-5">
          {k
            ? k.prefix +
              "•••••••• · created " +
              fmtDate(k.created) +
              " · last used " +
              (k.lastUsed ? fmtDate(k.lastUsed) : "never")
            : "—"}
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger flex-1 py-2.5 text-sm"
            onClick={() => {
              if (!k) return;
              onConfirm(k.id);
              onClose();
            }}
          >
            Revoke
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsKeyRevokeModal;
