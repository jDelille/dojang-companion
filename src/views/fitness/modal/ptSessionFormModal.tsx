import { useState } from "react";
import { Check, X } from "lucide-react";
import type { PtSession, PtSessionFormValues } from "../../../types/ptSessions";
import {
  DURATIONS,
  FEE_BY_DUR,
  FOCUS,
  PT_MEMBERS,
  PT_TRAINERS,
} from "../../../utils/json/ptSessionsData";
import CommonSelect, { type Option } from "../../../components/common-select/commonSelect";
import { moneyWhole } from "../../../utils/formatUtils";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Book / Edit PT Session — ported from #modal-session-form in
   tailwind/src/pt-sessions.html and openForm()/syncFormTimes()/updateFee()/
   submitForm() in assets/js/pt-sessions.js.

   Changing the trainer re-derives the open time slots, and the fee follows the
   selected duration — both were manual DOM writes in the template.
*/

const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

const TRAINER_OPTIONS = PT_TRAINERS.map((t) => ({ value: String(t.id), label: t.name }));

type PtSessionFormModalProps = {
  open: boolean;
  target: PtSession | null;
  /** Trainer preselected when booking straight from the availability grid. */
  presetTrainer: number;
  /** Slot preselected when booking straight from the availability grid. */
  presetSlot: number | null;
  /** Open slots for a trainer, keeping `includeSlot` even when occupied. */
  slotOptions: (trainerId: number, exceptId?: number, includeSlot?: number) => Option[];
  onClose: () => void;
  onSubmit: (values: PtSessionFormValues, editId: number | null) => boolean;
};

const PtSessionFormModal = ({
  open,
  target,
  presetTrainer,
  presetSlot,
  slotOptions,
  onClose,
  onSubmit,
}: PtSessionFormModalProps) => {
  const [member, setMember] = useState(target?.member ?? PT_MEMBERS[0]);
  const [trainerId, setTrainerId] = useState(
    String(target?.trainerId ?? presetTrainer),
  );
  const [slot, setSlot] = useState(
    target ? String(target.slot) : presetSlot != null ? String(presetSlot) : "",
  );
  const [focus, setFocus] = useState(target?.focus ?? FOCUS[0]);
  const [duration, setDuration] = useState(target?.duration ?? DURATIONS[0]);

  const times = slotOptions(Number(trainerId), target?.id, target?.slot);
  /* Keep a valid selection when switching trainers changes the open set. */
  const slotValue = times.some((option) => option.value === slot)
    ? slot
    : (times[0]?.value ?? "");

  const submit = () => {
    const accepted = onSubmit(
      {
        member,
        trainerId: Number(trainerId),
        slot: slotValue === "" ? -1 : Number(slotValue),
        focus,
        duration,
      },
      target?.id ?? null,
    );
    if (accepted) onClose();
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
      <div className="modal-box glass">
        <div className="flex items-center justify-between mb-5">
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">
              {target ? "Edit PT Session" : "Book PT Session"}
            </h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div>
            <label className="f-label">Member</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Member"
              options={toOptions(PT_MEMBERS)}
              value={member}
              onChange={(option) => setMember(option?.value ?? PT_MEMBERS[0])}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label">Trainer</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Trainer"
                options={TRAINER_OPTIONS}
                value={trainerId}
                onChange={(option) => setTrainerId(option?.value ?? "0")}
              />
            </div>
            <div>
              <label className="f-label">Time</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Time"
                options={times}
                value={slotValue}
                onChange={(option) => setSlot(option?.value ?? "")}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label">Focus</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Focus"
                options={toOptions(FOCUS)}
                value={focus}
                onChange={(option) => setFocus(option?.value ?? FOCUS[0])}
              />
            </div>
            <div>
              <label className="f-label">Duration</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Duration"
                options={toOptions(DURATIONS)}
                value={duration}
                onChange={(option) => setDuration(option?.value ?? DURATIONS[0])}
              />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-card2">
            <span className="text-[13px] c-dim">Session fee</span>
            <span className="text-base font-black gt">
              {moneyWhole(FEE_BY_DUR[duration] ?? 50)}
            </span>
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
              {target ? "Save Changes" : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PtSessionFormModal;
