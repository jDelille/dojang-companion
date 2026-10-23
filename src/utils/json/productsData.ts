import type { Product, ProductCategory } from "../../types/products";

/*
   Products seed data — ported verbatim from tailwind/src/assets/js/products.js
   (PRODUCTS, CAT_ICON/CATS, LOW_THRESHOLD). Ids follow the P() 1-based
   sequence and fav defaults to false.
*/

export const PRODUCT_CATS: ProductCategory[] = [
  "Supplements",
  "Apparel",
  "Equipment",
  "Accessories",
  "Beverages",
];

export const LOW_THRESHOLD = 10;

export const STOCK_REASONS = ["Restock", "Correction", "Damaged / Loss", "Return"];

export const PRODUCTS: Product[] = [
  { id: 1, name: "Whey Protein 2 lb", category: "Supplements", sku: "SUP-001", price: 54.99, stock: 42, fav: true },
  { id: 2, name: "BCAA Energy 14 oz", category: "Supplements", sku: "SUP-002", price: 34.99, stock: 8, fav: false },
  { id: 3, name: "Creatine Monohydrate", category: "Supplements", sku: "SUP-003", price: 24.99, stock: 0, fav: false },
  { id: 4, name: "Pre-Workout 10.5 oz", category: "Supplements", sku: "SUP-004", price: 34.99, stock: 25, fav: false },
  { id: 5, name: "FitPro Training Tee", category: "Apparel", sku: "APP-001", price: 24.99, stock: 60, fav: true },
  { id: 6, name: "Performance Shorts", category: "Apparel", sku: "APP-002", price: 34.99, stock: 34, fav: false },
  { id: 7, name: "Compression Sleeves", category: "Apparel", sku: "APP-003", price: 19.99, stock: 6, fav: false },
  { id: 8, name: "Adjustable Dumbbell 45 lb", category: "Equipment", sku: "EQP-001", price: 249.99, stock: 12, fav: false },
  { id: 9, name: "Resistance Band Set", category: "Equipment", sku: "EQP-002", price: 29.99, stock: 48, fav: true },
  { id: 10, name: "Yoga Mat Premium", category: "Equipment", sku: "EQP-003", price: 49.99, stock: 0, fav: false },
  { id: 11, name: "Lifting Straps", category: "Accessories", sku: "ACC-001", price: 12.99, stock: 90, fav: false },
  { id: 12, name: "Shaker Bottle 24 oz", category: "Accessories", sku: "ACC-002", price: 12.99, stock: 7, fav: false },
  { id: 13, name: "Gym Gloves Pro", category: "Accessories", sku: "ACC-003", price: 24.99, stock: 22, fav: false },
  { id: 14, name: "Electrolyte Water 32 oz", category: "Beverages", sku: "BEV-001", price: 2.49, stock: 120, fav: false },
  { id: 15, name: "Protein Shake RTD", category: "Beverages", sku: "BEV-002", price: 3.49, stock: 4, fav: true },
  { id: 16, name: "Cold Brew Coffee", category: "Beverages", sku: "BEV-003", price: 4.49, stock: 0, fav: false },
];
