import { useState } from "react";
import { AlertCircle, Check, X } from "lucide-react";
import type { CalendarEvent, EventFormValues, EventType } from "../../../../types/calendarApp";
import { LOCATIONS, TRAINERS, TYPES, addMin, fmtTime, parseIso, toMin } from "../../../../utils/json/calendarAppData";
import { TYPE_ICON } from "../calendarAppIcons";
import CommonDatePicker from "../../../../components/common-date-picker/commonDatePicker";
import CommonSelect from "../../../../components/common-select/commonSelect";

/*
   Add / Edit Event — ported from #modal-event-form in
   tailwind/src/calendar-app.html and openForm()/checkClash()/validateForm()/
   submitForm() in assets/js/calendar-app.js.
*/

const toOptions = (values: readonly string[]) => values.map((v) => ({ value: v, label: v }));

const isoToDate = (isoStr: string): Date => {
  const p = parseIso(isoStr);
  return new Date(p.y, p.m, p.d);
};
const dateToIso = (d: Date | null, fallback: string): string => {
  if (!d) return fallback;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

type CalendarEventFormModalProps = {
  open: boolean;
  target: CalendarEvent | null;
  presetDate: string;
  events: CalendarEvent[];
  onClose: () => void;
  onSubmit: (values: EventFormValues, editId: number | null) => void;
};

const CalendarEventFormModal = ({
  open,
  target,
  presetDate,
  events,
  onClose,
  onSubmit,
}: CalendarEventFormModalProps) => {
  const [title, setTitle] = useState(target ? target.title : "");
  const [type, setType] = useState<EventType>(target ? target.type : "Class");
  const [date, setDate] = useState(target ? target.date : presetDate);
  const [start, setStart] = useState(target ? target.start : "09:00");
  const [end, setEnd] = useState(target ? target.end || addMin(target.start, 60) : "10:00");
  const [location, setLocation] = useState(target ? target.location : LOCATIONS[0]);
  const [trainer, setTrainer] = useState(target ? target.trainer : TRAINERS[0]);
  const [capacity, setCapacity] = useState(target && target.capacity ? String(target.capacity) : "");
  const [notes, setNotes] = useState(target ? target.notes : "");

  const [titleErr, setTitleErr] = useState("");
  const [dateErr, setDateErr] = useState("");
  const [startErr, setStartErr] = useState("");
  const [endErr, setEndErr] = useState("");
  const [capErr, setCapErr] = useState("");

  const showCapacity = type === "Class" || type === "Event";

  const clashes = (() => {
    if (!date || !start || !end || toMin(end) <= toMin(start)) return [];
    return events.filter(
      (e) =>
        e.id !== target?.id &&
        e.date === date &&
        e.location === location &&
        toMin(e.start) < toMin(end) &&
        toMin(e.end || e.start) > toMin(start),
    );
  })();

  const onStartChange = (v: string) => {
    setStart(v);
    if (!end || toMin(end) <= toMin(v)) setEnd(addMin(v, 60));
  };

  const validate = (): boolean => {
    let ok = true;
    const t = title.trim();
    if (!t) {
      setTitleErr("Enter an event title");
      ok = false;
    } else if (t.length < 2) {
      setTitleErr("Title must be at least 2 characters");
      ok = false;
    } else setTitleErr("");

    if (!date) {
      setDateErr("Pick a date");
      ok = false;
    } else setDateErr("");

    if (!start) {
      setStartErr("Pick a start time");
      ok = false;
    } else setStartErr("");

    if (!end) {
      setEndErr("Pick an end time");
      ok = false;
    } else if (start && toMin(end) <= toMin(start)) {
      setEndErr("End time must be after the start time");
      ok = false;
    } else setEndErr("");

    if (showCapacity && capacity !== "") {
      const n = Number(capacity);
      if (n < 1 || n > 500) {
        setCapErr("Capacity must be between 1 and 500");
        ok = false;
      } else setCapErr("");
    } else setCapErr("");

    return ok;
  };

  const submit = () => {
    if (!validate()) return;
    onSubmit(
      {
        title: title.trim(),
        type,
        date,
        start,
        end,
        location,
        trainer,
        capacity: showCapacity && capacity !== "" ? Number(capacity) : null,
        notes: notes.trim(),
      },
      target?.id ?? null,
    );
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
      <div className="modal-box glass modal-w-560">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-black c-text">{target ? "Edit Event" : "New Event"}</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <form
          className="space-y-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div>
            <label className="f-label" htmlFor="ef-name">
              Title
            </label>
            <input
              type="text"
              id="ef-name"
              className="fp-input py-2.5 text-sm"
              placeholder="e.g. Yoga Workshop"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className={`f-error${titleErr ? " show" : ""}`}>
              <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
              <span>{titleErr}</span>
            </div>
          </div>

          <div>
            <span className="f-label">Type</span>
            <div className="type-grid" role="radiogroup" aria-label="Event type">
              {TYPES.map((t) => {
                const Icon = TYPE_ICON[t];
                const on = t === type;
                return (
                  <button
                    key={t}
                    type="button"
                    className={`type-btn t-${t.toLowerCase()}${on ? " sel" : ""}`}
                    role="radio"
                    aria-checked={on}
                    onClick={() => setType(t)}
                  >
                    <Icon className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="f-label" htmlFor="ef-date">
                Date
              </label>
              <CommonDatePicker
                className="py-2.5 text-sm"
                ariaLabel="Date"
                dateFormat="d M, yy"
                value={isoToDate(date)}
                onChange={(e) => setDate(dateToIso((e.value as Date | null) ?? null, date))}
              />
              <div className={`f-error${dateErr ? " show" : ""}`}>
                <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                <span>{dateErr}</span>
              </div>
            </div>
            <div>
              <label className="f-label" htmlFor="ef-start">
                Starts
              </label>
              <input
                id="ef-start"
                type="time"
                className="fp-input py-2.5 text-sm"
                value={start}
                onChange={(e) => onStartChange(e.target.value)}
              />
              <div className={`f-error${startErr ? " show" : ""}`}>
                <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                <span>{startErr}</span>
              </div>
            </div>
            <div>
              <label className="f-label" htmlFor="ef-end">
                Ends
              </label>
              <input
                id="ef-end"
                type="time"
                className="fp-input py-2.5 text-sm"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
              <div className={`f-error${endErr ? " show" : ""}`}>
                <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                <span>{endErr}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label" htmlFor="ef-location">
                Location
              </label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Location"
                options={toOptions(LOCATIONS)}
                value={location}
                onChange={(o) => setLocation(o?.value ?? LOCATIONS[0])}
              />
            </div>
            <div>
              <label className="f-label" htmlFor="ef-trainer">
                Trainer / owner
              </label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Trainer / owner"
                options={toOptions(TRAINERS)}
                value={trainer}
                onChange={(o) => setTrainer(o?.value ?? TRAINERS[0])}
              />
            </div>
          </div>

          <div className={showCapacity ? "" : " hidden"}>
            <label className="f-label" htmlFor="ef-capacity">
              Capacity
            </label>
            <input
              id="ef-capacity"
              type="number"
              min="1"
              max="500"
              className="fp-input py-2.5 text-sm"
              placeholder="20"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
            <div className={`f-error${capErr ? " show" : ""}`}>
              <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
              <span>{capErr}</span>
            </div>
          </div>

          <div>
            <label className="f-label" htmlFor="ef-notes">
              Notes
            </label>
            <textarea
              id="ef-notes"
              className="fp-input py-2.5 text-sm"
              rows={2}
              placeholder="Optional details…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className={`ctx-box${clashes.length ? "" : " hidden"}`}>
            <span className="c-orange font-semibold">Heads up:</span> {location} is already booked —{" "}
            {clashes
              .slice(0, 2)
              .map((h) => h.title + " (" + fmtTime(h.start) + "–" + fmtTime(h.end || h.start) + ")")
              .join(", ")}
            {clashes.length > 2 ? " +" + (clashes.length - 2) + " more" : ""}. You can still save.
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
              {target ? "Save Changes" : "Add Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalendarEventFormModal;
