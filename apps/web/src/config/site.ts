export const siteConfig = {
  name: "Fashion Clothes",
  description: "Thời trang nam nữ — giao hàng toàn quốc.",
  locale: "vi_VN",
  currency: "VND",
} as const;

export const storefrontNav = [
  { label: "Nam", href: "/products?category=nam" },
  { label: "Nữ", href: "/products?category=nu" },
  { label: "Phụ kiện", href: "/products?category=phu-kien" },
  { label: "Khuyến mãi", href: "/products?sale=true" },
] as const;
