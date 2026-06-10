import TodoItem from './TodoItem';

/**
 * 할 일 목록 렌더링 컴포넌트
 * todoList 배열을 받아 TodoItem 목록을 출력한다.
 * 목록이 비어 있으면 빈 상태 안내 메시지를 표시한다 (NF1-09).
 *
 * Props:
 *   todoList: Todo[]                                — 렌더링할 할 일 배열
 *   onDeleteTodo(id: string)                        — 삭제 요청 콜백
 *   onToggleComplete(id: string)                    — 완료 토글 콜백
 *   onEditTodo(id: string, newText: string)         — 수정 확정 콜백
 */
function TodoList({
  todoList = [],
  onDeleteTodo = () => {},
  onToggleComplete = () => {},
  onEditTodo = () => {},
}) {
  // 배열 가드: todoList가 배열이 아니거나 비어 있으면 빈 상태 메시지를 표시 (NF1-05)
  if (!Array.isArray(todoList) || todoList.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg font-medium">아직 할 일이 없어요.</p>
        <p className="text-sm mt-1">위 입력창에서 첫 번째 할 일을 추가해보세요!</p>
      </div>
    );
  }

  return (
    // aria-label로 스크린 리더에 목록 역할 안내
    <ul className="space-y-2" aria-label="할 일 목록">
      {/* todo.id를 key로 사용 — 배열 인덱스 대신 고유 식별자 사용 (NF1-14) */}
      {todoList.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onDeleteTodo={onDeleteTodo}
          onToggleComplete={onToggleComplete}
          onEditTodo={onEditTodo}
        />
      ))}
    </ul>
  );
}

export default TodoList;
