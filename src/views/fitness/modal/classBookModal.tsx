import { useState } from "react";
import { CircleCheck, UserPlus, X } from "lucide-react";
import type { GymClass } from "../../../types/classes";
import {
  BOOK_MEMBERS,
  BOOK_PAYMENTS,
  TIMETABLE_DAYS,
} from "../../../utils/json/classesData";
import CommonSelect from "../../../components/common-select/commonSelect";

/*
   Book Members — ported from #modal-book in tailwind/src/classes.html and
   openBook()/updateAvail()/confirmBook() in assets/js/classes.js.

   The availability line recomputes on every render, replacing updateAvail()'s
   manual innerHTML write.
*/

const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

type ClassBookModalProps = {
  target: GymClass | null;
  onClose: () => void;
  onConfirm: (id: number, seats: number) => void;
};

const ClassBookModal = ({ target, onClose, onConfirm }: ClassBookModalProps) => {
  const open = target !== null;
  const [member, setMember] = useState(BOOK_MEMBERS[0]);
  const [seats, setSeats] = useState("1");
  const [payment, setPayment] = useState(BOOK_PAYMENTS[0]);

  const left = target ? Math.max(0, target.cap - target.booked) : 0;

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
      <div className="modal-box glass modal-w-420">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="icon-box grad-gold ic-38">
              <UserPlus className="w-[17px] h-[17px] t-ink shrink-0" aria-hidden="true" />
            </div>
            <h3 className="text-base font-black c-text">Book Members</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="p-3 rounded-xl mb-4 text-[13px] c-gold ctx-box">
          {target
            ? `${target.name} · ${TIMETABLE_DAYS[target.day].dow} ${target.time}`
            : "—"}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="f-label">Member</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Member"
              options={toOptions(BOOK_MEMBERS)}
              value={member}
              onChange={(option) => setMember(option?.value ?? BOOK_MEMBERS[0])}
            />
          </div>
          <div>
            <label className="f-label">Seats</label>
            <input
              type="number"
              min="1"
              className="fp-input py-2.5 text-sm"
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Payment</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Payment"
              options={toOptions(BOOK_PAYMENTS)}
              value={payment}
              onChange={(option) => setPayment(option?.value ?? BOOK_PAYMENTS[0])}
            />
          </div>
        </div>
        <div className="text-[11px] mt-3 c-dim">
          Available:{" "}
          <b className={left ? "c-green" : "c-red"}>
            {left} seat{left === 1 ? "" : "s"}
          </b>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => {
              if (!target) return;
              onConfirm(target.id, Number(seats) || 1);
              onClose();
            }}
          >
            <CircleCheck className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassBookModal;
