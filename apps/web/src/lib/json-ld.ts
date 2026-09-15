import { siteConfig } from "@/config/site";

type ProductJsonLdInput = {
  name: string;
  description: string;
  slug: string;
  images: string[];
  price: number;
  inStock: boolean;
  siteUrl: string;
};

/**
 * JSON-LD Product markup — this is what earns the price/availability chip
 * in Google results. Validate changes against search.google.com/test/rich-results.
 */
export function buildProductJsonLd(product: ProductJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    offers: {
      "@type": "Offer",
      url: `${product.siteUrl}/products/${product.slug}`,
      priceCurrency: siteConfig.currency,
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
}
