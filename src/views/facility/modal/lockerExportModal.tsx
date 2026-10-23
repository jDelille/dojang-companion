import { useState } from "react";
import { Check, Download, X } from "lucide-react";
import type { ExportFormat, Locker } from "../../../types/lockers";
import { TODAY } from "../../../utils/json/lockersData";
import CommonSelect from "../../../components/common-select/commonSelect";
import { EXPORT_FORMAT_ICON } from "../lockersIcons";

/*
   Export Lockers — ported from #modal-export in tailwind/src/lockers.html and
   openExport()/pickFormat()/exportSummary()/confirmExport() in
   assets/js/lockers.js. The scope select chooses which rows the parent exports.
*/

const FORMATS: {
  id: ExportFormat;
  ic: string;
  tint: string;
  col: string;
  label: string;
  hint: string;
}[] = [
  { id: "csv", ic: "file-spreadsheet", tint: "ic-green", col: "c-green", label: "CSV", hint: "Opens in Excel or Google Sheets" },
  { id: "json", ic: "file-json", tint: "ic-cyan", col: "c-cyan", label: "JSON", hint: "Structured data for integrations" },
  { id: "print", ic: "printer", tint: "ic-gold", col: "c-gold", label: "Print / PDF", hint: "Formatted sheet via your print dialog" },
];

type LockerExportModalProps = {
  open: boolean;
  selectedRows: Locker[];
  filteredRows: Locker[];
  allRows: Locker[];
  onClose: () => void;
  onConfirm: (format: ExportFormat, rows: Locker[]) => void;
};

const LockerExportModal = ({
  open,
  selectedRows,
  filteredRows,
  allRows,
  onClose,
  onConfirm,
}: LockerExportModalProps) => {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [scope, setScope] = useState<string>(selectedRows.length ? "selected" : "filtered");

  const scopes: { value: string; label: string }[] = [];
  if (selectedRows.length) scopes.push({ value: "selected", label: "Selected lockers (" + selectedRows.length + ")" });
  scopes.push({ value: "filtered", label: "Current filters (" + filteredRows.length + ")" });
  scopes.push({ value: "all", label: "All lockers (" + allRows.length + ")" });

  const rowsForScope = (s: string): Locker[] =>
    s === "selected" ? selectedRows : s === "all" ? allRows : filteredRows;

  const rows = rowsForScope(scope);
  const activeFormat = FORMATS.find((f) => f.id === format);
  const summary =
    rows.length +
    " locker" +
    (rows.length === 1 ? "" : "s") +
    " · " +
    (activeFormat?.label ?? "") +
    (format === "print" ? " · opens your print dialog" : " · lockers-" + TODAY + "." + format);

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
          <h3 id="ex-title" className="text-base font-black c-text">
            Export Lockers
          </h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="mb-4">
          <span className="f-label">Format</span>
          <div className="space-y-2" role="radiogroup" aria-label="Export format">
            {FORMATS.map((f) => {
              const on = f.id === format;
              const Icon = EXPORT_FORMAT_ICON[f.ic];
              return (
                <button
                  key={f.id}
                  type="button"
                  className={`opt-card${on ? " sel" : ""}`}
                  role="radio"
                  aria-checked={on}
                  onClick={() => setFormat(f.id)}
                >
                  <span className={`opt-ic ${f.tint}`}>
                    {Icon && (
                      <Icon className={`w-[15px] h-[15px] ${f.col} shrink-0`} aria-hidden="true" />
                    )}
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
            options={scopes}
            value={scope}
            onChange={(o) => setScope(o?.value ?? "filtered")}
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
              onConfirm(format, rows);
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

export default LockerExportModal;
