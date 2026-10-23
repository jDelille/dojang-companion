import { useState } from "react";
import { Check, Crown, X } from "lucide-react";
import { PLANS, inr } from "../../../utils/json/settingsData";
import { SETTINGS_ICON, SETTINGS_ICON_FALLBACK } from "../settingsIcons";

/*
   Change Plan — ported from #modal-plan in tailwind/src/settings.html and
   openPlan()/confirmPlan() in assets/js/settings.js.
*/

type SettingsPlanModalProps = {
  open: boolean;
  currentPlan: string;
  onClose: () => void;
  onConfirm: (plan: string) => void;
};

const SettingsPlanModal = ({ open, currentPlan, onClose, onConfirm }: SettingsPlanModalProps) => {
  const [pick, setPick] = useState(currentPlan);

  const cur = PLANS.find((p) => p.id === currentPlan);
  const next = PLANS.find((p) => p.id === pick);
  let summary = "This is your current plan.";
  if (pick !== currentPlan && cur && next) {
    const diff = next.price - cur.price;
    summary =
      (diff > 0 ? "Upgrade" : "Downgrade") +
      " from " +
      cur.id +
      " to " +
      next.id +
      " · " +
      (diff > 0 ? "+" : "−") +
      inr(Math.abs(diff)) +
      "/month · billed from your next cycle.";
  }

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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black c-text">Change Plan</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-2 mb-4" role="radiogroup" aria-label="Plan">
          {PLANS.map((p) => {
            const Icon = SETTINGS_ICON[p.ic] ?? SETTINGS_ICON_FALLBACK;
            const sel = p.id === pick;
            return (
              <button
                key={p.id}
                type="button"
                className={`opt-card${sel ? " sel" : ""}`}
                role="radio"
                aria-checked={sel}
                onClick={() => setPick(p.id)}
              >
                <span className={`opt-ic ${p.tint}`}>
                  <Icon className={`w-[15px] h-[15px] ${p.col} shrink-0`} aria-hidden="true" />
                </span>
                <span className="flex-1">
                  <span className="block text-[13px] font-bold c-text">
                    {p.id + " · " + inr(p.price) + "/mo"}
                  </span>
                  <span className="block text-[11px] c-dim">{p.hint}</span>
                </span>
                <Check
                  className={`w-[15px] h-[15px] c-gold shrink-0${sel ? "" : " opacity-0"}`}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
        <div className="ctx-box mb-5">{summary}</div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => {
              onConfirm(pick);
              onClose();
            }}
          >
            <Crown className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Confirm Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPlanModal;
