import { Bell, Copy, Pencil, Printer, Trash2, X } from "lucide-react";
import type { CalendarEvent } from "../../../../types/calendarApp";
import { fmtDateLong, fmtDateShort, fmtDur, fmtTime, remindLabel } from "../../../../utils/json/calendarAppData";
import { TYPE_META } from "../../../../utils/json/calendarAppData";
import { TYPE_ICON } from "../calendarAppIcons";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   View Event — ported from #modal-view in tailwind/src/calendar-app.html and
   openView() in assets/js/calendar-app.js.
*/

type CalendarViewModalProps = {
  event: CalendarEvent | null;
  seriesCount: number;
  seriesFirst: string | null;
  seriesLast: string | null;
  onClose: () => void;
  onEdit: () => void;
  onReminder: () => void;
  onDelete: () => void;
  onPrint: () => void;
  onDuplicate: () => void;
};

const CalendarViewModal = ({
  event,
  seriesCount,
  seriesFirst,
  seriesLast,
  onClose,
  onEdit,
  onReminder,
  onDelete,
  onPrint,
  onDuplicate,
}: CalendarViewModalProps) => {
  const open = event !== null;
  const m = event ? TYPE_META[event.type] : null;
  const Icon = event ? TYPE_ICON[event.type] : null;

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
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Event Details</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>

        <div className="gold-border-card p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`icon-box ${m?.tint ?? "ic-gold"}`}>
              {Icon && <Icon className={`w-[22px] h-[22px] ${m?.col ?? "c-gold"} shrink-0`} aria-hidden="true" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black c-text truncate">{event?.title ?? "—"}</div>
              <div className="text-[11px] c-dim">
                {event ? fmtDateLong(event.date) + " · " + fmtTime(event.start) : "—"}
              </div>
            </div>
            <span className={`badge ${m?.badge ?? "badge-active"}`}>
              <span className="dot" />
              {event?.type ?? "—"}
            </span>
          </div>
        </div>

        <div className="mb-5">
          <div className="detail-row">
            <span className="k">Date</span>
            <span className="v">{event ? fmtDateLong(event.date) : "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Time</span>
            <span className="v">
              {event ? fmtTime(event.start) + " – " + fmtTime(event.end || event.start) : "—"}
            </span>
          </div>
          <div className="detail-row">
            <span className="k">Duration</span>
            <span className="v">{event && event.end ? fmtDur(event.start, event.end) : "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Location</span>
            <span className="v">{event?.location ?? "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Trainer / owner</span>
            <span className="v">{event?.trainer || "Unassigned"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Capacity</span>
            <span className="v">{event?.capacity ? event.capacity + " places" : "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Reminder</span>
            <span className="v">
              {event?.reminder ? remindLabel(event.reminder.minutes) + " · " + event.reminder.channel : "None"}
            </span>
          </div>
          <div className="detail-row">
            <span className="k">Repeats</span>
            <span className="v">
              {seriesCount
                ? "Series of " + seriesCount + " · " + fmtDateShort(seriesFirst) + " – " + fmtDateShort(seriesLast)
                : "Does not repeat"}
            </span>
          </div>
          <div className="detail-row">
            <span className="k">Notes</span>
            <span className="v">{event?.notes || "—"}</span>
          </div>
        </div>

        <div className="flex gap-2 mb-2">
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onReminder}
          >
            <Bell className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Reminder
          </button>
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onDuplicate}
          >
            <Copy className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Duplicate
          </button>
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2 danger-link"
            onClick={onDelete}
          >
            <Trash2 className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Delete
          </button>
        </div>
        <div className="flex gap-2">
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
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onEdit}
          >
            <Pencil className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Edit Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarViewModal;
