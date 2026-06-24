"use client";

import { useRouter } from "next/navigation";
import type { Todo } from "@/lib/types";

type Props = {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete?: (id: number) => void;
};

export default function TodoItem({ todo, onToggle, onDelete }: Props) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-zinc-200">
      <button
        onClick={() => onToggle(todo.id)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          todo.complete
            ? "border-[#672be0] bg-[#672be0]"
            : "border-zinc-300 hover:border-[#672be0]"
        }`}
      >
        {todo.complete && (
          <svg viewBox="0 0 12 10" fill="none" className="w-3 h-3">
            <path
              d="M1 5l3 3 7-7"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <span
        className={`flex-1 text-sm ${
          todo.complete ? "line-through text-zinc-400" : "text-zinc-800"
        }`}
      >
        {todo.innertext}
      </span>

      {onDelete && (
        <div className="flex gap-1">
          <ActionButton onClick={() => router.push(`/todos/${todo.id}`)} label="수정" />
          <ActionButton onClick={() => onDelete(todo.id)} label="삭제" variant="danger" />
        </div>
      )}
    </div>
  );
}

export function ActionButton({
  onClick,
  label,
  variant = "default",
}: {
  onClick: () => void;
  label: string;
  variant?: "default" | "danger" | "primary";
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
        variant === "danger"
          ? "bg-red-50 text-red-500 hover:bg-red-100"
          : variant === "primary"
          ? "bg-[#672be0] text-white hover:bg-[#5520c0]"
          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
      }`}
    >
      {label}
    </button>
  );
}
