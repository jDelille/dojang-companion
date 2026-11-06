import { useState } from "react";
import { AlertCircle, Check, X } from "lucide-react";
import type { Branch, BranchSettingsErrors } from "../../../types/branches";
import { AMENITIES, hoursOf } from "../../../utils/json/branchesData";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Branch Settings — ported from #modal-settings in tailwind/src/branches.html
   and openSettings()/renderAmenities()/validateSettings()/submitSettings() in
   assets/js/branches.js. Amenity chips are a custom checkbox group.
*/

type BranchSettingsModalProps = {
  branch: Branch | null;
  onClose: () => void;
  onConfirm: (
    branchId: number,
    values: {
      capacity: string;
      open: string;
      close: string;
      amenities: string[];
      signups: boolean;
      access247: boolean;
      publicVisible: boolean;
    },
  ) => void;
};

const BranchSettingsModal = ({ branch, onClose, onConfirm }: BranchSettingsModalProps) => {
  const open = branch !== null;

  const [capacity, setCapacity] = useState(branch ? String(branch.capacity) : "");
  const [openTime, setOpenTime] = useState(branch?.open ?? "");
  const [closeTime, setCloseTime] = useState(branch?.close ?? "");
  const [amenities, setAmenities] = useState<string[]>(branch ? branch.amenities.slice() : []);
  const [signups, setSignups] = useState(branch?.settings.signups ?? true);
  const [access247, setAccess247] = useState(branch?.settings.access247 ?? false);
  const [publicVisible, setPublicVisible] = useState(branch?.settings.publicVisible ?? true);
  const [errors, setErrors] = useState<BranchSettingsErrors>({});

  const toggleAmenity = (a: string) =>
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const validate = (): boolean => {
    const next: BranchSettingsErrors = {};
    const cap = Number(capacity);
    const members = branch?.members ?? 0;
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
    if (!branch) return;
    if (!validate()) return;
    onConfirm(branch.id, {
      capacity,
      open: openTime,
      close: closeTime,
      amenities,
      signups,
      access247,
      publicVisible,
    });
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
      aria-labelledby="bs-title"
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-560">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 id="bs-title" className="text-base font-black c-text">
              Branch Settings
            </h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {branch ? branch.name + " · " + branch.city + " · " + hoursOf(branch) : "Branch"}
        </div>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="f-label" htmlFor="bs-capacity">
                Capacity
              </label>
              <input
                id="bs-capacity"
                type="number"
                min={1}
                max={10000}
                className={`fp-input py-2.5 text-sm${errors.capacity ? " invalid" : ""}`}
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
              <label className="f-label" htmlFor="bs-open">
                Opens
              </label>
              <input
                id="bs-open"
                type="time"
                className="fp-input py-2.5 text-sm"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
              />
            </div>
            <div>
              <label className="f-label" htmlFor="bs-close">
                Closes
              </label>
              <input
                id="bs-close"
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

          <div className="mb-4">
            <span className="f-label">Amenities</span>
            <div className="amen-grid">
              {AMENITIES.map((a) => {
                const on = amenities.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    className={on ? "amen-chip on" : "amen-chip"}
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => toggleAmenity(a)}
                  >
                    <span className="amen-box">
                      <Check className="w-[10px] h-[10px] shrink-0" aria-hidden="true" />
                    </span>
                    {a}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-5">
            <div className="set-row">
              <div>
                <div className="st-t">Accept new memberships</div>
                <div className="st-s">Allow sign-ups at this location</div>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  id="bs-signups"
                  checked={signups}
                  onChange={(e) => setSignups(e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>
            <div className="set-row">
              <div>
                <div className="st-t">24/7 access</div>
                <div className="st-s">Members can enter outside staffed hours</div>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  id="bs-247"
                  checked={access247}
                  onChange={(e) => setAccess247(e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>
            <div className="set-row">
              <div>
                <div className="st-t">Public visibility</div>
                <div className="st-s">Show this branch on the website &amp; app</div>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  id="bs-public"
                  checked={publicVisible}
                  onChange={(e) => setPublicVisible(e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BranchSettingsModal;
