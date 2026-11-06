import { useState } from "react";
import { X } from "lucide-react";
import type { DietFormValues, DietGoal, DietPlan, DietType } from "../../../types/diet";
import { DIET_GOALS, DIET_TYPES } from "../../../utils/json/dietData";
import CommonSelect from "../../../components/common-select/commonSelect";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   New / Edit Diet Plan — ported from #modal-diet-form in tailwind/src/diet.html
   and openForm()/submitForm() in assets/js/diet.js.
*/

const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

type DietFormModalProps = {
  open: boolean;
  target: DietPlan | null;
  onClose: () => void;
  onSubmit: (values: DietFormValues, editId: number | null) => boolean;
};

const DietFormModal = ({ open, target, onClose, onSubmit }: DietFormModalProps) => {
  const [name, setName] = useState(target?.name ?? "");
  const [goal, setGoal] = useState<DietGoal>(target?.goal ?? DIET_GOALS[0]);
  const [type, setType] = useState<DietType>(target?.type ?? DIET_TYPES[0]);
  const [calories, setCalories] = useState(String(target?.calories ?? 2000));
  const [protein, setProtein] = useState(String(target?.protein ?? 150));
  const [carbs, setCarbs] = useState(String(target?.carbs ?? 200));
  const [fat, setFat] = useState(String(target?.fat ?? 60));

  const submit = () => {
    const accepted = onSubmit(
      {
        name,
        goal,
        type,
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
      },
      target?.id ?? null,
    );
    if (accepted) onClose();
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
      <div className="modal-box glass modal-w-560">
        <div className="flex items-center justify-between mb-5">
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">
              {target ? "Edit Diet Plan" : "New Diet Plan"}
            </h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div>
            <label className="f-label">Plan Name</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="e.g. Lean Cut 1600"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="f-label">Goal</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Goal"
                options={toOptions(DIET_GOALS)}
                value={goal}
                onChange={(option) => setGoal((option?.value as DietGoal) ?? DIET_GOALS[0])}
              />
            </div>
            <div>
              <label className="f-label">Type</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Type"
                options={toOptions(DIET_TYPES)}
                value={type}
                onChange={(option) => setType((option?.value as DietType) ?? DIET_TYPES[0])}
              />
            </div>
            <div>
              <label className="f-label">Calories</label>
              <input
                type="number"
                min="0"
                className="fp-input py-2.5 text-sm"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="f-label">Protein (g)</label>
              <input
                type="number"
                min="0"
                className="fp-input py-2.5 text-sm"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
              />
            </div>
            <div>
              <label className="f-label">Carbs (g)</label>
              <input
                type="number"
                min="0"
                className="fp-input py-2.5 text-sm"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
              />
            </div>
            <div>
              <label className="f-label">Fat (g)</label>
              <input
                type="number"
                min="0"
                className="fp-input py-2.5 text-sm"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-gold flex-1 py-2.5 text-sm">
              {target ? "Save Changes" : "Create Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DietFormModal;
