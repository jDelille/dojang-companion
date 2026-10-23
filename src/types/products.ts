/* Products types — ported from tailwind/src/assets/js/products.js */

export type ProductCategory =
  | "Supplements"
  | "Apparel"
  | "Equipment"
  | "Accessories"
  | "Beverages";

export type ProductStockState = "In Stock" | "Low Stock" | "Out of Stock";

export type ProductSort = "name" | "price-asc" | "price-desc" | "stock";

export type ProductView = "grid" | "list";

export type Product = {
  id: number;
  name: string;
  category: ProductCategory;
  sku: string;
  price: number;
  stock: number;
  fav: boolean;
};

/** Fields the Add / Edit Product modal collects. */
export type ProductFormValues = {
  name: string;
  category: ProductCategory;
  sku: string;
  price: number;
  stock: number;
};
