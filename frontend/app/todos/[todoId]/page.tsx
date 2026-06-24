import { notFound } from "next/navigation";
import type { Todo } from "@/lib/types";
import EditTodoClient from "../_components/EditTodoClient";

type Props = {
  params: Promise<{ todoId: string }>;
};

export default async function EditTodoPage({ params }: Props) {
  const { todoId } = await params;

  const res = await fetch("http://localhost:8000/todos");
  const todos: Todo[] = await res.json();
  const todo = todos.find((t) => t.id === parseInt(todoId));

  if (!todo) notFound();

  return (
    <main className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#672be0] mb-8">Todo 수정</h1>
        <EditTodoClient todo={todo} />
      </div>
    </main>
  );
}
