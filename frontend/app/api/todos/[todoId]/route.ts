const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ todoId: string }> }
) {
  const { todoId } = await params;
  const body = await request.json();
  const res = await fetch(`${BACKEND}/todos/${todoId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ todoId: string }> }
) {
  const { todoId } = await params;
  const res = await fetch(`${BACKEND}/todos/${todoId}`, { method: "DELETE" });
  return new Response(null, { status: res.status });
}
