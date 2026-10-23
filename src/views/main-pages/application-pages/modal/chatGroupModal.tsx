import { useState } from "react";
import { AlertCircle, Check, X } from "lucide-react";
import type { Conversation } from "../../../../types/chat";
import { PEOPLE, person } from "../../../../utils/json/chatData";
import { avatarFor, initials } from "../useChat";

/*
   New / Edit Group — ported from #modal-group in tailwind/src/chat.html and
   openGroup()/submitGroup() in assets/js/chat.js.
*/

type ChatGroupModalProps = {
  open: boolean;
  target: Conversation | null;
  allGroups: Conversation[];
  onClose: () => void;
  onSubmit: (editId: number | null, name: string, about: string, members: number[]) => void;
};

const ChatGroupModal = ({
  open,
  target,
  allGroups,
  onClose,
  onSubmit,
}: ChatGroupModalProps) => {
  const [name, setName] = useState(target?.name ?? "");
  const [about, setAbout] = useState(target?.about ?? "");
  const [members, setMembers] = useState<number[]>(target ? target.members.slice() : []);
  const [query, setQuery] = useState("");
  const [nameErr, setNameErr] = useState("");
  const [membersErr, setMembersErr] = useState("");

  const editId = target?.id ?? null;

  const toggleMember = (id: number) => {
    setMembers((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
    setMembersErr("");
  };

  const q = query.trim().toLowerCase();
  const list = PEOPLE.filter(
    (p) => !q || p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q),
  );

  const submit = () => {
    let ok = true;
    const n = name.trim();
    if (!n) {
      setNameErr("Enter a group name");
      ok = false;
    } else if (n.length < 3) {
      setNameErr("Name must be at least 3 characters");
      ok = false;
    } else if (
      allGroups.some(
        (c) => c.type === "group" && c.name?.toLowerCase() === n.toLowerCase() && c.id !== editId,
      )
    ) {
      setNameErr("A group with this name already exists");
      ok = false;
    } else setNameErr("");

    if (members.length < 2) {
      setMembersErr("A group needs at least 2 members");
      ok = false;
    } else setMembersErr("");

    if (!ok) return;
    onSubmit(editId, n, about.trim(), members);
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
      <div className="modal-box glass modal-w-520">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black c-text">{target ? "Edit Group" : "New Group"}</h3>
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
            <label className="f-label" htmlFor="gp-name">
              Group name
            </label>
            <input
              type="text"
              id="gp-name"
              className="fp-input py-2.5 text-sm"
              placeholder="e.g. Trainers — Austin HQ"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className={`f-error${nameErr ? " show" : ""}`}>
              <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
              <span>{nameErr}</span>
            </div>
          </div>
          <div>
            <label className="f-label" htmlFor="gp-about">
              Description
            </label>
            <input
              type="text"
              id="gp-about"
              className="fp-input py-2.5 text-sm"
              placeholder="What is this group for?"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
            />
          </div>
          <div>
            <span className="f-label">
              Members (<span>{members.length}</span>)
            </span>
            <div className="chip-row mb-2">
              {members.length ? (
                members.map((id) => {
                  const p = person(id);
                  if (!p) return null;
                  return (
                    <span key={id} className="mem-chip">
                      {p.name}
                      <button
                        type="button"
                        aria-label={`Remove ${p.name}`}
                        onClick={() => toggleMember(id)}
                      >
                        <X className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                      </button>
                    </span>
                  );
                })
              ) : (
                <span className="chip-empty">No members yet — add people below</span>
              )}
            </div>
            <div className={`f-error${membersErr ? " show" : ""}`}>
              <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
              <span>{membersErr}</span>
            </div>
          </div>
          <div>
            <label className="f-label" htmlFor="gp-search">
              Add people
            </label>
            <input
              type="text"
              id="gp-search"
              className="fp-input py-2.5 text-sm mb-2"
              placeholder="Search people…"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="person-scroll" role="group" aria-label="People to add">
              {list.length ? (
                list.map((p) => {
                  const on = members.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={`person-opt${on ? " sel" : ""}`}
                      role="checkbox"
                      aria-checked={on}
                      onClick={() => toggleMember(p.id)}
                    >
                      <span className={`p-av av ${avatarFor(p.id)}`}>
                        {initials(p.name)}
                        {p.online && <span className="online-dot" />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[13px] font-semibold c-text truncate">
                          {p.name}
                        </span>
                        <span className="block text-[11px] c-dim truncate">{p.role}</span>
                      </span>
                      <Check
                        className={`w-[15px] h-[15px] c-gold shrink-0${on ? "" : " opacity-0"}`}
                        aria-hidden="true"
                      />
                    </button>
                  );
                })
              ) : (
                <div className="text-xs c-dim text-center py-6">No people match “{query}”</div>
              )}
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
              {target ? "Save Changes" : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatGroupModal;
