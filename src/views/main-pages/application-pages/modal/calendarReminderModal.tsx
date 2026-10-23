import { useState } from "react";
import { Bell, Check, X } from "lucide-react";
import type { CalendarEvent, Reminder, ReminderChannel } from "../../../../types/calendarApp";
import { REMIND_OPTS, addDaysIso, addMin, fmtDateShort, fmtDateLong, fmtTime, toMin } from "../../../../utils/json/calendarAppData";
import { CHANNELS } from "../../../../utils/json/calendarAppData";
import { CHANNEL_ICON } from "../calendarAppIcons";
import CommonSelect from "../../../../components/common-select/commonSelect";

/*
   Set Reminder — ported from #modal-reminder in tailwind/src/calendar-app.html
   and openReminder()/renderChannels()/reminderPreview()/confirmReminder() in
   assets/js/calendar-app.js.
*/

type CalendarReminderModalProps = {
  event: CalendarEvent | null;
  onClose: () => void;
  onConfirm: (id: number, reminder: Reminder | null) => void;
};

const CalendarReminderModal = ({ event, onClose, onConfirm }: CalendarReminderModalProps) => {
  const open = event !== null;

  const [enabled, setEnabled] = useState(!!event?.reminder);
  const [when, setWhen] = useState(event?.reminder ? String(event.reminder.minutes) : "30");
  const [channel, setChannel] = useState<ReminderChannel>(event?.reminder ? event.reminder.channel : "Push");

  const mins = Number(when);
  const at = event ? addMin(event.start, -mins) : "";
  const dayShift = event && toMin(event.start) - mins < 0 ? " (previous day)" : "";
  const previewDate = event
    ? mins >= toMin(event.start)
      ? addDaysIso(event.date, -1)
      : event.date
    : null;

  const submit = () => {
    if (!event) return;
    if (!enabled) {
      onConfirm(event.id, null);
    } else {
      onConfirm(event.id, { minutes: mins, channel });
    }
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black c-text">Set Reminder</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {event ? event.title + " · " + fmtDateLong(event.date) + " · " + fmtTime(event.start) : "Event"}
        </div>
        <label className="flex items-center gap-2.5 text-[13px] c-text2 cursor-pointer mb-4">
          <input
            type="checkbox"
            className="cbx"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Remind me before this event
        </label>
        <div className={enabled ? "" : " hidden"}>
          <div className="mb-4">
            <label className="f-label" htmlFor="rm-when">
              Remind
            </label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Remind"
              options={REMIND_OPTS}
              value={when}
              onChange={(o) => setWhen(o?.value ?? "30")}
            />
          </div>
          <div className="mb-4">
            <span className="f-label">Channel</span>
            <div className="space-y-2" role="radiogroup" aria-label="Reminder channel">
              {CHANNELS.map((c) => {
                const Icon = CHANNEL_ICON[c.id];
                const on = c.id === channel;
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={on ? "opt-card sel" : "opt-card"}
                    role="radio"
                    aria-checked={on}
                    onClick={() => setChannel(c.id)}
                  >
                    <span className={`opt-ic ${c.tint}`}>
                      <Icon className={`w-[15px] h-[15px] ${c.col} shrink-0`} aria-hidden="true" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-[13px] font-bold c-text">{c.id}</span>
                      <span className="block text-[11px] c-dim">{c.hint}</span>
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
          <div className="ctx-box mb-5">
            {event ? channel + " reminder fires at " + fmtTime(at) + dayShift + " on " + fmtDateShort(previewDate) : "—"}
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={submit}
          >
            <Bell className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Save Reminder
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarReminderModal;
