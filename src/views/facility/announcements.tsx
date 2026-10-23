import { useState } from "react";
import {
  Archive,
  ArchiveIcon,
  CalendarClock,
  CalendarX,
  Clock,
  Copy,
  Download,
  Eye,
  EyeOff,
  Megaphone,
  MoreVertical,
  Pencil,
  Pin,
  Printer,
  Radio,
  RefreshCw,
  Search,
  Send,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { FileEdit } from "lucide-react";
import type { Announcement, ExportFormat, ExportScope } from "../../types/announcements";
import { PRIO_CLASS, STATUS_BADGE, TYPES, meta } from "../../utils/json/announcementsData";
import { AUD_FALLBACK, AUD_ICON_CMP, TYPE_ICON } from "./announcementsIcons";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import useAnnouncements, { fmtDate, whenLabel } from "./useAnnouncements";
import AnnouncementFormModal from "./modal/announcementFormModal";
import AnnouncementViewModal from "./modal/announcementViewModal";
import AnnouncementScheduleModal from "./modal/announcementScheduleModal";
import AnnouncementPublishModal from "./modal/announcementPublishModal";
import AnnouncementUnpublishModal from "./modal/announcementUnpublishModal";
import AnnouncementArchiveModal from "./modal/announcementArchiveModal";
import AnnouncementExportModal from "./modal/announcementExportModal";
import AnnouncementDeleteModal from "./modal/announcementDeleteModal";

/*
   Announcements — ported from tailwind/src/announcements.html and
   assets/js/announcements.js. Broadcast list with real publish/expiry dates,
   status tabs, filters, sorting and the full modal suite: Add / Edit · View ·
   Schedule · Publish · Unpublish · Archive · Export · Delete.
*/

const STATUS_TABS: { tab: string; label: string; Icon: typeof Radio | null }[] = [
  { tab: "All", label: "All", Icon: null },
  { tab: "Active", label: "Active", Icon: Radio },
  { tab: "Scheduled", label: "Scheduled", Icon: Clock },
  { tab: "Draft", label: "Drafts", Icon: FileEdit },
  { tab: "Expired", label: "Expired", Icon: Archive },
];

type ModalKind =
  | "form"
  | "view"
  | "schedule"
  | "publish"
  | "unpublish"
  | "archive"
  | "export"
  | "delete";

const Announcements = () => {
  const page = useAnnouncements();
  const { anns, state, filtered, kpis, counts } = page;

  const [modal, setModal] = useState<ModalKind | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const target = targetId != null ? page.find(targetId) : null;

  const open = (kind: ModalKind, id: number | null) => {
    setTargetId(id);
    setModal(kind);
  };
  const close = () => setModal(null);

  const menuFor = (a: Announcement) => (
    <RowMenu
      triggerClassName="ann-menu"
      triggerTitle="More actions"
      trigger={<MoreVertical className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />}
    >
      <button type="button" className="dropdown-item" onClick={() => open("view", a.id)}>
        <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        View Details
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("form", a.id)}>
        <Pencil className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Edit
      </button>
      <button type="button" className="dropdown-item" onClick={() => page.duplicate(a.id)}>
        <Copy className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Duplicate
      </button>
      <div className="menu-sep" />
      <button
        type="button"
        className="dropdown-item"
        disabled={a.status === "Active"}
        onClick={() => open("publish", a.id)}
      >
        <Send className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        {a.status === "Scheduled" ? "Publish Now" : "Publish"}
      </button>
      <button
        type="button"
        className="dropdown-item"
        disabled={a.status !== "Active"}
        onClick={() => open("unpublish", a.id)}
      >
        <EyeOff className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Unpublish
      </button>
      <button
        type="button"
        className="dropdown-item"
        disabled={a.status === "Expired"}
        onClick={() => open("schedule", a.id)}
      >
        <CalendarClock className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        {a.status === "Scheduled" ? "Reschedule" : "Schedule"}
      </button>
      <button type="button" className="dropdown-item" onClick={() => page.togglePin(a.id)}>
        <Pin className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        {a.pinned ? "Unpin" : "Pin to top"}
      </button>
      <div className="menu-sep" />
      <button
        type="button"
        className="dropdown-item"
        onClick={() => page.exportAnns([a], "print-noop")}
      >
        <Printer className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Print
      </button>
      <button
        type="button"
        className="dropdown-item"
        disabled={a.status === "Expired"}
        onClick={() => open("archive", a.id)}
      >
        <ArchiveIcon className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Archive
      </button>
      <button type="button" className="dropdown-item danger" onClick={() => open("delete", a.id)}>
        <Trash2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Delete
      </button>
    </RowMenu>
  );

  /* Lifecycle-dependent primary buttons on each card. */
  const primaryButtons = (a: Announcement) => {
    if (a.status === "Draft")
      return (
        <>
          <button
            type="button"
            className="btn-ghost px-3 py-1.5 text-xs flex items-center gap-1.5"
            onClick={() => open("publish", a.id)}
          >
            <Send className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
            Publish
          </button>
          <button
            type="button"
            className="btn-ghost px-3 py-1.5 text-xs flex items-center gap-1.5"
            onClick={() => open("schedule", a.id)}
          >
            <CalendarClock className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
            Schedule
          </button>
        </>
      );
    if (a.status === "Scheduled")
      return (
        <>
          <button
            type="button"
            className="btn-ghost px-3 py-1.5 text-xs flex items-center gap-1.5"
            onClick={() => open("publish", a.id)}
          >
            <Send className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
            Publish Now
          </button>
          <button
            type="button"
            className="btn-ghost px-3 py-1.5 text-xs flex items-center gap-1.5"
            onClick={() => open("schedule", a.id)}
          >
            <CalendarClock className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
            Reschedule
          </button>
        </>
      );
    if (a.status === "Active")
      return (
        <>
          <button
            type="button"
            className="btn-ghost px-3 py-1.5 text-xs flex items-center gap-1.5"
            onClick={() => open("unpublish", a.id)}
          >
            <EyeOff className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
            Unpublish
          </button>
          <button
            type="button"
            className="btn-ghost px-3 py-1.5 text-xs flex items-center gap-1.5"
            onClick={() => open("archive", a.id)}
          >
            <Archive className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
            Archive
          </button>
        </>
      );
    return (
      <button
        type="button"
        className="btn-ghost px-3 py-1.5 text-xs flex items-center gap-1.5"
        onClick={() => page.republish(a.id)}
      >
        <RefreshCw className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
        Republish
      </button>
    );
  };

  return (
    <>
      {/* Page header */}
      <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black c-text">Announcements</h2>
          <p className="text-sm mt-0.5 c-dim">
            Broadcast notices to members &amp; staff · Austin HQ
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => open("export", null)}
          >
            <Download className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={page.showArchived}
          >
            <Archive className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Archive
          </button>
          <button
            type="button"
            className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
            onClick={() => open("form", null)}
          >
            <Megaphone className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            New Announcement
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-facility reveal">
          <div className="sc-facility-ring">
            <Megaphone className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div className="sc-facility-div" />
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.total}</div>
            <div className="text-xs font-medium mt-1 c-dim">Total Published</div>
          </div>
        </div>
        <div className="sc-facility reveal">
          <div className="sc-facility-ring">
            <Radio className="w-[18px] h-[18px] c-green shrink-0" aria-hidden="true" />
          </div>
          <div className="sc-facility-div" />
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.active}</div>
            <div className="text-xs font-medium mt-1 c-dim">Active Now</div>
          </div>
        </div>
        <div className="sc-facility reveal">
          <div className="sc-facility-ring">
            <Eye className="w-[18px] h-[18px] c-cyan shrink-0" aria-hidden="true" />
          </div>
          <div className="sc-facility-div" />
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.reach}</div>
            <div className="text-xs font-medium mt-1 c-dim">Total Reach</div>
          </div>
        </div>
        <div className="sc-facility reveal">
          <div className="sc-facility-ring">
            <CalendarClock className="w-[18px] h-[18px] c-orange shrink-0" aria-hidden="true" />
          </div>
          <div className="sc-facility-div" />
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.scheduled}</div>
            <div className="text-xs font-medium mt-1 c-dim">Scheduled</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div
          className="flex items-center gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Filter announcements by status"
        >
          {STATUS_TABS.map(({ tab, label, Icon }) => (
            <button
              key={tab}
              type="button"
              className={state.tab === tab ? "ord-tab active" : "ord-tab"}
              role="tab"
              aria-selected={state.tab === tab}
              onClick={() => page.setTab(tab)}
            >
              {Icon && <Icon className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />}
              {label} <span className="cnt">{counts[tab as keyof typeof counts]}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <select
            className="fp-input py-2 text-sm w-auto"
            aria-label="Filter by audience"
            value={state.audience}
            onChange={(e) => page.setAudience(e.target.value)}
          >
            <option value="All">All Audiences</option>
            <option>Everyone</option>
            <option>Members</option>
            <option>Staff</option>
          </select>
          <select
            className="fp-input py-2 text-sm w-auto"
            aria-label="Filter by type"
            value={state.type}
            onChange={(e) => page.setType(e.target.value)}
          >
            <option value="All">All Types</option>
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <select
            className="fp-input py-2 text-sm w-auto"
            aria-label="Sort announcements"
            value={state.sort}
            onChange={(e) => page.setSort(e.target.value)}
          >
            <option value="recent">Most recent</option>
            <option value="reach">Highest reach</option>
            <option value="priority">Priority</option>
            <option value="title">Title A–Z</option>
          </select>
          <div className="relative min-w-[170px]">
            <Search
              className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] shrink-0"
              aria-hidden="true"
            />
            <input
              type="text"
              className="fp-input pl-9 pr-9 py-2 text-sm"
              placeholder="Search…"
              aria-label="Search announcements"
              value={state.search}
              onChange={(e) => page.setSearch(e.target.value)}
            />
            <button
              type="button"
              className={`icon-btn absolute right-2 top-1/2 -translate-y-1/2${
                state.search ? "" : " hidden"
              }`}
              aria-label="Clear search"
              onClick={() => page.setSearch("")}
            >
              <X className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.map((a) => {
          const m = meta(a.type);
          const Icon = TYPE_ICON[a.type];
          const AudIcon = AUD_ICON_CMP[a.audience] ?? AUD_FALLBACK;
          return (
            <div
              key={a.id}
              className={`ann-card ${m.tcls}${a.pinned ? " pinned" : ""}${
                a.status === "Draft" ? " is-draft" : ""
              }`}
            >
              <span className="ann-accent" />
              <div className="flex items-start gap-3">
                <div className={`ann-ic ${m.cls}`}>
                  <Icon className="w-[19px] h-[19px] shrink-0" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {a.pinned && (
                      <Pin className="pin-ic w-[13px] h-[13px] shrink-0" aria-hidden="true" />
                    )}
                    <span className="ann-title">{a.title}</span>
                    <span className={`prio-pill ${PRIO_CLASS[a.priority]}`}>{a.priority}</span>
                    <span className={`badge ${STATUS_BADGE[a.status]} ml-auto`}>
                      <span className="dot" />
                      {a.status}
                    </span>
                    {menuFor(a)}
                  </div>
                  <p className="ann-body clamp">{a.body}</p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="chan-chip">
                      <AudIcon className="w-[10px] h-[10px] shrink-0" aria-hidden="true" />
                      {a.audience}
                    </span>
                    <span className="chan-chip">
                      <Tag className="w-[10px] h-[10px] shrink-0" aria-hidden="true" />
                      {a.type}
                    </span>
                    {a.channels.length > 0 && (
                      <span className="chan-chip">
                        <Send className="w-[10px] h-[10px] shrink-0" aria-hidden="true" />
                        {a.channels.join(" · ")}
                      </span>
                    )}
                    {a.reach > 0 && (
                      <span className="chan-chip">
                        <Eye className="w-[10px] h-[10px] shrink-0" aria-hidden="true" />
                        {a.reach.toLocaleString("en-US")} reached
                      </span>
                    )}
                    {a.expireAt && a.status === "Active" && (
                      <span className="chan-chip">
                        <CalendarX className="w-[10px] h-[10px] shrink-0" aria-hidden="true" />
                        Ends {fmtDate(a.expireAt)}
                      </span>
                    )}
                    <span className="text-[10px] c-dim2 ml-auto">{whenLabel(a)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <button
                      type="button"
                      className="btn-ghost px-3 py-1.5 text-xs flex items-center gap-1.5"
                      onClick={() => open("view", a.id)}
                    >
                      <Eye className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                      View
                    </button>
                    <button
                      type="button"
                      className="btn-ghost px-3 py-1.5 text-xs flex items-center gap-1.5"
                      onClick={() => open("form", a.id)}
                    >
                      <Pencil className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                      Edit
                    </button>
                    {primaryButtons(a)}
                    <button
                      type="button"
                      className="btn-ghost px-3 py-1.5 text-xs flex items-center gap-1.5"
                      onClick={() => page.togglePin(a.id)}
                    >
                      <Pin className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                      {a.pinned ? "Unpin" : "Pin"}
                    </button>
                    <button
                      type="button"
                      className="btn-ghost px-3 py-1.5 text-xs flex items-center gap-1.5 ml-auto danger-link"
                      aria-label={`Delete ${a.title}`}
                      onClick={() => open("delete", a.id)}
                    >
                      <Trash2 className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className={`text-center py-16${filtered.length !== 0 ? " hidden" : ""}`}>
        <div className="text-[42px] opacity-30 mb-2">📢</div>
        <div className="text-sm font-bold c-text">No announcements found</div>
        <div className="text-xs mt-1 c-dim">Try a different filter — or create a new one</div>
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            type="button"
            className="btn-ghost px-4 py-2 text-xs"
            onClick={page.resetFilters}
          >
            Reset filters
          </button>
          <button
            type="button"
            className="btn-gold px-4 py-2 text-xs"
            onClick={() => open("form", null)}
          >
            New Announcement
          </button>
        </div>
      </div>

      <div
        className={`flex items-center justify-between mt-5 text-xs c-dim2${
          filtered.length === 0 ? " hidden" : ""
        }`}
      >
        <span>
          Showing <span>{filtered.length}</span> of <span>{anns.length}</span> announcements
        </span>
      </div>

      {/* ══════════════ MODALS ══════════════ */}
      <AnnouncementFormModal
        key={`form-${target?.id ?? "new"}`}
        open={modal === "form"}
        target={modal === "form" ? target : null}
        onClose={close}
        onSubmit={page.saveForm}
      />
      <AnnouncementViewModal
        announcement={modal === "view" ? target : null}
        onClose={close}
        onDuplicate={() => {
          if (target) page.duplicate(target.id);
          close();
        }}
        onPrint={() => {
          if (target) page.exportAnns([target], "print-noop");
          close();
        }}
        onDelete={() => setModal("delete")}
        onEdit={() => setModal("form")}
        onPublish={() => setModal("publish")}
        onUnpublish={() => setModal("unpublish")}
        onRepublish={() => {
          if (target) page.republish(target.id);
          close();
        }}
      />
      <AnnouncementScheduleModal
        key={`schedule-${target?.id ?? "none"}`}
        announcement={modal === "schedule" ? target : null}
        onClose={close}
        onConfirm={page.submitSchedule}
      />
      <AnnouncementPublishModal
        announcement={modal === "publish" ? target : null}
        onClose={close}
        onConfirm={page.confirmPublish}
      />
      <AnnouncementUnpublishModal
        announcement={modal === "unpublish" ? target : null}
        onClose={close}
        onConfirm={page.confirmUnpublish}
      />
      <AnnouncementArchiveModal
        announcement={modal === "archive" ? target : null}
        onClose={close}
        onConfirm={page.confirmArchive}
      />
      <AnnouncementExportModal
        key={modal === "export" ? "export-open" : "export-closed"}
        open={modal === "export"}
        onClose={close}
        filteredCount={filtered.length}
        activeCount={counts.Active}
        allCount={anns.length}
        rowsFor={(scope: ExportScope) => page.rowsForScope(scope)}
        onConfirm={(rows: Announcement[], format: ExportFormat) => page.exportAnns(rows, format)}
      />
      <AnnouncementDeleteModal
        announcement={modal === "delete" ? target : null}
        onClose={close}
        onConfirm={page.confirmDelete}
      />

      <Toast message={page.toast.message} visible={page.toast.visible} />
    </>
  );
};

export default Announcements;
