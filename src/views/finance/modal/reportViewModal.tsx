import { Download, FileOutput, Printer, X } from "lucide-react";
import type { Report } from "../../../types/reports";
import { REPORT_CAT_META } from "../../../utils/json/reportsData";
import REPORT_CAT_ICON from "../reportIcons";

/*
   Report Preview — ported from #modal-view in tailwind/src/reports.html and
   openView() in assets/js/reports.js.

   The line-item table is static sample content in the template too, so it is
   reproduced verbatim rather than derived from the report.
*/

type ReportViewModalProps = {
  report: Report | null;
  onClose: () => void;
  onPrint: () => void;
  onExport: () => void;
  onDownload: () => void;
};

const ReportViewModal = ({
  report,
  onClose,
  onPrint,
  onExport,
  onDownload,
}: ReportViewModalProps) => {
  const open = report !== null;
  const meta = report ? REPORT_CAT_META[report.cat] : null;
  const Icon = report ? REPORT_CAT_ICON[report.cat] : null;

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
      <div className="modal-box glass modal-w-560">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black c-text">Report Preview</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="flex items-start gap-3 mb-4 p-3 rounded-xl tint-card2">
          <div className={`rep-ic ${meta?.cls ?? "ic-gold"}`}>
            {Icon && (
              <Icon
                className="w-[20px] h-[20px] shrink-0"
                style={{ color: meta?.color }}
                aria-hidden="true"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-black c-text">{report?.name ?? "Report"}</div>
            <span className="type-pill" style={meta?.pill}>
              {report?.cat ?? "Category"}
            </span>
            <p className="text-[12px] c-dim mt-1.5">{report?.desc ?? "—"}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4 text-center">
          <div className="ctx-box">
            <div className="f-label mb-1">Updated</div>
            <span className="c-text text-[13px] font-semibold">{report?.updated ?? "—"}</span>
          </div>
          <div className="ctx-box">
            <div className="f-label mb-1">Size</div>
            <span className="c-text text-[13px] font-semibold">{report?.size ?? "—"}</span>
          </div>
          <div className="ctx-box">
            <div className="f-label mb-1">Format</div>
            <span className="c-text text-[13px] font-semibold">{report?.fmt ?? "—"}</span>
          </div>
        </div>
        <div className="mb-5 pv-scroll">
          <table className="pv-table">
            <thead>
              <tr>
                <th>Line item</th>
                <th className="text-right">This period</th>
                <th className="text-right">Last period</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Revenue</td>
                <td className="text-right">$84,000</td>
                <td className="text-right">$80,000</td>
              </tr>
              <tr>
                <td>Cost of goods</td>
                <td className="text-right">$21,000</td>
                <td className="text-right">$19,500</td>
              </tr>
              <tr>
                <td>Operating expenses</td>
                <td className="text-right">$28,000</td>
                <td className="text-right">$26,500</td>
              </tr>
              <tr>
                <td>Net profit</td>
                <td className="text-right c-gold font-bold">$35,000</td>
                <td className="text-right">$34,000</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onPrint}
          >
            <Printer className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Print
          </button>
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onExport}
          >
            <FileOutput className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onDownload}
          >
            <Download className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportViewModal;
