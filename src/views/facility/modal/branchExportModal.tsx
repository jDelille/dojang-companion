import { useState } from "react";
import { Check, Download, X } from "lucide-react";
import type { BranchExportFormat, BranchExportScope } from "../../../types/branches";
import { BRANCH_TODAY, FORMATS } from "../../../utils/json/branchesData";
import { BRANCH_FORMAT_ICON } from "../branchIcons";
import CommonSelect from "../../../components/common-select/commonSelect";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Export Branches — ported from #modal-export in tailwind/src/branches.html and
   openExport()/pickFormat()/exportSummary()/confirmExport() in
   assets/js/branches.js. Format choices are custom radio option cards; the row
   scope stays a select. The actual download happens in the hook.
*/

type BranchExportModalProps = {
  open: boolean;
  filteredCount: number;
  totalCount: number;
  onClose: () => void;
  onConfirm: (format: BranchExportFormat, scope: BranchExportScope) => void;
};

const BranchExportModal = ({
  open,
  filteredCount,
  totalCount,
  onClose,
  onConfirm,
}: BranchExportModalProps) => {
  const [format, setFormat] = useState<BranchExportFormat>("csv");
  const [scope, setScope] = useState<BranchExportScope>("filtered");

  const rowCount = scope === "all" ? totalCount : filteredCount;
  const card = FORMATS.find((f) => f.id === format);
  const summary =
    rowCount +
    " branch" +
    (rowCount === 1 ? "" : "es") +
    " · " +
    (card?.label ?? "") +
    (format === "print"
      ? " · opens your print dialog"
      : " · branches-" + BRANCH_TODAY + "." + format);

  const scopeOptions = [
    { value: "filtered", label: "Current filters (" + filteredCount + ")" },
    { value: "all", label: "All branches (" + totalCount + ")" },
  ];

  return (
    <div
      className={open ? "modal-overlay open" : "modal-overlay"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ex-title"
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-420">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 id="ex-title" className="text-base font-black c-text">
              Export Branches
            </h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="mb-4">
          <span className="f-label">Format</span>
          <div className="space-y-2" role="radiogroup" aria-label="Export format">
            {FORMATS.map((f) => {
              const on = f.id === format;
              const Icon = BRANCH_FORMAT_ICON[f.id];
              return (
                <button
                  key={f.id}
                  type="button"
                  className={on ? "opt-card sel" : "opt-card"}
                  role="radio"
                  aria-checked={on}
                  onClick={() => setFormat(f.id)}
                >
                  <span className={`opt-ic ${f.tint}`}>
                    <Icon className={`w-[15px] h-[15px] ${f.col} shrink-0`} aria-hidden="true" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[13px] font-bold c-text">{f.label}</span>
                    <span className="block text-[11px] c-dim">{f.hint}</span>
                  </span>
                  <Check
                    className={`w-[15px] h-[15px] c-gold shrink-0${on ? "" : " opacity-0"}`}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        </div>
        <div className="mb-4">
          <label className="f-label" htmlFor="ex-scope">
            Rows
          </label>
          <CommonSelect
            fieldClassName="py-2.5 text-sm"
            ariaLabel="Rows"
            options={scopeOptions}
            value={scope}
            onChange={(option) => setScope((option?.value as BranchExportScope) ?? "filtered")}
          />
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
              onConfirm(format, scope);
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

export default BranchExportModal;
