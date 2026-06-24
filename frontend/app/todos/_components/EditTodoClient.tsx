"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Todo } from "@/lib/types";
import TodoItem from "./TodoItem";
import TodoTextInput, { type TodoTextInputHandle } from "./TodoTextInput";
import { ActionButton } from "./TodoItem";

type Props = { todo: Todo };

export default function EditTodoClient({ todo: initialTodo }: Props) {
  const router = useRouter();
  const [todo, setTodo] = useState<Todo>(initialTodo);
  const pendingTextRef = useRef<string | null>(null);
  const textInputRef = useRef<TodoTextInputHandle>(null);
  const [error, setError] = useState<string | null>(null);

  function handleUpdate(text: string) {
    if (!text.trim()) {
      setError("수정할 내용을 입력해 주세요.");
      return;
    }
    setError(null);
    pendingTextRef.current = text;
    setTodo((prev) => ({ ...prev, innertext: text }));
  }

  function handleToggle(_id: number) {
    setTodo((prev) => ({ ...prev, complete: !prev.complete }));
  }

  const backUrl = `/todos?date=${initialTodo.day}`;

  async function handleSave() {
    // 엔터를 안 눌렀을 경우에도 현재 입력값을 큐에 반영
    textInputRef.current?.submit();

    const body: Record<string, unknown> = {};
    if (pendingTextRef.current !== null) body.innertext = pendingTextRef.current;
    if (todo.complete !== initialTodo.complete) body.complete = todo.complete;

    if (Object.keys(body).length > 0) {
      await fetch(`/api/todos/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    router.push(backUrl);
  }

  function handleCancel() {
    router.push(backUrl);
  }

  return (
    <div className="flex flex-col gap-6">
      <TodoTextInput
        ref={textInputRef}
        placeholder="수정할 내용을 입력하고 Enter"
        onSubmit={handleUpdate}
        errorMessage={error}
      />
      <TodoItem todo={todo} onToggle={handleToggle} />
      <div className="flex gap-2 justify-end">
        <ActionButton onClick={handleCancel} label="취소" />
        <ActionButton onClick={handleSave} label="저장" variant="primary" />
      </div>
    </div>
  );
}
