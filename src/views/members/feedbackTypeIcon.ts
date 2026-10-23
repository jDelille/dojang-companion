import { AlertTriangle, Lightbulb, Star } from "lucide-react";
import type { FeedbackType } from "../../types/feedback";

/*
   Feedback-type icons as components — the React counterpart of the `icon`
   field in TYPE_META (assets/js/feedback.js), which named a lucide glyph for
   the template's icons() pass to swap in.

   Kept out of stars.tsx so that file only exports a component, which is what
   React Fast Refresh requires.
*/
export const FEEDBACK_TYPE_ICON: Record<FeedbackType, typeof Star> = {
  Reviews: Star,
  Complaints: AlertTriangle,
  Suggestions: Lightbulb,
};

export default FEEDBACK_TYPE_ICON;
