import { useState } from "react";
import { Check, Download, X } from "lucide-react";
import type { Announcement, ExportFormat, ExportScope } from "../../../types/announcements";
import { EX_FORMATS } from "../../../utils/json/announcementsData";
import { EX_FORMAT_ICON } from "../announcementsIcons";
import CommonSelect from "../../../components/common-select/commonSelect";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Export Announcements — ported from #modal-export in
   tailwind/src/announcements.html and openExport()/confirmExport() in
   assets/js/announcements.js. The scope <select> lives inside the modal, so it
   becomes CommonSelect. Actual file writing is represented by the toast.
*/

type AnnouncementExportModalProps = {
  open: boolean;
  onClose: () => void;
  filteredCount: number;
  activeCount: number;
  allCount: number;
  rowsFor: (scope: ExportScope) => Announcement[];
  onConfirm: (rows: Announcement[], format: ExportFormat) => void;
};

const AnnouncementExportModal = ({
  open,
  onClose,
  filteredCount,
  activeCount,
  allCount,
  rowsFor,
  onConfirm,
}: AnnouncementExportModalProps) => {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [scope, setScope] = useState<ExportScope>("filtered");

  const scopeOptions = [
    { value: "filtered", label: "Current filters (" + filteredCount + ")" },
    { value: "active", label: "Active only (" + activeCount + ")" },
    { value: "all", label: "All announcements (" + allCount + ")" },
  ];

  const rows = rowsFor(scope);
  const f = EX_FORMATS.find((x) => x.id === format);
  const summary =
    rows.length +
    " announcement" +
    (rows.length === 1 ? "" : "s") +
    " · " +
    (f?.label ?? "") +
    (format === "print"
      ? " · opens your print dialog"
      : " · announcements-2026-07-14." + format);

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
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Export Announcements</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="mb-4">
          <span className="f-label">Format</span>
          <div className="space-y-2" role="radiogroup" aria-label="Export format">
            {EX_FORMATS.map((o) => {
              const Icon = EX_FORMAT_ICON[o.id];
              const sel = o.id === format;
              return (
                <button
                  key={o.id}
                  type="button"
                  className={`opt-card${sel ? " sel" : ""}`}
                  role="radio"
                  aria-checked={sel}
                  onClick={() => setFormat(o.id)}
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
        <div className="mb-4">
          <label className="f-label" htmlFor="ex-scope">
            Rows
          </label>
          <CommonSelect
            fieldClassName="py-2.5 text-sm"
            ariaLabel="Rows"
            options={scopeOptions}
            value={scope}
            onChange={(option) => setScope((option?.value as ExportScope) ?? "filtered")}
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
              onConfirm(rows, format);
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

export default AnnouncementExportModal;
