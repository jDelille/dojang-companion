import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Edit2,
  Eye,
  Lightbulb,
  MessageSquare,
  MoreVertical,
  Plus,
  Reply,
  Search,
  Send,
  Star,
  Tag,
  ThumbsUp,
  Trash2,
  User,
  UserPlus,
} from "lucide-react";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import CommonSelect from "../../components/common-select/commonSelect";
import useToast from "../../hooks/useToast";
import type { FeedbackEntry } from "../../types/feedback";
import { FEEDBACK_TYPE_META } from "../../utils/json/feedbackData";
import { initials } from "../../utils/formatUtils";
import leadAvatar from "./leadAvatar";
import Stars from "./stars";
import FEEDBACK_TYPE_ICON from "./feedbackTypeIcon";
import useFeedback, {
  FEEDBACK_TABS,
  type FeedbackTab,
  type RatingFilter,
} from "./useFeedback";
import FeedbackReplyModal from "./modal/feedbackReplyModal";
import FeedbackEditModal from "./modal/feedbackEditModal";
import FeedbackViewModal from "./modal/feedbackViewModal";
import FeedbackAssignModal from "./modal/feedbackAssignModal";
import FeedbackResolveModal from "./modal/feedbackResolveModal";
import FeedbackDeleteModal from "./modal/feedbackDeleteModal";
import FeedbackExportModal from "./modal/feedbackExportModal";

/*
   Feedback & Reviews — ported from tailwind/src/feedback.html +
   assets/js/feedback.js.

   The template kept one <div id="fb-menu"> on <body>; here each card uses the
   shared <RowMenu>, which portals its panel for the same reason.
*/

const RATING_OPTIONS = [
  { value: "All", label: "All Ratings" },
  { value: "5", label: "5 stars" },
  { value: "4", label: "4 stars" },
  { value: "3", label: "3 stars" },
  { value: "2", label: "2 stars" },
  { value: "1", label: "1 star" },
];

const TAB_ICON: Record<FeedbackTab, typeof Star | null> = {
  All: null,
  Reviews: Star,
  Complaints: AlertTriangle,
  Suggestions: Lightbulb,
  Unresolved: Clock,
};

