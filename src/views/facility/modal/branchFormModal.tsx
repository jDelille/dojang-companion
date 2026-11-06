import { useState } from "react";
import { AlertCircle, Check, X } from "lucide-react";
import type {
  Branch,
  BranchFormErrors,
  BranchFormValues,
  BranchStatus,
} from "../../../types/branches";
import { BRANCH_STATUSES, MANAGERS } from "../../../utils/json/branchesData";
import CommonSelect from "../../../components/common-select/commonSelect";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Add / Edit Branch — ported from #modal-branch-form in
   tailwind/src/branches.html and openForm()/validateForm()/submitForm() in
   assets/js/branches.js. Validation runs on submit and renders the same
   per-field messages the template set with setError().
*/

type BranchFormModalProps = {
  open: boolean;
  target: Branch | null;
  branches: Branch[];
  onClose: () => void;
  onSubmit: (values: BranchFormValues, editId: number | null) => void;
};

const STATUS_OPTIONS = BRANCH_STATUSES.map((value) => ({ value, label: value }));

const managerOptions = (branches: Branch[], editId: number | null) =>
  [{ value: "", label: "Unassigned" }].concat(
    MANAGERS.map((m) => {
      const at = branches.find((b) => b.managerId === m.id && b.id !== editId);
      return {
        value: m.id,
        label: m.name + " · " + m.role + (at ? " (at " + at.city + ")" : ""),
      };
    }),
  );

