export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <h1 className="text-2xl font-semibold">Đơn hàng {code}</h1>;
}
