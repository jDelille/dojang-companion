

export type CampaignChannel = "Email" | "SMS" | "WhatsApp" | "Push";

export type CampaignStatus = "Sent" | "Scheduled" | "Draft" | "Paused";

export type CampaignSegment =
  | "All Members"
  | "Expiring Soon"
  | "Lapsed Members"
  | "New Leads"
  | "Gold Tier";

export type Campaign = {
  id: number;
  name: string;
  channel: CampaignChannel;
  segment: CampaignSegment;
  status: CampaignStatus;
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  when: string;
  subject: string;
};
