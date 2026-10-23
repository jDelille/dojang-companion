import { useState } from "react";
import { Download } from "lucide-react";
import Modal from "../../../components/common/Modal";

const REPORTS = [
  "Daily Summary Report",
  "Monthly Revenue Report",
  "Member Expiry Report",
  "Trainer Performance",
];

type ExportReportModalProps = {
  open: boolean;
  onClose: () => void;
  onDownload: () => void;
};

/* Ported from #modal-quick-report in tailwind/src/index.html. */
const ExportReportModal = ({ open, onClose, onDownload }: ExportReportModalProps) => {
  const [selected, setSelected] = useState(0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Export Report"
      boxClassName=""
      closeClassName="modal-x"
      footer={
        <>
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onDownload}
          >
            <Download className="w-[13px] h-[13px]" aria-hidden="true" />
            Download PDF
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        {REPORTS.map((report, index) => (
          <label
            key={report}
            className={
              index === selected
                ? "radio-opt sel flex items-center gap-3 p-3 cursor-pointer"
                : "radio-opt flex items-center gap-3 p-3 cursor-pointer"
            }
          >
            <input
              type="radio"
              name="rpt"
              className="accent-yellow-500"
              checked={index === selected}
              onChange={() => setSelected(index)}
            />
            <span className="text-sm c-text2">{report}</span>
          </label>
        ))}
      </div>
    </Modal>
  );
};

export default ExportReportModal;