const BranchFormModal = ({
  open,
  target,
  branches,
  onClose,
  onSubmit,
}: BranchFormModalProps) => {
  const editId = target?.id ?? null;

  const [name, setName] = useState(target?.name ?? "");
  const [city, setCity] = useState(target?.city ?? "");
  const [address, setAddress] = useState(target?.address ?? "");
  const [managerId, setManagerId] = useState(target?.managerId ?? "");
  const [phone, setPhone] = useState(target?.phone ?? "");
  const [capacity, setCapacity] = useState(target ? String(target.capacity) : "1000");
  const [openTime, setOpenTime] = useState(target?.open ?? "05:00");
  const [closeTime, setCloseTime] = useState(target?.close ?? "23:00");
  const [status, setStatus] = useState<BranchStatus>(target?.status ?? "Opening Soon");
  const [hq, setHq] = useState(target?.hq ?? false);
  const [errors, setErrors] = useState<BranchFormErrors>({});

  const validate = (): boolean => {
    const next: BranchFormErrors = {};
    const nm = name.trim();
    if (!nm) next.name = "Enter a branch name";
    else if (nm.length < 3) next.name = "Name must be at least 3 characters";
    else if (branches.some((b) => b.name.toLowerCase() === nm.toLowerCase() && b.id !== editId))
      next.name = "A branch with this name already exists";

    if (!city.trim()) next.city = "Enter a city";
    if (!address.trim()) next.address = "Enter an address";

    const ph = phone.trim();
    if (!ph) next.phone = "Enter a contact number";
    else if (ph.replace(/\D/g, "").length < 10) next.phone = "Enter at least 10 digits";

    const cap = Number(capacity);
    const members = editId != null ? target?.members ?? 0 : 0;
    if (!cap || cap < 1) next.capacity = "Capacity must be at least 1";
    else if (cap > 10000) next.capacity = "Capacity cannot exceed 10,000";
    else if (cap < members)
      next.capacity =
        "Capacity is below the " + members.toLocaleString("en-US") + " members already enrolled";

    if (openTime && closeTime && closeTime <= openTime)
      next.close = "Closing time must be after opening time";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSubmit(
      {
        name,
        city,
        address,
        managerId,
        phone,
        capacity,
        open: openTime,
        close: closeTime,
        status,
        hq,
      },
      editId,
    );
    onClose();
  };

  return (
    <div
      className={open ? "modal-overlay open" : "modal-overlay"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bf-title"
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-560">
        <div className="flex items-center justify-between mb-5">
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 id="bf-title" className="text-base font-black c-text">
              {target ? "Edit Branch" : "Add Branch"}
            </h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <form
          className="space-y-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div>
            <label className="f-label" htmlFor="bf-name">
              Branch name
            </label>
            <input
              type="text"
              id="bf-name"
              className={`fp-input py-2.5 text-sm${errors.name ? " invalid" : ""}`}
              placeholder="e.g. Phoenix — Vaishali Nagar"
              aria-invalid={errors.name ? "true" : "false"}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className={`f-error${errors.name ? " show" : ""}`}>
              <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
              <span>{errors.name ?? ""}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label" htmlFor="bf-city">
                City
              </label>
              <input
                type="text"
                id="bf-city"
                className={`fp-input py-2.5 text-sm${errors.city ? " invalid" : ""}`}
                placeholder="e.g. Phoenix"
                aria-invalid={errors.city ? "true" : "false"}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <div className={`f-error${errors.city ? " show" : ""}`}>
                <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                <span>{errors.city ?? ""}</span>
              </div>
            </div>
            <div>
              <label className="f-label" htmlFor="bf-status">
                Status
              </label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Status"
                options={STATUS_OPTIONS}
                value={status}
                onChange={(option) =>
                  setStatus((option?.value as BranchStatus) ?? "Opening Soon")
                }
              />
            </div>
          </div>
          <div>
            <label className="f-label" htmlFor="bf-address">
              Address
            </label>
            <input
              type="text"
              id="bf-address"
              className={`fp-input py-2.5 text-sm${errors.address ? " invalid" : ""}`}
              placeholder="Street, area, PIN"
              aria-invalid={errors.address ? "true" : "false"}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <div className={`f-error${errors.address ? " show" : ""}`}>
              <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
              <span>{errors.address ?? ""}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label" htmlFor="bf-manager">
                Manager
              </label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Manager"
                options={managerOptions(branches, editId)}
                value={managerId}
                onChange={(option) => setManagerId(option?.value ?? "")}
              />
            </div>
            <div>
              <label className="f-label" htmlFor="bf-phone">
                Phone
              </label>
              <input
                type="text"
                id="bf-phone"
                className={`fp-input py-2.5 text-sm${errors.phone ? " invalid" : ""}`}
                placeholder="(512) 555-0142"
                aria-invalid={errors.phone ? "true" : "false"}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <div className={`f-error${errors.phone ? " show" : ""}`}>
                <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                <span>{errors.phone ?? ""}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="f-label" htmlFor="bf-capacity">
                Capacity
              </label>
              <input
                id="bf-capacity"
                type="number"
                min={1}
                max={10000}
                className={`fp-input py-2.5 text-sm${errors.capacity ? " invalid" : ""}`}
                placeholder="1000"
                aria-invalid={errors.capacity ? "true" : "false"}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
              <div className={`f-error${errors.capacity ? " show" : ""}`}>
                <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                <span>{errors.capacity ?? ""}</span>
              </div>
            </div>
            <div>
              <label className="f-label" htmlFor="bf-open">
                Opens
              </label>
              <input
                id="bf-open"
                type="time"
                className="fp-input py-2.5 text-sm"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
              />
            </div>
            <div>
              <label className="f-label" htmlFor="bf-close">
                Closes
              </label>
              <input
                id="bf-close"
                type="time"
                className={`fp-input py-2.5 text-sm${errors.close ? " invalid" : ""}`}
                aria-invalid={errors.close ? "true" : "false"}
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
              />
              <div className={`f-error${errors.close ? " show" : ""}`}>
                <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                <span>{errors.close ?? ""}</span>
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2.5 text-[13px] c-text2 cursor-pointer">
            <input
              type="checkbox"
              id="bf-hq"
              className="cbx"
              checked={hq}
              onChange={(e) => setHq(e.target.checked)}
            />
            Set as headquarters
          </label>
          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              id="bf-submit"
              className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              {target ? "Save Changes" : "Create Branch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BranchFormModal;
