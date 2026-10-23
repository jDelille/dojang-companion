import { useState } from "react";
import { Check, ListChecks, PenTool, Plus, PlusCircle, Star, Trash2 } from "lucide-react";
import Modal from "../../../components/common/Modal";
import CommonSelect, { type Option } from "../../../components/common-select/commonSelect";
import CommonDatePicker from "../../../components/common-date-picker/commonDatePicker";
import ImageWithBasePath from "../../../components/image-with-base-path";

type Note = {
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  starred: boolean;
  avatar: string;
};

const PRIORITY_BADGE: Record<Note["priority"], string> = {
  Low: "bg-success-transparent c-green",
  Medium: "bg-warning-transparent c-orange",
  High: "bg-danger-transparent c-red",
};

const NOTES: Note[] = [
  {
    title: "Meeting with Product Team",
    description: "Discuss dashboard revamp and analytics tracking.",
    priority: "Low",
    starred: false,
    avatar: "assets/img/avatars/avatar-09.jpg",
  },
  {
    title: "Submit Quarterly Report",
    description: "Compile a comprehensive report for covering sales performance.",
    priority: "Low",
    starred: true,
    avatar: "assets/img/avatars/avatar-04.jpg",
  },
  {
    title: "Follow up with HR",
    description: "Review and verify the current onboarding status of all hires.",
    priority: "Medium",
    starred: false,
    avatar: "assets/img/avatars/avatar-15.jpg",
  },
  {
    title: "Design Feedback Notes",
    description: "Adjust the form layout to reduce vertical and horizontal spacing",
    priority: "Medium",
    starred: true,
    avatar: "assets/img/avatars/avatar-05.jpg",
  },
  {
    title: "Call Vendor Support",
    description: "The printer maintenance issue is still pending requires attention.",
    priority: "High",
    starred: false,
    avatar: "assets/img/avatars/avatar-06.jpg",
  },
  {
    title: "Give me the staff guide",
    description: "The patient contacted us to request a rescheduling.",
    priority: "Low",
    starred: false,
    avatar: "assets/img/avatars/avatar-12.jpg",
  },
  {
    title: "Insurance Update",
    description: "We have received the updated insurance card from the patient.",
    priority: "High",
    starred: false,
    avatar: "assets/img/avatars/avatar-04.jpg",
  },
  {
    title: "Staff Reminder",
    description: "A reminder was sent to the team regarding the scheduled meeting",
    priority: "Medium",
    starred: false,
    avatar: "assets/img/avatars/avatar-08.jpg",
  },
  {
    title: "General Task Tracking",
    description: "Printer cartridges and paper stock have been ordered.",
    priority: "High",
    starred: true,
    avatar: "assets/img/avatars/avatar-14.jpg",
  },
  {
    title: "Insurance Inquiry",
    description: "Patient called to check status of last insurance claim for lab tests.",
    priority: "Low",
    starred: true,
    avatar: "assets/img/avatars/avatar-06.jpg",
  },
  {
    title: "Maintenance Request",
    description: "Noted recurring jam in front desk printer. Called vendor support.",
    priority: "High",
    starred: false,
    avatar: "assets/img/avatars/avatar-04.jpg",
  },
  {
    title: "Internal Task",
    description: "Ordered toner, copy paper, and cleaning supplies.",
    priority: "Medium",
    starred: false,
    avatar: "assets/img/avatars/avatar-07.jpg",
  },
];

const SIDEBAR_LINKS = [
  { label: "Starred", icon: Star },
  { label: "Trash", icon: Trash2 },
  { label: "Draft", icon: PenTool },
];

const LABELS = [
  { label: "Low", dot: "bg-success" },
  { label: "Medium", dot: "bg-warning" },
  { label: "High", dot: "bg-danger" },
];

const toOptions = (values: readonly string[]): Option[] =>
  values.map((value) => ({ value, label: value }));

const PRIORITY_OPTIONS: Option[] = toOptions([
  "Low",
  "Medium",
  "High",
] satisfies Note["priority"][]);
const ASSIGNEE_OPTIONS: Option[] = toOptions([
  "Alexander Kenn",
  "Gabriella White",
  "Christopher Rey",
]);

