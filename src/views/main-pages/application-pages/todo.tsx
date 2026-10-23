import { useState } from "react";
import { Check, ListChecks, Plus, PlusCircle, Search, Star, Trash2 } from "lucide-react";
import Modal from "../../../components/common/Modal";
import CommonSelect, { type Option } from "../../../components/common-select/commonSelect";
import CommonDatePicker from "../../../components/common-date-picker/commonDatePicker";
import PredefinedDatePicker from "../../../components/common-date-range-picker/PredefinedDatePicker";

type Priority = "Low" | "Medium" | "High";
type Status = "Pending" | "Inprogress" | "Completed" | "On Hold";

type Task = {
  title: string;
  priority: Priority;
  created: string;
  status: Status;
  updated: string;
  progress: number;
};

const PRIORITY_BADGE: Record<Priority, string> = {
  Low: "bg-success-transparent c-green",
  Medium: "bg-warning-transparent c-orange",
  High: "bg-danger-transparent c-red",
};

const STATUS_BADGE: Record<Status, string> = {
  Pending: "bg-warning-transparent c-orange",
  Inprogress: "bg-info-transparent c-cyan",
  Completed: "bg-success-transparent c-green",
  "On Hold": "bg-purple-transparent text-purple",
};

const TASKS: Task[] = [
  {
    title: "Update calendar and schedule",
    priority: "Low",
    created: "20 Jun 2025",
    status: "Inprogress",
    updated: "25 Jun 2025",
    progress: 80,
  },
  {
    title: "Finalize project proposal",
    priority: "Medium",
    created: "15 Jun 2025",
    status: "On Hold",
    updated: "20 Jun 2025",
    progress: 60,
  },
  {
    title: "Submit to supervisor by EOD",
    priority: "Low",
    created: "02 Jun 2025",
    status: "Pending",
    updated: "07 Jun 2025",
    progress: 50,
  },
  {
    title: "Prepare presentation slides",
    priority: "High",
    created: "24 May 2025",
    status: "Completed",
    updated: "30 May 2025",
    progress: 100,
  },
  {
    title: "Check and respond to emails",
    priority: "Low",
    created: "18 May 2025",
    status: "Pending",
    updated: "25 May 2025",
    progress: 55,
  },
  {
    title: "Daily admin tasks organized",
    priority: "Medium",
    created: "13 May 2025",
    status: "Inprogress",
    updated: "18 May 2025",
    progress: 70,
  },
  {
    title: "Verify insurance eligibility",
    priority: "High",
    created: "25 Apr 2025",
    status: "Completed",
    updated: "27 Apr 2025",
    progress: 80,
  },
  {
    title: "Send lab results to patient portal",
    priority: "Low",
    created: "17 Apr 2025",
    status: "Pending",
    updated: "20 Apr 2025",
    progress: 50,
  },
  {
    title: "Keep tasks clear and specific",
    priority: "Medium",
    created: "01 Mar 2025",
    status: "Completed",
    updated: "05 Mar 2025",
    progress: 100,
  },
  {
    title: "Use reminders for anything time",
    priority: "High",
    created: "21 Mar 2025",
    status: "Inprogress",
    updated: "25 Mar 2025",
    progress: 40,
  },
];

const SIDEBAR_LINKS = [
  { label: "Starred", icon: Star },
  { label: "Trash", icon: Trash2 },
];

const PRIORITY_FILTERS = [
  { label: "Low", dot: "bg-success" },
  { label: "Medium", dot: "bg-warning" },
  { label: "High", dot: "bg-danger" },
];

const CATEGORY_FILTERS = [
  { label: "Social", dot: "bg-purple" },
  { label: "Research", dot: "bg-info" },
  { label: "Web Design", dot: "bg-pink" },
  { label: "Reminder", dot: "bg-danger" },
];

const toOptions = (values: readonly string[]): Option[] =>
  values.map((value) => ({ value, label: value }));

