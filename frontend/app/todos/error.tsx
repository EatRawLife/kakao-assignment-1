"use client";

export default function TodosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-xl font-semibold text-red-500">오류가 발생했습니다</h2>
      <p className="text-zinc-500">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-lg bg-[#672be0] px-4 py-2 text-sm font-medium text-white hover:bg-[#5520c0] transition-colors"
      >
        다시 시도
      </button>
    </main>
  );
}
