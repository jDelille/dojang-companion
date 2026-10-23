
"use client";

import dynamic from "next/dynamic";

const ProductsComponent = dynamic(
  () => import("@/views/inventory/products"),
  {
    ssr: false,
    loading: () => <p></p>
  }
);

export default function ProductsClient() {
  return <ProductsComponent />;
}