const SORT_OPTIONS: Option[] = [
  { value: "", label: "Sort: Default" },
  ...toOptions(["A - Z", "Z - A", "Newest", "Oldest", "High Priority", "Low Priority"]),
];

const STATUS_OPTIONS: Option[] = toOptions([
  "Pending",
  "Inprogress",
  "Completed",
  "On Hold",
] satisfies Status[]);
const PRIORITY_OPTIONS: Option[] = toOptions(["Low", "Medium", "High"] satisfies Priority[]);
const ASSIGNEE_OPTIONS: Option[] = toOptions([
  "Alexander Kenn",
  "Gabriella White",
  "Christopher Rey",
  "Penelope Ton",
]);

// The progress ring's circumference is ~88 units at r=14 in the 36x36 viewBox.
const dashArray = (progress: number) => `${(progress * 88) / 100} 100`;

const Todo = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [sort, setSort] = useState<string>("");

  const [addStatus, setAddStatus] = useState<string | null>(null);
  const [addPriority, setAddPriority] = useState<string | null>(null);
  const [addAssignee, setAddAssignee] = useState<string | null>(null);
  const [addCreated, setAddCreated] = useState<Date | null>(null);
  const [addDue, setAddDue] = useState<Date | null>(null);

  const [editStatus, setEditStatus] = useState<string>("Pending");
  const [editPriority, setEditPriority] = useState<string>("High");
  const [editAssignee, setEditAssignee] = useState<string>("Alexander Kenn");
  const [editCreated, setEditCreated] = useState<Date | null>(new Date(2025, 5, 20));
  const [editDue, setEditDue] = useState<Date | null>(new Date(2025, 5, 20));

  return (
    <>
      <div>
        {/* Page header */}
        <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
          <div>
            <h2 className="text-xl font-black c-text">To Do</h2>
            <p className="text-sm mt-0.5 c-dim">
              Manage daily tasks, priorities &amp; schedules &middot; Austin HQ
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="w-[14px] h-[14px]" aria-hidden="true" />
              Add Task
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="glass-card p-4">
              <button
                type="button"
                className="btn-gold flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm mb-4"
                onClick={() => setAddOpen(true)}
              >
                <PlusCircle className="w-[15px] h-[15px]" aria-hidden="true" /> Add Task
              </button>

              <div className="space-y-1 mb-4">
                <a
                  href="#"
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-[var(--card2)] c-gold text-sm font-semibold border border-[var(--border)]"
                >
                  <span className="inline-flex items-center gap-2">
                    <ListChecks className="w-[14px] h-[14px]" aria-hidden="true" /> All Tasks
                  </span>
                  <span className="size-5 rounded-full bg-danger text-white text-[10px] flex items-center justify-center font-bold">
                    6
                  </span>
                </a>
                {SIDEBAR_LINKS.map(({ label, icon: Icon }) => (
                  <a
                    key={label}
                    href="#"
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-default text-sm hover:bg-[var(--surface)]"
                  >
                    <Icon className="w-[14px] h-[14px]" aria-hidden="true" /> {label}
                  </a>
                ))}
              </div>

              <div className="mb-4 pt-3 border-t border-[var(--border)]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-title mb-0">Priority</p>
                </div>
                <div className="space-y-1">
                  {PRIORITY_FILTERS.map(({ label, dot }) => (
                    <a
                      key={label}
                      href="#"
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-default text-sm hover:bg-[var(--surface)]"
                    >
                      <span className={`size-2 rounded-full ${dot}`} /> {label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border)]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-title mb-0">Categories</p>
                </div>
                <div className="space-y-1">
                  {CATEGORY_FILTERS.map(({ label, dot }) => (
                    <a
                      key={label}
                      href="#"
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-default text-sm hover:bg-[var(--surface)]"
                    >
                      <span className={`size-2 rounded-full ${dot}`} /> {label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Todo Main */}
          <div className="lg:col-span-9 space-y-4">
            {/* Toolbar */}
            <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search
                  className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px]"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  className="fp-input pl-9 py-2 text-sm"
                  placeholder="Search task title..."
                  aria-label="Search task title"
                />
              </div>

              <div className="flex items-center flex-wrap gap-2">
                <PredefinedDatePicker
                  className="w-[178px]"
                  ariaLabel="Select date range"
                />

                <CommonSelect
                  className="w-auto"
                  fieldClassName="py-2 text-sm"
                  options={SORT_OPTIONS}
                  value={sort}
                  onChange={(option) => setSort(option?.value ?? "")}
                  placeholder="Sort: Default"
                  ariaLabel="Sort tasks"
                />
              </div>
            </div>

            {/* Task table */}
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table table-sticky min-w-[800px]">
                  <thead>
                    <tr>
                      <th>Task Title</th>
                      <th>Priority</th>
                      <th>Created Date</th>
                      <th>Status</th>
                      <th>Updated Date</th>
                      <th>Progress</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TASKS.map((task) => (
                      <tr
                        key={task.title}
                        className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface)]/20 transition-colors"
                      >
                        <td className="py-2.5 px-2 text-sm font-semibold text-title">
                          {task.title}
                        </td>
                        <td className="py-2.5 px-2 vertical-middle">
                          <span
                            className={`inline-flex items-center text-[11px] ${PRIORITY_BADGE[task.priority]} px-2 py-0.5 rounded font-medium`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-sm text-default vertical-middle tabular-nums">
                          {task.created}
                        </td>
                        <td className="py-2.5 px-2 vertical-middle">
                          <span
                            className={`inline-flex items-center text-[11px] ${STATUS_BADGE[task.status]} px-2 py-0.5 rounded font-medium`}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-sm text-default vertical-middle tabular-nums">
                          {task.updated}
                        </td>
                        <td className="py-2.5 px-2 vertical-middle">
                          <div className="flex items-center gap-2">
                            <div className="relative size-8 shrink-0">
                              <svg className="size-8 -rotate-90" viewBox="0 0 36 36">
                                <circle
                                  cx="18"
                                  cy="18"
                                  r="14"
                                  fill="none"
                                  className="stroke-light-500"
                                  strokeWidth="3"
                                />
                                <circle
                                  cx="18"
                                  cy="18"
                                  r="14"
                                  fill="none"
                                  className="stroke-warning"
                                  strokeWidth="3"
                                  strokeDasharray={dashArray(task.progress)}
                                  strokeLinecap="round"
                                />
                              </svg>
                            </div>
                            <span className="text-[11px] font-semibold c-text tabular-nums">
                              {task.progress}%
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 vertical-middle text-right">
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
                  <span className="font-bold c-text">10</span> tasks
                </span>
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
          </div>
        </div>
      </div>

      {/* Add To Do modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add To Do" boxClassName="glass">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="todo-add-title" className="block text-xs font-bold mb-1.5 c-text2">
              Title <span className="c-red">*</span>
            </label>
            <input
              id="todo-add-title"
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="Task title"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1.5 c-text2">
                Status <span className="c-red">*</span>
              </label>
              <CommonSelect
                options={STATUS_OPTIONS}
                value={addStatus}
                onChange={(option) => setAddStatus(option?.value ?? null)}
                placeholder="Select"
                ariaLabel="Status"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 c-text2">
                Priority <span className="c-red">*</span>
              </label>
              <CommonSelect
                options={PRIORITY_OPTIONS}
                value={addPriority}
                onChange={(option) => setAddPriority(option?.value ?? null)}
                placeholder="Select"
                ariaLabel="Priority"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1.5 c-text2">
                Created Date <span className="c-red">*</span>
              </label>
              <CommonDatePicker
                value={addCreated}
                onChange={(event) => setAddCreated((event.value as Date) ?? null)}
                placeholder="dd/mm/yyyy"
                ariaLabel="Created date"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 c-text2">
                Due Date <span className="c-red">*</span>
              </label>
              <CommonDatePicker
                value={addDue}
                onChange={(event) => setAddDue((event.value as Date) ?? null)}
                placeholder="dd/mm/yyyy"
                ariaLabel="Due date"
              />
            </div>
          </div>
          <div>
            <label htmlFor="todo-add-desc" className="block text-xs font-bold mb-1.5 c-text2">
              Description
            </label>
            <textarea
              id="todo-add-desc"
              rows={4}
              className="fp-input h-auto py-2.5 text-sm resize-none"
              placeholder="Enter description"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">
              Select Assignee <span className="c-red">*</span>
            </label>
            <CommonSelect
              options={ASSIGNEE_OPTIONS}
              value={addAssignee}
              onChange={(option) => setAddAssignee(option?.value ?? null)}
              placeholder="Select"
              ariaLabel="Select assignee"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              className="btn-ghost flex-1 py-2.5 text-sm"
              onClick={() => setAddOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              <Check className="w-[13px] h-[13px]" aria-hidden="true" />
              Create New
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit To Do modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit To Do"
        boxClassName="glass"
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="todo-edit-title" className="block text-xs font-bold mb-1.5 c-text2">
              Title <span className="c-red">*</span>
            </label>
            <input
              id="todo-edit-title"
              type="text"
              className="fp-input py-2.5 text-sm"
              defaultValue="Update calendar and schedule"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1.5 c-text2">
                Status <span className="c-red">*</span>
              </label>
              <CommonSelect
                options={STATUS_OPTIONS}
                value={editStatus}
                onChange={(option) => setEditStatus(option?.value ?? "")}
                placeholder="Select"
                ariaLabel="Status"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 c-text2">
                Priority <span className="c-red">*</span>
              </label>
              <CommonSelect
                options={PRIORITY_OPTIONS}
                value={editPriority}
                onChange={(option) => setEditPriority(option?.value ?? "")}
                placeholder="Select"
                ariaLabel="Priority"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1.5 c-text2">
                Created Date <span className="c-red">*</span>
              </label>
              <CommonDatePicker
                value={editCreated}
                onChange={(event) => setEditCreated((event.value as Date) ?? null)}
                placeholder="dd/mm/yyyy"
                ariaLabel="Created date"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 c-text2">
                Due Date <span className="c-red">*</span>
              </label>
              <CommonDatePicker
                value={editDue}
                onChange={(event) => setEditDue((event.value as Date) ?? null)}
                placeholder="dd/mm/yyyy"
                ariaLabel="Due date"
              />
            </div>
          </div>
          <div>
            <label htmlFor="todo-edit-desc" className="block text-xs font-bold mb-1.5 c-text2">
              Description
            </label>
            <textarea
              id="todo-edit-desc"
              rows={4}
              className="fp-input h-auto py-2.5 text-sm resize-none"
              placeholder="Enter description"
              defaultValue="Research modern design patterns"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">
              Select Assignee <span className="c-red">*</span>
            </label>
            <CommonSelect
              options={ASSIGNEE_OPTIONS}
              value={editAssignee}
              onChange={(option) => setEditAssignee(option?.value ?? "")}
              placeholder="Select"
              ariaLabel="Select assignee"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              className="btn-ghost flex-1 py-2.5 text-sm"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              <Check className="w-[13px] h-[13px]" aria-hidden="true" />
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Task?"
        boxClassName="glass modal-w-380"
        footer={
          <>
            <button
              type="button"
              className="btn-ghost flex-1 py-2.5 text-sm"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-danger flex-1 py-2.5 text-sm"
              onClick={() => setDeleteOpen(false)}
            >
              Delete
            </button>
          </>
        }
      >
        <div className="confirm-ic danger">
          <Trash2 className="w-6 h-6 c-red" aria-hidden="true" />
        </div>
        <p className="text-sm text-center mb-5 c-dim">
          Permanently remove this task? This action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

export default Todo;
