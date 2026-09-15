import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

/**
 * Route group: the (storefront) segment shapes nothing in the URL, it only
 * scopes this layout. Ant Design is deliberately absent here — the storefront
 * ships Tailwind + shadcn only, which is what keeps Lighthouse above 90.
 */
export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
      <SiteFooter />
    </>
  );
}
