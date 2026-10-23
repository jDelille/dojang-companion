import { LogOut, UserPlus } from "lucide-react";
import Modal from "../../../components/common/Modal";
import type { DayPass } from "../../../types/dayPasses";
import { PASS_STATUS_BADGE } from "../../../utils/json/dayPassesData";
import { moneyWhole } from "../../../utils/formatUtils";
import QrBox from "../qrBox";

/*
   Pass Details — ported from #modal-pass in tailwind/src/day-passes.html and
   openPass() in assets/js/day-passes.js.

   The action row is built per status: Check Out only while the guest is
   inside, and Convert unless they already converted.
*/

type PassDetailsModalProps = {
  pass: DayPass | null;
  onClose: () => void;
  onCheckOut: (pass: DayPass) => void;
  onConvert: (pass: DayPass) => void;
};

const PassDetailsModal = ({
  pass,
  onClose,
  onCheckOut,
  onConvert,
}: PassDetailsModalProps) => (
  <Modal
    open={pass !== null}
    onClose={onClose}
    title="Pass Details"
    boxClassName="glass modal-w-400"
    titleClassName="text-base"
    headerClassName="mb-4"
  >
    <div className="gold-border-card p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <QrBox seed={pass?.code ?? "FIT"} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-black c-text">{pass?.name ?? "—"}</div>
          <div className="text-[11px] font-mono c-gold mt-0.5">{pass?.code ?? "—"}</div>
          <div className="text-[11px] c-dim mt-1">
            {pass ? `${pass.phone}${pass.ref ? ` · via ${pass.ref}` : ""}` : "—"}
          </div>
        </div>
        <span className={`badge ${pass ? PASS_STATUS_BADGE[pass.status] : "badge-present"}`}>
          <span className="dot" />
          {/* "Active" reads as "Inside" everywhere on this page. */}
          {pass ? (pass.status === "Active" ? "Inside" : pass.status) : "—"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-3 bd-t text-center">
        <div>
          <div className="text-[10px] c-dim2 font-black uppercase tracking-wider">Type</div>
          <div className="text-[12px] font-semibold c-text mt-0.5">{pass?.type ?? "—"}</div>
        </div>
        <div>
          <div className="text-[10px] c-dim2 font-black uppercase tracking-wider">Fee</div>
          <div className="text-[12px] font-semibold gt mt-0.5">
            {pass ? (pass.fee ? moneyWhole(pass.fee) : "Free") : "—"}
          </div>
        </div>
        <div>
          <div className="text-[10px] c-dim2 font-black uppercase tracking-wider">
            Check-In
          </div>
          <div className="text-[12px] font-semibold c-text mt-0.5">
            {pass?.checkin ?? "—"}
          </div>
        </div>
      </div>
    </div>
    <div className="flex gap-2">
      <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
        Close
      </button>
      {pass?.status === "Active" && (
        <button
          type="button"
          className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
          onClick={() => onCheckOut(pass)}
        >
          <LogOut className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Check Out
        </button>
      )}
      {pass && pass.status !== "Converted" && (
        <button
          type="button"
          className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
          onClick={() => onConvert(pass)}
        >
          <UserPlus className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Convert
        </button>
      )}
    </div>
  </Modal>
);

export default PassDetailsModal;
