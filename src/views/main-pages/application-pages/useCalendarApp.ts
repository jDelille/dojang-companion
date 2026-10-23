import { useCallback, useMemo, useState } from "react";
import type {
  CalendarEvent,
  DeleteScope,
  EventFormValues,
  EventType,
  ExportFormat,
  ExportScope,
  Reminder,
  ScheduleFormValues,
} from "../../../types/calendarApp";
import {
  DOW_SHORT,
  EVENTS,
  EX_COLS,
  MONTHS,
  TODAY,
  addDaysIso,
  addMin,
  daysInMonth,
  firstWeekday,
  fmtDateShort,
  iso,
  parseIso,
  toMin,
  weekdayOfIso,
} from "../../../utils/json/calendarAppData";
import useToast from "../../../hooks/useToast";

/*
   Calendar app state — ported from tailwind/src/assets/js/calendar-app.js.
   Owns the visible month cursor, selected day, search/filters, the events
   list, and every mutation (add/edit/delete/duplicate/reminder/recurring
   series/export). Derives the 6x7 month grid, per-day counts and the agenda.
*/

export type GridCell = {
  date: string;
  muted: boolean;
  today: boolean;
  selected: boolean;
  events: CalendarEvent[];
};

const byId = (list: CalendarEvent[], id: number) => list.find((e) => e.id === id) ?? null;
const byTime = (a: CalendarEvent, b: CalendarEvent) => a.start.localeCompare(b.start) || a.id - b.id;

