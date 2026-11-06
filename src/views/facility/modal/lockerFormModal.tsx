import { useState } from "react";
import { AlertCircle, Check, X } from "lucide-react";
import type {
  Locker,
  LockerFormErrors,
  LockerFormValues,
  LockerSize,
  LockerStatus,
  LockerZone,
} from "../../../types/lockers";
import { DEPOSIT, KEY_TYPES, SIZES, STATUSES, ZONES } from "../../../utils/json/lockersData";
import CommonSelect from "../../../components/common-select/commonSelect";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Add / Edit Locker — ported from #modal-locker-form in tailwind/src/lockers.html
   and openForm()/formPreview()/validateForm()/submitForm() in
   assets/js/lockers.js. The How-many field and Status field toggle by mode; the
   inline preview and per-field validation mirror the template.
*/

const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

type LockerFormModalProps = {
  open: boolean;
  target: Locker | null;
  nextFreeNum: number;
  existingNums: number[];
  onClose: () => void;
  onSubmit: (values: LockerFormValues, editId: number | null) => void;
};

const LockerFormModal = ({
  open,
  target,
  nextFreeNum,
  existingNums,
  onClose,
  onSubmit,
}: LockerFormModalProps) => {
  const editId = target?.id ?? null;
  const [start, setStart] = useState(target ? String(Number(target.num)) : String(nextFreeNum));
  const [count, setCount] = useState("1");
  const [zone, setZone] = useState<LockerZone>(target?.zone ?? ZONES[0]);
  const [size, setSize] = useState<LockerSize>(target?.size ?? "Large");
  const [key, setKey] = useState(target?.key ?? KEY_TYPES[0]);
  const [deposit, setDeposit] = useState(target ? String(target.deposit) : String(DEPOSIT.Large));
  const [statusValue, setStatusValue] = useState<LockerStatus>(target?.status ?? "Available");
  const [notes, setNotes] = useState(target?.notes ?? "");
  const [errors, setErrors] = useState<LockerFormErrors>({});

  const onSizeChange = (next: LockerSize) => {
    setSize(next);
    if (!editId) setDeposit(String(DEPOSIT[next]));
  };

  const preview = (() => {
    const startN = Number(start) || 0;
    if (editId) {
      return "Locker " + String(startN).padStart(2, "0") + " · " + zone + " · " + size;
    }
    const c = Math.max(1, Number(count) || 1);
    const nums: string[] = [];
    for (let i = 0; i < c; i++) nums.push(String(startN + i).padStart(2, "0"));
    const label =
      nums.length > 4 ? nums.slice(0, 3).join(", ") + " … " + nums[nums.length - 1] : nums.join(", ");
    return "Creating " + c + " " + size + " locker" + (c > 1 ? "s" : "") + " in " + zone + " Zone: " + label;
  })();

  const validate = (): boolean => {
    const next: LockerFormErrors = {};
    const startN = Number(start);
    const countN = editId ? 1 : Number(count);
    const depositN = Number(deposit);

    if (!startN || startN < 1 || startN > 999) next.start = "Enter a number between 1 and 999";

    if (!editId) {
      if (!countN || countN < 1 || countN > 50) next.count = "Create between 1 and 50 lockers at a time";
    }

    if (deposit === "" || depositN < 0) next.deposit = "Deposit cannot be negative";

    /* Clash detection against existing numbers */
    if (!next.start && !next.count && !next.deposit && startN) {
      const clashes: string[] = [];
      const own = editId != null && target ? Number(target.num) : null;
      for (let i = 0; i < (editId ? 1 : countN); i++) {
        const n = startN + i;
        if (n !== own && existingNums.includes(n)) clashes.push(String(n).padStart(2, "0"));
      }
      if (clashes.length) {
        const msg =
          "Locker " +
          clashes.slice(0, 4).join(", ") +
          (clashes.length > 4 ? " +" + (clashes.length - 4) + " more" : "") +
          " already exist" +
          (clashes.length > 1 ? "" : "s");
        if (editId) next.start = msg;
        else next.count = msg;
      }
    }

    setErrors(next);
    return !next.start && !next.count && !next.deposit;
  };

  const submit = () => {
    if (!validate()) return;
    onSubmit(
      { start, count, zone, size, key, deposit, status: statusValue, notes },
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
      aria-labelledby="lf-title"
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-540">
        <div className="flex items-center justify-between mb-5">
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 id="lf-title" className="text-base font-black c-text">
              {target ? "Edit Locker " + target.num : "Add Lockers"}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label" htmlFor="lf-start">
                Starting number
              </label>
              <input
                id="lf-start"
                type="number"
                min="1"
                max="999"
                className={`fp-input py-2.5 text-sm${errors.start ? " invalid" : ""}`}
                placeholder="e.g. 49"
                value={start}
                aria-invalid={errors.start ? "true" : "false"}
                onChange={(e) => setStart(e.target.value)}
              />
              <div className={`f-error${errors.start ? " show" : ""}`}>
                <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                <span>{errors.start ?? ""}</span>
              </div>
            </div>
            <div className={editId ? "hidden" : ""}>
              <label className="f-label" htmlFor="lf-count">
                How many
              </label>
              <input
                id="lf-count"
                type="number"
                min="1"
                max="50"
                className={`fp-input py-2.5 text-sm${errors.count ? " invalid" : ""}`}
                placeholder="1"
                value={count}
                aria-invalid={errors.count ? "true" : "false"}
                onChange={(e) => setCount(e.target.value)}
              />
              <div className={`f-error${errors.count ? " show" : ""}`}>
                <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                <span>{errors.count ?? ""}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label" htmlFor="lf-zone">
                Zone
              </label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Zone"
                options={toOptions(ZONES)}
                value={zone}
                onChange={(o) => setZone((o?.value as LockerZone) ?? ZONES[0])}
              />
            </div>
            <div>
              <label className="f-label" htmlFor="lf-size">
                Size
              </label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Size"
                options={toOptions(SIZES)}
                value={size}
                onChange={(o) => onSizeChange((o?.value as LockerSize) ?? "Large")}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label" htmlFor="lf-key">
                Key type
              </label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Key type"
                options={toOptions(KEY_TYPES)}
                value={key}
                onChange={(o) => setKey(o?.value ?? KEY_TYPES[0])}
              />
            </div>
            <div>
              <label className="f-label" htmlFor="lf-deposit">
                Deposit ($)
              </label>
              <input
                id="lf-deposit"
                type="number"
                min="0"
                className={`fp-input py-2.5 text-sm${errors.deposit ? " invalid" : ""}`}
                placeholder="25"
                value={deposit}
                aria-invalid={errors.deposit ? "true" : "false"}
                onChange={(e) => setDeposit(e.target.value)}
              />
              <div className={`f-error${errors.deposit ? " show" : ""}`}>
                <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                <span>{errors.deposit ?? ""}</span>
              </div>
            </div>
          </div>
          <div className={editId ? "" : "hidden"}>
            <label className="f-label" htmlFor="lf-status">
              Status
            </label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Status"
              options={toOptions(STATUSES)}
              value={statusValue}
              onChange={(o) => setStatusValue((o?.value as LockerStatus) ?? "Available")}
            />
          </div>
          <div>
            <label className="f-label" htmlFor="lf-notes">
              Notes
            </label>
            <textarea
              id="lf-notes"
              className="fp-input py-2.5 text-sm"
              rows={2}
              placeholder="Optional notes…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="ctx-box">{preview}</div>
          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              {target ? "Save Changes" : "Create Lockers"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LockerFormModal;
