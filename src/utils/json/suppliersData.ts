import type { Supplier, SupplierCategory, SupplierStatus } from "../../types/suppliers";

/*
   Suppliers seed data — ported verbatim from tailwind/src/assets/js/suppliers.js
   (SUPPLIERS, CATS, STATUSES, STATUS). Ids follow the S() 1-based sequence.
*/

export const SUPPLIER_CATS: SupplierCategory[] = [
  "Supplements",
  "Apparel",
  "Equipment",
  "Accessories",
  "Beverages",
];

export const SUPPLIER_STATUSES: SupplierStatus[] = ["Active", "Pending", "Inactive"];

export const SUPPLIER_STATUS_BADGE: Record<SupplierStatus, string> = {
  Active: "badge-present",
  Pending: "badge-late",
  Inactive: "badge-inactive",
};

export const SUPPLIER_RATINGS = ["5", "4", "3", "2", "1"];

export const SUPPLIER_PAY_METHODS = ["Bank Transfer", "Apple Pay", "Check", "Cash"];

/** First purchase-order reference; the page increments it per PO. */
export const PO_SEQ_START = 2301;

export const SUPPLIERS: Supplier[] = [
  { id: 1, name: "Apex Nutrition Co.", category: "Supplements", contact: "Preston Vega", email: "blake@apexnutrition.com", phone: "(303) 555-0127", city: "Austin", openPOs: 3, spend: 84500, rating: 5, status: "Active" },
  { id: 2, name: "IronForge Equipment", category: "Equipment", contact: "Jordan Blake", email: "sales@ironforgegear.com", phone: "(512) 555-0142", city: "Columbus", openPOs: 2, spend: 124000, rating: 4, status: "Active" },
  { id: 3, name: "FlexWear Apparel", category: "Apparel", contact: "Jessica Ramirez", email: "jessica@flexwear.com", phone: "(415) 555-0162", city: "Los Angeles", openPOs: 1, spend: 41000, rating: 4, status: "Active" },
  { id: 4, name: "PureHydro Beverages", category: "Beverages", contact: "Miles Turner", email: "orders@purehydro.com", phone: "(213) 555-0107", city: "San Francisco", openPOs: 0, spend: 17000, rating: 3, status: "Pending" },
  { id: 5, name: "GripPro Accessories", category: "Accessories", contact: "Elena Castillo", email: "isabella@grippro.com", phone: "(512) 555-0106", city: "Denver", openPOs: 2, spend: 9600, rating: 5, status: "Active" },
  { id: 6, name: "VitaBlend Labs", category: "Supplements", contact: "Cameron Reid", email: "cameron@vitablend.com", phone: "(305) 555-0105", city: "Austin", openPOs: 0, spend: 30500, rating: 4, status: "Inactive" },
  { id: 7, name: "CoreFit Machines", category: "Equipment", contact: "Olivia Chen", email: "olivia@corefitsupply.com", phone: "(206) 555-0104", city: "Miami", openPOs: 1, spend: 98000, rating: 4, status: "Active" },
  { id: 8, name: "ActiveThreads", category: "Apparel", contact: "Ethan Walsh", email: "ethan@activethreads.com", phone: "(303) 555-0103", city: "Phoenix", openPOs: 0, spend: 7400, rating: 3, status: "Pending" },
  { id: 9, name: "AquaPlus Distributors", category: "Beverages", contact: "Jasmine Ali", email: "jasmine@aquaplusbottling.com", phone: "(415) 555-0102", city: "Austin", openPOs: 1, spend: 21000, rating: 4, status: "Active" },
];
