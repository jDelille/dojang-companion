import { useState } from "react";
import { Check, Download, Plus, Printer, Search, Trash2 } from "lucide-react";
import Modal from "../../../components/common/Modal";
import WorkflowTabs from "./workflowTabs";
import CommonSelect, { type Option } from "../../../components/common-select/commonSelect";
import PredefinedDatePicker from "../../../components/common-date-range-picker/PredefinedDatePicker";

type ActionStatus = "Approved" | "Pending" | "Rejected";

type AuditLog = {
  id: string;
  workflowId: string;
  role: string;
  date: string;
  comment: string;
  status: ActionStatus;
};

const auditLogs: AuditLog[] = [
  {
    id: "#ACT0020",
    workflowId: "#WFL0020",
    role: "Dept Manager",
    date: "11 Sep 2025",
    comment: "Looks OK - forward to Finance",
    status: "Approved",
  },
  {
    id: "#ACT0019",
    workflowId: "#WFL0019",
    role: "Procurement Officer",
    date: "05 Sep 2025",
    comment: "Vendor verified",
    status: "Pending",
  },
  {
    id: "#ACT0018",
    workflowId: "#WFL0018",
    role: "Line Manager",
    date: "27 Aug 2025",
    comment: "Dept - level OK",
    status: "Rejected",
  },
  {
    id: "#ACT0017",
    workflowId: "#WFL0017",
    role: "HR Manager",
    date: "16 Aug 2025",
    comment: "Too long leave in quarter - end",
    status: "Approved",
  },
  {
    id: "#ACT0016",
    workflowId: "#WFL0016",
    role: "Project Manager",
    date: "25 Jul 2025",
    comment: "Hours OK",
    status: "Pending",
  },
  {
    id: "#ACT0015",
    workflowId: "#WFL0015",
    role: "Compliance Officer",
    date: "12 Jul 2025",
    comment: "Compliant",
    status: "Rejected",
  },
  {
    id: "#ACT0014",
    workflowId: "#WFL0014",
    role: "Asset Manager",
    date: "23 Jun 2025",
    comment: "Valuation requested from vendor",
    status: "Approved",
  },
  {
    id: "#ACT0013",
    workflowId: "#WFL0013",
    role: "Sales Manager",
    date: "07 Jun 2025",
    comment: "Need client approval on pricing",
    status: "Pending",
  },
  {
    id: "#ACT0012",
    workflowId: "#WFL0012",
    role: "IT Team Lead",
    date: "28 May 2025",
    comment: "Access provisioned (temporary)",
    status: "Rejected",
  },
  {
    id: "#ACT0011",
    workflowId: "#WFL0011",
    role: "Legal Counsel",
    date: "18 May 2025",
    comment: "Redlines added - awaiting vendor sign",
    status: "Approved",
  },
];

const statusClass: Record<ActionStatus, string> = {
  Approved: "text-[11px] bg-success-transparent c-green px-2 py-0.5 rounded",
  Pending: "text-[11px] bg-warning-transparent c-orange px-2 py-0.5 rounded",
  Rejected: "text-[11px] bg-danger-transparent c-red px-2 py-0.5 rounded",
};

const toOptions = (values: readonly string[]): Option[] =>
  values.map((value) => ({ value, label: value }));

const actionOptions: Option[] = [
  { value: "All", label: "All Actions" },
  ...toOptions(["Approved", "Rejected", "Escalated", "Delegated", "Comments Added"]),
];
const sortOptions: Option[] = [
  { value: "", label: "Sort: Default" },
  ...toOptions(["A - Z", "Z - A", "Newest", "Oldest"]),
];
const statusOptions: Option[] = toOptions(["Active", "Inactive"]);
const pages = ["Prev", "1", "2", "3", "Next"];

