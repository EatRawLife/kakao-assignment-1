import type { Todo } from "@/lib/types";
import TodosClient from "./_components/TodosClient";

type Props = {
  searchParams: Promise<{ date?: string }>;
};

export default async function TodosPage({ searchParams }: Props) {
  const { date } = await searchParams;
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${appUrl}/api/todos`, { cache: "no-store" });
  const initialTodos: Todo[] = await res.json();

  return (
    <main className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#672be0] mb-8">Todo List</h1>
        <TodosClient initialTodos={initialTodos} initialDate={date} />
      </div>
    </main>
  );
}
