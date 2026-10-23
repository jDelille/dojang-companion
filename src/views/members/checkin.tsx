import { useState } from "react";
import {
  AlertTriangle,
  Camera,
  Clock,
  Download,
  Edit2,
  Eye,
  History,
  LogOut,
  MoreVertical,
  Nfc,
  Scan,
  ScanBarcode,
  ScanLine,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import CommonSelect from "../../components/common-select/commonSelect";
import useToast from "../../hooks/useToast";
import type { CheckinLogEntry, CheckinMember } from "../../types/checkin";
import {
  CAPACITY_ARC,
  CHECKIN_KPIS,
  LOG_FILTERS,
  LOG_STATUS_BADGE,
  PLAN_BADGE,
  planShort,
  TRAFFIC,
} from "../../utils/json/checkinData";
import { number } from "../../utils/formatUtils";
import CheckinResult from "./checkinResult";
import useCheckin, { type LogFilter } from "./useCheckin";
import ManualCheckinModal from "./modal/manualCheckinModal";
import MemberSearchModal from "./modal/memberSearchModal";
import QrScanModal from "./modal/qrScanModal";
import CheckinViewModal from "./modal/checkinViewModal";
import CheckinEditModal from "./modal/checkinEditModal";
import CheckoutConfirmModal from "./modal/checkoutConfirmModal";
import CheckinHistoryModal from "./modal/checkinHistoryModal";
import CheckinDeleteModal from "./modal/checkinDeleteModal";
import BulkCheckinModal from "./modal/bulkCheckinModal";

/*
   Check-In Station — ported from tailwind/src/checkin.html +
   assets/js/checkin.js.

   The scanner frame is decorative (CSS animation only); all three scan
   buttons open the same QR-result modal, as they did in the template.
*/

const LOG_FILTER_OPTIONS = LOG_FILTERS.map((value) => ({
  value,
  label: value === "All" ? "All Entries" : value,
}));

const Checkin = () => {
  const {
    visible,
    filter,
    setFilter,
    search,
    setSearch,
    inlineResults,
    searchMembers,
    capacity,
    checkInMember,
    saveEntry,
    checkOut,
    removeEntry,
    scanMember,
  } = useCheckin();
  const { message, visible: toastVisible, showToast } = useToast();

  const [manualOpen, setManualOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [qrTarget, setQrTarget] = useState<CheckinMember | null>(null);
  const [view, setView] = useState<CheckinLogEntry | null>(null);
  const [editing, setEditing] = useState<CheckinLogEntry | null>(null);
  const [checkoutTarget, setCheckoutTarget] = useState<CheckinLogEntry | null>(null);
  const [historyTarget, setHistoryTarget] = useState<CheckinLogEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CheckinLogEntry | null>(null);

  /** Runs a check-in and toasts the template's success or denial message. */
  const runCheckIn = (name: string, options?: Parameters<typeof checkInMember>[1]) => {
    const result = checkInMember(name, options);
    showToast(
      result.ok
        ? `✓ ${result.name} checked in`
        : `✗ ${result.name} membership expired — entry denied`,
    );
    return result;
  };

  const menuItemsFor = (entry: CheckinLogEntry) => (
    <>
      <button type="button" className="dropdown-item" onClick={() => setView(entry)}>
        <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        View Details
      </button>
      <button type="button" className="dropdown-item" onClick={() => setEditing(entry)}>
        <Edit2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Edit
      </button>
      <button type="button" className="dropdown-item" onClick={() => setHistoryTarget(entry)}>
        <History className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Attendance History
      </button>
      <button type="button" className="dropdown-item" onClick={() => setCheckoutTarget(entry)}>
        <LogOut className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Check Out
      </button>
      <div className="menu-sep" />
      <button
        type="button"
        className="dropdown-item danger"
        onClick={() => setDeleteTarget(entry)}
      >
        <Trash2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Delete
      </button>
    </>
  );

  return (
    <>
      {/* Page header */}
      <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black c-text">Check-In Station</h2>
          <p className="text-sm mt-0.5 c-dim">
            Live member entry · Capacity monitoring · Access control
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge-active text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            System Live
          </span>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => setManualOpen(true)}
          >
            <UserPlus className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Manual Check-In
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => setBulkOpen(true)}
          >
            <Scan className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Bulk Entry
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <ScanLine className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xl font-black c-text">{CHECKIN_KPIS.checkinsToday}</div>
            <div className="text-xs font-medium c-dim">Check-ins Today</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <Users className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xl font-black c-text">{capacity.inside}</div>
            <div className="text-xs font-medium c-dim">Currently Inside</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <Clock className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xl font-black c-text">{CHECKIN_KPIS.peakHour}</div>
            <div className="text-xs font-medium c-dim">Peak Hour</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <AlertTriangle className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xl font-black c-text">{CHECKIN_KPIS.expiredDenied}</div>
            <div className="text-xs font-medium c-dim">Expired Denied</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Left: Scanner + Search */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* QR Scanner UI — decorative; the buttons open the result modal. */}
          <div className="gold-border-card p-6 relative overflow-hidden">
            <div className="absolute inset-0 qr-glow" />
            <div className="relative text-center mb-5">
              <h3 className="font-bold c-text text-lg">Scan QR or Barcode</h3>
              <p className="text-xs mt-1 c-dim">Align the code within the frame below</p>
            </div>
            <div className="relative mx-auto qr-stage">
              <div className="absolute inset-0 qr-border" />
              <div className="qr-corner qr-tl" />
              <div className="qr-corner qr-tr" />
              <div className="qr-corner qr-bl" />
              <div className="qr-corner qr-br" />
              <div className="scan-line" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="qr-reticle" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-6 mt-5 relative">
              {[
                { cls: "scan-gold", label: "Scan", Icon: ScanBarcode, aria: "Scan barcode" },
                { cls: "scan-indigo", label: "Camera", Icon: Camera, aria: "Scan with camera" },
                { cls: "scan-cyan", label: "NFC", Icon: Nfc, aria: "Scan via NFC" },
              ].map(({ cls, label, Icon, aria }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    className={`scan-btn ${cls}`}
                    aria-label={aria}
                    onClick={() => setQrTarget(scanMember())}
                  >
                    <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                  </button>
                  <span className="text-[10px] font-semibold c-dim">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Manual Member Lookup */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold c-text">Manual Check-In</h3>
              <button
                type="button"
                className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 text-xs"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
                Member Search
              </button>
            </div>
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search
                  className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] shrink-0"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  className="fp-input pl-9 py-2.5 text-sm"
                  placeholder="Search member by name, phone, ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn-ghost px-3 py-2.5 text-sm flex items-center gap-1"
                onClick={() => setSearch("")}
              >
                <X className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
                Clear
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {search.trim() &&
                (inlineResults.length ? (
                  inlineResults.map((member) => (
                    <CheckinResult
                      key={member.mid}
                      member={member}
                      onCheckIn={(item) => runCheckIn(item.name)}
                    />
                  ))
                ) : (
                  <div className="text-center py-6 text-xs c-dim2">No members found</div>
                ))}
            </div>
          </div>
        </div>

        {/* Right: Capacity + Stats */}
        <div className="flex flex-col gap-5">
          {/* Capacity Ring */}
          <div className="glass-card p-5 text-center">
            <h3 className="font-bold c-text mb-4">Current Capacity</h3>
            <div className="relative mx-auto mb-3 cap-ring">
              <svg viewBox="0 0 100 100" className="w-full h-full cap-svg">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="rgba(212,175,55,0.08)"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="10"
                  strokeDasharray={CAPACITY_ARC}
                  strokeDashoffset={capacity.dashOffset}
                  strokeLinecap="round"
                  className="cap-arc"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-2xl font-black gt">{capacity.inside}</div>
                <div className="text-[10px] c-dim">of {capacity.max}</div>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-1">
              <div className="text-center">
                <div className="text-xs font-bold c-green">{capacity.pct}%</div>
                <div className="text-[10px] c-dim2">Capacity</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold c-orange">{capacity.remaining}</div>
                <div className="text-[10px] c-dim2">Remaining</div>
              </div>
            </div>
          </div>

          {/* Hourly Traffic */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold c-text text-sm">Hourly Traffic</h3>
              <span className="text-[10px] font-bold c-dim2">Today</span>
            </div>
            <div className="ht-wrap">
              {TRAFFIC.map((hour) => (
                <div key={hour.h} className="ht-col">
                  <div
                    className={hour.peak ? "ht-bar peak" : "ht-bar"}
                    style={{ height: `${hour.pct}%` }}
                  />
                  <span className="ht-lbl">{hour.h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Member Status Summary */}
          <div className="glass-card p-5">
            <h3 className="font-bold c-text text-sm mb-3">Member Status</h3>
            <div className="flex flex-col gap-2.5">
              <div className="ms-row ms-green">
                <div className="flex items-center gap-2">
                  <span className="ms-dot bg-green-400" />
                  <span className="text-xs c-text2">Active Members</span>
                </div>
                <span className="text-sm font-bold c-text">{number(1842)}</span>
              </div>
              <div className="ms-row ms-orange">
                <div className="flex items-center gap-2">
                  <span className="ms-dot bg-orange-400" />
                  <span className="text-xs c-text2">Expiring This Week</span>
                </div>
                <span className="text-sm font-bold c-orange">24</span>
              </div>
              <div className="ms-row ms-red">
                <div className="flex items-center gap-2">
                  <span className="ms-dot bg-red-400" />
                  <span className="text-xs c-text2">Expired Today</span>
                </div>
                <span className="text-sm font-bold c-red">3</span>
              </div>
              <div className="ms-row ms-gold">
                <div className="flex items-center gap-2">
                  <span className="ms-dot bg-gold" />
                  <span className="text-xs c-text2">New Joins</span>
                </div>
                <span className="text-sm font-bold c-gold">38</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Check-In Log */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-4">
          <h3 className="font-bold c-text">Today&apos;s Check-In Log</h3>
          <div className="flex gap-2">
            <CommonSelect
              className="w-auto"
              fieldClassName="py-2 text-sm"
              ariaLabel="Filter log"
              options={LOG_FILTER_OPTIONS}
              value={filter}
              onChange={(option) => setFilter((option?.value as LogFilter) ?? "All")}
            />
            <button
              type="button"
              className="btn-ghost flex items-center gap-2 px-3 py-1.5 text-xs"
              onClick={() => showToast("Check-in log exported")}
            >
              <Download className="w-3 h-3 shrink-0" aria-hidden="true" />
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full data-table min-w-[900px]">
            <thead>
              <tr>
                <th className="text-left">#</th>
                <th className="text-left">Member</th>
                <th className="text-left">Plan</th>
                <th className="text-left">Check-In</th>
                <th className="text-left">Status</th>
                <th className="text-left">Trainer</th>
                <th className="text-left">Locker</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((entry) => (
                <tr key={entry.id}>
                  <td className="text-xs c-dim2">#{String(entry.id).padStart(3, "0")}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className={`ci-av ci-av-sm ${entry.tint}`}>{entry.initials}</div>
                      <span className="text-sm c-text">{entry.name}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`${PLAN_BADGE[entry.plan] ?? "badge-inactive"} text-[10px] px-2 py-0.5 rounded-full`}
                    >
                      {planShort(entry.plan)}
                    </span>
                  </td>
                  <td className="text-xs c-text">{entry.time}</td>
                  <td>
                    <span
                      className={`${LOG_STATUS_BADGE[entry.status] ?? "badge-inactive"} text-[10px] px-2 py-0.5 rounded-full`}
                    >
                      {entry.status}
                    </span>
                  </td>
                  <td className="text-xs c-dim">{entry.trainer}</td>
                  <td className="text-xs c-text">{entry.locker}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        className="icon-btn"
                        title="View"
                        onClick={() => setView(entry)}
                      >
                        <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                      </button>
                      {entry.status === "In Gym" && (
                        <button
                          type="button"
                          className="icon-btn"
                          title="Check out"
                          onClick={() => setCheckoutTarget(entry)}
                        >
                          <LogOut className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                        </button>
                      )}
                      <RowMenu
                        triggerTitle="More"
                        trigger={
                          <MoreVertical
                            className="w-[15px] h-[15px] shrink-0"
                            aria-hidden="true"
                          />
                        }
                      >
                        {menuItemsFor(entry)}
                      </RowMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {visible.length === 0 && (
          <div className="text-center py-14">
            <div className="text-[40px] opacity-30 mb-2">🚪</div>
            <div className="text-sm font-bold c-text">No entries</div>
            <div className="text-xs mt-1 c-dim">Try a different filter</div>
          </div>
        )}
        <div className="flex items-center justify-between px-5 py-3 bd-t">
          <span className="text-xs c-dim2">
            Showing <span>{visible.length}</span> of {CHECKIN_KPIS.checkinsToday} entries today
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

      {/* Keyed so each open reseeds the form. */}
      <ManualCheckinModal
        key={manualOpen ? "manual-open" : "manual-closed"}
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        onConfirm={(name, options) => {
          runCheckIn(name, options);
          setManualOpen(false);
        }}
      />
      <MemberSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        searchMembers={searchMembers}
        onCheckIn={(member) => runCheckIn(member.name)}
      />
      <QrScanModal
        member={qrTarget}
        onClose={() => setQrTarget(null)}
        onConfirm={(member) => {
          runCheckIn(member.name);
          setQrTarget(null);
        }}
      />
      <CheckinViewModal
        entry={view}
        onClose={() => setView(null)}
        onHistory={(entry) => {
          setView(null);
          setHistoryTarget(entry);
        }}
        onCheckOut={(entry) => {
          setView(null);
          setCheckoutTarget(entry);
        }}
      />
      <CheckinEditModal
        key={editing?.id ?? "edit"}
        entry={editing}
        onClose={() => setEditing(null)}
        onSave={(input) => {
          saveEntry(input);
          setEditing(null);
          showToast("Entry updated");
        }}
      />
      <CheckoutConfirmModal
        entry={checkoutTarget}
        onClose={() => setCheckoutTarget(null)}
        onConfirm={(entry) => {
          checkOut(entry.id);
          setCheckoutTarget(null);
          showToast(`${entry.name} checked out`);
        }}
      />
      <CheckinHistoryModal
        entry={historyTarget}
        onClose={() => setHistoryTarget(null)}
      />
      <CheckinDeleteModal
        entry={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={(entry) => {
          removeEntry(entry.id);
          setDeleteTarget(null);
          showToast("Entry deleted");
        }}
      />
      <BulkCheckinModal
        key={bulkOpen ? "bulk-open" : "bulk-closed"}
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onConfirm={(names) => {
          names.forEach((name) => checkInMember(name));
          setBulkOpen(false);
          if (names.length) showToast(`✓ ${names.length} members checked in`);
        }}
      />
      <Toast message={message} visible={toastVisible} />
    </>
  );
};

export default Checkin;
