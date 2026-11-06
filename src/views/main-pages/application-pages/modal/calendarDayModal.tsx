import { MapPin, Pencil, Plus, Trash2, X, Bell } from "lucide-react";
import type { CalendarEvent } from "../../../../types/calendarApp";
import { TODAY, TYPE_META, fmtDateLong, fmtTime } from "../../../../utils/json/calendarAppData";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Day Events — ported from #modal-day in tailwind/src/calendar-app.html and
   openDay()/agendaItemHtml() in assets/js/calendar-app.js.
*/

type CalendarDayModalProps = {
  open: boolean;
  date: string;
  list: CalendarEvent[];
  onClose: () => void;
  onOpenEvent: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
};

const CalendarDayModal = ({
  open,
  date,
  list,
  onClose,
  onOpenEvent,
  onEdit,
  onDelete,
  onAdd,
}: CalendarDayModalProps) => {
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
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">{fmtDateLong(date)}</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="day-scroll mb-5 space-y-2.5">
          {list.length === 0 && (
            <div className="text-xs c-dim text-center py-8">Nothing scheduled for this day</div>
          )}
          {list.map((e) => {
            const m = TYPE_META[e.type];
            const past = e.date < TODAY;
            return (
              <div
                key={e.id}
                className={`agenda-item ${m.cls}${past ? " past" : ""}`}
                tabIndex={0}
                role="button"
                aria-label={`${e.title} at ${fmtTime(e.start)}`}
                onClick={() => onOpenEvent(e.id)}
              >
                <div className="ag-time">{fmtTime(e.start)}</div>
                <div className="ag-bar" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold c-text truncate">
                    {e.title}
                    {e.seriesId && <span className="series-tag"> Series</span>}
                  </div>
                  <div className="text-[11px] c-dim flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1">
                      <span className="type-dot" />
                      {e.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                      {e.location}
                    </span>
                    {e.reminder && (
                      <span className="flex items-center gap-1 c-orange">
                        <Bell className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                        {e.reminder.minutes}m
                      </span>
                    )}
                  </div>
                </div>
                <div className="ag-actions">
                  <button
                    className="icon-btn"
                    title="Edit"
                    aria-label={`Edit ${e.title}`}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onEdit(e.id);
                    }}
                  >
                    <Pencil className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
                  </button>
                  <button
                    className="icon-btn danger"
                    title="Delete"
                    aria-label={`Delete ${e.title}`}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onDelete(e.id);
                    }}
                  >
                    <Trash2 className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onAdd}
          >
            <Plus className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Add Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarDayModal;