const WorkflowActions = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [actionFilter, setActionFilter] = useState<string>("All");
  const [sort, setSort] = useState<string>("");
  const [addStatus, setAddStatus] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<string>("Active");

  return (
    <div>
      {/* Page header */}
      <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black c-text">Workflow &amp; Approvals</h2>
          <p className="text-sm mt-0.5 c-dim">
            Manage approval workflows, rules &amp; audit trails &middot; Austin HQ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm">
            <Printer className="w-[14px] h-[14px]" aria-hidden="true" />
            Print
          </button>
          <button type="button" className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm">
            <Download className="w-[14px] h-[14px]" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="w-[14px] h-[14px]" aria-hidden="true" />
            Add New
          </button>
        </div>
      </div>

      <WorkflowTabs active="Actions / Audit" />

      {/* Toolbar */}
      <div className="glass-card p-4 mb-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px]"
            aria-hidden="true"
          />
          <input
            type="text"
            className="fp-input pl-9 py-2 text-sm"
            placeholder="Search audit log or action..."
          />
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <PredefinedDatePicker className="w-[178px]" ariaLabel="Select date range" />
          <CommonSelect
            className="w-auto"
            fieldClassName="py-2 text-sm"
            options={actionOptions}
            value={actionFilter}
            onChange={(option) => setActionFilter(option?.value ?? "All")}
            placeholder="All Actions"
            ariaLabel="Filter by action"
          />
          <CommonSelect
            className="w-auto"
            fieldClassName="py-2 text-sm"
            options={sortOptions}
            value={sort}
            onChange={(option) => setSort(option?.value ?? "")}
            placeholder="Sort: Default"
            ariaLabel="Sort audit logs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table table-sticky min-w-[850px]">
            <thead>
              <tr>
                <th>Request / Log Title</th>
                <th>Performed By</th>
                <th>Role / Position</th>
                <th>Action Type</th>
                <th>Date &amp; Time</th>
                <th>Comments / Remarks</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2.5 px-2">
                    <a href="#" className="text-sm text-default hover:c-gold">
                      {log.id}
                    </a>
                  </td>
                  <td className="py-2.5 px-2 text-sm text-default">{log.workflowId}</td>
                  <td className="py-2.5 px-2 text-sm font-semibold text-title">{log.role}</td>
                  <td className="py-2.5 px-2 text-sm text-default">{log.date}</td>
                  <td className="py-2.5 px-2 text-sm c-text">{log.comment}</td>
                  <td className="py-2.5 px-2">
                    <span className={statusClass[log.status]}>{log.status}</span>
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="hs-dropdown [--placement:bottom-right] [--auto-close:inside] relative inline-flex">
                      <button
                        type="button"
                        className="hs-dropdown-toggle cursor-pointer btn-sm size-7 bg-[var(--card)] border border-[var(--border)] c-dim inline-flex items-center justify-center hover:bg-[var(--surface)] hover:border-light hover:c-text focus:bg-[var(--surface)] focus:border-light focus:c-text focus:outline-hidden"
                        aria-haspopup="menu"
                        aria-expanded="false"
                        aria-label="Dropdown"
                      >
                        <i className="icon-ellipsis-vertical font-normal" />
                      </button>
                      <div
                        className="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-50 bg-[var(--card)] border border-[var(--border)] shadow rounded-md mt-2 z-1"
                        role="menu"
                        aria-orientation="vertical"
                        tabIndex={-1}
                      >
                        <div className="p-2 space-y-1">
                          <button
                            type="button"
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm c-text hover:bg-[var(--surface)] hover:c-text focus:outline-hidden focus:bg-[var(--card)]"
                            onClick={() => setEditOpen(true)}
                          >
                            <i className="icon-pencil-line" /> Edit
                          </button>
                          <button
                            type="button"
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm c-red hover:bg-[var(--surface)] hover:c-text focus:outline-hidden focus:bg-[var(--card)]"
                            onClick={() => setDeleteOpen(true)}
                          >
                            <i className="icon-trash-2" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 bd-t">
          <span className="text-xs c-dim2">
            Showing <span className="font-bold c-text">10</span> of{" "}
            <span className="font-bold c-text">10</span> audit logs
          </span>
          <div className="flex gap-1">
            {pages.map((page) => (
              <button key={page} type="button" className={page === "1" ? "page-btn active" : "page-btn"}>
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add Record modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Record" boxClassName="glass">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1.5 c-text2">
                ID <span className="c-red">*</span>
              </label>
              <input type="text" defaultValue="WFL0001" className="fp-input py-2.5 text-sm opacity-60" readOnly />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 c-text2">
                Module <span className="c-red">*</span>
              </label>
              <input type="text" className="fp-input py-2.5 text-sm" placeholder="Module name" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">
              Name <span className="c-red">*</span>
            </label>
            <input type="text" className="fp-input py-2.5 text-sm" placeholder="Workflow name" required />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">
              Status <span className="c-red">*</span>
            </label>
            <CommonSelect
              options={statusOptions}
              value={addStatus}
              onChange={(option) => setAddStatus(option?.value ?? null)}
              placeholder="Select"
              ariaLabel="Status"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Description</label>
            <textarea rows={4} className="fp-input h-auto py-2.5 text-sm resize-none" placeholder="Description" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={() => setAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
              <Check className="w-[13px] h-[13px]" aria-hidden="true" />
              Create New
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Record modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Record" boxClassName="glass">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1.5 c-text2">
                ID <span className="c-red">*</span>
              </label>
              <input type="text" defaultValue="WFL0001" className="fp-input py-2.5 text-sm opacity-60" readOnly />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 c-text2">
                Module <span className="c-red">*</span>
              </label>
              <input type="text" defaultValue="Purchase" className="fp-input py-2.5 text-sm" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">
              Name <span className="c-red">*</span>
            </label>
            <input type="text" defaultValue="Purchase Order Approval" className="fp-input py-2.5 text-sm" required />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">
              Status <span className="c-red">*</span>
            </label>
            <CommonSelect
              options={statusOptions}
              value={editStatus}
              onChange={(option) => setEditStatus(option?.value ?? "")}
              placeholder="Select"
              ariaLabel="Status"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Description</label>
            <textarea
              rows={4}
              className="fp-input h-auto py-2.5 text-sm resize-none"
              placeholder="Description"
              defaultValue="PO approvals by value"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={() => setEditOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
              <Check className="w-[13px] h-[13px]" aria-hidden="true" />
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete modal */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Workflow?"
        boxClassName="glass modal-w-380"
        footer={
          <>
            <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={() => setDeleteOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn-danger flex-1 py-2.5 text-sm" onClick={() => setDeleteOpen(false)}>
              Delete
            </button>
          </>
        }
      >
        <div className="confirm-ic danger">
          <Trash2 className="w-6 h-6 c-red" aria-hidden="true" />
        </div>
        <p className="text-sm text-center c-dim">
          Permanently remove this workflow? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default WorkflowActions;
