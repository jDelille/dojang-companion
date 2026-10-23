export type SelectOption = { label: string; value: string };

const toOptions = (values: string[]): SelectOption[] => values.map((v) => ({ label: v, value: v }));

export const statusOptions = toOptions(["Active", "Inactive"]);

export const countryOptions = toOptions(["United States", "Canada", "UK", "Australia", "Germany"]);

export const supplierCountryOptions = toOptions(["USA", "Germany", "UK"]);

export const perPageOptions = toOptions(["10 / Pages", "25 / Pages", "50 / Pages", "100 / Pages"]);

export const warehouseContactOptions = toOptions([
  "Select",
  "Peter Crawford",
  "Sophia Martinez",
  "James Wilson",
  "Emily Carter",
  "Benjamin Lee",
]);

export const productCategoryOptions = toOptions(["Laptop", "Smartphone"]);

export const productBrandOptions = toOptions(["Apple", "Dell"]);

export const productUnitOptions = toOptions(["Pieces", "Kilogram"]);

export const productTaxOptions = toOptions(["18% GST"]);
