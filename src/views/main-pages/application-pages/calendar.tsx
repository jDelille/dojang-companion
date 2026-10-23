import { useState } from "react";
import {
  Bell,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  MapPin,
  Pencil,
  Plus,
  Repeat,
  Search,
  Trash2,
  X,
} from "lucide-react";
import type { CalendarEvent, DeleteScope, EventType, ExportFormat, ExportScope } from "../../../types/calendarApp";
import { TODAY, fmtDateLong, fmtTime } from "../../../utils/json/calendarAppData";
import Toast from "../../../components/common/Toast";
import useCalendarApp from "./useCalendarApp";
import CalendarEventFormModal from "./modal/calendarEventFormModal";
import CalendarViewModal from "./modal/calendarViewModal";
import CalendarScheduleModal from "./modal/calendarScheduleModal";
import CalendarReminderModal from "./modal/calendarReminderModal";
import CalendarDayModal from "./modal/calendarDayModal";
import CalendarExportModal from "./modal/calendarExportModal";
import CalendarDeleteModal from "./modal/calendarDeleteModal";
import CalendarPrintSheet from "./calendarPrintSheet";

/*
   Calendar — ported from tailwind/src/calendar-app.html (and byte-identical
   calendar.html) and assets/js/calendar-app.js. Real date-based month grid,
   day agenda, search + location/trainer/type filters and the full modal
   suite: Add/Edit · View · Delete · Schedule (recurring) · Reminder ·
   Day events · Export (ICS/CSV/JSON/Print).
*/

type ModalKind = "form" | "view" | "schedule" | "reminder" | "day" | "export" | "delete";

const AGENDA_TABS: { type: "All" | EventType; cls: string }[] = [
  { type: "All", cls: "" },
  { type: "Class", cls: "t-class" },
  { type: "Event", cls: "t-event" },
  { type: "Shift", cls: "t-shift" },
  { type: "Reminder", cls: "t-reminder" },
];

