import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-neutral-500">
        © {new Date().getFullYear()} {siteConfig.name}
      </div>
    </footer>
  );
}
