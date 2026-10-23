import { Copy, EyeOff, Pencil, Printer, RefreshCw, Send, Trash2, X } from "lucide-react";
import type { Announcement } from "../../../types/announcements";
import { PRIO_CLASS, STATUS_BADGE, estReach, meta } from "../../../utils/json/announcementsData";
import { TYPE_ICON } from "../announcementsIcons";
import { fmtDate, fmtDateTime } from "../useAnnouncements";

/*
   View Announcement — ported from #modal-view in tailwind/src/announcements.html
   and openView() in assets/js/announcements.js. The primary button switches
   between Publish / Unpublish / Republish with the announcement's lifecycle.
*/

type AnnouncementViewModalProps = {
  announcement: Announcement | null;
  onClose: () => void;
  onDuplicate: () => void;
  onPrint: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onRepublish: () => void;
};

const AnnouncementViewModal = ({
  announcement: a,
  onClose,
  onDuplicate,
  onPrint,
  onDelete,
  onEdit,
  onPublish,
  onUnpublish,
  onRepublish,
}: AnnouncementViewModalProps) => {
  const open = a !== null;
  const m = a ? meta(a.type) : meta("General");
  const Icon = a ? TYPE_ICON[a.type] : TYPE_ICON.General;

  let primary = { label: "Publish", Icon: Send, onClick: onPublish };
  if (a?.status === "Active") primary = { label: "Unpublish", Icon: EyeOff, onClick: onUnpublish };
  else if (a?.status === "Expired")
    primary = { label: "Republish", Icon: RefreshCw, onClick: onRepublish };
  const PrimaryIcon = primary.Icon;

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
          <h3 className="text-base font-black c-text">Announcement</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>

        <div className={`gold-border-card p-4 mb-4 ${m.tcls}`}>
          <div className="flex items-start gap-3">
            <div className={`ann-ic ${m.cls}`}>
              <Icon className="w-[19px] h-[19px] shrink-0" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="ann-title">{a?.title ?? "—"}</span>
                <span className={`prio-pill ${a ? PRIO_CLASS[a.priority] : "p-normal"}`}>
                  {a?.priority ?? "—"}
                </span>
              </div>
              <div className="ann-body">{a?.body ?? "—"}</div>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <div className="detail-row">
            <span className="k">Status</span>
            <span className="v">
              <span className={`badge ${a ? STATUS_BADGE[a.status] : "badge-present"}`}>
                <span className="dot" />
                {a?.status ?? "—"}
              </span>
            </span>
          </div>
          <div className="detail-row">
            <span className="k">Type</span>
            <span className="v">{a?.type ?? "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Audience</span>
            <span className="v">
              {a ? a.audience + " (~" + estReach(a.audience).toLocaleString("en-US") + ")" : "—"}
            </span>
          </div>
          <div className="detail-row">
            <span className="k">Channels</span>
            <span className="v">{a && a.channels.length ? a.channels.join(", ") : "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Reach</span>
            <span className="v">
              {a
                ? a.reach
                  ? a.reach.toLocaleString("en-US") + " reached"
                  : a.status === "Active"
                    ? "Collecting…"
                    : "—"
                : "—"}
            </span>
          </div>
          <div className="detail-row">
            <span className="k">Created</span>
            <span className="v">{a ? fmtDateTime(a.createdAt) : "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Publishes</span>
            <span className="v">
              {a
                ? a.publishAt
                  ? fmtDateTime(a.publishAt) + (a.status === "Scheduled" ? " (scheduled)" : "")
                  : "Not published"
                : "—"}
            </span>
          </div>
          <div className="detail-row">
            <span className="k">Expires</span>
            <span className="v">{a ? (a.expireAt ? fmtDate(a.expireAt) : "No expiry") : "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Author</span>
            <span className="v">{a?.author ?? "—"}</span>
          </div>
        </div>

        <div className="flex gap-2 mb-2">
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onDuplicate}
          >
            <Copy className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Duplicate
          </button>
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onPrint}
          >
            <Printer className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Print
          </button>
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2 danger-link"
            onClick={onDelete}
          >
            <Trash2 className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Delete
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onEdit}
          >
            <Pencil className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Edit
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            aria-label="Primary action"
            onClick={primary.onClick}
          >
            <PrimaryIcon className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            {primary.label}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementViewModal;
