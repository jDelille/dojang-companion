import { useState } from "react";
import { AlertCircle, AlertOctagon } from "lucide-react";
import { DEL_PHRASE } from "../../../utils/json/settingsData";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Delete Account — ported from #modal-delete in tailwind/src/settings.html and
   openDelete()/confirmDelete() in assets/js/settings.js.
*/

type SettingsDeleteModalProps = {
  open: boolean;
  gymName: string;
  onClose: () => void;
  onConfirm: () => void;
  onInvalidAck: () => void;
};

const SettingsDeleteModal = ({
  open,
  gymName,
  onClose,
  onConfirm,
  onInvalidAck,
}: SettingsDeleteModalProps) => {
  const [confirm, setConfirm] = useState("");
  const [ack, setAck] = useState(false);
  const [confirmErr, setConfirmErr] = useState("");

  const submit = () => {
    let ok = true;
    if (confirm.trim() !== DEL_PHRASE) {
      setConfirmErr("Type " + DEL_PHRASE + " exactly to confirm");
      ok = false;
    } else setConfirmErr("");
    if (!ack) {
      ok = false;
      onInvalidAck();
    }
    if (!ok) return;
    onConfirm();
    onClose();
  };

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
      <div className="modal-box glass modal-w-460">
        <div className="confirm-ic danger">
          <AlertOctagon className="w-6 h-6 c-red shrink-0" aria-hidden="true" />
        </div>
        <DialogEyebrow />
        <h3 className="text-base font-black c-text text-center mb-1">Delete Account?</h3>
        <p className="text-sm text-center mb-4 c-dim">
          This permanently removes the account, all branches, members and billing history. It
          cannot be undone.
        </p>
        <div className="ctx-box mb-4">
          <span className="c-red font-semibold">This removes:</span> {gymName} · 6 branches · all
          members, classes and billing history. Export your settings first if you may need them.
        </div>
        <div className="mb-4">
          <label className="f-label" htmlFor="del-confirm">
            Type <span className="c-red">{DEL_PHRASE}</span> to confirm
          </label>
          <input
            type="text"
            id="del-confirm"
            className="fp-input py-2.5 text-sm"
            placeholder="DELETE"
            autoComplete="off"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <div className={`f-error${confirmErr ? " show" : ""}`}>
            <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
            <span>{confirmErr}</span>
          </div>
        </div>
        <label className="flex items-center gap-2.5 text-[13px] c-text2 cursor-pointer mb-5">
          <input
            type="checkbox"
            id="del-ack"
            className="cbx"
            checked={ack}
            onChange={(e) => setAck(e.target.checked)}
          />
          I understand this data cannot be recovered
        </label>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-danger flex-1 py-2.5 text-sm" onClick={submit}>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsDeleteModal;
