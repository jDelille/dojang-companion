import { useEffect, useState } from "react";
import { Gift, X } from "lucide-react";
import CommonSelect from "../../../components/common-select/commonSelect";
import type { Reward, RewardCategory } from "../../../types/rewards";
import { CATEGORY_OPTIONS } from "../../../utils/json/rewardsData";
import type { RewardFormInput } from "../useRewards";

/*
   Add / Edit Reward — ported from #modal-edit in tailwind/src/rewards.html
   and openAdd()/openEdit()/saveEdit() in assets/js/rewards.js.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

type RewardFormModalProps = {
  open: boolean;
  /** The reward being edited, or null when adding. */
  reward: Reward | null;
  onClose: () => void;
  onSave: (input: RewardFormInput) => void;
  /** Called instead of onSave when the name is blank. */
  onInvalid: () => void;
};

const RewardFormModal = ({
  open,
  reward,
  onClose,
  onSave,
  onInvalid,
}: RewardFormModalProps) => {
  const [name, setName] = useState(reward?.name ?? "");
  const [cat, setCat] = useState<RewardCategory>(reward?.cat ?? "Membership");
  const [cost, setCost] = useState(reward ? String(reward.cost) : "");
  const [stock, setStock] = useState(reward ? String(reward.stock) : "");
  const [desc, setDesc] = useState(reward?.desc ?? "");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const save = () => {
    const trimmed = name.trim();
    // saveEdit() toasted "Enter a reward name" and kept the modal open.
    if (!trimmed) {
      onInvalid();
      return;
    }
    onSave({
      id: reward?.id ?? null,
      name: trimmed,
      cat,
      cost: Number(cost) || 0,
      // A blank stock field means unlimited, as saveEdit() defaulted to 999.
      stock: Number(stock) || 999,
      desc: desc.trim() || "—",
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
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-460">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="icon-box grad-gold ic-38">
              <Gift className="w-[17px] h-[17px] t-ink shrink-0" aria-hidden="true" />
            </div>
            <h3 className="text-base font-black c-text">
              {reward ? "Edit Reward" : "Add Reward"}
            </h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="f-label">Reward Name</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="e.g. Free PT Session"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Category</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Category"
              options={toOptions(CATEGORY_OPTIONS)}
              value={cat}
              onChange={(option) =>
                setCat((option?.value as RewardCategory) ?? "Membership")
              }
            />
          </div>
          <div>
            <label className="f-label">Points Cost</label>
            <input
              type="number"
              className="fp-input py-2.5 text-sm"
              placeholder="0"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Stock</label>
            <input
              type="number"
              className="fp-input py-2.5 text-sm"
              placeholder="999 = unlimited"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="f-label">Description</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="Short description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-gold flex-1 py-2.5 text-sm" onClick={save}>
            Save Reward
          </button>
        </div>
      </div>
    </div>
  );
};

export default RewardFormModal;
