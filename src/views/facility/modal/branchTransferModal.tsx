import { useState } from "react";
import { AlertCircle, AlertTriangle, ArrowLeftRight, ArrowRight, X } from "lucide-react";
import type { Branch, BranchTransferErrors } from "../../../types/branches";
import { TRANSFER_REASONS } from "../../../utils/json/branchesData";
import CommonSelect from "../../../components/common-select/commonSelect";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Transfer Members — ported from #modal-transfer in tailwind/src/branches.html
   and openTransfer()/transferPreview()/validateTransfer()/submitTransfer() in
   assets/js/branches.js. The flow preview and warning recompute from the
   current selection during render — no effect needed.
*/

const num = (n: number) => n.toLocaleString("en-US");
const REASON_OPTIONS = TRANSFER_REASONS.map((value) => ({ value, label: value }));

type BranchTransferModalProps = {
  branch: Branch | null;
  branches: Branch[];
  onClose: () => void;
  onConfirm: (values: {
    fromId: number;
    toId: number;
    count: number;
    reason: string;
  }) => void;
};

const BranchTransferModal = ({
  branch,
  branches,
  onClose,
  onConfirm,
}: BranchTransferModalProps) => {
  const open = branch !== null;

  const initialFrom = branch ?? branches.find((b) => b.members > 0) ?? branches[0] ?? null;
  const initialTo = branches.find((b) => b.id !== initialFrom?.id) ?? null;

  const [fromId, setFromId] = useState<number>(initialFrom?.id ?? 0);
  const [toId, setToId] = useState<number>(initialTo?.id ?? 0);
  const [count, setCount] = useState("");
  const [reason, setReason] = useState(TRANSFER_REASONS[0]);
  const [errors, setErrors] = useState<BranchTransferErrors>({});

  const from = branches.find((b) => b.id === fromId) ?? null;
  const to = branches.find((b) => b.id === toId) ?? null;

  const fromOptions = branches.map((b) => ({
    value: String(b.id),
    label: b.name + " · " + num(b.members) + " members",
  }));
  const toOptions = branches
    .filter((b) => b.id !== fromId)
    .map((b) => ({
      value: String(b.id),
      label: b.name + " · " + num(b.members) + "/" + num(b.capacity),
    }));

  /* Live preview */
  const n = Math.max(0, Number(count) || 0);
  const hint = from
    ? from.members
      ? from.name +
        " has " +
        num(from.members) +
        " members" +
        (to ? " · " + to.name + " has room for " + num(Math.max(0, to.capacity - to.members)) + " more" : "")
      : from.name + " has no members to transfer"
    : "—";

  let warn = "";
  if (to && n > 0 && to.members + n > to.capacity)
    warn = "This exceeds " + to.name + "’s capacity by " + num(to.members + n - to.capacity) + " members";
  else if (to && to.status !== "Active")
    warn = to.name + " is not trading yet — members will be queued until it opens";

  const onFromChange = (value: string) => {
    const next = Number(value);
    setFromId(next);
    if (toId === next) {
      const dest = branches.find((b) => b.id !== next);
      setToId(dest ? dest.id : 0);
    }
  };

  const validate = (): boolean => {
    const next: BranchTransferErrors = {};
    if (!to || !from || to.id === from.id) next.to = "Choose a different destination branch";

    const cnt = Number(count);
    if (!count || cnt < 1) next.count = "Enter how many members to transfer";
    else if (!Number.isInteger(cnt)) next.count = "Enter a whole number";
    else if (from && cnt > from.members)
      next.count = from.name + " only has " + num(from.members) + " members";
    else if (to && from && to.members + cnt > to.capacity)
      next.count = to.name + " can only take " + num(Math.max(0, to.capacity - to.members)) + " more members";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    if (!from || !to) return;
    onConfirm({ fromId: from.id, toId: to.id, count: Number(count), reason });
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
      aria-labelledby="tr-title"
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-500">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 id="tr-title" className="text-base font-black c-text">
              Transfer Members
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
              <label className="f-label" htmlFor="tr-from">
                From branch
              </label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="From branch"
                options={fromOptions}
                value={String(fromId)}
                onChange={(option) => onFromChange(option?.value ?? String(fromId))}
              />
            </div>
            <div>
              <label className="f-label" htmlFor="tr-to">
                To branch
              </label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="To branch"
                options={toOptions}
                value={String(toId)}
                onChange={(option) => setToId(Number(option?.value ?? toId))}
              />
              <div className={`f-error${errors.to ? " show" : ""}`}>
                <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                <span>{errors.to ?? ""}</span>
              </div>
            </div>
          </div>
          <div>
            <label className="f-label" htmlFor="tr-count">
              How many members
            </label>
            <input
              id="tr-count"
              type="number"
              min={1}
              className={`fp-input py-2.5 text-sm${errors.count ? " invalid" : ""}`}
              placeholder="50"
              aria-invalid={errors.count ? "true" : "false"}
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
            <div className={`f-error${errors.count ? " show" : ""}`}>
              <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
              <span>{errors.count ?? ""}</span>
            </div>
            <div className="f-hint">{hint}</div>
          </div>
          <div>
            <label className="f-label" htmlFor="tr-reason">
              Reason
            </label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Reason"
              options={REASON_OPTIONS}
              value={reason}
              onChange={(option) => setReason(option?.value ?? TRANSFER_REASONS[0])}
            />
          </div>
          <div>
            <div className="tr-flow">
              <div className="tr-box">
                <div className="n">{from ? from.name : "—"}</div>
                <div className="c">
                  {from
                    ? num(from.members) + " → " + num(Math.max(0, from.members - n)) + " members"
                    : "—"}
                </div>
              </div>
              <ArrowRight className="tr-arrow w-[18px] h-[18px] shrink-0" aria-hidden="true" />
              <div className="tr-box">
                <div className="n">{to ? to.name : "—"}</div>
                <div className="c">
                  {to ? num(to.members) + " → " + num(to.members + n) + " members" : "—"}
                </div>
              </div>
            </div>
            <div className={`tr-warn${warn ? " show" : ""}`}>
              <AlertTriangle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
              <span>{warn}</span>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              <ArrowLeftRight className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BranchTransferModal;
