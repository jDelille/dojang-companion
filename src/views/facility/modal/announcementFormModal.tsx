import { useState } from "react";
import { AlertCircle, Check, Eye, FileEdit, Send, X } from "lucide-react";
import type {
  Announcement,
  AnnouncementAudience,
  AnnouncementChannel,
  AnnouncementFormValues,
  AnnouncementPriority,
  AnnouncementType,
} from "../../../types/announcements";
import {
  AUDIENCES,
  CHANNELS,
  MAX_BODY,
  MAX_TITLE,
  PRIORITIES,
  PRIO_CLASS,
  TODAY,
  TYPES,
  estReach,
  meta,
} from "../../../utils/json/announcementsData";
import { AUD_FALLBACK, AUD_ICON_CMP, CHANNEL_ICON, TYPE_ICON } from "../announcementsIcons";
import CommonDatePicker from "../../../components/common-date-picker/commonDatePicker";

/*
   Add / Edit Announcement — ported from #modal-ann-form in
   tailwind/src/announcements.html and openForm()/submitForm() in
   assets/js/announcements.js. Type picker, channel toggles and live preview are
   state-driven. The flatpickr expiry input (d M, Y) becomes CommonDatePicker.
*/

const isoToDate = (iso: string | null): Date | null => {
  if (!iso) return null;
  const p = iso.split("-").map(Number);
  return new Date(p[0], p[1] - 1, p[2]);
};

