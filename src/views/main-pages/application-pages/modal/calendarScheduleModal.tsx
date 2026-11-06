import { useState } from "react";
import { AlertCircle, Repeat, X } from "lucide-react";
import type { EventType, ScheduleFormValues } from "../../../../types/calendarApp";
import {
  DOW_SHORT,
  LOCATIONS,
  TRAINERS,
  TYPES,
  addDaysIso,
  fmtDateShort,
  fmtTime,
  parseIso,
  toMin,
  weekdayOfIso,
} from "../../../../utils/json/calendarAppData";
import { TYPE_ICON } from "../calendarAppIcons";
import CommonDatePicker from "../../../../components/common-date-picker/commonDatePicker";
import CommonSelect from "../../../../components/common-select/commonSelect";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Schedule Recurring — ported from #modal-schedule in
   tailwind/src/calendar-app.html and openSchedule()/renderDows()/
   schedulePreview()/validateSchedule()/submitSchedule() in
   assets/js/calendar-app.js.
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

type CalendarScheduleModalProps = {
  open: boolean;
  selectedDate: string;
  seriesDates: (from: string, until: string, dows: number[]) => string[];
  onClose: () => void;
  onSubmit: (values: ScheduleFormValues) => void;
};

const CalendarScheduleModal = ({
  open,
  selectedDate,
  seriesDates,
  onClose,
  onSubmit,
}: CalendarScheduleModalProps) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EventType>("Class");
  const [dows, setDows] = useState<number[]>([weekdayOfIso(selectedDate)]);
  const [from, setFrom] = useState(selectedDate);
  const [until, setUntil] = useState(addDaysIso(selectedDate, 28));
  const [start, setStart] = useState("07:00");
  const [end, setEnd] = useState("08:00");
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [trainer, setTrainer] = useState(TRAINERS[0]);

  const [titleErr, setTitleErr] = useState("");
  const [dowsErr, setDowsErr] = useState("");
  const [fromErr, setFromErr] = useState("");
  const [untilErr, setUntilErr] = useState("");
  const [endErr, setEndErr] = useState("");

  const toggleDow = (i: number) => {
    setDows((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
    setDowsErr("");
  };

  const onStartChange = (v: string) => {
    setStart(v);
    if (!end || toMin(end) <= toMin(v)) setEnd(addMinLocal(v, 60));
  };

  const dates = seriesDates(from, until, dows);
  const preview = !dates.length
    ? "Pick weekdays and a date range to preview the series."
    : "Creates " +
      dates.length +
      " " +
      type.toLowerCase() +
      (dates.length === 1 ? "" : "s") +
      " on " +
      dows
        .slice()
        .sort()
        .map((i) => DOW_SHORT[i])
        .join(", ") +
      " · " +
      fmtDateShort(dates[0]) +
      " → " +
      fmtDateShort(dates[dates.length - 1]) +
      " at " +
      fmtTime(start || "07:00");

  const validate = (): boolean => {
    let ok = true;
    const t = title.trim();
    if (!t) {
      setTitleErr("Enter a title for the series");
      ok = false;
    } else setTitleErr("");

    if (!dows.length) {
      setDowsErr("Pick at least one weekday");
      ok = false;
    } else setDowsErr("");

    if (!from) {
      setFromErr("Pick a start date");
      ok = false;
    } else setFromErr("");
    if (!until) {
      setUntilErr("Pick an end date");
      ok = false;
    } else if (from && until < from) {
      setUntilErr("End date must be on or after the start date");
      ok = false;
    } else setUntilErr("");

    if (start && end && toMin(end) <= toMin(start)) {
      setEndErr("End time must be after the start time");
      ok = false;
    } else setEndErr("");

    if (ok) {
      const d = seriesDates(from, until, dows);
      if (!d.length) {
        setDowsErr("No dates fall on those weekdays in this range");
        ok = false;
      } else if (d.length > 200) {
        setUntilErr("That creates " + d.length + " events — shorten the range (max 200)");
        ok = false;
      }
    }
    return ok;
  };

  const submit = () => {
    if (!validate()) return;
    onSubmit({ title: title.trim(), type, dows, from, until, start, end, location, trainer });
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
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Schedule Recurring</h3>
          </div>
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
            <label className="f-label" htmlFor="sc-name">
              Title
            </label>
            <input
              type="text"
              id="sc-name"
              className="fp-input py-2.5 text-sm"
              placeholder="e.g. Morning Vinyasa"
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

          <div>
            <span className="f-label">Repeat on</span>
            <div className="dow-row" role="group" aria-label="Repeat on weekdays">
              {DOW_SHORT.map((d, i) => {
                const on = dows.includes(i);
                return (
                  <button
                    key={d}
                    type="button"
                    className={`dow-btn${on ? " on" : ""}`}
                    aria-pressed={on}
                    onClick={() => toggleDow(i)}
                  >
                    {d.slice(0, 2)}
                  </button>
                );
              })}
            </div>
            <div className={`f-error${dowsErr ? " show" : ""}`}>
              <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
              <span>{dowsErr}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label" htmlFor="sc-from">
                From
              </label>
              <CommonDatePicker
                className="py-2.5 text-sm"
                ariaLabel="From"
                dateFormat="d M, yy"
                value={isoToDate(from)}
                onChange={(e) => setFrom(dateToIso((e.value as Date | null) ?? null, from))}
              />
              <div className={`f-error${fromErr ? " show" : ""}`}>
                <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                <span>{fromErr}</span>
              </div>
            </div>
            <div>
              <label className="f-label" htmlFor="sc-until">
                Until
              </label>
              <CommonDatePicker
                className="py-2.5 text-sm"
                ariaLabel="Until"
                dateFormat="d M, yy"
                value={isoToDate(until)}
                onChange={(e) => setUntil(dateToIso((e.value as Date | null) ?? null, until))}
              />
              <div className={`f-error${untilErr ? " show" : ""}`}>
                <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                <span>{untilErr}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label" htmlFor="sc-start">
                Starts
              </label>
              <input
                id="sc-start"
                type="time"
                className="fp-input py-2.5 text-sm"
                value={start}
                onChange={(e) => onStartChange(e.target.value)}
              />
            </div>
            <div>
              <label className="f-label" htmlFor="sc-end">
                Ends
              </label>
              <input
                id="sc-end"
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
              <label className="f-label" htmlFor="sc-location">
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
              <label className="f-label" htmlFor="sc-trainer">
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

          <div className="ctx-box">{preview}</div>

          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              <Repeat className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              Create Series
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function addMinLocal(t: string, n: number): string {
  const [hh, mm] = t.split(":").map(Number);
  let v = hh * 60 + mm + n;
  v = ((v % 1440) + 1440) % 1440;
  const pad = (x: number) => String(x).padStart(2, "0");
  return pad(Math.floor(v / 60)) + ":" + pad(v % 60);
}

export default CalendarScheduleModal;
