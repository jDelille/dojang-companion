import { useCallback, useMemo, useRef, useState } from "react";
import type {
  FeedbackEntry,
  FeedbackPriority,
  FeedbackType,
} from "../../types/feedback";
import { FEEDBACK } from "../../utils/json/feedbackData";

/*
   Feedback page state — the React equivalent of the `state` object plus
   renderSummary()/filtered() in tailwind/src/assets/js/feedback.js.
*/

export type FeedbackTab = "All" | FeedbackType | "Unresolved";
export type RatingFilter = "All" | "1" | "2" | "3" | "4" | "5";

export const FEEDBACK_TABS: FeedbackTab[] = [
  "All",
  "Reviews",
  "Complaints",
  "Suggestions",
  "Unresolved",
];

export type FeedbackFormInput = {
  id: number | null;
  name: string;
  type: FeedbackType;
  topic: string;
  rating: number;
  text: string;
  resolved: boolean;
};

export function useFeedback() {
  const [feedback, setFeedback] = useState<FeedbackEntry[]>(FEEDBACK);
  const [tab, setTab] = useState<FeedbackTab>("All");
  const [rating, setRating] = useState<RatingFilter>("All");
  const [search, setSearch] = useState("");

  const idSeq = useRef(FEEDBACK.length);

  /** Only rated entries feed the average and the star histogram. */
  const rated = useMemo(() => feedback.filter((item) => item.rating > 0), [feedback]);

  const summary = useMemo(() => {
    const total = rated.length || 1;
    const average = rated.reduce((sum, item) => sum + item.rating, 0) / total;
    const bars = [5, 4, 3, 2, 1].map((star) => {
      const count = rated.filter((item) => item.rating === star).length;
      return { star, count, pct: Math.round((count / total) * 100) };
    });
    return { average, ratedCount: rated.length, bars };
  }, [rated]);

  const kpis = useMemo(() => {
    const ratedTotal = rated.length || 1;
    const positive = rated.filter((item) => item.rating >= 4).length;
    const replied = feedback.filter((item) => item.reply || item.resolved).length;
    return {
      positive: Math.round((positive / ratedTotal) * 100),
      open: feedback.filter((item) => item.type === "Complaints" && !item.resolved).length,
      total: feedback.length,
      response: Math.round((replied / (feedback.length || 1)) * 100),
    };
  }, [feedback, rated]);

  const counts = useMemo(() => {
    const base: Record<FeedbackTab, number> = {
      All: feedback.length,
      Reviews: 0,
      Complaints: 0,
      Suggestions: 0,
      Unresolved: 0,
    };
    feedback.forEach((item) => {
      base[item.type] += 1;
      if (!item.resolved) base.Unresolved += 1;
    });
    return base;
  }, [feedback]);

  const visible = useMemo(() => {
    const query = search.toLowerCase();
    return feedback.filter((item) => {
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.text.toLowerCase().includes(query) ||
        item.topic.toLowerCase().includes(query);
      // "Unresolved" cuts across types rather than matching one.
      const matchesTab =
        tab === "All" || (tab === "Unresolved" ? !item.resolved : item.type === tab);
      const matchesRating = rating === "All" || item.rating === Number(rating);
      return matchesQuery && matchesTab && matchesRating;
    });
  }, [feedback, search, tab, rating]);

  /** Replying also marks the entry resolved, as sendReply() did. */
  const sendReply = useCallback((id: number, text: string) => {
    setFeedback((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, reply: text, resolved: true } : item,
      ),
    );
  }, []);

  const assign = useCallback((id: number, assignee: string, priority: FeedbackPriority) => {
    setFeedback((prev) =>
      prev.map((item) => (item.id === id ? { ...item, assignee, priority } : item)),
    );
  }, []);

  /* A resolution note only fills the reply when there isn't one already. */
  const resolve = useCallback((id: number, note: string) => {
    setFeedback((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, resolved: true, reply: item.reply || note.trim() || item.reply }
          : item,
      ),
    );
  }, []);

  const removeEntry = useCallback((id: number) => {
    setFeedback((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const saveEntry = useCallback((input: FeedbackFormInput) => {
    setFeedback((prev) => {
      if (input.id != null) {
        return prev.map((item) =>
          item.id === input.id
            ? {
                ...item,
                name: input.name,
                type: input.type,
                topic: input.topic.trim() || "General",
                rating: input.rating,
                text: input.text.trim(),
                resolved: input.resolved,
              }
            : item,
        );
      }
      idSeq.current += 1;
      const created: FeedbackEntry = {
        id: idSeq.current,
        name: input.name,
        type: input.type,
        rating: input.rating,
        topic: input.topic.trim() || "General",
        text: input.text.trim(),
        when: "Just now",
        resolved: input.resolved,
        reply: null,
        assignee: null,
        priority: null,
      };
      return [created, ...prev];
    });
  }, []);

  return {
    feedback,
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
  };
}

export default useFeedback;
