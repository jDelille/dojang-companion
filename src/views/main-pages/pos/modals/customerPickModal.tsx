import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import PosModal from "../posModal";
import { CUSTOMERS } from "../posData";
import { initials } from "../posUtils";

/*
   Customer / Member selection, ported from #modal-customer, #modal-member and
   renderPickList() in tailwind/src/pos.html and assets/js/pos.js.

   One component serves both: the member variant filters out the walk-in row,
   which is the only difference the template's `onlyMembers` flag made.
*/

type CustomerPickModalProps = {
  open: boolean;
  onClose: () => void;
  onPick: (name: string) => void;
  selectedName: string;
  /** Members only — excludes rows with no member id. */
  membersOnly?: boolean;
};

const CustomerPickModal = ({
  open,
  onClose,
  onPick,
  selectedName,
  membersOnly = false,
}: CustomerPickModalProps) => {
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = membersOnly ? CUSTOMERS.filter((c) => c.mid !== "—") : CUSTOMERS;
    if (!q) return base;
    return base.filter((c) =>
      (c.name + " " + c.mid + " " + c.plan).toLowerCase().includes(q),
    );
  }, [query, membersOnly]);

  return (
    <PosModal
      open={open}
      onClose={onClose}
      title={membersOnly ? "Select Member" : "Select Customer"}
    >
      <div className="relative mb-3">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 ic-14 t-dim"
          aria-hidden="true"
        />
        <input
          type="text"
          className="fp-input pl-9 py-2.5 text-sm"
          placeholder={
            membersOnly ? "Search members by name or ID…" : "Search customers…"
          }
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="pick-scroll">
        {list.length ? (
          list.map((c) => (
            <button
              key={c.name}
              type="button"
              className={c.name === selectedName ? "pick-row selected" : "pick-row"}
              onClick={() => {
                onPick(c.name);
                onClose();
              }}
            >
              <div className="pick-av">{initials(c.name)}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold c-text">{c.name}</div>
                <div className="text-[11px] t-muted">
                  {c.mid} · {c.plan}
                </div>
              </div>
              <span className="badge-active text-[9px] font-bold px-2 py-0.5 rounded-full">
                {c.tag}
              </span>
            </button>
          ))
        ) : (
          <div className="text-center py-8 t-dim text-sm">No matches</div>
        )}
      </div>
    </PosModal>
  );
};

export default CustomerPickModal;