const Notes = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [addPriority, setAddPriority] = useState<string | null>(null);
  const [addAssignee, setAddAssignee] = useState<string | null>(null);
  const [addCreated, setAddCreated] = useState<Date | null>(null);
  const [addDue, setAddDue] = useState<Date | null>(null);

  const [editPriority, setEditPriority] = useState<string>("Low");
  const [editAssignee, setEditAssignee] = useState<string>("Alexander Kenn");
  const [editCreated, setEditCreated] = useState<Date | null>(new Date(2026, 8, 1));
  const [editDue, setEditDue] = useState<Date | null>(new Date(2026, 8, 2));

  return (
    <>
      <div>
        {/* Page header */}
        <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
          <div>
            <h2 className="text-xl font-black c-text">Notes</h2>
            <p className="text-sm mt-0.5 c-dim">
              Organize notes, team thoughts &amp; tasks &middot; Austin HQ
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="w-[14px] h-[14px]" aria-hidden="true" />
              Add Note
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* Left sidebar */}
          <div className="xl:col-span-3">
            <div className="glass-card p-4">
              <button
                type="button"
                className="btn-gold flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm mb-4"
                onClick={() => setAddOpen(true)}
              >
                <PlusCircle className="w-[15px] h-[15px]" aria-hidden="true" /> Add Note
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
              <div className="pt-3 border-t border-[var(--border)]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-title mb-0">Labels</p>
                </div>
                <div className="space-y-1">
                  {LABELS.map(({ label, dot }) => (
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

          {/* Right main: notes grid */}
          <div className="xl:col-span-9">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {NOTES.map((note) => (
                <div key={note.title} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[11px] ${PRIORITY_BADGE[note.priority]} px-2 py-0.5 rounded`}
                    >
                      {note.priority}
                    </span>
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
                  </div>
                  <p className="text-sm font-semibold text-title mb-1">{note.title}</p>
                  <p className="text-sm text-default mb-3">{note.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="size-6 rounded inline-flex items-center justify-center text-default hover:bg-[var(--surface)] cursor-pointer fav-icon"
                        aria-label="Star note"
                      >
                        <i className={note.starred ? "ph-fill ph-star c-orange" : "ph ph-star"} />
                      </button>
                      <button
                        type="button"
                        className="size-6 rounded inline-flex items-center justify-center text-default hover:bg-[var(--surface)] cursor-pointer"
                        aria-label="Delete note"
                      >
                        <i className="ph ph-trash" />
                      </button>
                    </div>
                    <ImageWithBasePath
                      src={note.avatar}
                      className="size-6 rounded border border-[var(--border)]"
                      alt="user"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Note modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Note"
        boxClassName="glass modal-w-520"
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="note-add-title" className="block text-xs font-bold mb-1.5 c-text2">
              Title <span className="c-red">*</span>
            </label>
            <input
              id="note-add-title"
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="Enter title"
              required
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
            <label htmlFor="note-add-desc" className="block text-xs font-bold mb-1.5 c-text2">
              Description
            </label>
            <textarea
              id="note-add-desc"
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

      {/* Edit Note modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Note"
        boxClassName="glass modal-w-520"
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="note-edit-title" className="block text-xs font-bold mb-1.5 c-text2">
              Title <span className="c-red">*</span>
            </label>
            <input
              id="note-edit-title"
              type="text"
              className="fp-input py-2.5 text-sm"
              defaultValue="Follow up with HR"
              required
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
            <label htmlFor="note-edit-desc" className="block text-xs font-bold mb-1.5 c-text2">
              Description
            </label>
            <textarea
              id="note-edit-desc"
              rows={4}
              className="fp-input h-auto py-2.5 text-sm resize-none"
              placeholder="Enter description"
              defaultValue="Follow up with HR regarding the new employee onboarding process."
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

      {/* Delete Note modal */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Note?"
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
          Permanently remove this note? This action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

export default Notes;
