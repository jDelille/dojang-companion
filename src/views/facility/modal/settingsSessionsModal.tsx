import { LogOut, Monitor, X } from "lucide-react";
import type { Session } from "../../../types/settings";

/*
   Active Sessions — ported from #modal-sessions in tailwind/src/settings.html and
   openSessions() in assets/js/settings.js.
*/

type SettingsSessionsModalProps = {
  open: boolean;
  sessions: Session[];
  onClose: () => void;
  onSignOutOne: (id: number) => void;
  onSignOutAll: () => void;
};

const SettingsSessionsModal = ({
  open,
  sessions,
  onClose,
  onSignOutOne,
  onSignOutAll,
}: SettingsSessionsModalProps) => (
  <div
    className={open ? "modal-overlay open" : "modal-overlay"}
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
    role="dialog"
    aria-modal="true"
    aria-hidden={!open}
  >
    <div className="modal-box glass modal-w-520">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-black c-text">Active Sessions</h3>
        <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
          <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        </button>
      </div>
      <div className="key-scroll mb-5">
        {sessions.map((s) => (
          <div key={s.id} className="data-row">
            <div className={`icon-box ${s.current ? "ic-green" : "ic-gold"}`}>
              <Monitor
                className={`w-[16px] h-[16px] ${s.current ? "c-green" : "c-gold"} shrink-0`}
                aria-hidden="true"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="dr-t truncate">
                {s.device}
                {s.current && <span className="badge badge-present">This device</span>}
              </div>
              <div className="dr-s">{s.where + " · " + s.ip + " · " + s.last}</div>
            </div>
            {!s.current && (
              <button
                type="button"
                className="btn-ghost px-3 py-1.5 text-xs danger-link"
                onClick={() => onSignOutOne(s.id)}
              >
                Sign out
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
          Close
        </button>
        <button
          type="button"
          className="btn-danger flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
          onClick={onSignOutAll}
        >
          <LogOut className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Sign out all others
        </button>
      </div>
    </div>
  </div>
);

export default SettingsSessionsModal;
