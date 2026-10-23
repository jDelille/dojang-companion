

export type PassStatus = "Active" | "Used" | "Converted";

export type PassTypeName =
  | "Day Pass"
  | "Trial Pass"
  | "Guest Pass"
  | "Class Drop-in"
  | "Weekly Pass";

export type PassType = {
  name: PassTypeName;
  fee: number;
  icon: string;
  desc: string;
};

export type DayPass = {
  id: number;
  code: string;
  name: string;
  phone: string;
  type: PassTypeName;
  checkin: string;
  status: PassStatus;
  ref: string;
  fee: number;
};
