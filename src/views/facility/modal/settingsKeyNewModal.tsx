import { useState } from "react";
import { AlertCircle, KeyRound, X } from "lucide-react";
import type { ApiKey } from "../../../types/settings";
import { KEY_EXPIRY, KEY_SCOPES } from "../../../utils/json/settingsData";
import CommonSelect from "../../../components/common-select/commonSelect";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Create API Key — ported from #modal-key-new in tailwind/src/settings.html and
   openKeyNew()/submitKey() in assets/js/settings.js. The expiry <select> lives
   inside the modal, so it becomes CommonSelect.
*/

type SettingsKeyNewModalProps = {
  open: boolean;
  existing: ApiKey[];
  onClose: () => void;
  onCreate: (name: string, scopes: string[], days: number) => void;
};

const SettingsKeyNewModal = ({ open, existing, onClose, onCreate }: SettingsKeyNewModalProps) => {
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>(["read"]);
  const [expiry, setExpiry] = useState("90");
  const [nameErr, setNameErr] = useState("");
  const [scopesErr, setScopesErr] = useState("");

  const toggleScope = (id: string, on: boolean) => {
    setScopes((prev) => (on ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((s) => s !== id)));
    setScopesErr("");
  };

  const submit = () => {
    let ok = true;
    const n = name.trim();
    if (!n) {
      setNameErr("Name this key so you can recognise it later");
      ok = false;
    } else if (n.length < 3) {
      setNameErr("Name is too short");
      ok = false;
    } else if (existing.some((k) => k.name.toLowerCase() === n.toLowerCase())) {
      setNameErr("A key with this name already exists");
      ok = false;
    } else setNameErr("");

    if (!scopes.length) {
      setScopesErr("Pick at least one permission");
      ok = false;
    } else setScopesErr("");

    if (!ok) return;
    onCreate(n, scopes, Number(expiry));
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
      <div className="modal-box glass modal-w-460">
        <div className="flex items-center justify-between mb-5">
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Create API Key</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <form
          className="space-y-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div>
            <label className="f-label" htmlFor="kn-name">
              Key name
            </label>
            <input
              type="text"
              id="kn-name"
              className="fp-input py-2.5 text-sm"
              placeholder="e.g. Website booking widget"
              autoComplete="off"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className={`f-error${nameErr ? " show" : ""}`}>
              <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
              <span>{nameErr}</span>
            </div>
          </div>
          <div>
            <span className="f-label">Permissions</span>
            <div className="space-y-2">
              {KEY_SCOPES.map((s) => {
                const on = scopes.includes(s.id);
                return (
                  <label key={s.id} className={`opt-card${on ? " sel" : ""}`}>
                    <input
                      type="checkbox"
                      className="cbx"
                      checked={on}
                      onChange={(e) => toggleScope(s.id, e.target.checked)}
                    />
                    <span className="flex-1">
                      <span className="block text-[13px] font-bold c-text">{s.label}</span>
                      <span className="block text-[11px] c-dim">{s.hint}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            <div className={`f-error${scopesErr ? " show" : ""}`}>
              <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
              <span>{scopesErr}</span>
            </div>
          </div>
          <div>
            <label className="f-label" htmlFor="kn-expiry">
              Expires
            </label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Expires"
              options={KEY_EXPIRY}
              value={expiry}
              onChange={(o) => setExpiry(o?.value ?? "90")}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              <KeyRound className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              Create Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsKeyNewModal;
