"use client";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Đã có lỗi xảy ra</h1>
      <button onClick={reset} className="text-sm underline">
        Thử lại
      </button>
    </main>
  );
}
