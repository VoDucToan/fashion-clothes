import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Không tìm thấy trang</h1>
      <Link href="/" className="text-sm underline">
        Về trang chủ
      </Link>
    </main>
  );
}
