import type { FeedbackEntry, FeedbackType } from "../../types/feedback";



export type FeedbackTypeMeta = {
  badge: string;
  label: string;
  icon: string;
};

export const FEEDBACK_TYPE_META: Record<FeedbackType, FeedbackTypeMeta> = {
  Reviews: { badge: "badge-present", label: "Review", icon: "star" },
  Complaints: { badge: "badge-absent", label: "Complaint", icon: "alert-triangle" },
  Suggestions: { badge: "badge-active", label: "Suggestion", icon: "lightbulb" },
};

export const FEEDBACK_TYPE_OPTIONS: FeedbackType[] = [
  "Reviews",
  "Complaints",
  "Suggestions",
];

export const ASSIGNEE_OPTIONS = [
  "Front Desk",
  "Daniel Foster",
  "Rachel Morgan",
  "Andre Jackson",
  "Facilities Team",
  "Billing Team",
];

export const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Urgent"];

export const EXPORT_FORMATS = ["CSV", "Excel", "PDF"];

export const FEEDBACK: FeedbackEntry[] = [
  { id: 1, name: "Ashley Bennett", type: "Reviews", rating: 5, topic: "Trainers", text: "Daniel is an incredible trainer. Down 8kg in 3 months — the personalised plan really works!", when: "2 hr ago", resolved: true, reply: "Thank you Ashley! So proud of your progress. 💪", assignee: null, priority: null },
  { id: 2, name: "Marcus Coleman", type: "Complaints", rating: 2, topic: "Facilities", text: "The AC in the cardio zone has been faulty for a week. Gets too hot during evening workouts.", when: "5 hr ago", resolved: false, reply: null, assignee: null, priority: null },
  { id: 3, name: "Sofia Delgado", type: "Reviews", rating: 5, topic: "Classes", text: "Love the yoga sessions with Rachel. Calm, focused and always on time.", when: "Yesterday", resolved: true, reply: null, assignee: null, priority: null },
  { id: 4, name: "Tyler Brooks", type: "Suggestions", rating: 4, topic: "Amenities", text: "Would be great to have protein shakes available at the front desk after workouts.", when: "Yesterday", resolved: false, reply: null, assignee: null, priority: null },
  { id: 5, name: "Megan Sullivan", type: "Reviews", rating: 4, topic: "Overall", text: "Great gym, clean and well-equipped. Could use more squat racks during peak hours.", when: "2 days ago", resolved: true, reply: null, assignee: null, priority: null },
  { id: 6, name: "Ethan Walsh", type: "Complaints", rating: 1, topic: "Billing", text: "Was charged twice for my renewal. Please look into this urgently.", when: "2 days ago", resolved: false, reply: null, assignee: null, priority: null },
  { id: 7, name: "Olivia Chen", type: "Reviews", rating: 5, topic: "Staff", text: "The reception team is always friendly and helpful. Great experience overall!", when: "3 days ago", resolved: true, reply: "We appreciate the kind words, Olivia!", assignee: null, priority: null },
  { id: 8, name: "Cameron Reid", type: "Suggestions", rating: 4, topic: "Classes", text: "Please add a late-evening HIIT class around 9 PM for working professionals.", when: "4 days ago", resolved: true, reply: null, assignee: null, priority: null },
  { id: 9, name: "Natalie Rivera", type: "Reviews", rating: 3, topic: "Facilities", text: "Good gym but the locker room could be cleaner in the mornings.", when: "5 days ago", resolved: true, reply: null, assignee: null, priority: null },
  { id: 10, name: "Nathan Miller", type: "Complaints", rating: 2, topic: "Equipment", text: "Treadmill #3 belt keeps slipping. Reported it twice already.", when: "6 days ago", resolved: false, reply: null, assignee: null, priority: null },
];