const Calendar = () => {
  const page = useCalendarApp();

  const [modal, setModal] = useState<ModalKind | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [formPresetDate, setFormPresetDate] = useState(page.selected);
  const [printEvents, setPrintEvents] = useState<CalendarEvent[] | null>(null);

  const target = targetId != null ? page.find(targetId) : null;
  const series = targetId != null ? page.seriesOf(targetId) : [];

  const open = (kind: ModalKind, id: number | null) => {
    setTargetId(id);
    setModal(kind);
  };
  const close = () => setModal(null);

  const openAdd = (presetDate?: string) => {
    setFormPresetDate(presetDate || page.selected);
    open("form", null);
  };

  const doPrint = (rows: CalendarEvent[]) => {
    if (!rows.length) {
      return;
    }
    setPrintEvents(rows);
    close();
    window.setTimeout(() => window.print(), 0);
  };

  return (
    <>
      {/* Page header */}
      <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black c-text">Calendar</h2>
          <p className="text-sm mt-0.5 c-dim">Classes, events, staff shifts &amp; reminders · Austin HQ</p>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <button type="button" className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm" onClick={page.jumpToday}>
            <CalendarCheck className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Today
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => open("schedule", null)}
          >
            <Repeat className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Schedule
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => open("export", null)}
          >
            <Download className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Export
          </button>
          <button type="button" className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm" onClick={() => openAdd()}>
            <Plus className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            New Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Calendar */}
        <div className="xl:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-black c-text">{page.calTitle}</h3>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="hbtn"
                  title="Previous month"
                  aria-label="Previous month"
                  onClick={() => page.navMonth(-1)}
                >
                  <ChevronLeft className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="hbtn"
                  title="Next month"
                  aria-label="Next month"
                  onClick={() => page.navMonth(1)}
                >
                  <ChevronRight className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="flex items-center flex-wrap gap-3 text-[11px] c-dim">
              <span className="flex items-center gap-1.5">
                <span className="type-dot t-class" />
                Class
              </span>
              <span className="flex items-center gap-1.5">
                <span className="type-dot t-event" />
                Event
              </span>
              <span className="flex items-center gap-1.5">
                <span className="type-dot t-shift" />
                Shift
              </span>
              <span className="flex items-center gap-1.5">
                <span className="type-dot t-reminder" />
                Reminder
              </span>
            </div>
          </div>

          {/* Toolbar: search + filters */}
          <div className="cal-toolbar">
            <div className="relative flex-1 min-w-[180px]">
              <Search
                className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] shrink-0"
                aria-hidden="true"
              />
              <input
                type="text"
                className="fp-input pl-9 pr-9 py-2 text-sm"
                placeholder="Search events, trainer or location…"
                aria-label="Search events"
                value={page.search}
                onChange={(e) => page.setSearch(e.target.value)}
              />
              <button
                type="button"
                className={`icon-btn absolute right-2 top-1/2 -translate-y-1/2${page.search ? "" : " hidden"}`}
                aria-label="Clear search"
                onClick={() => page.setSearch("")}
              >
                <X className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              </button>
            </div>
            <select
              className="fp-input py-2 text-sm w-auto"
              aria-label="Filter by location"
              value={page.location}
              onChange={(e) => page.setLocation(e.target.value)}
            >
              {page.locationOptions.map((l) => (
                <option key={l} value={l}>
                  {l === "All" ? "All Locations" : l}
                </option>
              ))}
            </select>
            <select
              className="fp-input py-2 text-sm w-auto"
              aria-label="Filter by trainer"
              value={page.trainer}
              onChange={(e) => page.setTrainer(e.target.value)}
            >
              {page.trainerOptions.map((t) => (
                <option key={t} value={t}>
                  {t === "All" ? "All Trainers" : t}
                </option>
              ))}
            </select>
            <button type="button" className="btn-ghost px-3 py-2 text-xs" onClick={page.resetFilters}>
              Reset
            </button>
          </div>

          <div className="cal-grid mb-1" aria-hidden="true">
            <div className="cal-dow">Sun</div>
            <div className="cal-dow">Mon</div>
            <div className="cal-dow">Tue</div>
            <div className="cal-dow">Wed</div>
            <div className="cal-dow">Thu</div>
            <div className="cal-dow">Fri</div>
            <div className="cal-dow">Sat</div>
          </div>
          <div className="cal-grid" role="grid" aria-label="Month view">
            {page.grid.map((cell) => {
              const day = Number(cell.date.split("-")[2]);
              const chips = cell.events.slice(0, 2);
              const more = cell.events.length > 2 ? cell.events.length - 2 : 0;
              return (
                <div
                  key={cell.date}
                  className={`cal-cell${cell.muted ? " muted" : ""}${cell.today ? " today" : ""}${cell.selected ? " sel" : ""}`}
                  role="gridcell"
                  tabIndex={0}
                  aria-selected={cell.selected}
                  aria-label={`${fmtDateLong(cell.date)}, ${cell.events.length} event${cell.events.length === 1 ? "" : "s"}`}
                  onClick={() => page.selectDay(cell.date)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      page.selectDay(cell.date);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="cal-daynum">{day}</span>
                    {cell.events.length > 0 && <span className="cal-count">{cell.events.length}</span>}
                  </div>
                  {chips.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      className={`ev-chip t-${e.type.toLowerCase()}`}
                      title={`${fmtTime(e.start)} · ${e.title} · ${e.location}`}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        open("view", e.id);
                      }}
                    >
                      <span className="ev-dot" />
                      {e.title}
                    </button>
                  ))}
                  {more > 0 && (
                    <button
                      type="button"
                      className="more-chip"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        open("day", null);
                        page.selectDay(cell.date);
                      }}
                    >
                      +{more} more
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Agenda */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold c-text sec-title">Agenda</h3>
            <span className="text-[11px] c-gold font-semibold">{fmtDateLong(page.selected)}</span>
          </div>

          <div className="flex items-center gap-1.5 mb-4 flex-wrap" role="tablist" aria-label="Filter by event type">
            {AGENDA_TABS.map((t) => (
              <button
                key={t.type}
                type="button"
                className={`ord-tab ${t.cls}${page.type === t.type ? " active" : ""}`}
                role="tab"
                aria-selected={page.type === t.type}
                onClick={() => page.setType(t.type)}
              >
                {t.type}
                <span className="tab-count">{page.tabCounts[t.type]}</span>
              </button>
            ))}
          </div>

          <div className={`space-y-2.5 ag-scroll${page.agendaList.length === 0 ? " hidden" : ""}`}>
            {page.agendaList.map((e) => {
              const past = e.date < TODAY;
              return (
                <div
                  key={e.id}
                  className={`agenda-item t-${e.type.toLowerCase()}${past ? " past" : ""}`}
                  tabIndex={0}
                  role="button"
                  aria-label={`${e.title} at ${fmtTime(e.start)}`}
                  onClick={() => open("view", e.id)}
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
                        setFormPresetDate(e.date);
                        open("form", e.id);
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
                        open("delete", e.id);
                      }}
                    >
                      <Trash2 className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className={`text-center py-10${page.agendaList.length === 0 ? "" : " hidden"}`}>
            <div className="text-[32px] opacity-30 mb-2">📅</div>
            <div className="text-xs font-bold c-text">No events</div>
            <div className="text-[11px] mt-1 c-dim">Nothing scheduled for this day</div>
            <button type="button" className="btn-ghost mt-4 px-3.5 py-2 text-xs" onClick={() => openAdd()}>
              Add an event
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════ MODALS ══════════════ */}
      <CalendarEventFormModal
        key={`form-${target?.id ?? "new"}`}
        open={modal === "form"}
        target={modal === "form" ? target : null}
        presetDate={formPresetDate}
        events={page.events}
        onClose={close}
        onSubmit={page.saveEvent}
      />
      <CalendarViewModal
        event={modal === "view" ? target : null}
        seriesCount={series.length}
        seriesFirst={series.length ? series[0].date : null}
        seriesLast={series.length ? series[series.length - 1].date : null}
        onClose={close}
        onEdit={() => {
          if (target) setFormPresetDate(target.date);
          setModal("form");
        }}
        onReminder={() => setModal("reminder")}
        onDelete={() => setModal("delete")}
        onPrint={() => {
          if (target) doPrint([target]);
        }}
        onDuplicate={() => {
          if (targetId != null) page.duplicateEvent(targetId);
          close();
        }}
      />
      <CalendarScheduleModal
        open={modal === "schedule"}
        selectedDate={page.selected}
        seriesDates={page.seriesDates}
        onClose={close}
        onSubmit={page.createSeries}
      />
      <CalendarReminderModal
        event={modal === "reminder" ? target : null}
        onClose={close}
        onConfirm={page.setReminder}
      />
      <CalendarDayModal
        open={modal === "day"}
        date={page.selected}
        list={page.dayAllEvents}
        onClose={close}
        onOpenEvent={(id) => open("view", id)}
        onEdit={(id) => {
          const e = page.find(id);
          if (e) setFormPresetDate(e.date);
          open("form", id);
        }}
        onDelete={(id) => open("delete", id)}
        onAdd={() => {
          close();
          openAdd(page.selected);
        }}
      />
      <CalendarExportModal
        open={modal === "export"}
        dayCount={page.eventsOn(page.selected, page.matches).length}
        monthCount={page.monthEvents().length}
        filteredCount={page.events.filter(page.matches).length}
        allCount={page.events.length}
        cursorM={page.cursorM}
        cursorY={page.cursorY}
        onClose={close}
        onConfirm={(format: ExportFormat, scope: ExportScope) => {
          page.confirmExport(format, scope, doPrint);
          if (format !== "print") close();
        }}
      />
      <CalendarDeleteModal
        event={modal === "delete" ? target : null}
        series={series}
        onClose={close}
        onConfirm={(id: number, scope: DeleteScope) => page.deleteEvent(id, scope)}
      />

      <CalendarPrintSheet events={printEvents ?? []} seriesCount={(id) => page.seriesOf(id).length} />

      <Toast message={page.toast.message} visible={page.toast.visible} />
    </>
  );
};

export default Calendar;
