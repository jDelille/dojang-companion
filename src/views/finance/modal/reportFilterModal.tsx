import { useState } from "react";
import { X } from "lucide-react";
import type { ReportSort } from "../../../types/reports";
import { REPORT_CATS, REPORT_FORMATS } from "../../../utils/json/reportsData";
import CommonSelect from "../../../components/common-select/commonSelect";

/*
   Filter Reports — ported from #modal-filter in tailwind/src/reports.html and
   openFilter()/applyFilter()/resetFilter() in assets/js/reports.js.

   Remounted by the page on each open so the selects reseed from live state.
*/

const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

const SORT_OPTIONS: { value: ReportSort; label: string }[] = [
  { value: "recent", label: "recent" },
  { value: "name", label: "name" },
  { value: "category", label: "category" },
];

type ReportFilterModalProps = {
  open: boolean;
  cat: string;
  fmt: string;
  sort: ReportSort;
  onClose: () => void;
  onApply: (cat: string, fmt: string, sort: ReportSort) => void;
  onReset: () => void;
};

const ReportFilterModal = ({
  open,
  cat,
  fmt,
  sort,
  onClose,
  onApply,
  onReset,
}: ReportFilterModalProps) => {
  const [nextCat, setNextCat] = useState(cat);
  const [nextFmt, setNextFmt] = useState(fmt);
  const [nextSort, setNextSort] = useState<ReportSort>(sort);

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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black c-text">Filter Reports</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="f-label">Category</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Category"
              options={toOptions(["All", ...REPORT_CATS])}
              value={nextCat}
              onChange={(option) => setNextCat(option?.value ?? "All")}
            />
          </div>
          <div>
            <label className="f-label">Format</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Format"
              options={toOptions(["All", ...REPORT_FORMATS])}
              value={nextFmt}
              onChange={(option) => setNextFmt(option?.value ?? "All")}
            />
          </div>
        </div>
        <div>
          <label className="f-label">Sort by</label>
          <CommonSelect
            fieldClassName="py-2.5 text-sm"
            ariaLabel="Sort by"
            options={SORT_OPTIONS}
            value={nextSort}
            onChange={(option) => setNextSort((option?.value as ReportSort) ?? "recent")}
          />
        </div>
        <div className="flex gap-3 mt-5">
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm"
            onClick={() => {
              onReset();
              onClose();
            }}
          >
            Reset
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm"
            onClick={() => {
              onApply(nextCat, nextFmt, nextSort);
              onClose();
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportFilterModal;
