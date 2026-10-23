import type {
  Campaign,
  CampaignChannel,
  CampaignSegment,
  CampaignStatus,
} from "../../types/campaigns";


export type ChannelMeta = {
  icon: string;
  cls: string;
  c: string;
};

export const CHANNEL_META: Record<CampaignChannel, ChannelMeta> = {
  Email: { icon: "mail", cls: "ic-gold", c: "c-gold" },
  SMS: { icon: "message-square", cls: "ic-cyan", c: "c-cyan" },
  WhatsApp: { icon: "message-circle", cls: "ic-green", c: "c-green" },
  Push: { icon: "bell", cls: "ic-purple", c: "c-purple" },
};

export const CAMPAIGN_STATUS_BADGE: Record<CampaignStatus, string> = {
  Sent: "badge-present",
  Scheduled: "badge-late",
  Draft: "badge-inactive",
  Paused: "badge-absent",
};

export const AUDIENCE_SIZE: Record<CampaignSegment, number> = {
  "All Members": 2100,
  "Expiring Soon": 240,
  "Lapsed Members": 420,
  "New Leads": 340,
  "Gold Tier": 118,
};

export const CHANNEL_OPTIONS: CampaignChannel[] = ["Email", "SMS", "WhatsApp", "Push"];

export const SEGMENT_OPTIONS: CampaignSegment[] = [
  "All Members",
  "Expiring Soon",
  "Lapsed Members",
  "New Leads",
  "Gold Tier",
];

export const SEND_OPTIONS = ["Send now", "Schedule for later", "Save as draft"];

export const EXPORT_FORMATS = ["CSV", "Excel", "PDF"];
export const SEND_RATES = { opened: 0.7, clicked: 0.25, converted: 0.05 };

export const DELIVERED_RATE = 0.97;

export const CAMPAIGNS: Campaign[] = [
  { id: 1, name: "July Renewal Reminder", channel: "Email", segment: "Expiring Soon", status: "Sent", sent: 1240, opened: 806, clicked: 312, converted: 84, when: "2 hr ago", subject: "" },
  { id: 2, name: "Fall Offer — 25% Off", channel: "SMS", segment: "All Members", status: "Sent", sent: 2100, opened: 1680, clicked: 462, converted: 128, when: "Yesterday", subject: "" },
  { id: 3, name: "Win-Back Lapsed Members", channel: "Email", segment: "Lapsed Members", status: "Sent", sent: 420, opened: 210, clicked: 88, converted: 22, when: "2 days ago", subject: "" },
  { id: 4, name: "New HIIT Class Launch", channel: "WhatsApp", segment: "All Members", status: "Sent", sent: 1980, opened: 1584, clicked: 594, converted: 96, when: "3 days ago", subject: "" },
  { id: 5, name: "Free Trial for Leads", channel: "Email", segment: "New Leads", status: "Sent", sent: 340, opened: 238, clicked: 122, converted: 41, when: "4 days ago", subject: "" },
  { id: 6, name: "Gold Tier Perks Update", channel: "Push", segment: "Gold Tier", status: "Sent", sent: 118, opened: 94, clicked: 48, converted: 12, when: "5 days ago", subject: "" },
  { id: 7, name: "Thanksgiving Mega Sale", channel: "Email", segment: "All Members", status: "Scheduled", sent: 0, opened: 0, clicked: 0, converted: 0, when: "Sends 01 Nov", subject: "" },
  { id: 8, name: "Independence Day Wishes", channel: "SMS", segment: "All Members", status: "Scheduled", sent: 0, opened: 0, clicked: 0, converted: 0, when: "Sends 15 Aug", subject: "" },
  { id: 9, name: "New Year Challenge", channel: "WhatsApp", segment: "All Members", status: "Draft", sent: 0, opened: 0, clicked: 0, converted: 0, when: "Draft", subject: "" },
  { id: 10, name: "Referral Program Boost", channel: "Email", segment: "Gold Tier", status: "Draft", sent: 0, opened: 0, clicked: 0, converted: 0, when: "Draft", subject: "" },
];
