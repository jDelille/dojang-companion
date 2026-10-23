import { useState } from "react";
import { AlertOctagon, Check, RotateCcw } from "lucide-react";
import { SECTION_LABEL, tabSection } from "../../../utils/json/settingsData";
import type { SettingsTab } from "../../../types/settings";

/*
   Reset Settings — ported from #modal-reset in tailwind/src/settings.html and
   openReset()/confirmReset() in assets/js/settings.js. Scope opt-cards + summary
   reflect the section owned by the active nav tab.
*/

type SettingsResetModalProps = {
  open: boolean;
  activeTab: SettingsTab;
  onClose: () => void;
  onConfirm: (scope: "section" | "all") => void;
};

const SettingsResetModal = ({ open, activeTab, onClose, onConfirm }: SettingsResetModalProps) => {
  const [scope, setScope] = useState<"section" | "all">("section");
  const label = SECTION_LABEL[tabSection(activeTab)] || "this section";

  const opts = [
    {
      id: "section" as const,
      Icon: RotateCcw,
      tint: "ic-gold",
      col: "c-gold",
      label: "This section only",
      hint: "Reset " + label + " to defaults",
    },
    {
      id: "all" as const,
      Icon: AlertOctagon,
      tint: "ic-red",
      col: "c-red",
      label: "All settings",
      hint: "Reset every section across the dashboard",
    },
  ];

  const summary =
    scope === "all"
      ? "Every section returns to factory defaults. API keys, backups and sessions are not affected."
      : label + " returns to factory defaults. Other sections keep their current values.";

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
        <div className="confirm-ic warn">
          <RotateCcw className="w-6 h-6 c-orange shrink-0" aria-hidden="true" />
        </div>
        <h3 className="text-base font-black c-text text-center mb-1">Reset Settings?</h3>
        <p className="text-sm text-center mb-4 c-dim">
          Restore settings to their factory defaults. Unsaved edits are discarded too.
        </p>
        <div className="mb-4">
          <span className="f-label">Scope</span>
          <div className="space-y-2" role="radiogroup" aria-label="Reset scope">
            {opts.map((o) => {
              const sel = o.id === scope;
              const Icon = o.Icon;
              return (
                <button
                  key={o.id}
                  type="button"
                  className={`opt-card${sel ? " sel" : ""}`}
                  role="radio"
                  aria-checked={sel}
                  onClick={() => setScope(o.id)}
                >
                  <span className={`opt-ic ${o.tint}`}>
                    <Icon className={`w-[15px] h-[15px] ${o.col} shrink-0`} aria-hidden="true" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[13px] font-bold c-text">{o.label}</span>
                    <span className="block text-[11px] c-dim">{o.hint}</span>
                  </span>
                  <Check
                    className={`w-[15px] h-[15px] c-gold shrink-0${sel ? "" : " opacity-0"}`}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        </div>
        <div className="ctx-box mb-5">{summary}</div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger flex-1 py-2.5 text-sm"
            onClick={() => {
              onConfirm(scope);
              onClose();
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsResetModal;
