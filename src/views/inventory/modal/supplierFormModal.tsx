import { useState } from "react";
import { Check, X } from "lucide-react";
import type {
  Supplier,
  SupplierCategory,
  SupplierFormValues,
  SupplierStatus,
} from "../../../types/suppliers";
import {
  SUPPLIER_CATS,
  SUPPLIER_RATINGS,
  SUPPLIER_STATUSES,
} from "../../../utils/json/suppliersData";
import CommonSelect from "../../../components/common-select/commonSelect";

/*
   Add / Edit Supplier — ported from #modal-supplier-form in
   tailwind/src/suppliers.html and openForm()/submitForm() in
   assets/js/suppliers.js. New suppliers default to Pending, rating 4.
*/

const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

type SupplierFormModalProps = {
  open: boolean;
  target: Supplier | null;
  onClose: () => void;
  onSubmit: (values: SupplierFormValues, editId: number | null) => boolean;
};

const SupplierFormModal = ({ open, target, onClose, onSubmit }: SupplierFormModalProps) => {
  const [name, setName] = useState(target?.name ?? "");
  const [category, setCategory] = useState<SupplierCategory>(
    target?.category ?? SUPPLIER_CATS[0],
  );
  const [contact, setContact] = useState(target?.contact ?? "");
  const [email, setEmail] = useState(target?.email ?? "");
  const [phone, setPhone] = useState(target?.phone ?? "");
  const [city, setCity] = useState(target?.city ?? "");
  const [rating, setRating] = useState(target ? String(target.rating) : "4");
  const [status, setStatus] = useState<SupplierStatus>(target?.status ?? "Pending");

  const submit = () => {
    const accepted = onSubmit(
      {
        name,
        category,
        contact,
        email,
        phone,
        city,
        rating: Number(rating) || 4,
        status,
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
      <div className="modal-box glass modal-w-540">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-black c-text">
            {target ? "Edit Supplier" : "Add New Supplier"}
          </h3>
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
            <label className="f-label">Company name</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="e.g. Apex Nutrition Co."
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label">Category</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Category"
                options={toOptions(SUPPLIER_CATS)}
                value={category}
                onChange={(option) =>
                  setCategory((option?.value as SupplierCategory) ?? SUPPLIER_CATS[0])
                }
              />
            </div>
            <div>
              <label className="f-label">Contact person</label>
              <input
                type="text"
                className="fp-input py-2.5 text-sm"
                placeholder="Full name"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label">Email</label>
              <input
                type="email"
                className="fp-input py-2.5 text-sm"
                placeholder="vendor@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="f-label">Phone</label>
              <input
                type="text"
                className="fp-input py-2.5 text-sm"
                placeholder="(512) 555-0142"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="f-label">City</label>
              <input
                type="text"
                className="fp-input py-2.5 text-sm"
                placeholder="Austin"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div>
              <label className="f-label">Rating</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Rating"
                options={toOptions(SUPPLIER_RATINGS)}
                value={rating}
                onChange={(option) => setRating(option?.value ?? "4")}
              />
            </div>
            <div>
              <label className="f-label">Status</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Status"
                options={toOptions(SUPPLIER_STATUSES)}
                value={status}
                onChange={(option) =>
                  setStatus((option?.value as SupplierStatus) ?? "Pending")
                }
              />
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
              <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              {target ? "Save Changes" : "Save Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierFormModal;