/** Download helper — Blob + object URL + programmatic <a download>. */
function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function useCalendarApp() {
  const { message, visible, showToast } = useToast();

  const [events, setEvents] = useState<CalendarEvent[]>(EVENTS);
  const [idSeq, setIdSeq] = useState(EVENTS.length + 1);

  const initial = parseIso(TODAY);
  const [cursorY, setCursorY] = useState(initial.y);
  const [cursorM, setCursorM] = useState(initial.m);
  const [selected, setSelected] = useState(TODAY);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All");
  const [trainer, setTrainer] = useState("All");
  const [type, setType] = useState<"All" | EventType>("All");

  const nextId = useCallback(() => {
    const id = idSeq;
    setIdSeq((n) => n + 1);
    return id;
  }, [idSeq]);

  const find = useCallback((id: number) => byId(events, id), [events]);

  /* ---------- Filter predicates ---------- */
  const matches = useCallback(
    (e: CalendarEvent) => {
      const q = search.trim().toLowerCase();
      const mq =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        (e.trainer || "").toLowerCase().includes(q) ||
        (e.notes || "").toLowerCase().includes(q);
      const ml = location === "All" || e.location === location;
      const mt = trainer === "All" || e.trainer === trainer;
      const my = type === "All" || e.type === type;
      return mq && ml && mt && my;
    },
    [search, location, trainer, type],
  );
  /* The month grid ignores the type tabs so the agenda can filter independently */
  const gridMatches = useCallback(
    (e: CalendarEvent) => {
      const q = search.trim().toLowerCase();
      const mq =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        (e.trainer || "").toLowerCase().includes(q) ||
        (e.notes || "").toLowerCase().includes(q);
      const ml = location === "All" || e.location === location;
      const mt = trainer === "All" || e.trainer === trainer;
      return mq && ml && mt;
    },
    [search, location, trainer],
  );

  const eventsOn = useCallback(
    (date: string, fn?: (e: CalendarEvent) => boolean) =>
      events.filter((e) => e.date === date && (fn ? fn(e) : true)).sort(byTime),
    [events],
  );

  const monthEvents = useCallback(() => {
    return events
      .filter((e) => {
        const p = parseIso(e.date);
        return p.y === cursorY && p.m === cursorM;
      })
      .sort((a, b) => a.date.localeCompare(b.date) || byTime(a, b));
  }, [events, cursorY, cursorM]);

  const seriesOf = useCallback(
    (id: number) => {
      const e = byId(events, id);
      return e && e.seriesId ? events.filter((x) => x.seriesId === e.seriesId) : [];
    },
    [events],
  );

  /* ---------- Derived: month title + grid ---------- */
  const calTitle = `${MONTHS[cursorM]} ${cursorY}`;

  const grid = useMemo<GridCell[]>(() => {
    const first = firstWeekday(cursorY, cursorM);
    const total = daysInMonth(cursorY, cursorM);
    const prevY = cursorM === 0 ? cursorY - 1 : cursorY;
    const prevM = cursorM === 0 ? 11 : cursorM - 1;
    const prevTotal = daysInMonth(prevY, prevM);

    const cells: { date: string; muted: boolean }[] = [];
    for (let i = first - 1; i >= 0; i--) cells.push({ date: iso(prevY, prevM, prevTotal - i), muted: true });
    for (let d = 1; d <= total; d++) cells.push({ date: iso(cursorY, cursorM, d), muted: false });
    const nextY = cursorM === 11 ? cursorY + 1 : cursorY;
    const nextM = cursorM === 11 ? 0 : cursorM + 1;
    let d2 = 1;
    while (cells.length % 7 !== 0) {
      cells.push({ date: iso(nextY, nextM, d2), muted: true });
      d2 += 1;
    }

    return cells.map((c) => ({
      date: c.date,
      muted: c.muted,
      today: c.date === TODAY,
      selected: c.date === selected,
      events: events.filter((e) => e.date === c.date && gridMatches(e)).sort(byTime),
    }));
  }, [cursorY, cursorM, selected, events, gridMatches]);

  /* ---------- Derived: agenda ---------- */
  const agendaList = useMemo(() => eventsOn(selected, matches), [eventsOn, selected, matches]);
  const dayAllEvents = useMemo(() => eventsOn(selected, gridMatches), [eventsOn, selected, gridMatches]);

  const tabCounts = useMemo(
    () => ({
      All: dayAllEvents.length,
      Class: dayAllEvents.filter((e) => e.type === "Class").length,
      Event: dayAllEvents.filter((e) => e.type === "Event").length,
      Shift: dayAllEvents.filter((e) => e.type === "Shift").length,
      Reminder: dayAllEvents.filter((e) => e.type === "Reminder").length,
    }),
    [dayAllEvents],
  );

  const locationOptions = useMemo(
    () => ["All", ...Array.from(new Set(events.map((e) => e.location))).sort()],
    [events],
  );
  const trainerOptions = useMemo(
    () => ["All", ...Array.from(new Set(events.map((e) => e.trainer).filter(Boolean))).sort()],
    [events],
  );

  /* ============================================================
     Navigation
     ============================================================ */
  const goToDate = useCallback((date: string) => {
    const p = parseIso(date);
    setCursorY(p.y);
    setCursorM(p.m);
    setSelected(date);
  }, []);

  const navMonth = useCallback(
    (n: number) => {
      let m = cursorM + n;
      let y = cursorY;
      while (m < 0) {
        m += 12;
        y -= 1;
      }
      while (m > 11) {
        m -= 12;
        y += 1;
      }
      const day = Math.min(parseIso(selected).d, daysInMonth(y, m));
      setCursorM(m);
      setCursorY(y);
      setSelected(iso(y, m, day));
    },
    [cursorM, cursorY, selected],
  );

  const selectDay = useCallback((date: string) => {
    const p = parseIso(date);
    setCursorY(p.y);
    setCursorM(p.m);
    setSelected(date);
  }, []);

  const jumpToday = useCallback(() => {
    goToDate(TODAY);
    showToast("Jumped to today");
  }, [goToDate, showToast]);

  const resetFilters = useCallback(() => {
    setSearch("");
    setLocation("All");
    setTrainer("All");
    setType("All");
    showToast("Filters reset");
  }, [showToast]);

  /* ============================================================
     Clash detection for the event form (#ef-clash)
     ============================================================ */
  const checkClash = useCallback(
    (editId: number | null, date: string, start: string, end: string, loc: string) => {
      if (!date || !start || !end || toMin(end) <= toMin(start)) return [];
      return events.filter(
        (e) =>
          e.id !== editId &&
          e.date === date &&
          e.location === loc &&
          toMin(e.start) < toMin(end) &&
          toMin(e.end || e.start) > toMin(start),
      );
    },
    [events],
  );

  /* ============================================================
     Add / Edit event
     ============================================================ */
  const saveEvent = useCallback(
    (values: EventFormValues, editId: number | null) => {
      const data = {
        title: values.title.trim(),
        type: values.type,
        date: values.date,
        start: values.start,
        end: values.end,
        location: values.location,
        trainer: values.trainer,
        capacity: values.capacity,
        notes: values.notes.trim(),
      };
      if (editId != null) {
        setEvents((prev) => prev.map((e) => (e.id === editId ? { ...e, ...data } : e)));
        showToast('"' + data.title + '" updated');
      } else {
        const id = nextId();
        setEvents((prev) => [
          ...prev,
          { ...data, id, seriesId: null, reminder: null },
        ]);
        showToast('"' + data.title + '" added on ' + fmtDateShort(data.date));
      }
      goToDate(data.date);
    },
    [nextId, showToast, goToDate],
  );

  /* ============================================================
     Schedule (recurring series)
     ============================================================ */
  const seriesDates = useCallback((from: string, until: string, dows: number[]): string[] => {
    if (!from || !until || until < from || !dows.length) return [];
    const out: string[] = [];
    let d = from;
    let guard = 0;
    while (d <= until && guard < 400) {
      if (dows.indexOf(weekdayOfIso(d)) >= 0) out.push(d);
      d = addDaysIso(d, 1);
      guard += 1;
    }
    return out;
  }, []);

  const createSeries = useCallback(
    (values: ScheduleFormValues) => {
      const dates = seriesDates(values.from, values.until, values.dows);
      if (!dates.length) return;
      const sid = "S" + Date.now().toString(36);
      const title = values.title.trim();
      let seq = idSeq;
      const created: CalendarEvent[] = dates.map((d) => {
        const ev: CalendarEvent = {
          id: seq,
          date: d,
          start: values.start || "07:00",
          end: values.end || "08:00",
          title,
          type: values.type,
          location: values.location,
          trainer: values.trainer,
          capacity: null,
          notes: "",
          seriesId: sid,
          reminder: null,
        };
        seq += 1;
        return ev;
      });
      setIdSeq(seq);
      setEvents((prev) => [...prev, ...created]);
      goToDate(dates[0]);
      showToast(dates.length + ' "' + title + '" events scheduled');
    },
    [idSeq, seriesDates, goToDate, showToast],
  );

  /* ============================================================
     Reminder
     ============================================================ */
  const setReminder = useCallback(
    (id: number, reminder: Reminder | null) => {
      const e = byId(events, id);
      if (!e) return;
      setEvents((prev) => prev.map((x) => (x.id === id ? { ...x, reminder } : x)));
      if (!reminder) {
        showToast('Reminder removed from "' + e.title + '"');
      } else {
        showToast(reminder.channel + " reminder set · " + remindLabelLocal(reminder.minutes));
      }
    },
    [events, showToast],
  );

  /* ============================================================
     Delete
     ============================================================ */
  const deleteEvent = useCallback(
    (id: number, scope: DeleteScope) => {
      const e = byId(events, id);
      if (!e) return;
      let kill = [e.id];
      if (e.seriesId && scope !== "one") {
        kill = events
          .filter((x) => x.seriesId === e.seriesId && (scope === "all" || x.date >= e.date))
          .map((x) => x.id);
      }
      const killSet = new Set(kill);
      setEvents((prev) => prev.filter((x) => !killSet.has(x.id)));
      showToast(kill.length === 1 ? '"' + e.title + '" deleted' : kill.length + ' "' + e.title + '" events deleted');
    },
    [events, showToast],
  );

  /* ============================================================
     Duplicate
     ============================================================ */
  const duplicateEvent = useCallback(
    (id: number) => {
      const src = byId(events, id);
      if (!src) return;
      const newId = nextId();
      const copy: CalendarEvent = {
        ...src,
        id: newId,
        seriesId: null,
        title: src.title + " (copy)",
        reminder: src.reminder ? { ...src.reminder } : null,
      };
      setEvents((prev) => [...prev, copy]);
      goToDate(copy.date);
      showToast('"' + src.title + '" duplicated');
    },
    [events, nextId, goToDate, showToast],
  );

  /* ============================================================
     Export
     ============================================================ */
  const exportRows = useCallback(
    (scope: ExportScope): CalendarEvent[] => {
      if (scope === "day") return eventsOn(selected, matches);
      if (scope === "month") return monthEvents();
      if (scope === "all") return events.slice().sort((a, b) => a.date.localeCompare(b.date) || byTime(a, b));
      return events.filter(matches).sort((a, b) => a.date.localeCompare(b.date) || byTime(a, b));
    },
    [eventsOn, selected, matches, monthEvents, events],
  );

  const confirmExport = useCallback(
    (format: ExportFormat, scope: ExportScope, onPrint: (rows: CalendarEvent[]) => void) => {
      const rows = exportRows(scope);
      if (!rows.length) {
        showToast("Nothing to export in that range");
        return;
      }
      if (format === "print") {
        onPrint(rows);
        return;
      }
      if (format === "csv") {
        const cell = (v: string) => (/[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v);
        const csv = [EX_COLS.map((c) => cell(c[0])).join(",")]
          .concat(rows.map((e) => EX_COLS.map((c) => cell(c[1](e))).join(",")))
          .join("\r\n");
        download("calendar-" + TODAY + ".csv", "﻿" + csv, "text/csv;charset=utf-8;");
      } else if (format === "json") {
        const data = rows.map((e) => ({
          date: e.date, start: e.start, end: e.end, title: e.title, type: e.type,
          location: e.location, trainer: e.trainer, capacity: e.capacity,
          reminder: e.reminder, series: !!e.seriesId, notes: e.notes,
        }));
        download(
          "calendar-" + TODAY + ".json",
          JSON.stringify({ branch: "Austin HQ", exportedOn: TODAY, count: data.length, events: data }, null, 2),
          "application/json",
        );
      } else {
        /* ics */
        download("calendar-" + TODAY + ".ics", buildIcs(rows), "text/calendar;charset=utf-8;");
      }
      showToast(
        rows.length + " event" + (rows.length === 1 ? "" : "s") + " exported as " +
          (format === "ics" ? "iCalendar" : format.toUpperCase()),
      );
    },
    [exportRows, showToast],
  );

  return {
    events,
    cursorY,
    cursorM,
    calTitle,
    selected,
    grid,
    agendaList,
    dayAllEvents,
    tabCounts,
    search,
    setSearch,
    location,
    setLocation,
    trainer,
    setTrainer,
    type,
    setType,
    locationOptions,
    trainerOptions,
    find,
    eventsOn,
    monthEvents,
    seriesOf,
    matches,
    gridMatches,
    navMonth,
    selectDay,
    goToDate,
    jumpToday,
    resetFilters,
    checkClash,
    saveEvent,
    seriesDates,
    createSeries,
    setReminder,
    deleteEvent,
    duplicateEvent,
    exportRows,
    confirmExport,
    toast: { message, visible },
  };
}

/* remindLabel duplicated locally to avoid a circular import with calendarAppData */
function remindLabelLocal(mins: number): string {
  const opts = [
    { value: "5", label: "5 minutes before" },
    { value: "15", label: "15 minutes before" },
    { value: "30", label: "30 minutes before" },
    { value: "60", label: "1 hour before" },
    { value: "120", label: "2 hours before" },
    { value: "1440", label: "1 day before" },
  ];
  const o = opts.find((x) => Number(x.value) === Number(mins));
  return o ? o.label : mins + " minutes before";
}

/* ---------- iCalendar (RFC 5545) ---------- */
const icsEscape = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
/** Content lines must be folded at 75 octets; continuations start with a space. */
function icsFold(line: string): string {
  if (line.length <= 75) return line;
  const out = [line.slice(0, 75)];
  let rest = line.slice(75);
  while (rest.length > 74) {
    out.push(" " + rest.slice(0, 74));
    rest = rest.slice(74);
  }
  if (rest.length) out.push(" " + rest);
  return out.join("\r\n");
}
const icsStamp = (date: string, time: string) => date.replace(/-/g, "") + "T" + time.replace(":", "") + "00";
function buildIcs(rows: CalendarEvent[]): string {
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0",
    "PRODID:-//Dreams GYM//Calendar//EN",
    "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "X-WR-CALNAME:Dreams GYM — Austin HQ",
  ];
  rows.forEach((e) => {
    lines.push("BEGIN:VEVENT");
    lines.push("UID:fitpro-" + e.id + "-" + e.date.replace(/-/g, "") + "@example.com");
    lines.push("DTSTAMP:" + icsStamp(TODAY, "00:00") + "Z");
    lines.push("DTSTART:" + icsStamp(e.date, e.start));
    lines.push("DTEND:" + icsStamp(e.date, e.end || addMin(e.start, 60)));
    lines.push(icsFold("SUMMARY:" + icsEscape(e.title)));
    lines.push(icsFold("LOCATION:" + icsEscape(e.location)));
    const desc = [e.type, e.trainer ? "Owner: " + e.trainer : "", e.capacity ? "Capacity: " + e.capacity : "", e.notes]
      .filter(Boolean)
      .join(" · ");
    if (desc) lines.push(icsFold("DESCRIPTION:" + icsEscape(desc)));
    lines.push(icsFold("CATEGORIES:" + icsEscape(e.type)));
    if (e.reminder) {
      lines.push("BEGIN:VALARM");
      lines.push("TRIGGER:-PT" + e.reminder.minutes + "M");
      lines.push("ACTION:DISPLAY");
      lines.push(icsFold("DESCRIPTION:" + icsEscape(e.title + " · " + e.reminder.channel)));
      lines.push("END:VALARM");
    }
    lines.push("END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

export const DOW_LABELS = DOW_SHORT;

export default useCalendarApp;
