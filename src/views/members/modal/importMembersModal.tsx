import { useRef, useState, type DragEvent } from "react";
import { Download, Upload, UploadCloud } from "lucide-react";
import Modal from "../../../components/common/Modal";

/*
   Import Members — ported from #modal-import in tailwind/src/members.html and
   initImport()/confirmImport() in assets/js/members.js.

   The template wired dragover/dragleave/drop by hand and assigned
   dataTransfer.files onto the input; here React state holds the file name and
   the input is only read, so no DOM assignment is needed.
*/

type ImportMembersModalProps = {
  open: boolean;
  onClose: () => void;
  /** Receives the chosen file name, or "" when nothing was selected. */
  onImport: (fileName: string) => void;
  onDownloadTemplate: () => void;
};

const ImportMembersModal = ({
  open,
  onClose,
  onImport,
  onDownloadTemplate,
}: ImportMembersModalProps) => {
  const [fileName, setFileName] = useState("");
  const [dragover, setDragover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragover(false);
    const file = event.dataTransfer.files[0];
    if (file) setFileName(file.name);
  };

  const confirm = () => {
    onImport(fileName);
    setFileName("");
    if (inputRef.current) inputRef.current.value = "";
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Import Members" closeClassName="modal-x">
      <label
        className={dragover ? "dropzone dragover" : "dropzone"}
        onDragOver={(e) => {
          e.preventDefault();
          setDragover(true);
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragover(true);
        }}
        onDragLeave={() => setDragover(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
        />
        <UploadCloud className="w-8 h-8 c-gold mx-auto mb-2 shrink-0" aria-hidden="true" />
        <div className="text-sm font-bold c-text">Drop a CSV / Excel file here</div>
        <div className="text-xs c-dim mt-1">
          or click to browse — First Name, Last Name, Phone, Email, Plan, Trainer
        </div>
        <div className="text-xs c-gold mt-2 font-semibold">{fileName}</div>
      </label>
      <div className="flex items-center gap-2 text-[11px] c-dim mt-3">
        <Download className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
        <button
          type="button"
          className="underline hover:c-gold"
          onClick={onDownloadTemplate}
        >
          Download sample template
        </button>
      </div>
      <div className="flex gap-3 mt-5">
        <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
          onClick={confirm}
        >
          <Upload className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Import File
        </button>
      </div>
    </Modal>
  );
};

export default ImportMembersModal;
