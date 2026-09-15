import Link from "next/link";
import { siteConfig, storefrontNav } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4">
        <Link href="/" className="font-semibold">
          {siteConfig.name}
        </Link>
        <nav className="hidden gap-6 text-sm md:flex">
          {storefrontNav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:underline">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/cart" className="ml-auto text-sm">
          Giỏ hàng
        </Link>
      </div>
    </header>
  );
}
