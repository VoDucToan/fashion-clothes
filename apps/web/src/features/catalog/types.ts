export type ProductListItem = {
  id: string;
  slug: string;
  name: string;
  thumbnail: string;
  basePrice: number;
  /** Denormalised by the API so the list page does not N+1 into variants. */
  inStock: boolean;
};

export type VariantOptionValue = {
  id: string;
  value: string;
};

export type Variant = {
  id: string;
  sku: string;
  price: number;
  stock: number;
  optionValueIds: string[];
};

export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  description: string;
  images: string[];
  basePrice: number;
  options: { id: string; name: string; values: VariantOptionValue[] }[];
  variants: Variant[];
};

/** Counts shown next to each filter choice, scoped to the current filters. */
export type Facets = {
  categories: { value: string; label: string; count: number }[];
  sizes: { value: string; count: number }[];
  colors: { value: string; count: number }[];
};
