"use client";

import { useState } from "react";
import type { Todo } from "@/lib/types";
import TodoItem from "./TodoItem";
import FilterButton from "./FilterButton";
import DateNavButton from "./DateNavButton";
import TodoTextInput from "./TodoTextInput";

type FilterKey = "all" | "active" | "completed";

const FILTERS: { label: string; key: FilterKey }[] = [
  { label: "전체", key: "all" },
  { label: "실행 중", key: "active" },
  { label: "완료", key: "completed" },
];

function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

type Props = { initialTodos: Todo[]; initialDate?: string };

export default function TodosClient({ initialTodos, initialDate }: Props) {
  const [allTodos, setAllTodos] = useState<Todo[]>(initialTodos);
  const [currentDate, setCurrentDate] = useState(() =>
    initialDate ? new Date(initialDate) : new Date()
  );
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  async function fetchTodos() {
    const res = await fetch("/api/todos");
    const data: Todo[] = await res.json();
    setAllTodos(data);
  }

  // 날짜 → 검색어 → 완료 상태 순으로 클라이언트 필터링
  const dateStr = toDateStr(currentDate);
  const displayedTodos = allTodos
    .filter((t) => t.day === dateStr)
    .filter((t) =>
      searchQuery
        ? t.innertext.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )
    .filter((t) =>
      activeFilter === "active"
        ? !t.complete
        : activeFilter === "completed"
        ? t.complete
        : true
    );

  async function handleAdd(text: string) {
    if (!text.trim()) {
      setAddError("할 일을 입력해 주세요.");
      return;
    }
    setAddError(null);
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ innertext: text, day: dateStr }),
    });
    fetchTodos();
  }

  function handleSearch(text: string) {
    if (!text.trim()) {
      setSearchError("검색어를 입력해 주세요.");
      return;
    }
    setSearchError(null);
    setSearchQuery(text);
  }

  async function handleToggle(id: number) {
    const todo = allTodos.find((t) => t.id === id);
    if (!todo) return;
    await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complete: !todo.complete }),
    });
    fetchTodos();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    fetchTodos();
  }

  function handlePrevDate() {
    setCurrentDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() - 1);
      return next;
    });
    setSearchQuery("");
  }

  function handleNextDate() {
    setCurrentDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      return next;
    });
    setSearchQuery("");
  }

  const dateLabel = currentDate.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-5">
      {/* 날짜 필터 */}
      <div className="flex items-center justify-center gap-3">
        <DateNavButton direction="left" onClick={handlePrevDate} />
        <span className="text-sm font-medium text-zinc-700 min-w-35 text-center">
          {dateLabel}
        </span>
        <DateNavButton direction="right" onClick={handleNextDate} />
      </div>

      {/* Todo 추가 */}
      <TodoTextInput
        placeholder="할 일을 입력하세요"
        onSubmit={handleAdd}
        buttonLabel="추가"
        errorMessage={addError}
      />

      {/* Todo 검색 */}
      <TodoTextInput
        placeholder="검색어를 입력하고 Enter"
        onSubmit={handleSearch}
        errorMessage={searchError}
      />

      {/* 상태 필터 */}
      <div className="flex gap-2">
        {FILTERS.map(({ label, key }) => (
          <FilterButton
            key={key}
            label={label}
            active={activeFilter === key}
            onFilter={() => setActiveFilter(key)}
          />
        ))}
      </div>

      {/* Todo 목록 */}
      <div className="flex flex-col gap-3">
        {displayedTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        ))}
        {displayedTodos.length === 0 && (
          <p className="text-center text-sm text-zinc-400 py-8">할 일이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
