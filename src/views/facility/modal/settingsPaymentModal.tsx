import { useState } from "react";
import { AlertCircle, Check, X } from "lucide-react";
import type { CardDetails } from "../../../types/settings";
import { TODAY } from "../../../utils/json/settingsData";
import CommonSelect from "../../../components/common-select/commonSelect";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Update Payment Method — ported from #modal-payment in tailwind/src/settings.html
   and openPayment()/submitPayment() in assets/js/settings.js. Month/Year selects
   live inside the modal, so they become CommonSelect. Luhn check preserved.
*/

const luhn = (num: string): boolean => {
  const s = String(num).replace(/\D/g, "");
  if (s.length < 12) return false;
  let sum = 0;
  let dbl = false;
  for (let i = s.length - 1; i >= 0; i--) {
    let d = Number(s[i]);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
};

const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const v = String(i + 1).padStart(2, "0");
  return { value: v, label: v };
});
const YEAR = Number(TODAY.slice(0, 4));
const YEARS = Array.from({ length: 12 }, (_, i) => ({
  value: String(YEAR + i).slice(2),
  label: String(YEAR + i),
}));

type SettingsPaymentModalProps = {
  open: boolean;
  card: CardDetails;
  onClose: () => void;
  onConfirm: (card: CardDetails) => void;
};

const SettingsPaymentModal = ({ open, card, onClose, onConfirm }: SettingsPaymentModalProps) => {
  const [number, setNumber] = useState("");
  const [name, setName] = useState(card.name || "");
  const [month, setMonth] = useState(card.exp.split("/")[0]);
  const [year, setYear] = useState(card.exp.split("/")[1]);
  const [cvv, setCvv] = useState("");
  const [bank, setBank] = useState(card.bank || "");

  const [numberErr, setNumberErr] = useState("");
  const [nameErr, setNameErr] = useState("");
  const [yearErr, setYearErr] = useState("");
  const [cvvErr, setCvvErr] = useState("");

  const submit = () => {
    let ok = true;
    const num = number.replace(/\s/g, "");
    if (!num) {
      setNumberErr("Enter the card number");
      ok = false;
    } else if (!/^\d{12,19}$/.test(num)) {
      setNumberErr("Card number must be 12–19 digits");
      ok = false;
    } else if (!luhn(num)) {
      setNumberErr("That card number looks invalid");
      ok = false;
    } else setNumberErr("");

    if (!name.trim()) {
      setNameErr("Enter the name on the card");
      ok = false;
    } else setNameErr("");

    const expIso = "20" + year + "-" + month;
    if (expIso < TODAY.slice(0, 7)) {
      setYearErr("That card has already expired");
      ok = false;
    } else setYearErr("");

    if (!/^\d{3,4}$/.test(cvv)) {
      setCvvErr("CVV must be 3 or 4 digits");
      ok = false;
    } else setCvvErr("");

    if (!ok) return;
    onConfirm({
      last4: num.slice(-4),
      exp: month + "/" + year,
      bank: bank.trim() || "Card",
      name: name.trim(),
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
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Update Payment Method</h3>
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
            <label className="f-label" htmlFor="pm-number">
              Card number
            </label>
            <input
              type="text"
              id="pm-number"
              className="fp-input py-2.5 text-sm"
              placeholder="4242 4242 4242 4242"
              inputMode="numeric"
              autoComplete="cc-number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
            <div className={`f-error${numberErr ? " show" : ""}`}>
              <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
              <span>{numberErr}</span>
            </div>
          </div>
          <div>
            <label className="f-label" htmlFor="pm-name">
              Name on card
            </label>
            <input
              type="text"
              id="pm-name"
              className="fp-input py-2.5 text-sm"
              placeholder="Nathan Reeves"
              autoComplete="cc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className={`f-error${nameErr ? " show" : ""}`}>
              <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
              <span>{nameErr}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="f-label" htmlFor="pm-month">
                Month
              </label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Month"
                options={MONTHS}
                value={month}
                onChange={(o) => setMonth(o?.value ?? MONTHS[0].value)}
              />
            </div>
            <div>
              <label className="f-label" htmlFor="pm-year">
                Year
              </label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Year"
                options={YEARS}
                value={year}
                onChange={(o) => setYear(o?.value ?? YEARS[0].value)}
              />
              <div className={`f-error${yearErr ? " show" : ""}`}>
                <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                <span>{yearErr}</span>
              </div>
            </div>
            <div>
              <label className="f-label" htmlFor="pm-cvv">
                CVV
              </label>
              <input
                id="pm-cvv"
                type="password"
                className="fp-input py-2.5 text-sm"
                placeholder="•••"
                inputMode="numeric"
                maxLength={4}
                autoComplete="new-password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
              />
              <div className={`f-error${cvvErr ? " show" : ""}`}>
                <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                <span>{cvvErr}</span>
              </div>
            </div>
          </div>
          <div>
            <label className="f-label" htmlFor="pm-bank">
              Bank
            </label>
            <input
              type="text"
              id="pm-bank"
              className="fp-input py-2.5 text-sm"
              placeholder="Chase Bank"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
            />
          </div>
          <div className="ctx-box">
            Card details are validated in the browser for this demo — no data leaves the page.
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
              Save Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPaymentModal;
