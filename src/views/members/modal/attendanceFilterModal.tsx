import { useState } from "react";
import { Check } from "lucide-react";
import Modal from "../../../components/common/Modal";
import CommonSelect from "../../../components/common-select/commonSelect";
import {
  ATTENDANCE_STATUS_OPTIONS,
  PLAN_OPTIONS,
  TRAINER_OPTIONS,
} from "../../../utils/json/attendanceData";
import type { PlanFilter, StatusFilter, TrainerFilter } from "../useAttendance";

/*
   Advanced Filters — ported from #modal-filter in
   tailwind/src/attendance.html and openFilter()/applyFilter()/resetFilter()
   in assets/js/attendance.js.

   Applying writes into the toolbar's trainer/status selects as well as the
   plan filter, matching applyFilter()'s three assignments.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

const PLAN_FILTER_OPTIONS = [{ value: "All", label: "All Plans" }, ...toOptions(PLAN_OPTIONS)];
const TRAINER_FILTER_OPTIONS = [
  { value: "All", label: "All Trainers" },
  ...toOptions(TRAINER_OPTIONS),
];
const STATUS_FILTER_OPTIONS = [
  { value: "All", label: "All Status" },
  ...toOptions(ATTENDANCE_STATUS_OPTIONS),
];

type AttendanceFilterModalProps = {
  open: boolean;
  plan: PlanFilter;
  trainer: TrainerFilter;
  status: StatusFilter;
  onClose: () => void;
  onApply: (plan: PlanFilter, trainer: TrainerFilter, status: StatusFilter) => void;
  onReset: () => void;
};

const AttendanceFilterModal = ({
  open,
  plan,
  trainer,
  status,
  onClose,
  onApply,
  onReset,
}: AttendanceFilterModalProps) => {
  const [draftPlan, setDraftPlan] = useState<PlanFilter>(plan);
  const [draftTrainer, setDraftTrainer] = useState<TrainerFilter>(trainer);
  const [draftStatus, setDraftStatus] = useState<StatusFilter>(status);

  return (
    <Modal open={open} onClose={onClose} title="Advanced Filters" boxClassName="glass modal-w-420">
      <div className="space-y-4">
        <div>
          <label className="field-label">Plan</label>
          <CommonSelect
            fieldClassName="py-2 text-sm"
            ariaLabel="Plan"
            options={PLAN_FILTER_OPTIONS}
            value={draftPlan}
            onChange={(option) => setDraftPlan(option?.value ?? "All")}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Trainer</label>
            <CommonSelect
              fieldClassName="py-2 text-sm"
              ariaLabel="Trainer"
              options={TRAINER_FILTER_OPTIONS}
              value={draftTrainer}
              onChange={(option) => setDraftTrainer(option?.value ?? "All")}
            />
          </div>
          <div>
            <label className="field-label">Status</label>
            <CommonSelect
              fieldClassName="py-2 text-sm"
              ariaLabel="Status"
              options={STATUS_FILTER_OPTIONS}
              value={draftStatus}
              onChange={(option) =>
                setDraftStatus((option?.value as StatusFilter) ?? "All")
              }
            />
          </div>
        </div>
      </div>
      <div className="flex gap-3 mt-5">
        <button
          type="button"
          className="btn-ghost flex-1 py-2.5 text-sm"
          onClick={() => {
            setDraftPlan("All");
            setDraftTrainer("All");
            setDraftStatus("All");
            onReset();
          }}
        >
          Reset
        </button>
        <button
          type="button"
          className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
          onClick={() => {
            onApply(draftPlan, draftTrainer, draftStatus);
            onClose();
          }}
        >
          <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Apply Filters
        </button>
      </div>
    </Modal>
  );
};

export default AttendanceFilterModal;
