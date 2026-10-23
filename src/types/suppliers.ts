/* Suppliers types — ported from tailwind/src/assets/js/suppliers.js */

export type SupplierCategory =
  | "Supplements"
  | "Apparel"
  | "Equipment"
  | "Accessories"
  | "Beverages";

export type SupplierStatus = "Active" | "Pending" | "Inactive";

export type SupplierView = "grid" | "list";

export type Supplier = {
  id: number;
  name: string;
  category: SupplierCategory;
  contact: string;
  email: string;
  phone: string;
  city: string;
  openPOs: number;
  spend: number;
  /** 1–5 stars. */
  rating: number;
  status: SupplierStatus;
};

/** Fields the Add / Edit Supplier modal collects. */
export type SupplierFormValues = {
  name: string;
  category: SupplierCategory;
  contact: string;
  email: string;
  phone: string;
  city: string;
  rating: number;
  status: SupplierStatus;
};
