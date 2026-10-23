import { useState } from "react";
import {
  Clock,
  Download,
  Edit2,
  Eye,
  ListChecks,
  Plane,
  Plus,
  Printer,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import Toast from "../../components/common/Toast";
import CommonSelect from "../../components/common-select/commonSelect";
import CommonDatePicker from "../../components/common-date-picker/commonDatePicker";
import useToast from "../../hooks/useToast";
import type { AttendanceRecord } from "../../types/attendance";
import {
  ATTENDANCE_STATUS_BADGE,
  ATTENDANCE_STATUS_OPTIONS,
  TRAINER_OPTIONS,
} from "../../utils/json/attendanceData";
import useAttendance, {
  type PlanFilter,
  type StatusFilter,
  type TrainerFilter,
} from "./useAttendance";
import AttendanceViewModal from "./modal/attendanceViewModal";
import MarkAttendanceModal from "./modal/markAttendanceModal";
import BulkAttendanceModal from "./modal/bulkAttendanceModal";
import AttendanceHistoryModal from "./modal/attendanceHistoryModal";
import AttendanceFilterModal from "./modal/attendanceFilterModal";
import AttendanceEntryModal from "./modal/attendanceEntryModal";
import AttendanceDeleteModal from "./modal/attendanceDeleteModal";
import AttendanceImportModal from "./modal/attendanceImportModal";
import AttendanceExportModal from "./modal/attendanceExportModal";

/*
   Attendance — ported from tailwind/src/attendance.html +
   assets/js/attendance.js.

   The date input above the table is UI-only in the template (no listener
   ever reads it outside seeding the Add-entry form), so it stays local state
   here too rather than driving a fetch.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

const TRAINER_FILTER_OPTIONS = [
  { value: "All", label: "All Trainers" },
  ...toOptions(TRAINER_OPTIONS),
];
const STATUS_FILTER_OPTIONS = [
  { value: "All", label: "All Status" },
  ...toOptions(ATTENDANCE_STATUS_OPTIONS),
];

/* The toolbar's date field is display-only; it just seeds the Add-entry form. */
const DEFAULT_TOOLBAR_DATE = new Date(2026, 6, 14);

const Attendance = () => {
  const {
    records,
    visible,
    loading,
    search,
    setSearch,
    trainer,
    setTrainer,
    status,
    setStatus,
    plan,
    setPlan,
    clearFilters,
    kpis,
    refresh,
    checkIn,
    checkOut,
    saveEntry,
    removeRecord,
    markAttendance,
    applyBulk,
    historyFor,
  } = useAttendance();
  const { message, visible: toastVisible, showToast } = useToast();

  const [toolbarDate, setToolbarDate] = useState<Date | null>(DEFAULT_TOOLBAR_DATE);
  const [view, setView] = useState<AttendanceRecord | null>(null);
  const [historyTarget, setHistoryTarget] = useState<AttendanceRecord | null>(null);
  const [entryOpen, setEntryOpen] = useState(false);
  const [editing, setEditing] = useState<AttendanceRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AttendanceRecord | null>(null);
  const [markOpen, setMarkOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const openEntry = (record: AttendanceRecord | null) => {
    setEditing(record);
    setEntryOpen(true);
  };

  return (
    <>
      {/* Page header */}
      <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black c-text">Attendance</h2>
          <p className="text-sm mt-0.5 c-dim">Tuesday, July 14, 2026 · Austin HQ</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge badge-active px-3 py-1.5">
            <span className="dot" />
            Live
          </span>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={refresh}
          >
            <RefreshCw className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Refresh
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => window.print()}
          >
            <Printer className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Print
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => setImportOpen(true)}
          >
            <Upload className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Import
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => setExportOpen(true)}
          >
            <Download className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => setBulkOpen(true)}
          >
            <ListChecks className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Bulk
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => setMarkOpen(true)}
          >
            <UserCheck className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Mark Attendance
          </button>
          <button
            type="button"
            className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
            onClick={() => openEntry(null)}
          >
            <Plus className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Add Entry
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <UserCheck className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.present}</div>
            <div className="text-xs font-medium mt-1 c-dim">Present</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <UserX className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.absent}</div>
            <div className="text-xs font-medium mt-1 c-dim">Absent</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <Clock className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.late}</div>
            <div className="text-xs font-medium mt-1 c-dim">Late</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <Plane className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.leave}</div>
            <div className="text-xs font-medium mt-1 c-dim">On Leave</div>
          </div>
        </div>
      </div>

      {/* Toolbar: search + filters */}
      <div className="glass-card p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] shrink-0"
            aria-hidden="true"
          />
          <input
            type="text"
            className="fp-input pl-9 py-2 text-sm"
            placeholder="Search member by name or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <CommonDatePicker
          className="py-2 text-sm w-auto"
          dateFormat="d M, yy"
          ariaLabel="Date"
          value={toolbarDate}
          onChange={(e) => setToolbarDate((e.value as Date) ?? null)}
        />
        <CommonSelect
          className="w-auto"
          fieldClassName="py-2 text-sm"
          ariaLabel="Filter by trainer"
          options={TRAINER_FILTER_OPTIONS}
          value={trainer}
          onChange={(option) => setTrainer((option?.value as TrainerFilter) ?? "All")}
        />
        <CommonSelect
          className="w-auto"
          fieldClassName="py-2 text-sm"
          ariaLabel="Filter by status"
          options={STATUS_FILTER_OPTIONS}
          value={status}
          onChange={(option) => setStatus((option?.value as StatusFilter) ?? "All")}
        />
        <button
          type="button"
          className="btn-ghost flex items-center gap-2 px-3 py-2 text-sm"
          onClick={() => setFilterOpen(true)}
        >
          <SlidersHorizontal className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Filters
        </button>
        <button
          type="button"
          className="btn-ghost flex items-center gap-2 px-3 py-2 text-sm"
          onClick={() => {
            clearFilters();
            showToast("Filters cleared");
          }}
        >
          <X className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Clear
        </button>
      </div>

      {/* Attendance table */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-4 pb-3">
          <h3 className="font-bold c-text sec-title">Daily Attendance Log</h3>
          <span className="text-[11px] c-dim">Auto-synced from Check-In station</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table table-sticky min-w-[900px]">
            <thead>
              <tr>
                <th>Member</th>
                <th>Plan</th>
                <th>Trainer</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Duration</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, row) => (
                    <tr key={row}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="skel w-8 h-8 rounded-lg" />
                          <div className="flex-1">
                            <div className="skel w-24 mb-1" />
                            <div className="skel w-14" />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="skel w-20" />
                      </td>
                      <td>
                        <div className="skel w-16" />
                      </td>
                      <td>
                        <div className="skel w-14" />
                      </td>
                      <td>
                        <div className="skel w-14" />
                      </td>
                      <td>
                        <div className="skel w-10" />
                      </td>
                      <td>
                        <div className="skel w-16 rounded-full" />
                      </td>
                      <td>
                        <div className="skel w-20" />
                      </td>
                    </tr>
                  ))
                : visible.map((record) => {
                    const showCheckout =
                      record.checkOut === "—" &&
                      (record.status === "Present" || record.status === "Late");
                    const showCheckin =
                      !showCheckout &&
                      (record.status === "Absent" || record.status === "On Leave");
                    return (
                      <tr key={record.id} className="fade-up">
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className={`av ${record.avatar}`}>{record.initials}</div>
                            <div>
                              <div className="text-sm font-semibold c-text">{record.name}</div>
                              <div className="text-[11px] c-dim">{record.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-xs c-muted">{record.plan}</td>
                        <td className="text-xs c-dim">{record.trainer}</td>
                        <td className="text-xs c-text2">{record.checkIn}</td>
                        <td className="text-xs c-text2">{record.checkOut}</td>
                        <td className="text-xs c-muted">{record.hours}</td>
                        <td>
                          <span className={`badge ${ATTENDANCE_STATUS_BADGE[record.status]}`}>
                            <span className="dot" />
                            {record.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1 justify-end">
                            {showCheckout && (
                              <button
                                type="button"
                                className="btn-ghost text-[11px] px-2.5 py-1"
                                onClick={() => {
                                  checkOut(record.id);
                                  showToast(`${record.name} checked out`);
                                }}
                              >
                                Check-out
                              </button>
                            )}
                            {showCheckin && (
                              <button
                                type="button"
                                className="btn-ghost text-[11px] px-2.5 py-1"
                                onClick={() => {
                                  checkIn(record.id);
                                  showToast(`${record.name} checked in`);
                                }}
                              >
                                Check-in
                              </button>
                            )}
                            {!showCheckout && !showCheckin && (
                              <span className="c-dim2 text-xs">Done</span>
                            )}
                            <button
                              type="button"
                              className="icon-btn view"
                              title="View"
                              onClick={() => setView(record)}
                            >
                              <Eye className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className="icon-btn"
                              title="Edit"
                              onClick={() => openEntry(record)}
                            >
                              <Edit2 className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className="icon-btn danger"
                              title="Remove"
                              onClick={() => setDeleteTarget(record)}
                            >
                              <Trash2 className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        {!loading && visible.length === 0 && (
          <div className="text-center py-16">
            <div className="text-[42px] opacity-30 mb-2">🗓️</div>
            <div className="text-sm font-bold c-text">No attendance records found</div>
            <div className="text-xs mt-1 c-dim">
              Try adjusting the date, trainer, or status filters
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-3 bd-t">
          <span className="text-xs c-dim2">
            Showing <span>{visible.length}</span> of <span>{records.length}</span> records
          </span>
          {/* Static in the template too — kept for visual parity. */}
          <div className="flex gap-1">
            <button type="button" className="page-btn">
              Prev
            </button>
            <button type="button" className="page-btn active">
              1
            </button>
            <button type="button" className="page-btn">
              2
            </button>
            <button type="button" className="page-btn">
              3
            </button>
            <button type="button" className="page-btn">
              Next
            </button>
          </div>
        </div>
      </div>

      <AttendanceViewModal
        record={view}
        onClose={() => setView(null)}
        onHistory={(record) => {
          setView(null);
          setHistoryTarget(record);
        }}
      />
      <MarkAttendanceModal
        open={markOpen}
        records={records}
        onClose={() => setMarkOpen(false)}
        onMark={(id, status, time) => {
          const record = records.find((item) => item.id === id);
          markAttendance(id, status, time);
          setMarkOpen(false);
          if (record) showToast(`${record.name} marked ${status}`);
        }}
      />
      {/* Keyed by open state so re-opening remounts with a fresh draft. */}
      <BulkAttendanceModal
        key={bulkOpen ? "bulk-open" : "bulk-closed"}
        open={bulkOpen}
        records={records}
        onClose={() => setBulkOpen(false)}
        onSave={(selection) => {
          const changed = applyBulk(selection);
          setBulkOpen(false);
          showToast(`Bulk attendance applied · ${changed} updated`);
        }}
      />
      <AttendanceHistoryModal
        record={historyTarget}
        history={historyTarget ? historyFor(historyTarget) : null}
        onClose={() => setHistoryTarget(null)}
      />
      <AttendanceFilterModal
        open={filterOpen}
        plan={plan}
        trainer={trainer}
        status={status}
        onClose={() => setFilterOpen(false)}
        onApply={(nextPlan, nextTrainer, nextStatus) => {
          setPlan(nextPlan as PlanFilter);
          setTrainer(nextTrainer as TrainerFilter);
          setStatus(nextStatus as StatusFilter);
          showToast("Filters applied");
        }}
        onReset={() => setPlan("All")}
      />
      {/* Keyed so switching between add and edit reseeds the fields. */}
      <AttendanceEntryModal
        key={editing?.id ?? "add"}
        open={entryOpen}
        record={editing}
        onClose={() => setEntryOpen(false)}
        onSave={(input) => {
          saveEntry(input);
          showToast(input.id ? `${input.name} updated` : `${input.name} added to log`);
        }}
      />
      <AttendanceDeleteModal
        record={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={(record) => {
          removeRecord(record.id);
          setDeleteTarget(null);
          showToast(`${record.name} entry removed`);
        }}
      />
      <AttendanceImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={(fileName) =>
          showToast(fileName ? `Imported ${fileName}` : "No file selected — nothing imported")
        }
        onDownloadTemplate={() => showToast("Sample template downloaded")}
      />
      <AttendanceExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onExport={(format, scope) => {
          const count = scope === "filtered" ? visible.length : records.length;
          showToast(`Exported ${count} records as ${format}`);
        }}
      />
      <Toast message={message} visible={toastVisible} />
    </>
  );
};

export default Attendance;
