import { useState } from "react";
import { AlertCircle, UserPlus, X } from "lucide-react";
import type { AssignErrors, AssignValues, Locker } from "../../../types/lockers";
import { DURATIONS, MEMBERS, TODAY } from "../../../utils/json/lockersData";
import CommonSelect from "../../../components/common-select/commonSelect";
import CommonDatePicker from "../../../components/common-date-picker/commonDatePicker";
import { addMonths, initials, parseIso, toIso } from "../useLockers";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Assign Locker — ported from #modal-assign in tailwind/src/lockers.html and
   openAssign()/validateAssign()/submitAssign() plus the member autocomplete in
   assets/js/lockers.js. Handles single and bulk targets; the duration select
   drives the expiry date, and editing either date switches duration to custom.
*/

type LockerAssignModalProps = {
  targets: Locker[];
  skipped: number;
  onClose: () => void;
  onConfirm: (ids: number[], values: AssignValues) => void;
};

const TODAY_DATE = parseIso(TODAY, new Date());

const LockerAssignModal = ({ targets, skipped, onClose, onConfirm }: LockerAssignModalProps) => {
  const open = targets.length > 0;

  const [member, setMember] = useState("");
  const [memberId, setMemberId] = useState<string | null>(null);
  const [from, setFrom] = useState<Date | null>(TODAY_DATE);
  const [duration, setDuration] = useState("3");
  const [until, setUntil] = useState<Date | null>(parseIso(addMonths(TODAY, 3), new Date()));
  const [reserve, setReserve] = useState(false);
  const [errors, setErrors] = useState<AssignErrors>({});
  const [acOpen, setAcOpen] = useState(false);

  const context =
    targets.length === 1
      ? "Locker " +
        targets[0].num +
        " · " +
        targets[0].zone +
        " Zone · " +
        targets[0].size +
        " · deposit $" +
        targets[0].deposit.toLocaleString("en-US")
      : "Assigning " +
        targets.length +
        " lockers (" +
        targets.map((l) => l.num).join(", ") +
        ") to one member" +
        (skipped ? " · " + skipped + " unavailable skipped" : "");

  const acMatches = (() => {
    const q = member.trim().toLowerCase();
    if (!q) return MEMBERS.slice(0, 6);
    return MEMBERS.filter(
      (m) => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q),
    ).slice(0, 6);
  })();

  const pickMember = (id: string) => {
    const m = MEMBERS.find((x) => x.id === id);
    if (!m) return;
    setMember(m.name);
    setMemberId(m.id);
    setAcOpen(false);
    setErrors((e) => ({ ...e, member: undefined }));
  };

  const syncUntil = (nextDuration: string, nextFrom: Date | null) => {
    if (nextDuration === "custom") return;
    const base = nextFrom ? toIso(nextFrom) : TODAY;
    setUntil(parseIso(addMonths(base, Number(nextDuration)), new Date()));
  };

  const validate = (): boolean => {
    const next: AssignErrors = {};
    const name = member.trim();
    if (!name) next.member = "Choose a member to assign";
    else if (name.length < 2) next.member = "Enter at least 2 characters";

    if (!from) next.from = "Pick a start date";

    if (!until) next.until = "Pick an expiry date";
    else if (from && toIso(until) <= toIso(from)) next.until = "Expiry must be after the start date";

    setErrors(next);
    return !next.member && !next.from && !next.until;
  };

  const submit = () => {
    if (!validate()) return;
    onConfirm(
      targets.map((l) => l.id),
      { member, memberId, from, until, reserve },
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
      aria-labelledby="as-title"
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-460">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 id="as-title" className="text-base font-black c-text">
              Assign Locker
            </h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">{context}</div>
        <form
          className="space-y-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div>
            <label className="f-label" htmlFor="as-member">
              Member
            </label>
            <div className="ac-wrap">
              <input
                type="text"
                id="as-member"
                className={`fp-input py-2.5 text-sm${errors.member ? " invalid" : ""}`}
                placeholder="Search member name or ID…"
                autoComplete="off"
                role="combobox"
                aria-expanded={acOpen}
                aria-autocomplete="list"
                aria-controls="as-ac"
                value={member}
                onChange={(e) => {
                  setMember(e.target.value);
                  setMemberId(null);
                  setAcOpen(true);
                }}
                onFocus={() => setAcOpen(true)}
                onBlur={() => window.setTimeout(() => setAcOpen(false), 120)}
              />
              <div
                id="as-ac"
                className={`ac-list${acOpen && acMatches.length ? " open" : ""}`}
                role="listbox"
                aria-label="Member suggestions"
              >
                {acMatches.map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    className="ac-item"
                    role="option"
                    aria-selected="false"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pickMember(m.id);
                    }}
                  >
                    <span className="ac-av av-gold">{initials(m.name)}</span>
                    <span className="flex-1 text-left">{m.name}</span>
                    <span className="text-[10px] c-dim2 font-mono">{m.id}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className={`f-error${errors.member ? " show" : ""}`}>
              <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
              <span>{errors.member ?? ""}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label" htmlFor="as-from">
                Start date
              </label>
              <CommonDatePicker
                className="py-2.5 text-sm"
                ariaLabel="Start date"
                dateFormat="d M, yy"
                value={from}
                onChange={(e) => {
                  const next = (e.value as Date | null) ?? null;
                  setFrom(next);
                  syncUntil(duration, next);
                }}
              />
              <div className={`f-error${errors.from ? " show" : ""}`}>
                <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                <span>{errors.from ?? ""}</span>
              </div>
            </div>
            <div>
              <label className="f-label" htmlFor="as-duration">
                Duration
              </label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Duration"
                options={DURATIONS}
                value={duration}
                onChange={(o) => {
                  const next = o?.value ?? "3";
                  setDuration(next);
                  syncUntil(next, from);
                }}
              />
            </div>
          </div>
          <div>
            <label className="f-label" htmlFor="as-until">
              Expires on
            </label>
            <CommonDatePicker
              className="py-2.5 text-sm"
              ariaLabel="Expires on"
              dateFormat="d M, yy"
              value={until}
              onChange={(e) => {
                setUntil((e.value as Date | null) ?? null);
                setDuration("custom");
              }}
            />
            <div className={`f-error${errors.until ? " show" : ""}`}>
              <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
              <span>{errors.until ?? ""}</span>
            </div>
          </div>
          <label className="flex items-center gap-2.5 text-[13px] c-text2 cursor-pointer">
            <input
              type="checkbox"
              className="cbx"
              checked={reserve}
              onChange={(e) => setReserve(e.target.checked)}
            />
            Reserve only (member has not collected the key yet)
          </label>
          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              <UserPlus className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              Assign Locker
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LockerAssignModal;