const Feedback = () => {
  const {
    visible,
    summary,
    kpis,
    counts,
    tab,
    setTab,
    rating,
    setRating,
    search,
    setSearch,
    sendReply,
    assign,
    resolve,
    removeEntry,
    saveEntry,
  } = useFeedback();
  const { message, visible: toastVisible, showToast } = useToast();

  const [replyTarget, setReplyTarget] = useState<FeedbackEntry | null>(null);
  const [view, setView] = useState<FeedbackEntry | null>(null);
  const [assignTarget, setAssignTarget] = useState<FeedbackEntry | null>(null);
  const [resolveTarget, setResolveTarget] = useState<FeedbackEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeedbackEntry | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<FeedbackEntry | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const openEdit = (entry: FeedbackEntry | null) => {
    setEditing(entry);
    setEditOpen(true);
  };

  const menuItemsFor = (entry: FeedbackEntry) => (
    <>
      <button type="button" className="dropdown-item" onClick={() => setView(entry)}>
        <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        View
      </button>
      <button type="button" className="dropdown-item" onClick={() => openEdit(entry)}>
        <Edit2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Edit
      </button>
      <button type="button" className="dropdown-item" onClick={() => setReplyTarget(entry)}>
        <Reply className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Reply
      </button>
      <button type="button" className="dropdown-item" onClick={() => setAssignTarget(entry)}>
        <UserPlus className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Assign
      </button>
      <button type="button" className="dropdown-item" onClick={() => setResolveTarget(entry)}>
        <Check className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Resolve
      </button>
      <div className="menu-sep" />
      <button
        type="button"
        className="dropdown-item danger"
        onClick={() => setDeleteTarget(entry)}
      >
        <Trash2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Delete
      </button>
    </>
  );

  return (
    <>
      {/* Page header */}
      <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black c-text">Feedback &amp; Reviews</h2>
          <p className="text-sm mt-0.5 c-dim">
            Member ratings, reviews &amp; complaints · Austin HQ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => setExportOpen(true)}
          >
            <Download className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => showToast("Feedback request sent to members")}
          >
            <Send className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Request
          </button>
          <button
            type="button"
            className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
            onClick={() => openEdit(null)}
          >
            <Plus className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Add Feedback
          </button>
        </div>
      </div>

      {/* Overview row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Average score */}
        <div className="gold-border-card p-5 flex items-center gap-5">
          <div className="text-center">
            <div className="text-5xl font-black gt leading-none">
              {summary.average.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-0.5 mt-2">
              <Stars value={Math.round(summary.average)} size={15} />
            </div>
            <div className="text-[11px] c-dim mt-1.5">
              <span>{summary.ratedCount}</span> reviews
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            {summary.bars.map((bar) => (
              <div key={bar.star} className="flex items-center gap-2">
                <span className="text-[11px] c-dim2 font-bold bar-star">{bar.star}</span>
                <Star
                  className="star-on shrink-0"
                  style={{ width: "11px", height: "11px" }}
                  aria-hidden="true"
                />
                <div className="rate-track flex-1">
                  <div className="rate-fill" style={{ width: `${bar.pct}%` }} />
                </div>
                <span className="text-[11px] c-dim2 bar-count">{bar.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          <div className="sc-members reveal">
            <div className="sc-members-chip">
              <ThumbsUp className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
            </div>
            <div>
              <div className="text-2xl font-black c-text leading-none">{kpis.positive}%</div>
              <div className="text-xs font-medium mt-1 c-dim">Positive Sentiment</div>
            </div>
          </div>
          <div className="sc-members reveal">
            <div className="sc-members-chip">
              <AlertCircle className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
            </div>
            <div>
              <div className="text-2xl font-black c-text leading-none">{kpis.open}</div>
              <div className="text-xs font-medium mt-1 c-dim">Open Complaints</div>
            </div>
          </div>
          <div className="sc-members reveal">
            <div className="sc-members-chip">
              <MessageSquare
                className="w-[18px] h-[18px] c-gold shrink-0"
                aria-hidden="true"
              />
            </div>
            <div>
              <div className="text-2xl font-black c-text leading-none">{kpis.total}</div>
              <div className="text-xs font-medium mt-1 c-dim">Total Feedback</div>
            </div>
          </div>
          <div className="sc-members reveal">
            <div className="sc-members-chip">
              <Reply className="w-[18px] h-[18px] c-gold shrink-0" aria-hidden="true" />
            </div>
            <div>
              <div className="text-2xl font-black c-text leading-none">{kpis.response}%</div>
              <div className="text-xs font-medium mt-1 c-dim">Response Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {FEEDBACK_TABS.map((name) => {
            const Icon = TAB_ICON[name];
            return (
              <button
                key={name}
                type="button"
                className={name === tab ? "ord-tab active" : "ord-tab"}
                onClick={() => setTab(name)}
              >
                {Icon && <Icon className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />}
                {name} <span className="cnt">{counts[name]}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <CommonSelect
            className="w-auto"
            fieldClassName="py-2 text-sm"
            ariaLabel="Filter by rating"
            options={RATING_OPTIONS}
            value={rating}
            onChange={(option) => setRating((option?.value as RatingFilter) ?? "All")}
          />
          <div className="relative min-w-[170px]">
            <Search
              className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] shrink-0"
              aria-hidden="true"
            />
            <input
              type="text"
              className="fp-input pl-9 py-2 text-sm"
              placeholder="Search feedback…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Feedback list */}
      <div className="space-y-4">
        {visible.map((entry) => {
          const meta = FEEDBACK_TYPE_META[entry.type];
          const TypeIcon = FEEDBACK_TYPE_ICON[entry.type];
          return (
            <div key={entry.id} className="fb-card">
              <div className="flex items-start gap-3">
                <div className={`fb-av av ${leadAvatar(entry.id)}`}>
                  {initials(entry.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-bold c-text">{entry.name}</span>
                    <span className={`badge ${meta.badge}`}>
                      <TypeIcon className="w-[10px] h-[10px] shrink-0" aria-hidden="true" />
                      {meta.label}
                    </span>
                    {entry.rating > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Stars value={entry.rating} size={12} />
                      </span>
                    )}
                    <span className="text-[10px] c-dim2 ml-auto">{entry.when}</span>
                    <RowMenu
                      triggerTitle="More"
                      trigger={
                        <MoreVertical
                          className="w-[15px] h-[15px] shrink-0"
                          aria-hidden="true"
                        />
                      }
                    >
                      {menuItemsFor(entry)}
                    </RowMenu>
                  </div>
                  <p className="text-[13px] c-dim mt-1.5 leading-relaxed">{entry.text}</p>
                  <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                    <span className="topic-pill">
                      <Tag className="w-[10px] h-[10px] shrink-0" aria-hidden="true" />
                      {entry.topic}
                    </span>
                    {entry.resolved ? (
                      <span className="topic-pill tp-green">
                        <CheckCircle2
                          className="w-[10px] h-[10px] shrink-0"
                          aria-hidden="true"
                        />
                        Resolved
                      </span>
                    ) : (
                      <span className="topic-pill tp-orange">
                        <Clock className="w-[10px] h-[10px] shrink-0" aria-hidden="true" />
                        Open
                      </span>
                    )}
                    {entry.assignee && (
                      <span className="topic-pill tp-gold">
                        <User className="w-[10px] h-[10px] shrink-0" aria-hidden="true" />
                        {entry.assignee}
                      </span>
                    )}
                  </div>
                  {entry.reply && (
                    <div className="reply-box">
                      <div className="text-[10px] font-black uppercase tracking-wider c-gold mb-1">
                        Staff Reply
                      </div>
                      <div className="text-[12px] c-text2">{entry.reply}</div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      className="btn-ghost px-3 py-1.5 text-xs flex items-center gap-1.5"
                      onClick={() => setReplyTarget(entry)}
                    >
                      <Reply className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                      {entry.reply ? "Edit Reply" : "Reply"}
                    </button>
                    {!entry.resolved && (
                      <button
                        type="button"
                        className="btn-gold px-3 py-1.5 text-xs flex items-center gap-1.5"
                        onClick={() => setResolveTarget(entry)}
                      >
                        <Check className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {visible.length === 0 && (
        <div className="text-center py-16">
          <div className="text-[42px] opacity-30 mb-2">💬</div>
          <div className="text-sm font-bold c-text">No feedback found</div>
          <div className="text-xs mt-1 c-dim">Try a different filter or search</div>
        </div>
      )}

      {/* Keyed so a different entry reseeds the textarea. */}
      <FeedbackReplyModal
        key={replyTarget?.id ?? "reply"}
        entry={replyTarget}
        onClose={() => setReplyTarget(null)}
        onSend={(entry, text) => {
          if (text) sendReply(entry.id, text);
          setReplyTarget(null);
          setView(null);
          showToast("Reply sent to member");
        }}
      />
      <FeedbackEditModal
        key={editing?.id ?? "add"}
        open={editOpen}
        entry={editing}
        onClose={() => setEditOpen(false)}
        onSave={(input) => {
          saveEntry(input);
          showToast(input.id != null ? "Feedback updated" : "Feedback added");
        }}
        onInvalid={() => showToast("Enter a member name")}
      />
      <FeedbackViewModal
        entry={view}
        onClose={() => setView(null)}
        onReply={(entry) => {
          setView(null);
          setReplyTarget(entry);
        }}
        onAssign={(entry) => {
          setView(null);
          setAssignTarget(entry);
        }}
        onResolve={(entry) => {
          setView(null);
          setResolveTarget(entry);
        }}
      />
      <FeedbackAssignModal
        key={assignTarget?.id ?? "assign"}
        entry={assignTarget}
        onClose={() => setAssignTarget(null)}
        onAssign={(entry, assignee, priority) => {
          assign(entry.id, assignee, priority);
          setAssignTarget(null);
          showToast(`Assigned to ${assignee} (${priority})`);
        }}
      />
      <FeedbackResolveModal
        key={resolveTarget?.id ?? "resolve"}
        entry={resolveTarget}
        onClose={() => setResolveTarget(null)}
        onResolve={(entry, note) => {
          resolve(entry.id, note);
          setResolveTarget(null);
          showToast("Marked as resolved");
        }}
      />
      <FeedbackDeleteModal
        entry={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={(entry) => {
          removeEntry(entry.id);
          setDeleteTarget(null);
          showToast(`${entry.name} feedback deleted`);
        }}
      />
      <FeedbackExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onExport={(format, scope) => {
          const count = scope === "all" ? kpis.total : visible.length;
          showToast(`Exported ${count} records as ${format}`);
        }}
      />
      <Toast message={message} visible={toastVisible} />
    </>
  );
};

export default Feedback;
