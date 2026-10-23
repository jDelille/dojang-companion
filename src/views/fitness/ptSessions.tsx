import { useState } from "react";
import {
  Ban,
  CalendarCheck,
  CalendarClock,
  CircleCheck,
  Clock,
  DollarSign,
  Download,
  Edit2,
  Eye,
  Gauge,
  MoreVertical,
  Plus,
  RotateCcw,
  Trash2,
  UserCog,
  UserPlus,
} from "lucide-react";
import type { PtSession } from "../../types/ptSessions";
import { AMPM, PT_TRAINERS, TIMES, ptAvatarFor } from "../../utils/json/ptSessionsData";
import { initials } from "../../utils/formatUtils";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import usePtSessions, { STATUS_BADGE, STATUS_LABEL } from "./usePtSessions";
import PtSessionFormModal from "./modal/ptSessionFormModal";
import PtSessionViewModal from "./modal/ptSessionViewModal";
import PtRescheduleModal from "./modal/ptRescheduleModal";
import PtAssignTrainerModal from "./modal/ptAssignTrainerModal";
import PtAssignMemberModal from "./modal/ptAssignMemberModal";
import PtConfirmModal from "./modal/ptConfirmModal";

/*
   Personal Training Sessions — ported from tailwind/src/pt-sessions.html and
   assets/js/pt-sessions.js. Trainer availability grid, session records and the
   full modal suite.
*/

