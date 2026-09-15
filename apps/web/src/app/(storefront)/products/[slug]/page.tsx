import type { Metadata } from "next";

// ISR: the product page is rebuilt at most once a minute. Admin edits call
// revalidateTag(`product:${slug}`) to push a change through immediately.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div>
      <h1 className="text-2xl font-semibold">{slug}</h1>
      {/* VariantPicker (client) goes here — keep the page itself a server component. */}
    </div>
  );
}
