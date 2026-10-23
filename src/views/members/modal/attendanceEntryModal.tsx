import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import Modal from "../../../components/common/Modal";
import CommonSelect from "../../../components/common-select/commonSelect";
import CommonDatePicker from "../../../components/common-date-picker/commonDatePicker";
import type { AttendanceRecord, AttendanceStatus } from "../../../types/attendance";
import {
  ATTENDANCE_STATUS_OPTIONS,
  PLAN_OPTIONS,
  TRAINER_OPTIONS,
} from "../../../utils/json/attendanceData";
import type { EntryFormInput } from "../useAttendance";

/*
   Add / Edit Attendance Entry — ported from #modal-entry in
   tailwind/src/attendance.html and openEntry()/saveEntry() in
   assets/js/attendance.js.

   One modal serves both modes; the title and submit label switch, and the
   fields seed from the record being edited. Seeded on mount, so the page
   keys this component by record id.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

const TRAINER_FIELD_OPTIONS = [{ value: "—", label: "Unassigned" }, ...toOptions(TRAINER_OPTIONS)];

/** "2026-07-13" <-> Date. */
const toDate = (value: string): Date | null => {
  const parsed = new Date(value + "T00:00:00");
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};
const toIsoDate = (date: Date | null): string =>
  date ? date.toISOString().slice(0, 10) : "";

/* The template ships the date field pre-filled with this value on add. */
const DEFAULT_DATE = new Date(2026, 6, 13);

type AttendanceEntryModalProps = {
  open: boolean;
  /** The record being edited, or null when adding. */
  record: AttendanceRecord | null;
  onClose: () => void;
  onSave: (input: EntryFormInput) => void;
};

const AttendanceEntryModal = ({
  open,
  record,
  onClose,
  onSave,
}: AttendanceEntryModalProps) => {
  const [name, setName] = useState(record?.name ?? "");
  const [memberId, setMemberId] = useState(record?.id ?? "");
  const [plan, setPlan] = useState(record?.plan ?? "Monthly Standard");
  const [trainer, setTrainer] = useState(record?.trainer ?? "—");
  const [date, setDate] = useState<Date | null>(
    record ? toDate(record.date) : DEFAULT_DATE,
  );
  const [checkInHH, setCheckInHH] = useState(record?.inHH ?? "");
  const [checkOutHH, setCheckOutHH] = useState(record?.outHH ?? "");
  const [status, setStatus] = useState<AttendanceStatus>(record?.status ?? "Present");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    // saveEntry() silently no-oped on a blank name.
    if (!trimmed) return;
    onSave({
      id: record?.id ?? null,
      name: trimmed,
      memberId,
      plan,
      trainer,
      date: toIsoDate(date),
      checkInHH,
      checkOutHH,
      status,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={record ? "Edit Attendance Entry" : "Add Attendance Entry"}
      boxClassName="glass"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Member Name</label>
            <input
              type="text"
              className="fp-input py-2 text-sm"
              placeholder="e.g. Ashley Bennett"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Member ID</label>
            <input
              type="text"
              className="fp-input py-2 text-sm"
              placeholder="A-1011"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Plan</label>
            <CommonSelect
              fieldClassName="py-2 text-sm"
              ariaLabel="Plan"
              options={toOptions(PLAN_OPTIONS)}
              value={plan}
              onChange={(option) =>
                setPlan((option?.value as AttendanceRecord["plan"]) ?? "Monthly Standard")
              }
            />
          </div>
          <div>
            <label className="field-label">Trainer</label>
            <CommonSelect
              fieldClassName="py-2 text-sm"
              ariaLabel="Trainer"
              options={TRAINER_FIELD_OPTIONS}
              value={trainer}
              onChange={(option) => setTrainer(option?.value ?? "—")}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="field-label">Date</label>
            <CommonDatePicker
              className="py-2 text-sm"
              dateFormat="d M, yy"
              ariaLabel="Date"
              value={date}
              onChange={(e) => setDate((e.value as Date) ?? null)}
            />
          </div>
          <div>
            <label className="field-label">Check-In</label>
            <input
              type="time"
              className="fp-input py-2 text-sm"
              value={checkInHH}
              onChange={(e) => setCheckInHH(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Check-Out</label>
            <input
              type="time"
              className="fp-input py-2 text-sm"
              value={checkOutHH}
              onChange={(e) => setCheckOutHH(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="field-label">Status</label>
          <CommonSelect
            fieldClassName="py-2 text-sm"
            ariaLabel="Status"
            options={toOptions(ATTENDANCE_STATUS_OPTIONS)}
            value={status}
            onChange={(option) => setStatus((option?.value as AttendanceStatus) ?? "Present")}
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
            <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            <span>{record ? "Update Entry" : "Save Entry"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AttendanceEntryModal;