const FILTERS = [
  { value: "all", label: "All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

type ModalKind =
  | "form"
  | "view"
  | "reschedule"
  | "assign-trainer"
  | "assign-member"
  | "complete"
  | "cancel"
  | "delete";

const PtSessions = () => {
  const page = usePtSessions();
  const {
    kpis,
    trainerChips,
    availability,
    todayList,
    activeTrainer,
    selectedSlot,
    filter,
    setFilter,
  } = page;

  const [modal, setModal] = useState<ModalKind | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const target = targetId != null ? page.find(targetId) : null;

  const open = (kind: ModalKind, id: number | null) => {
    setTargetId(id);
    setModal(kind);
  };
  const close = () => setModal(null);

  /* Booking straight from a free availability slot preseeds the form. */
  const bookSlot = (slot: number) => {
    if (!page.pickSlot(slot)) return;
    setTargetId(null);
    setModal("form");
  };

  /* Per-session menu — the status actions vary with the session's state. */
  const menuFor = (s: PtSession) => (
    <RowMenu
      triggerClassName="sess-menu-btn"
      triggerTitle="More"
      trigger={<MoreVertical className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />}
    >
      <button type="button" className="dropdown-item" onClick={() => open("view", s.id)}>
        <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        View Details
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("form", s.id)}>
        <Edit2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Edit Session
      </button>
      <button type="button" className="dropdown-item" onClick={() => open("reschedule", s.id)}>
        <CalendarClock className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Reschedule
      </button>
      <button
        type="button"
        className="dropdown-item"
        onClick={() => open("assign-trainer", s.id)}
      >
        <UserCog className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Assign Trainer
      </button>
      <button
        type="button"
        className="dropdown-item"
        onClick={() => open("assign-member", s.id)}
      >
        <UserPlus className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Assign Member
      </button>
      {s.status === "scheduled" && (
        <>
          <button
            type="button"
            className="dropdown-item ok"
            onClick={() => open("complete", s.id)}
          >
            <CircleCheck className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
            Complete
          </button>
          <button type="button" className="dropdown-item" onClick={() => open("cancel", s.id)}>
            <Ban className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
            Cancel Session
          </button>
        </>
      )}
      {s.status === "cancelled" && (
        <button
          type="button"
          className="dropdown-item"
          onClick={() => page.restoreSession(s.id)}
        >
          <RotateCcw className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          Restore
        </button>
      )}
      {s.status === "completed" && (
        <button type="button" className="dropdown-item" onClick={() => open("cancel", s.id)}>
          <Ban className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          Cancel Session
        </button>
      )}
      <div className="menu-sep" />
      <button type="button" className="dropdown-item danger" onClick={() => open("delete", s.id)}>
        <Trash2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Delete
      </button>
    </RowMenu>
  );

  const activeTrainerName = PT_TRAINERS.find((t) => t.id === activeTrainer)?.name ?? "—";

  return (
    <>
      {/* Page header */}
      <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black c-text">Personal Training Sessions</h2>
          <p className="text-sm mt-0.5 c-dim">
            Book &amp; manage 1-on-1 training · Mon, Jul 14, 2026 · Austin HQ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={page.exportSchedule}
          >
            <Download className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
            onClick={() => open("form", null)}
          >
            <Plus className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Book Session
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-fitness reveal">
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.today}</div>
            <div className="text-xs font-medium mt-1 c-dim">Sessions Today</div>
          </div>
          <div className="icon-box ic-gold">
            <CalendarCheck className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
        </div>
        <div className="sc-fitness reveal">
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.open}</div>
            <div className="text-xs font-medium mt-1 c-dim">Open Slots</div>
          </div>
          <div className="icon-box ic-green">
            <Clock className="w-[18px] h-[18px] c-green shrink-0" aria-hidden="true" />
          </div>
        </div>
        <div className="sc-fitness reveal">
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.revenue}</div>
            <div className="text-xs font-medium mt-1 c-dim">PT Revenue Today</div>
          </div>
          <div className="icon-box ic-cyan">
            <DollarSign className="w-[18px] h-[18px] c-cyan shrink-0" aria-hidden="true" />
          </div>
        </div>
        <div className="sc-fitness reveal">
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.util}</div>
            <div className="text-xs font-medium mt-1 c-dim">Utilisation</div>
          </div>
          <div className="icon-box ic-purple">
            <Gauge className="w-[18px] h-[18px] c-purple shrink-0" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Booking column */}
        <div className="xl:col-span-2 space-y-5">
          {/* Trainer selector */}
          <div className="glass-card p-4">
            <h3 className="font-bold c-text sec-title mb-3">Select Trainer</h3>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {trainerChips.map(({ trainer, open: openSlots }) => (
                <div
                  key={trainer.id}
                  className={
                    trainer.id === activeTrainer ? "trainer-chip active" : "trainer-chip"
                  }
                  role="button"
                  tabIndex={0}
                  onClick={() => page.selectTrainer(trainer.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") page.selectTrainer(trainer.id);
                  }}
                >
                  <div className={`tc-av av ${ptAvatarFor(trainer.id)}`}>
                    {initials(trainer.name)}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold c-text">{trainer.name}</div>
                    <div className="text-[10px] c-dim">{openSlots} slots open</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold c-text sec-title">
                Available Slots · <span className="c-gold">{activeTrainerName}</span>
              </h3>
              <div className="flex items-center gap-3 text-[11px] c-dim">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm instyle-42" />
                  Open
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm instyle-43" />
                  Booked
                </span>
              </div>
            </div>
            <div className="avail-grid">
              {availability.map((slot) => (
                <div
                  key={slot.index}
                  className={`slot ${slot.taken ? "booked" : "open"}${slot.selected ? " sel" : ""}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => bookSlot(slot.index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") bookSlot(slot.index);
                  }}
                >
                  <div className="t">{slot.time}</div>
                  <div className="text-[9px] c-dim2 font-bold">{slot.ampm}</div>
                  <div className="s">{slot.taken ? "Booked" : "Open"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's schedule */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold c-text sec-title">Today&apos;s Sessions</h3>
            <span className="badge badge-active">{todayList.length}</span>
          </div>
          <div className="flex items-center gap-1.5 mb-4 flex-wrap">
            {FILTERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={filter === value ? "ord-tab active" : "ord-tab"}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="space-y-2.5">
            {todayList.map((s) => {
              const trainer = PT_TRAINERS.find((t) => t.id === s.trainerId);
              return (
                <div
                  key={s.id}
                  className={`sess-row${s.status === "cancelled" ? " is-cancelled" : ""}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => open("view", s.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") open("view", s.id);
                  }}
                >
                  <div className="sess-time">
                    <div className="h">{TIMES[s.slot]}</div>
                    <div className="ap">{AMPM[s.slot]}</div>
                  </div>
                  <div className={`pt-avatar av ${ptAvatarFor(s.trainerId)}`}>
                    {initials(s.member)}
                  </div>
                  <div className="sess-main">
                    <div className="sess-member">{s.member}</div>
                    <div className="sess-sub">
                      {trainer?.name} · {s.focus}
                    </div>
                  </div>
                  <span className={`badge ${STATUS_BADGE[s.status]}`}>
                    <span className="dot" />
                    {STATUS_LABEL[s.status]}
                  </span>
                  {menuFor(s)}
                </div>
              );
            })}
          </div>
          <div className={`text-center py-10${todayList.length ? " hidden" : ""}`}>
            <div className="text-[32px] opacity-30 mb-2">🗓️</div>
            <div className="text-xs font-bold c-text">No sessions booked</div>
          </div>
        </div>
      </div>

      {/* ══════════════ MODALS ══════════════ */}
      <PtSessionFormModal
        key={`form-${target?.id ?? "new"}-${selectedSlot ?? "x"}-${activeTrainer}`}
        open={modal === "form"}
        target={modal === "form" ? target : null}
        presetTrainer={activeTrainer}
        presetSlot={selectedSlot}
        slotOptions={page.openSlotOptions}
        onClose={close}
        onSubmit={page.saveSession}
      />
      <PtSessionViewModal
        target={modal === "view" ? target : null}
        onClose={close}
        onReschedule={() => setModal("reschedule")}
        onComplete={() => setModal("complete")}
        onEdit={() => setModal("form")}
      />
      <PtRescheduleModal
        key={`reschedule-${target?.id ?? "none"}`}
        target={modal === "reschedule" ? target : null}
        slotOptions={page.openSlotOptions}
        onClose={close}
        onConfirm={page.reschedule}
      />
      <PtAssignTrainerModal
        key={`assign-trainer-${target?.id ?? "none"}`}
        target={modal === "assign-trainer" ? target : null}
        onClose={close}
        onConfirm={page.assignTrainer}
      />
      <PtAssignMemberModal
        key={`assign-member-${target?.id ?? "none"}`}
        target={modal === "assign-member" ? target : null}
        onClose={close}
        onConfirm={page.assignMember}
      />
      <PtConfirmModal
        kind="complete"
        target={modal === "complete" ? target : null}
        onClose={close}
        onConfirm={page.completeSession}
      />
      <PtConfirmModal
        kind="cancel"
        target={modal === "cancel" ? target : null}
        onClose={close}
        onConfirm={page.cancelSession}
      />
      <PtConfirmModal
        kind="delete"
        target={modal === "delete" ? target : null}
        onClose={close}
        onConfirm={page.deleteSession}
      />

      <Toast message={page.toast.message} visible={page.toast.visible} />
    </>
  );
};

export default PtSessions;
