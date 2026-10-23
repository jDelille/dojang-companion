import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import CommonSelect from "../../../components/common-select/commonSelect";
import { EXPORT_FORMATS } from "../../../utils/json/challengesData";

/*
   Export Leaderboard — ported from #modal-export in
   tailwind/src/challenges.html and confirmExport() in
   assets/js/challenges.js.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

const SCOPE_OPTIONS = [
  { value: "current", label: "Current challenge" },
  { value: "all", label: "All challenges" },
];

export type ChallengeExportScope = "current" | "all";

type ChallengeExportModalProps = {
  open: boolean;
  onClose: () => void;
  onExport: (format: string, scope: ChallengeExportScope) => void;
};

const ChallengeExportModal = ({ open, onClose, onExport }: ChallengeExportModalProps) => {
  const [format, setFormat] = useState(EXPORT_FORMATS[0]);
  const [scope, setScope] = useState<ChallengeExportScope>("current");

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
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="icon-box grad-gold ic-38">
              <Download className="w-[17px] h-[17px] t-ink shrink-0" aria-hidden="true" />
            </div>
            <h3 className="text-base font-black c-text">Export Leaderboard</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="f-label">Format</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Format"
              options={toOptions(EXPORT_FORMATS)}
              value={format}
              onChange={(option) => setFormat(option?.value ?? EXPORT_FORMATS[0])}
            />
          </div>
          <div>
            <label className="f-label">Scope</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Scope"
              options={SCOPE_OPTIONS}
              value={scope}
              onChange={(option) =>
                setScope((option?.value as ChallengeExportScope) ?? "current")
              }
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => {
              onExport(format, scope);
              onClose();
            }}
          >
            <Download className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeExportModal;
