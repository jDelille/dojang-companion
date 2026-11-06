import { LogOut } from "lucide-react";
import type { Session } from "../../../types/settings";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Sign Out Other Devices — ported from #modal-signout in
   tailwind/src/settings.html and openSignout()/confirmSignout() in
   assets/js/settings.js.
*/

type SettingsSignoutModalProps = {
  open: boolean;
  sessions: Session[];
  onClose: () => void;
  onConfirm: () => void;
};

const SettingsSignoutModal = ({
  open,
  sessions,
  onClose,
  onConfirm,
}: SettingsSignoutModalProps) => {
  const others = sessions.filter((s) => !s.current);
  const context =
    others.length +
    " other device" +
    (others.length === 1 ? "" : "s") +
    ": " +
    others.map((s) => s.device).join(", ");

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
          <LogOut className="w-6 h-6 c-orange shrink-0" aria-hidden="true" />
        </div>
        <DialogEyebrow />
        <h3 className="text-base font-black c-text text-center mb-1">Sign Out Other Devices?</h3>
        <p className="text-sm text-center mb-4 c-dim">
          Every device except this one will be signed out immediately.
        </p>
        <div className="ctx-box mb-5">{context}</div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Sign out all
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsSignoutModal;
