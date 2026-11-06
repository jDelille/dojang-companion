import { useState } from "react";
import { Check, Download, X } from "lucide-react";
import {
  EX_FORMATS,
  SECTIONS,
  SECTION_LABEL,
  TODAY,
} from "../../../utils/json/settingsData";
import { SETTINGS_ICON, SETTINGS_ICON_FALLBACK } from "../settingsIcons";
import CommonSelect from "../../../components/common-select/commonSelect";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Export Settings — ported from #modal-export in tailwind/src/settings.html and
   openExport()/confirmExport() in assets/js/settings.js. The scope <select> lives
   inside the modal, so it becomes CommonSelect.
*/

const SCOPE_OPTIONS = [{ value: "all", label: "All sections" }].concat(
  SECTIONS.map((s) => ({ value: s, label: SECTION_LABEL[s] + " only" })),
);

type SettingsExportModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (format: string) => void;
};

const SettingsExportModal = ({ open, onClose, onConfirm }: SettingsExportModalProps) => {
  const [format, setFormat] = useState("json");
  const [scope, setScope] = useState("all");
  const [secrets, setSecrets] = useState(false);

  const sectionCount = scope === "all" ? SECTIONS.length : 1;
  const f = EX_FORMATS.find((x) => x.id === format);
  const summary =
    sectionCount +
    " section" +
    (sectionCount === 1 ? "" : "s") +
    " · " +
    (f?.label ?? "") +
    " · fitpro-settings-" +
    TODAY +
    "." +
    format +
    (secrets ? " · includes secrets" : " · secrets redacted");

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
            <h3 className="text-base font-black c-text">Export Settings</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="mb-4">
          <span className="f-label">Format</span>
          <div className="space-y-2" role="radiogroup" aria-label="Export format">
            {EX_FORMATS.map((o) => {
              const Icon = SETTINGS_ICON[o.ic] ?? SETTINGS_ICON_FALLBACK;
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
            Sections
          </label>
          <CommonSelect
            fieldClassName="py-2.5 text-sm"
            ariaLabel="Sections"
            options={SCOPE_OPTIONS}
            value={scope}
            onChange={(o) => setScope(o?.value ?? "all")}
          />
        </div>
        <label className="flex items-center gap-2.5 text-[13px] c-text2 cursor-pointer mb-4">
          <input
            type="checkbox"
            id="ex-secrets"
            className="cbx"
            checked={secrets}
            onChange={(e) => setSecrets(e.target.checked)}
          />
          Include secrets (API keys, SMTP username)
        </label>
        <div className="ctx-box mb-5">{summary}</div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => {
              onConfirm(format);
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

export default SettingsExportModal;
