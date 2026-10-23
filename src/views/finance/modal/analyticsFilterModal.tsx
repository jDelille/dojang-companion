import { useState } from "react";
import { X } from "lucide-react";
import { AN_SEGMENTS, RINGS } from "../../../utils/json/analyticsData";
import CommonSelect from "../../../components/common-select/commonSelect";

/*
   Filter Analytics — ported from #modal-filter in tailwind/src/analytics.html
   and openFilter()/applyFilter() in assets/js/analytics.js. All metrics start
   checked, matching the template's markup.
*/

const SEGMENT_OPTIONS = AN_SEGMENTS.map((value) => ({ value, label: value }));

type AnalyticsFilterModalProps = {
  open: boolean;
  onClose: () => void;
  onApply: (metricCount: number, segment: string) => void;
};

const AnalyticsFilterModal = ({ open, onClose, onApply }: AnalyticsFilterModalProps) => {
  const [checked, setChecked] = useState<boolean[]>(RINGS.map(() => true));
  const [segment, setSegment] = useState(AN_SEGMENTS[0]);

  const toggle = (index: number) =>
    setChecked((prev) => prev.map((on, i) => (i === index ? !on : on)));

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
          <h3 className="text-base font-black c-text">Filter Analytics</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <label className="f-label">Metrics</label>
        <div className="ctx-box mb-4">
          {RINGS.map((ring, index) => (
            <label
              key={ring.label}
              className="flex items-center gap-2 text-sm c-text2 py-1 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={checked[index]}
                onChange={() => toggle(index)}
                style={{ accentColor: "#D4AF37", width: "15px", height: "15px" }}
              />
              {ring.label}
            </label>
          ))}
        </div>
        <label className="f-label">Member segment</label>
        <CommonSelect
          fieldClassName="py-2.5 text-sm"
          ariaLabel="Member segment"
          options={SEGMENT_OPTIONS}
          value={segment}
          onChange={(option) => setSegment(option?.value ?? AN_SEGMENTS[0])}
        />
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm"
            onClick={() => {
              onApply(checked.filter(Boolean).length, segment);
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

export default AnalyticsFilterModal;
