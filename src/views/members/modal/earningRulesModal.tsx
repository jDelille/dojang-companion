import { useEffect, useState } from "react";
import { Check, Settings, X } from "lucide-react";
import type { EarningRule } from "../../../types/rewards";
import { RULE_DEFAULTS } from "../../../utils/json/rewardsData";
import { RULE_ICON } from "../rewardIcons";

/*
   Earning Rules — ported from #modal-rules in tailwind/src/rewards.html and
   renderRules()/saveRules()/resetRules() in assets/js/rewards.js.

   Edits are held locally so "Reset Defaults" can restore the table without
   touching the page's saved rules until Save is pressed.
*/

type EarningRulesModalProps = {
  open: boolean;
  rules: EarningRule[];
  onClose: () => void;
  onSave: (rules: EarningRule[]) => void;
  onReset: () => void;
};

const EarningRulesModal = ({
  open,
  rules,
  onClose,
  onSave,
  onReset,
}: EarningRulesModalProps) => {
  const [draft, setDraft] = useState<EarningRule[]>(rules);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const setPoints = (key: string, points: number) =>
    setDraft((prev) =>
      prev.map((rule) => (rule.key === key ? { ...rule, pts: points } : rule)),
    );

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
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="icon-box grad-gold ic-38">
              <Settings className="w-[17px] h-[17px] t-ink shrink-0" aria-hidden="true" />
            </div>
            <h3 className="text-base font-black c-text">Earning Rules</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <p className="text-[12px] c-dim mb-4">
          Points members earn for each activity. Update the values to tune your loyalty
          program.
        </p>
        <div className="space-y-2.5">
          {draft.map((rule) => {
            const Icon = RULE_ICON[rule.key];
            return (
              <div key={rule.key} className="rule-row">
                <div className="rule-ic">
                  {Icon && (
                    <Icon className="w-[15px] h-[15px] c-gold shrink-0" aria-hidden="true" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-[13px] font-semibold c-text">
                  {rule.label}
                </div>
                <input
                  type="number"
                  className="fp-input py-2 text-sm rule-input"
                  value={rule.pts}
                  onChange={(e) => setPoints(rule.key, Number(e.target.value) || 0)}
                />
                <span className="text-[11px] c-dim2 font-bold">pts</span>
              </div>
            );
          })}
        </div>
        <label className="flex items-center gap-2 text-xs c-dim mt-4 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 accent-[#D4AF37]"
            checked={auto}
            onChange={(e) => setAuto(e.target.checked)}
          />
          Auto-upgrade tier when points threshold is reached
        </label>
        <div className="flex gap-3 mt-5">
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm"
            onClick={() => {
              setDraft(RULE_DEFAULTS);
              onReset();
            }}
          >
            Reset Defaults
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
          >
            <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Save Rules
          </button>
        </div>
      </div>
    </div>
  );
};

export default EarningRulesModal;