const dateToIso = (d: Date | null): string | null => {
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

type AnnouncementFormModalProps = {
  open: boolean;
  target: Announcement | null;
  onClose: () => void;
  onSubmit: (values: AnnouncementFormValues, editId: number | null, asDraft: boolean) => void;
};

const AnnouncementFormModal = ({
  open,
  target,
  onClose,
  onSubmit,
}: AnnouncementFormModalProps) => {
  const [title, setTitle] = useState(target?.title ?? "");
  const [body, setBody] = useState(target?.body ?? "");
  const [type, setType] = useState<AnnouncementType>(target?.type ?? "General");
  const [audience, setAudience] = useState<AnnouncementAudience>(
    target?.audience ?? "Everyone",
  );
  const [priority, setPriority] = useState<AnnouncementPriority>(
    target?.priority ?? "Normal",
  );
  const [channels, setChannels] = useState<AnnouncementChannel[]>(
    target ? target.channels.slice() : ["In-App"],
  );
  const [expireDate, setExpireDate] = useState<Date | null>(isoToDate(target?.expireAt ?? null));
  const [pinned, setPinned] = useState(target?.pinned ?? false);

  const [titleErr, setTitleErr] = useState("");
  const [bodyErr, setBodyErr] = useState("");
  const [chanErr, setChanErr] = useState("");
  const [expireErr, setExpireErr] = useState("");

  const showDraft = !(target && (target.status === "Active" || target.status === "Expired"));

  const toggleChannel = (id: AnnouncementChannel) => {
    setChannels((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
    setChanErr("");
  };

  const collect = (): AnnouncementFormValues => ({
    title: title.trim(),
    body: body.trim(),
    type,
    audience,
    priority,
    channels: channels.slice(),
    expireAt: dateToIso(expireDate),
    pinned,
  });

  const validate = (): boolean => {
    let ok = true;
    const t = title.trim();
    if (!t) {
      setTitleErr("Enter a title");
      ok = false;
    } else if (t.length < 4) {
      setTitleErr("Title must be at least 4 characters");
      ok = false;
    } else if (t.length > MAX_TITLE) {
      setTitleErr("Title is " + (t.length - MAX_TITLE) + " characters over the limit");
      ok = false;
    } else setTitleErr("");

    const b = body.trim();
    if (!b) {
      setBodyErr("Write a message");
      ok = false;
    } else if (b.length < 10) {
      setBodyErr("Message must be at least 10 characters");
      ok = false;
    } else if (b.length > MAX_BODY) {
      setBodyErr("Message is " + (b.length - MAX_BODY) + " characters over the limit");
      ok = false;
    } else setBodyErr("");

    if (!channels.length) {
      setChanErr("Pick at least one delivery channel");
      ok = false;
    } else setChanErr("");

    const exp = dateToIso(expireDate);
    if (exp && exp < TODAY) {
      setExpireErr("Expiry date cannot be in the past");
      ok = false;
    } else setExpireErr("");

    return ok;
  };

  const submit = (asDraft: boolean) => {
    if (!validate()) return;
    onSubmit(collect(), target?.id ?? null, asDraft);
    onClose();
  };

  const previewMeta = meta(type);
  const PvAudIcon = AUD_ICON_CMP[audience] ?? AUD_FALLBACK;
  const titleCount = title.trim().length;
  const bodyCount = body.trim().length;

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
          <h3 className="text-base font-black c-text">
            {target ? "Edit Announcement" : "New Announcement"}
          </h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <form
          className="space-y-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit(false);
          }}
        >
          <div>
            <label className="f-label" htmlFor="af-name">
              Title{" "}
              <span className={`f-count${titleCount > MAX_TITLE ? " over" : ""}`}>
                {titleCount}/{MAX_TITLE}
              </span>
            </label>
            <input
              type="text"
              id="af-name"
              className="fp-input py-2.5 text-sm"
              placeholder="e.g. Memorial Dayday Timings Update"
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className={`f-error${titleErr ? " show" : ""}`}>
              <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
              <span>{titleErr}</span>
            </div>
          </div>

          <div>
            <label className="f-label" htmlFor="af-body">
              Message{" "}
              <span className={`f-count${bodyCount > MAX_BODY ? " over" : ""}`}>
                {bodyCount}/{MAX_BODY}
              </span>
            </label>
            <textarea
              id="af-body"
              className="fp-input py-2.5 text-sm"
              rows={3}
              placeholder="Write your announcement…"
              maxLength={600}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <div className={`f-error${bodyErr ? " show" : ""}`}>
              <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
              <span>{bodyErr}</span>
            </div>
          </div>

          <div>
            <span className="f-label">Type</span>
            <div className="type-grid" role="radiogroup" aria-label="Announcement type">
              {TYPES.map((t) => {
                const m = meta(t);
                const Icon = TYPE_ICON[t];
                return (
                  <button
                    key={t}
                    type="button"
                    className={`type-btn ${m.tcls}${t === type ? " sel" : ""}`}
                    role="radio"
                    aria-checked={t === type}
                    onClick={() => setType(t)}
                  >
                    <Icon className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label" htmlFor="af-audience">
                Audience
              </label>
              <select
                id="af-audience"
                className="fp-input py-2.5 text-sm"
                value={audience}
                onChange={(e) => setAudience(e.target.value as AnnouncementAudience)}
              >
                {AUDIENCES.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="f-label" htmlFor="af-priority">
                Priority
              </label>
              <select
                id="af-priority"
                className="fp-input py-2.5 text-sm"
                value={priority}
                onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <span className="f-label">Channels</span>
            <div className="chan-grid">
              {CHANNELS.map((c) => {
                const on = channels.includes(c.id);
                const Icon = CHANNEL_ICON[c.id];
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`chan-btn${on ? " on" : ""}`}
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => toggleChannel(c.id)}
                  >
                    <span className="chan-box">
                      <Check className="w-[10px] h-[10px] shrink-0" aria-hidden="true" />
                    </span>
                    <Icon className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                    {c.id}
                  </button>
                );
              })}
            </div>
            <div className={`f-error${chanErr ? " show" : ""}`}>
              <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
              <span>{chanErr}</span>
            </div>
          </div>

          <div>
            <label className="f-label" htmlFor="af-expire">
              Expires on{" "}
              <span className="c-dim2 font-normal normal-case">(optional)</span>
            </label>
            <CommonDatePicker
              className="py-2.5 text-sm"
              ariaLabel="Expires on"
              dateFormat="d M, yy"
              value={expireDate}
              onChange={(e) => setExpireDate((e.value as Date | null) ?? null)}
            />
            <div className={`f-error${expireErr ? " show" : ""}`}>
              <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
              <span>{expireErr}</span>
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              id="af-pin"
              className="cbx"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
            />
            <span className="text-xs c-dim">Pin to top of member app &amp; dashboard</span>
          </label>

          <div>
            <span className="f-label">Preview</span>
            <div className={`ann-preview ${previewMeta.tcls}`}>
              <span className="pv-accent" />
              <div className="pv-title">{title.trim() || "Untitled announcement"}</div>
              <div className="pv-body">{body.trim() || "Your message will appear here."}</div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="chan-chip">
                  <PvAudIcon className="w-[10px] h-[10px] shrink-0" aria-hidden="true" />
                  {audience}
                </span>
                <span className={`prio-pill ${PRIO_CLASS[priority]}`}>{priority}</span>
                {channels.length > 0 && (
                  <span className="chan-chip">
                    <Send className="w-[10px] h-[10px] shrink-0" aria-hidden="true" />
                    {channels.join(" · ")}
                  </span>
                )}
                <span className="chan-chip">
                  <Eye className="w-[10px] h-[10px] shrink-0" aria-hidden="true" />
                  ~{estReach(audience).toLocaleString("en-US")} reach
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className={`btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2${
                showDraft ? "" : " hidden"
              }`}
              onClick={() => submit(true)}
            >
              <FileEdit className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              Save Draft
            </button>
            <button
              type="submit"
              className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              {target ? (
                <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              ) : (
                <Send className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              )}
              {target ? "Save Changes" : "Publish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementFormModal;
