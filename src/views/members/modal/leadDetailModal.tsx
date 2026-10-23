import { Pencil, Phone, Trash2, UserCheck } from "lucide-react";
import Modal from "../../../components/common/Modal";
import type { Lead, LeadStage } from "../../../types/leads";
import { STAGES, TEMP_CLASS } from "../../../utils/json/leadsData";
import { initials } from "../../../utils/formatUtils";
import leadAvatar from "../leadAvatar";

/*
   Lead Details — ported from #modal-lead in tailwind/src/leads.html and
   openLead() in assets/js/leads.js.

   The stage buttons render gold for the current stage and ghost otherwise,
   and are labelled with the first word of the stage ("New", "Trial", …).
*/

type LeadDetailModalProps = {
  lead: Lead | null;
  onClose: () => void;
  onMove: (lead: Lead, stage: LeadStage) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onContact: (lead: Lead) => void;
  onConvert: (lead: Lead) => void;
};

const LeadDetailModal = ({
  lead,
  onClose,
  onMove,
  onEdit,
  onDelete,
  onContact,
  onConvert,
}: LeadDetailModalProps) => (
  <Modal
    open={lead !== null}
    onClose={onClose}
    title="Lead Details"
    boxClassName="glass modal-w-480"
    titleClassName="text-base"
    headerClassName="mb-4"
  >
    <div className="gold-border-card p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`lead-av av ${lead ? leadAvatar(lead.id) : "av-gold"} w-12! h-12! text-sm! rounded-xl`}
        >
          {lead ? initials(lead.name) : "--"}
        </div>
        <div className="flex-1">
          <div className="text-sm font-black c-text">{lead?.name ?? "—"}</div>
          <div className="text-[11px] c-gold font-semibold">{lead?.interest ?? "—"}</div>
        </div>
        <span className={`temp ${lead ? TEMP_CLASS[lead.temp] : "temp-warm"}`}>
          {lead ? `${lead.temp} Lead` : "—"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 pt-3 bd-t">
        <div>
          <div className="text-[10px] c-dim2 font-black uppercase tracking-wider mb-0.5">
            Phone
          </div>
          <div className="text-[13px] font-semibold c-text">{lead?.phone ?? "—"}</div>
        </div>
        <div>
          <div className="text-[10px] c-dim2 font-black uppercase tracking-wider mb-0.5">
            Email
          </div>
          <div className="text-[13px] font-semibold c-text truncate">{lead?.email ?? "—"}</div>
        </div>
        <div>
          <div className="text-[10px] c-dim2 font-black uppercase tracking-wider mb-0.5">
            Source
          </div>
          <div className="text-[13px] font-semibold c-text">{lead?.source ?? "—"}</div>
        </div>
        <div>
          <div className="text-[10px] c-dim2 font-black uppercase tracking-wider mb-0.5">
            Owner
          </div>
          <div className="text-[13px] font-semibold c-text">{lead?.owner ?? "—"}</div>
        </div>
      </div>
    </div>
    <div className="mb-2 text-[10px] font-black uppercase tracking-wider c-dim2">
      Move to stage
    </div>
    <div className="grid grid-cols-4 gap-2 mb-4">
      {STAGES.map((stage) => (
        <button
          key={stage.key}
          type="button"
          className={`${stage.key === lead?.stage ? "btn-gold" : "btn-ghost"} py-2 text-[11px]`}
          onClick={() => lead && onMove(lead, stage.key)}
        >
          {stage.label.split(" ")[0]}
        </button>
      ))}
    </div>
    <div className="flex gap-2 mb-2">
      <button
        type="button"
        className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
        onClick={() => lead && onEdit(lead)}
      >
        <Pencil className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
        Edit
      </button>
      <button
        type="button"
        className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2 c-red"
        onClick={() => lead && onDelete(lead)}
      >
        <Trash2 className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
        Delete
      </button>
    </div>
    <div className="flex gap-3">
      <button
        type="button"
        className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
        onClick={() => lead && onContact(lead)}
      >
        <Phone className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
        Contact
      </button>
      <button
        type="button"
        className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
        onClick={() => lead && onConvert(lead)}
      >
        <UserCheck className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
        Convert to Member
      </button>
    </div>
  </Modal>
);

export default LeadDetailModal;
