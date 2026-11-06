import { useState } from "react";
import { AlertCircle, Check, CheckCircle2, Upload, X } from "lucide-react";
import type { SettingsModel } from "../../../types/settings";
import {
  IMPORT_MODES,
  SECTIONS,
  SECTION_LABEL,
} from "../../../utils/json/settingsData";
import { SETTINGS_ICON, SETTINGS_ICON_FALLBACK } from "../settingsIcons";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Import Settings — ported from #modal-import in tailwind/src/settings.html and
   openImport()/parseImport()/confirmImport() in assets/js/settings.js.
*/

type ParseResult = { parsed: Record<string, unknown>; known: string[] };

type SettingsImportModalProps = {
  open: boolean;
  draft: SettingsModel;
  onClose: () => void;
  onConfirm: (parsed: Record<string, unknown>, mode: "merge" | "replace", known: number) => void;
};

const SettingsImportModal = ({ open, draft, onClose, onConfirm }: SettingsImportModalProps) => {
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [json, setJson] = useState("");
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const parse = (): ParseResult | null => {
    const raw = json.trim();
    if (!raw) {
      setErr("Paste a configuration JSON first");
      setOkMsg("");
      return null;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      setErr("Invalid JSON — " + (e as Error).message);
      setOkMsg("");
      return null;
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      setErr("Expected a JSON object of settings sections");
      setOkMsg("");
      return null;
    }
    const known = Object.keys(parsed as object).filter((k) => (SECTIONS as string[]).indexOf(k) >= 0);
    if (!known.length) {
      setErr("No recognised sections found (expected " + SECTIONS.slice(0, 3).join(", ") + "…)");
      setOkMsg("");
      return null;
    }
    setErr("");
    return { parsed: parsed as Record<string, unknown>, known };
  };

  const validate = () => {
    const r = parse();
    if (!r) return;
    setOkMsg(
      "Valid · " +
        r.known.length +
        " section" +
        (r.known.length === 1 ? "" : "s") +
        " recognised (" +
        r.known.map((k) => SECTION_LABEL[k as keyof typeof SECTION_LABEL]).join(", ") +
        ")",
    );
  };

  const pasteSample = () => {
    setJson(JSON.stringify(draft, null, 2));
    setErr("");
    setOkMsg("");
  };

  const submit = () => {
    const r = parse();
    if (!r) return;
    onConfirm(r.parsed, mode, r.known.length);
    onClose();
  };

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
      <div className="modal-box glass modal-w-520">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Import Settings</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="mb-4">
          <span className="f-label">Mode</span>
          <div className="space-y-2" role="radiogroup" aria-label="Import mode">
            {IMPORT_MODES.map((o) => {
              const Icon = SETTINGS_ICON[o.ic] ?? SETTINGS_ICON_FALLBACK;
              const sel = o.id === mode;
              return (
                <button
                  key={o.id}
                  type="button"
                  className={`opt-card${sel ? " sel" : ""}`}
                  role="radio"
                  aria-checked={sel}
                  onClick={() => setMode(o.id as "merge" | "replace")}
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
          <label className="f-label" htmlFor="im-json">
            Configuration JSON
          </label>
          <textarea
            id="im-json"
            className="fp-input py-2.5 text-sm"
            rows={6}
            placeholder='{ "profile": { … }, "business": { … } }'
            spellCheck={false}
            value={json}
            onChange={(e) => setJson(e.target.value)}
          />
          <div className={`f-error${err ? " show" : ""}`}>
            <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
            <span>{err}</span>
          </div>
          <div className={`f-ok${okMsg ? " show" : ""}`}>
            <CheckCircle2 className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
            <span>{okMsg}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-5">
          <button type="button" className="btn-ghost px-3 py-1.5 text-xs" onClick={pasteSample}>
            Paste current settings
          </button>
          <button type="button" className="btn-ghost px-3 py-1.5 text-xs" onClick={validate}>
            Validate
          </button>
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={submit}
          >
            <Upload className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsImportModal;
