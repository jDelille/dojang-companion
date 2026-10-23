

export type LeadStage = "New" | "Contacted" | "Trial" | "Converted";

export type LeadTemp = "Hot" | "Warm" | "Cold";

export type LeadSource =
  | "Walk-in"
  | "Website"
  | "Instagram"
  | "Referral"
  | "Google Ads"
  | "Phone";

export type LeadInterest =
  | "Monthly Membership"
  | "Annual Membership"
  | "Personal Training"
  | "Yoga Classes"
  | "CrossFit";

export type Lead = {
  id: number;
  name: string;
  phone: string;
  email: string;
  interest: LeadInterest;
  source: LeadSource;
  temp: LeadTemp;
  stage: LeadStage;
  owner: string;
  when: string;
};

export type LeadView = "board" | "list";
