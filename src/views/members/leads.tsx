import { useState, type DragEvent } from "react";
import {
  Columns3,
  Download,
  Eye,
  Flame,
  List,
  Pencil,
  Percent,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
} from "lucide-react";
import Toast from "../../components/common/Toast";
import CommonSelect from "../../components/common-select/commonSelect";
import useToast from "../../hooks/useToast";
import type { Lead, LeadStage, LeadView } from "../../types/leads";
import { SOURCE_OPTIONS, TEMP_CLASS, TEMP_OPTIONS } from "../../utils/json/leadsData";
import { initials } from "../../utils/formatUtils";
import leadAvatar from "./leadAvatar";
import SOURCE_ICON, { FALLBACK_SOURCE_ICON } from "./sourceIcon";
import useLeads, {
  stageMeta,
  type SourceFilter,
  type TempFilter,
} from "./useLeads";
import LeadDetailModal from "./modal/leadDetailModal";
import AddLeadModal from "./modal/addLeadModal";
import EditLeadModal from "./modal/editLeadModal";
import ContactLeadModal from "./modal/contactLeadModal";
import DeleteLeadModal from "./modal/deleteLeadModal";

/*
   Leads & Enquiries — ported from tailwind/src/leads.html +
   assets/js/leads.js.

   The template re-wired dragstart/drop listeners after every board render;
   here the handlers are JSX props, so they survive re-renders on their own.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

const SOURCE_FILTER_OPTIONS = [
  { value: "All", label: "All Sources" },
  ...toOptions(SOURCE_OPTIONS),
];

const TEMP_FILTER_OPTIONS = [
  { value: "All", label: "All Temperature" },
  ...toOptions(TEMP_OPTIONS),
];

const Leads = () => {
  const {
    visible,
    byStage,
    view,
    setView,
    search,
    setSearch,
    source,
    setSource,
    temp,
    setTemp,
    kpis,
    moveStage,
    addLead,
    updateLead,
    removeLead,
  } = useLeads();
  const { message, visible: toastVisible, showToast } = useToast();

  const [detail, setDetail] = useState<Lead | null>(null);
  const [edit, setEdit] = useState<Lead | null>(null);
  const [contact, setContact] = useState<Lead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  /* Which card is being dragged, and which column is hovered. */
  const [dragId, setDragId] = useState<number | null>(null);
  const [dropStage, setDropStage] = useState<LeadStage | null>(null);

  const handleDrop = (event: DragEvent<HTMLDivElement>, stage: LeadStage) => {
    event.preventDefault();
    setDropStage(null);
    if (dragId == null) return;
    const lead = visible.find((item) => item.id === dragId);
    if (lead && lead.stage !== stage) {
      moveStage(lead.id, stage);
      showToast(`${lead.name} → ${stageMeta(stage).label}`);
    }
    setDragId(null);
  };

  const move = (lead: Lead, stage: LeadStage) => {
    moveStage(lead.id, stage);
    setDetail({ ...lead, stage });
    showToast(`Moved to ${stageMeta(stage).label}`);
  };

  return (
    <>
      {/* Page header */}
      <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black c-text">Leads &amp; Enquiries</h2>
          <p className="text-sm mt-0.5 c-dim">
            Track prospects from enquiry to membership · Austin HQ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => showToast("Leads exported")}
          >
            <Download className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Add Lead
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <UserPlus className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.total}</div>
            <div className="text-xs font-medium mt-1 c-dim">Total Leads</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <Flame className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.hot}</div>
            <div className="text-xs font-medium mt-1 c-dim">Hot Leads</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <UserCheck className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.converted}</div>
            <div className="text-xs font-medium mt-1 c-dim">Converted</div>
          </div>
        </div>
        <div className="sc-members reveal">
          <div className="sc-members-chip">
            <Percent className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black c-text leading-none">{kpis.rate}%</div>
            <div className="text-xs font-medium mt-1 c-dim">Conversion Rate</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-card p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] shrink-0"
            aria-hidden="true"
          />
          <input
            type="text"
            className="fp-input pl-9 py-2 text-sm"
            placeholder="Search lead, phone or interest…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <CommonSelect
          className="w-auto"
          fieldClassName="py-2 text-sm"
          ariaLabel="Filter by source"
          options={SOURCE_FILTER_OPTIONS}
          value={source}
          onChange={(option) => setSource((option?.value as SourceFilter) ?? "All")}
        />
        <CommonSelect
          className="w-auto"
          fieldClassName="py-2 text-sm"
          ariaLabel="Filter by temperature"
          options={TEMP_FILTER_OPTIONS}
          value={temp}
          onChange={(option) => setTemp((option?.value as TempFilter) ?? "All")}
        />
        <div className="flex items-center gap-1.5">
          {([
            { id: "board", label: "Board view", Icon: Columns3 },
            { id: "list", label: "List view", Icon: List },
          ] as { id: LeadView; label: string; Icon: typeof List }[]).map(
            ({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                className={id === view ? "view-btn active" : "view-btn"}
                title={label}
                aria-label={label}
                onClick={() => setView(id)}
              >
                <Icon className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
              </button>
            ),
          )}
        </div>
      </div>

      {/* Board view */}
      {view === "board" && (
        <div className="kanban">
          {byStage.map(({ stage, items }) => (
            <div
              key={stage.key}
              className={dropStage === stage.key ? "kcol drop" : "kcol"}
              onDragOver={(e) => {
                e.preventDefault();
                setDropStage(stage.key);
              }}
              onDragLeave={() => setDropStage(null)}
              onDrop={(e) => handleDrop(e, stage.key)}
            >
              <div className="kcol-head">
                <span className="kcol-dot" style={{ background: stage.color }} />
                <span className="text-[13px] font-bold c-text">{stage.label}</span>
                <span className="kcol-count">{items.length}</span>
              </div>
              <div className="kcol-body">
                {items.map((lead) => {
                  const Icon = SOURCE_ICON[lead.source] ?? FALLBACK_SOURCE_ICON;
                  return (
                    <div
                      key={lead.id}
                      className={dragId === lead.id ? "lead-card dragging" : "lead-card"}
                      draggable
                      onDragStart={() => setDragId(lead.id)}
                      onDragEnd={() => {
                        setDragId(null);
                        setDropStage(null);
                      }}
                      onClick={() => setDetail(lead)}
                    >
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className={`lead-av av ${leadAvatar(lead.id)}`}>
                          {initials(lead.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-bold c-text truncate">
                            {lead.name}
                          </div>
                          <div className="text-[11px] c-dim truncate">{lead.interest}</div>
                        </div>
                        <span className={`temp ${TEMP_CLASS[lead.temp]}`}>{lead.temp}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        {/* Sized here because .src-pill's CSS targets `i`, and
                            lucide renders an svg. */}
                        <span className="src-pill">
                          <Icon className="w-[10px] h-[10px] shrink-0" aria-hidden="true" />
                          {lead.source}
                        </span>
                        <span className="text-[10px] c-dim2">{lead.when}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table min-w-[900px]">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Contact</th>
                  <th>Interest</th>
                  <th>Source</th>
                  <th>Temp.</th>
                  <th>Stage</th>
                  <th>Owner</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((lead) => {
                  const meta = stageMeta(lead.stage);
                  const Icon = SOURCE_ICON[lead.source] ?? FALLBACK_SOURCE_ICON;
                  return (
                    <tr key={lead.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className={`lead-av av ${leadAvatar(lead.id)}`}>
                            {initials(lead.name)}
                          </div>
                          <span className="font-semibold c-text">{lead.name}</span>
                        </div>
                      </td>
                      <td className="text-[12px] c-dim">{lead.phone}</td>
                      <td>{lead.interest}</td>
                      <td>
                        <span className="src-pill">
                          <Icon style={{ width: "10px", height: "10px" }} aria-hidden="true" />
                          {lead.source}
                        </span>
                      </td>
                      <td>
                        <span className={`temp ${TEMP_CLASS[lead.temp]}`}>{lead.temp}</span>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{ background: `${meta.color}1f`, color: meta.color }}
                        >
                          <span className="dot" />
                          {meta.label}
                        </span>
                      </td>
                      <td className="text-[12px] c-dim">{lead.owner}</td>
                      <td>
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            type="button"
                            className="icon-btn view"
                            title="View"
                            onClick={() => setDetail(lead)}
                          >
                            <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="icon-btn"
                            title="Edit"
                            onClick={() => setEdit(lead)}
                          >
                            <Pencil className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="icon-btn danger"
                            title="Delete"
                            onClick={() => setDeleteTarget(lead)}
                          >
                            <Trash2 className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {visible.length === 0 && (
            <div className="text-center py-14">
              <div className="text-[38px] opacity-30 mb-2">🎯</div>
              <div className="text-sm font-bold c-text">No leads found</div>
              <div className="text-xs mt-1 c-dim">
                Try a different search, source, or temperature
              </div>
            </div>
          )}
        </div>
      )}

      <LeadDetailModal
        lead={detail}
        onClose={() => setDetail(null)}
        onMove={move}
        onEdit={(lead) => {
          setDetail(null);
          setEdit(lead);
        }}
        onDelete={(lead) => {
          setDetail(null);
          setDeleteTarget(lead);
        }}
        onContact={(lead) => setContact(lead)}
        onConvert={(lead) => {
          moveStage(lead.id, "Converted");
          setDetail(null);
          showToast(`${lead.name} converted to member! 🎉`);
        }}
      />
      <AddLeadModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={(input) => {
          addLead(input);
          showToast("Lead added to pipeline");
        }}
      />
      {/* Keyed so a different lead remounts the form with its values. */}
      <EditLeadModal
        key={edit?.id ?? "edit"}
        lead={edit}
        onClose={() => setEdit(null)}
        onSave={(input) => {
          updateLead(input);
          showToast(`${input.name.trim() || edit?.name} updated`);
        }}
      />
      <ContactLeadModal
        key={contact?.id ?? "contact"}
        lead={contact}
        onClose={() => setContact(null)}
        onChannel={(lead, channel) => showToast(`Contacting ${lead.name} via ${channel}`)}
        onSchedule={(lead) => {
          // A brand-new lead advances to Contacted when a follow-up is logged.
          if (lead.stage === "New") moveStage(lead.id, "Contacted");
          setContact(null);
          setDetail(null);
          showToast("Follow-up scheduled ✓");
        }}
      />
      <DeleteLeadModal
        lead={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={(lead) => {
          removeLead(lead.id);
          setDeleteTarget(null);
          showToast(`${lead.name} deleted`);
        }}
      />
      <Toast message={message} visible={toastVisible} />
    </>
  );
};

export default Leads;
