import { useState } from "react";
import { Check, Download, Plus, Printer, Search, Trash2 } from "lucide-react";
import Modal from "../../../components/common/Modal";
import WorkflowTabs from "./workflowTabs";
import CommonSelect, { type Option } from "../../../components/common-select/commonSelect";

type Workflow = {
  id: string;
  module: string;
  name: string;
  description: string;
  status: "Active" | "Inactive";
};

const workflows: Workflow[] = [
  { id: "#WFL0020", module: "Finance", name: "Expense Approval", description: "Employee expense claims", status: "Active" },
  { id: "#WFL0019", module: "Purchase", name: "Purchase Order Approval", description: "PO approvals by value", status: "Active" },
  { id: "#WFL0018", module: "HRM", name: "Leave Request Approval", description: "Employee leave approvals", status: "Active" },
  { id: "#WFL0017", module: "Sales", name: "Discount Approval", description: "Sales discount sign-offs", status: "Inactive" },
  { id: "#WFL0016", module: "Projects", name: "Budget Allocation", description: "Project budget approvals", status: "Active" },
  { id: "#WFL0015", module: "Finance", name: "Invoice Approval", description: "Vendor invoice sign-offs", status: "Active" },
  { id: "#WFL0014", module: "Purchase", name: "Requisition Approval", description: "Internal purchase requests", status: "Inactive" },
  { id: "#WFL0013", module: "HRM", name: "Overtime Approval", description: "Overtime hours sign-off", status: "Active" },
  { id: "#WFL0012", module: "Sales", name: "Credit Limit Approval", description: "Customer credit limit changes", status: "Active" },
  { id: "#WFL0011", module: "Projects", name: "Scope Change Approval", description: "Project scope modifications", status: "Active" },
];

const toOptions = (values: readonly string[]): Option[] =>
  values.map((value) => ({ value, label: value }));

const moduleOptions: Option[] = [
  { value: "All", label: "All Modules" },
  ...toOptions(["Finance", "Purchase", "HRM", "Sales", "Projects"]),
];
const sortOptions: Option[] = [
  { value: "", label: "Sort: Default" },
  ...toOptions(["A - Z", "Z - A", "Newest", "Oldest"]),
];
const statusOptions: Option[] = toOptions(["Active", "Inactive"]);
const pages = ["Prev", "1", "2", "3", "Next"];

const WorkflowApprovals = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [moduleFilter, setModuleFilter] = useState<string>("All");
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

      <WorkflowTabs active="Workflow" />

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
            placeholder="Search workflow ID or name..."
          />
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <CommonSelect
            className="w-auto"
            fieldClassName="py-2 text-sm"
            options={moduleOptions}
            value={moduleFilter}
            onChange={(option) => setModuleFilter(option?.value ?? "All")}
            placeholder="All Modules"
            ariaLabel="Filter by module"
          />
          <CommonSelect
            className="w-auto"
            fieldClassName="py-2 text-sm"
            options={sortOptions}
            value={sort}
            onChange={(option) => setSort(option?.value ?? "")}
            placeholder="Sort: Default"
            ariaLabel="Sort workflows"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table table-sticky min-w-[800px]">
            <thead>
              <tr>
                <th>ID</th>
                <th>Module</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workflows.map((workflow) => (
                <tr key={workflow.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2.5 px-2 text-sm text-default">
                    <a href="#">{workflow.id}</a>
                  </td>
                  <td className="py-2.5 px-2 text-sm c-text">{workflow.module}</td>
                  <td className="py-2.5 px-2 text-sm font-semibold text-title">{workflow.name}</td>
                  <td className="py-2.5 px-2 text-sm text-default">{workflow.description}</td>
                  <td className="py-2.5 px-2">
                    <span
                      className={
                        workflow.status === "Active"
                          ? "text-[11px] bg-success-transparent c-green px-2 py-0.5 rounded"
                          : "text-[11px] bg-danger-transparent c-red px-2 py-0.5 rounded"
                      }
                    >
                      {workflow.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right">
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
            <span className="font-bold c-text">10</span> workflows
          </span>
          <div className="flex gap-1">
            {pages.map((page) => (
              <button
                key={page}
                type="button"
                className={page === "1" ? "page-btn active" : "page-btn"}
              >
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

export default WorkflowApprovals;
