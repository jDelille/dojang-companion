import { useState } from "react";
import { Download } from "lucide-react";
import Modal from "../../../components/common/Modal";
import CommonSelect from "../../../components/common-select/commonSelect";

/*
   Export Members — ported from #modal-export in tailwind/src/members.html and
   confirmExport() in assets/js/members.js.

   The format cards are a radio group (`.active` marks the choice); scope
   decides whether the count covers every member or the filtered subset.
*/

const FORMATS = ["CSV", "Excel", "PDF"];

const SCOPE_OPTIONS = [
  { value: "filtered", label: "Current filtered results" },
  { value: "all", label: "All members" },
];

export type ExportScope = "filtered" | "all";

type ExportMembersModalProps = {
  open: boolean;
  onClose: () => void;
  onExport: (format: string, scope: ExportScope) => void;
};

const ExportMembersModal = ({ open, onClose, onExport }: ExportMembersModalProps) => {
  const [format, setFormat] = useState("CSV");
  const [scope, setScope] = useState<ExportScope>("filtered");
  const [headers, setHeaders] = useState(true);

  return (
    <Modal open={open} onClose={onClose} title="Export Members" closeClassName="modal-x">
      <div className="mb-4">
        <label className="f-label">Format</label>
        <div className="grid grid-cols-3 gap-2">
          {FORMATS.map((name) => (
            <div
              key={name}
              className={name === format ? "radio-card active" : "radio-card"}
              onClick={() => setFormat(name)}
            >
              <span className="rc-dot" />
              {name}
            </div>
          ))}
        </div>
      </div>
      <div className="mb-2">
        <label className="f-label">Scope</label>
        <CommonSelect
          ariaLabel="Export scope"
          options={SCOPE_OPTIONS}
          value={scope}
          onChange={(option) => setScope((option?.value as ExportScope) ?? "filtered")}
        />
      </div>
      <label className="flex items-center gap-2 text-xs c-dim mt-3 cursor-pointer">
        <input
          type="checkbox"
          className="accent-[#D4AF37]"
          checked={headers}
          onChange={(e) => setHeaders(e.target.checked)}
        />{" "}
        Include column headers
      </label>
      <div className="flex gap-3 mt-5">
        <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
          onClick={() => {
            onExport(format, scope);
            onClose();
          }}
        >
          <Download className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Download
        </button>
      </div>
    </Modal>
  );
};

export default ExportMembersModal;
