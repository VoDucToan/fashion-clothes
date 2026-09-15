import { QueryProvider } from "@/providers/query-provider";

/** Everything the whole app needs. Admin-only providers go in app/admin/layout.tsx. */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
