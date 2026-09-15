import { productFiltersSchema } from "@/features/catalog";

export const metadata = {
  title: "Sản phẩm",
};

export default async function ProductListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // searchParams is a Promise since Next 15 — awaiting it is what opts this
  // page into dynamic rendering for the filtered variants.
  const filters = productFiltersSchema.parse(await searchParams);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Sản phẩm</h1>
      <pre className="mt-4 text-xs">{JSON.stringify(filters, null, 2)}</pre>
    </div>
  );
}
