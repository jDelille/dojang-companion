
export type FeedbackType = "Reviews" | "Complaints" | "Suggestions";

export type FeedbackPriority = "Low" | "Medium" | "High" | "Urgent";

export type FeedbackEntry = {
  id: number;
  name: string;
  type: FeedbackType;
  rating: number;
  topic: string;
  text: string;
  when: string;
  resolved: boolean;
  reply: string | null;
  assignee: string | null;
  priority: FeedbackPriority | null;
};
