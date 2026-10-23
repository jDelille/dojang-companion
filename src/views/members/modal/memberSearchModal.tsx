import { useState } from "react";
import { Search } from "lucide-react";
import Modal from "../../../components/common/Modal";
import type { CheckinMember } from "../../../types/checkin";
import { CHECKIN_MEMBERS } from "../../../utils/json/checkinData";
import CheckinResult from "../checkinResult";

/*
   Member Search — ported from #modal-search in tailwind/src/checkin.html and
   renderSearchModal() in assets/js/checkin.js.

   Unlike the inline lookup, an empty query lists every member here.
*/

type MemberSearchModalProps = {
  open: boolean;
  onClose: () => void;
  searchMembers: (query: string) => CheckinMember[];
  onCheckIn: (member: CheckinMember) => void;
};

const MemberSearchModal = ({
  open,
  onClose,
  searchMembers,
  onCheckIn,
}: MemberSearchModalProps) => {
  const [query, setQuery] = useState("");
  const results = query.trim() ? searchMembers(query) : CHECKIN_MEMBERS;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Member Search"
      boxClassName="glass modal-w-460"
      closeClassName="modal-x"
      titleClassName="text-base"
      headerClassName="mb-4"
    >
      <div className="relative mb-4">
        <Search
          className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] shrink-0"
          aria-hidden="true"
        />
        <input
          type="text"
          className="fp-input pl-9 py-2.5 text-sm"
          placeholder="Search by name, phone, or ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2 hist-scroll">
        {results.length ? (
          results.map((member) => (
            <CheckinResult key={member.mid} member={member} onCheckIn={onCheckIn} />
          ))
        ) : (
          <div className="text-center py-6 text-xs c-dim2">No members found</div>
        )}
      </div>
    </Modal>
  );
};

export default MemberSearchModal;
