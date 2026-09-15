import { AntdRegistry } from "@ant-design/nextjs-registry";

/**
 * Ant Design is scoped to this subtree on purpose.
 *
 * AntdRegistry collects the CSS-in-JS emitted during SSR and inlines it, which
 * removes the flash of unstyled AntD on first paint. Because it sits here and
 * not in the root layout, no storefront route pays for AntD's bundle or styles.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <div className="min-h-screen">{children}</div>
    </AntdRegistry>
  );
}
