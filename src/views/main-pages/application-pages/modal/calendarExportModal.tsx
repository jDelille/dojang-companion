import { useState } from "react";
import { Check, Download, X } from "lucide-react";
import type { ExportFormat, ExportScope } from "../../../../types/calendarApp";
import { FORMATS, MONTHS, TODAY } from "../../../../utils/json/calendarAppData";
import { FORMAT_ICON } from "../calendarAppIcons";
import CommonSelect from "../../../../components/common-select/commonSelect";

/*
   Export Calendar — ported from #modal-export in tailwind/src/calendar-app.html
   and openExport()/pickFormat()/exportSummary()/confirmExport() in
   assets/js/calendar-app.js.
*/

type CalendarExportModalProps = {
  open: boolean;
  dayCount: number;
  monthCount: number;
  filteredCount: number;
  allCount: number;
  cursorM: number;
  cursorY: number;
  onClose: () => void;
  onConfirm: (format: ExportFormat, scope: ExportScope) => void;
};

const CalendarExportModal = ({
  open,
  dayCount,
  monthCount,
  filteredCount,
  allCount,
  cursorM,
  cursorY,
  onClose,
  onConfirm,
}: CalendarExportModalProps) => {
  const [format, setFormat] = useState<ExportFormat>("ics");
  const [scope, setScope] = useState<ExportScope>("month");

  const scopeOptions = [
    { value: "day", label: "Selected day (" + dayCount + ")" },
    { value: "month", label: MONTHS[cursorM] + " " + cursorY + " (" + monthCount + ")" },
    { value: "filtered", label: "All matching filters (" + filteredCount + ")" },
    { value: "all", label: "Everything (" + allCount + ")" },
  ];

  const rows =
    scope === "day" ? dayCount : scope === "month" ? monthCount : scope === "all" ? allCount : filteredCount;
  const f = FORMATS.find((x) => x.id === format);
  const summary =
    rows +
    " event" +
    (rows === 1 ? "" : "s") +
    " · " +
    (f?.label ?? "") +
    (format === "print" ? " · opens your print dialog" : " · calendar-" + TODAY + "." + format);

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
          <h3 className="text-base font-black c-text">Export Calendar</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="mb-4">
          <span className="f-label">Format</span>
          <div className="space-y-2" role="radiogroup" aria-label="Export format">
            {FORMATS.map((fm) => {
              const Icon = FORMAT_ICON[fm.id];
              const on = fm.id === format;
              return (
                <button
                  key={fm.id}
                  type="button"
                  className={on ? "opt-card sel" : "opt-card"}
                  role="radio"
                  aria-checked={on}
                  onClick={() => setFormat(fm.id)}
                >
                  <span className={`opt-ic ${fm.tint}`}>
                    <Icon className={`w-[15px] h-[15px] ${fm.col} shrink-0`} aria-hidden="true" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[13px] font-bold c-text">{fm.label}</span>
                    <span className="block text-[11px] c-dim">{fm.hint}</span>
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
            Range
          </label>
          <CommonSelect
            fieldClassName="py-2.5 text-sm"
            ariaLabel="Range"
            options={scopeOptions}
            value={scope}
            onChange={(o) => setScope((o?.value as ExportScope) ?? "month")}
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
            onClick={() => onConfirm(format, scope)}
          >
            <Download className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarExportModal;
