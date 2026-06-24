type Props = {
  params: Promise<{ todoId: string }>;
};

export default async function EditTodoPage({ params }: Props) {
  const { todoId } = await params;

  return (
    <main className="min-h-screen bg-zinc-50 p-8">
      <h1 className="text-2xl font-semibold text-[#672be0]">Todo 수정</h1>
      <p className="mt-2 text-zinc-500">ID: {todoId}</p>
    </main>
  );
}
