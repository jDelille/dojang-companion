import { useState } from "react";
import { AlertCircle, CalendarClock, X } from "lucide-react";
import type { Announcement, ScheduleValues } from "../../../types/announcements";
import { NOW, TODAY } from "../../../utils/json/announcementsData";
import CommonDatePicker from "../../../components/common-date-picker/commonDatePicker";
import { datePart, daysBetween, fmtDate, fmtTime, timePart, toMin } from "../useAnnouncements";

/*
   Schedule Announcement — ported from #modal-schedule in
   tailwind/src/announcements.html and openSchedule()/submitSchedule() in
   assets/js/announcements.js. Publish-date flatpickr becomes CommonDatePicker;
   publish-time stays a native <input type="time">.
*/

const isoToDate = (iso: string | null): Date | null => {
  if (!iso) return null;
  const p = iso.split("-").map(Number);
  return new Date(p[0], p[1] - 1, p[2]);
};

const dateToIso = (d: Date | null): string | null => {
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

type AnnouncementScheduleModalProps = {
  announcement: Announcement | null;
  onClose: () => void;
  onConfirm: (id: number, values: ScheduleValues) => void;
};

const AnnouncementScheduleModal = ({
  announcement: a,
  onClose,
  onConfirm,
}: AnnouncementScheduleModalProps) => {
  const open = a !== null;

  const [date, setDate] = useState<Date | null>(
    isoToDate(a?.publishAt ? datePart(a.publishAt) : TODAY),
  );
  const [time, setTime] = useState(a?.publishAt ? timePart(a.publishAt) : "09:00");
  const [expireDate, setExpireDate] = useState<Date | null>(isoToDate(a?.expireAt ?? null));

  const [dateErr, setDateErr] = useState("");
  const [timeErr, setTimeErr] = useState("");
  const [expireErr, setExpireErr] = useState("");

  const d = dateToIso(date);
  const x = dateToIso(expireDate);

  let preview = "Pick a publish date and time.";
  if (d && time) {
    const days = daysBetween(TODAY, d);
    const when =
      days === 0
        ? "today"
        : days === 1
          ? "tomorrow"
          : days > 0
            ? "in " + days + " days"
            : Math.abs(days) + " days ago";
    preview =
      "Publishes " + fmtDate(d) + " at " + fmtTime(time) + " (" + when + ")" +
      (x ? " · expires " + fmtDate(x) : " · no expiry");
  }

  const validate = (): boolean => {
    let ok = true;
    if (!d) {
      setDateErr("Pick a publish date");
      ok = false;
    } else if (d < TODAY) {
      setDateErr("Publish date cannot be in the past");
      ok = false;
    } else setDateErr("");

    if (!time) {
      setTimeErr("Pick a publish time");
      ok = false;
    } else if (d === TODAY && toMin(time) <= toMin(NOW)) {
      setTimeErr("Pick a time later than " + fmtTime(NOW) + ", or publish now instead");
      ok = false;
    } else setTimeErr("");

    if (x && d && x < d) {
      setExpireErr("Expiry must be on or after the publish date");
      ok = false;
    } else setExpireErr("");
    return ok;
  };

  const submit = () => {
    if (!a || !validate() || !d) return;
    onConfirm(a.id, { date: d, time, expireAt: x });
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
      <div className="modal-box glass modal-w-460">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black c-text">Schedule Announcement</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {a ? a.title + " · " + a.type + " · " + a.audience : "Announcement"}
        </div>
        <form
          className="space-y-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label" htmlFor="sc-date">
                Publish date
              </label>
              <CommonDatePicker
                className="py-2.5 text-sm"
                ariaLabel="Publish date"
                dateFormat="d M, yy"
                value={date}
                onChange={(e) => setDate((e.value as Date | null) ?? null)}
              />
              <div className={`f-error${dateErr ? " show" : ""}`}>
                <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                <span>{dateErr}</span>
              </div>
            </div>
            <div>
              <label className="f-label" htmlFor="sc-time">
                Publish time
              </label>
              <input
                id="sc-time"
                type="time"
                className="fp-input py-2.5 text-sm"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
              <div className={`f-error${timeErr ? " show" : ""}`}>
                <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                <span>{timeErr}</span>
              </div>
            </div>
          </div>
          <div>
            <label className="f-label" htmlFor="sc-expire">
              Expires on{" "}
              <span className="c-dim2 font-normal normal-case">(optional)</span>
            </label>
            <CommonDatePicker
              className="py-2.5 text-sm"
              ariaLabel="Expires on"
              dateFormat="d M, yy"
              value={expireDate}
              onChange={(e) => setExpireDate((e.value as Date | null) ?? null)}
            />
            <div className={`f-error${expireErr ? " show" : ""}`}>
              <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
              <span>{expireErr}</span>
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
              <CalendarClock className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementScheduleModal;
