/* Announcements types — ported from tailwind/src/assets/js/announcements.js */

export type AnnouncementType = "General" | "Event" | "Alert" | "Offer" | "Closure";

export type AnnouncementPriority = "Normal" | "High" | "Urgent";

export type AnnouncementAudience = "Everyone" | "Members" | "Staff";

export type AnnouncementStatus = "Draft" | "Scheduled" | "Active" | "Expired";

export type AnnouncementChannel = "In-App" | "Email" | "Push" | "SMS";

export type Announcement = {
  id: number;
  title: string;
  body: string;
  type: AnnouncementType;
  audience: AnnouncementAudience;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  pinned: boolean;
  reach: number;
  channels: AnnouncementChannel[];
  /** Datetime string "YYYY-MM-DDTHH:MM". */
  createdAt: string;
  /** Datetime string, or null when never published. */
  publishAt: string | null;
  /** Date string "YYYY-MM-DD", or null when no expiry. */
  expireAt: string | null;
  author: string;
};

/** Fields the Add / Edit Announcement modal collects. */
export type AnnouncementFormValues = {
  title: string;
  body: string;
  type: AnnouncementType;
  audience: AnnouncementAudience;
  priority: AnnouncementPriority;
  channels: AnnouncementChannel[];
  /** Date string "YYYY-MM-DD", or null. */
  expireAt: string | null;
  pinned: boolean;
};

/** Fields the Schedule modal collects. */
export type ScheduleValues = {
  /** "YYYY-MM-DD". */
  date: string;
  /** "HH:MM". */
  time: string;
  /** "YYYY-MM-DD" or null. */
  expireAt: string | null;
};

export type ExportFormat = "csv" | "json" | "print";

export type ExportScope = "filtered" | "active" | "all";
