import { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import type { CalendarEvent, DeleteScope } from "../../../../types/calendarApp";
import { fmtDateShort } from "../../../../utils/json/calendarAppData";
import { DEL_SCOPE_ICON } from "../calendarAppIcons";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Delete Event — ported from #modal-delete in tailwind/src/calendar-app.html
   and openDelete()/pickDelScope()/confirmDelete() in assets/js/calendar-app.js.
*/

type CalendarDeleteModalProps = {
  event: CalendarEvent | null;
  series: CalendarEvent[];
  onClose: () => void;
  onConfirm: (id: number, scope: DeleteScope) => void;
};

const CalendarDeleteModal = ({ event, series, onClose, onConfirm }: CalendarDeleteModalProps) => {
  const open = event !== null;
  const [scope, setScope] = useState<DeleteScope>("one");

  const future = event ? series.filter((x) => x.date >= event.date).length : 0;
  const opts: { id: DeleteScope; label: string; hint: string }[] = event
    ? [
        { id: "one", label: "This event only", hint: "Removes just " + fmtDateShort(event.date) },
        {
          id: "future",
          label: "This and future events",
          hint: "Removes " + future + " upcoming occurrence" + (future === 1 ? "" : "s"),
        },
        { id: "all", label: "Entire series", hint: "Removes all " + series.length + " occurrences" },
      ]
    : [];

  const submit = () => {
    if (!event) return;
    onConfirm(event.id, scope);
    onClose();
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
      <div className="modal-box glass modal-w-420">
        <div className="confirm-ic danger">
          <Trash2 className="w-6 h-6 c-red shrink-0" aria-hidden="true" />
        </div>
        <DialogEyebrow />
        <h3 className="text-base font-black c-text text-center mb-1">Delete Event?</h3>
        <p className="text-sm text-center mb-4 c-dim">
          Remove <span className="font-semibold c-text">{event ? `"${event.title}" on ${fmtDateShort(event.date)}` : "this event"}</span>{" "}
          from the calendar. This cannot be undone.
        </p>
        <div className={`mb-5${series.length === 0 ? " hidden" : ""}`}>
          <span className="f-label">This event repeats</span>
          <div className="space-y-2" role="radiogroup" aria-label="Delete scope">
            {opts.map((o) => {
              const Icon = DEL_SCOPE_ICON[o.id];
              const on = o.id === scope;
              return (
                <button
                  key={o.id}
                  type="button"
                  className={on ? "opt-card sel" : "opt-card"}
                  role="radio"
                  aria-checked={on}
                  onClick={() => setScope(o.id)}
                >
                  <span className="opt-ic ic-red">
                    <Icon className="w-[15px] h-[15px] c-red shrink-0" aria-hidden="true" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[13px] font-bold c-text">{o.label}</span>
                    <span className="block text-[11px] c-dim">{o.hint}</span>
                  </span>
                  <Check
                    className={`w-[15px] h-[15px] c-gold shrink-0${on ? "" : " opacity-0"}`}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-danger flex-1 py-2.5 text-sm" onClick={submit}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarDeleteModal;
