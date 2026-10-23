import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import CommonSelect from "../../../components/common-select/commonSelect";
import { EXPORT_FORMATS, EXPORT_SETS } from "../../../utils/json/rewardsData";

/*
   Export Data — ported from #modal-export in tailwind/src/rewards.html and
   confirmExport() in assets/js/rewards.js.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

type RewardExportModalProps = {
  open: boolean;
  onClose: () => void;
  /** Receives the dataset value ("rewards" | "redemptions" | "members"). */
  onExport: (dataset: string, format: string) => void;
};

const RewardExportModal = ({ open, onClose, onExport }: RewardExportModalProps) => {
  const [dataset, setDataset] = useState(EXPORT_SETS[0].value);
  const [format, setFormat] = useState(EXPORT_FORMATS[0]);

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
            <h3 className="text-base font-black c-text">Export Data</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="f-label">Dataset</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Dataset"
              options={EXPORT_SETS}
              value={dataset}
              onChange={(option) => setDataset(option?.value ?? EXPORT_SETS[0].value)}
            />
          </div>
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
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => {
              onExport(dataset, format);
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

export default RewardExportModal;
